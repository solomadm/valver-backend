const {readFile, loadWebPage} = require('../../helpers/fs-promise');

function showRegistrationForm(req, res)
{
    loadWebPage('app/web/html/pages/registration-page.html')
        .then(page => {
            res.send(page);
        })
}


function showLoginForm(req, res)
{
    loadWebPage('app/web/html/pages/login-page.html')
        .then(page => {
            res.send(page);
        })
}


module.exports = {
    showRegistrationForm,
    showLoginForm
};