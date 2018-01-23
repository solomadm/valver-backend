const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const env = require('../../config/env');
const easyimg = require('easyimage');


function readFile(filePath) {
    return fs.readFileAsync(filePath, 'utf8')
}


function loadWebPage(pageFilePath)
{
    return readFile('app/web/html/index.html')
        .then(indexFile => {
            return readFile(pageFilePath)
                .then(pageFile => {
                    return indexFile.toString().replace('{{HTML-BODY}}',pageFile.toString());
                })
        })
}


function saveAvatar(avatarSrc, avatarName, envVar)
{
    let avatarSaver = Promise.promisify(avatarSrc.mv,{context: avatarSrc});

    let ext = defineFileExtension(avatarSrc.mimetype);

    if(ext !== '.jpeg' && ext !== '.png')
        return Promise.reject({message: 'Image file must be .png or .jpeg', code: 501});

    let uploadLocalPath = 'uploads/avatars/' + avatarName + ext;

    return avatarSaver(uploadLocalPath).then(()=> {

        return easyimg.resize({
            src: uploadLocalPath,
            dst: env[envVar].avatar.folder + avatarName + ext,
            width: env[envVar].avatar.width,
            height: env[envVar].avatar.height
        })
            .then(image => {

                fs.unlink(uploadLocalPath);

                return image.path;
            });
    } );
}


function defineFileExtension(mimeType)
{
    if(mimeType.indexOf('jpeg') !== -1)
        return '.jpeg';

    if(mimeType.indexOf('png') !== -1)
        return '.png';

    //TODO feel free to add more cases
}

module.exports = {
    readFile,
    saveAvatar,
    loadWebPage
};