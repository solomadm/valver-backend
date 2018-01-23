let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const LoginUser = require('./login-user');
const SOMain = require('./so-main');
const { setErrorWithStatusCode } = require('../helpers/global-helper');

let FavSOSchema = new Schema({
    owner_id: { type: Schema.Types.ObjectId, ref: 'LoginUser'},
    so_id: { type: Schema.Types.ObjectId, ref: 'SOMain'}
});

FavSOSchema.index({owner_id: 1, so_id: 1}, {unique: true});


FavSOSchema.statics.addFav = function(params, loggedUser)
{
    return SOMain.findOne({_id: params.so_id})
        .then(so => {

            if(!so)
                return setErrorWithStatusCode(404, 'specified SO not found');

            if(so.serv_req.toString() === loggedUser.id)
                return setErrorWithStatusCode(501, 'service requester cannot add his own SO to favorite list');

            let favSO = new this({
                owner_id: loggedUser.id,
                so_id: params.so_id
            });

            return favSO.save();
        });
};


FavSOSchema.statics.removeFromFav = function (params, loggedUser)
{
    return this.findOne({
        owner_id: loggedUser.id,
        so_id: params.so_id
    })
        .then(favSO => {

            if(!favSO)
                return setErrorWithStatusCode(501, 'there is no such SO in fav list');

            return this.findOne({
                owner_id: loggedUser.id,
                so_id: params.so_id
            })
                .remove()
        })
};


FavSOSchema.statics.getFavSOs = function(loggedUser)
{
    return this.find({owner_id: loggedUser.id})
        .populate('so_id')
        .then(favSOs => favSOs)
};


module.exports = mongoose.model('FavSO', FavSOSchema, 'fav_so');