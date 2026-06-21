import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Typography, Spin, message } from 'antd';
import api from '../config/api';
import styled from 'styled-components';
import { UserContext } from '../contexts/UserContext';

const { Title, Text } = Typography;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  text-align: center;
`;

const Card = styled.div`
  background: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
`;

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { user, loading: userLoading, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'already-verified', 'expired', or 'invalid'

  useEffect(() => {
    let token = searchParams.get('token');
    if (!token) {
      setError('Missing verification token.');
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        console.log(`🟢 Calling API: /api/verify-email?token=${token}`);
        const response = await api.get(`/api/verify-email?token=${token}`);
        console.log('🟢 Verification response:', response.data);
        message.success('Email verified successfully!');
        
        // Set user context with profile completion data
        if (response.data.user_id) {
          const userData = {
            id: response.data.user_id,
            role: response.data.user_role,
            creator_id: response.data.creator_id || null,
            brand_id: response.data.brand_id || null,
          };
          console.log('🟢 Setting user context after verification:', userData);
          setUser(userData);
        }
        
        // Use the redirect URL from the backend response
        if (response.data.redirect_url) {
          // Always extract just the pathname to avoid URL concatenation issues
          try {
            const urlObj = new URL(response.data.redirect_url, window.location.origin);
            const redirectUrl = urlObj.pathname + urlObj.search + urlObj.hash;
            console.log('🔄 Redirecting to:', redirectUrl);
            setTimeout(() => {
              navigate(redirectUrl, { replace: true });
            }, 1800); // Give user a moment to see the message
          } catch (e) {
            console.log('🔄 Using fallback redirect:', response.data.redirect_url);
            setTimeout(() => {
              navigate(response.data.redirect_url, { replace: true });
            }, 1800);
          }
        } else {
          // Fallback to onboarding if no redirect URL provided
          console.log('🔄 No redirect URL provided, using fallback to onboarding');
          setTimeout(() => {
            navigate('/onboarding', { replace: true });
          }, 1800);
        }
      } catch (err) {
        const backendError = err.response?.data?.error || '';
        let errorMsg = 'Failed to verify email.';
        let type = 'invalid';

        // Provide specific error messages for common scenarios
        if (backendError.toLowerCase().includes('already verified') ||
            backendError.toLowerCase().includes('already been verified')) {
          errorMsg = 'This email is already verified! You can log in now.';
          type = 'already-verified';
        } else if (backendError.toLowerCase().includes('expired') ||
                   backendError.toLowerCase().includes('invalid token')) {
          errorMsg = 'This verification link has expired. Please request a new one.';
          type = 'expired';
        } else if (backendError.toLowerCase().includes('not found') ||
                   backendError.toLowerCase().includes('invalid')) {
          errorMsg = 'Invalid verification link. Please check the link or request a new one.';
          type = 'invalid';
        } else if (backendError) {
          errorMsg = backendError;
        }

        console.error('🔥 Verification error:', err, err.response?.data);
        setError(errorMsg);
        setErrorType(type);
        message.error(errorMsg);
        setLoading(false);
      }
    };

    verifyToken();
    // eslint-disable-next-line
  }, [searchParams, navigate]);

  if (loading || userLoading) {
    return (
      <Container>
        <Card>
          <Spin size="large" />
          <Title level={2}>Verifying Email...</Title>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card>
          <Title level={2}>
            {errorType === 'already-verified' ? 'Already Verified' : 'Verification Failed'}
          </Title>
          <Text>{error}</Text>
          <br /><br />
          {errorType === 'already-verified' ? (
            <Link to="/login" style={{
              padding: '10px 20px',
              background: '#8B5CF6',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'inline-block'
            }}>
              Go to Login
            </Link>
          ) : errorType === 'expired' ? (
            <>
              <Link to="/resend-verification" style={{
                padding: '10px 20px',
                background: '#8B5CF6',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block',
                marginRight: '10px'
              }}>
                Request New Link
              </Link>
              <Link to="/login" style={{
                padding: '10px 20px',
                background: '#E5E7EB',
                color: '#111827',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block'
              }}>
                Go to Login
              </Link>
            </>
          ) : (
            <>
              <Link to="/resend-verification" style={{
                padding: '10px 20px',
                background: '#8B5CF6',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block',
                marginRight: '10px'
              }}>
                Resend Verification Email
              </Link>
              <Link to="/register/creator" style={{
                padding: '10px 20px',
                background: '#E5E7EB',
                color: '#111827',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block'
              }}>
                Create New Account
              </Link>
            </>
          )}
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <Title level={2}>Email Verified</Title>
        <Text>Redirecting to your dashboard...</Text>
      </Card>
    </Container>
  );
};

export default VerifyEmail;