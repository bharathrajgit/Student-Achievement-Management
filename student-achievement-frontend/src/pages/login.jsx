import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { AppToast } from '../components/AppToast';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    top: -100px;
    left: -100px;
    animation: float 6s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
    border-radius: 50%;
    bottom: -50px;
    right: -50px;
    animation: float 8s ease-in-out infinite reverse;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(30px);
    }
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15),
    0 0 1px rgba(255, 255, 255, 0.5) inset;
  width: 100%;
  max-width: 420px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
  animation: slideUp 0.6s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 480px) {
    padding: 32px 24px;
    max-width: 100%;
    margin: 16px;
  }
`;

const LogoArea = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  animation: fadeIn 0.8s ease-out 0.1s both;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const LogoCircle = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  animation: bounce 2s ease-in-out infinite;

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }
`;

const Title = styled.h1`
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  text-align: center;
  animation: fadeIn 0.8s ease-out 0.2s both;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Subtitle = styled.p`
  margin: 0 0 32px 0;
  font-size: 14px;
  color: #718096;
  text-align: center;
  animation: fadeIn 0.8s ease-out 0.3s both;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: fadeIn 0.8s ease-out ${props => props.$delay || 0.4}s both;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #2d3748;
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  padding: 12px 16px 12px 44px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  background: #f8f9fb;
  transition: all 0.3s ease;
  font-family: inherit;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
  }

  &:disabled {
    background: #f0f0f0;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #cbd5e0;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a0aec0;
  pointer-events: none;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ToggleIcon = styled.button`
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;

  &:hover {
    color: #667eea;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const Button = styled.button`
  padding: 14px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.8s ease-out 0.6s both;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 12px 24px rgba(102, 126, 234, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: linear-gradient(135deg, #fed7d7 0%, #fecaca 100%);
  border: 1.5px solid #fc8181;
  border-radius: 12px;
  color: #c53030;
  font-size: 13px;
  font-weight: 500;
  animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  gap: 10px;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::before {
    content: '✕';
    font-weight: 700;
    font-size: 16px;
  }
`;

const SuccessMessage = styled.div`
  padding: 12px 16px;
  background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%);
  border: 1.5px solid #68d391;
  border-radius: 12px;
  color: #22543d;
  font-size: 13px;
  font-weight: 500;
  animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  gap: 10px;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::before {
    content: '✓';
    font-weight: 700;
    font-size: 16px;
  }
`;

const FooterText = styled.p`
  text-align: center;
  font-size: 13px;
  color: #718096;
  margin-top: 20px;
  animation: fadeIn 0.8s ease-out 0.7s both;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setLoading(true);

  try {
    console.log('🔐 Login attempt:', { email: formData.email });

    const response = await login(formData.email, formData.password);

    console.log('✅ Login successful:', response);

    // show success toast
    setToast({
      show: true,
      type: 'success',
      message: 'Login successful! Redirecting...',
    });

    setTimeout(() => {
      navigate('/dashboard');
    }, 800);
  } catch (err) {
    console.error('❌ Login error:', err);

    let errorMsg = 'Login failed';
    if (err.response?.data?.message) {
      errorMsg = err.response.data.message;
    } else if (err.response?.data?.error) {
      errorMsg = err.response.data.error;
    } else if (err.message) {
      errorMsg = err.message;
    }

    // show error toast
    setToast({
      show: true,
      type: 'danger',
      message: errorMsg,
    });

    setFormData({ ...formData, password: '' });
  } finally {
    setLoading(false);
  }
};


  return (
    <>
    <Container>
      <Card>
        <LogoArea>
          <LogoCircle>📚</LogoCircle>
        </LogoArea>

        <Title>Welcome Back</Title>
        <Subtitle>Login in to your account to continue</Subtitle>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <FormGroup $delay="0.4s">
            <Label>Email Address</Label>
            <InputWrapper>
              <InputIcon>
                <FiMail />
              </InputIcon>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your.email@example.com"
                required
                autoComplete="email"
                disabled={loading}
              />
            </InputWrapper>
          </FormGroup>

          <FormGroup $delay="0.5s">
            <Label>Password</Label>
            <InputWrapper>
              <InputIcon>
                <FiLock />
              </InputIcon>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <ToggleIcon
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </ToggleIcon>
            </InputWrapper>
          </FormGroup>

          <Button type="submit" disabled={loading}>
            {loading ? '🔄 Logging in...' : '🔐 Login Here'}
          </Button>
        </Form>

        <FooterText>
          © 2025 Achievement Portal. All rights reserved.
        </FooterText>
      </Card>
    </Container>
    <AppToast
      show={toast.show}
      type={toast.type}
      message={toast.message}
      onClose={() => setToast(prev => ({ ...prev, show: false }))}
    />
    </>
  );
}
