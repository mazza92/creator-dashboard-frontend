import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiZap, FiCreditCard, FiCalendar, FiCheck, FiExternalLink, FiSettings, FiEdit2 } from 'react-icons/fi';
import api from '../config/api';
import { message } from 'antd';
import UpgradeModal from './UpgradeModal';
import LoadingSpinner from '../components/LoadingSpinner';

// Niche options - must match onboarding for consistency
const NICHE_OPTIONS = [
  { id: 'beauty', label: '💄 Beauty' },
  { id: 'skincare', label: '🧴 Skincare' },
  { id: 'haircare', label: '💇 Haircare' },
  { id: 'fashion', label: '👗 Fashion' },
  { id: 'jewelry', label: '💍 Jewelry' },
  { id: 'activewear', label: '🏃 Activewear' },
  { id: 'fitness', label: '💪 Fitness' },
  { id: 'wellness', label: '🌿 Wellness' },
  { id: 'supplements', label: '💊 Supplements' },
  { id: 'food', label: '🍽️ Food & Beverage' },
  { id: 'travel', label: '✈️ Travel' },
  { id: 'lifestyle', label: '🏠 Lifestyle' },
  { id: 'home', label: '🏡 Home & Living' },
  { id: 'tech', label: '💻 Tech' },
  { id: 'gaming', label: '🎮 Gaming' },
  { id: 'pet', label: '🐾 Pet' },
  { id: 'baby', label: '🍼 Baby & Parenting' },
  { id: 'sustainable', label: '♻️ Sustainable' },
  { id: 'luxury', label: '✨ Luxury' },
];

