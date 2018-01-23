let passport = require("passport");
let passportJWT = require("passport-jwt");
let cfg = require("../../config/env.js");
let ExtractJwt = passportJWT.ExtractJwt;
let Strategy = passportJWT.Strategy;
let User = require('../models/login-user');
let params = {
    secretOrKey: cfg.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeader()
};


let strategy = new Strategy(params, function(payload, done) {
    User.findOne({_id: payload.id})
        .then(user => {
            return done(null, {
                user: user
            });
        })
        .catch(err => {return done(new Error("User not found"), null);});
});

passport.use(strategy);



module.exports =  {
    initialize: function() {
        return passport.initialize();
    },
    authenticate: function() {
        return passport.authenticate("jwt", cfg.jwtSession);
    }
};