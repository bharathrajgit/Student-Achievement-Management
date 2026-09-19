// controllers/reportController.js
import { ExamRegistration } from '../models/ExamRegistration.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';
import PDFDocument from 'pdfkit';
import {
  exportRegistrations,
  exportExamGroupReport,
  exportStudentHistory,
} from '../utils/excelExporter.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Export all registrations to Excel/CSV/PDF
 * GET /coordinator/reports/export-registrations
 */
export const exportAllRegistrations = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { examName, status, platform, format = 'xlsx' } = req.query;

    console.log('📤 Export Request:', { format, examName, status, platform });

    const filter = { tenantId };

    if (examName) filter.examName = { $regex: examName, $options: 'i' };
    if (status && status !== 'all') filter.status = status;
    if (platform && platform !== 'all') filter.platform = platform;

    const registrations = await ExamRegistration.find(filter)
      .populate('studentId', 'name email')
      .populate('verifiedBy', 'name role')
      .sort({ createdAt: -1 });

    console.log('📊 Found registrations:', registrations.length);

    if (registrations.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No registrations found with given filters',
      });
    }

    // ==========================================
    // CSV FORMAT
    // ==========================================
    if (format === 'csv') {
      console.log('📄 Generating CSV...');
      
      const csvHeaders = [
        'Student Name',
        'Roll Number',
        'Email',
        'Exam Name',
        'Platform',
        'Status',
        'Marks Obtained',
        'Total Marks',
        'Registration Date',
        'Submission Date',
        'Verification Date',
        'Verified By',
        'Certificate Link'
      ];

      let csvContent = csvHeaders.join(',') + '\n';

      registrations.forEach((reg) => {
        const row = [
          `"${reg.studentName || ''}"`,
          `"${reg.rollNumber || ''}"`,
          `"${reg.studentId?.email || ''}"`,
          `"${reg.examName || ''}"`,
          `"${reg.platform || ''}"`,
          `"${reg.status || ''}"`,
          `"${reg.marksObtained || '-'}"`,
          `"${reg.totalMarks || '-'}"`,
          `"${reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString() : '-'}"`,
          `"${reg.submittedDate ? new Date(reg.submittedDate).toLocaleDateString() : '-'}"`,
          `"${reg.verificationDate ? new Date(reg.verificationDate).toLocaleDateString() : '-'}"`,
          `"${reg.verifiedByName || '-'}"`,
          `"${reg.certificateLink || '-'}"`
        ];
        csvContent += row.join(',') + '\n';
      });

      const filename = `exam-registrations-${Date.now()}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      logger.info(`✅ Exported ${registrations.length} registrations to CSV`);
      
      return res.send(csvContent);
    }

    // ==========================================
    // PDF FORMAT - PROFESSIONAL TABLE
    // ==========================================
    if (format === 'pdf') {
      console.log('📕 Generating PDF...');
      
      try {
        const doc = new PDFDocument({
          margin: 30,
          size: 'A4',
          layout: 'landscape'
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="exam-registrations-${new Date().toISOString().split('T')[0]}.pdf"`);

        // Pipe to response
        doc.pipe(res);

        // ===== HEADER =====
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#1a1a1a');
        doc.text('EXAM REGISTRATIONS REPORT', { align: 'center' });
        doc.moveDown(0.3);
        
        doc.fontSize(10).font('Helvetica').fillColor('#555');
        doc.text('Generated: ' + new Date().toLocaleString(), { align: 'center' });
        doc.text('Total Records: ' + registrations.length, { align: 'center' });
        doc.moveDown(0.8);

        // ===== TABLE CONFIGURATION =====
        const tableConfig = {
          x: 30,
          colWidth: [100, 70, 100, 70, 80, 50, 70],
          rowHeight: 18,
          headerRowHeight: 25,
          columns: [
            { name: 'Student Name', align: 'left' },
            { name: 'Roll No', align: 'center' },
            { name: 'Exam Name', align: 'left' },
            { name: 'Platform', align: 'center' },
            { name: 'Status', align: 'center' },
            { name: 'Marks', align: 'center' },
            { name: 'Reg Date', align: 'center' }
          ]
        };

        const tableTop = doc.y;

        // ===== DRAW TABLE HEADER =====
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff');
        
        let xPos = tableConfig.x;
        const headerY = tableTop;
        const tableWidth = tableConfig.colWidth.reduce((a, b) => a + b);
        
        // Header background
        doc.rect(tableConfig.x, headerY, tableWidth, tableConfig.headerRowHeight).fill('#667eea');
        
        // Header text
        doc.fillColor('#fff');
        tableConfig.columns.forEach((col, i) => {
          doc.fontSize(9).font('Helvetica-Bold');
          doc.text(col.name, xPos + 5, headerY + 5, {
            width: tableConfig.colWidth[i] - 10,
            align: col.align,
            height: tableConfig.headerRowHeight,
            valign: 'center'
          });
          xPos += tableConfig.colWidth[i];
        });

        doc.moveDown(1.3);

        // ===== DRAW TABLE ROWS =====
        doc.fontSize(8).font('Helvetica').fillColor('#000');
        let currentY = doc.y;
        let rowNum = 0;

        registrations.forEach((reg) => {
          // Check if need new page
          if (currentY > 430) {
            doc.addPage();
            currentY = 30;
          }

          // Alternate row background
          if (rowNum % 2 === 0) {
            doc.rect(tableConfig.x, currentY, tableWidth, tableConfig.rowHeight).fill('#f5f5f5');
          } else {
            doc.rect(tableConfig.x, currentY, tableWidth, tableConfig.rowHeight).fill('#fff');
          }

          // Row data
          const rowData = [
            (reg.studentName || '-').substring(0, 25),
            (reg.rollNumber || '-').substring(0, 12),
            (reg.examName || '-').substring(0, 20),
            (reg.platform || '-').substring(0, 12),
            reg.status || '-',
            reg.marksObtained ? reg.marksObtained.toString() : '-',
            reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString('en-IN') : '-'
          ];

          xPos = tableConfig.x;
          doc.fillColor('#000');
          doc.font('Helvetica').fontSize(8);
          
          rowData.forEach((data, i) => {
            doc.text(data, xPos + 5, currentY + 4, {
              width: tableConfig.colWidth[i] - 10,
              align: tableConfig.columns[i].align,
              height: tableConfig.rowHeight,
              valign: 'center'
            });
            xPos += tableConfig.colWidth[i];
          });

          // Draw row border
          doc.strokeColor('#ddd').lineWidth(0.5);
          doc.rect(tableConfig.x, currentY, tableWidth, tableConfig.rowHeight).stroke();

          currentY += tableConfig.rowHeight;
          rowNum++;
        });

        // ===== SUMMARY SECTION =====
        doc.moveDown(1.5);
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a1a1a');
        doc.text('Summary Statistics', { underline: true });
        doc.moveDown(0.5);

        const statusCounts = {
          Registered: registrations.filter(r => r.status === 'Registered').length,
          Submitted: registrations.filter(r => r.status === 'Submitted').length,
          Passed: registrations.filter(r => r.status === 'Passed').length,
          Failed: registrations.filter(r => r.status === 'Failed').length,
        };

        doc.fontSize(10).font('Helvetica').fillColor('#333');
        Object.entries(statusCounts).forEach(([status, count]) => {
          doc.text('  • ' + status + ': ' + count);
        });

        // ===== FOOTER =====
        doc.moveDown(1.5);
        doc.fontSize(8).fillColor('#999');
        doc.text('This is a computer-generated document', { align: 'center' });

        doc.end();

        logger.info(`✅ PDF generated with ${registrations.length} registrations`);
        return;
        
      } catch (pdfError) {
        logger.error('❌ PDF generation error:', pdfError);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to generate PDF',
          error: pdfError.message,
        });
      }
    }

    // ==========================================
    // EXCEL FORMAT (DEFAULT)
    // ==========================================
    console.log('📗 Generating Excel...');
    
    const filename = path.join(
      __dirname,
      `../../exports/registrations_${Date.now()}.xlsx`
    );

    const exportDir = path.dirname(filename);
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    await exportRegistrations(registrations, filename);

    logger.info(`✅ Exported ${registrations.length} registrations to Excel`);

    return res.download(
      filename,
      `exam-registrations-${new Date().toISOString().split('T')[0]}.xlsx`,
      (err) => {
        if (err) logger.error('❌ Download error:', err);
        fs.unlink(filename, (unlinkErr) => {
          if (unlinkErr) logger.error('File deletion error:', unlinkErr);
        });
      }
    );
    
  } catch (error) {
    logger.error('❌ Error exporting registrations:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to export registrations',
      error: error.message,
    });
  }
};




