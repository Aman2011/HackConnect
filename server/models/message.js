var mongoose = require('mongoose');

var MessageSchema = mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    new: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
});

var MessageModel = mongoose.model('Message', MessageSchema);


