// controllers/coordinatorExamController.js
import { ExamRegistration } from '../models/ExamRegistration.js';
import { ExamCatalog } from '../models/ExamCatalog.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';

/**
 * Get all pending certificate submissions
 * GET /coordinator/submissions/pending
 */
export const getPendingSubmissions = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { examName, platform, limit = 50, page = 1 } = req.query;

    const filter = { tenantId, status: 'Submitted' };

    if (examName) {
      filter.examName = { $regex: examName, $options: 'i' };
    }
    if (platform && platform !== 'all') {
      filter.platform = platform;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const submissions = await ExamRegistration.find(filter)
      .sort({ submittedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('studentId', 'name email rollNumber');

    const total = await ExamRegistration.countDocuments(filter);

    return res.status(200).json({
      status: 'success',
      data: submissions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching pending submissions:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending submissions',
      error: error.message,
    });
  }
};

/**
 * Get single submission details for verification
 * GET /coordinator/submissions/:registrationId
 */
export const getSubmissionForVerification = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const tenantId = req.tenantId;

    const submission = await ExamRegistration.findOne({
      _id: registrationId,
      tenantId,
      status: 'Submitted',
    })
      .populate('studentId', 'name email rollNumber')
      .populate('examId', 'examName platform description officialLink');

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found or already verified',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: submission,
    });
  } catch (error) {
    logger.error('Error fetching submission details:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch submission details',
      error: error.message,
    });
  }
};

/**
 * Approve a certificate submission
 * PUT /coordinator/submissions/:registrationId/approve
 */
export const approveSubmission = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { feedback } = req.body;
    const tenantId = req.tenantId;
    const coordinatorId = req.user.id;

    // Find submission
    const submission = await ExamRegistration.findOne({
      _id: registrationId,
      tenantId,
      status: 'Submitted',
    });

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found or already verified',
      });
    }

    // Get coordinator info
    const coordinator = await User.findById(coordinatorId);

    // Update submission
    submission.status = 'Passed';
    submission.verifiedBy = coordinatorId;
    submission.verifiedByName = coordinator.name;
    submission.verifiedByRole = coordinator.role;
    submission.verificationDate = new Date();
    submission.feedback = feedback || 'Certificate verified successfully';

    await submission.save();

    logger.info(
      `Certificate approved for ${submission.studentName} (${submission.examName}) by ${coordinator.name}`
    );

    return res.status(200).json({
      status: 'success',
      message: 'Certificate approved successfully',
      data: submission,
    });
  } catch (error) {
    logger.error('Error approving submission:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to approve certificate',
      error: error.message,
    });
  }
};

/**
 * Reject a certificate submission
 * PUT /coordinator/submissions/:registrationId/reject
 */
export const rejectSubmission = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { feedback } = req.body;
    const tenantId = req.tenantId;
    const coordinatorId = req.user.id;

    // Validation
    if (!feedback) {
      return res.status(400).json({
        status: 'error',
        message: 'feedback is required',
      });
    }

    // Find submission
    const submission = await ExamRegistration.findOne({
      _id: registrationId,
      tenantId,
      status: 'Submitted',
    });

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found or already verified',
      });
    }

    // Get coordinator info
    const coordinator = await User.findById(coordinatorId);

    // Update submission
    submission.status = 'Failed';
    submission.verifiedBy = coordinatorId;
    submission.verifiedByName = coordinator.name;
    submission.verifiedByRole = coordinator.role;
    submission.verificationDate = new Date();
    submission.feedback = feedback;

    await submission.save();

    logger.info(
      `Certificate rejected for ${submission.studentName} (${submission.examName}) by ${coordinator.name}`
    );

    return res.status(200).json({
      status: 'success',
      message: 'Certificate rejected. Student can resubmit.',
      data: submission,
    });
  } catch (error) {
    logger.error('Error rejecting submission:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to reject certificate',
      error: error.message,
    });
  }
};

/**
 * Bulk approve multiple certificates
 * POST /coordinator/submissions/bulk-approve
 */
