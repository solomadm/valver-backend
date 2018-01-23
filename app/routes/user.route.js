let express = require('express');
const router = express.Router();
let usersCtrl = require('../controllers/users.controller');


router.route('/deleteuser/:id').post(usersCtrl.deleteUser);

router.route('/getnerbyprovidersbycat').post(usersCtrl.getNearbyProvidersByCategory);

router.route('/updateuserprofile').post(usersCtrl.setUserProfile);

router.route('/searchuserdetailsbyfilter').post(usersCtrl.searchForUsers);

router.route('/activateuserbycode').post(usersCtrl.activateAccountViaSMSCode);

router.route('/reqnewactivcode').post(usersCtrl.requireNewActivationCode);

router.route('/updateuserlogindetails').post(usersCtrl.updateUserLoginModel);

router.route('/updateuserprofbylinkedin').post(usersCtrl.updateProfileFromLinkedin);

router.route('/sendinvitationbyemail').post(usersCtrl.sendInvitationByEmail);

router.route('/sendinvitationbysms').post(usersCtrl.sendInvitationBySMS);

router.route('/uploaduseravatar').post(usersCtrl.uploadUserAvatar);

router.route('/getupcomingusersos').get(usersCtrl.getUpcomingUserSOs);

router.route('/getpassedusersos').get(usersCtrl.getPassedUserSOs);

router.route('/getongoingusersos').get(usersCtrl.getOnGoingUserSOs);

router.route('/getupcominguserevents').get(usersCtrl.getUpcomingUserEvents);

router.route('/getpasseduserevents').get(usersCtrl.getPassedUserEvents);

router.route('/getongoinguserevents').get(usersCtrl.getOnGoingUserEvents);

router.route('/addtofavusers').post(usersCtrl.addToFavUsers);

router.route('/removefromfavusers').post(usersCtrl.removeFromFavUsers);

router.route('/getfavusers').get(usersCtrl.getFavUsers);

router.route('/confirmnationalid/:id').get(usersCtrl.confirmNationalId);

router.route('/confirmcrc/:id').get(usersCtrl.confirmCriminalRecordCheck);

router.route('/:id').get(usersCtrl.getUserById);


module.exports = router;