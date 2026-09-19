// src/pages/student/exam/UploadCertificate.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { AppToast } from '../../../components/AppToast';
import { uploadCertificate } from '../../../services/studentExamService';
import { FiLink, FiCalendar } from 'react-icons/fi';

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

const FormCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  max-width: 600px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;

  label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 8px;
  }

  small {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #718096;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102,126,234,0.15);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg,#667eea 0%,#764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 5px 15px rgba(102,126,234,0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const BackButton = styled.button`
  padding: 10px 16px;
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;

  &:hover {
    background: #f3f4f6;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #718096;
`;

export default function UploadCertificate() {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [pageLoading, setPageLoading] = useState(true);

  const { handleSubmit, register } = useForm({
    defaultValues: {
      certificateLink: '',
      examCompletionDate: ''
    }
  });

  useEffect(() => {
    setPageLoading(false);
  }, []);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const onSubmit = async (data) => {
    const { certificateLink, examCompletionDate } = data;

    if (!certificateLink || !examCompletionDate) {
      showToast('warning', 'Please provide both certificate link and completion date');
      return;
    }

    try {
      setLoading(true);

      // send JSON, not FormData
      await uploadCertificate(registrationId, {
        certificateLink,
        examCompletionDate
      });

      showToast('success', 'Certificate details submitted successfully!');
      setTimeout(() => navigate('/student/my-exams'), 1500);
    } catch (error) {
      console.error('Error uploading:', error);
      showToast('danger', error.response?.data?.message || 'Failed to submit certificate details');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
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
        <BackButton onClick={() => navigate('/student/my-exams')}>← Back</BackButton>

        <PageHeader>
          <h1>📄 Upload Certificate Details</h1>
          <p>Provide your public Google Drive link and exam completion date</p>
        </PageHeader>

        <FormCard>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormRow>
              <FormGroup>
                <label>
                  <FiLink size={16} />
                  Certificate Link (Google Drive)
                </label>
                <Input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  {...register('certificateLink', { required: true })}
                />
                <small>Make sure the link is public (Anyone with the link can view).</small>
              </FormGroup>

              <FormGroup>
                <label>
                  <FiCalendar size={16} />
                  Exam Completion Date
                </label>
                <Input
                  type="date"
                  {...register('examCompletionDate', { required: true })}
                />
                <small>Use the official exam completion date.</small>
              </FormGroup>
            </FormRow>

            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Certificate'}
            </Button>
          </form>
        </FormCard>
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
