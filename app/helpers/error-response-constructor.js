const _ = require('lodash');

let routeErrorResponses = {

    'auth-login': {
        username: {
            message: 'Please provide username.',
            statusCode: 400
        },
        password: {
            message: 'Please provide password.',
            statusCode: 400
        }
    },
    'auth-registerUser':{
        username: {
            message: 'Please provide username.',
            statusCode: 400
        },
        password: {
            message: 'Please provide password.',
            statusCode: 400
        },
        email: {
            message: 'Please provide email.',
            statusCode: 400
        },
        mobile_no: {
            message: 'Please provide mobile number using numbers only. Min 5, max 10 numbers',
            statusCode: 400
        },
        birthday: {
            message: 'Please provide date of birth.',
            statusCode: 400
        }
    }

};


function sendErrorResponse(res, errorObj, route)
{
    if(_.isEmpty(errorObj))
        return;

    let errorKey = Object.keys(errorObj)[0].toLowerCase();

    let statusCode = routeErrorResponses[route][errorKey]['statusCode'];
    let message = routeErrorResponses[route][errorKey]['message'];

    return res.status(statusCode).send({error: message});
}


module.exports = {
    sendErrorResponse
};