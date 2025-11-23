const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('🔄 Connecting to MongoDB...');
console.log('📍 MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found in .env');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bit-tms')
    .then(async () => {
        console.log('✅ MongoDB connected successfully\n');

        try {
            // Get database name
            const dbName = mongoose.connection.db.databaseName;
            console.log(`📊 Database: ${dbName}`);

            // Delete all semesters
            const result = await mongoose.connection.db.collection('semesters').deleteMany({});

            console.log(`\n✅ Cleanup complete!`);
            console.log(`   - Deleted ${result.deletedCount} semester(s)`);
            console.log(`\nℹ️  You can now create semesters with the new schema:`);
            console.log(`   - Fields: name, promotionId, level, order (1-6)`);
            console.log(`   - No more startDate/endDate! 🎉\n`);

        } catch (error) {
            console.error('❌ Error during cleanup:', error.message);
        } finally {
            await mongoose.connection.close();
            console.log('👋 Database connection closed');
            process.exit(0);
        }
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        console.log('\n💡 Tip: Make sure:');
        console.log('   1. MongoDB is running');
        console.log('   2. MONGO_URI is set in backend/.env');
        console.log('   3. The database exists\n');
        process.exit(1);
    });
