const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
    sender_name: {
        type: String,
        required: true,
        trim: true
    },
    sender_role: {
        type: String,
        required: true
    },
    receiver_name: {
        type: String,
        default: null
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
