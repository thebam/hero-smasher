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
        })
    
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
                    uName: name.toLowerCase(),
                    affinity: affinity,
                    rankings: rankings,
                    powers: powers,
                    traits: traits,
                    biography: biography,
                    images: images,
                    parents: parents,
                    createdBy: req.user._id
                };
                
                if(req.user.level === 'admin'){
                    if (coll) {
                        coll.findOne({ uName: character.name.toLowerCase() }, function (err, results) {
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
                }else{
                    var userColl = db.collection('userCharacters');
                    userColl.findOne({ uName: character.name.toLowerCase() }, function (err, results) {
                            if (err === null) {
                                if (results === null) {
                                    userColl.insert(character, function (err, results) {
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
        
    APIRouter.route('/search/:term/:official')
        .get(function (req,res) {
            var term = req.params.term;
            var isUserGenerated = req.params.official;
            if(isUserGenerated){
                if(isUserGenerated === 'true'){
                    isUserGenerated = true;
                }else{
                    isUserGenerated = false;
                }
            }else{
                isUserGenerated = false;
            }
            
            if(term){
                if(!isUserGenerated){
                    if(coll){
                        coll.find({ $or: [{ uName: {$regex: term, $options:'i'}}, {biography: { $regex: term, $options: 'i' }}]}).sort({'name':1}).toArray(function (err,results) {
                            if(err===null){
                                if (results !== null) {
                                    res.json(results);
                                } else {
                                    return res.send('No characters found.');
                                }
                            } else {
                                return res.send('Character not found due to server issue.');
                            }
                        });
                    }
                }else{
                    var userColl = db.collection('userCharacters');
                    userColl.find({ $or: [{ uName: {$regex: term, $options:'i'}}, {biography: { $regex: term, $options: 'i' }}]}).sort({'name':1}).toArray(function (err,results) {
                            if(err===null){
                                if (results !== null) {
                                    res.json(results);
                                } else {
                                    return res.send('No characters found.');
                                }
                            } else {
                                return res.send('Character not found due to server issue.');
                            }
                        });
                }
            }
        });
    APIRouter.route('/select/:start/:take')
        .get(function (req, res) {
            var start = req.params.start;
            var take = req.params.take;
            if (!start) {
                start = 0;
            } else {
                if (isNaN(start)) {
                    start = 0;
                }
                start = Number(start);
            }
            if (!take) {
                take = 8;
            } else {
                if (isNaN(take)) {
                    take = 8;
                }
                take = Number(take);
            }
            if (coll) {
                coll.find().sort({ 'name': 1 }).limit(take).skip(start).toArray(function (err, results) {
                    if (err === null) {
                        if (results !== null) {
                            return res.json(results);
                        } else {
                            return res.send('No characters found.');
                        }
                    } else {
                        return res.send('Character not found due to server issue.');
                    }
                });
            }


        });
    APIRouter.route('/edit/:id/:userGenerated')
        .get(function (req, res) {
            var id = req.params.id;
            var userGenerated = req.params.userGenerated;
            if(!userGenerated){
                userGenerated = false;
            }else{
                if(userGenerated === "true"){
                    userGenerated = true;
                }else{
                    userGenerated = false;
                }
            }
           
            if (id) {
                if(userGenerated===true){
                    var userColl = db.collection('userCharacters');
                    userColl.findOne({ uName: id.toLowerCase() }, function (err, results) {
                        if (err === null) {
                            if (results !== null) {
                                res.json(results);
                            } else {
                                if (id.length === 24) {
                                    id = new ObjectId(req.params.id);
                                    if (id) {
                                        if (userColl) {
                                            userColl.findOne({ _id: id }, function (err, results) {
                                                if (err === null) {
                                                    if (results !== null) {
                                                        res.json(results);
                                                    } else {
                                                        res.send('');
                                                    }
                                                } else {
                                                    res.send('');
                                                }
                                            });
                                        }
                                    }
                                } else {
                                    res.send('');
                                }
                            }
                        }
                    });
                }else{
                if (coll) {
                    coll.findOne({ uName: id.toLowerCase() }, function (err, results) {
                        if (err === null) {
                            if (results !== null) {
                                res.json(results);
                            } else {
                                if (id.length === 24) {
                                    id = new ObjectId(req.params.id);
                                    if (id) {
                                        if (coll) {
                                            coll.findOne({ _id: id }, function (err, results) {
                                                if (err === null) {
                                                    if (results !== null) {
                                                        res.json(results);
                                                    } else {
                                                        res.send('');
                                                    }
                                                } else {
                                                    res.send('');
                                                }
                                            });
                                        }
                                    }
                                } else {
                                    res.send('');
                                }
                            }
                        }
                    });
                }
                }
            }
        })
        .put(function (req, res) {
            if (req.user) {
                var id = new ObjectId(req.params.id);
                var userGenerated = req.params.userGenerated;
                var name = req.body.name;
                var biography = req.body.biography;
                var powers = req.body.powers;
                var rankings = req.body.rankings;
                var traits = req.body.traits;
                var images = req.body.images;
                var affinity = req.body.affinity;
                var parents = req.body.parents;
                
                if(userGenerated==='true'){
                    var userColl = db.collection('userCharacters');
                    
                    userColl.findOne({ _id: id },function (err,results) {
                        if(err===null){
                            if(results){
                                userColl.update({ _id: id }, {
                                    name: name,
                                    uName: name.toLowerCase(),
                                    affinity: affinity,
                                    rankings: rankings,
                                    powers: powers,
                                    traits: traits,
                                    biography: biography,
                                    images: images,
                                    parents: parents,
                                    createdBy: results.createdBy
                                }, function (err, results) {
                                    res.json(results);
                                });
                            }
                        }
                    });
                    
                    
                }else{
                if (coll) {
                    coll.update({ _id: id }, {
                        name: name,
                        uName: name.toLowerCase(),
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
                }}
            }
        });
    APIRouter.route('/delete/:id/:userGenerated')
        .get(function (req, res) {
            var id = new ObjectId(req.params.id);
            var userGenerated = req.params.userGenerated;
            if(!userGenerated){
                userGenerated = false;
            }else{
                if(userGenerated === 'true'){
                    userGenerated = true;
                }else{
                    userGenerated = false;
                }
            }
if(userGenerated===true){
            var userColl = db.collection('userCharacters');
                userColl.findOne({ _id: id }, function (err, results) {
                    res.json(results);
                });
            
}else{
    if (coll) {
                coll.findOne({ _id: id }, function (err, results) {
                    res.json(results);
                });
            }
}
        })
        .delete(function (req, res) {
            var id = new ObjectId(req.params.id);
            var userGenerated = req.params.userGenerated;
            if(!userGenerated){
                userGenerated = false;
            }else{
                if(userGenerated === 'true'){
                    userGenerated = true;
                }else{
                    userGenerated = false;
                }
            }
  
            if (req.user) {
            
                if(userGenerated === true){
               
                var userColl=db.collection('userCharacters');
                    userColl.remove({ _id: id }, function (err, results) {
                        res.json(results);
                    });
                }else{
                   
                    if (req.user.level==='admin') {
                        
                if (coll) {
                    coll.remove({ _id: id }, function (err, results) {
                        res.json(results);
                    });
                }}
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
                res.send(true);
            } else {
                res.send(false);
            }
        });
    APIRouter.route('/checkRights/:name')
        .get(function (req, res) {
            if (req.isAuthenticated()) {
                
                if(req.user.level === 'admin'){
                    res.send(true);
                }else{
                    var name = req.params.name;
                    if (name) {
                        var userColl = db.collection('userCharacters');
                        if (userColl) {
                            userColl.findOne({ uName: name.toLowerCase(), createdBy: req.user._id }, function (err, results) {
                                if (err === null) {
                                    if (results !== null) {
                                        res.send(true);
                                    } else {
                                        res.send(false);
                                    }
                                } else {
                                    res.send(false);
                                }
                            });
                        }else{
                            res.send(false);
                        }
                    }
                }   
            } else {
                res.send(false);
            }
        });
    return APIRouter;
};
module.exports = router;