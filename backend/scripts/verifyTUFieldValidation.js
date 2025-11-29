const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const TU = require('../src/models/TU');
const Semester = require('../src/models/Semester');
const Promotion = require('../src/models/Promotion');
const Field = require('../src/models/Field');

async function verifyTUFieldValidation() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Find an EE TU (or create a dummy one)
        // We'll look for one with 'EE' in the code
        let eeTU = await TU.findOne({ code: /_EE_/ });

        if (!eeTU) {
            console.log('No EE TU found, creating a dummy one for testing...');
            // Need to find an EE semester first to create it validly initially
            // Or we can just create it with a dummy code and see if validation kicks in on update
            // But validation requires semesterId to be present.
            // Let's find an EE field first
            const eeField = await Field.findOne({ code: 'EE' });
            if (!eeField) {
                console.log('No EE Field found. Skipping test.');
                return;
            }
            const eePromo = await Promotion.findOne({ fieldId: eeField._id });
            if (!eePromo) {
                console.log('No EE Promotion found. Skipping test.');
                return;
            }
            const eeSemester = await Semester.findOne({ promotionId: eePromo._id });
            if (!eeSemester) {
                console.log('No EE Semester found. Skipping test.');
                return;
            }

            eeTU = await TU.create({
                name: 'Test EE TU',
                code: 'TU_L3S1_EE_99', // Manually set code
                semesterId: eeSemester._id,
                credits: 4
            });
            console.log('Created dummy EE TU:', eeTU.code);
        } else {
            console.log('Using existing EE TU:', eeTU.code);
        }

        // 2. Find a CS Semester
        const csField = await Field.findOne({ code: 'CS' });
        if (!csField) {
            console.log('No CS Field found. Skipping test.');
            return;
        }
        const csPromo = await Promotion.findOne({ fieldId: csField._id });
        const csSemester = await Semester.findOne({ promotionId: csPromo._id });

        if (!csSemester) {
            console.log('No CS Semester found. Skipping test.');
            return;
        }
        console.log('Found CS Semester:', csSemester.name, 'for field:', csField.code);

        // 3. Try to assign CS Semester to EE TU
        console.log('\nTest 1: Attempting to assign CS Semester to EE TU...');
        try {
            eeTU.semesterId = csSemester._id;
            await eeTU.save();
            console.log('❌ FAIL: Cross-field assignment was ALLOWED!');
        } catch (error) {
            if (error.message.includes('Field mismatch')) {
                console.log('✅ PASS: Cross-field assignment was REJECTED with correct error.');
                console.log('Error message:', error.message);
            } else {
                console.log('❌ FAIL: Rejected but with unexpected error:', error.message);
            }
        }

        // 4. Try to assign (or keep) EE Semester
        console.log('\nTest 2: Attempting to assign valid EE Semester...');
        try {
            // Find EE semester again
            const eeField = await Field.findOne({ code: 'EE' });
            const eePromo = await Promotion.findOne({ fieldId: eeField._id });
            const eeSemester = await Semester.findOne({ promotionId: eePromo._id });

            eeTU.semesterId = eeSemester._id;
            await eeTU.save();
            console.log('✅ PASS: Same-field assignment was ALLOWED.');
        } catch (error) {
            console.log('❌ FAIL: Same-field assignment was REJECTED:', error.message);
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await mongoose.connection.close();
    }
}

verifyTUFieldValidation();
