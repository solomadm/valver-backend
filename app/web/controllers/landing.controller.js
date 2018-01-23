const {loadWebPage} = require('../../helpers/fs-promise');


function showMainPage(req, res)
{
    loadWebPage('app/web/html/pages/main-page.html')
        .then(page => {
            res.send(page);
        })
}


module.exports = {
    showMainPage
};