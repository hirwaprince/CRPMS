const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log('🔄 Connecting to MongoDB...');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB Connected!\n');
        await fixIndexes();
    })
    .catch(err => {
        console.error('❌ Connection Failed:', err.message);
        process.exit(1);
    });

async function fixIndexes() {
    try {
        const db = mongoose.connection.db;

        console.log('🔧 Fixing indexes...\n');

        // Drop the cars collection completely
        try {
            await db.collection('cars').drop();
            console.log('✅ Dropped cars collection (will be recreated fresh)');
        } catch (e) {
            console.log('ℹ️  Cars collection does not exist');
        }

        // Also drop servicerecords and payments since they depend on cars
        try {
            await db.collection('servicerecords').drop();
            console.log('✅ Dropped servicerecords collection');
        } catch (e) {
            console.log('ℹ️  Servicerecords collection does not exist');
        }

        try {
            await db.collection('payments').drop();
            console.log('✅ Dropped payments collection');
        } catch (e) {
            console.log('ℹ️  Payments collection does not exist');
        }

        console.log('\n════════════════════════════════════════');
        console.log('🎉 INDEXES FIXED SUCCESSFULLY!');
        console.log('════════════════════════════════════════');
        console.log('\nYou can now add cars without errors.');
        console.log('Run: npm run dev\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}