import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import api from '../config/api';
import { UserContext } from '../contexts/UserContext';
import UpgradeModal from './UpgradeModal';
import { message } from 'antd';

export default function Waitlist() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const { handleLogout } = useContext(UserContext);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await api.get('/api/user/approval-status');
        setStatus(data);

        // Track waitlist view on first load only
        if (!hasTrackedView) {
          await api.post('/api/user/track-waitlist-view').catch(err => {
            console.error('Failed to track waitlist view:', err);
          });
          setHasTrackedView(true);
        }

        // If approved, redirect to dashboard
        if (data.status === 'approved' || data.status === 'pro_approved') {
          window.location.href = '/creator/dashboard/for-you?approved=true';
        }
      } catch (err) {
        console.error('Failed to fetch approval status:', err);
        message.error('Failed to load waitlist status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Poll every 30 seconds to check for approval
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run once on mount

  if (loading) {
    return (
      <PageWrapper>
        <LoadingCard>
          <Spinner />
          <LoadingText>Loading waitlist status...</LoadingText>
        </LoadingCard>
      </PageWrapper>
    );
  }

  if (!status) {
    return (
      <PageWrapper>
        <Card>
          <ErrorText>Unable to load waitlist status. Please try refreshing the page.</ErrorText>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LogoCircle>
          <LogoEmoji>🎁</LogoEmoji>
        </LogoCircle>

        <Headline>
          {status.status === 'rejected' ? "You're not approved yet" : "You're on the waitlist!"}
        </Headline>
        <Subline>
          {status.status === 'rejected'
            ? (status.rejection_reason || 'We could not approve this profile right now. You can still skip the line with Pro, or sign out and try again later.')
            : (
              <>
                We review every profile by hand and email you the moment you're approved.
                Nothing to do until then.
              </>
            )}
        </Subline>

        <QueueCard>
          <QueueNumber
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            {status.queue_position ? `#${status.queue_position}` : '#'}
          </QueueNumber>
          <QueueLabel>your place in line</QueueLabel>
          {status.estimated_wait_days > 0 && (
            <EstimatedWait>
              We review every profile to ensure quality matches.<br />
              Estimated wait: <strong>{status.estimated_wait_days} day{status.estimated_wait_days !== 1 ? 's' : ''}</strong>
            </EstimatedWait>
          )}
        </QueueCard>

        {status.can_skip_with_pro && (
          <ProSection>
            <ProBadge>
              <ProIcon>⚡</ProIcon>
              Skip the line with Pro
            </ProBadge>
            <ProHeadline>Pro members get in instantly</ProHeadline>
            <ProSubline>
              Plus everything Pro unlocks
            </ProSubline>

            <ProBenefits>
              <Benefit>
                <BenefitIcon>✓</BenefitIcon>
                <BenefitText><strong>Instant approval</strong> — skip the waitlist</BenefitText>
              </Benefit>
              <Benefit>
                <BenefitIcon>✓</BenefitIcon>
                <BenefitText><strong>Unlimited brand PR credits</strong> this month</BenefitText>
              </Benefit>
              <Benefit>
                <BenefitIcon>✓</BenefitIcon>
                <BenefitText><strong>No pitch required</strong> — we vet, the brand picks</BenefitText>
              </Benefit>
              <Benefit>
                <BenefitIcon>✓</BenefitIcon>
                <BenefitText><strong>2,000+ gifting brands</strong> with micro-friendly filters</BenefitText>
              </Benefit>
              <Benefit>
                <BenefitIcon>✓</BenefitIcon>
                <BenefitText><strong>Automatic follow-ups</strong> so requests stay warm</BenefitText>
              </Benefit>
            </ProBenefits>

            <ProButton
              onClick={() => setShowUpgrade(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get instant access · $19/month
            </ProButton>

            <ProFooter>Cancel anytime · No long-term commitment</ProFooter>
          </ProSection>
        )}

        <Divider />

        <WhileWaitingSection>
          <SectionTitle>While you wait</SectionTitle>
          <TipsList>
            <Tip>
              <TipIcon>📧</TipIcon>
              <TipText>We'll email the moment you're approved. Nothing to do until then.</TipText>
            </Tip>
            <Tip>
              <TipIcon>📱</TipIcon>
              <TipText>Follow <SocialLink href="https://www.tiktok.com/@newcollabco" target="_blank" rel="noopener">@newcollabco</SocialLink> for creator tips</TipText>
            </Tip>
            <Tip>
              <TipIcon>💡</TipIcon>
              <TipText>Keep posting — brands love active, engaged creators</TipText>
            </Tip>
          </TipsList>
        </WhileWaitingSection>

        <Footer>
          Just subscribed? <RefreshLink onClick={() => window.location.reload()}>Give it a few seconds and refresh.</RefreshLink>
        </Footer>

        <SignOutButton onClick={handleLogout}>
          Sign out
        </SignOutButton>
      </Card>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="waitlist_skip"
      />
    </PageWrapper>
  );
}

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const Card = styled(motion.div)`
  background: #fff;
  border-radius: 20px;
  max-width: 560px;
  width: 100%;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(15, 17, 20, 0.12), 0 8px 24px rgba(15, 17, 20, 0.08);
  text-align: center;

  @media (max-width: 480px) {
    padding: 36px 24px;
    border-radius: 16px;
  }
`;

const LoadingCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 40px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #ec4899;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #6b7280;
  font-size: 15px;
  margin: 0;
`;

const ErrorText = styled.p`
  color: #dc2626;
  font-size: 15px;
  line-height: 1.6;
`;

const LogoCircle = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 8px 20px rgba(236, 72, 153, 0.25);
`;

const LogoEmoji = styled.span`
  font-size: 36px;
`;

const Headline = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px;
  line-height: 1.2;

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const Subline = styled.p`
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 32px;
  max-width: 440px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const QueueCard = styled.div`
  background: linear-gradient(135deg, #fef3f4 0%, #fce7f3 100%);
  border: 2px solid #fecdd3;
  border-radius: 16px;
  padding: 32px 24px;
  margin-bottom: 32px;
`;

const QueueNumber = styled(motion.div)`
  font-size: 64px;
  font-weight: 800;
  color: #ec4899;
  line-height: 1;
  margin-bottom: 8px;
  letter-spacing: -0.02em;

  @media (max-width: 480px) {
    font-size: 56px;
  }
`;

const QueueLabel = styled.p`
  font-size: 14px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  margin: 0 0 12px;
`;

const EstimatedWait = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;

  strong {
    color: #111827;
    font-weight: 600;
  }
`;

const ProSection = styled.div`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #fde047;
  border-radius: 16px;
  padding: 28px 24px;
  margin-bottom: 32px;
`;

const ProBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  color: #d97706;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 6px 14px;
  border-radius: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.15);
`;

const ProIcon = styled.span`
  font-size: 14px;
`;

const ProHeadline = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px;
`;

const ProSubline = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px;
`;

const ProBenefits = styled.div`
  text-align: left;
  margin-bottom: 24px;
`;

const Benefit = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const BenefitIcon = styled.div`
  color: #059669;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
`;

const BenefitText = styled.p`
  font-size: 14px;
  color: #374151;
  margin: 0;
  line-height: 1.5;

  strong {
    font-weight: 600;
    color: #111827;
  }
`;

const ProButton = styled(motion.button)`
  width: 100%;
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(236, 72, 153, 0.3);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 6px 20px rgba(236, 72, 153, 0.4);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ProFooter = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 12px 0 0;
`;

const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 32px 0;
`;

const WhileWaitingSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 20px;
`;

const TipsList = styled.div`
  text-align: left;
`;

const Tip = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TipIcon = styled.div`
  font-size: 20px;
  flex-shrink: 0;
`;

const TipText = styled.p`
  font-size: 14px;
  color: #374151;
  margin: 3px 0 0;
  line-height: 1.6;
`;

const SocialLink = styled.a`
  color: #ec4899;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const Footer = styled.p`
  font-size: 13px;
  color: #9ca3af;
  margin: 0 0 20px;
  line-height: 1.6;
`;

const RefreshLink = styled.button`
  background: none;
  border: none;
  color: #ec4899;
  font-size: 13px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #db2777;
  }
`;

const SignOutButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #6b7280;
  }
`;
