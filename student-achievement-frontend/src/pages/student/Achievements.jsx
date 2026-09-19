import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import api from '../../services/api';
import { AppToast } from '../../components/AppToast';

const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  background: #1a202c;
`;

const Main = styled.main`
  flex: 1;
  margin-left: 280px;
  margin-top: 80px;
  padding: 32px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  min-height: calc(100vh - 80px);

  @media (max-width: 1024px) {
    margin-left: 280px;
    padding: 24px;
  }

  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 70px;
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    margin-top: 70px;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const AddButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    width: 100%;
    padding: 10px 16px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 12px;
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const Card = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const CardTitleWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 8px 0;
  word-break: break-word;

  @media (max-width: 768px) {
    font-size: 16px;
  }

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  background: ${props =>
    props.status === 'Verified'
      ? '#c6f6d5'
      : props.status === 'Rejected'
      ? '#fed7d7'
      : '#fef5e7'};
  color: ${props =>
    props.status === 'Verified'
      ? '#22543d'
      : props.status === 'Rejected'
      ? '#742a2a'
      : '#7d6608'};

  @media (max-width: 480px) {
    padding: 4px 10px;
    font-size: 11px;
  }
`;

const Category = styled.div`
  display: inline-block;
  padding: 4px 10px;
  background: #e6f7ff;
  color: #0369a1;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 11px;
    padding: 3px 8px;
    margin-bottom: 8px;
  }
`;

const Description = styled.p`
  color: #4a5568;
  font-size: 14px;
  line-height: 1.6;
  margin: 12px 0;
  flex-grow: 1;
  word-break: break-word;

  @media (max-width: 480px) {
    font-size: 13px;
    margin: 10px 0;
  }
