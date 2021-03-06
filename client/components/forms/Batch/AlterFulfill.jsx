import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Pref from '/client/global/pref.js';
import { toast } from 'react-toastify';

import ModelSmall from '/client/components/smallUi/ModelSmall';
import PrioritySquareData from '/client/components/smallUi/StatusBlocks/PrioritySquare';


const AlterFulfill = ({ 
  batchId, batch, end, app, canDo, lock, 
  noText, lgIcon, cleanIcon
})=> {
  const aT = !canDo ? Pref.norole : '';
  const lT = lock ? lock : '';
  const title = canDo && !lock ? `Alter ${batch || Pref.xBatch} ${Pref.end}` : `${aT}\n${lT}`;
  return(
    <ModelSmall
      button={'Alter ' + Pref.end}
      title={title}
      color='blueT'
      icon='far fa-calendar-alt'
      lock={!canDo || lock}
      noText={noText}
      lgIcon={lgIcon}
      cleanIcon={cleanIcon}
    >
      <AlterFulfillForm
        batchId={batchId}
        end={end}
        app={app} 
      />
    </ModelSmall>
  );
};

export default AlterFulfill;

const AlterFulfillForm = ({ batchId, end, app, selfclose })=> {

  const [ reasonState, reasonSet ] = useState(false);
  const [ endDateState, endDateSet ] = useState( end );
  
  const [ loadState, loadSet ] = useState( null );
  
  useEffect( ()=> {
    Meteor.call('mockDayShipLoad', endDateState, (error, reply)=>{
      error && console.log(error);
      loadSet(reply);
    });
  }, [endDateState]);
  
  function save(e) {
    e.preventDefault();
    
    const correctedEnd = moment(endDateState).endOf('day').format();
    
    Meteor.call('alterBatchXFulfill', batchId, end, correctedEnd, reasonState, 
    (error, reply)=>{
      if(error) {
        console.log(error);
        toast.error(error.reason || 'Server Error');
      }
      if(reply) {
        toast.success('Saved');
        selfclose();
      }else{
        toast.warning('Not Saved');
      }
    });
  }
  
  const daymoment = moment(endDateState);
  const shipAim = daymoment.isShipDay() ? daymoment.format('YYYY-MM-DD') :
                  daymoment.lastShippingTime().format('YYYY-MM-DD');
   
  return(
    <form className='centre vmargin' onSubmit={(e)=>save(e)}>
      <div className='centreRow max600'>
        {app.alterFulfillReasons && 
          app.alterFulfillReasons.map( (entry, index)=>{
            return(
              <label 
                key={index}
                htmlFor={entry+index} 
                className='beside breath med'>
                <input
                  type='radio'
                  id={entry+index}
                  name='rsn'
                  className='inlineRadio cap'
                  defaultChecked={reasonState === entry}
                  onChange={()=>reasonSet(entry)}
                  required={app.alterFulfillReasons ? true : false}
              />{entry}</label>
        )})}
      </div>
      <p>
        <label htmlFor='eDate' className='breath'>{Pref.end}<br />
        <input
          type='date'
          id='eDate'
          className='numberSet'
          defaultValue={moment(end).format('YYYY-MM-DD')}
          onChange={(e)=>endDateSet(e.target.value)}
          required 
        /></label>
        <button type='submit' className='action clear greenHover'>Save</button>
      </p>
      <hr className='nomargin w100' />
      <p className='nomargin clean'>Ship Due {shipAim}</p>
      {loadState === null ? <em>...</em> :
       <p className='nomargin nospace clean'
        >with <b>{loadState}</b> uncompleted {Pref.xBatchs}</p>
      }
      <div className='vmarginhalf'>
        <PrioritySquareData
          batchID={batchId}
          app={app}
          mockDay={endDateState}
          showExtra={true} />
      </div>
    </form>
  );
};