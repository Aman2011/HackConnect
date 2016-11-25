var express = require('express'),
    less = require('less-middleware'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

app.set('views', __dirname + '/server/views');
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(less(__dirname + '/public', {compress: true}));
app.use(express.static(__dirname + '/public'));

if (env === 'development') {
    mongoose.connect('mongodb://localhost/hackconnect');
} else {
    mongoose.connect('mongodb://admin:Hack2011@ds163667.mlab.com:63667/hackconnect');
}
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error...'))
db.once('open', function callback() {
    console.log('hackconnect db opened');
})

var messageSchema = mongoose.Schema({message: String});
var Message = mongoose.model('Message', messageSchema);
var mongoMessage;
Message.findOne().exec(function (err, messageDoc) {
    mongoMessage = messageDoc.message;
})

app.get('/partials/:partialPath', function (req, res) {
    res.render('partials/' + req.params.partialPath);
})

app.get('*', function(req, res) {
    res.render('index', {
        mongoMessage: mongoMessage
    });
})

var port = process.env.PORT || 7700;
app.listen(port);
console.log('Listening on port ' + port + '...');