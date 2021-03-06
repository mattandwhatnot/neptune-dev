import moment from 'moment';
import timezone from 'moment-timezone';
import { Accounts } from 'meteor/accounts-base';
import Config from '/server/hardConfig.js';

Accounts.config({ 
  loginExpirationInDays: Config.loginExpire
});

Accounts.validateLoginAttempt(function(attempt) {
  if(!attempt.user || !Roles.userIsInRole(attempt.user._id, 'active')) {
    attempt.allowed = false;
    throw new Meteor.Error(403, "User account is inactive");
  }
  return true;
});

Accounts.validateNewUser(function(attempt) {
  if(attempt.username.length >= Config.minUsernameChar) {
    return true;
  }else {
    throw new Meteor.Error(403, 'Username must have at least 4 characters');
  }
});

Accounts.onCreateUser((options, user) => {
  const orgName = options.org;
  const orgIs = AppDB.findOne({ org: orgName });
  if(orgIs) {
    const customizedUser = Object.assign({
      org: orgIs.org,
      orgKey: orgIs.orgKey,
      roles: ['active'],
      inbox: [],
      autoScan: true,
      unlockSpeed: 2000,
      usageLog: [],
      proTimeShare: [{
        updatedAt: new Date(),
        timeAsDecimal: Number(1)
      }],
      engaged: false
    }, user);
  
    return customizedUser;
  }
});

