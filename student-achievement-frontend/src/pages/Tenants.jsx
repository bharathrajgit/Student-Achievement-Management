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
    margin-top: 114px;
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
`;

const Empty = styled.div`
  text-align: center;
  padding: 40px;
  color: #718096;
  background: white;
  border-radius: 16px;
  font-size: 16px;
`;


const Table = styled.table`
  width: 100%;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-collapse: collapse;

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
  max-width: 400px;
  width: 100%;
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
`;

const Error = styled.div`
  padding: 10px 12px;
  background: #fed7d7;
  border: 1px solid #fc8181;
  border-radius: 8px;
  color: #c53030;
  font-size: 13px;
`;

export function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showCoordinatorModal, setShowCoordinatorModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const [tenantFormData, setTenantFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
  });
  const [coordinatorFormData, setCoordinatorFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
  try {
    const res = await api.get('/superadmin/tenants');
    const data = res.data.data;

    if (Array.isArray(data)) {
      setTenants(data);
    } else if (data && typeof data === 'object') {
      setTenants(data.tenants || data.data || []);
    } else {
      setTenants([]);
    }
  } catch (err) {
    console.error('Error loading tenants:', err);
    setTenants([]);
    const msg =
      err.response?.data?.message || err.message || 'Failed to load tenants';
    setToast({
      show: true,
      type: 'danger',
      message: msg,
    });
  }
  };



  const handleTenantSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/superadmin/tenants', tenantFormData);

      setTenantFormData({ name: '', code: '', email: '', phone: '' });
      setShowTenantModal(false);
      
      setToast({
        show: true,
        type: 'success',
        message: 'Institution created successfully!',
      });

      // Reload tenants
      loadTenants();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create institution';
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

  const handleCoordinatorSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    await api.post('/auth/register/coordinator', {
      ...coordinatorFormData,
      tenantId: selectedTenant,
    });

    setCoordinatorFormData({ name: '', email: '', password: '' });
    setSelectedTenant('');
    setShowCoordinatorModal(false);

    setToast({
      show: true,
      type: 'success',
      message: 'Coordinator created successfully!',
    });
  } catch (err) {
    const msg =
      err.response?.data?.message || 'Failed to create coordinator';
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


  return (
    <Layout>
      <Sidebar />
      <Header title="Tenants" />
      <Main>
        <Section>
          <SectionTitle>
            Manage Institutions & Coordinators
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button onClick={() => setShowTenantModal(true)}>
                <FiPlus /> Add Institution
              </Button>
              <Button onClick={() => setShowCoordinatorModal(true)}>
                <FiPlus /> Add Coordinator
              </Button>
            </div>
          </SectionTitle>

          {Array.isArray(tenants) && tenants.length > 0 ? (
  <Table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Code</th>
        <th>Plan</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {tenants.map((tenant) => (
        <tr key={tenant._id}>
          <td><strong>{tenant.name}</strong></td>
          <td>{tenant.code}</td>
          <td>{tenant.subscription?.plan || 'N/A'}</td>
          <td>
            <span
              style={{
                padding: '4px 12px',
                background:
                  tenant.subscription?.status === 'active'
                    ? '#dcfce7'
                    : '#fee2e2',
                color:
                  tenant.subscription?.status === 'active'
                    ? '#166534'
                    : '#991b1b',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              {tenant.subscription?.status || 'N/A'}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
) : (
  <Empty>No tenants found</Empty>
)}

        </Section>
      </Main>

      <Modal isOpen={showTenantModal} onClick={() => setShowTenantModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Add Institution</ModalTitle>
            <CloseBtn onClick={() => setShowTenantModal(false)}>
              <FiX size={20} />
            </CloseBtn>
          </ModalHeader>

          <Form onSubmit={handleTenantSubmit}>
            {error && <Error>{error}</Error>}

            <FormGroup>
              <Label>Institution Name</Label>
              <Input
                type="text"
                value={tenantFormData.name}
                onChange={(e) =>
                  setTenantFormData({ ...tenantFormData, name: e.target.value })
                }
                placeholder="e.g., XYZ University"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Institution Code</Label>
              <Input
                type="text"
                value={tenantFormData.code}
                onChange={(e) =>
                  setTenantFormData({ ...tenantFormData, code: e.target.value })
                }
                placeholder="e.g., XYZU001"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                value={tenantFormData.email}
                onChange={(e) =>
                  setTenantFormData({ ...tenantFormData, email: e.target.value })
                }
                placeholder="admin@institution.edu"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Phone (Optional)</Label>
              <Input
                type="tel"
                value={tenantFormData.phone}
                onChange={(e) =>
                  setTenantFormData({ ...tenantFormData, phone: e.target.value })
                }
                placeholder="+1 (555) 000-0000"
              />
            </FormGroup>

            <SubmitBtn type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Institution'}
            </SubmitBtn>
          </Form>
        </ModalContent>
      </Modal>

      <Modal isOpen={showCoordinatorModal} onClick={() => setShowCoordinatorModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Add Coordinator</ModalTitle>
            <CloseBtn onClick={() => setShowCoordinatorModal(false)}>
              <FiX size={20} />
            </CloseBtn>
          </ModalHeader>

          <Form onSubmit={handleCoordinatorSubmit}>
            {error && <Error>{error}</Error>}

            <FormGroup>
  <Label>Select Institution</Label>
  <Input
    as="select"
    value={selectedTenant}
    onChange={(e) => setSelectedTenant(e.target.value)}
    required
  >
    <option value="">Choose an institution...</option>
    {Array.isArray(tenants) && tenants.map((tenant) => (
      <option key={tenant._id} value={tenant._id}>
        {tenant.name}
      </option>
    ))}
  </Input>
</FormGroup>


            <FormGroup>
              <Label>Name</Label>
              <Input
                type="text"
                value={coordinatorFormData.name}
                onChange={(e) =>
                  setCoordinatorFormData({ ...coordinatorFormData, name: e.target.value })
                }
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                value={coordinatorFormData.email}
                onChange={(e) =>
                  setCoordinatorFormData({ ...coordinatorFormData, email: e.target.value })
                }
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Password</Label>
              <Input
                type="password"
                value={coordinatorFormData.password}
                onChange={(e) =>
                  setCoordinatorFormData({ ...coordinatorFormData, password: e.target.value })
                }
                required
              />
            </FormGroup>

            <SubmitBtn type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Coordinator'}
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
