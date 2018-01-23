let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const _ = require('lodash');
const {getCoordsArray,setErrorWithStatusCode} = require('../helpers/global-helper');
const { defineExpPointsAdd } = require('../helpers/model-helpers/user-prof-helper');
const ServCatRef = require('./serv-cat-ref');
const moment = require('moment');
const DATE_FORMATS = require('../../config/datetime-formats');
const LoginUser = require('./login-user');
const expPoints = require('../../config/user-exp-points');


let UserProfSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'LoginUser'},       // LOGIN_USER_OBJ/GROUP_OBJ
    pref_name: String,
    user_about_msg: String,
    user_description: String,
    user_service_cat: [{ type: Schema.Types.ObjectId, ref: 'ServCatRef'}], // LIST OF SERV_CAT_CODE
    user_request_cat_hist: Array,   // LIST OF (SERV_CAT_CODE, USAGE_COUNT, REQUEST_TYPE_CODE(PRE-BOOK/BOOK-NOW?))
    pref_lang: String,
    pref_currency: String,
    occupation: String,
    occupation_title: String,
    education: String,
    no_of_prov_complete: Number,
    no_of_prov_canceled: Number,
    no_of_req_complete: Number,
    no_of_req_canceled: Number,
    req_price_range_max: Number,
    serv_price_range_max: Number,
    user_prov_rating: Number, // double
    user_req_rating: Number, // double
    user_prov_feedback_cm_hist: Array, //(size of the list should be configurable up to 50)
    user_profile_pic: String,
    is_verified: Boolean,
    is_work_mode: Boolean,
    geo_location: {
        type: {type: String},
        coordinates: [Number]
    },
    serv_pick_up_response_time: Number, // double
    last_geo_update_time: Date,
    is_active: Boolean,
    total_time_spent_on_app: Number,    //in seconds
    linkedin_acc: String,
    facebook_acc: String,
    national_id: String,
    national_id_confirmed: Boolean,
    national_id_confirmed_by: { type: Schema.Types.ObjectId, ref: 'LoginUser'},
    criminal_record_check: Boolean,
    home_address: String,
    work_address: String,
    update_time: Date,
    user_update_time: Date,
});


UserProfSchema.index({geo_location: '2dsphere'});

UserProfSchema.statics.getProvidersSOCategoryList = function(userId)
{
    return this.findOne({user_id: userId})
        .then(userProfile => {
            let catIdList = [];

            userProfile.user_service_cat.forEach(catId => catIdList.push(catId.toString()));

            return catIdList;
        })
};


UserProfSchema.statics.updateUserProviderRating = function(userId, rate)
{
    return this.findOne({user_id: userId})
        .then(profile => {
            let numProvCompleted =  profile.no_of_prov_complete?  profile.no_of_prov_complete : 0;
            let provRating = profile.user_prov_rating? profile.user_prov_rating : 0;

            let updatedProvRating = (provRating * numProvCompleted + (+rate))/(numProvCompleted + 1);

            profile.no_of_prov_complete = numProvCompleted+1;
            profile.user_prov_rating = _.round(updatedProvRating, 2);

            return profile.save().then(profile => profile);
        })
};


UserProfSchema.statics.updateUserRequesterRating = function(userId, rate)
{
    return this.findOne({user_id: userId})
        .then(profile => {
            let numProvCompleted =  profile.no_of_req_complete?  profile.no_of_req_complete : 0;
            let provRating = profile.user_req_rating? profile.user_req_rating : 0;

            let updatedReqRating = (provRating * numProvCompleted + (+rate))/(numProvCompleted + 1);

            profile.no_of_req_complete = numProvCompleted+1;
            profile.user_req_rating = _.round(updatedReqRating, 2);

            return profile.save().then(profile => profile);
        })
};


