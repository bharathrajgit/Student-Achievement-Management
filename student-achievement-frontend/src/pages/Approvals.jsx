import React, { useState, useEffect } from 'react';
import styled, { StyleSheetManager } from 'styled-components';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import api from '../services/api';
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiExternalLink,
} from 'react-icons/fi';
import isPropValid from '@emotion/is-prop-valid';
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
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const FilterBtn = styled.button`
  padding: 8px 16px;
  background: ${p =>
    p.$active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white'};
  color: ${p => (p.$active ? 'white' : '#718096')};
  border: 1px solid ${p => (p.$active ? 'transparent' : '#e2e8f0')};
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: ${p =>
      p.$active ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f7fafc'};
  }
`;

const AchievementGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const AchievementCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  flex: 1;
`;

const StatusBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${p => {
    if (p.$status === 'Verified') return '#dcfce7';
    if (p.$status === 'Pending') return '#fef3c7';
    if (p.$status === 'Rejected') return '#fee2e2';
    return '#f7fafc';
  }};
  color: ${p => {
    if (p.$status === 'Verified') return '#166534';
    if (p.$status === 'Pending') return '#b45309';
    if (p.$status === 'Rejected') return '#991b1b';
    return '#718096';
  }};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const CardBody = styled.div`
  margin-bottom: 16px;
`;

const CardLabel = styled.p`
  margin: 0 0 4px 0;
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CardText = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #2d3748;
`;

const ProofLinkContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f0f4ff;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #e0e7ff;
  overflow: hidden;
`;

const ProofLinkLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
`;

const ProofLink = styled.a`
  font-size: 12px;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    text-decoration: underline;
  }

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
`;

const Button = styled.button`
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
  }
`;

const ApproveBtn = styled(Button)`
  background: #dcfce7;
  color: #166534;

  &:hover {
    background: #bbf7d0;
  }
`;

const RejectBtn = styled(Button)`
  background: #fee2e2;
  color: #991b1b;

  &:hover {
    background: #fecaca;
  }
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

const ConfirmModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 260;
  padding: 16px;
`;

const ConfirmModalContent = styled.div`
  background: white;
  border-radius: 14px;
  padding: 24px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.35);
`;

const ConfirmTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1f2933;
`;

const ConfirmMessage = styled.p`
  margin: 0 0 16px 0;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.5;
`;

const ConfirmActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ConfirmBtn = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
  }
`;

const ConfirmCancelBtn = styled(ConfirmBtn)`
  background: #e2e8f0;
  color: #2d3748;

  &:hover {
    background: #cbd5e0;
  }
`;

const ConfirmActionBtn = styled(ConfirmBtn)`
  background: ${p => (p.$reject ? '#f97316' : '#22c55e')};
  color: white;

  &:hover {
    background: ${p => (p.$reject ? '#ea580c' : '#16a34a')};
  }
