let mongoose = require('mongoose');
const LoginUser = require('../models/login-user');
let Schema = mongoose.Schema;
const moment = require('moment');
const DATE_FORMATS = require('../../config/datetime-formats');
const { getCoordsArray, setErrorWithStatusCode, isLoggedUserAgeValid } = require('../helpers/global-helper');
const { verifyIsEventAutoApproved, isEventDateInvalid, getUserAsParticipant, composePartiList } = require('../helpers/model-helpers/event-helper');
const env = require('../../config/env');
const expPoints = require('../../config/user-exp-points');


let EventMainSchema = new Schema({
    event_host: { type: Schema.Types.ObjectId, ref: 'LoginUser'},       // LOGIN_USER_OBJ/GROUP_OBJ
    event_parti: [{
        user_id: { type: Schema.Types.ObjectId, ref: 'LoginUser'},
        is_joint: Boolean,
        is_paid: Boolean,
        rated: Number,
        pend_for_parti_res: Boolean
    }],
    event_name: String,
    event_cat_code: {type: Schema.Types.ObjectId, ref: 'EventCatRef'},
    event_summ: String,
    is_public: Boolean,
    min_age: Number,
    geo_location: {
        type: {type: String},
        coordinates: [Number]
    },
    event_size: Number,
    event_lang: String,
    event_start_date: Date,
    event_end_date: Date,
    deadline_join_date: Date,
    price: Number,
    price_type_code: Number,
    price_currency_code: Number,
    is_happening: Boolean,
    is_event_full: Boolean,
    is_started: Boolean,
    is_ended: Boolean,
    is_event_success: Boolean,
    is_all_parti_paid: Boolean,
    parti_payment_table: String,
    err_msg: String,
    is_canceled: Boolean,
    reason_for_cancelation: String,
    is_rated_by_all_parti: Boolean,
    parti_rate_count: Number,
    parti_rate_table: String,
    is_approved: Boolean,
    create_datetime: Date,
    event_avatar: String,
    update_datetime: Date,
    update_count: Number
});

EventMainSchema.index({geo_location: '2dsphere'});

EventMainSchema.statics.createEvent = function(params, loggedUser)
{
    if(isEventDateInvalid(params))
        return isEventDateInvalid(params);

    if(loggedUser.id !== params.event_host)
        return Promise.resolve(setErrorWithStatusCode(401, 'user_id does not match with auth_key.'));

    let isApproved = verifyIsEventAutoApproved(params);

    return composePartiList(params.event_parti_list)
        .then(partiList => {

            if(partiList.hasOwnProperty('error'))
                return setErrorWithStatusCode(501, 'Users with ids [' + partiList.error.toString() + '] don\'t exist');

            let event = new this({
                event_host: loggedUser.id,
                event_parti: partiList,
                event_name: params.event_name,
                event_cat_code: params.event_cat_code,
                event_summ: params.event_summ,
                is_public: params.is_public,
                min_age: params.min_age,
                geo_location: {
                    type: "Point",
                    coordinates: getCoordsArray(params.geo_location),
                },
                event_size: params.event_size,
                event_lang: params.event_lang,
                event_start_date: moment(params.event_start_date).format(DATE_FORMATS.DATETIME),
                event_end_date: moment(params.event_end_date).format(DATE_FORMATS.DATETIME),
                deadline_join_date: moment(params.deadline_join_date).format(DATE_FORMATS.DATETIME),
                price: params.price,
                price_type_code: params.price_type_code,
                price_currency_code: params.price_currency_code,
                is_event_full: false,
                is_event_success: null,
                create_datetime: moment().format(DATE_FORMATS.DATETIME),
                update_datetime: moment().format(DATE_FORMATS.DATETIME),
                is_approved: isApproved,
                is_started: false,
                is_ended: false,
                is_canceled: false,
            });

            if(env.EVENT.isExpPointsAvailable)
                LoginUser.addExpPoints(loggedUser.id, expPoints.EVENT.creation);

            return event.save()

        })
};



