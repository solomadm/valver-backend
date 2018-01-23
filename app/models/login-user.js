let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const passwordHash = require('password-hash');
const moment = require('moment');
const DATE_FORMATS = require('../../config/datetime-formats');
const InvCode = require('./inv-code');
const _ = require('lodash');
const { setErrorWithStatusCode } = require('../helpers/global-helper');
const { sendSMSToSingleUser } = require('../helpers/twilio-helper');
const config = require('../../config/env');
const expPoints = require('../../config/user-exp-points');
const { getDaysForComparison } = require('../helpers/model-helpers/login-user-helper');

let LoginUserSchema = new Schema({
    user_name: {type: String, unique: true},
    user_pwd: String,
    user_email: {type: String, unique: true},
    user_mobile_no: {type: String, unique: true},
    user_birthday: Date,
    is_active: Boolean,
    retry_count: Number,
    sms_code: Number,
    sms_code_sent_at: Date,
    email_code: Number,
    email_code_sent_at: Date,
    email_confirmed: Boolean,
    exp_points: Number,
    rank: Number,
    date_checkpoint: [Date],
    checkpoint_rewarded_at: Date,
    create_time: Date,
    update_time: Date
});

LoginUserSchema.methods.toJSON = function() {
    let obj = this.toObject();
    delete obj.sms_code;
    delete obj.user_pwd;
    delete obj.email_code;
    return obj;
};


LoginUserSchema.statics.findByField = function(field, value)
{
    return this.findOne({[field]: value})
        .then(user => user)
        .catch(err => {
            throw err;
        });
};


LoginUserSchema.statics.registerUser = function(req)
{
    if(config.registrationMode.inviteCodeOnly === true)
    {
        return InvCode.checkInvCode(req.body)
            .then(invCode => {

                if(invCode.error)
                    return setErrorWithStatusCode(501, invCode.error);

                this.addExpPoints(invCode.created_by, expPoints.fiendInvitation);

                return this.createUser(req);
            })
    }

    return this.createUser(req);
};

LoginUserSchema.statics.createUser = function(req)
{
    let mobNumber = req.body.mobile_no;
    let smsCode = _.random(10000, 99999);
    let emailCode = _.random(100000, 999999);

    return sendSMSToSingleUser(mobNumber, smsCode)
        .then(() => {

            InvCode.activateCode(req.body);

            let user = new this({
                user_name: req.body.username,
                user_pwd: passwordHash.generate(req.body.password),
                user_email: req.body.email,
                user_mobile_no: req.body.mobile_no,
                user_birthday: moment(req.body.birthday).format(DATE_FORMATS.DATETIME),
                is_active: false,
                retry_count: 0,
                exp_points: 0,
                rank: 0,
                sms_code: smsCode,
                sms_code_sent_at: moment().format(DATE_FORMATS.DATETIME),
                email_code: emailCode,
                email_code_sent_at: moment().format(DATE_FORMATS.DATETIME),
                email_confirmed: false,
                create_time: moment().format(DATE_FORMATS.DATETIME),
                update_time: moment().format(DATE_FORMATS.DATETIME)
            });

            if(user.user_name)
                user.exp_points +=  expPoints.pickAUsername;

            return user.save();
        });

};

LoginUserSchema.statics.softDelete = function(userId)
{
    return this.findOne({_id: userId})
        .then(user => {
            user.is_active = false;
            user.update_time = moment().format(DATE_FORMATS.DATETIME);
            return user.save()
                .then(user => user)
        })
        .catch(err => {throw err;});
};


LoginUserSchema.statics.increaseRetryCount = function(userId)
{
    return this.findOne({_id: userId})
        .then(user => {
            user.retry_count = ++user.retry_count;
            user.update_time = moment().format(DATE_FORMATS.DATETIME);
            return user.save()
                .then(user => user)
        })
        .catch(err => {throw err});
};


LoginUserSchema.statics.resetRetryCount = function(userId)
{
    return this.findOne({_id: userId})
        .then(user => {
            user.retry_count = 0;
            user.update_time = moment().format(DATE_FORMATS.DATETIME);
            return user.save()
                .then(user => user);
        })
        .catch(err => {throw err});
};

LoginUserSchema.statics.searchForUsers = function(params)
{
    let userName = new RegExp(params.username.trim(), 'i');
    let userEmail = new RegExp(params.email.trim(), 'i');
    let userMobileNo = new RegExp(params.user_mobile_no.trim(), 'i');

    return this.find({
        user_name: {
            $regex: userName
        },
        user_email: {
            $regex: userEmail
        },
        user_mobile_no: {
            $regex: userMobileNo
        }
    })
        .then(users => users)
};


LoginUserSchema.statics.activateUser = function(params, loggedUser)
{
    let smsCode = +params.sms_code;

    return this.findOne({_id: loggedUser.id})
        .then(user => {

            if(!user)
                return setErrorWithStatusCode(404, 'User not found.');

            if(user.is_active)
                return setErrorWithStatusCode(501, 'User\'s account is already activated.');

            if(user.sms_code !== smsCode)
                return setErrorWithStatusCode(501, 'sms_code is invalid.');

            if(!user.exp_points)
                user.exp_points = 0;

            user.exp_points += expPoints.mobileVerification;

            user.is_active = true;

            return user.save();
        })

};


