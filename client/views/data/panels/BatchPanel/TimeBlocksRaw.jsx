import React, { useState, useEffect } from 'react';
import moment from 'moment';
// import 'moment-timezone';
import Pref from '/client/global/pref.js';
import { AnonyUser } from '/client/components/smallUi/UserNice.jsx';
import { ForceRemoveTideBlock } from '/client/views/app/appSlides/DataRepair.jsx';

const TimeBlocksRaw = ({ batch, tide, clientTZ, isDebug })=> {
  
  const isAdmin = Roles.userIsInRole(Meteor.userId(), 'admin');
  
  const [ showZero, showZeroSet ] = useState(isDebug);
  
  return(
    <div>
      <table className='numFont wide'>
        <tbody>
        {!tide ?
          <p className='centreText'>start/stop not enabled</p>
          :
          tide.map( (mov, index)=>{
            return(
              <RawBlock
                key={index} 
                tB={mov} 
                batch={batch} 
                clientTZ={clientTZ}
                isDebug={isDebug}
                showZero={showZero} />
          )})}
        </tbody>
      </table>
      
      {isAdmin && isDebug &&
        <ForceRemoveTideBlock 
          batch={batch}
          isAdmin={isAdmin}
          isDebug={isDebug} />
      }
      
      <details className='footnotes'>
        <summary>Analysis Details</summary>
        <p className='footnote'>Date-Time is recorded to the millisecond.</p>
        <p className='footnote'>
          Time and Durations are displayed as rounded to the nearest minute.
        </p>
        <p className='footnote'>
          <label className='beside'>show zero durations
          <input
            type='checkbox'
            defaultChecked={showZero}
            onChange={()=>showZeroSet(!showZero)} 
          /></label>
        </p>
        <p className='footnote'>
          The {Pref.branch} attribution is derived from related records.
        </p>
      </details>
    </div>
  );
};

export default TimeBlocksRaw;



const RawBlock = ({ tB, batch, clientTZ, isDebug, showZero })=> {
  
  const [ brGuess, setGuess ] = useState(false);
  
  useEffect( ()=>{
    if(tB.task) {
      setGuess([ 'fromUserInput', [ tB.task ] ]);
    }else{
      Meteor.call('branchBestGuess', tB.who, batch, tB.startTime, tB.stopTime, clientTZ,
      (err, asw)=>{
        err && console.log(err);
        if(asw) {
          setGuess(asw);
        }
      });
    }
  }, []);
  
  const mStart = moment(tB.startTime);
  const mStop = tB.stopTime ? moment(tB.stopTime) : moment();
  const durr = Math.round( moment.duration(mStop.diff(mStart)).asMinutes() );
  
  if(!showZero && durr === 0) {
    return null;
  }
  
  const taskCell = brGuess ? 
          brGuess[0] === 'fromUserInput' ?
            <td>{brGuess[1]}</td> :
            <td><em>{brGuess[1].join(', ') }</em></td> :
            <td></td>;
            
  return(
    <tr title={tB.tKey}>
      <td><AnonyUser id={tB.who} /></td>
      <td>{mStart.format('YYYY/MM/DD-kk:mm')}</td>
      <td>{mStop.format('YYYY/MM/DD-kk:mm')}</td>
      <td>{durr} minutes</td>
      {taskCell}
      {isDebug && <td>{brGuess ? brGuess[0] : '....'}</td>}
    </tr>
  );
};