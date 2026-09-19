import { ExamRegistration } from '../models/ExamRegistration.js';
import { ExamCatalog } from '../models/ExamCatalog.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/coordinator/nptel/dashboard
 * Comprehensive NPTEL exam analytics dashboard
 */
export const getNptelDashboard = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const registrationFilter = {
      tenantId,
      ...(Object.keys(dateFilter).length > 0 && { registrationDate: dateFilter }),
    };

    // Get all registrations
    const registrations = await ExamRegistration.find(registrationFilter)
      .populate('examId', 'examName platform category')
      .populate('studentId', 'name email rollNumber');

    if (registrations.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          totalEnrollments: 0,
          totalStudents: 0,
          passRate: 0,
          certificateRate: 0,
          averageMarks: 0,
          courseBreakdown: [],
          markDistribution: { ranges: [] },
          enrollmentTrend: [],
          topCourses: [],
          failureReasons: [],
        },
      });
    }

    // ✅ 1. Basic Metrics
    const totalEnrollments = registrations.length;
    const uniqueStudents = new Set(registrations.map(r => r.studentId._id.toString())).size;

    // ✅ 2. Pass Rate & Certification
    const passedCount = registrations.filter(r => r.status === 'Passed').length;
    const passRate = totalEnrollments > 0 ? ((passedCount / totalEnrollments) * 100).toFixed(2) : 0;

    const certificatedCount = registrations.filter(r => r.certificateLink && r.certificateLink.trim()).length;
    const certificateRate = totalEnrollments > 0 ? ((certificatedCount / totalEnrollments) * 100).toFixed(2) : 0;

    // ✅ 3. Average Marks
    const validMarks = registrations.filter(r => r.marksObtained !== null && r.marksObtained !== undefined);
    const averageMarks = validMarks.length > 0
      ? (validMarks.reduce((sum, r) => sum + r.marksObtained, 0) / validMarks.length).toFixed(2)
      : 0;

    // ✅ 4. Mark Distribution (Histogram)
    const markDistribution = {
      '0-25': registrations.filter(r => r.marksObtained >= 0 && r.marksObtained < 25).length,
      '25-50': registrations.filter(r => r.marksObtained >= 25 && r.marksObtained < 50).length,
      '50-75': registrations.filter(r => r.marksObtained >= 50 && r.marksObtained < 75).length,
      '75-100': registrations.filter(r => r.marksObtained >= 75 && r.marksObtained <= 100).length,
      'NotSubmitted': registrations.filter(r => r.marksObtained === null || r.marksObtained === undefined).length,
    };

    // ✅ 5. Course Breakdown (Per Exam)
    const courseBreakdown = {};
    registrations.forEach(reg => {
      const examName = reg.examName || 'Unknown';
      if (!courseBreakdown[examName]) {
        courseBreakdown[examName] = {
          examName,
          totalEnrolled: 0,
          passed: 0,
          failed: 0,
          certificated: 0,
          averageMarks: 0,
          passRate: 0,
        };
      }
      courseBreakdown[examName].totalEnrolled++;
      if (reg.status === 'Passed') courseBreakdown[examName].passed++;
      if (reg.status === 'Failed') courseBreakdown[examName].failed++;
      if (reg.certificateLink) courseBreakdown[examName].certificated++;
    });

    // Calculate per-course averages
    Object.keys(courseBreakdown).forEach(course => {
      const courseRegs = registrations.filter(r => r.examName === course);
      const courseMarks = courseRegs.filter(r => r.marksObtained !== null);
      courseBreakdown[course].averageMarks = courseMarks.length > 0
        ? (courseMarks.reduce((sum, r) => sum + r.marksObtained, 0) / courseMarks.length).toFixed(2)
        : 0;
      courseBreakdown[course].passRate = courseBreakdown[course].totalEnrolled > 0
        ? ((courseBreakdown[course].passed / courseBreakdown[course].totalEnrolled) * 100).toFixed(2)
        : 0;
    });

    // ✅ 6. Enrollment Trend (By Date)
    const enrollmentByDate = {};
    registrations.forEach(reg => {
      const week = new Date(reg.registrationDate);
      week.setDate(week.getDate() - week.getDay());
      const weekKey = week.toISOString().split('T')[0];
      enrollmentByDate[weekKey] = (enrollmentByDate[weekKey] || 0) + 1;
    });

    const enrollmentTrend = Object.entries(enrollmentByDate)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, count]) => ({ date, count }));

    // ✅ 7. Top Courses (By Enrollment)
    const topCourses = Object.values(courseBreakdown)
      .sort((a, b) => b.totalEnrolled - a.totalEnrolled)
      .slice(0, 5);

    // ✅ 8. Failure Reasons (For Failed Exams)
    const failedRegs = registrations.filter(r => r.status === 'Failed');
    const failureReasons = {};
    failedRegs.forEach(reg => {
      const reason = reg.feedback || 'No feedback provided';
      failureReasons[reason] = (failureReasons[reason] || 0) + 1;
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalEnrollments,
        totalStudents: uniqueStudents,
        passRate: parseFloat(passRate),
        certificateRate: parseFloat(certificateRate),
        averageMarks: parseFloat(averageMarks),
        courseBreakdown: Object.values(courseBreakdown),
        markDistribution,
        enrollmentTrend,
        topCourses,
        failureReasons: Object.entries(failureReasons).map(([reason, count]) => ({ reason, count })),
      },
    });
  } catch (error) {
    logger.error('NPTEL Dashboard error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch NPTEL dashboard',
      details: error.message,
    });
  }
};

