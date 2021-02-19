import React, { useLayoutEffect} from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Pref from '/client/global/pref.js';

import InboxToastPop from '/client/utility/InboxToastPop.js';

import { SpinWrap } from '/client/components/tinyUi/Spin.jsx';
import ProductionFindOps from './ProductionFindOps.jsx';


const ProdData = ({
  coldReady, hotReady, // subs
  orb, anchor, user, org, users, app, // self 
  allGroup, allWidget, allVariant, // customer data
  allBatch, allxBatch,
  hotBatch, hotxBatch, hotxSeries, hotxRapids // working data
})=> {

  useLayoutEffect( ()=>{
    InboxToastPop(user);
  }, [user]);
  

  if( !coldReady || !hotReady || !user || !app ) {
    return( <SpinWrap /> );
  }
  
  const activeUsers = users.filter( x => 
                        Roles.userIsInRole(x._id, 'active') === true &&
                        Roles.userIsInRole(x._id, 'readOnly') === false);
    
  return (
    <ProductionFindOps
      orb={orb}
      anchor={anchor}
      user={user}
      org={org}
      activeUsers={activeUsers}
      app={app}
      allGroup={allGroup}
      allWidget={allWidget}
      allVariant={allVariant}
      allBatch={allBatch}
      allxBatch={allxBatch}
      hotBatch={hotBatch}
      hotxBatch={hotxBatch}
      hotxSeries={hotxSeries}
      hotxRapids={hotxRapids}
    />
  );
};


export default withTracker( () => {

  const orb = Session.get('now');
  let login = Meteor.userId() ? true : false;
  let user = login ? Meteor.user() : false;
  let org = user ? user.org : false;
  let readOnly = user ? Roles.userIsInRole(Meteor.userId(), 'readOnly') : false;
  const coldSub = login ? Meteor.subscribe('thinData') : false;
  
  let hotBatch = false;
  let hotxBatch = false;
  let hotxSeries = false;
  let hotxRapids = [];
  
  let keyMatch = false;
  let subBatch = false;
  // const regex810 = RegExp(/^(\d{8,10})$/);
    
  if( coldSub && !subBatch ) {
    
    if( Pref.regex5.test(orb) ) {
      
      const oneBatch = BatchDB.find({ batch: orb },{fields:{'batch':1}},{limit:1}).count();
      if(oneBatch) {
        keyMatch = true;
        subBatch = orb;
      }else{
        onexBatch = XBatchDB.find({ batch: orb },{fields:{'batch':1}},{limit:1}).count();
        if(onexBatch) {
          keyMatch = true;
          subBatch = orb;
        }else{
          subBatch = orb;
        }
      }
      hotBatch = BatchDB.findOne({ batch: orb });
      hotxBatch = XBatchDB.findOne({ batch: orb });
      hotxSeries = XSeriesDB.findOne({ batch: orb });
      hotxRapids = XRapidsDB.find({ extendBatch: orb }).fetch();
      
    }else if( Pref.regexSN.test(orb) ) {
  		const itemsBatch = BatchDB.findOne( { 'items.serial': orb } );
      if( itemsBatch ) {
        hotBatch = itemsBatch;
        keyMatch = true;
        subBatch = itemsBatch.batch;
      }else{
        const itemsxSeries = XSeriesDB.findOne( { 'items.serial': orb } );
        if( itemsxSeries ) {
          hotxSeries = itemsxSeries;
          hotxBatch = XBatchDB.findOne( { batch: itemsxSeries.batch } );
          hotxRapids = XRapidsDB.find( { extendBatch: itemsxSeries.batch } ).fetch();
          keyMatch = true;
          subBatch = itemsxSeries.batch;
        }else{
          subBatch = orb;
        }
      }
    }else{
      null;
    }
  }

  const hotSub = Meteor.subscribe('hotDataPlus', subBatch, keyMatch);
  
  if( !login ) {
    return {
      coldReady: false,
      hotReady: false
    };
  }else if( readOnly ) {
    FlowRouter.go('/');
    return {
      coldReady: coldSub.ready(), 
      hotReady: hotSub.ready(),
    };
  }else{
    return {
      coldReady: coldSub.ready(),
      hotReady: hotSub.ready(),
      orb: orb,
      anchor: Session.get( 'nowWanchor' ),
      user: user,
      org: org,
      users: Meteor.users.find( {}, { sort: { username: 1 } } ).fetch(),
      app: AppDB.findOne({org: org}),
      allGroup: GroupDB.find( {}, { sort: { group: 1 } } ).fetch(),
      allWidget: WidgetDB.find( {}, { sort: { widget: 1 } } ).fetch(),
      allVariant: VariantDB.find( {} ).fetch(),
      allBatch: BatchDB.find( {}, { sort: { batch: -1 } } ).fetch(),
      allxBatch: XBatchDB.find( {}, { sort: { batch: -1 } } ).fetch(),
      hotBatch: hotBatch,
      hotxBatch: hotxBatch,
      hotxSeries: hotxSeries,
      hotxRapids: hotxRapids
    };
  }
})(ProdData);