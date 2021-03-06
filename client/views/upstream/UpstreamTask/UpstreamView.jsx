import React, { useState, useEffect, useLayoutEffect } from 'react';
import moment from 'moment';
import Pref from '/client/global/pref.js';

import Spin from '/client/components/tinyUi/Spin.jsx';

import UpstreamTools from './UpstreamTools';
import UpstreamHeaders from './UpstreamHeaders';
import UpstreamDetails from './UpstreamDetails';


const UpstreamView = ({ batchX, traceDT, user, app, brancheS, isDebug })=> {
  
  const sessionSticky = 'overviewUpstream';
  
  const [ loadTime, loadTimeSet ] = useState( moment() );
                        
  const sessionDense = Session.get(sessionSticky+'dense');
  const defaultDense = sessionDense !== undefined ? sessionDense :
                        user.miniAction || false;
                        
  const sessionLight = Session.get(sessionSticky+'lightTheme');
  const defaultLight =  sessionLight !== undefined ? sessionLight :
                        user.preferLight || false;
  
  const [ focusBy, focusBySet ] = useState( Session.get(sessionSticky+'focus') || false );
  const [ salesBy, salesBySet ] = useState( Session.get(sessionSticky+'sales') || false );
  const [ sortBy, sortBySet ] = useState( Session.get(sessionSticky+'sort') || 'priority' );
  
  const [ dense, denseSet ] = useState( defaultDense );
  const [ light, themeSet ] = useState( defaultLight );
  
  const [ liveState, liveSet ] = useState( false );
  
  useLayoutEffect( ()=> {
    sortInitial();
  }, [batchX, traceDT, salesBy, sortBy]);
  
  const [ updateTrigger, updateTriggerSet ] = useState(true);
  
  useEffect( ()=>{
    Meteor.setTimeout( ()=> {
      Meteor.call('updateLiveNoise');
    },3000);
  }, [updateTrigger]);
  
  useEffect( ()=>{
    loadTimeSet( moment() );
  }, [traceDT]);
  
  function changeFocus(e) {
    const value = e.target.value;
    const focus = value === 'false' ? false : value;
    focusBySet( focus );
    Session.set(sessionSticky+'focus', focus);
    salesBySet( false );
    Session.set(sessionSticky+'sales', false);
  }
  
  function changeSort(e) {
    const sort = e.target.value;
    sortBySet( sort );
    Session.set(sessionSticky+'sort', sort);
  }
  function changeSales(e) {
    const value = e.target.value;
    const sales = value === 'false' ? false : value;
    salesBySet( sales );
    Session.set(sessionSticky+'sales', sales);
  }
  
  function changeDense(val) {
    denseSet( val );
    Session.set(sessionSticky+'dense', val);
  }
  function changeTheme(val) {
    themeSet( val );
    Session.set(sessionSticky+'lightTheme', val);
  }
  
  function sortInitial() {
    return new Promise((resolve) => {
      
      let liveBatches = batchX.filter( bx => bx.releases !== undefined );
      
      let filteredBatches = liveBatches.filter( bx => {
        const releasedToFloor =
          bx.releases.findIndex( x => x.type === 'floorRelease') >= 0;
        if(!releasedToFloor) {
          return bx;
        }
      });

      const limitToSales = !salesBy ? filteredBatches :
                      filteredBatches.filter( l => l.salesOrder === salesBy );
      
      const orderedBatches = 
        sortBy === 'priority' ?
          limitToSales.sort((b1, b2)=> {
            const pB1 = traceDT.find( x => x.batchID === b1._id);
            const pB1bf = pB1 ? pB1.bffrRel : null;
            const pB2 = traceDT.find( x => x.batchID === b2._id);
            const pB2bf = pB2 ? pB2.bffrRel : null;
            if (isNaN(pB1bf)) { return 1 }
            if (isNaN(pB2bf)) { return -1 }
            if (pB1.lateLate) { return -1 }
            if (pB2.lateLate) { return 1 }
            if (pB1bf < pB2bf) { return -1 }
            if (pB1bf > pB2bf) { return 1 }
            return 0;
          })
        :
        sortBy === 'sales' ?
          filteredBatches.sort((b1, b2)=> {
            if (b1.salesOrder < b2.salesOrder) { return -1 }
            if (b1.salesOrder > b2.salesOrder) { return 1 }
            return 0;
          })
        :
        sortBy === 'due' ?
          filteredBatches.sort((b1, b2)=> {
            let endDate1 = b1.salesEnd || b1.end;
            let endDate2 = b2.salesEnd || b2.end;
            if (endDate1 < endDate2) { return -1 }
            if (endDate1 > endDate2) { return 1 }
            return 0;
          })
        :
        filteredBatches.sort((b1, b2)=> {
          if (b1.batch < b2.batch) { return 1 }
          if (b1.batch > b2.batch) { return -1 }
          return 0;
        });
      
      liveSet( orderedBatches );
    });
  }
      
  const density = !dense ? '' : 'minifyed';
  
  return(
    <div key={0} className={`${light === true ? 
                  'upstreamView lightTheme' : 'upstreamView darkTheme'}`}>
    
      <UpstreamTools
        app={app}
        traceDT={traceDT}
        loadTimeUP={loadTime}
        focusByUP={focusBy}
        changeFocusByUP={(e)=>changeFocus(e)}
        salesByUP={salesBy}
        sortByUP={sortBy}
        denseUP={dense}
        lightUP={light}
        changeSalesUP={(e)=>changeSales(e)}
        changeSortUP={(e)=>changeSort(e)}
        denseSetUP={(e)=>changeDense(e)}
        themeSetUP={(e)=>changeTheme(e)}
        doThing={()=>updateTriggerSet(!updateTrigger)}
      />
      
      <div className='overviewContent forceScrollStyle' tabIndex='0'>
        
      {!liveState ?
        <div className='centreContainer'>
          <div className='centrecentre'>
            <Spin />
          </div>
        </div>
      :  
        <div className={`overGridWideFrame ${density}`}>
          
          <UpstreamHeaders
            key='fancylist0'
            oB={liveState}
            traceDT={traceDT}
            app={app}
            isDebug={isDebug}
            title={Pref.kitting}
            focusBy={focusBy}
            showMore={true}
          />

          <UpstreamDetails
            key='fancylist1'
            oB={liveState}
            traceDT={traceDT}
            user={user}
            app={app}
            brancheS={brancheS}
            isDebug={isDebug}
            dense={dense}
            focusBy={focusBy}
          />
            
        </div>
      }  
      </div>
    </div>
  );
};

export default UpstreamView;