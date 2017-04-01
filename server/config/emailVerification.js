var VerificationToken = require('mongoose').model('VerificationToken'),
    encrypt = require('../utilities/encryption'),
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env],
    _ = require('underscore'),
    fs = require('fs');

    var model = {
        verifyUrl: '',
        title: 'HackConnect',
        subTitle: 'Thanks for signing up!',
        body: 'Please verify your email address by clicking the button below',
        website: config.website,
        rootPath: config.rootPath
    }

exports.createVerificationToken = function(userId){
    var token = encrypt.createUniqueToken();

    var tokenData = {_userId: userId, token: token};

    VerificationToken.update({_userId: tokenData._userId}, tokenData, {upsert: true}, function (err, tokenDoc) {
        if(err) {
            console.log(err);
            return err;
        }
    })
    return tokenData.token;
}

exports.send = function (email, token, type) {
    var transporter = nodemailer.createTransport(smtpTransport({
        service: "Gmail",
        secure: true,
        auth: {
            user: config.email,
            pass: config.smtp_pass
        }
    }))
    var subject = "Account Verification"
    if(type === "password")subject = "Forgotten password request"
    var mailOptions = {
        from: 'Accounts <'+ config.email+'>',
        to: email,
        subject: subject,
        html: getHtml(token, type)
    }

    transporter.sendMail(mailOptions, function(err, info) {
        if(err) console.log(err);
        console.log("email sent " + info);
    })
}

exports.resendVerificationLink = function (req, res, next) {
    var userId = req.user._id;
    var token = exports.createVerificationToken(userId);
    exports.send(req.user.email, token);
    res.send(true);
}

_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

function getHtml(token, type) {
    var path = 'server/views/html/email-verification.html';
    model.verifyUrl = config.website + '/verify/' + token;
    if(type === "password") {
        path = 'server/views/html/forgot-password.html';
        model.verifyUrl = config.website + '/forgot-password/' + token;
    }
    var html = fs.readFileSync(path, encoding = 'utf8');
    var template = _.template(html);
    return template(model);
}
