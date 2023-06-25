require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const NodeRSA = require('node-rsa');
const fs = require('fs');

// Connect to DB
mongoose.connect(process.env.DB_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('connected to DB!'))
    .catch(err => console.error('Connection error', err));

// Import Routes
const authRoute = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/user');
const keyRoute = require('./routes/key');

// Route Middlewares
app.use(express.json());
app.use('/api/auth', authRoute);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/key', keyRoute);

// Import middleware
const verifyToken = require('./middleware/verifyToken');

// Test Protected Route
app.get('/api/test', verifyToken, (req, res) => {
    res.json({test: 'This route is protected!'});
});

//Generating RSA Key
if (!fs.existsSync('private.pem') || !fs.existsSync('public.pem')) {
    const key = new NodeRSA({b: 2048});

    const privateDerKey = key.exportKey('private');
    const publicDerKey = key.exportKey('public');

    fs.writeFileSync('private.pem', privateDerKey);
    fs.writeFileSync('public.pem', publicDerKey);
}

app.use(function (req, res, next) {
    res.status(404).json({error: 'Sorry, we cannot find that!'});
});

app.listen(3000, () => console.log('Server running.'));
