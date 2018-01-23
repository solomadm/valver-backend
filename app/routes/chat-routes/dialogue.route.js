let express = require('express');
const router = express.Router();
let DialoguesCtrl = require('../../controllers/chat-controllers/dialogues.controller');


router.route('/subscribe/:interlocutorId').get(DialoguesCtrl.subscribe);

router.route('/publish/:interlocutorId').post(DialoguesCtrl.publish);





module.exports = router;