// import moment from 'moment';
// Collections \\

AppDB = new Mongo.Collection('appdb');
GroupDB = new Mongo.Collection('groupdb');
WidgetDB = new Mongo.Collection('widgetdb');
VariantDB = new Mongo.Collection('variantdb');
BatchDB = new Mongo.Collection('batchdb');
XBatchDB = new Mongo.Collection('xbatchdb');
//ItemDB = new Mongo.Collection('itemdb');// future plans, DO NOT enable
ArchiveDB = new Mongo.Collection('archivedb');

CacheDB = new Mongo.Collection('cachedb');


import { batchCacheUpdate } from './cacheMethods.js';

import { branchConCacheUpdate } from './cacheMethods.js';


Meteor.publish('loginData', function(){
  const user = Meteor.users.findOne({_id: this.userId});
  const orgKey = user ? user.orgKey : false;
  if(this.userId && orgKey){
    return [
      Meteor.users.find({_id: this.userId},
        {fields: {
          'username': 1,
        }}),
      AppDB.find({orgKey: orgKey}, 
        {fields: { 
          'timeClock': 1
        }}),
      ];
  }else{
    return this.ready();
  }
});

Meteor.publish('appData', function(){
  const user = Meteor.users.findOne({_id: this.userId});
  const orgKey = user ? user.orgKey : false;
  if(!this.userId){
    return this.ready();
  }else if(!orgKey) {
    return [
      Meteor.users.find({_id: this.userId},
        {fields: {
          'services': 0,
          'orgKey': 0,
        }}),
      ];
  }else if(user) {
    return [
      Meteor.users.find({_id: this.userId},
        {fields: {
          'services': 0,
          'orgKey': 0
        }}),
      AppDB.find({orgKey: orgKey}, 
        {fields: { 
          'orgKey': 0,
          'orgPIN': 0,
          'minorPIN': 0,
          'phases': 0,
          'toolOption': 0
        }}),
      ];
  }else{
    return this.ready();
  }
});

Meteor.publish('usersData', function(){
  const user = Meteor.users.findOne({_id: this.userId});
  const orgKey = user ? user.orgKey : false;
  const admin = Roles.userIsInRole(this.userId, 'admin');
  if(!this.userId){
    return this.ready();
  }else if(admin) {
    return [
      Meteor.users.find({},
        {fields: {
          'services': 0,
          'orgKey': 0,
          'usageLog': 0,
          'watchlist': 0,
          'inbox': 0,
          'breadcrumbs': 0
        }}),
      ];
  }else if(user && orgKey) {
    return [
      Meteor.users.find({orgKey: orgKey},
        {fields: {
          'username': 1,
          'org': 1,
          'roles': 1,
          'engaged': 1,
          'proTimeShare' : 1
        }}),
      ];
  }else{null}
});

Meteor.publish('usersDataDebug', function(){
  const user = Meteor.users.findOne({_id: this.userId});
  const orgKey = user ? user.orgKey : false;
  const admin = Roles.userIsInRole(this.userId, 'admin');
  if(!this.userId || !admin){
    return this.ready();
  }else{
    return [
      Meteor.users.find({ orgKey: orgKey, roles: { $in: ["debug"] } },
        {fields: {
          'services': 1,
          'usageLog': 1,
          'watchlist': 1,
          'inbox': 1,
          'breadcrumbs': 1,
          'engaged': 1
        }}),
      ];
  }
});

// Calendar
Meteor.publish('eventsData', function(){
  const user = Meteor.users.findOne({_id: this.userId});
  const orgKey = user ? user.orgKey : false;
  // Meteor.defer( ()=>{ Meteor.call('batchCacheUpdate', orgKey); });
  Meteor.defer( ()=>{ batchCacheUpdate(orgKey); });
  if(!this.userId){
    return this.ready();
  }else{
    return [
      BatchDB.find({orgKey: orgKey, events: { $exists: true } }, {
        fields: {
          'batch': 1,
          'events': 1,
        }}),
      CacheDB.find({orgKey: orgKey}, {
        fields: {
          'orgKey': 0
        }}),
    ];
  }
});

Meteor.publish('tideData', function(clientTZ){
  const user = Meteor.users.findOne({_id: this.userId});
  const orgKey = user ? user.orgKey : false;
  // Meteor.defer( ()=>{ Meteor.call('batchCacheUpdate', orgKey); });
  Meteor.defer( ()=>{ batchCacheUpdate(orgKey); });
  Meteor.defer( ()=>{ Meteor.call('priorityCacheUpdate', orgKey, clientTZ); });
  // Meteor.defer( ()=>{ branchConCacheUpdate(orgKey) });
  if(!this.userId){
    return this.ready();
  }else{
    return [
      BatchDB.find({orgKey: orgKey, tide: { $exists: true } }, {
        fields: {
          'batch': 1,
          'tide': 1
        }}),
      CacheDB.find({orgKey: orgKey, assembled: true}, {
        fields: {
          'orgKey': 0
        }}),
    ];
  }
});

