import React, { useState, useEffect } from 'react';
import { CalcSpin } from '/client/components/tinyUi/Spin.jsx';
import { 
  VictoryBar, 
  VictoryChart, 
  VictoryAxis,
  VictoryTooltip,
  VictoryStack
} from 'victory';
import Pref from '/client/global/pref.js';
import Theme from '/client/global/themeV.js';

const NonConMultiBatchBar = ({ batches })=> {
  
  const [ seriesState, seriesSet ] = useState( false );
  
  useEffect( ()=> {
    Meteor.call('nonConBatchesTypes', batches, (error, reply)=>{
      error && console.log(error);
      reply && seriesSet(reply);
    });
  }, [batches]);

  if(!seriesState) {
    return(
      <CalcSpin />
    );
  }
  
  const ncsObj = JSON.parse(seriesState);
  
  if(ncsObj.length > 0) {

    const typeCount = ncsObj[0] ? ncsObj[0].length : ncsObj.length;
    
    return(
      <div className='chartNoHeightContain'>
        <VictoryChart
          theme={Theme.NeptuneVictory}
          padding={{top: 25, right: 20, bottom: 20, left: 120}}
          domainPadding={{x: 10, y: 40}}
          height={50 + ( typeCount * 15 )}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => Math.round(t)}
            style={ {
              axis: { stroke: '#808080' },
              grid: { stroke: '#5c5c5c' },
              ticks: { stroke: '#5c5c5c' },
              tickLabels: { 
                fill: '#808080', 
                fontSize: '5px' }
            } }
          />
          <VictoryAxis 
            style={ {
              axis: { stroke: '#808080' },
              grid: { stroke: '#5c5c5c' },
              ticks: { stroke: '#5c5c5c' },
              tickLabels: { 
                fill: '#606060', 
                fontSize: '6px' }
            } }
          />
          <VictoryStack
            theme={Theme.NeptuneVictory}
            colorScale='heatmap'
            horizontal={true}
            padding={0}
          >
            {ncsObj.map( (entry, index)=>{
              if(entry.length > 0) {
                return(
                  <VictoryBar
                    key={index+entry.l}
                    data={entry}
                    labels={(d) => `${d.l} \n ${d.x} \n ${d.y}`}
                    labelComponent={
                      <VictoryTooltip
                        style={{ fontSize: '7px', padding: 2 }}
                      />}
                  />
              )}
            })}
          </VictoryStack>
        </VictoryChart>
      </div>
    );
  }
  
  return(
    <div className='centreText fade'>
      <i className='fas fa-ghost fa-2x grayT'></i>
      <p className='medBig cap'>no {Pref.xBatchs}</p>
    </div>
  );
};

export default NonConMultiBatchBar;