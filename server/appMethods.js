import moment from 'moment';

Meteor.startup(function () {  
  // ensureIndex is depreciated 
  // but the new createIndex errors as "not a function"
  XBatchDB._ensureIndex({ batch : 1 }, { unique: true });
  BatchDB._ensureIndex({ batch : 1, 'items.serial' : 1 }, { unique: true });
  GroupDB._ensureIndex({ group : 1 }, { unique: true });
  WidgetDB._ensureIndex({ widget : 1, 'versions.version' : 1 }, { unique: true });
  CacheDB._ensureIndex({ dataName : 1 }, { unique: true });
});

Meteor.methods({
  /*
  addFirstSetting() {
    const orgKey = new Meteor.Collection.ObjectID().valueOf();
    AppDB.insert({
      org: 'crew',
      orgKey: orgKey,
      orgPIN: '0000',
      minorPIN: '000',
      createdAt: new Date(),
      phases: [],
      toolOption: [],
      trackOption: [],
      lastTrack: {
        key: 'f1n15h1t3m5t3p',
        step: 'finish',
        type: 'finish',
        phase: 'finish',
        how: 'finish'
      },
      countOption: [],
      nonConOption: [],
      nonConOptionA: [],
      nonConOptionB: [],
      ncScale: {
        low: Number(5),
        high: Number(10),
        max: Number(25)
      },
      missingType: 'missing',
      ancillaryOption: [],
      tagOption: [],
      instruct: '',
      helpDocs: '',
      timeClock: '',
      latestSerial: {
        nineDigit: Number(123456789),
        tenDigit: Number(1234567890)
      },
      ndaMode: false
    });
    Meteor.users.update(Meteor.userId(), {
      $set: {
        org: 'crew',
        orgKey: orgKey
      }
    });
    Roles.addUsersToRoles(Meteor.userId(), ['active', 'admin']);
    return true;
  },
  */
// Clearly this is not secure.
// The use case of this software is to be used by a single organization,
// hosted and made available internaly.
// In this context, the intention of a PIN is to promt behavior.
// To encourage an interaction between the new user and the org's admin
  setPin(oldPIN, newPIN) {
    const adminPower = Roles.userIsInRole(Meteor.userId(), 'admin');
    const org = AppDB.findOne({ orgKey: Meteor.user().orgKey });
    const orgPIN = org ? org.orgPIN : false;
    if(adminPower) {
      if(!orgPIN || orgPIN === false || orgPIN === oldPIN) {
        AppDB.update({orgKey: Meteor.user().orgKey}, {
          $set : { 
            orgPIN : newPIN
        }});
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  },
  revealPIN(passCode) {
    const adminPower = Roles.userIsInRole(Meteor.userId(), 'admin');
    const org = AppDB.findOne({ orgKey: Meteor.user().orgKey });
    const orgPIN = org ? org.orgPIN : false;
    if(adminPower) {
      const backdoor = "People don't appreciate the substance of things. Objects in space.";
      if(passCode === backdoor) {
        return [true, orgPIN];
      }else{
        return [false, 'no'];
      }
    }else{
      return [false, 'no'];
    }
  },
  // // // // // // // // //
  setMinorPin(newPIN) {
    const adminPower = Roles.userIsInRole(Meteor.userId(), 'admin');
    if(adminPower) {
      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $set : { 
          minorPIN : newPIN
      }});
      return true;
    }else{
      return false;
    }
  },
  
  addTrackStepOption(step, type, phase) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $push : { 
          trackOption : { 
            'key' : new Meteor.Collection.ObjectID().valueOf(),
            'step' : step,
            'type' : type,
            'phase' : phase,
            'how' : false
          }
      }});
      return true;
    }else{
      return false;
    }
  },
  
  editTrackStepOption(opKey, step, type, phase) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey, 'trackOption.key' : opKey}, {
        $set : { 
          'trackOption.$.step' : step,
          'trackOption.$.type' : type,
          'trackOption.$.phase' : phase,
          }
      });
      return true;
    }else{
      return false;
    }
  },
  
  endTrack(flatLast) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      
      const split = flatLast.split('|');
      const step = split[0];
      const type = split[1];
      const how = split[2];
      const trackObj = 
      { 
        'key' : 'f1n15h1t3m5t3p',
        'step' : step,
        'type' : type,
        'phase' : 'finish',
        'how' : how
      };
      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $set : { 
          lastTrack : trackObj
      }});
      return true;
    }else{
      return false;
    }
  },
  
  addCountOption(flatOp) {
    const split = flatOp.split('|');
    const gate = split[0];
    const type = split[1];
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $push : { 
          countOption : { 
            key : new Meteor.Collection.ObjectID().valueOf(),
            gate : gate,
            type : type
          }
      }});
      return true;
    }else{
      return false;
    }
  },
  
