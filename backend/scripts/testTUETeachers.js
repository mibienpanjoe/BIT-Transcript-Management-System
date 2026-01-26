const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('🧪 Testing TUE Teacher Population...\n');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB connected\n');

        try {
            const User = require('../src/models/User');
            const TUE = require('../src/models/TUE');

            // Fetch TUEs with populated teacher
            const tues = await TUE.find({})
                .populate({
                    path: 'teacherId',
                    select: 'firstName lastName email role'
                });

            console.log(`📊 Found ${tues.length} TUEs\n`);

            tues.forEach(tue => {
                console.log(`TUE: ${tue.name} (${tue.code})`);
                if (tue.teacherId) {
                    console.log(`   ✅ Teacher: ${tue.teacherId.firstName} ${tue.teacherId.lastName}`);
                    console.log(`      Email: ${tue.teacherId.email}`);
                    console.log(`      Role: ${tue.teacherId.role}`);
                } else {
                    console.log(`   ⚠️  No teacher assigned`);
                }
                console.log();
            });

            console.log('🎉 Test complete!\n');

        } catch (error) {
            console.error('❌ Error:', error.message);
        } finally {
            await mongoose.connection.close();
            console.log('👋 Database connection closed');
            process.exit(0);
        }
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });
