import React, { useLayoutEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import ErrorCatch from '/client/layouts/ErrorCatch.jsx';
import InboxToastPop from '/client/utility/InboxToastPop.js';

import { SpinWrap } from '/client/components/tinyUi/Spin.jsx';
import DownstreamWrap from './DownstreamWrap.jsx';

const View = ({
  login, readyT, view,
  user, app, isDebug,
  traceDT,
})=> {
  
  useLayoutEffect( ()=>{
    InboxToastPop(user);
  }, [user]);
    
  if( !readyT || !app ) {
    return( <SpinWrap /> );
  }
  
  const isNightly = Roles.userIsInRole(Meteor.userId(), 'nightly');

  return(
    <ErrorCatch>
      <DownstreamWrap 
        view={view}
        traceDT={traceDT}
        user={user}
        app={app}
        isDebug={isDebug}
        isNightly={isNightly} />
    </ErrorCatch>
  );
};


export default withTracker( ({ view } ) => {
  let login = Meteor.userId() ? true : false;
  let user = login ? Meteor.user() : false;
  let active = user ? Roles.userIsInRole(Meteor.userId(), 'active') : false;
  let isDebug = user ? Roles.userIsInRole(Meteor.userId(), 'debug') : false;
  let org = user ? user.org : false;
  const subT = login ? Meteor.subscribe('traceDataOpen') : false;
  
  if(!login || !active) {
    return {
      readyT: false
    };
  }else{
    return {
      login: Meteor.userId(),
      readyT: subT.ready(),
      view: view,
      user: user,
      isDebug: isDebug,
      app: AppDB.findOne({org: org}),
      traceDT: TraceDB.find({}).fetch(),
    };
  }
})(View);