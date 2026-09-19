// src/pages/coordinator/exam/VerifySubmission.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { AppToast } from '../../../components/AppToast';
import { getSubmissionDetails, approveSubmission, rejectSubmission } from '../../../services/coordinatorExamService';
import { FiCheck, FiX, FiExternalLink } from 'react-icons/fi';

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

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  h2 {
    font-size: 18px;
    font-weight: 700;
    color: #1a202c;
    margin: 0 0 16px 0;
  }

  .info-row {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;

    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    label {
      font-size: 12px;
      font-weight: 600;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 4px;
    }

    value {
      font-size: 14px;
      color: #2d3748;
      font-weight: 500;
      display: block;
    }

    a {
      color: #667eea;
      text-decoration: none;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;

      &:hover {
        color: #764ba2;
      }
    }
  }
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

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;

  button {
    flex: 1;
    padding: 12px;
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
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const ApproveButton = styled.button`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;

  &:hover:not(:disabled) {
    box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
  }
`;

const RejectButton = styled.button`
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;

  &:hover:not(:disabled) {
    box-shadow: 0 5px 15px rgba(239, 68, 68, 0.3);
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #718096;
`;

export default function VerifySubmission() {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    loadSubmission();
  }, [registrationId]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      const response = await getSubmissionDetails(registrationId);
      setSubmission(response.data);
    } catch (error) {
      console.error('Error loading submission:', error);
      showToast('danger', error.message || 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const onSubmitApprove = async (data) => {
    try {
      setProcessing('approve');
      await approveSubmission(registrationId, data.feedback);
      showToast('success', 'Submission approved!');
      setTimeout(() => navigate('/coordinator/submissions'), 2000);
    } catch (error) {
      console.error('Error approving:', error);
      showToast('danger', error.message || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const onSubmitReject = async (data) => {
    try {
      setProcessing('reject');
      await rejectSubmission(registrationId, data.feedback);
      showToast('success', 'Submission rejected!');
      setTimeout(() => navigate('/coordinator/submissions'), 2000);
    } catch (error) {
      console.error('Error rejecting:', error);
      showToast('danger', error.message || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <Loading>Loading submission...</Loading>
        </Main>
      </Layout>
    );
  }

  if (!submission) {
    return (
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <Loading>Submission not found</Loading>
        </Main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Sidebar />
      <Header />
      <Main>
        <BackButton onClick={() => navigate('/coordinator/submissions')}>← Back</BackButton>

        <Container>
          <Card>
            <h2>Submission Details</h2>
            <div className="info-row">
              <label>Student Name</label>
              <value>{submission.studentName}</value>
            </div>
            <div className="info-row">
              <label>Email</label>
              <value>{submission.studentEmail}</value>
            </div>
            <div className="info-row">
              <label>Exam Name</label>
              <value>{submission.examName}</value>
            </div>
            <div className="info-row">
              <label>Marks Obtained</label>
              <value>{submission.marksObtained}/{submission.totalMarks}</value>
            </div>
            <div className="info-row">
              <label>Submitted Date</label>
              <value>{new Date(submission.submittedDate).toLocaleDateString()}</value>
            </div>
            {submission.certificateLink && (
              <div className="info-row">
                <label>Certificate Link</label>
                <a href={submission.certificateLink} target="_blank" rel="noopener noreferrer">
                  View Certificate
                  <FiExternalLink size={14} />
                </a>
              </div>
            )}
          </Card>

          <Card>
            <h2>Review & Decision</h2>
            <form onSubmit={handleSubmit(onSubmitApprove)}>
              <FormGroup>
                <label>Feedback (Optional)</label>
                <Textarea
                  placeholder="Add your feedback or notes about this submission..."
                  {...register('feedback')}
                />
              </FormGroup>

              <ButtonGroup>
                <ApproveButton
                  type="submit"
                  disabled={processing !== null}
                >
                  <FiCheck size={16} />
                  Approve
                </ApproveButton>
              </ButtonGroup>
            </form>

            <form onSubmit={handleSubmit(onSubmitReject)}>
              <FormGroup>
                <label>Rejection Reason (Required)</label>
                <Textarea
                  placeholder="Explain why this submission is being rejected..."
                  {...register('feedback', { required: 'Feedback is required' })}
                />
                {errors.feedback && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.feedback.message}</p>}
              </FormGroup>

              <ButtonGroup>
                <RejectButton
                  type="submit"
                  disabled={processing !== null}
                >
                  <FiX size={16} />
                  Reject
                </RejectButton>
              </ButtonGroup>
            </form>
          </Card>
        </Container>
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
