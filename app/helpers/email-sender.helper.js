const {mailgun} = require('../services/mailgun.service');
const {readFile} = require('../helpers/fs-promise');
const env = require('../../config/env');
const logger = require('../helpers/logger');

function sendEmail(params, uuid)
{
    return mailgun.messages().send(params)
        .then(respBody => {
            logger.file.info(respBody, uuid);
            logger.db.info(respBody, uuid);
        })
        .catch(err => {
            logger.file.info('email-sender.helper@sendEmail --> while sending email' + err, uuid);
            logger.db.info('email-sender.helper@sendEmail --> while sending email' + err, uuid);
            throw err;
        })
}

function sendInvEmail(email, invCode, loggedUser, uuid)
{
    let fileName = 'app/email_templates/user_invitation_mail.html';

    return readFile(fileName)
        .then(file => {

            let fileString = file.toString();
            fileString = fileString.replace('{{ActivationCode}}', invCode.code);
            fileString = fileString.replace('{{FriendName}}', loggedUser.user_name);

            let params = {
                from: env.mailgun_developer.from,
                to: email,
                subject: 'Invitation from ' + loggedUser.user_name,
                html: fileString
            };

            return sendEmail(params, uuid)
        })
        .catch(err => {
            logger.file.info('email-sender.helper@sendInvEmail --> while reading file: '+ fileName, uuid);
            logger.db.info('email-sender.helper@sendInvEmail --> while reading file: '+ fileName, uuid);
            throw err;
        })
}


function sendConfirmationEmail(loginUser, uuid)
{
    let fileName = 'app/email_templates/confirmation_mail.html';

    return readFile(fileName)
        .then(file => {

            let fileString = file.toString();

            let domain = process.env.NODE_ENV === 'production'? env.app.production.domain : env.app.developer.domain;

            let ConfirmationLink = domain + '/api/auth/confirmemail/' + loginUser.email_code + loginUser.id;

            fileString = fileString.replace('{{ConfirmationLink}}', ConfirmationLink);

            let params = {
                from: env.mailgun_developer.from,
                to: loginUser.user_email,
                subject: 'Valver Inc. Confirm your registration.',
                html: fileString
            };

            return sendEmail(params, uuid)
        })
        .catch(err => {
            logger.file.info('email-sender.helper@sendConfirmationEmail --> while reading file: '+ fileName, uuid);
            logger.db.info('email-sender.helper@sendConfirmationEmail --> while reading file: '+ fileName, uuid);
            throw err;
        })
}


module.exports = {
    sendInvEmail,
    sendConfirmationEmail
};