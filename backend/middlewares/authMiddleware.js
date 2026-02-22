const jwt = require('jsonwebtoken');
const User = require('../schemas/userModel');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.type === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admins only' });
    }
};

const teacherOrAdmin = (req, res, next) => {
    if (req.user && (req.user.type === 'teacher' || req.user.type === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Teachers or Admins only' });
    }
};

module.exports = { protect, adminOnly, teacherOrAdmin };
