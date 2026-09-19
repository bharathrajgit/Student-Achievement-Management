// src/pages/student/exam/RequestNewExam.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { AppToast } from '../../../components/AppToast';
import { requestNewExam } from '../../../services/studentExamService';
import { FiSend } from 'react-icons/fi';

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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  max-width: 600px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 8px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const ErrorText = styled.p`
  color: #ef4444;
  font-size: 13px;
  margin-top: 6px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
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
  transition: all 0.3s ease;
  margin-bottom: 16px;

  &:hover {
    background: #f3f4f6;
  }
`;

export default function RequestNewExam() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Remove category if empty
      const submitData = { ...data };
      if (!submitData.category) {
        delete submitData.category;
      }
      
      console.log('📤 Submitting exam request:', submitData);
      
      await requestNewExam(submitData);
      showToast('success', 'Exam request submitted successfully!');
      reset();
      setTimeout(() => navigate('/student/my-requests'), 2000);
    } catch (error) {
      console.error('❌ Error requesting exam:', error);
      showToast('danger', error.message || 'Failed to request exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Sidebar />
      <Header />
      <Main>
        <BackButton onClick={() => navigate('/student/my-exams')}>← Back</BackButton>

        <PageHeader>
          <h1>📝 Request New Exam</h1>
          <p>Request to add a new exam to the catalog</p>
        </PageHeader>

        <FormCard>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormGroup>
              <label>Exam Name *</label>
              <Input
                type="text"
                placeholder="e.g., AWS Solutions Architect"
                {...register('examName', { required: 'Exam name is required' })}
              />
              {errors.examName && <ErrorText>{errors.examName.message}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <label>Platform *</label>
              <Input
                type="text"
                placeholder="e.g., AWS, Google Cloud, Azure"
                {...register('platform', { required: 'Platform is required' })}
              />
              {errors.platform && <ErrorText>{errors.platform.message}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <label>Category (Optional)</label>
              <Select {...register('category')}>
                <option value="">Select Category</option>
                <option value="Technical Certification">Technical Certification</option>
                <option value="Programming">Programming</option>
                <option value="Data Science">Data Science</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="DevOps">DevOps</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Web Development">Web Development</option>
                <option value="Database">Database</option>
                <option value="Other">Other</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <label>Exam Date *</label>
              <Input
                type="date"
                {...register('examDate', { required: 'Exam date is required' })}
              />
              {errors.examDate && <ErrorText>{errors.examDate.message}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <label>Course Register Last Date *</label>
              <Input
                type="date"
                {...register('examRegisterLastDate', { required: 'Course register last date is required' })}
              />
              {errors.examRegisterLastDate && <ErrorText>{errors.examRegisterLastDate.message}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <label>Exam Enter Option *</label>
              <Select {...register('examEnterOption', { required: 'Exam enter option is required' })}>
                <option value="">Select Option</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Both">Both</option>
              </Select>
              {errors.examEnterOption && <ErrorText>{errors.examEnterOption.message}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <label>Exam Link (Optional)</label>
              <Input
                type="url"
                placeholder="https://example.com/exam"
                {...register('examLink')}
              />
            </FormGroup>

            <FormGroup>
              <label>Justification *</label>
              <Textarea
                placeholder="Why is this exam important? How will it benefit the program?"
                {...register('justification', { 
                  required: 'Justification is required', 
                  minLength: { value: 20, message: 'Justification must be at least 20 characters' } 
                })}
              />
              {errors.justification && <ErrorText>{errors.justification.message}</ErrorText>}
            </FormGroup>

            <Button type="submit" disabled={loading}>
              <FiSend size={16} />
              {loading ? 'Submitting...' : 'Submit Request'}
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
