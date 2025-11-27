require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const checkRoles = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');

        const users = await User.find({}).select('email role firstName lastName isActive');

        console.log('📊 User Roles in Database:\n');
        console.table(users.map(u => ({
            email: u.email,
            name: `${u.firstName} ${u.lastName}`,
            role: u.role,
            roleType: typeof u.role,
            isActive: u.isActive
        })));

        const roleDistribution = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        console.log('\n📈 Role Distribution:\n');
        console.table(roleDistribution.map(r => ({
            role: r._id,
            count: r.count
        })));

        // Check for any non-standard role values
        const validRoles = ['admin', 'teacher', 'schooling_manager'];
        const invalidUsers = users.filter(u => !validRoles.includes(u.role));

        if (invalidUsers.length > 0) {
            console.log('\n⚠️  WARNING: Found users with invalid roles:\n');
            console.table(invalidUsers.map(u => ({
                email: u.email,
                role: u.role
            })));
        } else {
            console.log('\n✅ All users have valid role values');
        }

        mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkRoles();
