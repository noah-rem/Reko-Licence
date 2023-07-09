const mongoose = require('mongoose');

// Code Schema
const CodeSchema = new mongoose.Schema({
    name: String,
    codeValue: String
});

// MongoDB Product Model
const ProductSchema = new mongoose.Schema({
    name: String,
    publicKeyPath: String,
    users: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    codes: [CodeSchema],
});


module.exports = mongoose.model('Product', ProductSchema);
