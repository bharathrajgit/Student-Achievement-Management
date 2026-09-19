import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import api from '../services/api';
import { FiPlus, FiX } from 'react-icons/fi';
import { AppToast } from '../components/AppToast';

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

  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const TableWrapper = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  @media (max-width: 768px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;

  @media (max-width: 768px) {
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
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f7fafc;
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
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
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

const Modal = styled.div`
  display: ${(p) => (p.isOpen ? 'flex' : 'none')};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 300;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 450px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    padding: 24px 20px;
    max-width: 100%;
    margin: 16px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a202c;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f7fafc;
    color: #1a202c;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 768px) {
    gap: 14px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #2d3748;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: #f7fafc;
  transition: all 0.2s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const SubmitBtn = styled.button`
  padding: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const Error = styled.div`
  padding: 10px 12px;
  background: #fed7d7;
  border: 1px solid #fc8181;
  border-radius: 8px;
  color: #c53030;
  font-size: 13px;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 40px;
  color: #718096;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const Empty = styled.div`
  text-align: center;
  padding: 40px;
  color: #718096;
  background: white;
  border-radius: 16px;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  background: ${(p) => (p.isActive ? '#dcfce7' : '#fee2e2')};
  color: ${(p) => (p.isActive ? '#166534' : '#991b1b')};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;

  @media (max-width: 768px) {
    padding: 4px 10px;
    font-size: 11px;
  }
`;

const DeleteBtn = styled.button`
  padding: 6px 12px;
  background: #fee2e2;
  color: #c53030;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: #fc8181;
    color: white;
  }

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 11px;
    margin-top: 8px;
    width: 100%;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export function Students() {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    batch: '',
    section: '',
  });
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    message: '',
  });


  const navigate = useNavigate();

  useEffect(() => {
  loadStudents(); 
}, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/students').catch(() => ({ data: { data: [] } }));
      setStudents(res.data.data || []);
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    await api.post('/admin/students', formData);

    setFormData({
      name: '',
      email: '',
      password: '',
      rollNumber: '',
      batch: '',
      section: '',
    });
    setShowModal(false);
    loadStudents();

    setToast({
      show: true,
      type: 'success',
      message: 'Student created successfully!',
    });
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to create student';

    setError(msg);   // keep inline error if you still render <Error>
    setToast({
      show: true,
      type: 'danger',
      message: msg,
    });
  }
  };

  const handleDeleteStudent = async (studentId, e) => {
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      await api.delete(`/admin/students/${studentId}`);
      loadStudents();

      setToast({
        show: true,
        type: 'success',
        message: 'Student deleted successfully!',
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete student';

      setToast({
        show: true,
        type: 'danger',
        message: msg,
      });
    }
  };


  // 🔥 NEW: Handle row click to view student achievements
  const handleViewStudent = (studentId) => {
    navigate(`/coordinator/students/${studentId}`);  // ✅ CORRECT!
  };


  if (loading) {
    return (
      <Layout>
        <Sidebar />
        <Header title="Students" />
        <Main>
          <Loading>Loading students...</Loading>
        </Main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Sidebar />
      <Header title="Students" />
      <Main>
        <Section>
          <SectionTitle>
            Manage Students
            <Button onClick={() => setShowModal(true)}>
              <FiPlus /> Add Student
            </Button>
          </SectionTitle>

          {students && students.length > 0 ? (
            <>
              {/* Desktop Table */}
              <DesktopTable>
                <TableWrapper>
                  <Table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Roll Number</th>
                        <th>Batch</th>
                        <th>Section</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr
                          key={student._id}
                          onClick={() => handleViewStudent(student._id)}
                        >
                          <td>
                            <strong>{student.name}</strong>
                          </td>
                          <td>{student.email}</td>
                          <td>{student.rollNumber}</td>
                          <td>{student.batch}</td>
                          <td>{student.section}</td>
                          <td>
                            <StatusBadge isActive={student.isActive}>
                              {student.isActive ? 'Active' : 'Inactive'}
                            </StatusBadge>
                          </td>
                          <td>
                            <ActionButtons>
                              <Button
                                style={{ padding: '6px 10px', fontSize: '12px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/coordinator/students/${student._id}/biodata`);
                                }}
                              >
                                Biodata
                              </Button>
                              <DeleteBtn
                                onClick={(e) => handleDeleteStudent(student._id, e)}
                              >
                                Delete
                              </DeleteBtn>
                            </ActionButtons>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrapper>
              </DesktopTable>

              {/* Mobile Cards */}
              <MobileCardList>
                {students.map((student) => (
                  <MobileCard
                    key={student._id}
                    onClick={() => handleViewStudent(student._id)}
                  >
                    <MobileCardRow>
                      <MobileLabel>Name</MobileLabel>
                      <MobileValue>
                        <strong>{student.name}</strong>
                      </MobileValue>
                    </MobileCardRow>

                    <MobileCardRow>
                      <MobileLabel>Email</MobileLabel>
                      <MobileValue>{student.email}</MobileValue>
                    </MobileCardRow>

                    <MobileCardRow>
                      <MobileLabel>Roll No</MobileLabel>
                      <MobileValue>{student.rollNumber}</MobileValue>
                    </MobileCardRow>

                    <MobileCardRow>
                      <MobileLabel>Batch</MobileLabel>
                      <MobileValue>{student.batch}</MobileValue>
                    </MobileCardRow>

                    <MobileCardRow>
                      <MobileLabel>Section</MobileLabel>
                      <MobileValue>{student.section}</MobileValue>
                    </MobileCardRow>

                    <MobileCardRow>
                      <MobileLabel>Status</MobileLabel>
                      <StatusBadge isActive={student.isActive}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </MobileCardRow>

                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                      <Button
                        style={{ flex: 1, padding: '8px 0', fontSize: '12px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/coordinator/students/${student._id}/biodata`);
                        }}
                      >
                        View Biodata
                      </Button>

                      <DeleteBtn
                        style={{ flex: 1 }}
                        onClick={(e) => handleDeleteStudent(student._id, e)}
                      >
                        Delete
                      </DeleteBtn>
                    </div>
                  </MobileCard>
                ))}
              </MobileCardList>
            </>
          ) : (
            <Empty>No students found. Add one to get started!</Empty>
          )}
        </Section>
      </Main>

      <Modal isOpen={showModal} onClick={() => setShowModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Add Student</ModalTitle>
            <CloseBtn onClick={() => setShowModal(false)}>
              <FiX size={20} />
            </CloseBtn>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            {error && <Error>{error}</Error>}

            <FormGroup>
              <Label>Full Name</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Roll Number</Label>
              <Input
                type="text"
                value={formData.rollNumber}
                onChange={(e) =>
                  setFormData({ ...formData, rollNumber: e.target.value })
                }
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Batch (e.g., 2024-2026)</Label>
              <Input
                type="text"
                value={formData.batch}
                onChange={(e) =>
                  setFormData({ ...formData, batch: e.target.value })
                }
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Section (e.g., A, B, C)</Label>
              <Input
                type="text"
                value={formData.section}
                onChange={(e) =>
                  setFormData({ ...formData, section: e.target.value })
                }
                required
              />
            </FormGroup>

            <SubmitBtn type="submit">Create Student</SubmitBtn>
          </Form>
        </ModalContent>
      </Modal>
      <AppToast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </Layout>
  );
}
