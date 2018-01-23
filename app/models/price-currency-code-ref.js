let mongoose = require('mongoose');
let Schema = mongoose.Schema;


let PriceCurrencyCodeRefSchema = new Schema({
    price_currency_code: {type: String, unique: true},
    description: String,
    is_active: Boolean,
    create_date: Date,
    update_date: Date,
});


module.exports = mongoose.model('PriceCurrencyCodeRef', PriceCurrencyCodeRefSchema, 'price_currency_code_ref');