EventMainSchema.statics.updateEvent = function(params, loggedUser)
{
    if(isEventDateInvalid(params))
        return isEventDateInvalid(params);

    let isApproved = verifyIsEventAutoApproved(params);

    return composePartiList(params.event_parti_list)
        .then(partiList => {

            if(partiList.hasOwnProperty('error'))
                return setErrorWithStatusCode(501, 'Users with ids [' + partiList.error.toString() + '] don\'t exist');

            return this.findOne({
                _id: params.event_id,
                event_host: loggedUser.id
            })
                .then(event => {

                    if(!event)
                        return setErrorWithStatusCode(404, 'event not found.');

                    event.event_name = params.event_name;
                    event.event_cat_code = params.event_cat_code;
                    event.event_summ = params.event_summ;
                    event.is_public = params.is_public;
                    event.min_age = params.min_age;
                    event.geo_location = {
                        type: "Point",
                        coordinates: getCoordsArray(params.geo_location)
                    };
                    event.event_size = params.event_size;
                    event.event_lang = params.event_lang;
                    event.event_start_date = moment.utc(params.event_start_date).format(DATE_FORMATS.DATETIME);
                    event.event_end_date = moment.utc(params.event_end_date).format(DATE_FORMATS.DATETIME);
                    event.deadline_join_date = moment.utc(params.deadline_join_date).format(DATE_FORMATS.DATETIME);
                    event.price = params.price;
                    event.price_type_code = params.price_type_code;
                    event.price_currency_code = params.price_currency_code;
                    event.update_datetime = moment.utc().format(DATE_FORMATS.DATETIME);
                    event.is_approved = isApproved;

                    event.event_parti = partiList;

                    return event.save()
                })
        });
};


EventMainSchema.statics.getActiveEvents = function(params)
{
    let eventName = new RegExp(params.event_name.trim(), 'i');

    let nowDateTime = moment.utc();
    let eventStartAfterDate,eventStartBeforeDate;
    let eventStartDateLaterThan = params.event_start_date_later_than? moment.utc(params.event_start_date_later_than): null;
    let eventStartDateEarlierThan = params.event_start_date_earlier_than? moment.utc(params.event_start_date_earlier_than): null;

    if(eventStartDateEarlierThan && eventStartDateLaterThan && eventStartDateEarlierThan.isBefore(eventStartDateLaterThan))
        return Promise.resolve(setErrorWithStatusCode(400, 'event_start_date_later_than must be earlier than event_end_date_earlier_than'));

    eventStartAfterDate = (eventStartDateLaterThan && nowDateTime.isSameOrBefore(eventStartDateLaterThan))? eventStartDateLaterThan.toISOString() : nowDateTime.toISOString();

    if(eventStartDateEarlierThan)
        eventStartBeforeDate = eventStartDateEarlierThan.isSameOrBefore(nowDateTime)? nowDateTime.toISOString() : eventStartDateEarlierThan.toISOString();

    let maxDistance = (+params.geo_range_km) * 1000;

    let eventCatCode = params.event_cat_code;

    let partiIds = params.parti_id.trim() !== '' ? params.parti_id.split(',') : [];

    let minAge = +params.min_age;

    let priceMoreThan = +params.price_larger_than;
    let priceLowerThan = +params.price_lower_than;

    let query = this.find({
        is_approved: true,
        is_public: true,
        is_event_full: false,
        deadline_join_date: {
            $gte: moment.utc().toISOString()
        },
        event_name: {
            $regex: eventName
        },
        min_age: {
            $gte: minAge
        },
        event_size: {
            $gte: +params.event_size
        },
        event_start_date: {
            $gte: eventStartAfterDate
        },
        price: {
            $gte: priceMoreThan
        }
    });

    if(maxDistance)
    {
        query.where({
            geo_location: {
                $near:{
                    $geometry: {
                        type: "Point" ,
                        coordinates: getCoordsArray(params.geo_location)
                    },
                    $maxDistance: maxDistance,
                },
            }
        });
    }

    if(eventCatCode)
    {
        query.where({event_cat_code: params.event_cat_code});
    }

    if(eventStartBeforeDate)
    {
        query.where({
            event_start_date: {
                $lte: eventStartBeforeDate
            }
        })
    }

    if(priceLowerThan)
    {
        query.where({
            price: {
                $lte: priceLowerThan
            }
        })
    }

    if(partiIds.length > 0)
    {
        query.where({
            event_parti: {
                $in: partiIds
            }
        });
    }

        return query.then(events => events)
};


