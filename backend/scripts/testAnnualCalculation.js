const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const calculationService = require('../src/services/calculationService');
const Student = require('../src/models/Student');
const Semester = require('../src/models/Semester');
const SemesterResult = require('../src/models/SemesterResult');
const AnnualResult = require('../src/models/AnnualResult');
const Promotion = require('../src/models/Promotion');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const testAnnualCalculation = async () => {
    await connectDB();

    try {
        console.log('Starting Annual Calculation Test...');

        // 1. Find a student with existing semester results (or create mock data)
        // For this test, we'll look for a student who has results for both semesters of a level
        // Or we can just mock the whole thing if we don't want to rely on existing data.

        // Let's try to find a student first.
        const students = await Student.find().limit(1);
        if (students.length === 0) {
            console.log('No students found. Skipping test.');
            process.exit(0);
        }

        const student = students[0];
        console.log(`Testing with student: ${student.firstName} ${student.lastName} (${student._id})`);

        // Mock data for test purposes to ensure we have controlled inputs
        // We will create temporary SemesterResults for this student

        // Find semesters for L3 (S5 and S6) - assuming standard structure
        // We need to find the promotion first to get the correct semesters
        const promotion = await Promotion.findById(student.promotionId);
        if (!promotion) {
            console.log('Student has no promotion.');
            process.exit(0);
        }

        const semesters = await Semester.find({ promotionId: promotion._id }).sort({ order: 1 });
        if (semesters.length < 2) {
            console.log('Not enough semesters found for promotion.');
            process.exit(0);
        }

        const sem1 = semesters[0];
        const sem2 = semesters[1];
        const academicYear = '2023-2024'; // Use a test year
        const level = promotion.level || 'L3'; // Fallback

        console.log(`Using Semesters: ${sem1.name} and ${sem2.name}`);

        // Create/Update Mock Semester Results
        // Scenario: 
        // S1: Avg 12, Credits 30, Validated
        // S2: Avg 14, Credits 30, Validated
        // Expected Annual: (12*30 + 14*30) / 60 = 13.00, Validated, Mention C+

        await SemesterResult.findOneAndUpdate(
            { studentId: student._id, semesterId: sem1._id, academicYear },
            {
                average: 12.00,
                totalCredits: 30,
                status: 'VALIDATED',
                mention: 'C',
                academicYear
            },
            { upsert: true }
        );

        await SemesterResult.findOneAndUpdate(
            { studentId: student._id, semesterId: sem2._id, academicYear },
            {
                average: 14.00,
                totalCredits: 30,
                status: 'VALIDATED',
                mention: 'B',
                academicYear
            },
            { upsert: true }
        );

        console.log('Mock Semester Results created.');

        // Run Calculation
        const result = await calculationService.calculateAnnualResult(
            student._id,
            level,
            academicYear
        );

        console.log('Calculation Result:', result);

        // Verify
        if (result.annualAverage === 13.00 && result.status === 'VALIDATED' && result.mention === 'C+') {
            console.log('✅ SUCCESS: Calculation is correct!');
        } else {
            console.error('❌ FAILURE: Calculation incorrect.');
            console.log('Expected: Avg 13.00, Status VALIDATED, Mention C+');
        }

        // Test Scenario 2: Failed Year
        // S1: Avg 8, Credits 15, Not Validated
        // S2: Avg 10, Credits 30, Validated
        // Expected: Avg (8*15 + 10*30) / 45 = 420/45 = 9.33, Not Validated, Mention F

        await SemesterResult.findOneAndUpdate(
            { studentId: student._id, semesterId: sem1._id, academicYear },
            {
                average: 8.00,
                totalCredits: 15,
                status: 'NOT VALIDATED',
                mention: 'F',
                academicYear
            },
            { upsert: true }
        );

        const result2 = await calculationService.calculateAnnualResult(
            student._id,
            level,
            academicYear
        );

        console.log('Scenario 2 Result:', result2);

        if (result2.annualAverage === 9.33 && result2.status === 'NOT VALIDATED' && result2.mention === 'F') {
            console.log('✅ SUCCESS: Scenario 2 correct!');
        } else {
            console.error('❌ FAILURE: Scenario 2 incorrect.');
        }

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

testAnnualCalculation();
