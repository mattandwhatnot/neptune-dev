import React from 'react';
import moment from 'moment';
import Pref from '/client/global/pref.js';

import UserNice from '/client/components/smallUi/UserNice.jsx';

// requires data
// escaped array

const EscapeTable = ({ data, id })=>	{

  return (
    <div>
      {data.length > 0 ?
      <table className='wide'>
        <thead className='red cap'>
          <tr>
            <th colSpan='6'>{Pref.escape} {Pref.nonCon}s</th>
          </tr>
          <tr>
						<th>who</th>
						<th>time</th>
            <th>ref</th>
            <th>type</th>
            <th>quantity</th>
            <th>ncar</th>
          </tr>
        </thead>
        {data.map( (entry)=>{
          return (
            <EscapeRow
              key={entry.key}
              entry={entry}
              id={id} />
          );
        })}
      </table>
      :
      <div className='centreText fade'>
        <i className='fas fa-smile fa-3x'></i>
        <p className='big'>no reported {Pref.escape} {Pref.nonCon}s</p>
      </div>
      }
    </div>
  );
};

export default EscapeTable;

const EscapeRow = ({ entry, id })=> {
  let dt = entry;
  return(
    <tbody>
      <tr>
        <td><UserNice id={dt.who} /></td>
        <td>{moment(dt.time).calendar(null, {sameElse: "ddd, MMM D /YY, h:mm A"})}</td>
        <td>{dt.ref}</td>
        <td>{dt.type}</td>
        <td>{dt.quantity}</td>
        <td>{dt.ncar}</td>
      </tr>
    </tbody>
  );
};