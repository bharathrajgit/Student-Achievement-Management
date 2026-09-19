import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import api from '../services/api';
import { 
  FiTrendingUp, 
  FiUsers, 
  FiCheckCircle, 
  FiStar,
  FiBook,
  FiBarChart2,
  FiClock
} from 'react-icons/fi';


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

const Section = styled.section`
  margin-bottom: 48px;
  animation: fadeIn 0.6s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 24px 0;

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 16px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
    border-color: #667eea;
  }

  @media (max-width: 768px) {
    padding: 16px;

    &:hover {
      transform: none;
    }
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${(p) => p.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: ${(p) => p.$color};

  svg {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    margin-bottom: 12px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const StatLabel = styled.p`
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 11px;
    margin-bottom: 6px;
  }
`;

const StatValue = styled.p`
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #1a202c;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const SubValue = styled.p`
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #718096;
`;

const TableWrapper = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;

  @media (max-width: 768px) {
    overflow-x: auto;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;

  @media (max-width: 768px) {
    min-width: 100%;
    font-size: 13px;
  }

  thead {
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  }

  th {
    padding: 16px 20px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: #2d3748;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #e2e8f0;
    white-space: nowrap;

    @media (max-width: 768px) {
      padding: 12px 16px;
      font-size: 11px;
    }
  }

  td {
    padding: 16px 20px;
    font-size: 14px;
    color: #2d3748;
    border-bottom: 1px solid #e2e8f0;

    @media (max-width: 768px) {
      padding: 12px 16px;
      font-size: 13px;
    }
  }

  tbody tr {
    transition: all 0.2s ease;

    &:hover {
      background: #f7fafc;
    }

    &:last-child td {
      border-bottom: none;
    }
  }
`;

const MobileCardList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
`;

const MobileCardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const MobileLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MobileValue = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
`;

const DesktopTable = styled.div`
  display: block;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Badge = styled.span`
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;

  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 11px;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 40px;
  color: #718096;
  font-size: 16px;

  @media (max-width: 768px) {
    padding: 24px;
    font-size: 14px;
  }
