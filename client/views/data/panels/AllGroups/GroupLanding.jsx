import React from 'react';
// import moment from 'moment';
import Pref from '/client/global/pref.js';

import GroupForm from '/client/components/forms/GroupForm.jsx';
import NumBox from '/client/components/tinyUi/NumBox.jsx';
import TrendLine from '/client/components/charts/Trends/TrendLine.jsx';
import VariantNewList from '../../lists/VariantNewList';

import { timeRanges } from '/client/utility/CycleCalc';

function countNewCollection(collected, rangeStart, rangeEnd) {
  const collectFind = collected.filter( x =>
    x.createdAt > new Date(rangeStart) &&
    x.createdAt < new Date(rangeEnd) 
  );
  return collectFind.length;
}

const GroupLanding = ({ groupData, widgetData, variantData, app })=> {
  
  const xyG = timeRanges(groupData, countNewCollection, 12, 'month');
  const xyW = timeRanges(widgetData, countNewCollection, 12, 'month');
  const xyV = timeRanges(variantData, countNewCollection, 12, 'month');
  
  return(
    <div className='overscroll'>
      
      <div className='wide comfort'>
        <div className='centreRow'>
          
        </div>
        <div className='centreRow'>
          <GroupForm
            id={false}
            name={false}
            alias={false}
            wiki={false}
            noText={false}
            primeTopRight={true} />
          <NumBox
            num={groupData.length}
            name={Pref.group + 's'}
            color='blueT' />
          <NumBox
            num={widgetData.length}
            name={Pref.widget + 's'}
            color='blueT' />
          <NumBox
            num={variantData.length}
            name={Pref.variants}
            color='blueT' />
        </div>
      </div>
      
      
      <div className='centreRow'>
        
        <TrendLine 
          title={`new ${Pref.groups}`}
          localXY={xyG}
          //statType='newGroup'
          cycleCount={12}
          cycleBracket='month'
          lineColor='rgb(52, 152, 219)' />
        
        <TrendLine 
          title={`new ${Pref.widgets}`}
          localXY={xyW}
          //statType='newWidget'
          cycleCount={12}
          cycleBracket='month'
          lineColor='rgb(52, 152, 219)' />
          
        <TrendLine 
          title={`new ${Pref.variants}`}
          localXY={xyV}
          //statType='newVariant'
          cycleCount={12}
          cycleBracket='month'
          lineColor='rgb(52, 152, 219)' />
       
      </div>
      
      <details className='footnotes'>
        <summary>Chart Details</summary>
        <p className='footnote'>
          Trends include {12} months, including the current month. 
          Read left to right as past to current.
        </p>
      </details>
      
      <div className='wide max875 vspacehalf'>
        <h3>New from the Last 7 Days</h3>
        
        <VariantNewList
          widgetData={widgetData}
          variantData={variantData}
          groupData={groupData}
          daysBack={7}
        />

      </div>
            
    </div>
  );
};

export default GroupLanding;