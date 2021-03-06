import moment from 'moment';
import 'moment-timezone';
import 'moment-business-time';

import Config from '/server/hardConfig.js';
import { syncHoliday } from '/server/utility.js';
import { deliveryState, calcShipDay } from '/server/reportCompleted.js';
import { getShipLoad } from '/server/shipOps';

moment.updateLocale('en', {
  workinghours: Config.workingHours,
  shippinghours: Config.shippingHours
});

function shrinkWhole(bData, now, shipLoad, accessKey) {
  return new Promise( (resolve, reject)=> {
    const isWhat = Meteor.call('getBasicBatchInfo', bData.batch);
    
    const oRapid = XRapidsDB.findOne({extendBatch: bData.batch, live: true});
    const rapIs = oRapid ? oRapid.rapid : false;
    
    const quantity = bData.quantity;
    const serialize = bData.serialize;
    const rFlow = bData.river ? true :
                  bData.waterfall && bData.waterfall.length > 0 ? false : 
                  null;
    
    const endDay = rapIs && moment(oRapid.deliverAt).isAfter(bData.salesEnd) ? 
                    oRapid.deliverAt : bData.salesEnd;
      
    const didFinish = bData.completed;
    const whenFinish = didFinish ? bData.completedAt : false;
    
    const shpdlv = didFinish ? deliveryState( bData._id, endDay, whenFinish )
                              // salesEnd, shipAim, didFinish, gapZone
                             : calcShipDay( bData._id, now, endDay );
                              // salesEnd, shipAim, lateLate, shipLate
      
    const salesEnd = shpdlv[0];
    const shipAim = didFinish ? shpdlv[1] : shpdlv[1];
    const completedAt = didFinish ? new Date(shpdlv[2]) : false;
    const gapZone = didFinish ? shpdlv[3] : null;
    const lateLate = didFinish ? gapZone[2] === 'late' : shpdlv[2];
    
    const actvLvl = Meteor.call('tideActivityLevel', bData._id, accessKey);
    const brchCnd = Meteor.call('branchCondition', bData._id, accessKey);
    const prtyRnk = Meteor.call('priorityFast', accessKey, bData, now, shipAim, shipLoad);
    const perfFtr = Meteor.call('performTarget', bData._id);
    
    TraceDB.upsert({batchID: bData._id}, {
      $set : { 
        orgKey: accessKey,
        lastUpserted: new Date(),
        lastUpdated: new Date(),
        batch: bData.batch,
        batchID: bData._id,
        salesOrder: bData.salesOrder,
        isWhat: isWhat.isWhat,
        describe: isWhat.more,
        quantity: Number(quantity),
        serialize: serialize,
        riverChosen: rFlow,
        live: bData.live,
        salesEnd: new Date(salesEnd),
        shipAim: new Date(shipAim),
        completed: didFinish,
        completedAt: completedAt,
        lateLate: lateLate,
        oRapid: rapIs,
        isActive: actvLvl.isActive,
        onFloor: brchCnd.onFloor,
        branchCondition: brchCnd.branchSets,
        quote2tide: prtyRnk.quote2tide,
        estSoonest: prtyRnk.estSoonest,
        bffrRel: prtyRnk.bffrRel,
        estEnd2fillBuffer: prtyRnk.estEnd2fillBuffer,
        overQuote: prtyRnk.overQuote,
        performTgt: perfFtr
    }});
    resolve(true);
  });
}

function checkMinify(bData, accessKey) {
  return new Promise( (resolve)=> {
    const isWhat = Meteor.call('getBasicBatchInfo', bData.batch);
    
    const quantity = bData.quantity;
    const serialize = bData.serialize;
    const rFlow = bData.river ? true :
                  bData.waterfall && bData.waterfall.length > 0 ? false : 
                  null;
                  
    TraceDB.update({batchID: bData._id}, {
      $set : { 
        orgKey: accessKey,
        lastUpserted: new Date(),
        batch: bData.batch,
        salesOrder: bData.salesOrder,
        isWhat: isWhat.isWhat,
        describe: isWhat.more,
        quantity: Number(quantity),
        serialize: serialize,
        riverChosen: rFlow
    }});
    resolve(true);
  });
}