UserProfSchema.statics.getNearbyProvidersByCategory = function(params)
{
    let c = params.user_geolocation.split(',');
    let coords = [+c[0],+c[1]];

    let maxDistance = params.geo_range_km * 1000 || 8000;

    return this.find({
        user_service_cat: params.serv_cat_code,
        is_active: true,
        is_work_mode: true,
        geo_location: {
            $near:{
                $geometry: {
                    type: "Point" ,
                    coordinates: coords
                },
                $maxDistance: maxDistance,
            },
        }
    })
        .then(providers => providers)
};


UserProfSchema.statics.setUserProfile = function(params, loggedUser)
{
    return ServCatRef.checkIfProvidedCategoriesExist(params.user_service_cat.split(','))
        .then(notExistedCats => {

            if(notExistedCats.length !== 0)
                return setErrorWithStatusCode(501, 'Provided '+ notExistedCats.toString() + " isn't/aren't exist at the serv_cat_ref collection");

            return this.findOne({user_id: params.user_id})
                .then(profile => {

                    if(loggedUser.id !== params.user_id)
                        return setErrorWithStatusCode(501, 'Provided user_id doesn\'t match with logged user id');

                    if(!profile)
                        return createUserProfile(this, composeUserProfileQueryObject(params, loggedUser.id));

                    let oldProfValues = JSON.parse(JSON.stringify(profile));

                    profile.user_id = params.user_id;
                    profile.pref_name = params.pref_name;
                    profile.user_about_msg = params.user_about_msg;
                    profile.user_description = params.user_description;
                    profile.geo_location = {
                        type: 'Point',
                        coordinates: getCoordsArray(params.geo_location)
                    };

                    return updatedNotMandatoryProps(profile, params).save().then(updatedProfile => {

                        let expPointsToAdd = defineExpPointsAdd(oldProfValues, updatedProfile);

                        LoginUser.addExpPoints(updatedProfile.user_id, expPointsToAdd);

                        return updatedProfile
                    });
                })
        })
};

function updatedNotMandatoryProps(profile, params)
{
    let userServiceCat = params.user_service_cat? params.user_service_cat.split(',') : null;
    let userPrefLang = params.user_pref_lang? params.user_pref_lang : null;
    let userOccupation = params.user_occupation? params.user_occupation : null;
    let userOccupationTitle = params.user_occupation_title? params.user_occupation_title : null;
    let userEducation = params.user_education? params.user_education : null;
    let userLinkedinAcc = params.linkedin_acc? params.linkedin_acc : null;
    let userFacebookAcc = params.facebook_acc? params.facebook_acc : null;
    let homeAddress = params.home_address? params.home_address : null;
    let workAddress = params.work_address? params.work_address : null;

    if(userServiceCat) profile.user_service_cat = userServiceCat;
    if(userPrefLang) profile.pref_lang = userPrefLang;
    if(userOccupation) profile.occupation = userOccupation;
    if(userOccupationTitle) profile.occupation_title = userOccupationTitle;
    if(userEducation) profile.education = userEducation;
    if(userLinkedinAcc) profile.linkedin_acc = userLinkedinAcc;
    if(userFacebookAcc) profile.facebook_acc = userFacebookAcc;
    if(homeAddress) profile.home_address = homeAddress;
    if(workAddress) profile.work_address = workAddress;

    return profile;
}

function createUserProfile(model, queryObject)
{
    let profile = new model(queryObject);
    return profile.save().then(p => {

        let expPointsToAdd = defineExpPointsAdd({}, p);

        LoginUser.addExpPoints(p.user_id, expPointsToAdd);

        return p;
    })
}


function composeUserProfileQueryObject(params, loggedUserId)
{
    let userServiceCat = params.user_service_cat? params.user_service_cat.split(',') : [];

    return {
        user_id: loggedUserId,
        pref_name: params.pref_name,
        user_about_msg: params.user_about_msg,
        user_description: params.user_description,
        user_service_cat: userServiceCat,
        is_verified: params.hasOwnProperty('is_verified')? params.is_verified : false,
        is_work_mode: params.hasOwnProperty('is_work_mode')? params.is_work_mode : false,
        geo_location: {
            type: 'Point',
            coordinates: getCoordsArray(params.geo_location)
        },
        pref_lang: params.user_pref_lang? params.user_pref_lang : null,
        occupation: params.user_occupation? params.user_occupation : null,
        occupation_title: params.user_occupation_title? params.user_occupation_title : null,
        education: params.user_education? params.user_education : null,
        linkedin_acc: params.linkedin_acc? params.linkedin_acc : null,
        facebook_acc: params.facebook_acc? params.facebook_acc : null,
        home_address: params.home_address? params.home_address : null,
        work_address: params.work_address? params.work_address : null
    }
}


