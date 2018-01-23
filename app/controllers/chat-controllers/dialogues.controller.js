const logger = require('../../helpers/logger');
const Dialogue = require('../../models/dialogue');
const moment = require('moment');
const chat = require('../../services/chat.service');
const env = require('../../../config/env');
const {validate, routeConstraints} = require('../../helpers/request-validator');


function subscribe(req, res)
{
    Dialogue.initDialogue(req.params, req.user.user)
        .then(dialogue => {

            if(dialogue.error)
                return res.status(dialogue.statusCode).send({error: dialogue.error});

            let dialogueId = dialogue.interlocutor1.toString() + dialogue.interlocutor2.toString();

            chat.subscribe(req, res, dialogueId);
        })
        .catch(err => handleError(res, err, req.uuid, 'dialogues.controller@subscribe --> '))
}


function publish(req, res)
{
    let errors = validate(req.body, routeConstraints.chatPublish);

    if(errors)
        return res.status(400).send({error: errors});

    if(Buffer.byteLength(req.body.message, 'utf8') > env.CHAT.maxMessageSize)
        return res.status(413).send({error: 'message is too big for chat'});

    Dialogue.storeMessage(req.body, req.params.interlocutorId ,req.user.user)
        .then(dialogue => {

            if(dialogue.error)
                return res.status(dialogue.statusCode).send({error: dialogue.error});

            let dialogueId = dialogue.interlocutor1.toString() + dialogue.interlocutor2.toString();

            chat.publish(req.body.message, dialogueId);

            res.json({
                issucess: true,
                dialogue_record: dialogue
            });
        })
        .catch(err => {
            handleError(res, err, req.uuid, 'dialogues.controller@publish --> ')
        })
}

module.exports = {
    publish,
    subscribe
};

