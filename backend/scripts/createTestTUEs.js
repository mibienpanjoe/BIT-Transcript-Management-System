const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('🔄 Checking and creating teachers and TUEs...\n');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB connected\n');

        try {
            const User = require('../src/models/User');
            const TU = require('../src/models/TU');
            const TUE = require('../src/models/TUE');

            // Step 1: Check/Create Teachers
            console.log('👨‍🏫 Checking for teachers...\n');

            const teachersToCreate = [
                {
                    email: 'teacher1@bit.com',
                    password: 'teacher123',
                    firstName: 'Dr. Ahmed',
                    lastName: 'Ouédraogo',
                    role: 'Teacher'
                },
                {
                    email: 'teacher2@bit.com',
                    password: 'teacher123',
                    firstName: 'Prof. Fatou',
                    lastName: 'Diop',
                    role: 'Teacher'
                }
            ];

            const teachers = {};
            for (const teacherData of teachersToCreate) {
                let teacher = await User.findOne({ email: teacherData.email });
                if (teacher) {
                    console.log(`   ✅ ${teacherData.firstName} ${teacherData.lastName} already exists`);
                } else {
                    teacher = await User.create(teacherData);
                    console.log(`   ✅ Created teacher: ${teacherData.firstName} ${teacherData.lastName}`);
                }
                teachers[teacherData.email] = teacher;
            }

            // Step 2: Get TUs
            console.log('\n📚 Finding TUs...\n');
            const allTUs = await TU.find({});
            const renewableEnergy = allTUs.find(tu => tu.code === 'TU_L3S1_EE_01');
            const advancedProgramming = allTUs.find(tu => tu.code === 'TU_L3S1_CS_01');

            if (!renewableEnergy || !advancedProgramming) {
                console.log('❌ Required TUs not found');
                process.exit(1);
            }

            console.log(`   ✅ Found Renewable Energy IV`);
            console.log(`   ✅ Found Advanced Programming`);

            // Step 3: Create TUEs
            console.log('\n📝 Creating TUEs...\n');

            const tuesToCreate = [
                // EE TUEs
                {
                    name: 'Solar Thermal Energy',
                    code: 'EE_L3_REN401',
                    tuId: renewableEnergy._id,
                    teacherId: teachers['teacher1@bit.com']._id,
                    credits: 2
                },
                {
                    name: 'Wind Energy Systems',
                    code: 'EE_L3_REN402',
                    tuId: renewableEnergy._id,
                    teacherId: teachers['teacher1@bit.com']._id,
                    credits: 2
                },
                // CS TUEs
                {
                    name: 'Object-Oriented Programming',
                    code: 'CS_L3_PRG401',
                    tuId: advancedProgramming._id,
                    teacherId: teachers['teacher2@bit.com']._id,
                    credits: 2
                },
                {
                    name: 'Data Structures & Algorithms',
                    code: 'CS_L3_PRG402',
                    tuId: advancedProgramming._id,
                    teacherId: teachers['teacher2@bit.com']._id,
                    credits: 2
                }
            ];

            let created = 0;
            let skipped = 0;

            for (const tueData of tuesToCreate) {
                const existing = await TUE.findOne({ code: tueData.code });

                if (existing) {
                    console.log(`   ⏭️  ${tueData.name} already exists`);
                    skipped++;
                } else {
                    const tue = await TUE.create(tueData);
                    console.log(`   ✅ Created ${tueData.name} (${tueData.code}) - ${tueData.credits} credits`);
                    created++;
                }
            }

            // Verify created TUEs
            const allTUEs = await TUE.find({}).populate(['tuId', 'teacherId']);
            console.log(`\n✅ Summary:`);
            console.log(`   - Total TUEs in database: ${allTUEs.length}`);
            console.log(`   - Created this run: ${created}`);
            console.log(`   - Skipped (already exist): ${skipped}\n`);

            if (allTUEs.length > 0) {
                console.log('📊 All TUEs:');
                allTUEs.forEach(tue => {
                    const teacherName = tue.teacherId ? `${tue.teacherId.firstName} ${tue.teacherId.lastName}` : 'No teacher';
                    console.log(`   - ${tue.name} (${tue.code})`);
                    console.log(`     TU: ${tue.tuId?.name || 'Unknown'}`);
                    console.log(`     Teacher: ${teacherName}`);
                    console.log(`     Credits: ${tue.credits}\n`);
                });
            }

            console.log('🎉 TUE creation complete!\n');
            console.log('📝 Note: The current TUE model uses a simplified structure.');
            console.log('   Evaluation structures (DS1, DS2, etc.) mentioned in the testing');
            console.log('   guide may be handled at the Grade entry level, not at TUE creation.\n');

        } catch (error) {
            console.error('❌ Error:', error.message);
            if (error.stack) console.error(error.stack);
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
