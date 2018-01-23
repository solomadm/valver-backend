const expPoints = require('../../../config/user-exp-points');

function defineExpPointsAdd(oldValObj, newValObj) {

    let expPointsToAdd = 0;

    if(!oldValObj.pref_name && newValObj.pref_name)
        expPointsToAdd += expPoints.fullName;

    if(!oldValObj.education && newValObj.education)
        expPointsToAdd += expPoints.education;

    if(!oldValObj.occupation_title && newValObj.occupation_title)
        expPointsToAdd += expPoints.jobTitle;

    if(!oldValObj.user_about_msg && newValObj.user_about_msg)
        expPointsToAdd += expPoints.aboutMe;

    if(!oldValObj.linkedin_acc && newValObj.linkedin_acc)
        expPointsToAdd += expPoints.linkedIn;

    if(!oldValObj.facebook_acc && newValObj.facebook_acc)
        expPointsToAdd += expPoints.facebook;

    if(!oldValObj.home_address && newValObj.home_address)
        expPointsToAdd += expPoints.homeAddress;

    if(!oldValObj.work_address && newValObj.work_address)
        expPointsToAdd += expPoints.workAddress;

    return expPointsToAdd;
}



module.exports = {
    defineExpPointsAdd
};