// set last serial
  setlastestSerial(serialNine, serialTen) {
    const auth = Roles.userIsInRole(Meteor.userId(), 'admin');
    const validNums = !isNaN(serialNine) && !isNaN(serialTen) ? true : false;
    const validN = serialNine.length === 9;
    const validT = serialTen.length === 10;
    if(auth && validNums && validN && validT) {
      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $set : { 
          'latestSerial.nineDigit': Number(serialNine),
          'latestSerial.tenDigit': Number(serialTen)
      }});
      return true;
    }else{
      return false;
    }
  },
  
  // new tool option
  addToolOp(title, forStep) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {

      const doc = AppDB.findOne({orgKey: Meteor.user().orgKey});
      if(doc.toolOption.find( x => x.title === title )) {
        AppDB.update({orgKey: Meteor.user().orgKey, 'toolOption.title': title}, {
          $pull : {
            toolOption: { title: title }
        }});
      }else{null}

      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $push : { 
          toolOption : {
            title: title,
            forSteps: forStep
          }
      }});
      return true;
    }else{
      return false;
    }
  },
  
////// Repeat First / Verify Reason
  addRepeatOption(reason) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $push : { 
          repeatOption : { 
            key : new Meteor.Collection.ObjectID().valueOf(),
            reason : reason,
            live : true
          }
      }});
      return true;
    }else{
      return false;
    }
  },
  dormantRepeatOption(key, make) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey, 'repeatOption.key': key}, {
        $set : { 
          'repeatOption.$.live' : make
      }});
      return true;
    }else{
      return false;
    }
  },
  removeRepeatOption(badKey, reason) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      //const usedLegacy = BatchDB.findOne({orgKey: Meteor.user().orgKey, 'nonCon.type': reason});
      const usedX = XBatchDB.findOne({orgKey: Meteor.user().orgKey, 'verifications.change': reason});
      if(!usedX) {
        AppDB.update({orgKey: Meteor.user().orgKey}, {
          $pull : { 
            repeatOption : { key : badKey }
        }});
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  },
  ////////////
  
