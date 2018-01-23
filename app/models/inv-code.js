let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const LoginUser = require('./login-user');
const { setErrorWithStatusCode } = require('../helpers/global-helper');
const moment = require('moment');
const DATE_FORMATS = require('../../config/datetime-formats');
const env = require('../../config/env');
const _ = require('lodash');

let InvCodeSchema = new Schema({
    code: String,
    created_by: { type: Schema.Types.ObjectId, ref: 'LoginUser'},
    email: String,
    phone_number: String,
    is_activated: Boolean,
    created_at: Date,
    updated_at: Date
});


InvCodeSchema.statics.createInvCode = function(params, loggedUser)
{
    return this.count({is_activated: true})
        .then(number => {
            if(+number >= env.appMaxInvitationNumber) {
                throw new Error('App has reached max invitation number. No more invitation are allowed at the moment. Please contact to administrator.');
            }

            let invCode = new this({
                code: 'VAL'+ _.random(10000,99999),
                created_by: loggedUser.id,
                email: params.email,
                phone_number: params.phoneNumber,
                is_activated: false,
                created_at: moment().format(DATE_FORMATS.DATETIME),
                updated_at: moment().format(DATE_FORMATS.DATETIME)
            });

            return invCode.save();
        });
};


InvCodeSchema.statics.checkInvCode = function (params)
{
    return this.find({
        $or: [
            {email: params.email},
            {phone_number: params.mobile_no}
        ]
    })
        .then(invCodes => {

            let invCode = invCodes[invCodes.length-1];

            if(!invCode)
                return {error: 'Your invitation code is absent.'};

            if(invCode.code !== params.inv_code)
                return {error: 'Provided invitation code don\'t match.'};

            if(invCode.is_activated)
                return {error: 'Provided invitation code was already activated'};

            return invCode;
        })
};


InvCodeSchema.statics.activateCode = function (params)
{
    this.find({
        is_activated: false,
        $or: [
            {email: params.email},
            {phone_number: params.mobile_no}
        ]
    }).then(invCodes => {
        invCode = invCodes[invCodes.length-1];
        invCode.is_activated = true;
        invCode.save()
    })
};


module.exports = mongoose.model('InvCode', InvCodeSchema, 'inv_codes');












