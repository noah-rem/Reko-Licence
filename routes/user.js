const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const jwt = require('jsonwebtoken');



//User info routes
router.get('/:usernameOrEmail',verifyToken, checkRole(['admin']), async (req, res) => {
    const user = await User.findOne({
        $or: [
            { name: req.params.usernameOrEmail },
            { email: req.params.usernameOrEmail }
        ]
    });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const products = await Product.find({
        'users': user._id
    });

    const productNames = products.map(product => product.name);

    res.json({
        userId: user._id,
        ownedProducts: productNames
    });
});

// Get currently logged in user's information
router.get('/', verifyToken, async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId);
        
    if (!user) return res.status(404).json({ message: "User not found" });

    const products = await Product.find({
        'users': user._id
    });

    const productNames = products.map(product => product.name);

    res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ownedProducts: productNames
    });
});

module.exports = router;