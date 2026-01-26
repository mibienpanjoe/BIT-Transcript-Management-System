const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Semester = require('../src/models/Semester');
const Promotion = require('../src/models/Promotion');

async function verifySemesterCreation() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find a promotion to use
        const promotion = await Promotion.findOne();
        if (!promotion) {
            console.log('No promotion found, skipping test');
            return;
        }

        console.log(`Using promotion: ${promotion.name} (${promotion.level})`);

        // Test 1: Create semester with custom name (should be overwritten)
        console.log('\nTest 1: Create semester with custom name "CustomS1" (should be overwritten)');
        try {
            // Use a unique order to avoid conflict if possible, or delete first
            const order = 1;
            // Check if exists
            await Semester.deleteOne({ promotionId: promotion._id, order });

            const sem1 = await Semester.create({
                name: 'CustomS1', // Should be ignored
                promotionId: promotion._id,
                level: promotion.level,
                order: order
            });

            console.log(`Created semester: ${sem1.name}`);
            if (sem1.name !== 'CustomS1' && sem1.name.startsWith('S')) {
                console.log('✅ PASS: Name was auto-generated correctly');
            } else {
                console.log('❌ FAIL: Name was NOT auto-generated correctly');
            }
        } catch (err) {
            console.error('Error in Test 1:', err.message);
        }

        // Test 2: Create semester with invalid order (should fail)
        console.log('\nTest 2: Create semester with order 3 (should fail)');
        try {
            await Semester.create({
                name: 'S3',
                promotionId: promotion._id,
                level: promotion.level,
                order: 3
            });
            console.log('❌ FAIL: Created semester with order 3');
        } catch (err) {
            if (err.message.includes('order') || err.errors?.order) {
                console.log('✅ PASS: Failed to create semester with order 3');
            } else {
                console.log('❌ FAIL: Unexpected error:', err.message);
            }
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await mongoose.connection.close();
    }
}

verifySemesterCreation();
