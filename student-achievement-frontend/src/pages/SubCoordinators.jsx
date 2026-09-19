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
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;

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
  }

  td {
    padding: 16px 20px;
    font-size: 14px;
    color: #2d3748;
    border-bottom: 1px solid #e2e8f0;
  }

  tbody tr:hover {
    background: #f7fafc;
  }
`;

const Badge = styled.span`
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  background: #dcfce7;
  color: #166534;
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
`;

const Modal = styled.div`
  display: ${(p) => (p.$isOpen ? 'flex' : 'none')};
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
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    padding: 24px 20px;
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
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: #1a202c;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
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
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: #f7fafc;
  transition: all 0.2s ease;

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
  padding: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Error = styled.div`
  padding: 10px 12px;
  background: #fed7d7;
  border: 1px solid #fc8181;
  border-radius: 8px;
  color: #c53030;
  font-size: 13px;
`;

const Loading = styled.div`
  text-align: center;
  padding: 40px;
  color: #718096;
`;

const Empty = styled.div`
  text-align: center;
  padding: 40px;
  color: #718096;
  background: white;
  border-radius: 16px;
`;

export function SubCoordinators() {
  const [subCoordinators, setSubCoordinators] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    message: '',
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
  try {
    setLoading(true);
    setError('');
    const response = await api.get('/coordinator/sub-coordinators');
    setSubCoordinators(response.data.data || []);
  } catch (err) {
    console.error('Error loading data:', err);
    const msg =
      err.response?.data?.message || err.message || 'Failed to load data';
    setError(msg);
    setToast({
      show: true,
      type: 'danger',
      message: msg,
    });
  } finally {
    setLoading(false);
  }
  };


  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSubmitting(true);

  try {
    await api.post('/coordinator/sub-coordinators', formData);

    const email = formData.email;
    const password = formData.password;

    setFormData({
      name: '',
      email: '',
      password: '',
    });

    setShowModal(false);
    loadData();

    setToast({
      show: true,
      type: 'success',
      message: `Sub‑coordinator created. Email: ${email}, Password: ${password}`,
    });
  } catch (err) {
    const msg =
      err.response?.data?.message || 'Failed to create sub‑coordinator';
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


  const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this sub‑coordinator?')) {
    return;
  }

  try {
    await api.delete(`/coordinator/sub-coordinators/${id}`);
    loadData();
    setToast({
      show: true,
      type: 'success',
      message: 'Sub‑coordinator deleted successfully!',
    });
  } catch (err) {
    const msg =
      err.response?.data?.message || 'Failed to delete sub‑coordinator';
    setToast({
      show: true,
      type: 'danger',
      message: msg,
    });
  }
  };


  if (loading) {
    return (
      <Layout>
        <Sidebar />
        <Header title="Sub-Coordinators" />
        <Main>
          <Loading>Loading...</Loading>
        </Main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Sidebar />
      <Header title="Sub-Coordinators" />
      <Main>
        <Section>
          <SectionTitle>
            Manage Sub-Coordinators
            <Button onClick={() => setShowModal(true)}>
              <FiPlus /> Add Sub-Coordinator
            </Button>
          </SectionTitle>

          {error && <Error>{error}</Error>}

          {subCoordinators.length > 0 ? (
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subCoordinators.map((subCoord) => (
                    <tr key={subCoord._id}>
                      <td><strong>{subCoord.name}</strong></td>
                      <td>{subCoord.email}</td>
                      <td><Badge>Active</Badge></td>
                      <td>{new Date(subCoord.createdAt).toLocaleDateString()}</td>
                      <td>
                        <DeleteBtn onClick={() => handleDelete(subCoord._id)}>
                          Delete
                        </DeleteBtn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>
          ) : (
            <Empty>No sub-coordinators found</Empty>
          )}
        </Section>
      </Main>

      <Modal $isOpen={showModal} onClick={() => setShowModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Add Sub-Coordinator</ModalTitle>
            <CloseBtn onClick={() => setShowModal(false)}>
              <FiX size={20} />
            </CloseBtn>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            {error && <Error>{error}</Error>}

            <FormGroup>
              <Label>Full Name *</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Password *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
              />
            </FormGroup>

            <SubmitBtn type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Sub-Coordinator'}
            </SubmitBtn>
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
