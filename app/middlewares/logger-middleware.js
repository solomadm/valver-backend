const logger = require('../helpers/logger');
const cuid = require('cuid');

function initLog(req, res, next)
{
    req.uuid = cuid();
    logger.file.info('initLog entry point', req.uuid);
    logger.db.info('initLog entry point', req.uuid);

    next();
}


module.exports = {
    initLog
};