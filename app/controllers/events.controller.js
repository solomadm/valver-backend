const EventCatRef = require('../models/event-cat-ref');
const UserProf = require('../models/user-prof');
const EventMain = require('../models/event-main');
const FavEvent = require('../models/fav-event');
const { saveAvatar } = require('../helpers/fs-promise');
const {validate, routeConstraints} = require('../helpers/request-validator');
const { handleError } = require('../helpers/global-helper');


function createEvent(req, res)
{
    let errors = validate(req.body, routeConstraints.createevent);

    if(errors)
        return res.status(400).send({error: errors});

    EventMain.createEvent(req.body, req.user.user)
        .then(event => {

            if(event.error)
                return res.status(event.statusCode).send({error: event.error});

            res.json({
                issuccess:true,
                message:"Event created successfully.",
                event: event
            })

        })
        .catch(err => handleError(res, err, req.uuid, 'events.controller@createEvent --> '))
}


function updateEvent(req, res)
{
    let errors = validate(req.body, routeConstraints.modifyeventbyeventid);

    if(errors)
        return res.status(400).send({error: errors});

    EventMain.updateEvent(req.body, req.user.user)
        .then(event => {

            if(event.error)
                return res.status(event.statusCode).send({error: event.error});

            res.json({
                issuccess:true,
                message:"Event updated successfully.",
                event: event
            })

        })
        .catch(err => handleError(res, err, req.uuid, 'events.controller@createEvent --> '))
}


