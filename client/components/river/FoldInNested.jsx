import React from 'react';
import Pref from '/client/global/pref.js';
import { toast } from 'react-toastify';

const FoldInNested = ({ id, serial, sKey, step, lock })=> {
 //doneStone, subItems
 
  function passNested(e) {
    e.preventDefault();
    this.goNest.disabled = true;
		const subSerial = this.nestSerial.value;
		Meteor.call('addNested', id, serial, sKey, step, subSerial, (error, reply)=>{
	    if(error)
		    console.log(error);
			if(reply) {
			  document.getElementById('lookup').focus();
			  this.nestSerial.value = '';
		  }else{
		    toast.error('Server Error');
		  }
		});
  }
  
  return(
    <div className='actionBox teal centre'>
      <br />
      <p className='bigger centreText up'>{step}</p>
  		<br />
  		{/*doneStone ?
  			<div>
  				<p className='centreText'>Includes: {subItems.toString()}</p>
  			</div>
  		:
  		*/}
	  		<form className='centre' onSubmit={(e)=>passNested(e)}>
			    <input
			      type='text'
			      className='centreText'
			      id='nestSerial'
			      maxLength={10}
	          minLength={9}
	          placeholder='1000000000-9999999999'
	          inputMode='numeric' />
	        <br />
			    <button
			      type='submit'
					  className='action clearWhite up'
					  name='include this serial number'
					  id='goNest'
					  tabIndex={-1}
					  disabled={lock}
					>{Pref.nest}</button>
				</form>
			{/**/}
			<br />
    </div>
  );
};

export default FoldInNested;