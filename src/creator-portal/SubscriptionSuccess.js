import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../config/api';
import { trackProPurchase } from '../utils/subscriptionAnalytics';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    const confirmAndFetchStatus = async () => {
      try {
        // First, confirm the checkout to activate subscription
        if (sessionId) {
          await api.post(
            '/api/subscription/confirm-checkout',
            { session_id: sessionId }
          );
        }

        // Then fetch the updated subscription status
        const response = await api.get('/api/subscription/status');
        setSubscriptionInfo(response.data);

        const tier = response.data?.tier || 'pro';
        if (sessionId) {
          trackProPurchase({ sessionId, tier });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error confirming subscription:', error);
        // Still attribute purchase if Stripe redirected here with a session_id
        if (sessionId) {
          trackProPurchase({ sessionId, tier: 'pro' });
        }
        setLoading(false);
      }
    };

    // Small delay to ensure session is ready
    setTimeout(confirmAndFetchStatus, 1000);
  }, [searchParams]);

  return (
    <Container>
      <SuccessCard
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <IconWrapper>
          <FiCheckCircle size={80} />
        </IconWrapper>

        <Title>Welcome to {subscriptionInfo?.tier === 'elite' ? 'Elite' : 'Pro'}! 🎉</Title>

        <Message>
          Your subscription has been activated successfully. You now have access to unlimited brand saves, PR Packages, and premium features!
        </Message>

        {!loading && subscriptionInfo && (
          <Features>
            <Feature>✅ Unlimited brand saves</Feature>
            <Feature>✅ Unlimited PR Packages per month</Feature>
            <Feature>✅ Access to premium brands</Feature>
            <Feature>✅ Ready-to-send pitches in 3 tones</Feature>
            <Feature>✅ Email tracking & analytics</Feature>
            {subscriptionInfo.tier === 'elite' && (
              <>
                <Feature>✅ Professional PR tools</Feature>
                <Feature>✅ Personal PR coach</Feature>
                <Feature>✅ Exclusive brand partnerships</Feature>
              </>
            )}
          </Features>
        )}

        <ButtonGroup>
          <PrimaryButton
            onClick={() => navigate('/creator/dashboard/for-you')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Discovering Brands <FiArrowRight />
          </PrimaryButton>

          <SecondaryButton
            onClick={() => navigate('/creator/dashboard/pr-pipeline')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Pipeline
          </SecondaryButton>
        </ButtonGroup>

        <Footer>
          You can manage your subscription anytime in your account settings.
        </Footer>
      </SuccessCard>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const SuccessCard = styled(motion.div)`
  background: white;
  border-radius: 24px;
  padding: 60px 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 40px 24px;
  }
`;

const IconWrapper = styled.div`
  color: #10B981;
  margin-bottom: 24px;

  svg {
    filter: drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3));
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 16px 0;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const Message = styled.p`
  font-size: 16px;
  color: #6B7280;
  line-height: 1.6;
  margin: 0 0 32px 0;
`;

const Features = styled.div`
  background: #F9FAFB;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
`;

const Feature = styled.div`
  font-size: 15px;
  color: #374151;
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const PrimaryButton = styled(motion.button)`
  width: 100%;
  padding: 16px 32px;
  background: linear-gradient(135deg, #3B82F6, #EC4899);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
  }
`;

const SecondaryButton = styled(motion.button)`
  width: 100%;
  padding: 16px 32px;
  background: white;
  color: #3B82F6;
  border: 2px solid #3B82F6;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #EFF6FF;
  }
`;

const Footer = styled.p`
  font-size: 13px;
  color: #9CA3AF;
  margin: 0;
`;

export default SubscriptionSuccess;
