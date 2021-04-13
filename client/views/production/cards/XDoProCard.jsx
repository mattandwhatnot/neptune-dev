import React, { useState, useEffect, useLayoutEffect, Fragment } from 'react';
import moment from 'moment';
import Pref from '/client/global/pref.js';

import HeadWater, { HighWater, WhiteWater } from '/client/components/riverX/HeadWater';

import TideWall from '/client/components/riverX/TideWall';

import ReleaseAction from '/client/components/bigUi/ReleasesModule.jsx';

import WaterfallSelect from '/client/components/riverX/waterfall/WaterfallSelect';

import River from '/client/components/riverX/River.jsx';

import VerifyIsland from '/client/components/riverX/VerifyIsland.jsx';

import XItemCard from './XItemCard';
import XBatchCard from './XBatchCard';


const XDoProCard = ({ 
  itemData, seriesData, batchData, rapidsData,
  widgetData, groupData,
  user, users, app, 
  
  ncTypesCombo, tideKey,
  
  tideFloodGate,
  expand, handleExpand,
  
  showVerifyState, 
  optionVerify,
  handleVerify
})=> {
  
  const [ brancheState, brancheSortSet ] = useState([]);

  const [ flowData, flowDataSet ] = useState(false);
  const [ fallData, fallDataSet ] = useState(false);
  const [ rapidData, rapidDataSet ] = useState(false);
  
  useEffect( ()=>{
    const branches = app.branches.filter( b => b.open === true );
    const branchesSort = branches.sort((b1, b2)=>
          b1.position < b2.position ? 1 : b1.position > b2.position ? -1 : 0 );
     brancheSortSet(branchesSort);
  }, [app]);
  
  useLayoutEffect( ()=> {
    const getFlowData = HeadWater(batchData, seriesData, widgetData, itemData);
    flowDataSet(getFlowData);
  }, [batchData.river, seriesData, widgetData]);
  
  useLayoutEffect( ()=> {
    const getFallData = HighWater(batchData, app);
    fallDataSet(getFallData);
  }, [batchData]);
  
  useLayoutEffect( ()=> {
    const getRapidData = WhiteWater( itemData, seriesData, rapidsData );
    rapidDataSet(getRapidData);
  }, [rapidsData]);
  
  
  if(!batchData || !fallData) {
    return <div>nope</div>;
  }
  
  const iSerial = !itemData ? null : itemData.serial;
  
  const iComplete = !iSerial ? null : itemData.completed;
  
  const scrapCheck = !iSerial ? null : itemData.scrapped &&
          itemData.history.find(x => x.type === 'scrap' && x.good === true);
  
  const shortfall = !seriesData ? [] : seriesData.shortfall;
  const shortfallS = !iSerial || !seriesData ? shortfall :
          shortfall.filter( x => x.serial === iSerial )
            .sort((s1, s2)=>
              s1.partNum < s2.partNum ? -1 : s1.partNum > s2.partNum ? 1 : 0 );
  
  const bCompletedAt = batchData.completedAt;
  const bComplete = batchData.completed;
  
  const bWrapUp = !bComplete ? false :
                    moment().diff(bCompletedAt, 'hours') <= Pref.timeAfterGrace;
  
  const bOpen = batchData.live || bWrapUp;
  const bClosed = !batchData.live && !bComplete;
  
  const altIs = !itemData ? false : itemData.altPath.find( x => x.river !== false );
  const altFlow = altIs && widgetData.flows.find( f => f.flowKey === altIs.river );
  
  const rapid = !rapidData.rapIs ? 
                  rapidData.rapDo.find( r => r.live === true ) :
                  rapidData.rapDo.find( r => r._id === rapidData.rapIs.rapId );
  
  tideFloodGate && rapid && rapid.instruct && Session.set('nowInstruct', rapid.instruct);
  
  let useFlow = !itemData ? [] :
                itemData.completed ? 
                rapid ? rapid.whitewater : []
                :
                altIs ? altFlow.flow 
                :
                flowData ? flowData.flow : [];
                
  const flowFirsts = useFlow.filter( x => x.type === 'first' );
  
  const plainBrancheS = Array.from(brancheState, b => b.branch);
  const ancOptionS = app.ancillaryOption.sort();
  
  const flowAction = ( flowData.hasRiver || rapidData.rapIs ) && fallData.floorRel;
  
  const allFall = fallData.fallCounts.allFall;
  const fallAction = ( batchData.waterfall.length > 0 &&
                        batchData.completed === false ) ||
                     ( rapid && rapid.cascade.length > 0 );
  
  const insertTideWall = 
          <TideWall
            bID={batchData._id}
            bComplete={bComplete}
            bOpen={bOpen}
            rapidData={rapidData}
            seriesData={seriesData}
            itemData={itemData || null}
            shortfallS={shortfallS}
            scrap={scrapCheck}
            ancOptionS={ancOptionS}
            plainBrancheS={plainBrancheS}
            tideKey={tideKey}
            tideFloodGate={tideFloodGate} />;
  
  const insertAxion =
          <ReleaseAction 
            id={batchData._id} 
            rType='floorRelease'
            actionText='release'
            isX={true} />;

  const insertWaterfall = 
          <WaterfallSelect 
            batchData={batchData}
            allFlow={flowData.flowCounts.allFlow}
            fallProg={fallData.fallCounts.fallProg}
            allFall={allFall}
            nowater={!fallAction && !seriesData && !rapid}
            rapid={rapid}
            rapIs={rapidData.rapIs}
            app={app} />;
            
  const insertItemCard = 
          <XItemCard
            seriesId={seriesData && seriesData._id}
            bComplete={bComplete}
            isReleased={fallData.floorRel}
            hasRiver={flowData.hasRiver}
            itemData={itemData}
            iComplete={iComplete}
            rapidData={rapidData}
            shortfallS={shortfallS}
            scrap={scrapCheck} />;
  
  const insertRiver = 
          <River
            itemData={itemData}
            seriesData={seriesData}
            batchData={batchData}
            widgetData={widgetData}
            app={app}
            users={users}
            brancheS={brancheState}
            useFlow={useFlow}
            flowCounts={flowData.flowCounts}
            altIs={altIs}
            rapid={rapid}
            rapIs={rapidData.rapIs}
            shortfallS={shortfallS}
            scrapCheck={scrapCheck}
            showVerifyState={showVerifyState}
            optionVerify={optionVerify}
            handleVerify={handleVerify} />;
            
  const insertVerifyIsland =
          <VerifyIsland
            batchId={batchData._id}
            seriesId={seriesData && seriesData._id}
            itemData={itemData}
            flowFirsts={flowFirsts}
            brancheS={brancheState}
            app={app}
            users={users}
            optionVerify={optionVerify}
            handleVerify={handleVerify} />;
  
  const insertBatchCard = 
          <XBatchCard
            batchData={batchData}
            bOpen={bOpen}
            bClosed={bClosed}
            user={user}
            app={app}
            brancheS={brancheState}
            plainBrancheS={plainBrancheS}
            ancOptionS={ancOptionS}
            floorReleased={fallData.floorRel}
            srange={flowData.srange}
            flowCounts={flowData.flowCounts}
            fallCounts={fallData.fallCounts}
            rapidData={rapidData}
            tideKey={tideKey}
            tideFloodGate={tideFloodGate}
            expand={expand}
            flowwater={itemData}
            fallwater={fallAction && !itemData} />;
  
  
  return(
    <Fragment>
    
    {bClosed ? null :
    
      !itemData ? // @ Batch
        
        !tideFloodGate ? insertTideWall : // @ Locked
          
          !fallData.floorRel ? insertAxion : // @ Release
          
            fallAction ? insertWaterfall // @ Waterfall
          : 
            !expand ? insertBatchCard // Batch Tab Info
            : 
              null
    : // @ Item
      
      !tideFloodGate ? insertTideWall : // @ Locked
        
        !flowAction || ( iComplete && !rapidData.rapIs ) ? insertItemCard : // @ Rest
          
          showVerifyState ? insertVerifyIsland : // @ First Form
            
            insertRiver // @ River
    }
      
  	{!showVerifyState &&  // Toggled and No First Form
  	  ( ( !bOpen && !tideFloodGate ) || ( bClosed && tideFloodGate ) || expand ) ?

        insertBatchCard /* Batch Tab Info */ 
        
        : null
  	}
  
    </Fragment>
  );
};

export default XDoProCard;