const LoginUser = require('../models/login-user');
const jwt = require("jwt-simple");
const config = require('../../config/env');
const {validate, routeConstraints} = require('../helpers/request-validator');
const {sendErrorResponse} = require('../helpers/error-response-constructor');
const {handleError} = require('../helpers/global-helper');
const passwordHash = require('password-hash');
const {sendConfirmationEmail} = require('../helpers/email-sender.helper');
const _ = require('lodash');


function login(req, res, next)
{
    let notValid = validate(req.body, routeConstraints.login);

    if(notValid)
        return sendErrorResponse(res, notValid, 'auth-login');

    LoginUser.findByField('user_name', req.body.username)
        .then(user => {

            if(!user)
                return res.status(404).send({error: 'User not found.'});

            if(user.retry_count == 5)
                return res.status(401).send({error: 'Max attempt count is reached'});

            if(!user || !passwordHash.verify(req.body.password, user.user_pwd))
            {
                return LoginUser.increaseRetryCount(user.id)
                    .then(() => res.status(401).send({error: 'Incorrect username or password'}))
            }

            return LoginUser.resetRetryCount(user.id)
                .then(user => res.json({
                    auth_key: generateToken(user.id),
                    user: user
                }))
        })
        .catch(err => {{handleError(res, err, req.uuid)}});
}


function registerUser(req, res)
{
    let errors = validate(req.body, routeConstraints.registerUser) || {};

    if(!_.isEmpty(errors))
        return res.status(400).send({error: errors});

    LoginUser.registerUser(req)
        .then(user => {

            if(user.error)
                return res.status(user.statusCode).send({error: user.error});

            sendConfirmationEmail(user, req.uuid);

            res.json({
                auth_key: generateToken(user.id),
                user: user
            })
        })
        .catch(err => {handleError(res, err, req.uuid)});
}


function generateToken(userId)
{
    return jwt.encode({id: userId}, config.jwtSecret);
}


function confirmEmail(req, res)
{
    LoginUser.confirmEmail(req.params.secret)
        .then(user => {

            if(user.error)
                return res.status(user.statusCode).send({error: user.error});

            res.json({
                issuccess:true,
                message: 'User email ' + user.user_email + ' is now approved.'
            })
        })
        .catch(err => {handleError(res, err, req.uuid, 'auth.controller@confirmEmail --> ')});
}


module.exports = {
    login,
    registerUser,
    confirmEmail
};