// src/pages/student/exam/MyRequests.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { AppToast } from '../../../components/AppToast';
import { getMyExamRequests } from '../../../services/studentExamService';
import { FiCalendar } from 'react-icons/fi';

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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
  border-left: 4px solid ${(props) => {
    switch (props.$status) {
      case 'Pending':
        return '#f59e0b';
      case 'Approved':
        return '#10b981';
      case 'Rejected':
        return '#ef4444';
      default:
        return '#667eea';
    }
  }};

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1a202c;
    margin: 0 0 8px 0;
  }

  .platform {
    display: inline-block;
    padding: 4px 12px;
    background: #f3f4f6;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 12px;
  }

  .meta {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;

    p {
      margin: 6px 0;
      font-size: 13px;
      color: #6b7280;

      strong {
        color: #2d3748;
      }
    }
  }

  .justification {
    margin-bottom: 12px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
    font-size: 13px;
    color: #6b7280;
    line-height: 1.5;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) => {
    switch (props.$status) {
      case 'Pending':
        return '#fef3c7';
      case 'Approved':
        return '#dcfce7';
      case 'Rejected':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case 'Pending':
        return '#78350f';
      case 'Approved':
        return '#15803d';
      case 'Rejected':
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

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await getMyExamRequests();
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

  if (loading) {
    return (
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <Loading>Loading your requests...</Loading>
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
          <h1>📋 My Exam Requests</h1>
          <p>Track the status of your exam requests</p>
        </PageHeader>

        {requests.length === 0 ? (
          <EmptyState>
            <h3>No requests yet</h3>
            <p>Request a new exam to get started</p>
          </EmptyState>
        ) : (
          <Grid>
            {requests.map((request) => (
              <Card key={request._id} $status={request.status}>
                <h3>{request.examName}</h3>
                <span className="platform">{request.platform}</span>
                
                <div className="meta">
                  <p>
                    <strong>Status:</strong>
                    <div style={{ marginTop: '6px' }}>
                      <StatusBadge $status={request.status}>
                        {request.status}
                      </StatusBadge>
                    </div>
                  </p>
                  <p>
                    <FiCalendar size={14} style={{ marginRight: '4px' }} />
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                  {request.category && (
                    <p>
                      <strong>Category:</strong> {request.category}
                    </p>
                  )}
                </div>

                <div className="justification">
                  <strong style={{ color: '#2d3748' }}>Justification:</strong>
                  <p style={{ margin: '8px 0 0 0' }}>{request.justification}</p>
                </div>

                {request.feedback && (
                  <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '600', color: '#15803d' }}>
                      Coordinator Feedback:
                    </p>
                    <p style={{ margin: '0', fontSize: '13px', color: '#166534' }}>
                      {request.feedback}
                    </p>
                  </div>
                )}
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