const AccountSettings = () => {
  const [searchParams] = useSearchParams();
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Niche editing state
  const [selectedNiches, setSelectedNiches] = useState([]);
  const [followerCount, setFollowerCount] = useState('');
  const [savingNiches, setSavingNiches] = useState(false);
  const [nichesDirty, setNichesDirty] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
    fetchCreatorProfile();
  }, []);

  // Email nudge CTA: /creator/dashboard/settings?upgrade=pro
  useEffect(() => {
    if (searchParams.get('upgrade') === 'pro') {
      setShowUpgradeModal(true);
    }
  }, [searchParams]);

  const fetchSubscriptionStatus = async () => {
    try {
      // Fetch subscription status and pitch limits in parallel
      const [subResponse, limitsResponse] = await Promise.all([
        api.get('/api/subscription/status'),
        api.get('/api/pr-crm/pitch-limits').catch(() => ({ data: { used: 0, limit: 3 } }))
      ]);

      setSubscriptionInfo({
        ...subResponse.data,
        contacts_used_this_week: limitsResponse.data.used,
        contacts_limit: limitsResponse.data.limit
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setLoading(false);
    }
  };

  const fetchCreatorProfile = async () => {
    try {
      const response = await api.get('/api/pr-crm/for-you');
      if (response.data.success && response.data.profile) {
        const rawNiches = response.data.profile.niches || [];
        const normalizedNiches = rawNiches.map(n =>
          typeof n === 'string' ? n.toLowerCase().trim() : ''
        ).filter(Boolean);
        setSelectedNiches(normalizedNiches);
        setFollowerCount(response.data.profile.followers?.toString() || '');
      }
    } catch (error) {
      console.error('Error fetching creator profile:', error);
    }
  };

  const toggleNiche = (nicheId) => {
    setSelectedNiches(prev => {
      if (prev.includes(nicheId)) {
        return prev.filter(n => n !== nicheId);
      } else if (prev.length < 3) {
        return [...prev, nicheId];
      }
      return prev;
    });
    setNichesDirty(true);
  };

  const saveNiches = async () => {
    if (selectedNiches.length === 0) {
      message.warning('Please select at least one niche');
      return;
    }
    setSavingNiches(true);
    try {
      const response = await api.patch('/api/pr-crm/creator-profile', {
        creator_niches: selectedNiches
      });
      if (response.data.success) {
        message.success('Content niches updated!');
        setNichesDirty(false);
        // Update local state with server response to confirm sync
        if (response.data.profile?.niches) {
          setSelectedNiches(response.data.profile.niches);
        }
      } else {
        message.error(response.data.error || 'Failed to save niches');
      }
    } catch (error) {
      console.error('Error saving niches:', error);
      message.error('Failed to save niches');
    } finally {
      setSavingNiches(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      const response = await api.post('/api/subscription/portal', {});

      // Redirect to Stripe Customer Portal
      window.location.href = response.data.portal_url;
    } catch (error) {
      console.error('Error opening portal:', error);
      const errorData = error.response?.data;
      if (errorData?.code === 'customer_not_found') {
        message.warning('Your subscription data has been reset. Please subscribe again.');
        // Refresh subscription status to show free tier
        fetchSubscriptionStatus();
      } else {
        message.error('Failed to open billing portal. Please try again.');
      }
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
      case 'pro': return '$19';
      default: return '$0';
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner text="Loading subscription details..." minHeight="320px" />
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
                  <FiCheck /> 5 PR Packages per month
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
                  <FiCheck /> Unlimited PR Packages
                </Feature>
                <Feature>
                  <FiCheck /> Verified PR contacts
                </Feature>
                <Feature>
                  <FiCheck /> Ready-to-send pitches in 3 tones
                </Feature>
                <Feature>
                  <FiCheck /> Priority support
                </Feature>
              </>
            )}

            {tier === 'elite' && (
              <>
                <Feature>
                  <FiCheck /> Everything in Pro
                </Feature>
                <Feature>
                  <FiCheck /> Unlimited PR Packages
                </Feature>
                <Feature>
                  <FiCheck /> Professional PR tools
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
                onClick={() => setShowUpgradeModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiZap />
                Upgrade Plan
              </UpgradeButton>
              <HelpText>
                Get unlimited brand contacts + personalized templates with Pro
              </HelpText>
            </>
          )}
        </PlanCard>
      </Section>

      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature={searchParams.get('upgrade') === 'pro' ? 'limit_reached' : undefined}
          currentCount={subscriptionInfo?.contacts_used_this_week || 0}
          limit={subscriptionInfo?.contacts_limit || 3}
          feature="brand contacts"
        />
      )}

      <Section>
        <SectionTitle>Usage This Month</SectionTitle>
        <UsageGrid>
          <UsageCard>
            <UsageLabel>Brands Saved</UsageLabel>
            <UsageValue>
              {subscriptionInfo?.brands_saved_count || 0}
            </UsageValue>
            <UsageUnlimited>Unlimited</UsageUnlimited>
          </UsageCard>

          <UsageCard>
            <UsageLabel>AI Contacts</UsageLabel>
            <UsageValue>
              {subscriptionInfo?.contacts_used_this_week || 0}
              {tier === 'free' && <UsageLimit> / {subscriptionInfo?.contacts_limit || 3}</UsageLimit>}
            </UsageValue>
            {(tier === 'pro' || tier === 'elite') && <UsageUnlimited>Unlimited</UsageUnlimited>}
            {tier === 'free' && <UsageNote>Resets monthly</UsageNote>}
          </UsageCard>
        </UsageGrid>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>Content Niches</SectionTitle>
          <SectionSubtitle>Select up to 3 niches to get matched with relevant brands</SectionSubtitle>
        </SectionHeader>

        <NicheCard>
          <NicheGrid>
            {NICHE_OPTIONS.map(niche => (
              <NicheChip
                key={niche.id}
                $selected={selectedNiches.includes(niche.id)}
                onClick={() => toggleNiche(niche.id)}
                disabled={!selectedNiches.includes(niche.id) && selectedNiches.length >= 3}
              >
                {niche.label}
              </NicheChip>
            ))}
          </NicheGrid>

          {nichesDirty && (
            <SaveNichesButton
              onClick={saveNiches}
              disabled={savingNiches || selectedNiches.length === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {savingNiches ? 'Saving...' : 'Save Changes'}
            </SaveNichesButton>
          )}

          <NicheHelpText>
            {selectedNiches.length}/3 niches selected · Changes affect your brand matches
          </NicheHelpText>
        </NicheCard>
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

const SectionHeader = styled.div`
  margin-bottom: 16px;
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: #6B7280;
  margin: 4px 0 0 0;
`;

const NicheCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
`;

const NicheGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const NicheChip = styled.button`
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1.5px solid ${props => props.$selected ? '#3B82F6' : '#E5E7EB'};
  background: ${props => props.$selected ? '#EFF6FF' : '#fff'};
  color: ${props => props.$selected ? '#3B82F6' : '#374151'};

  &:hover:not(:disabled) {
    border-color: #3B82F6;
    background: ${props => props.$selected ? '#DBEAFE' : '#F9FAFB'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SaveNichesButton = styled(motion.button)`
  width: 100%;
  margin-top: 20px;
  padding: 14px 20px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #2563EB;
  }
`;

const NicheHelpText = styled.p`
  text-align: center;
  font-size: 13px;
  color: #9CA3AF;
  margin: 16px 0 0 0;
`;

export default AccountSettings;
