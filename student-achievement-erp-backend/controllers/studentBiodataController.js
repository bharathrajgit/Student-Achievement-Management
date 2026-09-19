// controllers/studentBiodataController.js
import Biodata from '../models/Biodata.js';
import { User } from '../models/User.js';

/**
 * Get current student's biodata
 * GET /api/student/biodata
 */
export const getMyBiodata = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Verify user is a student
    const user = await User.findById(userId);
    if (!user || user.role !== 'student') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Students only.'
      });
    }

    // Fetch biodata for this student
    const biodata = await Biodata.findOne({ user: userId });

    return res.status(200).json({
      status: 'success',
      data: {
        student: {
          _id: user._id,
          name: user.name,
          email: user.email,
          rollNumber: user.rollNumber,
        },
        biodata: biodata || null
      },
      message: biodata ? 'Biodata retrieved successfully' : 'No biodata found. Please fill your details.'
    });
  } catch (err) {
    console.error('Error fetching student biodata:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch biodata',
      error: err.message
    });
  }
};

/**
 * Create or update current student's biodata
 * POST /api/student/biodata
 */
export const upsertMyBiodata = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const biodataFields = req.body;

    // Verify user is a student
    const user = await User.findById(userId);
    if (!user || user.role !== 'student') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Students only.'
      });
    }

    // Check if biodata exists
    let biodata = await Biodata.findOne({ user: userId });

    if (biodata) {
      // ✅ UPDATE EXISTING BIODATA
      
      // Personal Information
      if (biodataFields.personal) {
        biodata.personal = { ...biodata.personal, ...biodataFields.personal };
      }

      // Contact Information
      if (biodataFields.contact) {
        biodata.contact = {
          ...biodata.contact,
          ...biodataFields.contact,
          permanentAddress: {
            ...biodata.contact.permanentAddress,
            ...(biodataFields.contact.permanentAddress || {})
          },
          currentAddress: {
            ...biodata.contact.currentAddress,
            ...(biodataFields.contact.currentAddress || {})
          }
        };
      }

      // Academic IDs
      if (biodataFields.academicIds) {
        biodata.academicIds = { ...biodata.academicIds, ...biodataFields.academicIds };
      }

      // School Details
      if (biodataFields.school) {
        biodata.school = {
          tenth: {
            ...biodata.school.tenth,
            ...(biodataFields.school.tenth || {})
          },
          twelfthOrDiploma: {
            ...biodata.school.twelfthOrDiploma,
            ...(biodataFields.school.twelfthOrDiploma || {})
          }
        };
      }

      // UG Details
      if (biodataFields.ug) {
        biodata.ug = { ...biodata.ug, ...biodataFields.ug };
      }

      // PG Details
      if (biodataFields.pg) {
        biodata.pg = {
          ...biodata.pg,
          ...biodataFields.pg,
          scholarship: {
            ...biodata.pg.scholarship,
            ...(biodataFields.pg.scholarship || {})
          }
        };
      }

      // Family Information
      if (biodataFields.family) {
        biodata.family = {
          ...biodata.family,
          ...biodataFields.family,
          father: {
            ...biodata.family.father,
            ...(biodataFields.family.father || {})
          },
          mother: {
            ...biodata.family.mother,
            ...(biodataFields.family.mother || {})
          },
          guardian: {
            ...biodata.family.guardian,
            ...(biodataFields.family.guardian || {})
          },
          emergencyContact: {
            ...biodata.family.emergencyContact,
            ...(biodataFields.family.emergencyContact || {})
          }
        };
      }

      // Health and Other
      if (biodataFields.healthAndOther) {
        biodata.healthAndOther = { ...biodata.healthAndOther, ...biodataFields.healthAndOther };
      }

      // Documents
      if (biodataFields.documents) {
        biodata.documents = {
          identity: {
            ...biodata.documents.identity,
            ...(biodataFields.documents.identity || {})
          },
          school: {
            ...biodata.documents.school,
            ...(biodataFields.documents.school || {})
          },
          ug: {
            ...biodata.documents.ug,
            ...(biodataFields.documents.ug || {})
          },
          pg: {
            ...biodata.documents.pg,
            ...(biodataFields.documents.pg || {})
          }
        };
      }

      // Update metadata
      biodata.meta.lastUpdatedByRole = 'student';
      await biodata.save();

      return res.status(200).json({
        status: 'success',
        data: { biodata },
        message: 'Biodata updated successfully!'
      });
    } else {
      // ✅ CREATE NEW BIODATA
      biodata = await Biodata.create({
        user: userId,
        personal: biodataFields.personal || {},
        contact: biodataFields.contact || {},
        academicIds: biodataFields.academicIds || {},
        school: biodataFields.school || {},
        ug: biodataFields.ug || {},
        pg: biodataFields.pg || {},
        family: biodataFields.family || {},
        skillsAndInterests: biodataFields.skillsAndInterests || {},
        healthAndOther: biodataFields.healthAndOther || {},
        documents: biodataFields.documents || {},
        meta: {
          lastUpdatedByRole: 'student',
          isLockedByAdmin: false
        }
      });

      return res.status(201).json({
        status: 'success',
        data: { biodata },
        message: 'Biodata created successfully!'
      });
    }
  } catch (err) {
    console.error('Error upserting student biodata:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to save biodata',
      error: err.message
    });
  }
};
