function reFocus() {
  if(document.visibilityState === 'visible' || document.hasFocus()) {
    const findBox = document.getElementById('lookup');
    findBox ? findBox.focus() : null;
  }else{null}
}

function onPress(event) {
  const element = document.activeElement;
  if(element.id !== 'lookup' && element.id !== 'nestSerial') {
    const inputKey = event.key;
    const inputCode = event.keyCode;
    let scanListener = Session.get('scanListener') || '';
    if( inputKey ) {
      if( inputCode === 13 ) { // "enter"
        const slL = scanListener.length;
        if( slL === 9 || slL === 10 ) {
          Session.set('now', scanListener);
          !event.preventDefault ? null : event.preventDefault();
        }
        scanListener = '';
      }else if( !inputKey.match(/[0-9]/) ) {
        scanListener = '';
      }else if( inputKey.match(/[0-9]/) ) {
        scanListener = scanListener.concat(event.key);
      }
      Session.set('scanListener', scanListener);
    }
  }else{
    null;
  }
}

function onMessage(event) {
  if(event.data.orgin === 'pisces') {
    console.log(event);
    onPress(event.data);
  }else{null}
}

export function ScanListenerUtility(user) {
  window.addEventListener('visibilitychange', reFocus);
  window.addEventListener('focus', reFocus);
  
  Meteor.setTimeout( ()=>{
    const autoScan = user.autoScan;
    autoScan === undefined ? console.log(autoScan) : null;
    if(!autoScan) {
      null;
    }else{
      window.addEventListener('keypress', onPress);
      window.addEventListener('message', onMessage);
    }
  },250);

}

export function ScanListenerOff() {
  window.removeEventListener('visibilitychange', reFocus);
  window.removeEventListener('focus', reFocus);
  window.removeEventListener('keypress', onPress);
  window.removeEventListener('message', onMessage);
  Session.set('scanListener', '');
}