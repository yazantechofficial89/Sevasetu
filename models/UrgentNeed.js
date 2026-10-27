const mongoose = require('mongoose');

const UrgentNeedSchema = new mongoose.Schema({
    org_name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    target_amount: {
        type: Number,
        required: true
    },
    raised_amount: {
        type: Number,
        default: 0
    },
    urgency: {
        type: String,
        default: 'High'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.UrgentNeed || mongoose.model('UrgentNeed', UrgentNeedSchema);
