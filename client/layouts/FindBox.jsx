import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

const FindBox = ({ orb, user })=> {
    
  function setVar(e) {
    e.preventDefault();
    const chosen = this.lookup.value.trim().toLowerCase();
      Session.set('now', chosen);
        this.lookup.value = '';
        this.lookup.select();
  }

  let last = orb || 'Search';
  let lock = user ? false : true;

	return (
    <form 
      className='findForm' 
      onSubmit={(e)=>setVar(e)}
      autoComplete='off'>
      <input
        autoFocus={true}
        type='text'
        id='lookup'
        aria-label='main searchbox'
        className='up'
        placeholder={last}
        disabled={lock}
        autoCorrect={false}
        autoCapitalize={false}
        spellCheck={false}
      />
    </form>
  );
};

export default withTracker( () => {
    return {
      orb: Session.get('now'),
      user: Meteor.userId()
    };
})(FindBox);