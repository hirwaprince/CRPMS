const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Session based authentication
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }

            if (!req.user.isActive) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'User account is deactivated' 
                });
            }

            next();
        } catch (error) {
            console.error('Auth Error:', error);
            res.status(401).json({ 
                success: false, 
                message: 'Not authorized, token failed' 
            });
        }
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Not authorized, no token provided' 
        });
    }
};

// Admin only middleware
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Not authorized as admin' 
        });
    }
};

module.exports = { protect, admin };