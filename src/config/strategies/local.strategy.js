	var passport = require('passport');
	var LocalStrategy = require('passport-local').Strategy;
	var mongodb = require('mongodb').MongoClient;
	module.exports = function () {
	    passport.use(new LocalStrategy({
	        usernameField:'username',
	        passwordField:'password'
	    },
	    function(username,password,done){
	        
	        
	        var mongoURL = 'mongodb://localhost:27017/heroSmasher';
	            mongodb.connect(mongoURL,function(err,db){
	                var collection = db.collection('users');
	                collection.findOne({username:username,password:password},function(err,results){
	                    var user = results;
	                    done(null,user);
	                });
	            });
	    }));
	};
