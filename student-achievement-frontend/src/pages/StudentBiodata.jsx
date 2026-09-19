import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../services/api';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { AppToast } from '../components/AppToast';

const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  background: #1a202c;
`;

const Main = styled.main`
  flex: 1;
  margin-left: 280px;
  margin-top: 80px;
  padding: 24px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);

  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 70px;
    padding: 16px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px 20px 28px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  border: 1px solid #e2e8f0;
  max-width: 1100px;
  margin: 0 auto 24px;

  @media (max-width: 768px) {
    padding: 16px 14px 22px;
    border-radius: 14px;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 480px) {
    flex-wrap: wrap;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const Pill = styled.span`
  font-size: 12px;
  border-radius: 999px;
  padding: 4px 10px;
  background: #ebf4ff;
  color: #434190;
  font-weight: 600;
`;

const Section = styled.section`
  margin-bottom: 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const SectionBadge = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background: #ebf8ff;
  color: #2b6cb0;
  font-weight: 700;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const Input = styled.input`
  padding: 9px 11px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  background: #f7fafc;
  outline: none;
  transition: all 0.15s ease;
  font-family: inherit;

  &::placeholder {
    color: #a0aec0;
  }

  &:focus {
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.18);
  }
`;

const Select = styled.select`
  padding: 9px 11px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  background: #f7fafc;
  outline: none;
  transition: all 0.15s ease;
  font-family: inherit;
  cursor: pointer;

  &:focus {
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.18);
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 13px;
  color: #2d3748;
`;

const SmallCheckbox = styled.input`
  width: 14px;
  height: 14px;
  cursor: pointer;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
`;

const PrimaryButton = styled.button`
  padding: 9px 16px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.18s ease;

  &:hover {
    transform: translateY(-0.5px);
    box-shadow: 0 6px 14px rgba(102, 126, 234, 0.35);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

const ErrorMsg = styled.div`
  color: #c53030;
  background: #fff5f5;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 12px;
  border-left: 4px solid #c53030;
  font-size: 13px;
`;

const SuccessMsg = styled.div`
  color: #15803d;
  background: #f0fdf4;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 12px;
  border-left: 4px solid #15803d;
  font-size: 13px;
`;

const Loading = styled.div`
  padding: 40px;
  text-align: center;
  color: #718096;
  font-size: 14px;
`;

const Hint = styled.p`
  margin: 4px 0 0;
  font-size: 11px;
  color: #718096;
`;

const initialForm = {
  personal: {
    fullName: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    nationality: '',
    motherTongue: '',
    religion: '',
    community: '',
    nativityState: '',
    nativityDistrict: '',
    aadharNumber: '',
  },
  contact: {
    mobile: '',
    altMobile: '',
    email: '',
    permanentAddress: {
      line1: '',
      line2: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
    },
    currentAddress: {
      line1: '',
      line2: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      isSameAsPermanent: false,
    },
  },
  academicIds: {
    umisId: '',
    emisId: '',
    abcId: '',
  },
  school: {
    tenth: {
      board: '',
      schoolName: '',
      yearOfPassing: '',
      registerNo: '',
      percentageOrCgpa: '',
      medium: '',
    },
    twelfthOrDiploma: {
      typeOfCourse: '',
      boardOrUniversity: '',
      institutionName: '',
      yearOfPassing: '',
      registerNo: '',
      percentageOrCgpa: '',
      groupOrBranch: '',
    },
  },
  ug: {
    course: '',
    branch: '',
    collegeName: '',
    universityName: '',
    yearOfJoining: '',
    yearOfPassing: '',
    numSemestersCompleted: '',
    cumulativeCgpa: '',
  },
  pg: {
    course: '',
    department: '',
    collegeName: '',
    universityName: '',
    registerNo: '',
    section: '',
    batch: '',
    currentSemester: '',
    admissionType: '',
    quotaCategory: '',
    scholarship: {
      schemeName: '',
      scholarshipId: '',
      amount: '',
    },
  },
  family: {
    father: {
      name: '',
      qualification: '',
      occupation: '',
      phone: '',
      email: '',
    },
    mother: {
      name: '',
      qualification: '',
      occupation: '',
      phone: '',
      email: '',
    },
    guardian: {
      name: '',
      relation: '',
      phone: '',
    },
    annualIncomeRange: '',
    emergencyContact: {
      name: '',
      relation: '',
      phone: '',
    },
  },
  healthAndOther: {
    medicalConditions: '',
    disabilityInfo: '',
    bloodDonorWilling: false,
    residencyType: '',
    transportMode: '',
    vehicleNumber: '',
  },
  documents: {
    identity: {
      profilePhotoLink: '',
      aadharLink: '',
      communityCertLink: '',
      nativityCertLink: '',
      incomeCertLink: '',
      disabilityCertLink: '',
    },
    school: {
      tenthMarksheet: '',
      eleventhMarksheet: '',
      twelfthMarksheet: '',
    },
    ug: {
      degreeCertLink: '',
      consolidatedMarksheetLink: '',
      tcLink: '',
    },
    pg: {
      admissionLetterLink: '',
      feesReceiptLink: '',
      idCardLink: '',
      consolidatedMarksheetLink: '',
    },
  },
};

export default function StudentBiodata() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    message: '',
  });
  const [form, setForm] = useState(initialForm);

  // ✅ FIX: Load biodata on component mount
  useEffect(() => {
    loadBiodata();
  }, []);

