require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Connect to DB
mongoose.connect(process.env.DB_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('connected to DB!'))
    .catch(err => console.error('Connection error', err));

// Import Routes
const authRoute = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/user');

// Route Middlewares
app.use(express.json());
app.use('/api/auth', authRoute);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Import middleware
const verifyToken = require('./middleware/verifyToken');

// Test Protected Route
app.get('/api/test', verifyToken, (req, res) => {
    res.send('This route is protected!');
});

app.listen(3000, () => console.log('Server running.'));
