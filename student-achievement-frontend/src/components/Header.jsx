import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 280px;
  right: 0;
  height: 80px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);

  @media (max-width: 768px) {
    left: 0;
    padding: 0 16px;
    height: 70px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;

  @media (max-width: 768px) {
    flex: 1;
    margin-left: 50px; /* Space for hamburger menu */
  }
`;


const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #f7fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  text-transform: uppercase;

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
`;

const UserRole = styled.div`
  font-size: 12px;
  color: #718096;
  text-transform: capitalize;
`;

const LogoutButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    display: none; /* ✅ HIDE LOGOUT BUTTON ON MOBILE */
  }
`;

const MobileAvatar = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 18px;
    text-transform: uppercase;
  }
`;

export function Header() {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <HeaderContainer>
      <LeftSection>
        <PageTitle>Focus on you goals</PageTitle>
      </LeftSection>

      <RightSection>
        {user?.role !== 'student' && <NotificationCenter />}

        <UserInfo>
          <Avatar>{getInitials(user?.name)}</Avatar>
          <UserDetails>
            <UserName>{user?.name || 'User'}</UserName>
            <UserRole>{user?.role || 'Student'}</UserRole>
          </UserDetails>
        </UserInfo>

        <MobileAvatar>{getInitials(user?.name)}</MobileAvatar>

        <LogoutButton onClick={logout}>Logout</LogoutButton>
      </RightSection>
    </HeaderContainer>
  );
}
