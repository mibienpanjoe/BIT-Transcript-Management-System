const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bit-tms';
        console.log(`\n🔍 Connecting to: ${mongoUri}\n`);

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Get database name
        const dbName = mongoose.connection.db.databaseName;
        console.log(`📂 Database: ${dbName}\n`);

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📋 Collections in database (${collections.length} total):\n`);

        for (const collection of collections) {
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            console.log(`  ${collection.name}: ${count} documents`);
        }

        console.log('\n' + '='.repeat(60));

        // Check if grades collection exists
        const gradesCollection = collections.find(c => c.name === 'grades');
        if (!gradesCollection) {
            console.log('\n❌ "grades" collection does NOT exist');
            console.log('   This means no grades have ever been saved!\n');
        } else {
            console.log('\n✅ "grades" collection exists');

            // Sample a few documents to see structure
            const sampleGrades = await mongoose.connection.db.collection('grades')
                .find({})
                .limit(3)
                .toArray();

            if (sampleGrades.length > 0) {
                console.log('\nSample grade documents:\n');
                sampleGrades.forEach((grade, idx) => {
                    console.log(`Grade ${idx + 1}:`);
                    console.log(JSON.stringify(grade, null, 2));
                    console.log();
                });
            }
        }

        await mongoose.disconnect();
        console.log('\n✅ Disconnected');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

checkDatabase();
