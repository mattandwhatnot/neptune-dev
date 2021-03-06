import React from 'react';
import Pref from '/client/global/pref.js';
import CreateTag from '/client/components/tinyUi/CreateTag';
import WidgetsDepth from '../../lists/WidgetsDepth';
import TagsModule from '/client/components/bigUi/TagsModule';

import GroupForm from '/client/components/forms/GroupForm';
import GroupHibernate from '/client/components/forms/GroupHibernate';
import GroupInternal from '/client/components/forms/GroupInternal';
import WidgetNewForm from '/client/components/forms/WidgetNewForm';
import Remove from '/client/components/forms/Remove';


function groupActiveWidgets(gId, widgetsList, allXBatch) {
  
  let activeBatch = allXBatch.filter( b => b.completed === false);

  const hasBatch = (id)=> activeBatch.find( b => b.widgetId === id) ? true : false;
  
  let activeWidgets = widgetsList.filter( w => hasBatch(w._id) == true );
  
  const activeList = Array.from(activeWidgets, w => w._id);
  return activeList;
}


const GroupSlide = ({ groupData, widgetsList, batchDataX, app, inter })=>{
  
  const g = groupData;
  const active = groupActiveWidgets(g._id, widgetsList, batchDataX);
  
  return(
    <div className='section centre overscroll' key={g.alias}>
      
      <div className='wide centreText'>
        <h1 className='cap biggest'>{g.group}</h1>
        
        <hr className='vmargin' />
      </div>
      
      <div className='wide comfort'>
      
        {g.internal &&
          <div className='centreText comfort middle w100 vmargin intrBlue cap'>
            <i className='fas fa-home fa-fw fa-2x logoBlueT gapL'></i>
            <h3>Internal {Pref.group}</h3>
            <i className='fas fa-globe-americas fa-fw fa-2x logoBlueT gapR'></i>
          </div>}
          
        {g.hibernate &&
          <div className='centreText comfort middle w100 vmargin wetasphaltBorder cap'>
            <i className='fas fa-archive fa-fw fa-2x wetasphaltT gapL'></i>
            <h3>Hibernated {Pref.group}</h3>
            <i className='fas fa-bed fa-fw fa-2x wetasphaltT gapR'></i>
          </div>}
        
        <div className='centreRow'>
          <TagsModule
            action='group'
            id={g._id}
            tags={g.tags}
            tagOps={app.tagOption} />
        </div>
          
        <div className='centreRow'>
          <GroupForm
            id={g._id}
            name={g.group}
            alias={g.alias}
            wiki={g.wiki}
            noText={false}
            primeTopRight={false}
            lockOut={g.hibernate} />
          <WidgetNewForm
            groupId={g._id}
            lock={g.hibernate} />
          {inter &&
            <GroupInternal
              id={g._id}
              iState={g.internal}
              noText={false}
              primeTopRight={false}
            />
          }
          <GroupHibernate
            id={g._id}
            hState={g.hibernate}
            noText={false}
            primeTopRight={false} />
          
          {!widgetsList || widgetsList.length === 0 ?
            <Remove
              action='group'
              title={g.group}
              check={g.createdAt.toISOString()}
              entry={g._id}
              noText={false}
              lockOut={g.hibernate !== true ? 'still active' : false}
            />
          : null}
        </div>
        
      </div>
      
      <p className='capFL vmargin'>
        {Pref.instruct} index: <a className='clean wordBr' href={g.wiki} target='_blank'>{g.wiki}</a>
      </p>
        
      <WidgetsDepth
        groupAlias={g.alias}
        widgetData={widgetsList}
        active={active} />
      
      <div className='wide space edit'>
        <CreateTag
          when={g.createdAt}
          who={g.createdWho}
          whenNew={g.updatedAt}
          whoNew={g.updatedWho}
          dbKey={g._id} />
      </div>
    </div>
  );
};

export default GroupSlide;