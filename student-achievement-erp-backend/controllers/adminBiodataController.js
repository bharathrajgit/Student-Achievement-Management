// controllers/adminBiodataController.js
import Biodata from '../models/Biodata.js';
import { User } from '../models/User.js';

/**
 * Get student biodata by student ID
 * GET /api/admin/students/:studentId/biodata
 */
export const getStudentBiodata = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // ✅ Find student - NO tenantId check (coordinator can view any student)
    const user = await User.findById(studentId);
    if (!user || user.role !== 'student') {
      return res.status(404).json({ 
        status: 'error',
        message: 'Student not found' 
      });
    }

    // ✅ Check permissions: student can only view their own
    if (req.user.role === 'student' && req.user.userId.toString() !== studentId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied: insufficient permissions'
      });
    }

    // Fetch biodata linked to this user
    const biodata = await Biodata.findOne({ user: studentId });

    return res.status(200).json({
      status: 'success',
      data: {
        student: {
          _id: user._id,
          name: user.name,
          email: user.email,
          rollNumber: user.rollNumber,
          biodata: biodata || null
        }
      },
      message: biodata ? 'Biodata retrieved successfully' : 'Student found but no biodata yet'
    });
  } catch (err) {
    console.error('Error fetching biodata:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch biodata',
      error: err.message
    });
  }
};

/**
 * Update student biodata (create if doesn't exist)
 * PUT /api/admin/students/:studentId/biodata
 */
