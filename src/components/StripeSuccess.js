import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { apiClient } from '../config/api';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
`;

const StripeSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log(`🟢 Navigating to: ${location.pathname}`);

    const confirmStripeAccount = async () => {
      try {
        console.log('🔍 Calling /stripe/confirm');
        const response = await apiClient.post('/stripe/confirm', {}, { withCredentials: true });
        console.log('🟢 Stripe confirm response:', response.data);
        window.alert('Stripe account connected successfully!');
        console.log('✅ Redirecting to /creator/dashboard/overview');
        navigate('/creator/dashboard/overview', { replace: true });
      } catch (error) {
        console.error('🔍 Stripe confirm error:', error.response?.data || error.message);
        window.alert('Failed to confirm Stripe account. Please try again.');
        console.warn('🔍 Redirecting to /login');
        navigate('/login', { replace: false });
      }
    };

    confirmStripeAccount();
  }, [navigate, location.pathname]);

  return (
    <Container>
      <div>Processing Stripe connection...</div>
    </Container>
  );
};

export default StripeSuccess;