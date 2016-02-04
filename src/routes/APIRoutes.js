var express = require('express');
var config = require('../../config');
var mongodb = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var APIRouter = express.Router();

var mongoURL = config.db;
APIRouter.route('/')
    .get(function (req, res) {
        mongodb.connect(mongoURL, function (err, db) {
            var collection = db.collection('characters');
            collection.find().toArray(function (err, results) {
                res.json(results);
                db.close();
            });
        });
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

            mongodb.connect(mongoURL, function (err, db) {
                var collection = db.collection('characters');
                collection.findOne({ name: character.name }, function (err, results) {
                    if (err === null) {
                        if (results === null) {
                            collection.insert(character, function (err, results) {
                                return res.send(true);
                                db.close();
                            });
                        } else {
                            return res.send('A character with that name already exists.');
                        }
                    } else {
                        return res.send('Character not created due to server issue.');
                    }
                });
            });
        }
    });
APIRouter.route('/edit/:id')
    .get(function (req, res) {
        var id = new ObjectId(req.params.id);
        mongodb.connect(mongoURL, function (err, db) {
            var collection = db.collection('characters');
            collection.findOne({ _id: id }, function (err, results) {
                res.json(results);
                db.close();
            });
        });
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
            mongodb.connect(mongoURL, function (err, db) {
                var collection = db.collection('characters');
                collection.update({ _id: id }, {
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
                    db.close();
                });
            });
        }
    });
APIRouter.route('/delete/:id')
    .get(function (req, res) {
        var id = new ObjectId(req.params.id);
        mongodb.connect(mongoURL, function (err, db) {
            var collection = db.collection('characters');
            collection.findOne({ _id: id }, function (err, results) {
                res.json(results);
                db.close();
            });
        });
    });
APIRouter.route('/delete/:id')
    .delete(function (req, res) {
        if (req.user) {
            var id = new ObjectId(req.params.id);
            mongodb.connect(mongoURL, function (err, db) {
                var collection = db.collection('characters');
                collection.remove({ _id: id }, function (err, results) {
                    res.json(results);
                    db.close();
                });
            });
        }
    });

APIRouter.route('/signUp')
    .post(function (req, res) {
        bcrypt.hash(req.body.password, null, null, function (err, hash) {
            var user = { username: req.body.email, password: hash, level: 'user' };
            mongodb.connect(mongoURL, function (err, db) {
                var collection = db.collection('users');
                collection.findOne({ username: user.username }, function (err, results) {
                    if (err === null) {
                        if (results === null) {
                            collection.insert(user, function (err, results) {
                                req.login(results.ops[0], function () {
                                    res.send(true);
                                    db.close();
                                });
                            });
                        } else {
                            res.send('Email already in use.');
                        }
                    } else {
                        res.send('The account wasn\'t created due to a server error.');
                    }
                });
            });
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
module.exports = APIRouter;