import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Typography, Button, message } from 'antd';
import { MailOutlined, ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import api from '../config/api';

const { Title, Text } = Typography;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: #F5F7FA;
`;

const Card = styled.div`
  background: #fff;
  padding: 48px 40px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  max-width: 480px;
  width: 100%;
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;

  .anticon {
    font-size: 36px;
    color: white;
  }
`;

const EmailHighlight = styled.div`
  background: #F3F4F6;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 16px 0 24px;
  font-weight: 600;
  color: #111827;
  font-size: 15px;
  word-break: break-all;
`;

const StepsList = styled.div`
  text-align: left;
  margin: 24px 0;
  padding: 20px;
  background: #FAFAFA;
  border-radius: 12px;
`;

const Step = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StepNumber = styled.div`
  width: 24px;
  height: 24px;
  background: #8B5CF6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
`;

const StepText = styled.div`
  color: #4B5563;
  font-size: 14px;
  line-height: 1.5;
`;

const ResendSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #E5E7EB;
`;

const CountdownText = styled.div`
  color: #6B7280;
  font-size: 13px;
  margin-top: 8px;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #10B981;
  font-weight: 500;
  margin-top: 8px;
`;

const SpamNote = styled.div`
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 16px;
  font-size: 13px;
  color: #92400E;
  text-align: left;
`;

const VerifyEmailPending = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendCount, setResendCount] = useState(0);

  // Get email from URL params or localStorage
  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const storedEmail = localStorage.getItem('onboarding_email');
    setEmail(urlEmail || storedEmail || '');

    // Check if we should show countdown (recently sent)
    const lastResend = localStorage.getItem('lastVerificationResend');
    if (lastResend) {
      const elapsed = Math.floor((Date.now() - parseInt(lastResend)) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      if (remaining > 0) {
        setCountdown(remaining);
      }
    }
  }, [searchParams]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!email || countdown > 0) return;

    setLoading(true);
    setResendSuccess(false);

    try {
      const { data } = await api.post('/api/resend-verification', { email });
      if (data?.verified) {
        message.success(data.message || 'You can continue setup now.');
        window.location.assign(data.redirect_url || '/onboarding');
        return;
      }
      setResendSuccess(true);
      setResendCount(prev => prev + 1);
      setCountdown(60); // 60 second cooldown
      localStorage.setItem('lastVerificationResend', Date.now().toString());
      message.success('Verification email sent!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to resend verification email.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <IconWrapper>
          <MailOutlined />
        </IconWrapper>

        <Title level={2} style={{ marginBottom: 8, color: '#111827' }}>
          Check your inbox
        </Title>

        <Text style={{ color: '#6B7280', fontSize: 15 }}>
          We've sent a verification link to:
        </Text>

        {email && (
          <EmailHighlight>{email}</EmailHighlight>
        )}

        <StepsList>
          <Step>
            <StepNumber>1</StepNumber>
            <StepText>Open the email from <strong>Newcollab</strong></StepText>
          </Step>
          <Step>
            <StepNumber>2</StepNumber>
            <StepText>Click the <strong>"Verify Email"</strong> button</StepText>
          </Step>
          <Step>
            <StepNumber>3</StepNumber>
            <StepText>Complete your profile setup</StepText>
          </Step>
        </StepsList>

        <SpamNote>
          <strong>📧 Can't find the email?</strong> Check your spam or promotions folder.
          The email is from <strong>team@newcollab.co</strong>
        </SpamNote>

        <ResendSection>
          {email ? (
            <>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleResend}
                loading={loading}
                disabled={countdown > 0}
                style={{
                  background: countdown > 0 ? '#E5E7EB' : '#8B5CF6',
                  borderColor: countdown > 0 ? '#E5E7EB' : '#8B5CF6',
                  height: 44,
                  fontWeight: 600
                }}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend verification email'}
              </Button>

              {resendSuccess && (
                <SuccessMessage>
                  <CheckCircleOutlined /> Email sent successfully!
                </SuccessMessage>
              )}

              {resendCount > 1 && (
                <CountdownText>
                  Still not receiving emails? <Link to="/resend-verification">Try a different email</Link>
                </CountdownText>
              )}
            </>
          ) : (
            <Link to="/resend-verification">
              <Button type="link" style={{ color: '#8B5CF6' }}>
                Didn't receive an email? Resend
              </Button>
            </Link>
          )}
        </ResendSection>

        <div style={{ marginTop: 24 }}>
          <Link to="/onboarding">
            <Button type="link" style={{ color: '#8B5CF6' }}>
              Continue setup
            </Button>
          </Link>
          <div style={{ marginTop: 8 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
              Wrong email? <Link to="/register/creator" style={{ color: '#8B5CF6' }}>Start over</Link>
            </Text>
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default VerifyEmailPending;
