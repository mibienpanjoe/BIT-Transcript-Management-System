const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

// Import models (needed for population)
require('./src/models/Grade');
require('./src/models/Student');
require('./src/models/Promotion');
require('./src/models/Semester');
require('./src/models/TU');
require('./src/models/TUE');
require('./src/models/TUResult');
require('./src/models/SemesterResult');
require('./src/models/AnnualResult');

const calculationService = require('./src/services/calculationService');
const Student = require('./src/models/Student');
const Promotion = require('./src/models/Promotion');
const Semester = require('./src/models/Semester');
const TU = require('./src/models/TU');

async function recalculateAll() {
    console.log('\n' + '='.repeat(70));
    console.log('FORCE RECALCULATION SCRIPT');
    console.log('='.repeat(70) + '\n');

    try {
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB Atlas\n');

        // 1. Get all students with promotions
        const students = await Student.find({ isActive: true }).populate('promotionId');
        console.log(`Found ${students.length} active students`);

        let processedCount = 0;
        let errorCount = 0;

        for (const student of students) {
            if (!student.promotionId) {
                console.log(`⚠️  Skipping student ${student.firstName} ${student.lastName} (No promotion)`);
                continue;
            }

            const academicYear = student.promotionId.academicYear;
            console.log(`\nProcessing: ${student.firstName} ${student.lastName} (${student.promotionId.name})`);
            console.log(`Academic Year: ${academicYear}`);

            try {
                // 2. Get semesters for this promotion
                const semesters = await Semester.find({ promotionId: student.promotionId._id });

                for (const semester of semesters) {
                    // 3. Get TUs for this semester
                    const tus = await TU.find({ semesterId: semester._id });

                    // 4. Calculate TU Results
                    for (const tu of tus) {
                        await calculationService.calculateTUAverage(student._id, tu._id, academicYear);
                        process.stdout.write('.'); // Progress indicator
                    }

                    // 5. Calculate Semester Result
                    await calculationService.calculateSemesterAverage(student._id, semester._id, academicYear);
                    process.stdout.write('S'); // Semester indicator
                }

                // 6. Calculate Annual Result (if applicable)
                // Only if level is L1, L2, L3, M1, M2
                if (['L1', 'L2', 'L3', 'M1', 'M2'].includes(student.promotionId.level)) {
                    try {
                        await calculationService.calculateAnnualResult(
                            student._id,
                            student.promotionId.level,
                            academicYear
                        );
                        process.stdout.write('A'); // Annual indicator
                    } catch (err) {
                        // Ignore annual calculation errors (might be incomplete data)
                        // console.log(`(Annual skipped: ${err.message})`);
                    }
                }

                processedCount++;
                console.log(' ✅ Done');

            } catch (err) {
                console.error(`\n❌ Error processing student: ${err.message}`);
                errorCount++;
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('RECALCULATION COMPLETE');
        console.log('='.repeat(70));
        console.log(`Processed: ${processedCount}`);
        console.log(`Errors: ${errorCount}`);

    } catch (error) {
        console.error('Fatal Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected');
    }
}

recalculateAll();
