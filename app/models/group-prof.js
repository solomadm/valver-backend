let mongoose = require('mongoose');
let Schema = mongoose.Schema;


let GroupProfSchema = new Schema({
    group_name: String,
    group_description: String,
    group_about_msg: String,
    group_service_cat: [{ type: Schema.Types.ObjectId, ref: 'ServCatRef'}], //LIST OF SERV_CAT_CODE
    group_rating_hist: Number, //double
    no_of_serv_complete: Number,
    no_of_serv_canceled: Number,
    serve_price_range_code: Number,
    group_feedback_cm_hist: Array,
});


module.exports = mongoose.model('GroupProf', GroupProfSchema);