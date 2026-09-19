// src/pages/coordinator/exam/ExamGroupStudents.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { AppToast } from '../../../components/AppToast';
import { getExamGroupStudents } from '../../../services/coordinatorExamService';
import { 
  FiArrowLeft, 
  FiMail, 
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiXCircle,
  FiAward,
  FiSearch
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

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  color: #64748b;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.3s ease;

  &:hover {
    background: #f8fafc;
    border-color: #667eea;
    color: #667eea;
    transform: translateX(-4px);
  }

  svg {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 14px;
    font-size: 15px;
  }
`;

const PageHeader = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;

  h1 {
    font-size: 28px;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 8px 0;
    line-height: 1.3;
  }

  p {
    color: #64748b;
    margin: 0;
    font-size: 15px;
  }

  .summary {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 24px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 2px solid #f1f5f9;

    .summary-item {
      text-align: center;
      padding: 16px;
      background: #f8fafc;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        background: #f1f5f9;
        transform: translateY(-2px);
      }

      .label {
        font-size: 11px;
        color: #64748b;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }

      .value {
        font-size: 32px;
        font-weight: 900;
        color: #1e293b;
        line-height: 1;
      }
    }
  }

  @media (max-width: 1024px) {
    padding: 24px;

    h1 {
      font-size: 24px;
    }

    .summary {
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;

      .summary-item {
        padding: 12px;

        .value {
          font-size: 28px;
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 20px;

    h1 {
      font-size: 20px;
    }

    p {
      font-size: 13px;
    }

    .summary {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 16px;
      padding-top: 16px;

      .summary-item {
        padding: 12px 8px;

        .label {
          font-size: 10px;
          margin-bottom: 6px;
        }

        .value {
          font-size: 24px;
        }
      }

      .summary-item:first-child {
        grid-column: span 2;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

        .label,
        .value {
          color: white;
        }
      }
    }
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

const StudentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;

  @media (min-width: 1920px) {
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  }

  @media (max-width: 1440px) {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const StudentCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-left: 5px solid ${props => {
    if (props.$status === 'Passed') return '#10b981';
    if (props.$status === 'Failed') return '#ef4444';
    if (props.$status === 'Submitted') return '#f59e0b';
    return '#3b82f6';
  }};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
    gap: 12px;

    .student-info {
      flex: 1;
      min-width: 0;

      h3 {
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 6px 0;
        line-height: 1.3;
        word-break: break-word;
      }

      .roll {
        font-size: 13px;
        color: #64748b;
        font-weight: 600;
      }
    }

    .status-badge {
      padding: 8px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      flex-shrink: 0;

      svg {
        width: 14px;
        height: 14px;
      }

      &.registered {
        background: #dbeafe;
        color: #1e40af;
      }
      &.submitted {
        background: #fef3c7;
        color: #92400e;
      }
      &.passed {
        background: #dcfce7;
        color: #166534;
      }
      &.failed {
        background: #fee2e2;
        color: #991b1b;
      }
    }
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .detail-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 10px;
      font-size: 13px;
      transition: background 0.2s ease;

      &:hover {
        background: #f1f5f9;
      }

      svg {
        width: 18px;
        height: 18px;
        color: #667eea;
        flex-shrink: 0;
      }

      .label {
        color: #64748b;
        font-weight: 600;
        min-width: 90px;
        font-size: 12px;
      }

      .value {
        color: #1e293b;
        font-weight: 700;
        flex: 1;
        word-break: break-word;
        font-size: 13px;
      }
    }
  }

  @media (max-width: 1024px) {
    padding: 20px;

    .header {
      .student-info h3 {
        font-size: 17px;
      }

      .status-badge {
        padding: 6px 12px;
        font-size: 10px;
      }
    }

    .details .detail-item {
      padding: 10px;
      gap: 10px;

      .label {
        min-width: 80px;
        font-size: 11px;
      }

      .value {
        font-size: 12px;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 18px;
    border-left-width: 4px;

    .header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;

      .student-info {
        width: 100%;

        h3 {
          font-size: 16px;
        }

        .roll {
          font-size: 12px;
        }
      }

      .status-badge {
        align-self: flex-start;
        padding: 6px 12px;
      }
    }

    .details .detail-item {
      flex-direction: column;
      align-items: flex-start;
      padding: 12px;
      gap: 6px;

      svg {
        display: none;
      }

      .label {
        min-width: auto;
        width: 100%;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .value {
        width: 100%;
        font-size: 14px;
      }
    }
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
  font-size: 16px;
  font-weight: 600;

  @media (max-width: 768px) {
    padding: 60px 20px;
    font-size: 14px;
  }
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

  @media (max-width: 768px) {
    padding: 60px 20px;

    h3 {
      font-size: 18px;
    }

    p {
      font-size: 13px;
    }
  }
`;

export default function ExamGroupStudents() {
  const { examName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const displayExamName = location.state?.examName || decodeURIComponent(examName);

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examName]);

  useEffect(() => {
    let filtered = [...students];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student.studentName?.toLowerCase().includes(query) ||
        student.rollNumber?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    setFilteredStudents(filtered);
  }, [searchQuery, statusFilter, students]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await getExamGroupStudents(examName);
      console.log('📋 Students Response:', response);
      
      if (response.data && response.data.students) {
        setStudents(response.data.students || []);
        setFilteredStudents(response.data.students || []);
        setSummary(response.data.statusSummary || null);
      } else {
        setStudents([]);
        setFilteredStudents([]);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      showToast('danger', error.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Passed':
        return <FiCheckCircle />;
      case 'Failed':
        return <FiXCircle />;
      case 'Submitted':
        return <FiAlertCircle />;
      default:
        return <FiClock />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <Loading>⏳ Loading students...</Loading>
        </Main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Sidebar />
      <Header />
      <Main>
        <BackButton onClick={() => navigate('/coordinator/exam-groups')}>
          <FiArrowLeft />
          Back to Exam Groups
        </BackButton>

        <PageHeader>
          <h1>{displayExamName}</h1>
          <p>Students enrolled in this exam</p>

          {summary && (
            <div className="summary">
              <div className="summary-item">
                <div className="label">Total</div>
                <div className="value">{students.length}</div>
              </div>
              <div className="summary-item">
                <div className="label">Registered</div>
                <div className="value">{summary.registered}</div>
              </div>
              <div className="summary-item">
                <div className="label">Submitted</div>
                <div className="value">{summary.submitted}</div>
              </div>
              <div className="summary-item">
                <div className="label">Passed</div>
                <div className="value">{summary.passed}</div>
              </div>
              <div className="summary-item">
                <div className="label">Failed</div>
                <div className="value">{summary.failed}</div>
              </div>
            </div>
          )}
        </PageHeader>

        {students.length > 0 && (
          <SearchFilterBar>
            <SearchBox>
              <FiSearch />
              <input
                type="text"
                placeholder="Search by name, roll number, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchBox>

            <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Registered">Registered</option>
              <option value="Submitted">Submitted</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
            </FilterSelect>

            <ResultCount>
              <span>{filteredStudents.length}</span> of {students.length} students
            </ResultCount>

            <ClearButton 
              onClick={handleClearFilters}
              disabled={searchQuery === '' && statusFilter === 'all'}
            >
              Clear Filters
            </ClearButton>
          </SearchFilterBar>
        )}

        {filteredStudents.length === 0 && students.length > 0 ? (
          <EmptyState>
            <h3>🔍 No students found</h3>
            <p>Try adjusting your search or filters</p>
          </EmptyState>
        ) : students.length === 0 ? (
          <EmptyState>
            <h3>📭 No students enrolled</h3>
            <p>No students have registered for this exam yet</p>
          </EmptyState>
        ) : (
          <StudentGrid>
            {filteredStudents.map((student) => (
              <StudentCard key={student.registrationId} $status={student.status}>
                <div className="header">
                  <div className="student-info">
                    <h3>{student.studentName}</h3>
                    <div className="roll">{student.rollNumber}</div>
                  </div>
                  <div className={`status-badge ${student.status.toLowerCase()}`}>
                    {getStatusIcon(student.status)}
                    {student.status}
                  </div>
                </div>

                <div className="details">
                  <div className="detail-item">
                    <FiMail />
                    <span className="label">Email</span>
                    <span className="value">{student.email || 'N/A'}</span>
                  </div>

                  <div className="detail-item">
                    <FiCalendar />
                    <span className="label">Registered</span>
                    <span className="value">{formatDate(student.registrationDate)}</span>
                  </div>

                  {student.marksObtained !== null && student.marksObtained !== undefined && (
                    <div className="detail-item">
                      <FiAward />
                      <span className="label">Marks</span>
                      <span className="value">
                        {student.marksObtained}
                        {student.totalMarks ? ` / ${student.totalMarks}` : ''}
                      </span>
                    </div>
                  )}

                  {student.submittedDate && (
                    <div className="detail-item">
                      <FiCalendar />
                      <span className="label">Submitted</span>
                      <span className="value">{formatDate(student.submittedDate)}</span>
                    </div>
                  )}

                  {student.verificationDate && (
                    <div className="detail-item">
                      <FiCheckCircle />
                      <span className="label">Verified</span>
                      <span className="value">{formatDate(student.verificationDate)}</span>
                    </div>
                  )}
                </div>
              </StudentCard>
            ))}
          </StudentGrid>
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
