const mongoose = require('mongoose');
require('dotenv').config();

const SemesterResult = require('../src/models/SemesterResult');
const Semester = require('../src/models/Semester');
const TU = require('../src/models/TU');

/**
 * Migration Script: Fix Semester Results with totalCredits = 0
 * 
 * This script recalculates totalCredits for semester results that have 0 credits
 * but should have actual credit values for annual calculation.
 */

async function migrateSemesterCredits() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all semester results with totalCredits = 0
        const semesterResults = await SemesterResult.find({ totalCredits: 0 });

        console.log(`Found ${semesterResults.length} semester results with 0 credits`);

        let updated = 0;
        let skipped = 0;

        for (const semResult of semesterResults) {
            // Get all TUs for this semester
            const tus = await TU.find({ semesterId: semResult.semesterId, isActive: true });

            // Calculate total credits
            const totalCredits = tus.reduce((sum, tu) => sum + tu.credits, 0);

            if (totalCredits > 0) {
                // Update the semester result
                await SemesterResult.findByIdAndUpdate(semResult._id, {
                    totalCredits: totalCredits
                });

                console.log(`✅ Updated semester ${semResult.semesterId} for student ${semResult.studentId}: ${totalCredits} credits`);
                updated++;
            } else {
                console.log(`⚠️  Skipped semester ${semResult.semesterId} (no TUs found)`);
                skipped++;
            }
        }

        console.log('\n=== Migration Complete ===');
        console.log(`Updated: ${updated}`);
        console.log(`Skipped: ${skipped}`);
        console.log(`Total: ${semesterResults.length}`);

        await mongoose.connection.close();
        console.log('Database connection closed');

    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

// Run migration
migrateSemesterCredits();
