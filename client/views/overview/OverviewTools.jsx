import React, {useState, useEffect, useRef} from 'react';
import moment from 'moment';
import 'moment-timezone';
import Pref from '/client/global/pref.js';

function useInterval(callback, delay) {
  const savedCallback = useRef();
  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const OverviewTools = ({
  app, brancheS, loadTimeUP,
  filterByUP, sortByUP, denseUP, lightUP,
  changeFilterUP, changeSortUP, denseSetUP, themeSetUP
})=> {
  
  const [ tickingTime, tickingTimeSet ] = useState( moment() );

  useInterval( ()=> {
    tickingTimeSet( moment() );
  },1000*60);
   
  const duration = moment.duration(
    loadTimeUP.diff(tickingTime))
      .humanize();
        
  return(
    <nav className='overviewToolbar'>
      <span>
        <i className='fas fa-filter fa-fw darkgrayT'></i>
        <select
          id='filterSelect'
          title={`Change ${Pref.branch} Filter`}
          className='overToolSort liteToolOn'
          defaultValue={filterByUP}
          onChange={(e)=>changeFilterUP(e)}>
          <option value={false}>All</option>
          <option value='KITTING' className='cap'>{Pref.kitting}</option>
          <option value={Pref.released} className='cap'>{Pref.released}</option>
          {brancheS.map( (br, ix)=> {
            return(
              <option key={br.brKey+ix} value={br.branch}>{br.branch}</option>
          )})}
        </select>
      </span>
      
      <span>
        <i className='fas fa-sort-amount-down fa-fw darkgrayT'></i>
        <select
          id='sortSelect'
          title='Change List Order'
          className='overToolSort liteToolOn'
          defaultValue={sortByUP}
          onChange={(e)=>changeSortUP(e)}>
          <option value='priority'>priority</option>
          <option value='batch'>{Pref.batch}</option>
          <option value='sales'>{Pref.salesOrder}</option>
          <option value='due'>{Pref.end}</option>
        </select>
      </span>
      
      <span>
        <button
          key='denseOff'
          title='Comfort Layout'
          onClick={()=>denseSetUP(0)}
          className={denseUP === 0 ? 'liteToolOn' : 'liteToolOff'}
        ><i className='fas fa-expand fa-fw'></i></button>
        {/*                fa-expand-arrows-alt
        <button
          key='compactOn'
          title='Compact Layout'
          onClick={()=>denseSetUP(1)}
          className={denseUP === 1 ? 'liteToolOn' : 'liteToolOff'}
        ><i className='fas fa-compress fa-fw'></i></button>
        */}
        <button
          key='miniOn'
          title='Minifyed Layout'
          onClick={()=>denseSetUP(2)}
          className={denseUP === 2 ? 'liteToolOn' : 'liteToolOff'}
        ><i className='fas fa-compress fa-fw'></i></button>
      </span>        {/*fa-compress-arrows-alt*/}
      
      <span>
        <button
          key='darkOn'
          title='Dark Theme'
          onClick={()=>themeSetUP(false)}
          className={lightUP === false ? 'liteToolOn' : 'liteToolOff'}
        ><i className='fas fa-moon fa-fw'></i></button>
        <button
          key='lightOn'
          title='Light Theme'
          onClick={()=>themeSetUP(true)}
          className={lightUP === true ? 'liteToolOn' : 'liteToolOff'}
        ><i className='fas fa-sun fa-fw'></i></button>
      </span>
      
      <span className='flexSpace' />
      <span className='darkgrayT'>Updated {duration} ago</span>
    </nav>
  );
};

export default OverviewTools;