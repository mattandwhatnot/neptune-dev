import React from 'react';
// import { Accounts } from 'meteor/accounts-base'
import Pref from '/client/global/pref.js';
import { toast } from 'react-toastify';

import { AdminUp } from '../forms/AdminForm.jsx';

const UserManageForm = ({ id, name, org, auths, areas, brancheS })=> {
  
  function forcePassword(e) {
    e.preventDefault();
    const check = window.confirm('Are you sure you to change this users password?');
    const newPass = prompt('New Password', '');
    const newConfirm = prompt('New Password Again', '');
    const self = Meteor.userId() === id;
    if(check && !self && newPass === newConfirm) {
      Meteor.call('forcePasswordChange', id, newPass, (error, reply)=>{
        error && console.log(error);
        reply ? toast.success('Saved') : toast.error('Server Error');
      });
    }else{
      alert('not allowed');
    }
  }
  
  function hndlRemove(e) {
    const user = id;
    const pin = this.pInNum.value;
    Meteor.call('removeFromOrg', user, pin, (err, reply)=>{
      err && console.log(err);
      reply ? toast.success('Saved') : toast.error('Server Error');
    });
  }

  const admin = Roles.userIsInRole(id, 'admin');
  const adminFlag = admin ? Pref.admin : '';

  const reqBrancheS = brancheS.filter( x => x.reqUserLock === true );
  
  return(
    <div>
      
      <h3>Username: {name}</h3>
      <h3 className='clean'>ID: {id}</h3>
      <h3 className='blueT'>{adminFlag}</h3>
      <h3>organization: <i className='greenT'>{org}</i></h3>
      
      <div className=''>
        <fieldset className=''>
          <legend>Account Permissions</legend>
          <br />
          <ul>
            {auths.map( (entry, index)=>{
              if(entry === 'peopleSuper') {
                return(
                  <SetCheckSuper
                    key={index+'au'}
                    user={id}
                    role={entry}
                    roleName={entry}
                  />
              )}else{
                return(
                  <SetCheck
                    key={index+'au'}
                    user={id}
                    role={entry}
                    roleName={entry}
                  />
              )}})}
          </ul>
        </fieldset>
        
        <fieldset className=''>
          <legend>Job Areas</legend>
          <br />
          <ul>
            {areas.map( (entry, index)=>{
              return(
                <SetCheck
                  key={index+'ar'}
                  user={id}
                  role={entry}
                  roleName={entry}
                />
              )})}
          </ul>
        </fieldset>
        
        <fieldset className=''>
          <legend>Task {Pref.branches}</legend>
          <br />
          <ul>
            {reqBrancheS.map( (entry, index)=>{
              return(
                <SetCheck
                  key={index+'br'}
                  user={id}
                  role={'BRK'+entry.brKey}
                  roleName={entry.branch}
                />
              )})}
          </ul>
        </fieldset>
      
        <div>
        
          <AdminUp userId={id} />
          <br />
          {!admin ?
            <fieldset>
              <legend>Forgot Password</legend>
              <button
                className='smallAction clear redT'
                onClick={(e)=>forcePassword(e)}
              >Change Password</button>
            </fieldset>
          :null}
      
          {org && id !== Meteor.userId() ?
            // leaving an org is undesirable
            <fieldset>
              <legend>Remove from organization</legend>
              <input
                type='password'
                id='pInNum'
                pattern='[0000-9999]*'
                maxLength='4'
                minLength='4'
                cols='4'
                placeholder='Admin PIN'
                inputMode='numeric'
                autoComplete='new-password'
                required
              />
              <button 
                onClick={(e)=>hndlRemove(e)}
                className='smallAction red'
                >Remove from Organization: "{org}"
              </button>
            </fieldset>
          : null}
          
        </div>
      </div>
    </div>
  );
};

export default UserManageForm;


const SetCheckSuper = ({ user, role, roleName })=>	{
  const check = Roles.userIsInRole(user, role);
  
  function changeSuper() {
    const flip = check ? 'superUserDisable' : 'superUserEnable';
    Meteor.call(flip, user, role, (error, reply)=>{
      if(error)
        console.log(error);
      if(reply) {
        toast.success('Saved');
      }else{
        toast(`NOT ALLOWED. This requires authorization, \n 
                only one user can have a "super" permission at a time`, 
          { autoClose: false });
        console.log("BLOCKED BY SERVER");
      }
    });
  }
  return(
    <li>
      <input
        type='checkbox'
        id={role}
        title="only one user can have a 'super' permission at a time"
        defaultChecked={check}
        onChange={()=>changeSuper()}
        readOnly />
      <label htmlFor={role}>{roleName}*</label>
      <br />
    </li>
  );
};

const SetCheck = ({ user, role, roleName })=> {
  const check = Roles.userIsInRole(user, role);
  
  function change() {
    const flip = check ? 'permissionUnset' : 'permissionSet';
    Meteor.call(flip, user, role, (error, reply)=>{
      if(error)
        console.log(error);
      if(reply) {
        toast.success('Saved');
      }else{
        console.log("BLOCKED BY SERVER");
      }
    });
  }
  
  const lockout = role === 'active' && 
                  user === Meteor.userId() ?
                  true : false;
    
  return(
    <li>
      <input
        type='checkbox'
        id={role}
        defaultChecked={check}
        onChange={()=>change()}
        readOnly 
        disabled={lockout} />
      <label htmlFor={role}>{roleName}</label>
      <br />
    </li>
  );
};

export const ChangeAutoScan = ()=> {
  function handle() {
    Meteor.call('setAutoScan', (error)=>{
      if(error)
        console.log(error);
    });
  }
  let current = Meteor.user().autoScan ? 'ON' : 'OFF';
  let color = Meteor.user().autoScan ? 'clearGreen' : 'clearRed';
  return(
    <p>Auto Scan 
      <button
        className={'action clean ' + color}
        onClick={()=>handle()}
      >{current}</button>
    </p>
  );
};

export const ChangeNCcodes = ()=> {
  function handle() {
    Meteor.call('setUserNCcodes', (error)=>{
      if(error)
        console.log(error);
    });
  }
  let current = Meteor.user().showNCcodes ? 'ON' : 'OFF';
  let color = Meteor.user().showNCcodes ? 'clearGreen' : 'clearRed';
  return(
    <p>Use {Pref.nonCon} codes 
      <button
        className={'action clean ' + color}
        onClick={()=>handle()}
      >{current}</button>
    </p>
  );
};

export const ChangeNCselection = ()=> {
  function handle() {
    Meteor.call('setUserNCselection', (error)=>{
      if(error)
        console.log(error);
    });
  }
  let current = Meteor.user().typeNCselection ? 'ON' : 'OFF';
  let color = Meteor.user().typeNCselection ? 'clearGreen' : 'clearRed';
  return(
    <p>Type search {Pref.nonCon} list 
      <button
        className={'action clean ' + color}
        onClick={()=>handle()}
      >{current}</button>
    </p>
  );
};

export const ChangeMinAction = ()=> {
  function handle() {
    Meteor.call('setMinAction', (error)=>{
      if(error)
        console.log(error);
    });
  }
  let current = Meteor.user().miniAction ? 'OFF' : 'ON';
  let color = Meteor.user().miniAction ? 'clearRed' : 'clearGreen';
  return(
    <button
      className={'action clean ' + color}
      onClick={()=>handle()}
    >Turn Mini Actions {current}</button>
  );
};