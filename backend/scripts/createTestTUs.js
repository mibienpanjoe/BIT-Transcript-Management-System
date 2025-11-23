const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('🔄 Creating Teaching Units (TUs)...\n');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB connected\n');

        try {
            const Field = require('../src/models/Field');
            const Promotion = require('../src/models/Promotion');
            const Semester = require('../src/models/Semester');
            const TU = require('../src/models/TU');

            // Find promotions and their semesters
            const promotions = await Promotion.find({})
                .populate('fieldId')
                .sort({ 'fieldId.code': 1 });

            console.log(`📚 Found ${promotions.length} promotions\n`);

            // Find semesters for each promotion
            const semesters = {};
            for (const promotion of promotions) {
                const semester = await Semester.findOne({ promotionId: promotion._id, order: 1 });
                if (semester) {
                    semesters[promotion.fieldId.code] = semester;
                    console.log(`   ✅ Found S1 for ${promotion.name}`);
                }
            }

            console.log('\n📝 Creating TUs...\n');

            // Define TUs to create
            const tusToCreate = [
                // EE TUs
                {
                    name: 'Renewable Energy IV',
                    code: 'TU_L3S1_EE_01',
                    semesterId: semesters['EE']?._id,
                    credits: 4,
                    field: 'EE'
                },
                {
                    name: 'Power Systems III',
                    code: 'TU_L3S1_EE_02',
                    semesterId: semesters['EE']?._id,
                    credits: 4,
                    field: 'EE'
                },
                {
                    name: 'Digital Electronics II',
                    code: 'TU_L3S1_EE_03',
                    semesterId: semesters['EE']?._id,
                    credits: 3,
                    field: 'EE'
                },
                // CS TUs
                {
                    name: 'Advanced Programming',
                    code: 'TU_L3S1_CS_01',
                    semesterId: semesters['CS']?._id,
                    credits: 4,
                    field: 'CS'
                },
                {
                    name: 'Database Systems',
                    code: 'TU_L3S1_CS_02',
                    semesterId: semesters['CS']?._id,
                    credits: 4,
                    field: 'CS'
                },
                {
                    name: 'Web Development',
                    code: 'TU_L3S1_CS_03',
                    semesterId: semesters['CS']?._id,
                    credits: 3,
                    field: 'CS'
                }
            ];

            let created = 0;
            let skipped = 0;

            for (const tuData of tusToCreate) {
                if (!tuData.semesterId) {
                    console.log(`   ⚠️  Skipping ${tuData.name} - no semester found for ${tuData.field}`);
                    skipped++;
                    continue;
                }

                // Check if TU already exists
                const existing = await TU.findOne({ code: tuData.code });

                if (existing) {
                    console.log(`   ⏭️  ${tuData.name} already exists`);
                    skipped++;
                } else {
                    // Remove field property before creating
                    const { field, ...createData } = tuData;
                    const tu = await TU.create(createData);
                    console.log(`   ✅ Created ${tuData.name} (${tuData.code}) - ${tuData.credits} credits`);
                    created++;
                }
            }

            // Verify created TUs
            const allTUs = await TU.find({}).populate('semesterId');
            console.log(`\n✅ Summary:`);
            console.log(`   - Total TUs in database: ${allTUs.length}`);
            console.log(`   - Created this run: ${created}`);
            console.log(`   - Skipped (already exist): ${skipped}\n`);

            if (allTUs.length > 0) {
                console.log('📊 All TUs:');
                allTUs.forEach(tu => {
                    console.log(`   - ${tu.name} (${tu.code}) - ${tu.credits} credits`);
                });
            }

            console.log('\n🎉 TU creation complete!\n');

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
