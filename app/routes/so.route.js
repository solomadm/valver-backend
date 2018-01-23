let express = require('express');
const router = express.Router();
let SOCtrl = require('../controllers/so.controller');


router.route('/createsoreq').post(SOCtrl.createSO);


router.route('/modifysobysoid').post(SOCtrl.modifySO);


router.route('/reqstartsobysoid').post(SOCtrl.requesterStartSO);


router.route('/provstartsobysoid').post(SOCtrl.providerStartSO);


router.route('/provendsobysoid').post(SOCtrl.providerEndSO);


router.route('/reqendsobysoid').post(SOCtrl.requesterEndSO);


router.route('/provacceptsobysoid').post(SOCtrl.providerAcceptSO);


router.route('/reqacceptprovbysoid').post(SOCtrl.requesterAcceptSOFromProviderBidList);


router.route('/provgetsobycat').post(SOCtrl.getSOByProvidersSOCategoryCollection);


router.route('/getmyupcomingsoreq').post(SOCtrl.getMyUpcomingSO);


router.route('/getmyhistoricalso').post(SOCtrl.getMyHistoricalSO);


router.route('/reqratesobysoid').post(SOCtrl.requesterSetRatingForSOProvider);


router.route('/provratesobysoid').post(SOCtrl.providerSetRatingForSORequester);


router.route('/getactiveso').post(SOCtrl.getActiveSO);


router.route('/cancelsobysoid').post(SOCtrl.cancelSO);


router.route('/addfavso').post(SOCtrl.addFavSO);


router.route('/removesofromfav').post(SOCtrl.removeSOFromFav);


router.route('/getfavsos').get(SOCtrl.getFavSOs);


router.route('/uploadsoavatar').post(SOCtrl.uploadSOAvatar);


module.exports = router;