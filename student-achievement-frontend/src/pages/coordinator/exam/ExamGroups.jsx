// src/pages/coordinator/exam/ExamGroups.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { AppToast } from '../../../components/AppToast';
import { getExamGroups } from '../../../services/coordinatorExamService';
import { 
  FiUsers, 
  FiTrendingUp, 
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiEye,
  FiSearch
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

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
  }

  p {
    color: #64748b;
    margin: 0;
    font-size: 15px;
  }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-left: 4px solid ${props => props.$color || '#667eea'};

  .stat-label {
    font-size: 13px;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 800;
    color: #1e293b;
  }
`;

const SearchFilterBar = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 250px;
  position: relative;

  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: #64748b;
    pointer-events: none;
  }

  input {
    width: 100%;
    padding: 14px 16px 14px 48px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    color: #1e293b;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &::placeholder {
      color: #94a3b8;
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: auto;
  }
`;

const FilterSelect = styled.select`
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:hover {
    border-color: #cbd5e1;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ResultCount = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
  padding: 14px 20px;
  background: #f8fafc;
  border-radius: 12px;
  white-space: nowrap;

  span {
    color: #667eea;
    font-weight: 800;
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
  }
`;

const ClearButton = styled.button`
  padding: 14px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #ef4444;
    color: #ef4444;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-top: 4px solid ${props => {
    if (props.$warning === 'critical') return '#ef4444';
    if (props.$warning === 'low') return '#f59e0b';
    return '#10b981';
  }};
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;

    h3 {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      flex: 1;
      line-height: 1.4;
    }
  }

  .platform-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    white-space: nowrap;
  }

  .warning-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${props => {
      if (props.$warning === 'critical') return '#fee2e2';
      if (props.$warning === 'low') return '#fef3c7';
      return '#dcfce7';
    }};
    color: ${props => {
      if (props.$warning === 'critical') return '#dc2626';
      if (props.$warning === 'low') return '#d97706';
      return '#16a34a';
    }};
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 10px;
    transition: background 0.2s ease;

    &:hover {
      background: #f1f5f9;
    }

    svg {
      width: 22px;
      height: 22px;
      color: #667eea;
      flex-shrink: 0;
    }

    .info {
      flex: 1;

      .label {
        font-size: 12px;
        color: #64748b;
        font-weight: 600;
        margin-bottom: 2px;
      }

      .value {
        font-size: 20px;
        font-weight: 800;
        color: #1e293b;
      }
    }
  }

  .status-breakdown {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 2px solid #f1f5f9;

    .status-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #64748b;
      font-weight: 600;

      svg {
        width: 16px;
        height: 16px;
      }

      .count {
        font-weight: 800;
        color: #1e293b;
        margin-left: auto;
      }

      &.registered svg { color: #3b82f6; }
      &.submitted svg { color: #f59e0b; }
      &.passed svg { color: #10b981; }
      &.failed svg { color: #ef4444; }
    }
  }

  .action-button {
    margin-top: 16px;
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.02);
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
    }

    svg {
      width: 16px;
      height: 16px;
    }
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
  padding: 100px 20px;
  color: #64748b;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  h3 {
    font-size: 22px;
    margin-bottom: 8px;
    color: #1e293b;
    font-weight: 700;
  }

  p {
    font-size: 15px;
    color: #64748b;
  }
`;

