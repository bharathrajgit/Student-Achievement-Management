import { connectDB } from './config/database.js';
import { User } from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function listAllUsers() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    const allUsers = await User.find()
      .select('name email role tenantId')
      .sort({ createdAt: -1 });

    console.log('📋 ALL USERS IN DATABASE:');
    console.log('=====================================');
    
    const roleCount = {};
    
    allUsers.forEach((user, idx) => {
      if (!roleCount[user.role]) roleCount[user.role] = 0;
      roleCount[user.role]++;
      
      console.log(`${idx + 1}. [${user.role.toUpperCase()}] ${user.name} (${user.email})`);
    });

    console.log('\n\n📊 SUMMARY BY ROLE:');
    console.log('=====================================');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`${role}: ${count}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

listAllUsers();
