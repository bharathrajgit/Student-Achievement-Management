// scripts/seedExamModels.js
import mongoose from 'mongoose';
import { ExamCatalog } from '../models/ExamCatalog.js';
import { ExamRegistration } from '../models/ExamRegistration.js';
import { User } from '../models/User.js';
import { Tenant } from '../models/Tenant.js';
import { config } from 'dotenv';

config(); // if you're using .env for MONGODB_URI

const MONGODB_URI = process.env.MONGO_URI;

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('Connected to MongoDB');

    // Pick an existing tenant and student from your DB
    const tenant = await Tenant.findOne();
    const student = await User.findOne({ role: 'student', tenantId: tenant._id });

    if (!tenant || !student) {
      console.log('Please ensure you have at least one Tenant and one Student user.');
      process.exit(0);
    }

    // 1) Create an exam in catalog
    const exam = await ExamCatalog.create({
      tenantId: tenant._id,
      examName: 'NPTEL Python Programming',
      platform: 'NPTEL',
      category: 'Certification',
      description: 'Introductory Python programming course from NPTEL.',
      officialLink: 'https://nptel.ac.in/',
      createdBy: student._id, // or some coordinator user
    });

    console.log('Created ExamCatalog:', exam.examName, exam._id.toString());

    // 2) Create an exam registration
    const registration = await ExamRegistration.create({
      tenantId: tenant._id,
      studentId: student._id,
      studentName: student.name,
      rollNumber: student.rollNumber || 'MCA001', // adjust to your real field name
      examId: exam._id,
      examName: exam.examName,
      platform: exam.platform,
      expectedCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      status: 'Registered',
    });

    console.log('Created ExamRegistration:', registration._id.toString());

    // Simple queries to validate indexes & isolation
    const byTenant = await ExamCatalog.find({ tenantId: tenant._id, isActive: true });
    console.log('Active exams for tenant:', byTenant.length);

    const byStudent = await ExamRegistration.find({
      tenantId: tenant._id,
      studentId: student._id,
    });
    console.log('Registrations for student:', byStudent.length);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error in seed script:', err);
    process.exit(1);
  }
}

run();
