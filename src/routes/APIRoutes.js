var express = require('express');
var ObjectId = require('mongodb').ObjectID;
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var APIRouter = express.Router();


var router = function (coll, db) {
    APIRouter.route('/')
        .get(function (req, res) {
            if (coll) {
                coll.find().toArray(function (err, results) {
                    res.json(results);
                });
            }
        });
    APIRouter.route('/')
        .post(function (req, res) {
            if (req.user) {
                var name = req.body.name;
                var biography = req.body.biography;
                var powers = req.body.powers;
                var rankings = req.body.rankings;
                var traits = req.body.traits;
                var images = req.body.images;
                var affinity = req.body.affinity;
                var parents = req.body.parents;
                var character = {
                    name: name,
                    affinity: affinity,
                    rankings: rankings,
                    powers: powers,
                    traits: traits,
                    biography: biography,
                    images: images,
                    parents: parents
                };
                if (coll) {
                    coll.findOne({ name: character.name }, function (err, results) {
                        if (err === null) {
                            if (results === null) {
                                coll.insert(character, function (err, results) {
                                    return res.send(true);
                                });
                            } else {
                                return res.send('A character with that name already exists.');
                            }
                        } else {
                            return res.send('Character not created due to server issue.');
                        }
                    });
                }
            }
        });
    APIRouter.route('/edit/:id')
        .get(function (req, res) {
            var id = new ObjectId(req.params.id);
            if (id) {
                if (coll) {
                    coll.findOne({ _id: id }, function (err, results) {
                        res.json(results);
                    });
                }
            }
        });
    APIRouter.route('/edit/:id')
        .put(function (req, res) {
            if (req.user) {
                var id = new ObjectId(req.params.id);
                var name = req.body.name;
                var biography = req.body.biography;
                var powers = req.body.powers;
                var rankings = req.body.rankings;
                var traits = req.body.traits;
                var images = req.body.images;
                var affinity = req.body.affinity;
                var parents = req.body.parents;
                if (coll) {
                    coll.update({ _id: id }, {
                        name: name,
                        affinity: affinity,
                        rankings: rankings,
                        powers: powers,
                        traits: traits,
                        biography: biography,
                        images: images,
                        parents: parents
                    }, function (err, results) {
                        res.json(results);
                    });
                }
            }
        });
    APIRouter.route('/delete/:id')
        .get(function (req, res) {
            var id = new ObjectId(req.params.id);
            if (coll) {
                coll.findOne({ _id: id }, function (err, results) {
                    res.json(results);
                });
            }
        });
    APIRouter.route('/delete/:id')
        .delete(function (req, res) {
            if (req.user) {
                var id = new ObjectId(req.params.id);
                if (coll) {
                    coll.remove({ _id: id }, function (err, results) {
                        res.json(results);
                    });
                }
            }
        });

    APIRouter.route('/signUp')
        .post(function (req, res) {
            bcrypt.hash(req.body.password, null, null, function (err, hash) {
                var user = { username: req.body.email, password: hash, level: 'user' };
                if (db) {
                    var users = db.collection('users');
                    users.findOne({ username: user.username }, function (err, results) {
                        if (err === null) {
                            if (results === null) {
                                users.insert(user, function (err, results) {
                                    req.login(results.ops[0], function () {
                                        res.send(true);
                                    });
                                });
                            } else {
                                res.send('Email already in use.');
                            }
                        } else {
                            res.send('The account wasn\'t created due to a server error.');
                        }
                    });
                }
            });
        });

    APIRouter.route('/signIn')
        .post(function (req, res, next) {
            passport.authenticate('local', function (err, user, info) {
                if (err) {
                    return res.send('Login failed. Please check your email address and password.');
                } else {
                    if (!user) {
                        return res.send('Login failed. Please check your email address and password.');
                    } else {
                        req.logIn(user, function (err) {
                            if (err) {
                                return res.send('Login failed. Please check your email address and password.');
                            } else {
                                return res.send(true);
                            }
                        });
                    }
                }

            })(req, res, next);
        });
    APIRouter.route('/signOut')
        .get(function (req, res) {
            req.logout();
            return res.send(true);
        });

    APIRouter.route('/checkAuth')
        .get(function (req, res) {
            if (req.isAuthenticated()) {
                console.log('check auth true');
                res.send(true);
            } else {
                console.log('check auth false');
                res.send(false);
            }
        });
    return APIRouter;
};
module.exports = router;