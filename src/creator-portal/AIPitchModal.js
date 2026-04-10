import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { message, Spin } from 'antd';
import { FiX, FiSend, FiCopy, FiZap, FiUser, FiMail, FiLock, FiRefreshCw } from 'react-icons/fi';
import api from '../config/api';

/**
 * AI Pitch Modal - Generates personalized outreach emails using the "Golden Template"
 *
 * Uses real creator data + brand data to create hyper-personalized pitches
 * that follow the proven structure brands expect in 2026.
 */

const AIPitchModal = ({ isOpen, onClose, brand, onPitchSent }) => {
  const [loading, setLoading] = useState(true);
  const [pitch, setPitch] = useState(null);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [pitchLimits, setPitchLimits] = useState({ used: 0, limit: 3, canPitch: true });
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [fetchedBrandEmail, setFetchedBrandEmail] = useState(null); // Email from API
  const [fetchedApplicationUrl, setFetchedApplicationUrl] = useState(null); // Application form URL from API
  const [upgrading, setUpgrading] = useState(false); // Stripe checkout loading
  const [creditUsed, setCreditUsed] = useState(false); // Track if credit was deducted
  const MAX_REGENERATES = 3; // Limit regenerations to save API credits

  // Fetch creator profile and generate pitch when modal opens
  useEffect(() => {
    if (isOpen && brand) {
      initializePitch();
    }
  }, [isOpen, brand]);

  const initializePitch = async () => {
    setLoading(true);

    // Fetch limits first to check if user can contact
    const limits = await fetchPitchLimits();

    // If user can't pitch, just show upgrade prompt (don't generate pitch)
    if (!limits.canPitch) {
      setLoading(false);
      return;
    }

    // Fetch creator profile
    const profile = await fetchCreatorProfile();
    setCreatorProfile(profile);

    // Try AI endpoint, fall back to smart template
    const pitchData = await generatePitch(profile);

    // Check if brand has any contact method (email or application form from API response or brand prop)
    const hasEmail = pitchData?.brand_email || brand?.contact_email || brand?.email || brand?.pr_email;
    const hasAppForm = pitchData?.application_form_url || brand?.application_form_url || brand?.applicationUrl;

    // Only deduct credit if there's a way to contact the brand
    if (hasEmail || hasAppForm) {
      await trackPitchUsage();
      // Refresh limits to show updated count
      await fetchPitchLimits();
    }

    setLoading(false);
  };

  const trackPitchUsage = async () => {
    try {
      await api.post('/api/pr-crm/track-pitch', {
        brand_id: brand.brand_id || brand.id,
        slug: brand.slug,
        pipeline_id: brand.id
      });
      // Credit deducted successfully
      setCreditUsed(true);
    } catch (error) {
      // Silently fail - don't block the user
      console.error('Error tracking pitch:', error);
    }
  };

  // Handle modal close - notify parent if credit was used
  const handleClose = () => {
    if (creditUsed && onPitchSent) {
      onPitchSent(brand);
    }
    onClose();
  };

  const fetchCreatorProfile = async () => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      // Silently fail - use default values
      return null;
    }
  };

  const fetchPitchLimits = async () => {
    try {
      const response = await api.get('/api/pr-crm/pitch-limits');
      setPitchLimits(response.data);
      return response.data;
    } catch (error) {
      // Endpoint doesn't exist yet - default to allowing pitches
      const defaults = { used: 0, limit: 3, canPitch: true };
      setPitchLimits(defaults);
      return defaults;
    }
  };

  const generatePitch = async (profile) => {
    try {
      // Try AI endpoint first - send both brand_id and slug as fallback
      const response = await api.post('/api/pr-crm/generate-pitch', {
        brand_id: brand.brand_id || brand.id,
        slug: brand.slug
      });
      console.log('[AIPitchModal] Generate pitch response:', {
        brand_email: response.data.brand_email,
        application_form_url: response.data.application_form_url,
        brand_name: response.data.brand_name
      });
      setPitch(response.data);
      // Store the email from API if available
      if (response.data.brand_email) {
        setFetchedBrandEmail(response.data.brand_email);
      }
      // Store the application form URL from API if available
      if (response.data.application_form_url) {
        setFetchedApplicationUrl(response.data.application_form_url);
      }
      return response.data;
    } catch (error) {
      console.error('[AIPitchModal] Generate pitch error:', error);
      // AI endpoint not ready - use the Golden Template with real data
      const fallbackPitch = generateGoldenTemplate(brand, profile);
      setPitch(fallbackPitch);
      return fallbackPitch;
    }
  };

  /**
   * The "Golden Template" - Proven structure for brand outreach
   * Written to sound human, NOT like AI - avoids corporate buzzwords,
   * perfect formatting, and phrases like "genuine", "authentic", "thrilled"
   */
  const generateGoldenTemplate = (brand, profile) => {
    // Extract creator data with smart defaults
    const creatorName = profile?.username || profile?.name || '';
    const followers = formatFollowers(profile?.followers_count);
    const niche = getNiche(profile);
    const platform = getPrimaryPlatform(profile);
    const creatorId = profile?.id || profile?.creator_id;
    const socialUrl = getSocialUrl(profile, platform);

    // Get current month for timely content series
    const nextMonth = new Date(Date.now() + 30*24*60*60*1000).toLocaleString('default', { month: 'long' });

    // Generate content series name based on niche
    const seriesName = generateSeriesName(niche, brand.category);

    // Build the personalized subject - clean, no brackets or quotes
    const nicheDisplay = niche || brand.category || 'content';
    const subject = `PR collab idea for ${brand.brand_name}`;

    // Pick a random opener variation to avoid pattern detection
    const openers = getHumanOpeners(brand.brand_name, brand.category);
    const opener = openers[Math.floor(Math.random() * openers.length)];

    // Build the human-sounding body - no buzzwords, natural flow
    const body = `Hi there,

${opener}

I'm putting together a ${seriesName.toLowerCase()} series for ${nextMonth} and thought ${brand.brand_name} would be a good fit. I have ${followers || 'a growing audience'} on ${platform} who are always asking about ${getNicheInterest(niche, brand.category)}.

Here's what I had in mind:
- A ${platform === 'TikTok' ? 'TikTok' : 'Reel'} showing how I actually use the product (not a basic unboxing)
- I can also send over the raw clips if your team wants to use them

${socialUrl ? `My ${platform}: ${socialUrl}` : ''}${creatorId ? `\nMy profile & past work: https://newcollab.co/c/${creatorId}` : ''}

If you're open to it, I'd love to try some products and see if we can make something work. No pressure either way!

Thanks,
${creatorName}`;

    return {
      subject,
      body,
      creator_stats: {
        followers: followers,
        niche: niche,
        platform: platform
      }
    };
  };

  // Get creator's social media URL
  const getSocialUrl = (profile, platform) => {
    if (!profile) return null;

    if (platform === 'TikTok' && profile.tiktok) {
      const handle = profile.tiktok.replace('@', '');
      return `https://tiktok.com/@${handle}`;
    }
    if (platform === 'Instagram' && (profile.instagram || profile.username)) {
      const handle = (profile.instagram || profile.username).replace('@', '');
      return `https://instagram.com/${handle}`;
    }
    if (platform === 'YouTube' && profile.youtube) {
      return profile.youtube.startsWith('http') ? profile.youtube : `https://youtube.com/@${profile.youtube}`;
    }
    return null;
  };

  // Human-sounding openers - varies to avoid AI detection
  const getHumanOpeners = (brandName, category) => {
    const openers = [
      `I've been using ${brandName} products for a bit now and wanted to reach out about a collab idea.`,
      `Found ${brandName} a few months back and it's become a staple in my routine - figured I'd shoot my shot.`,
      `Quick intro - I'm a ${category?.toLowerCase() || 'content'} creator and I've had my eye on ${brandName} for a while.`,
      `Hope this finds the right person! I create ${category?.toLowerCase() || ''} content and ${brandName} keeps coming up in my comments.`,
      `I've been wanting to reach out for a while - ${brandName} fits really well with the content I make.`
    ];
    return openers;
  };

  // What the audience asks about - natural phrasing
  const getNicheInterest = (niche, category) => {
    const interests = {
      'Beauty': 'what products actually work',
      'Skincare': 'skincare routines and product recs',
      'Fashion': 'where to find good pieces',
      'Fitness': 'gear that holds up',
      'Food': 'kitchen stuff worth buying',
      'Lifestyle': 'everyday essentials',
      'Tech': 'tech that makes life easier',
      'Home': 'home finds',
      'Pets': 'pet products',
      'default': 'product recommendations'
    };
    return interests[niche] || interests[category] || interests['default'];
  };

  // Helper functions for template personalization
  const formatFollowers = (count) => {
    if (!count) return null;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getNiche = (profile) => {
    if (!profile?.niche) return null;
    if (Array.isArray(profile.niche)) return profile.niche[0];
    if (typeof profile.niche === 'string') return profile.niche;
    return null;
  };

  const getPrimaryPlatform = (profile) => {
    if (profile?.tiktok) return 'TikTok';
    if (profile?.instagram) return 'Instagram';
    if (profile?.youtube) return 'YouTube';
    return 'Instagram';
  };

  // Casual series names - lowercase, sounds like real creator content
  const generateSeriesName = (niche, category) => {
    const seriesNames = {
      'Beauty': 'product testing',
      'Skincare': 'skincare routine',
      'Fashion': 'outfit styling',
      'Fitness': 'workout gear review',
      'Food': 'kitchen favorites',
      'Lifestyle': 'daily essentials',
      'Tech': 'tech review',
      'Home': 'home finds',
      'Pets': 'pet product testing',
      'default': 'product review'
    };

    const key = niche || category || 'default';
    return seriesNames[key] || seriesNames[category] || seriesNames['default'];
  };

  const handleSendEmail = async () => {
    if (!pitchLimits.canPitch) {
      message.warning('You\'ve used all your free contacts this week. Upgrade to continue!');
      return;
    }

    setSending(true);

    try {
      // Build mailto URL
      const mailtoUrl = buildMailtoUrl();

      // Open email client
      window.location.href = mailtoUrl;

      message.success('Opening your email app...');

      // Close modal after short delay (handleClose notifies parent)
      setTimeout(() => {
        handleClose();
      }, 1000);

    } catch (error) {
      // Still open email even if something fails
      window.location.href = buildMailtoUrl();
      handleClose();
    } finally {
      setSending(false);
    }
  };

  const buildMailtoUrl = () => {
    const email = brandEmail || '';
    const subject = encodeURIComponent(pitch?.subject || `PR collab idea for ${brand.brand_name}`);
    const body = encodeURIComponent(pitch?.body || '');

    return `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleCopyPitch = async () => {
    try {
      const fullPitch = `Subject: ${pitch?.subject}\n\n${pitch?.body}`;
      await navigator.clipboard.writeText(fullPitch);
      setCopied(true);
      message.success('Email copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      message.error('Failed to copy');
    }
  };

  const handleRegenerate = () => {
    if (regenerateCount >= MAX_REGENERATES) {
      message.warning(`You can only regenerate ${MAX_REGENERATES} times per pitch`);
      return;
    }
    setRegenerateCount(prev => prev + 1);
    initializePitch();
  };

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);
      const response = await api.post('/api/subscription/create-checkout', { tier: 'pro' });
      // Redirect to Stripe Checkout
      window.location.href = response.data.checkout_url;
    } catch (error) {
      console.error('Upgrade error:', error);
      const errorData = error.response?.data;
      if (errorData?.code === 'stripe_account_pending') {
        message.warning('Payment processing is temporarily unavailable. Please try again later.');
      } else {
        message.error('Failed to start checkout. Please try again.');
      }
      setUpgrading(false);
    }
  };

  // Normalize brand property names (handle both API formats)
  // Priority: API fetched > brand prop variations
  const brandName = brand?.brand_name || brand?.name || 'Brand';
  const brandLogo = brand?.logo_url || brand?.logo || null;
  const brandEmail = fetchedBrandEmail || brand?.contact_email || brand?.email || brand?.pr_email || null;
  // Check all possible field names for application form URL
  const applicationFormUrl = fetchedApplicationUrl || brand?.application_form_url || brand?.applicationUrl || brand?.application_url || null;
  const hasContactMethod = brandEmail || applicationFormUrl;

  // Debug logging
  console.log('[AIPitchModal] Render state:', {
    loading,
    brandName,
    brandEmail,
    applicationFormUrl,
    fetchedApplicationUrl,
    hasContactMethod
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <Modal
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton onClick={handleClose}>
            <FiX />
          </CloseButton>

          {/* Header */}
          <Header>
            <BrandInfo>
              <BrandLogo>
                {brandLogo ? (
                  <img src={brandLogo} alt={brandName} />
                ) : (
                  <span>{brandName?.charAt(0)}</span>
                )}
              </BrandLogo>
              <div>
                <BrandName>Contact {brandName}</BrandName>
                <BrandCategory>{brand.category}</BrandCategory>
              </div>
            </BrandInfo>

            <PitchCounter canPitch={pitchLimits.canPitch}>
              <FiZap />
              <span>{pitchLimits.limit - pitchLimits.used} / {pitchLimits.limit} contacts left</span>
            </PitchCounter>
          </Header>

          {/* Content */}
          {loading ? (
            <LoadingState>
              <Spin size="large" />
              <LoadingText>Crafting your email...</LoadingText>
              <LoadingSubtext>Personalizing for {brandName}</LoadingSubtext>
            </LoadingState>
          ) : !pitchLimits.canPitch ? (
            <UpgradePrompt>
              <UpgradeIcon><FiZap /></UpgradeIcon>
              <UpgradeTitle>You've Used All Free Contacts!</UpgradeTitle>
              <UpgradeText>
                Upgrade to Pro for unlimited brand contacts and land more PR deals.
              </UpgradeText>
              <UpgradeFeatures>
                <UpgradeFeature>✓ Unlimited brand contacts</UpgradeFeature>
                <UpgradeFeature>✓ Direct PR manager emails</UpgradeFeature>
                <UpgradeFeature>✓ Priority brand matching</UpgradeFeature>
              </UpgradeFeatures>
              <UpgradeButton
                as="button"
                onClick={handleUpgrade}
                disabled={upgrading}
              >
                {upgrading ? 'Processing...' : 'Upgrade to Pro - $12/month'}
              </UpgradeButton>
              <UpgradeNote>💡 One PR package pays for 6+ months of Pro!</UpgradeNote>
            </UpgradePrompt>
          ) : (
            <>
              {/* Email Preview */}
              <EmailPreview>
                <EmailHeader>
                  <EmailLabel>To:</EmailLabel>
                  <EmailValue>{brandEmail || `${brandName} PR Team`}</EmailValue>
                </EmailHeader>
                <EmailHeader>
                  <EmailLabel>Subject:</EmailLabel>
                  <EmailSubject>{pitch?.subject}</EmailSubject>
                </EmailHeader>
                <EmailDivider />
                <EmailBody>{pitch?.body}</EmailBody>
              </EmailPreview>

              {/* Creator Stats Badge */}
              {pitch?.creator_stats && (pitch.creator_stats.followers || pitch.creator_stats.niche) && (
                <StatsBadge>
                  <StatsTitle><FiUser /> Personalized with your data:</StatsTitle>
                  <StatsRow>
                    {pitch.creator_stats.followers && (
                      <Stat>📊 {pitch.creator_stats.followers} followers</Stat>
                    )}
                    {pitch.creator_stats.niche && (
                      <Stat>🎯 {pitch.creator_stats.niche}</Stat>
                    )}
                    {pitch.creator_stats.platform && (
                      <Stat>📱 {pitch.creator_stats.platform}</Stat>
                    )}
                  </StatsRow>
                </StatsBadge>
              )}

              {/* Action Buttons */}
              <Actions>
                {/* Primary action: Application Form if no email, or Send Email if email exists */}
                {!brandEmail && applicationFormUrl ? (
                  <PrimaryApplicationButton
                    href={applicationFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📋 <span>Open Application Form</span>
                  </PrimaryApplicationButton>
                ) : (
                  <SendButton
                    onClick={handleSendEmail}
                    disabled={sending || !brandEmail}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {sending ? (
                      <span>Opening Email...</span>
                    ) : (
                      <>
                        <FiSend /> <span>Send Email to {brandName}</span>
                      </>
                    )}
                  </SendButton>
                )}

                <SecondaryActions>
                  <SecondaryButton onClick={handleCopyPitch}>
                    <FiCopy /> {copied ? 'Copied!' : 'Copy Pitch'}
                  </SecondaryButton>
                  <SecondaryButton
                    onClick={handleRegenerate}
                    disabled={regenerateCount >= MAX_REGENERATES}
                  >
                    <FiRefreshCw /> {regenerateCount >= MAX_REGENERATES ? 'Limit reached' : `Regenerate (${MAX_REGENERATES - regenerateCount} left)`}
                  </SecondaryButton>
                </SecondaryActions>
              </Actions>

              {/* Show application form as secondary if brand has BOTH email and application form */}
              {brandEmail && applicationFormUrl && (
                <ApplicationFormBox>
                  <ApplicationFormHeader>
                    <span>📋</span>
                    <div>
                      <ApplicationFormTitle>Application Form Available</ApplicationFormTitle>
                      <ApplicationFormSubtitle>You can also apply directly on their website</ApplicationFormSubtitle>
                    </div>
                  </ApplicationFormHeader>
                  <ApplicationFormButton
                    href={applicationFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Form →
                  </ApplicationFormButton>
                </ApplicationFormBox>
              )}

              {/* Tip for using the pitch when application form is primary */}
              {!brandEmail && applicationFormUrl && (
                <PitchTip>
                  💡 Use the pitch above as a reference when filling out the application form
                </PitchTip>
              )}

              {/* No email and no application form */}
              {!brandEmail && !applicationFormUrl && (
                <NoEmailWarning>
                  <FiMail /> No contact info found. Copy the pitch and send via Instagram DM instead!
                </NoEmailWarning>
              )}
            </>
          )}

          {/* Footer tip */}
          <FooterTip>
            💡 Personalized emails get 3x more responses than generic templates
          </FooterTip>
        </Modal>
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
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const Modal = styled(motion.div)`
  background: white;
  border-radius: 24px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;

  @media (max-width: 768px) {
    border-radius: 20px;
    max-height: 95vh;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
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
  z-index: 10;

  &:hover {
    background: #E5E7EB;
    color: #111827;
  }
`;

const Header = styled.div`
  padding: 24px 24px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;

  @media (max-width: 768px) {
    padding: 20px 20px 12px;
    flex-direction: column;
  }
`;

const BrandInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BrandLogo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3B82F6, #EC4899);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  span {
    color: white;
    font-size: 20px;
    font-weight: 700;
  }
`;

const BrandName = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const BrandCategory = styled.span`
  font-size: 13px;
  color: #6B7280;
`;

const PitchCounter = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: ${props => props.canPitch ? '#F0FDF4' : '#FEF2F2'};
  color: ${props => props.canPitch ? '#15803D' : '#DC2626'};
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;

  svg {
    font-size: 14px;
  }
`;

const LoadingState = styled.div`
  padding: 60px 24px;
  text-align: center;
`;

const LoadingText = styled.div`
  margin-top: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const LoadingSubtext = styled.div`
  margin-top: 4px;
  font-size: 14px;
  color: #6B7280;
`;

const EmailPreview = styled.div`
  margin: 0 24px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  overflow: hidden;

  @media (max-width: 768px) {
    margin: 0 16px;
  }
`;

const EmailHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #E5E7EB;
  background: white;
`;

const EmailLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  min-width: 55px;
  padding-top: 2px;
`;

const EmailValue = styled.span`
  font-size: 14px;
  color: #111827;
`;

const EmailSubject = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;

const EmailDivider = styled.div`
  height: 1px;
  background: #E5E7EB;
`;

const EmailBody = styled.div`
  padding: 16px;
  font-size: 13px;
  line-height: 1.7;
  color: #374151;
  white-space: pre-wrap;
  max-height: 280px;
  overflow-y: auto;

  @media (max-width: 768px) {
    max-height: 220px;
    font-size: 12px;
    line-height: 1.6;
  }
`;

const StatsBadge = styled.div`
  margin: 16px 24px 0;
  padding: 12px 16px;
  background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
  border: 1px solid #BFDBFE;
  border-radius: 12px;

  @media (max-width: 768px) {
    margin: 12px 16px 0;
  }
`;

const StatsTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #3B82F6;
  margin-bottom: 8px;
`;

const StatsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const Stat = styled.span`
  font-size: 12px;
  color: #1E40AF;
  font-weight: 500;
`;

const Actions = styled.div`
  padding: 20px 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const SendButton = styled(motion.button)`
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #818CF8 0%, #A78BFA 50%, #C084FC 100%);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.35);

    &::before {
      opacity: 1;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  /* Ensure all content stays above the ::before overlay */
  > * {
    position: relative;
    z-index: 1;
  }

  svg {
    position: relative;
    z-index: 1;
    font-size: 18px;
  }
`;

const PrimaryApplicationButton = styled.a`
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
  text-decoration: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.35);
    color: white;
  }

  span {
    position: relative;
    z-index: 1;
  }
`;

const PitchTip = styled.div`
  margin: 12px 24px 0;
  padding: 10px 14px;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 8px;
  font-size: 13px;
  color: #1E40AF;
  text-align: center;

  @media (max-width: 768px) {
    margin: 12px 16px 0;
  }
`;

const SecondaryActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
`;

const SecondaryButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  background: #F3F4F6;
  color: #374151;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #E5E7EB;
  }

  svg {
    font-size: 16px;
  }
`;

const NoEmailWarning = styled.div`
  margin: 0 24px;
  padding: 12px 16px;
  background: #FEF3C7;
  color: #92400E;
  border-radius: 10px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    margin: 0 16px;
  }
`;

const ApplicationFormBox = styled.div`
  margin: 16px 24px 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%);
  border: 2px solid #BBF7D0;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 768px) {
    margin: 16px 16px 0;
    padding: 14px 16px;
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }

  @media (max-width: 380px) {
    padding: 12px 14px;
    gap: 10px;
  }
`;

const ApplicationFormHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;

  > span {
    font-size: 28px;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    gap: 10px;

    > span {
      font-size: 24px;
    }
  }
`;

const ApplicationFormTitle = styled.div`
  font-weight: 700;
  font-size: 15px;
  color: #15803D;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 380px) {
    font-size: 13px;
  }
`;

const ApplicationFormSubtitle = styled.div`
  font-size: 13px;
  color: #6B7280;
  margin-top: 2px;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 12px;
  }

  @media (max-width: 380px) {
    display: none;
  }
`;

const ApplicationFormButton = styled.a`
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    color: white;
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
    border-radius: 8px;
  }

  @media (max-width: 380px) {
    padding: 10px 14px;
    font-size: 12px;
  }
`;

const UpgradePrompt = styled.div`
  padding: 40px 24px;
  text-align: center;
`;

const UpgradeIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #FEE2E2;
  color: #DC2626;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 28px;
`;

const UpgradeTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
`;

const UpgradeText = styled.p`
  font-size: 14px;
  color: #6B7280;
  margin: 0 0 20px;
`;

const UpgradeButton = styled.a`
  display: inline-block;
  padding: 14px 28px;
  background: linear-gradient(135deg, #3B82F6, #EC4899);
  color: white;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  cursor: pointer;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
    color: white;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const UpgradeNote = styled.p`
  margin-top: 12px;
  font-size: 12px;
  color: #9CA3AF;
`;

const UpgradeFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  text-align: left;
  max-width: 280px;
  margin-left: auto;
  margin-right: auto;
`;

const UpgradeFeature = styled.div`
  font-size: 14px;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FooterTip = styled.div`
  padding: 16px 24px;
  background: #F9FAFB;
  border-top: 1px solid #E5E7EB;
  text-align: center;
  font-size: 13px;
  color: #6B7280;
  border-radius: 0 0 24px 24px;
`;

export default AIPitchModal;
