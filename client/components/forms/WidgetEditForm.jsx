import React from 'react';
import Pref from '/client/global/pref.js';
import { toast } from 'react-toastify';

import ModelSmall from '../smallUi/ModelSmall';

const WidgetEditWrapper = ({ id, now, lockOut })=> {
  const access = Roles.userIsInRole(Meteor.userId(), 'edit');
  const aT = !access ? Pref.norole : '';
  const lT = lockOut ? `${Pref.group} is hibernated` : '';
  const title = access && !lockOut ? `Edit ${Pref.widget}` : `${aT}\n${lT}`;
  return(
    <ModelSmall
      button={'Edit ' + Pref.widget}
      title={title}
      color='greenT'
      icon='fa-cube'
      lock={!access || lockOut}>
      <WidgetEditForm
        id={id}
        now={now} 
      />
    </ModelSmall>
  );
};

export default WidgetEditWrapper;

const WidgetEditForm = ({ id, now })=> {

  function save(e) {
    e.preventDefault();
    const newName = this.nwNm.value.trim().toLowerCase();
    const desc = this.prodiption.value.trim();

    Meteor.call('editWidget', id, newName, desc, (error, reply)=>{
      error && console.log(error);
      if(reply) {
        FlowRouter.go('/data/widget?request=' + newName);
        toast.success('Saved');
      }else{
        toast.error('Server Error');
      }
    });
  }

  return(
    <form className='centre' onSubmit={(e)=>save(e)}>
      <p>
        <input
          type='text'
          id='nwNm'
          defaultValue={now.widget}
          placeholder='ID ie. A4-R-0221'
          pattern='[A-Za-z0-9 _-]*'
          autoFocus={true}
          required />
        <label htmlFor='nwNm'>{Pref.widget} ID</label>
      </p>
      <p>
        <input
          type='text'
          id='prodiption'
          defaultValue={now.describe}
          placeholder='Description ie. CRC Display'
          required />
        <label htmlFor='prodiption'>{Pref.widget} Description</label>
      </p>
      <br />
      <button type='submit' className='action clearGreen'>SAVE</button>
    </form>
  );
};