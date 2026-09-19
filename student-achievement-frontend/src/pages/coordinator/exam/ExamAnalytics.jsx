// src/pages/coordinator/Analytics.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { AppToast } from '../../../components/AppToast';
import { getDashboardOverview } from '../../../services/coordinatorExamService';
import { 
  FiBook, 
  FiUsers, 
  FiTrendingUp, 
  FiAlertTriangle,
  FiCheckCircle,
  FiAward,
  FiActivity,
  FiBarChart2,
  FiPieChart
} from 'react-icons/fi';

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

  @media (max-width: 1024px) {
    margin-left: 0;
    padding: 24px;
  }

  @media (max-width: 768px) {
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
  }

  p {
    color: #64748b;
    margin: 0;
    font-size: 15px;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 24px;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-left: 5px solid ${props => props.$color};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }

  .icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    background: ${props => props.$bg};
    color: ${props => props.$color};

    svg {
      width: 28px;
      height: 28px;
    }
  }

  .label {
    font-size: 13px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .value {
    font-size: 36px;
    font-weight: 900;
    color: #1e293b;
    margin: 0;
    line-height: 1;
  }

  @media (max-width: 768px) {
    padding: 20px;

    .value {
      font-size: 28px;
    }
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;

  h2 {
    font-size: 20px;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 24px 0;
    display: flex;
    align-items: center;
    gap: 10px;

    svg {
      width: 24px;
      height: 24px;
      color: #667eea;
    }
  }

  @media (max-width: 768px) {
    padding: 20px;

    h2 {
      font-size: 18px;
    }
  }
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const TopExamsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ExamItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s ease;
  border-left: 4px solid ${props => props.$color || '#667eea'};

  &:hover {
    background: #f1f5f9;
    transform: translateX(4px);
  }

  .info {
    flex: 1;

    .name {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .platform {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
    }
  }

  .count {
    font-size: 24px;
    font-weight: 900;
    color: ${props => props.$color || '#667eea'};
    margin-left: 16px;
  }
`;

const ActivityFeed = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActivityItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 12px;

  .icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${props => {
      if (props.$status === 'Passed') return '#dcfce7';
      if (props.$status === 'Failed') return '#fee2e2';
      return '#dbeafe';
    }};
    color: ${props => {
      if (props.$status === 'Passed') return '#166534';
      if (props.$status === 'Failed') return '#991b1b';
      return '#1e40af';
    }};

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .content {
    flex: 1;

    .text {
      font-size: 14px;
      color: #1e293b;
      font-weight: 600;
      margin-bottom: 4px;

      .highlight {
        color: #667eea;
        font-weight: 700;
      }

      .exam {
        color: #10b981;
        font-weight: 700;
      }
    }

    .time {
      font-size: 12px;
      color: #64748b;
    }
  }
`;

const StatusCard = styled.div`
  padding: 20px;
  background: ${props => props.$bg};
  border-radius: 12px;
  text-align: center;

  .label {
    font-size: 12px;
    font-weight: 700;
    color: ${props => props.$color};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .value {
    font-size: 32px;
    font-weight: 900;
    color: ${props => props.$color};
  }

  @media (max-width: 768px) {
    padding: 16px;

    .value {
      font-size: 28px;
    }
  }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 20px;
`;

const ProgressBar = styled.div`
  margin-top: 12px;
  background: #e2e8f0;
  height: 8px;
  border-radius: 10px;
  overflow: hidden;

  .fill {
    height: 100%;
    background: linear-gradient(90deg, ${props => props.$color1} 0%, ${props => props.$color2} 100%);
    width: ${props => props.$percentage}%;
    transition: width 1s ease;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
  font-size: 16px;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #64748b;

  h3 {
    font-size: 18px;
    margin-bottom: 8px;
    color: #1e293b;
    font-weight: 700;
  }

  p {
    font-size: 14px;
  }
`;

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
  loadOverview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const loadOverview = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading analytics...');
      const response = await getDashboardOverview();
      console.log('📊 Analytics Response:', response);
      
      if (response && response.data) {
        setOverview(response.data);
        console.log('✅ Overview set:', response.data);
      } else {
        console.log('⚠️ No data in response');
      }
    } catch (error) {
      console.error('❌ Error loading overview:', error);
      showToast('danger', error.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const getActivityIcon = (status) => {
    if (status === 'Passed') return <FiCheckCircle />;
    if (status === 'Failed') return <FiAlertTriangle />;
    return <FiActivity />;
  };

  if (loading) {
    return (
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <Loading>⏳ Loading analytics...</Loading>
        </Main>
      </Layout>
    );
  }

  if (!overview || !overview.summary) {
    return (
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <EmptyState>
            <h3>📊 No data available</h3>
            <p>Analytics data will appear once students register for exams</p>
          </EmptyState>
        </Main>
      </Layout>
    );
  }

  const { summary, topExams = [], recentActivity = [] } = overview;

  console.log('🎨 Rendering with topExams:', topExams);
  console.log('🎨 topExams length:', topExams.length);
  console.log('🎨 topExams is array:', Array.isArray(topExams));

  return (
  <Layout>
    <Sidebar />
    <Header />
    <Main>
      <PageHeader>
        <h1>
          <span>📊</span>
          Exam Analytics
        </h1>
        <p>Comprehensive overview of exam registrations and performance metrics</p>
      </PageHeader>

      {/* Summary Stats */}
      <StatsGrid>
        <StatCard $bg="#e0e7ff" $color="#667eea">
          <div className="icon">
            <FiBook />
          </div>
          <div className="label">Total Exams</div>
          <p className="value">{summary.totalExamsInCatalog || 0}</p>
        </StatCard>

        <StatCard $bg="#dbeafe" $color="#3b82f6">
          <div className="icon">
            <FiUsers />
          </div>
          <div className="label">Total Students</div>
          <p className="value">{summary.totalStudents || 0}</p>
        </StatCard>

        <StatCard $bg="#fef3c7" $color="#f59e0b">
          <div className="icon">
            <FiBarChart2 />
          </div>
          <div className="label">Registrations</div>
          <p className="value">{summary.totalRegistrations || 0}</p>
        </StatCard>

        <StatCard $bg="#fee2e2" $color="#ef4444">
          <div className="icon">
            <FiAlertTriangle />
          </div>
          <div className="label">Pending</div>
          <p className="value">{summary.pendingVerifications || 0}</p>
        </StatCard>
      </StatsGrid>

      {/* Completion Rate */}
      <Card>
        <h2>
          <FiTrendingUp />
          Completion Rate
        </h2>
        <div style={{ fontSize: '48px', fontWeight: '900', color: '#10b981', marginBottom: '12px' }}>
          {summary.completionRate || 0}%
        </div>
        <ProgressBar $percentage={summary.completionRate || 0} $color1="#10b981" $color2="#059669">
          <div className="fill"></div>
        </ProgressBar>
        <p style={{ marginTop: '12px', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
          {summary.totalRegistrations > 0 
            ? `${Math.round((summary.completionRate / 100) * summary.totalRegistrations)} of ${summary.totalRegistrations} registrations completed`
            : 'No registrations yet'
          }
        </p>
      </Card>

      {/* Pass Rate with Passed/Failed */}
      <Card>
        <h2>
          <FiAward />
          Pass Rate
        </h2>
        <div style={{ fontSize: '48px', fontWeight: '900', color: '#667eea', marginBottom: '12px' }}>
          {summary.passRate || 0}%
        </div>
        <ProgressBar $percentage={summary.passRate || 0} $color1="#667eea" $color2="#764ba2">
          <div className="fill"></div>
        </ProgressBar>
        <StatusGrid>
          <StatusCard $bg="#dcfce7" $color="#166534">
            <div className="label">Passed</div>
            <div className="value">{summary.totalPassed || 0}</div>
          </StatusCard>
          <StatusCard $bg="#fee2e2" $color="#991b1b">
            <div className="label">Failed</div>
            <div className="value">{summary.totalFailed || 0}</div>
          </StatusCard>
        </StatusGrid>
      </Card>

      {/* Top Exams & Recent Activity */}
      <SectionGrid>
        <Card>
          <h2>
            <FiPieChart />
            Top Performing Exams
          </h2>
          {topExams && topExams.length > 0 ? (
            <TopExamsList>
              {topExams.map((exam, index) => (
                <ExamItem 
                  key={index} 
                  $color={
                    index === 0 ? '#667eea' : 
                    index === 1 ? '#10b981' : 
                    index === 2 ? '#f59e0b' : '#64748b'
                  }
                >
                  <div className="info">
                    <div className="name">{exam.examName || 'Unknown Exam'}</div>
                    <div className="platform">{exam.platform || 'N/A'}</div>
                  </div>
                  <div className="count">{exam.count || 0}</div>
                </ExamItem>
              ))}
            </TopExamsList>
          ) : (
            <EmptyState>
              <h3>📭 No exam data</h3>
              <p>Top exams will appear here once students complete exams</p>
            </EmptyState>
          )}
        </Card>

        <Card>
          <h2>
            <FiActivity />
            Recent Activity
          </h2>
          {recentActivity && recentActivity.length > 0 ? (
            <ActivityFeed>
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} $status={activity.status}>
                  <div className="icon-wrapper">
                    {getActivityIcon(activity.status)}
                  </div>
                  <div className="content">
                    <div className="text">
                      <span className="highlight">{activity.studentName}</span>
                      {' '}
                      {activity.status === 'Passed' && 'passed'}
                      {activity.status === 'Failed' && 'failed'}
                      {' '}
                      <span className="exam">{activity.examName}</span>
                    </div>
                    <div className="time">Recently</div>
                  </div>
                </ActivityItem>
              ))}
            </ActivityFeed>
          ) : (
            <EmptyState>
              <h3>📭 No recent activity</h3>
              <p>Recent verifications will appear here</p>
            </EmptyState>
          )}
        </Card>
      </SectionGrid>

      {toast.show && (
        <AppToast
          show={toast.show}
          onClose={() => setToast({ show: false, type: '', message: '' })}
          type={toast.type}
          message={toast.message}
        />
      )}
    </Main>
  </Layout>
);
}
