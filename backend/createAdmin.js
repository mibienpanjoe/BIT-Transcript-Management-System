const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const createAdminUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: 'admin@bit.com' });

        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@bit.com',
            password: 'admin123',
            role: 'admin'
        });

        console.log('Admin user created successfully:', admin.email);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser();
