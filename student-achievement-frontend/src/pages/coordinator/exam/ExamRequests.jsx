// src/pages/coordinator/exam/ExamRequests.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { AppToast } from '../../../components/AppToast';
import { getPendingExamRequests, approveExamRequest, rejectExamRequest } from '../../../services/coordinatorExamService';
import { FiCheck, FiX } from 'react-icons/fi';

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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-top: 4px solid #667eea;

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1a202c;
    margin: 0 0 12px 0;
  }

  .student {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  .justification {
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
    font-size: 13px;
    color: #6b7280;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .actions {
    display: flex;
    gap: 12px;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  ${(props) => {
    if (props.$approve) {
      return `
        background: #dcfce7;
        color: #15803d;

        &:hover:not(:disabled) {
          background: #bbf7d0;
        }
      `;
    } else {
      return `
        background: #fee2e2;
        color: #7f1d1d;

        &:hover:not(:disabled) {
          background: #fecaca;
        }
      `;
    }
  }}

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

export default function ExamRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await getPendingExamRequests();
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      showToast('danger', error.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const handleApprove = async (requestId) => {
    try {
      setProcessing(requestId);
      await approveExamRequest(requestId, 'Approved');
      showToast('success', 'Exam request approved!');
      loadRequests();
    } catch (error) {
      console.error('Error approving:', error);
      showToast('danger', error.message || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setProcessing(requestId);
      await rejectExamRequest(requestId, 'Not suitable for program');
      showToast('success', 'Exam request rejected!');
      loadRequests();
    } catch (error) {
      console.error('Error rejecting:', error);
      showToast('danger', error.message || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <Loading>Loading exam requests...</Loading>
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
          <h1>📮 Exam Requests</h1>
          <p>Review and approve/reject exam requests from students</p>
        </PageHeader>

        {requests.length === 0 ? (
          <EmptyState>
            <h3>No pending requests</h3>
            <p>All exam requests have been processed</p>
          </EmptyState>
        ) : (
          <Grid>
            {requests.map((request) => (
              <Card key={request._id}>
                <h3>{request.examName}</h3>
                <div className="student">
                  <strong>From:</strong> {request.studentName} ({request.studentEmail})
                </div>
                <p style={{ fontSize: '12px', color: '#718096', marginBottom: '12px' }}>
                  <strong>Platform:</strong> {request.platform}
                </p>
                {request.category && (
                  <p style={{ fontSize: '12px', color: '#718096', marginBottom: '12px' }}>
                    <strong>Category:</strong> {request.category}
                  </p>
                )}
                {request.examDate && (
                  <p style={{ fontSize: '12px', color: '#718096', marginBottom: '12px' }}>
                    <strong>Exam Date:</strong> {new Date(request.examDate).toLocaleDateString()}
                  </p>
                )}
                {request.examRegisterLastDate && (
                  <p style={{ fontSize: '12px', color: '#718096', marginBottom: '12px' }}>
                    <strong>Course Register Last Date:</strong> {new Date(request.examRegisterLastDate).toLocaleDateString()}
                  </p>
                )}
                {request.examEnterOption && (
                  <p style={{ fontSize: '12px', color: '#718096', marginBottom: '12px' }}>
                    <strong>Exam Enter Option:</strong> {request.examEnterOption}
                  </p>
                )}
                {request.examLink && (
                  <p style={{ fontSize: '12px', color: '#718096', marginBottom: '12px' }}>
                    <strong>Exam Link:</strong> <a href={request.examLink} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'underline' }}>{request.examLink}</a>
                  </p>
                )}
                <div className="justification">
                  <strong style={{ color: '#2d3748' }}>Justification:</strong>
                  <p style={{ margin: '8px 0 0 0' }}>{request.justification}</p>
                </div>
                <div className="actions">
                  <Button
                    $approve
                    onClick={() => handleApprove(request._id)}
                    disabled={processing === request._id}
                  >
                    <FiCheck size={16} />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(request._id)}
                    disabled={processing === request._id}
                  >
                    <FiX size={16} />
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </Grid>
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
