const express = require('express');
const authController = require('../controllers/auth.controller');
const landingController = require('../controllers/landing.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.get('/', (req, res) =>
    res.send('/web route is OK')
);

router.get('/registration', authController.showRegistrationForm);

router.get('/login', authController.showLoginForm);

router.get('/landing', landingController.showMainPage);

module.exports = router;