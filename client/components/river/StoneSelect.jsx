import React from 'react';
import moment from 'moment';
import InOutWrap from '/client/components/tinyUi/InOutWrap.jsx';
import Pref from '/client/global/pref.js';

import Stone from './Stone.jsx';
import FirstForm from './FirstForm.jsx';
import FoldInNested from './FoldInNested.jsx';
import TestFails from './TestFails.jsx';
import NCTributary from './NCTributary.jsx';
import Shortfalls from './Shortfalls.jsx';
import CompleteRest from './CompleteRest.jsx';

const StoneSelect = ({ 
  id, 
  bComplete,
  flow,
  isAlt,
  hasAlt,
  rmas,
  allItems,
  nonCons,
  sh,
  item,
  //regRun,
  users,
  progCounts,
  app,
  showVerify,
  changeVerify,
  undoOption,
  openUndoOption,
  closeUndoOption
})=> {
  
  const serial = item.serial;
  const history = item.history;
  const finishedAt = item.finishedAt;
  //const subItems = item.subItems;
  const allTrackOption = app.trackOption;
    
  const nc = nonCons.filter( 
              x => x.serial === serial && x.inspect === false )
                .sort((n1, n2)=> {
                  if (n1.ref < n2.ref) { return -1 }
                  if (n1.ref > n2.ref) { return 1 }
                  return 0;
                });
  const ncOutstanding = nc.filter( x => x.skip === false );
  
  const iDone = history;
                                   
  const fDone = [];
  for(let item of allItems) {
    let firsts = item.history.filter( 
      x => x.type === 'first' && x.good !== false );
    firsts.forEach( x => fDone.push( 'first' + x.step ) );
  }
  
  const allAnswered = sh.every( x => x.inEffect === true || x.reSolve === true );
  
  for(let flowStep of flow) {
    const coreStep = allTrackOption.find( t => t.key === flowStep.key);
    const stepPhase = !coreStep || !coreStep.phase ? flowStep.step : coreStep.phase;

    const first = flowStep.type === 'first';

    const stepComplete = first ? 
      iDone.find(ip => ip.key === flowStep.key) || fDone.includes('first' + flowStep.step)
      :
      iDone.find(ip => ip.key === flowStep.key && ip.good === true);
    
    //const ncFromHere = ncOutstanding.filter( x => x.where === stepPhase );
    //const ncResolved = ncFromHere.length === 0;
    //console.log(stepMatch, ncResolved);
    
    const damStep = flowStep.type === 'test' || flowStep.type === 'finish';
  
    const ncAllClear = ncOutstanding.length === 0;
    const shAllClear = sh.length === 0 || allAnswered === true;

    if( ( ( flowStep.type === 'first' || flowStep.type === 'build' ) && stepComplete ) 
        || ( stepComplete /*&& ncResolved*/ ) 
      ) {
      null;
    }else{

      //const compEntry = iDone.find( sc => sc.key === flowStep.key && sc.good === true);
      const fTest = flowStep.type === 'test' ? 
                    iDone.filter( x => x.type === 'test' && x.good === false) : [];
      
      const blockStone = damStep && (!ncAllClear || !shAllClear );
      //const doneStone = stepComplete;
	    
	    Session.set('ncWhere', stepPhase);
	    Session.set('nowStepKey', flowStep.key);
      Session.set('nowWanchor', flowStep.how);
	    return (
        <div>
          <div>
		        <InOutWrap type='stoneTrans'>
  		        {showVerify ?
                <FirstForm
                  id={id}
                  barcode={serial}
                  flowFirsts={flow.filter( x => x.type === 'first' )}
                  sKey={flowStep.type === 'first' ? flowStep.key : false}
                  step={flowStep.type === 'first' ? flowStep.step : false }
                  users={users}
                  app={app}
                  changeVerify={changeVerify} />
  		        : 
    		        flowStep.type === 'nest' ?
    		          <FoldInNested
                    id={id}
                    serial={serial}
                    sKey={flowStep.key}
                    step={flowStep.step}
                    //doneStone={doneStone}
                    //subItems={subItems}
                    lock={false} />
                : 
    		          <Stone
      		          key={flowStep.key}
                    id={id}
                    barcode={serial}
                    sKey={flowStep.key}
                    step={flowStep.step}
                    type={flowStep.type}
                    allItems={allItems}
                    isAlt={isAlt}
                    hasAlt={hasAlt}
                    users={users}
                    app={app}
                    progCounts={progCounts}
                    blockStone={blockStone}
                    //doneStone={doneStone}
                    //compEntry={compEntry}
                    showVerify={showVerify}
                    changeVerify={changeVerify}
                    undoOption={undoOption}
                    openUndoOption={openUndoOption}
                    closeUndoOption={closeUndoOption} />
  		        }
            </InOutWrap>
            {fTest.length > 0 && 
              <InOutWrap type='stoneTrans'>
                <TestFails fails={fTest} />
              </InOutWrap>}
          </div>
          <div>
            <NCTributary
      			  id={id}
      			  serial={serial}
      			  nonCons={nc}
      			  sType={flowStep.type} />
            <Shortfalls
      			  id={id}
      			  shortfalls={sh}
      			  lock={finishedAt !== false} />
          </div>
  			</div>
      );
    }
  }
  
  Session.set('ncWhere', 'complete');
	Session.set('nowStepKey', 'c0mp13t3');
  Session.set('nowWanchor', '');
  // Complete
  if(finishedAt !== false) {
    return(
      <InOutWrap type='stoneTrans'>
        <CompleteRest
          id={id}
          bComplete={bComplete}
          sh={sh}
          serial={serial}
          history={history}
          finishedAt={finishedAt} />
      </InOutWrap>
    );
  }
};
  
export default StoneSelect;