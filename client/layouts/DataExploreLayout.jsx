import React, {Component} from 'react';
import { Meteor } from 'meteor/meteor';
import { ToastContainer } from 'react-toastify';
//import Pref from '/client/global/pref.js';

import HomeIcon from '/client/components/uUi/HomeIcon.jsx';
import TaskBar from './TaskBar.jsx';
import ActionBar from '/client/components/bigUi/ActionBar.jsx';
import CookieBar from './CookieBar.jsx';
import GroupForm from '/client/components/forms/GroupForm.jsx';

export const TraverseWrap = ({
  itemData,
  batchData,
  versionData,
  widgetData,
  groupData,
  user,
  app,
  title,
  subLink,
  action,
  base,
  invertColor,
  children
}) =>	{
  
  function goPro(location) {
    Session.set('now', location);
    FlowRouter.go('/production');
  }
    
    let scrollFix = {
      overflowY: 'auto'
    };
    
    const invert = invertColor ? 'invert' : '';

    return(
      <div className='containerEx'>
        <ToastContainer
          position="top-right"
          autoClose={10000}
          newestOnTop />
        <div className='tenHeader noPrint'>
          <div className='topBorder' />
          <HomeIcon />
          {base ? 
            <div className='frontCenterTitle cap'>{title}</div>
          :
            <CookieBar
              batchData={batchData}
              itemData={itemData}
              widgetData={widgetData}
              versionData={versionData}
              groupData={groupData}
              app={app}
              action={action}
              miniAction={false} />
          }
          
          <div className='rightSpace'>
            {itemData ? 
              <button 
                title='View this in production'
                onClick={()=>goPro(itemData.serial)}>
                <i className='fas fa-paper-plane topRightIcon' data-fa-transform='left-1'></i>
              </button>
            :
             batchData ? 
              <button 
                title='View this in production'
                onClick={()=>goPro(batchData.batch)}>
                <i className='fas fa-paper-plane topRightIcon' data-fa-transform='left-1'></i>
              </button>
            :
             groupData ? 
              <button 
                title='View this in production'
                onClick={()=>goPro(groupData.alias)}>
                <i className='fas fa-paper-plane topRightIcon' data-fa-transform='left-1'></i>
              </button>
            :
             action === 'newGroup' ?
              <GroupForm
                id={false}
                name={false}
                alias={false}
                wiki={false}
                noText={false}
                primeTopRight={true} />
            :null}
          </div>
        
        </div>
        <aside className='taskBarEx noPrint'>
          <TaskBar subLink={subLink} />
        </aside>
        
        <section className={'contentAreaEx ' + invert}>
          <div 
            className={
              base ? 'baseConainer' :
              !children[1] ?
                'baseTraverseContainer' : 'traverseContainer'}>
            
            <section className='traverseContent' style={scrollFix}>
              {children[0] || children}
            </section>
            
            {children[1] &&
              <aside className='traverseList' style={scrollFix}>
                {children[1]}
              </aside>}
            
            {!base &&
              <div className='actionBarEx'>
                <ActionBar
                  batchData={batchData}
                  itemData={itemData}
                  groupData={groupData}
                  widgetData={widgetData}
                  versionData={versionData}
                  app={app}
                  action={action} />
              </div>}
              
          </div>
          
        </section>
        
      </div>
    );
  };