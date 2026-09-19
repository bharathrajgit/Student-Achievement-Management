import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiAward, 
  FiUsers, 
  FiCheckSquare, 
  FiMenu, 
  FiX, 
  FiUserPlus,
  FiBookOpen,
  FiFileText,
  FiPlus,
  FiBarChart2,
  FiLogOut,
  FiTrendingUp,
  FiClock
} from 'react-icons/fi';

const SidebarContainer = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  flex-direction: column;
  z-index: 200;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);

  @media (max-width: 768px) {
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  }
`;

const Overlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 199;
    backdrop-filter: blur(2px);
  }
`;

const EdgeTrigger = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 20px;
    height: 100vh;
    z-index: 198;
    background: transparent;
  }
`;

const MenuButton = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 15px;
    left: 16px;
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    z-index: 198;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: ${props => props.$isOpen ? '0' : '1'};
    pointer-events: ${props => props.$isOpen ? 'none' : 'auto'};

    &:active {
      transform: scale(0.92);
    }

    svg {
      width: 22px;
      height: 22px;
    }
  }
`;

const CloseButton = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 20px;
    right: 20px;
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    &:active {
      transform: scale(0.95);
    }
  }
`;

const Logo = styled.div`
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
`;

const LogoTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 6px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoIcon = styled.span`
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3));
`;

const LogoSubtitle = styled.p`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
  padding-left: 38px;
`;

const ScrollableNav = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px 16px;
  padding-bottom: 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.25);
    }
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NavSection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const NavSectionTitle = styled.h3`
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 8px 12px;
  margin: 0 0 4px 0;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 4px;
  color: ${props => props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'};
  background: ${props => props.$active 
    ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)' 
    : 'transparent'};
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '500'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 3px solid ${props => props.$active ? '#6366f1' : 'transparent'};
  position: relative;

  &:hover {
    background: ${props => props.$active 
      ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)' 
      : 'rgba(255, 255, 255, 0.05)'};
    color: #ffffff;
    transform: translateX(2px);
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    opacity: ${props => props.$active ? '1' : '0.8'};
  }
`;

const SidebarFooter = styled.div`
  flex-shrink: 0;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.15);
