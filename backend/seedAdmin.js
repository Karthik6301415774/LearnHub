require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/learnhub';
const ADMIN_EMAIL = 'admin@learnhub.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'LearnHub Admin';

async function seedAdmin() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Use direct mongoose model definition to avoid schema conflicts
    const User = mongoose.model('User');

    const existingAdmin = await User.findOne({ type: 'admin' });
    if (existingAdmin) {
        console.log('✅ Admin already exists:', existingAdmin.email);
        await mongoose.disconnect();
        process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    const admin = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        type: 'admin',
        isApproved: true,
    });

    // Save directly bypassing the pre-save hook to avoid double-hash
    await User.collection.insertOne({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        type: 'admin',
        isApproved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    console.log('🎉 Admin created successfully!');
    console.log('   Email   :', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    await mongoose.disconnect();
    process.exit(0);
}

// Need to register userModel first
require('./schemas/userModel');

seedAdmin().catch((err) => {
    console.error('❌ Error seeding admin:', err.message);
    process.exit(1);
});
