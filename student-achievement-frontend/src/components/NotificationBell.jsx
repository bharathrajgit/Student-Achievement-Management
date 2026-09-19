import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const BellContainer = styled.div`
  position: relative;
`;

const BellButton = styled.button`
  position: relative;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  font-size: 20px;
  padding: 10px;
  color: #4a5568;
  border-radius: 10px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  &:hover {
    background: #edf2f7;
    border-color: #cbd5e0;
    color: #667eea;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    padding: 8px;
    font-size: 18px;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  text-align: center;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    top: 4px;
    right: 4px;
    font-size: 9px;
    padding: 1px 5px;
    min-width: 16px;
  }
`;

const Dropdown = styled.div`
  position: ${props => props.$isMobile ? 'fixed' : 'absolute'};
  top: ${props => props.$isMobile ? '0' : 'calc(100% + 8px)'};
  right: ${props => props.$isMobile ? '0' : '0'};
  left: ${props => props.$isMobile ? '0' : 'auto'};
  bottom: ${props => props.$isMobile ? '0' : 'auto'};
  width: ${props => props.$isMobile ? '100%' : '380px'};
  max-height: ${props => props.$isMobile ? '100vh' : '450px'};
  overflow-y: auto;
  background: white;
  border-radius: ${props => props.$isMobile ? '0' : '12px'};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  z-index: 1000;
  display: ${props => props.$show ? 'block' : 'none'};
  animation: ${props => props.$isMobile ? 'slideUp' : 'slideDown'} 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    max-height: 100vh;
  }
`;

const DropdownHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 700;
  font-size: 15px;
  color: #1a202c;
  background: #f7fafc;
  border-radius: ${props => props.$isMobile ? '0' : '12px 12px 0 0'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;

  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 14px;
  }
`;

const CloseButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  color: #4a5568;
  cursor: pointer;
  padding: 4px;
  line-height: 1;

  @media (max-width: 768px) {
    display: block;
  }
`;

const ClearButton = styled.button`
  padding: 4px 12px;
  background: transparent;
  color: #667eea;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #edf2f7;
  }

  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 11px;
  }
`;

const NotificationItem = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: background 0.2s;
  background: ${props => props.$unread ? '#f0f4ff' : 'white'};

  &:hover {
    background: #f7fafc;
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  font-size: 13px;
  color: #1a202c;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 12px;
    margin-bottom: 4px;
  }
`;

const NotificationIcon = styled.span`
  font-size: 16px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const NotificationMessage = styled.div`
  font-size: 13px;
  color: #4a5568;
  margin-bottom: 6px;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 12px;
    margin-bottom: 4px;
  }
`;

const NotificationTime = styled.div`
  font-size: 11px;
  color: #a0aec0;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 10px;
  }
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: #a0aec0;

  .emoji {
    font-size: 48px;
    margin-bottom: 16px;
  }

  @media (max-width: 768px) {
    padding: 40px 20px;

    .emoji {
      font-size: 40px;
      margin-bottom: 12px;
    }
  }
`;

const Overlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${props => props.$show ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

export function NotificationBell() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchNotificationCount = useCallback(async () => {
    if (!user?.role) return;

    try {
      let endpoint;

      if (user.role === 'coordinator' || user.role === 'sub-coordinator') {
        endpoint = '/admin/notifications/count';
      } else if (user.role === 'student') {
        endpoint = '/student/notifications/count';
      } else {
        return;
      }

      const response = await api.get(endpoint);
      setCount(response.data.data.total || 0);
    } catch (err) {
      console.error('Fetch notification count error:', err);
    }
  }, [user?.role]);

  // ✅ FIXED: Reduced interval to 5 seconds for real-time updates
  useEffect(() => {
    fetchNotificationCount();

    const interval = setInterval(fetchNotificationCount, 5000); // Changed from 30000ms to 5000ms
    return () => clearInterval(interval);
  }, [fetchNotificationCount]);

  // ✅ NEW: Refetch when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      fetchNotificationCount();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchNotificationCount]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (!isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile]);

  const fetchNotifications = async () => {
    if (!user?.role) return;

    try {
      let endpoint;

      if (user.role === 'coordinator' || user.role === 'sub-coordinator') {
        endpoint = '/admin/notifications';
      } else if (user.role === 'student') {
        endpoint = '/student/notifications';
      } else {
        return;
      }

      const response = await api.get(endpoint);
      setNotifications(response.data.data || []);
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      fetchNotifications();
    }
  };

  const handleClose = () => {
    setShowDropdown(false);
  };

  const handleClear = async () => {
    try {
      const notificationIds = notifications.map(n => n.id);

      let endpoint;

      if (user?.role === 'coordinator' || user?.role === 'sub-coordinator') {
        endpoint = '/admin/notifications/mark-read';
      } else if (user?.role === 'student') {
        endpoint = '/student/notifications/mark-read';
      } else {
        return;
      }

      await api.post(endpoint, { notificationIds });

      setNotifications([]);
      setCount(0);
    } catch (err) {
      console.error('Clear notifications error:', err);
      setNotifications([]);
      setCount(0);
    }
  };

  const formatTime = date => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  const getNotificationIcon = (type, title) => {
  if (title?.includes('Verified') || type === 'achievement_approved') return '✅';
  if (title?.includes('Rejected') || type === 'achievement_rejected') return '❌';
  if (title?.includes('Pending')) return '⏳';
  return '🔔';
};


  return (
    <>
      <Overlay $show={showDropdown && isMobile} onClick={handleClose} />

      <BellContainer ref={dropdownRef}>
        <BellButton onClick={handleBellClick}>
          🔔
          {count > 0 && <Badge>{count > 99 ? '99+' : count}</Badge>}
        </BellButton>

        <Dropdown $show={showDropdown} $isMobile={isMobile}>
          <DropdownHeader $isMobile={isMobile}>
            <span style={{ marginLeft: '48px' }}>Notifications</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {notifications.length > 0 && count > 0 && (
                <ClearButton onClick={handleClear}>Clear</ClearButton>
              )}
              {isMobile && <CloseButton onClick={handleClose}>×</CloseButton>}
            </div>
          </DropdownHeader>

          {notifications.length === 0 || count === 0 ? (
            <EmptyState>
              <div className="emoji">🔕</div>
              <div>No new notifications</div>
            </EmptyState>
          ) : (
            notifications.map(notif => (
              <NotificationItem
                key={notif.id}
                $unread={true}
                onClick={() => {
                  setShowDropdown(false);
                  if (notif.link) window.location.href = notif.link;
                }}
              >
                <NotificationTitle>
                  <NotificationIcon>
                    {getNotificationIcon(notif.type, notif.title)}
                  </NotificationIcon>
                  {notif.title}
                </NotificationTitle>
                <NotificationMessage>
                  {notif.message}
                  {notif.points && (
                    <span
                      style={{
                        color: '#48bb78',
                        fontWeight: 600,
                        marginLeft: '4px',
                      }}
                    >
                      +{notif.points} points
                    </span>
                  )}
                </NotificationMessage>
                <NotificationTime>{formatTime(notif.time)}</NotificationTime>
              </NotificationItem>
            ))
          )}
        </Dropdown>
      </BellContainer>
    </>
  );
}
