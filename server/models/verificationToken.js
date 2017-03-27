var mongoose = require('mongoose'),
    encrypt = require('../utilities/encryption');

var verificationTokenSchema = mongoose.Schema({
    _userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', unique: true},
    token: {type: String, required: true, unique: true},
    createdAt: {type: Date, required: true, default: Date.now, expires: '30d'}
});

var VerificationTokenModel =  mongoose.model('VerificationToken', verificationTokenSchema);
