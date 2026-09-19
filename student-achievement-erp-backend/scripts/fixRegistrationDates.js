// Script to fix registrationDate for existing exam registrations
// Run with: node scripts/fixRegistrationDates.js

import mongoose from 'mongoose';
import { ExamRegistration } from '../models/ExamRegistration.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const fixRegistrationDates = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-achievement');
    console.log('✅ Connected to MongoDB');

    // Find all registrations without registrationDate or with null registrationDate
    const registrations = await ExamRegistration.find({
      $or: [
        { registrationDate: null },
        { registrationDate: { $exists: false } },
      ]
    });

    console.log(`Found ${registrations.length} registrations to fix`);

    if (registrations.length === 0) {
      console.log('No registrations need fixing');
      process.exit(0);
    }

    // Update each registration with its createdAt as registrationDate
    let updated = 0;
    for (const reg of registrations) {
      await ExamRegistration.updateOne(
        { _id: reg._id },
        { $set: { registrationDate: reg.createdAt } }
      );
      updated++;
      console.log(`✅ Updated: ${reg.studentName} - ${reg.examName}`);
    }

    console.log(`\n✅ Successfully updated ${updated} registrations`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixRegistrationDates();
