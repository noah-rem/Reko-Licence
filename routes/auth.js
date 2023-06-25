const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Blacklist = require('../models/Blacklist');

//Register Route
router.post('/register', async (req, res) => {
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).json({error: 'Email already exists'});
    const usernameExist = await User.findOne({ name: req.body.name});
    if(usernameExist) return res.status(400).json({error: 'Username already exists'});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
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
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({error: 'Email is not found'});

    const blacklistCheck = await Blacklist.findOne({userId: user._id});
    if (blacklistCheck) return res.status(403).json({error: "You're blacklisted."});

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).json({error: 'Invalid password'});

    if (user.hwid == "None") {
        user.hwid = req.body.hwid;
        await user.save();
    } else {
        if (user.hwid !== req.body.hwid) {
            return res.status(401).json({error: 'Unvalid license'});
        }
    }

    const token = jwt.sign({_id: user._id, role: user.role}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).json({token: token});
});

module.exports = router;
