const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const Field = require('../src/models/Field');
const Promotion = require('../src/models/Promotion');
const Semester = require('../src/models/Semester');
const TUE = require('../src/models/TUE');
const TU = require('../src/models/TU');
const User = require('../src/models/User');

const checkTUEs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const tues = await TUE.find().populate('tuId');

        console.log('\nExisting TUEs:');
        tues.forEach(tue => {
            console.log(`- [${tue.code}] ${tue.name} (TU: ${tue.tuId?.name})`);
        });

        const tus = await TU.find();
        console.log('\nExisting TUs:');
        tus.forEach(tu => {
            console.log(`- [${tu.code}] ${tu.name} (ID: ${tu._id})`);
        });

        const users = await User.find({ role: 'teacher' });
        console.log('\nTeachers:');
        users.forEach(user => {
            console.log(`- ${user.firstName} ${user.lastName} (ID: ${user._id})`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkTUEs();
