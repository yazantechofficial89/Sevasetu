const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['donor', 'oldage', 'orphanage', 'admin'],
        required: true,
        default: 'donor'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    mobile: {
        type: String,
        default: '',
        trim: true
    },
    city: {
        type: String,
        default: 'India',
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    manager: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    extra_info: {
        type: String,
        default: ''
    },
    photoURL: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
