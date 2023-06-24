// MiddleWare Verify Role
const checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden - You don't have permission to access this resource" });
    }
    next();
}

module.exports = checkRole;
