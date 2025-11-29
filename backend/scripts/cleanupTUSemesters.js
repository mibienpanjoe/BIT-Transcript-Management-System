const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const TU = require('../src/models/TU');
const Semester = require('../src/models/Semester');

async function cleanupTUSemesters() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find TUs with null semesterId
        const tusWithNullSemester = await TU.find({ semesterId: null });
        console.log(`\nFound ${tusWithNullSemester.length} TUs with null semesterId`);

        // Find TUs with invalid semester references
        const allTUs = await TU.find({});
        const semesterIds = await Semester.find({}).distinct('_id');

        // Convert ObjectIds to strings for comparison
        const validSemesterIds = semesterIds.map(id => id.toString());

        const tusWithInvalidSemester = allTUs.filter(tu =>
            tu.semesterId && !validSemesterIds.includes(tu.semesterId.toString())
        );
        console.log(`Found ${tusWithInvalidSemester.length} TUs with invalid semesterId (referencing non-existent semesters)`);

        // List them
        if (tusWithNullSemester.length > 0 || tusWithInvalidSemester.length > 0) {
            console.log('\nTUs needing fix:');

            if (tusWithNullSemester.length > 0) {
                console.log('\n--- Missing Semesters (null) ---');
                tusWithNullSemester.forEach(tu => {
                    console.log(`  - ${tu.name} (Code: ${tu.code || 'None'}) - ID: ${tu._id}`);
                });
            }

            if (tusWithInvalidSemester.length > 0) {
                console.log('\n--- Invalid Semesters (Orphaned) ---');
                tusWithInvalidSemester.forEach(tu => {
                    console.log(`  - ${tu.name} (Code: ${tu.code || 'None'}) - Invalid Semester ID: ${tu.semesterId}`);
                });
            }
        } else {
            console.log('\n✅ All TUs have valid semester assignments!');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

cleanupTUSemesters();
