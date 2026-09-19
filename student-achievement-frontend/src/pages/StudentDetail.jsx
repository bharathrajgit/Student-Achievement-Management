// src/pages/Coordinator/StudentAchievements.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import api from '../services/api';
import { AppToast } from '../components/AppToast';
import { FiArrowLeft, FiExternalLink } from 'react-icons/fi';

// ====== styled components ======

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

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
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
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
`;

const Subtitle = styled.p`
  margin: 2px 0 0 0;
  font-size: 13px;
  color: #4a5568;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border: 1px solid #e2e8f0;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 16px 0;
`;

const Loading = styled.div`
  text-align: center;
  padding: 40px;
  color: #718096;
`;

const ErrorBox = styled.div`
  padding: 12px 16px;
  background: #fed7d7;
  border: 1px solid #fc8181;
  border-radius: 8px;
  color: #c53030;
  font-size: 14px;
  margin-bottom: 16px;
`;

const EmptyState = styled.div`
  padding: 24px;
  text-align: center;
  color: #718096;
  font-size: 14px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px dashed #cbd5e0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  text-align: left;
  padding: 10px 8px;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 10px 8px;
  border-bottom: 1px solid #edf2f7;
  color: #2d3748;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: ${({ status }) =>
    status === 'Passed'
      ? '#166534'
      : status === 'Failed'
      ? '#991b1b'
      : status === 'Submitted'
      ? '#92400e'
      : '#1d4ed8'};
  background: ${({ status }) =>
    status === 'Passed'
      ? '#dcfce7'
      : status === 'Failed'
      ? '#fee2e2'
      : status === 'Submitted'
      ? '#fef3c7'
      : '#dbeafe'};
`;

const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #2563eb;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

// ====== main component ======

export function StudentDetail() {
  const { id } = useParams(); // studentId
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const [student, setStudent] = useState(null);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (id) {
      fetchAchievements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError('');

      // TODO: if your real URL is different, change here
      const res = await api.get(`/coordinator/students/${id}/achievements`);
      const data = res.data?.data || res.data;

      setStudent(data.student || null);
      setAchievements(data.achievements || []);
    } catch (err) {
      console.error('Error loading achievements:', err);
      const msg = err.response?.data?.message || 'Failed to load student achievements';
      setError(msg);
      setToast({ show: true, type: 'danger', message: msg });
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
          <Loading>Loading student achievements...</Loading>
        </Main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Sidebar />
      <Header />
      <Main>
        <HeaderSection>
          <BackBtn onClick={() => navigate('/coordinator/students')}>
            <FiArrowLeft /> Back
          </BackBtn>
          <TitleBlock>
            <Title>Student Achievements</Title>
            {student && (
              <Subtitle>
                {student.name} • {student.rollNumber} • {student.batch} {student.section && `• Section ${student.section}`}
              </Subtitle>
            )}
          </TitleBlock>
        </HeaderSection>

        <Card>
          <SectionTitle>Exam / Course Achievements</SectionTitle>

          {error && <ErrorBox>{error}</ErrorBox>}

          {achievements.length === 0 ? (
            <EmptyState>
              No achievements recorded for this student yet. Once the student registers
              and completes exams/courses, they will appear here.
            </EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Exam / Course</Th>
                  <Th>Platform</Th>
                  <Th>Status</Th>
                  <Th>Marks</Th>
                  <Th>Completion Date</Th>
                  <Th>Certificate</Th>
                </tr>
              </thead>
              <tbody>
                {achievements.map((a, index) => (
                  <tr key={a.id || a._id || index}>
                    <Td>{index + 1}</Td>
                    <Td>{a.examName || a.title}</Td>
                    <Td>{a.platform || '-'}</Td>
                    <Td>
                      <StatusBadge status={a.status}>{a.status}</StatusBadge>
                    </Td>
                    <Td>
                      {a.marksObtained != null && a.totalMarks != null
                        ? `${a.marksObtained}/${a.totalMarks}`
                        : '-'}
                    </Td>
                    <Td>
                      {a.examCompletionDate
                        ? new Date(a.examCompletionDate).toLocaleDateString()
                        : '-'}
                    </Td>
                    <Td>
                      {a.certificateLink ? (
                        <LinkButton
                          href={a.certificateLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View <FiExternalLink size={12} />
                        </LinkButton>
                      ) : (
                        '-'
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <AppToast
          show={toast.show}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      </Main>
    </Layout>
  );
}