LoginUserSchema.statics.requireNewActivationCode = function(loggedUser)
{
    let now = moment.utc();
    let minutesToAdd = config.USER.smsCodeSentAtBuffer;
    let attempts = config.USER.smsCodeSentAttempts;

    return this.findOne({_id: loggedUser.id})
        .then(user => {

            if(!user)
                return setErrorWithStatusCode(404, 'User not found.');

            if(user.is_active)
                return setErrorWithStatusCode(501, 'User\'s account is already activated.');

            let smsCodeSentAtPlusBuffer = moment(user.sms_code_sent_at).add(minutesToAdd,'m');

            if(user.retry_count === 5 && now.isBefore(smsCodeSentAtPlusBuffer))
            {
                return setErrorWithStatusCode(429, 'Allowed number of request to this endpoint is '+ attempts + ' in '+ minutesToAdd +'min');
            }
            else if(user.retry_count === 5)
            {
                user.retry_count = 0;
            }

            user.sms_code = _.random(10000, 99999);
            user.retry_count += 1;
            user.sms_code_sent_at = moment().format(DATE_FORMATS.DATETIME);

            return user.save()
                .then(user => {
                    return sendSMSToSingleUser(user.user_mobile_no, user.sms_code)
                        .then(() => user)
                })

        })
};


LoginUserSchema.statics.updateModel = function(params, loggedUser)
{
    let newPassword = params.password? passwordHash.generate(params.password) : null;
    let newEmail = params.email? params.email : null;
    let newMobileNo = params.mobile_no? params.mobile_no : null;
    let newBirthday = params.birthday? moment(params.birthday).format(DATE_FORMATS.DATETIME) : null;


    return this.findOne({_id: loggedUser.id})
        .then(user => {

            if(!user)
                return setErrorWithStatusCode(404, 'User not found.');

            if(newPassword) user.user_pwd = newPassword;

            if(newEmail) user.user_email = newEmail;

            if(newMobileNo) user.user_mobile_no = newMobileNo;

            if(newBirthday) user.user_birthday = newBirthday;

            return user.save();
        })
};



LoginUserSchema.statics.getExistedUserIds = function(idList)
{
    let existedIds = [];

    return this.find({_id: {$in: idList}}, { _id: true})
        .then(ids => {

            ids.forEach(elem => existedIds.push(elem._id.toString()));

            return existedIds;
        })
        .catch(err => {throw err})

};


LoginUserSchema.statics.addExpPoints = function (userId, points)
{
    return this.findOne({_id: userId})
        .then(user => {

            if(!user.exp_points)
                user.exp_points = 0;

            user.exp_points += (+points);

            return user.save();
        })
};


LoginUserSchema.statics.confirmEmail = function (secret)
{
    let code = secret.substring(0,6);
    let userId = secret.substring(6);

    return this.findOne({_id: userId})
        .then(user => {

            if(!user)
                return setErrorWithStatusCode(404, 'User not found.');

            if(user.email_code !== (+code))
                return setErrorWithStatusCode(501, 'Invalid confirmation code.');

            if(user.email_confirmed)
                return setErrorWithStatusCode(501, 'Email is already confirmed.');

            user.email_confirmed = true;

            this.addExpPoints(user.id, expPoints.emailVerification);

            return user.save();
        });
};


LoginUserSchema.statics.dateCheckpoint = function (loggedUser)
{
    let nowItem = moment.utc().format(DATE_FORMATS.DATE);

    return this.findOne({_id: loggedUser.id})
        .then(user => {

            let lastCheckpointItem = moment(_.last(user.date_checkpoint)).format(DATE_FORMATS.DATE);

            if(nowItem === lastCheckpointItem)
                return setErrorWithStatusCode(501, 'already done');

            return this.update(
                {_id: loggedUser.id},
                {
                    $push: {
                        date_checkpoint: {
                            $each: [ moment().format(DATE_FORMATS.DATETIME) ],
                            $slice: -7
                        }
                    }
                }
            )
                .then(() => this.accrueWeeklyReward(loggedUser.id))
        })
};


LoginUserSchema.statics.accrueWeeklyReward = function(userId)
{
    return this.findOne({_id: userId})
        .then(user => {

            let daysToCompare = getDaysForComparison();

            let checkpoints = user.date_checkpoint.map(el=> moment(el).dayOfYear());

            let rewardedDaysAgo = moment.utc().diff(moment(user.checkpoint_rewarded_at), 'days');

            if(_.isEqual(daysToCompare, checkpoints) && rewardedDaysAgo >= 7)
            {
                this.addExpPoints(userId, expPoints.dailyComeback)
                    .then(user => {
                        user.checkpoint_rewarded_at = moment().format(DATE_FORMATS.DATETIME);
                        user.save();
                    })
            }
            return 'ok';
        })
};


module.exports = mongoose.model('LoginUser', LoginUserSchema, 'login_users');