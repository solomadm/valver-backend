const env = require('../../config/env');
const twilio = require('twilio');



let twilioInstance = new twilio(getAccountSid(), getTwilioAuthToken());


function getAccountSid()
{
    if(process.env.NODE_ENV === 'production')
        return env.twilio_production.accountSid;

    return env.twilio_developer.accountSid
}


function getTwilioAuthToken()
{
    if(process.env.NODE_ENV === 'production')
        return env.twilio_production.authToken;

    return env.twilio_developer.authToken
}


function getFromMobNumber()
{
    if(process.env.NODE_ENV === 'production')
        return env.twilio_production.fromMobNumber;

    return env.twilio_developer.fromMobNumber
}



module.exports = {
    twilioInstance,
    fromMobNumber: getFromMobNumber()
};