/**
 * GET /api/coordinator/nptel/course/:examName/details
 * Get detailed analytics for a specific course
 */
export const getCourseDetails = async (req, res) => {
  try {
    const { examName } = req.params;
    const tenantId = req.tenantId;

    const registrations = await ExamRegistration.find({
      tenantId,
      examName,
    })
      .populate('studentId', 'name email rollNumber')
      .populate('verifiedBy', 'name');

    if (registrations.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No registrations found for this course',
      });
    }

    // Detailed breakdown
    const breakdown = {
      registered: registrations.filter(r => r.status === 'Registered').length,
      submitted: registrations.filter(r => r.status === 'Submitted').length,
      passed: registrations.filter(r => r.status === 'Passed').length,
      failed: registrations.filter(r => r.status === 'Failed').length,
      students: registrations.map(r => ({
        studentId: r.studentId._id,
        name: r.studentId.name,
        email: r.studentId.email,
        rollNumber: r.studentId.rollNumber,
        status: r.status,
        marksObtained: r.marksObtained,
        certificateLink: r.certificateLink ? '✓' : '✗',
        registeredOn: r.registrationDate,
        completedOn: r.examCompletionDate,
        attemptNumber: r.attemptNumber,
      })),
    };

    res.status(200).json({
      status: 'success',
      data: breakdown,
    });
  } catch (error) {
    logger.error('Course details error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch course details',
      details: error.message,
    });
  }
};

/**
 * GET /api/coordinator/nptel/student/:studentId/progress
 * Get student's NPTEL exam progress
 */
export const getStudentNptelProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tenantId = req.tenantId;

    const registrations = await ExamRegistration.find({
      tenantId,
      studentId,
    })
      .populate('examId', 'examName platform category')
      .sort({ registrationDate: -1 });

    if (registrations.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No exam registrations found for this student',
      });
    }

    const summary = {
      totalEnrolled: registrations.length,
      totalPassed: registrations.filter(r => r.status === 'Passed').length,
      totalFailed: registrations.filter(r => r.status === 'Failed').length,
      certificatesEarned: registrations.filter(r => r.certificateLink).length,
      averageMarks: 0,
      exams: registrations,
    };

    const marksArray = registrations.filter(r => r.marksObtained !== null);
    if (marksArray.length > 0) {
      summary.averageMarks = (marksArray.reduce((sum, r) => sum + r.marksObtained, 0) / marksArray.length).toFixed(2);
    }

    res.status(200).json({
      status: 'success',
      data: summary,
    });
  } catch (error) {
    logger.error('Student progress error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch student progress',
      details: error.message,
    });
  }
};
