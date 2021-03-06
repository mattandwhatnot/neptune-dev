import React, { Fragment, useState, useEffect } from 'react';

import LeapButton from '/client/components/tinyUi/LeapButton.jsx';
import FilterActive from '/client/components/bigUi/FilterActive.jsx';

const BatchesList = ({ batchData, widgetData, variantData })=> {
  
  const [ filter, filterSet ] = useState(false);
  const [ textString, textSet ] = useState('');
  const [ list, listSet ] = useState([]);
  
  const setFilter = (rule)=> {
    filterSet( rule );
  };
  const setTextFilter = (rule)=> {
    textSet( rule.toLowerCase() );
  };
    
  const b = batchData;
  const w = widgetData;
   
  useEffect( ()=> { 
    let basicFilter = 
      filter === 'done' ?
      b.filter( x => x.completed ? x.completed : x.live === false ) :
      filter === 'inproc' ?
      b.filter( x => !x.completed ? !x.completed : x.live === true ) :
      b;
    let showList = basicFilter.filter( 
                    tx => tx.batch.toLowerCase().includes(textString) === true );
    let sortList = showList.sort((b1, b2)=> {
                if (b1.batch < b2.batch) { return 1 }
                if (b1.batch > b2.batch) { return -1 }
                return 0;
              });
    listSet(sortList);
  }, [ batchData, filter, textString ]);
            
  return (
    <Fragment>
      
        <FilterActive
          title={b.batch}
          done='Completed'
          total={list.length}
          onClick={(e)=>setFilter(e)}
          onTxtChange={(e)=>setTextFilter(e)} />
     
      {list.map( (entry, index)=> {
        const style = entry.completed ?
                        entry.live ? 
                          'leapBar numFont exMark' :
                        'leapBar numFont gMark' :
                      'leapBar numFont activeMark';
        const subW = w.find( x => x._id === entry.widgetId);
        const subV = variantData.find( x => x.versionKey === entry.versionKey);
          return(
            <LeapButton
              key={index}
              title={entry.batch} 
              sub={<i><i className='up'>{subW.widget}</i> v.{subV.variant}</i>}
              sty={style}
              address={'/data/batch?request=' + entry.batch}
            />
      )})}
      
		</Fragment>
  );
};

export default BatchesList;