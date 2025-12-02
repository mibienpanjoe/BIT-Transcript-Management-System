const mongoose = require('mongoose');
require('dotenv').config();

// Use the correct env variable name
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/bit-tms';

async function runDiagnostics() {
    console.log('\n' + '='.repeat(70));
    console.log('GRADE VALIDATION DIAGNOSTIC REPORT (MongoDB Atlas)');
    console.log('='.repeat(70) + '\n');

    console.log(`🔗 Connecting to: ${mongoUri.replace(/:[^:@]+@/, ':****@')}\n`);

    try {
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        const dbName = mongoose.connection.db.databaseName;
        console.log(`📂 Database: ${dbName}\n`);

        // List all collections with counts
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📋 Collections (${collections.length} total):\n`);

        for (const collection of collections) {
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            console.log(`  ${collection.name.padEnd(20)} : ${count.toString().padStart(5)} documents`);
        }
        console.log();

        // Get Grade collection
        const Grade = mongoose.connection.db.collection('grades');
        const gradeCount = await Grade.countDocuments();

        console.log('='.repeat(70));
        console.log('GRADE ANALYSIS');
        console.log('='.repeat(70) + '\n');

        if (gradeCount === 0) {
            console.log('❌ NO GRADES FOUND IN DATABASE!\n');
            console.log('This means:');
            console.log('  1. Grades shown in UI screenshots are NOT persisted');
            console.log('  2. Grade entry is failing silently');
            console.log('  3. OR grades are being saved to a different location\n');

            await mongoose.disconnect();
            return;
        }

        console.log(`✅ Found ${gradeCount} grades\n`);

        // Check academic years
        console.log('📅 Academic Year Distribution:');
        console.log('-'.repeat(70));
        const yearStats = await Grade.aggregate([
            {
                $group: {
                    _id: '$academicYear',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]).toArray();

        yearStats.forEach(stat => {
            const year = stat._id || '<NULL>';
            console.log(`  ${year.padEnd(20)}: ${stat.count} grades`);
        });
        console.log();

        const nullGrades = yearStats.find(s => !s._id);
        if (nullGrades) {
            console.log(`⚠️  WARNING: ${nullGrades.count} grades have NULL academicYear!\n`);
        }

        // Check indexes
        console.log('🔍 Index Analysis:');
        console.log('-'.repeat(70));
        const indexes = await Grade.listIndexes().toArray();

        indexes.forEach(index => {
            console.log(`\nIndex: ${index.name}`);
            console.log(`  Keys: ${JSON.stringify(index.key)}`);
            if (index.unique) console.log(`  Unique: ✅ YES`);
        });

        const badIndex = indexes.find(idx =>
            idx.key.studentId && idx.key.tueId && !idx.key.academicYear && idx.unique
        );

        if (badIndex) {
            console.log(`\n❌ PROBLEMATIC INDEX FOUND: ${badIndex.name}`);
            console.log(`   Missing academicYear in unique constraint!`);
            console.log(`   This prevents multi-year grade storage.\n`);
        }

        // Sample grades
        console.log('\n📋 Sample Grades (First 3):');
        console.log('-'.repeat(70));
        const samples = await Grade.find({}).limit(3).toArray();

        samples.forEach((grade, idx) => {
            console.log(`\nGrade ${idx + 1}:`);
            console.log(`  Student ID: ${grade.studentId}`);
            console.log(`  TUE ID: ${grade.tueId}`);
            console.log(`  Academic Year: ${grade.academicYear || '<NULL>'}`);
            console.log(`  Final Grade: ${grade.finalGrade}`);
            console.log(`  Presence: ${grade.presence}, Participation: ${grade.participation}, Evaluation: ${grade.evaluation}`);
        });

        // Find Jean Ouedraogo
        console.log('\n\n👤 Jean Ouedraogo Analysis:');
        console.log('-'.repeat(70));
        const Student = mongoose.connection.db.collection('students');
        const jean = await Student.findOne({
            firstName: { $regex: /jean/i },
            lastName: { $regex: /ouedraogo/i }
        });

        if (jean) {
            console.log(`✅ Found: ${jean.firstName} ${jean.lastName}`);
            console.log(`   Registration: ${jean.registrationNumber}`);
            console.log(`   Student ID: ${jean._id}\n`);

            const jeanGrades = await Grade.find({ studentId: jean._id }).toArray();
            console.log(`Total grades for Jean: ${jeanGrades.length}`);

            if (jeanGrades.length > 0) {
                const jeanYears = {};
                jeanGrades.forEach(g => {
                    const year = g.academicYear || '<NULL>';
                    jeanYears[year] = (jeanYears[year] || 0) + 1;
                });

                console.log('\nBreakdown by year:');
                Object.entries(jeanYears).forEach(([year, count]) => {
                    console.log(`  ${year}: ${count} grades`);
                });
            } else {
                console.log('❌ Jean has NO grades in the database!');
            }
        } else {
            console.log('❌ Could not find Jean Ouedraogo in students collection');
        }

        console.log('\n' + '='.repeat(70));
        console.log('RECOMMENDATIONS');
        console.log('='.repeat(70) + '\n');

        if (gradeCount === 0) {
            console.log('🔴 CRITICAL: Investigate why grades are not being saved');
            console.log('\nPossible causes:');
            console.log('  1. Grade controller is not executing');
            console.log('  2. Validation errors preventing save');
            console.log('  3. Database connection issue in grade routes');
            console.log('  4. Frontend sending requests to wrong endpoint\n');
        } else if (nullGrades) {
            console.log('🟡 Fix NULL academic years:');
            console.log(`  db.grades.updateMany({ academicYear: null }, { $set: { academicYear: "2023-2024" } })\n`);
        }

        if (badIndex) {
            console.log('🟡 Fix unique index:');
            console.log(`  1. db.grades.dropIndex("${badIndex.name}")`);
            console.log(`  2. Update Grade.js model code`);
            console.log(`  3. Restart backend\n`);
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB\n');
    }
}

runDiagnostics()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
