const moment = require('moment');
const DATE_FORMATS = require('../../config/datetime-formats');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const SOHelper = require('../helpers/model-helpers/so-helper');
const UserProf = require('../models/user-prof');
const LoginUser = require('./login-user');
const expPoints = require('../../config/user-exp-points');
const { isUserOwnerOfSO, setErrorWithStatusCode,getCoordsArray } = require('../helpers/global-helper');


let SOMainSchema = new Schema({
    booking_channel: Number,
    serv_prov: { type: Schema.Types.ObjectId, ref: 'LoginUser'},              //LOGIN_USER_OBJ/GROUP_OBJ
    serv_req: { type: Schema.Types.ObjectId, ref: 'LoginUser'},               //LOGIN_USER_OBJ
    serv_prov_bidder: [{ type: Schema.Types.ObjectId, ref: 'LoginUser'}],     //{LIST OF LOGIN_USER_OBJ}
    serv_name: String,
    serv_cat_code: { type: Schema.Types.ObjectId, ref: 'ServCatRef' },
    serv_summ: String,
    is_public: Boolean,
    serv_prov_min_age: Number,
    geo_location: {
        type: {type: String},
        coordinates: [Number]
    },
    serv_req_start_datetime: Date,
    serv_req_end_datetime: Date,
    price: Number,
    price_type_code: Number,
    price_currency_code: Number,
    is_active: Boolean,
    is_live_bid: Boolean,
    is_happening: Boolean,
    is_order_picked_up: Boolean,
    serv_actual_start_prov: Date,
    serv_actual_start_req: Date,
    serv_actual_end_prov: Date,
    serv_actual_end_req: Date,
    so_expire_time: Date,
    is_order_success: Boolean,
    is_paid: Boolean,
    err_msg: String,
    is_canceled: Boolean,
    reason_for_cancelation: String,
    is_rated_by_requester: Boolean,
    is_rated_by_provider: Boolean,
    so_avatar: String,
    create_datetime: Date,
    update_datetime: Date,
    update_count: Number,
});


SOMainSchema.index({geo_location: '2dsphere'});


SOMainSchema.statics.createSO = function (params, loggedUser)
{

    if(SOHelper.isSODateInvalid(params))
        return SOHelper.isSODateInvalid(params);

    let SO = new this({
        booking_channel: 0,                                             // TODO: needs to be provided some default value
        serv_prov: null,
        serv_req: params.user_id,
        serv_prov_bidder: params.serv_prov_bidder || [],
        serv_name: params.serv_name,
        serv_cat_code: params.serv_cat_code,
        serv_summ: params.serv_summ,
        is_public: params.is_public,
        serv_prov_min_age: params.serv_prov_min_age,
        geo_location: {
            type: "Point",
            coordinates: getCoordsArray(params.geo_location)
        },
        serv_req_start_datetime: moment(params.serv_req_start_datetime).format(DATE_FORMATS.DATETIME),
        serv_req_end_datetime: moment(params.serv_req_end_datetime).format(DATE_FORMATS.DATETIME),
        price: params.price,
        price_type_code: params.price_type_code,
        price_currency_code: params.price_currency_code,
        is_active: params.is_active,
        is_live_bid: params.is_live_bid,
        is_happening: null,
        is_order_picked_up: false,
        serv_actual_start_prov: null,
        serv_actual_start_req: null,
        serv_actual_end_prov: null,
        serv_actual_end_req: null,
        so_expire_time: SOHelper.getSOExpirationTime(params.so_expire_time),
        is_order_success: null,
        is_paid: null,
        err_msg: null,
        is_canceled: null,
        reason_for_cancelation: null,
        is_rated_by_requester: false,
        is_rated_by_provider: false,
        create_datetime: moment().format(DATE_FORMATS.DATETIME),
        update_datetime: moment().format(DATE_FORMATS.DATETIME),
        update_count: 0
    });

    return SO.save()
        .then(so => {

            LoginUser.addExpPoints(loggedUser.id, expPoints.SO.creation);

            return so;
        })
        .catch(err => {throw err})
};


