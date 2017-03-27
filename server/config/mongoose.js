var mongoose = require('mongoose');

require('../models/user');
require('../models/conversation'),
require('../models/message');
require('../models/request');
require('../models/hackathon');
require('../models/notification');

module.exports = function(config) {
    mongoose.connect(config.db, {
        server: {
            socketOptions: {
                socketTimeoutMS: 0,
                connectionTimeout: 0
            }
        }
    });
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error...'))
    db.once('open', function callback() {
        console.log('hackconnect db opened');
    })
}

