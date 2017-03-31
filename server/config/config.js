var path = require('path');
var rootPath = path.normalize(__dirname + '/../../')

module.exports = {
    development: {
        db: 'mongodb://localhost/hackconnect',
        rootPath: rootPath,
        port: process.env.PORT || 7700,
        email: 'amanrawal84@gmail.com',
        smtp_pass: 'GameOver2011',
        linkedInAuth: {
            'clientID': '77knpgir45dxaf',
            'clientSecret': 'nDEKILjFBCIqdCDe',
            'callbackURL': 'http://localhost:7700/auth/linkedIn/callback'
        },
        verifyUrlPrefix: "http://localhost:7700/"

    },
    production: {
        db: 'mongodb://admin:Hack2011@ds163667.mlab.com:63667/hackconnect',
        rootPath: rootPath,
        port: process.env.PORT || 80,
        email: 'amanrawal84@gmail.com',
        smtp_pass: 'GameOver2011',
        linkedInAuth: {
            'clientID': '77knpgir45dxaf',
            'clientSecret': 'nDEKILjFBCIqdCDe',
            'callbackURL': 'https://hackconnect.herokuapp.com/auth/linkedIn/callback'
        },
        verifyUrlPrefix: "http://hackconnect.herokuapp.com/"
    }
}
