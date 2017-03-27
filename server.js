var express = require('express'),
    passport = require('passport');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

var server = require('http').Server(app);

var io =  require('socket.io').listen(server);

var config = require('./server/config/config')[env];

require('./server/config/mongoose')(config);

require('./server/models/verificationToken');

require('./server/config/express')(app, config);

require('./server/config/passport')(passport, config);

var path = require("path")
/*app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname+'/server/views/html/forgot-password.html'));
})*/

require('./server/config/routes')(app, passport);

require('./server/config/socket')(io)

server.listen(config.port);
console.log('Listening on port ' + config.port + '...');