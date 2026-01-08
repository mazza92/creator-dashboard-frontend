import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiX, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const SubscriptionCancel = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <CancelCard
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <IconWrapper>
          <FiX size={80} />
        </IconWrapper>

        <Title>Subscription Cancelled</Title>

        <Message>
          No worries! You can still upgrade anytime to unlock unlimited brand saves, pitches, and premium features.
        </Message>

        <FreeTierInfo>
          <InfoTitle>Your Free Tier Includes:</InfoTitle>
          <Features>
            <Feature>✓ Save up to 5 brands</Feature>
            <Feature>✓ Send up to 3 pitches per month</Feature>
            <Feature>✓ Access to basic brand directory</Feature>
          </Features>
        </FreeTierInfo>

        <ButtonGroup>
          <PrimaryButton
            onClick={() => navigate('/creator/dashboard/pr-brands')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Discover Brands <FiArrowRight />
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
          Want to upgrade later? You can do so anytime from your account settings.
        </Footer>
      </CancelCard>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const CancelCard = styled(motion.div)`
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
  color: #F59E0B;
  margin-bottom: 24px;

  svg {
    filter: drop-shadow(0 4px 12px rgba(245, 158, 11, 0.3));
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

const FreeTierInfo = styled.div`
  background: #F9FAFB;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
`;

const InfoTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px 0;
`;

const Features = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
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

export default SubscriptionCancel;
