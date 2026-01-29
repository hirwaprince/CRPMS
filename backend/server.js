const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route - Remove after debugging
app.get('/api/test-user', async (req, res) => {
    try {
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        res.json({
            count: users.length,
            users: users.map(u => ({
                username: u.username,
                fullName: u.fullName,
                passwordLength: u.password?.length,
                isHashed: u.password?.startsWith('$2')
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Connect to MongoDB
console.log('🔄 Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected!'))
    .catch((err) => console.error('❌ MongoDB Error:', err.message));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/service-records', require('./routes/serviceRecordRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Home
app.get('/', (req, res) => {
    res.json({ message: 'SmartPark CRPMS API is running' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});