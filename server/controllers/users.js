var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Message = mongoose.model('Message'),
    Request = mongoose.model('Request'),
    Notification = mongoose.model('Notification');
    VerificationToken = mongoose.model('VerificationToken'),
    encrypt = require('../utilities/encryption'),
    emailVerification = require('../config/emailVerification'),
    multer = require("multer"),
    async = require('async');

exports.createUser = function (req, res, next) {
    var userData = req.body;
    userData.email = userData.email.toLowerCase();
    userData.salt = encrypt.createSalt();
    userData.hashed_password = encrypt.hashPassword(userData.salt, userData.password);
    User.create(userData, function (err, user) {
        if(err){
            if(err.toString().indexOf('E11000') > -1) {
                err = new Error('Duplicate Email');
            }
            req.flash('signUpError', err.toString());
            return res.redirect('/login');
        }
        req.logIn(user, function(err) {
            if(err) return next(err);
//            var token = emailVerification.createVerificationToken(user._id);
//            emailVerification.send(user.email, token);
//            res.redirect('/verify');
            res.redirect("/create_profile");
        })
    })
}

exports.createProfile = function (req, res, next) {
    var profileData = req.body;
    User.findOne({_id: req.user._id}, function (err, user) {
        if(err) console.log(err);
        user.profile.role = profileData.role;
        user.profile.employment.company = profileData.company;
        user.profile.education = {
            school: profileData.school,
            degree: profileData.degree,
            country: profileData.school_country
        };
        user.profile.address.city = profileData.city;
        user.profile.address.country = profileData.country;
        user.profile.projectTypes = profileData.projectTypes;
        user.profile.skills = profileData.skills
        user.profile.bio = profileData.bio;
        user.save(function (err) {
            if(err) {
                console.error('ERROR!');
            }
        });
        res.redirect("/home");
    })
}

exports.updateProfile = function (req, res) {
    var data = req.body.data;
    var field = req.body.field;
    var obj = {};
    obj[field] = data;
    User.findOneAndUpdate({_id: req.user._id}, obj, function (err, result) {
        if(err) {
            console.log(err);
            res.send(false);
        }
        if(result) {
            res.send(true);
        }
    })
}

exports.uploadImage = function (req, res) {
    upload(req,res,function(err){
        if(err){
            res.json({error_code:1,err_desc:err});
            return;
        }
        User.findOneAndUpdate({_id: req.user._id}, {"profile.picture": req.file.path}, function (err, result) {
            if(err) {
                console.log(err);
            }
            res.send(true);
        })
    })
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profile/')
    },
    filename: function (req, file, cb) {
        cb(null, req.user._id + '.'+ file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});

var upload = multer({ //multer settings
    storage: storage
}).single('file');

exports.getProfileData = function (userId, callback) {
    User.findById(userId).lean().exec( function(err, user) {
        if(err) console.log(err);
        var profile = user.profile;
        profile.email = user.email;
        profile.name = user.name;
        return callback(profile);
    });
}

exports.getHackathons = function (id, res) {
    User.findById(id).select('profile.hackathons')
        .populate({
            path: "profile.hackathons",
            select: "name start_date end_date slogan location image"
        }).lean().exec(function (err, user) {
            if(err) {
                console.log(err);
            }

            res.json(user.profile.hackathons);
    })
}

exports.getConnections = function (id, res) {
    User.findById(id).select('profile.connections')
        .populate({
            path: "profile.connections",
            select: "name profile.role profile.picture profile.address"
        }).lean().exec(function (err, user) {
        if(err) {
            console.log(err);
        }
        res.json(user.profile.connections);
    })
}

exports.isUserVerified = function (req, res, next) {
    var userData = req.user;
    userData.email = userData.email.toLowerCase();
    User.findOne({email: userData.email}, function (err, user) {
        if(err) {
            throw err;
        }
        if(!user.verify) {
            return res.redirect('/verify');
        } else next();
    })

}

