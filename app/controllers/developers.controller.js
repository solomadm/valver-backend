const SOMain = require('../models/so-main');
const SOHist = require('../models/so-hist');
const EventCatRef = require('../models/event-cat-ref');
const ServCatRef = require('../models/serv-cat-ref');
const UserProf = require('../models/user-prof');
const logger = require('../helpers/logger');
const {validate, routeConstraints} = require('../helpers/request-validator');
const { isUserOwnerOfSO, send401response, handleError } = require('../helpers/global-helper');
const moment = require('moment');
const DATE_FORMATS = require('../../config/datetime-formats');
const SOHelper = require('../helpers/model-helpers/so-helper');
const Language = require('../models/languages');
const PriceCurrencyCodeRef = require('../models/price-currency-code-ref');

let accountSid = 'AC2dbe1535779d7d281d389918a17f26fd'; // Your Account SID from www.twilio.com/console
let authToken = 'fae628a2a2e42e18810cddde897a4803';   // Your Auth Token from www.twilio.com/console

const twilio = require('twilio');


function setCategories(req, res)
{

    let params = req.body;

    let service = new ServCatRef({
        serv_cat_code: params.serv_cat_code,
        serv_cat_name: params.serv_cat_name,
        description: params.description,
        is_active: params.is_active,
    });

    service.save()
        .then(s => res.json({service: s}))
}

function userProfile(req, res)
{
    let c = req.body.geo_location.split(',');
    let coords = [+c[0],+c[1]];

    let profile = new UserProf({
        user_id: req.user.user.id,       // LOGIN_USER_OBJ/GROUP_OBJ
        pref_name: req.user.user.user_name + ' pref name',
        user_about_msg: 'about me',
        user_description: 'my description',
        user_service_cat: ['592e6f46742fc62ff33c4c7d'], // LIST OF SERV_CAT_CODE
        user_request_cat_hist: [],   // LIST OF (SERV_CAT_CODE, USAGE_COUNT, REQUEST_TYPE_CODE(PRE-BOOK/BOOK-NOW?))
        no_of_serv_complete: 0,
        no_of_serv_canceled: 0,
        no_of_req_complete: 0,
        no_of_req_canceled: 0,
        req_price_range_code: 0,
        serv_price_range_code: 0,
        user_prov_rating: 0, // double
        user_req_rating: 0, // double
        user_prov_feedback_cm_hist: [], //(size of the list should be configurable up to 50)
        user_profile_pic: '',
        is_verified: true,
        is_work_mode: true,
        geo_location: {
            type: "Point",
            coordinates: coords
        },
        serv_pick_up_response_time: null, // double
        total_time_spent_on_app: null,    //in seconds
    });

    profile.save()
        .then(p => res.json({profile: p}))
}

function createSOHist(req, res)
{
    let params = req.body;

    let soHist = new SOHist({
        booking_channel: 0,                                             // TODO: needs to be provided some default value
        serv_prov: null,
        serv_req: params.user_id,
        serv_prov_bidder: params.serv_prov_bidder || [],
        serv_name: params.serv_name,
        serv_cat_code: params.serv_cat_code,
        serv_summ: params.serv_summ,
        is_public: params.is_public,
        create_datetime: moment().format(DATE_FORMATS.DATETIME),
        serv_prov_min_age: params.serv_prov_min_age,
        geo_location: params.geo_location,
        serv_req_start_datetime: moment(params.serv_req_start_datetime).format(DATE_FORMATS.DATETIME),
        serv_req_end_datetime: moment(params.serv_req_end_datetime).format(DATE_FORMATS.DATETIME),
        price: params.price,
        price_type_code: params.price_type_code,
        price_currency_code: params.price_currency_code,
        is_live_bid: params.is_live_bid,
        is_happening: false,
        is_order_picked_up: false,
        serv_actual_start_prov: null,
        serv_actual_start_req: null,
        serv_actual_end_prov: null,
        serv_actual_end_req: null,
        so_expire_time: SOHelper.getSOExpirationTime(params.so_expire_time),
        is_order_success: params.is_order_success,
        is_paid: null,
        err_msg: null,
        is_canceled: null,
        reason_for_cancelation: null
    });

    return soHist.save()
        .then(so => res.json({
            issuccess: true,
            soHist: soHist
        }))
        .catch(err => {throw err})
}


function createEventCategory(req, res)
{
    let params = req.body;

    new EventCatRef({
        event_cat_name: params.event_cat_name,
        description: params.description,
        is_active: true,
        create_date: moment().format(DATE_FORMATS.DATETIME),
        update_date: moment().format(DATE_FORMATS.DATETIME),
    })
        .save().then(category => res.json({category: category}))
        .catch(err => {
            if(err.name === 'MongoError' && err.code === 11000)
                return res.status(502).send({error:"event_cat_name could not be added, event_cat_name exists"});
        })
}


function testTwilio(req, res)
{
    let client = new twilio(accountSid, authToken);

    client.messages.create({
        // body: 'Hello from Valver',
        body: '',
        to: '+380503628506',
        from: '+15005550008'
    })
        .then((message) => {

            console.log('message.sid',message.sid);

            res.json({response: message.sid})
        })
        .catch(err=> {
            console.log('error ->>', err)
            res.status(err.status).send(err)
        })
}


function setBasicLanguagesAndCurrency(req, res)
{
    langArr = [
        {name: 'English', code: 'en', is_active: true},
        {name: 'German', code: 'de', is_active: false},
        {name: 'French', code: 'fr', is_active: false},
        {name: 'Russian', code: 'ru', is_active: false},
        {name: 'Italian', code: 'it', is_active: false},
        {name: 'Spanish', code: 'es', is_active: false},
    ];

    langArr.forEach(item => {
        new Language(item).save();
    });

    let currencies = [
        {
            "description": "US Dollar",
            "price_currency_code": "USD",
            "is_active": true
        },
        {
            "description": "Canadian Dollar",
            "price_currency_code": "CAD",
            "is_active": false
        },
        {
            "description": "Euro",
            "price_currency_code": "EUR",
            "is_active": false
        },
        {
            "description": "Swiss Franc",
            "price_currency_code": "CHF",
            "is_active": false

        },
        {
            "description": "Chinese Yuan",
            "price_currency_code": "CNY",
            "is_active": false
        }
    ];

    currencies.forEach(curr => {
        new PriceCurrencyCodeRef(curr).save()
    });

    res.send({message: 'done'})
}


module.exports = {
    setCategories,
    userProfile,
    createSOHist,
    createEventCategory,
    testTwilio,
    setBasicLanguagesAndCurrency
};

