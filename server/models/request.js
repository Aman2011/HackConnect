var mongoose = require('mongoose');

var RequestSchema = mongoose.Schema({
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

var RequestModel = mongoose.model('Request', RequestSchema);

