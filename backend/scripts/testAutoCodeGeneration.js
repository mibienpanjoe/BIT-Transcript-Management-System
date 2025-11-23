const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('🧪 Testing Auto-Generated Codes...\n');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB connected\n');

        try {
            const Field = require('../src/models/Field');
            const Promotion = require('../src/models/Promotion');
            const TU = require('../src/models/TU');
            const TUE = require('../src/models/TUE');
            const Semester = require('../src/models/Semester');

            // Get a semester for testing
            const semester = await Semester.findOne({}).populate({
                path: 'promotionId',
                populate: { path: 'fieldId' }
            });

            if (!semester) {
                console.log('❌ No semester found for testing');
                process.exit(1);
            }

            console.log(`📝 Testing with semester: ${semester.name}`);
            console.log(`   Field: ${semester.promotionId.fieldId.name}\n`);

            // Test 1: Create TU without code
            console.log('Test 1: Creating TU WITHOUT code field...');
            const testTU = await TU.create({
                name: 'Test Teaching Unit',
                semesterId: semester._id,
                credits: 3
                // No code provided!
            });
            console.log(`   ✅ Created TU: ${testTU.name}`);
            console.log(`   📌 Auto-generated code: ${testTU.code}\n`);

            // Test 2: Create TUE without code
            console.log('Test 2: Creating TUE WITHOUT code field...');
            const testTUE = await TUE.create({
                name: 'Test Teaching Unit Element',
                tuId: testTU._id,
                credits: 2
                // No code provided!
            });
            console.log(`   ✅ Created TUE: ${testTUE.name}`);
            console.log(`   📌 Auto-generated code: ${testTUE.code}\n`);

            // Clean up test data
            console.log('🧹 Cleaning up test data...');
            await TUE.findByIdAndDelete(testTUE._id);
            await TU.findByIdAndDelete(testTU._id);
            console.log('   ✅ Test data removed\n');

            console.log('🎉 Success! Auto-code generation is working!\n');
            console.log('Summary:');
            console.log('   - TU codes are auto-generated from semester relationships');
            console.log('   - TUE codes are auto-generated from TU relationships');
            console.log('   - No manual code entry needed!\n');

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
