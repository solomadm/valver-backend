let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const { setErrorWithStatusCode } = require('../helpers/global-helper');


let EventCatRefSchema = new Schema({
    event_cat_name: {type: String, unique: true},
    description: String,
    is_active: Boolean,
    priority_val: Number,
    create_date: Date,
    update_date: Date,
});


EventCatRefSchema.statics.createEventCategory = function (params) {
    let eventCatRef = new this({
        event_cat_name: params.event_cat_name,
        description: params.event_cat_desc,
        is_active: false,
        priority_val: 999
    });

    return eventCatRef.save();
};


EventCatRefSchema.statics.getEventCatRef = function(params, loggedUser)
{
    return this.findOne({
        _id: params.event_cat_id
    })
        .then(eventCat => {

            if (!eventCat)
                return setErrorWithStatusCode(404, 'Event_cat not found.');

            return eventCat
        })

};


module.exports = mongoose.model('EventCatRef', EventCatRefSchema, 'event_cat_ref');