SOMainSchema.statics.updateSO = function(params)
{

    if(SOHelper.isSODateInvalid(params))
        return SOHelper.isSODateInvalid(params);

    return this.findOne({_id: params.serv_id})
        .then(so => {

            if(!so)
                return setErrorWithStatusCode(404, 'SO not found.');

            if(SOHelper.isSOInvalidForModificationByDate(so))
                return SOHelper.isSOInvalidForModificationByDate(so);

            if(!isUserOwnerOfSO(so.serv_req.toString(), params.user_id))
                return setErrorWithStatusCode(400, 'only requester can modify his own SO.');

            if(so.is_order_picked_up === true)
                return setErrorWithStatusCode(400, 'SO is picked up, modification is not allowed.');

            so.serv_name = params.serv_name || so.serv_name;
            so.serv_cat_code = params.serv_cat_code || so.serv_cat_code;
            so.serv_summ = params.serv_summ || so.serv_summ;

            if(params.hasOwnProperty('is_public'))
                so.is_public = params.is_public;

            so.serv_prov_min_age = params.serv_prov_min_age;
            so.geo_location = {
                type: "Point",
                coordinates: getCoordsArray(params.geo_location)
            };
            so.serv_req_start_datetime = moment(params.serv_req_start_datetime).format(DATE_FORMATS.DATETIME);
            so.serv_req_end_datetime = moment(params.serv_req_end_datetime).format(DATE_FORMATS.DATETIME);
            so.price = params.price;
            so.price_type_code = params.price_type_code;
            so.price_currency_code = params.price_currency_code;

            if(params.hasOwnProperty('is_active'))
                so.is_active = params.is_active;

            if(params.hasOwnProperty('is_live_bid'))
                so.is_live_bid = params.is_live_bid;

            so.so_expire_time = params.so_expire_time? SOHelper.getSOExpirationTime(params.so_expire_time) : so.so_expire_time;

            return so.save().then(so => so);
        })
};


SOMainSchema.statics.startSObyRequester = function(params)
{
    return this.findOne({_id: params.serv_id})
        .then(so => {

            if(!so)
                return setErrorWithStatusCode(404, 'SO not found.');

            if(SOHelper.isSOInvalidForStart(so))
                return SOHelper.isSOInvalidForStart(so);

            if(!isUserOwnerOfSO(so.serv_req.toString(), params.user_id))
                return setErrorWithStatusCode(400, 'user is not a requester of this SO.');

            if(so.serv_actual_start_req !== null)
                return setErrorWithStatusCode(501, 'SO was already STARTED by requester on ' + moment(so.serv_actual_start_req).format(DATE_FORMATS.DATETIME));

            if(!so.is_order_picked_up)
                return setErrorWithStatusCode(501, 'is_order_picked_up is not true');

            so.serv_actual_start_req = moment().format(DATE_FORMATS.DATETIME);

            if(SOHelper.isOppositePartyStartThisSO(so.serv_actual_start_prov))
                so.is_happening = true;

            return so.save().then(so => so)
        })
};


SOMainSchema.statics.endSObyRequester = function(params, loggedUser)
{
    return this.findOne({_id: params.serv_id})
        .then(so => {

            if(!so)
                return setErrorWithStatusCode(404, 'SO not found.');

            if(!isUserOwnerOfSO(so.serv_req.toString(), params.user_id))
                return setErrorWithStatusCode(501, 'Rejected. User is not a requester of this SO');

            if(!so.is_order_picked_up)
                return setErrorWithStatusCode(501, 'is_order_picked_up is not true');

            if(!isUserOwnerOfSO(so.serv_req.toString(), params.user_id))
                return setErrorWithStatusCode(400,'user is not a requester of this SO.');

            if(!so.serv_actual_start_req)
                return setErrorWithStatusCode(501, 'SO cannot be ended before its start.');

            if(so.serv_actual_end_req !== null)
                return setErrorWithStatusCode(501, 'SO was already ENDED by requester on ' + moment(so.serv_actual_end_req).format(DATE_FORMATS.DATETIME));

            so.serv_actual_end_req = moment().format(DATE_FORMATS.DATETIME);
            so.is_happening = false;

            return so.save().then(so => {

                LoginUser.addExpPoints(loggedUser.id, expPoints.SO.completion);

                return so;
            })
        })
};


SOMainSchema.statics.startSObyProvider = function(params, loggedUser)
{
    return this.findOne({_id: params.serv_id})
        .then(so => {

            if(!so)
                return setErrorWithStatusCode(404, 'SO not found.');

            if(SOHelper.isSOInvalidForStart(so))
                return SOHelper.isSOInvalidForStart(so);

            if(!so.serv_prov || so.serv_prov.toString() !== loggedUser.id)
                return setErrorWithStatusCode(400,'user is not a provider of this SO.');

            if(!so.is_order_picked_up)
                return setErrorWithStatusCode(501, 'is_order_picked_up is not true');

            if(so.serv_actual_start_prov !== null)
                return setErrorWithStatusCode(501, 'SO was already STARTED by provider on ' + moment(so.serv_actual_start_prov).format(DATE_FORMATS.DATETIME));

            so.serv_actual_start_prov = moment().format(DATE_FORMATS.DATETIME);

            if(SOHelper.isOppositePartyStartThisSO(so.serv_actual_start_req))
                so.is_happening = true;

            return so.save().then(so => so)
        })
};


