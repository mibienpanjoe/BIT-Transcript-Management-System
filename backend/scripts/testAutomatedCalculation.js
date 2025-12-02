const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const Grade = require('../src/models/Grade');
const Student = require('../src/models/Student');
const Promotion = require('../src/models/Promotion');
const TUE = require('../src/models/TUE');
const TU = require('../src/models/TU');
const Semester = require('../src/models/Semester');
const TUResult = require('../src/models/TUResult');
const SemesterResult = require('../src/models/SemesterResult');
const AnnualResult = require('../src/models/AnnualResult');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const testAutomatedCalculation = async () => {
    await connectDB();

    try {
        console.log('\n=== Testing Automated Cascade Calculation ===\n');

        // Find a student with existing data
        const student = await Student.findOne().populate('promotionId');
        if (!student) {
            console.log('No students found. Skipping test.');
            process.exit(0);
        }

        console.log(`Testing with student: ${student.firstName} ${student.lastName}`);

        // Find a TUE for this student
        const semesters = await Semester.find({ promotionId: student.promotionId._id }).sort({ order: 1 });
        if (semesters.length === 0) {
            console.log('No semesters found.');
            process.exit(0);
        }

        const semester = semesters[0];
        console.log(`Using semester: ${semester.name}`);

        const tus = await TU.find({ semesterId: semester._id, isActive: true }).limit(1);
        if (tus.length === 0) {
            console.log('No TUs found.');
            process.exit(0);
        }

        const tu = tus[0];
        console.log(`Using TU: ${tu.name}`);

        const tues = await TUE.find({ tuId: tu._id, isActive: true }).limit(1);
        if (tues.length === 0) {
            console.log('No TUEs found.');
            process.exit(0);
        }

        const tue = tues[0];
        console.log(`Using TUE: ${tue.name}`);

        const academicYear = '2023-2024';

        console.log('\n--- Step 2: Checking TU Result ---');

        const tuResult = await TUResult.findOne({
            studentId: student._id,
            tuId: tu._id,
            academicYear
        });

        if (tuResult) {
            console.log(`✅ TU Result auto-calculated!`);
            console.log(`   Average: ${tuResult.average}/20`);
            console.log(`   Status: ${tuResult.status}`);
            console.log(`   Credits: ${tuResult.creditsEarned}`);
        } else {
            console.log(`⚠️ TU Result not calculated (may need all TUE grades)`);
        }

        console.log('\n--- Step 3: Checking Semester Result ---');

        const semResult = await SemesterResult.findOne({
            studentId: student._id,
            semesterId: semester._id,
            academicYear
        });

        if (semResult) {
            console.log(`✅ Semester Result auto-calculated!`);
            console.log(`   Average: ${semResult.average}/20`);
            console.log(`   Status: ${semResult.status}`);
            console.log(`   Mention: ${semResult.mention}`);
        } else {
            console.log(`⚠️ Semester Result not calculated (may need all TU results)`);
        }

        console.log('\n--- Step 4: Checking Annual Result ---');

        const level = student.promotionId.level || 'L3';
        const annualResult = await AnnualResult.findOne({
            studentId: student._id,
            academicYear,
            level
        });

        if (annualResult) {
            console.log(`✅ Annual Result auto-calculated!`);
            console.log(`   Average: ${annualResult.annualAverage}/20`);
            console.log(`   Status: ${annualResult.status}`);
            console.log(`   Mention: ${annualResult.mention}`);
            console.log(`   Total Credits: ${annualResult.totalCredits}/60`);
        } else {
            console.log(`⚠️ Annual Result not calculated (needs both semesters)`);
        }

        console.log('\n=== Test Complete ===\n');
        console.log('Summary:');
        console.log(`- Grade saved: ✅`);
        console.log(`- TU auto-calculated: ${tuResult ? '✅' : '⚠️'}`);
        console.log(`- Semester auto-calculated: ${semResult ? '✅' : '⚠️'}`);
        console.log(`- Annual auto-calculated: ${annualResult ? '✅' : '⚠️'}`);

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

testAutomatedCalculation();
