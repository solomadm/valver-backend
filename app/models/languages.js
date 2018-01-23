let mongoose = require('mongoose');
let Schema = mongoose.Schema;


let LanguageSchema = new Schema({
    code: {type: String, unique: true},
    name: String,
    is_active: Boolean,
});

module.exports = mongoose.model('Language', LanguageSchema, 'languages');