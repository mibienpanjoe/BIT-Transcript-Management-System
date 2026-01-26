const mongoose = require('mongoose');
const path = require('path');
const envPath = path.join(__dirname, '../.env');
console.log('Loading .env from:', envPath);
const result = require('dotenv').config({ path: envPath });

if (result.error) {
    console.error('Error loading .env:', result.error);
} else {
    console.log('.env loaded successfully');
    console.log('Defined keys:', Object.keys(result.parsed || {}));
}

// Import Semester model - adjust path as needed
const Semester = require('../src/models/Semester');

const SEMESTER_NAME_MAPPING = {
    'L1': { 1: 'S1', 2: 'S2' },
    'L2': { 1: 'S3', 2: 'S4' },
    'L3': { 1: 'S5', 2: 'S6' },
    'M1': { 1: 'M1S1', 2: 'M1S2' },
    'M2': { 1: 'M2S1', 2: 'M2S2' }
};

function getCorrectSemesterName(level, order) {
    return SEMESTER_NAME_MAPPING[level]?.[order] || `S${order}`;
}

async function migrateSemesterNames(dryRun = true) {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const semesters = await Semester.find({});
        console.log(`Found ${semesters.length} semesters\n`);

        const updates = [];

        for (const semester of semesters) {
            const correctName = getCorrectSemesterName(semester.level, semester.order);

            if (semester.name !== correctName) {
                updates.push({
                    _id: semester._id,
                    oldName: semester.name,
                    newName: correctName,
                    level: semester.level,
                    order: semester.order
                });
            }
        }

        if (updates.length === 0) {
            console.log('✅ All semester names are already correct!');
            return;
        }

        console.log(`Found ${updates.length} semesters to update:\n`);
        updates.forEach(u => {
            console.log(`  ${u.level} Order ${u.order}: "${u.oldName}" → "${u.newName}"`);
        });

        if (dryRun) {
            console.log('\n⚠️  DRY RUN - No changes made');
            console.log('Run with --execute flag to apply changes');
        } else {
            console.log('\n🔄 Applying changes...');

            for (const update of updates) {
                await Semester.findByIdAndUpdate(update._id, { name: update.newName });
                console.log(`  ✓ Updated ${update._id}: ${update.oldName} → ${update.newName}`);
            }

            console.log('\n✅ Migration complete!');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.connection.close();
    }
}

// Run
const isDryRun = !process.argv.includes('--execute');
migrateSemesterNames(isDryRun);
