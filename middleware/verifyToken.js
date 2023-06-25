const jwt = require('jsonwebtoken');


// MiddleWare Verify Token Validity
module.exports = function(req, res, next) {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({error: 'Access Denied'});

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({error: "Invalid Token."});
    }
};