export const bulkApproveSubmissions = async (req, res) => {
  try {
    const { registrationIds, feedback } = req.body;
    const tenantId = req.tenantId;
    const coordinatorId = req.user.id;

    // Validation
    if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'registrationIds array is required and must not be empty',
      });
    }

    // Get coordinator info
    const coordinator = await User.findById(coordinatorId);

    // Update all submissions
    const result = await ExamRegistration.updateMany(
      {
        _id: { $in: registrationIds },
        tenantId,
        status: 'Submitted',
      },
      {
        status: 'Passed',
        verifiedBy: coordinatorId,
        verifiedByName: coordinator.name,
        verifiedByRole: coordinator.role,
        verificationDate: new Date(),
        feedback: feedback || 'Batch verified successfully',
      }
    );

    logger.info(
      `Bulk approved ${result.modifiedCount} certificates by ${coordinator.name}`
    );

    return res.status(200).json({
      status: 'success',
      message: `${result.modifiedCount} certificates approved successfully`,
      data: {
        approvedCount: result.modifiedCount,
        totalRequested: registrationIds.length,
      },
    });
  } catch (error) {
    logger.error('Error bulk approving submissions:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to bulk approve certificates',
      error: error.message,
    });
  }
};

/**
 * Get verification history for a registration
 * GET /coordinator/submissions/:registrationId/history
 */
export const getVerificationHistory = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const tenantId = req.tenantId;

    const registration = await ExamRegistration.findOne({
      _id: registrationId,
      tenantId,
    })
      .populate('verifiedBy', 'name email role')
      .populate('studentId', 'name email rollNumber');

    if (!registration) {
      return res.status(404).json({
        status: 'error',
        message: 'Registration not found',
      });
    }

    // Prepare history
    const history = {
      currentAttempt: {
        attemptNumber: registration.attemptNumber,
        certificateLink: registration.certificateLink,
        marksObtained: registration.marksObtained,
        submittedDate: registration.submittedDate,
        status: registration.status,
        verifiedBy: registration.verifiedByName,
        verificationDate: registration.verificationDate,
        feedback: registration.feedback,
      },
      previousAttempts: registration.previousAttempts.map((attempt) => ({
        attemptNumber: attempt.attemptNumber,
        certificateLink: attempt.certificateLink,
        marksObtained: attempt.marksObtained,
        submittedDate: attempt.submittedDate,
        rejectionReason: attempt.rejectionReason,
        rejectedDate: attempt.rejectedDate,
      })),
      student: {
        name: registration.studentName,
        rollNumber: registration.rollNumber,
      },
      exam: {
        name: registration.examName,
        platform: registration.platform,
      },
    };

    return res.status(200).json({
      status: 'success',
      data: history,
    });
  } catch (error) {
    logger.error('Error fetching verification history:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch verification history',
      error: error.message,
    });
  }
};

/**
 * Get exam groups with enrollment statistics
 * GET /coordinator/exam-groups
 */
