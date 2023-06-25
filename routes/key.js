const express = require('express');
const fs = require('fs');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

router.get('/public', verifyToken, (req, res) => {
    const publicKey = fs.readFileSync('public.pem', 'utf8');
    res.send(publicKey);
});

module.exports = router;