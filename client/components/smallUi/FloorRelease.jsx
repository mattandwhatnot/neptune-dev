import React from 'react';
import moment from 'moment';
import Pref from '/client/global/pref.js';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/airbnb.css';

const FloorRelease = ({ id })=> {
  
  function handleRelease(e) {
    e.preventDefault();
    const datetime = e.target.rDateTime.value || moment().format();
    Meteor.call('releaseToFloor', id, datetime, (err)=>{
      if(err)
        console.log(err);
    });
  }
  let sty = {
    padding: '10px',
    borderWidth: '3px'
  };
  
  return(
    <div className='actionBox greenBorder' style={sty}>
      <form onSubmit={(e)=>handleRelease(e)} className='centre listSortInput'>
        <Flatpickr
          id='rDateTime'
          value={moment().format()}
          options={{
            defaultDate: moment().format(),
            maxDate: moment().format(),
            minuteIncrement: 1,
            enableTime: true,
            time_24hr: false,
            altInput: true,
            altFormat: "Y-m-d G:i K",
          }}
        />
        <br />
        <button
          type='submit'
          title={`Release ${Pref.batch} to the floor`}
          className='action clearGreen centreText bigger cap'
          style={sty}
          disabled={!Roles.userIsInRole(Meteor.userId(), 'run')}
        >Release {Pref.batch} to the floor</button>
      </form>
    </div>
  );
};
  
export default FloorRelease;