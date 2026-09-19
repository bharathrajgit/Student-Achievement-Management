import { connectDB } from './config/database.js';
import { User } from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkDuplicates() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Check all coordinators
    const coordinators = await User.find({ role: { $in: ['coordinator', 'sub-coordinator'] } })
      .select('name email role tenantId createdAt')
      .sort({ createdAt: -1 });

    console.log('📋 ALL COORDINATORS IN DATABASE:');
    console.log('=====================================');
    coordinators.forEach((coord, idx) => {
      console.log(`${idx + 1}. ${coord.name}`);
      console.log(`   Email: ${coord.email}`);
      console.log(`   Role: ${coord.role}`);
      console.log(`   TenantID: ${coord.tenantId}`);
      console.log(`   Created: ${coord.createdAt}`);
      console.log('');
    });

    // Check for duplicate emails
    console.log('\n🔍 CHECKING FOR DUPLICATE EMAILS:');
    console.log('=====================================');
    
    const allUsers = await User.find()
      .select('email role')
      .sort({ email: 1 });

    const emailMap = {};
    allUsers.forEach(user => {
      if (!emailMap[user.email]) {
        emailMap[user.email] = [];
      }
      emailMap[user.email].push(user.role);
    });

    const duplicates = Object.entries(emailMap).filter(([email, roles]) => roles.length > 1);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate emails found!');
    } else {
      console.log('⚠️ DUPLICATE EMAILS FOUND:');
      duplicates.forEach(([email, roles]) => {
        console.log(`  - ${email} (used by: ${roles.join(', ')})`);
      });
    }

    console.log('\n📊 TOTAL USERS: ' + allUsers.length);
    console.log('📊 TOTAL COORDINATORS: ' + coordinators.length);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkDuplicates();
