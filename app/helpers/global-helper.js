const logger = require('./logger');
const moment = require('moment');
const _ = require('lodash');
const httpStatus = require('http-status');


function handleError(res, err, uuid, customMessage)
{
    console.log('handled error', err);

    var uuid = uuid || null;
    var customMessage = customMessage || '';

    if(uuid)
        logger.file.error(customMessage+' '+err, uuid);

    if(err.name === 'MongoError' && err.code === 11000)
        return res.status(502).send({
            error: 'Record with such index(es) already exists at the DB',
            description:err.message,
        });

    let response = {
        error: err.message
    };

    if(customMessage)
        response.message = customMessage;

    let code = (httpStatus[err.code]) ? err.code : 500;

    res.status(code).send({response:response,description: err});
}


function isUserOwnerOfSO(soProvId, userId)
{
    return soProvId === userId;
}


function send401response(res){
    res.status(401).json({"error":"user_id does not match with auth_key."})
}


function setErrorWithStatusCode(statusCode, message)
{
    return {
        error: message,
        statusCode: statusCode
    }
}


function getCoordsArray(paramOfCoords)
{
    let c = paramOfCoords.split(',');
    return [+c[0],+c[1]];
}


function getLoggedUserAge(loggedUser)
{
    let nowYear = moment.utc().format('YYYY');

    let yearOfBirth = moment(loggedUser.user_birthday).format('YYYY');

    return (+nowYear) - (+yearOfBirth);
}


function isLoggedUserAgeValid(loggedUser, minAge)
{
    let age = getLoggedUserAge(loggedUser);

    return age >= (+minAge);
}


function getUniqueArrayValFromString(someStr)
{
    let arr = someStr.split(',');

    if(!arr || !_.isArray(arr) || arr.length === 0)
        return [];

    arr = _.uniq(arr);

    if(arr.indexOf('') !== -1)
        arr.splice(arr.indexOf(''),1);

    return arr;
}


function resizeAndCropTheImage()
{

}


module.exports = {
    isUserOwnerOfSO,
    send401response,
    handleError,
    setErrorWithStatusCode,
    getCoordsArray,
    getLoggedUserAge,
    isLoggedUserAgeValid,
    getUniqueArrayValFromString
};