import React, {useState, useEffect, useLayoutEffect } from 'react';
import moment from 'moment';
import 'moment-timezone';
import { ToastContainer } from 'react-toastify';
import Pref from '/client/global/pref.js';

import Spin from '../../components/uUi/Spin.jsx';
import HomeIcon from '/client/layouts/HomeIcon.jsx';
import TideFollow from '/client/components/tide/TideFollow.jsx';

import OverviewTools from './OverviewTools';
import BatchHeaders from './columns/BatchHeaders';
import BatchDetails from './columns/BatchDetails';


const OverviewWrap = ({ 
  b, bx, bCache, pCache, agCache, acCache, phCache, 
  user, clientTZ, app, isDebug, isNightly
})=> {
  
  const sessionSticky = 'overviewOverview';
  
  const [ working, workingSet ] = useState( false );
  const [ loadTime, loadTimeSet ] = useState( moment() );
  
  const [ filterBy, filterBySet ] = useState( Session.get(sessionSticky+'filter') || false );
  const [ sortBy, sortBySet ] = useState( Session.get(sessionSticky+'sort') || 'priority' );
  const [ dense, denseSet ] = useState( Session.get(sessionSticky+'dense') || 0 );
  const [ light, themeSet ] = useState( Session.get(sessionSticky+'lightTheme') || false );
  
  const [ liveState, liveSet ] = useState( false );
  
  useLayoutEffect( ()=> {
    sortInitial();
  }, [b, bx, filterBy, sortBy]);
  
  useEffect( ()=> {
    Session.set(sessionSticky+'dense', dense);
  }, [dense]);
  
  useEffect( ()=> {
    Session.set(sessionSticky+'lightTheme', light);
  }, [light]);
  
  function changeFilter(e) {
    const value = e.target.value;
    const filter = value === 'false' ? false : value;
    filterBySet( filter );
    Session.set(sessionSticky+'filter', filter);
  }
  
  function changeSort(e) {
    const sort = e.target.value;
    sortBySet( sort );
    Session.set(sessionSticky+'sort', sort);
  }
  
  function requestRefresh() {
    workingSet( true );
    liveSet( false );
    Meteor.call('REQUESTcacheUpdate', clientTZ, 
      true, // batchUp
      true, // priorityUp
      isNightly, // agendaUp
      true, // activityUp
      true, // phaseUp
      false, // compUp
    ()=>{
      sortInitial();
      loadTimeSet( moment() );
      workingSet( false );
    });
  }
  
  function sortInitial() {
    return new Promise((resolve) => {
      const batches = b;
      const batchesX = bx;
      
      let liveBatches = [...batches,...batchesX];
      
      let filteredBatches = filterBy === false ? 
        liveBatches 
        :
        filterBy === 'KITTING' ? 
        liveBatches.filter( bx => {
          const releasedToFloor = Array.isArray(bx.releases) ?
            bx.releases.findIndex( x => x.type === 'floorRelease') >= 0 :
            typeof bx.floorRelease === 'object';
          if(!releasedToFloor) {
            return bx;
          }
        }) 
        :
        filterBy === Pref.released ? 
        liveBatches.filter( bx => {
          const releasedToFloor = Array.isArray(bx.releases) ?
            bx.releases.findIndex( x => x.type === 'floorRelease') >= 0 :
            typeof bx.floorRelease === 'object';
          if(releasedToFloor) {
            return bx;
          }
        }) 
        :
        liveBatches.filter( bx => {
          const cB = phCache.dataSet.find( x => x.batchID === bx._id);
          const cP = cB && cB.phaseSets.find( x => x.phase === filterBy );
          const con = cP && cP.condition;
          
          isDebug && console.log(`${bx.batch}: ${con}`);
          
          if(con && con === 'open') {
            return bx;
          }
        });
      
      let orderedBatches = filteredBatches;
      
      if(sortBy === 'priority') {
        orderedBatches = filteredBatches.sort((b1, b2)=> {
          const pB1 = pCache.dataSet.find( x => x.batchID === b1._id);
          const pB1bf = pB1 ? pB1.estEnd2fillBuffer : null;
          const pB2 = pCache.dataSet.find( x => x.batchID === b2._id);
          const pB2bf = pB2 ? pB2.estEnd2fillBuffer : null;
          
          if (!pB1bf) { return 1 }
          if (!pB2bf) { return -1 }
          if (pB1.lateLate) { return -1 }
          if (pB2.lateLate) { return 1 }
          if (pB1bf < pB2bf) { return -1 }
          if (pB1bf > pB2bf) { return 1 }
          return 0;
        });
        
      }else if(sortBy === 'sales') {
        orderedBatches = filteredBatches.sort((b1, b2)=> {
          if (b1.salesOrder < b2.salesOrder) { return -1 }
          if (b1.salesOrder > b2.salesOrder) { return 1 }
          return 0;
        });
      }else if( sortBy === 'due') {
        orderedBatches = filteredBatches.sort((b1, b2)=> {
          let endDate1 = b1.salesEnd || b1.end;
          let endDate2 = b2.salesEnd || b2.end;
          if (endDate1 < endDate2) { return -1 }
          if (endDate1 > endDate2) { return 1 }
          return 0;
        });
      }else{
        orderedBatches = filteredBatches.sort((b1, b2)=> {
          if (b1.batch < b2.batch) { return 1 }
          if (b1.batch > b2.batch) { return -1 }
          return 0;
        });
      }
      
      liveSet( orderedBatches );
    });
  }
      
  const density = dense === 1 ? 'compact' :
                  dense === 2 ? 'minifyed' :
                  '';
                  
  // const isNightly = Roles.userIsInRole(Meteor.userId(), 'nightly');
    
  return(
    <div key={0} className={`overviewContainer ${light === true ? 'lightTheme invert' : ''}`}>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        newestOnTop />
      <div className='tenHeader'>
        <div className='topBorder'></div>
        <HomeIcon />
        <div className='frontCenterTitle'>Overview</div>
        <div className='auxRight'>
          <button
            type='button'
            title='Refresh Data'
            className={working ? 'spin2' : ''}
            onClick={(e)=>requestRefresh()}>
          <i className='fas fa-sync-alt primeRightIcon'></i>
          </button>
        </div>
        <TideFollow />
      </div>
      
      <OverviewTools
        app={app}
        loadTimeUP={loadTime}
        filterByUP={filterBy}
        sortByUP={sortBy}
        denseUP={dense}
        lightUP={light}
        changeFilterUP={(e)=>changeFilter(e)}
        changeSortUP={(e)=>changeSort(e)}
        denseSetUP={(e)=>denseSet(e)}
        themeSetUP={(e)=>themeSet(e)}
      />
      
      <div className='overviewContent forceScrollStyle' tabIndex='0'>
        
      {!liveState ?
        <div className='centreContainer'>
          <div className='centrecentre'>
            <Spin />
          </div>
        </div>
      :  
        <div className={`overGridFrame ${density}`}>
    
          <BatchHeaders
            key='fancylist0'
            oB={liveState}
            bCache={bCache}
            title={
              !filterBy ? 'All Live' :
              filterBy === 'KITTING' ? Pref.kitting : 
              filterBy
            }
          />
          
          <BatchDetails
            key='fancylist1'
            oB={liveState}
            bCache={bCache}
            pCache={pCache}
            agCache={agCache}
            acCache={acCache}
            user={user}
            clientTZ={clientTZ}
            app={app}
            isDebug={isDebug}
            isNightly={isNightly}
            dense={dense > 1}
            kittingArea={filterBy === 'KITTING'}
            releasedArea={filterBy !== false && filterBy !== 'KITTING'}
          />
            
        </div>
      }  
      </div>
    </div>
  );
};

export default OverviewWrap;