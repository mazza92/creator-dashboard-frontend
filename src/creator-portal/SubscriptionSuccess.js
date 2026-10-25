import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../config/api';
import { trackProPurchase } from '../utils/subscriptionAnalytics';
import { getTikTokMatchData, whenTikTokReady } from '../lib/cookieConsent';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const openPolly = () => navigate('/creator/dashboard/for-you?autopilot=pro_started');

  const connectGmail = async () => {
    setConnecting(true);
    try {
      const res = await api.get('/api/polly/autopilot/gmail/connect');
      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }
    } catch (err) {
      console.error('Gmail connect failed', err);
    }
    setConnecting(false);
    openPolly();
  };

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (sessionId) {
      trackProPurchase({ sessionId, tier: 'pro' });

      // The pixel loads after this effect (CookieSettings mounts higher up),
      // so wait for it instead of silently dropping the event.
      const ttqKey = `ttq_purchase_${sessionId}`;
      whenTikTokReady().then((ttq) => {
        try {
          if (!ttq || window.sessionStorage.getItem(ttqKey)) return;
          ttq.track('CompletePayment', {
            content_type: 'product',
            content_id: 'subscription_pro_monthly',
            content_name: 'NewCollab Pro',
            value: 19,
            currency: 'USD'
          }, { event_id: sessionId }); // same id as the server event => counted once
          window.sessionStorage.setItem(ttqKey, '1');
        } catch (_) { /* ignore */ }
      });
    }

    const confirmAndFetchStatus = async () => {
      try {
        if (sessionId) {
          await api.post(
            '/api/subscription/confirm-checkout',
            { session_id: sessionId, ...getTikTokMatchData() }
          );
        }

        const response = await api.get('/api/subscription/status');
        setSubscriptionInfo(response.data);

        setLoading(false);
      } catch (error) {
        console.error('Error confirming checkout:', error);
        setLoading(false);
      }
    };

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

        <Title>Welcome to Pro! 🎉</Title>

        <Message>
          Pro is on. One last step: connect Gmail and Polly starts pitching brands for you.
        </Message>

        {!loading && subscriptionInfo && (
          <Features>
            <Feature>✅ Polly picks matched brands every week</Feature>
            <Feature>✅ She writes and sends the pitches from your Gmail, with nothing to approve</Feature>
            <Feature>✅ She follows up on day 4 and 10 and keeps you posted</Feature>
            <Feature>✅ When a brand says yes, she writes the reply with your rate</Feature>
            <Feature>✅ Unlimited roster applications</Feature>
          </Features>
        )}

        <ButtonGroup>
          <PrimaryButton
            onClick={connectGmail}
            disabled={connecting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {connecting ? 'Opening Google…' : <>Connect Gmail <FiArrowRight /></>}
          </PrimaryButton>
          <Reassure>Send-only access. Polly can&apos;t read your inbox.</Reassure>

          <LaterLink type="button" onClick={openPolly}>
            I&apos;ll do it later
          </LaterLink>
        </ButtonGroup>

        <Footer>
          Keep Pro through the first month. That is when most first replies land.
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

const Reassure = styled.p`
  font-size: 13px;
  color: #6B7280;
  margin: -4px 0 0;
`;

const LaterLink = styled.button`
  background: none;
  border: none;
  color: #6B7280;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
  padding: 4px;
`;

const Footer = styled.p`
  font-size: 13px;
  color: #9CA3AF;
  margin: 0;
`;

export default SubscriptionSuccess;
