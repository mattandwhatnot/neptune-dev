import { Meteor } from 'meteor/meteor';
import React from 'react';
import Pref from '/client/global/pref.js';
import NumBox from '/client/components/uUi/NumBox.jsx';
import BestWorstBatch from '/client/components/bigUi/BestWorstBatch.jsx';
// import PopularWidget from '/client/components/charts/PopularWidget.jsx'; 

const Reports = ({ groupData, widgetData, batchData, app }) => {
  
  const total = batchData.length;
  const active = batchData.filter( x => x.finishedAt === false ).length;
  const verAdd = Array.from(widgetData, x => x.versions.length).reduce((x, y) => x + y);

  return(
    <div className='overscroll'>
      <div className='centre wide'>
        
        <div className='centreRow'>
          <NumBox
            num={groupData.length}
            name={Pref.group + 's'}
            color='blueT' />
          <NumBox
            num={widgetData.length}
            name={Pref.widget + 's'}
            color='blueT' />
          <NumBox
            num={verAdd}
            name={Pref.version + 's'}
            color='blueT' />
          <NumBox
            num={total}
            name={'Total ' + Pref.batch + 's'}
            color='blueT' />
          <NumBox
            num={active}
            name={'Active ' + Pref.batch + 's'}
            color='blueT' />
          <NumBox
            num={total - active}
            name={'Finished ' + Pref.batch + 's'}
            color='greenT' />
        </div>
        
        <p><i className='biggest'>~</i></p>
        
        <div className='balance'>
          <label className='listSortInput'>
            <input
              type='search'
              id='advSearch'
              placeholder='coming soon'
              disabled={true}/>
            <br />Reports
          </label>
        </div>
      </div>
      
      {/*<PopularWidget groupData={groupData} widgetData={widgetData} />*/}
      
      <BestWorstBatch
        groupData={groupData}
        widgetData={widgetData} 
        app={app} />
          
          
    </div>
  );
};

export default Reports;