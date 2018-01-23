const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {LEVEL} = require('../../config/logger.conf');


let DBLoggerSchema = new Schema({
    logId: String,
    level: String,
    text: String
});


DBLoggerSchema.statics.error = function(text,logId)
{
    return mainSave(composeLogItem(logId, 'error', text), this);
};


DBLoggerSchema.statics.warn = function(text,logId)
{
    return mainSave(composeLogItem(logId, 'warn', text), this);
};


DBLoggerSchema.statics.info = function(text,logId)
{
    return mainSave(composeLogItem(logId, 'info', text), this);
};


DBLoggerSchema.statics.verbose = function(text,logId)
{
    return mainSave(composeLogItem(logId, 'verbose', text), this);
};


DBLoggerSchema.statics.debug = function(text,logId)
{
    return mainSave(composeLogItem(logId, 'debug', text), this);
};


DBLoggerSchema.statics.silly = function(text,logId)
{
    return mainSave(composeLogItem(logId, 'silly', text), this);
};


function composeLogItem(logId, level, text)
{
    return {
        logId: logId,
        level: LEVEL[level],
        text: text
    }
};


function mainSave(logItem, model)
{
    let logModel = new model(logItem);

    return logModel.save()
        .then(logItem => {})
        .catch(err => {throw err;});
};


module.exports = mongoose.model('DBLogger', DBLoggerSchema);