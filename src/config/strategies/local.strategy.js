var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
module.exports = function (db) {
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    function (username, password, done) {
        if(db) {
            var users = db.collection('users');
            users.findOne({ username: username }, function (err, user) {
                if (err) { return done(err); }
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
        }
    }));
};