Meteor.methods({
  
  verifyOrgJoin(orgName, pin) {
    const orgIs = AppDB.findOne({ org: orgName });
    if(orgIs) {
      if(orgIs.orgPIN === pin) {
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  },
  
  dbblCheckPassword(passVal) {
    const user = Meteor.user();
    
    const result = Accounts._checkPassword(user, passVal);
    
    if(result.error === undefined) {
      return true;
    }else{
      return false;
    }
  },

  adminUpgrade(userId, pin) {
    const org = AppDB.findOne({ orgKey: Meteor.user().orgKey });
    const orgPIN = org ? org.orgPIN : false;
    const others = Meteor.users.find({orgKey: Meteor.user().orgKey, roles: 'admin'}).fetch();
    if(orgPIN && others.length < 2) {
      const auth = orgPIN === pin;
      if(auth) {
        Roles.addUsersToRoles(userId, 'admin');
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  },
  
  adminDowngrade() {
    const others = Meteor.users.find({orgKey: Meteor.user().orgKey, roles: 'admin'}).fetch();
    if(others.length > 1) {
      Roles.removeUsersFromRoles(Meteor.userId(), 'admin');
      return true;
    }else{
      return false;
    }
  },
  
  superUserEnable(userId, role) {
    const admin = Roles.userIsInRole(Meteor.userId(), 'admin');
    const exist = Meteor.users.find({orgKey: Meteor.user().orgKey, roles: role}).fetch();
    const allow = Config.allowedSupers || 1;
    if(admin === true && exist.length < allow ) {
      Roles.addUsersToRoles(userId, role);
      return true;
    }else{
      return false;
    }
  },
  superUserDisable(userId, role) {
    const admin = Roles.userIsInRole(Meteor.userId(), 'admin');
    const isSelf = Meteor.userId() === userId;
    if(admin || isSelf) {
      Roles.removeUsersFromRoles(userId, role);
      return true;
    }else{
      return false;
    }
  },
  
  selfUsernameChange(pass, newUsername) {
    const userId = Meteor.userId();
    const user = Meteor.user();
   
    if(typeof pass === 'string' && typeof newUsername === 'string') {
      const result = Accounts._checkPassword(user, pass);
      if(result.error === undefined) {
        Accounts.setUsername(userId, newUsername);
        return true;
      }else{
        return result.error;
      }
    }else{
      throw new Meteor.Error();
    }
  },

  forcePasswordChange(userId, newPassword) {
    const auth = Roles.userIsInRole(Meteor.userId(), 'admin');
    const team = Meteor.users.findOne({_id: userId, orgKey: Meteor.user().orgKey});
    const admin = Roles.userIsInRole(userId, 'admin');
    const self = Meteor.userId() === userId;
    if(auth && team && !admin && !self) {
      Accounts.setPassword(userId, newPassword, {logout: true});
      return true;
    }else{
      return false;
    }
  },

  deleteUserForever(userId, pin) {
    const auth = Roles.userIsInRole(Meteor.userId(), 'admin');
    const user = Meteor.users.findOne({_id: userId});
    //const orgless = user.orgKey === false;
    const inactive = !Roles.userIsInRole(userId, 'active');
    const admin = Roles.userIsInRole(userId, 'admin');
    const self = Meteor.userId() === userId;
    
    const org = AppDB.findOne({ orgKey: Meteor.user().orgKey });
    const orgPIN = org ? org.orgPIN : null;
    const dbblCheck = orgPIN === pin;

    if(user && auth && inactive && !admin && !self && dbblCheck) {
      Meteor.users.remove(userId);
      return true;
    }else{
      return false;
    }
  },
  
  // emailRemove(email) {
  // Accounts.removeEmail(Meteor.userId(), email)
  
  // emailSet(newEmail) {
  // Accounts.addEmail(Meteor.userId(), newEmail)
  
  permissionSet(user, role) {
    const dev = Roles.userIsInRole(Meteor.userId(), 'devMaster');
    const auth = Roles.userIsInRole(Meteor.userId(), 'admin');
    const open = role !== 'peopleSuper';
    const team = Meteor.users.findOne({_id: user, orgKey: Meteor.user().orgKey});
    if(open && ( dev || auth && team )) {
      Roles.addUsersToRoles(user, role);
      return true;
    }else{
      return false;
    }
  },
  
  permissionUnset(user, role) {
    const dev = Roles.userIsInRole(Meteor.userId(), 'devMaster');
    const auth = Roles.userIsInRole(Meteor.userId(), 'admin');
    const open = role !== 'peopleSuper';
    const team = Meteor.users.findOne({_id: user, orgKey: Meteor.user().orgKey});
    if(role === 'active' && user === Meteor.userId()) {
      return false;
    }else if(open && ( dev || auth && team )) {
      Roles.removeUsersFromRoles(user, role);
      return true;
    }else{
      return false;
    }
  },
  
  setAutoScan(value) {
    const curr = Meteor.user().autoScan;
    const change = value === undefined ? !curr ? true : false : value;
    Meteor.users.update(Meteor.userId(), {
      $set: {
        autoScan: change,
      }
    });
  },
  
  setSpeed(time) {
    let setTime = !time ? 2000 : time;
    Meteor.users.update(Meteor.userId(), {
      $set: {
        unlockSpeed: Number(setTime),
      }
    });
    return true;
  },
  
  setUserNCcodes() {
    const curr = Meteor.user().showNCcodes;
    const change = !curr ? true : false;
    Meteor.users.update(Meteor.userId(), {
      $set: {
        showNCcodes: change,
      }
    });
  },
  
  setUserNCselection() {
    const curr = Meteor.user().typeNCselection;
    const change = !curr ? true : false;
    Meteor.users.update(Meteor.userId(), {
      $set: {
        typeNCselection: change,
      }
    });
  },
  
  setUserAutoscrollI() {
    const curr = Meteor.user().scrollInstruct;
    const change = !curr ? true : false;
    Meteor.users.update(Meteor.userId(), {
      $set: {
        scrollInstruct: change,
      }
    });
  },
  
  setUserMiniPrefer() {
    const curr = Meteor.user().miniAction;
    const change = !curr ? true : false;
    Meteor.users.update(Meteor.userId(), {
      $set: {
        miniAction: change,
      }
    });
  },
  
  setUserLightPrefer() {
    const curr = Meteor.user().preferLight;
    const change = !curr ? true : false;
    Meteor.users.update(Meteor.userId(), {
      $set: {
        preferLight: change,
      }
    });
  },
  
  setDefaultOverview(option) {
    let setOp = !option || option === 'false' ? false : option;
    Meteor.users.update(Meteor.userId(), {
      $set: {
        defaultOverview: setOp,
      }
    });
    return true;
  },
  
  updateProductionPercent(option, userID) {
    
    Meteor.users.update(userID, {
      $push : { 
        'proTimeShare': {
          $each: [ {
            updatedAt: new Date(),
            timeAsDecimal: Number(option)
          } ],
          $position: 0
        }
      }
    });
    return true;
  },
  
  setNotifyAsRead(nKey, read) {
    const change = !read;
    Meteor.users.update({_id: Meteor.userId(), 'inbox.notifyKey': nKey}, {
      $set: {
        'inbox.$.unread': change,
      }
    });
  },
  setReadToast(uID, nKey) {
    Meteor.users.update({_id: uID, 'inbox.notifyKey': nKey}, {
      $set: {
        'inbox.$.unread': false,
      }
    });
  },
  removeNotify(nKey) {
    Meteor.users.update(Meteor.userId(), {
      $pull : {
        inbox: {notifyKey: nKey}
      }
    });
  },
  		
  clearBreadcrumbsRepair() {
    Meteor.users.update(Meteor.userId(), {
      $set: {
        breadcrumbs: [],
      }
    });
    return true;
  },
  
  clearNonDebugUserUsageLogs() {
    if(Roles.userIsInRole(Meteor.userId(), 'admin')) {
      Meteor.users.update({ roles: { $not: { $in: ["debug"] } } }, {
        $set: {
          usageLog: [],
          breadcrumbs: []
        },
      },{multi: true});
      return true;
    }
  },
  
  logReactError(sessionID, errorType, info) {
    try {
      if(Roles.userIsInRole(Meteor.userId(), 'debug')) {
        const time = moment().format();
        const logString = `Error, Type: ${errorType}, ${time}, 
                            username: ${Meteor.user().username} 
                              session: ${sessionID}, ${info}`;
        Meteor.users.update(Meteor.userId(), {
          $push: {
            usageLog: logString,
          }
        });
      }
    }catch (err) {
      throw new Meteor.Error(err);
    }
  },
  
  sendUserDM(userID, title, message) {
    const mssgTitle = title || '';
    const mssgDetail = message || '';
    try {
      Meteor.users.update(userID, {
        $push : { inbox : {
          notifyKey: new Meteor.Collection.ObjectID().valueOf(),
          keyword: 'direct',
          type: 'direct',
          title: mssgTitle,
          detail: mssgDetail,
          time: new Date(),
          unread: true
        }
      }});
    }catch (err) {
      throw new Meteor.Error(err);
    }
  }
  
    
});