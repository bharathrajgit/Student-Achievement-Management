// src/pages/student/exam/ExamCatalog.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { AppToast } from '../../../components/AppToast';
import { useExam } from '../../../context/ExamContext';
import { browseExamCatalog, registerForExam } from '../../../services/studentExamService';
import { FiBookOpen, FiTag, FiUsers, FiCalendar, FiSearch } from 'react-icons/fi';

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

const SearchBox = styled.div`
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  align-items: center;
  position: relative;

  input {
    flex: 1;
    padding: 12px 16px 12px 44px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }

  svg {
    position: absolute;
    left: 14px;
    color: #9ca3af;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const ExamCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(102, 126, 234, 0.2);
    border-color: #667eea;
  }

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1a202c;
    margin: 0 0 12px 0;
  }

  .platform-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 16px;

    svg {
      width: 14px;
      height: 14px;
    }
  }

  .description {
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 16px;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #6b7280;
      font-size: 13px;

      svg {
        width: 16px;
        height: 16px;
        color: #667eea;
      }
    }
  }
`;

const DateInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 12px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const RegisterButton = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover:not(:disabled) {
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

export default function ExamCatalog() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDates, setSelectedDates] = useState({});
  const [registering, setRegistering] = useState(null);
  const { setErrorMessage, setSuccessMessage } = useExam();

  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const response = await browseExamCatalog();
      setExams(response.data || []);
    } catch (error) {
      console.error('Error loading exams:', error);
      showToast('danger', error.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (examId) => {
    const selectedDate = selectedDates[examId];
    if (!selectedDate) {
      showToast('warning', 'Please select a completion date');
      return;
    }

    try {
      setRegistering(examId);
      await registerForExam(examId, selectedDate);
      showToast('success', 'Successfully registered for exam!');
      setSelectedDates({ ...selectedDates, [examId]: '' });
      loadExams();
    } catch (error) {
      console.error('Error registering:', error);
      showToast('danger', error.message || 'Failed to register for exam');
    } finally {
      setRegistering(null);
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const filteredExams = exams.filter((exam) =>
    exam.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.platform.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <Loading>Loading exam catalog...</Loading>
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
          <h1>📚 Exam Catalog</h1>
          <p>Browse and register for available exams</p>
        </PageHeader>

        <SearchBox>
          <FiSearch size={20} />
          <input
            type="text"
            placeholder="Search exams by name or platform..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        {filteredExams.length === 0 ? (
          <EmptyState>
            <h3>No exams found</h3>
            <p>Try adjusting your search</p>
          </EmptyState>
        ) : (
          <Grid>
            {filteredExams.map((exam) => (
              <ExamCard key={exam._id}>
                <h3>{exam.examName}</h3>
                <div className="platform-badge">
                  <FiTag size={14} />
                  {exam.platform}
                </div>
                <p className="description">
                  {exam.description || 'Professional certification exam'}
                </p>
                <div className="meta">
                  <div className="meta-item">
                    <FiUsers size={16} />
                    {exam.registrationCount || 0} registered
                  </div>
                  {exam.examDate && (
                    <div className="meta-item">
                      <FiCalendar size={16} />
                      Exam Date: {new Date(exam.examDate).toLocaleDateString()}
                    </div>
                  )}
                  {exam.examRegisterLastDate && (
                    <div className="meta-item">
                      <FiCalendar size={16} />
                      Course Register by: {new Date(exam.examRegisterLastDate).toLocaleDateString()}
                    </div>
                  )}
                  {exam.examEnterOption && (
                    <div className="meta-item">
                      <FiBookOpen size={16} />
                      Mode: {exam.examEnterOption}
                    </div>
                  )}
                  {exam.examLink && (
                    <div className="meta-item">
                      <a href={exam.examLink} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'underline', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiBookOpen size={16} />
                        Exam Link
                      </a>
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: '8px', fontSize: '12px', color: '#6b7280' }}>
                  Expected Completion Date *
                </div>
                <DateInput
                  type="date"
                  value={selectedDates[exam._id] || ''}
                  onChange={(e) =>
                    setSelectedDates({ ...selectedDates, [exam._id]: e.target.value })
                  }
                  min={new Date().toISOString().split('T')[0]}
                  placeholder="Select expected completion date"
                />
                <RegisterButton
                  onClick={() => handleRegister(exam._id)}
                  disabled={registering === exam._id}
                >
                  {registering === exam._id ? 'Registering...' : 'Register'}
                </RegisterButton>
              </ExamCard>
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
