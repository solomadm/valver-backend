let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const LoginUser = require('./login-user');
const { setErrorWithStatusCode } = require('../helpers/global-helper');
const { getDialogId } = require('../helpers/model-helpers/dialogue-helper');
const moment = require('moment');
const DATE_FORMATS = require('../../config/datetime-formats');

let DialogueSchema = new Schema({
    interlocutor1: { type: Schema.Types.ObjectId, ref: 'LoginUser'},
    interlocutor2: { type: Schema.Types.ObjectId, ref: 'LoginUser'},
    sender: { type: Schema.Types.ObjectId, ref: 'LoginUser'},
    message: String,
    sent_at: Date,
    read_at: Date
});


DialogueSchema.statics.initDialogue = function(params, loggedUser)
{
    if(params.interlocutorId === loggedUser.id)
        return Promise.resolve(setErrorWithStatusCode(400, 'User cannot start dialogue with himself.'));

    let dialogueId = getDialogId(params.interlocutorId, loggedUser.id);

    return this.findOne(dialogueId)
        .then(dialogue => {

            if(!dialogue)
                return {
                    interlocutor1: dialogueId.interlocutor1,
                    interlocutor2: dialogueId.interlocutor2
                };

            return dialogue;
        })
};

DialogueSchema.statics.createDialogue = function(dialogueProps, params, loggedUser, message)
{
    dialogueProps.sender = loggedUser.id;
    dialogueProps.message = message;
    dialogueProps.sent_at = moment().format(DATE_FORMATS.DATETIME);

    let dialogue = new this(dialogueProps);

    return dialogue.save();
};


DialogueSchema.statics.storeMessage = function (params, interlocutorId, loggedUser)
{
    if(interlocutorId === loggedUser.id)
        return Promise.resolve(setErrorWithStatusCode(400, 'User cannot post message to himself.'));

    let dialogueId = getDialogId(interlocutorId, loggedUser.id);

    return this.createDialogue(dialogueId, params, loggedUser, params.message)
};


module.exports = mongoose.model('Dialogue', DialogueSchema, 'dialogues');












