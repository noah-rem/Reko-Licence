const Blacklist = require('../models/Blacklist');

// Blacklist a user - Admin Based Role
router.post('/:userId', authenticateToken, checkRole(['admin']), async (req, res) => {
    const user = await user.findById(req.params.userId);
    
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    
    const blacklistEntry = new Blacklist({
        userId: user._id,
        discord: req.body.discord,
        hwid: req.body.hwid,
        ip: req.body.ip
    });

    try {
        const savedEntry = await blacklistEntry.save();
        res.json(savedEntry);
    } catch (err) {
        res.status(400).send(err);
    }
});