const loadBiodata = async () => {
  try {
    setLoading(true);
    setError('');

    const res = await api.get('/student/biodata');
    console.log('🔍 STEP 1 - Full Response:', res.data);

    // ✅ CORRECT PATH: res.data.data.biodata
    const biodataFromAPI = res.data?.data?.biodata;
    console.log('🔍 STEP 2 - Extracted Biodata:', biodataFromAPI);

    if (biodataFromAPI) {
      console.log('🔍 STEP 3 - Full Name from API:', biodataFromAPI.personal?.fullName);
      console.log('🔍 STEP 4 - DOB from API:', biodataFromAPI.personal?.dob);
      
      const newForm = {
        personal: {
          fullName: biodataFromAPI.personal?.fullName || '',
          dob: biodataFromAPI.personal?.dob 
            ? biodataFromAPI.personal.dob.split('T')[0] 
            : '',
          gender: biodataFromAPI.personal?.gender || '',
          bloodGroup: biodataFromAPI.personal?.bloodGroup || '',
          nationality: biodataFromAPI.personal?.nationality || '',
          motherTongue: biodataFromAPI.personal?.motherTongue || '',
          religion: biodataFromAPI.personal?.religion || '',
          community: biodataFromAPI.personal?.community || '',
          nativityState: biodataFromAPI.personal?.nativityState || '',
          nativityDistrict: biodataFromAPI.personal?.nativityDistrict || '',
          aadharNumber: biodataFromAPI.personal?.aadharNumber || '',
        },
        contact: {
          mobile: biodataFromAPI.contact?.mobile || '',
          altMobile: biodataFromAPI.contact?.altMobile || '',
          email: biodataFromAPI.contact?.email || '',
          permanentAddress: {
            line1: biodataFromAPI.contact?.permanentAddress?.line1 || '',
            line2: biodataFromAPI.contact?.permanentAddress?.line2 || '',
            city: biodataFromAPI.contact?.permanentAddress?.city || '',
            district: biodataFromAPI.contact?.permanentAddress?.district || '',
            state: biodataFromAPI.contact?.permanentAddress?.state || '',
            pincode: biodataFromAPI.contact?.permanentAddress?.pincode || '',
          },
          currentAddress: {
            line1: biodataFromAPI.contact?.currentAddress?.line1 || '',
            line2: biodataFromAPI.contact?.currentAddress?.line2 || '',
            city: biodataFromAPI.contact?.currentAddress?.city || '',
            district: biodataFromAPI.contact?.currentAddress?.district || '',
            state: biodataFromAPI.contact?.currentAddress?.state || '',
            pincode: biodataFromAPI.contact?.currentAddress?.pincode || '',
            isSameAsPermanent: biodataFromAPI.contact?.currentAddress?.isSameAsPermanent || false,
          },
        },
        academicIds: {
          umisId: biodataFromAPI.academicIds?.umisId || '',
          emisId: biodataFromAPI.academicIds?.emisId || '',
          abcId: biodataFromAPI.academicIds?.abcId || '',
        },
        school: {
          tenth: {
            board: biodataFromAPI.school?.tenth?.board || '',
            schoolName: biodataFromAPI.school?.tenth?.schoolName || '',
            yearOfPassing: biodataFromAPI.school?.tenth?.yearOfPassing || '',
            registerNo: biodataFromAPI.school?.tenth?.registerNo || '',
            percentageOrCgpa: biodataFromAPI.school?.tenth?.percentageOrCgpa || '',
            medium: biodataFromAPI.school?.tenth?.medium || '',
          },
          twelfthOrDiploma: {
            typeOfCourse: biodataFromAPI.school?.twelfthOrDiploma?.typeOfCourse || '',
            boardOrUniversity: biodataFromAPI.school?.twelfthOrDiploma?.boardOrUniversity || '',
            institutionName: biodataFromAPI.school?.twelfthOrDiploma?.institutionName || '',
            yearOfPassing: biodataFromAPI.school?.twelfthOrDiploma?.yearOfPassing || '',
            registerNo: biodataFromAPI.school?.twelfthOrDiploma?.registerNo || '',
            percentageOrCgpa: biodataFromAPI.school?.twelfthOrDiploma?.percentageOrCgpa || '',
            groupOrBranch: biodataFromAPI.school?.twelfthOrDiploma?.groupOrBranch || '',
          },
        },
        ug: {
          course: biodataFromAPI.ug?.course || '',
          branch: biodataFromAPI.ug?.branch || '',
          collegeName: biodataFromAPI.ug?.collegeName || '',
          universityName: biodataFromAPI.ug?.universityName || '',
          yearOfJoining: biodataFromAPI.ug?.yearOfJoining || '',
          yearOfPassing: biodataFromAPI.ug?.yearOfPassing || '',
          numSemestersCompleted: biodataFromAPI.ug?.numSemestersCompleted || '',
          cumulativeCgpa: biodataFromAPI.ug?.cumulativeCgpa || '',
        },
        pg: {
          course: biodataFromAPI.pg?.course || '',
          department: biodataFromAPI.pg?.department || '',
          collegeName: biodataFromAPI.pg?.collegeName || '',
          universityName: biodataFromAPI.pg?.universityName || '',
          registerNo: biodataFromAPI.pg?.registerNo || '',
          section: biodataFromAPI.pg?.section || '',
          batch: biodataFromAPI.pg?.batch || '',
          currentSemester: biodataFromAPI.pg?.currentSemester || '',
          admissionType: biodataFromAPI.pg?.admissionType || '',
          quotaCategory: biodataFromAPI.pg?.quotaCategory || '',
          scholarship: {
            schemeName: biodataFromAPI.pg?.scholarship?.schemeName || '',
            scholarshipId: biodataFromAPI.pg?.scholarship?.scholarshipId || '',
            amount: biodataFromAPI.pg?.scholarship?.amount || '',
          },
        },
        family: {
          father: {
            name: biodataFromAPI.family?.father?.name || '',
            qualification: biodataFromAPI.family?.father?.qualification || '',
            occupation: biodataFromAPI.family?.father?.occupation || '',
            phone: biodataFromAPI.family?.father?.phone || '',
            email: biodataFromAPI.family?.father?.email || '',
          },
          mother: {
            name: biodataFromAPI.family?.mother?.name || '',
            qualification: biodataFromAPI.family?.mother?.qualification || '',
            occupation: biodataFromAPI.family?.mother?.occupation || '',
            phone: biodataFromAPI.family?.mother?.phone || '',
            email: biodataFromAPI.family?.mother?.email || '',
          },
          guardian: {
            name: biodataFromAPI.family?.guardian?.name || '',
            relation: biodataFromAPI.family?.guardian?.relation || '',
            phone: biodataFromAPI.family?.guardian?.phone || '',
          },
          annualIncomeRange: biodataFromAPI.family?.annualIncomeRange || '',
          emergencyContact: {
            name: biodataFromAPI.family?.emergencyContact?.name || '',
            relation: biodataFromAPI.family?.emergencyContact?.relation || '',
            phone: biodataFromAPI.family?.emergencyContact?.phone || '',
          },
        },
        healthAndOther: {
          medicalConditions: biodataFromAPI.healthAndOther?.medicalConditions || '',
          disabilityInfo: biodataFromAPI.healthAndOther?.disabilityInfo || '',
          bloodDonorWilling: biodataFromAPI.healthAndOther?.bloodDonorWilling || false,
          residencyType: biodataFromAPI.healthAndOther?.residencyType || '',
          transportMode: biodataFromAPI.healthAndOther?.transportMode || '',
          vehicleNumber: biodataFromAPI.healthAndOther?.vehicleNumber || '',
        },
        documents: {
          identity: {
            profilePhotoLink: biodataFromAPI.documents?.identity?.profilePhotoLink || '',
            aadharLink: biodataFromAPI.documents?.identity?.aadharLink || '',
            communityCertLink: biodataFromAPI.documents?.identity?.communityCertLink || '',
            nativityCertLink: biodataFromAPI.documents?.identity?.nativityCertLink || '',
            incomeCertLink: biodataFromAPI.documents?.identity?.incomeCertLink || '',
            disabilityCertLink: biodataFromAPI.documents?.identity?.disabilityCertLink || '',
          },
          school: {
            tenthMarksheet: biodataFromAPI.documents?.school?.tenthMarksheet || '',
            eleventhMarksheet: biodataFromAPI.documents?.school?.eleventhMarksheet || '',
            twelfthMarksheet: biodataFromAPI.documents?.school?.twelfthMarksheet || '',
          },
          ug: {
            degreeCertLink: biodataFromAPI.documents?.ug?.degreeCertLink || '',
            consolidatedMarksheetLink: biodataFromAPI.documents?.ug?.consolidatedMarksheetLink || '',
            tcLink: biodataFromAPI.documents?.ug?.tcLink || '',
          },
          pg: {
            admissionLetterLink: biodataFromAPI.documents?.pg?.admissionLetterLink || '',
            feesReceiptLink: biodataFromAPI.documents?.pg?.feesReceiptLink || '',
            idCardLink: biodataFromAPI.documents?.pg?.idCardLink || '',
            consolidatedMarksheetLink: biodataFromAPI.documents?.pg?.consolidatedMarksheetLink || '',
          },
        },
      };

      console.log('✅ Setting Form With:', newForm);
      setForm(newForm);
      console.log('🔍 STEP 5 - New Form Value:', newForm);
    } else {
      console.log('⚠️ No biodata found, using initial form');
      setForm(initialForm);
    }
  } catch (err) {
    console.error('❌ Error:', err);
    setError(err.response?.data?.message || 'Failed to load biodata');
  } finally {
    setLoading(false);
  }
};


  const updateByPath = (path, value) => {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSameAsPermanent = (checked) => {
    if (checked) {
      setForm((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          currentAddress: {
            ...prev.contact.permanentAddress,
            isSameAsPermanent: true,
          },
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          currentAddress: {
            line1: '',
            line2: '',
            city: '',
            district: '',
            state: '',
            pincode: '',
            isSameAsPermanent: false,
          },
        },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // ✅ Save to student's own biodata
      const res = await api.post('/student/biodata', form);
      const msg = res.data?.message || 'Biodata saved successfully!';

      setSuccess(msg);
      setToast({ show: true, type: 'success', message: msg });

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving biodata:', err);
      const errMsg = err.response?.data?.message || 'Failed to save biodata';
      setError(errMsg);
      setToast({ show: true, type: 'danger', message: errMsg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <Loading>Loading your biodata...</Loading>
        </Main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Sidebar />
      <Header />
      <Main>
        <Card>
          <TitleRow>
            <Title>My Biodata</Title>
            <Pill>Student Self-Service</Pill>
          </TitleRow>

          {error && <ErrorMsg>{error}</ErrorMsg>}
          {success && <SuccessMsg>{success}</SuccessMsg>}

          <form onSubmit={handleSubmit}>
            {/* PERSONAL INFORMATION */}
            <Section>
              <SectionHeader>
                <SectionBadge>1</SectionBadge>
                <SectionTitle>Personal Information</SectionTitle>
              </SectionHeader>
              <Row>
                <Field>
                  <Label>Full Name *</Label>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={form.personal.fullName}
                    onChange={(e) =>
                      updateByPath('personal.fullName', e.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>Date of Birth *</Label>
                  <Input
                    type="date"
                    placeholder="Select date"
                    value={form.personal.dob}
                    onChange={(e) => updateByPath('personal.dob', e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Label>Gender *</Label>
                  <Select
                    value={form.personal.gender}
                    onChange={(e) =>
                      updateByPath('personal.gender', e.target.value)
                    }
                    required
                  >
                    <option value="">-- Select Gender --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                </Field>
                <Field>
                  <Label>Blood Group</Label>
                  <Select
                    value={form.personal.bloodGroup}
                    onChange={(e) =>
                      updateByPath('personal.bloodGroup', e.target.value)
                    }
                  >
                    <option value="">-- Select Blood Group --</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                      (bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      )
                    )}
                  </Select>
                </Field>
                <Field>
                  <Label>Nationality *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Indian"
                    value={form.personal.nationality}
                    onChange={(e) =>
                      updateByPath('personal.nationality', e.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>Mother Tongue</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Tamil, Hindi, English"
                    value={form.personal.motherTongue}
                    onChange={(e) =>
                      updateByPath('personal.motherTongue', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Religion</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Hindu, Muslim, Christian"
                    value={form.personal.religion}
                    onChange={(e) =>
                      updateByPath('personal.religion', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Community</Label>
                  <Input
                    type="text"
                    placeholder="e.g., OBC, SC, ST, General"
                    value={form.personal.community}
                    onChange={(e) =>
                      updateByPath('personal.community', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Nativity State</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Tamil Nadu"
                    value={form.personal.nativityState}
                    onChange={(e) =>
                      updateByPath('personal.nativityState', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Nativity District</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Coimbatore"
                    value={form.personal.nativityDistrict}
                    onChange={(e) =>
                      updateByPath('personal.nativityDistrict', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Aadhaar Number</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 1234 5678 9012"
                    value={form.personal.aadharNumber}
                    onChange={(e) =>
                      updateByPath('personal.aadharNumber', e.target.value)
                    }
                  />
                </Field>
              </Row>
            </Section>

            {/* CONTACT INFORMATION */}
            <Section>
              <SectionHeader>
                <SectionBadge>2</SectionBadge>
                <SectionTitle>Contact Information</SectionTitle>
              </SectionHeader>
              <Row>
                <Field>
                  <Label>Mobile *</Label>
                  <Input
                    type="tel"
                    placeholder="e.g., +91 98765 43210"
                    value={form.contact.mobile}
                    onChange={(e) =>
                      updateByPath('contact.mobile', e.target.value)
                    }
                    required
                  />
                  <Hint>Enter WhatsApp-enabled number</Hint>
                </Field>
                <Field>
                  <Label>Alternate Mobile</Label>
                  <Input
                    type="tel"
                    placeholder="e.g., +91 98765 43210 (optional)"
                    value={form.contact.altMobile}
                    onChange={(e) =>
                      updateByPath('contact.altMobile', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="e.g., name@example.com"
                    value={form.contact.email}
                    onChange={(e) =>
                      updateByPath('contact.email', e.target.value)
                    }
                    required
                  />
                </Field>
              </Row>

              {/* Permanent Address */}
              <SectionHeader style={{ marginTop: 16 }}>
                <SectionBadge>2A</SectionBadge>
                <SectionTitle>Permanent Address</SectionTitle>
              </SectionHeader>
              <Row>
                <Field>
                  <Label>Address Line 1 *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 123 Main Street, Building A"
                    value={form.contact.permanentAddress.line1}
                    onChange={(e) =>
                      updateByPath(
                        'contact.permanentAddress.line1',
                        e.target.value
                      )
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>Address Line 2</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Apartment 5, Floor 2 (optional)"
                    value={form.contact.permanentAddress.line2}
                    onChange={(e) =>
                      updateByPath(
                        'contact.permanentAddress.line2',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>City *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Coimbatore"
                    value={form.contact.permanentAddress.city}
                    onChange={(e) =>
                      updateByPath(
                        'contact.permanentAddress.city',
                        e.target.value
                      )
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>District *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Coimbatore"
                    value={form.contact.permanentAddress.district}
                    onChange={(e) =>
                      updateByPath(
                        'contact.permanentAddress.district',
                        e.target.value
                      )
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>State *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Tamil Nadu"
                    value={form.contact.permanentAddress.state}
                    onChange={(e) =>
                      updateByPath(
                        'contact.permanentAddress.state',
                        e.target.value
                      )
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>Pincode *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 641001"
                    value={form.contact.permanentAddress.pincode}
                    onChange={(e) =>
                      updateByPath(
                        'contact.permanentAddress.pincode',
                        e.target.value
                      )
                    }
                    required
                  />
                </Field>
              </Row>

              <CheckboxRow>
                <SmallCheckbox
                  type="checkbox"
                  checked={form.contact.currentAddress.isSameAsPermanent}
                  onChange={(e) =>
                    handleSameAsPermanent(e.target.checked)
                  }
                />
                <span>Current address same as permanent</span>
              </CheckboxRow>

              {!form.contact.currentAddress.isSameAsPermanent && (
                <>
                  <SectionHeader style={{ marginTop: 14 }}>
                    <SectionBadge>2B</SectionBadge>
                    <SectionTitle>Current Address</SectionTitle>
                  </SectionHeader>
                  <Row>
                    <Field>
                      <Label>Address Line 1</Label>
                      <Input
                        type="text"
                        placeholder="e.g., 456 College Street"
                        value={form.contact.currentAddress.line1}
                        onChange={(e) =>
                          updateByPath(
                            'contact.currentAddress.line1',
                            e.target.value
                          )
                        }
                      />
                    </Field>
                    <Field>
                      <Label>Address Line 2</Label>
                      <Input
                        type="text"
                        placeholder="e.g., Hostel Block C (optional)"
                        value={form.contact.currentAddress.line2}
                        onChange={(e) =>
                          updateByPath(
                            'contact.currentAddress.line2',
                            e.target.value
                          )
                        }
                      />
                    </Field>
                    <Field>
                      <Label>City</Label>
                      <Input
                        type="text"
                        placeholder="e.g., Coimbatore"
                        value={form.contact.currentAddress.city}
                        onChange={(e) =>
                          updateByPath(
                            'contact.currentAddress.city',
                            e.target.value
                          )
                        }
                      />
                    </Field>
                    <Field>
                      <Label>District</Label>
                      <Input
                        type="text"
                        placeholder="e.g., Coimbatore"
                        value={form.contact.currentAddress.district}
                        onChange={(e) =>
                          updateByPath(
                            'contact.currentAddress.district',
                            e.target.value
                          )
                        }
                      />
                    </Field>
                    <Field>
                      <Label>State</Label>
                      <Input
                        type="text"
                        placeholder="e.g., Tamil Nadu"
                        value={form.contact.currentAddress.state}
                        onChange={(e) =>
                          updateByPath(
                            'contact.currentAddress.state',
                            e.target.value
                          )
                        }
                      />
                    </Field>
                    <Field>
                      <Label>Pincode</Label>
                      <Input
                        type="text"
                        placeholder="e.g., 641004"
                        value={form.contact.currentAddress.pincode}
                        onChange={(e) =>
                          updateByPath(
                            'contact.currentAddress.pincode',
                            e.target.value
                          )
                        }
                      />
                    </Field>
                  </Row>
                </>
              )}
            </Section>

            {/* ACADEMIC IDS */}
            <Section>
              <SectionHeader>
                <SectionBadge>3</SectionBadge>
                <SectionTitle>Academic IDs</SectionTitle>
              </SectionHeader>
              <Row>
                <Field>
                  <Label>UMIS ID</Label>
                  <Input
                    type="text"
                    placeholder="e.g., UMIS2024001"
                    value={form.academicIds.umisId}
                    onChange={(e) =>
                      updateByPath('academicIds.umisId', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>EMIS ID</Label>
                  <Input
                    type="text"
                    placeholder="e.g., EMIS2024001"
                    value={form.academicIds.emisId}
                    onChange={(e) =>
                      updateByPath('academicIds.emisId', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>ABC APPAR ID</Label>
                  <Input
                    type="text"
                    placeholder="e.g., ABC2024001"
                    value={form.academicIds.abcId}
                    onChange={(e) =>
                      updateByPath('academicIds.abcId', e.target.value)
                    }
                  />
                </Field>
              </Row>
            </Section>

            {/* 10th STANDARD */}
            <Section>
              <SectionHeader>
                <SectionBadge>4</SectionBadge>
                <SectionTitle>10th Standard</SectionTitle>
              </SectionHeader>
              <Row>
                <Field>
                  <Label>Board *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., CBSE, ICSE, State Board"
                    value={form.school.tenth.board}
                    onChange={(e) =>
                      updateByPath('school.tenth.board', e.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>School Name *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., St. Mary's School"
                    value={form.school.tenth.schoolName}
                    onChange={(e) =>
                      updateByPath('school.tenth.schoolName', e.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>Year of Passing *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 2018"
                    value={form.school.tenth.yearOfPassing}
                    onChange={(e) =>
                      updateByPath('school.tenth.yearOfPassing', e.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>Register Number *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 1234567"
                    value={form.school.tenth.registerNo}
                    onChange={(e) =>
                      updateByPath('school.tenth.registerNo', e.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>Percentage / CGPA *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 85.5 or 8.5"
                    value={form.school.tenth.percentageOrCgpa}
                    onChange={(e) =>
                      updateByPath(
                        'school.tenth.percentageOrCgpa',
                        e.target.value
                      )
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>Medium</Label>
                  <Input
                    type="text"
                    placeholder="e.g., English, Tamil"
                    value={form.school.tenth.medium}
                    onChange={(e) =>
                      updateByPath('school.tenth.medium', e.target.value)
                    }
                  />
                </Field>
              </Row>
            </Section>

            {/* 12th / DIPLOMA */}
            <Section>
              <SectionHeader>
                <SectionBadge>5</SectionBadge>
                <SectionTitle>12th / Diploma</SectionTitle>
              </SectionHeader>
              <Row>
                <Field>
                  <Label>Type of Course</Label>
                  <Select
                    value={form.school.twelfthOrDiploma.typeOfCourse}
                    onChange={(e) =>
                      updateByPath(
                        'school.twelfthOrDiploma.typeOfCourse',
                        e.target.value
                      )
                    }
                  >
                    <option value="">-- Select --</option>
                    <option value="HSC">HSC (12th)</option>
                    <option value="Diploma">Diploma</option>
                    <option value="None">None</option>
                  </Select>
                </Field>
                <Field>
                  <Label>Board / University</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Maharashtra Board, AICTE"
                    value={form.school.twelfthOrDiploma.boardOrUniversity}
                    onChange={(e) =>
                      updateByPath(
                        'school.twelfthOrDiploma.boardOrUniversity',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>Institution Name</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Government College of Engineering"
                    value={form.school.twelfthOrDiploma.institutionName}
                    onChange={(e) =>
                      updateByPath(
                        'school.twelfthOrDiploma.institutionName',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>Year of Passing</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 2020"
                    value={form.school.twelfthOrDiploma.yearOfPassing}
                    onChange={(e) =>
                      updateByPath(
                        'school.twelfthOrDiploma.yearOfPassing',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>Register Number</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 9876543"
                    value={form.school.twelfthOrDiploma.registerNo}
                    onChange={(e) =>
                      updateByPath(
                        'school.twelfthOrDiploma.registerNo',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>Percentage / CGPA</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 82.0 or 8.2"
                    value={form.school.twelfthOrDiploma.percentageOrCgpa}
                    onChange={(e) =>
                      updateByPath(
                        'school.twelfthOrDiploma.percentageOrCgpa',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>Group / Branch</Label>
                  <Input
                    type="text"
                    placeholder="e.g., PCM, PCBI, Mechanical"
                    value={form.school.twelfthOrDiploma.groupOrBranch}
                    onChange={(e) =>
                      updateByPath(
                        'school.twelfthOrDiploma.groupOrBranch',
                        e.target.value
                      )
                    }
                  />
                </Field>
              </Row>
            </Section>

            {/* UG DETAILS */}
            <Section>
              <SectionHeader>
                <SectionBadge>6</SectionBadge>
                <SectionTitle>UG Details (Bachelor)</SectionTitle>
              </SectionHeader>
              <Row>
                <Field>
                  <Label>Course *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., BCA"
                    value={form.ug.course}
                    onChange={(e) => updateByPath('ug.course', e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Label>Branch *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Computer Application, Science"
                    value={form.ug.branch}
                    onChange={(e) => updateByPath('ug.branch', e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Label>College Name *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Rathinam Technical Campus"
                    value={form.ug.collegeName}
                    onChange={(e) =>
                      updateByPath('ug.collegeName', e.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>University Name *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Anna University"
                    value={form.ug.universityName}
                    onChange={(e) =>
                      updateByPath('ug.universityName', e.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>Year of Joining *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 2020"
                    value={form.ug.yearOfJoining}
                    onChange={(e) =>
                      updateByPath('ug.yearOfJoining', e.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>Year of Passing</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 2024"
                    value={form.ug.yearOfPassing}
                    onChange={(e) =>
                      updateByPath('ug.yearOfPassing', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Semesters Completed *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 8"
                    value={form.ug.numSemestersCompleted}
                    onChange={(e) =>
                      updateByPath('ug.numSemestersCompleted', e.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>Cumulative CGPA</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 8.45"
                    value={form.ug.cumulativeCgpa}
                    onChange={(e) =>
                      updateByPath('ug.cumulativeCgpa', e.target.value)
                    }
                  />
                </Field>
              </Row>
            </Section>

            {/* PG DETAILS */}
            <Section>
              <SectionHeader>
                <SectionBadge>7</SectionBadge>
                <SectionTitle>PG Details (Master)</SectionTitle>
              </SectionHeader>
              <Row>
                <Field>
                  <Label>Course *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., MCA"
                    value={form.pg.course}
                    onChange={(e) => updateByPath('pg.course', e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Label>Department *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Computer Application"
                    value={form.pg.department}
                    onChange={(e) =>
                      updateByPath('pg.department', e.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>College Name *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Rathinam Technical Campus"
                    value={form.pg.collegeName}
                    onChange={(e) =>
                      updateByPath('pg.collegeName', e.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>University Name *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Anna University, Bharathiar University"
                    value={form.pg.universityName}
                    onChange={(e) =>
                      updateByPath('pg.universityName', e.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>Roll Number *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 25205012"
                    value={form.pg.registerNo}
                    onChange={(e) =>
                      updateByPath('pg.registerNo', e.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>Section</Label>
                  <Input
                    type="text"
                    placeholder="e.g., A, B"
                    value={form.pg.section}
                    onChange={(e) => updateByPath('pg.section', e.target.value)}
                  />
                </Field>
                <Field>
                  <Label>Batch *</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 2024-2026"
                    value={form.pg.batch}
                    onChange={(e) => updateByPath('pg.batch', e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Label>Current Semester *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1, 2, 3, 4"
                    value={form.pg.currentSemester}
                    onChange={(e) =>
                      updateByPath('pg.currentSemester', e.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <Label>Admission Type</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Direct Entry, GATE, Management"
                    value={form.pg.admissionType}
                    onChange={(e) =>
                      updateByPath('pg.admissionType', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Quota Category</Label>
                  <Input
                    type="text"
                    placeholder="e.g., OBC, SC, ST, General, EWS"
                    value={form.pg.quotaCategory}
                    onChange={(e) =>
                      updateByPath('pg.quotaCategory', e.target.value)
                    }
                  />
                </Field>
              </Row>

              {/* Scholarship */}
              <SectionHeader style={{ marginTop: 14 }}>
                <SectionBadge>7A</SectionBadge>
                <SectionTitle>Scholarship Details</SectionTitle>
              </SectionHeader>
              <Row>
                <Field>
                  <Label>Scheme Name</Label>
                  <Input
                    type="text"
                    placeholder="e.g., INSPIRE, PRIME"
                    value={form.pg.scholarship.schemeName}
                    onChange={(e) =>
                      updateByPath('pg.scholarship.schemeName', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Scholarship ID</Label>
                  <Input
                    type="text"
                    placeholder="e.g., INSP2024001"
                    value={form.pg.scholarship.scholarshipId}
                    onChange={(e) =>
                      updateByPath(
                        'pg.scholarship.scholarshipId',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 15000"
                    value={form.pg.scholarship.amount}
                    onChange={(e) =>
                      updateByPath('pg.scholarship.amount', e.target.value)
                    }
                  />
                </Field>
              </Row>
            </Section>

            {/* FAMILY INFORMATION */}
            <Section>
              <SectionHeader>
                <SectionBadge>8</SectionBadge>
                <SectionTitle>Family Information</SectionTitle>
              </SectionHeader>

              <SectionHeader style={{ marginTop: 12 }}>
                <SectionTitle style={{ fontSize: '14px' }}>Father</SectionTitle>
              </SectionHeader>
              <Row>
                <Field>
                  <Label>Father's Name</Label>
                  <Input
                    type="text"
                    value={form.family.father.name}
                    onChange={(e) =>
                      updateByPath('family.father.name', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Qualification</Label>
                  <Input
                    type="text"
                    value={form.family.father.qualification}
                    onChange={(e) =>
                      updateByPath('family.father.qualification', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Occupation</Label>
                  <Input
                    type="text"
                    value={form.family.father.occupation}
                    onChange={(e) =>
                      updateByPath('family.father.occupation', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    placeholder="e.g., +91 98765 43210"
                    value={form.family.father.phone}
                    onChange={(e) =>
                      updateByPath('family.father.phone', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.family.father.email}
                    onChange={(e) =>
                      updateByPath('family.father.email', e.target.value)
                    }
                  />
                </Field>
              </Row>

              <SectionHeader style={{ marginTop: 12 }}>
                <SectionTitle style={{ fontSize: '14px' }}>Mother</SectionTitle>
              </SectionHeader>
              <Row>
                <Field>
                  <Label>Mother's Name</Label>
                  <Input
                    type="text"
                    value={form.family.mother.name}
                    onChange={(e) =>
                      updateByPath('family.mother.name', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Qualification</Label>
                  <Input
                    type="text"
                    value={form.family.mother.qualification}
                    onChange={(e) =>
                      updateByPath('family.mother.qualification', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Occupation</Label>
                  <Input
                    type="text"
                    value={form.family.mother.occupation}
                    onChange={(e) =>
                      updateByPath('family.mother.occupation', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    placeholder="e.g., +91 98765 43210"
                    value={form.family.mother.phone}
                    onChange={(e) =>
                      updateByPath('family.mother.phone', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.family.mother.email}
                    onChange={(e) =>
                      updateByPath('family.mother.email', e.target.value)
                    }
                  />
                </Field>
              </Row>

              <Row style={{ marginTop: 10 }}>
                <Field>
                  <Label>Annual Income Range</Label>
                  <Input
                    type="text"
                    value={form.family.annualIncomeRange}
                    onChange={(e) =>
                      updateByPath('family.annualIncomeRange', e.target.value)
                    }
                  />
                </Field>
              </Row>

              <SectionHeader style={{ marginTop: 12 }}>
                <SectionTitle style={{ fontSize: '14px' }}>
                  Emergency Contact
                </SectionTitle>
              </SectionHeader>
              <Row>
                <Field>
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={form.family.emergencyContact.name}
                    onChange={(e) =>
                      updateByPath('family.emergencyContact.name', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Relation</Label>
                  <Input
                    type="text"
                    value={form.family.emergencyContact.relation}
                    onChange={(e) =>
                      updateByPath(
                        'family.emergencyContact.relation',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    placeholder="e.g., +91 98765 43210"
                    value={form.family.emergencyContact.phone}
                    onChange={(e) =>
                      updateByPath('family.emergencyContact.phone', e.target.value)
                    }
                  />
                </Field>
              </Row>
            </Section>

            {/* HEALTH & OTHER */}
            <Section>
              <SectionHeader>
                <SectionBadge>9</SectionBadge>
                <SectionTitle>Health & Other Information</SectionTitle>
              </SectionHeader>
              <Row>
                <Field>
                  <Label>Medical Conditions</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Asthma, Hypertension (leave blank if none)"
                    value={form.healthAndOther.medicalConditions}
                    onChange={(e) =>
                      updateByPath(
                        'healthAndOther.medicalConditions',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>Disability Information</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Physical Disability, Visual Impairment"
                    value={form.healthAndOther.disabilityInfo}
                    onChange={(e) =>
                      updateByPath('healthAndOther.disabilityInfo', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Residency Type</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Day Scholar, Hostel"
                    value={form.healthAndOther.residencyType}
                    onChange={(e) =>
                      updateByPath('healthAndOther.residencyType', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Transport Mode</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Personal Vehicle, Bus, Bicycle"
                    value={form.healthAndOther.transportMode}
                    onChange={(e) =>
                      updateByPath('healthAndOther.transportMode', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Vehicle Number</Label>
                  <Input
                    type="text"
                    placeholder="e.g., TN09AB1234"
                    value={form.healthAndOther.vehicleNumber}
                    onChange={(e) =>
                      updateByPath('healthAndOther.vehicleNumber', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <CheckboxRow>
                    <SmallCheckbox
                      type="checkbox"
                      checked={form.healthAndOther.bloodDonorWilling}
                      onChange={(e) =>
                        updateByPath(
                          'healthAndOther.bloodDonorWilling',
                          e.target.checked
                        )
                      }
                    />
                    <span>Willing to donate blood</span>
                  </CheckboxRow>
                </Field>
              </Row>
            </Section>

            {/* DOCUMENTS */}
            <Section>
              <SectionHeader>
                <SectionBadge>10</SectionBadge>
                <SectionTitle>Documents</SectionTitle>
              </SectionHeader>

              <SectionHeader style={{ marginTop: 12 }}>
                <SectionTitle style={{ fontSize: '14px' }}>
                  Identity Documents
                </SectionTitle>
              </SectionHeader>
              <Row>
                <Field>
                  <Label>Profile Photo Link</Label>
                  <Input
                    type="text"
                    placeholder="e.g., https://drive.google.com/file/..."
                    value={form.documents.identity.profilePhotoLink}
                    onChange={(e) =>
                      updateByPath(
                        'documents.identity.profilePhotoLink',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>Aadhaar Link</Label>
                  <Input
                    type="text"
                    placeholder="e.g., https://drive.google.com/file/..."
                    value={form.documents.identity.aadharLink}
                    onChange={(e) =>
                      updateByPath(
                        'documents.identity.aadharLink',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>Community Certificate Link</Label>
                  <Input
                    type="text"
                    placeholder="e.g., https://drive.google.com/file/..."
                    value={form.documents.identity.communityCertLink}
                    onChange={(e) =>
                      updateByPath(
                        'documents.identity.communityCertLink',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>Nativity Certificate Link</Label>
                  <Input
                    type="text"
                    placeholder="e.g., https://drive.google.com/file/..."
                    value={form.documents.identity.nativityCertLink}
                    onChange={(e) =>
                      updateByPath(
                        'documents.identity.nativityCertLink',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>Income Certificate Link</Label>
                  <Input
                    type="text"
                    placeholder="e.g., https://drive.google.com/file/..."
                    value={form.documents.identity.incomeCertLink}
                    onChange={(e) =>
                      updateByPath(
                        'documents.identity.incomeCertLink',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>Disability Certificate Link</Label>
                  <Input
                    type="text"
                    placeholder="e.g., https://drive.google.com/file/..."
                    value={form.documents.identity.disabilityCertLink}
                    onChange={(e) =>
                      updateByPath(
                        'documents.identity.disabilityCertLink',
                        e.target.value
                      )
                    }
                  />
                </Field>
              </Row>

              <SectionHeader style={{ marginTop: 12 }}>
                <SectionTitle style={{ fontSize: '14px' }}>
                  School Documents
                </SectionTitle>
              </SectionHeader>
              <Row>
                <Field>
                  <Label>10th Marksheet Link</Label>
                  <Input
                    type="text"
                    placeholder="e.g., https://drive.google.com/file/..."
                    value={form.documents.school.tenthMarksheet}
                    onChange={(e) =>
                      updateByPath(
                        'documents.school.tenthMarksheet',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>11th Marksheet Link</Label>
                  <Input
                    type="text"
                    placeholder="e.g., https://drive.google.com/file/..."
                    value={form.documents.school.eleventhMarksheet}
                    onChange={(e) =>
                      updateByPath(
                        'documents.school.eleventhMarksheet',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>12th Marksheet Link</Label>
                  <Input
                    type="text"
                    placeholder="e.g., https://drive.google.com/file/..."
                    value={form.documents.school.twelfthMarksheet}
                    onChange={(e) =>
                      updateByPath(
                        'documents.school.twelfthMarksheet',
                        e.target.value
                      )
                    }
                  />
                </Field>
              </Row>

              <SectionHeader style={{ marginTop: 12 }}>
                <SectionTitle style={{ fontSize: '14px' }}>UG Documents</SectionTitle>
              </SectionHeader>
              <Row>
                <Field>
                  <Label>Degree Certificate Link</Label>
                  <Input
                    type="text"
                    placeholder="e.g., https://drive.google.com/file/..."
                    value={form.documents.ug.degreeCertLink}
                    onChange={(e) =>
                      updateByPath(
                        'documents.ug.degreeCertLink',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>Consolidated Marksheet Link</Label>
                  <Input
                    type="text"
                    placeholder="e.g., https://drive.google.com/file/..."
                    value={form.documents.ug.consolidatedMarksheetLink}
                    onChange={(e) =>
                      updateByPath(
                        'documents.ug.consolidatedMarksheetLink',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>Transfer Certificate Link</Label>
                  <Input
                    type="text"
                    placeholder="e.g., https://drive.google.com/file/..."
                    value={form.documents.ug.tcLink}
                    onChange={(e) =>
                      updateByPath('documents.ug.tcLink', e.target.value)
                    }
                  />
                </Field>
              </Row>

              <SectionHeader style={{ marginTop: 12 }}>
                <SectionTitle style={{ fontSize: '14px' }}>PG Documents</SectionTitle>
              </SectionHeader>
              <Row>
                <Field>
                  <Label>Admission Letter Link</Label>
                  <Input
                    type="text"
                    placeholder="e.g., https://drive.google.com/file/..."
                    value={form.documents.pg.admissionLetterLink}
                    onChange={(e) =>
                      updateByPath(
                        'documents.pg.admissionLetterLink',
                        e.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <Label>Fees Receipt Link</Label>
                  <Input
                    type="text"
                    placeholder="e.g., https://drive.google.com/file/..."
                    value={form.documents.pg.feesReceiptLink}
                    onChange={(e) =>
                      updateByPath('documents.pg.feesReceiptLink', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>ID Card Link</Label>
                  <Input
                    type="text"
                    placeholder="e.g., https://drive.google.com/file/..."
                    value={form.documents.pg.idCardLink}
                    onChange={(e) =>
                      updateByPath('documents.pg.idCardLink', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <Label>Consolidated Marksheet Link</Label>
                  <Input
                    type="text"
                    placeholder="e.g., https://drive.google.com/file/..."
                    value={form.documents.pg.consolidatedMarksheetLink}
                    onChange={(e) =>
                      updateByPath(
                        'documents.pg.consolidatedMarksheetLink',
                        e.target.value
                      )
                    }
                  />
                </Field>
              </Row>
            </Section>

            {/* BUTTONS */}
            <ButtonRow>
              <PrimaryButton type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Biodata'}
              </PrimaryButton>
            </ButtonRow>
          </form>
        </Card>
      </Main>

      <AppToast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </Layout>
  );
}
