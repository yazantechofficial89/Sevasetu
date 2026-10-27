const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    donationId: {
        type: String,
        required: true,
        unique: true
    },
    order_id: {
        type: String,
        default: ''
    },
    payment_id: {
        type: String,
        default: ''
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    donor_name: {
        type: String,
        required: true
    },
    donor_email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    org_name: {
        type: String,
        required: true
    },
    cause_type: {
        type: String,
        default: 'General Support'
    },
    method: {
        type: String,
        default: 'Razorpay'
    },
    status: {
        type: String,
        default: 'Success'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Donation || mongoose.model('Donation', DonationSchema);
