import React from 'react';
import moment from 'moment';
import business from 'moment-business';
//import Pref from '/client/global/pref.js';

import ProgLayerBurndown, { ProgLayerBurndownExplain } from '/client/components/charts/ProgLayerBurndown.jsx';
import EventsList from '/client/components/smallUi/EventsList.jsx';
import TimeBudgetsChunk, { TimeBudgetsChunkFALLBACK } from './TimeBudgetsChunk.jsx';
import TimeBlocksRaw from './TimeBlocksRaw.jsx';

const TimeTab = ({
  a, b, v, user,
  totalUnits,
  done, allDone,
  riverFlow, riverAltFlow
}) =>	{

  const proto = Roles.userIsInRole(Meteor.userId(), 'nightly');

///////////////////////////////////////
    let allthetimes = [];
    if(proto) {
      for(let item of b.items) {
        for(let entry of item.history) {
          if(entry.type === 'inspect' && entry.good === true) {
            allthetimes.push({
              key: entry.key,
              step: entry.step,
              time: entry.time,
              who: entry.who,
            });
          }
        }
      }
      const cronoTimes = allthetimes.sort((x1, x2)=> {
                          if (x1.time < x2.time) { return -1 }
                          if (x1.time > x2.time) { return 1 }
                          return 0;
                        });
      let sortedTimes = [];
      for(let step of riverFlow || []) {
        if(step.type === 'inspect') {
          const thesetimes = cronoTimes.filter( x => x.key === step.key );
          sortedTimes.push({
            step: step.step,
            entries: thesetimes
          });
        }
      }
    }
////////////////////////////////////////
  
  return(
    <div className='space3v'>
    
    {!proto ?
      <TimeBudgetsChunkFALLBACK a={a} b={b} v={v} />
    :
      <TimeBudgetsChunk
        a={a}
        b={b}
        v={v}
        totalUnits={totalUnits} />
    }
        
      <div className='dropCeiling vmargin space'>
        <ProgLayerBurndown
          id={b._id}
          start={b.start}
          floorRelease={b.floorRelease}
          end={b.finishedAt}
          flowData={riverFlow || []}
          itemData={b.items.filter( x => x.alt === 'no' || x.alt === false )}
          title='Progress Burndown' />
                
        {b.riverAlt !== false &&  
          <ProgLayerBurndown
            id={b._id}
            start={b.start}
            floorRelease={b.floorRelease}
            end={b.finishedAt}
            flowData={riverAltFlow || []}
            itemData={b.items.filter( x => x.alt === 'yes' )}
            title='Alt Progress Burndown' />}
              
        <ProgLayerBurndownExplain />
      </div>
      
      <div className='dropCeiling vmargin space'>
        <h3 className='centreText'>Events</h3>  
        <EventsList events={b.events} />
      </div>
      
      {proto &&
        <div className='vmargin space'>
          <TimeBlocksRaw tide={b.tide} />
        </div>
      }
              
    </div>  
  );
};

export default TimeTab;


/*<div>
  <ol>
    {sortedTimes.map( (step, index)=>{
      return(
        <ol key={index}>
          <b>{step.step} inspect</b>
          {step.entries.map( (ding, inx)=>{
            return(
              <li key={inx}>
                - {ding.time.toString()} - 
                - <AnonyUser id={ding.who} />
              </li> 
          )})}
        </ol>
    )})}
  </ol>
</div>*/