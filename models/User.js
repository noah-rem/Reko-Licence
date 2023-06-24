const mongoose = require('mongoose');

// MongoDB User Model
const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        min: 6, 
        max: 255 
    },
    email: { 
        type: String, 
        required: true, 
        min: 6, 
        max: 255 
    },
    password: { 
        type: String, 
        required: true, 
        min: 6, 
        max: 1024 
    },
    role: { 
        type: String, 
        default: 'client' 
    },
    hwid: { 
        type: String, 
        default: 'None' 
    }
});

module.exports = mongoose.model('User', userSchema);
