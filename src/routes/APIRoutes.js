var express = require('express');
var mongodb = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var passport =require('passport');
var APIRouter = express.Router();

var mongoURL = 'mongodb://localhost:27017/heroSmasher';

APIRouter.route('/')
    .post(function (req, res) {
        console.log(req.body.name);
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
            rankings:rankings,
            powers: powers,
            traits: traits,
            biography: biography,
            images: images,
            parents: parents
        };
        
        mongodb.connect(mongoURL, function (err, db) {
            var collection = db.collection('characters');
            collection.insert(character, function (err, results) {
                res.send(results);
                db.close();
            });
        });
    });
APIRouter.route('/edit/:id')
    .get(function(req,res){
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
            collection.update({ _id: id },{
                name: name,
                affinity: affinity,
                rankings:rankings,
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
        var id = new ObjectId(req.params.id);
        mongodb.connect(mongoURL, function (err, db) {
            var collection = db.collection('characters');
            collection.remove({ _id: id }, function (err, results) {
                res.json(results);
                db.close();
            });
        });
    });
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
APIRouter.route('/signUp')
    .post(function (req, res) {
        var user = {username:req.body.username,password:req.body.password};
        mongodb.connect(mongoURL, function (err, db) {
        var collection = db.collection('users');
        
        //do a select to make sure the user doesn't already exist 
        collection.insert(user, function (err, results) {
            req.login(results.ops[0], function () {
                res.send(true);
            });
            db.close();
        });
    });
});

	APIRouter.route('/signIn')
	        .post(passport.authenticate('local',{failureRedirect:'/'}),function(req,res){
                console.log(true);
	            res.send(true);
        });
module.exports = APIRouter;