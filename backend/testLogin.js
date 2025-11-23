const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Find the admin user
        const user = await User.findOne({ email: 'admin@bit.com' }).select('+password');

        if (!user) {
            console.log('User not found!');
            process.exit(1);
        }

        console.log('User found:', {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
            hasPassword: !!user.password
        });

        // Test password matching
        const isMatch = await user.matchPassword('admin123');
        console.log('Password match result:', isMatch);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testLogin();
