const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    discord: {
        type: String,
        default: 'unknown'
    },
    hwid: { 
        type: String, 
        default: "None"
    },
    blacklistDate: {
        type: Date,
        default: Date.now
    },
    ip: String
});

module.exports = mongoose.model('Blacklist', blacklistSchema);