`;

const LogoutButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 13px 16px;
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(239, 68, 68, 0.18);
    border-color: rgba(239, 68, 68, 0.3);
    color: #fca5a5;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(239, 68, 68, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 19px;
    height: 19px;
  }
`;

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.innerWidth <= 768 && e.touches[0].clientX < 20) {
        setTouchStart(e.touches[0].clientX);
      }
    };

    const handleTouchMove = (e) => {
      if (touchStart !== null && window.innerWidth <= 768) {
        const touchEnd = e.touches[0].clientX;
        const distance = touchEnd - touchStart;

        if (distance > 50) {
          setIsOpen(true);
          setTouchStart(null);
        }
      }
    };

    const handleTouchEnd = () => {
      setTouchStart(null);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart]);

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleEdgeHover = () => {
    if (window.innerWidth <= 768) {
      setIsOpen(true);
    }
  };

  const menuItems = {
    student: [
      { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
      { path: '/student/achievements', label: 'My Achievements', icon: <FiAward /> },
      { path: '/student/biodata', label: 'Biodata', icon: <FiUsers /> },
      
      { 
        section: 'Exams',
        items: [
          { path: '/student/exam-catalog', label: 'Browse Exams', icon: <FiBookOpen /> },
          { path: '/student/my-exams', label: 'My Exams', icon: <FiCheckSquare /> },
          { path: '/student/my-requests', label: 'My Requests', icon: <FiFileText /> },
          { path: '/student/request-exam', label: 'Request Exam', icon: <FiPlus /> },
        ]
      },
    ],
    
    coordinator: [
      { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
      { path: '/coordinator/students', label: 'Students', icon: <FiUsers /> },
      { path: '/sub-coordinators', label: 'Sub-Coordinators', icon: <FiUserPlus /> },
      { path: '/coordinator/achievements', label: 'Approvals', icon: <FiCheckSquare /> },
      
      {
        section: 'Exam Management',
        items: [
          { path: '/coordinator/exam-requests', label: 'Exam Requests', icon: <FiPlus /> },
          { path: '/coordinator/submissions', label: 'Submissions', icon: <FiCheckSquare /> },
          { path: '/coordinator/exam-groups', label: 'Exam Groups', icon: <FiUsers /> },
        ]
      },
      
      {
        section: 'NPTEL Analytics',
        items: [
          { path: '/coordinator/nptel/dashboard', label: 'NPTEL Dashboard', icon: <FiTrendingUp /> },
          { path: '/coordinator/nptel/approval-queue', label: 'Approval Queue', icon: <FiClock /> },
        ]
      },
      
      {
        section: 'Analytics',
        items: [
          { path: '/coordinator/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
          { path: '/coordinator/reports', label: 'Reports', icon: <FiFileText /> },
        ]
      },
    ],
    
    'sub-coordinator': [
      { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
      { path: '/coordinator/students', label: 'Students', icon: <FiUsers /> },
      { path: '/coordinator/achievements', label: 'Approvals', icon: <FiCheckSquare /> },
      
      {
        section: 'Exam Management',
        items: [
          { path: '/coordinator/submissions', label: 'Submissions', icon: <FiCheckSquare /> },
          { path: '/coordinator/exam-groups', label: 'Exam Groups', icon: <FiUsers /> },
        ]
      },
      
      {
        section: 'NPTEL Analytics',
        items: [
          { path: '/coordinator/nptel/dashboard', label: 'NPTEL Dashboard', icon: <FiTrendingUp /> },
          { path: '/coordinator/nptel/approval-queue', label: 'Approval Queue', icon: <FiClock /> },
        ]
      },
    ],
    
    superadmin: [
      { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
      { path: '/superadmin/tenants', label: 'Institutions', icon: <FiUsers /> },
      { path: '/superadmin/coordinators', label: 'Coordinators', icon: <FiUsers /> },
    ],
  };

  const items = menuItems[user?.role] || menuItems.student;

  return (
    <>
      <EdgeTrigger 
        onMouseEnter={handleEdgeHover}
        onTouchStart={handleEdgeHover}
      />

      <MenuButton onClick={() => setIsOpen(true)} $isOpen={isOpen}>
        <FiMenu />
      </MenuButton>

      <Overlay $isOpen={isOpen} onClick={() => setIsOpen(false)} />

      <SidebarContainer $isOpen={isOpen}>
        <CloseButton onClick={() => setIsOpen(false)}>
          <FiX size={20} />
        </CloseButton>

        <Logo>
          <LogoTitle>
            <LogoIcon>🎯</LogoIcon>
            Achievement
          </LogoTitle>
          <LogoSubtitle>{user?.role || 'Student'}</LogoSubtitle>
        </Logo>

        <ScrollableNav>
          <Nav>
            {items.map((item, index) => {
              if (item.section) {
                return (
                  <NavSection key={`section-${index}`}>
                    <NavSectionTitle>{item.section}</NavSectionTitle>
                    {item.items.map((subItem) => (
                      <NavItem
                        key={subItem.path}
                        $active={location.pathname === subItem.path}
                        onClick={() => handleNavigation(subItem.path)}
                      >
                        {subItem.icon}
                        {subItem.label}
                      </NavItem>
                    ))}
                  </NavSection>
                );
              }

              return (
                <NavItem
                  key={item.path}
                  $active={location.pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.icon}
                  {item.label}
                </NavItem>
              );
            })}
          </Nav>
        </ScrollableNav>

        <SidebarFooter>
          <LogoutButton onClick={logout}>
            <FiLogOut />
            Logout
          </LogoutButton>
        </SidebarFooter>
      </SidebarContainer>
    </>
  );
}
