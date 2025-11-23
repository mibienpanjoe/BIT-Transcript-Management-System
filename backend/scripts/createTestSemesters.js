const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('🔄 Connecting to MongoDB and creating test data...\n');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB connected\n');

        try {
            // Get models
            const Promotion = require('../src/models/Promotion');
            const Semester = require('../src/models/Semester');
            const Field = require('../src/models/Field');

            // Find the promotions we created earlier
            const promotions = await Promotion.find({}).populate('fieldId');
            console.log(`📚 Found ${promotions.length} promotions`);

            if (promotions.length === 0) {
                console.log('❌ No promotions found. Please create promotions first.');
                process.exit(1);
            }

            promotions.forEach(p => {
                console.log(`   - ${p.name} (${p.fieldId?.name})`);
            });

            console.log('\n📝 Creating semesters...\n');

            // Create semesters for each promotion
            for (const promotion of promotions) {
                const semesterData = {
                    name: 'S1',
                    promotionId: promotion._id,
                    level: promotion.level,
                    order: 1
                };

                // Check if semester already exists
                const existing = await Semester.findOne({
                    promotionId: promotion._id,
                    order: 1
                });

                if (existing) {
                    console.log(`   ⏭️  Semester S1 for ${promotion.name} already exists`);
                } else {
                    const semester = await Semester.create(semesterData);
                    console.log(`   ✅ Created semester S1 for ${promotion.name}`);
                }
            }

            // Verify created semesters
            const allSemesters = await Semester.find({}).populate('promotionId');
            console.log(`\n✅ Total semesters in database: ${allSemesters.length}`);
            allSemesters.forEach(s => {
                console.log(`   - ${s.name} (Order: ${s.order}) - ${s.promotionId?.name}`);
            });

            console.log('\n🎉 Semester creation complete!\n');

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
