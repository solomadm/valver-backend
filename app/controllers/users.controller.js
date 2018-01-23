const LoginUser = require('../models/login-user');
const UserProf = require('../models/user-prof');
const SOMain = require('../models/so-main');
const EventMain = require('../models/event-main');
const FavUsers = require('../models/fav-users');
const InvCode = require('../models/inv-code');
const logger = require('../helpers/logger');
const {validate, routeConstraints} = require('../helpers/request-validator');
const env = require('../../config/env');
const fs = require('fs');
const {getUniqueArrayValFromString, handleError} = require('../helpers/global-helper');
const {saveAvatar} = require('../helpers/fs-promise');
const { sendInvEmail } = require('../helpers/email-sender.helper');
const { sendSMSToSingleUser } = require('../helpers/twilio-helper');
const _ = require('lodash');

function getUserById(req, res)
{
    let userId = req.params.id;

    LoginUser.findOne({_id: userId})
        .then(user => {
            // if(!user || !user.is_active)
            //     return res.json({user:null});

            UserProf.findOne({'user_id': userId})
                .then(profile => {
                    return res.json({
                        issuccess:true,
                        user: user,
                        profile: profile
                    })
                })
        })
        .catch(err => handleError(res, err, req.uuid, 'users.controller@getUserById --> '))
}


function deleteUser(req, res)
{
    LoginUser.softDelete(req.params.id)
        .then(user => {
            res.json({
                issuccess:true,
                message: 'User successfully deleted with user id: ' + user.id
            })
        })
        .catch(err => { console.log(err) });
}


