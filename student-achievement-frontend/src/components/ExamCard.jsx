// src/components/ExamCard.jsx
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Calendar, Tag, Users, ArrowRight, Loader } from 'lucide-react';

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const CardWrapper = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  animation: ${slideUp} 0.5s ease;
  height: 100%;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 28px rgba(102, 126, 234, 0.2);
    border-color: #667eea;
  }
`;

const CardHeader = styled.div`
  margin-bottom: 16px;

  h3 {
    font-size: 1.25rem;
    color: #1f2937;
    margin: 0 0 8px 0;
    font-weight: 700;
    line-height: 1.4;
  }

  .platform-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-top: 8px;

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const CardBody = styled.div`
  flex: 1;
  margin-bottom: 16px;

  .description {
    color: #6b7280;
    font-size: 0.95rem;
    line-height: 1.6;
    margin: 0 0 16px 0;
  }

  .meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6b7280;
      font-size: 0.9rem;

      svg {
        width: 16px;
        height: 16px;
        color: #667eea;
        flex-shrink: 0;
      }
    }
  }
`;

const CardFooter = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
`;

const DateInput = styled.input`
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
  }
`;

const RegisterButton = styled.button`
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ErrorText = styled.p`
  color: #ef4444;
  font-size: 0.85rem;
  margin: 8px 0 0 0;
  padding: 8px 12px;
  background: #fee2e2;
  border-radius: 6px;
  border-left: 3px solid #ef4444;
`;

const ExamCard = ({ exam, onRegister, loading = false }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');

  const handleRegister = () => {
    if (!selectedDate) {
      setError('Please select a completion date');
      return;
    }
    setError('');
    onRegister(exam._id, selectedDate);
    setSelectedDate('');
  };

  return (
    <CardWrapper>
      <CardHeader>
        <h3>{exam.examName}</h3>
        <div className="platform-badge">
          <Tag size={14} />
          {exam.platform}
        </div>
      </CardHeader>

      <CardBody>
        <p className="description">
          {exam.description || 'Professional certification exam'}
        </p>
        <div className="meta">
          <div className="meta-item">
            <Calendar size={16} />
            {exam.category || 'Certification'}
          </div>
          <div className="meta-item">
            <Users size={16} />
            {exam.registrationCount || 0} registered
          </div>
        </div>
      </CardBody>

      <CardFooter>
        <DateInput
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setError('');
          }}
          disabled={loading}
        />
        <RegisterButton
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader size={16} />
              Registering...
            </>
          ) : (
            <>
              <ArrowRight size={16} />
              Register
            </>
          )}
        </RegisterButton>
      </CardFooter>

      {error && <ErrorText>{error}</ErrorText>}
    </CardWrapper>
  );
};

export default ExamCard;
