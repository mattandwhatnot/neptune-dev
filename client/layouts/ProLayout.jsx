import React, {Component} from 'react';
import { Meteor } from 'meteor/meteor';
//import Pref from '/client/global/pref.js';

import HomeIcon from '/client/components/uUi/HomeIcon.jsx';
import FindBox from './FindBox.jsx';
import FormBar from '/client/components/bigUi/FormBar.jsx';
import ProgressCounter from '/client/components/utilities/ProgressCounter.js';

export class ProWrap extends Component	{
  
  constructor() {
    super();
    this.state = {
      expand: false,
    };
    this.handleExpand = this.handleExpand.bind(this);
  }
  
  handleExpand() {
    const openState = this.state.expand;
    this.setState({ expand: !openState });
    Session.set( 'riverExpand', !openState );
  }
  
  getFlows() {
    const b = this.props.batchData;
    const w = this.props.widgetData;
    let flow = [];
    let flowAlt = [];
    let progCounts = false;
    if( b && w ) {
      const river = w.flows.find( x => x.flowKey === b.river);
      const riverAlt = w.flows.find( x => x.flowKey === b.riverAlt );
      flow = river ? river.flow : [];
      flowAlt = riverAlt ? riverAlt.flow : [];
      if(this.props.action !== 'xBatchBuild') {
        progCounts = ProgressCounter(flow, flowAlt, b, this.state.expand);
      }
    }
    return { flow, flowAlt, progCounts };
  }
  
  render() {
    
    let scrollFix = {
      overflowY: 'auto'
    };
    
    const bData = this.props.batchData;
    const iS = this.props.itemSerial;
    const append = bData && iS ? bData.batch : null;
    
    const exploreLink = !bData ? false : !iS ?
                        '/data/batch?request=' + bData.batch :
                        '/data/batch?request=' + bData.batch + '&specify=' + iS;
    
    const path = !bData ? { flow: [], flowAlt: [], progCounts: false } : this.getFlows();
    
    let riverExpand = this.state.expand;
    let topClass = !riverExpand ? 'proDefault' : 'proExpand';
    let toggleClass = !riverExpand ? 'riverExpandToggle' : 'riverShrinkToggle';
    
    return(
      <div className='containerPro'>
        <div className='tenHeader'>
          <div className='topBorder' />
          <HomeIcon />
          <div className='frontCenterTitle'>
            <FindBox append={append} />
          </div>
          <div className='rightSpace'>
            <button
              id='exBatch'
              title='View this in explore'
              onClick={()=>FlowRouter.go(exploreLink)}>
              <i className='fas fa-rocket topRightIcon' data-fa-transform='left-1'></i>
            </button>
          </div>
        </div>
        
        {this.props.standAlone ?
          <div className='proFull'>
            {this.props.children}
          </div>
        :
        <section className={topClass}>
          
          <div className='proLeft' style={scrollFix}>
            {this.props.children.length > 2 ?
              React.cloneElement(this.props.children[0],
                { 
                  expand: this.state.expand,
                  flow: path.flow,
                  flowAlt: path.flowAlt,
                  progCounts: path.progCounts
                }
              )
            :null}
            {React.cloneElement(this.props.children[this.props.children.length - 2],
              { 
                expand: this.state.expand,
                flow: path.flow,
                flowAlt: path.flowAlt,
                progCounts: path.progCounts
              }
            )}
          </div>
        
          <button
            type='button'
            className={toggleClass}
            onClick={()=>this.handleExpand()}>
            <i className='fas fa-chevron-right fa-2x'></i>
          </button>
            
          <div className='proRight' style={scrollFix}>
            {this.props.children[this.props.children.length - 1]}
          </div>
  
          <FormBar
            batchData={this.props.batchData}
            itemData={this.props.itemData}
            widgetData={this.props.widgetData}
            versionData={this.props.versionData}
            users={this.props.users}
            app={this.props.app}
            action={this.props.action} />
          
        </section>
        }
      </div>
    );
  }
  componentDidMount() {
    const open = Session.get('riverExpand');
    !open ? null : this.setState({ expand: true });
  }
}