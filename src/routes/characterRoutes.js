var express = require('express');
var mongodb = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var characterRouter = express.Router();

var mongoURL = 'mongodb://localhost:27017/heroSmasher';

characterRouter.route('/')
    .get(function (req, res) {
        
        mongodb.connect(mongoURL, function (err, db) {
            var collection = db.collection('characters');
            collection.find().toArray(function (err, results) {
                res.render('characters', { characters: results });
                db.close();
            });
        });
    });
characterRouter.route('/:id')
    .get(function (req, res) {
        var id = new objectId(req.params.id);
        mongodb.connect(mongoURL, function (err, db) {
            var collection = db.collection('characters');
            collection.findOne({ _id: id }, function (err, results) {
                res.render('character', { character: results });
                db.close();
            });
        });
    });
module.exports = characterRouter;