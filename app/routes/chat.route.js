let express = require('express');
const router = express.Router();

let dialogueRoutes = require('./chat-routes/dialogue.route');


router.use('/dialogue', dialogueRoutes);



module.exports = router;