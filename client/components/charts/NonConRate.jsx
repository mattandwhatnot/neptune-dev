import React, {Component} from 'react';
import Chartist from 'chartist';
import ChartistGraph from 'react-chartist';
import Tooltip from 'chartist-plugin-tooltips';
import { CalcSpin } from '/client/components/uUi/Spin.jsx';

export default class NonConRate extends Component {
  
  constructor() {
    super();
    this.state = {
      ratesC: false,
      ratesL: false
    };
  }
  
  loop() {
    Meteor.call('nonConRateLoop', this.props.batches, (error, reply)=>{
      if(error)
        console.log(error);
      this.setState({ ratesC: reply.counts, ratesL: reply.labels });
    });
  }
  
  render () {
    
    const counts = this.state.ratesC;
    const labels = this.state.ratesL;
    
    if(!counts || !labels) {
      return(
        <CalcSpin />
      );
    }
    
    let data = {
      labels: labels,
      series: counts
    };
    
    let options = {
      fullWidth: true,
      height: 300,
      showLabel: false,
      axisY: {
        low: 0,
        onlyInteger: true,
        divisor: 10,
      },
      axisX: {
        labelInterpolationFnc: function(value, index) {
          return index % 7 === 0 ? 
                 value : 
                 //index === labels.length - 1 ? 
                 //value :
                 null;
        },
      },
      chartPadding: {
        top: 20,
        right: 45,
        bottom: 0,
        left: -10
      },
      plugins: [
        Chartist.plugins.tooltip({
          appendToBody: true
        }),
      ],
    };
    
    return(
      <span>
        <div className='wide balance cap'>
          <i className=''>NonCon Rate</i>
        </div>
        <div>
          <ChartistGraph data={data} options={options} type={'Line'} />
        </div>
      </span>
    );
  }
  componentDidMount() {
    this.loop();
  }
}