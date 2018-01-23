let express = require('express');
const router = express.Router();
let TrackersCtrl = require('../controllers/trackers.controller');


router.route('/createnewservicecat').post(TrackersCtrl.createNewCategory);


router.route('/searchbycatname').post(TrackersCtrl.searchCategory);


router.route('/getallsocategories').get(TrackersCtrl.getAllSOCategories);


router.route('/updateusergeolocation').post(TrackersCtrl.updateUserGeoLocation);


router.route('/getlanguages').get(TrackersCtrl.getLanguages);


router.route('/getcurrencycodes').get(TrackersCtrl.getCurrencyCodes);


router.route('/datecheckpoint').get(TrackersCtrl.dateCheckpoint);



module.exports = router;