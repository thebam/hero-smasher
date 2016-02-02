var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var app = express();
var port = process.env.PORT || 5001;
app.set('views', path.join(__dirname, '/src/views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/src/public'));


app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(session({secret:'super'}));
require('./src/config/passport')(app);
var APIRouter = require('./src/routes/APIRoutes');

//for express API endpoints
app.use('/api', APIRouter);
//for angular routing
app.get('/', function (req, res) {
    console.log(req.user);
    res.render('index');
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


app.listen(port, function (err) {
    console.log('Server running on port : ' + port);
});