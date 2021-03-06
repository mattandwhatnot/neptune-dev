import React, { useState, useLayoutEffect } from 'react';
import '/client/utility/ShipTime.js';
// import Pref from '/client/global/pref.js';

import WindowFrame from './WindowFrame';
import WindowGlass from './WindowGlass';

import { listShipDays } from '/client/utility/WorkTimeCalc';

const ShipWindows = ({ 
  calcFor, traceDT,
  brancheS, app, user, isDebug, focusBy, salesBy, dense, updateTrigger
})=> {
  
  const [ traceRapid, traceRapidSet ] = useState(false);
  const [ nextShipDays, nextShipDaysSet ] = useState([]);
  const [ traceDTSort, traceDTSSet ] = useState([]);
  
  useLayoutEffect( ()=>{
    const someR = traceDT.some( x => x.oRapid );
    traceRapidSet(someR);
    const incR = someR ? 2 : 1;
    const numOf = calcFor + incR;
    const getShipDays = listShipDays( app.nonWorkDays, numOf, true );
    // returns an array of moments
    nextShipDaysSet(getShipDays);
    
    const limitToSales = !salesBy ? traceDT :
                          traceDT.filter( t => t.salesOrder === salesBy );
      
    traceDTSSet( limitToSales.sort((p1, p2)=> {
      const p1bf = p1.bffrRel;
      const p2bf = p2.bffrRel;
      if (isNaN(p1bf)) { return 1 }
      if (isNaN(p2bf)) { return -1 }
      if (p1.lateLate) { return -1 }
      if (p2.lateLate) { return 1 }
      if (p1bf < p2bf) { return -1 }
      if (p1bf > p2bf) { return 1 }
      return 0;
    }) );
    
  }, [calcFor, traceDT, salesBy]);
  
  const canDo = Roles.userIsInRole(Meteor.userId(), ['edit', 'sales']);
         
  return(
    <div className={`downstreamContent forceScrollStyle ${dense}`}>
       
      <div className={`downstreamFixed forceScrollStyle ${dense}`}>
        {nextShipDays.map( (e, ix)=>( 
          <WindowFrame 
            key={'f'+ix}
            windowMoment={e}
            indexKey={ix - (traceRapid ? 1 : 0)}
            traceDT={traceDTSort}
            app={app}
            user={user}
            isDebug={isDebug}
            focusBy={focusBy}
            dense={dense}
          />
        ))}
      </div>
      
      <div className={`downstreamScroll forceScrollStyle ${dense}`}>
        {nextShipDays.map( (e, ix)=>( 
          <WindowGlass
            key={'s'+ix}
            windowMoment={e}
            indexKey={ix - (traceRapid ? 1 : 0)}
            traceDT={traceDTSort}
            brancheS={brancheS}
            app={app}
            user={user}
            isDebug={isDebug}
            canDo={canDo}
            focusBy={focusBy}
            dense={dense}
            updateTrigger={updateTrigger}
          />
        ))}
      </div>
      
    </div>
  );
};

export default ShipWindows;