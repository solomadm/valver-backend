let mongoose = require('mongoose');
let Schema = mongoose.Schema;
const LoginUser = require('./login-user');
const UserProf = require('./user-prof');
const { setErrorWithStatusCode } = require('../helpers/global-helper');

let FavUsersSchema = new Schema({
    owner_id: { type: Schema.Types.ObjectId, ref: 'LoginUser'},
    fav_user: { type: Schema.Types.ObjectId, ref: 'LoginUser'},
    fav_user_profile: { type: Schema.Types.ObjectId, ref: 'UserProf'},
});

FavUsersSchema.index({owner_id: 1, fav_user: 1}, {unique: true});


FavUsersSchema.statics.addToFav = function (params, loggedUser)
{
    if(loggedUser.id === params.user_id)
        return Promise.resolve(setErrorWithStatusCode(400, 'user cannot add or remove himself as favorite one'));

    return LoginUser.findOne({_id: params.user_id})
        .then(foundUser => {

            if(!foundUser)
                return setErrorWithStatusCode(404, 'specified user not found');

            return UserProf.findOne({user_id: params.user_id})
                .then(favUserProf => {

                    let favUser = new this({
                        owner_id: loggedUser.id,
                        fav_user: params.user_id,
                        fav_user_profile: favUserProf.id
                    });

                    return favUser.save();
                });
        });
};


FavUsersSchema.statics.removeFromFav = function(params, loggedUser)
{
    if(loggedUser.id === params.user_id)
        return Promise.resolve(setErrorWithStatusCode(400, 'user cannot add or remove himself from favorite one'));

    return LoginUser.findOne({_id: params.user_id})
        .then(foundUser => {

            if(!foundUser)
                return setErrorWithStatusCode(404, 'specified user not found');

            return this.findOne({
                owner_id: loggedUser.id,
                fav_user: params.user_id
            })
                .then(favUser => {

                    if(!favUser)
                        return setErrorWithStatusCode(501, 'there is no such user in fav list');

                    return this.findOne({
                        owner_id: loggedUser.id,
                        fav_user: params.user_id
                    })
                        .remove()
                })
        });
};


FavUsersSchema.statics.getFavUsers = function(loggedUser)
{
    return this.find({owner_id: loggedUser.id})
        .populate('fav_user')
        .populate('fav_user_profile')
        .then(favUserObjects => {
            let favUsers = [];

            favUserObjects.forEach(f => favUsers.push({
                fav_user: f.fav_user,
                fav_user_profile: f.fav_user_profile
            }));

            return favUsers
        })
};


module.exports = mongoose.model('FavUsers', FavUsersSchema, 'fav_users');