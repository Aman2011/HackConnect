var mongoose = require('mongoose');

var ConversationSchema = mongoose.Schema({
    participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    read: {
        type: Boolean,
        default: false
    }
})

var ConversationModel = mongoose.model('Conversation', ConversationSchema);

