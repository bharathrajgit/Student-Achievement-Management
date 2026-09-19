import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import BulkMarkUpload from '../../../components/BulkMarkUpload';
import api from '../../../services/api';
import {
  FiBarChart2,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiDownload,
  FiUpload,
  FiAlertCircle,
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
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${props => props.$variant === 'primary' ? '#667eea' : '#fff'};
  color: ${props => props.$variant === 'primary' ? '#fff' : '#333'};
  border: ${props => props.$variant === 'primary' ? 'none' : '1px solid #e2e8f0'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid ${props => props.$color};

  h3 {
    font-size: 12px;
    color: #64748b;
    text-transform: uppercase;
    margin: 0 0 12px 0;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 32px;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
  }

  .subtitle {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 8px;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  h2 {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 20px 0;
  }
`;

const MarkDistribution = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MarkBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .label {
    min-width: 80px;
    font-size: 14px;
    font-weight: 600;
    color: #475569;
  }

  .bar {
    flex: 1;
    height: 24px;
    background: ${props => props.$color};
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 8px;
    color: white;
    font-size: 12px;
    font-weight: 600;
  }

  .count {
    min-width: 40px;
    text-align: right;
    font-weight: 600;
    color: #1e293b;
  }
`;

const CourseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CourseItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid #667eea;

  .course-name {
    font-weight: 600;
    color: #1e293b;
  }

  .stats {
    display: flex;
    gap: 16px;
    font-size: 12px;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
`;

export function NptelDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/coordinator/nptel/dashboard');
      setDashboard(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const downloadCsvTemplate = async () => {
    try {
      const response = await api.get('/coordinator/nptel/export/sample-csv', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'exam-template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download template');
    }
  };

  const downloadAllExams = async () => {
    try {
      const response = await api.get('/coordinator/nptel/export/all-exams', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'nptel-all-exams.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to export records');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Layout>
      <Sidebar />
      <Main>
        <Header />

        <PageHeader>
          <h1>
            <FiBarChart2 /> NPTEL Exam Management Dashboard
          </h1>
          <p>Comprehensive analytics for all NPTEL exams and enrollments</p>
        </PageHeader>

        <ActionButtons>
          <Button $variant="primary" onClick={() => setShowBulkUpload(true)}>
            <FiUpload /> Bulk Upload Marks
          </Button>
          <Button onClick={downloadAllExams}>
            <FiDownload /> Export All Records
          </Button>
          <Button onClick={downloadCsvTemplate}>
            <FiDownload /> Download Template
          </Button>
        </ActionButtons>

        {showBulkUpload && (
          <BulkMarkUpload isOpen={showBulkUpload} onClose={() => setShowBulkUpload(false)} onSuccess={fetchDashboard} />
        )}

        {dashboard && (
          <>
            {/* Key Metrics */}
            <StatsGrid>
              <StatCard $color="#667eea">
                <h3>Total Enrollments</h3>
                <p className="value">{dashboard.totalEnrollments}</p>
                <p className="subtitle">{dashboard.totalStudents} unique students</p>
              </StatCard>

              <StatCard $color="#10b981">
                <h3>Pass Rate</h3>
                <p className="value">{dashboard.passRate}%</p>
                <p className="subtitle">Students passed</p>
              </StatCard>

              <StatCard $color="#f59e0b">
                <h3>Certificate Rate</h3>
                <p className="value">{dashboard.certificateRate}%</p>
                <p className="subtitle">With certificates</p>
              </StatCard>

              <StatCard $color="#8b5cf6">
                <h3>Average Marks</h3>
                <p className="value">{dashboard.averageMarks}</p>
                <p className="subtitle">Out of 100</p>
              </StatCard>
            </StatsGrid>

            {/* Charts */}
            <ChartsGrid>
              {/* Mark Distribution */}
              <Card>
                <h2>Mark Distribution</h2>
                <MarkDistribution>
                  {Object.entries(dashboard.markDistribution).map(([range, count]) => (
                    <MarkBar key={range}>
                      <div className="label">{range}</div>
                      <div
                        className="bar"
                        $color={range === '75-100' ? '#10b981' : range === '50-75' ? '#f59e0b' : '#ef4444'}
                        style={{
                          width: `${(count / dashboard.totalEnrollments) * 100}%`,
                          minWidth: '40px',
                        }}
                      >
                        {count > 0 && `${((count / dashboard.totalEnrollments) * 100).toFixed(0)}%`}
                      </div>
                      <div className="count">{count}</div>
                    </MarkBar>
                  ))}
                </MarkDistribution>
              </Card>

              {/* Top Courses */}
              <Card>
                <h2>Top Courses by Enrollment</h2>
                <CourseList>
                  {dashboard.topCourses.map((course, idx) => (
                    <CourseItem key={idx}>
                      <div className="course-name">{course.examName}</div>
                      <div className="stats">
                        <span>
                          <FiUsers size={14} /> {course.totalEnrolled}
                        </span>
                        <span>
                          <FiAward size={14} /> {course.passRate}%
                        </span>
                      </div>
                    </CourseItem>
                  ))}
                </CourseList>
              </Card>
            </ChartsGrid>
          </>
        )}
      </Main>
    </Layout>
  );
}

export default NptelDashboard;
