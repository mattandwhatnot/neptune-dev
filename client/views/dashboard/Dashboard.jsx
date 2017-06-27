import React, {Component} from 'react';

import DataToggle from '../../components/tinyUi/DataToggle.jsx';
import IkyToggle from '../../components/tinyUi/IkyToggle.jsx';
import NCAdd from '../../components/river/NCAdd.jsx';
import ActionBar from '../../components/bigUi/ActionBar.jsx';

export default class Dashboard extends Component	{
  
  render() {
    
    let scrollFix = {
      overflowY: 'auto'
    };
    let overScrollSpacer = {
      width: '100%',
      height: '60px'
    };
    
    return (
      <div className='dashMainSplit'>
        <div className='dashMainLeft' style={scrollFix}>
          {this.props.children[0]}
          <div style={overScrollSpacer}></div>
        </div>
        
        <div className='gridMainRight' style={scrollFix}>
          {this.props.children[1]}
          <div style={overScrollSpacer}></div>
        </div>
        
        <ActionBar
          snap={this.props.snap}
          batchData={this.props.batchData}
          itemData={this.props.itemData}
          widgetData={this.props.widgetData}
          versionData={this.props.versionData}
          groupData={this.props.groupData}
          app={this.props.app} />
              
        {/*React.cloneElement(this.props.children[0], this.props)*/}
      </div>
    );
  }
}