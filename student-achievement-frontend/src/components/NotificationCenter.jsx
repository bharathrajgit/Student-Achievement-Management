import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../services/api';
import { FiBell, FiX, FiCheckCircle, FiAlertCircle, FiMail } from 'react-icons/fi';

const NotificationBellContainer = styled.div`
  position: relative;
  cursor: pointer;
`;

const BellIcon = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #64748b;
  position: relative;
  padding: 8px;

  &:hover {
    color: #1e293b;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationPanel = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 380px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 8px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 480px) {
    width: 320px;
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    color: #64748b;
    font-size: 20px;

    &:hover {
      color: #1e293b;
    }
  }
`;

const NotificationList = styled.div`
  overflow-y: auto;
  flex: 1;
`;

const NotificationItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  background: ${props => props.$unread ? '#f0f9ff' : 'white'};
  transition: background 0.2s;

  &:hover {
    background: ${props => props.$unread ? '#e0f2fe' : '#f8fafc'};
  }

  &:last-child {
    border-bottom: none;
  }

  display: flex;
  gap: 12px;
`;

const NotificationIcon = styled.div`
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 2px;
  color: ${props => {
    if (props.$type === 'enrollment_approved') return '#10b981';
    if (props.$type === 'result_published') return '#667eea';
    if (props.$type === 'pending_approval') return '#f59e0b';
    return '#64748b';
  }};
`;

const NotificationContent = styled.div`
  flex: 1;

  .title {
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 4px 0;
    font-size: 13px;
  }

  .message {
    font-size: 12px;
    color: #64748b;
    margin: 0;
    line-height: 1.4;
  }

  .time {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 6px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: #64748b;

  svg {
    font-size: 32px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 13px;
  }
`;

const getNotificationIcon = (type) => {
  switch (type) {
    case 'enrollment_approved':
      return <FiCheckCircle />;
    case 'result_published':
      return <FiCheckCircle />;
    case 'pending_approval':
      return <FiAlertCircle />;
    default:
      return <FiBell />;
  }
};

const formatTime = (date) => {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/coordinator/nptel/notifications');
      setNotifications(response.data.data.notifications || []);
      setUnreadCount(response.data.data.unreadCount || 0);
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/coordinator/nptel/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };

  return (
    <NotificationBellContainer>
      <BellIcon onClick={() => setIsOpen(!isOpen)}>
        <FiBell />
        {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
      </BellIcon>

      {isOpen && (
        <NotificationPanel>
          <NotificationHeader>
            <h3>Notifications</h3>
            <button onClick={() => setIsOpen(false)}>
              <FiX />
            </button>
          </NotificationHeader>

          <NotificationList>
            {notifications.length === 0 ? (
              <EmptyState>
                <FiBell />
                <p>No notifications yet</p>
              </EmptyState>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  $unread={!notification.isRead}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <NotificationIcon $type={notification.type}>
                    <FiMail size={16} />
                  </NotificationIcon>
                  <NotificationContent>
                    <p className="title">{notification.title}</p>
                    <p className="message">{notification.message}</p>
                    <p className="time">{formatTime(notification.createdAt)}</p>
                  </NotificationContent>
                </NotificationItem>
              ))
            )}
          </NotificationList>
        </NotificationPanel>
      )}
    </NotificationBellContainer>
  );
}

export default NotificationCenter;
