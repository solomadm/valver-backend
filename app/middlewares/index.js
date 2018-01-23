const auth = require('./auth-middleware');
const loggerMiddleware = require('./logger-middleware');

module.exports = { auth, loggerMiddleware };

