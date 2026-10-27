import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiLock, FiCheck } from 'react-icons/fi';
import api from '../config/api';
import { message } from 'antd';
import { trackProBeginCheckout } from '../utils/subscriptionAnalytics';
import { dismissUpgradeDeeplink, getEmailCampaign, isWinbackUpgradePending } from '../utils/upgradeDeeplink';
import { PRO_OFFER, PRO_COMPARE } from '../config/proOffer';
import { useTrialDays } from '../utils/trialOffer';

function sourceFromPath(pathname) {
  const path = String(pathname || '');
  if (path.includes('/for-you') || path.includes('/polly')) return 'polly';
  if (path.includes('/pr-brands') || path.includes('/directory')) return 'directory';
  if (path.includes('/timeline')) return 'timeline';
  if (path.includes('/my-kit')) return 'my_kit';
  return 'other';
}

function matchedLine({ names = [], count = 0 }) {
  if (!names.length) return null;
  const more = Math.max(count, names.length) - names.length;
  const shown = names.length > 1
    ? <>{names.slice(0, -1).map((n, i) => <React.Fragment key={n}>{i > 0 && ', '}<strong>{n}</strong></React.Fragment>)}{more > 0 ? ', ' : ' and '}<strong>{names[names.length - 1]}</strong></>
    : <strong>{names[0]}</strong>;
  return (
    <>
      {shown}
      {more > 0 ? ` and ${more} more` : ''} {names.length > 1 || more > 0 ? 'are' : 'is'} matched to you and waiting.
    </>
  );
}

const CompareCell = ({ value, pro }) => {
  if (value === true) return <CheckDot $pro={pro}><FiCheck size={13} strokeWidth={3} /></CheckDot>;
  if (value === false) return <FiLock size={17} color="#4b5058" strokeWidth={2.4} />;
  return <CellText $pro={pro}>{value}</CellText>;
};

