const mongoose = require('mongoose');
const User = require('./src/models/User');
const TUE = require('./src/models/TUE');
const dotenv = require('dotenv');

dotenv.config();

const createTeacherAndAssignTUE = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // 1. Create Teacher
        const email = 'teacher1@bit.com';
        let teacher = await User.findOne({ email });

        if (!teacher) {
            console.log('Creating teacher...');
            teacher = await User.create({
                firstName: 'Dr. Ahmed',
                lastName: 'Ouédraogo',
                email,
                password: 'teacher123',
                role: 'teacher',
                isActive: true
            });
            console.log('Teacher created:', teacher._id);
        } else {
            console.log('Teacher already exists:', teacher._id);
            // Ensure password is correct (reset it)
            teacher.password = 'teacher123';
            await teacher.save();
            console.log('Teacher password reset');
        }

        // 2. Find a TUE to assign
        // Try to find Solar Thermal Energy first
        let tue = await TUE.findOne({ name: { $regex: 'Solar', $options: 'i' } });

        if (!tue) {
            // If not found, find ANY TUE
            tue = await TUE.findOne();
        }

        if (tue) {
            console.log(`Assigning teacher to TUE: ${tue.name}`);
            tue.teacherId = teacher._id;
            await tue.save();
            console.log('Assignment successful');
        } else {
            console.log('No TUE found to assign');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createTeacherAndAssignTUE();
