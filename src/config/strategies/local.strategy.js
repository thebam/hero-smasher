var passport = require('passport');
var config = require('../../../config');
var LocalStrategy = require('passport-local').Strategy;
var mongodb = require('mongodb').MongoClient;
var bcrypt = require('bcrypt-nodejs');
module.exports = function () {
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    function (username, password, done) {
        var mongoURL = config.db;
        mongodb.connect(mongoURL, function (err, db) {
            var collection = db.collection('users');
            collection.findOne({ username: username }, function (err, user) {
                if (err) { return done(err);}
                if (user !== null) {
                    bcrypt.compare(password, user.password, function (err, res) {
                        if (res === true) {
                            return done(null, user);
                        } else {
                            return done(null, false);
                        }
                    });
                } else {
                    return done(null, false);
                }
            });
        });
    }));
};
