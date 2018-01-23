const dbLogger = require('../models/log');
const fileLogger = require('./file-logger');
require('winston-daily-rotate-file');


let logger = {
    db: dbLogger,
    file: fileLogger
};


module.exports = logger;