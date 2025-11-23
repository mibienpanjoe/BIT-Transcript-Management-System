const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('🔍 Verifying Academic Structure...\n');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB connected\n');

        try {
            const Field = require('../src/models/Field');
            const Promotion = require('../src/models/Promotion');
            const Semester = require('../src/models/Semester');
            const TU = require('../src/models/TU');
            const TUE = require('../src/models/TUE');
            const User = require('../src/models/User');

            // Count everything
            const fieldCount = await Field.countDocuments();
            const promotionCount = await Promotion.countDocuments();
            const semesterCount = await Semester.countDocuments();
            const tuCount = await TU.countDocuments();
            const tueCount = await TUE.countDocuments();
            const teacherCount = await User.countDocuments({ role: 'Teacher' });

            console.log('📊 **Academic Structure Summary**\n');
            console.log(`✅ Fields: ${fieldCount}`);
            console.log(`✅ Promotions: ${promotionCount}`);
            console.log(`✅ Semesters: ${semesterCount}`);
            console.log(`✅ Teaching Units (TUs): ${tuCount}`);
            console.log(`✅ Teaching Unit Elements (TUEs): ${tueCount}`);
            console.log(`✅ Teachers: ${teacherCount}\n`);

            // Show detailed structure
            const fields = await Field.find({});
            console.log('📚 **Detailed Structure:**\n');

            for (const field of fields) {
                console.log(`📁 ${field.name} (${field.code})`);

                const promotions = await Promotion.find({ fieldId: field._id });
                for (const promotion of promotions) {
                    console.log(`  └─ ${promotion.name}`);

                    const semesters = await Semester.find({ promotionId: promotion._id });
                    for (const semester of semesters) {
                        console.log(`      └─ ${semester.name} (Order: ${semester.order})`);

                        const tus = await TU.find({ semesterId: semester._id });
                        for (const tu of tus) {
                            console.log(`          └─ ${tu.name} (${tu.code}) - ${tu.credits} credits`);

                            const tues = await TUE.find({ tuId: tu._id }).populate('teacherId');
                            for (const tue of tues) {
                                const teacherName = tue.teacherId ?
                                    `${tue.teacherId.firstName} ${tue.teacherId.lastName}` :
                                    'No teacher';
                                console.log(`              └─ ${tue.name} (${tue.code})`);
                                console.log(`                  Teacher: ${teacherName}, Credits: ${tue.credits}`);
                            }
                        }
                    }
                }
                console.log();
            }

            console.log('✅ **Verification Complete!**\n');

            if (tueCount >= 4) {
                console.log('🎉 Step 3.5 Complete! All required TUEs have been created.');
                console.log('   Ready to proceed to Phase 4: Student Management\n');
            } else {
                console.log(`⚠️  Only ${tueCount} TUEs created. Need at least 4 for testing.\n`);
            }

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