EventMainSchema.statics.getMyUpcomingEvents = function(loggedUser)
{
    return this.find({
        event_start_date: {
            $gte: moment.utc().toISOString()
        },
        $or: [
            {event_host: loggedUser.id},
            {
                event_parti: {
                    $elemMatch: {
                        user_id: loggedUser.id,
                        pend_for_parti_res: true
                    }
                }
            }
        ]
    })
};


EventMainSchema.statics.getMyHistoricalEvents = function(loggedUser)
{
    return this.find({
        is_ended: true,
        is_canceled: false,
        event_start_date: {
            $lt: moment.utc().toISOString()
        },
        $or: [
            {event_host: loggedUser.id},
            {
                'event_parti.user_id': {
                    $in: [loggedUser.id]
                }
            }
        ]
    })
};


EventMainSchema.statics.joinToEvent = function(params, loggedUser)
{
    return this.findOne({
        _id: params.event_id,
        is_approved: true,
        is_public: true,
        is_event_full: false,
        event_start_date: {
            $gte: moment.utc().toISOString()
        },
        deadline_join_date: {
            $gte: moment.utc().toISOString()
        }
    })
        .then(event => {

            if(!event)
                return setErrorWithStatusCode(404, 'event not found.');

            if(event.event_parti.indexOf(loggedUser.id) !== -1)
                return setErrorWithStatusCode(501, 'Current user is already joined to this event.');

            event.event_parti.push(loggedUser.id);

            return event.save();
        })
};


EventMainSchema.statics.rateEventById = function(params, loggedUser)
{
    return this.findOne({
        _id: params.event_id,
        is_ended: true,
        is_event_success: true
    })
        .then(event => {

            if(!event)
                return setErrorWithStatusCode(404, 'event not found.');

            let UserAsParticipant = getUserAsParticipant(event, loggedUser);

            if(!UserAsParticipant)
                return setErrorWithStatusCode(501, 'Current user is not a participant of the event.');

            if(!UserAsParticipant.is_joint)
                return setErrorWithStatusCode(501, 'Current user was not joint as a participant to the event.');

            if(!UserAsParticipant.is_paid)
                return setErrorWithStatusCode(501, 'Current user did not pay for the event.');

            if(UserAsParticipant.rated)
                return setErrorWithStatusCode(501, 'Current user already rated this event.');

            return this.update(
                {
                    _id: params.event_id,
                    is_ended: true,
                    is_event_success: true,
                    'event_parti.user_id': loggedUser.id
                },
                {
                    $set: {'event_parti.$.rated': params.rating}
                }
            )
                .then(() => event)
        })
};


