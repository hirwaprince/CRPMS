const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

console.log('🔄 Connecting to MongoDB...');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB Connected!\n');
        await seedDatabase();
    })
    .catch(err => {
        console.error('❌ Connection Failed:', err.message);
        process.exit(1);
    });

// Services data
const services = [
    { ServiceCode: 'SRV001', ServiceName: 'Engine Repair', ServicePrice: 150000 },
    { ServiceCode: 'SRV002', ServiceName: 'Transmission Repair', ServicePrice: 80000 },
    { ServiceCode: 'SRV003', ServiceName: 'Oil Change', ServicePrice: 60000 },
    { ServiceCode: 'SRV004', ServiceName: 'Chain Replacement', ServicePrice: 40000 },
    { ServiceCode: 'SRV005', ServiceName: 'Disc Replacement', ServicePrice: 400000 },
    { ServiceCode: 'SRV006', ServiceName: 'Wheel Alignment', ServicePrice: 5000 }
];

async function seedDatabase() {
    try {
        const db = mongoose.connection.db;

        // List of ALL collections to drop (clears old indexes too)
        const collectionsToDrop = [
            'services', 
            'users', 
            'cars', 
            'servicerecords', 
            'payments'
        ];

        console.log('🗑️  Dropping all collections (clears old indexes)...\n');
        
        for (const name of collectionsToDrop) {
            try {
                await db.collection(name).drop();
                console.log(`   ✓ Dropped: ${name}`);
            } catch (e) {
                console.log(`   - Skipped: ${name} (doesn't exist)`);
            }
        }

        // Insert services
        console.log('\n📦 Creating services...');
        await db.collection('services').insertMany(services);
        services.forEach(s => {
            console.log(`   ✓ ${s.ServiceName}: ${s.ServicePrice.toLocaleString()} RWF`);
        });

        // Hash password and create admin
        console.log('\n👤 Creating admin user...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);
        
        await db.collection('users').insertOne({
            username: 'admin',
            password: hashedPassword,
            fullName: 'Chief Mechanic',
            role: 'admin',
            createdAt: new Date()
        });
        console.log('   ✓ Admin user created');

        console.log('\n╔════════════════════════════════════════════╗');
        console.log('║       DATABASE SEEDED SUCCESSFULLY!        ║');
        console.log('╠════════════════════════════════════════════╣');
        console.log('║  Username: admin                           ║');
        console.log('║  Password: Admin@123                       ║');
        console.log('╚════════════════════════════════════════════╝\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}