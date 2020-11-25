import { Meteor } from 'meteor/meteor';
import React from 'react';
import Pref from '/client/global/pref.js';
import NumBox from '/client/components/tinyUi/NumBox.jsx';
import BatchesListWide from '../lists/BatchesListWide.jsx';

const AllBatches = ({ 
  groupData, widgetData, allWidget, allVariant,
  batchData, allBatch, allXBatch, 
  app, isDebug
}) => {
  
  const total = batchData.length;
  const xTotal = allXBatch.length;
  const live = batchData.filter( x => x.live === true ).length;
  const xlive = allXBatch.filter( x => x.live === true ).length;
  const process = batchData.filter( x => x.finishedAt === false ).length;
  const xProcess = allXBatch.filter( x => x.completed === false ).length;
  
  const locked = batchData.filter( x => x.lock === true ).length;
  const xlocked = allXBatch.filter( x => x.lock === true ).length;
  
  return(
    <section className='overscroll'>
      <div className='centreRow'>
        <NumBox
          num={total + xTotal}
          name={'Total ' + Pref.batch + 's'}
          color='blueT' />
        <NumBox
          num={live + xlive}
          name={'live ' + Pref.batch + 's'}
          color='blueT' />
        <NumBox
          num={process + xProcess}
          name={'In Process ' + Pref.batch + 's'}
          color='blueT' />
        <NumBox
          num={(total + xTotal) - (process + xProcess)}
          name={'Finished ' + Pref.batch + 's'}
          color='greenT' />
        {isDebug &&
          <NumBox
            num={locked + xlocked}
            name={'Locked ' + Pref.batches}
            title={`Non-Active,\nYear Old Finished Date\nperformance optimization`}
            color='purpleT' />}
      </div>
        
      <div className='centre'>
        
        <BatchesListWide
          batchData={[...allBatch, ...allXBatch]}
          widgetData={allWidget}
          variantData={allVariant}
          groupData={groupData}
          app={app} />
          
      </div>

    </section>
  );
};

export default AllBatches;
              
              
              
              