import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Typography, Spin, message } from 'antd';
import axios from 'axios';
import styled from 'styled-components';
import { UserContext } from '../contexts/UserContext'; // Adjust path

// Use the consistent API configuration
const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');

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

  useEffect(() => {
    let token = searchParams.get('token');
    if (!token) {
      setError('Missing verification token.');
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const fullUrl = `${API_URL}/api/verify-email?token=${token}`;
        console.log(`🟢 Calling API: ${fullUrl}`);
        const response = await axios.get(fullUrl, {
          withCredentials: true,
        });
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
        const errorMsg = err.response?.data?.error || 'Failed to verify email.';
        console.error('🔥 Verification error:', err, err.response?.data);
        setError(errorMsg);
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
          <Title level={2}>Verification Failed</Title>
          <Text>{error}</Text>
          <br /><br />
          <Link to="/resend-verification">Resend Verification Email</Link>
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