`;

export function Approvals() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    message: '',
  });

  // ✅ Confirm modal state (replaces manual input)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'approve' or 'reject'
  const [confirmAchievementId, setConfirmAchievementId] = useState(null);
  const [confirmAchievementTitle, setConfirmAchievementTitle] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.get('/admin/achievements');
      const data = res.data?.data;

      if (Array.isArray(data)) {
        setAchievements(data);
      } else if (data && typeof data === 'object') {
        setAchievements(data.achievements || data.data || []);
      } else {
        setAchievements([]);
      }
    } catch (err) {
      console.error('Error loading achievements:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to load achievements';

      setError(msg);
      setAchievements([]);
      setToast({
        show: true,
        type: 'danger',
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Open confirm modal for approve
  const handleApproveClick = (id, title) => {
    setConfirmAchievementId(id);
    setConfirmAchievementTitle(title);
    setConfirmAction('approve');
    setRejectReason('');
    setConfirmModalOpen(true);
  };

  // ✅ Open confirm modal for reject
  const handleRejectClick = (id, title) => {
    setConfirmAchievementId(id);
    setConfirmAchievementTitle(title);
    setConfirmAction('reject');
    setRejectReason('');
    setConfirmModalOpen(true);
  };

  // ✅ Confirm approve (auto 10 points)
  const handleConfirmApprove = async () => {
    try {
      await api.patch(`/admin/achievements/${confirmAchievementId}`, {
        status: 'Verified',
        remarks: 'Approved with 10 points',
        points: 10, // ✅ Automatically set to 10
      });

      setConfirmModalOpen(false);
      setToast({
        show: true,
        type: 'success',
        message: 'Achievement approved successfully with 10 points',
      });
      loadAchievements();
    } catch (err) {
      console.error('Error approving achievement:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Error approving achievement';

      setToast({
        show: true,
        type: 'danger',
        message: msg,
      });
    }
  };

  // ✅ Confirm reject
  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      setToast({
        show: true,
        type: 'danger',
        message: 'Please enter rejection reason',
      });
      return;
    }

    try {
      await api.patch(`/admin/achievements/${confirmAchievementId}`, {
        status: 'Rejected',
        remarks: rejectReason.trim(),
      });

      setConfirmModalOpen(false);
      setToast({
        show: true,
        type: 'success',
        message: 'Achievement rejected',
      });
      loadAchievements();
    } catch (err) {
      console.error('Error rejecting achievement:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Error rejecting achievement';

      setToast({
        show: true,
        type: 'danger',
        message: msg,
      });
    }
  };

  const handleCancel = () => {
    setConfirmModalOpen(false);
    setConfirmAction(null);
    setRejectReason('');
  };

  const getStatusIcon = status => {
    if (status === 'Verified') return <FiCheckCircle />;
    if (status === 'Pending') return <FiClock />;
    if (status === 'Rejected') return <FiXCircle />;
    return null;
  };

  const filteredAchievements =
    statusFilter === 'All'
      ? achievements
      : achievements.filter(a => a.status === statusFilter);

  if (loading) {
    return (
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <Loading>Loading achievements...</Loading>
        </Main>
      </Layout>
    );
  }

  return (
    <StyleSheetManager
      shouldForwardProp={prop => isPropValid(prop) || prop.startsWith('$')}
    >
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <Section>
            <SectionTitle>Achievement Approvals</SectionTitle>

            <FilterButtons>
              {['All', 'Pending', 'Verified', 'Rejected'].map(status => (
                <FilterBtn
                  key={status}
                  $active={statusFilter === status}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </FilterBtn>
              ))}
            </FilterButtons>

            {error && <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>}

            {filteredAchievements.length > 0 ? (
              <AchievementGrid>
                {filteredAchievements.map(achievement => (
                  <AchievementCard key={achievement._id}>
                    <CardHeader>
                      <CardTitle>{achievement.title}</CardTitle>
                      <StatusBadge $status={achievement.status}>
                        {getStatusIcon(achievement.status)}
                        {achievement.status}
                      </StatusBadge>
                    </CardHeader>

                    <CardBody>
                      <CardLabel>Student</CardLabel>
                      <CardText>
                        {achievement.studentId?.name || 'N/A'}
                        {achievement.studentId?.rollNumber &&
                          ` (${achievement.studentId.rollNumber})`}
                      </CardText>

                      <CardLabel>Category</CardLabel>
                      <CardText>{achievement.category}</CardText>

                      <CardLabel>Semester</CardLabel>
                      <CardText>{achievement.semester}</CardText>

                      <CardLabel>Description</CardLabel>
                      <CardText>{achievement.description}</CardText>

                      {(achievement.proof ||
                        (achievement.proofLinks &&
                          achievement.proofLinks.length > 0)) && (
                        <>
                          <CardLabel>Proof Link</CardLabel>
                          <ProofLinkContainer>
                            <ProofLinkLabel>🔗</ProofLinkLabel>
                            <ProofLink
                              href={achievement.proof || achievement.proofLinks[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={achievement.proof || achievement.proofLinks[0]}
                            >
                              <span
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {(achievement.proof ||
                                  achievement.proofLinks[0]
                                ).length > 40
                                  ? (achievement.proof ||
                                      achievement.proofLinks[0]
                                    ).substring(0, 37) + '...'
                                  : achievement.proof || achievement.proofLinks[0]}
                              </span>
                              <FiExternalLink />
                            </ProofLink>
                          </ProofLinkContainer>
                        </>
                      )}

                      {achievement.remarks && (
                        <>
                          <CardLabel>Remarks</CardLabel>
                          <CardText>{achievement.remarks}</CardText>
                        </>
                      )}
                    </CardBody>

                    {achievement.status === 'Pending' && (
                      <CardActions>
                        <ApproveBtn
                          onClick={() =>
                            handleApproveClick(achievement._id, achievement.title)
                          }
                        >
                          ✓ Approve
                        </ApproveBtn>
                        <RejectBtn
                          onClick={() =>
                            handleRejectClick(achievement._id, achievement.title)
                          }
                        >
                          ✕ Reject
                        </RejectBtn>
                      </CardActions>
                    )}
                  </AchievementCard>
                ))}
              </AchievementGrid>
            ) : (
              <Empty>
                No {statusFilter !== 'All' ? statusFilter.toLowerCase() : ''}{' '}
                achievements found
              </Empty>
            )}
          </Section>
        </Main>

        {/* ✅ Confirm Modal */}
        {confirmModalOpen && (
          <ConfirmModal onClick={handleCancel}>
            <ConfirmModalContent onClick={e => e.stopPropagation()}>
              {confirmAction === 'approve' ? (
                <>
                  <ConfirmTitle>Approve Achievement?</ConfirmTitle>
                  <ConfirmMessage>
                    Approve <strong>{confirmAchievementTitle}</strong> and award{' '}
                    <strong style={{ color: '#48bb78' }}>10 points</strong>?
                  </ConfirmMessage>
                </>
              ) : (
                <>
                  <ConfirmTitle>Reject Achievement?</ConfirmTitle>
                  <ConfirmMessage>
                    Provide a rejection reason for{' '}
                    <strong>{confirmAchievementTitle}</strong>
                  </ConfirmMessage>

                  <textarea
                    placeholder="Enter rejection reason..."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '13px',
                      resize: 'vertical',
                      marginBottom: '12px',
                      fontFamily: 'inherit',
                    }}
                    rows={3}
                  />
                </>
              )}

              <ConfirmActions>
                <ConfirmCancelBtn onClick={handleCancel}>Cancel</ConfirmCancelBtn>
                <ConfirmActionBtn
                  $reject={confirmAction === 'reject'}
                  onClick={
                    confirmAction === 'approve'
                      ? handleConfirmApprove
                      : handleConfirmReject
                  }
                >
                  {confirmAction === 'approve' ? 'Approve' : 'Reject'}
                </ConfirmActionBtn>
              </ConfirmActions>
            </ConfirmModalContent>
          </ConfirmModal>
        )}

        <AppToast
          show={toast.show}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      </Layout>
    </StyleSheetManager>
  );
}
