const express = require('express');
const fs = require('fs');
const router = express.Router();

router.get('/public', (req, res) => {
    const publicKey = fs.readFileSync('public.pem', 'utf8');
    res.json({key: publicKey});
});

module.exports = router;