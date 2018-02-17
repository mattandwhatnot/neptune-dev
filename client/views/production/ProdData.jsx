import React, {Component} from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
//import Pref from '/client/global/pref.js';

import Spin from '/client/components/uUi/Spin.jsx';
import ProductionFindOps from './ProductionFindOps.jsx';

class ProductionView extends Component	{
  
  render() {
    
    if(//!this.props.allData || // diagnose data in development
       !this.props.coldReady || 
       !this.props.hotReady || 
       !this.props.app
      ) {
      return (
        <Spin />
      );
    }
    
    return (
      <ProductionFindOps
        orb={this.props.orb}
        anchor={this.props.anchor}
        org={this.props.org}
        users={this.props.users}
        app={this.props.app}
        allGroup={this.props.allGroup}
        allWidget={this.props.allWidget}
        allBatch={this.props.allBatch}
        hotBatch={this.props.hotBatch}
      />
    );
  }
}

export default withTracker( () => {
  
  // diagnose data in development /////////////////////// 
  /*
  const allData = Meteor.settings.public.allData ? true : false;
  const allSub = Meteor.subscribe('allData', allData);
  */ 
  ///////////////////////////////////////////////////////
  
  const orb = Session.get('now');
  let login = Meteor.userId() ? true : false;
  let user = login ? Meteor.user() : false;
  let org = user ? user.org : false;
  let active = user ? Roles.userIsInRole(Meteor.userId(), 'active') : false;
  const coldSub = login ? Meteor.subscribe('skinnyData') : false;
  //const experimentSub = login ? Meteor.subscribe('groupwidgetData') : false;

  let hotSub = Meteor.subscribe('hotData', false);
  let hotBatch = false;
  
  if( coldSub ) 
  {
    if( !isNaN(orb) && orb.length === 5 )
    {
      const oneBatch = BatchDB.findOne( { batch: orb } );
      if( oneBatch )
      {
        hotSub = Meteor.subscribe( 'hotData', orb );
        hotBatch = oneBatch;
      }
      else
      {
        null;
      }
    }
    else if( !isNaN(orb) && orb.length >= 9 && orb.length <= 10 )
    {
  		const itemsBatch = BatchDB.findOne( { 'items.serial': orb } );
      if( itemsBatch )
      {
        hotSub = Meteor.subscribe( 'hotData', itemsBatch.batch );
        hotBatch = itemsBatch;
      }
      else
      {
        Meteor.call( 'serialLookup', orb, ( err, reply )=>
        {
          err ? console.log( err ) : null;
          const serverItemsBatch = BatchDB.findOne( { batch: reply } );
          hotSub = Meteor.subscribe( 'hotData', reply );
          hotBatch = serverItemsBatch;
        }
        );
      }
    }
    else
    {
      null;
    }
  }
  else
  {
    null;
  }
  
  if( !login ) {
    return {
      coldReady: false,
      hotReady: false
    };
  }else if( !active ) {
    return {
      coldReady: coldSub.ready(), 
      hotReady: hotSub.ready(),
    };
  }else{
    return {
      //allData: allSub.ready(), // diagnose data in development
      coldReady: coldSub.ready(),
      hotReady: hotSub.ready(),
      orb: orb,
      anchor: Session.get( 'nowWanchor' ),
      org: org,
      users: Meteor.users.find( {}, { sort: { username: 1 } } ).fetch(),
      app: AppDB.findOne({org: org}),
      allGroup: GroupDB.find( {}, { sort: { group: 1 } } ).fetch(),
      allWidget: WidgetDB.find( {}, { sort: { widget: 1 } } ).fetch(),
      allBatch: BatchDB.find( {}, { sort: { batch: -1 } } ).fetch(),
      hotBatch: hotBatch,
    };
  }
})(ProductionView);