/**
 * Export exam group report to Excel
 * GET /coordinator/reports/export-group/:examName
 */
export const exportExamGroup = async (req, res) => {
  try {
    const { examName } = req.params;
    const tenantId = req.tenantId;

    const students = await ExamRegistration.find({
      tenantId,
      examName,
    })
      .populate('studentId', 'name email')
      .populate('verifiedBy', 'name role');

    if (students.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `No students found for exam: ${examName}`,
      });
    }

    const filename = path.join(
      __dirname,
      `../../exports/exam_group_${Date.now()}.xlsx`
    );

    const exportDir = path.dirname(filename);
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    await exportExamGroupReport(examName, students, filename);

    logger.info(`Exported exam group "${examName}" with ${students.length} students`);

    return res.download(
      filename,
      `${examName}_${new Date().toISOString().split('T')[0]}.xlsx`,
      (err) => {
        if (err) logger.error('Download error:', err);
        fs.unlink(filename, (unlinkErr) => {
          if (unlinkErr) logger.error('File deletion error:', unlinkErr);
        });
      }
    );
  } catch (error) {
    logger.error('Error exporting exam group:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to export exam group',
      error: error.message,
    });
  }
};

/**
 * Export student exam history to Excel
 * GET /coordinator/reports/student/:studentId/export
 */
