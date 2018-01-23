const SOMain = require('../models/so-main');
const SOHist = require('../models/so-hist');
const FavSO = require('../models/fav-so');
const logger = require('../helpers/logger');
const {validate, routeConstraints} = require('../helpers/request-validator');
const { isUserOwnerOfSO, send401response, handleError } = require('../helpers/global-helper');
const { saveAvatar } = require('../helpers/fs-promise');



function createSO(req, res)
{
    let errors = validate(req.body, routeConstraints.createsoreq);

    if(errors)
        return res.status(400).send({error: errors});

    if(!isUserOwnerOfSO(req.user.user.id, req.body.user_id))
        return send401response(res);

    SOMain.createSO(req.body, req.user.user)
        .then(so => {

            if(so.error)
                return res.status(so.statusCode).send({error: so.error});

            return res.json({
                "issuccess":true,
                "message":"SO created successfully",
                "so": so
            });
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@createSO --> '))
}


function modifySO(req, res)
{
    let errors = validate(req.body, routeConstraints.modifysobysoid);

    if(errors)
        return res.status(400).send({error: errors});

    SOMain.updateSO(req.body)
        .then(so => {

            if(so.error)
                return res.status(so.statusCode).send({error: so.error});

            return res.json({
                "issuccess":true,
                "message":"SO modified successfully",
                "updatedsoObj": so
            });
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@modifySO --> '))
}


function requesterStartSO(req, res)
{
    let errors = validate(req.body, routeConstraints.reqstartsobysoid);

    if(errors)
        return res.status(400).send({error: errors});

    if(!isUserOwnerOfSO(req.user.user.id, req.body.user_id))
        return send401response(res);

    SOMain.startSObyRequester(req.body)
        .then(so => {

            if(so.error)
                return res.status(so.statusCode).send({error: so.error});

            return res.json({
                issuccess:true,
                message: "SO started by requester"
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@requesterStartSO --> '))
}


function requesterEndSO(req, res)
{
    let errors = validate(req.body, routeConstraints.reqendsobysoid);

    if(errors)
        return res.status(400).send({error: errors});

    SOMain.endSObyRequester(req.body, req.user.user)
        .then(so => {

            if(so.error)
                return res.status(so.statusCode).send({error: so.error});

            return res.json({
                issuccess:true,
                message: "SO ended by requester"
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@requesterEndSO --> '))
}


function providerStartSO(req, res)
{
    let errors = validate(req.body, routeConstraints.provstartsobysoid);

    if(errors)
        return res.status(400).send({error: errors});

    SOMain.startSObyProvider(req.body, req.user.user)
        .then(so => {

            if(so.error)
                return res.status(so.statusCode).send({error: so.error});

            return res.json({
                issuccess:true,
                message: "SO started by provider"
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@requesterStartSO --> '))
}


function providerEndSO(req, res)
{
    let errors = validate(req.body, routeConstraints.provendsobysoid);

    if(errors)
        return res.status(400).send({error: errors});

    SOMain.endSObyProvider(req.body, req.user.user)
        .then(so => {

            if(so.error)
                return res.status(so.statusCode).send({error: so.error});

            return res.json({
                issuccess:true,
                message: "SO ended by provider"
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@providerEndSO --> '))
}


function providerAcceptSO(req, res)
{
    let errors = validate(req.body, routeConstraints.provacceptsobysoid);

    if(errors)
        return res.status(400).send({error: errors});

    SOMain.providerAcceptSO(req.body, req.user.user)
        .then(so => {

            if(so.error)
                return res.status(so.statusCode).send({error: so.error});

            let respObj = {
                issuccess:true,
                message:"SO accepted by provider",
                servCatMatched: true
            };

            if(so.hasOwnProperty('warning'))
            {
                respObj['warning'] = so.warning;
                respObj.servCatMatched = false;
            }

            res.json(respObj)
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@providerAcceptSO --> '))
}

function requesterAcceptSOFromProviderBidList(req, res)
{
    let errors = validate(req.body, routeConstraints.reqacceptprovbysoid);

    if(errors)
        return res.status(400).send({error: errors});

    if(!isUserOwnerOfSO(req.user.user.id, req.body.user_id))
        return send401response(res);

    SOMain.requesterAcceptSOFromProviderBidList(req.body, req.user.user)
        .then(so => {

            if(so.error)
                return res.status(so.statusCode).send({error: so.error});

            return res.json({
                issuccess: true,
                message: "SO accepted by provider",
                ReqAcceptServ: "Service provider " + so.serv_prov,

            })
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@requesterAcceptSOFromProviderBidList --> '))
}


function getSOByProvidersSOCategoryCollection(req, res)
{

    let errors = validate(req.body, routeConstraints.provgetsobycat);

    if(errors)
        return res.status(400).send({error: errors});

    SOMain.getSOByProvidersSOCategoryCollection(req.body, req.user.user)
        .then(SOs => {

            if(SOs.error)
                return res.status(SOs.statusCode).send({error: SOs.error});

            return res.json({
                issuccess:true,
                message:"SO retrieved successfully",
                SOList: SOs
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@getSOByProvidersSOCategoryCollection --> '))

}


function getMyUpcomingSO(req, res)
{
    let errors = validate(req.body, routeConstraints.getmyupcomingsoreq);

    if(errors)
        return res.status(400).send({error: errors});

    if(!isUserOwnerOfSO(req.user.user.id, req.body.user_id))
        return send401response(res);

    SOMain.getUsersUpcomingSO(req.body)
        .then(SOs => {
            if(SOs.error)
                return res.status(SOs.statusCode).send({error: SOs.error});

            return res.json({
                issuccess:true,
                message:"User SO successfully retrieved",
                SOList: SOs
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@getMyUpcomingSO --> '))
}


function getMyHistoricalSO(req, res)
{
    let errors = validate(req.body, routeConstraints.getmyhistoricalso);

    if(errors)
        return res.status(400).send({error: errors});

    if(!isUserOwnerOfSO(req.user.user.id, req.body.user_id))
        return send401response(res);

    SOHist.getUserHistoricalSO(req.body)
        .then(SOs => {
            if(SOs.error)
                return res.status(SOs.statusCode).send({error: SOs.error});

            return res.json({
                issuccess:true,
                message:"User SO successfully retrieved",
                SOList: SOs
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@getMyHistoricalSO --> '))
}


function requesterSetRatingForSOProvider(req, res)
{
    let errors = validate(req.body, routeConstraints.reqratesobysoid);

    if(errors)
        return res.status(400).send({error: errors});

    SOMain.setRatingForOppositeSOParty(req.body, req.user.user, 'provider')
        .then(profile => {

            if(profile.error)
                return res.status(profile.statusCode).send({error: profile.error});

            res.json({
                issuccess:true,
                message:"Requestor successfully rated SO",
                profile
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@requesterSetRatingForSOProvider --> '))
}


function providerSetRatingForSORequester(req, res)
{

    if(!isUserOwnerOfSO(req.user.user.id, req.body.user_id))
        return send401response(res);

    let errors = validate(req.body, routeConstraints.reqratesobysoid);

    if(errors)
        return res.status(400).send({error: errors});

    SOMain.setRatingForOppositeSOParty(req.body, req.user.user, 'requester')
        .then(profile => {

            if(profile.error)
                return res.status(profile.statusCode).send({error: profile.error});

            res.json({
                issuccess:true,
                message:"Provider successfully rated SO",
                profile
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@providerSetRatingForSORequester --> '))
}


function getActiveSO(req, res)
{
    let errors = validate(req.body, routeConstraints.getactiveso);

    if(errors)
        return res.status(400).send({error: errors});

    SOMain.getActiveSO(req.body, req.user.user)
        .then(SOs => {

            if(SOs.error)
                return res.status(SOs.statusCode).send({error: SOs.error});

            res.json({
                issuccess: true,
                message:"SO list retrieved successfully.",
                SOList: SOs
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@getActiveSO --> '))
}


function cancelSO(req, res)
{
    let errors = validate(req.body, routeConstraints.cancelsobysoid);

    if(errors)
        return res.status(400).send({error: errors});

    SOMain.cancelSO(req.body)
        .then(resp => {

            if(resp.error)
                return res.status(resp.statusCode).send({error: resp.error});

            res.json({
                issuccess: true,
                message:"SO cancelled successfully."
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@cancelSO --> '))

}


function addFavSO(req, res)
{
    let errors = validate(req.body, routeConstraints.addfavso);

    if(errors)
        return res.status(400).send({error: errors});

    FavSO.addFav(req.body, req.user.user)
        .then(resp => {

            if(resp.error)
                return res.status(resp.statusCode).send({error: resp.error});

            res.json({
                issuccess: true,
                message:"SO successfully added to favorite"
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@cancelSO --> '))
}


function removeSOFromFav(req, res)
{
    let errors = validate(req.body, routeConstraints.removesofromfav);

    if(errors)
        return res.status(400).send({error: errors});

    FavSO.removeFromFav(req.body, req.user.user)
        .then(resp => {
            if(resp.error)
                return res.status(resp.statusCode).send({error: resp.error});

            res.json({
                issuccess: true,
                message:"SO successfully removed from favorite"
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@cancelSO --> '))
}


function getFavSOs(req, res)
{
    FavSO.getFavSOs(req.user.user)
        .then(favSOs => {
            if(favSOs.error)
                return res.status(favSOs.statusCode).send({error: favSOs.error});

            res.json({
                issuccess: true,
                favSOs:favSOs
            })
        })
        .catch(err => handleError(res, err, req.uuid, 'so.controller@cancelSO --> '))
}


function uploadSOAvatar(req, res)
{
    if (!req.files)
        return res.status(400).json({error: 'No files were uploaded.'});

    let errors = validate(req.body, routeConstraints.uploadsoavatar);

    if(errors)
        return res.status(400).send({error: errors});

    saveAvatar(req.files.avatar, req.body.so_id, 'SO')
        .then((avatarPath) => {
            SOMain.setSOAvatar(avatarPath, req.user.user, req.body.so_id)
                .then(so => {

                    if(so.error)
                        return res.status(so.statusCode).send({error: so.error});

                    res.send({
                        issuccess: true,
                        avatar: avatarPath,
                        so: so
                    });
                })
        })
        .catch(err => handleError(res, err, req.uuid, 'users.controller@uploadUserAvatar -->'));
}


module.exports = {
    createSO,
    modifySO,
    requesterStartSO,
    providerStartSO,
    providerEndSO,
    requesterEndSO,
    providerAcceptSO,
    requesterAcceptSOFromProviderBidList,
    getSOByProvidersSOCategoryCollection,
    getMyUpcomingSO,
    getMyHistoricalSO,
    requesterSetRatingForSOProvider,
    providerSetRatingForSORequester,
    getActiveSO,
    cancelSO,
    addFavSO,
    removeSOFromFav,
    getFavSOs,
    uploadSOAvatar
};

