const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Blacklist = require('../models/Blacklist');
const crypto = require('crypto');
const fs = require('fs');

//Register Route
router.post('/register', async (req, res) => {

    const privateKey = fs.readFileSync('private.pem', 'utf8');

    const emailBytes = Buffer.from(req.body.email, 'base64');
    const passwordBytes = Buffer.from(req.body.password, 'base64');
    const nameBytes = Buffer.from(req.body.name, 'base64');

    const decryptedEmail = crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
    }, emailBytes).toString();

    const decryptedPassword = crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
    }, passwordBytes).toString();

    const decryptedName = crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
    }, nameBytes).toString();

    const emailExist = await User.findOne({ email: decryptedEmail });
    if (emailExist) return res.status(400).json({error: 'Email already exists'});
    const usernameExist = await User.findOne({ name: decryptedName});
    if(usernameExist) return res.status(400).json({error: 'Username already exists'});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(decryptedPassword, salt);

    const user = new User({
        name: decryptedName,
        email: decryptedEmail,
        password: hashedPassword,
        role: "client"
    });

    try {
        const savedUser = await user.save();
        res.json({ user: user._id });
    } catch (err) {
        res.status(400).json(err);
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const privateKey = fs.readFileSync('private.pem', 'utf8');

    const emailBytes = Buffer.from(req.body.email, 'base64');
    const passwordBytes = Buffer.from(req.body.password, 'base64');
    const hwidBytes = Buffer.from(req.body.hwid, 'base64');

    const decryptedEmail = crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
    }, emailBytes).toString();
    
    const decryptedPassword = crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
    }, passwordBytes).toString();
    
    const decryptedHwid = crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
    }, hwidBytes).toString();

    const user = await User.findOne({ email: decryptedEmail });
    if (!user) return res.status(400).json({error: 'Email is not found'});

    const blacklistCheck = await Blacklist.findOne({userId: user._id});
    if (blacklistCheck) return res.status(403).json({error: "You're blacklisted."});

    const validPass = await bcrypt.compare(decryptedPassword, user.password);
    if (!validPass) return res.status(400).json({error: 'Invalid password'});

    if (user.hwid === "None") {
        user.hwid = decryptedHwid;
        await user.save();
    } else {
        if (user.hwid !== decryptedHwid) {
            return res.status(401).json({error: 'Invalid license'});
        }
    }
    
    const token = jwt.sign({_id: user._id, role: user.role}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).json({token: token});
});

module.exports = router;
