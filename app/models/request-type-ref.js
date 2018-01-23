let mongoose = require('mongoose');
let Schema = mongoose.Schema;


let RequestTypeRefSchema = new Schema({
    request_type_code: Number,
    description: String,
    is_active: Boolean,
    create_date: Date,
    update_date: Date,
});


module.exports = mongoose.model('RequestTypeRef', RequestTypeRefSchema);