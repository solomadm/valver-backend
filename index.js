// index.js
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('./config/env');
const fs = require('fs');
const https = require('https');
const routes = require('./app/routes/index.route');
const webRoutes = require('./app/web/routes/index.route');
const { auth } = require('./app/middlewares');
const logger = require('./app/helpers/logger');
const fileUpload = require('express-fileupload');
const cors = require('cors')

mongoose.Promise = global.Promise;

let database = process.env.NODE_ENV === 'production'? config.database_production : config.database_developer;

mongoose.connect(database);

const jwt = require("jwt-simple");
const port = process.env.PORT || 443;

options = {
    key: fs.readFileSync('./ssl/dev/host.key'),
    cert: fs.readFileSync('./ssl/dev/host.cert'),
};

let app = express();

let mode = process.env.NODE_ENV === 'production'? 'production' : 'developer';

let server = https.createServer(options, app).listen(port, function () {
        console.log("Valver-backend server listening on port " + port + " in " + mode + ' mode');
    }
);

// app.listen(80, function () {
//     console.log('Example app listening on port 80!')
// })

app.use(fileUpload({
    limits: { fileSize: 1 * 1024 * 1024 },
}));

// Open "uploads" folder to be statically loaded via express
app.use('/public',express.static('public'));

// Add bodyParser and allow urlencoded requests and other options
app.use(bodyParser.urlencoded(mode === 'production'? config.bodyParser_production: config.bodyParser_developer));

// Allow CORS
if(mode === 'developer')
    app.use(cors());

// Write to console
if(mode === 'developer')
    app.use(morgan('dev'));

// Enable Passport authorization
app.use(auth.initialize());


app.get("/", function (req, res) {
    res.json({
        status: "/ route is alive!"
    });
});

app.use('/api', routes);

app.use('/web', webRoutes);


module.exports = app;