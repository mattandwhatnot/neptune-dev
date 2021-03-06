import React, { Fragment } from 'react';
import moment from 'moment';
import Pref from '/client/global/pref.js';

import { LeapTextLink } from '../tinyUi/LeapText.jsx';
import UserNice from '../smallUi/UserNice.jsx';

import './style.css';

const FailAllTable = ({ failData, gList, showEntries })=> (
  <div>
    <table className='wide overviewTable subrows nestedTable'>
      <thead className='fadeRed cap'>
        <tr>
          <th>{Pref.group}</th>
          <th>{Pref.widget}</th>
          <th colSpan={2}>{Pref.xBatch} / {Pref.items}</th>
        </tr>
      </thead>
      {gList.map( (g, index)=>{
        const gData = failData.filter( f => f.group.toUpperCase() === g );
        const wList = _.uniq( Array.from(gData, r => r.widget.toUpperCase() )
                                  ).filter(f=>f).sort();
        if(gData.length > 0) {
          return(
            <tbody key={index}>
              <tr>
                <td colSpan={4} className='bold'>
                  <LeapTextLink
                    title={g} 
                    sty='blackT medBig'
                    address={'/data/overview?request=groups&specify=' + g}
                  />
                </td>
              </tr>
                {wList.map( (w, windex)=>{
                  const wfails = gData.filter( f => f.widget === w.toLowerCase() )
                        .sort((w1,w2)=>w1.batch > w2.batch ? -1 : w1.batch < w2.batch ? 1 : 0);
                  return(
                    <Fragment key={windex}>
                      <tr>
                        <td colSpan={1}></td>
        	              <td colSpan={showEntries ? 3 : 1} className='bold'>
                          <LeapTextLink
                            title={w} 
                            sty='blackT'
                            address={'/data/widget?request=' + w}
                          />
                        </td>
                        <td colSpan={2} className={showEntries ? 'hidden' : ''}>
                          {wfails.length + ' Failed ' + Pref.items}
                        </td>
                    </tr>
                    {wfails.map( (tf, findex)=>{
                      return(
                        <FailRow 
                          key={tf.tfEntries[0].key+findex}
                          entries={tf.tfEntries}
                          group={tf.group}
                          batchNum={tf.batch}
                          widget={tf.widget}
                          serial={tf.serial}
                          showEntries={showEntries} />
                    )})}
                  </Fragment>
              )})
            }
          </tbody>
      )}})}
    </table>
  </div>
);

export default FailAllTable;

const FailRow = ({ entries, group, batchNum, widget, serial, showEntries })=> (
	<Fragment>
  <tr className={showEntries ? '' : 'collapse'}>
    <td colSpan={2}></td>
    <td colSpan={2}>
      <LeapTextLink
        title={batchNum} 
        sty='numFont noWrap blackT'
        address={'/data/batch?request=' + batchNum}
      />
      {" / "}
      <LeapTextLink
        title={serial}
        sty='numFont noWrap blackT'
        address={'/data/batch?request=' + batchNum + '&specify=' + serial}
      />
    </td>
  </tr>
  {entries.map( (e, ix)=>{
    return(
      <tr key={ix+e.serial+e.time.toISOString()} 
          className={showEntries ? '' : 'collapse'}>
        <td colSpan={3}></td>
        <td colSpan={1}>
    		  <span>
    		    <small>{moment(e.time).calendar(null, 
    		      {sameElse: "ddd, MMM D /YY, h:mm a"})
    		     } by <UserNice id={e.who} />.</small><br />{e.comm}
    		  </span>
        </td>
    	</tr>
  )})}
	</Fragment>
);