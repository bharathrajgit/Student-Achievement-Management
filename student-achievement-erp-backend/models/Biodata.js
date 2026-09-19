// models/Biodata.js
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true }
}, { _id: false });

const languageSchema = new mongoose.Schema({
  language: { type: String, required: true },
  canRead: { type: Boolean, default: false },
  canWrite: { type: Boolean, default: false },
  canSpeak: { type: Boolean, default: false }
}, { _id: false });

const semesterMarkSchema = new mongoose.Schema({
  semNumber: { type: Number, required: true },
  cgpaOrPercentage: { type: String },
  resultStatus: { type: String, default: 'Passed' },
  marksheetLink: { type: String }
}, { _id: false });

const BiodataSchema = new mongoose.Schema({
  // one‑to‑one link to User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  personal: {
    fullName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    bloodGroup: { type: String },
    nationality: { type: String, required: true },
    motherTongue: { type: String },
    religion: { type: String },
    community: { type: String },
    nativityState: { type: String },
    nativityDistrict: { type: String },
    aadharNumber: { type: String }
  },

  contact: {
    mobile: { type: String, required: true },
    altMobile: { type: String },
    email: { type: String, required: true },
    permanentAddress: { type: addressSchema, required: true },
    currentAddress: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      district: { type: String },
      state: { type: String },
      pincode: { type: String },
      isSameAsPermanent: { type: Boolean, default: false }
    }
  },

  academicIds: {
    umisId: { type: String },
    emisId: { type: String },
    abcId: { type: String }
  },

  school: {
    tenth: {
      board: { type: String, required: true },
      schoolName: { type: String, required: true },
      yearOfPassing: { type: Number, required: true },
      registerNo: { type: String, required: true },
      percentageOrCgpa: { type: String, required: true },
      medium: { type: String }
    },
    twelfthOrDiploma: {
      typeOfCourse: { type: String },
      boardOrUniversity: { type: String },
      institutionName: { type: String },
      yearOfPassing: { type: Number },
      registerNo: { type: String },
      percentageOrCgpa: { type: String },
      groupOrBranch: { type: String }
    }
  },

  ug: {
    course: { type: String, required: true },
    branch: { type: String, required: true },
    collegeName: { type: String, required: true },
    universityName: { type: String, required: true },
    yearOfJoining: { type: Number, required: true },
    yearOfPassing: { type: Number },
    numSemestersCompleted: { type: Number, required: true },
    semesters: { type: [semesterMarkSchema], default: [] },
    cumulativeCgpa: { type: String }
  },

  pg: {
    course: { type: String, required: true },
    department: { type: String, required: true },
    collegeName: { type: String, required: true },
    universityName: { type: String, required: true },
    registerNo: { type: String, required: true },
    section: { type: String },
    batch: { type: String, required: true },
    currentSemester: { type: Number, required: true },
    admissionType: { type: String },
    quotaCategory: { type: String },
    scholarship: {
      schemeName: { type: String },
      scholarshipId: { type: String },
      amount: { type: Number }
    }
  },

  family: {
    father: {
      name: { type: String },
      qualification: { type: String },
      occupation: { type: String },
      phone: { type: String },
      email: { type: String }
    },
    mother: {
      name: { type: String },
      qualification: { type: String },
      occupation: { type: String },
      phone: { type: String },
      email: { type: String }
    },
    guardian: {
      name: { type: String },
      relation: { type: String },
      phone: { type: String }
    },
    annualIncomeRange: { type: String },
    emergencyContact: {
      name: { type: String },
      relation: { type: String },
      phone: { type: String }
    }
  },

  skillsAndInterests: {
    technicalSkills: { type: [String], default: [] },
    softSkills: { type: [String], default: [] },
    languagesKnown: { type: [languageSchema], default: [] },
    activities: { type: [String], default: [] },
    clubsAndPositions: { type: [String], default: [] }
  },

  documents: {
    identity: {
      profilePhotoLink: { type: String },
      aadharLink: { type: String },
      communityCertLink: { type: String },
      nativityCertLink: { type: String },
      incomeCertLink: { type: String },
      disabilityCertLink: { type: String }
    },
    school: {
      tenthMarksheet: { type: String },
      eleventhMarksheet: { type: String },
      twelfthMarksheet: { type: String }
    },
    ug: {
      degreeCertLink: { type: String },
      consolidatedMarksheetLink: { type: String },
      tcLink: { type: String },
      semesterMarksheets: {
        type: [
          new mongoose.Schema({
            semNumber: { type: Number, required: true },
            cgpaOrPercentage: { type: String },
            marksheetLink: { type: String }
          }, { _id: false })
        ],
        default: []
      }
    },
    pg: {
      admissionLetterLink: { type: String },
      feesReceiptLink: { type: String },
      idCardLink: { type: String },
      consolidatedMarksheetLink: { type: String }
    }
  },

  healthAndOther: {
    medicalConditions: { type: String },
    disabilityInfo: { type: String },
    bloodDonorWilling: { type: Boolean, default: false },
    residencyType: { type: String },
    transportMode: { type: String },
    vehicleNumber: { type: String }
  },

  meta: {
    lastUpdatedByRole: { type: String, default: 'student' },
    isLockedByAdmin: { type: Boolean, default: false }
  }
}, { timestamps: true });

const Biodata = mongoose.model('Biodata', BiodataSchema);
export default Biodata;
