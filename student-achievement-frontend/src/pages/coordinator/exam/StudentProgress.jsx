// src/pages/coordinator/exam/StudentProgress.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { AppToast } from '../../../components/AppToast';
import { getStudentProgress } from '../../../services/coordinatorExamService';
import { FiArrowLeft } from 'react-icons/fi';

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

const BackButton = styled.button`
  padding: 10px 16px;
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #f3f4f6;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 32px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1a202c;
    margin: 0 0 8px 0;
  }

  p {
    color: #718096;
    margin: 0;
    font-size: 14px;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  th {
    padding: 16px 20px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  td {
    padding: 16px 20px;
    font-size: 14px;
    color: #2d3748;
    border-bottom: 1px solid #e5e7eb;
  }

  tbody tr {
    transition: all 0.2s ease;

    &:hover {
      background: #f9fafb;
    }

    &:last-child td {
      border-bottom: none;
    }
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  background: ${(props) => {
    switch (props.$status) {
      case 'Registered':
        return '#dbeafe';
      case 'Passed':
        return '#dcfce7';
      case 'Failed':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case 'Registered':
        return '#0c4a6e';
      case 'Passed':
        return '#15803d';
      case 'Failed':
        return '#7f1d1d';
      default:
        return '#374151';
    }
  }};
`;

const Loading = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #718096;
`;

export default function StudentProgress() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    loadProgress();
  }, [studentId]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const response = await getStudentProgress(studentId);
      setProgress(response.data);
    } catch (error) {
      console.error('Error loading progress:', error);
      showToast('danger', error.message || 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  if (loading) {
    return (
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <Loading>Loading student progress...</Loading>
        </Main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Sidebar />
      <Header />
      <Main>
        <BackButton onClick={() => navigate(-1)}>
          <FiArrowLeft size={16} />
          Back
        </BackButton>

        <PageHeader>
          <h1>📈 Student Progress</h1>
          <p>Exam performance and registration history</p>
        </PageHeader>

        <Card>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>
            {progress?.studentName}
          </h2>
          <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
            Email: {progress?.studentEmail}
          </p>
        </Card>

        <Card>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>
            Exam History
          </h2>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Exam Name</th>
                  <th>Platform</th>
                  <th>Registration Date</th>
                  <th>Expected Completion</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {progress?.exams && progress.exams.length > 0 ? (
                  progress.exams.map((exam) => (
                    <tr key={exam._id}>
                      <td>
                        <strong>{exam.examName}</strong>
                      </td>
                      <td>{exam.platform}</td>
                      <td>{new Date(exam.registeredDate).toLocaleDateString()}</td>
                      <td>{new Date(exam.expectedCompletionDate).toLocaleDateString()}</td>
                      <td>
                        <StatusBadge $status={exam.status}>
                          {exam.status}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      No exams registered
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </Card>
      </Main>
    </Layout>
  );
}
