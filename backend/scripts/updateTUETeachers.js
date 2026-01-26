const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('🔄 Updating TUEs with teacher assignments...\n');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB connected\n');

        try {
            const User = require('../src/models/User');
            const TUE = require('../src/models/TUE');

            // Find teachers
            const teacher1 = await User.findOne({ email: 'teacher1@bit.com' });
            const teacher2 = await User.findOne({ email: 'teacher2@bit.com' });

            if (!teacher1 || !teacher2) {
                console.log('❌ Teachers not found in database');
                process.exit(1);
            }

            console.log(`✅ Found teacher: ${teacher1.firstName} ${teacher1.lastName}`);
            console.log(`✅ Found teacher: ${teacher2.firstName} ${teacher2.lastName}\n`);

            // Update EE TUEs with teacher1
            const eeUpdates = await TUE.updateMany(
                { code: { $in: ['EE_L3_REN401', 'EE_L3_REN402'] } },
                { $set: { teacherId: teacher1._id, volumeHours: 40 } }
            );
            console.log(`✅ Updated ${eeUpdates.modifiedCount} EE TUEs with Dr. Ahmed Ouédraogo`);

            // Update CS TUEs with teacher2
            const csUpdates = await TUE.updateMany(
                { code: { $in: ['CS_L3_PRG401', 'CS_L3_PRG402'] } },
                { $set: { teacherId: teacher2._id, volumeHours: 45 } }
            );
            console.log(`✅ Updated ${csUpdates.modifiedCount} CS TUEs with Prof. Fatou Diop\n`);

            // Verify
            const allTUEs = await TUE.find({}).populate('teacherId');
            console.log('📊 Updated TUEs:');
            allTUEs.forEach(tue => {
                const teacherName = tue.teacherId ?
                    `${tue.teacherId.firstName} ${tue.teacherId.lastName}` :
                    'No teacher';
                console.log(`   - ${tue.name}`);
                console.log(`     Teacher: ${teacherName}, Hours: ${tue.volumeHours || 0}`);
            });

            console.log('\n🎉 TUE update complete!\n');

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
