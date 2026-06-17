import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiZap, FiLock, FiShield } from 'react-icons/fi';
import api from '../config/api';
import { message } from 'antd';
import { tokens } from '../theme/tokens';

const UpgradeModal = ({ isOpen, onClose, currentCount = 0, limit = 3, feature, pitchLimits }) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (tier) => {
    try {
      setLoading(true);
      const response = await api.post(
        '/api/subscription/create-checkout',
        { tier }
      );

      // Redirect to Stripe Checkout
      window.location.href = response.data.checkout_url;
    } catch (error) {
      console.error('Upgrade error:', error);
      const errorData = error.response?.data;
      if (errorData?.code === 'stripe_account_pending') {
        message.warning('Payment processing is temporarily unavailable. Please try again later or contact support@newcollab.co');
      } else {
        message.error('Failed to start checkout. Please try again.');
      }
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Determine context-specific copy
  let headline = 'Your matched brands are waiting.';
  let subtext = '3 free pitches used this month. Upgrade to keep pitching.';
  let ctaText = 'Get Pro for $19/month';
  let progressLabel = 'pitches';

  const used = pitchLimits?.used || currentCount || 3;
  const total = pitchLimits?.limit || limit || 3;

  if (feature === 'opportunities') {
    headline = 'Brands are reviewing applications right now.';
    subtext = `${used} free applications used this month. Pro gives you unlimited access.`;
    ctaText = 'Unlock unlimited applications';
    progressLabel = 'applications';

  } else if (feature === 'locked' || feature === 'for_you') {
    headline = 'Unlock your full PR toolkit.';
    subtext = 'Direct access to 500+ brand contacts and application forms. Pitch professionally, land packages.';
    ctaText = 'Get Pro for $19/month';

  } else if (feature === 'kit' || feature === 'kit_views') {
    headline = 'Brands are already looking at you.';
    subtext = 'See exactly who viewed your kit — and follow up before they forget.';
    ctaText = 'Get Pro for $19/month';

  } else if (feature === 'limit_reached') {
    headline = 'Keep the momentum going.';
    subtext = `You've started strong with ${used} pitches. Upgrade to contact all your matched brands.`;
    ctaText = 'Get Pro for $19/month';

  } else if (feature === 'bump_profile') {
    headline = 'Bump your profile to the top.';
    subtext = 'Brands get hundreds of pitches. A follow-up from the Newcollab team puts yours back at the top.';
    ctaText = 'Get Pro for $19/month';
  }

  // Feature list - bump feature always shown with NEW tag
  const features = [
    {
      text: <><strong>Unlimited pitches</strong> to any brand, every month</>,
      highlight: false
    },
    {
      text: <><strong>500+ brand contacts</strong> with direct PR emails and forms</>,
      highlight: false
    },
    {
      text: <><strong>Profile bumps</strong> — we email brands on your behalf <NewTag>new</NewTag></>,
      highlight: feature === 'bump_profile'
    },
    {
      text: <><strong>Apply to brand casting calls</strong> — exclusive opportunities</>,
      highlight: false
    },
    {
      text: <><strong>See which brands viewed your kit</strong> and when</>,
      highlight: false
    },
  ];

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalWrapper
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalScroll>
            <CloseButton onClick={onClose} aria-label="Close">
              <FiX size={16} />
            </CloseButton>

            {/* Icon */}
            <ModalIcon>
              <FiZap size={20} />
            </ModalIcon>

            {/* Headline */}
            <Headline>{headline}</Headline>
            <Subtext>{subtext}</Subtext>

            {/* Progress Bar */}
            <ProgressRow>
              <ProgressLabel>
                <span>{used} / {total}</span> {progressLabel} used this month
              </ProgressLabel>
              <ProgressTrack>
                <ProgressFill $width={Math.min((used / total) * 100, 100)} />
              </ProgressTrack>
            </ProgressRow>

            {/* Proof Strip */}
            <ProofStrip>
              <ProofStat>
                <ProofVal>500+</ProofVal>
                <ProofLbl>Brands</ProofLbl>
              </ProofStat>
              <ProofStat>
                <ProofVal>~$45</ProofVal>
                <ProofLbl>Avg PR value</ProofLbl>
              </ProofStat>
              <ProofStat>
                <ProofVal>∞</ProofVal>
                <ProofLbl>Pitches/month</ProofLbl>
              </ProofStat>
            </ProofStrip>

            {/* Pro Card */}
            <ProCard>
              <ProCardHeader>
                <ProLabel>Pro</ProLabel>
                <ProPrice>$19<span>/month</span></ProPrice>
              </ProCardHeader>
              <ProRoiLine>One gifted package covers your Pro for the year</ProRoiLine>

              {/* Feature List */}
              <FeatureList>
                {features.map((f, i) => (
                  <FeatureItem key={i}>
                    <FeatureCheck $highlight={f.highlight}>
                      <CheckIcon />
                    </FeatureCheck>
                    <FeatureText>{f.text}</FeatureText>
                  </FeatureItem>
                ))}
              </FeatureList>

              {/* ROI Box */}
              <RoiBox>
                One PR package pays for a full year of Pro.<br />
                <strong>Most creators land multiple packages per month.</strong>
              </RoiBox>
            </ProCard>
          </ModalScroll>

          {/* Sticky CTA Area */}
          <CtaArea>
            <CtaButton
              onClick={() => handleUpgrade('pro')}
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Processing...' : ctaText}
            </CtaButton>

            {/* Footer Trust Signals */}
            <ModalFooter>
              <FooterItem>
                <FiLock size={10} /> Cancel anytime
              </FooterItem>
              <FooterDot>·</FooterDot>
              <FooterItem>
                <FiShield size={10} /> Secure
              </FooterItem>
              <FooterDot>·</FooterDot>
              <FooterItem>
                No commitment
              </FooterItem>
            </ModalFooter>
          </CtaArea>
        </ModalWrapper>
      </Overlay>
    </AnimatePresence>
  );
};

