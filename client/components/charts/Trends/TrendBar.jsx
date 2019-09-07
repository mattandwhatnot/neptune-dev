import { Meteor } from 'meteor/meteor';
import React, { useState, useEffect } from 'react';
import Pref from '/client/global/pref.js';
import moment from 'moment';
import 'moment-timezone';
import { 
  VictoryBar,
  VictoryChart, 
  VictoryAxis,
  VictoryStack
} from 'victory';
//import Pref from '/client/global/pref.js';
import Theme from '/client/global/themeV.js';

// statType // doneBatch'

const TrendBar = ({ title, statType })=>{

  const blank = [ {x:6,y:0},{x:5,y:0},{x:4,y:0},{x:3,y:0},{x:2,y:0},{x:1,y:0} ];
  const [ dataG, dataGSet ] = useState( blank );
  const [ dataNG, dataNGSet ] = useState( blank );
  
  useEffect( ()=>{
    const clientTZ = moment.tz.guess();
    Meteor.call('sixWeekRate', clientTZ, statType, (err, re)=>{
      err && console.log(err);
      const barOne = Array.from(re, w => { return { x: w.x, y: w.y[0] } } );
      const barTwo = Array.from(re, w => { return { x: w.x, y: w.y[1] } } );
      dataGSet(barOne);
      dataNGSet(barTwo);
    });
  }, []);
  
  return(
    <div className='chart20Contain'>
      <VictoryChart
        theme={Theme.NeptuneVictory}
        padding={{top: 25, right: 25, bottom: 25, left: 25}}
        domainPadding={{x: 10, y: 40}}
        height={400}
      >
        <VictoryAxis 
          tickCount={6}
          tickValues={['-5', '-4', '-3', '-2', '-1', 'now']}
        />
          <VictoryStack
            theme={Theme.NeptuneVictory}
              colorScale={["rgb(46, 204, 113)", "rgb(241, 196, 15)"]}
              padding={0}
              animate={{
                duration: 500,
                onLoad: { duration: 500 }
              }}
            >
            <VictoryBar
              data={dataG}
              barRatio={0.9}
            />
            <VictoryBar
              data={dataNG}
              barRatio={0.9}
            />
          </VictoryStack>
        </VictoryChart>
        <div className='centreText smCap'>{title}</div>
      </div>
  );
};

export default TrendBar;