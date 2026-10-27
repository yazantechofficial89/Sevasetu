const mongoose = require('mongoose');

const MobileOtpSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.MobileOtp || mongoose.model('MobileOtp', MobileOtpSchema);
