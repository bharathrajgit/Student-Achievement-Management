import { ExamRegistration } from '../models/ExamRegistration.js';
import { ExamCatalog } from '../models/ExamCatalog.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose'; // ✅ ADD THIS IF MISSING


/**
 * Get all exam groups (auto-grouped by exam name)
 * GET /coordinator/analytics/exam-groups
 */
/**
 * Get all exam groups (auto-grouped by examId)
 * GET /coordinator/analytics/exam-groups
 */
export const getExamGroups = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { platform, category } = req.query;

    console.log('\n📊 GET EXAM GROUPS - START');
    console.log('   Tenant ID:', tenantId);
    console.log('   Platform filter:', platform);
    console.log('   Category filter:', category);

    // ✅ SIMPLE APPROACH - Get all registrations first
    const allRegistrations = await ExamRegistration.find({ 
      tenantId 
    })
      .populate('examId', 'examName platform category description')
      .populate('studentId', 'name email rollNumber');

    console.log(`   📋 Found ${allRegistrations.length} total registrations`);

    if (allRegistrations.length === 0) {
      console.log('   ⚠️ No registrations found for this tenant');
      return res.status(200).json({
        status: 'success',
        data: [],
        summary: {
          totalExams: 0,
          totalStudents: 0,
          goodEnrollment: 0,
          lowEnrollment: 0,
          criticalEnrollment: 0,
        },
      });
    }

    // ✅ Group manually by examId
    const groupedByExam = {};

    allRegistrations.forEach(reg => {
      const examId = reg.examId?._id?.toString();
      
      if (!examId) {
        console.log(`   ⚠️ Skipping registration ${reg._id} - no examId`);
        return;
      }

      if (!groupedByExam[examId]) {
        groupedByExam[examId] = {
          examId: examId,
          examName: reg.examName || reg.examId?.examName || 'Unknown',
          platform: reg.platform || reg.examId?.platform || 'Other',
          category: reg.examId?.category || 'Certification',
          students: [],
          registered: 0,
          submitted: 0,
          passed: 0,
          failed: 0,
        };
      }

      // Add student
      groupedByExam[examId].students.push({
        _id: reg.studentId?._id,
        studentId: reg.studentId?._id,
        studentName: reg.studentName,
        rollNumber: reg.rollNumber,
        email: reg.studentId?.email,
        status: reg.status,
        registrationDate: reg.registrationDate,
        marksObtained: reg.marksObtained,
      });

      // Count by status
      if (reg.status === 'Registered') groupedByExam[examId].registered++;
      if (reg.status === 'Submitted') groupedByExam[examId].submitted++;
      if (reg.status === 'Passed') groupedByExam[examId].passed++;
      if (reg.status === 'Failed') groupedByExam[examId].failed++;
    });

    console.log(`   ✓ Grouped into ${Object.keys(groupedByExam).length} exam groups`);

    // Convert to array and add calculated fields
    let enrichedGroups = Object.values(groupedByExam).map(group => {
      const totalStudents = group.students.length;
      const completionRate = Math.round(
        ((group.passed + group.failed) / totalStudents) * 100
      );
      const passRate =
        group.passed + group.failed > 0
          ? Math.round((group.passed / (group.passed + group.failed)) * 100)
          : 0;

      let warningLevel = 'good';
      if (totalStudents < 5) warningLevel = 'critical';
      else if (totalStudents < 10) warningLevel = 'low';

      return {
        examId: group.examId,
        examName: group.examName,
        platform: group.platform,
        category: group.category,
        totalStudents,
        statusBreakdown: {
          registered: group.registered,
          submitted: group.submitted,
          passed: group.passed,
          failed: group.failed,
        },
        completionRate,
        passRate,
        warningLevel,
        students: group.students,
      };
    });

    // Apply filters
    if (platform && platform !== 'all') {
      enrichedGroups = enrichedGroups.filter(g => g.platform === platform);
      console.log(`   🔍 Filtered by platform: ${platform} → ${enrichedGroups.length} groups`);
    }

    if (category && category !== 'all') {
      enrichedGroups = enrichedGroups.filter(g => g.category === category);
      console.log(`   🔍 Filtered by category: ${category} → ${enrichedGroups.length} groups`);
    }

    // Sort by total students (descending)
    enrichedGroups.sort((a, b) => b.totalStudents - a.totalStudents);

    // Calculate summary
    const summary = {
      totalExams: enrichedGroups.length,
      totalStudents: enrichedGroups.reduce((sum, g) => sum + g.totalStudents, 0),
      goodEnrollment: enrichedGroups.filter(g => g.warningLevel === 'good').length,
      lowEnrollment: enrichedGroups.filter(g => g.warningLevel === 'low').length,
      criticalEnrollment: enrichedGroups.filter(g => g.warningLevel === 'critical').length,
    };

    console.log('   ✅ Summary:', summary);
    console.log('📊 GET EXAM GROUPS - END\n');

    return res.status(200).json({
      status: 'success',
      data: enrichedGroups,
      summary,
    });
  } catch (error) {
    console.error('\n❌ ERROR in getExamGroups:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    logger.error('❌ Error fetching exam groups:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch exam groups',
      error: error.message,
    });
  }
};



