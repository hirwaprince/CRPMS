const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📦 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ Database Connection Error: ${error.message}`);
        console.log('\n🔧 Troubleshooting Tips:');
        console.log('   1. Check your MONGO_URI in .env file');
        console.log('   2. Make sure username and password are correct');
        console.log('   3. Check if IP is whitelisted in MongoDB Atlas');
        console.log('   4. Ensure password has no special characters like @#$%\n');
        process.exit(1);
    }
};

module.exports = connectDB;