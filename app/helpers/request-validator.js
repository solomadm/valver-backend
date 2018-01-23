const validate = require("validate.js");
const Q = require('q');
const moment = require('moment');

/** Extend validate.js **/
validate.Promise = Q.Promise;
validate.extend(validate.validators.datetime, {
    parse: function(value, options) {
        return +moment.utc(value);
    },
    format: function(value, options) {
        var format = options.dateOnly ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm:ss";
        return moment.utc(value).format(format);
    }
});

let IdFormatForDB = {
    pattern: "[a-z0-9]+",
    flags: "i",
    message: "can only contain a-z and 0-9"
};

let geoCoordinatePattern = /^(\-?\d+(\.\d+)?),(\-?\d+(\.\d+)?)$/;

let passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

let routeConstraints = {
    login: {
        username: {
            presence: true
        },
        password: {
            presence: true
        }
    },

    registerUser:{
        username: {
            presence: true
        },
        password: {
            presence: true,
            length: {
                minimum: 8,
                maximum: 50
            },
            format: {
                pattern: passwordPattern,
                message: 'Password must be at least 8 digits long, and it must contain at least 1 number and 1 uppercase and lowercase character'
            }
        },
        email: {
            email: true,
            presence: true
        },
        mobile_no: {
            numericality: {
                onlyInteger: true,
            },
            length: {
                maximum: 20,
                minimum: 5
            }
        },
        birthday: {
            presence: true,
            datetime: {
                dateOnly: true,
                message: '^birthday must be a valid date. format YYYY-MM-DD'
            }
        }
    },

    registerUserWithInvCode: {
        inv_code: {
            presence: true
        }
    },

    createsoreq: {
        user_id: {
            presence: true,
            format: IdFormatForDB
        },
        serv_name: {presence: true},
        serv_cat_code: {
            presence: true,
            format: IdFormatForDB
        },
        serv_summ: {presence: true},
        is_public: {
            presence: true,
            inclusion: {
                within: ['true', 'false'],
                message: "^`is_public` must be `true` or `false`"
            }
        },
        serv_prov_min_age: {
            presence: true,
            numericality: {
                onlyInteger: true,
            },
        },
        geo_location: {
            presence: {
                message: "^`geo_location` is required and must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            },
            format: {
                pattern: geoCoordinatePattern,
                flags: "i",
                message: "^`geo_location` must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            }
        },
        serv_req_start_datetime: {
            presence: true,
            datetime: {
                message: "should be adjusted to the UTC time zone with format YYYY-MM-DD HH:mm:ss"
            }
        },
        serv_req_end_datetime: {
            presence: true,
            datetime: {
                message: "should be adjusted to the UTC time zone with format YYYY-MM-DD HH:mm:ss"
            }
        },
        price: {
            presence: true,
            numericality: {},
        },
        price_type_code: {
            presence: true,
            numericality: {
            onlyInteger: true,
        }},
        price_currency_code: {
            presence: true,
            numericality: {
                onlyInteger: true,
            },
        },
        is_live_bid: {
            presence: true,
            inclusion: {
                within: ['true', 'false'],
                message: "^`is_live_bid` must be `true` or `false`"
            }
        },
        so_expire_time: {
            presence: true,
            datetime: {
                message: "should be adjusted to the UTC time zone with format YYYY-MM-DD HH:mm:ss"
            }
        },
    },

    modifysobysoid: {
        user_id: {
            presence: true,
            format: IdFormatForDB
        },
        serv_id: {
            presence: true,
            format: IdFormatForDB
        },
        serv_name: {presence: true},
        serv_cat_code: {
            presence: true,
            format: IdFormatForDB
        },
        serv_summ: {presence: true},
        is_public: {
            presence: true,
            inclusion: {
                within: ['true', 'false'],
                message: "^`is_public` must be `true` or `false`"
            }
        },
        serv_prov_min_age: {
            presence: true,
            numericality: {
                onlyInteger: true,
            },
        },
        geo_location: {
            presence: {
                message: "^`geo_location` is required and must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            },
            format: {
                pattern: geoCoordinatePattern,
                flags: "i",
                message: "^`geo_location` must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            }
        },
        serv_req_start_datetime: {
            presence: true,
            datetime: {
                message: "should be adjusted to the UTC time zone with format YYYY-MM-DD HH:mm:ss"
            }
        },
        serv_req_end_datetime: {
            presence: true,
            datetime: {
                message: "should be adjusted to the UTC time zone with format YYYY-MM-DD HH:mm:ss"
            }
        },
        price: {
            presence: true,
            numericality: {},
        },
        price_type_code: {
            presence: true,
            numericality: {
                onlyInteger: true,
            }},
        price_currency_code: {
            presence: true,
            numericality: {
                onlyInteger: true,
            },
        },
        is_active: {
            presence: true,
            inclusion: {
                within: ['true', 'false'],
                message: "^`is_active` must be `true` or `false`"
            }
        },
        is_live_bid: {
            presence: true,
            inclusion: {
                within: ['true', 'false'],
                message: "^`is_live_bid` must be `true` or `false`"
            }
        },
        so_expire_time: {
            presence: true,
            datetime: {
                message: "should be adjusted to the UTC time zone with format YYYY-MM-DD HH:mm:ss"
            }
        },
    },

    reqstartsobysoid: {
        user_id:{
            presence: true,
            format: IdFormatForDB
        },
        serv_id:{
            presence: true,
            format: IdFormatForDB
        }
    },

    provstartsobysoid: {
        user_id:{
            presence: true,
            format: IdFormatForDB
        },
        serv_id:{
            presence: true,
            format: IdFormatForDB
        }
    },

    provendsobysoid: {
        user_id:{
            presence: true,
            format: IdFormatForDB
        },
        serv_id:{
            presence: true,
            format: IdFormatForDB
        }
    },

    reqendsobysoid: {
        user_id:{
            presence: true,
            format: IdFormatForDB
        },
        serv_id:{
            presence: true,
            format: IdFormatForDB
        }
    },

    provacceptsobysoid: {
        user_id:{
            presence: true,
            format: IdFormatForDB
        },
        serv_id:{
            presence: true,
            format: IdFormatForDB
        }
    },

    reqacceptprovbysoid: {
        user_id:{
            presence: true,
            format: IdFormatForDB
        },
        serv_id:{
            presence: true,
            format: IdFormatForDB
        },
        prov_user_id: {
            presence: true,
            format: IdFormatForDB
        }
    },

    provgetsobycat: {
        user_id:{
            presence: true,
            format: IdFormatForDB
        },
        so_cat_code: {
            presence: {
                allowEmpty: true
            }
        },
        geo_location: {
            presence: {
                message: "^`geo_location` is required and must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            },
            format: {
                pattern: geoCoordinatePattern,
                flags: "i",
                message: "^`geo_location` must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            }
        },
        geo_range_km: {
            presence: true,
            numericality: {
                greaterThanOrEqualTo: 0,
                divisibleBy: 0.5
            }
        }
    },

    getmyupcomingsoreq: {
        user_id:{
            presence: true,
            format: IdFormatForDB
        },
    },

    getmyhistoricalso: {
        user_id:{
            presence: true,
            format: IdFormatForDB
        },
        so_type: {
            presence: true,
            numericality: {
                onlyInteger: true,
                greaterThan: 0,
                lessThanOrEqualTo: 2,
                message: "^ `so_type` must be 1 or 2"
            }
        }
    },

    reqratesobysoid: {
        user_id:{
            presence: true,
            format: IdFormatForDB
        },
        rating: {
            presence: true,
            numericality: {
                greaterThanOrEqualTo: 0,
                lessThanOrEqualTo: 5,
                divisibleBy: 0.5
            }
        },
        serv_id:{
            presence: true,
            format: IdFormatForDB
        },
    },

    provratesobysoid: {
        user_id:{
            presence: true,
            format: IdFormatForDB
        },
        rating: {
            presence: true,
            numericality: {
                greaterThanOrEqualTo: 0,
                lessThanOrEqualTo: 5,
                divisibleBy: 0.5
            }
        },
        serv_id:{
            presence: true,
            format: IdFormatForDB
        },
    },

    getnerbyprovidersbycat: {
        serv_cat_code: {
            presence: true,
            format: IdFormatForDB
        },
        user_geolocation: {
            presence: {
                message: "^`user_geolocation` is required and must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            },
            format: {
                pattern: geoCoordinatePattern,
                flags: "i",
                message: "^`user_geolocation` must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            }
        }
    },

    getactiveso: {
        user_id:{
            presence: true,
            format: IdFormatForDB
        },
        user_geolocation: {
            presence: {
                message: "^`user_geolocation` is required and must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            },
            format: {
                pattern: geoCoordinatePattern,
                flags: "i",
                message: "^`user_geolocation` must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            }
        },
        geo_range_km: {
            presence: {
                allowEmpty: true
            },
        },
        price_min: {
            presence: {
                allowEmpty: true
            }
        },
        price_max: {
            presence: {
                allowEmpty: true
            }
        },
        min_age: {
            presence: {
                allowEmpty: true
            }
        },
        datetime_min: {
            presence: {
                allowEmpty: true
            }
        },
        datetime_max: {
            presence: {
                allowEmpty: true
            }
        },
        serv_name_keyword: {
            presence: {
                allowEmpty: true
            }
        },
        serv_summary_keyword: {
            presence: {
                allowEmpty: true
            }
        },
        requester_name_keyword: {
            presence: {
                allowEmpty: true
            }
        },
        serv_cat_code: {
            presence: {
                allowEmpty: true
            }
        },
    },

    cancelsobysoid: {
        user_id:{
            presence: true,
            format: IdFormatForDB
        },
        serv_id:{
            presence: true,
            format: IdFormatForDB
        },
        reason_for_cancelation: {
            presence: true
        }
    },

    updateuserprofile: {
        user_id:{
            presence: true,
            format: IdFormatForDB
        },
        pref_name: {
            presence: true,
        },
        user_about_msg: {
            presence: true,
        },
        user_description: {
            presence: true,
        },
        geo_location: {
            presence: {
                message: "^`geo_location` is required and must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            },
            format: {
                pattern: geoCoordinatePattern,
                flags: "i",
                message: "^`geo_location` must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            }
        },
        user_service_cat: {
            format: {
                pattern: "^$|.*",
                flags: "i",
                message: "^user_service_cat must only contain id of ServCatRef divided by comma or must be empty"
            }
        },
        user_pref_lang:{
            format: {
                pattern: "^$|[a-z0-9]+",
                flags: "i",
                message: "^user_pref_lang must only contain a-z and 0-9 or must be empty"
            }
        },
        user_occupation: {
            format: {
                pattern: "^$|.*",
            }
        },
        user_occupation_title: {
            format: {
                pattern: "^$|.*",
            }
        },
        user_education: {
            format: {
                pattern: "^$|.*",
            }
        }
    },

    createnewservicecat: {
        serv_cat_name: {
            presence: true,
        },
        serv_cat_description: {
            presence: true,
        }

    },

    searchbycatname: {
        serv_cat_name: {
            format: {
                pattern: "^$|[a-z0-9]+",
                flags: "i",
                message: "^Invalid inputs, inputs should only include empty string or “a-z” “0-9”."
            }
        }
    },

    updateusergeolocation: {
        geo_location: {
            presence: {
                message: "^`geo_location` is required and must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            },
            format: {
                pattern: geoCoordinatePattern,
                flags: "i",
                message: "^`geo_location` must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            }
        },
    },

    createevent: {
        event_host: {
            presence: true,
            format: IdFormatForDB
        },
        event_name: {
            presence: true
        },
        event_cat_code: {
            presence: true,
            format: IdFormatForDB
        },
        event_summ:{
            presence: true,
        },
        is_public: {
            presence: true,
            inclusion: {
                within: ['true', 'false'],
                message: "^`is_active` must be `true` or `false`"
            }
        },
        min_age: {
            presence: true,
            numericality: {
                onlyInteger: true
            }
        },
        geo_location: {
            presence: {
                message: "^`geo_location` is required and must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            },
            format: {
                pattern: geoCoordinatePattern,
                flags: "i",
                message: "^`geo_location` must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            }
        },
        event_size: {
            presence: true,
            numericality: {
                onlyInteger: true
            }
        },
        event_lang: {
            presence: true,
        },
        event_start_date: {
            presence: true,
            datetime: {
                message: "should be adjusted to the UTC time zone with format YYYY-MM-DD HH:mm:ss"
            }
        },
        event_end_date: {
            presence: true,
            datetime: {
                message: "should be adjusted to the UTC time zone with format YYYY-MM-DD HH:mm:ss"
            }
        },
        deadline_join_date: {
            presence: true,
            datetime: {
                message: "should be adjusted to the UTC time zone with format YYYY-MM-DD HH:mm:ss"
            }
        },
        price: {
            presence: true,
            numericality: {}
        },
        price_type_code: {
            presence: true,
            numericality: {
                onlyInteger: true
            }
        },
        price_currency_code: {
            presence: true,
            format: IdFormatForDB
        }
    },

    modifyeventbyeventid: {
        event_id: {
            presence: true,
            format: IdFormatForDB
        },
        event_name: {
            presence: true
        },
        event_cat_code: {
            presence: true,
            format: IdFormatForDB
        },
        event_summ:{
            presence: true,
        },
        is_public: {
            presence: true,
            inclusion: {
                within: ['true', 'false'],
                message: "^`is_active` must be `true` or `false`"
            }
        },
        min_age: {
            presence: true,
            numericality: {
                onlyInteger: true
            }
        },
        geo_location: {
            presence: {
                message: "^`geo_location` is required and must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            },
            format: {
                pattern: geoCoordinatePattern,
                flags: "i",
                message: "^`geo_location` must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            }
        },
        event_size: {
            presence: true,
            numericality: {
                onlyInteger: true
            }
        },
        event_lang: {
            presence: true,
        },
        event_start_date: {
            presence: true,
            datetime: {
                message: "should be adjusted to the UTC time zone with format YYYY-MM-DD HH:mm:ss"
            }
        },
        event_end_date: {
            presence: true,
            datetime: {
                message: "should be adjusted to the UTC time zone with format YYYY-MM-DD HH:mm:ss"
            }
        },
        deadline_join_date: {
            presence: true,
            datetime: {
                message: "should be adjusted to the UTC time zone with format YYYY-MM-DD HH:mm:ss"
            }
        },
        price: {
            presence: true,
            numericality: {}
        },
        price_type_code: {
            presence: true,
            numericality: {
                onlyInteger: true
            }
        },
        price_currency_code: {
            presence: true,
            format: IdFormatForDB
        }
    },

    geteventcatdetailsbycatid: {
        event_cat_id: {
            presence: true,
            format: IdFormatForDB
        }
    },

    joineventbyeventid: {
        event_id: {
            presence: true,
            format: IdFormatForDB
        }
    },

    searchuserdetailsbyfilter: {
        username: {
            presence: {
                allowEmpty: true,
                message: '^`username` is required, but can be empty'
            }
        },
        email: {
            presence: {
                allowEmpty: true,
                message: '^`email` is required, but can be empty'
            }
        },
        user_mobile_no: {
            presence: {
                allowEmpty: true,
                message: '^`user_mobile_no` is required, but can be empty'
            }
        }
    },

    createeventcat: {
        event_cat_name: {
            presence: true,
            length: {
                minimum: 3
            }
        },
        event_cat_desc: {
            presence: true,
            length: {
                minimum: 10
            }
        }
    },

    rateeventbyeventid: {
        event_id: {
            presence: true,
            format: IdFormatForDB
        },
        rating: {
            presence: true,
            numericality: {
                greaterThanOrEqualTo: 0,
                lessThanOrEqualTo: 5,
                divisibleBy: 0.5,
                message: '^`rating` is required and must be from 0 to 5. Allowed step is 0.5'
            }
        },
    },

    particonfirmshowupbyeventid: {
        event_id: {
            presence: true,
            format: IdFormatForDB
        },
        host_id: {
            presence: true,
            format: IdFormatForDB
        },
    },

    joinpubliceventbyeventid: {
        event_id: {
            presence: true,
            format: IdFormatForDB
        }
    },

    partiresponseeventreq: {
        event_id: {
            presence: true,
            format: IdFormatForDB
        },
        is_accept: {
            presence: true,
            inclusion: {
                within: ['true', 'false'],
                message: "^`is_accept` must be `true` or `false`"
            }
        }
    },

    activateuserbycode: {
        sms_code: {
            presence: true,
            length: {
                minimum: 5,
                maximum: 5,
                message: '^Sms code must be 5 characters long'
            },
            numericality: {}
        }
    },

    updateuserlogindetails: {
        password: {
            format: {
                pattern: /^$|^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                message: 'Password must be at least 8 digits long, and it must contain at least 1 number and 1 uppercase and lowercase character'
            }
        },
        email: {
            format: {
                pattern: /^$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                message: '^email must have a valid format'
            }
        },
        mobile_no: {
            numericality: {
                onlyInteger: true,
            },
            length: {
                maximum: 20,
                minimum: 5
            }
        },
        birthday: {
            presence: true,
            datetime: {
                dateOnly: true,
                message: '^birthday must be a valid date. format YYYY-MM-DD'
            }
        }
    },

    updateuserprofbylinkedin: {
        pref_name: {
            presence: true
        },
        user_about_msg: {
            presence: true
        },
        user_description: {
            presence: true
        },
        user_service_cat: {
            format: {
                pattern: "^$|.*",
                flags: "i",
                message: "^user_service_cat must only contain id of ServCatRef divided by comma or must be empty"
            }
        },
        is_verified: {
            presence: true,
            inclusion: {
                within: ['true', 'false'],
                message: "^`is_verified` must be `true` or `false`"
            }
        },
        is_work_mode: {
            presence: true,
            inclusion: {
                within: ['true', 'false'],
                message: "^`is_work_mode` must be `true` or `false`"
            }
        },
        geo_location: {
            presence: {
                message: "^`geo_location` is required and must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            },
            format: {
                pattern: geoCoordinatePattern,
                flags: "i",
                message: "^`geo_location` must match to the followed format: xx.xxxxxx,yy.yyyyyy"
            }
        },
        user_pref_lang:{
            format: {
                pattern: "^$|[a-z0-9]+",
                flags: "i",
                message: "^user_pref_lang must only contain a-z and 0-9 or must be empty"
            }
        },
        user_occupation: {
            format: {
                pattern: "^$|.*",
            }
        },
        user_occupation_title: {
            format: {
                pattern: "^$|.*",
            }
        },
        user_education: {
            format: {
                pattern: "^$|.*",
            }
        }
    },
    getupcomingusersos: {
        user_id: {
            presence: {
                message: "is required as GET parameter"
            },
            format: IdFormatForDB
        }

    },
    getpassedusersos: {
        user_id: {
            presence: {
                message: "is required as GET parameter"
            },
            format: IdFormatForDB
        }

    },
    getongoingusersos: {
        user_id: {
            presence: {
                message: "is required as GET parameter"
            },
            format: IdFormatForDB
        }
    },
    getupcominguserevents: {
        user_id: {
            presence: {
                message: "is required as GET parameter"
            },
            format: IdFormatForDB
        }
    },
    getpasseduserevents: {
        user_id: {
            presence: {
                message: "is required as GET parameter"
            },
            format: IdFormatForDB
        }
    },
    getongoinguserevents: {
        user_id: {
            presence: {
                message: "is required as GET parameter"
            },
            format: IdFormatForDB
        }
    },
    addtofavusers: {
        user_id: {
            presence: true,
            format: IdFormatForDB
        }
    },
    removefromfavusers: {
        user_id: {
            presence: true,
            format: IdFormatForDB
        }
    },
    addfavso: {
        so_id: {
            presence: true,
            format: IdFormatForDB
        }
    },
    removesofromfav: {
        so_id: {
            presence: true,
            format: IdFormatForDB
        }
    },
    addfavevent: {
        event_id: {
            presence: true,
            format: IdFormatForDB
        }
    },
    removefavevent: {
        event_id: {
            presence: true,
            format: IdFormatForDB
        }
    },
    uploadsoavatar: {
        so_id: {
            presence: true,
            format: IdFormatForDB
        }
    },
    uploadeventavatar: {
        event_id: {
            presence: true,
            format: IdFormatForDB
        }
    },
    chatPublish: {
        message: {
            presence: true
        }
    }
};


module.exports = {
    validate,
    routeConstraints
};