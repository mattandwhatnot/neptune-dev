import React, { useState, useEffect } from 'react';
import Pref from '/client/global/pref.js';
import { CalcSpin } from '/client/components/tinyUi/Spin.jsx';
import PrintThis from '/client/components/tinyUi/PrintThis';
import WeekBrowse from '/client/components/bigUi/WeekBrowse/WeekBrowse.jsx';

import ReportBasicTable from '/client/components/tables/ReportBasicTable.jsx'; 
import ReportStatsTable from '/client/components/tables/ReportStatsTable.jsx'; 

const WeeklyReport = ({ app })=> {
  
  const [weekChoice, setWeekChoice] = useState(false);
  const [weekData, setWeekData] = useState(false);
  const [totalData, setTotalData] = useState(false);
  
  function getData(fresh) {
    fresh && setWeekData(false);
    if(weekChoice) {
      const yearNum = weekChoice.yearNum;
      const weekNum = weekChoice.weekNum;

      Meteor.call('reportOnCompleted', yearNum, weekNum, (err, rtn)=>{
  	    err && console.log(err);
  	    let cronoTimes = !rtn ? [] : 
  	          rtn.sort((x1, x2)=> x1[3] < x2[3] ? -1 : x1[3] > x2[3] ? 1 : 0 );
        cronoTimes.unshift([
          Pref.xBatch, 'description', 
          'sales order', 'quantity', 'nonCon rate',
          'fulfill due', 'ship due', 'moved fulfill', 'complete', 
          'fullfiled', 'shipped', 'quote',
        ]);     
        setWeekData(cronoTimes);
  	  });
    }
  }
  
  function getBack(response) {
    setWeekChoice(response);
  }
  
  useEffect( ()=>{
    getData(true);
  }, [weekChoice]);
  
  function getTotals() {
    const wd = weekData;
   
    if(wd) {
      const woTotal = wd.length -1;
      const wdgUnique = new Set( Array.from(wd, x => x[1] ) ).size -1;
      const slsUnique = new Set( Array.from(wd, x => x[2] ) ).size -1;
      
      const quantitiesI = Array.from(wd, x => x[3] );
      const itmQu = quantitiesI.reduce( (arr, x)=>
        typeof x === 'number' && arr + x, 0);
        
      const quantitiesNC = Array.from(wd, x => { return parseFloat(x[4]) } )
                            .filter( x => isNaN(x) === false );

      const ncAverage = quantitiesNC.reduce( (arr, x)=> arr + x, 0) 
                          / quantitiesNC.length;
      const ncAvg = isNaN(ncAverage) ? 0.0 : ncAverage.toFixed(1, 10);
       
      const endAlters = Array.from(wd, x => x[8] )
                         .filter( x => typeof x === 'number' );
      const alterAvg = endAlters.reduce( (arr, x)=> arr + x, 0) 
                        / endAlters.length;
      const alAvg = isNaN(alterAvg) ? 0.0 : alterAvg.toFixed(1, 10);
      
      const early = wd.filter( x => x[9].includes('early') ).length;
      const onTime = wd.filter( x => x[9].includes('on time') ).length;
      const late = wd.filter( x => x[9].includes('late') ).length;
      
      const under = wd.filter( x => x[11].includes('under') ).length;
      const over = wd.filter( x => x[11].includes('over') ).length;
      const na = wd.filter( x => x[11].includes('n/a') ).length;
      
      let arrange = [
        ['Completed ' + Pref.xBatchs, woTotal ],
        ['Unique ' + Pref.widgets, wdgUnique ],
        ['Unique Sales Orders', slsUnique ],
        ['Unique Tracked Items', itmQu ],
        ['Average NonCon Rate', ncAvg ],
        ['Fulfilled Early', early ],
        ['Fulfilled On Time', onTime ],
        ['Fulfilled Late', late ],
        ['Average Moved Fulfill', alAvg ],
        ['Under Quote', under ],
        ['Over Quote', over ],
        ['Quote Times Unavailable', na ],
      ];
      setTotalData(arrange);
    }
  }
  
  useEffect( ()=>{
    getTotals();
  }, [weekData]);
    
  return(
    <div className='wide space2v'>
        
      <div className='comfort med line2x noPrint'>
        <WeekBrowse
          sendUp={(i)=>getBack(i)}
          app={app}
        />
        <PrintThis />
      </div>
      
      {weekData === false ?
          <div>
            <p className='centreText'>This may take a while...</p>
            <CalcSpin />
          </div>
        :   
        <ReportBasicTable 
          title={`completed ${Pref.xBatchs} report`}
          dateString={`${weekChoice.yearNum}w${weekChoice.weekNum}`}
          rows={weekData} />
      }
      
      <div className='printBr' />
      
      {totalData === false ?
          <div>
            <p className='centreText'>This may take a while...</p>
            <CalcSpin />
          </div>
        :   
        <ReportStatsTable 
          title={`${Pref.xBatchs} totals`}
          dateString={`${weekChoice.yearNum}w${weekChoice.weekNum}`}
          rows={totalData}
          extraClass='max500' />
      }
           
    </div>
  );
};
  
export default WeeklyReport;