UserProfSchema.statics.setNewGeoLocation = function(params, loggedUser)
{
    return this.findOne({user_id: loggedUser.id})
        .then(profile => {

            if(!profile)
                return setErrorWithStatusCode(404, 'user\'s profile is not found');

            profile.geo_location = {
                type: 'Point',
                coordinates: getCoordsArray(params.geo_location)
            };

            profile.last_geo_update_time = moment().format(DATE_FORMATS.DATETIME);

            return profile.save().then(p => p)
        })
};


UserProfSchema.statics.updateFromLinkedin = function (params, loggedUser)
{
    let userServiceCat = params.user_service_cat? params.user_service_cat.split(',') : null;
    let userPrefLang = params.user_pref_lang? params.user_pref_lang : null;
    let userOccupation = params.user_occupation? params.user_occupation : null;
    let userOccupationTitle = params.user_occupation_title? params.user_occupation_title : null;
    let userEducation = params.user_education? params.user_education : null;

    return this.findOne({user_id: loggedUser.id})
        .then(profile => {

            if(!profile)
                return setErrorWithStatusCode(404, 'user\'s profile is not found');

            profile.pref_name = params.pref_name;
            profile.user_about_msg = params.user_about_msg;
            profile.user_description = params.user_description;
            profile.is_verified = params.hasOwnProperty('is_verified')? params.is_verified : false;
            profile.is_work_mode = params.hasOwnProperty('is_work_mode')? params.is_work_mode : false;
            profile.geo_location = {
                type: 'Point',
                coordinates: getCoordsArray(params.geo_location)
            };

            if(userServiceCat) profile.user_service_cat = userServiceCat;

            if(userPrefLang) profile.pref_lang = userPrefLang;

            if(userOccupation) profile.occupation = userOccupation;

            if(userOccupationTitle) profile.occupation_title = userOccupationTitle;

            if(userEducation) profile.education = userEducation;

            return profile.save();
        })
};


UserProfSchema.statics.setUserAvatar = function (avatarPath, loggedUser)
{

    return this.findOne({user_id: loggedUser.id})
        .then(profile => {

            if(!profile)
                return setErrorWithStatusCode(404, 'user\'s profile is not found');

            if(!profile.user_profile_pic)
                LoginUser.addExpPoints(loggedUser.id, expPoints.profilePicture);

            profile.user_profile_pic = avatarPath;

            return profile.save();
        })

};


UserProfSchema.statics.confirmNationalId = function(userId)
{
    return this.findOne({user_id: userId})
        .then(profile => {
            if(!profile)
                return setErrorWithStatusCode(404, 'user\'s profile is not found');

            if(profile.national_id_confirmed)
                return setErrorWithStatusCode(501, 'National Id is already confirmed');

            profile.national_id_confirmed = true;

            LoginUser.addExpPoints(userId, expPoints.nationalId);

            return profile.save();
        })
};


UserProfSchema.statics.confirmCriminalRecordCheck = function(userId, loggedUser)
{
    return this.findOne({user_id: userId})
        .then(profile => {
            if(!profile)
                return setErrorWithStatusCode(404, 'user\'s profile is not found');

            if(profile.criminal_record_check)
                return setErrorWithStatusCode(501, 'Criminal record check is already done');

            profile.criminal_record_check = true;
            profile.national_id_confirmed_by = loggedUser.id;

            LoginUser.addExpPoints(userId, expPoints.criminalRecordCheck);

            return profile.save();
        })
};

module.exports = mongoose.model('UserProf', UserProfSchema, 'user_prof');