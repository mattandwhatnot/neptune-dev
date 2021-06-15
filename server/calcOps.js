import moment from 'moment';

export function sc2mn(seconds) {
  const asMinutes = moment.duration(seconds, "seconds").asMinutes();
  const trunc = ( Math.round(
                   (asMinutes + Number.EPSILON) * 100) 
                      / 100 ).toFixed(2, 10);
  return parseFloat(trunc);
}

export function sc2hr(seconds) {
  const asHours = moment.duration(seconds, "seconds").asHours();
  const trunc = ( Math.round(
                   (asHours + Number.EPSILON) * 100) 
                      / 100 ).toFixed(2, 10);
  return parseFloat(trunc);
}

export function min2hr(minutes) {
  const asHours = moment.duration(minutes, "minutes").asHours();
  const trunc = ( Math.round(
                   (asHours + Number.EPSILON) * 100) 
                      / 100 ).toFixed(2, 10);
  return parseFloat(trunc);
}


export function round1Decimal(thrtytw) {
  const trunc = Math.round((thrtytw + Number.EPSILON) * 10) / 10;
  // exactly rounding to 1 decimal points
  return trunc;
}

export function round2Decimal(thrtytw) {
  const trunc = Math.round((thrtytw + Number.EPSILON) * 100) / 100;
  // exactly rounding to 2 decimal points
  return trunc;
}

export function percentOf(goalNumber, realNumber) {
  const perOf = ( realNumber / goalNumber ) * 100;
  const perOfClean = round2Decimal(perOf);
  return perOfClean;
}

export function avgOfArray(arr, zeros) {
  const cArr = zeros ? arr.filter( f => ( f || f === 0 ) && !isNaN(f) ) :
                       arr.filter( f => f && !isNaN(f) );
                       
  if(cArr.length == 1) {
    return round2Decimal( cArr[0] );
  }else if(cArr.length > 0) {
    const reduced = cArr.reduce( (a,c)=>a+c) / cArr.length;
    const clean = round2Decimal( reduced );
    return clean;
  }else{
    return 0;
  }
}

export function diffTrend(newavg, runningavg) {
  const diff = newavg - runningavg;
  const trend = Math.abs(diff) <= (runningavg * 0.03) ? 'flat' : 
                diff < 0 ? 'down' : 'up';
  return trend;
}