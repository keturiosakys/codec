// Takes datetime object created on local machine with time offset
// returns datetime object in UTC time when read by same local machine
export function localtoUTCdatetimeobj(datetimeobj) {
    let userTimezoneOffset = datetimeobj.getTimezoneOffset() * 60000;
    return new Date(datetimeobj.getTime() - userTimezoneOffset);
}
