let express = require('express');
const router = express.Router();
let DevCtrl = require('../controllers/developers.controller');


router.route('/set-categories').post(DevCtrl.setCategories);


router.route('/user-profile').post(DevCtrl.userProfile);


router.route('/create-so-hist').post(DevCtrl.createSOHist);


router.route('/create-event-category').post(DevCtrl.createEventCategory);


router.route('/test-twilio').post(DevCtrl.testTwilio);


router.route('/set-basic-languages-and-currencies').get(DevCtrl.setBasicLanguagesAndCurrency);


module.exports = router;