`;


export function Dashboard() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [stats, setStats] = useState(null);
  const [topAchievers, setTopAchievers] = useState([]);
  const [examStats, setExamStats] = useState(null);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const loadData = async () => {
    try {
      setLoading(true);

      console.log('🔍 Current User:', {
        email: user?.email,
        role: user?.role,
        tenantId: user?.tenantId,
      });

      if (user?.role === 'superadmin') {
        const res = await api.get('/superadmin/tenants');
        console.log('📦 Tenants Response:', res.data);
        const data = res.data.data;

        if (Array.isArray(data)) {
          setTenants(data);
        } else if (data && typeof data === 'object') {
          setTenants(data.tenants || data.data || []);
        } else {
          setTenants([]);
        }
      } else if (user?.role === 'coordinator' || user?.role === 'sub-coordinator') {
        console.log('📊 Fetching stats for tenantId:', user?.tenantId);

        try {
          // Existing stats
          const [statsRes, achieversRes] = await Promise.all([
            api.get('/stats/students'),
            api.get('/stats/top-achievers?limit=5'),
          ]);

          console.log('📈 Stats Response:', statsRes.data);
          console.log('🏆 Top Achievers Response:', achieversRes.data);

          setStats(statsRes.data.data);
          setTopAchievers(achieversRes.data.data || []);
        } catch (error) {
          console.warn('⚠️ Error fetching existing stats:', error.message);
          setStats({ total: 0, active: 0, pendingCount: 0 });
          setTopAchievers([]);
        }

        // NEW: Exam Statistics
        try {
          const examOverviewRes = await api.get('/coordinator/analytics/overview');
          console.log('📊 Exam Overview Response:', examOverviewRes.data);
          
          if (examOverviewRes.data?.data) {
            setExamStats(examOverviewRes.data.data);
          }
        } catch (error) {
          console.warn('⚠️ Error fetching exam stats:', error.message);
          setExamStats(null);
        }

        // NEW: Pending Submissions
        try {
          const submissionsRes = await api.get('/coordinator/submissions/pending?limit=5');
          console.log('📋 Pending Submissions Response:', submissionsRes.data);
          
          if (submissionsRes.data?.data) {
            setPendingSubmissions(submissionsRes.data.data);
          }
        } catch (error) {
          console.warn('⚠️ Error fetching pending submissions:', error.message);
          setPendingSubmissions([]);
        }
      } else if (user?.role === 'student') {
        const statsRes = await api.get('/stats/student-stats');
        console.log('📚 Student Stats Response:', statsRes.data);
        setStats(statsRes.data.data);
      } else {
        setTopAchievers([]);
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      console.error('Error details:', error.response?.data);

      if (user?.role === 'coordinator' || user?.role === 'sub-coordinator') {
        setStats({ total: 0, active: 0, pendingCount: 0 });
        setTopAchievers([]);
        setExamStats(null);
        setPendingSubmissions([]);
      } else if (user?.role === 'student') {
        setStats({
          stats: {
            totalAchievements: 0,
            profileScore: 0,
            byStatus: { Pending: 0, Verified: 0, Rejected: 0 },
          },
        });
      }
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
          <Loading>Loading...</Loading>
        </Main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Sidebar />
      <Header />
      <Main>
        {user?.role === 'superadmin' && (
          <Section>
            <SectionTitle>Tenant Overview</SectionTitle>

            <DesktopTable>
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(tenants) && tenants.length > 0 ? (
                      tenants.map((tenant) => (
                        <tr key={tenant._id}>
                          <td>
                            <strong>{tenant.name}</strong>
                          </td>
                          <td>{tenant.code}</td>
                          <td>
                            <Badge
                              style={{
                                background: '#e6fffa',
                                color: '#0f766e',
                              }}
                            >
                              {tenant.subscription?.plan || 'N/A'}
                            </Badge>
                          </td>
                          <td>
                            <Badge
                              style={{
                                background:
                                  tenant.subscription?.status === 'active'
                                    ? '#dcfce7'
                                    : '#fee2e2',
                                color:
                                  tenant.subscription?.status === 'active'
                                    ? '#166534'
                                    : '#991b1b',
                              }}
                            >
                              {tenant.subscription?.status || 'N/A'}
                            </Badge>
                          </td>
                          <td>
                            {new Date(tenant.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center' }}>
                          No tenants found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </TableWrapper>
            </DesktopTable>

            <MobileCardList>
              {Array.isArray(tenants) && tenants.length > 0 ? (
                tenants.map((tenant) => (
                  <MobileCard key={tenant._id}>
                    <MobileCardRow>
                      <MobileLabel>Name</MobileLabel>
                      <MobileValue>
                        <strong>{tenant.name}</strong>
                      </MobileValue>
                    </MobileCardRow>
                    <MobileCardRow>
                      <MobileLabel>Code</MobileLabel>
                      <MobileValue>{tenant.code}</MobileValue>
                    </MobileCardRow>
                    <MobileCardRow>
                      <MobileLabel>Plan</MobileLabel>
                      <Badge
                        style={{
                          background: '#e6fffa',
                          color: '#0f766e',
                        }}
                      >
                        {tenant.subscription?.plan || 'N/A'}
                      </Badge>
                    </MobileCardRow>
                    <MobileCardRow>
                      <MobileLabel>Status</MobileLabel>
                      <Badge
                        style={{
                          background:
                            tenant.subscription?.status === 'active'
                              ? '#dcfce7'
                              : '#fee2e2',
                          color:
                            tenant.subscription?.status === 'active'
                              ? '#166534'
                              : '#991b1b',
                        }}
                      >
                        {tenant.subscription?.status || 'N/A'}
                      </Badge>
                    </MobileCardRow>
                    <MobileCardRow>
                      <MobileLabel>Created</MobileLabel>
                      <MobileValue>
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </MobileValue>
                    </MobileCardRow>
                  </MobileCard>
                ))
              ) : (
                <MobileCard>
                  <p style={{ textAlign: 'center', margin: 0 }}>
                    No tenants found
                  </p>
                </MobileCard>
              )}
            </MobileCardList>
          </Section>
        )}

        {(user?.role === 'coordinator' || user?.role === 'sub-coordinator') && (
          <>
            {/* EXISTING SECTION */}
            <Section>
              <SectionTitle>Student Statistics</SectionTitle>
              <Grid>
                <StatCard>
                  <IconWrapper $bg="#e0e7ff" $color="#667eea">
                    <FiUsers />
                  </IconWrapper>
                  <StatLabel>Total Students</StatLabel>
                  <StatValue>{stats?.total || 0}</StatValue>
                </StatCard>

                <StatCard>
                  <IconWrapper $bg="#dbeafe" $color="#3b82f6">
                    <FiTrendingUp />
                  </IconWrapper>
                  <StatLabel>Active Students</StatLabel>
                  <StatValue>{stats?.active || 0}</StatValue>
                </StatCard>

                <StatCard>
                  <IconWrapper $bg="#fef3c7" $color="#f59e0b">
                    <FiCheckCircle />
                  </IconWrapper>
                  <StatLabel>Pending Achievements</StatLabel>
                  <StatValue>{stats?.pendingCount || 0}</StatValue>
                </StatCard>
              </Grid>
            </Section>

            {/* NEW: EXAM SECTION */}
            {examStats && (
              <Section>
                <SectionTitle>📚 Exam Statistics</SectionTitle>
                <Grid>
                  <StatCard>
                    <IconWrapper $bg="#dcfce7" $color="#16a34a">
                      <FiBook />
                    </IconWrapper>
                    <StatLabel>Total Registrations</StatLabel>
                    <StatValue>{examStats?.summary?.totalRegistrations || 0}</StatValue>
                    <SubValue>
                      {examStats?.summary?.totalStudents || 0} students
                    </SubValue>
                  </StatCard>

                  <StatCard>
                    <IconWrapper $bg="#dbeafe" $color="#3b82f6">
                      <FiClock />
                    </IconWrapper>
                    <StatLabel>Pending Verifications</StatLabel>
                    <StatValue>{examStats?.summary?.pendingVerifications || 0}</StatValue>
                  </StatCard>

                  <StatCard>
                    <IconWrapper $bg="#dcfce7" $color="#16a34a">
                      <FiCheckCircle />
                    </IconWrapper>
                    <StatLabel>Completion Rate</StatLabel>
                    <StatValue>{examStats?.summary?.completionRate || 0}%</StatValue>
                  </StatCard>

                  <StatCard>
                    <IconWrapper $bg="#fce7f3" $color="#be185d">
                      <FiBarChart2 />
                    </IconWrapper>
                    <StatLabel>Pass Rate</StatLabel>
                    <StatValue>{examStats?.summary?.passRate || 0}%</StatValue>
                  </StatCard>
                </Grid>
              </Section>
            )}

            {/* TOP ACHIEVERS */}
            <Section>
              <SectionTitle>Top Achievers</SectionTitle>

              <DesktopTable>
                <TableWrapper>
                  <Table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Roll Number</th>
                        <th>Profile Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(topAchievers) && topAchievers.length > 0 ? (
                        topAchievers.map((achiever) => (
                          <tr key={achiever._id}>
                            <td>
                              <strong>{achiever.name}</strong>
                            </td>
                            <td>{achiever.rollNumber}</td>
                            <td>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                }}
                              >
                                <FiStar
                                  style={{
                                    color: '#f59e0b',
                                    width: '16px',
                                    height: '16px',
                                  }}
                                />
                                <strong>
                                  {achiever.profileStats?.profileScore || 0}
                                </strong>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" style={{ textAlign: 'center' }}>
                            No achievers found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </TableWrapper>
              </DesktopTable>

              <MobileCardList>
                {Array.isArray(topAchievers) && topAchievers.length > 0 ? (
                  topAchievers.map((achiever) => (
                    <MobileCard key={achiever._id}>
                      <MobileCardRow>
                        <MobileLabel>Name</MobileLabel>
                        <MobileValue>
                          <strong>{achiever.name}</strong>
                        </MobileValue>
                      </MobileCardRow>
                      <MobileCardRow>
                        <MobileLabel>Roll Number</MobileLabel>
                        <MobileValue>{achiever.rollNumber}</MobileValue>
                      </MobileCardRow>
                      <MobileCardRow>
                        <MobileLabel>Score</MobileLabel>
                        <MobileValue>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <FiStar
                              style={{
                                color: '#f59e0b',
                                width: '14px',
                                height: '14px',
                              }}
                            />
                            <strong>
                              {achiever.profileStats?.profileScore || 0}
                            </strong>
                          </div>
                        </MobileValue>
                      </MobileCardRow>
                    </MobileCard>
                  ))
                ) : (
                  <MobileCard>
                    <p style={{ textAlign: 'center', margin: 0 }}>
                      No achievers found
                    </p>
                  </MobileCard>
                )}
              </MobileCardList>
            </Section>

            {/* NEW: PENDING SUBMISSIONS */}
            {pendingSubmissions && pendingSubmissions.length > 0 && (
              <Section>
                <SectionTitle>⏳ Recent Pending Submissions</SectionTitle>

                <DesktopTable>
                  <TableWrapper>
                    <Table>
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Exam Name</th>
                          <th>Marks</th>
                          <th>Submitted Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingSubmissions.map((submission) => (
                          <tr key={submission._id}>
                            <td>
                              <strong>{submission.studentName}</strong>
                            </td>
                            <td>{submission.examName}</td>
                            <td>
                              {submission.marksObtained}/{submission.totalMarks}
                            </td>
                            <td>
                              {new Date(submission.submittedDate).toLocaleDateString()}
                            </td>
                            <td>
                              <Badge
                                style={{
                                  background: '#fef3c7',
                                  color: '#78350f',
                                }}
                              >
                                {submission.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableWrapper>
                </DesktopTable>

                <MobileCardList>
                  {pendingSubmissions.map((submission) => (
                    <MobileCard key={submission._id}>
                      <MobileCardRow>
                        <MobileLabel>Student</MobileLabel>
                        <MobileValue>
                          <strong>{submission.studentName}</strong>
                        </MobileValue>
                      </MobileCardRow>
                      <MobileCardRow>
                        <MobileLabel>Exam</MobileLabel>
                        <MobileValue>{submission.examName}</MobileValue>
                      </MobileCardRow>
                      <MobileCardRow>
                        <MobileLabel>Marks</MobileLabel>
                        <MobileValue>
                          {submission.marksObtained}/{submission.totalMarks}
                        </MobileValue>
                      </MobileCardRow>
                      <MobileCardRow>
                        <MobileLabel>Submitted</MobileLabel>
                        <MobileValue>
                          {new Date(submission.submittedDate).toLocaleDateString()}
                        </MobileValue>
                      </MobileCardRow>
                      <MobileCardRow>
                        <MobileLabel>Status</MobileLabel>
                        <Badge
                          style={{
                            background: '#fef3c7',
                            color: '#78350f',
                          }}
                        >
                          {submission.status}
                        </Badge>
                      </MobileCardRow>
                    </MobileCard>
                  ))}
                </MobileCardList>
              </Section>
            )}
          </>
        )}

        {user?.role === 'student' && (
          <Section>
            <SectionTitle>My Statistics</SectionTitle>
            <Grid>
              <StatCard>
                <IconWrapper $bg="#dcfce7" $color="#16a34a">
                  <FiCheckCircle />
                </IconWrapper>
                <StatLabel>Total Achievements</StatLabel>
                <StatValue>{stats?.stats?.totalAchievements || 0}</StatValue>
              </StatCard>

              <StatCard>
                <IconWrapper $bg="#fce7f3" $color="#be185d">
                  <FiStar />
                </IconWrapper>
                <StatLabel>Profile Score</StatLabel>
                <StatValue>{stats?.stats?.profileScore || 0}</StatValue>
              </StatCard>

              <StatCard>
                <IconWrapper $bg="#e0e7ff" $color="#667eea">
                  <FiTrendingUp />
                </IconWrapper>
                <StatLabel>Verified</StatLabel>
                <StatValue>{stats?.stats?.byStatus?.Verified || 0}</StatValue>
              </StatCard>

              <StatCard>
                <IconWrapper $bg="#fef3c7" $color="#f59e0b">
                  <FiCheckCircle />
                </IconWrapper>
                <StatLabel>Pending</StatLabel>
                <StatValue>{stats?.stats?.byStatus?.Pending || 0}</StatValue>
              </StatCard>
            </Grid>
          </Section>
        )}
      </Main>
    </Layout>
  );
}