exports.verifyEmail = function (req, res, next) {
    var token = req.params.token;
    VerificationToken.findOne({token: token}, function (err, tokenDoc) {
        if(err) return done(err);
        if(tokenDoc) {
            User.findOne({_id: tokenDoc._userId}, function (err, user) {
                if(err) return done(err);
                user.verify = true;
                user.save(function (err) {
                    if(err) done(err);
                    tokenDoc.remove(function (err, token) {
                        if(err) done(err);
                    })
                    res.redirect('/create_profile');
                })

            })
        } else {
        }
    })
}

exports.isProfileCreated = function (req, res, next) {
    var userData = req.user;
    userData.email = userData.email.toLowerCase();
    User.findOne({email: userData.email}, function (err, user) {
        if(err) {
            next(err);
        }
        if(user.profile.skills == undefined || user.profile.skills.length == 0) {
            return res.redirect('/create_profile');
        } else next();
    })
}

//api functions
exports.getUsers = function(req, res) {
    var id = req.query.test;
    var filter = {_id: {$ne: req.user._id}};
    if(id != undefined) {
        filter = {
            $and:[
                {_id: {$gt: id}},
                {_id: {$ne: req.user._id}}
            ]
        };
    }
    User.find(filter).limit(12).exec(function(err, collection) {
        res.send(collection);
    })
};

exports.getUserData = function(req, res) {
    var id = req.query.id;
    User.findById(id).lean().exec( function(err, user) {
        if(err) console.log(err);
        var profile = user.profile;
        profile.email = user.email;
        profile.name = user.name;
        profile._id = user._id;
        res.send(profile);
    });
};

exports.search = function (req, res) {
    var id = req.query.id;
    var filter = {
        $and: [
            {$text: {$search: req.query.text}},
            {_id: {$ne: req.user._id}},
        ]
    }
    if(id != undefined) {
        filter = {
            $and: [
                {$text: {$search: req.query.text}},
                {_id: {$ne: req.user._id}},
                {_id: {$gt: id}}
            ]
        }
    }
    User.find(filter, {score: {$meta: "textScore"}}).sort({score: {$meta: 'textScore'}}).limit(12).exec(function (err, collection) {
        res.json(collection);
    })
}

exports.getSimilarUsers = function (user, res) {
    var tasks = [
        function (callback) {
            var filter = {
                $and:[
                    {_id: {$ne: user._id}},
                    {"profile.role": user.profile.role}
                ]
            };
            User.find(filter, {"profile": 1, name: "1"}).lean().exec(function (err, users) {
                if(err) return callback(err);
                callback(null, users);
            })
        },
        function (users, callback) {
            users.forEach(function (item) {
                var compatibility = 0;
                var profile = item.profile;

                if(user.profile.role === profile.role) {
                    compatibility += 40;
                }

                if(user.profile.education && user.profile.education.school != "" && user.profile.education.school === profile.education.school) {
                    compatibility += 10;
                }
                if(user.profile.employment && user.profile.employment.company != "" && user.profile.employment.company === profile.employment.company){
                    compatibility += 10;
                }
                profile.skills.forEach(function (skill) {
                    if(user.profile.skills.indexOf(skill) != -1){
                        compatibility += 10;
                    }
                })

                item.compatibility = compatibility;
            })
            callback(null, users);
        },
        function (users, callback) {
            users.sort(function (a, b) {
                return b.compatibility - a.compatibility;
            })
            users.length = Math.min(users.length, 10);

            callback(null, users);
        }
    ]

    async.waterfall(tasks, function (err, result) {
        res.json(result);
    })
}

