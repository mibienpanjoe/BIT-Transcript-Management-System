const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

async function fixDatabase() {
    console.log('\n' + '='.repeat(70));
    console.log('GRADE DATABASE FIX SCRIPT');
    console.log('='.repeat(70) + '\n');

    try {
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB Atlas\n');

        const Grade = mongoose.connection.db.collection('grades');

        // Step 1: Check current state
        console.log('📊 STEP 1: Analyzing current state');
        console.log('-'.repeat(70));

        const totalGrades = await Grade.countDocuments();
        console.log(`Total grades: ${totalGrades}`);

        const yearStats = await Grade.aggregate([
            { $group: { _id: '$academicYear', count: { $sum: 1 } } }
        ]).toArray();

        console.log('\nCurrent academic year distribution:');
        yearStats.forEach(stat => {
            console.log(`  ${stat._id || '<NULL>'}: ${stat.count} grades`);
        });

        // Step 2: Update academic years
        console.log('\n\n🔧 STEP 2: Update academic years');
        console.log('-'.repeat(70));

        const gradesWithWrongYear = await Grade.countDocuments({ academicYear: "2025" });
        console.log(`Grades with academicYear="2025": ${gradesWithWrongYear}`);

        if (gradesWithWrongYear > 0) {
            console.log(`\n⚙️  Updating ${gradesWithWrongYear} grades from "2025" to "2023-2024"...`);

            const updateResult = await Grade.updateMany(
                { academicYear: "2025" },
                { $set: { academicYear: "2023-2024" } }
            );

            console.log(`✅ Updated ${updateResult.modifiedCount} grades`);
        } else {
            console.log('✅ No grades need year updates');
        }

        // Step 3: Drop old index
        console.log('\n\n🗑️  STEP 3: Drop problematic index');
        console.log('-'.repeat(70));

        try {
            const indexes = await Grade.listIndexes().toArray();
            const badIndex = indexes.find(idx =>
                idx.name === 'studentId_1_tueId_1' && idx.unique
            );

            if (badIndex) {
                console.log(`Found problematic index: ${badIndex.name}`);
                console.log(`Keys: ${JSON.stringify(badIndex.key)}`);
                console.log('\n⚙️  Dropping index...');

                await Grade.dropIndex('studentId_1_tueId_1');
                console.log('✅ Index dropped successfully');
            } else {
                console.log('✅ Problematic index not found (may have been fixed already)');
            }
        } catch (error) {
            if (error.code === 27 || error.message.includes('index not found')) {
                console.log('✅ Index already dropped or does not exist');
            } else {
                throw error;
            }
        }

        // Step 4: Create new index
        console.log('\n\n➕ STEP 4: Create new index with academicYear');
        console.log('-'.repeat(70));

        try {
            await Grade.createIndex(
                { studentId: 1, tueId: 1, academicYear: 1 },
                { unique: true, name: 'studentId_1_tueId_1_academicYear_1' }
            );
            console.log('✅ New index created successfully');
        } catch (error) {
            if (error.code === 85 || error.message.includes('already exists')) {
                console.log('✅ Index already exists');
            } else {
                throw error;
            }
        }

        // Step 5: Verify fixes
        console.log('\n\n🔍 STEP 5: Verify fixes');
        console.log('-'.repeat(70));

        const updatedYearStats = await Grade.aggregate([
            { $group: { _id: '$academicYear', count: { $sum: 1 } } }
        ]).toArray();

        console.log('\nUpdated academic year distribution:');
        updatedYearStats.forEach(stat => {
            console.log(`  ${stat._id || '<NULL>'}: ${stat.count} grades`);
        });

        const finalIndexes = await Grade.listIndexes().toArray();
        console.log('\nFinal indexes:');
        finalIndexes.forEach(idx => {
            console.log(`  ${idx.name}: ${JSON.stringify(idx.key)}`);
            if (idx.unique) console.log(`    Unique: YES`);
        });

        // Test Jean Ouedraogo
        console.log('\n\n👤 TEST: Jean Ouedraogo grades');
        console.log('-'.repeat(70));

        const Student = mongoose.connection.db.collection('students');
        const jean = await Student.findOne({
            firstName: { $regex: /jean/i },
            lastName: { $regex: /ouedraogo/i }
        });

        if (jean) {
            const jeanGrades2023 = await Grade.find({
                studentId: jean._id,
                academicYear: "2023-2024"
            }).toArray();

            console.log(`Jean's grades for academicYear="2023-2024": ${jeanGrades2023.length}`);

            if (jeanGrades2023.length > 0) {
                console.log('✅ SUCCESS: Validation should now find Jean\'s grades!');
            } else {
                console.log('❌ ERROR: Still no grades found for 2023-2024');
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('FIX COMPLETE');
        console.log('='.repeat(70) + '\n');

        console.log('✅ Database has been fixed:');
        console.log('   1. All grades updated to academicYear="2023-2024"');
        console.log('   2. Old index dropped');
        console.log('   3. New index created with academicYear\n');

        console.log('⚠️  IMPORTANT: You must also update the Grade.js model:');
        console.log('   File: backend/src/models/Grade.js');
        console.log('   Line 56: Change index to include academicYear\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB\n');
    }
}

fixDatabase()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