/**
 * Get students in a specific exam group
 * GET /coordinator/analytics/exam-groups/:examName/students
 */
export const getExamGroupStudents = async (req, res) => {
  try {
    const { examName } = req.params;
    const tenantId = req.tenantId;
    const { status } = req.query;

    console.log('\n📋 GET EXAM GROUP STUDENTS - START');
    console.log('   Exam identifier:', examName);
    console.log('   Tenant ID:', tenantId);
    console.log('   Status filter:', status);

    // ✅ Check if it's an ObjectId (examId) or a name (examName)
    let filter = { tenantId };
    
    if (mongoose.Types.ObjectId.isValid(examName)) {
      // It's an examId
      filter.examId = examName;
      console.log('   🔍 Searching by examId:', examName);
    } else {
      // It's an examName
      filter.examName = decodeURIComponent(examName);
      console.log('   🔍 Searching by examName:', decodeURIComponent(examName));
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const students = await ExamRegistration.find(filter)
      .sort({ registrationDate: -1 })
      .populate('studentId', 'name email rollNumber');

    console.log(`   📋 Found ${students.length} students`);

    if (students.length === 0) {
      console.log('   ⚠️ No students found');
      console.log('📋 GET EXAM GROUP STUDENTS - END\n');
      return res.status(200).json({
        status: 'success',
        data: {
          examName: decodeURIComponent(examName),
          totalStudents: 0,
          statusSummary: {
            registered: 0,
            submitted: 0,
            passed: 0,
            failed: 0,
          },
          students: [],
        },
      });
    }

    // Group by status
    const byStatus = {
      registered: students.filter((s) => s.status === 'Registered'),
      submitted: students.filter((s) => s.status === 'Submitted'),
      passed: students.filter((s) => s.status === 'Passed'),
      failed: students.filter((s) => s.status === 'Failed'),
    };

    const examNameDisplay = students[0]?.examName || decodeURIComponent(examName);

    console.log('   ✅ Summary:');
    console.log('      Total:', students.length);
    console.log('      Registered:', byStatus.registered.length);
    console.log('      Submitted:', byStatus.submitted.length);
    console.log('      Passed:', byStatus.passed.length);
    console.log('      Failed:', byStatus.failed.length);
    console.log('📋 GET EXAM GROUP STUDENTS - END\n');

    return res.status(200).json({
      status: 'success',
      data: {
        examName: examNameDisplay,
        totalStudents: students.length,
        statusSummary: {
          registered: byStatus.registered.length,
          submitted: byStatus.submitted.length,
          passed: byStatus.passed.length,
          failed: byStatus.failed.length,
        },
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
        })),
      },
    });
  } catch (error) {
    console.error('\n❌ ERROR in getExamGroupStudents:');
    console.error('   Message:', error.message);
    logger.error('Error fetching exam group students:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch exam group students',
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

    // Get all registrations
    const allRegistrations = await ExamRegistration.find({ tenantId });
    const catalogs = await ExamCatalog.countDocuments({ tenantId, isActive: true });

    // Calculate stats
    const totalStudents = new Set(allRegistrations.map((r) => r.studentId.toString()))
      .size;
    const totalRegistrations = allRegistrations.length;
    const completed = allRegistrations.filter(
      (r) => r.status === 'Passed' || r.status === 'Failed'
    ).length;
    const passed = allRegistrations.filter((r) => r.status === 'Passed').length;
    const pending = allRegistrations.filter((r) => r.status === 'Submitted').length;

    const completionRate = totalRegistrations > 0 ? Math.round((completed / totalRegistrations) * 100) : 0;
    const passRate = completed > 0 ? Math.round((passed / completed) * 100) : 0;

    // Get top 5 exams
    const topExams = await ExamRegistration.aggregate([
      { $match: { tenantId } },
      {
        $group: {
          _id: '$examName',
          count: { $sum: 1 },
          passed: { $sum: { $cond: [{ $eq: ['$status', 'Passed'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get recent activity (last 10 verifications)
    const recentActivity = await ExamRegistration.find({
      tenantId,
      verificationDate: { $exists: true, $ne: null },
    })
      .sort({ verificationDate: -1 })
      .limit(10)
      .select('studentName examName status verificationDate verifiedByName');

    return res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalStudents,
          totalExamsInCatalog: catalogs,
          totalRegistrations,
          pendingVerifications: pending,
          completionRate,
          passRate,
        },
        topExams: topExams.map((exam) => ({
          examName: exam._id,
          registrations: exam.count,
          passed: exam.passed,
          failed: exam.failed,
        })),
        recentActivity: recentActivity.map((activity) => ({
          studentName: activity.studentName,
          examName: activity.examName,
          status: activity.status,
          verifiedBy: activity.verifiedByName,
          verificationDate: activity.verificationDate,
        })),
      },
    });
  } catch (error) {
    logger.error('Error fetching dashboard overview:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard overview',
      error: error.message,
    });
  }
};

/**
 * Get exam-specific analytics
 * GET /coordinator/analytics/exam/:examName
 */
export const getExamAnalytics = async (req, res) => {
  try {
    const { examName } = req.params;
    const tenantId = req.tenantId;

    const registrations = await ExamRegistration.find({
      tenantId,
      examName,
    });

    if (registrations.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `No registrations found for exam: ${examName}`,
      });
    }

    // Calculate stats
    const registered = registrations.filter((r) => r.status === 'Registered').length;
    const submitted = registrations.filter((r) => r.status === 'Submitted').length;
    const passed = registrations.filter((r) => r.status === 'Passed').length;
    const failed = registrations.filter((r) => r.status === 'Failed').length;
    const total = registrations.length;

    const completionRate = Math.round(((passed + failed) / total) * 100);
    const passRate = passed + failed > 0 ? Math.round((passed / (passed + failed)) * 100) : 0;

    // Calculate average marks
    const passedRegistrations = registrations.filter((r) => r.status === 'Passed');
    const avgMarks =
      passedRegistrations.length > 0
        ? (
            passedRegistrations.reduce((sum, r) => sum + (r.marksObtained || 0), 0) /
            passedRegistrations.length
          ).toFixed(2)
        : 0;

    // Timeline of registrations (by week)
    const timeline = {};
    registrations.forEach((r) => {
      const week = new Date(r.registrationDate).toISOString().split('T')[0];
      timeline[week] = (timeline[week] || 0) + 1;
    });

    return res.status(200).json({
      status: 'success',
      data: {
        examName,
        totalRegistered: total,
        statusBreakdown: {
          registered,
          submitted,
          passed,
          failed,
        },
        completionRate,
        passRate,
        avgMarks,
        timeline: Object.entries(timeline).map(([date, count]) => ({
          date,
          registrations: count,
        })),
      },
    });
  } catch (error) {
    logger.error('Error fetching exam analytics:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch exam analytics',
      error: error.message,
    });
  }
};

/**
 * Get student progress tracking
 * GET /coordinator/analytics/student/:studentId
 */
export const getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tenantId = req.tenantId;

    const registrations = await ExamRegistration.find({
      tenantId,
      studentId,
    }).sort({ createdAt: -1 });

    if (registrations.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found or no registrations',
      });
    }

    const student = registrations[0];
    const passed = registrations.filter((r) => r.status === 'Passed').length;
    const failed = registrations.filter((r) => r.status === 'Failed').length;
    const completed = passed + failed;
    const passRate = completed > 0 ? Math.round((passed / completed) * 100) : 0;

    // Calculate average marks
    const passedRegs = registrations.filter((r) => r.status === 'Passed');
    const avgMarks =
      passedRegs.length > 0
        ? (passedRegs.reduce((sum, r) => sum + (r.marksObtained || 0), 0) / passedRegs.length)
            .toFixed(2)
        : 0;

    return res.status(200).json({
      status: 'success',
      data: {
        studentName: student.studentName,
        rollNumber: student.rollNumber,
        totalRegistered: registrations.length,
        completed,
        inProgress: registrations.length - completed,
        passed,
        failed,
        passRate,
        avgMarks,
        exams: registrations.map((r) => ({
          examName: r.examName,
          platform: r.platform,
          status: r.status,
          marksObtained: r.marksObtained,
          totalMarks: r.totalMarks,
          registrationDate: r.registrationDate,
          completionDate: r.examCompletionDate,
          verificationDate: r.verificationDate,
          attemptNumber: r.attemptNumber,
        })),
      },
    });
  } catch (error) {
    logger.error('Error fetching student progress:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch student progress',
      error: error.message,
    });
  }
};

