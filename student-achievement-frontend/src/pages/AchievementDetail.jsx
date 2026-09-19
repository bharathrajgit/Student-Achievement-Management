import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import api from '../services/api';
import { AppToast } from '../components/AppToast';

import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiExternalLink,
} from 'react-icons/fi';

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

const Header2 = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  transition: all 0.2s ease;

  &:hover {
    background: #f7fafc;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 8px;
`;

const Value = styled.p`
  margin: 0;
  font-size: 16px;
  color: #2d3748;
  font-weight: 500;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
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
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ProofLinks = styled.div`
  margin-bottom: 20px;
`;

const ProofLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #e0e7ff;
  color: #667eea;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  margin-right: 12px;
  margin-bottom: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #c7d2fe;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #2d3748;
  background: #f7fafc;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
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
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
`;

const getStatusIcon = (status) => {
  if (status === 'Verified') return <FiCheckCircle />;
  if (status === 'Pending') return <FiClock />;
  if (status === 'Rejected') return <FiXCircle />;
  return null;
};

export function AchievementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [achievement, setAchievement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
                              show: false,
                              type: 'success',
                              message: '',
                            });


  useEffect(() => {
    loadAchievement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadAchievement = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/admin/achievements/${id}`);
      const data = res.data?.data || res.data; // handles {data: obj} or obj directly

      if (data && data._id) {
        setAchievement(data);
        setToast({
          show: false,
          type: 'danger',
          message: '',
        });
        setError('');
      } else {
        setAchievement(null);
        setError('Achievement not found');
        setToast({
            show: true,
            type: 'danger',
            message: 'Achievement not found',
          });
      }
    } catch (err) {
      setAchievement(null);
      setError(err.response?.data?.message || 'Failed to load achievement');
      setToast({
      show: true,
      type: 'danger',
      message: err.response?.data?.message || 'Failed to load achievement',
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
          <Loading>Loading achievement details...</Loading>
        </Main>
      </Layout>
    );
  }

  if (!achievement) {
    return (
      <Layout>
        <Sidebar />
        <Header />
        <Main>
          <Header2>
            <BackBtn onClick={() => navigate('/achievements')}>
              <FiArrowLeft /> Back
            </BackBtn>
            <Title>Achievement Detail</Title>
          </Header2>
          {error && <Error>{error}</Error>}
        </Main>
      </Layout>
    );
  }

  const achievementDate =
    achievement.date || achievement.achievementDate || achievement.createdAt;

  // combine array proofLinks and single proof string into one list
  const allProofLinks = [
    ...(achievement.proofLinks || []),
    ...(achievement.proof ? [achievement.proof] : []),
  ];

  return (
    <Layout>
      <Sidebar />
      <Header />
      <Main>
        <Header2>
          <BackBtn onClick={() => navigate('/achievements')}>
            <FiArrowLeft /> Back
          </BackBtn>
          <Title>{achievement.title}</Title>
        </Header2>

        <Card>
          <Row>
            <Field>
              <Label>Status</Label>
              <StatusBadge $status={achievement.status}>
                {getStatusIcon(achievement.status)}
                {achievement.status}
              </StatusBadge>
            </Field>

            <Field>
              <Label>Category</Label>
              <Value>{achievement.category}</Value>
            </Field>
          </Row>

          <Row>
            <Field>
              <Label>Semester</Label>
              <Value>{achievement.semester}</Value>
            </Field>

            <Field>
              <Label>Achievement Date</Label>
              <Value>
                {achievementDate
                  ? new Date(achievementDate).toLocaleDateString()
                  : 'N/A'}
              </Value>
            </Field>
          </Row>

          {achievement.pointsAwarded > 0 && (
            <Row>
              <Field>
                <Label>Points Awarded</Label>
                <Value>⭐ {achievement.pointsAwarded} points</Value>
              </Field>
            </Row>
          )}

          <Field>
            <Label>Description</Label>
            <Description>{achievement.description}</Description>
          </Field>

          {allProofLinks.length > 0 && (
            <Field>
              <Label>Proof Links</Label>
              <ProofLinks>
                {allProofLinks.map((link, idx) => (
                  <ProofLink
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiExternalLink />
                    Proof {idx + 1}
                  </ProofLink>
                ))}
              </ProofLinks>
            </Field>
          )}
        </Card>
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
