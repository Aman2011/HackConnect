var crypto = require('crypto');
var uuid = require('node-uuid');

exports.createSalt = function() {
    return crypto.randomBytes(128).toString('base64');
}

exports.hashPassword = function(salt, password) {
    var hmac = crypto.createHmac('sha1', salt);
    hmac.setEncoding('hex');
    hmac.write(password);
    hmac.end();
    return hmac.read();
}

exports.createUniqueToken = function() {
    return uuid.v4();
}
