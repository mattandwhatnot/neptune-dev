import React from 'react';
// import Pref from '/client/global/pref.js';

import ExploreLinkBlock from '/client/components/tinyUi/ExploreLinkBlock.jsx';

const BatchHeaders = ({ oB, bCache, title })=> (
  <div className='overGridFixed'>
      
    <div id="allLiveBatch" className='overGridRowFixedHeader'>
      <span>{title} <sup>{oB.length}</sup></span>
    </div>
    
    {!oB ? null :
      oB.map( (entry, index)=>{
        return(
          <BatchHeaderChunk
            key={`${entry._id}livefixed${index}`}
            ck={entry}
            bCache={bCache} />
    )})}
    
  </div>
);

export default BatchHeaders;

const BatchHeaderChunk = ({ ck, source, bCache })=> {

  const moreInfo = bCache ? bCache.dataSet.find( x => x.batch === ck.batch) : false;
  const what = !moreInfo ? 'unavailable' : moreInfo.isWhat;
  
  const releasedToFloor = ck.releases.findIndex( 
                            x => x.type === 'floorRelease') >= 0 ? 
                            '' : 'ghostState';
                            
  return(
    <div className={`overGridRowFixed ${releasedToFloor}`}>
      <div>
        <ExploreLinkBlock type='batch' keyword={ck.batch} wrap={false} />
      </div>
      <div>{what.length <= 50 ? what : what.substring(0, 50) + '...'}</div>
    </div>
  );
};