EventMainSchema.statics.hostConfirmParticipantAttendance = function(params, loggedUser)
{
    let now = moment.utc();
    let eventStartTimeMinusBuffer;

    return this.findOne({
        _id: params.event_id,
        event_host: params.host_id
    })
        .then(event => {

            if(!event)
                return setErrorWithStatusCode(404, 'event not found.');

            if(event.is_ended)
                return setErrorWithStatusCode(501, 'Event is already ended.');

            eventStartTimeMinusBuffer = moment.utc(event.event_start_date).subtract(env.EVENT.event_start_date_buffer, 'm');

            if(now.isBefore(eventStartTimeMinusBuffer))
                return setErrorWithStatusCode(501, 'Rejected. Attendance could not be confirmed earlier than event_start_date - buffer');

            let UserAsParticipant = getUserAsParticipant(event, loggedUser);

            if(!UserAsParticipant)
                return setErrorWithStatusCode(501, 'Current user is not a participant of the event.');

            if(UserAsParticipant.is_joint)
                return setErrorWithStatusCode(501, 'Current user is already joint to the event.');

            return this.update(
                {
                    _id: params.event_id,
                    event_host: params.host_id,
                    'event_parti.user_id': loggedUser.id
                },
                {
                    $set: {'event_parti.$.is_joint': true}
                }
            )
                .then(() => {
                    if(env.EVENT.isExpPointsAvailable)
                        LoginUser.addExpPoints(loggedUser.id, expPoints.EVENT.attendanceConfirmation);

                    return event;
                })
        })

};


EventMainSchema.statics.joinToPublicEvent = function(params, loggedUser)
{
    let now = moment.utc();

    return this.findOne({
        _id: params.event_id
    })
        .then(event => {

            if(!event)
                return setErrorWithStatusCode(404, 'event not found.');

            if(!isLoggedUserAgeValid(loggedUser, event.min_age))
                return setErrorWithStatusCode(501, 'User\'s age is not valid for this event.');

            if(!event.is_public)
                return setErrorWithStatusCode(501, 'Event is not public.');

            let deadlineJoinDate = moment.utc(event.deadline_join_date);

            if(!now.isBefore(deadlineJoinDate))
                return setErrorWithStatusCode(501, 'Current time must be less than deadline_join_date.');

            if(event.event_host.toString() === loggedUser.id)
                return setErrorWithStatusCode(501, 'Event host cannot join to his own event as participant.');

            let UserAsParticipant = getUserAsParticipant(event, loggedUser);

            if(UserAsParticipant)
                return setErrorWithStatusCode(501, 'User is already joint to the event.');

            if(!UserAsParticipant)
            {
                UserAsParticipant = {
                    user_id: loggedUser.id,
                    is_joint: false,
                    is_paid: false,
                    rated: null,
                    pend_for_parti_res: false
                };

                event.event_parti.push(UserAsParticipant);

                return event.save();
            }
            else
            {
                return this.update(
                    {
                        _id: params.event_id,
                        'event_parti.user_id': loggedUser.id
                    },
                    {
                        $set: {
                            'event_parti.$.is_joint': true,
                            'event_parti.$.pend_for_parti_res': false
                        }
                    }
                )
                    .then(() => event)
            }
        })
};


EventMainSchema.statics.confirmOrDeclineEventAttendance = function(params, loggedUser)
{
    let now = moment.utc();

    return this.findOne({
        _id: params.event_id
    })
        .then(event => {

            if(!event)
                return setErrorWithStatusCode(404, 'event not found.');

            if(!isLoggedUserAgeValid(loggedUser, event.min_age))
                return setErrorWithStatusCode(501, 'User\'s age is not valid for this event.');

            if(event.is_started)
                return setErrorWithStatusCode(501, 'Event is already started.');

            let deadlineJoinDate = moment.utc(event.deadline_join_date);

            if(!now.isBefore(deadlineJoinDate))
                return setErrorWithStatusCode(501, 'Current time must be less than deadline_join_date.');

            let UserAsParticipant = getUserAsParticipant(event, loggedUser);

            if(!UserAsParticipant)
                return setErrorWithStatusCode(501, 'Current user is not a participant of the event.');

            if(!UserAsParticipant.pend_for_parti_res)
                return setErrorWithStatusCode(501, 'Event already received attendance confirmation from current user.');

            return this.update(
                {
                    _id: params.event_id,
                    'event_parti.user_id': loggedUser.id
                },
                {
                    $set: {
                        'event_parti.$.is_joint': params.is_accept,
                        'event_parti.$.pend_for_parti_res': false
                    }
                }
            )
                .then(() => event)
        })
};


