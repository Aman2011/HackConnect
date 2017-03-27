var User = require('mongoose').model('User'),
    Conversation = require('mongoose').model('Conversation'),
    Message = require('mongoose').model('Message'),
    async = require('async');

exports.sendMessage = function(req, res, next) {
    if(!req.params.recipient) {
        res.status(422).send({ error: 'Please choose a valid recipient for your message.' });
        return next();
    }

    if(!req.body.composedMessage) {
        res.status(422).send({ error: 'Please enter a message.' });
        return next();
    }

    var queryObject = {
        participants: {$all:[req.user._id, req.params.recipient]}
    }
    Conversation.findOne(queryObject, function (err, conversation) {
        if(err) {
            res.send({error: err});
        }
        if(conversation) {
            var messageObject = {
                conversationId: conversation._id,
                content: req.body.composedMessage,
                author: req.user._id,
                recipient: req.params.recipient
            };
            Message.create(messageObject, function (err, message) {
                if (err) {
                    res.send({ error: err });
                }
                Message.populate(message, {
                    path: "author",
                    select: "name profile.picture"
                }, function (err, message) {
                    res.send(message);
                })
            })
        }else {
            exports.newConversation(req, res);
        }
    });
}

exports.newConversation = function (req, res) {
    var conversationObject = {
        participants: [req.user._id, req.params.recipient]
    }
    Conversation.create(conversationObject, function (err, newConversation) {
        if(err) {
            return (err);
        }
        if(newConversation) {
            var messageObject = {
                conversationId: newConversation._id,
                content: req.body.composedMessage,
                author: req.user._id,
                recipient: req.params.recipient
            };
            Message.create(messageObject, function (err, message) {
                if (err) {
                    res.send({ error: err });
                    return next(err);
                }
                res.send(message);
            })
        }
    })
}

exports.getConversations = function (req, res) {
    var filter = [
        {"$match": {"$or":[{"recipient": req.user._id}, {"author": req.user._id}]}},
        {"$sort": {"createdAt": -1}},
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
            if(id.toString() === req.user._id.toString()) {
                id = doc.message.recipient;
            }
            User.findById(id)
                .select("name profile.picture")
                .lean()
                .exec(function (err, participant) {
                    if(err) console.log(err);
                    doc.participant = participant;
                    return callback(null, doc);
                })
        }, function (err, results) {
            if (err) console.log(err);
            res.send({"conversations": results});
        })
    })

    /*Conversation.find({participants: req.user._id})
        .populate({
            path: "participants",
            select: "name profile.picture"
        })
        .exec(function (err, conversations) {
            if (err) {
                res.send({ error: err });
            }

            console.log(conversations);

            async.map(conversations, function(conversation, callback) {
                Message.find({ 'conversationId': conversation._id })
                    .sort('-createdAt')
                    .limit(1)
                    .populate({
                        path: "author",
                        select: "name profile.picture"
                    }).lean()
                    .exec(function(err, message) {
                        if (err) {
                            res.send({ error: err });
                        }
                        if(message.length > 0) {
                            message[0].participant = conversation.participants.filter(function (value) {
                                return !value._id.equals(req.user._id);
                            });
                            return callback(null, message[0]);
                        }
                    });
            }, function (err, results) {
                if (err) console.log(err);
                res.send({"conversations": results});
            })
    })*/
}

exports.getConversation = function(req, res, next) {
    Message.find({ conversationId: req.params.conversationId })
        .select('createdAt content author')
        .sort('-createdAt')
        .populate({
            path: 'author',
            select: 'name profile.picture'
        })
        .exec(function(err, messages) {
            if (err) {
                res.send({ error: err });
            }
            res.status(200).json({ conversation: messages });
        });
}

exports.markConversationAsOld = function (req, res, next) {
    var filter = {
        $and: [
            {"recipient": req.user._id},
            {"new": true}
        ]
    }
    Message.update(filter, {new: false}, {multi: true}, function (err, result) {
        if(err) console.log(err);
        if(result) res.send(true);
    });
}

exports.markConversationAsRead = function (req, res, next) {
    var filter = {
        $and: [
            {"conversationId": req.params.conversationId},
            {"recipient": req.user._id},
            {"read": false}
        ]
    }
    Message.update(filter, {read: true, new: false}, {multi: true}, function (err, result) {
        if(err) console.log(err);
        if(result) res.send(true);
    });
}