export const getExamGroups = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { platform, category, limit = 50, page = 1 } = req.query;

    // Build filter for approved registrations
    const filter = { tenantId, status: { $in: ['Registered', 'Submitted', 'Passed'] } };

    if (platform && platform !== 'all') {
      filter.platform = platform;
    }

    // Get all registrations
    const registrations = await ExamRegistration.find(filter)
      .populate('studentId', 'name email rollNumber')
      .populate('examId', 'examName platform category description');

    // Group by exam
    const examGroups = {};
    
    registrations.forEach((reg) => {
      const examId = reg.examId?._id?.toString();
      
      if (!examId) return; // Skip if exam not found

      if (!examGroups[examId]) {
        examGroups[examId] = {
          _id: examId,
          exam: {
            _id: reg.examId._id,
            examName: reg.examName || reg.examId.examName,
            platform: reg.platform || reg.examId.platform,
            category: reg.examId.category,
          },
          students: [],
          totalEnrollment: 0,
          statusBreakdown: {
            registered: 0,
            submitted: 0,
            passed: 0,
          },
        };
      }

      // Add student to group
      examGroups[examId].students.push({
        _id: reg.studentId._id,
        name: reg.studentName || reg.studentId.name,
        email: reg.studentId.email,
        rollNumber: reg.rollNumber || reg.studentId.rollNumber,
        status: reg.status,
        submittedDate: reg.submittedDate,
        verificationDate: reg.verificationDate,
      });

      // Update counts
      examGroups[examId].totalEnrollment++;
      
      if (reg.status === 'Registered') examGroups[examId].statusBreakdown.registered++;
      if (reg.status === 'Submitted') examGroups[examId].statusBreakdown.submitted++;
      if (reg.status === 'Passed') examGroups[examId].statusBreakdown.passed++;
    });

    // Convert to array and add enrollment level
    let examGroupsArray = Object.values(examGroups).map(group => ({
      ...group,
      enrollmentLevel: 
        group.totalEnrollment === 0 ? 'critical' :
        group.totalEnrollment <= 5 ? 'low' :
        'good',
    }));

    // Apply category filter if needed
    if (category && category !== 'all') {
      examGroupsArray = examGroupsArray.filter(g => g.exam.category === category);
    }

    // Sort by enrollment (descending)
    examGroupsArray.sort((a, b) => b.totalEnrollment - a.totalEnrollment);

    // Pagination
    const total = examGroupsArray.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedGroups = examGroupsArray.slice(skip, skip + parseInt(limit));

    // Calculate summary
    const summary = {
      totalExams: examGroupsArray.length,
      totalStudents: examGroupsArray.reduce((sum, g) => sum + g.totalEnrollment, 0),
      goodEnrollment: examGroupsArray.filter(g => g.enrollmentLevel === 'good').length,
      lowEnrollment: examGroupsArray.filter(g => g.enrollmentLevel === 'low').length,
      criticalEnrollment: examGroupsArray.filter(g => g.enrollmentLevel === 'critical').length,
    };

    logger.info(`Fetched ${paginatedGroups.length} exam groups for tenant ${tenantId}`);

    return res.status(200).json({
      status: 'success',
      data: paginatedGroups,
      summary,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching exam groups:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch exam groups',
      error: error.message,
    });
  }
};

/**
 * Get single exam group details
 * GET /coordinator/exam-groups/:examId
 */   
export const getExamGroupDetails = async (req, res) => {
  try {
    const { examId } = req.params;
    const tenantId = req.tenantId;

    // Get exam details
    const exam = await ExamCatalog.findOne({ _id: examId, tenantId });
    
    if (!exam) {
      return res.status(404).json({
        status: 'error',
        message: 'Exam not found',
      });
    }

    // Get all registrations for this exam
    const registrations = await ExamRegistration.find({
      tenantId,
      examId,
      status: { $in: ['Registered', 'Submitted', 'Passed', 'Failed'] },
    })
      .populate('studentId', 'name email rollNumber')
      .populate('verifiedBy', 'name email role')
      .sort({ createdAt: -1 });

    // Build student list with details
    const students = registrations.map(reg => ({
      _id: reg.studentId._id,
      name: reg.studentName || reg.studentId.name,
      email: reg.studentId.email,
      rollNumber: reg.rollNumber || reg.studentId.rollNumber,
      status: reg.status,
      registeredDate: reg.createdAt,
      submittedDate: reg.submittedDate,
      verificationDate: reg.verificationDate,
      verifiedBy: reg.verifiedByName,
      certificateLink: reg.certificateLink,
      marksObtained: reg.marksObtained,
      totalMarks: reg.totalMarks,
      attemptNumber: reg.attemptNumber,
    }));

    // Calculate stats
    const stats = {
      totalEnrollment: students.length,
      registered: students.filter(s => s.status === 'Registered').length,
      submitted: students.filter(s => s.status === 'Submitted').length,
      passed: students.filter(s => s.status === 'Passed').length,
      failed: students.filter(s => s.status === 'Failed').length,
    };

    return res.status(200).json({
      status: 'success',
      data: {
        exam: {
          _id: exam._id,
          examName: exam.examName,
          platform: exam.platform,
          category: exam.category,
          description: exam.description,
          officialLink: exam.officialLink,
        },
        students,
        stats,
      },
    });
  } catch (error) {
    logger.error('Error fetching exam group details:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch exam group details',
      error: error.message,
    });
  }
};

