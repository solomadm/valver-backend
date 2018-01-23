const moment = require('moment');
const DATE_FORMATS = require('../../../config/datetime-formats');
const env = require('../../../config/env');
const { setErrorWithStatusCode } = require('../global-helper');

function getSOExpirationTime(expTime)
{
    if(!expTime)
        return moment.utc().add(24,'h').format(DATE_FORMATS.DATETIME);

    return moment(expTime).format(DATE_FORMATS.DATETIME);
}


function isOppositePartyStartThisSO(SOOppositeStartField)
{
    return !!SOOppositeStartField;
}


function isSODateInvalid(params)
{
    let offset = env.SO.serv_req_start_datetime_buffer;

    let nowMinusOffset = moment.utc().subtract(offset,'m');
    let servReqStartDateTime = moment(params.serv_req_start_datetime);
    let servReqEndDateTime = moment(params.serv_req_end_datetime);
    let soExpireTime = moment(params.so_expire_time);

    if(servReqStartDateTime.isBefore(nowMinusOffset))
        return Promise.resolve(setErrorWithStatusCode(400, 'serv_req_start_datetime must be not earlier than NOW - '+offset+'min'));

    if(servReqEndDateTime.isBefore(servReqStartDateTime))
        return Promise.resolve(setErrorWithStatusCode(400, 'serv_req_end_datetime must be not earlier than serv_req_start_datetime'));

    if(soExpireTime.isBefore(servReqEndDateTime))
        return Promise.resolve(setErrorWithStatusCode(400, 'so_expire_time must be not earlier than serv_req_end_datetime'));

    return null;
}


function isSOInvalidForModificationByDate(so)
{
    let offset = env.SO.allow_SO_to_be_modified_buffer;
    let nowPlusOffset = moment.utc().add(offset, 'm');
    let servReqStartDateTime = moment(so.serv_req_start_datetime);

    if(servReqStartDateTime.isBefore(nowPlusOffset))
        return Promise.resolve(setErrorWithStatusCode(501, 'SO modification is not allowed before the '+offset+'min for SO to be started.'));

    return null;
}


function isSOInvalidForStart(so)
{
    let servReqStartDateTime = moment(so.serv_req_start_datetime);
    let servReqEndDateTime = moment(so.serv_req_end_datetime);
    let now = moment.utc();

    if(!now.isBetween(servReqStartDateTime, servReqEndDateTime))
        return Promise.resolve(setErrorWithStatusCode(501, 'SO is available to start only between serv_req_start_datetime and serv_req_end_datetime of current SO.'));

    return null;
}


module.exports = {
    getSOExpirationTime,
    isOppositePartyStartThisSO,
    isSODateInvalid,
    isSOInvalidForModificationByDate,
    isSOInvalidForStart
};