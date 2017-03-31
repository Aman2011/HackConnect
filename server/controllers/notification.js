var User = require('mongoose').model('User'),
    Notification = require('mongoose').model('Notification');

exports.sendNotification = function (req, res) {
    if(!req.params.recipient) {
        res.status(422).send({ error: 'Please choose a valid recipient for connecting' });
    }
    var notificationData = {
        sender: req.user._id,
        recipient: req.params.recipient
    }

    Notification.create(notificationData, function (err, notification) {
                if(err) {
                    console.log(err);
                }
                Notification.findOne(notification).populate({
                    path: "sender",
                    select: "name profile.picture"
                },function (err, notification) {
                    res.send(notification)
                })
            })

}

exports.markNotificationAsRead = function (req, res) {
    var filter = {
        $and: [
            {"recipient": req.user._id},
            {"read": false}
        ]
    }
    Notification.update(filter, {read: true}, {multi: true}, function (err, result) {
        if(err) console.log(err);
        if(result) res.send(true);
    });
}