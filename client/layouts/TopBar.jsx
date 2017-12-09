import React, {Component} from 'react';
import { Meteor } from 'meteor/meteor';
import {createContainer} from 'meteor/react-meteor-data';
import RoleCheck from '/client/components/utilities/RoleCheck.js';

import Spin from '../components/uUi/Spin.jsx';
import Freeze from '../components/tinyUi/Freeze.jsx';
import InitialSetup from '../views/InitialSetup.jsx';
import Login from '../views/Login.jsx';
import ActivateUser from '../components/forms/ActivateUser.jsx';
import Chill from '../components/tinyUi/Chill.jsx';
import TimeLink from '../components/uUi/TimeLink.jsx';

class TopBar extends Component	{
  
  render() {
    
    //console.log(Meteor.status().connected);
    /*
    if() {
      return (
        <Freeze>
          <div className='actionBox orange centre centreTrue bigger'>
            <p>OFFLINE</p>
          </div>
        </Freeze>
      );
    }*/
    
    if(!this.props.login) {
      return (
        <Freeze>
          <Login />
        </Freeze>
      );
    }
        
    if(!this.props.ready) {
      return (
        <Freeze>
          <Spin color={true} />
        </Freeze>
      );
    }
    
    if(!this.props.active || !this.props.org) {
      return (
        <div className='bleed middle flexRR'>
          <Chill name={this.props.user} />
          <Freeze>
            <div>
              <hr />
              <ActivateUser />
            </div>
          </Freeze>
        </div>
      );
    }
    
    if(!this.props.app) {
      return (
        <div className='bleed middle flexRR'>
          <Chill name={this.props.user}/>
          <Freeze>
            <InitialSetup org={this.props.org} />
          </Freeze>
        </div>
      );
    }
    
    return (
      <div className='primeNav'>
        <nav className='primeNav'>
          <a className='title' href='/' title='Home'>
            <img
              src='/neptune-logo-white.svg'
              className='logoSVG' />
          </a>
          <a href='/activity' className={ this.props.link === 'act' ? 'whiteT' : '' }>
            <i className="fas fa-chart-line fa-lg" aria-hidden='true'></i>
            <span className='icontext'>Activity</span>
          </a>
          <a href='/dashboard' className={ this.props.link === 'dash' ? 'whiteT' : '' }>
            <i className="fas fa-tachometer-alt fa-lg" aria-hidden='true'></i>
            <span className='icontext'>Dashboard</span>
          </a>
          <RoleCheck role={'nightly'}>
            <span>
              <a href='/production' className={ this.props.link === 'prod' ? 'whiteT' : '' }>
                <i className="fa fa-flask fa-lg" aria-hidden='true'></i>
                <span className='icontext'>Production</span>
              </a>
              <a href='/data' className={ this.props.link === 'data' ? 'whiteT' : '' }>
                <i className="icon fa fa-flask fa-lg" aria-hidden='true'></i>
                <span className='icontext'>Data</span>
              </a>
            </span>
          </RoleCheck>
          <a href='/app' className={ this.props.link === 'app' ? 'whiteT' : '' }>
            <i className="fas fa-sliders-h fa-lg" aria-hidden='true'></i>
            <span className='icontext'>Settings</span>
          </a>
        </nav>
        <span className='navSpacer'></span>
        <TimeLink go={this.props.app.timeClock} />
        <Chill name={this.props.user}/>
      </div>
    );
  }
}

export default createContainer( () => {
  let login = Meteor.userId() ? true : false;
  let usfo = login ? Meteor.user() : false;
  let user = usfo ? usfo.username : false;
  let org = usfo ? usfo.org : false;
  let active = usfo ? Roles.userIsInRole(Meteor.userId(), 'active') : false;
  const hotSub = login ? Meteor.subscribe('appData') : false;
  if(!login) {
    return {
      orb: Session.get('now'),
      bolt: Session.get('allData'),
      login: Meteor.userId(),
    };
  }else if(!active) {
    return {
      ready: hotSub.ready() && Roles.subscription.ready(),
      login: Meteor.userId(),
      user: user
    };
  }else{
    return {
      ready: hotSub.ready() && Roles.subscription.ready(),
      orb: Session.get('now'),
      bolt: Session.get('allData'),
      time: Session.get('timeClock'),
      login: Meteor.userId(),
      user: user,
      active: active,
      org: org,
      app: AppDB.findOne({org: org})
    };
  }
}, TopBar);