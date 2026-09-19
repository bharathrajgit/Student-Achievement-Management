// src/pages/StudentBiodataDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import styled from 'styled-components';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { AppToast } from '../components/AppToast';

const Layout = styled.div`
  display: flex;
`;

const Main = styled.main`
  flex: 1;
  margin-left: 280px;
  margin-top: 80px;
  padding: 24px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  min-height: calc(100vh - 80px);

  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 70px;
    padding: 16px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px 20px 24px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.12);
  border: 1px solid #e2e8f0;
  max-width: 900px;
  margin: 0 auto 20px;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 16px 0;
`;

const Section = styled.section`
  margin-top: 16px;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.p`
  margin: 0;
  font-size: 14px;
  color: #2d3748;
  line-height: 1.5;
`;

const Label = styled.span`
  font-weight: 600;
  color: #4a5568;
`;

const Link = styled.a`
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  word-break: break-all;
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorText = styled.div`
  color: #c53030;
  background: #fff5f5;
  padding: 10px 12px;
  border-radius: 10px;
  border-left: 4px solid #c53030;
  font-size: 14px;
  margin-bottom: 12px;
`;

const InfoText = styled.div`
  color: #4a5568;
  font-size: 14px;
`;

const Loading = styled.div`
  padding: 40px;
  text-align: center;
  color: #718096;
`;

const SubSectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin: 12px 0 6px 0;
`;

const SemesterRow = styled.div`
  display: grid;
  grid-template-columns: 100px 120px 1fr;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #edf2f7;
  font-size: 13px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 4px;
  }
`;

const ListItem = styled.li`
  font-size: 14px;
  color: #2d3748;
  margin-bottom: 4px;