/**
 * Get all verified submissions (passed/failed)
 * GET /coordinator/submissions/verified
 */
export const getVerifiedSubmissions = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { status = 'Passed', examName, limit = 50, page = 1 } = req.query;

    const filter = { tenantId, status: { $in: ['Passed', 'Failed'] } };

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (examName) {
      filter.examName = { $regex: examName, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const submissions = await ExamRegistration.find(filter)
      .sort({ verificationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('studentId', 'name email rollNumber')
      .populate('verifiedBy', 'name email role');

    const total = await ExamRegistration.countDocuments(filter);

    return res.status(200).json({
      status: 'success',
      data: submissions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching verified submissions:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch verified submissions',
      error: error.message,
    });
  }
};

/**
 * Get students in a specific exam group
 * GET /coordinator/exam-groups/:examName/students
 */
export const getExamGroupStudents = async (req, res) => {
  try {
    const { examName } = req.params;
    const tenantId = req.tenantId;
    const { status } = req.query;

    let filter = { tenantId };
    
    if (mongoose.Types.ObjectId.isValid(examName)) {
      filter.examId = examName;
    } else {
      filter.examName = decodeURIComponent(examName);
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const students = await ExamRegistration.find(filter)
      .sort({ registrationDate: -1 })
      .populate('studentId', 'name email rollNumber');

    if (students.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          examName: decodeURIComponent(examName),
          students: [],
          statusSummary: {
            registered: 0,
            submitted: 0,
            passed: 0,
            failed: 0,
          },
        },
      });
    }

    const statusSummary = {
      registered: students.filter((s) => s.status === 'Registered').length,
      submitted: students.filter((s) => s.status === 'Submitted').length,
      passed: students.filter((s) => s.status === 'Passed').length,
      failed: students.filter((s) => s.status === 'Failed').length,
    };

    return res.status(200).json({
      status: 'success',
      data: {
        examName: students[0]?.examName || decodeURIComponent(examName),
        students: students.map((s) => ({
          registrationId: s._id,
          studentName: s.studentName,
          rollNumber: s.rollNumber,
          email: s.studentId?.email,
          status: s.status,
          marksObtained: s.marksObtained,
          totalMarks: s.totalMarks,
          registrationDate: s.registrationDate,
          submittedDate: s.submittedDate,
          verificationDate: s.verificationDate,
          certificateLink: s.certificateLink,
        })),
        statusSummary,
      },
    });
  } catch (error) {
    logger.error('Error fetching exam group students:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch exam group students',
      error: error.message,
    });
  }
};

export const getStudentAchievements = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tenantId = req.tenantId;

    const registrations = await ExamRegistration.find({
      tenantId,
      studentId,
    })
      .sort({ registrationDate: -1 })
      .lean();

    return res.status(200).json({
      status: 'success',
      data: {
        studentId,
        achievements: registrations.map((r) => ({
          id: r._id,
          examName: r.examName,
          platform: r.platform,
          status: r.status,
          marksObtained: r.marksObtained,
          totalMarks: r.totalMarks,
          examCompletionDate: r.examCompletionDate,
          certificateLink: r.certificateLink,
        })),
      },
    });
  } catch (error) {
    logger.error('Error fetching student achievements:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch student achievements',
      error: error.message,
    });
  }
};

/**
 * Get dashboard overview statistics
 * GET /coordinator/analytics/overview
 */
