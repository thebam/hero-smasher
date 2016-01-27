var express = require('express');
var mongodb = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var adminRouter = express.Router();

var mongoURL = 'mongodb://localhost:27017/heroSmasher';

adminRouter.route('/')
    .get(function (req, res) {
        res.render('admin-add-character', list);
    });
adminRouter.route('/add')
    .post(function (req, res) {
        var name = req.body.characterName;
        var biography = req.body.biography;
        var allPowers = req.body.allPowers;
        var allTraits = req.body.allTraits;
        var powers = JSON.parse(allPowers).powers;
        var traits = JSON.parse(allTraits).traits;
        var character = {
            name: name,
            powers: powers,
            traits: traits,
            bio: biography
        };
        
        mongodb.connect(mongoURL, function (err, db) {
            var collection = db.collection('characters');
            collection.insert(character, function (err, results) {
                res.send(results);
                db.close();
            });
        });
    });
adminRouter.route('/:id')
    .get(function(req,res){
        var id = new objectId(req.params.id);
        mongodb.connect(mongoURL, function (err, db) {
            var collection = db.collection('characters');
            collection.findOne({ _id: id }, function (err, results) {
                res.render('character', { character: results });
                db.close();
            });
        });
    });
module.exports = adminRouter;