const UpgradeModal = ({ isOpen, onClose, currentCount = 0, limit = 3, feature, pitchLimits, resetAt, unlockRemaining, source }) => {
  const [loading, setLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState('monthly');

  const remainingKnown = unlockRemaining != null && Number.isFinite(Number(unlockRemaining));
  const rawUsed = remainingKnown ? currentCount : (pitchLimits?.used ?? currentCount);
  const used = Number.isFinite(Number(rawUsed)) ? Number(rawUsed) : 0;
  const total = Number(limit || 3) || 3;
  const atCap = remainingKnown ? Number(unlockRemaining) <= 0 : used >= total;
  const isWinback = feature === 'winback' || isWinbackUpgradePending();
  const trialDays = useTrialDays(isOpen && !isWinback);
  const hasTrial = trialDays > 0;
  const [waiting, setWaiting] = useState(null);

  useEffect(() => {
    if (!isOpen || isWinback) return undefined;
    let alive = true;
    api.get('/api/polly/paywall-brands')
      .then(({ data }) => { if (alive) setWaiting(data || null); })
      .catch(() => {});
    return () => { alive = false; };
  }, [isOpen, isWinback]);
  const matched = waiting ? matchedLine(waiting) : null;

  const showYearly = !isWinback;
  const interval = showYearly ? billingInterval : 'monthly';

  const handleUpgrade = async (tier) => {
    try {
      setLoading(true);
      trackProBeginCheckout({
        tier,
        source: isWinback ? 'winback' : (feature || 'upgrade_modal'),
        interval,
      });
      const payload = {
        tier,
        interval,
        source: isWinback ? 'winback' : (source || sourceFromPath(window.location.pathname)),
      };
      if (isWinback) payload.offer = 'winback';
      const emailCampaign = getEmailCampaign();
      if (emailCampaign) payload.email_campaign = emailCampaign;
      const response = await api.post(
        '/api/subscription/create-checkout',
        payload
      );

      if (isWinback) dismissUpgradeDeeplink();
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

  const eyebrow = isWinback
    ? null
    : feature === 'last_unlock'
      ? 'Last free credit'
      : atCap
        ? `${total} of ${total} free credits used`
        : null;

  const headline = isWinback ? (
    <>Daily pitching<br />is back for <PinkSpan>$12/mo</PinkSpan></>
  ) : (
    <>New brands pitched<br /><PinkSpan>for you, every day</PinkSpan></>
  );

  const subline = isWinback
    ? 'For your next 3 invoices, then $19. Cancel anytime.'
    : 'Every weekday Polly picks 3 brands that fit you, pitches them from your Gmail and follows up, so you can just create.';

  const ctaLabel = loading
    ? 'Processing...'
    : isWinback
      ? 'Restart Pro at $12/mo'
      : hasTrial
        ? PRO_OFFER.ctaTrial
        : interval === 'yearly'
          ? 'Hire Polly · $152/yr'
          : 'Hire Polly · $19/mo';

  const modal = (
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

            <ModalIcon>
              <BoltIcon />
            </ModalIcon>

            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <Headline>{headline}</Headline>
            <Subtext>{subline}</Subtext>

            {matched && <MatchedNote>{matched}</MatchedNote>}

            <Compare>
              <ProColumn aria-hidden="true" />
              <CompareRow $head>
                <HeadLabel>What you get</HeadLabel>
                <HeadLabel $center>Free</HeadLabel>
                <ProHead><span>Pro</span></ProHead>
              </CompareRow>
              {PRO_COMPARE.map((row) => (
                <CompareRow key={row.label}>
                  <RowLabel>{row.label}</RowLabel>
                  <Cell><CompareCell value={row.free} /></Cell>
                  <Cell><CompareCell value={row.pro} pro /></Cell>
                </CompareRow>
              ))}
            </Compare>

            <Plans>
              {isWinback ? (
                <PlanOption type="button" $active>
                  <div>
                    <PlanName>Pro, monthly</PlanName>
                    <PlanNote><s>$19</s> 3 invoices at $12, then $19</PlanNote>
                  </div>
                  <PlanPrice>$12/mo</PlanPrice>
                </PlanOption>
              ) : (
                <>
                  <PlanOption
                    type="button"
                    $active={interval === 'monthly'}
                    onClick={() => setBillingInterval('monthly')}
                  >
                    <div>
                      <PlanName>Monthly</PlanName>
                      <PlanNote>
                        {hasTrial ? <GreenText>{PRO_OFFER.trialSubline}</GreenText> : 'Cancel or pause anytime'}
                      </PlanNote>
                    </div>
                    <PlanPrice>$19/mo</PlanPrice>
                  </PlanOption>
                  {showYearly && (
                    <PlanOption
                      type="button"
                      $active={interval === 'yearly'}
                      onClick={() => setBillingInterval('yearly')}
                    >
                      <PlanTag>Save 33%</PlanTag>
                      <div>
                        <PlanName>Yearly</PlanName>
                        <PlanNote>
                          {hasTrial ? <GreenText>{PRO_OFFER.trialSublineYearly}</GreenText> : 'About $12.67 a month'}
                        </PlanNote>
                      </div>
                      <PlanPrice>$152/yr</PlanPrice>
                    </PlanOption>
                  )}
                </>
              )}
            </Plans>
          </ModalScroll>

          <CtaArea>
            <CtaButton
              onClick={() => handleUpgrade('pro')}
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {ctaLabel}
            </CtaButton>
            <TrustLine>Cancel or pause anytime from Settings</TrustLine>
          </CtaArea>
        </ModalWrapper>
      </Overlay>
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
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
  max-width: 440px;
  width: 100%;
  max-height: calc(100vh - 40px);
  max-height: calc(100dvh - 40px);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 17, 20, 0.24), 0 8px 20px rgba(15, 17, 20, 0.12);

  @media (max-width: 480px) {
    max-width: 100%;
    max-height: 100vh;
    max-height: 100dvh;
    border-radius: 20px 20px 0 0;
    margin-top: auto;
  }
`;

const ModalScroll = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 30px 24px 8px;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }

  @media (max-width: 480px) {
    padding: 28px 20px 8px;
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
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed 0%, #e8395f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  color: #fff;
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.28);
`;

const Eyebrow = styled.div`
  width: fit-content;
  margin: 0 auto 10px;
  padding: 4px 10px;
  border-radius: 100px;
  background: #f3f4f6;
  color: #4b5058;
  font-size: 12px;
  font-weight: 600;
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
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L4.5 12.5H11l-1 8.5 8.5-11H12l1-8z"/>
  </svg>
);

const Subtext = styled.p`
  font-size: 14px;
  color: #4b5058;
  text-align: center;
  line-height: 1.45;
  margin: 0 0 16px 0;
`;

const MatchedNote = styled.p`
  margin: 0 0 16px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  line-height: 1.45;
  color: #2b2d33;
  text-align: center;

  strong {
    color: #15161a;
    font-weight: 700;
  }
`;

const COLS = '1fr 72px 92px';

const Compare = styled.div`
  position: relative;
  margin-bottom: 18px;
`;

const ProColumn = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 92px;
  border: 1.5px solid #e8395f;
  border-radius: 14px;
  background: linear-gradient(180deg, #fef2f4 0%, #fff 100%);
`;

const CompareRow = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: ${COLS};
  align-items: center;
  min-height: ${(p) => (p.$head ? '40px' : '38px')};
`;

const HeadLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #15161a;
  text-align: ${(p) => (p.$center ? 'center' : 'left')};
`;

const ProHead = styled.div`
  display: flex;
  justify-content: center;

  span {
    background: #e8395f;
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 100px;
  }
`;

const RowLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #2b2d33;
  line-height: 1.3;
  padding-right: 8px;
`;

const Cell = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CheckDot = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: ${(p) => (p.$pro ? '#e8395f' : '#15161a')};
`;

const CellText = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${(p) => (p.$pro ? '#e8395f' : '#2b2d33')};
  line-height: 1.2;
  text-align: center;
  padding: 2px 4px;
`;

const Plans = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
`;

const PlanOption = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1.5px solid ${(p) => (p.$active ? '#e8395f' : '#e5e7eb')};
  background: ${(p) => (p.$active ? '#fef2f4' : '#fff')};
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s, background 0.15s;
  -webkit-tap-highlight-color: transparent;
`;

const PlanTag = styled.span`
  position: absolute;
  top: -10px;
  right: 14px;
  background: #0f9d58;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 6px;
`;

const PlanName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #15161a;
`;

const PlanNote = styled.div`
  font-size: 12px;
  color: #4b5058;
  margin-top: 2px;

  s {
    opacity: 0.65;
    margin-right: 4px;
  }
`;

const PlanPrice = styled.div`
  font-size: 17px;
  font-weight: 800;
  color: #15161a;
  white-space: nowrap;
`;

const GreenText = styled.span`
  color: #0f9d58;
  font-weight: 700;
`;

const CtaArea = styled.div`
  flex-shrink: 0;
  padding: 12px 24px 18px;
  background: #fff;
  border-top: 1px solid #f1f2f4;

  @media (max-width: 480px) {
    padding: 12px 20px calc(14px + env(safe-area-inset-bottom));
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

const TrustLine = styled.div`
  text-align: center;
  font-size: 12px;
  color: #4b5058;
  padding-top: 10px;
`;

export default UpgradeModal;
