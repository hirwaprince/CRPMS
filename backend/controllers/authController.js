const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { username, password, fullName, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character (@$!%*?&)'
            });
        }

        // Create user
        const user = await User.create({
            username,
            password,
            fullName,
            role: role || 'mechanic'
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username and password'
            });
        }

        // Check for user
        const user = await User.findOne({ username }).select('+password');

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Contact administrator.'
            });
        }

        // Match password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

module.exports = {
    registerUser,
    loginUser,
    getProfile,
    logoutUser
};