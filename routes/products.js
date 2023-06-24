const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const checkRole = require('../middleware/checkRole');
const authenticateToken = require('../middleware/verifyToken');

// Route to create a product - Admin Based Role
router.post('/', authenticateToken, checkRole(['admin']), async (req, res) => {
    const product = new Product({
        name: req.body.name
    });

    try {
        const savedProduct = await product.save();
        res.json(savedProduct);
    } catch (err) {
        res.status(400).send(err);
    }
});

// Route to attribute a product to a user - Admin Based Role
router.post('/:productId/attribute', authenticateToken, checkRole(['admin']), async (req, res) => {
    const product = await Product.findById(req.params.productId);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    const users = await User.find({ '_id': { $in: req.body.userIds }});
    product.users = product.users.concat(users.map(user => user._id));

    try {
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;
