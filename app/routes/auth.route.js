let express = require('express');
const router = express.Router();
let authCtrl = require('../controllers/auth.controller');
let validate = require('express-validation');
let paramValidation = require('../../config/param-validation');


router.route('/login').post(authCtrl.login);

router.route('/registeruser').post(authCtrl.registerUser);

router.route('/confirmemail/:secret').get(authCtrl.confirmEmail);


module.exports = router;