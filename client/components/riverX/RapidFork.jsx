import React from 'react';
import Pref from '/client/global/pref.js';


const RapidFork = ({ seriesId, serial, rapidData })=> {

  let lock = !Roles.userIsInRole(Meteor.userId(), ['qa', 'run', 'inspect']);
  
  function handleFork(e, rapId) {
    e.preventDefault();
    Meteor.call('setRapidFork', seriesId, serial, rapId, (error)=>{
      if(error)
        console.log(error);
    });
  }
    
  if(rapidData.rapDo.length > 0) { 
    return(
      <form 
        id='srtcsc'
        className='vmargin centre'
        onSubmit={(e)=>handleFork(e, this.op.value)}
      >
        <button
          type='submit'
          form='srtcsc'
          className='clearOrange forkButton'
          disabled={lock}
        ><i className='fas fa-project-diagram fa-fw' data-fa-transform='flip-v'></i>
         <b>Extend {Pref.item}</b></button>
        <select 
          id='op'
          className='wide'
          required>
          {rapidData.rapDo.map( (rp)=>(
            <option key={rp._id} value={rp._id}>
              {rp.rapid.split('-')[1]} - {rp.issueOrder}
            </option>
          ))}
        </select>
      </form>
    );
  }
  
  return null;
};

export default RapidFork;