import { ExamRegistration } from '../models/ExamRegistration.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

/**
 * POST /api/coordinator/nptel/bulk-upload-marks
 * Bulk upload marks from CSV
 * Expected CSV format: rollNumber, examName, marksObtained, totalMarks, certificateLink (optional)
 */
export const bulkUploadMarks = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    const user = await User.findById(userId).select('name role');

    // Validate CSV data
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No records provided. Expected array of records with: rollNumber, examName, marksObtained, totalMarks, certificateLink (optional)',
      });
    }

    const results = {
      successful: [],
      failed: [],
      summary: {
        totalProcessed: records.length,
        successCount: 0,
        failureCount: 0,
      },
    };

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNum = i + 1; // For error reporting

      try {
        // Validate required fields
        if (!record.rollNumber || !record.examName || record.marksObtained === '' || record.marksObtained === null) {
          results.failed.push({
            row: rowNum,
            rollNumber: record.rollNumber,
            examName: record.examName,
            error: 'Missing required fields: rollNumber, examName, marksObtained',
          });
          results.summary.failureCount++;
          continue;
        }

        const marksObtained = parseFloat(record.marksObtained);
        const totalMarks = parseFloat(record.totalMarks || 100);
        const certificateLink = (record.certificateLink || '').trim();

        // Validate marks
        if (isNaN(marksObtained) || marksObtained < 0 || marksObtained > totalMarks) {
          results.failed.push({
            row: rowNum,
            rollNumber: record.rollNumber,
            examName: record.examName,
            error: `Invalid marks: ${record.marksObtained}. Must be between 0 and ${totalMarks}`,
          });
          results.summary.failureCount++;
          continue;
        }

        // Find registration
        const registration = await ExamRegistration.findOne({
          tenantId,
          examName: record.examName,
          rollNumber: record.rollNumber,
        });

        if (!registration) {
          results.failed.push({
            row: rowNum,
            rollNumber: record.rollNumber,
            examName: record.examName,
            error: 'Student registration not found for this exam',
          });
          results.summary.failureCount++;
          continue;
        }

        // Determine pass/fail (assuming 40% is passing)
        const passingPercentage = 40;
        const obtainedPercentage = (marksObtained / totalMarks) * 100;
        const isPassed = obtainedPercentage >= passingPercentage;

        // Update registration
        registration.marksObtained = marksObtained;
        registration.totalMarks = totalMarks;
        registration.status = isPassed ? 'Passed' : 'Failed';
        registration.examCompletionDate = new Date();
        registration.submittedDate = new Date();
        registration.verifiedBy = userId;
        registration.verifiedByName = user.name;
        registration.verifiedByRole = user.role;
        registration.verificationDate = new Date();

        // Add certificate link if provided and student passed
        if (certificateLink && isPassed) {
          registration.certificateLink = certificateLink;
        }

        await registration.save();

        results.successful.push({
          row: rowNum,
          rollNumber: record.rollNumber,
          examName: record.examName,
          status: registration.status,
          marksObtained,
          totalMarks,
          certificateAdded: certificateLink && isPassed ? '✓' : '✗',
        });
        results.summary.successCount++;
      } catch (error) {
        results.failed.push({
          row: rowNum,
          rollNumber: record.rollNumber || 'Unknown',
          examName: record.examName || 'Unknown',
          error: error.message,
        });
        results.summary.failureCount++;
      }
    }

    logger.info(`Bulk mark upload completed: ${results.summary.successCount} successful, ${results.summary.failureCount} failed`);

    res.status(200).json({
      status: 'success',
      message: `Bulk upload completed: ${results.summary.successCount} passed, ${results.summary.failureCount} failed`,
      data: results,
    });
  } catch (error) {
    logger.error('Bulk upload error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Bulk upload failed',
      details: error.message,
    });
  }
};

/**
 * POST /api/coordinator/nptel/batch-approve-requests
 * Approve multiple exam requests at once
 */
export const batchApproveRequests = async (req, res) => {
  try {
    const { registrationIds } = req.body;
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    const user = await User.findById(userId).select('name role');

    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No registration IDs provided',
      });
    }

    // Update all registrations
    const result = await ExamRegistration.updateMany(
      {
        _id: { $in: registrationIds },
        tenantId,
      },
      {
        $set: {
          status: 'Registered',
          verifiedBy: userId,
          verifiedByName: user.name,
          verifiedByRole: user.role,
          verificationDate: new Date(),
        },
      }
    );

    logger.info(`Batch approved ${result.modifiedCount} exam requests`);

    res.status(200).json({
      status: 'success',
      message: `Approved ${result.modifiedCount} exam requests`,
      data: {
        modifiedCount: result.modifiedCount,
        approvedBy: user.name,
        approvalTime: new Date(),
      },
    });
  } catch (error) {
    logger.error('Batch approve error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Batch approval failed',
      details: error.message,
    });
  }
};