SOMainSchema.statics.endSObyProvider = function(params, loggedUser)
{
    return this.findOne({_id: params.serv_id})
        .then(so => {

            if(!so)
                return setErrorWithStatusCode(404, 'SO not found.');

            if(!so.serv_prov || so.serv_prov.toString() !== loggedUser.id)
                return setErrorWithStatusCode(400, 'user is not a provider of this SO.');

            if(!so.is_order_picked_up)
                return setErrorWithStatusCode(501, 'is_order_picked_up is not true');

            if(!so.serv_actual_start_prov)
                return setErrorWithStatusCode(501, 'SO cannot be ended before its start.');

            if(so.serv_actual_end_prov !== null)
                return setErrorWithStatusCode(501, 'SO was already ENDED by provider on ' + moment(so.serv_actual_end_prov).format(DATE_FORMATS.DATETIME));

            so.serv_actual_end_prov = moment().format(DATE_FORMATS.DATETIME);
            so.is_happening = false;

            return so.save().then(so => {
                LoginUser.addExpPoints(loggedUser.id, expPoints.SO.completion);
                return so;
            })
        })
};


SOMainSchema.statics.providerAcceptSO = function(params, loggedUser)
{
    let userServiceCategoryIds = [];
    let warning = '';

    return UserProf.findOne({user_id: loggedUser.id})

        .then(userProfile => {

            if(!userProfile) return;

            userServiceCategoryIds = userProfile.user_service_cat
        })

        .then(() => this.findOne({_id: params.serv_id}))

        .then(so => {

            if(!so)
                return setErrorWithStatusCode(404, 'SO not found.');

            if(so.is_order_picked_up || so.serv_prov)
                return setErrorWithStatusCode(400, 'this service is already picked up by someone.');

            if(userServiceCategoryIds.indexOf(so.serv_cat_code) === -1)
                warning = 'category of this service is not in provider\'s category collection.';

            so.serv_prov = loggedUser.id;

            so.is_order_picked_up = true;

            return so.save().then(so => {

                if(!warning)
                    return so;

                so['warning'] = warning;

                return so;
            })
        });
};


SOMainSchema.statics.requesterAcceptSOFromProviderBidList = function(params, loggedUser)
{
    return this.findOne({_id: params.serv_id})
        .then(so => {

            if(!so)
                return setErrorWithStatusCode(404, 'SO not found.');

            if(so.is_order_picked_up)
                return setErrorWithStatusCode(501, 'Rejected. is_order_picked_up is already true.');

            if(so.serv_req.toString() !== loggedUser.id)
                return setErrorWithStatusCode(400, 'logged user is not a requester of the current SO.');

            let bidderUserIds = [];
            so.serv_prov_bidder.forEach(b => bidderUserIds.push(b.toString()));

            if(bidderUserIds.indexOf(params.prov_user_id) === -1)
                return setErrorWithStatusCode(400, 'prov_user_id is not in serv_prov_bidder array.');

            so.serv_prov = loggedUser.id;

            so.is_order_picked_up = true;

            return so.save().then(so => so)
        })
};


SOMainSchema.statics.getSOByProvidersSOCategoryCollection = function(params, loggedUser)
{
    let categoryIds = [];
    let servCatCodeForQuery = [];
    let maxDistance = (+params.geo_range_km) * 1000;
    let SOCatCodes = params.so_cat_code.split(',');

    return UserProf.getProvidersSOCategoryList(loggedUser.id)
        .then(idList => categoryIds = idList)
        .then(() => {

            if(SOCatCodes.length > 0)
            {
                let errorIds = [];

                SOCatCodes.forEach(id => {
                    if(categoryIds.indexOf(id) === -1)
                        errorIds.push(id)
                });

                if(errorIds.length > 0)
                    return setErrorWithStatusCode(400, 'specified categories ['+ errorIds.toString() +'] are not in provider\'s category collection.');
            }


            if(params.so_cat_code === '')
                servCatCodeForQuery = categoryIds;
            else
                servCatCodeForQuery = SOCatCodes;

            let query = this.find({
                is_order_picked_up: false
            })
                .where('serv_cat_code')
                .in(servCatCodeForQuery);

            if(maxDistance !== 0)
            query.where({
                geo_location: {
                    $near:{
                        $geometry: {
                            type: "Point" ,
                            coordinates: getCoordsArray(params.geo_location)
                        },
                        $maxDistance: params.geo_range_km * 1000}
                }
            });

                return query.exec(records => records)
        });

};


