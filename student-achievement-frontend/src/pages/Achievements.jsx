import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import api from '../services/api';
import { FiCheckCircle, FiClock, FiXCircle, FiExternalLink } from 'react-icons/fi';
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

const Title = styled.h1`
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
`;

const AchievementsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const AchievementCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
`;

const StatusBadge = styled.span`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${(p) => {
    if (p.$status === 'Verified') return '#dcfce7';
    if (p.$status === 'Pending') return '#fef3c7';
    if (p.$status === 'Rejected') return '#fee2e2';
    return '#f7fafc';
  }};
  color: ${(p) => {
    if (p.$status === 'Verified') return '#166534';
    if (p.$status === 'Pending') return '#b45309';
    if (p.$status === 'Rejected') return '#991b1b';
    return '#718096';
  }};
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const AchievementTitle = styled.h3`
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1a202c;
`;

const AchievementDescription = styled.p`
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #4a5568;
  line-height: 1.5;
`;

const MetaRow = styled.div`
  display: flex;
  justify-content: spaceBetween;
  font-size: 12px;
  color: #718096;
  margin-top: 8px;
`;

const ProofLinkBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f0f4ff;
  border-radius: 8px;
  border: 1px solid #e0e7ff;
  margin-top: 8px;
  overflow: hidden;
`;

const ProofLink = styled.a`
  font-size: 11px;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;

  &:hover {
    text-decoration: underline;
  }
`;

const Empty = styled.div`
  text-align: center;
  padding: 48px 16px;
  color: #a0aec0;
`;

const Loading = styled.div`
  text-align: center;
  padding: 40px;
  color: #718096;
`;

const Error = styled.div`
  background: #fed7d7;
  border: 1px solid #fc8181;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const getStatusIcon = (status) => {
  if (status === 'Verified') return <FiCheckCircle />;
  if (status === 'Pending') return <FiClock />;
  if (status === 'Rejected') return <FiXCircle />;
  return null;
};

export function Achievements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });


  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
  try {
    setLoading(true);
    setError('');
    const res = await api.get('/student/achievements');
    const data = res.data?.data;
    setItems(Array.isArray(data) ? data : data?.achievements || []);
  } catch (err) {
    const msg =
      err.response?.data?.message || err.message || 'Failed to load achievements';
    setError(msg);
    setItems([]);

    setToast({
      show: true,
      type: 'danger',
      message: msg,
    });
  } finally {
    setLoading(false);
  }
};


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
    <Layout>
      <Sidebar />
      <Header />
      <Main>
        <Title>Achievements</Title>

        {error && <Error>{error}</Error>}

        {items.length === 0 ? (
          <Empty>No achievements submitted yet</Empty>
        ) : (
          <AchievementsList>
            {items.map((a) => {
              const proofUrl = a.proof || (a.proofLinks && a.proofLinks[0]);

              return (
                <AchievementCard key={a._id}>
                  <StatusBadge $status={a.status}>
                    {getStatusIcon(a.status)}
                    {a.status}
                  </StatusBadge>

                  <AchievementTitle>{a.title}</AchievementTitle>
                  <AchievementDescription>{a.description}</AchievementDescription>

                  {/* 👉 Rejection reason for student */}
                  {a.remarks && a.remarks !== "Approved with 10 points" && (
                    <p
                      style={{
                        marginTop: 4,
                        marginBottom: 8,
                        color: a.status === 'Rejected' ? '#c53030' : '#2f855a',
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {a.status === 'Rejected'
                        ? `Reason: ${a.remarks}`
                        : a.remarks}
                    </p>
                  )}

                  {proofUrl && (
                    <ProofLinkBox>
                      <FiExternalLink
                        style={{ width: 14, height: 14, flexShrink: 0 }}
                      />
                      <ProofLink
                        href={proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={proofUrl}
                      >
                        {proofUrl.length > 45
                          ? proofUrl.substring(0, 42) + '...'
                          : proofUrl}
                      </ProofLink>
                    </ProofLinkBox>
                  )}

                  <MetaRow>
                    <span>{a.category}</span>
                    <span>{a.semester}</span>
                  </MetaRow>
                </AchievementCard>
              );
            })}

          </AchievementsList>
        )}
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
