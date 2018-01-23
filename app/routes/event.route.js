let express = require('express');
const router = express.Router();
let EventsCtrl = require('../controllers/events.controller');


router.route('/createevent').post(EventsCtrl.createEvent);


router.route('/modifyeventbyeventid').post(EventsCtrl.updateEvent);


router.route('/geteventcatdetailsbycatid').post(EventsCtrl.getEventCategoryById);


router.route('/getactiveevents').post(EventsCtrl.getActiveEvents);


router.route('/getmyupcomingevents').post(EventsCtrl.getMyUpcomingEvents);


router.route('/getmyhistoricalevents').post(EventsCtrl.getMyHistoricalEvents);


router.route('/joineventbyeventid').post(EventsCtrl.joinToEvent);


router.route('/createeventcat').post(EventsCtrl.createEventCategory);


router.route('/rateeventbyeventid').post(EventsCtrl.rateEventById);


router.route('/particonfirmshowupbyeventid').post(EventsCtrl.hostConfirmParticipantAttendance);


router.route('/joinpubliceventbyeventid').post(EventsCtrl.joinToPublicEvent);


router.route('/partiresponseeventreq').post(EventsCtrl.confirmOrDeclineEventAttendance);


router.route('/addfavevent').post(EventsCtrl.addFavEvent);


router.route('/removefavevent').post(EventsCtrl.removeFavEvent);


router.route('/getfavevents').get(EventsCtrl.getFavEvents);


router.route('/uploadeventavatar').post(EventsCtrl.uploadEventAvatar);



module.exports = router;