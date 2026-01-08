import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Button } from 'antd';
import styled from 'styled-components';

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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
`;

const VerifyEmailPending = () => {
  return (
    <Container>
      <Card>
        <Title level={2}>Verify Your Email</Title>
        <Text>Please check your email for a verification link to complete your account setup. Check in your Spam box in case you can't find it.</Text>
        <br /><br />
        <Text>Didn't receive an email? <Link to="/resend-verification">Resend</Link></Text>
        <br /><br />
        <Button type="primary" href="/login">
          Back to Login
        </Button>
      </Card>
    </Container>
  );
};

export default VerifyEmailPending;