// utils/excelExporter.js
import ExcelJS from 'exceljs';
import { logger } from './logger.js';

/**
 * Create workbook with styling
 */
const createStyledWorkbook = () => {
  const workbook = new ExcelJS.Workbook();
  return workbook;
};

/**
 * Add header styling to worksheet
 */
const styleHeader = (worksheet, columns) => {
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F5496' },
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };

  columns.forEach((col, index) => {
    worksheet.getColumn(index + 1).width = col.width || 20;
  });
};

/**
 * Export all registrations
 */
export const exportRegistrations = async (registrations, filename) => {
  try {
    const workbook = createStyledWorkbook();
    const worksheet = workbook.addWorksheet('Registrations');

    const columns = [
      { header: 'Student Name', key: 'studentName', width: 20 },
      { header: 'Roll Number', key: 'rollNumber', width: 15 },
      { header: 'Exam Name', key: 'examName', width: 25 },
      { header: 'Platform', key: 'platform', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Marks', key: 'marksObtained', width: 10 },
      { header: 'Total Marks', key: 'totalMarks', width: 10 },
      { header: 'Registration Date', key: 'registrationDate', width: 18 },
      { header: 'Completion Date', key: 'examCompletionDate', width: 18 },
      { header: 'Verification Date', key: 'verificationDate', width: 18 },
      { header: 'Verified By', key: 'verifiedByName', width: 20 },
      { header: 'Feedback', key: 'feedback', width: 30 },
    ];

    worksheet.columns = columns;
    styleHeader(worksheet, columns);

    // Add data rows
    registrations.forEach((reg) => {
      worksheet.addRow({
        studentName: reg.studentName,
        rollNumber: reg.rollNumber,
        examName: reg.examName,
        platform: reg.platform,
        status: reg.status,
        marksObtained: reg.marksObtained || '-',
        totalMarks: reg.totalMarks || '-',
        registrationDate: new Date(reg.registrationDate).toLocaleDateString(),
        examCompletionDate: reg.examCompletionDate
          ? new Date(reg.examCompletionDate).toLocaleDateString()
          : '-',
        verificationDate: reg.verificationDate
          ? new Date(reg.verificationDate).toLocaleDateString()
          : '-',
        verifiedByName: reg.verifiedByName || '-',
        feedback: reg.feedback || '-',
      });
    });

    // Add summary at bottom
    const summaryRow = worksheet.addRow([]);
    summaryRow.getCell(1).value = 'Summary';
    summaryRow.getCell(1).font = { bold: true, size: 11 };

    worksheet.addRow([]);
    worksheet.addRow([`Total Registrations: ${registrations.length}`]);
    worksheet.addRow([
      `Passed: ${registrations.filter((r) => r.status === 'Passed').length}`,
    ]);
    worksheet.addRow([
      `Failed: ${registrations.filter((r) => r.status === 'Failed').length}`,
    ]);
    worksheet.addRow([
      `Submitted: ${registrations.filter((r) => r.status === 'Submitted').length}`,
    ]);
    worksheet.addRow([
      `Registered: ${registrations.filter((r) => r.status === 'Registered').length}`,
    ]);

    await workbook.xlsx.writeFile(filename);
    return filename;
  } catch (error) {
    logger.error('Error exporting registrations:', error);
    throw error;
  }
};

/**
 * Export exam group report
 */
export const exportExamGroupReport = async (examName, students, filename) => {
  try {
    const workbook = createStyledWorkbook();
    const worksheet = workbook.addWorksheet('Exam Group');

    // Title
    const titleRow = worksheet.addRow([`Exam: ${examName}`]);
    titleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF1F5496' } };
    worksheet.addRow([]);

    const columns = [
      { header: 'Student Name', key: 'studentName', width: 20 },
      { header: 'Roll Number', key: 'rollNumber', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Marks', key: 'marksObtained', width: 10 },
      { header: 'Registration Date', key: 'registrationDate', width: 18 },
      { header: 'Completion Date', key: 'examCompletionDate', width: 18 },
      { header: 'Verified By', key: 'verifiedByName', width: 20 },
    ];

    worksheet.columns = columns;
    styleHeader(worksheet, columns);

    students.forEach((student) => {
      worksheet.addRow({
        studentName: student.studentName,
        rollNumber: student.rollNumber,
        status: student.status,
        marksObtained: student.marksObtained || '-',
        registrationDate: new Date(student.registrationDate).toLocaleDateString(),
        examCompletionDate: student.examCompletionDate
          ? new Date(student.examCompletionDate).toLocaleDateString()
          : '-',
        verifiedByName: student.verifiedByName || '-',
      });
    });

    // Stats
    const passed = students.filter((s) => s.status === 'Passed').length;
    const failed = students.filter((s) => s.status === 'Failed').length;
    const submitted = students.filter((s) => s.status === 'Submitted').length;
    const registered = students.filter((s) => s.status === 'Registered').length;

    worksheet.addRow([]);
    worksheet.addRow([`Total Students: ${students.length}`]);
    worksheet.addRow([`Passed: ${passed}`]);
    worksheet.addRow([`Failed: ${failed}`]);
    worksheet.addRow([`Submitted: ${submitted}`]);
    worksheet.addRow([`Registered: ${registered}`]);

    await workbook.xlsx.writeFile(filename);
    return filename;
  } catch (error) {
    logger.error('Error exporting exam group report:', error);
    throw error;
  }
};

/**
 * Export student exam history
 */
export const exportStudentHistory = async (studentName, rollNumber, exams, filename) => {
  try {
    const workbook = createStyledWorkbook();
    const worksheet = workbook.addWorksheet('Student History');

    // Student info
    const studentRow = worksheet.addRow([`Student: ${studentName} (${rollNumber})`]);
    studentRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF1F5496' } };
    worksheet.addRow([]);

    const columns = [
      { header: 'Exam Name', key: 'examName', width: 25 },
      { header: 'Platform', key: 'platform', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Marks', key: 'marksObtained', width: 10 },
      { header: 'Total Marks', key: 'totalMarks', width: 10 },
      { header: 'Attempts', key: 'attemptNumber', width: 10 },
      { header: 'Registration Date', key: 'registrationDate', width: 18 },
      { header: 'Completion Date', key: 'examCompletionDate', width: 18 },
      { header: 'Verification Date', key: 'verificationDate', width: 18 },
    ];

    worksheet.columns = columns;
    styleHeader(worksheet, columns);

    exams.forEach((exam) => {
      worksheet.addRow({
        examName: exam.examName,
        platform: exam.platform,
        status: exam.status,
        marksObtained: exam.marksObtained || '-',
        totalMarks: exam.totalMarks || '-',
        attemptNumber: exam.attemptNumber || 1,
        registrationDate: new Date(exam.registrationDate).toLocaleDateString(),
        examCompletionDate: exam.examCompletionDate
          ? new Date(exam.examCompletionDate).toLocaleDateString()
          : '-',
        verificationDate: exam.verificationDate
          ? new Date(exam.verificationDate).toLocaleDateString()
          : '-',
      });
    });

    // Summary
    worksheet.addRow([]);
    worksheet.addRow([`Total Exams: ${exams.length}`]);
    worksheet.addRow([`Passed: ${exams.filter((e) => e.status === 'Passed').length}`]);
    worksheet.addRow([`Failed: ${exams.filter((e) => e.status === 'Failed').length}`]);
    worksheet.addRow([
      `Pass Rate: ${exams.length > 0 ? Math.round((exams.filter((e) => e.status === 'Passed').length / exams.length) * 100) : 0}%`,
    ]);

    const avgMarks =
      exams.filter((e) => e.marksObtained).length > 0
        ? (exams.reduce((sum, e) => sum + (e.marksObtained || 0), 0) / exams.filter((e) => e.marksObtained).length).toFixed(2)
        : 0;
    worksheet.addRow([`Average Marks: ${avgMarks}`]);

    await workbook.xlsx.writeFile(filename);
    return filename;
  } catch (error) {
    logger.error('Error exporting student history:', error);
    throw error;
  }
};