function checkMovement(bData, now, shipLoad, accessKey) {
  return new Promise( (resolve)=> {
    const oRapid = XRapidsDB.findOne({extendBatch: bData.batch, live: true});
    const rapIs = oRapid ? oRapid.rapid : false;
    
    const endDay = rapIs && moment(oRapid.deliverAt).isAfter(bData.salesEnd) ? 
                    oRapid.deliverAt : bData.salesEnd;
                    
    const didFinish = bData.completed;
    const whenFinish = didFinish ? bData.completedAt : false;
                       
    const shpdlv = didFinish ? deliveryState( bData._id, endDay, whenFinish )
                              // salesEnd, shipAim, didFinish, fillZ, shipZ
                             : calcShipDay( bData._id, now, endDay );
                              // salesEnd, shipAim, lateLate, shipLate
      
    const salesEnd = shpdlv[0];
    const shipAim = didFinish ? shpdlv[1] : shpdlv[1];
    const completedAt = didFinish ? new Date(shpdlv[2]) : false;
    const fillZ = didFinish ? shpdlv[3] : null;
    const lateLate = didFinish ? fillZ[2] === 'late' : shpdlv[2];
    
    const prtyRnk = Meteor.call('priorityFast', accessKey, bData, now, shipAim);
    const perfFtr = Meteor.call('performTarget', bData._id);
    
    TraceDB.update({batchID: bData._id}, {
      $set : { 
        lastUpdated: new Date(),
        live: bData.live,
        salesEnd: new Date(salesEnd),
        shipAim: new Date(shipAim),
        completed: didFinish,
        completedAt: completedAt,
        lateLate: lateLate,
        oRapid: rapIs,
        quote2tide: prtyRnk.quote2tide,
        estSoonest: prtyRnk.estSoonest,
        bffrRel: prtyRnk.bffrRel,
        estEnd2fillBuffer: prtyRnk.estEnd2fillBuffer,
        overQuote: prtyRnk.overQuote,
        performTgt: perfFtr
    }});
    resolve(true);
  });
}
function checkNoise(bData, accessKey) {
  return new Promise( (resolve)=> {
    
    const actvLvl = Meteor.call('tideActivityLevel', bData._id, accessKey);
    const brchCnd = Meteor.call('branchCondition', bData._id, accessKey);
    
    TraceDB.update({batchID: bData._id}, {
      $set : { 
        lastUpdated: new Date(),
        live: bData.live,
        isActive: actvLvl.isActive,
        onFloor: brchCnd.onFloor,
        branchCondition: brchCnd.branchSets,
    }});
    resolve(true);
  });
}