function getNearbyProvidersByCategory(req, res)
{
    let errors = validate(req.body, routeConstraints.getnerbyprovidersbycat);

    if(errors)
        return res.status(400).send({error: errors});

    UserProf.getNearbyProvidersByCategory(req.body)
        .then(providers => {
            res.json({
                "issuccess":true,
                "message":"Provider list retrieved successfully.",
                "provList":providers
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'users.controller@getNearbyProvidersByCategory --> '))
}


function setUserProfile(req, res)
{
    let errors = validate(req.body, routeConstraints.updateuserprofile);

    if(errors)
        return res.status(400).send({error: errors});

    UserProf.setUserProfile(req.body, req.user.user)
        .then(profile => {

            if(profile.error)
                return res.status(profile.statusCode).send({error: profile.error});

            res.json({
                issuccess:true,
                message: 'User profile for '+ req.user.user.id +' successfully updated ',
                profile: profile
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'users.controller@setUserProfile --> '))


}


function searchForUsers(req, res)
{
    let errors = validate(req.body, routeConstraints.searchuserdetailsbyfilter);

    if(errors)
        return res.status(400).send({error: errors});

    LoginUser.searchForUsers(req.body)
        .then(users => {

            if(users.error)
                return res.status(users.statusCode).send({error: users.error});

            res.json({
                issuccess:true,
                user_list: users
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'users.controller@setUserProfile --> '))
}


function activateAccountViaSMSCode(req, res)
{
    let errors = validate(req.body, routeConstraints.activateuserbycode);

    if(errors)
        return res.status(400).send({error: errors});

    LoginUser.activateUser(req.body, req.user.user)
        .then(user => {

            if(user.error)
                return res.status(user.statusCode).send({error: user.error});

            res.json({
                issuccess:true,
                message:"Successfully activated user: " + user.id,
                user: user
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'users.controller@activateAccountViaSMSCode --> '))
}


function requireNewActivationCode(req, res)
{
    LoginUser.requireNewActivationCode(req.user.user)
        .then(user => {

            if(user.error)
                return res.status(user.statusCode).send({error: user.error});

            res.json({
                issuccess:true,
                message:"New activation code has been sent to user's mobile number: +" + user.user_mobile_no,
                user: user
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'users.controller@requireNewActivationCode --> '))
}


function updateUserLoginModel(req, res)
{
    let errors = validate(req.body, routeConstraints.updateuserlogindetails);

    if(errors)
        return res.status(400).send({error: errors});

    LoginUser.updateModel(req.body, req.user.user)
        .then(user => {

            if(user.error)
                return res.status(user.statusCode).send({error: user.error});

            res.json({
                issuccess:true,
                message:"UserLogin successfully updated",
                user: user
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'users.controller@updateUserLoginModel --> '))
}


function updateProfileFromLinkedin(req, res)
{
    let errors = validate(req.body, routeConstraints.updateuserprofbylinkedin);

    if(errors)
        return res.status(400).send({error: errors});

    UserProf.updateFromLinkedin(req.body, req.user.user)
        .then(profile => {

            if(profile.error)
                return res.status(profile.statusCode).send({error: profile.error});

            res.json({
                issuccess:true,
                message:"UserProfile successfully updated from Linkedin",
                profile: profile
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'users.controller@updateProfileFromLinkedin --> '))
}


function sendInvitationByEmail(req, res)
{
    let loggedUser = req.user.user;
    let emailList = getUniqueArrayValFromString(req.body.email_list);

    let invalidEmails = [];

    emailList.forEach(mail => {
        let error = validate({mail: mail.replace(' ','')}, {mail: {email: true}});

        if(error)
            invalidEmails.push(mail)
    });

    if(invalidEmails.length > 0)
        return res.status(400).send({
                error: 'Invalid email(s)',
                invalid_emails: invalidEmails
            });

    if(emailList.length > 5)
        return res.status(400).send({
            error: 'You can\'t send more than 5 invitations per time'
        });

    emailList.forEach((email, index) => {

        InvCode.createInvCode({email:email}, loggedUser)
            .then(invCode => {

                sendInvEmail(email, invCode, loggedUser, req.uuid)
                    .then(()=>{

                        if(index+1 === emailList.length)
                        {
                            let message = emailList.length === 1? 'Invitation is sending now to specified email' : 'Invitations are sending now to specified emails';

                            res.json({
                                success: true,
                                message: message
                            })
                        }

                    })
                    .catch(err => {
                        if(index+1 === emailList.length) handleError(res, err, req.uuid, 'users.controller@sendInvitationByEmail --> ')
                    })

            })
            .catch(err => {
                if(index+1 === emailList.length) handleError(res, err, req.uuid, 'users.controller@sendInvitationByEmail --> ')
            })
    });
}


function sendInvitationBySMS(req, res)
{
    let loggedUser = req.user.user;
    let phoneList = getUniqueArrayValFromString(req.body.phone_num);

    let invalidPhones = [];

    phoneList.forEach(phone => {
        let error = validate({phone_num: phone.replace(' ','')}, {phone_num: {
            numericality: {
                onlyInteger: true,
            },
            length: {
                maximum: 15,
                minimum: 10
            }
        }});

        if(error)
            invalidPhones.push(phone)
    });

    if(invalidPhones.length > 0 || _.isEmpty(phoneList))
        return res.status(400).send({
            error: 'Invalid phone number(s)',
            invalid_phones: invalidPhones
        });

    phoneList.forEach((phone, index) => {

        InvCode.createInvCode({phoneNumber:phone}, loggedUser)
            .then(invCode => {

                let smsText = 'Valver Services. Your activation code: ' + invCode.code;

                sendSMSToSingleUser(phone, smsText)
                    .then(()=>{

                        if(index+1 === phoneList.length)
                        {
                            let message = phoneList.length === 1? 'Invitation is sending now to specified phone number' : 'Invitations are sending now to specified phone numbers';

                            res.json({
                                success: true,
                                message: message
                            })
                        }

                    })
                    .catch(err => {
                        if(index+1 === phoneList.length) handleError(res, err, req.uuid, 'users.controller@sendInvitationBySMS --> ')
                    })

            })
            .catch(err => {
                if(index+1 === phoneList.length) handleError(res, err, req.uuid, 'users.controller@sendInvitationBySMS --> ')
            })
    });
}


function uploadUserAvatar(req, res)
{
    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    saveAvatar(req.files.avatar, req.user.user.id, 'USER')
        .then((avatarPath) => {
            UserProf.setUserAvatar(avatarPath, req.user.user)
                .then(profile => {
                    res.send({
                        issuccess: true,
                        avatar: avatarPath,
                        user_profile: profile
                    });
                })
        })
        .catch(err => handleError(res, err, req.uuid, 'users.controller@uploadUserAvatar -->'));
}


function getUpcomingUserSOs(req, res)
{
    let errors = validate(req.query, routeConstraints.getupcomingusersos);

    if(errors)
        return res.status(400).send({error: errors});

    SOMain.getUpcomingUserSOs(req.query, req.user.user)
        .then(SOs => {

            if(SOs.error)
                return res.status(SOs.statusCode).send({error: SOs.error});

            res.json({
                issuccess: true,
                reqSOs: SOs.reqSOs,
                provSOs: SOs.provSOs
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'users.controller@getUserSO --> '))
}


function getPassedUserSOs(req, res)
{
    let errors = validate(req.query, routeConstraints.getpassedusersos);

    if(errors)
        return res.status(400).send({error: errors});


    SOMain.getPassedUserSOs(req.query, req.user.user)
        .then(SOs => {

            if(SOs.error)
                return res.status(SOs.statusCode).send({error: SOs.error});

            res.json({
                issuccess: true,
                reqSOs: SOs.reqSOs,
                provSOs: SOs.provSOs
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'users.controller@getPassedUserSOs --> '))
}


function getOnGoingUserSOs(req, res)
{
    let errors = validate(req.query, routeConstraints.getongoingusersos);

    if(errors)
        return res.status(400).send({error: errors});


    SOMain.getOnGoingUserSOs(req.query, req.user.user)
        .then(SOs => {

            if(SOs.error)
                return res.status(SOs.statusCode).send({error: SOs.error});

            res.json({
                issuccess: true,
                reqSOs: SOs.reqSOs,
                provSOs: SOs.provSOs
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'users.controller@getPassedUserSOs --> '))
}


function getUpcomingUserEvents(req, res)
{
    let errors = validate(req.query, routeConstraints.getupcominguserevents);

    if(errors)
        return res.status(400).send({error: errors});

    EventMain.getUpcomingUserEvents(req.query, req.user.user)
        .then(events => {

            if(events.error)
                return res.status(events.statusCode).send({error: events.error});

            res.json({
                issuccess: true,
                hostEvents: events.hostEvents,
                partiEvents: events.partiEvents
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'users.controller@getUpcomingUserEvents --> '))
}


function getPassedUserEvents(req, res)
{
    let errors = validate(req.query, routeConstraints.getpasseduserevents);

    if(errors)
        return res.status(400).send({error: errors});

    EventMain.getPassedUserEvents(req.query, req.user.user)
        .then(events => {

            if(events.error)
                return res.status(events.statusCode).send({error: events.error});

            res.json({
                issuccess: true,
                hostEvents: events.hostEvents,
                partiEvents: events.partiEvents
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'users.controller@getPassedUserEvents --> '))
}


function getOnGoingUserEvents(req, res)
{
    let errors = validate(req.query, routeConstraints.getongoinguserevents);

    if(errors)
        return res.status(400).send({error: errors});

    EventMain.getOnGoingUserEvents(req.query, req.user.user)
        .then(events => {

            if(events.error)
                return res.status(events.statusCode).send({error: events.error});

            res.json({
                issuccess: true,
                hostEvents: events.hostEvents,
                partiEvents: events.partiEvents
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'users.controller@getPassedUserEvents --> '))
}


function addToFavUsers(req, res)
{
    let errors = validate(req.body, routeConstraints.addtofavusers);

    if(errors)
        return res.status(400).send({error: errors});

    FavUsers.addToFav(req.body, req.user.user)
        .then(response => {

            if(response.error)
                return res.status(response.statusCode).send({error: response.error});

            res.json({
                issuccess: true,
                message: 'User successfully added to fav list',
                response: response
            })
        })
        .catch(err => {
            handleError(res, err, req.uuid, 'users.controller@getPassedUserEvents --> ');
        })
}


function removeFromFavUsers(req, res)
{
    let errors = validate(req.body, routeConstraints.removefromfavusers);

    if(errors)
        return res.status(400).send({error: errors});

    FavUsers.removeFromFav(req.body, req.user.user)
        .then(response => {

            if(response.error)
                return res.status(response.statusCode).send({error: response.error});

            res.json({
                issuccess: true,
                message: 'User successfully removed from fav list'
            })
        })
        .catch(err => {
            handleError(res, err, req.uuid, 'users.controller@removeFromFavUsers --> ');
        })
}


function getFavUsers(req, res)
{
    FavUsers.getFavUsers(req.user.user)
        .then(favUsers => {

            if(favUsers.error)
                return res.status(favUsers.statusCode).send({error: favUsers.error});

            res.json({
                issuccess: true,
                favUsers: favUsers
            })
        })
        .catch(err => {
            handleError(res, err, req.uuid, 'users.controller@getFavUsers --> ');
        })
}


function confirmNationalId(req, res)
{
    let userId = req.params.id;

    UserProf.confirmNationalId(userId)
        .then(profile => {

            if(profile.error)
                return res.status(profile.statusCode).send({error: profile.error});

            res.json({
                issuccess: true,
                message: 'national id is confirmed'
            })
        })
        .catch(err => {
            handleError(res, err, req.uuid, 'users.controller@confirmNationalId --> ');
        })
}


function confirmCriminalRecordCheck(req, res)
{
    let userId = req.params.id;

    UserProf.confirmCriminalRecordCheck(userId, req.user.user)
        .then(profile => {

            if(profile.error)
                return res.status(profile.statusCode).send({error: profile.error});

            res.json({
                issuccess: true,
                message: 'criminal record check is done'
            })
        })
        .catch(err => {
            handleError(res, err, req.uuid, 'users.controller@confirmCriminalRecordCheck --> ');
        })
}


module.exports = {
    getUserById,
    deleteUser,
    getNearbyProvidersByCategory,
    setUserProfile,
    searchForUsers,
    activateAccountViaSMSCode,
    requireNewActivationCode,
    updateUserLoginModel,
    updateProfileFromLinkedin,
    sendInvitationByEmail,
    sendInvitationBySMS,
    uploadUserAvatar,
    getUpcomingUserSOs,
    getPassedUserSOs,
    getOnGoingUserSOs,
    getUpcomingUserEvents,
    getPassedUserEvents,
    getOnGoingUserEvents,
    addToFavUsers,
    removeFromFavUsers,
    getFavUsers,
    confirmNationalId,
    confirmCriminalRecordCheck
};

