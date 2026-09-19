import { ExamRegistration } from '../models/ExamRegistration.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/coordinator/nptel/export/course/:examName
 * Export course data as JSON (client will convert to Excel)
 */
export const exportCourseData = async (req, res) => {
  try {
    const { examName } = req.params;
    const tenantId = req.tenantId;

    const registrations = await ExamRegistration.find({
      tenantId,
      examName,
    })
      .populate('studentId', 'name email rollNumber department')
      .populate('verifiedBy', 'name')
      .sort({ registrationDate: -1 });

    if (registrations.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No data found for this course',
      });
    }

    // Format data for export
    const exportData = registrations.map(reg => ({
      'Roll Number': reg.rollNumber || '',
      'Student Name': reg.studentName || '',
      'Email': reg.studentId?.email || '',
      'Department': reg.studentId?.department || '',
      'Registration Date': reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString() : '',
      'Status': reg.status,
      'Marks Obtained': reg.marksObtained || '-',
      'Total Marks': reg.totalMarks || '-',
      'Marks %': reg.marksObtained && reg.totalMarks ? ((reg.marksObtained / reg.totalMarks) * 100).toFixed(2) : '-',
      'Certificate Link': reg.certificateLink ? 'Yes' : 'No',
      'Completed Date': reg.examCompletionDate ? new Date(reg.examCompletionDate).toLocaleDateString() : '-',
      'Verified By': reg.verifiedByName || '-',
      'Attempt Number': reg.attemptNumber || 1,
      'Feedback': reg.feedback || '-',
    }));

    logger.info(`Exported ${exportData.length} records for course: ${examName}`);

    res.status(200).json({
      status: 'success',
      data: {
        courseTitle: examName,
        totalRecords: exportData.length,
        exportedAt: new Date().toLocaleString(),
        records: exportData,
      },
    });
  } catch (error) {
    logger.error('Export course error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export course data',
      details: error.message,
    });
  }
};

/**
 * GET /api/coordinator/nptel/export/all-exams
 * Export all exam records as CSV
 */
export const exportAllExams = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = { tenantId };
    if (Object.keys(dateFilter).length > 0) {
      query.registrationDate = dateFilter;
    }

    const registrations = await ExamRegistration.find(query)
      .populate('studentId', 'name email rollNumber department')
      .populate('verifiedBy', 'name')
      .sort({ registrationDate: -1 });

    if (registrations.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No exam records found',
      });
    }

    // Format data for export as CSV
    const headers = ['Exam Name', 'Platform', 'Roll Number', 'Student Name', 'Email', 'Department', 'Registration Date', 'Status', 'Marks Obtained', 'Total Marks', 'Marks %', 'Certificate Link', 'Completed Date', 'Verified By', 'Attempt Number'];
    const csvRows = [headers.join(',')];

    registrations.forEach(reg => {
      const row = [
        `"${reg.examName || ''}"`,
        `"${reg.platform || '-'}"`,
        `"${reg.rollNumber || ''}"`,
        `"${reg.studentName || ''}"`,
        `"${reg.studentId?.email || ''}"`,
        `"${reg.studentId?.department || ''}"`,
        `"${reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString() : ''}"`,
        `"${reg.status}"`,
        `"${reg.marksObtained || '-'}"`,
        `"${reg.totalMarks || '-'}"`,
        `"${reg.marksObtained && reg.totalMarks ? ((reg.marksObtained / reg.totalMarks) * 100).toFixed(2) : '-'}"`,
        `"${reg.certificateLink ? 'Yes' : 'No'}"`,
        `"${reg.examCompletionDate ? new Date(reg.examCompletionDate).toLocaleDateString() : '-'}"`,
        `"${reg.verifiedByName || '-'}"`,
        `"${reg.attemptNumber || 1}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvData = csvRows.join('\n');

    logger.info(`Exported ${registrations.length} total exam records as CSV`);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="nptel-all-exams.csv"');
    res.send(csvData);
  } catch (error) {
    logger.error('Export all exams error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export exam data',
      details: error.message,
    });
  }
};

/**
 * GET /api/coordinator/nptel/export/student-transcript/:studentId
 * Export student's exam transcript
 */
export const exportStudentTranscript = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tenantId = req.tenantId;

    const registrations = await ExamRegistration.find({
      tenantId,
      studentId,
    })
      .populate('studentId', 'name email rollNumber department')
      .sort({ registrationDate: -1 });

    if (registrations.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No exam records found for this student',
      });
    }

    const student = registrations[0].studentId;

    // Format transcript
    const transcript = {
      studentInfo: {
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        department: student.department,
      },
      summary: {
        totalExams: registrations.length,
        passed: registrations.filter(r => r.status === 'Passed').length,
        failed: registrations.filter(r => r.status === 'Failed').length,
        certificatesEarned: registrations.filter(r => r.certificateLink).length,
        averageMarks: 0,
      },
      exams: registrations.map(reg => ({
        'Exam Name': reg.examName,
        'Platform': reg.platform,
        'Registration Date': reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString() : '',
        'Status': reg.status,
        'Marks Obtained': reg.marksObtained || '-',
        'Total Marks': reg.totalMarks || '-',
        'Percentage': reg.marksObtained && reg.totalMarks ? ((reg.marksObtained / reg.totalMarks) * 100).toFixed(2) + '%' : '-',
        'Certificate': reg.certificateLink ? '✓' : '✗',
        'Completed': reg.examCompletionDate ? new Date(reg.examCompletionDate).toLocaleDateString() : '-',
        'Attempts': reg.attemptNumber || 1,
      })),
    };

    // Calculate average marks
    const marksArray = registrations.filter(r => r.marksObtained !== null);
    if (marksArray.length > 0) {
      transcript.summary.averageMarks = (marksArray.reduce((sum, r) => sum + r.marksObtained, 0) / marksArray.length).toFixed(2);
    }

    logger.info(`Generated transcript for student: ${student.name}`);

    res.status(200).json({
      status: 'success',
      data: {
        exportedAt: new Date().toLocaleString(),
        transcript,
      },
    });
  } catch (error) {
    logger.error('Export transcript error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export student transcript',
      details: error.message,
    });
  }
};

/**
 * GET /api/coordinator/nptel/export/sample-csv
 * Get sample CSV template for bulk upload
 */
export const getSampleCsvTemplate = (req, res) => {
  const sampleData = `rollNumber,examName,marksObtained,totalMarks,certificateLink
MCA001,NPTEL-Python Basics,85,100,https://drive.google.com/file/d/xxx
MCA002,NPTEL-Python Basics,92,100,https://drive.google.com/file/d/yyy
MCA003,NPTEL-Python Basics,45,100,
MCA004,NPTEL-Data Structures,78,100,https://drive.google.com/file/d/zzz`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="nptel-marks-template.csv"');
  res.send(sampleData);
};
