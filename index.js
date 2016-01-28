var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var port = process.env.PORT || 5001;
app.set('views', './src/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/src/public'));
var characterRouter = require('./src/routes/characterRoutes')
var adminRouter = require('./src/routes/adminRoutes');


app.get('/', function (req, res) {
    res.render('index');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use('/Characters', characterRouter);
app.use('/Admin', adminRouter);

app.listen(port, function (err) {
    console.log('Server running on port : ' + port);
});