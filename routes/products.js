const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const checkRole = require('../middleware/checkRole');
const authenticateToken = require('../middleware/verifyToken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Route to create a product - Admin Based Role
router.post('/', authenticateToken, checkRole(['admin']), async (req, res) => {
    const productName = await Product.findOne({ name: req.body.name});
    if (productName) return res.status(400).send("Product Already Exists.");

    const product = new Product({
        name: req.body.name
    });

    try {
        const savedProduct = await product.save();
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
        });

        const keysDirectory = path.join(__dirname, 'keys');
        if (!fs.existsSync(keysDirectory)){
            fs.mkdirSync(keysDirectory);
        }

        const filename = uuidv4();

        const filePath = path.join(keysDirectory, `${filename}.pem`);
        fs.writeFileSync(filePath, publicKey);

        const filePathPrivate = path.join(keysDirectory, `${filename}-private.pem`);
        fs.writeFileSync(filePathPrivate, privateKey);

        product.publicKeyPath = filePath;
        await product.save();

        res.json({product: savedProduct, private: privateKey, publicKeyPath: filePath});
    } catch (err) {
        res.status(400).send(err);
    }
});

// Route to attribute a product to a user - Admin Based Role
router.put('/attribute/:productId', authenticateToken, checkRole(['admin']), async (req, res) => {
    const product = await Product.findById(req.params.productId);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findOne({ 'name': req.body.name });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (product.users.some(userId => userId.toString() === user._id.toString())) {
        return res.status(400).json({ message: "User already added to the product" });
    }

    product.users.push(user._id);

    try {
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).send(err);
    }
});

// Route to get all products
router.get('/', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Route to get all users of a product and the product's name
router.get('/:productId/users', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId).populate('users');
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const response = {
            productName: product.name,
            users: product.users
        }
        res.json(response);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Route to add a code to a product - Admin Based Role
router.post('/:productId/code', authenticateToken, checkRole(['admin']), async (req, res) => {
    const product = await Product.findById(req.params.productId);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    if (!req.body.codeName || !req.body.codeValue) {
        return res.status(400).json({ message: "Both codeName and codeValue are required" });
    }

    const existingCode = product.codes.some(code => code.name === req.body.codeName);
    if (existingCode) {
        return res.status(400).json({ message: "Code with this name already exists in the product" });
    }
    
    const code = {
        name: req.body.codeName,
        codeValue: req.body.codeValue
    };

    product.codes.push(code);

    try {
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).send(err);
    }
});


// Route to get all codes of a product
router.get('/:productName/codes', authenticateToken, async (req, res) => {
    const product = await Product.findOne({ name: req.params.productName }).populate('users');

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    const userId = req.user._id;

    if(product.users.every(user => user.id != userId) && req.user.role !== 'admin'){
        return res.status(403).json({ message: "Access denied" });
    }

    const publicKey = fs.readFileSync(product.publicKeyPath, 'utf8');
    console.log(publicKey)

    const encryptedCodes = product.codes.map(code => {

        const iv = crypto.randomBytes(16);
        const aesKey = crypto.randomBytes(32);
        const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);

        const encryptedCodeValue = Buffer.concat([cipher.update(code.codeValue, 'utf8'), cipher.final()]);
        const encryptedAesKey = crypto.publicEncrypt(publicKey, aesKey);

        return {
            name: code.name,
            codeValue: {
                iv: iv.toString('base64'),
                aesKey: encryptedAesKey.toString('base64'),
                data: encryptedCodeValue.toString('base64')
            }
        };
    });

    res.json(encryptedCodes);
});


module.exports = router;