function getEventCategoryById(req, res)
{
    let errors = validate(req.body, routeConstraints.geteventcatdetailsbycatid);

    if(errors)
        return res.status(400).send({error: errors});

    EventCatRef.getEventCatRef(req.body)
        .then(eventCat => {

            if(eventCat.error)
                return res.status(eventCat.statusCode).send({error: eventCat.error});

            res.json({
                issuccess:true,
                message:"Event_cat found successfully",
                event_cat_details: eventCat
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'events.controller@getEventCategoryById --> '))
}


function getActiveEvents(req, res)
{
    EventMain.getActiveEvents(req.body)
        .then(events => {

            if(events.error)
                return res.status(events.statusCode).send({error: events.error});

            res.json({
                issuccess:true,
                event_list: events
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'events.controller@getActiveEvents --> '))
}


function getMyUpcomingEvents(req, res)
{
    EventMain.getMyUpcomingEvents(req.user.user)
        .then(events => {

            if(events.error)
                return res.status(events.statusCode).send({error: events.error});

            res.json({
                issuccess:true,
                event_list: events
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'events.controller@getMyUpcomingEvents --> '))
}


function getMyHistoricalEvents(req, res)
{
    EventMain.getMyHistoricalEvents(req.user.user)
        .then(events => {

            if(events.error)
                return res.status(events.statusCode).send({error: events.error});

            res.json({
                issuccess:true,
                event_list: events
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'events.controller@getMyHistoricalEvents --> '))
}


function joinToEvent(req, res)
{
    let errors = validate(req.body, routeConstraints.joineventbyeventid);

    if(errors)
        return res.status(400).send({error: errors});

    EventMain.joinToEvent(req.body, req.user.user)
        .then(event => {

            if(event.error)
                return res.status(event.statusCode).send({error: event.error});

            res.json({
                issuccess:true,
                message:"Successfully joint event: " + event.event_name
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'events.controller@getMyHistoricalEvents --> '))

}


function createEventCategory(req, res)
{
    let errors = validate(req.body, routeConstraints.createeventcat);

    if(errors)
        return res.status(400).send({error: errors});

    EventCatRef.createEventCategory(req.body)
        .then(eventCatRef => {
            {
                res.json({
                    issuccess:true,
                    message:"event cat successfully created",
                    event_cat: eventCatRef
                })
            }

        })
        .catch(err => handleError(res, err, req.uuid, 'events.controller@createEventCategory --> '))
}


function rateEventById(req, res)
{
    let errors = validate(req.body, routeConstraints.rateeventbyeventid);

    if(errors)
        return res.status(400).send({error: errors});

    EventMain.rateEventById(req.body, req.user.user)
        .then(event => {

            if(event.error)
                return res.status(event.statusCode).send({error: event.error});

            res.json({
                issuccess:true,
                message:"Event with id "+event.id+" successfully rated with "+ req.body.rating
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'events.controller@rateEventById --> '))
}


function hostConfirmParticipantAttendance(req, res)
{
    let errors = validate(req.body, routeConstraints.particonfirmshowupbyeventid);

    if(errors)
        return res.status(400).send({error: errors});

    EventMain.hostConfirmParticipantAttendance(req.body, req.user.user)
        .then(event => {

            if(event.error)
                return res.status(event.statusCode).send({error: event.error});

            res.json({
                issuccess:true,
                message:"participant successfully confirmed his attendance at the event with id "+event.id,
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'events.controller@hostConfirmParticipantAttendance --> '))
}


function joinToPublicEvent(req, res)
{
    let errors = validate(req.body, routeConstraints.joinpubliceventbyeventid);

    if(errors)
        return res.status(400).send({error: errors});

    EventMain.joinToPublicEvent(req.body, req.user.user)
        .then(event => {

        if(event.error)
            return res.status(event.statusCode).send({error: event.error});

        res.json({
            issuccess:true,
            message:"Successfully joint event: "+event.id,
            event: event
        })
    })
        .catch(err => handleError(res, err, req.uuid, 'events.controller@joinToPublicEvent --> '))
}


function confirmOrDeclineEventAttendance(req, res)
{
    let errors = validate(req.body, routeConstraints.partiresponseeventreq);

    if(errors)
        return res.status(400).send({error: errors});

    EventMain.confirmOrDeclineEventAttendance(req.body, req.user.user)
        .then(event => {

            if(event.error)
                return res.status(event.statusCode).send({error: event.error});

            let message = req.body.is_accept === 'false'? 'Successfully declined event: ' : 'Successfully joint event: ';

            res.json({
                issuccess:true,
                message: message + event.id
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'events.controller@confirmOrDeclineEventAttendance --> '))
}


function addFavEvent(req, res)
{
    let errors = validate(req.body, routeConstraints.addfavevent);

    if(errors)
        return res.status(400).send({error: errors});

    FavEvent.addFavEvent(req.body, req.user.user)
        .then(event => {

            if(event.error)
                return res.status(event.statusCode).send({error: event.error});

            res.json({
                issuccess:true,
                message: 'event successfully added to favorite'
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'events.controller@addFavEvent --> '))
}


function removeFavEvent(req, res)
{
    let errors = validate(req.body, routeConstraints.addfavevent);

    if(errors)
        return res.status(400).send({error: errors});

    FavEvent.removeFavEvent(req.body, req.user.user)
        .then(event => {

            if(event.error)
                return res.status(event.statusCode).send({error: event.error});

            res.json({
                issuccess:true,
                message: 'event successfully removed from favorite'
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'events.controller@removeFavEvent --> '))
}


function getFavEvents(req, res)
{
    return FavEvent.getFavEvents(req.user.user)
        .then(events => {

            if(events.error)
                return res.status(events.statusCode).send({error: events.error});

            res.json({
                issuccess:true,
                favEvents: events
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'events.controller@getFavEvents --> '))
}


function uploadEventAvatar(req, res)
{
    if (!req.files)
        return res.status(400).json({error: 'No files were uploaded.'});

    let errors = validate(req.body, routeConstraints.uploadeventavatar);

    if(errors)
        return res.status(400).send({error: errors});

    saveAvatar(req.files.avatar, req.body.event_id, 'EVENT')
        .then((avatarPath) => {
            EventMain.setEventAvatar(avatarPath, req.user.user, req.body.event_id)
                .then(event => {

                    if(event.error)
                        return res.status(event.statusCode).send({error: event.error});

                    res.send({
                        issuccess: true,
                        avatar: avatarPath,
                        event: event
                    });
                })
        })
        .catch(err => handleError(res, err, req.uuid, 'users.controller@uploadUserAvatar -->'));
}


module.exports = {
    createEvent,
    updateEvent,
    getEventCategoryById,
    getActiveEvents,
    getMyUpcomingEvents,
    getMyHistoricalEvents,
    joinToEvent,
    createEventCategory,
    rateEventById,
    hostConfirmParticipantAttendance,
    joinToPublicEvent,
    confirmOrDeclineEventAttendance,
    addFavEvent,
    removeFavEvent,
    getFavEvents,
    uploadEventAvatar
};

