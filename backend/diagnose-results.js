const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

async function diagnoseResults() {
    console.log('\n' + '='.repeat(70));
    console.log('RESULTS DIAGNOSTIC REPORT');
    console.log('='.repeat(70) + '\n');

    try {
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Load models
        const TUResult = mongoose.connection.db.collection('turesults');
        const SemesterResult = mongoose.connection.db.collection('semesterresults');
        const Grade = mongoose.connection.db.collection('grades');
        const Student = mongoose.connection.db.collection('students');

        // 1. Check TU Results
        console.log('📊 TU Results Analysis');
        console.log('-'.repeat(70));

        const totalTUResults = await TUResult.countDocuments();
        console.log(`Total TU Results: ${totalTUResults}`);

        const tuYearStats = await TUResult.aggregate([
            { $group: { _id: '$academicYear', count: { $sum: 1 } } }
        ]).toArray();

        console.log('Academic Years in TU Results:');
        tuYearStats.forEach(stat => {
            console.log(`  ${stat._id || '<NULL>'}: ${stat.count}`);
        });

        // 2. Check Semester Results
        console.log('\n📊 Semester Results Analysis');
        console.log('-'.repeat(70));

        const totalSemResults = await SemesterResult.countDocuments();
        console.log(`Total Semester Results: ${totalSemResults}`);

        const semYearStats = await SemesterResult.aggregate([
            { $group: { _id: '$academicYear', count: { $sum: 1 } } }
        ]).toArray();

        console.log('Academic Years in Semester Results:');
        semYearStats.forEach(stat => {
            console.log(`  ${stat._id || '<NULL>'}: ${stat.count}`);
        });

        // 3. Check Jean Ouedraogo specifically
        console.log('\n👤 Jean Ouedraogo Analysis');
        console.log('-'.repeat(70));

        const jean = await Student.findOne({ lastName: { $regex: /ouedraogo/i } });

        if (jean) {
            console.log(`Student ID: ${jean._id}`);

            // Check his grades
            const grades = await Grade.find({ studentId: jean._id }).toArray();
            console.log(`Grades found: ${grades.length}`);
            grades.forEach(g => {
                console.log(`  - TUE: ${g.tueId}, Year: ${g.academicYear}, Grade: ${g.finalGrade}`);
            });

            // Check his TU Results
            const tuResults = await TUResult.find({ studentId: jean._id }).toArray();
            console.log(`\nTU Results found: ${tuResults.length}`);
            tuResults.forEach(r => {
                console.log(`  - TU: ${r.tuId}, Year: ${r.academicYear}, Avg: ${r.average}`);
            });

            // Check his Semester Results
            const semResults = await SemesterResult.find({ studentId: jean._id }).toArray();
            console.log(`\nSemester Results found: ${semResults.length}`);
            semResults.forEach(r => {
                console.log(`  - Sem: ${r.semesterId}, Year: ${r.academicYear}, Status: ${r.status}`);
            });

        } else {
            console.log('❌ Jean not found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected');
    }
}

diagnoseResults();
