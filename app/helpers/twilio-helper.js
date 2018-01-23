const { twilioInstance, fromMobNumber } = require('../services/twilio.service');


function sendSMSToSingleUser(userMobNumber, textBody)
{
    return twilioInstance.messages.create({
        body: textBody,
        to: '+'+userMobNumber,
        from: fromMobNumber
    })
        .then(message => message)
}


module.exports = {
    sendSMSToSingleUser
};