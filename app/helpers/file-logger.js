/**
 * read spec at https://www.npmjs.com/package/winston
 */

const winston = require('winston');
require('winston-daily-rotate-file');


let fileLoggerInstance = new (winston.Logger)({
    transports: [
        new winston.transports.DailyRotateFile({
            filename: './logs/-daily.log',
            datePattern: 'yyyy-MM-dd',
            prepend: true
        })
    ],
});


function log2file(type, message,logId){
    fileLoggerInstance.log(type, message, {logId});
}

let fileLogger = {
    error: (message, meta) => {
        log2file('error', message, meta);
    },
    warn: (message, meta) => {
        log2file('warn', message, meta);
    },
    info: (message, meta) => {
        log2file('info', message, meta);
    },
    verbose: (message, meta) => {
        log2file('verbose', message, meta);
    },
    debug: (message, meta) => {
        log2file('debug', message, meta);
    }
};



module.exports = fileLogger;