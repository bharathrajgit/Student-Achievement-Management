// src/pages/coordinator/submissions/SubmissionDetail.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { AppToast } from '../../../components/AppToast';
import { 
  getSubmissionDetails, 
  approveSubmission, 
  rejectSubmission 
} from '../../../services/coordinatorExamService';
import { 
  FiArrowLeft, 
  FiUser,
  FiMail,
  FiCalendar,
  FiFileText,
  FiExternalLink,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiAward,
  FiBook,
  FiTrendingUp
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
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  h2 {
    font-size: 20px;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 24px 0;
    display: flex;
    align-items: center;
    gap: 10px;

    svg {
      width: 24px;
      height: 24px;
      color: #667eea;
    }
  }

  @media (max-width: 768px) {
    padding: 20px;

    h2 {
      font-size: 18px;
    }
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: #f1f5f9;
    transform: translateY(-2px);
  }

  svg {
    width: 20px;
    height: 20px;
    color: #667eea;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .content {
    flex: 1;
    min-width: 0;

    .label {
      font-size: 12px;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .value {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      word-break: break-word;
    }
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  svg {
    width: 16px;
    height: 16px;
  }

  ${props => {
    if (props.$status === 'Submitted') return `
      background: #fef3c7;
      color: #92400e;
    `;
    if (props.$status === 'Passed') return `
      background: #dcfce7;
      color: #166534;
    `;
    if (props.$status === 'Failed') return `
      background: #fee2e2;
      color: #991b1b;
    `;
    return `
      background: #dbeafe;
      color: #1e40af;
    `;
  }}
`;

const CertificateSection = styled.div`
  margin-top: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;

  .label {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
    opacity: 0.9;
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: white;
    color: #667eea;
    border-radius: 10px;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const ReviewSection = styled.div`
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid #f1f5f9;

  h3 {
    font-size: 18px;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 20px 0;
  }
`;

const FormLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
  margin-bottom: 8px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }

  &.error {
    border-color: #ef4444;
  }
`;

const ErrorText = styled.div`
  font-size: 13px;
  color: #ef4444;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionButton = styled.button`
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  svg {
    width: 20px;
    height: 20px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${props => props.$approve ? `
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
    }
  ` : `
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
    }
  `}
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid ${props => props.$color || '#667eea'};
  margin-bottom: 16px;

  .stat-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    svg {
      width: 24px;
      height: 24px;
      color: ${props => props.$color || '#667eea'};
    }

    .title {
      font-size: 13px;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .stat-value {
    font-size: 32px;
    font-weight: 900;
    color: #1e293b;
    margin-bottom: 8px;
  }

  .stat-label {
    font-size: 13px;
    color: #64748b;
    font-weight: 600;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
  font-size: 16px;
  font-weight: 600;
`;

export default function SubmissionDetail() {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const [feedback, setFeedback] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  useEffect(() => {
    loadSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationId]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      const response = await getSubmissionDetails(registrationId);
      console.log('📋 Submission Details:', response);
      setSubmission(response.data || null);
    } catch (error) {
      console.error('Error loading submission:', error);
      showToast('danger', error.message || 'Failed to load submission details');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const handleApprove = async () => {
    try {
      setProcessing(true);
      setRejectionError('');
      
      await approveSubmission(registrationId, feedback || 'Approved');
      
      showToast('success', 'Submission approved successfully!');
      
      setTimeout(() => {
        navigate('/coordinator/submissions');
      }, 1500);
    } catch (error) {
      console.error('Error approving:', error);
      showToast('danger', error.message || 'Failed to approve submission');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setRejectionError('Rejection reason is required');
      return;
    }

    try {
      setProcessing(true);
      setRejectionError('');
      
      await rejectSubmission(registrationId, rejectionReason);
      
      showToast('success', 'Submission rejected successfully!');
      
      setTimeout(() => {
        navigate('/coordinator/submissions');
      }, 1500);
    } catch (error) {
      console.error('Error rejecting:', error);
      showToast('danger', error.message || 'Failed to reject submission');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        return <FiAlertCircle />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <Loading>⏳ Loading submission details...</Loading>
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
          <BackButton onClick={() => navigate('/coordinator/submissions')}>
            <FiArrowLeft />
            Back to Submissions
          </BackButton>
          <Card>
            <h2>Submission not found</h2>
            <p>The submission you're looking for doesn't exist.</p>
          </Card>
        </Main>
      </Layout>
    );
  }

  const canReview = submission.status === 'Submitted';

  return (
    <Layout>
      <Sidebar />
      <Header />
      <Main>
        <BackButton onClick={() => navigate('/coordinator/submissions')}>
          <FiArrowLeft />
          Back to Submissions
        </BackButton>

        <ContentGrid>
          <div>
            <Card>
              <h2>
                <FiFileText />
                Submission Details
              </h2>

              <DetailGrid>
                <DetailItem>
                  <FiUser />
                  <div className="content">
                    <div className="label">Student Name</div>
                    <div className="value">{submission.studentName}</div>
                  </div>
                </DetailItem>

                <DetailItem>
                  <FiMail />
                  <div className="content">
                    <div className="label">Roll Number</div>
                    <div className="value">{submission.rollNumber}</div>
                  </div>
                </DetailItem>

                <DetailItem>
                  <FiBook />
                  <div className="content">
                    <div className="label">Exam Name</div>
                    <div className="value">{submission.examName}</div>
                  </div>
                </DetailItem>

                <DetailItem>
                  <FiTrendingUp />
                  <div className="content">
                    <div className="label">Platform</div>
                    <div className="value">{submission.platform}</div>
                  </div>
                </DetailItem>

                <DetailItem>
                  <FiCalendar />
                  <div className="content">
                    <div className="label">Submitted On</div>
                    <div className="value">{formatDate(submission.submittedDate)}</div>
                  </div>
                </DetailItem>

                <DetailItem>
                  <FiAlertCircle />
                  <div className="content">
                    <div className="label">Status</div>
                    <div className="value">
                      <StatusBadge $status={submission.status}>
                        {getStatusIcon(submission.status)}
                        {submission.status}
                      </StatusBadge>
                    </div>
                  </div>
                </DetailItem>
              </DetailGrid>

              {submission.marksObtained !== null && submission.marksObtained !== undefined && (
                <DetailItem>
                  <FiAward />
                  <div className="content">
                    <div className="label">Marks Obtained</div>
                    <div className="value">
                      {submission.marksObtained}
                      {submission.totalMarks ? ` / ${submission.totalMarks}` : ''}
                      {submission.percentage ? ` (${submission.percentage}%)` : ''}
                    </div>
                  </div>
                </DetailItem>
              )}

              {submission.certificateLink && (
                <CertificateSection>
                  <div className="label">Certificate Link</div>
                  <a 
                    href={submission.certificateLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <FiExternalLink />
                    View Certificate
                  </a>
                </CertificateSection>
              )}

              {canReview && (
                <ReviewSection>
                  <h3>Review & Decision</h3>

                  <div style={{ marginBottom: '24px' }}>
                    <FormLabel>Feedback (Optional)</FormLabel>
                    <TextArea
                      placeholder="Add your feedback or notes about this submission..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <FormLabel>Rejection Reason (Required)</FormLabel>
                    <TextArea
                      className={rejectionError ? 'error' : ''}
                      placeholder="Explain why this submission is being rejected..."
                      value={rejectionReason}
                      onChange={(e) => {
                        setRejectionReason(e.target.value);
                        setRejectionError('');
                      }}
                    />
                    {rejectionError && (
                      <ErrorText>
                        <FiAlertCircle />
                        {rejectionError}
                      </ErrorText>
                    )}
                  </div>

                  <ButtonGroup>
                    <ActionButton
                      $approve
                      onClick={handleApprove}
                      disabled={processing}
                    >
                      <FiCheckCircle />
                      {processing ? 'Processing...' : 'Approve'}
                    </ActionButton>

                    <ActionButton
                      onClick={handleReject}
                      disabled={processing}
                    >
                      <FiXCircle />
                      {processing ? 'Processing...' : 'Reject'}
                    </ActionButton>
                  </ButtonGroup>
                </ReviewSection>
              )}
            </Card>
          </div>

          <div>
            {submission.marksObtained !== null && submission.marksObtained !== undefined && (
              <StatCard $color="#667eea">
                <div className="stat-header">
                  <FiAward />
                  <div className="title">Score</div>
                </div>
                <div className="stat-value">{submission.marksObtained}</div>
                <div className="stat-label">
                  {submission.totalMarks ? `out of ${submission.totalMarks}` : 'marks'}
                </div>
              </StatCard>
            )}

            {submission.percentage && (
              <StatCard $color="#10b981">
                <div className="stat-header">
                  <FiTrendingUp />
                  <div className="title">Percentage</div>
                </div>
                <div className="stat-value">{submission.percentage}%</div>
                <div className="stat-label">Overall Score</div>
              </StatCard>
            )}

            {submission.verifiedDate && (
              <Card>
                <h2>
                  <FiCheckCircle />
                  Verification Info
                </h2>
                <DetailItem>
                  <FiCalendar />
                  <div className="content">
                    <div className="label">Verified On</div>
                    <div className="value">{formatDate(submission.verifiedDate)}</div>
                  </div>
                </DetailItem>
                {submission.verifiedByName && (
                  <DetailItem>
                    <FiUser />
                    <div className="content">
                      <div className="label">Verified By</div>
                      <div className="value">{submission.verifiedByName}</div>
                    </div>
                  </DetailItem>
                )}
              </Card>
            )}
          </div>
        </ContentGrid>
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
