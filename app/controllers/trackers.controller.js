const ServCatRef = require('../models/serv-cat-ref');
const LoginUser = require('../models/login-user');
const UserProf = require('../models/user-prof');
const Language = require('../models/languages');
const PriceCurrencyCodeRef = require('../models/price-currency-code-ref');
const {validate, routeConstraints} = require('../helpers/request-validator');
const { handleError } = require('../helpers/global-helper');


function createNewCategory(req, res)
{
    let errors = validate(req.body, routeConstraints.createnewservicecat);

    if(errors)
        return res.status(400).send({error: errors});

    ServCatRef.createNewCategory(req.body)
        .then(category => {
            res.json({
                issuccess: true,
                message: "Service cat added with name: " + category.serv_cat_name,
                category: category
            })
        })
        .catch(err => {

            if(err.name === 'MongoError' && err.code === 11000)
                return res.status(502).send({error:"serv_cat_name could not be added, serv_cat_name exists"});

            handleError(res, err, req.uuid, 'trackers.controller@createNewCategory --> ')
        })
}


function searchCategory(req, res){

    let errors = validate(req.body, routeConstraints.searchbycatname);

    if(errors)
        return res.status(502).send({error: errors});

    ServCatRef.searchCategory(req.body)
        .then(categories => {

            return res.json({
                issuccess: true,
                serv_cat_list: categories
            })

        })
        .catch(err => {handleError(res, err, req.uuid, 'trackers.searchCategory@searchCategory --> ')})

}


function updateUserGeoLocation(req, res)
{
    let errors = validate(req.body, routeConstraints.updateusergeolocation);

    if(errors)
        return res.status(400).send({error: errors});

    UserProf.setNewGeoLocation(req.body, req.user.user)
        .then(profile => {

            if(profile.error)
                return res.status(profile.statusCode).send({error: profile.error});

            res.json({
                issuccess:true,
                message:"Geo-location for user: "+ req.user.user.id +" has been updated successfully",
                new_geo_location: profile.geo_location
            })

        })
        .catch(err => handleError(res, err, req.uuid, 'trackers.controller@updateUserGeoLocation --> '))
}


function getAllSOCategories(req, res)
{
    ServCatRef.find({})
        .then(cats => {
            res.send({
                issucess: true,
                so_categories: cats
            })
        });
}


function getLanguages(req, res)
{
    Language.find({is_active: true})
        .then(langs => {
            res.json({
                issuccess: true,
                languages: langs
            })
        })
        .catch(err => {
            handleError(res, err, req.uuid, 'tracker.controller@getLanguages --> ')
        })
}


function getCurrencyCodes (req, res)
{
    PriceCurrencyCodeRef.find({is_active:true})
        .then(codes => {
            res.send({
                isuccess: true,
                currency_codes: codes
            })
        })
        .catch(err => {
            handleError(res, err, req.uuid, 'tracker.controller@getCurrencyCodes --> ')
        })
}


function dateCheckpoint(req, res)
{
    LoginUser.dateCheckpoint(req.user.user)
        .then(result => {

            if(result.error)
                return res.status(result.statusCode).send({error: result.error});

            res.send({
                isuccess: true,
                result: result
            })
        })
        .catch(err => {
            handleError(res, err, req.uuid, 'tracker.controller@dateCheckpoint --> ')
        })
}


module.exports = {
    createNewCategory,
    searchCategory,
    updateUserGeoLocation,
    getAllSOCategories,
    getLanguages,
    getCurrencyCodes,
    dateCheckpoint
};

