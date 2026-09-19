import { connectDB } from './config/database.js';
import { User } from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function createAdminUser() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Admin user details
    const adminData = {
      name: 'Admin User',
      email: 'bharathraj.r852005@gmail.com',
      password: 'Admin123', // Will be hashed automatically
      role: 'superadmin',
      phone: '9876543210',
      department: 'MCA',
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: adminData.email });
    if (existingUser) {
      console.log('❌ User already exists!');
      process.exit(0);
    }

    // Create new user
    const newUser = await User.create(adminData);
    console.log('✅ Admin user created successfully!');
    console.log('\n📧 ========== LOGIN CREDENTIALS ==========');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('Role:', adminData.role);
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createAdminUser();