export const exportStudentExamHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tenantId = req.tenantId;

    const exams = await ExamRegistration.find({
      tenantId,
      studentId,
    });

    if (exams.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No exam records found for this student',
      });
    }

    const student = exams[0];
    const filename = path.join(
      __dirname,
      `../../exports/student_history_${Date.now()}.xlsx`
    );

    const exportDir = path.dirname(filename);
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    await exportStudentHistory(student.studentName, student.rollNumber, exams, filename);

    logger.info(`Exported exam history for student ${student.studentName}`);

    return res.download(
      filename,
      `${student.studentName}_exam_history_${new Date().toISOString().split('T')[0]}.xlsx`,
      (err) => {
        if (err) logger.error('Download error:', err);
        fs.unlink(filename, (unlinkErr) => {
          if (unlinkErr) logger.error('File deletion error:', unlinkErr);
        });
      }
    );
  } catch (error) {
    logger.error('Error exporting student history:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to export student history',
      error: error.message,
    });
  }
};

/**
 * Custom report builder with filters
 * POST /coordinator/reports/custom
 */
export const buildCustomReport = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { filters, format = 'xlsx' } = req.body;

    // Build filter object
    const filterObj = { tenantId };

    if (filters?.platform) filterObj.platform = filters.platform;
    if (filters?.status) filterObj.status = filters.status;
    if (filters?.examName) filterObj.examName = { $regex: filters.examName, $options: 'i' };

    if (filters?.dateRange) {
      if (filters.dateRange.start || filters.dateRange.end) {
        filterObj.registrationDate = {};
        if (filters.dateRange.start) {
          filterObj.registrationDate.$gte = new Date(filters.dateRange.start);
        }
        if (filters.dateRange.end) {
          filterObj.registrationDate.$lte = new Date(filters.dateRange.end);
        }
      }
    }

    const registrations = await ExamRegistration.find(filterObj)
      .populate('studentId', 'name email')
      .populate('verifiedBy', 'name role');

    if (registrations.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No records found matching the filter criteria',
      });
    }

    if (format === 'csv') {
      // CSV format
      let csv = 'Student Name,Roll Number,Exam Name,Platform,Status,Marks,Registration Date\n';
      registrations.forEach((reg) => {
        csv += `"${reg.studentName}","${reg.rollNumber}","${reg.examName}","${reg.platform}","${reg.status}","${reg.marksObtained || '-'}","${new Date(reg.registrationDate).toLocaleDateString()}"\n`;
      });

      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="custom_report_${Date.now()}.csv"`,
      });
      return res.send(csv);
    } else {
      // Excel format (default)
      const filename = path.join(
        __dirname,
        `../../exports/custom_report_${Date.now()}.xlsx`
      );

      const exportDir = path.dirname(filename);
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      await exportRegistrations(registrations, filename);

      logger.info(`Generated custom report with ${registrations.length} records`);

      return res.download(
        filename,
        `custom_report_${new Date().toISOString().split('T')[0]}.xlsx`,
        (err) => {
          if (err) logger.error('Download error:', err);
          fs.unlink(filename, (unlinkErr) => {
            if (unlinkErr) logger.error('File deletion error:', unlinkErr);
          });
        }
      );
    }
  } catch (error) {
    logger.error('Error building custom report:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to build custom report',
      error: error.message,
    });
  }
};
