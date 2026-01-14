import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiZap, FiCreditCard, FiCalendar, FiCheck, FiExternalLink, FiSettings } from 'react-icons/fi';
import axios from 'axios';
import { message } from 'antd';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AccountSettings = () => {
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/subscription/status`, {
        withCredentials: true
      });
      setSubscriptionInfo(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      const response = await axios.post(
        `${API_BASE}/api/subscription/portal`,
        {},
        { withCredentials: true }
      );

      // Redirect to Stripe Customer Portal
      window.location.href = response.data.portal_url;
    } catch (error) {
      console.error('Error opening portal:', error);
      message.error('Failed to open billing portal. Please try again.');
      setPortalLoading(false);
    }
  };

  const getPlanColor = (tier) => {
    switch(tier) {
      case 'elite': return 'linear-gradient(135deg, #3B82F6, #EC4899)';
      case 'pro': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getPlanName = (tier) => {
    switch(tier) {
      case 'elite': return 'Elite';
      case 'pro': return 'Pro';
      default: return 'Free';
    }
  };

  const getPlanPrice = (tier) => {
    switch(tier) {
      case 'elite': return '$49';
      case 'pro': return '$12';
      default: return '$0';
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingText>Loading subscription details...</LoadingText>
      </Container>
    );
  }

  const tier = subscriptionInfo?.tier || 'free';
  const status = subscriptionInfo?.status || 'inactive';

  return (
    <Container>
      <Header>
        <HeaderIcon>
          <FiSettings size={28} />
        </HeaderIcon>
        <HeaderTitle>Account Settings</HeaderTitle>
        <HeaderSubtitle>Manage your subscription and billing</HeaderSubtitle>
      </Header>

      <Section>
        <SectionTitle>Current Plan</SectionTitle>

        <PlanCard
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PlanHeader>
            <PlanBadge tier={tier}>
              <FiZap />
              <span>{getPlanName(tier)}</span>
            </PlanBadge>
            <PlanPrice>
              {getPlanPrice(tier)}
              <PlanPeriod>/month</PlanPeriod>
            </PlanPrice>
          </PlanHeader>

          <PlanFeatures>
            {tier === 'free' && (
              <>
                <Feature>
                  <FiCheck /> Unlimited brand saves
                </Feature>
                <Feature>
                  <FiCheck /> 5 application forms per day
                </Feature>
                <Feature>
                  <FiCheck /> Full brand directory access
                </Feature>
              </>
            )}

            {tier === 'pro' && (
              <>
                <Feature>
                  <FiCheck /> Unlimited brand saves
                </Feature>
                <Feature>
                  <FiCheck /> 20 brand contacts/month
                </Feature>
                <Feature>
                  <FiCheck /> Verified brand emails
                </Feature>
                <Feature>
                  <FiCheck /> Custom pitch templates
                </Feature>
                <Feature>
                  <FiCheck /> Basic analytics
                </Feature>
              </>
            )}

            {tier === 'elite' && (
              <>
                <Feature>
                  <FiCheck /> Everything in Pro
                </Feature>
                <Feature>
                  <FiCheck /> Unlimited brand contacts
                </Feature>
                <Feature>
                  <FiCheck /> AI pitch generator
                </Feature>
                <Feature>
                  <FiCheck /> Guaranteed PR packages
                </Feature>
                <Feature>
                  <FiCheck /> Auto-follow up system
                </Feature>
              </>
            )}
          </PlanFeatures>

          {tier !== 'free' && (
            <>
              <Divider />

              <SubscriptionDetails>
                <DetailRow>
                  <DetailLabel>
                    <FiCalendar />
                    Started
                  </DetailLabel>
                  <DetailValue>
                    {subscriptionInfo?.started_at
                      ? new Date(subscriptionInfo.started_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'N/A'
                    }
                  </DetailValue>
                </DetailRow>

                <DetailRow>
                  <DetailLabel>
                    <FiCreditCard />
                    Status
                  </DetailLabel>
                  <StatusBadge status={status}>
                    {status === 'active' ? 'Active' : status}
                  </StatusBadge>
                </DetailRow>
              </SubscriptionDetails>

              <Divider />

              <ManageButton
                onClick={handleManageSubscription}
                disabled={portalLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {portalLoading ? 'Opening...' : (
                  <>
                    <FiExternalLink />
                    Manage Billing & Subscription
                  </>
                )}
              </ManageButton>

              <HelpText>
                Update payment method, view invoices, or cancel subscription
              </HelpText>
            </>
          )}

          {tier === 'free' && (
            <>
              <Divider />
              <UpgradeButton
                onClick={() => window.location.href = '/creator/dashboard/pr-brands'}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiZap />
                Upgrade Plan
              </UpgradeButton>
              <HelpText>
                Get 20 brand contacts/month + pitch templates with Pro
              </HelpText>
            </>
          )}
        </PlanCard>
      </Section>

      <Section>
        <SectionTitle>Usage {tier === 'free' ? 'Today' : 'This Month'}</SectionTitle>
        <UsageGrid>
          <UsageCard>
            <UsageLabel>Brands Saved</UsageLabel>
            <UsageValue>
              {subscriptionInfo?.brands_saved_count || 0}
            </UsageValue>
            <UsageUnlimited>Unlimited</UsageUnlimited>
          </UsageCard>

          <UsageCard>
            <UsageLabel>
              {tier === 'free' ? 'Application Forms Unlocked' : 'Brand Contacts Revealed'}
            </UsageLabel>
            <UsageValue>
              {tier === 'free'
                ? (subscriptionInfo?.daily_unlocks_used || 0)
                : (subscriptionInfo?.pitches_sent_this_month || 0)
              }
              {tier === 'free' && <UsageLimit> / 5</UsageLimit>}
              {tier === 'pro' && <UsageLimit> / 20</UsageLimit>}
            </UsageValue>
            {tier === 'elite' && <UsageUnlimited>Unlimited</UsageUnlimited>}
            {tier === 'free' && <UsageNote>Resets daily at midnight</UsageNote>}
          </UsageCard>
        </UsageGrid>
      </Section>
    </Container>
  );
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const HeaderIcon = styled.div`
  color: #3B82F6;
  margin-bottom: 16px;
`;

const HeaderTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 8px 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const HeaderSubtitle = styled.p`
  font-size: 16px;
  color: #6B7280;
  margin: 0;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px 0;
`;

const PlanCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
`;

const PlanHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PlanBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;

  ${props => {
    if (props.tier === 'elite') {
      return `
        background: linear-gradient(135deg, #3B82F6, #EC4899);
        color: white;
      `;
    } else if (props.tier === 'pro') {
      return `
        background: #3B82F6;
        color: white;
      `;
    } else {
      return `
        background: #F3F4F6;
        color: #6B7280;
      `;
    }
  }}

  svg {
    width: 16px;
    height: 16px;
  }
`;

const PlanPrice = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: #111827;
`;

const PlanPeriod = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #6B7280;
`;

const PlanFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: #374151;

  svg {
    color: #10B981;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #E5E7EB;
  margin: 24px 0;
`;

const SubscriptionDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DetailLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6B7280;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const DetailValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;

const StatusBadge = styled.div`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;

  ${props => props.status === 'active'
    ? 'background: #D1FAE5; color: #065F46;'
    : 'background: #FEE2E2; color: #991B1B;'
  }
`;

const ManageButton = styled(motion.button)`
  width: 100%;
  padding: 14px 20px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #2563EB;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const UpgradeButton = styled(motion.button)`
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, #3B82F6, #EC4899);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const HelpText = styled.p`
  text-align: center;
  font-size: 13px;
  color: #9CA3AF;
  margin: 12px 0 0 0;
`;

const UsageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const UsageCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
`;

const UsageLabel = styled.div`
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 8px;
`;

const UsageValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #111827;
`;

const UsageLimit = styled.span`
  font-size: 18px;
  color: #9CA3AF;
`;

const UsageUnlimited = styled.div`
  font-size: 13px;
  color: #10B981;
  font-weight: 600;
  margin-top: 4px;
`;

const UsageNote = styled.div`
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 6px;
  font-style: italic;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 40px;
  color: #6B7280;
  font-size: 16px;
`;

export default AccountSettings;
