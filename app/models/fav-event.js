let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const LoginUser = require('./login-user');
const EventMain = require('./event-main');
const { setErrorWithStatusCode } = require('../helpers/global-helper');

let FavEventSchema = new Schema({
    owner_id: { type: Schema.Types.ObjectId, ref: 'LoginUser'},
    event_id: { type: Schema.Types.ObjectId, ref: 'EventMain'}
});

FavEventSchema.index({owner_id: 1, event_id: 1}, {unique: true});


FavEventSchema.statics.addFavEvent = function(params, loggedUser)
{
    return EventMain.findOne({_id: params.event_id})
        .then(eventMain => {

            if(!eventMain)
                return setErrorWithStatusCode(404, 'specified event not found');

            if(eventMain.event_host.toString() === loggedUser.id)
                return setErrorWithStatusCode(501, 'event host cannot add his own event to favorite list');

            let favEvent = new this({
                owner_id: loggedUser.id,
                event_id: params.event_id
            });

            return favEvent.save();
        })

};


FavEventSchema.statics.removeFavEvent = function(params, loggedUser)
{
    return this.findOne({
        owner_id: loggedUser.id,
        event_id: params.event_id
    })
        .then(favEvent => {

            if(!favEvent)
                return setErrorWithStatusCode(501, 'specified event is not in favorite list');

            return this.findOne({
                owner_id: loggedUser.id,
                event_id: params.event_id
            })
                .remove()
        })
};


FavEventSchema.statics.getFavEvents = function (loggedUser)
{
    return this.find({owner_id: loggedUser.id})
        .populate('event_id')
};


module.exports = mongoose.model('FavEvent', FavEventSchema, 'fav_events');