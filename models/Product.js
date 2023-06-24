const mongoose = require('mongoose');

// MongoDB Product Model
const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model('Product', ProductSchema);
