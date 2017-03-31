var User = require('mongoose').model('User'),
    Hackathon = require('mongoose').model('Hackathon'),
    async = require('async'),
    roleMatch = require('../data/roleMatch.json');;

exports.getHackathons = function (req, res, next) {
    var id = req.query.last;
    var filter = {};
    if(id != undefined) {
        filter = {
            $and: [
                {_id: {$gt: id}},
                {date: {$gt: new Date()}}
            ]
        };
    }
    Hackathon.find(filter).limit(12).sort({date: 1}).exec(function(err, collection) {
        if(err) console.log(err);
        res.send(collection);
    })
}

exports.getHackathon = function (req, res, next) {
    var id = req.query.id;
    Hackathon.findById(id).lean().exec( function(err, hackathon) {
        if(err) console.log(err);
        res.send(hackathon);
    })
}

exports.attendHackathon = function (req, res, next) {
    var tasks = [
        function (callback) {
            User.findById(req.user._id, function (err, user) {
                if(err) {
                    console.log(err);
                    return callback(err);
                }
                user.profile.hackathons.push(req.params.hackathon);
                user.save(function (err) {
                    if(err) {
                        console.log(err);
                        return callback(err);
                    }
                    callback();
                })
            })
        },
        function (callback) {
            Hackathon.findById(req.params.hackathon, function (err, hackathon) {
                if(err) {
                    console.log(err);
                    return callback(err);
                }
                hackathon.participants.push(req.user._id);
                hackathon.save(function (err) {
                    if(err) {
                        console.log(err);
                        return callback(err);
                    }
                    callback(null, hackathon.participants);
                })
            })
        }
    ]

    async.parallel(tasks, function (err, results) {
        if(err) return next(err);

        res.send(true);
    })
}

exports.findPotentialTeammates = function (req, res, next) {
    var user = req.user.profile;
    var roleMatches = roleMatch[user.role];
    var roleNames = [];
    roleMatches.forEach(function (role) {
        roleNames.push(role.name);
    })
    var tasks = [
        function (callback) {
            var filter = {
                $and:[
                    {"profile.hackathons":  req.params.hackathon},
                    {_id: {$ne: req.user._id}},
                    {"profile.projectTypes": {$in: user.projectTypes}},
                    {$or:[
                        {"profile.education.school": user.education.school},
                        {"profile.employment.company": user.employment.company},
                        {"profile.role": {$in: roleNames}},
                        {"profile.skills": {$in: user.skills}},
                    ]}
                ]
            };
            User.find(filter, {"profile": 1, name: "1"}).lean().exec(function (err, participants) {
                    if(err) {
                        console.log(err);
                        return callback(err);
                    }
                    callback(null, participants);
                })
        },
        function (participants, callback) {
            participants.forEach(function (participant) {
                var compatibility = 0;
                var profile = participant.profile;
                profile.projectTypes.forEach(function (projectType) {
                    if (user.projectTypes.indexOf(projectType) != -1 && projectType != "Other") {
                        if (compatibility == 0) {
                            compatibility += 50;
                        } else {
                            compatibility += 1;
                        }
                    }
                })
                roleMatches.forEach(function (role) {
                    if(role.name === profile.role) {
                        compatibility += role.score;
                    }
                })
                if(user.education.school != "" && user.education.school === profile.education.school) {
                    compatibility += 10;
                }
                if(user.employment.company != "" && user.employment.company === profile.employment.company){
                    compatibility += 10;
                }
                var skillsMatchCount = 0;
                profile.skills.forEach(function (skill) {

                    if(user.skills.indexOf(skill) != -1){
                        if(skillsMatchCount < 3) {
                            compatibility += 10;
                            skillsMatchCount += 1;
                        }else {
                            compatibility += 4;
                            skillsMatchCount += 1;
                        }

                    }
                })
                var hackathonMatchCount = 0;
                profile.hackathons.forEach(function (hackathon) {
                    if(user.hackathons.indexOf(hackathon) != -1){
                        if(hackathonMatchCount < 5 && hackathon != req.params.hackathon) {
                            compatibility += 3;
                            hackathonMatchCount += 1;
                        }
                    }
                })
                participant.compatibility = compatibility;
            })
            callback(null, participants);
        },
        function (participants, callback) {
            participants.sort(function (a, b) {
                return b.compatibility - a.compatibility;
            })
            var roleCount = {}
            roleNames.forEach(function (role) {
                roleCount[role] = 0;
            })
            var team = [];
            var others = [];
            participants.forEach(function (participant) {
                var role = participant.profile.role;
                roleCount[role] = roleCount[role] + 1;
                if(roleCount[role] <= 1) {
                    team.push(participant);
                } else {
                    others.push(participant);
                }
            })
            while(team.length < 3) {
                team.push(others.splice(0, 1));
            }
            var results = {
                team: team,
                all: participants
            }
            callback(null, results);
        }
    ]
    
    async.waterfall(tasks, function (err, result) {
        res.json(result);
    })
}

exports.search = function (req, res) {
    var id = req.query.id;
    var filter = {
            $text: {$search: req.query.text}
    }
    if(id != undefined) {
        filter = {
            $and: [
                {$text: {$search: req.query.text}},
                {_id: {$gt: id}}
            ]
        }
    }
    Hackathon.find(filter, {score: {$meta: "textScore"}}).sort({score: {$meta: 'textScore'}}).limit(12).exec(function (err, collection) {
        res.json(collection);
    })
}

exports.getParticipants = function (req, res, next) {
    var id = req.query.id;
    Hackathon.findById(id).select('participants')
        .populate({
            path: "participants",
            select: "name profile.role profile.picture profile.address profile.skills"
        }).lean().exec(function (err, hackathon) {
        if(err) {
            console.log(err);
        }
        res.json(hackathon.participants);
    })
}