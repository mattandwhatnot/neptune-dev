import React, { useRef, useState, useEffect } from 'react';
import moment from 'moment';
import 'moment-timezone';
import NumStat from '/client/components/uUi/NumStat.jsx';

const PrioritySquareData = ({ batchID, app, dbDay, mockDay, altNumber, isDebug })=> {
  
  const thingMounted = useRef(true);
  const [ ptData, setPriority ] = useState(false);
  
  useEffect( ()=> {
    const clientTZ = moment.tz.guess();
    Meteor.call('priorityRank', batchID, clientTZ, false, mockDay, (error, reply)=>{
      error && console.log(error);
      if( reply ) { 
        if(thingMounted.current) { setPriority( reply ); }
        isDebug && console.log(ptData);
      }
    });
    return () => { thingMounted.current = false };
  }, [batchID, dbDay, mockDay]);
  
  return( 
    <PrioritySquare 
      batchID={batchID} 
      ptData={ptData}
      altNumber={altNumber}
      app={app}
      isDebug={isDebug} /> 
  );
};

export default PrioritySquareData;

///////////////////////////////////////////////////////////////////////////////

export const PrioritySquare = ({ batchID, ptData, altNumber, app, isDebug })=> {
  
  const pt = ptData;
  
  if( pt && pt.batchID === batchID ) {
    
    const q2t = pt.quote2tide;
    const bffrTime = pt.estEnd2fillBuffer;
    const overQuote = q2t < 0;
    isDebug && console.log({pt, batchID, bffrTime, q2t});
  
    if(!bffrTime) {
      return(
        <div>
          <NumStat
            num={<i className='bigger bold'>X</i>}
            name=''
            title='priority rank unavailable'
            color='fade'
            size='big' />
        </div>
      );
    }
    
    const pScl = !app.priorityScale ? {
      low: 6600,
      high: 2200,
      max: 0,
    } : app.priorityScale;
    
    const priorityRank = 
      bffrTime > pScl.low ? 'low' :
        bffrTime > pScl.high ? 'medium' : 
          bffrTime > pScl.max ? 'high' :
            bffrTime <= pScl.max ? 'severe' :
            'p0';
    const priorityClass = 
      priorityRank === 'severe' ? 'pScale1' :
      priorityRank === 'high' ? 'pScale2' :
      priorityRank === 'medium' ? 'pScale3' : 
      'pScale4';
    const overClass = overQuote ? 'moreEphasis' : '';
    const pLabel = 
      <b>{priorityRank}</b>;
    const subLabel = pt.lateLate ? 'Is Late' :
      bffrTime < 0 ? 'Estimated Late' :
      Math.round( ( bffrTime / 100 ) );
    
    const ovrTxt = overQuote ? 'Over Quote' : 'Under Quote';
    const prTxt = `Priority Rank "${priorityRank}"`;
    const bffTxt = `buffer: ${bffrTime} minutes`;
    const treTxt = `timeRemain: ${q2t} minutes`;
    
    const title = `${prTxt}\n${ovrTxt}`;
    const debugTitle = `${prTxt}"\n${bffTxt}\n${ovrTxt}\n${treTxt}`;
    
    return(
      <div className={`blackT smCap big ${priorityClass} ${overClass}`}>
        <NumStat
          num={pLabel}
          name={subLabel}
          // name={`${subLabel}${isNightly ? ` (${altNumber})` : ''}`}
          title={isDebug ? debugTitle : title}
          color='blackT'
          size='big' />
      </div>
    );
  }
  
  return(
    <div>
      <NumStat
        num={<i className='bigger bold'>?</i>}
        name=''
        title='priority rank unknown'
        color='fade'
        size='big' />
    </div>
  );
};