EventMainSchema.statics.getUpcomingUserEvents = function(params, loggedUser)
{
    let events = {
            hostEvents: [],
            partiEvents: []
        };

    return this.getUpcomingUserEventsAsHost(params, loggedUser)
        .then(hostEvents => {
            events.hostEvents = hostEvents;

            return this.getUpcomingUserEventsAsParti(params, loggedUser)
        })
        .then(partiEvents => {
            events.partiEvents = partiEvents;

            return events;
        })
};


EventMainSchema.statics.getUpcomingUserEventsAsHost = function (params, loggedUser)
{
    return this.find({
        event_host: params.user_id,
        event_start_date: {
            $gte: moment.utc().toISOString()
        }
    })
};


EventMainSchema.statics.getUpcomingUserEventsAsParti = function (params, loggedUser)
{
    return this.find({
        event_parti: {
            $elemMatch: {
                user_id: params.user_id,
                pend_for_parti_res: false
            }
        },
        event_start_date: {
            $gte: moment.utc().toISOString()
        }
    })
};


EventMainSchema.statics.getPassedUserEvents = function (params, loggedUser)
{
    let events = {
        hostEvents: [],
        partiEvents: []
    };

    return this.getPassedUserEventsAsHost(params, loggedUser)
        .then(hostEvents => {
            events.hostEvents = hostEvents;

            return this.getPassedUserEventsAsParti(params, loggedUser)
        })
        .then(partiEvents => {
            events.partiEvents = partiEvents;

            return events;
        })
};


EventMainSchema.statics.getPassedUserEventsAsHost = function (params, loggedUser)
{
    return this.find({
        event_host: params.user_id,
        is_ended: true,
        event_end_date: {
            $lte: moment.utc().toISOString()
        }
    })
};


EventMainSchema.statics.getPassedUserEventsAsParti = function (params, loggedUser)
{
    return this.find({
        event_parti: {
            $elemMatch: {
                user_id: params.user_id,
                pend_for_parti_res: false
            }
        },
        is_ended: true,
        event_end_date: {
            $lte: moment.utc().toISOString()
        }
    })
};


EventMainSchema.statics.getOnGoingUserEvents = function (params, loggedUser)
{
    let events = {
        hostEvents: [],
        partiEvents: []
    };

    return this.getOnGoingUserEventsAsHost(params, loggedUser)
        .then(hostEvents => {
            events.hostEvents = hostEvents;

            return this.getOnGoingUserEventsAsParti(params, loggedUser)
        })
        .then(partiEvents => {
            events.partiEvents = partiEvents;

            return events;
        })
};


EventMainSchema.statics.getOnGoingUserEventsAsHost = function (params, loggedUser)
{
    return this.find({
        event_host: params.user_id,
        is_started: true,
        event_start_date: {
            $lte: moment.utc().toISOString()
        },
        event_end_date: {
            $gte: moment.utc().toISOString()
        }
    })
};


EventMainSchema.statics.getOnGoingUserEventsAsParti = function (params, loggedUser)
{
    return this.find({
        event_parti: {
            $elemMatch: {
                user_id: params.user_id,
                pend_for_parti_res: false
            }
        },
        is_started: true,
        event_start_date: {
            $lte: moment.utc().toISOString()
        },
        event_end_date: {
            $gte: moment.utc().toISOString()
        }
    })
};


EventMainSchema.statics.setEventAvatar = function (avatarPath, loggedUser, eventId)
{
    return this.findOne({_id: eventId})
        .then(event => {

            if(!event)
                return setErrorWithStatusCode(404, 'Event not found.');

            if(event.event_host.toString() !== loggedUser.id)
                return setErrorWithStatusCode(501, 'Only event host can set avatar.');

            event.event_avatar = avatarPath;

            return event.save();
        })
};



module.exports = mongoose.model('EventMain', EventMainSchema, 'event_main');