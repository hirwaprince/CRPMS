const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// User Schema (inline to avoid import issues)
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    fullName: String,
    role: String
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'smartpark_secret',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
                token
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/auth/profile
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartpark_secret');
        const user = await User.findById(decoded.id).select('-password');

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
});

module.exports = router;