`;

const StudentBiodataDetail = () => {
  const { studentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [biodata, setBiodata] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
                              show: false,
                              type: 'danger',
                              message: '',
                            });


 useEffect(() => {
  const fetchBiodata = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching biodata for student:', studentId);
      const res = await api.get(`/admin/students/${studentId}/biodata`);
      
      console.log('📦 Full Response:', res.data);
      console.log('🎯 Extracted Biodata:', res.data?.data?.student?.biodata);
      
      // ✅ CORRECT PATH: res.data.data.student.biodata
      const extractedBiodata = res.data?.data?.student?.biodata || null;
      
      if (extractedBiodata) {
        setBiodata(extractedBiodata);
        console.log('✅ Biodata set successfully');
      } else {
        console.warn('⚠️ No biodata found in response');
        setBiodata(null);
      }
      
    } catch (err) {
      console.error('❌ Coordinator biodata load error', err);
      const msg =
        err.response?.data?.message ||
        'Failed to load biodata for this student.';
      setError(msg);
      setToast({
        show: true,
        type: 'danger',
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  if (studentId) fetchBiodata();
}, [studentId]);


  if (loading) {
    return (
      <Layout>
        <Sidebar />
        <Header title="Student Biodata" />
        <Main>
          <Loading>Loading biodata…</Loading>
        </Main>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Sidebar />
        <Header title="Student Biodata" />
        <Main>
          <Card>
            <Title>Student Biodata</Title>
            <ErrorText>{error}</ErrorText>
          </Card>
        </Main>
      </Layout>
    );
  }

  if (!biodata) {
    return (
      <Layout>
        <Sidebar />
        <Header title="Student Biodata" />
        <Main>
          <Card>
            <Title>Student Biodata</Title>
            <InfoText>No biodata found for this student.</InfoText>
          </Card>
        </Main>
      </Layout>
    );
  }

  const {
    personal = {},
    contact = {},
    academicIds = {},
    school = {},
    ug = {},
    pg = {},
    documents = {},
    family = {},
    skillsAndInterests = {},
    healthAndOther = {},
  } = biodata;

  const perm = contact.permanentAddress || {};
  const curr = contact.currentAddress || {};
  const tenth = school.tenth || {};
  const twelfth = school.twelfthOrDiploma || {};

  const identity = documents.identity || {};
  const schoolDocs = documents.school || {};
  const ugDocs = documents.ug || {};
  const pgDocs = documents.pg || {};

  const father = family.father || {};
  const mother = family.mother || {};
  const guardian = family.guardian || {};
  const emergency = family.emergencyContact || {};

  return (
    <Layout>
      <Sidebar />
      <Header title="Student Biodata" />
      <Main>
        <Card>
          <Title>📋 Complete Student Biodata</Title>

          {/* 1. PERSONAL INFORMATION */}
          <Section>
            <SectionTitle>👤 Personal Information</SectionTitle>
            <Row>
              <Field>
                <Label>Full Name: </Label> {personal.fullName || '—'}
              </Field>
              <Field>
                <Label>Date of Birth: </Label>
                {personal.dob ? personal.dob.substring(0, 10) : '—'}
              </Field>
              <Field>
                <Label>Gender: </Label> {personal.gender || '—'}
              </Field>
              <Field>
                <Label>Blood Group: </Label> {personal.bloodGroup || '—'}
              </Field>
              <Field>
                <Label>Nationality: </Label> {personal.nationality || '—'}
              </Field>
              <Field>
                <Label>Mother Tongue: </Label> {personal.motherTongue || '—'}
              </Field>
              <Field>
                <Label>Religion: </Label> {personal.religion || '—'}
              </Field>
              <Field>
                <Label>Community: </Label> {personal.community || '—'}
              </Field>
              <Field>
                <Label>Nativity State: </Label> {personal.nativityState || '—'}
              </Field>
              <Field>
                <Label>Nativity District: </Label>
                {personal.nativityDistrict || '—'}
              </Field>
              <Field>
                <Label>Aadhaar Number: </Label>
                {personal.aadharNumber || 'Not provided'}
              </Field>
            </Row>
          </Section>

          {/* 2. CONTACT INFORMATION */}
          <Section>
            <SectionTitle>📞 Contact Information</SectionTitle>
            <Row>
              <Field>
                <Label>Mobile: </Label> {contact.mobile || '—'}
              </Field>
              <Field>
                <Label>Alternate Mobile: </Label> {contact.altMobile || '—'}
              </Field>
              <Field style={{ gridColumn: '1 / -1' }}>
                <Label>Email: </Label> {contact.email || '—'}
              </Field>
            </Row>

            <SubSectionTitle>Permanent Address</SubSectionTitle>
            <Field>
              {perm.line1
                ? `${perm.line1}${perm.line2 ? ', ' + perm.line2 : ''}, ${
                    perm.city
                  }, ${perm.district}, ${perm.state} - ${perm.pincode}`
                : 'Not provided'}
            </Field>

            <SubSectionTitle>Current Address</SubSectionTitle>
            <Field>
              {curr.isSameAsPermanent
                ? 'Same as permanent address'
                : curr.line1
                ? `${curr.line1}${curr.line2 ? ', ' + curr.line2 : ''}, ${
                    curr.city
                  }, ${curr.district}, ${curr.state} - ${curr.pincode}`
                : 'Not provided'}
            </Field>
          </Section>

          {/* 3. ACADEMIC IDs */}
          <Section>
            <SectionTitle>🆔 Academic IDs</SectionTitle>
            <Row>
              <Field>
                <Label>UMIS ID: </Label> {academicIds.umisId || 'Not provided'}
              </Field>
              <Field>
                <Label>EMIS ID: </Label> {academicIds.emisId || 'Not provided'}
              </Field>
              <Field>
                <Label>ABC / APPAR ID: </Label>
                {academicIds.abcId || 'Not provided'}
              </Field>
            </Row>
          </Section>

          {/* 4. SCHOOL EDUCATION */}
          <Section>
            <SectionTitle>🏫 School Education</SectionTitle>

            <SubSectionTitle>10th Standard</SubSectionTitle>
            <Row>
              <Field>
                <Label>Board: </Label> {tenth.board || '—'}
              </Field>
              <Field>
                <Label>School Name: </Label> {tenth.schoolName || '—'}
              </Field>
              <Field>
                <Label>Year of Passing: </Label> {tenth.yearOfPassing || '—'}
              </Field>
              <Field>
                <Label>Register No: </Label> {tenth.registerNo || '—'}
              </Field>
              <Field>
                <Label>Percentage/CGPA: </Label>
                {tenth.percentageOrCgpa || '—'}
              </Field>
              <Field>
                <Label>Medium: </Label> {tenth.medium || '—'}
              </Field>
            </Row>

            <SubSectionTitle>12th / Diploma</SubSectionTitle>
            <Row>
              <Field>
                <Label>Type of Course: </Label> {twelfth.typeOfCourse || '—'}
              </Field>
              <Field>
                <Label>Board/University: </Label>
                {twelfth.boardOrUniversity || '—'}
              </Field>
              <Field>
                <Label>Institution: </Label> {twelfth.institutionName || '—'}
              </Field>
              <Field>
                <Label>Year of Passing: </Label>
                {twelfth.yearOfPassing || '—'}
              </Field>
              <Field>
                <Label>Register No: </Label> {twelfth.registerNo || '—'}
              </Field>
              <Field>
                <Label>Percentage/CGPA: </Label>
                {twelfth.percentageOrCgpa || '—'}
              </Field>
              <Field>
                <Label>Group/Branch: </Label> {twelfth.groupOrBranch || '—'}
              </Field>
            </Row>
          </Section>

          {/* 5. UG DETAILS */}
          <Section>
            <SectionTitle>🎓 UG (Bachelor) Details</SectionTitle>
            <Row>
              <Field>
                <Label>Course: </Label> {ug.course || '—'}
              </Field>
              <Field>
                <Label>Branch: </Label> {ug.branch || '—'}
              </Field>
              <Field>
                <Label>College Name: </Label> {ug.collegeName || '—'}
              </Field>
              <Field>
                <Label>University: </Label> {ug.universityName || '—'}
              </Field>
              <Field>
                <Label>Year of Joining: </Label> {ug.yearOfJoining || '—'}
              </Field>
              <Field>
                <Label>Year of Passing: </Label>
                {ug.yearOfPassing || 'Studying / Not set'}
              </Field>
              <Field>
                <Label>Completed Semesters: </Label>
                {ug.numSemestersCompleted || '—'}
              </Field>
              <Field>
                <Label>Cumulative CGPA / %: </Label>
                {ug.cumulativeCgpa || 'Not provided'}
              </Field>
            </Row>
          </Section>

          {/* 6. PG DETAILS */}
          <Section>
            <SectionTitle>🎓 PG (Master) Details</SectionTitle>
            <Row>
              <Field>
                <Label>Course: </Label> {pg.course || '—'}
              </Field>
              <Field>
                <Label>Department: </Label> {pg.department || '—'}
              </Field>
              <Field>
                <Label>College Name: </Label> {pg.collegeName || '—'}
              </Field>
              <Field>
                <Label>University: </Label> {pg.universityName || '—'}
              </Field>
              <Field>
                <Label>Register No: </Label> {pg.registerNo || '—'}
              </Field>
              <Field>
                <Label>Section: </Label> {pg.section || 'Not set'}
              </Field>
              <Field>
                <Label>Batch: </Label> {pg.batch || '—'}
              </Field>
              <Field>
                <Label>Current Semester: </Label>
                {pg.currentSemester || '—'}
              </Field>
              <Field>
                <Label>Admission Type: </Label> {pg.admissionType || 'Not set'}
              </Field>
              <Field>
                <Label>Quota Category: </Label> {pg.quotaCategory || 'Not set'}
              </Field>
            </Row>

            {pg.scholarship && (pg.scholarship.schemeName || pg.scholarship.scholarshipId) && (
              <>
                <SubSectionTitle>Scholarship Details</SubSectionTitle>
                <Row>
                  <Field>
                    <Label>Scheme Name: </Label>
                    {pg.scholarship.schemeName || 'Not provided'}
                  </Field>
                  <Field>
                    <Label>Scholarship ID: </Label>
                    {pg.scholarship.scholarshipId || 'Not provided'}
                  </Field>
                  <Field>
                    <Label>Amount: </Label>
                    {pg.scholarship.amount ? `₹${pg.scholarship.amount}` : 'Not provided'}
                  </Field>
                </Row>
              </>
            )}
          </Section>

          {/* 7. FAMILY DETAILS */}
          <Section>
            <SectionTitle>👨‍👩‍👧‍👦 Family Information</SectionTitle>

            <SubSectionTitle>Father Details</SubSectionTitle>
            <Row>
              <Field>
                <Label>Name: </Label> {father.name || 'Not provided'}
              </Field>
              <Field>
                <Label>Qualification: </Label>
                {father.qualification || 'Not provided'}
              </Field>
              <Field>
                <Label>Occupation: </Label> {father.occupation || 'Not provided'}
              </Field>
              <Field>
                <Label>Phone: </Label> {father.phone || 'Not provided'}
              </Field>
              <Field style={{ gridColumn: '1 / -1' }}>
                <Label>Email: </Label> {father.email || 'Not provided'}
              </Field>
            </Row>

            <SubSectionTitle>Mother Details</SubSectionTitle>
            <Row>
              <Field>
                <Label>Name: </Label> {mother.name || 'Not provided'}
              </Field>
              <Field>
                <Label>Qualification: </Label>
                {mother.qualification || 'Not provided'}
              </Field>
              <Field>
                <Label>Occupation: </Label> {mother.occupation || 'Not provided'}
              </Field>
              <Field>
                <Label>Phone: </Label> {mother.phone || 'Not provided'}
              </Field>
              <Field style={{ gridColumn: '1 / -1' }}>
                <Label>Email: </Label> {mother.email || 'Not provided'}
              </Field>
            </Row>

            {guardian.name && (
              <>
                <SubSectionTitle>Guardian Details</SubSectionTitle>
                <Row>
                  <Field>
                    <Label>Name: </Label> {guardian.name}
                  </Field>
                  <Field>
                    <Label>Relation: </Label> {guardian.relation || '—'}
                  </Field>
                  <Field>
                    <Label>Phone: </Label> {guardian.phone || 'Not provided'}
                  </Field>
                </Row>
              </>
            )}

            <SubSectionTitle>Other Family Information</SubSectionTitle>
            <Row>
              <Field>
                <Label>Annual Income Range: </Label>
                {family.annualIncomeRange || 'Not provided'}
              </Field>
            </Row>

            {emergency.name && (
              <>
                <SubSectionTitle>Emergency Contact</SubSectionTitle>
                <Row>
                  <Field>
                    <Label>Name: </Label> {emergency.name}
                  </Field>
                  <Field>
                    <Label>Relation: </Label> {emergency.relation || '—'}
                  </Field>
                  <Field>
                    <Label>Phone: </Label> {emergency.phone || 'Not provided'}
                  </Field>
                </Row>
              </>
            )}
          </Section>

          {/* 8. SKILLS & INTERESTS */}
          <Section>
            <SectionTitle>💡 Skills & Interests</SectionTitle>

            <SubSectionTitle>Technical Skills</SubSectionTitle>
            {skillsAndInterests.technicalSkills &&
            skillsAndInterests.technicalSkills.length > 0 ? (
              <ul style={{ margin: '4px 0 8px 20px', padding: 0 }}>
                {skillsAndInterests.technicalSkills.map((skill, idx) => (
                  <ListItem key={idx}>{skill}</ListItem>
                ))}
              </ul>
            ) : (
              <Field>Not provided</Field>
            )}

            <SubSectionTitle>Soft Skills</SubSectionTitle>
            {skillsAndInterests.softSkills &&
            skillsAndInterests.softSkills.length > 0 ? (
              <ul style={{ margin: '4px 0 8px 20px', padding: 0 }}>
                {skillsAndInterests.softSkills.map((skill, idx) => (
                  <ListItem key={idx}>{skill}</ListItem>
                ))}
              </ul>
            ) : (
              <Field>Not provided</Field>
            )}

            <SubSectionTitle>Languages Known</SubSectionTitle>
            {skillsAndInterests.languagesKnown &&
            skillsAndInterests.languagesKnown.length > 0 ? (
              <ul style={{ margin: '4px 0 8px 20px', padding: 0 }}>
                {skillsAndInterests.languagesKnown.map((lang, idx) => (
                  <ListItem key={idx}>
                    {lang.language} (
                    {[
                      lang.canRead && 'Read',
                      lang.canWrite && 'Write',
                      lang.canSpeak && 'Speak',
                    ]
                      .filter(Boolean)
                      .join(', ') || 'None specified'}
                    )
                  </ListItem>
                ))}
              </ul>
            ) : (
              <Field>Not provided</Field>
            )}

            <SubSectionTitle>Extra-curricular Activities</SubSectionTitle>
            {skillsAndInterests.activities &&
            skillsAndInterests.activities.length > 0 ? (
              <ul style={{ margin: '4px 0 8px 20px', padding: 0 }}>
                {skillsAndInterests.activities.map((act, idx) => (
                  <ListItem key={idx}>{act}</ListItem>
                ))}
              </ul>
            ) : (
              <Field>Not provided</Field>
            )}

            <SubSectionTitle>Clubs & Positions</SubSectionTitle>
            {skillsAndInterests.clubsAndPositions &&
            skillsAndInterests.clubsAndPositions.length > 0 ? (
              <ul style={{ margin: '4px 0 8px 20px', padding: 0 }}>
                {skillsAndInterests.clubsAndPositions.map((club, idx) => (
                  <ListItem key={idx}>{club}</ListItem>
                ))}
              </ul>
            ) : (
              <Field>Not provided</Field>
            )}
          </Section>

          {/* 9. DOCUMENTS & DRIVE LINKS */}
          <Section>
            <SectionTitle>📄 Documents & Drive Links</SectionTitle>

            <SubSectionTitle>Identity Documents</SubSectionTitle>
            <Row>
              <Field>
                <Label>Profile Photo: </Label>
                {identity.profilePhotoLink ? (
                  <Link
                    href={identity.profilePhotoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </Link>
                ) : (
                  'Not provided'
                )}
              </Field>
              <Field>
                <Label>Aadhaar: </Label>
                {identity.aadharLink ? (
                  <Link
                    href={identity.aadharLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </Link>
                ) : (
                  'Not provided'
                )}
              </Field>
              <Field>
                <Label>Community Certificate: </Label>
                {identity.communityCertLink ? (
                  <Link
                    href={identity.communityCertLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </Link>
                ) : (
                  'Not provided'
                )}
              </Field>
              <Field>
                <Label>Nativity Certificate: </Label>
                {identity.nativityCertLink ? (
                  <Link
                    href={identity.nativityCertLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </Link>
                ) : (
                  'Not provided'
                )}
              </Field>
              <Field>
                <Label>Income Certificate: </Label>
                {identity.incomeCertLink ? (
                  <Link
                    href={identity.incomeCertLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </Link>
                ) : (
                  'Not provided'
                )}
              </Field>
              <Field>
                <Label>Disability Certificate: </Label>
                {identity.disabilityCertLink ? (
                  <Link
                    href={identity.disabilityCertLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </Link>
                ) : (
                  'Not provided'
                )}
              </Field>
            </Row>

            <SubSectionTitle>School Marksheets</SubSectionTitle>
            <Row>
              <Field>
                <Label>10th Marksheet: </Label>
                {schoolDocs.tenthMarksheet ? (
                  <Link
                    href={schoolDocs.tenthMarksheet}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </Link>
                ) : (
                  'Not provided'
                )}
              </Field>
              <Field>
                <Label>11th Marksheet: </Label>
                {schoolDocs.eleventhMarksheet ? (
                  <Link
                    href={schoolDocs.eleventhMarksheet}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </Link>
                ) : (
                  'Not provided'
                )}
              </Field>
              <Field>
                <Label>12th Marksheet: </Label>
                {schoolDocs.twelfthMarksheet ? (
                  <Link
                    href={schoolDocs.twelfthMarksheet}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </Link>
                ) : (
                  'Not provided'
                )}
              </Field>
            </Row>

            <SubSectionTitle>UG Documents</SubSectionTitle>
            <Row>
              <Field>
                <Label>Degree Certificate: </Label>
                {ugDocs.degreeCertLink ? (
                  <Link
                    href={ugDocs.degreeCertLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </Link>
                ) : (
                  'Not provided'
                )}
              </Field>
              <Field>
                <Label>Consolidated Marksheet: </Label>
                {ugDocs.consolidatedMarksheetLink ? (
                  <Link
                    href={ugDocs.consolidatedMarksheetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </Link>
                ) : (
                  'Not provided'
                )}
              </Field>
              <Field>
                <Label>Transfer Certificate: </Label>
                {ugDocs.tcLink ? (
                  <Link
                    href={ugDocs.tcLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </Link>
                ) : (
                  'Not provided'
                )}
              </Field>
            </Row>

            <SubSectionTitle>UG Semester-wise Marksheets</SubSectionTitle>
            {ugDocs.semesterMarksheets &&
            ugDocs.semesterMarksheets.length > 0 ? (
              <>
                <SemesterRow style={{ fontWeight: 600, color: '#4a5568' }}>
                  <div>Semester</div>
                  <div>CGPA / %</div>
                  <div>Marksheet Link</div>
                </SemesterRow>
                {ugDocs.semesterMarksheets.map((sem, idx) => (
                  <SemesterRow key={idx}>
                    <div>Sem {sem.semNumber || '—'}</div>
                    <div>{sem.cgpaOrPercentage || '—'}</div>
                    <div>
                      {sem.marksheetLink ? (
                        <Link
                          href={sem.marksheetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Link
                        </Link>
                      ) : (
                        'Not provided'
                      )}
                    </div>
                  </SemesterRow>
                ))}
              </>
            ) : (
              <Field>No semester marksheets added.</Field>
            )}

            <SubSectionTitle>PG Documents</SubSectionTitle>
            <Row>
              <Field>
                <Label>Admission Letter: </Label>
                {pgDocs.admissionLetterLink ? (
                  <Link
                    href={pgDocs.admissionLetterLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </Link>
                ) : (
                  'Not provided'
                )}
              </Field>
              <Field>
                <Label>Fees Receipt: </Label>
                {pgDocs.feesReceiptLink ? (
                  <Link
                    href={pgDocs.feesReceiptLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </Link>
                ) : (
                  'Not provided'
                )}
              </Field>
              <Field>
                <Label>ID Card: </Label>
                {pgDocs.idCardLink ? (
                  <Link
                    href={pgDocs.idCardLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </Link>
                ) : (
                  'Not provided'
                )}
              </Field>
              <Field>
                <Label>Consolidated Marksheet: </Label>
                {pgDocs.consolidatedMarksheetLink ? (
                  <Link
                    href={pgDocs.consolidatedMarksheetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link
                  </Link>
                ) : (
                  'Not provided'
                )}
              </Field>
            </Row>
          </Section>

          {/* 10. HEALTH & OTHER INFO */}
          <Section>
            <SectionTitle>🏥 Health & Other Information</SectionTitle>
            <Row>
              <Field>
                <Label>Medical Conditions: </Label>
                {healthAndOther.medicalConditions || 'None reported'}
              </Field>
              <Field>
                <Label>Disability Info: </Label>
                {healthAndOther.disabilityInfo || 'None reported'}
              </Field>
              <Field>
                <Label>Blood Donor Willing: </Label>
                {healthAndOther.bloodDonorWilling ? 'Yes' : 'No'}
              </Field>
              <Field>
                <Label>Residency Type: </Label>
                {healthAndOther.residencyType || 'Not provided'}
              </Field>
              <Field>
                <Label>Transport Mode: </Label>
                {healthAndOther.transportMode || 'Not provided'}
              </Field>
              <Field>
                <Label>Vehicle Number: </Label>
                {healthAndOther.vehicleNumber || 'Not provided'}
              </Field>
            </Row>
          </Section>
        </Card>
      </Main>
      <AppToast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </Layout>
  );
};

export default StudentBiodataDetail;