SOMainSchema.statics.getUsersUpcomingSO = function(params)
{
    return this.find({
        serv_req: params.user_id,
        is_order_success: null
    })
        .then(SOs => SOs)
};


SOMainSchema.statics.setRatingForOppositeSOParty = function (params, loggedUser, estimatedParty) {

    let searchObj = {
        _id: params.serv_id,
        is_order_success: true
    };

    if(estimatedParty === 'provider')
    {
        searchObj.serv_prov = params.user_id;
        searchObj.serv_req = loggedUser.id;
    }
    else if(estimatedParty === 'requester')
    {
        searchObj.serv_req = params.user_id;
        searchObj.serv_prov = loggedUser.id;
    }

    return this.findOne(searchObj)
        .then(so => {

            if(!so)
                return setErrorWithStatusCode(404, 'specified SO does not exist or not completed');

            if(estimatedParty === 'provider' && so.is_rated_by_requester)
                return setErrorWithStatusCode(406, 'the current SO was already rated by requester');

            if(estimatedParty === 'requester' && so.is_rated_by_provider)
                return setErrorWithStatusCode(406, 'the current SO was already rated by provider');

            if(estimatedParty === 'provider')
            {
                so.is_rated_by_requester = true;
                return so.save()
                    .then(() => UserProf.updateUserProviderRating(params.user_id, params.rating))
            }
            else if(estimatedParty === 'requester')
            {
                so.is_rated_by_provider = true;
                return so.save()
                    .then(() => UserProf.updateUserRequesterRating(params.user_id, params.rating))
            }
        })

};



SOMainSchema.statics.getActiveSO = function (params, loggedUser)
{
    let userCoords = params.user_geolocation.split(',');
    let maxDistance = (+params.geo_range_km)*1000 || 5000;
    let priceMin = +params.price_min || 0;
    let priceMax = +params.price_max || 10000;
    let minAge = +params.min_age;
    let dateTimeMin = params.datetime_min? moment.utc(params.datetime_min).toISOString() : moment.utc().toISOString();
    let dateTimeMax = params.datetime_max? moment.utc(params.datetime_max).toISOString() : moment.utc().add(10,'y').toISOString();
    let servName = new RegExp(params.serv_name_keyword.trim(), 'i');
    let servSummary = new RegExp(params.serv_summary_keyword.trim(), 'i');
    let requesterName = new RegExp(params.requester_name_keyword.trim(), 'i');
    let serv_cat_code = params.serv_cat_code;

    let categoryIds = [];
    let servCatCodeForQuery = [];

    return UserProf.getProvidersSOCategoryList(loggedUser.id)
        .then(idList => categoryIds = idList)
        .then(() => {

            if(params.serv_cat_code !== '' && categoryIds.indexOf(params.serv_cat_code) === -1)
                return setErrorWithStatusCode(400, 'specified category is not in provider\'s category collection.');

            if(params.serv_cat_code === '')
                servCatCodeForQuery = categoryIds;
            else
                servCatCodeForQuery = [params.serv_cat_code];

            return this.find({
                geo_location: {
                    $near:{
                        $geometry: {
                            type: "Point" ,
                            coordinates: userCoords
                        },
                        $maxDistance: maxDistance,
                    },
                },
                price: {
                    $gte: priceMin,
                    $lte: priceMax
                },
                serv_prov_min_age: {
                    $gte: minAge
                },
                serv_req_start_datetime: {
                    $gte: dateTimeMin,
                    $lte: dateTimeMax
                },
                serv_name: {
                    $regex : servName
                },
                serv_summ: {
                    $regex: servSummary
                },
            })
                .where('serv_cat_code')
                .in(servCatCodeForQuery)
                .populate('serv_req', 'user_name', {
                    user_name: {
                        $regex: requesterName
                    }
                })
                .then(SOs => {
                    let SOsFiltered = [];

                    SOs.forEach(so => so.serv_req? SOsFiltered.push(so) : '');

                    return SOsFiltered;
                })

    })
};


