let mongoose = require('mongoose');
let Schema = mongoose.Schema;


let SOHistSchema = new Schema({
    booking_channel: Number,
    serv_prov: { type: Schema.Types.ObjectId, ref: 'LoginUser'},              //LOGIN_USER_OBJ/GROUP_OBJ
    serv_req: { type: Schema.Types.ObjectId, ref: 'LoginUser'},               //LOGIN_USER_OBJ
    serv_prov_bidder: [{ type: Schema.Types.ObjectId, ref: 'LoginUser'}],     //{LIST OF LOGIN_USER_OBJ}
    serv_name: String,
    serv_cat_code: { type: Schema.Types.ObjectId, ref: 'ServCatRef' },
    serv_summ: String,
    is_public: Boolean,
    create_datetime: Date,
    serv_prov_min_age: Number,
    geo_location: String,
    serv_req_start_datetime: Date,
    serv_req_end_datetime: Date,
    price: Number,
    price_type_code: Number,
    price_currency_code: Number,
    price_range_code: Number,
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
});


SOHistSchema.statics.getUserHistoricalSO = function(params)
{
    let userRole;

    if(+params.so_type === 1)
        userRole = {serv_req: params.user_id};
    else if(+params.so_type === 2)
        userRole = {serv_prov: params.user_id};

    return this.find(userRole)
        .then(SOs => SOs)
};


module.exports = mongoose.model('SOHist', SOHistSchema, 'so_hist');