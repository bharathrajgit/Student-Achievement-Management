import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import api from '../services/api';
import { FiArrowLeft, FiCheckCircle, FiClock, FiXCircle, FiExternalLink } from 'react-icons/fi';

const Layout = styled.div`
  display: flex;
`;

const Main = styled.main`
  flex: 1;
  margin-left: 280px;
  margin-top: 80px;
  padding: 32px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  min-height: calc(100vh - 80px);

  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 70px;
    padding: 16px;
  }
`;

const Header2 = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  transition: all 0.2s ease;

  &:hover {
    background: #f7fafc;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;

  @media (max-width: 768px) {
    font-size: 22px;
    width: 100%;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 20px 16px;
    border-radius: 12px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const StatValue = styled.p`
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const StatLabel = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const StudentInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const InfoField = styled.div`
  margin-bottom: 16px;

  @media (max-width: 768px) {
    margin-bottom: 8px;
  }
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 6px;
`;

const Value = styled.p`
  margin: 0;
  font-size: 16px;
  color: #2d3748;
  font-weight: 500;
  word-break: break-word;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 20px 0;

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 16px;
  }
`;

const AchievementGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const AchievementCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 16px;

    &:hover {
      transform: none;
    }
  }
`;

const AchievementTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  word-break: break-word;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${(p) => {
    if (p.$status === 'Verified') return '#dcfce7';
    if (p.$status === 'Pending') return '#fef3c7';
    if (p.$status === 'Rejected') return '#fee2e2';
    return '#f7fafc';
  }};
  color: ${(p) => {
    if (p.$status === 'Verified') return '#166534';
    if (p.$status === 'Pending') return '#b45309';
    if (p.$status === 'Rejected') return '#991b1b';
    return '#718096';
  }};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
  align-self: flex-start;

  svg {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 5px 10px;
  }
`;

const ProofLinkBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f0f4ff;
  border-radius: 8px;
  border: 1px solid #e0e7ff;
  margin: 12px 0;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 8px 10px;
  }
`;

const ProofLink = styled.a`
  font-size: 12px;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    text-decoration: underline;
  }

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const AchievementMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #718096;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const Empty = styled.div`
  text-align: center;
  padding: 40px;
  color: #718096;
  background: #f7fafc;
  border-radius: 12px;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 40px;
  color: #718096;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const getStatusIcon = (status) => {
  if (status === 'Verified') return <FiCheckCircle />;
  if (status === 'Pending') return <FiClock />;
  if (status === 'Rejected') return <FiXCircle />;
  return null;
};

export function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/achievements');
      const allAchievements = Array.isArray(res.data.data) ? res.data.data : [];
      const studentAchievements = allAchievements.filter((a) => a.studentId?._id === id);

      if (studentAchievements.length > 0) {
        setStudent(studentAchievements[0].studentId);
        setAchievements(studentAchievements);
      }
    } catch (err) {
      console.error('Error loading student data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <Loading>Loading student profile...</Loading>
        </Main>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <Header2>
            <BackBtn onClick={() => navigate('/coordinator/students')}>
              <FiArrowLeft /> Back
            </BackBtn>
            <Title>Student Achievement</Title>
          </Header2>
          <Empty>No Achievement</Empty>
        </Main>
      </Layout>
    );
  }

  const verifiedCount = achievements.filter((a) => a.status === 'Verified').length;
  const pendingCount = achievements.filter((a) => a.status === 'Pending').length;
  const rejectedCount = achievements.filter((a) => a.status === 'Rejected').length;

  return (
    <Layout>
      <Sidebar />
      <Header />
      <Main>
        <Header2>
          <BackBtn onClick={() => navigate('/coordinator/students')}>
            <FiArrowLeft /> Back
          </BackBtn>
          <Title>{student.name}</Title>
        </Header2>

        <Card>
          <Grid>
            <StatCard>
              <StatValue>{achievements.length}</StatValue>
              <StatLabel>Total Achievements</StatLabel>
            </StatCard>
            <StatCard style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <StatValue>{verifiedCount}</StatValue>
              <StatLabel>Verified</StatLabel>
            </StatCard>
            <StatCard style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <StatValue>{pendingCount}</StatValue>
              <StatLabel>Pending</StatLabel>
            </StatCard>
            <StatCard style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              <StatValue>{rejectedCount}</StatValue>
              <StatLabel>Rejected</StatLabel>
            </StatCard>
          </Grid>

          <StudentInfo>
            <InfoField>
              <Label>Email</Label>
              <Value>{student.email}</Value>
            </InfoField>
            <InfoField>
              <Label>Roll Number</Label>
              <Value>{student.rollNumber}</Value>
            </InfoField>
            <InfoField>
              <Label>Batch</Label>
              <Value>{student.batch}</Value>
            </InfoField>
            <InfoField>
              <Label>Section</Label>
              <Value>{student.section}</Value>
            </InfoField>
          </StudentInfo>
        </Card>

        <Card>
          <SectionTitle>Achievements</SectionTitle>
          {achievements.length > 0 ? (
            <AchievementGrid>
              {achievements.map((achievement) => {
                const proofUrl = achievement.proof || (achievement.proofLinks && achievement.proofLinks[0]);

                return (
                  <AchievementCard key={achievement._id}>
                    <Badge $status={achievement.status}>
                      {getStatusIcon(achievement.status)}
                      {achievement.status}
                    </Badge>

                    <AchievementTitle>{achievement.title}</AchievementTitle>

                    <Value style={{ fontSize: '13px', marginBottom: '8px' }}>
                      {achievement.description}
                    </Value>

                    {proofUrl && (
                      <ProofLinkBox>
                        <ProofLink
                          href={proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={proofUrl}
                        >
                          <FiExternalLink />
                          {proofUrl.length > 40
                            ? proofUrl.substring(0, 37) + '...'
                            : proofUrl}
                        </ProofLink>
                      </ProofLinkBox>
                    )}

                    <AchievementMeta>
                      <span>{achievement.category}</span>
                      <span>Sem {achievement.semester}</span>
                    </AchievementMeta>
                  </AchievementCard>
                );
              })}
            </AchievementGrid>
          ) : (
            <Empty>No achievements found for this student</Empty>
          )}
        </Card>
      </Main>
    </Layout>
  );
}
