import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import api from '../../../services/api';
import { FiClock, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const Layout = styled.div`
  display: flex;
`;

const Main = styled.main`
  flex: 1;
  margin-left: 280px;
  margin-top: 80px;
  padding: 32px;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
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
    font-size: 32px;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  p {
    color: #64748b;
    margin: 0;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 24px;
    }
  }
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid ${props => props.$color};

  .label {
    font-size: 12px;
    color: #64748b;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .value {
    font-size: 28px;
    font-weight: 800;
    color: #1e293b;
  }

  .subtitle {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 8px;
  }
`;

const Table = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  @media (max-width: 768px) {
    background: transparent;
    box-shadow: none;
    overflow: visible;
  }
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8fafc;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;

    &::before {
      content: attr(data-label);
      font-weight: 600;
      color: #64748b;
      font-size: 12px;
      text-transform: uppercase;
    }
  }

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    margin-bottom: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    > div {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;

      &:last-child {
        border-bottom: none;
      }

      &::before {
        content: attr(data-label);
        font-weight: 600;
        color: #64748b;
        font-size: 12px;
        margin-right: 8px;
      }
    }
  }
`;

const StudentName = styled.div`
  font-weight: 600;
  color: #1e293b;
`;

const ExamName = styled.div`
  color: #475569;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.$status === 'overdue' ? '#fee2e2' : '#dbeafe'};
  color: ${props => props.$status === 'overdue' ? '#dc2626' : '#0284c7'};

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 3px 10px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: #64748b;

  svg {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  h3 {
    margin: 0 0 8px 0;
    color: #1e293b;
  }

  p {
    margin: 0;
  }

  @media (max-width: 768px) {
    padding: 32px 16px;

    svg {
      font-size: 36px;
    }

    h3 {
      font-size: 16px;
    }

    p {
      font-size: 14px;
    }
  }
`;

export function ApprovalQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApprovalQueue();
  }, []);

  const fetchApprovalQueue = async () => {
    try {
      setLoading(true);
      const response = await api.get('/coordinator/nptel/approval-queue');
      setQueue(response.data.data.queue || []);
      setError(null);
    } catch (err) {
      console.error('Approval queue error:', err);
      setError('Failed to load approval queue');
    } finally {
      setLoading(false);
    }
  };

  const fixRegistrationDates = async () => {
    try {
      const response = await api.post('/coordinator/nptel/fix-registration-dates');
      alert(`Fixed ${response.data.data.updated} registration dates`);
      fetchApprovalQueue();
    } catch (err) {
      console.error('Fix error:', err);
      alert('Failed to fix registration dates');
    }
  };

  const overdueCount = queue.filter(q => q.slaStatus === '⚠️ Overdue').length;
  const onTrackCount = queue.length - overdueCount;

  return (
    <Layout>
      <Sidebar />
      <Main>
        <Header />

        <PageHeader>
          <h1>
            <FiClock /> Approval Queue
          </h1>
          <p>Track pending exam mark submissions and SLA status</p>
          <button
            onClick={fixRegistrationDates}
            style={{
              marginTop: '12px',
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              width: 'fit-content'
            }}
          >
            Fix Registration Dates
          </button>
        </PageHeader>

        <SummaryCards>
          <Card $color="#667eea">
            <div className="label">Total Pending</div>
            <div className="value">{queue.length}</div>
            <div className="subtitle">Awaiting marks submission</div>
          </Card>

          <Card $color="#10b981">
            <div className="label">On Track</div>
            <div className="value">{onTrackCount}</div>
            <div className="subtitle">Within 30-day SLA</div>
          </Card>

          <Card $color="#ef4444">
            <div className="label">Overdue</div>
            <div className="value">{overdueCount}</div>
            <div className="subtitle">Exceeding 30-day SLA</div>
          </Card>
        </SummaryCards>

        <Table>
          {queue.length === 0 ? (
            <EmptyState>
              <FiCheckCircle />
              <h3>No Pending Approvals</h3>
              <p>All exam submissions are up to date! 🎉</p>
            </EmptyState>
          ) : (
            <>
              <TableHeader>
                <div>Student Name</div>
                <div>Exam Name</div>
                <div>Registered</div>
                <div>Days Pending</div>
                <div>Status</div>
                <div>SLA</div>
              </TableHeader>

              {queue.map((item) => (
                <TableRow key={item._id}>
                  <StudentName data-label="Student Name">{item.studentName}</StudentName>
                  <ExamName data-label="Exam Name">{item.examName}</ExamName>
                  <div data-label="Registered">{new Date(item.registrationDate).toLocaleDateString()}</div>
                  <div data-label="Days Pending">{item.daysPending} days</div>
                  <Badge $status="pending" data-label="Status">{item.status}</Badge>
                  <Badge $status={item.slaStatus === '⚠️ Overdue' ? 'overdue' : 'on-track'} data-label="SLA">
                    {item.slaStatus}
                  </Badge>
                </TableRow>
              ))}
            </>
          )}
        </Table>
      </Main>
    </Layout>
  );
}

export default ApprovalQueue;