export const updateStudentBiodata = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const biodataFields = req.body;

    // ✅ Find student - NO tenantId check
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    // ✅ Check permissions: student can only update their own
    if (req.user.role === 'student' && req.user.userId.toString() !== studentId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied: insufficient permissions'
      });
    }

    // Find existing biodata or create new
    let biodata = await Biodata.findOne({ user: studentId });

    if (biodata) {
      // Update existing biodata - merge ALL fields
      if (biodataFields.personal) {
        biodata.personal = { ...biodata.personal, ...biodataFields.personal };
      }
      if (biodataFields.contact) {
        biodata.contact = { 
          ...biodata.contact, 
          ...biodataFields.contact,
          permanentAddress: {
            ...biodata.contact.permanentAddress,
            ...biodataFields.contact.permanentAddress
          },
          currentAddress: {
            ...biodata.contact.currentAddress,
            ...biodataFields.contact.currentAddress
          }
        };
      }
      if (biodataFields.family) {
        biodata.family = { 
          ...biodata.family, 
          ...biodataFields.family,
          father: { ...biodata.family.father, ...biodataFields.family.father },
          mother: { ...biodata.family.mother, ...biodataFields.family.mother },
          guardian: { ...biodata.family.guardian, ...biodataFields.family.guardian },
          emergencyContact: { ...biodata.family.emergencyContact, ...biodataFields.family.emergencyContact }
        };
      }
      if (biodataFields.academicIds) {
        biodata.academicIds = { ...biodata.academicIds, ...biodataFields.academicIds };
      }
      if (biodataFields.school) {
        biodata.school = { ...biodata.school, ...biodataFields.school };
      }
      if (biodataFields.ug) {
        biodata.ug = { ...biodata.ug, ...biodataFields.ug };
      }
      if (biodataFields.pg) {
        biodata.pg = { ...biodata.pg, ...biodataFields.pg };
      }
      if (biodataFields.healthAndOther) {
        biodata.healthAndOther = { ...biodata.healthAndOther, ...biodataFields.healthAndOther };
      }
      if (biodataFields.documents) {
        biodata.documents = { ...biodata.documents, ...biodataFields.documents };
      }
      if (biodataFields.skillsAndInterests) {
        biodata.skillsAndInterests = { ...biodata.skillsAndInterests, ...biodataFields.skillsAndInterests };
      }
      
      // Update meta info
      biodata.meta.lastUpdatedByRole = req.user?.role || 'admin';
      await biodata.save();
    } else {
      // Create new biodata with ALL required fields
      biodata = await Biodata.create({
        user: studentId,
        personal: {
          fullName: biodataFields.personal?.fullName || student.name || '',
          dob: biodataFields.personal?.dob || new Date(),
          gender: biodataFields.personal?.gender || 'Male',
          nationality: biodataFields.personal?.nationality || 'Indian',
          bloodGroup: biodataFields.personal?.bloodGroup || '',
          motherTongue: biodataFields.personal?.motherTongue || '',
          religion: biodataFields.personal?.religion || '',
          community: biodataFields.personal?.community || '',
          nativityState: biodataFields.personal?.nativityState || '',
          nativityDistrict: biodataFields.personal?.nativityDistrict || '',
          aadharNumber: biodataFields.personal?.aadharNumber || ''
        },
        contact: {
          mobile: biodataFields.contact?.mobile || '',
          altMobile: biodataFields.contact?.altMobile || '',
          email: biodataFields.contact?.email || student.email || '',
          permanentAddress: {
            line1: biodataFields.contact?.permanentAddress?.line1 || '',
            line2: biodataFields.contact?.permanentAddress?.line2 || '',
            city: biodataFields.contact?.permanentAddress?.city || '',
            district: biodataFields.contact?.permanentAddress?.district || '',
            state: biodataFields.contact?.permanentAddress?.state || '',
            pincode: biodataFields.contact?.permanentAddress?.pincode || ''
          },
          currentAddress: biodataFields.contact?.currentAddress || {
            line1: '',
            line2: '',
            city: '',
            district: '',
            state: '',
            pincode: '',
            isSameAsPermanent: false
          }
        },
        family: biodataFields.family || {
          father: { name: '', qualification: '', occupation: '', phone: '', email: '' },
          mother: { name: '', qualification: '', occupation: '', phone: '', email: '' },
          guardian: { name: '', relation: '', phone: '' },
          annualIncomeRange: '',
          emergencyContact: { name: '', relation: '', phone: '' }
        },
        academicIds: biodataFields.academicIds || {
          umisId: '',
          emisId: '',
          abcId: ''
        },
        school: biodataFields.school || {
          tenth: {
            board: '',
            schoolName: '',
            yearOfPassing: 2020,
            registerNo: '',
            percentageOrCgpa: '',
            medium: ''
          },
          twelfthOrDiploma: {
            typeOfCourse: '',
            boardOrUniversity: '',
            institutionName: '',
            yearOfPassing: 2022,
            registerNo: '',
            percentageOrCgpa: '',
            groupOrBranch: ''
          }
        },
        ug: biodataFields.ug || {
          course: '',
          branch: '',
          collegeName: '',
          universityName: '',
          yearOfJoining: 2020,
          yearOfPassing: null,
          numSemestersCompleted: 0,
          semesters: [],
          cumulativeCgpa: ''
        },
        pg: biodataFields.pg || {
          course: '',
          department: '',
          collegeName: '',
          universityName: '',
          registerNo: '',
          section: '',
          batch: '',
          currentSemester: 1,
          admissionType: '',
          quotaCategory: '',
          scholarship: {
            schemeName: '',
            scholarshipId: '',
            amount: 0
          }
        },
        skillsAndInterests: biodataFields.skillsAndInterests || {
          technicalSkills: [],
          softSkills: [],
          languagesKnown: [],
          activities: [],
          clubsAndPositions: []
        },
        healthAndOther: biodataFields.healthAndOther || {
          medicalConditions: '',
          disabilityInfo: '',
          bloodDonorWilling: false,
          residencyType: '',
          transportMode: '',
          vehicleNumber: ''
        },
        documents: biodataFields.documents || {
          identity: {
            profilePhotoLink: '',
            aadharLink: '',
            communityCertLink: '',
            nativityCertLink: '',
            incomeCertLink: '',
            disabilityCertLink: ''
          },
          school: {
            tenthMarksheet: '',
            eleventhMarksheet: '',
            twelfthMarksheet: ''
          },
          ug: {
            degreeCertLink: '',
            consolidatedMarksheetLink: '',
            tcLink: '',
            semesterMarksheets: []
          },
          pg: {
            admissionLetterLink: '',
            feesReceiptLink: '',
            idCardLink: '',
            consolidatedMarksheetLink: ''
          }
        },
        meta: {
          lastUpdatedByRole: req.user?.role || 'admin',
          isLockedByAdmin: false
        }
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { biodata },
      message: 'Biodata updated successfully'
    });
  } catch (err) {
    console.error('Error updating biodata:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update biodata',
      error: err.message
    });
  }
};

/**
 * Get student detail with biodata, achievements and stats
 * GET /api/admin/students/:studentId
 */
export const getStudentDetail = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // ✅ NO tenantId check - coordinator can view any student
    const student = await User.findById(studentId).select('-password');

    if (!student || student.role !== 'student') {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    // Get biodata if exists
    const biodata = await Biodata.findOne({ user: studentId });

    // Mock achievements and stats (replace with real queries later)
    const achievements = [];
    const stats = {
      total: 0,
      verified: 0,
      pending: 0,
      rejected: 0
    };

    return res.status(200).json({
      status: 'success',
      data: {
        student: {
          ...student.toObject(),
          biodata
        },
        achievements,
        stats
      },
      message: 'Student retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching student detail:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch student details',
      error: err.message
    });
  }
};

// Keep old function for backward compatibility
export const getStudentBiodataById = getStudentBiodata;
