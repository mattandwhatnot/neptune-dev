import React, { useState, useEffect } from 'react';
import Pref from '/client/global/pref.js';

// import StoneProgRing from './StoneProgRing.jsx';
import StoneReg from './StoneReg.jsx';
import StoneVerify from './StoneVerify.jsx';
import StoneTest from './StoneTest.jsx';
import StoneFinish from './StoneFinish.jsx';

import useTimeOut from '/client/utility/useTimeOutHook.js';

const StoneControl = ({
	key, id, serial,
	sKey, step, type,
	branchObj,
	allItems,
	isAlt, hasAlt,
	users, app,
	progCounts,
	blockStone, doneStone, compEntry,
	handleVerify,
	undoOption, openUndoOption, closeUndoOption,
	riverFlowState, riverFlowStateSet
})=> {
	
  const [ lockState, lockSet ] = useState( true );
  const [ lockout, lockoutSet ] = useState( true );
	const [ workingState, workingSet ] = useState( false );

	useEffect( ()=> {
		const checkLock = lockState || blockStone || ( !doneStone ? false : true );
		lockoutSet(checkLock);
	}, [ serial, sKey, lockState, blockStone, doneStone ]);
	
	function unlockAllow() {
  	if(type === 'inspect' && !Roles.userIsInRole(Meteor.userId(), 'inspect')) {
  		null;
  	}else if(type === 'first' && !Roles.userIsInRole(Meteor.userId(), 'verify')) {
  		null;
  	}else if(type === 'test' && !Roles.userIsInRole(Meteor.userId(), 'test')) {
  		null;
  	}else if(type === 'finish' && !Roles.userIsInRole(Meteor.userId(), 'finish')) {
  		null;
  	}else{
		  lockSet( false );
  	}
	}
	
	const speed = !Meteor.user().unlockSpeed ? 
									4000 : ( Meteor.user().unlockSpeed * 2 );
	
  const speedVar = riverFlowState === 'slow' ? ( speed * 6 ) : speed;
	const confirmLock = !riverFlowState ? null : speed;
	const confirmLockVar = !riverFlowState ? null : 
													riverFlowState === 'slow' ? ( speed * 6 ) : speed;

	const timeOutCntrl = !app.lockType || app.lockType === 'timer' ? speed :
																				app.lockType === 'timerVar' ? speedVar :
																				app.lockType === 'confirm' ? confirmLock :
																				app.lockType === 'confirmVar' ? confirmLockVar :
																				0;
	
	useTimeOut( unlockAllow, timeOutCntrl );
  
  function enactEntry() {
  	if(lockState === true) { return false; }
	  lockSet( true );
	  riverFlowStateSet( false );
	  workingSet( true );
  }
  function resolveEntry() {
  	riverFlowStateSet( 'slow' );
		workingSet( false );
		openUndoOption();
	  document.getElementById('lookup').focus();
  }
	
	function handleStepUndo() {
		Meteor.call('popHistory', id, serial, ()=>{
			closeUndoOption();
		});
	}
    
  const topClass = doneStone ? 'doneStoneMask' :
  								 blockStone ? 'blockStone' : '';
  const topTitle = topClass !== '' ? Pref.stoneislocked : '';
	
	const renderReg = 
		<StoneReg 
			key={key}
			id={id}
			barcode={serial}
			sKey={sKey}
			step={step}
			type={type} 
			progCounts={progCounts} 
			lockout={lockout}
			topClass={topClass}
			topTitle={topTitle}
			allItems={allItems}
			isAlt={isAlt}
			hasAlt={hasAlt}
			handleStepUndo={handleStepUndo}
			undoOption={undoOption}
			closeUndoOption={closeUndoOption}
			enactEntry={()=>enactEntry()}
			resolveEntry={()=>resolveEntry()}
			workingState={workingState}
		/>;
	
	const renderVerify = 
		<StoneVerify 
			key={key}
			id={id}
			barcode={serial}
			sKey={sKey}
			step={step}
			type={type} 
			lockout={lockout}
			topClass={topClass}
			topTitle={topTitle}
			handleVerify={handleVerify}
			handleStepUndo={handleStepUndo}
			undoOption={undoOption}
		/>;
	
	const renderTest = 
		<StoneTest
			key={key}
			id={id}
			barcode={serial}
			sKey={sKey}
			step={step}
			type={type} 
			progCounts={progCounts} 
			lockout={lockout}
			topClass={topClass}
			topTitle={topTitle}
			allItems={allItems}
			isAlt={isAlt}
			hasAlt={hasAlt}
			handleStepUndo={handleStepUndo}
			undoOption={undoOption}
			closeUndoOption={closeUndoOption}
			enactEntry={()=>enactEntry()}
			resolveEntry={()=>resolveEntry()}
			workingState={workingState}
		/>;
	
	const renderFinish = 
		<StoneFinish
			key={key}
			id={id}
			barcode={serial}
			sKey={sKey}
			step={step}
			type={type} 
			progCounts={progCounts} 
			lockout={lockout}
			topClass={topClass}
			topTitle={topTitle}
			allItems={allItems}
			isAlt={isAlt}
			hasAlt={hasAlt}
			handleStepUndo={handleStepUndo}
			undoOption={undoOption}
			closeUndoOption={closeUndoOption}
			enactEntry={()=>enactEntry()}
			workingState={workingState}
		/>;
		
		
	if(type === 'first') {
		return(
			renderVerify
		);
	}
	
	if(type === 'test') {
		return(
			renderTest
		);
	}
	
	if(type === 'finish') {
		return(
			renderFinish
		);
	}
	
	return(
		renderReg
	);
};


function areEqual(prevProps, nextProps) {
	if(
		prevProps.serial !== nextProps.serial ||
		prevProps.doneStone !== nextProps.doneStone ||
		prevProps.blockStone !== nextProps.blockStone ||
		prevProps.sKey !== nextProps.sKey ||
		(prevProps.undoOption === true && nextProps.undoOption === false)
	) {
  	return false;
	}else{
		return true;
	}
  /*
  return true if nextProps would return the same result as prevProps,
  otherwise return false
	*/  
}

export default React.memo(StoneControl, areEqual);
/*
import AnimateOnChange from 'react-animate-on-change';
<AnimateOnChange
  customTag='div'
  baseClassName='cap biggest'
  animationClassName="twitch-change"
  animate={i.serial}
  >{i.serial}
</AnimateOnChange>
*/