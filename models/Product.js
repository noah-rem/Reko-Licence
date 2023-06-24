const mongoose = require('mongoose');

// MongoDB Product Model
const ProductSchema = new mongoose.Schema({
    name: String,
    users: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    codes: [{ 
        name: String, 
        codeValue: String
    }],
});

module.exports = mongoose.model('Product', ProductSchema);
