import React, {Component} from 'react';
import moment from 'moment';
import Pref from '/client/global/pref.js';

import UserNice from '/client/components/smallUi/UserNice.jsx';
import RMAForm from '/client/components/forms/RMAForm.jsx';

// requires data
// rma array

export default class RMATable extends Component	{
  
  pullRMA(cKey) {
    let check = 'Are you sure you want to remove this ' + Pref.rmaProcess;
    const yes = window.confirm(check);
    if(yes) {
      const id = this.props.id;
      Meteor.call('pullRMACascade', id, cKey, (error)=>{
        if(error)
          console.log(error);
      });
    }else{null}
  }

  render() {
    
    const data = this.props.data;

    return (
      <div>
        {data.length > 0 ?
        <table className='wide'>
          <thead className='red cap'>
            <tr>
              <th>RMA</th>
  						<th>who</th>
  						<th>time</th>
              <th>required</th>
              <th>steps</th>
              <th>comment</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          {data.map( (entry)=>{
            let started = this.props.inUse.includes(entry.key);
            return (
              <RMARow
                key={entry.key}
                entry={entry}
                id={this.props.id}
                onClick={()=>this.pullRMA.bind(this, entry.key)}
                lock={started} />
            );
          })}
        </table>
        :
        <div className='centreText fade'>
            <i className='fas fa-smile fa-3x' aria-hidden="true"></i>
            <p className='big'>no {Pref.nonCon}s</p>
          </div>
        }
      </div>
    );
  }
}




const RMARow = ({ entry, id, onClick, lock })=> {
  let dt = entry;
  
  return(
    <tbody>
      <tr>
        <td>{dt.rmaId}</td>
        <td><UserNice id={dt.who} /></td>
        <td>{moment(dt.time).calendar()}</td>
        <td>{dt.quantity === 0 ? 'unlimited' : dt.quantity}</td>
        <td>{dt.flow.length}</td>
        <td>{dt.comm}</td>
        <td>
          {Roles.userIsInRole(Meteor.userId(), ['qa', 'edit']) &&
            <RMAForm
              id={id}
              edit={dt}
              small={true} />
          }
        </td>
        <td>
          {!lock && Roles.userIsInRole(Meteor.userId(), ['qa', 'remove']) ?
            <button
              title='Remove'
              className='miniAction redT'
              onClick={()=>onClick}
              readOnly={true}
            ><i className='fas fa-times fa-fw'></i></button>
          :null}
        </td>
      </tr>
    </tbody>
  );
};