exports.getAllNotifications = function (req, res) {
    var tasks = [
        function (callback) {
            var filter = [
                {"$match": {"recipient": req.user._id}},
                {"$sort": {"createdAt": -1}},
                {"$project": {
                    "conversationId": 1,
                    "content": 1,
                    "author": 1,
                    "recipient": 1,
                    "read": 1,
                    "new": 1,
                    "createdAt": 1,
                    "unread": {
                        "$cond": ["$read", 0, 1]
                    }
                }},
                {"$group": {
                    "_id": "$conversationId",
                    "message": {"$first": "$$ROOT"},
                    "count": {"$sum": "$unread"}}},
                {"$sort": {"message.createdAt": -1}},
                {"$limit": 10}
            ]

            Message.aggregate(filter, function (err, docs) {
                async.map(docs, function(doc, callback) {
                    var id = doc.message.author;
                    User.findById(id)
                        .select("name profile.picture")
                        .lean()
                        .exec(function (err, messageAuthor) {
                            if(err) console.log(err);
                            doc.message.author = messageAuthor;
                            return callback(null, doc);
                        })
                }, function (err, results) {
                    if (err) callback(err);
                    callback(null, results)
                })
            })
        },
        function (callback) {
            var filter = {
                'recipient': req.user._id
            };

            Request.find(filter)
                .sort('-createdAt')
                .populate(
                    {path: "sender",
                    select: "name profile.picture"}).lean()
                .exec(function (err, requests) {
                    callback(null, requests);
                })
        },
        function (callback) {
            var filter = {
                $and:[
                    {'recipient': req.user._id},
                    {'read': false}
                ]
            };
            Notification.find(filter)
                .sort('-createdAt')
                .populate(
                    {path: "sender",
                        select: "name profile.picture"}).lean()
                .exec(function (err, notifications) {
                    callback(null, notifications);
                })
        },
        function (callback) {
            var filter = {
                $and:[
                    {'recipient': req.user._id},
                    {'new': true}
                ]
            }
            Message.count(filter, function (err, count) {
                callback(null, count);
            })
        },
        function (callback) {
            var filter = {
                $and:[
                    {'recipient': req.user._id},
                    {'read': false}
                ]
            }
            Request.count(filter, function (err, count) {
                callback(null, count);
            })
        }
    ]

    async.parallel(tasks, function (err, results) {
        if(err) return res.send(err);
        var notifications = {
            "conversations": results[0],
            "requests": results[1],
            "notifications": results[2],
            "newMessageCounter": results[3],
            "unreadRequestsCounter": results[4]
        }
        res.json(notifications);
    })
}

exports.sendForgotPasswordEmail = function (req, res) {
    User.findOne({email: req.body.email}, function (err, user) {
        var token = emailVerification.createVerificationToken(user._id);
        if(user) {
            emailVerification.send(req.body.email, token, "password");
            res.send(true);
        }else {
            res.send(false);
        }
    })
}

exports.verifyUser = function (req, res) {
    var token = req.params.token;
    VerificationToken.findOne({token: token}, function (err, tokenDoc) {
        if(err) return done(err);
        if(tokenDoc) {
            User.findOne({_id: tokenDoc._userId}, function (err, user) {
                if(err) return done(err);
                req.flash('valid', true);
                req.flash('id', tokenDoc._userId);
                res.redirect('/reset-password');

            })
        } else {
        }
    })
}

exports.resetPassword = function (req, res) {
    var id = req.flash('id')[0];
    var password = req.body.password;
    var userPassword = {};
    userPassword.salt = encrypt.createSalt();
    userPassword.hashed_password = encrypt.hashPassword(userPassword.salt, password);
    User.findOneAndUpdate({_id: id}, userPassword, function (err, result) {
        if(err) {
            console.log(err);
            res.redirect('/error');
        }
        if(result) {
            VerificationToken.remove({_userId: id}, function (err, result) {
                if(err) {
                    console.log(err);
                }
                if(result) res.redirect('/login');
            })
        }
    })
}

exports.getConnectionStatus = function (req, res) {
    var status = "connect";
    var tasks = [
        function (callback) {
            User.findById(req.user._id, function (err, user) {
                user.profile.connections.forEach(function (connection) {
                    if(connection.toString() === req.params.id)
                        status = "connected"
                })
                if(err)
                    return callback(err);
                callback(null);
            })
        },
        function (callback) {
            var ids = [req.user._id, req.params.id];
            var filter = {
                $and: [
                    {"sender": {$in: ids}},
                    {"recipient": {$in: ids}}
                ]
            }
            Request.findOne(filter, function (err, result) {
                if(result) {
                    if(result.sender.toString() == req.user._id.toString()) status = "requested";
                    if(result.recipient.toString() == req.user._id.toString()) status = "accept";
                }
                if(err) return callback(err);
                callback(null);
            })
        }
    ]
    async.parallel(tasks, function (err, results) {
        if(err) console.log(err);
        res.send(status);
    })
}