var mongoose = require('mongoose');

var NotificationSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

var NotificationModel = mongoose.model('Notification', NotificationSchema);
var ReadNotificationModel = mongoose.model('ReadNotification', NotificationSchema);

