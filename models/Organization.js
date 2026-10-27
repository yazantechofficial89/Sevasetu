const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['orphanage', 'oldage'],
        required: true
    },
    city: {
        type: String,
        default: 'India',
        trim: true
    },
    needs: {
        type: String,
        default: 'Care & General Support'
    },
    verified: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