export default function ExamGroups() {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [warningFilter, setWarningFilter] = useState('all');

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let filtered = [...groups];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(group => 
        group.examName?.toLowerCase().includes(query) ||
        group.platform?.toLowerCase().includes(query)
      );
    }

    if (platformFilter !== 'all') {
      filtered = filtered.filter(group => group.platform === platformFilter);
    }

    if (warningFilter !== 'all') {
      filtered = filtered.filter(group => group.warningLevel === warningFilter);
    }

    setFilteredGroups(filtered);
  }, [searchQuery, platformFilter, warningFilter, groups]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await getExamGroups();
      console.log('📊 Exam Groups Response:', response);
      setGroups(response.data || []);
      setFilteredGroups(response.data || []);
      setSummary(response.summary || null);
    } catch (error) {
      console.error('Error loading groups:', error);
      showToast('danger', error.message || 'Failed to load exam groups');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setPlatformFilter('all');
    setWarningFilter('all');
  };

  const handleViewStudents = (examId, examName) => {
    navigate(`/coordinator/exam-groups/${examId}/students`, {
      state: { examName }
    });
  };

  const platforms = [...new Set(groups.map(g => g.platform))];

  if (loading) {
    return (
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <Loading>⏳ Loading exam groups...</Loading>
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
          <h1>
            <span>👥</span>
            Exam Groups
          </h1>
          <p>View exams grouped by name with enrollment statistics</p>
        </PageHeader>

        {summary && (
          <StatsBar>
            <StatCard $color="#667eea">
              <div className="stat-label">Total Exams</div>
              <div className="stat-value">{summary.totalExams}</div>
            </StatCard>
            <StatCard $color="#10b981">
              <div className="stat-label">Total Students</div>
              <div className="stat-value">{summary.totalStudents}</div>
            </StatCard>
            <StatCard $color="#f59e0b">
              <div className="stat-label">Low Enrollment</div>
              <div className="stat-value">{summary.lowEnrollment}</div>
            </StatCard>
            <StatCard $color="#ef4444">
              <div className="stat-label">Critical</div>
              <div className="stat-value">{summary.criticalEnrollment}</div>
            </StatCard>
          </StatsBar>
        )}

        {groups.length > 0 && (
          <SearchFilterBar>
            <SearchBox>
              <FiSearch />
              <input
                type="text"
                placeholder="Search exams by name or platform..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchBox>

            <FilterSelect value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
              <option value="all">All Platforms</option>
              {platforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </FilterSelect>

            <FilterSelect value={warningFilter} onChange={(e) => setWarningFilter(e.target.value)}>
              <option value="all">All Levels</option>
              <option value="good">Good</option>
              <option value="low">Low</option>
              <option value="critical">Critical</option>
            </FilterSelect>

            <ResultCount>
              <span>{filteredGroups.length}</span> of {groups.length} exams
            </ResultCount>

            <ClearButton 
              onClick={handleClearFilters}
              disabled={searchQuery === '' && platformFilter === 'all' && warningFilter === 'all'}
            >
              Clear
            </ClearButton>
          </SearchFilterBar>
        )}

        {filteredGroups.length === 0 && groups.length > 0 ? (
          <EmptyState>
            <h3>🔍 No exams found</h3>
            <p>Try adjusting your search or filters</p>
          </EmptyState>
        ) : filteredGroups.length === 0 ? (
          <EmptyState>
            <h3>📭 No exam groups found</h3>
            <p>Students haven't registered for any exams yet</p>
          </EmptyState>
        ) : (
          <Grid>
            {filteredGroups.map((group) => (
              <Card key={group.examId} $warning={group.warningLevel}>
                <div className="warning-badge">
                  {group.warningLevel === 'critical' && <FiAlertCircle />}
                  {group.warningLevel === 'low' && <FiClock />}
                  {group.warningLevel === 'good' && <FiCheckCircle />}
                  {group.warningLevel}
                </div>

                <div className="header">
                  <h3>{group.examName}</h3>
                </div>

                <div className="platform-badge">{group.platform}</div>

                <div style={{ marginTop: '16px' }}>
                  <div className="stat">
                    <FiUsers />
                    <div className="info">
                      <div className="label">Total Students</div>
                      <div className="value">{group.totalStudents}</div>
                    </div>
                  </div>

                  <div className="stat">
                    <FiTrendingUp />
                    <div className="info">
                      <div className="label">Pass Rate</div>
                      <div className="value">{group.passRate}%</div>
                    </div>
                  </div>
                </div>

                <div className="status-breakdown">
                  <div className="status-item registered">
                    <FiClock />
                    Registered
                    <span className="count">{group.statusBreakdown.registered}</span>
                  </div>
                  <div className="status-item submitted">
                    <FiAlertCircle />
                    Submitted
                    <span className="count">{group.statusBreakdown.submitted}</span>
                  </div>
                  <div className="status-item passed">
                    <FiCheckCircle />
                    Passed
                    <span className="count">{group.statusBreakdown.passed}</span>
                  </div>
                  <div className="status-item failed">
                    <FiXCircle />
                    Failed
                    <span className="count">{group.statusBreakdown.failed}</span>
                  </div>
                </div>

                <button
                  className="action-button"
                  onClick={() => handleViewStudents(group.examId, group.examName)}
                >
                  <FiEye />
                  View Students
                </button>
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
