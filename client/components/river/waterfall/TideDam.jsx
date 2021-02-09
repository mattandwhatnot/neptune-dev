import React, { useState, Fragment } from 'react';
import '/client/components/riverX/waterfall/style';

// import moment from 'moment';
import Pref from '/client/global/pref.js';

import TideControl from '/client/components/tide/TideControl/TideControl.jsx';

// import CompleteRest from './CompleteRest.jsx';
// import MiniHistory from './MiniHistory.jsx';
  
const TideDam = ({ 
  bID, bComplete, bOpen,
  ancOptionS, plainBrancheS,
  tideKey, tideFloodGate
})=> {
  
  const [ taskState, taskSet ] = useState( tideFloodGate ? tideFloodGate.task : false );
  const [ lockTaskState, lockTaskSet ] = useState(false);
  
  function handleTask(val) {
    taskSet(val);
    Session.set('userSetTask', val);
  }
  
  const ctxLabel = tideFloodGate ? 'Set Different Task' : `Set A Task`;
  
  return(
    <div className='vgap'>

  		{bOpen ?
  		  
  		    <Fragment>
            
            <div className='bigTideContainer'>
              <TideControl 
                batchID={bID} 
                tideKey={tideKey}
                tideFloodGate={false}
                tideLockOut={false}
                taskState={taskState}
                lockTaskSet={lockTaskSet} />
            </div>
            <div className='bigTideTask'>
              <select
                id='tskSlct'
                className='cap'
                onChange={(e)=>handleTask(e.target.value)}
                defaultValue={taskState}
                disabled={lockTaskState}
                required>
                <option value={false}></option>
                <optgroup label='Ancillary'>
                  {ancOptionS.map( (v, ix)=>(
                    <option key={ix+'o1'} value={v}>{v}</option>
                  ))}
                </optgroup>
                <optgroup label={Pref.branches}>
                  {plainBrancheS.map( (v, ix)=>(
                    <option key={ix+'o2'} value={v}>{v}</option>
                  ))}
                </optgroup>
              </select>
              <label htmlFor='tskSlct'>{ctxLabel}</label>
            </div>
            
          </Fragment>
        
        : null }
        
  	</div>
  );
};

export default TideDam;