/**
 * Get overdue exams (students who missed expected completion date)
 * GET /coordinator/analytics/overdue
 */
export const getOverdueExams = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const now = new Date();

    const overdueRegistrations = await ExamRegistration.find({
      tenantId,
      status: { $in: ['Registered', 'Submitted'] },
      expectedCompletionDate: { $lt: now },
    })
      .sort({ expectedCompletionDate: 1 })
      .populate('studentId', 'name email rollNumber');

    const overdue = overdueRegistrations.map((reg) => {
      const daysOverdue = Math.floor(
        (now - new Date(reg.expectedCompletionDate)) / (1000 * 60 * 60 * 24)
      );
      return {
        studentName: reg.studentName,
        rollNumber: reg.rollNumber,
        examName: reg.examName,
        expectedCompletionDate: reg.expectedCompletionDate,
        daysOverdue,
        status: reg.status,
        email: reg.studentId?.email,
      };
    });

    return res.status(200).json({
      status: 'success',
      data: overdue,
      summary: {
        total: overdue.length,
      },
    });
  } catch (error) {
    logger.error('Error fetching overdue exams:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch overdue exams',
      error: error.message,
    });
  }
};

/**
 * Get low enrollment exams (exams with < 10 students)
 * GET /coordinator/analytics/low-enrollment
 */
export const getLowEnrollment = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const groups = await ExamRegistration.aggregate([
      { $match: { tenantId } },
      {
        $group: {
          _id: '$examName',
          totalRegistered: { $sum: 1 },
          platform: { $first: '$platform' },
        },
      },
      { $match: { totalRegistered: { $lt: 10 } } },
      { $sort: { totalRegistered: 1 } },
    ]);

    const lowEnrollmentExams = groups.map((group) => {
      let warningLevel = 'low';
      if (group.totalRegistered < 5) warningLevel = 'critical';

      return {
        examName: group._id,
        platform: group.platform,
        totalRegistered: group.totalRegistered,
        warningLevel,
      };
    });

    return res.status(200).json({
      status: 'success',
      data: lowEnrollmentExams,
      summary: {
        total: lowEnrollmentExams.length,
        critical: lowEnrollmentExams.filter((e) => e.warningLevel === 'critical').length,
        low: lowEnrollmentExams.filter((e) => e.warningLevel === 'low').length,
      },
    });
  } catch (error) {
    logger.error('Error fetching low enrollment exams:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch low enrollment exams',
      error: error.message,
    });
  }
};
