let mongoose = require('mongoose');
let Schema = mongoose.Schema;


let EventMainSchema = new Schema({
    event_host: { type: Schema.Types.ObjectId, ref: 'LoginUser'},       // LOGIN_USER_OBJ/GROUP_OBJ
    event_party: [{ type: Schema.Types.ObjectId, ref: 'LoginUser'}],    // array of LOGIN_USER_OBJ
    event_name: String,
    event_cat_code: Number,
    event_summ: String,
    is_public: Boolean,
    create_date: Date,
    min_age: Number,
    geo_location: String,
    event_size: Number,
    event_lang: String,
    event_start_date: Date,
    event_and_date: Date,
    deadline_join_date: Date,
    price: Number,
    price_type_code: Number,
    price_currency_code: Number,
    price_range_code: Number,
    is_active: Boolean,
    is_order_picked_up: Boolean,
    is_started: Boolean,
    is_ended: Boolean,
    is_order_success: Boolean,
    is_paid: Boolean,
    err_msg: String,
});


module.exports = mongoose.model('EventMain', EventMainSchema);