// Styled Components
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
  padding: 12px;

  @media (max-width: 480px) {
    padding: 0;
    align-items: flex-end;
  }
`;

const ModalWrapper = styled(motion.div)`
  background: #fff;
  border-radius: 20px;
  max-width: 420px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  @media (max-width: 480px) {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 20px 20px 0 0;
  }
`;

const ModalScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 28px 24px 0;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 480px) {
    padding: 24px 20px 0;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s;
  z-index: 10;
  -webkit-tap-highlight-color: transparent;

  &:hover, &:active {
    background: #e5e7eb;
    color: #374151;
  }
`;

const ModalIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7C3AED, #E11D48);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  color: #fff;

  @media (max-width: 480px) {
    width: 44px;
    height: 44px;
    margin-bottom: 12px;
  }
`;

const Headline = styled.h2`
  font-size: 19px;
  font-weight: 900;
  color: ${tokens.textPrimary};
  letter-spacing: -0.02em;
  text-align: center;
  line-height: 1.25;
  margin: 0 0 6px 0;
  padding: 0 10px;

  @media (max-width: 480px) {
    font-size: 18px;
    padding: 0;
  }
`;

const Subtext = styled.p`
  font-size: 13px;
  color: #6b7280;
  text-align: center;
  line-height: 1.45;
  margin: 0 0 14px 0;

  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 12px;
  }
`;

const ProgressRow = styled.div`
  background: #f9fafb;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 12px;
`;

const ProgressLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 6px;

  span {
    font-weight: 800;
    color: ${tokens.textPrimary};
  }
`;

const ProgressTrack = styled.div`
  height: 5px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 4px;
  width: ${p => p.$width}%;
  background: linear-gradient(90deg, #7C3AED, #E11D48);
  transition: width 0.3s ease;
`;

const ProofStrip = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const ProofStat = styled.div`
  padding: 10px 6px;
  text-align: center;
  border-right: 1px solid #e5e7eb;
  &:last-child { border-right: none; }
`;

const ProofVal = styled.div`
  font-size: 15px;
  font-weight: 900;
  color: ${tokens.textPrimary};
  margin-bottom: 1px;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const ProofLbl = styled.div`
  font-size: 9px;
  font-weight: 600;
  color: #9ca3af;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

const ProCard = styled.div`
  border: 1.5px solid #c4b5fd;
  border-radius: 14px;
  padding: 16px;
  background: linear-gradient(160deg, #f8f7ff 0%, #fdf2f8 100%);
  margin-bottom: 16px;

  @media (max-width: 480px) {
    padding: 14px;
    margin-bottom: 12px;
  }
`;

const ProCardHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
`;

const ProLabel = styled.div`
  font-size: 12px;
  font-weight: 800;
  color: ${tokens.accent};
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const ProPrice = styled.div`
  font-size: 24px;
  font-weight: 900;
  color: ${tokens.textPrimary};
  letter-spacing: -0.03em;

  span {
    font-size: 13px;
    font-weight: 500;
    color: #6b7280;
  }

  @media (max-width: 480px) {
    font-size: 22px;

    span {
      font-size: 12px;
    }
  }
`;

const ProRoiLine = styled.div`
  font-size: 11px;
  color: ${tokens.success};
  font-weight: 600;
  margin-bottom: 12px;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: #374151;
  line-height: 1.4;

  strong {
    font-weight: 700;
    color: ${tokens.textPrimary};
  }

  @media (max-width: 480px) {
    font-size: 11.5px;
    gap: 7px;
  }
`;

const FeatureCheck = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${p => p.$highlight ? tokens.accent : tokens.success};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
`;

const CheckIcon = () => (
  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.6"/>
  </svg>
);

const FeatureText = styled.div`
  flex: 1;
`;

const NewTag = styled.span`
  background: ${tokens.accent};
  color: #fff;
  font-size: 8px;
  font-weight: 800;
  padding: 2px 5px;
  border-radius: 5px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-left: 3px;
  vertical-align: middle;
`;

const RoiBox = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 11px;
  color: #065f46;
  line-height: 1.5;
  text-align: center;

  strong {
    font-weight: 700;
  }

  @media (max-width: 480px) {
    padding: 9px 10px;
    font-size: 10.5px;
  }
`;

const CtaArea = styled.div`
  padding: 12px 24px 20px;
  background: #fff;
  border-top: 1px solid #f3f4f6;

  @media (max-width: 480px) {
    padding: 12px 20px 24px;
    padding-bottom: max(24px, env(safe-area-inset-bottom));
  }
`;

const CtaButton = styled(motion.button)`
  width: 100%;
  padding: 14px 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #7C3AED, #E11D48);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: -0.01em;
  transition: opacity 0.15s, transform 0.1s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:hover:not(:disabled) {
    opacity: 0.92;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 15px 16px;
    font-size: 14px;
    border-radius: 11px;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 10px;
`;

const FooterItem = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: #9ca3af;
`;

const FooterDot = styled.span`
  color: #d1d5db;
  font-size: 10px;
`;

export default UpgradeModal;
