var path = require('path');
var rootPath = path.normalize(__dirname + '/../../')

module.exports = {
    development: {
        db: 'mongodb://localhost/hackconnect',
        website: 'http://localhost:7700',
        rootPath: rootPath,
        port: process.env.PORT || 7700,
        email: 'xxxxx@gmail.com',
        smtp_pass: 'xxxxxx',
        linkedInAuth: {
            'clientID': 'xxxxx',
            'clientSecret': 'xxxxxx',
            'callbackURL': 'http://localhost:7700/auth/linkedIn/callback'
        },
        verifyUrlPrefix: "http://localhost:7700/"

    },
    production: {
        db: 'mongodb://username:password@ds163667.mlab.com:63667/hackconnect',
        website: 'https://hackconnect.herokuapp.com',
        rootPath: rootPath,
        port: process.env.PORT || 80,
        email: 'xxxxx',
        smtp_pass: 'xxxxx',
        linkedInAuth: {
            'clientID': 'xxxxx',
            'clientSecret': 'xxxxxx',
            'callbackURL': 'https://hackconnect.herokuapp.com/auth/linkedIn/callback'
        },
        verifyUrlPrefix: "http://hackconnect.herokuapp.com/"
    }
}