export const getDashboardOverview = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    console.log('\n========================================');
    console.log('📊 DASHBOARD OVERVIEW - START');
    console.log('   Tenant ID:', tenantId);
    console.log('========================================\n');

    // Get all registrations with populated data
    const allRegistrations = await ExamRegistration.find({ tenantId })
      .populate('examId', 'name platform')
      .lean();

    console.log('📝 Total Registrations Found:', allRegistrations.length);
    console.log('📝 Sample Registration:', JSON.stringify(allRegistrations[0], null, 2));

    // Count unique students
    const totalStudents = new Set(
      allRegistrations.map((r) => r.studentId?.toString() || r.studentId)
    ).size;

    // Count active exams in catalog
    const catalogs = await ExamCatalog.countDocuments({ tenantId, isActive: true });

    // Calculate stats by status
    const totalRegistrations = allRegistrations.length;
    const passedRegs = allRegistrations.filter((r) => r.status === 'Passed');
    const failedRegs = allRegistrations.filter((r) => r.status === 'Failed');
    const passed = passedRegs.length;
    const failed = failedRegs.length;
    const completed = passed + failed;
    const pending = allRegistrations.filter((r) => r.status === 'Submitted').length;

    console.log('\n📊 STATUS BREAKDOWN:');
    console.log('   ✅ Passed:', passed);
    console.log('   ❌ Failed:', failed);
    console.log('   ✔️  Completed:', completed);
    console.log('   ⏳ Pending:', pending);

    const completionRate = totalRegistrations > 0 
      ? Math.round((completed / totalRegistrations) * 100) 
      : 0;
    
    const passRate = completed > 0 
      ? Math.round((passed / completed) * 100) 
      : 0;

    console.log('\n📈 RATES:');
    console.log('   Completion Rate:', completionRate + '%');
    console.log('   Pass Rate:', passRate + '%');

    // Build exam groups
    const examMap = new Map();

    allRegistrations.forEach((reg) => {
      // Get exam name from either examName field or populated examId
      const examName = reg.examName || reg.examId?.name || 'Unknown Exam';
      const platform = reg.platform || reg.examId?.platform || 'N/A';
      
      if (!examMap.has(examName)) {
        examMap.set(examName, {
          examName: examName,
          platform: platform,
          count: 0,
          passed: 0,
          failed: 0,
        });
      }
      
      const exam = examMap.get(examName);
      exam.count++;
      if (reg.status === 'Passed') exam.passed++;
      if (reg.status === 'Failed') exam.failed++;
    });

    // Convert map to array and sort by count
    const topExams = Array.from(examMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    console.log('\n🏆 TOP EXAMS:');
    console.log('   Count:', topExams.length);
    topExams.forEach((exam, index) => {
      console.log(`   ${index + 1}. ${exam.examName} (${exam.platform})`);
      console.log(`      - Total: ${exam.count}, Passed: ${exam.passed}, Failed: ${exam.failed}`);
    });

    // Get recent activity
    const recentActivity = await ExamRegistration.find({
      tenantId,
      verificationDate: { $exists: true, $ne: null },
    })
      .sort({ verificationDate: -1 })
      .limit(10)
      .select('studentName examName status verificationDate verifiedByName')
      .lean();

    console.log('\n🕐 RECENT ACTIVITY:');
    console.log('   Count:', recentActivity.length);

    const responseData = {
      status: 'success',
      data: {
        summary: {
          totalStudents,
          totalExamsInCatalog: catalogs,
          totalRegistrations,
          pendingVerifications: pending,
          completionRate,
          passRate,
          totalPassed: passed,
          totalFailed: failed,
        },
        topExams: topExams,
        recentActivity: recentActivity.map((activity) => ({
          studentName: activity.studentName,
          examName: activity.examName,
          status: activity.status,
          verifiedBy: activity.verifiedByName,
          verificationDate: activity.verificationDate,
        })),
      },
    };

    console.log('\n🚀 FINAL RESPONSE DATA:');
    console.log('   Summary:', JSON.stringify(responseData.data.summary, null, 2));
    console.log('   Top Exams Count:', responseData.data.topExams.length);
    console.log('   Recent Activity Count:', responseData.data.recentActivity.length);
    console.log('\n========================================');
    console.log('📊 DASHBOARD OVERVIEW - END');
    console.log('========================================\n');

    return res.status(200).json(responseData);
    
  } catch (error) {
    console.error('\n❌ ERROR in getDashboardOverview:', error);
    logger.error('Error fetching dashboard overview:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard overview',
      error: error.message,
    });
  }
};