// NonCon Types
  addNCOption(value) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $push : { 
          nonConOption : value
      }});
      return true;
    }else{
      return false;
    }
  },
  
  removeNCOption(value) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      const used = BatchDB.findOne({orgKey: Meteor.user().orgKey, 'nonCon.type': value});
      if(!used) {
        AppDB.update({orgKey: Meteor.user().orgKey}, {
          $pull : { 
            nonConOption : value
        }});
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  },
  
  // Smarter NonCon Types
  addPrimaryNCOption(defect) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $push : { 
          nonConOptionA : { 
            key : new Meteor.Collection.ObjectID().valueOf(),
            defect : defect,
            live : true
          }
      }});
      return true;
    }else{
      return false;
    }
  },
  dormantPrimaryNCOption(key, make) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey, 'nonConOptionA.key': key}, {
        $set : { 
          'nonConOptionA.$.live' : make
      }});
      return true;
    }else{
      return false;
    }
  },
  removePrimaryNCOption(badKey, defect) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      const usedLegacy = BatchDB.findOne({orgKey: Meteor.user().orgKey, 'nonCon.type': defect});
      const usedX = XBatchDB.findOne({orgKey: Meteor.user().orgKey, 'nonconformaces.type': defect});
      if(!usedLegacy && !usedX) {
        AppDB.update({orgKey: Meteor.user().orgKey}, {
          $pull : { 
            nonConOptionA : { key : badKey }
        }});
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  },
  
  // secondary noncon options
  addSecondaryNCOption(defect) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $push : { 
          nonConOptionB : { 
            key : new Meteor.Collection.ObjectID().valueOf(),
            defect : defect,
            live : true
          }
      }});
      return true;
    }else{
      return false;
    }
  },
  dormantSecondaryNCOption(key, make) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey, 'nonConOptionB.key': key}, {
        $set : { 
          'nonConOptionB.$.live' : make
      }});
      return true;
    }else{
      return false;
    }
  },
  removeSecondaryNCOption(badKey, defect) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      const usedLegacy = BatchDB.findOne({orgKey: Meteor.user().orgKey, 'nonCon.type': defect});
      const usedX = XBatchDB.findOne({orgKey: Meteor.user().orgKey, 'nonconformaces.type': defect});
      if(!usedLegacy && !usedX) {
        AppDB.update({orgKey: Meteor.user().orgKey}, {
          $pull : { 
            nonConOptionB : { key : badKey }
        }});
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  },
  
  addNCScale(low, high, max) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $set : { 
          ncScale : {
            low: Number(low),
            high : Number(high),
            max : Number(max)
          }
      }});
      return true;
    }else{
      return false;
    }
  },
  
  addMissingType(newType) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $set : { 
          missingType : newType || 'missing'
      }});
      return true;
    }else{
      return false;
    }
  },
  
  addAncOp(value) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $push : { 
          ancillaryOption : value
      }});
      return true;
    }else{
      return false;
    }
  },
    
  removeAncOption(value) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      const used = BatchDB.findOne({orgKey: Meteor.user().orgKey, 'nonCon.where': value});
      if(!used) {
        AppDB.update({orgKey: Meteor.user().orgKey}, {
          $pull : { 
            ancillaryOption : value
        }});
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  },
  
  addTagOp(value) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $push : { 
          tagOption : value
      }});
      return true;
    }else{
      return false;
    }
  },
  
  setHelpDocs(go) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $set : { 
          helpDocs : go
      }});
      return true;
    }else{
      return false;
    }
  },
  
  setInstruct(go) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $set : { 
          instruct : go
      }});
      return true;
    }else{
      return false;
    }
  },
  
  setTimeClock(go) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $set : { 
          timeClock : go
      }});
      return true;
    }else{
      return false;
    }
  },
  
  sendTestMail(all) {
    if(all) {
      try {
        Meteor.users.update({ orgKey: Meteor.user().orgKey }, {
          $push : { inbox : {
            notifyKey: new Meteor.Collection.ObjectID().valueOf(),
            keyword: 'Sample',
            type: 'test',
            title: 'Sample Notification',
            detail: 'This is a test',
            time: new Date(),
            unread: true
          }
        }},{multi: true});
      }catch (err) {
        throw new Meteor.Error(err);
      }
    }else{
      try {
        Meteor.users.update(Meteor.userId(), {
          $push : { inbox : {
            notifyKey: new Meteor.Collection.ObjectID().valueOf(),
            keyword: 'Sample',
            type: 'test',
            title: 'Sample Notification',
            detail: 'This is a test',
            time: new Date(),
            unread: true
          }
        }});
      }catch (err) {
        throw new Meteor.Error(err);
      }
    }
  },
  
  ///////////// CACHES //////////////////
  FORCEbatchCacheUpdate() {
    if(Roles.userIsInRole(Meteor.userId(), 'active')) {
      const key = Meteor.user().orgKey;
      Meteor.call('batchCacheUpdate', key, true);
    }
  },
    
  batchCacheUpdate(accessKey, force) {
    if(typeof accessKey === 'string') {
      const currentCache = CacheDB.findOne({orgKey: accessKey, dataName:'batchInfo'});
      if(force || !currentCache || (currentCache && moment().isAfter(currentCache.lastUpdated, 'hour')) ) {
        const batches = BatchDB.find({orgKey: accessKey}).fetch();
        const slim = batches.map( x => {
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
  
  ///////////// Repair \\\\\\\\\\\\\\\\\\\\\
  /*
  addPhasesRepair(dprts) {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      AppDB.update({orgKey: Meteor.user().orgKey}, {
        $set : { 
          phases : dprts
      }});
      return true;
    }else{
      return false;
    }
  },
  */
  resetCacheDB() {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      CacheDB.remove({orgKey: Meteor.user().orgKey});
      return true;
    }else{
      return false;
    }
  },
  
  
  repairNonConsDANGEROUS(oldText, newText, exact) {
    if(!Roles.userIsInRole(Meteor.userId(), 'admin')) {
      return false;
    }else{
      const allBatches = BatchDB.find({orgKey: Meteor.user().orgKey}).fetch();
      for(let batch of allBatches) {
        const batchId = batch._id;
        const nonCons = batch.nonCon;
        for(let nc of nonCons) {
          const where = nc.where;
          if(!where) {
            null;
          }else{
            const match = !exact ? where.includes(oldText)
                          : where === oldText;
            if(!match) {
              null;
            }else{
              BatchDB.update({_id: batchId, orgKey: Meteor.user().orgKey, 'nonCon.key': nc.key}, {
          			$set : { 
          			  'nonCon.$.where': newText
          			}
          		});
            }
          }
        }
      }
      return true;
    }
  },
  
  
        
        
});