`;

const Meta = styled.div`
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #718096;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 10px;
    font-size: 12px;
  }

  @media (max-width: 480px) {
    gap: 8px;
    font-size: 11px;
    padding-top: 8px;
    margin-top: 8px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;

  @media (max-width: 480px) {
    gap: 6px;
    margin-top: 12px;
    padding-top: 8px;
  }
`;

const EditButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  background: #ebf8ff;
  color: #0369a1;
  border: 1px solid #7dd3fc;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #cffafe;
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

const DeleteButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  background: #fed7d7;
  color: #742a2a;
  border: 1px solid #fc8181;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fbb6ce;
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => (props.show ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;

  @media (max-width: 480px) {
    padding: 16px;
    align-items: flex-start;
    padding-top: 80px;
  }
`;

const ModalContent = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  @media (max-width: 640px) {
    padding: 24px;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    padding: 20px;
    border-radius: 10px;
    max-width: 100%;
    max-height: 85vh;
  }
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 24px 0;

  @media (max-width: 640px) {
    font-size: 18px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 16px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 480px) {
    gap: 14px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const Input = styled.input`
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #2d3748;
  transition: all 0.2s;

  &::placeholder {
    color: #a0aec0;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f7fafc;
    color: #a0aec0;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 9px 12px;
    font-size: 13px;
  }
`;

const TextArea = styled.textarea`
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #2d3748;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: all 0.2s;

  &::placeholder {
    color: #a0aec0;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f7fafc;
    color: #a0aec0;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 9px 12px;
    font-size: 13px;
    min-height: 80px;
  }
`;

const Select = styled.select`
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #2d3748;
  transition: all 0.2s;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f7fafc;
    color: #a0aec0;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 9px 12px;
    font-size: 13px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
    margin-top: 6px;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  ${props =>
    props.primary
      ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    &:active {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  `
      : `
    background: #f7fafc;
    color: #4a5568;
    border: 1px solid #e2e8f0;

    &:hover {
      background: #edf2f7;
    }

    &:active {
      transform: scale(0.98);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `}

  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 13px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  color: #a0aec0;

  .emoji {
    font-size: 64px;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 18px;
    color: #2d3748;
    margin: 0 0 8px 0;
  }

  p {
    margin: 0;
    font-size: 14px;
  }

  @media (max-width: 768px) {
    padding: 60px 20px;

    .emoji {
      font-size: 48px;
    }

    h3 {
      font-size: 16px;
    }

    p {
      font-size: 13px;
    }
  }

  @media (max-width: 480px) {
    padding: 40px 16px;

    .emoji {
      font-size: 40px;
      margin-bottom: 12px;
    }

    h3 {
      font-size: 15px;
    }

    p {
      font-size: 12px;
    }
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 40px;
  color: #718096;
  background: white;
  border-radius: 12px;
  font-size: 14px;

  @media (max-width: 480px) {
    padding: 30px;
    font-size: 13px;
  }
`;

const ErrorMessage = styled.div`
  background: #fed7d7;
  color: #742a2a;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  border-left: 4px solid #fc8181;

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 13px;
  }
`;

const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => (props.show ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 20px;
`;

const ConfirmContent = styled.div`
  background: white;
  padding: 28px;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  @media (max-width: 480px) {
    padding: 20px;
    border-radius: 10px;
  }
`;

const ConfirmTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 12px 0;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const ConfirmMessage = styled.p`
  font-size: 14px;
  color: #4a5568;
  margin: 0 0 20px 0;
  line-height: 1.6;

  @media (max-width: 480px) {
    font-size: 13px;
    margin-bottom: 16px;
  }
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const ConfirmButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  ${props =>
    props.danger
      ? `
    background: #fc8181;
    color: white;

    &:hover {
      background: #f687b3;
    }

    &:active {
      transform: scale(0.98);
    }
  `
      : `
    background: #f7fafc;
    color: #4a5568;
    border: 1px solid #e2e8f0;

    &:hover {
      background: #edf2f7;
    }
  `}

  @media (max-width: 480px) {
    padding: 9px 14px;
    font-size: 13px;
  }
`;

const GoToTopButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  cursor: pointer;
  display: ${props => (props.$show ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  z-index: 100;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.6);
  }

  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
    width: 45px;
    height: 45px;
    font-size: 18px;
  }

  @media (max-width: 480px) {
    bottom: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
`;

const DriveLink = styled.a`
    font-family: 'Roboto';
    font-size: 14px;
    cursor: pointer;
`


export function StudentAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showGoToTop, setShowGoToTop] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    message: '',
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Academic',
    semester: 'Semester 1',
    date: '',
    proof: '',
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowGoToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/achievements');
      setAchievements(response.data.data || []);
    } catch (err) {
      console.error('Fetch achievements error:', err);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = achievement => {
    setEditingId(achievement._id);
    setFormData({
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      semester: achievement.semester,
      date: achievement.date ? achievement.date.split('T')[0] : '',
      proof: achievement.proof || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (
      !formData.title ||
      !formData.description ||
      !formData.category ||
      !formData.semester ||
      !formData.date
    ) {
      const msg = 'Please fill in all required fields';
      setError(msg);
      setToast({
        show: true,
        type: 'danger',
        message: msg,
      });
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await api.patch(`/student/achievements/${editingId}`, formData);
        setToast({
          show: true,
          type: 'success',
          message: 'Achievement updated successfully!',
        });
      } else {
        await api.post('/student/achievements', formData);
        setToast({
          show: true,
          type: 'success',
          message: 'Achievement submitted successfully!',
        });
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        category: 'Academic',
        semester: 'Semester 1',
        date: '',
        proof: '',
      });
      fetchAchievements();
    } catch (err) {
      console.error('Submit error:', err);
      const msg =
        err.response?.data?.message || 'Failed to submit achievement';

      setError(msg);
      setToast({
        show: true,
        type: 'danger',
        message: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = id => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      await api.delete(`/student/achievements/${deleteId}`);

      setToast({
        show: true,
        type: 'success',
        message: 'Achievement deleted successfully!',
      });

      setShowConfirm(false);
      setDeleteId(null);
      fetchAchievements();
    } catch (err) {
      console.error('Delete error:', err);
      const msg =
        err.response?.data?.message || 'Failed to delete achievement';

      setToast({
        show: true,
        type: 'danger',
        message: msg,
      });
      setShowConfirm(false);
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingId(null);
    setError('');
    setFormData({
      title: '',
      description: '',
      category: 'Academic',
      semester: 'Semester 1',
      date: '',
      proof: '',
    });
  };

  return (
    <Layout>
      <Sidebar />
      <Header title="My Achievements" />
      <Main>
        <Container>
          <PageHeader>
            <Title>My Achievements</Title>
            <AddButton onClick={() => setShowModal(true)}>
              + Add Achievement
            </AddButton>
          </PageHeader>

          {loading ? (
            <Loading>Loading achievements...</Loading>
          ) : achievements.length === 0 ? (
            <EmptyState>
              <div className="emoji">🎯</div>
              <h3>No achievements yet</h3>
              <p>Start adding your accomplishments!</p>
            </EmptyState>
          ) : (
            <Grid>
              {achievements.map(achievement => (
                <Card key={achievement._id}>
                  <CardHeader>
                    <CardTitleWrapper>
                      <Category>{achievement.category}</Category>
                      <CardTitle>{achievement.title}</CardTitle>
                    </CardTitleWrapper>
                    <StatusBadge status={achievement.status}>
                      {achievement.status}
                    </StatusBadge>
                  </CardHeader>

                  <Description>{achievement.description}</Description>
                  <DriveLink href={achievement.proof} target='blank'>Proof of Document</DriveLink>

                  {achievement.remarks && achievement.remarks !== "Approved with 10 points" &&(
                    <p
                      style={{
                        marginTop: 4,
                        color: achievement.status === 'Rejected' ? '#c53030' : '#2f855a',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {achievement.status === 'Rejected'
                        ? `Reason: ${achievement.remarks}`
                        : achievement.remarks}
                    </p>
                  )}

                  <Meta>
                    <span>📚 {achievement.semester}</span>
                    <span>
                      📅{' '}
                      {new Date(achievement.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {achievement.status === 'Verified' &&
                      achievement.pointsAwarded > 0 && (
                        <span style={{ color: '#48bb78', fontWeight: 600 }}>
                          ⭐ +{achievement.pointsAwarded} points
                        </span>
                      )}
                  </Meta>

                  {achievement.status === 'Pending' && (
                    <ActionButtons>
                      <EditButton onClick={() => handleEditClick(achievement)}>
                        ✎ Edit
                      </EditButton>
                      <DeleteButton
                        onClick={() => handleDeleteClick(achievement._id)}
                      >
                        🗑 Delete
                      </DeleteButton>
                    </ActionButtons>
                  )}
                </Card>
              ))}
            </Grid>
          )}

          <Modal show={showModal} onClick={handleModalClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <ModalTitle>
                {editingId ? 'Edit Achievement' : 'Add New Achievement'}
              </ModalTitle>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Title *</Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={e =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Won Hackathon 2024"
                    disabled={submitting}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Description *</Label>
                  <TextArea
                    required
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe your achievement..."
                    disabled={submitting}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Category *</Label>
                  <Select
                    required
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    disabled={submitting}
                  >
                    <option value="Academic">Academic</option>
                    <option value="Sports">Sports</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Technical">Technical</option>
                    <option value="Social Service">Social Service</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Semester *</Label>
                  <Select
                    required
                    value={formData.semester}
                    onChange={e =>
                      setFormData({ ...formData, semester: e.target.value })
                    }
                    disabled={submitting}
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    max={new Date().toISOString().split('T')[0]}
                    disabled={submitting}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Proof URL (optional)</Label>
                  <Input
                    type="url"
                    value={formData.proof}
                    onChange={e =>
                      setFormData({ ...formData, proof: e.target.value })
                    }
                    placeholder="https://drive.google.com/..."
                    disabled={submitting}
                  />
                </FormGroup>

                <ButtonGroup>
                  <Button
                    type="button"
                    onClick={handleModalClose}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" primary disabled={submitting}>
                    {submitting
                      ? editingId
                        ? 'Updating...'
                        : 'Submitting...'
                      : editingId
                      ? 'Update Achievement'
                      : 'Upload Achievement'}
                  </Button>
                </ButtonGroup>
              </Form>
            </ModalContent>
          </Modal>

          <ConfirmDialog
            show={showConfirm}
            onClick={() => setShowConfirm(false)}
          >
            <ConfirmContent onClick={e => e.stopPropagation()}>
              <ConfirmTitle>Delete Achievement?</ConfirmTitle>
              <ConfirmMessage>
                Are you sure you want to delete this achievement? This action
                cannot be undone.
              </ConfirmMessage>
              <ConfirmButtons>
                <ConfirmButton
                  onClick={() => setShowConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </ConfirmButton>
                <ConfirmButton
                  danger
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </ConfirmButton>
              </ConfirmButtons>
            </ConfirmContent>
          </ConfirmDialog>

          <GoToTopButton
            $show={showGoToTop}
            onClick={scrollToTop}
            title="Go to Top"
          >
            ↑
          </GoToTopButton>
        </Container>
      </Main>

      <AppToast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </Layout>
  );
}
