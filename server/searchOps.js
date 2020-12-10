import moment from 'moment';
// import timezone from 'moment-timezone';

import Config from '/server/hardConfig.js';

export function whatIsBatch(keyword, labelString) {
  const batch = BatchDB.findOne({batch: keyword});
  if(!batch) {
    return false;
  }else{
    const widget = WidgetDB.findOne({_id: batch.widgetId});
    const group = GroupDB.findOne({_id: widget.groupId});
    const groupH = group.hibernate ? "."+group.alias : group.alias;
    const variant = VariantDB.findOne({versionKey: batch.versionKey});
    const more = widget.describe;
    
    if(labelString) {
      const label = '/print/generallabel/' + keyword +
                    '?group=' + group.alias +
                    '&widget=' + widget.widget +
                    '&ver=' + variant.variant +
                    '&desc=' + more +
                    '&sales=' + batch.salesOrder +
                    '&quant=' + batch.items.length; 
      return label;     
    }else{
      const vNice = `v.${variant.variant}`;
      const nice = [ groupH.toUpperCase(), widget.widget.toUpperCase(), vNice ];
      return [ nice, more ];
    }
  }
}

export function whatIsBatchX(keyword, labelString) {
  const batch = XBatchDB.findOne({batch: keyword});
  const group = GroupDB.findOne({_id: batch.groupId});
  const groupH = group.hibernate ? "."+group.alias : group.alias;
  const widget = WidgetDB.findOne({_id: batch.widgetId});
  const variant = VariantDB.findOne({versionKey: batch.versionKey});
  const more = widget.describe;
  
  if(labelString) {
    const label = '/print/generallabel/' + keyword +
                  '?group=' + group.alias +
                  '&widget=' + widget.widget +
                  '&ver=' + variant.variant +
                  '&desc=' + more +
                  '&sales=' + batch.salesOrder +
                  '&quant=' + batch.quantity; 
    return label;     
  }else{
    const vNice = `v.${variant.variant}`;
    const nice = [ groupH.toUpperCase(), widget.widget.toUpperCase(), vNice ];
    return [ nice, more ];
  }
}


    
Meteor.methods({
  
  getBasicBatchInfo(keyword) {
    const niceString = whatIsBatch(keyword) || whatIsBatchX(keyword);
    const niceObj = {
      batch: keyword, 
      isWhat: niceString[0],
      more: niceString[1],
    };
    return niceObj;
  },
  
  getBatchPrintLink(keyword) {
    const labelString = whatIsBatch(keyword, true) || whatIsBatchX(keyword, true);
    return labelString;
  },
  
  batchLookup(orb) { // significantly faster than findOne
    const oneBatch = BatchDB.find({ batch: orb },{fields:{'batch':1},limit:1}).count();
    if(oneBatch) {
      return 'trueB';
    }else{
      const onexBatch = XBatchDB.find({ batch: orb },{fields:{'batch':1},limit:1}).count();
      if(onexBatch) {
        return 'trueX';
      }else{
        return false;
      }
    }
  },
  
  serialLookup(orb) {
    const itemsBatch = BatchDB.findOne({'items.serial': orb},{fields:{'batch':1}});
    return itemsBatch ? itemsBatch.batch : false;
  },
  
  serialLookupPartial(orb) {
    const itemsBatch = BatchDB.find({
      "items.serial": { $regex: new RegExp( orb ) }
    },{fields:{'batch':1,'items.serial':1}}).fetch();
    
    const single = itemsBatch.length === 1;
    const exact = !single ? false : 
      itemsBatch[0].items.find( x => x.serial === orb ) ? true : false;
    //const results = Array.from(itemsBatch, x => x.batch);
    const results = [];
    for(let iB of itemsBatch) {
      const describe = whatIsBatch(iB.batch)[0].join(' ');
      
      results.push([ iB.batch, describe ]);
    }
      
    return [ results, exact ];
  },
  
  quickVariant(vKey) {
    const variant = VariantDB.findOne({versionKey: vKey});
    const found = variant.variant;
    return found;
  },
  
      /////////////////////////////////////////////////////////////////////////
    // First Firsts
   ///////////////////////////////////////////////////////////////////////////
  firstFirst(batchId) {
    const b = BatchDB.findOne({_id: batchId, orgKey: Meteor.user().orgKey});
    let first = moment();
    if(!b) { null }else{
      for(let i of b.items) {
        let firstHistory = i.history[0];
        if(!firstHistory || moment(firstHistory.time).isSameOrAfter(first)) {
          null;
        }else{
          first = moment(firstHistory.time);
        }
      }
    }
    return first.tz(Config.clientTZ).format();
  },
  
     /////////////////////////////////////////////////////////////////////////
   // Shortfall Items
  ///////////////////////////////////////////////////////////////////////////
 /*
  fetchShortfalls() {

    const touchedB = BatchDB.find({
      orgKey: Meteor.user().orgKey,
      finishedAt: false,
      shortfall: { $elemMatch: { inEffect: { $ne: true }, reSolve: { $ne: true } } }
    }).fetch();
     
    let sMatch = [];
    
    for(let iB of touchedB) {
      const mShort = iB.shortfall.filter( s => !(s.inEffect || s.reSolve) );
      const describe = whatIsBatch(iB.batch)[0].join(' ');
      
      for(let mS of mShort) {
        const time = moment.tz(mS.cTime, Config.clientTZ).format();
        
        sMatch.push([ 
          iB.batch, iB.salesOrder, what, mS.serial, mS.partNum, mS.refs, time
        ]);
      }
    }
    return sMatch;
  },
  */
   
  fetchShortfallParts() {
    
    let sMatch = [];
    
    BatchDB.find({
      orgKey: Meteor.user().orgKey,
      finishedAt: false,
      shortfall: { $elemMatch: { inEffect: { $ne: true }, reSolve: { $ne: true } } }
    }).forEach( iB => {    // s.inEffect !== true && s.reSolve !== true
      const mShort = iB.shortfall.filter( s => !(s.inEffect || s.reSolve) );
      const describe = whatIsBatch(iB.batch)[0].join(' ');

      if(mShort.length > 0) {
        const unqShort = _.uniq(mShort, false, n=> n.partNum );

        let bsMatch = [];
        for(let mS of unqShort) {
          
          bsMatch.push([
            iB.batch, iB.salesOrder, describe, mS.partNum
          ]);
        }
  	    bsMatch.map((ent, ix)=>{
  	      const same = iB.shortfall.filter( s => s.partNum === ent[3] );
  	      const locations = [].concat(...Array.from(same, sm => sm.refs));
  	      ent.push(_.uniq(locations).join(", "), locations.length);
  	      sMatch.push(ent);
  	    });
      }
    });
    return sMatch;
  },
  
  
    //////////////////////////////////////////////////////////////////////////
   // Scrap Items
  ///////////////////////////////////////////////////////////////////////////
  scrapItems() {
    let compactData = [];
    
    BatchDB.find({
      orgKey: Meteor.user().orgKey,
      'items.history.type': 'scrap'
    }).forEach( b => {
      const w = WidgetDB.findOne({_id: b.widgetId});
      const g = GroupDB.findOne({_id: w.groupId});
      const items = b.items.filter( 
                      x => x.history.find( y => 
                        y.type === 'scrap' && 
                        y.good === true ) );
      for(let i of items) {
        const scEntry = i.history.find( y => 
                          y.type === 'scrap' && 
                          y.good === true );
        compactData.push({
          batch: b.batch,
          widget: w.widget,
          group: g.alias,
          serial: i.serial,
          scEntry: scEntry
        });
      }
    });
    return compactData;
  },
  
    ////////////////////////////////////////////////////////////////////////
   // Test Fail Items
  ////////////////////////////////////////////////////////////////////////////
  testFailItems() {
    let compactData = [];
    
    BatchDB.find({
      orgKey: Meteor.user().orgKey,
      // live: true,
      'items.history.type': 'test',
      'items.history.good': false
    }).forEach( b => {
      const w = WidgetDB.findOne({_id: b.widgetId});
      const g = GroupDB.findOne({_id: w.groupId});
      const items = b.items.filter( x => {
        let fail = x.history.find( y => y.type === 'test' && y.good === false );
        if(fail) {
          let passAfter = x.history.find( y => y.key === fail.key && y.good === true );
          let finished = x.finishedAt !== false;
          if(!passAfter && !finished) {
            return true;
          }else{
            return false;
          }
        }else{
          return false;
        }
      });
      for(let i of items) {
        const tfEntries = i.history.filter( y => 
                            y.type === 'test' && y.good === false );
        compactData.push({
          batch: b.batch,
          widget: w.widget,
          group: g.alias,
          serial: i.serial,
          tfEntries: tfEntries
        });
      }
    });
    return compactData;
  },
  
  
   ///////////////////////////////////////////////////////////////////////////
  // Component Search
  ////////////////////////////////////////////////////////////////////////////
  componentFind(num, batchInfo, unitInfo) {
    const data = [];
    
    VariantDB.find({
      'assembly.component': num
    }).forEach( v => {
      let findG = GroupDB.findOne({ _id: v.groupId });
      let findW = WidgetDB.findOne({ _id: v.widgetId });

      let batches = [];
      if(batchInfo) {
        const findB = BatchDB.find({live: true, versionKey: v.versionKey}).fetch();
        batches = Array.from(findB, x => { 
                    countI = 0;
                    unitInfo ? 
                      x.items.forEach( y => countI += y.units )
                    : null;
                    return {
                      btch: x.batch,
                      cnt: countI
                  } } );
      }else{null}

      data.push({
        grp: findG.alias,
        wdgt: findW.widget,
        vrnt: v.variant,
        dsc: findW.describe,
        btchs: batches,
        places: 1
        //v.assembly.filter( x => x.component === num ).length,
      });
    });
    return data;
  },
  
    /////////////////////////////////////////////////////////////////////////
   // Component Export
  ///////////////////////////////////////////////////////////////////////////
  componentExportAll() {
    const data = [];
    
    VariantDB.find({
      orgKey: Meteor.user().orgKey
    }).forEach( v => {
      for(let a of v.assembly) {
        data.push(a.component);
      }
    });
    const cleanData = [... new Set(data) ].sort();
    return cleanData;
  }

  
});