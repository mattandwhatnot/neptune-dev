import React from 'react';
import moment from 'moment';
import InOutWrap from '/client/components/tinyUi/InOutWrap.jsx';
import Pref from '/client/global/pref.js';

import Stone from './Stone.jsx';
import TestFails from './TestFails.jsx';
import NCTributary from './NCTributary.jsx';
import MiniHistory from './MiniHistory.jsx';

const StoneSelect = ({ 
  id, 
  flow,
  isAlt,
  rmas,
  allItems,
  nonCons,
  serial,
  history,
  regRun,
  users,
  methods,
  progCounts,
  expand 
})=> {
    
  const nc = nonCons.filter( 
                x => x.serial === serial && x.inspect === false )
                  .sort((n1, n2)=> {
                    if (n1.ref < n2.ref) { return -1 }
                    if (n1.ref > n2.ref) { return 1 }
                    return 0;
                  });
 
  const iDone = history;

  const fDone = [];
  for(let item of allItems) {
    const firsts = item.history.filter( 
      x => x.type === 'first' && 
        ( x.good === true || x.good === 'fine' ) );
    firsts.forEach( x => fDone.push( 'first' + x.step ) );
  }
  
  for(let flowStep of flow) {
    const first = flowStep.type === 'first';
    const inspect = flowStep.type === 'inspect';
    
    const check = first ? 
                  iDone.find(ip => ip.key === flowStep.key) || fDone.includes('first' + flowStep.step)
                  :
                  inspect && regRun === true ?
                  iDone.find(ip => ip.key === flowStep.key && ip.good === true) ||
                  iDone.find(ip => ip.step === flowStep.step && ip.type === 'first' && ip.good === true)
                  // failed firsts should NOT count as inpections
                  :
                  iDone.find(ip => ip.key === flowStep.key && ip.good === true);
                  
    if(check) {
      null;
    }else{
      
      const fTest = flowStep.type === 'test' ? iDone.filter( x => x.type === 'test' && x.good === false) : [];
      
      let skipped = nc.every( x => x.skip !== false );
      
      const stripSide = (name)=> { let x = name;
                                   x = x.replace(/top/i, '-').replace(/bottom/i, '-');
                                   return x; };
      
	    let block = nc.some( x => stripSide(x.where || '') !== stripSide(flowStep.step) ) ? true : false;

	    const stone = <Stone
        		          key={flowStep.key}
                      id={id}
                      barcode={serial}
                      sKey={flowStep.key}
                      step={flowStep.step}
                      type={flowStep.type}
                      allItems={allItems}
                      isAlt={isAlt}
                      users={users}
                      methods={methods}
                      progCounts={progCounts} />;

      const nonCon = <NCTributary
              			  id={id}
              			  serial={serial}
              			  nonCons={nc}
              			  sType={flowStep.type} />;
                      
      const tFail = <TestFails fails={fTest} />;
	  
		  if(nc.length > 0 && !skipped) {
		    
		    if(block || flowStep.type === 'finish' || flowStep.type === 'test') {
		      Session.set( 'nowStep', nc[0].where );
		      return (
		        <div className={expand && 'stonePlus'}>
  		        <div className={expand && 'ncPlus'}>
  		          {nonCon}
  		        </div>
  		      </div>
		      );
		    }else{
		      Session.set('nowStep', flowStep.step);
          Session.set('nowWanchor', flowStep.how);
		      return (
		        <div className={expand && 'stonePlus'}>
              <div className={expand && 'stonePlusLeft'}>
    		        <InOutWrap type='stoneTrans'>
      		        {stone}
                </InOutWrap>
                {fTest.length > 0 ? 
                  <InOutWrap type='stoneTrans'>
                    {tFail}
                  </InOutWrap>
                : null}
              </div>
              {expand &&
          		  <div className='stonePlusRight space'>
          			  <MiniHistory history={history} />
          			</div>}
              <div className={expand && 'ncPlus'}>
                {nonCon}
              </div>
      			</div>
		      );
		    }
		  }else if(nc.length > 0) {
		    Session.set('nowStep', flowStep.step);
        Session.set('nowWanchor', flowStep.how);
		    return (
	        <div className={expand && 'stonePlus'}>
            <div className={expand && 'stonePlusLeft'}>
  		        <InOutWrap type='stoneTrans'>
    		        {stone}
              </InOutWrap>
              {fTest.length > 0 ? 
                <InOutWrap type='stoneTrans'>
                  {tFail}
                </InOutWrap>
              : null}
            </div>
            {expand &&
        		  <div className='stonePlusRight space'>
        			  <MiniHistory history={history} />
        			</div>}
            <div className={expand && 'ncPlus'}>
              {nonCon}
            </div>
    			</div>
	      );
		  }else{
		    Session.set('nowStep', flowStep.step);
        Session.set('nowWanchor', flowStep.how);
        return (
          <div className={expand && 'stonePlus'}>
            <div className={expand && 'stonePlusLeft'}>
              <InOutWrap type='stoneTrans'>
                {stone}
              </InOutWrap>
              {fTest.length > 0 ? 
                <InOutWrap type='stoneTrans'>
                  {tFail}
                </InOutWrap>
              : null}
            </div>
            {expand &&
        		  <div className='stonePlusRight space'>
        			  <MiniHistory history={history} />
        			</div>}
          </div>
        );
      }
    }
  }
  
  // end of flow
  Session.set('nowStep', 'done');
  return (
    <div className={expand && 'stonePlus'}>
      <div className={expand && 'stonePlusLeft'}>
        <InOutWrap type='stoneTrans'>
          <div className='purpleBorder centre cap'>
            <h2>{Pref.trackLast}ed</h2>
            <h3>{moment(iDone[iDone.length -1].time).calendar()}</h3>
          </div>
        </InOutWrap>
      </div>
      {expand &&
  		  <div className='stonePlusRight space'>
  			  <MiniHistory history={history} />
  			</div>}
  	</div>
  );
};
  
export default StoneSelect;