// Overview & Agenda
Meteor.publish('cacheData', function(clientTZ){
  const user = Meteor.users.findOne({_id: this.userId});
  const orgKey = user ? user.orgKey : false;
  // Meteor.defer( ()=>{ Meteor.call('batchCacheUpdate', orgKey); });
  Meteor.defer( ()=>{ batchCacheUpdate(orgKey); });
  Meteor.defer( ()=>{ Meteor.call('priorityCacheUpdate', orgKey, clientTZ); });
  Meteor.defer( ()=>{ Meteor.call('activityCacheUpdate', orgKey, clientTZ); });
  Meteor.defer( ()=>{ branchConCacheUpdate(orgKey) });
  Meteor.defer( ()=>{ Meteor.call('completeCacheUpdate', orgKey, clientTZ); });
  if(!this.userId){
    return this.ready();
  }else{
    return [
      CacheDB.find({orgKey: orgKey, assembled: true}, {
        fields: {
          'orgKey': 0,
          'assembled' : 0,
          'minified': 0
        }}),
      ];
    }
});

// Parts
Meteor.publish('partsCacheData', function(){
  const user = Meteor.users.findOne({_id: this.userId});
  const orgKey = user ? user.orgKey : false;
  // Meteor.defer( ()=>{ Meteor.call('batchCacheUpdate', orgKey); });
  Meteor.defer( ()=>{ batchCacheUpdate(orgKey); });
  // Meteor.defer( ()=>{ Meteor.call('partslistCacheUpdate', orgKey); });
  if(!this.userId){
    return this.ready();
  }else{
    return [
      CacheDB.find({orgKey: orgKey, minified: true}, {
        fields: {
          'orgKey': 0,
          'assembled' : 0,
          'minified': 0
        }}),
      ];
    }
});

// Overview
Meteor.publish('shaddowData', function(clientTZ){
  const user = Meteor.users.findOne({_id: this.userId});
  const orgKey = user ? user.orgKey : false;
  if(!this.userId){
    return this.ready();
  }else{
    return [
      BatchDB.find({orgKey: orgKey, live: true}, {
        sort: {batch:-1},
        fields: {
          'batch': 1,
          //'widgetId': 1,
          //'versionKey': 1,
          'live': 1,
          'finishedAt': 1,
          'salesOrder': 1,
          'end': 1,
          'releases': 1
        }}),
      XBatchDB.find({orgKey: orgKey, live: true}, {
        sort: {batch:-1},
        fields: {
          'batch': 1,
          //'groupId': 1,
          //'widgetId': 1,
          //'versionKey': 1,
          'live': 1,
          'salesOrder': 1,
          'salesEnd': 1,
          'completed': 1,
          //'completedAt': 1,
          'releases': 1
        }})
      ];
    }
});

// production
Meteor.publish('thinData', function(){
  const user = Meteor.users.findOne({_id: this.userId});
  const orgKey = user ? user.orgKey : false;
  if(!this.userId){
    return this.ready();
  }else{
    return [
      GroupDB.find({orgKey: orgKey}, {
        fields: {
          'group': 1,
          'alias': 1,
          'wiki' : 1
        }}),
      
      WidgetDB.find({orgKey: orgKey}, {
        fields: {
          'widget': 1,
          'describe': 1,
          'groupId': 1,
        }}),
        
      VariantDB.find({orgKey: orgKey}, {
        fields: {
          'groupId': 1,
          'widgetId': 1,
          'versionKey': 1,
          'variant': 1
        }}),
      
      BatchDB.find({orgKey: orgKey}, {
        sort: {batch:-1},
        fields: {
          'batch': 1,
          'widgetId': 1,
          'versionKey': 1,
          'live': 1,
          'finishedAt': 1,
        }}),
          
      XBatchDB.find({orgKey: orgKey}, {
        sort: {batch:-1},
        fields: {
          'batch': 1,
          'groupId': 1,
          'widgetId': 1,
          'versionKey': 1,
          'live': 1,
          'completed': 1,
          'completedAt': 1,
        }})
      ];
  }
});

