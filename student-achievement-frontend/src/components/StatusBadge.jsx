// src/components/StatusBadge.jsx
import React from 'react';
import styled from 'styled-components';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

const BadgeWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  ${props => {
    switch (props.status) {
      case 'Registered':
        return `
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #0c4a6e;
          border: 1px solid #7dd3fc;
        `;
      case 'Submitted':
        return `
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #78350f;
          border: 1px solid #fcd34d;
        `;
      case 'Passed':
        return `
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          color: #15803d;
          border: 1px solid #86efac;
        `;
      case 'Failed':
        return `
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #7f1d1d;
          border: 1px solid #fca5a5;
        `;
      case 'Pending':
        return `
          background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
          color: #5b21b6;
          border: 1px solid #d8b4fe;
        `;
      default:
        return `
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          color: #374151;
          border: 1px solid #d1d5db;
        `;
    }
  }}

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  &:hover {
    transform: scale(1.05);
  }
`;

const getStatusIcon = (status) => {
  switch (status) {
    case 'Registered':
      return <Clock size={16} />;
    case 'Submitted':
      return <AlertCircle size={16} />;
    case 'Passed':
      return <CheckCircle size={16} />;
    case 'Failed':
      return <XCircle size={16} />;
    default:
      return null;
  }
};

const StatusBadge = ({ status, children }) => {
  return (
    <BadgeWrapper status={status}>
      {getStatusIcon(status)}
      {children || status}
    </BadgeWrapper>
  );
};

export default StatusBadge;
