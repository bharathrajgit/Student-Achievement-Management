// src/pages/student/exam/MyExams.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { AppToast } from '../../../components/AppToast';
import { getMyExams } from '../../../services/studentExamService';
import { FiUpload, FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';

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

const TableWrapper = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
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
  display: inline-flex;
  align-items: center;
  gap: 6px;

  ${(props) => {
    switch (props.$status) {
      case 'Registered':
        return `
          background: #dbeafe;
          color: #0c4a6e;
        `;
      case 'Submitted':
        return `
          background: #fef3c7;
          color: #78350f;
        `;
      case 'Passed':
        return `
          background: #dcfce7;
          color: #15803d;
        `;
      case 'Failed':
        return `
          background: #fee2e2;
          color: #7f1d1d;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
        `;
    }
  }}
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #718096;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #718096;

  h3 {
    font-size: 18px;
    margin-bottom: 8px;
    color: #4a5568;
  }
`;

export default function MyExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadMyExams();
  }, []);

  const loadMyExams = async () => {
    try {
      setLoading(true);
      const response = await getMyExams();
      setExams(response.data || []);
    } catch (error) {
      console.error('Error loading exams:', error);
      showToast('danger', error.message || 'Failed to load your exams');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const handleUpload = (registrationId) => {
    navigate(`/student/my-exams/${registrationId}/upload`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Registered':
        return <FiClock size={14} />;
      case 'Submitted':
        return <FiCheckCircle size={14} />;
      case 'Passed':
        return <FiCheckCircle size={14} />;
      case 'Failed':
        return <FiCheckCircle size={14} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <Loading>Loading your exams...</Loading>
        </Main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Sidebar />
      <Header />
      <Main>
        <PageHeader>
          <h1>✅ My Exams</h1>
          <p>View and manage your registered exams</p>
        </PageHeader>

        {exams.length === 0 ? (
          <EmptyState>
            <h3>No exams registered</h3>
            <p>Visit the exam catalog to register for exams</p>
          </EmptyState>
        ) : (
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Exam Name</th>
                  <th>Platform</th>
                  <th>Expected Completion</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam._id}>
                    <td>
                      <strong>{exam.examName}</strong>
                    </td>
                    <td>{exam.platform}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiCalendar size={14} color="#667eea" />
                        {new Date(exam.expectedCompletionDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <StatusBadge $status={exam.status}>
                        {getStatusIcon(exam.status)}
                        {exam.status}
                      </StatusBadge>
                    </td>
                    <td>
                      {(exam.status === 'Registered' || exam.status === 'Failed') && (
                        <ActionButton onClick={() => handleUpload(exam._id)}>
                          <FiUpload size={14} style={{ marginRight: '6px' }} />
                          Upload Certificate
                        </ActionButton>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        )}
      </Main>

      {toast.show && (
        <AppToast
          show={toast.show}
          onClose={() => setToast({ show: false, type: '', message: '' })}
          type={toast.type}
          message={toast.message}
        />
      )}
    </Layout>
  );
}