Meteor.publish('hotDataPlus', function(batch){
  const user = Meteor.users.findOne({_id: this.userId});
  const valid = user ? true : false;
  const orgKey = valid ? user.orgKey : false;
  const bData = BatchDB.findOne({batch: batch, orgKey: orgKey});
  const xbData = XBatchDB.findOne({batch: batch, orgKey: orgKey});
  const wID = !bData ? !xbData ? false : xbData.widgetId : bData.widgetId;
  if(!this.userId){
    return this.ready();
  }else{
    return [
      BatchDB.find({batch: batch, orgKey: orgKey}, {
        fields: {
          'orgKey': 0,
          'shareKey': 0,
          'events': 0,
          'floorRelease': 0
        }}),
      XBatchDB.find({batch: batch, orgKey: orgKey}, {
        fields: {
          'orgKey': 0,
          'shareKey': 0
        }}),
      WidgetDB.find({_id: wID, orgKey: orgKey}, {
        fields: {
          'orgKey': 0,
          'versions': 0
        }}),
      VariantDB.find({widgetId: wID, orgKey: orgKey}, {
        fields: {
          'orgKey': 0
        }})
    ];
  }
});

// Explore
Meteor.publish('skinnyData', function(clientTZ){
  const user = Meteor.users.findOne({_id: this.userId});
  const orgKey = user ? user.orgKey : false;
  // Meteor.defer( ()=>{ Meteor.call('batchCacheUpdate', orgKey); });
  // Meteor.defer( ()=>{ Meteor.call('priorityCacheUpdate', orgKey, clientTZ); });
  // Meteor.defer( ()=>{ branchConCacheUpdate(orgKey) });
  if(!this.userId){
    return this.ready();
  }else{
    return [
      GroupDB.find({orgKey: orgKey}, {
        fields: {
          'group': 1,
          'alias': 1
          // 'orgKey': 0,
          // 'shareKey': 0,
        }}),
      WidgetDB.find({orgKey: orgKey}, {
        fields: {
          'widget': 1,
          'describe': 1,
          'groupId': 1,
        }}),
        
      VariantDB.find({orgKey: orgKey}, {
        fields: {
          'groupId': 1,
          'widgetId': 1,
          'versionKey': 1,
          'variant': 1
        }}),
      
      BatchDB.find({orgKey: orgKey}, {
        sort: {batch:-1},
        fields: {
            'batch': 1,
            'widgetId': 1,
            'versionKey': 1,
            'tags': 1,
            'live': 1,
            'salesOrder': 1,
            'finishedAt': 1,
          }}),
    
      XBatchDB.find({orgKey: orgKey}, {
        sort: {batch:-1},
        fields: {
            'batch': 1,
            'groupId': 1,
            'widgetId': 1,
            'versionKey': 1,
            'tags': 1,
            'live': 1,
            'salesOrder': 1,
            'completed': 1,
            'completedAt': 1
          }}),
          
      // CacheDB.find({orgKey: orgKey}, {
      //   fields: {
      //     'orgKey': 0
      // }}),
      ];
    }
});

Meteor.publish('hotDataEx', function(dataRequest, hotWidget){
  const user = Meteor.users.findOne({_id: this.userId});
  const orgKey = user ? user.orgKey : false;
  
  let hothotID = false;
  let hothotWidget = hotWidget || false;
  
  if(!hothotWidget) {
    const hotBatchXBatch = BatchDB.findOne({ batch: dataRequest }) ||
                           XBatchDB.findOne({ batch: dataRequest });
    if(hotBatchXBatch) {
      const maybe = WidgetDB.findOne({ _id: hotBatchXBatch.widgetId });
      if(maybe) {
        hothotID = maybe._id;
        hothotWidget = maybe.widget;
      }
    }
  }else{
    const otherwise = WidgetDB.findOne({ widget: hotWidget });
    if(otherwise) {
      hothotID = otherwise._id;
    }
  }
                    
  if(!this.userId){
    return this.ready();
  }else{
    if( dataRequest === 'groups' ) {
      return [
        GroupDB.find({orgKey: orgKey}, {
          fields: {
            'orgKey': 0,
            'shareKey': 0,
        }}),
        WidgetDB.find({orgKey: orgKey}, {
          fields: {
            'createdAt': 1
        }}),
        VariantDB.find({orgKey: orgKey}, {
          fields: {
            'createdAt': 1
        }}),
      ];
    }else {
      return [
        WidgetDB.find({widget: hothotWidget, orgKey: orgKey}, {
          fields: {
            'orgKey': 0,
            'versions': 0
          }}),
        VariantDB.find({widgetId: hothotID, orgKey: orgKey}, {
          fields: {
            'orgKey': 0,
          }}),
        BatchDB.find({batch: dataRequest, orgKey: orgKey}, {
          fields: {
            'orgKey': 0,
            'shareKey': 0,
            'floorRelease': 0
          }}),
        XBatchDB.find({batch: dataRequest, orgKey: orgKey}, {
          fields: {
            'orgKey': 0,
            'shareKey': 0
        }})
      ];
    }
  }
});
  
