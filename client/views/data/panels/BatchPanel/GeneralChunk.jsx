import React from 'react';
import moment from 'moment';
import 'moment-business-time';
import '/client/utility/ShipTime.js';
import Pref from '/client/global/pref.js';

import { min2hr } from '/client/utility/Convert.js';

import TagsModule from '/client/components/bigUi/TagsModule.jsx';
import NoteLine from '/client/components/smallUi/NoteLine.jsx';
import BlockList from '/client/components/bigUi/BlockList.jsx';
import { AlterFulfill } from '/client/components/forms/Batch/BatchAlter.jsx';

const GeneralChunk = ({
  a, b, 
  done, isDebug
}) =>	{
  
  const nonWorkDays = a.nonWorkDays;
  if( Array.isArray(nonWorkDays) ) {  
    moment.updateLocale('en', {
      holidays: nonWorkDays
    });
  }
    
  const qtB = b.quoteTimeBudget && b.quoteTimeBudget.length > 0 ? 
                b.quoteTimeBudget[0].timeAsMinutes : 0;
  const qtHours = min2hr(qtB);
  
  const end = b.finishedAt !== false ? moment(b.finishedAt) : moment();
  const timeElapse = moment.duration(end.diff(b.start)).asWeeks().toFixed(1);
  const timeasweeks = timeElapse.split('.');
  const tw = timeasweeks[0];
  const td = moment.duration(timeasweeks[1] * 0.1, 'weeks').asDays().toFixed(0);
  const elapseNice = `${tw} week${tw == 1 ? '' : 's'}, ${td} day${td == 1 ? '' : 's'}`;
  
  const fnsh = b.finishedAt ? end.format("MMMM Do, YYYY h:mm A") : null;

  const endDay = moment(b.end);
  const shipTime = endDay.isShipDay() ? 
    endDay.nextShippingTime() : endDay.lastShippingTime();
  
  const remain = shipTime.workingDiff(moment(), 'days', true);
  const remainClean = remain > -1 && remain < 1 ? 
          remain.toPrecision(1) : Math.round(remain);
  
  const itemsOrder = b.items.sort( (x,y)=> x.serial - y.serial);

  return(
    <div>

      <TagsModule
        action={Pref.batch}
        id={b._id}
        tags={b.tags}
        tagOps={a.tagOption} />
      
      <fieldset className='noteCard'>
        <legend className='cap'>Sales</legend>
        
        <p className='cap'>{Pref.salesOrder}: {b.salesOrder || 'not available'}</p>
        
        <p>Time Budget: {qtHours} hours</p>
        
      </fieldset>
      
      <fieldset className='noteCard'>
        <legend>Time Range</legend>
        
        <p className='cap'>{Pref.start}: {moment(b.start).format("MMMM Do, YYYY")}</p>
        
        <div className='cap'>{Pref.end}: {moment(b.end).format("MMMM Do, YYYY")}
          <AlterFulfill
            batchId={b._id}
            end={b.end}
            app={a}
            lock={b.finishedAt !== false && !isDebug}
            isDebug={isDebug} />
        </div>
        
        {fnsh !== null ?
          <p>Finished: {fnsh}</p>
        :
          <p>Ship Date: {shipTime.format("MMMM Do, YYYY")}</p>
        }
        
        <p>{fnsh !== null ? 'Total Time:' : 'Elapsed:'} {elapseNice}</p>
        
        {fnsh !== null ? null : 
          <p>Time Remaining: 
            <i className={remainClean < 0 ? 'yellowT' : ''}> {remainClean}</i> workdays
          </p> }
      
      </fieldset>
      
      {b.items.length > 0 &&
        <fieldset className='noteCard'>
          <legend>Serial Range</legend>
          <p className='numFont'>{itemsOrder[0].serial} - {itemsOrder[itemsOrder.length-1].serial}</p>
        </fieldset>}

      <NoteLine 
        action={Pref.batch}
        id={b._id}
        entry={b.notes} />
              
      <BlockList 
        id={b._id}
        data={b.blocks} 
        lock={done} 
        truncate={true} />

    </div>
  );
};

export default GeneralChunk;