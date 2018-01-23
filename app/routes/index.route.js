const express = require('express');
const authRoutes = require('./auth.route');
const soRoutes = require('./so.route');
const userRoutes = require('./user.route');
const trackerRoutes = require('./tracker.route');
const eventRoutes = require('./event.route');
const developersRoute = require('./developers.route');
const chatRoutes = require('./chat.route');
const { auth, loggerMiddleware } = require('../middlewares');

const router = express.Router(); // eslint-disable-line new-cap


router.use(loggerMiddleware.initLog);


router.get('/', (req, res) =>
    res.send('/api route is OK')
);

router.use('/developer', auth.authenticate(), developersRoute);

router.use('/auth', authRoutes);

router.use('/user', auth.authenticate(), userRoutes);

router.use('/so', auth.authenticate(), soRoutes);

router.use('/tracker', auth.authenticate(), trackerRoutes);

router.use('/event', auth.authenticate(), eventRoutes);

router.use('/chat', auth.authenticate(), chatRoutes);

module.exports = router;