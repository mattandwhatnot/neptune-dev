import React, {Component} from 'react';

export default class FilterItems extends Component	{
  
  changeFilter(keyword) {
    this.props.onClick(keyword);
  }
  
  changeAdvancedFilter() {
    this.props.onChange({step: this.un.value, time: this.day.value});
  }
  
  render() {
    
    let dStyl = {
      lineHeight: '12px',
      textIndent: '3px',
      margin: '0',
      padding: '0 5px'
    };
    
    return(
      
      <details className='fltrs noCopy' style={dStyl}>
          <summary className='fltrs'>
            <span>
              <i className='fa fa-filter' aria-hidden='true'></i>
              <i className='med'>Filter</i>
            </span>
            <span className='rAlign'>
              <i className='fa fa-chevron-down' aria-hidden='true'></i>
            </span>
          </summary>
          
          <br />
          
          <span className='balance'>
          
            <span className='radioLabelPair'>
              <input
                type='radio'
                name='scale'
                id='all'
                title='All'
                defaultChecked={true}
                onChange={this.changeFilter.bind(this, 'all')} />
              <label htmlFor='all'>All</label>
            </span>
            
            <span className='radioLabelPair'>
              <input
                type='radio'
                name='scale'
                id='inproc'
                title='In Regular Process'
                onChange={this.changeFilter.bind(this, 'inproc')} />
              <label htmlFor='inproc'>In Progress</label>
            </span>
            
            <span className='radioLabelPair'>
              <input
                type='radio'
                name='scale'
                id='done'
                title='Finished Regular Process'
                onChange={this.changeFilter.bind(this, 'done')} />
              <label htmlFor='done'>Finished</label>
            </span>
            
            <span className='radioLabelPair'>
              <input
                type='radio'
                name='scale'
                id='firsts'
                title='First Off Items'
                onChange={this.changeFilter.bind(this, 'firsts')} />
              <label htmlFor='firsts'>Firsts</label>
            </span>
            
            <span className='radioLabelPair'>
              <input
                type='radio'
                name='scale'
                id='nonCons'
                title='Items with NonConformances'
                onChange={this.changeFilter.bind(this, 'noncons')} />
              <label htmlFor='nonCons'>NonCons</label>
            </span>
            
            <span className='radioLabelPair'>
              <input
                type='radio'
                name='scale'
                id='lt'
                title='Alt Process'
                onChange={this.changeFilter.bind(this, 'alt')} />
              <label htmlFor='lt'>Alt</label>
            </span>
            
            <span className='radioLabelPair'>
              <input
                type='radio'
                name='scale'
                id='rma'
                title='RMA'
                onChange={this.changeFilter.bind(this, 'rma')} />
              <label htmlFor='rma'>RMA</label>
            </span>
            
            <span className='radioLabelPair'>
              <input
                type='radio'
                name='scale'
                id='scrp'
                title='Scrapped'
                onChange={this.changeFilter.bind(this, 'scrap')} />
              <label htmlFor='scrp'>Scrapped</label>
            </span>
            
          </span>
          
          {this.props.advancedTitle ?
            <div>
              <label className='fltrsInput'>
                <i className='fas fa-map-marker-alt'>{/*this.props.advancedTitle*/}</i>
                <select
                  ref={(i)=> this.un = i}
                  onChange={this.changeAdvancedFilter.bind(this)}>
                  <option></option>
                  {this.props.advancedList.map( (entry, index)=>{
                    return(
                      <option
                        key={index}
                        value={entry.key}
                      >{entry.step === entry.type ? 
                        entry.step : 
                        entry.step + ' ' + entry.type}
                      </option>
                    );
                  })}
                </select>
              </label>
              <br />
              <label className='fltrsInput'>
                <i className='far fa-calendar-alt'></i>
                <input
                  type='date'
                  ref={(i)=> this.day = i}
                  onChange={this.changeAdvancedFilter.bind(this)} />
              </label>
            </div>
          : null}
            
          <hr />
          
          <p className='centreText'>Total: {this.props.total}</p>
          
          <br />
          
        </details>
      
    );
  }
}