Meteor.methods({

  
  rebuildTrace() {
    const accessKey = Meteor.user().orgKey;
    (async ()=> {
      try {
        syncHoliday(accessKey);
        const now = moment().tz(Config.clientTZ);
        
        const fetchX = XBatchDB.find({orgKey: accessKey}).fetch();
        await Promise.all(fetchX.map(async (x) => {
            await shrinkWhole( x, now, accessKey );
        }));
        
        return true;
      }catch (err) {
        throw new Meteor.Error(err);
      }
    })();
  },
  
  cleanupTraceErrors() {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      const allTrace = TraceDB.find({}).fetch();
      for( let t of allTrace ) {
        const docX = XBatchDB.findOne({_id: t.batchID});
        if(!docX) {
           TraceDB.remove({batchID: t.batchID});
        }
      }
      Meteor.call('reMiniOpenTrace');
      return true;
    }else{
      return false;
    }
  },
  
  buildNewTraceX(batchNum, privateKey) {
    const accessKey = privateKey || Meteor.user().orgKey;
    (async ()=> {
      try {
        syncHoliday(accessKey);
        const now = moment().tz(Config.clientTZ);
        const shipLoad = getShipLoad(now);
        
        const batchX = XBatchDB.findOne({batch: batchNum});
                        
        await shrinkWhole( batchX, now, shipLoad, accessKey );
      }catch (err) {
        throw new Meteor.Error(err);
      }
    })();
  },
  
  reMiniOpenTrace(privateKey) {
    const accessKey = privateKey || Meteor.user().orgKey;
    (async ()=> {
      try {
        syncHoliday(accessKey);
        
        const ystrday = ( d => new Date(d.setDate(d.getDate()-1)) )(new Date);
        const lstweek = ( d => new Date(d.setDate(d.getDate()-7)) )(new Date);
        
        const fresh = moment().subtract(12, 'hours').toISOString();
      
        const fetchX = XBatchDB.find({orgKey: accessKey, lock: {$ne: true},
                        $or: [ { live: true }, 
                               { completedAt: { $gte: lstweek } },
                               { salesEnd: { $gte: ystrday } }
                             ]
        }).fetch();
        await Promise.all(fetchX.map(async (x) => {
          const t = TraceDB.find({
              batchID: x._id, 
              lastUpserted: { $gte: new Date(fresh) }
            },{fields:{'batchID':1}},{limit:1}).count();
          if(!t) {
            await checkMinify( x, accessKey );
          }
        }));
        
      }catch (err) {
        throw new Meteor.Error(err);
      }
    })();
  },
  
  rebuildOneTrace(bID, privateKey) {
    const accessKey = privateKey || Meteor.user().orgKey;
    (async ()=> {
      try {
        syncHoliday(accessKey);
        const now = moment().tz(Config.clientTZ);
        const shipLoad = getShipLoad(now);
        
        const batchBX = XBatchDB.findOne({_id: bID});
                        
        await shrinkWhole( batchBX, now, shipLoad, accessKey );
      }catch (err) {
        throw new Meteor.Error(err);
      }
    })();
  },
  
  updateOneMinify(bID, privateKey) {
    const accessKey = privateKey || Meteor.user().orgKey;
    (async ()=> {
      try {
        syncHoliday(accessKey);
        
        const batchBX = XBatchDB.findOne({_id: bID});
                        
        await checkMinify( batchBX, accessKey );
      }catch (err) {
        throw new Meteor.Error(err);
      }
    })();
  },
  
  updateOneMovement(bID, privateKey) {
    const accessKey = privateKey || Meteor.user().orgKey;
    (async ()=> {
      try {
        syncHoliday(accessKey);
        const now = moment().tz(Config.clientTZ);
        const shipLoad = getShipLoad(now);
        
        const batchBX = XBatchDB.findOne({_id: bID});
        
        await checkMovement( batchBX, now, shipLoad, accessKey );
      }catch (err) {
        throw new Meteor.Error(err);
      }
    })();
  },
  
  
  updateLiveMovement(privateKey) {
    (async ()=> {
      const accessKey = privateKey || Meteor.user().orgKey;
      try {
        syncHoliday(accessKey);
        const now = moment().tz(Config.clientTZ);
        const shipLoad = getShipLoad(now);
        
        const ystrday = ( d => new Date(d.setDate(d.getDate()-1)) )(new Date);
        const lstweek = ( d => new Date(d.setDate(d.getDate()-7)) )(new Date);
        const fresh = moment().subtract(10, 'minutes').toISOString();
      
        const fetchX = XBatchDB.find({orgKey: accessKey, lock: {$ne: true},
                        $or: [ { live: true }, 
                               { completedAt: { $gte: lstweek } },
                               { salesEnd: { $gte: ystrday } }
                             ]
        }).fetch();
        await Promise.all(fetchX.map(async (x) => {
          const t = TraceDB.find({
              batchID: x._id, 
              lastUpdated: { $gte: new Date(fresh) }
            },{fields:{'batchID':1},limit:1}).count();
          if(!t) {
            await checkMovement( x, now, shipLoad, accessKey );
          }
        }));
      }catch (err) {
        throw new Meteor.Error(err);
      }
    })();
  },
  
  updateLiveNoise(privateKey) {
    (async ()=> {
      const accessKey = privateKey || Meteor.user().orgKey;
      try {
        const ystrday = ( d => new Date(d.setDate(d.getDate()-1)) )(new Date);
        const lstweek = ( d => new Date(d.setDate(d.getDate()-7)) )(new Date);
        const hot = moment().subtract(10, 'minutes').toISOString();
      
        const fetchX = XBatchDB.find({orgKey: accessKey, lock: {$ne: true},
                        $or: [ { live: true }, 
                               { completedAt: { $gte: lstweek } },
                               { salesEnd: { $gte: ystrday } }
                             ]
        }).fetch();
        await Promise.all(fetchX.map(async (x) => {
          const t = TraceDB.find({
              batchID: x._id, 
              lastUpdated: { $gte: new Date(hot) }
            },{fields:{'batchID':1},limit:1}).count();
          if(!t) {
            await checkNoise( x, accessKey );
          }
        }));
      }catch (err) {
        throw new Meteor.Error(err);
      }
    })();
  }
  
  
  
});