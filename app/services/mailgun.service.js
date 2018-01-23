const env = require('../../config/env');

function getApiKey()
{
    let api_key;

    if(process.env.NODE_ENV === 'production')
        api_key = env.mailgun_production.api_key;
    else
        api_key = env.mailgun_developer.api_key;

    return api_key;
}


function getDomain() {
    let domain;

    if(process.env.NODE_ENV === 'production')
        domain = env.mailgun_production.domain;
    else
        domain = env.mailgun_developer.domain;

    return domain;
}

const mailgun = require('mailgun-js')({apiKey: getApiKey(), domain: getDomain()});

module.exports = {
    mailgun
};