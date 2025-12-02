const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bit-tms')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ Connection error:', err));

const Grade = require('./src/models/Grade');
const Student = require('./src/models/Student');
const TUE = require('./src/models/TUE');

async function runDiagnostics() {
    console.log('\n' + '='.repeat(60));
    console.log('GRADE VALIDATION DIAGNOSTIC REPORT');
    console.log('='.repeat(60) + '\n');

    try {
        // Test 1: Check total grades count
        console.log('📊 TEST 1: Total Grades Count');
        console.log('-'.repeat(60));
        const totalGrades = await Grade.countDocuments({});
        console.log(`Total grades in database: ${totalGrades}`);

        if (totalGrades === 0) {
            console.log('⚠️  WARNING: No grades found in database!\n');
            return;
        }
        console.log('✅ Grades exist\n');

        // Test 2: Check academic years in grades
        console.log('📅 TEST 2: Academic Years Distribution');
        console.log('-'.repeat(60));
        const yearDistribution = await Grade.aggregate([
            { $group: { _id: '$academicYear', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        console.log('Academic Year Breakdown:');
        yearDistribution.forEach(item => {
            const year = item._id || '<NULL/UNDEFINED>';
            console.log(`  ${year}: ${item.count} grades`);
        });

        const nullYears = yearDistribution.find(item => !item._id);
        if (nullYears) {
            console.log(`\n❌ CRITICAL: Found ${nullYears.count} grades with NULL academicYear!`);
        }
        console.log();

        // Test 3: Check current indexes
        console.log('🔍 TEST 3: Current Database Indexes');
        console.log('-'.repeat(60));
        const indexes = await Grade.collection.getIndexes();
        console.log('Existing indexes on grades collection:');
        indexes.forEach(index => {
            console.log(`  - ${index.name}`);
            console.log(`    Keys: ${JSON.stringify(index.key)}`);
            if (index.unique) console.log(`    Unique: true`);
        });

        const problematicIndex = indexes.find(idx =>
            idx.key.studentId && idx.key.tueId && !idx.key.academicYear && idx.unique
        );

        if (problematicIndex) {
            console.log(`\n❌ FOUND PROBLEMATIC INDEX: ${problematicIndex.name}`);
            console.log(`   This index prevents students from having grades across multiple years!`);
        }
        console.log();

        // Test 4: Sample grades for analysis
        console.log('📋 TEST 4: Sample Grades (First 5)');
        console.log('-'.repeat(60));
        const sampleGrades = await Grade.find()
            .limit(5)
            .populate('studentId', 'firstName lastName registrationNumber')
            .populate('tueId', 'name');

        sampleGrades.forEach((grade, idx) => {
            console.log(`\nGrade #${idx + 1}:`);
            console.log(`  Student: ${grade.studentId?.firstName} ${grade.studentId?.lastName} (${grade.studentId?.registrationNumber})`);
            console.log(`  TUE: ${grade.tueId?.name}`);
            console.log(`  Academic Year: ${grade.academicYear || '<NULL>'}`);
            console.log(`  Final Grade: ${grade.finalGrade}/20`);
        });
        console.log();

        // Test 5: Check for duplicate (student, TUE) pairs across different years
        console.log('🔄 TEST 5: Duplicate Detection');
        console.log('-'.repeat(60));
        const duplicates = await Grade.aggregate([
            {
                $group: {
                    _id: { studentId: '$studentId', tueId: '$tueId' },
                    count: { $sum: 1 },
                    years: { $addToSet: '$academicYear' }
                }
            },
            { $match: { count: { $gt: 1 } } },
            { $limit: 5 }
        ]);

        if (duplicates.length > 0) {
            console.log(`Found ${duplicates.length} (student, TUE) pairs with multiple grades:`);
            duplicates.forEach((dup, idx) => {
                console.log(`  ${idx + 1}. Student: ${dup._id.studentId}, TUE: ${dup._id.tueId}`);
                console.log(`     Count: ${dup.count}, Years: ${dup.years.join(', ')}`);
            });
            console.log('\n⚠️  This indicates the unique index is already preventing multi-year grades!');
        } else {
            console.log('✅ No duplicate (student, TUE) pairs found');
            console.log('   (This is expected if all grades are from the same year)');
        }
        console.log();

        // Test 6: Find a specific student (Jean Ouedraogo) and check their grades
        console.log('👤 TEST 6: Jean Ouedraogo Grade Analysis');
        console.log('-'.repeat(60));
        const jean = await Student.findOne({
            firstName: { $regex: 'Jean', $options: 'i' },
            lastName: { $regex: 'Ouedraogo', $options: 'i' }
        });

        if (jean) {
            console.log(`Found student: ${jean.firstName} ${jean.lastName} (${jean.registrationNumber})`);
            const jeanGrades = await Grade.find({ studentId: jean._id })
                .populate('tueId', 'name');

            console.log(`Total grades for Jean: ${jeanGrades.length}`);

            if (jeanGrades.length > 0) {
                console.log('\nBreakdown by academic year:');
                const jeanYearBreakdown = {};
                jeanGrades.forEach(g => {
                    const year = g.academicYear || '<NULL>';
                    jeanYearBreakdown[year] = (jeanYearBreakdown[year] || 0) + 1;
                });

                Object.entries(jeanYearBreakdown).forEach(([year, count]) => {
                    console.log(`  ${year}: ${count} grades`);
                });

                console.log('\nSample of Jean\'s grades:');
                jeanGrades.slice(0, 3).forEach((g, idx) => {
                    console.log(`  ${idx + 1}. ${g.tueId?.name || 'Unknown TUE'}: ${g.finalGrade}/20 (Year: ${g.academicYear || '<NULL>'})`);
                });
            } else {
                console.log('❌ No grades found for Jean!');
            }
        } else {
            console.log('⚠️  Could not find student Jean Ouedraogo');
        }
        console.log();

        // Test 7: Recommended fixes
        console.log('💡 RECOMMENDATIONS');
        console.log('='.repeat(60));

        const hasNullYears = yearDistribution.some(item => !item._id);
        const hasBadIndex = !!problematicIndex;

        if (hasNullYears && hasBadIndex) {
            console.log('Status: 🔴 CRITICAL - Multiple issues detected\n');
            console.log('Issues found:');
            console.log('  1. Grades with NULL academicYear values');
            console.log('  2. Incorrect unique index (missing academicYear)\n');
            console.log('Recommended fix order:');
            console.log('  1. Set academicYear to "2023-2024" for all NULL grades');
            console.log('  2. Drop the old index');
            console.log('  3. Update Grade.js model code');
            console.log('  4. Restart backend (new index will be created)\n');
        } else if (hasBadIndex) {
            console.log('Status: 🟡 WARNING - Index needs fixing\n');
            console.log('Issue: Incorrect unique index (missing academicYear)\n');
            console.log('Recommended fix:');
            console.log('  1. Drop the old index');
            console.log('  2. Update Grade.js model code');
            console.log('  3. Restart backend\n');
        } else {
            console.log('Status: ✅ GOOD - No critical issues detected\n');
            console.log('The database appears to be correctly configured.');
        }

    } catch (error) {
        console.error('\n❌ ERROR during diagnostics:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

// Run diagnostics
runDiagnostics()
    .then(() => {
        console.log('\n' + '='.repeat(60));
        console.log('DIAGNOSTIC COMPLETE');
        console.log('='.repeat(60));
        process.exit(0);
    })
    .catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
