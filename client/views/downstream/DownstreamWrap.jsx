import React from 'react';
import Pref from '/client/global/pref.js';

import StreamLayout from '/client/layouts/StreamLayout.jsx';

import DownstreamView from '/client/views/downstream/DownstreamTask/DownstreamView';
import CompletedReport from './CompletedReport.jsx';
import DailyReport from './DailyReport';
import MonthTrend from './MonthTrend';
import Outlook from './Outlook.jsx';

const DownstreamWrap = ({ 
  view, subLink, 
  traceDT,
  user, app,
  isDebug, isNightly
})=> {
  
  if(view === 'reportweek') {
    return (
      <StreamLayout
        user={user}
        app={app}
        title='Completed Report'
        subLink={view}
        invertColor={true}
        action={false}
        navBar='down'
      >
        <CompletedReport
          app={app} />
      </StreamLayout>
    );
  }
  
  if(view === 'reportday') {
    return (
      <StreamLayout
        user={user}
        app={app}
        title='Daily Completed'
        subLink={view}
        invertColor={true}
        action={false}
        navBar='down'
      >
        <DailyReport 
          app={app}
          user={user}
          isDebug={isDebug}
        />
      </StreamLayout>
    );
  }
  
  if(view === 'trendmonth') {
    return (
      <StreamLayout
        user={user}
        app={app}
        title='Month to Month'
        subLink={view}
        invertColor={true}
        action={false}
        navBar='down'
      >
        <MonthTrend 
          app={app}
          // user={user}
          isDebug={isDebug}
        />
      </StreamLayout>
    );
  }
  
  if(isNightly && view === 'outlook') {
    return (
      <StreamLayout
        user={user}
        app={app}
        title='Future Outlook'
        subLink={view}
        invertColor={false}
        action={false}
        navBar='down'
      >
        <Outlook 
          traceDT={traceDT}
          app={app}
          user={user}
          isNightly={isNightly}
        />
      </StreamLayout>
    );
  }
  
  return (
    <StreamLayout
      user={user}
      app={app}
      title={Pref.downstream}
      subLink={false}
      invertColor={false}
      tag='ship'
      navBar='down'
    >
      <DownstreamView
        traceDT={traceDT}
        user={user}
        app={app}
        isDebug={isDebug}
        isNightly={isNightly}
      />
    </StreamLayout>
  );
	
};

export default DownstreamWrap;