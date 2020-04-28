import React, { useState, useEffect, useLayoutEffect, Fragment } from 'react';
//import Pref from '/client/global/pref.js';

import HeadWater from '/client/components/river/HeadWater.js';

import TideWall from '/client/components/river/TideWall.jsx';

import River from '/client/components/river/River.jsx';

import VerifyIsland from '/client/components/river/VerifyIsland.jsx';

// import TideLock from '/client/components/tide/TideLock.jsx';

import ItemCard from './ItemCard.jsx';
import BatchCard from './BatchCard.jsx';


const DoProCard = ({ 
  itemData, batchData, widgetData, versionData, groupData,
  user, users, app, 
  
  ncTypesCombo, tideLockOut,
  
  tideFloodGate,
  expand, handleExpand,
  
  showVerifyState, 
  optionVerify,
  handleVerify
})=> {
  

  const [ brancheState, brancheSortSet ] = useState([]);

  const [ flowData, flowDataSet ] = useState(false);

  useEffect( ()=>{
    const branchesSort = app.branches.sort((b1, b2)=> {
      return b1.position < b2.position ? 1 : 
             b1.position > b2.position ? -1 : 0 });
     brancheSortSet(branchesSort);
  }, [app]);
  
  useLayoutEffect( ()=> {
    const getFlowData = HeadWater(batchData, widgetData);
    flowDataSet(getFlowData);
  }, [batchData, widgetData]);
  
  scrapCheck = !itemData ? null :
    itemData.history.find(x => x.type === 'scrap' && x.good === true);
  
  if(!flowData || !batchData) {
    return <div>nope</div>;
  }
  
  const flows = [...flowData.flow,...flowData.flowAlt];
  
  const insertTideWall = 
          <TideWall
            bID={batchData._id}
            bComplete={batchData.finishedAt !== false}
            itemData={itemData || null} />;
            
  const insertItemCard = 
          <ItemCard
            hasRiver={flowData.hasRiver}
            isReleased={flowData.floorRel}
            scrap={scrapCheck} />;
  
  const insertRiver = 
          <River
            itemData={itemData}
            batchData={batchData}
            widgetData={widgetData}
            app={app}
            users={users}
            brancheS={brancheState}
            flow={flowData.flow}
            flowAlt={flowData.flowAlt}
            progCounts={flowData.progCounts}
            showVerifyState={showVerifyState}
            optionVerify={optionVerify}
            handleVerify={handleVerify} />;
            
  const insertVerifyIsland =
          <VerifyIsland
            bID={batchData._id}
            itemData={itemData}
            flowFirsts={flows.filter( x => x.type === 'first' )}
            brancheS={brancheState}
            app={app}
            users={users}
            optionVerify={optionVerify}
            handleVerify={handleVerify} />;
  
  const insertBatchCard = 
          <BatchCard
            batchData={batchData}
            itemData={itemData}
            widgetData={widgetData}
            versionData={versionData}
            user={user}
            app={app}
            brancheS={brancheState}
            floorReleased={flowData.floorRel}
            progCounts={flowData.progCounts} />;
  
  
  return(
    <Fragment>
    
    {!itemData ? 
      
      insertBatchCard : 
      
      !tideFloodGate ? 
        
        insertTideWall :
        
        !flowData.hasRiver || !flowData.floorRel || scrapCheck ? 
          
          insertItemCard :
          
          showVerifyState ?
            
            insertVerifyIsland :
            
            insertRiver
    }
      
        
  	{( !showVerifyState && expand ) && itemData && insertBatchCard}
  
    </Fragment>
  );
};

export default DoProCard;