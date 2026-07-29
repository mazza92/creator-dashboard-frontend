import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiLock, FiShield, FiClock } from 'react-icons/fi';
import api from '../config/api';
import { message } from 'antd';
import { trackProBeginCheckout } from '../utils/subscriptionAnalytics';

const UpgradeModal = ({ isOpen, onClose, currentCount = 3, limit = 3, feature, pitchLimits, resetAt }) => {
  const [loading, setLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState('monthly'); // Default to monthly

  const handleUpgrade = async (tier) => {
    try {
      setLoading(true);
      trackProBeginCheckout({ tier, source: feature || 'upgrade_modal', interval: billingInterval });
      const response = await api.post(
        '/api/subscription/create-checkout',
        { tier, interval: billingInterval }
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

  // Get usage stats
  const used = pitchLimits?.used || currentCount || 3;
  const total = pitchLimits?.limit || limit || 3;

  // Feature list with emoji icons
  const features = [
    {
      emoji: '🎯',
      bg: '#fef2f4',
      text: <><strong>Your AI talent manager</strong> optimizes your profile and builds a custom strategy to attract brands</>,
    },
    {
      emoji: '💵',
      bg: '#dcfce7',
      text: <><strong>Apply to paid UGC gigs</strong> from $150 (Evoto, Glossier, 20+ weekly)</>,
    },
    {
      emoji: '🔍',
      bg: '#dbeafe',
      text: <><strong>Search 2,000+ brands</strong> with filters like "works with micro creators", verified emails and forms</>,
    },
    {
      emoji: '⭐',
      bg: '#fef3c7',
      text: <><strong>Brand matches for your niche</strong> with fit and reply scores</>,
    },
    {
      emoji: '🔁',
      bg: '#ede9fe',
      text: <><strong>Auto follow-ups sent for you</strong> (67% reply by the second follow-up)</>,
    },
    {
      emoji: '👀',
      bg: '#fce7f3',
      text: <><strong>See which brands opened your kit</strong> so you know who to chase</>,
    },
    {
      emoji: '📈',
      bg: '#ccfbf1',
      text: <><strong>Grow your followers</strong> with unlimited creator boosts in the Pool</>,
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
          initial={{ y: 20, opacity: 0, scale: 0.94 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
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
              <BoltIcon />
            </ModalIcon>

            {/* Headline */}
            <Headline>
              {used} brands checked.<br />Ready to <PinkSpan>get PR</PinkSpan> from 40 more?
            </Headline>
            <Subtext>
              Your AI manager finds brands, drafts pitches, and chases replies until you land PR.
            </Subtext>

            {/* Progress Bar */}
            <ProgressSection>
              <ProgressHeader>
                <span>Free unlocks this month</span>
                <strong>{used} / {total} used</strong>
              </ProgressHeader>
              <ProgressTrack>
                <ProgressFill $width={Math.min((used / total) * 100, 100)} />
              </ProgressTrack>
            </ProgressSection>

            {/* Stat Chips */}
            <StatsGrid>
              <StatChip>
                <StatValue>2,000+</StatValue>
                <StatLabel>Brands</StatLabel>
              </StatChip>
              <StatChip>
                <StatValue>$150-2K</StatValue>
                <StatLabel>PR value</StatLabel>
              </StatChip>
              <StatChip>
                <StatValue>55%</StatValue>
                <StatLabel>Reply rate</StatLabel>
              </StatChip>
            </StatsGrid>

            {/* Billing Toggle */}
            <BillingToggle>
              <BillingOption
                $active={billingInterval === 'monthly'}
                onClick={() => setBillingInterval('monthly')}
              >
                Monthly
              </BillingOption>
              <BillingOption
                $active={billingInterval === 'yearly'}
                onClick={() => setBillingInterval('yearly')}
              >
                Yearly
                <SaveBadge>SAVE 33%</SaveBadge>
              </BillingOption>
            </BillingToggle>

            {/* Price Card */}
            <PriceCard>
              <ProBadge>Pro</ProBadge>
              <PriceRow>
                <PriceAmount id="price-amount">
                  {billingInterval === 'yearly' ? '$152' : '$19'}
                </PriceAmount>
                <PricePer>
                  / {billingInterval === 'yearly' ? 'year' : 'month'}
                </PricePer>
              </PriceRow>
              <PriceSubline>
                {billingInterval === 'yearly' ? (
                  <><s style={{ opacity: 0.65 }}>$228</s> <GreenText>Save $76 · 33% off</GreenText></>
                ) : (
                  'Billed monthly · cancel or pause anytime'
                )}
              </PriceSubline>
            </PriceCard>

            {/* Feature List */}
            <FeatureList>
              {features.map((f, i) => (
                <FeatureItem key={i}>
                  <FeatureIcon style={{ background: f.bg }}>{f.emoji}</FeatureIcon>
                  <FeatureText>{f.text}</FeatureText>
                </FeatureItem>
              ))}
            </FeatureList>

            {/* Social Proof */}
            <ProofBox>
              <ProofIcon>✓</ProofIcon>
              <ProofText>
                <strong>The toolkit top creators use to get paid.</strong> Real contacts, custom strategy, paid gigs, all working the moment you upgrade.
              </ProofText>
            </ProofBox>
          </ModalScroll>

          {/* Sticky CTA Area */}
          <CtaArea>
            <CtaButton
              onClick={() => handleUpgrade('pro')}
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading
                ? 'Processing...'
                : billingInterval === 'yearly'
                  ? 'Start getting PR · $152/year (save 33%)'
                  : 'Start getting PR · $19/month'}
            </CtaButton>

            {/* Footer Trust Signals */}
            <TrustRow>
              <TrustItem>
                <FiLock size={12} />
                Cancel anytime
              </TrustItem>
              <TrustItem>
                <FiShield size={12} />
                Secure checkout
              </TrustItem>
              <TrustItem>
                <FiClock size={12} />
                Pause anytime
              </TrustItem>
            </TrustRow>
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
  background: rgba(15, 17, 20, 0.72);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;

  @media (max-width: 480px) {
    padding: 0;
    align-items: flex-end;
  }
`;

const ModalWrapper = styled(motion.div)`
  background: #fff;
  border-radius: 20px;
  max-width: 460px;
  width: 100%;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 17, 20, 0.24), 0 8px 20px rgba(15, 17, 20, 0.12);

  @media (max-width: 480px) {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 20px 20px 0 0;
    margin-top: auto;
  }
`;

const ModalScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 36px 28px 20px;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }

  @media (max-width: 480px) {
    padding: 32px 22px 18px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f7f7f8;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b6f78;
  transition: background 0.15s;
  z-index: 10;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: #e5e7eb;
  }
`;

const ModalIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed 0%, #e8395f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
  color: #fff;
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.28);
`;

const Headline = styled.h1`
  font-size: 22px;
  font-weight: 800;
  color: #15161a;
  letter-spacing: -0.02em;
  text-align: center;
  line-height: 1.25;
  margin: 0 0 6px 0;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const PinkSpan = styled.span`
  color: #e8395f;
`;

const BoltIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L4.5 12.5H11l-1 8.5 8.5-11H12l1-8z"/>
  </svg>
);

const Subtext = styled.p`
  font-size: 14px;
  color: #6b6f78;
  text-align: center;
  line-height: 1.5;
  margin: 0 0 20px 0;
`;

const ProgressSection = styled.div`
  margin-bottom: 20px;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6b6f78;
  margin-bottom: 6px;
  font-weight: 500;

  strong {
    color: #15161a;
    font-weight: 700;
  }
`;

const ProgressTrack = styled.div`
  height: 8px;
  background: #f1f2f4;
  border-radius: 100px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 100px;
  width: ${p => p.$width}%;
  background: linear-gradient(90deg, #e8395f 0%, #f472b6 100%);
  position: relative;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%);
    animation: shimmer 2.4s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 22px;
`;

const StatChip = styled.div`
  background: #f7f7f8;
  border-radius: 12px;
  padding: 10px 8px;
  text-align: center;
  border: 1px solid #f1f2f4;
`;

const StatValue = styled.div`
  font-size: 15px;
  font-weight: 800;
  color: #15161a;
  letter-spacing: -0.02em;
  line-height: 1.1;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: #6b6f78;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 4px;
  font-weight: 600;

  @media (max-width: 480px) {
    font-size: 9px;
  }
`;

const BillingToggle = styled.div`
  display: flex;
  background: #f7f7f8;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 16px;
`;

const BillingOption = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 8px;
  border: none;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
  font-family: inherit;
  position: relative;
  z-index: 2;
  background: ${props => props.$active ? '#fff' : 'transparent'};
  color: ${props => props.$active ? '#15161a' : '#6b6f78'};
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'};

  &:hover {
    color: #15161a;
  }
`;

const SaveBadge = styled.span`
  background: #e8f7ed;
  color: #0f9d58;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 6px;
  letter-spacing: 0.02em;
`;

const PriceCard = styled.div`
  border: 1.5px solid #e8395f;
  border-radius: 16px;
  padding: 20px;
  background: linear-gradient(180deg, #fef2f4 0%, #fff 60%);
  position: relative;
  margin-bottom: 20px;
`;

const ProBadge = styled.div`
  position: absolute;
  top: -11px;
  left: 50%;
  transform: translateX(-50%);
  background: #15161a;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 100px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const PriceAmount = styled.span`
  font-size: 38px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #15161a;
  line-height: 1;
`;

const PricePer = styled.span`
  font-size: 15px;
  color: #6b6f78;
  font-weight: 500;
`;

const PriceSubline = styled.div`
  text-align: center;
  font-size: 13px;
  color: #6b6f78;
`;

const GreenText = styled.span`
  color: #0f9d58;
  font-weight: 700;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
`;

const FeatureItem = styled.li`
  display: flex;
  gap: 12px;
  padding: 8px 0;
  font-size: 15px;
  color: #2b2d33;
  line-height: 1.4;
  align-items: center;

  strong {
    color: #15161a;
    font-weight: 700;
  }
`;

const FeatureIcon = styled.span`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
  line-height: 1;
`;

const FeatureText = styled.span`
  flex: 1;
`;

const ProofBox = styled.div`
  background: #e8f7ed;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 13px;
  color: #1a5638;
  line-height: 1.5;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 18px;

  strong {
    color: #0d3f26;
  }
`;

const ProofIcon = styled.div`
  width: 24px;
  height: 24px;
  background: #0f9d58;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  font-size: 14px;
`;

const ProofText = styled.div``;

const CtaArea = styled.div`
  padding: 14px 28px 24px;
  background: #fff;

  @media (max-width: 480px) {
    padding: 14px 22px 24px;
    padding-bottom: max(24px, env(safe-area-inset-bottom));
  }
`;

const CtaButton = styled(motion.button)`
  display: block;
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #e8395f 0%, #c92549 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: -0.01em;
  font-family: inherit;
  box-shadow: 0 8px 20px rgba(232, 57, 95, 0.28);
  transition: transform 0.12s, box-shadow 0.12s;
  -webkit-tap-highlight-color: transparent;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 26px rgba(232, 57, 95, 0.34);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TrustRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 18px;
  padding-top: 14px;
  flex-wrap: wrap;
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #6b6f78;

  svg {
    width: 12px;
    height: 12px;
  }
`;

export default UpgradeModal;