SOMainSchema.statics.cancelSO = function (params) {

    return this.findOne({_id: params.serv_id})
        .then(so => {

            if(so.serv_req.toString() !== params.user_id)
                return setErrorWithStatusCode(501, 'User: userid is not authorized to perform this action, this action could only be triggered by requester.');

            let nowPlus15min = moment.utc().add(15, 'm');
            let SOStart = moment(so.serv_req_start_datetime);

            if(so.is_happening)
                return setErrorWithStatusCode(501, 'SO is being happening at the moment. SO could not be cancelled.');

            if(so.is_canceled)
                return setErrorWithStatusCode(501, 'SO was already cancelled.');

            if(!nowPlus15min.isBefore(SOStart))
                return setErrorWithStatusCode(502, 'SO could not be cancelled, SO could only be cancelled with at least 15 min before the start of the order.');

            so.is_canceled = true;
            so.reason_for_cancelation = params.reason_for_cancelation;

            return so.save().then(so => so);
        })

};


SOMainSchema.statics.getUpcomingUserSOs = function (params, loggedUser)
{
    let SOs = {
        reqSOs: [],
        provSOs: []
    };

    return this.getUpcomingUserSOsAsRequester(params, loggedUser)
        .then(reqSOs => {
            SOs.reqSOs = reqSOs;
            return this.getUpcomingUserSOsAsProvider(params, loggedUser)
        })
        .then(provSOs => {
            SOs.provSOs = provSOs;
            return SOs;
        })
};


SOMainSchema.statics.getUpcomingUserSOsAsRequester = function (params, loggedUser)
{
    return this.find({
        serv_req: params.user_id,
        serv_req_start_datetime: {
            $gte: moment.utc().toISOString()
        }
    })
};


SOMainSchema.statics.getUpcomingUserSOsAsProvider = function (params, loggedUser)
{
    return this.find({
        serv_prov: params.user_id,
        serv_req_start_datetime: {
            $gte: moment.utc().toISOString()
        }
    })
};


SOMainSchema.statics.getPassedUserSOs = function (params, loggedUser)
{
    let SOs = {
        reqSOs: [],
        provSOs: []
    };

    return this.getPassedUserSOsAsRequester(params, loggedUser)
        .then(reqSOs => {
            SOs.reqSOs = reqSOs;
            return this.getPassedUserSOsAsProvider(params, loggedUser)
        })
        .then(provSOs => {
            SOs.provSOs = provSOs;
            return SOs;
        })
};


SOMainSchema.statics.getPassedUserSOsAsRequester = function (params, loggedUser)
{
    return this.find({
        serv_req: params.user_id,
        serv_req_end_datetime: {
            $lte: moment.utc().toISOString()
        }
    })
};


SOMainSchema.statics.getPassedUserSOsAsProvider = function (params, loggedUser)
{
    return this.find({
        serv_prov: params.user_id,
        serv_req_end_datetime: {
            $lte: moment.utc().toISOString()
        }
    })
};


SOMainSchema.statics.getOnGoingUserSOs = function (params, loggedUser)
{
    let SOs = {
        reqSOs: [],
        provSOs: []
    };

    return this.getOnGoingUserSOsAsRequester(params, loggedUser)
        .then(reqSOs => {
            SOs.reqSOs = reqSOs;
            return this.getOnGoingUserSOsAsProvider(params, loggedUser)
        })
        .then(provSOs => {
            SOs.provSOs = provSOs;
            return SOs;
        })
};


SOMainSchema.statics.getOnGoingUserSOsAsRequester = function (params, loggedUser)
{
    return this.find({
        serv_req: params.user_id,
        is_happening: true,
        serv_req_start_datetime: {
            $lte: moment.utc().toISOString()
        },
        serv_req_end_datetime: {
            $gte: moment.utc().toISOString()
        }
    })
};


SOMainSchema.statics.getOnGoingUserSOsAsProvider = function (params, loggedUser)
{
    return this.find({
        serv_prov: params.user_id,
        is_happening: true,
        serv_req_start_datetime: {
            $lte: moment.utc().toISOString()
        },
        serv_req_end_datetime: {
            $gte: moment.utc().toISOString()
        }
    })
};


SOMainSchema.statics.setSOAvatar = function (avatarPath, loggedUser, soId)
{
    return this.findOne({
        _id: soId
    })
        .then(so => {

            if(!so)
                return setErrorWithStatusCode(404, 'SO not found.');

            if(so.serv_req.toString() !== loggedUser.id)
                return setErrorWithStatusCode(501, 'Only SO requester can set avatar.');

            so.so_avatar = avatarPath;

            return so.save();
        });
};


module.exports = mongoose.model('SOMain', SOMainSchema, 'so_main');