var express = require('express');
var mongodb = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var APIRouter = express.Router();

var mongoURL = 'mongodb://localhost:27017/heroSmasher';

APIRouter.route('/')
    .post(function (req, res) {
        console.log('here');
        console.log(req.body.name);
        var name = req.body.name;
        var biography = req.body.biography;
        var powers = req.body.powers;
        var traits = req.body.traits;
        var character = {
            name: name,
            powers: powers,
            traits: traits,
            biography: biography
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
        var id = new objectId(req.params.id);
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
        var id = new objectId(req.params.id);
        var name = req.body.name;
        var biography = req.body.biography;
        var powers = req.body.powers;
        var traits = req.body.traits;
        mongodb.connect(mongoURL, function (err, db) {
            var collection = db.collection('characters');
            collection.update({ _id: id },{
                name: name,
                powers: powers,
                traits: traits,
                biography: biography
            }, function (err, results) {
                res.json(results);
                db.close();
            });
        });
    });
APIRouter.route('/delete/:id')
    .get(function (req, res) {
        var id = new objectId(req.params.id);
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
        var id = new objectId(req.params.id);
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
module.exports = APIRouter;