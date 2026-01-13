import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiZap } from 'react-icons/fi';
import axios from 'axios';
import { message } from 'antd';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const UpgradeModal = ({ isOpen, onClose, currentCount, limit, feature }) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (tier) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE}/api/subscription/create-checkout`,
        { tier },
        { withCredentials: true }
      );

      // Redirect to Stripe Checkout
      window.location.href = response.data.checkout_url;
    } catch (error) {
      console.error('Upgrade error:', error);
      message.error('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <Modal
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>

          <Header>
            <Icon>
              <FiZap />
            </Icon>
            <Title>You've Hit Your Daily Limit!</Title>
            <Subtitle>
              You have used your {limit} free {feature} for today.
            </Subtitle>
            <DailyResetNote>
              ⏰ Come back tomorrow for {limit} more, or upgrade now for unlimited access!
            </DailyResetNote>
          </Header>

          <LimitInfo>
            <LimitText>
              {currentCount} / {limit} {feature} used today
            </LimitText>
            <ProgressBar>
              <ProgressFill width={100} />
            </ProgressBar>
          </LimitInfo>

          <PlansContainer>
            <Plan featured>
              <Badge>Impulse Buy Pricing</Badge>
              <PlanHeader>
                <PlanName>Pro</PlanName>
                <PlanPrice>
                  $12<PlanPeriod>/month</PlanPeriod>
                </PlanPrice>
                <PriceNote>Less than a Spotify subscription!</PriceNote>
              </PlanHeader>

              <Features>
                <Feature>
                  <FiCheck /> <span><strong>Unlimited Applications</strong> (No daily limits!)</span>
                </Feature>
                <Feature>
                  <FiCheck /> <span>Direct PR Manager Emails (Skip the forms!)</span>
                </Feature>
                <Feature>
                  <FiCheck /> <span>Proven Pitch Templates</span>
                </Feature>
                <Feature>
                  <FiCheck /> <span>Advanced CRM Pipeline</span>
                </Feature>
                <Feature>
                  <FiCheck /> <span>Priority Support</span>
                </Feature>
              </Features>

              <ValueProp>
                💡 One PR package could get you $500 worth of free products. $12/month is a steal!
              </ValueProp>

              <UpgradeButton
                featured
                onClick={() => handleUpgrade('pro')}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Processing...' : 'Upgrade Now for $12/month'}
              </UpgradeButton>
            </Plan>
          </PlansContainer>

          <Footer>
            <FooterText>30-day money-back guarantee • Cancel anytime</FooterText>
          </Footer>
        </Modal>
      </Overlay>
    </AnimatePresence>
  );
};

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const Modal = styled(motion.div)`
  background: white;
  border-radius: 24px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 40px;

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 20px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: #F3F4F6;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  color: #6B7280;
  transition: all 0.2s;

  &:hover {
    background: #E5E7EB;
    color: #111827;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Icon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3B82F6, #EC4899);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 32px;
  color: white;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #6B7280;
  margin: 0;
`;

const LimitInfo = styled.div`
  background: #F9FAFB;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
`;

const LimitText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #6B7280;
  margin-bottom: 8px;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.width}%;
  background: linear-gradient(90deg, #3B82F6, #EC4899);
  transition: width 0.3s ease;
`;

const PlansContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
`;

const Plan = styled.div`
  border: 2px solid ${props => props.featured ? '#3B82F6' : '#E5E7EB'};
  border-radius: 16px;
  padding: 24px;
  position: relative;
  background: ${props => props.featured ? 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' : 'white'};
  max-width: 420px;
  width: 100%;
`;

const Badge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #3B82F6, #EC4899);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
`;

const PlanHeader = styled.div`
  margin-bottom: 20px;
`;

const PlanName = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
`;

const PlanPrice = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: #111827;
`;

const PlanPeriod = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #6B7280;
`;

const Features = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4B5563;

  svg {
    color: #10B981;
    flex-shrink: 0;
  }
`;

const UpgradeButton = styled(motion.button)`
  width: 100%;
  padding: 14px 24px;
  border-radius: 12px;
  border: none;
  background: ${props => props.featured
    ? 'linear-gradient(135deg, #3B82F6, #EC4899)'
    : '#3B82F6'};
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
  }
`;

const Footer = styled.div`
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #E5E7EB;
`;

const FooterText = styled.p`
  font-size: 13px;
  color: #6B7280;
  margin: 0;
`;

const DailyResetNote = styled.p`
  font-size: 14px;
  color: #F59E0B;
  margin: 12px 0 0 0;
  font-weight: 500;
  padding: 8px 16px;
  background: #FEF3C7;
  border-radius: 8px;
  display: inline-block;
`;

const PriceNote = styled.p`
  font-size: 12px;
  color: #10B981;
  margin: 4px 0 0 0;
  font-weight: 500;
`;

const ValueProp = styled.div`
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  border-radius: 8px;
  padding: 12px;
  margin: 16px 0;
  font-size: 13px;
  color: #15803D;
  text-align: center;
  font-weight: 500;
`;

export default UpgradeModal;
