import { Random } from 'meteor/random'
import moment from 'moment';

Meteor.methods({

///////////// CACHES //////////////////
  FORCEcacheUpdate(clientTZ) {
    if(Roles.userIsInRole(Meteor.userId(), 'active')) {
      const key = Meteor.user().orgKey;
      Meteor.call('batchCacheUpdate', key, true);
      Meteor.call('priorityCacheUpdate', key, clientTZ, true);
      Meteor.call('phaseCacheUpdate', key, true);
      Meteor.call('completeCacheUpdate', key, true);
    }
  },
  
  REQUESTcacheUpdate(clientTZ, batchUp, priorityUp, phaseUp, compUp) {
    if(Roles.userIsInRole(Meteor.userId(), 'active')) {
      const key = Meteor.user().orgKey;
      batchUp && Meteor.defer( ()=>{
        Meteor.call('batchCacheUpdate', key, false) });
      priorityUp && Meteor.defer( ()=>{
        Meteor.call('priorityCacheUpdate', key, clientTZ, false) });
      phaseUp && Meteor.defer( ()=>{
        Meteor.call('phaseCacheUpdate', key, false) });
      compUp && Meteor.defer( ()=>{
        Meteor.call('completeCacheUpdate', key, false) });
    }
  },
    
  batchCacheUpdate(accessKey, force) {
    if(typeof accessKey === 'string') {
      const timeOut = moment().subtract(12, 'hours').toISOString();
      const currentCache = CacheDB.findOne({
        orgKey: accessKey, 
        lastUpdated: { $gte: new Date(timeOut) },
        dataName:'batchInfo'});
      
      if(force || !currentCache ) {
        const batches = BatchDB.find({orgKey: accessKey}).fetch();
        const batchesX = XBatchDB.find({orgKey: accessKey}).fetch();
        const slim = [...batches,...batchesX].map( x => {
          return Meteor.call('getBasicBatchInfo', x.batch);
        });
        CacheDB.upsert({orgKey: accessKey, dataName: 'batchInfo'}, {
          $set : { 
            orgKey: accessKey,
            lastUpdated: new Date(),
            dataName: 'batchInfo',
            dataSet: slim,
        }});
      }
    }
  },
  
  priorityCacheUpdate(accessKey, clientTZ, force) {
    if(typeof accessKey === 'string') {
      const timeOut = moment().subtract(15, 'minutes').toISOString();
      const currentCache = CacheDB.findOne({
        orgKey: accessKey, 
        lastUpdated: { $gte: new Date(timeOut) },
        dataName:'priorityRank'});
      
      if(force || !currentCache ) {
        const batches = BatchDB.find({orgKey: accessKey, live: true}).fetch();
        const slim = batches.map( x => {
          return Meteor.call('priorityRank', x._id, clientTZ, accessKey);
        });
        CacheDB.upsert({orgKey: accessKey, dataName: 'priorityRank'}, {
          $set : { 
            orgKey: accessKey,
            lastUpdated: new Date(),
            dataName: 'priorityRank',
            dataSet: slim,
        }});
      }
    }
  },
  
  phaseCacheUpdate(accessKey, force) {
    if(typeof accessKey === 'string') {
      const timeOut = moment().subtract(30, 'minutes').toISOString();
      const currentCache = CacheDB.findOne({
        orgKey: accessKey, 
        lastUpdated: { $gte: new Date(timeOut) },
        dataName:'phaseCondition'});

      if( force || !currentCache ) {
        const batches = BatchDB.find({orgKey: accessKey, live: true}).fetch();
        const batchesX = XBatchDB.find({orgKey: accessKey, live: true}).fetch();
        const slim = [...batches,...batchesX].map( x => {
          return Meteor.call('phaseCondition', x._id, accessKey);
        });
        CacheDB.upsert({orgKey: accessKey, dataName: 'phaseCondition'}, {
          $set : { 
            orgKey: accessKey,
            lastUpdated: new Date(),
            dataName: 'phaseCondition',
            dataSet: slim,
        }});
      }
    }
  },
  
  completeCacheUpdate(accessKey, force) {
    if(typeof accessKey === 'string') {
      const timeOut = moment().subtract(60, 'minutes').toISOString();
      const currentCache = CacheDB.findOne({
        orgKey: accessKey, 
        lastUpdated: { $gte: new Date(timeOut) },
        dataName:'completeBatch'});

      if( force || !currentCache ) {
        const batches = BatchDB.find({orgKey: accessKey, live: false}).fetch();
        const slimL = batches.map( x => {
          return {
            batchNum: x.batch,
            widgetID: x.widgetId,
            versionKey: x.versionKey,
            salesOrder: x.salesOrder,
            salesEnd: x.end,
            completedAt: x.finishedAt,
            quantity: x.items.length,
            serialize: true
          };
        });
        const batchesX = XBatchDB.find({orgKey: accessKey, completed: true}).fetch();
        const slimX = batchesX.map( x => {
          return {
            batchNum: x.batch,
            widgetID: x.widgetId,
            versionKey: x.versionKey,
            salesOrder: x.salesOrder,
            salesEnd: x.salesEnd,
            completedAt: x.completedAt,
            quantity: x.quantity,
            serialize: x.serialize
          };
        });
        const slim = [...slimL,...slimX];
        CacheDB.upsert({orgKey: accessKey, dataName: 'completeBatch'}, {
          $set : { 
            orgKey: accessKey,
            lastUpdated: new Date(),
            dataName: 'completeBatch',
            dataSet: slim,
        }});
      }
    }
  },
  
  
  // a cache for a plain list of all part numbers for autocomplete
  partslistCacheUpdate(accessKey) {
    
    const widgets = WidgetDB.find({orgKey: accessKey, 'versions.live': true}).fetch();
    
    let allParts = [];
    for(let w of widgets) {
      let findV = w.versions.filter( x => x.live === true );
      for(let v of findV) {
        const locations = Array.from(v.assembly, pt => pt.component);
        const parts = [...new Set(locations) ];
        allParts.push(parts);
      }
    }
    
    const allPartsClean = [...new Set(allParts) ];
      
    CacheDB.upsert({orgKey: accessKey, dataName: 'completeBatch'}, {
      $set : {
        orgKey: accessKey,
        lastUpdated: new Date(),
        dataName: 'partslist',
        dataSet: allPartsClean,
    }});
      
            
  }
  
});