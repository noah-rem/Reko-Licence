require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');

//Generating RSA Key
const privatePath = 'private.pem';
const publicPath = 'public.pem';

if (!fs.existsSync(privatePath) || !fs.existsSync(publicPath)) {
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
    fs.writeFileSync(privatePath, privateKey);
    fs.writeFileSync(publicPath, publicKey);
}

// Connect to DB
mongoose.connect(process.env.DB_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('connected to DB!'))
    .catch(err => console.error('Connection error', err));

// Import Routes
const authRoute = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/user');
const keyRoute = require('./routes/key');
const blacklistRoutes = require('./routes/blacklist');

//CORS FOR TESTING PURPOSE
app.use(cors());
app.use(cors({ origin: '*' }));

// Route Middlewares
app.use(express.json());
app.use('/api/auth', authRoute);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/key', keyRoute);
app.use('/api/blacklist', blacklistRoutes);

// Import middleware
const verifyToken = require('./middleware/verifyToken');

// Test Protected Route
app.get('/api/test', verifyToken, (req, res) => {
    res.json({test: 'This route is protected!'});
});

app.use(function (req, res, next) {
    res.status(404).json({error: 'Sorry, we cannot find that!'});
});

app.listen(3001, () => console.log('Server running.'));
