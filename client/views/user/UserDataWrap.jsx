import React, { useLayoutEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { ToastContainer } from 'react-toastify';
import InboxToastPop from '/client/utility/InboxToastPop.js';

// import Pref from '/client/global/pref.js';
import { SpinWrap } from '/client/components/tinyUi/Spin.jsx';
import ErrorCatch from '/client/layouts/ErrorCatch.jsx';
import HomeIcon from '/client/layouts/HomeIcon.jsx';
import TideFollow from '/client/components/tide/TideFollow.jsx';
import Slides from '../../components/smallUi/Slides.jsx';
import ActivityPanel from './ActivityPanel.jsx';
import InboxPanel from './InboxPanel.jsx';
import PrivacyPanel from './PrivacyPanel.jsx';

import UserSettings from '/client/components/forms/User/UserSettings';


const UserDataWrap = ({
  readybNames, // subs
  orb, bolt, // meta
  user, isAdmin, isDebug, org, app, // self
  traceDT, users // working data
})=> {
  
  useLayoutEffect( ()=>{
    InboxToastPop(user);
  }, [user]);
  
  if( !readybNames || !app ) {
    return( <SpinWrap /> );
  }
    
  const branches = app.branches.filter( b => b.open === true );
  const brancheS = branches.sort((b1, b2)=>
          b1.position < b2.position ? 1 : b1.position > b2.position ? -1 : 0 );
        
  return(
    <ErrorCatch>
    <div className='simpleContainer'>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        newestOnTop />
      <div className='tenHeader'>
        <div className='topBorder' />
        <HomeIcon />
        <div className='frontCenterTitle'>{user.username || "User"}</div>
        <div className='auxRight' />
        <TideFollow />
      </div>
      
      <div className='simpleContent'>
      
        <Slides
          menu={[
            <b><i className='fas fa-history fa-fw'></i>  Production Activity</b>,
            <b><i className='fas fa-inbox fa-fw'></i>  Inbox</b>,
            <b><i className='fas fa-sliders-h fa-fw'></i>  Preferences</b>,
            <b><i className='fas fa-shield-alt fa-fw'></i>  Privacy & Access</b>,
          ]}
          extraClass='space5x5'>
            
          <ActivityPanel
            key={1}
            app={app}
            brancheS={brancheS}
            user={user}
            // isAdmin={isAdmin}
            isDebug={isDebug}
            users={users}
            traceDT={traceDT} />
            
          <InboxPanel
            key={3}
            orb={orb}
            bolt={bolt}
            app={app}
            user={user}
            // isAdmin={isAdmin}
            // isDebug={isDebug}
            users={users} />
            
          <UserSettings
            key={4}
            app={app}
            user={user}
            isAdmin={isAdmin}
            // isDebug={isDebug}
            brancheS={brancheS} />
          
          <PrivacyPanel
            key={5}
            orb={orb}
            bolt={bolt}
            app={app}
            user={user}
            isAdmin={isAdmin}
            // isDebug={isDebug}
          />
          
        </Slides>
				
      </div>
    </div>
    </ErrorCatch>
  );
};

export default withTracker( () => {
  let login = Meteor.userId() ? true : false;
  let user = login ? Meteor.user() : false;
  let org = user ? user.org : false;
  const isAdmin = login ? Roles.userIsInRole(Meteor.userId(), 'admin') : false;
  const isDebug = login ? Roles.userIsInRole(Meteor.userId(), 'debug') : false;
  const bNameSub = login ? Meteor.subscribe('bNameData') : false;
  if(!login) {
    return {
      readybNames: false
    };
  }else{
    return {
      readybNames: bNameSub.ready(),
      orb: Session.get('now'),
      bolt: Session.get('allData'),
      user: user,
      isAdmin: isAdmin,
      isDebug: isDebug,
      org: org,
      app: AppDB.findOne({org: org}),
      traceDT: TraceDB.find({}).fetch(),
      users: Meteor.users.find({}, {sort: {username:1}}).fetch()
    };
  }
})(UserDataWrap);