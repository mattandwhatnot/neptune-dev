import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import InOutWrap from '/client/components/tinyUi/InOutWrap.jsx';

// props
/// id={b._id}
/// nonCons={nonCons}

export default class NCTributary extends Component {
  
  constructor() {
    super();
    this.handleFix = this.handleFix.bind(this);
    this.handleInspect = this.handleInspect.bind(this);
    this.handleReject = this.handleReject.bind(this);
    this.handleSkip = this.handleSkip.bind(this);
    this.handleSnooze = this.handleSnooze.bind(this);
    this.handleUnSkip = this.handleUnSkip.bind(this);
  }
  
  handleFix(ncKey) {
    const id = this.props.id;
    Meteor.call('fixNC', id, ncKey, (error)=> {
			if(error)
			  console.log(error);
		});
		let findBox = document.getElementById('find');
		findBox.focus();
  }

  handleInspect(ncKey) {
    const id = this.props.id;
    Meteor.call('inspectNC', id, ncKey, (error)=> {
			if(error)
			  console.log(error);
		});
		let findBox = document.getElementById('find');
		findBox.focus();
  }
    
  handleReject(ncKey, fixTime, fixWho) {
    const id = this.props.id;
    //const fixTime = this.props.entry.fix.time;
    //const fixWho = this.props.entry.fix.who;
    Meteor.call('rejectNC', id, ncKey, fixTime, fixWho, (error)=> {
			if(error)
			  console.log(error);
		});
		let findBox = document.getElementById('find');
		findBox.focus();
  }
    
  handleSkip(ncKey) {
    const id = this.props.id;
    Meteor.call('skipNC', id, ncKey, (error)=> {
			if(error)
        console.log(error);
		});
	}
	
	handleSnooze(ncKey) {
	  const id = this.props.id;
    Meteor.call('snoozeNC', id, ncKey, (error)=> {
			if(error)
        console.log(error);
		});
	}
	
	handleUnSkip(ncKey) {
	  const id = this.props.id;
    Meteor.call('UnSkipNC', id, ncKey, (error)=> {
      if(error)
        console.log(error);
		});
  }
  
  render() {
    return(
      <InOutWrap type='ncTrans' add='grid'>
        {this.props.nonCons.map( (entry)=>{
          this.props.sType === 'finish' && entry.snooze === true ?
            this.handleUnSkip(entry.key) : null;
          return (
            <NCStream
              key={entry.key}
              entry={entry}
              id={this.props.id}
              end={this.props.sType === 'finish'}
              fix={()=> this.handleFix(entry.key)}
              inspect={()=> this.handleInspect(entry.key)}
              reject={()=> this.handleReject(entry.key, entry.fix.time, entry.fix.who)}
              skip={()=> this.handleSkip(entry.key)}
              snooze={()=> this.handleSnooze(entry.key)}
              unSkip={()=> this.handleUnSkip(entry.key)}
            />
          )})}
      </InOutWrap>
    );
  }
}

export class NCStream extends Component {
        
  render () {
    
    const fixed = this.props.entry.fix;
  
    const same = this.props.entry.fix.who === Meteor.userId();
    const inspector = Roles.userIsInRole(Meteor.userId(), 'inspect');
    const lockI = fixed ? !same && inspector ? false : true : false;
    let skip = this.props.entry.skip;
    let style = !skip ? 'cap gridRow darkRed noCopy' : 'cap gridRow yellow noCopy';
    let rightCell = { width: '90px', padding: '0px' };
    
    return (
      <ContextMenuTrigger id={this.props.entry.key} 
      attributes={ {className:style} }>
        <div className='gridCell up noCopy'>{this.props.entry.ref}</div>
        <div className='gridCell'>{this.props.entry.type}</div>
        <div className='gridCell' style={rightCell}>
          {skip ?
            this.props.entry.snooze === true ?
              <i className='fa fa-clock-o fa-2x'></i>
              :
              <i className='fa fa-truck fa-2x'></i>
          :
            fixed ?
              <span>
                <button 
                  ref={(i)=> this.inspectline = i}
                  className='granule riverG'
                  readOnly={true}
                  onClick={this.props.inspect}
                  disabled={lockI}>
                <i className='fa fa-check fa-lg' aria-hidden='true'></i></button>
                <button 
                  ref={(i)=> this.rejectline = i}
                  className='granule riverNG'
                  readOnly={true}
                  onClick={this.props.reject}
                  disabled={lockI}>
                <i className='fa fa-times fa-lg' aria-hidden='true'></i></button>
              </span>
          :
              <button 
                ref={(i)=> this.fixline = i}
                className='pebble'
                readOnly={true}
                onClick={this.props.fix}
                disabled={false}>
              <img src='/repair.svg' className='pebbleSVG' /></button>
          }
        </div>
        <ContextMenu id={this.props.entry.key}>
          <MenuItem onClick={this.props.snooze} disabled={skip !== false || this.props.end}>
            Snooze
          </MenuItem>
          <MenuItem onClick={this.props.skip} disabled={skip !== false && !this.props.entry.snooze}>
            Skip
          </MenuItem>
          <MenuItem onClick={this.props.unSkip} disabled={!skip}>
            Activate
          </MenuItem>
        </ContextMenu>
      </ContextMenuTrigger>
    );
  }
}