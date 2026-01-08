import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Typography, Input, Button, message } from 'antd';
import axios from 'axios';
import styled from 'styled-components';

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

const ResendVerification = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResend = async () => {
    if (!email) {
      message.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const fullUrl = `${API_URL}/api/resend-verification`;
      console.log(`🟢 Calling API: ${fullUrl}`);
      const response = await axios.post(fullUrl, { email });
      console.log('🟢 Resend response:', response.data);
      message.success('Verification email resent successfully!');
      navigate('/verify-email-pending', { replace: true });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to resend verification email.';
      console.error('🔥 Resend error:', err.response?.data || err);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title level={2}>Resend Verification Email</Title>
        <Text>Enter your email address to receive a new verification link.</Text>
        <br /><br />
        <Input
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: '16px' }}
        />
        <Button type="primary" onClick={handleResend} loading={loading}>
          Resend Email
        </Button>
        <br /><br />
        <Link to="/register">Back to Registration</Link>
      </Card>
    </Container>
  );
};

export default ResendVerification;