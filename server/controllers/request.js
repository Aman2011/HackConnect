var User = require('mongoose').model('User'),
    Request = require('mongoose').model('Request');

exports.sendRequest = function (req, res, next) {
    if(!req.params.recipient) {
        res.status(422).send({ error: 'Please choose a valid recipient for connecting' });
    }
    var requestData = {
        sender: req.user._id,
        recipient: req.params.recipient
    }
    Request.findOne(requestData, function (err, request) {
        if(request) {
            res.send({error: "You have already sent a request for connection"})
        } else {
            Request.create(requestData, function (err, request) {
                if(err) {
                    res.send({error: err});
                }
                Request.findOne(request).populate({
                    path: "sender",
                    select: "name profile.picture"
                }).exec(function (err, request) {
                    res.send(request)
                })
            })

        }
    })
}

exports.acceptRequest = function (req, res, next) {
    if(!req.params.sender) {
        res.status(422).send({ error: 'Please choose a valid recipient for connecting' });
    }
    var ids = [req.user._id, req.params.sender];
    async.map(ids,
        function (id, callback) {
        var connection_id = req.params.sender;
        if(id.toString() == req.params.sender) connection_id = req.user._id;
        User.update({_id: id}, {$addToSet: {"profile.connections": connection_id}}, function (err, result) {
            if(err) return callback(err);
            callback(null, true);
        })
    }, function (err, results) {
        if(err) {
            console.log(err);
            res.status(422).send(false)
        } else {
            var requestData = {
                sender: req.params.sender,
                recipient: req.user._id
            }
            Request.remove(requestData, function (err, result) {
                if(err){
                    console.log(err);
                    res.status(422).send(false);
                }
                res.status(200).send(true);
            })
        }
    });
}

exports.rejectRequest = function (req, res, next) {
    var requestId = req.params.id;
    Request.remove({_id: requestId}, function (err, result) {
        if(err){
            console.log(err);
            res.status(422).send(false);
        }
        if(result) {
            res.status(200).send(true);
        }else {
            res.send(false);
        }
    })
}

exports.markRequestAsRead = function (req, res) {
    var filter = {
        $and: [
            {"recipient": req.user._id},
            {"read": false}
        ]
    }
    Request.update(filter, {read: true}, {multi: true}, function (err, result) {
        if(err) console.log(err);
        if(result) res.send(true);
    });
}
