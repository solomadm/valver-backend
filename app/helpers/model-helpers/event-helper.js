const moment = require('moment');
const DATE_FORMATS = require('../../../config/datetime-formats');
const {setErrorWithStatusCode} = require('../global-helper');
const env = require('../../../config/env');
const _ = require('lodash');
const LoginUser = require('../../models/login-user');


function verifyIsEventAutoApproved(params)
{
    let eventSizeConfigurableLimit = env.EVENT.allowed_auto_approved_event_size_limit;
    return !((params.event_size > eventSizeConfigurableLimit) || +params.event_size === 0);
}


function isEventDateInvalid(params)
{
    let offset = env.EVENT.event_start_date_buffer;
    let nowPlusOffset = moment.utc().add(offset,'m');
    let eventStartDate = moment(params.event_start_date);
    let eventEndDate = moment(params.event_end_date);
    let deadlineJoinDate = moment(params.deadline_join_date);

    if(eventStartDate.isBefore(nowPlusOffset))
        return Promise.resolve(setErrorWithStatusCode(400, 'event_start_date must not be earlier than NOW + '+offset+'min'));

    if(eventEndDate.isBefore(eventStartDate))
        return Promise.resolve(setErrorWithStatusCode(400, 'event_end_date must not be earlier than event_start_date'));

    return null;
}


function getUserAsParticipant(eventObject, loggedUser)
{
    return eventObject.event_parti.find(parti => parti.user_id.toString() === loggedUser.id);
}


function composePartiList(idString)
{
    let idList = idString.split(',');

    let partiList = [];

    if(!idList || !_.isArray(idList) || idList.length === 0)
        return partiList;

    idList = _.uniq(idList);

    if(idList.indexOf('') !== -1)
        idList.splice(idList.indexOf(''),1);

    return LoginUser.getExistedUserIds(idList)
        .then(existedIds => {

            idList.forEach((id) => {

                if(existedIds.indexOf(id) === -1)
                {
                    if(!partiList.hasOwnProperty('error'))
                        partiList.error = [];

                    return partiList.error.push(id)
                }

                partiList.push({
                    user_id: id,
                    is_joint: false,
                    pend_for_parti_res: true,
                    is_paid: false,
                    is_rated: false
                })
            });

            return partiList;
        });
}


module.exports = {
    verifyIsEventAutoApproved,
    isEventDateInvalid,
    getUserAsParticipant,
    composePartiList
};