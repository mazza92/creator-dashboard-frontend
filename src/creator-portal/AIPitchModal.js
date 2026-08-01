import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { message, Spin, Tooltip } from 'antd';
import { FiX, FiSend, FiCopy, FiZap, FiUser, FiMail, FiLock, FiRefreshCw, FiFileText, FiFlag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { creatorTokens as tokens } from '../theme/creatorTokens';
import UpgradeModal from './UpgradeModal';
// Media kit enforcement removed - let users try the feature immediately

/**
 * AI Pitch Modal - Generates personalized outreach emails using the "Golden Template"
 *
 * Uses real creator data + brand data to create hyper-personalized pitches
 * that follow the proven structure brands expect in 2026.
 */

const AIPitchModal = ({ isOpen, onClose, brand, onPitchSent, onUnlockUsed }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0); // 0: Finding contact, 1: Crafting pitch, 2: Personalizing
  const [pitch, setPitch] = useState(null);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [pitchLimits, setPitchLimits] = useState({ used: 0, limit: 3, canPitch: true });
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  // NOTE: Rewrite/regenerate removed to avoid LLM costs per brief
  const [fetchedBrandEmail, setFetchedBrandEmail] = useState(null); // Email from API
  const [fetchedApplicationUrl, setFetchedApplicationUrl] = useState(null); // Application form URL from API
  const [creditUsed, setCreditUsed] = useState(false);
  const [outreachStartedMethod, setOutreachStartedMethod] = useState(null);
  const [contactRevealed, setContactRevealed] = useState(false);
  const [pitchTracked, setPitchTracked] = useState(false); // Track if track_pitch was called
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [contactMethod, setContactMethod] = useState('email'); // 'email' | 'form'
  const [pitchSent, setPitchSent] = useState(false);
  const [showUpgradeOverlay, setShowUpgradeOverlay] = useState(false);
  const [paywallData, setPaywallData] = useState(null); // For unlock paywall
  const [hasRecentPoolActivity, setHasRecentPoolActivity] = useState(false); // Default false to show Pool nudge
  const [trackingPixelUrl, setTrackingPixelUrl] = useState(null); // For email open tracking
  const [showUnlockCelebration, setShowUnlockCelebration] = useState(false); // Tinder-style unlock celebration
  const [wasAlreadyUnlocked, setWasAlreadyUnlocked] = useState(false); // Track if brand was previously unlocked

  // Check if this is a follow-up pitch
  const isFollowup = brand?.isFollowup || false;

  // Fetch creator profile and generate pitch when modal opens
  useEffect(() => {
    if (isOpen && brand) {
      initializePitch();
    }
  }, [isOpen, brand]);

  const initializePitch = async () => {
    setLoading(true);
    setLoadingStep(0); // Finding contact

    // Helper to safely parse array fields (might be JSON strings or arrays)
    const parseArrayField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    // Media kit enforcement removed - let users try the feature immediately
    // Trade-off: users get instant value, but brands might ignore incomplete profiles

    // Fetch limits (but don't gate pitch generation — that happens at send time)
    await fetchPitchLimits();

    // Check if user has recent pool activity (for nudge visibility)
    try {
      const poolRes = await api.get('/api/pool/recent-activity');
      setHasRecentPoolActivity(poolRes.data?.has_recent_activity || false);
    } catch {
      setHasRecentPoolActivity(false); // Default to showing nudge on error
    }

    setLoadingStep(1); // Crafting pitch

    // Always generate the pitch — contact reveal is what consumes the credit
    const profile = await fetchCreatorProfile();
    setCreatorProfile(profile);

    setLoadingStep(2); // Personalizing
    await generatePitch(profile);

    setLoading(false);
  };

  const trackPitchUsage = async () => {
    try {
      const response = await api.post('/api/pr-crm/track-pitch', {
        brand_id: brand.brand_id || brand.id,
        slug: brand.slug,
        pipeline_id: brand.id
      });
      // Credit deducted successfully
      setCreditUsed(true);
      // Store tracking pixel URL for email open tracking
      if (response.data.tracking_pixel_url) {
        setTrackingPixelUrl(response.data.tracking_pixel_url);
      }
      await fetchPitchLimits();
      return response.data;
    } catch (error) {
      console.error('Error tracking pitch:', error);
      if (error.response?.data?.upgrade_required) {
        message.warning(error.response.data.error || 'Monthly contact limit reached. Upgrade to continue!');
      } else {
        message.error('Could not track this contact. Please try again.');
      }
      throw error;
    }
  };

  // Handle modal close - notify parent if credit was used
  const handleClose = () => {
    if ((creditUsed || outreachStartedMethod) && outreachStartedMethod && onPitchSent) {
      onPitchSent(brand, { method: outreachStartedMethod });
    }
    onClose();
  };

  const finishOutreach = (method) => {
    if (onPitchSent) {
      onPitchSent(brand, { method });
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
      // Use new unlock balance endpoint instead of old pitch-limits
      const response = await api.get('/api/pr-crm/unlocks/balance');
      const data = response.data;
      // Convert to expected format - canPitch is true if unlimited or has remaining unlocks
      const canPitch = data.is_unlimited || (data.remaining > 0);
      const limits = {
        used: data.is_unlimited ? 0 : (5 - (data.remaining || 0)),
        limit: 5,
        remaining: data.remaining,
        canPitch: canPitch,
        tier: data.tier,
        reset_at: data.reset_at,
        is_unlimited: data.is_unlimited
      };
      setPitchLimits(limits);
      return limits;
    } catch (error) {
      // Endpoint doesn't exist yet - default to allowing pitches
      const defaults = { used: 0, limit: 5, canPitch: true };
      setPitchLimits(defaults);
      return defaults;
    }
  };

  const generatePitch = async (profile) => {
    try {
      // Try AI endpoint first - send both brand_id and slug as fallback
      const response = await api.post('/api/pr-crm/generate-pitch', {
        brand_id: brand.brand_id || brand.id,
        slug: brand.slug,
        is_followup: isFollowup
      });
      console.log('[AIPitchModal] Generate pitch response:', {
        brand_email: response.data.brand_email,
        application_form_url: response.data.application_form_url,
        brand_name: response.data.brand_name,
        is_followup: isFollowup
      });
      // NOTE: Portfolio link is inserted by the backend (with tracking ?ref token).
      // Do NOT append it here — doing so creates a duplicate untracked link.
      const pitchWithMediaKit = { ...response.data };
      setPitch(pitchWithMediaKit);
      setEditedSubject(pitchWithMediaKit.subject || '');
      setEditedBody(pitchWithMediaKit.body || '');
      // Store the email from API if available
      if (response.data.brand_email) {
        setFetchedBrandEmail(response.data.brand_email);
      }
      // Store the application form URL from API if available
      if (response.data.application_form_url) {
        setFetchedApplicationUrl(response.data.application_form_url);
      }
      // Brand is now unlocked - reveal the contact info immediately
      setContactRevealed(true);
      // Check if this was a fresh unlock (credit used) vs already unlocked
      if (response.data.brand_unlocked) {
        // Fresh unlock - show celebration!
        setWasAlreadyUnlocked(false);
        setShowUnlockCelebration(true);
        // User must click to dismiss - give them time to appreciate the unlock
        // Notify parent to refetch unlock balance for real-time quota updates
        if (onUnlockUsed) {
          onUnlockUsed();
        }
      } else if (response.data.already_unlocked) {
        // Brand was already unlocked - no celebration, just show unlocked state
        setWasAlreadyUnlocked(true);
      }
      return pitchWithMediaKit;
    } catch (error) {
      console.error('[AIPitchModal] Generate pitch error:', error);

      // Handle paywall (402) - user ran out of unlocks
      if (error.response?.status === 402 && error.response?.data?.paywall) {
        setPaywallData({
          reset_at: error.response.data.reset_at,
          remaining: 0,
          message: error.response.data.message
        });
        setShowUpgradeOverlay(true);
        return null;
      }

      // Handle AI service errors (403, 500, 503) - Gemini API issues
      const isAIServiceError = [403, 500, 503].includes(error.response?.status);
      if (isAIServiceError) {
        console.log('[AIPitchModal] AI service temporarily unavailable, using template');
        message.info('Using personalized template (AI temporarily unavailable)');
      }

      // AI endpoint not ready - use the Golden Template with real data
      const fallbackPitch = isFollowup
        ? generateFollowupTemplate(brand, profile)
        : generateGoldenTemplate(brand, profile);
      setPitch(fallbackPitch);
      setEditedSubject(fallbackPitch.subject || '');
      setEditedBody(fallbackPitch.body || '');
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

    // Specific subject — uses creator niche and followers for a cleaner signal
    const nicheDisplay = niche || brand.category || 'content';
    const followersShort = followers || null;
    const subjectNiche = niche
      ? niche.charAt(0).toUpperCase() + niche.slice(1)
      : (brand.category || 'Content');
    const subject = followersShort
      ? `${subjectNiche} content idea for ${followersShort} ${platform} audience`
      : `Content collab idea for ${brand.brand_name}`;

    // Pass creator niche — not brand category — so the opener reflects the creator's identity
    const openers = getHumanOpeners(brand.brand_name, niche);
    const opener = openers[Math.floor(Math.random() * openers.length)];

    // Build the human-sounding body - no buzzwords, natural flow
    const body = `Hi there,

${opener}

I'm putting together a ${seriesName.toLowerCase()} series for ${nextMonth} and thought ${brand.brand_name} would be a good fit. I have ${followers || 'a growing audience'} on ${platform} who are always asking about ${getNicheInterest(niche, brand.category)}.

Here's what I had in mind:
- A ${platform === 'TikTok' ? 'TikTok' : 'Reel'} showing how I actually use the product (not a basic unboxing)
- I can also send over the raw clips if your team wants to use them

${socialUrl ? `My ${platform}: ${socialUrl}` : ''}${profile?.has_media_kit && creatorId ? `\nPlease find my portfolio here: https://newcollab.co/kit/${profile?.username || creatorId}` : ''}

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

  /**
   * Follow-up Template - For when the initial pitch hasn't received a response
   * Shorter, friendlier, with a clear CTA
   */
  const generateFollowupTemplate = (brand, profile) => {
    const creatorName = profile?.username || profile?.name || '';
    const followers = formatFollowers(profile?.followers_count);
    const niche = getNiche(profile);
    const platform = getPrimaryPlatform(profile);
    const creatorId = profile?.id || profile?.creator_id;

    // Calculate days since pitched (from brand data if available)
    const daysSince = brand?.days_since_pitched || 7;

    // Build follow-up subject - reference the original email
    const subject = `Following up - PR collab with ${brand.brand_name}`;

    // Different follow-up openers
    const openers = [
      `Just wanted to bump this to the top of your inbox - I reached out about a week ago about a potential collab.`,
      `Following up on my email from last week about working together.`,
      `Hi! Wanted to check in on my collab inquiry from ${daysSince} days ago.`,
      `Quick follow-up on my previous message - wanted to make sure it didn't get lost.`,
    ];
    const opener = openers[Math.floor(Math.random() * openers.length)];

    const body = `Hi there,

${opener}

I'm still interested in creating content around ${brand.brand_name} products for my ${followers || ''} ${platform} followers${niche ? ` in the ${niche.toLowerCase()} space` : ''}.

${profile?.has_media_kit && creatorId ? `Please find my portfolio here: https://newcollab.co/kit/${profile?.username || creatorId}\n` : ''}
Happy to chat more if you're interested - just let me know!

Thanks,
${creatorName}`;

    return {
      subject,
      body,
      creator_stats: {
        followers: followers,
        niche: niche,
        platform: platform
      },
      is_followup: true
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

  // Human-sounding openers — always uses creator's own niche, not the brand's category
  const getHumanOpeners = (brandName, creatorNiche) => {
    const nicheLabel = creatorNiche?.toLowerCase() || 'content';
    const openers = [
      `I've been following ${brandName} for a while and wanted to reach out about a collab idea.`,
      `Found ${brandName} a few months back and it fits really well with the content I make.`,
      `Quick intro: I make ${nicheLabel} content and I've had my eye on ${brandName} for a while.`,
      `Hope this finds the right person! I make ${nicheLabel} content and ${brandName} keeps coming up in my comments.`,
      `I've been wanting to reach out for a while. ${brandName} fits naturally into what I already post.`
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
    // Follow-ups don't consume pitch credits (Pro only feature)
    // Show upgrade overlay instead of blocking with a warning
    if (!isFollowup && !pitchLimits.canPitch) {
      setShowUpgradeOverlay(true);
      return;
    }

    setSending(true);

    try {
      // Only track pitch usage for initial outreach, not follow-ups
      // Use pitchTracked flag (not contactRevealed) since contact is revealed during generatePitch
      if (!isFollowup && !pitchTracked) {
        await trackPitchUsage();
        setPitchTracked(true);
      }
      const method = isFollowup ? 'followup' : 'email';
      setOutreachStartedMethod(method);

      // Open email client
      window.location.href = buildMailtoUrl();

      // Show success screen — don't close immediately
      setPitchSent(true);

    } catch (error) {
      // Tracking failed or the user hit the quota limit; don't move them forward.
      return;
    } finally {
      setSending(false);
    }
  };

  const handleApplicationFormClick = async (e) => {
    if (e) e.preventDefault();

    // Show upgrade overlay instead of blocking with a warning
    if (!pitchLimits.canPitch) {
      setShowUpgradeOverlay(true);
      return false;
    }

    const formWindow = window.open('about:blank', '_blank');
    if (formWindow) {
      formWindow.opener = null;
    }

    try {
      // Skip tracking if pitch was already tracked
      if (!pitchTracked) {
        await trackPitchUsage();
        setPitchTracked(true);
      }
      setOutreachStartedMethod('form');
      if (formWindow) {
        formWindow.location.href = applicationFormUrl;
      } else {
        window.location.href = applicationFormUrl;
      }

      // Give the browser a moment to open the new tab before moving the user to the pipeline.
      setTimeout(() => {
        finishOutreach('form');
      }, 700);
      return true;
    } catch (error) {
      if (formWindow) {
        formWindow.close();
      }
      return false;
    }
  };

  const buildMailtoUrl = () => {
    const email = brandEmail || '';
    const subject = encodeURIComponent(editedSubject || pitch?.subject || '');
    let bodyText = editedBody || pitch?.body || '';

    // Note: Tracking pixel won't render in plain text mailto emails
    // It's included here for when we switch to HTML emails via platform
    // For now, the "pitched_at" timestamp is set when creator clicks Send
    if (trackingPixelUrl) {
      bodyText += `\n\n\n<img src="${trackingPixelUrl}" width="1" height="1" style="display:none" alt="" />`;
    }

    const body = encodeURIComponent(bodyText);
    return `mailto:${email}?bcc=creators@newcollab.co&subject=${subject}&body=${body}`;
  };

  const handleCopyPitch = async () => {
    try {
      const fullPitch = `Subject: ${editedSubject || pitch?.subject}\n\n${editedBody || pitch?.body}`;
      await navigator.clipboard.writeText(fullPitch);
      setCopied(true);
      message.success('Email copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      message.error('Failed to copy');
    }
  };

  // NOTE: handleRegenerate removed to avoid LLM costs
  // Each Gemini call costs ~$0.0002, regenerations add up

  // Normalize brand property names (handle both API formats)
  // Priority: API fetched > brand prop variations
  const brandName = brand?.brand_name || brand?.name || 'Brand';
  const brandLogo = brand?.logo_url || brand?.logo || null;
  const brandEmail = fetchedBrandEmail || brand?.contact_email || brand?.email || brand?.pr_email || null;
  // Check all possible field names for application form URL
  const applicationFormUrl = fetchedApplicationUrl || brand?.application_form_url || brand?.applicationUrl || brand?.application_url || null;
  const hasContactMethod = brandEmail || applicationFormUrl;

  // Mask email until user commits to contacting (quota consumed)
  const getMaskedEmail = (email) => {
    if (!email) return null;
    const [local, domain] = email.split('@');
    if (!domain) return '••••@••••.com';
    const maskedLocal = local.length > 2
      ? local.charAt(0) + '••••' + local.charAt(local.length - 1)
      : '••••';
    return `${maskedLocal}@${domain}`;
  };

  const displayEmail = contactRevealed ? brandEmail : getMaskedEmail(brandEmail);

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

          {/* Success state — replaces entire modal content */}
          {pitchSent ? (
            <SuccessScreen
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <SuccessHero>
                <SuccessIconWrap>
                  <FiSend />
                </SuccessIconWrap>
                <SuccessTitle>Pitch sent to {brandName}</SuccessTitle>
                <SuccessSub>
                  Your pitch is in their inbox. Here's what to do next.
                </SuccessSub>
              </SuccessHero>

              <SuccessPipelineCard>
                <SuccessBrandLogo>
                  {brandLogo
                    ? <img src={brandLogo} alt={brandName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 13 }} />
                    : <span>{brandName?.charAt(0)}</span>
                  }
                </SuccessBrandLogo>
                <SuccessPipelineInfo>
                  <SuccessPipelineBrand>{brandName}</SuccessPipelineBrand>
                  <SuccessPipelineMeta>Added to your pipeline</SuccessPipelineMeta>
                </SuccessPipelineInfo>
                <SuccessWindowBadge>
                  <SuccessWindowDays>14</SuccessWindowDays>
                  <SuccessWindowLabel>day window</SuccessWindowLabel>
                </SuccessWindowBadge>
              </SuccessPipelineCard>

              <SuccessTips>
                <SuccessTip>
                  <SuccessTipIcon><FiZap /></SuccessTipIcon>
                  <SuccessTipText>
                    <strong>Follow-up reminder set.</strong> We'll remind you in 7 days if you haven't heard back. That's when reply rates are highest.
                  </SuccessTipText>
                </SuccessTip>
                {brand.response_rate > 0 && (
                  <SuccessTip>
                    <SuccessTipIcon>📊</SuccessTipIcon>
                    <SuccessTipText>
                      <strong>{brandName} replies to {brand.response_rate}% of pitches.</strong> Creators who follow up on day 7 are 2x more likely to get a response.
                    </SuccessTipText>
                  </SuccessTip>
                )}
              </SuccessTips>

              {/* Show kit nudge OR pool nudge based on activity */}
              {!hasRecentPoolActivity ? (
                <SuccessPoolNudge onClick={() => { handleClose(); navigate('/creator/dashboard/pool'); }}>
                  <SuccessPoolText>
                    <SuccessPoolTitle>🚀 Grow your followers while you wait</SuccessPoolTitle>
                    <SuccessPoolSub>Join creators boosting each other in the Pool</SuccessPoolSub>
                  </SuccessPoolText>
                  <SuccessPoolBtn>Boost my followers →</SuccessPoolBtn>
                </SuccessPoolNudge>
              ) : (
                <SuccessKitNudge>
                  <SuccessKitText>
                    <SuccessKitTitle>Build your media kit before they reply</SuccessKitTitle>
                    <SuccessKitSub>Brands ask for it when they're interested. Be ready.</SuccessKitSub>
                  </SuccessKitText>
                  <SuccessKitBtn onClick={() => { handleClose(); navigate('/creator/dashboard/my-kit'); }}>
                    Build kit
                  </SuccessKitBtn>
                </SuccessKitNudge>
              )}

              <SuccessActions>
                <PrimaryBtn as="button" onClick={() => { finishOutreach('email'); }}>
                  Pitch another brand
                </PrimaryBtn>
                <SuccessSecondaryBtn onClick={() => { finishOutreach('email'); navigate('/creator/dashboard/pr-pipeline'); }}>
                  View my pipeline
                </SuccessSecondaryBtn>
              </SuccessActions>
            </SuccessScreen>
          ) : (
            <>
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
                    <BrandName>{brandName}</BrandName>
                    <BrandMeta>
                      {isFollowup
                        ? `${brand.days_since_pitched || 7}+ days since pitch`
                        : brand.category}
                      {brand.match_score && (
                        <MatchChip score={Math.min(brand.match_score, 100)}>
                          {Math.min(Math.round(brand.match_score), 100)}% match
                        </MatchChip>
                      )}
                    </BrandMeta>
                  </div>
                </BrandInfo>
              </Header>

              {/* Brand Unlocked Status Line - differentiate fresh vs already unlocked */}
              {!loading && pitch && (
                  <UnlockedStatus $wasAlreadyUnlocked={wasAlreadyUnlocked}>
                  <span>✓</span>{' '}
                  {wasAlreadyUnlocked
                    ? 'Already unlocked · No credit used'
                    : 'Brand PR unlocked · Email or form below'}
                </UnlockedStatus>
              )}

              {/* Tinder-style Unlock Celebration */}
              <AnimatePresence>
                {showUnlockCelebration && (
                  <UnlockCelebrationOverlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <UnlockCelebrationCard
                      initial={{ scale: 0.5, y: 50 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                    >
                      <ConfettiContainer>
                        {[...Array(12)].map((_, i) => (
                          <Confetti key={i} $delay={i * 0.1} $angle={i * 30} />
                        ))}
                      </ConfettiContainer>
                      <CelebrationIcon>
                        <span>🎉</span>
                      </CelebrationIcon>
                      <CelebrationTitle>Brand Contact Unlocked!</CelebrationTitle>
                      <CelebrationBrandName>{brandName}</CelebrationBrandName>
                      <CelebrationDetails>
                        <CelebrationDetail>
                          <span>✓</span> Verified PR email revealed
                        </CelebrationDetail>
                        <CelebrationDetail>
                          <span>✓</span> Custom pitch generated
                        </CelebrationDetail>
                      </CelebrationDetails>
                      <CelebrationDismiss onClick={() => setShowUnlockCelebration(false)}>
                        Send your pitch →
                      </CelebrationDismiss>
                    </UnlockCelebrationCard>
                  </UnlockCelebrationOverlay>
                )}
              </AnimatePresence>

              {/* Content */}
              {loading ? (
            <LoadingState>
              <LoadingEyebrow>Getting Brand PR</LoadingEyebrow>
              <LoadingBrandIcon>
                {brand?.logo ? (
                  <img src={brand.logo} alt={brandName} />
                ) : (
                  <LoadingBrandInitial>{brandName?.charAt(0)}</LoadingBrandInitial>
                )}
              </LoadingBrandIcon>
              <LoadingTitle>
                {isFollowup ? 'Preparing follow-up for' : 'Unlocking'}{' '}
                <LoadingBrandName>{brandName}</LoadingBrandName>
              </LoadingTitle>
              <LoadingSteps>
                <LoadingStepItem $active={loadingStep >= 0} $complete={loadingStep > 0}>
                  <LoadingStepDot $active={loadingStep === 0} $complete={loadingStep > 0}>
                    {loadingStep > 0 ? '✓' : '1'}
                  </LoadingStepDot>
                  <LoadingStepLabel>PR contact</LoadingStepLabel>
                </LoadingStepItem>
                <LoadingStepLine $complete={loadingStep > 0} />
                <LoadingStepItem $active={loadingStep >= 1} $complete={loadingStep > 1}>
                  <LoadingStepDot $active={loadingStep === 1} $complete={loadingStep > 1}>
                    {loadingStep > 1 ? '✓' : '2'}
                  </LoadingStepDot>
                  <LoadingStepLabel>Pitch draft</LoadingStepLabel>
                </LoadingStepItem>
                <LoadingStepLine $complete={loadingStep > 1} />
                <LoadingStepItem $active={loadingStep >= 2} $complete={loadingStep > 2}>
                  <LoadingStepDot $active={loadingStep === 2} $complete={loadingStep > 2}>
                    {loadingStep > 2 ? '✓' : '3'}
                  </LoadingStepDot>
                  <LoadingStepLabel>Package ready</LoadingStepLabel>
                </LoadingStepItem>
              </LoadingSteps>
              <LoadingSubtext>
                {loadingStep === 0 && 'Finding verified PR email or form…'}
                {loadingStep === 1 && 'Drafting a short pitch for micros…'}
                {loadingStep === 2 && 'Packing email + form prep…'}
              </LoadingSubtext>
            </LoadingState>
          ) : (
            <>
              <PkgBody>
                <PkgPills>
                  <PkgPill $tone="ok">Accepts micros</PkgPill>
                  {brandEmail && <PkgPill $tone="email">PR email</PkgPill>}
                  {applicationFormUrl && <PkgPill $tone="form">Program form</PkgPill>}
                  <PkgPill $tone="gift">~${brand?.price_point || 45} avg gift</PkgPill>
                </PkgPills>

                <MatchBox>
                  <MatchBoxTitle>
                    {brand?.match_score ? `${Math.min(Math.round(brand.match_score), 100)}% match` : 'Good match'}
                  </MatchBoxTitle>
                  <MatchBoxBody>
                    {brand?.description
                      || (brand?.category
                        ? `${brand.category} creators — unlock PR contact and pitch with a short note.`
                        : 'Unlock the PR contact and pitch with a short, personal note.')}
                  </MatchBoxBody>
                </MatchBox>

                {brandEmail && applicationFormUrl && (
                  <FlowTabs style={{ margin: '0 0 12px' }}>
                    <FlowTab
                      active={contactMethod === 'email'}
                      onClick={() => setContactMethod('email')}
                    >
                      PR email
                    </FlowTab>
                    <FlowTab
                      active={contactMethod === 'form'}
                      onClick={() => setContactMethod('form')}
                    >
                      Program form
                    </FlowTab>
                  </FlowTabs>
                )}

                {(contactMethod === 'form' || (!brandEmail && applicationFormUrl)) && (
                  <FormSubmitNote style={{ margin: '0 0 12px' }}>
                    <strong>You submit this form — we don’t</strong>
                    Affiliate / UGC portals need your login. We open the link and prep your pitch answers.
                  </FormSubmitNote>
                )}

                {brandEmail && contactMethod === 'email' && (
                  <InfoBlock>
                    <InfoLabel>Verified PR email</InfoLabel>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div>
                        <InfoValue>{displayEmail || `${brandName} PR Team`}</InfoValue>
                        <InfoMeta>
                          {wasAlreadyUnlocked ? 'Already unlocked' : '1 credit used'}
                        </InfoMeta>
                      </div>
                      <Tooltip title="Report invalid or outdated email">
                        <FlagBtn
                          type="button"
                          onClick={() => {
                            const subject = encodeURIComponent(`${brandName} - Invalid Contact Report`);
                            const body = encodeURIComponent(`Hi Newcollab team,\n\nThe contact email for ${brandName} (${brandEmail}) appears to be invalid or no longer active.\n\nPlease update this brand's contact information.\n\nThank you!`);
                            window.open(`mailto:team@newcollab.co?subject=${subject}&body=${body}`, '_blank');
                          }}
                        >
                          <FiFlag size={14} />
                        </FlagBtn>
                      </Tooltip>
                    </div>
                  </InfoBlock>
                )}

                {applicationFormUrl && (contactMethod === 'form' || !brandEmail) && (
                  <InfoBlock>
                    <InfoLabel>Program signup link</InfoLabel>
                    <InfoValue style={{ fontSize: '0.88rem' }}>{applicationFormUrl}</InfoValue>
                  </InfoBlock>
                )}

                <InfoBlock>
                  <InfoLabel>What they often gift</InfoLabel>
                  <InfoValue>~${brand?.price_point || 45} avg gift</InfoValue>
                </InfoBlock>

                <InfoBlock>
                  <InfoLabel>Your pitch</InfoLabel>
                  <SubjectInput
                    value={editedSubject}
                    onChange={e => setEditedSubject(e.target.value)}
                    placeholder="Subject line"
                    style={{
                      width: '100%',
                      marginBottom: 8,
                      padding: '8px 10px',
                      border: '1px solid #ebebeb',
                      borderRadius: 8,
                      fontWeight: 600,
                    }}
                  />
                  <PitchTextarea
                    value={editedBody}
                    onChange={e => setEditedBody(e.target.value)}
                    rows={6}
                    style={{
                      background: '#fff',
                      border: '1px solid #ebebeb',
                      borderRadius: 10,
                      minHeight: 120,
                    }}
                  />
                  <EditHint style={{ marginTop: 6, display: 'block' }}>Tap to edit</EditHint>
                </InfoBlock>
              </PkgBody>

              <Actions>
                {(contactMethod === 'form' || !brandEmail) && applicationFormUrl ? (
                  <>
                    <PrimaryBtn
                      as={motion.button}
                      onClick={handleApplicationFormClick}
                      whileTap={{ scale: 0.98 }}
                    >
                      Open form in new tab →
                    </PrimaryBtn>
                    <FormTip>
                      Use the pitch above as copy-paste answers when you submit.
                    </FormTip>
                  </>
                ) : brandEmail ? (
                  <>
                    <PrimaryBtn
                      as={motion.button}
                      onClick={() => handleSendEmail()}
                      disabled={sending}
                      whileTap={{ scale: 0.98 }}
                    >
                      {sending ? 'Opening…' : 'Contact Brand'}
                    </PrimaryBtn>
                    <SecondaryRow>
                      <SecondaryBtn onClick={handleCopyPitch}>
                        {copied ? 'Copied' : 'Copy pitch'}
                      </SecondaryBtn>
                    </SecondaryRow>
                  </>
                ) : (
                  <NoContactNote>
                    No PR email or form on file yet — try Discover search or DM them.
                  </NoContactNote>
                )}
              </Actions>

              {/* Media kit nudge — smart states based on kit status */}
              {/* Use API response kit_published if available, fallback to profile */}
              {!loading && !(pitch?.kit_published ?? creatorProfile?.has_media_kit) && (
                <MediaKitNudgePulse>
                  <MediaKitNudgeIcon>✨</MediaKitNudgeIcon>
                  <MediaKitNudgeText>
                    <MediaKitNudgeTitle>Add your media kit link</MediaKitNudgeTitle>
                    <MediaKitNudgeSub>Brands check your best work before replying</MediaKitNudgeSub>
                  </MediaKitNudgeText>
                  <MediaKitNudgeBtnPulse onClick={() => { onClose(); navigate('/creator/dashboard/my-kit'); }}>
                    Build kit
                  </MediaKitNudgeBtnPulse>
                </MediaKitNudgePulse>
              )}
              {!loading && (pitch?.kit_published ?? creatorProfile?.has_media_kit) && (
                <MediaKitNudgeAttached>
                  <MediaKitNudgeIcon>✓</MediaKitNudgeIcon>
                  <MediaKitNudgeText>
                    <MediaKitNudgeTitle>Media kit attached</MediaKitNudgeTitle>
                    <MediaKitNudgeSub>
                      {(creatorProfile?.portfolio_post_count || 0) < 3
                        ? 'Add more posts to stand out even more'
                        : 'Your portfolio is included in this pitch'}
                    </MediaKitNudgeSub>
                  </MediaKitNudgeText>
                  {(creatorProfile?.portfolio_post_count || 0) < 6 && (
                    <MediaKitEnrichBtn onClick={() => { onClose(); navigate('/creator/dashboard/my-kit'); }}>
                      Enrich kit
                    </MediaKitEnrichBtn>
                  )}
                </MediaKitNudgeAttached>
              )}

              {/* Pool nudge — shown only if creator hasn't been active in pool recently */}
              {!loading && !hasRecentPoolActivity && (
                <PoolNudgeBanner onClick={() => { onClose(); navigate('/creator/dashboard/pool'); }}>
                  <PoolNudgeContent>
                    <PoolNudgeEmoji>🚀</PoolNudgeEmoji>
                    <PoolNudgeTextWrap>
                      <PoolNudgeTitle>Grow your followers while you wait</PoolNudgeTitle>
                      <PoolNudgeDesc>Join creators boosting each other in the Pool</PoolNudgeDesc>
                    </PoolNudgeTextWrap>
                  </PoolNudgeContent>
                  <PoolNudgeCTA>Boost my followers →</PoolNudgeCTA>
                </PoolNudgeBanner>
              )}

                          </>
          )}
            </>
          )}
        </Modal>
      </Overlay>

      {/* Unified upgrade modal — shown when user runs out of unlocks */}
      <UpgradeModal
        isOpen={showUpgradeOverlay}
        onClose={() => {
          setShowUpgradeOverlay(false);
          onClose();
        }}
        currentCount={pitchLimits.used}
        limit={pitchLimits.limit}
        pitchLimits={pitchLimits}
        resetAt={paywallData?.reset_at}
        feature="ai_pitch_modal"
      />
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
  background: rgba(18, 20, 26, 0.52);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
  font-family: ${tokens.fontSans};

  @media (max-width: 768px) {
    padding: 0;
    align-items: flex-end;
  }
`;

const Modal = styled(motion.div)`
  background: ${tokens.white};
  border-radius: 18px;
  max-width: 460px;
  width: 100%;
  max-height: 92vh;
  overflow-y: auto;
  position: relative;
  font-family: ${tokens.fontSans};
  box-shadow: 0 24px 80px rgba(18, 20, 26, 0.28);

  @media (max-width: 768px) {
    border-radius: 18px 18px 0 0;
    max-height: 94vh;
    max-width: 100%;
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
    padding: 16px 16px 10px;
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

const UnlockedStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: ${p => p.$wasAlreadyUnlocked ? '#F3F4F6' : '#F0FDF4'};
  color: ${p => p.$wasAlreadyUnlocked ? '#6B7280' : '#15803D'};
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  margin: 0 16px 12px;

  span {
    font-size: 14px;
  }
`;

// ── Tinder-style Unlock Celebration ─────────────────────────────
const UnlockCelebrationOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  padding: 20px;
`;

const UnlockCelebrationCard = styled(motion.div)`
  background: linear-gradient(135deg, #0F0F0F 0%, #1a1a2e 100%);
  border-radius: 28px;
  padding: 40px 32px 32px;
  text-align: center;
  max-width: 340px;
  width: 100%;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #10B981, #3B82F6, #8B5CF6, #EC4899);
  }
`;

const ConfettiContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
`;

const Confetti = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: ${p => ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444'][p.$angle / 30 % 6]};
  animation: confettiFall 1.5s ease-out forwards;
  animation-delay: ${p => p.$delay}s;
  transform: rotate(${p => p.$angle}deg);

  @keyframes confettiFall {
    0% {
      transform: translateY(0) rotate(0deg) scale(0);
      opacity: 1;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateY(${p => 80 + Math.random() * 60}px)
                 translateX(${p => (Math.cos(p.$angle * Math.PI / 180) * 120)}px)
                 rotate(${p => p.$angle + 360}deg)
                 scale(1);
      opacity: 0;
    }
  }
`;

const CelebrationIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10B981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
  animation: celebratePulse 0.6s ease-out;

  span {
    font-size: 40px;
    animation: celebrateBounce 0.5s ease-out 0.2s;
  }

  @keyframes celebratePulse {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes celebrateBounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
`;

const CelebrationTitle = styled.div`
  font-size: 24px;
  font-weight: 900;
  color: white;
  margin-bottom: 8px;
  animation: slideUp 0.5s ease-out 0.15s both;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const CelebrationBrandName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #10B981;
  margin-bottom: 20px;
  animation: slideUp 0.5s ease-out 0.3s both;
`;

const CelebrationDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
  animation: slideUp 0.5s ease-out 0.45s both;
`;

const CelebrationDetail = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);

  span {
    color: #10B981;
    font-weight: 700;
  }
`;

const CelebrationDismiss = styled.button`
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  animation: slideUp 0.5s ease-out 0.6s both, pulseBtn 2s ease-in-out 1.5s infinite;

  @keyframes pulseBtn {
    0%, 100% { box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3); }
    50% { box-shadow: 0 4px 24px rgba(16, 185, 129, 0.6); }
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
    animation: none;
  }
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
  padding: 40px 20px 48px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${tokens.paper};

  @media (max-width: 480px) {
    padding: 28px 16px 40px;
  }
`;

const LoadingEyebrow = styled.div`
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${tokens.accentDeep};
  margin-bottom: 1rem;
`;

const LoadingBrandIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 14px;
  background: ${tokens.white};
  border: 1px solid ${tokens.line};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 10px;
  }
`;

const LoadingBrandInitial = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #6B7280;
`;

const LoadingTitle = styled.div`
  font-size: 1.05rem;
  font-weight: 600;
  color: ${tokens.muted};
  margin-bottom: 24px;
  line-height: 1.35;
`;

const LoadingBrandName = styled.span`
  color: ${tokens.ink};
  font-weight: 700;
`;

const LoadingSteps = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 24px;
  width: 100%;
  max-width: 320px;
`;

const LoadingStepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: ${p => p.$active ? 1 : 0.4};
  transition: opacity 0.3s ease;
`;

const LoadingStepDot = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.3s ease;

  ${p => p.$complete ? `
    background: ${tokens.accent};
    color: white;
  ` : p.$active ? `
    background: ${tokens.action};
    color: white;
    animation: pulse 1.5s ease-in-out infinite;
  ` : `
    background: #E5E7EB;
    color: #9CA3AF;
  `}

  @keyframes pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(13, 122, 95, 0.25); }
    50% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(13, 122, 95, 0); }
  }
`;

const LoadingStepLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #6B7280;
  white-space: nowrap;
`;

const LoadingStepLine = styled.div`
  width: 32px;
  height: 2px;
  background: ${p => p.$complete ? tokens.accent : '#E5E7EB'};
  margin: 0 4px;
  margin-bottom: 24px;
  transition: background 0.3s ease;
`;

const LoadingSubtext = styled.div`
  font-size: 14px;
  color: #9CA3AF;
  animation: fadeInUp 0.3s ease;

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
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
  color: ${props => props.$masked ? '#9CA3AF' : '#111827'};
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: ${props => props.$masked ? 'monospace' : 'inherit'};
  letter-spacing: ${props => props.$masked ? '1px' : 'normal'};
`;

const EmailLockIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #FEF3C7;
  border-radius: 4px;
  color: #D97706;
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
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 12px 14px;
  }

  @media (max-width: 380px) {
    padding: 10px 12px;
  }
`;

const SendButton = styled(motion.button)`
  width: 100%;
  padding: 16px 24px;
  background: ${props => props.$isFollowup
    ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)'
    : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)'};
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
  box-shadow: ${props => props.$isFollowup
    ? '0 4px 14px rgba(245, 158, 11, 0.25)'
    : '0 4px 14px rgba(99, 102, 241, 0.25)'};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$isFollowup
      ? 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)'
      : 'linear-gradient(135deg, #818CF8 0%, #A78BFA 50%, #C084FC 100%)'};
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
    box-shadow: ${props => props.$isFollowup
      ? '0 8px 25px rgba(245, 158, 11, 0.35)'
      : '0 8px 25px rgba(99, 102, 241, 0.35)'};

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

  &:hover:not(:disabled) {
    background: #E5E7EB;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #F3F4F6;
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

const MediaKitCTA = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #EFF6FF, #F5F3FF);
  border-top: 1px solid #E5E7EB;

  svg {
    color: #3B82F6;
    font-size: 20px;
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
`;

const MediaKitCTAText = styled.div`
  flex: 1;
  font-size: 13px;
  color: #374151;

  strong {
    color: #1F2937;
  }
`;

const MediaKitCTAButton = styled.button`
  padding: 8px 16px;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
`;

const MediaKitLink = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #ECFDF5;
  border-top: 1px solid #E5E7EB;
  font-size: 13px;
  color: #059669;

  svg {
    flex-shrink: 0;
  }

  a {
    color: #059669;
    text-decoration: underline;
    word-break: break-all;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
`;

const CopyMediaKitButton = styled.button`
  padding: 4px 12px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-left: auto;

  &:hover {
    background: #047857;
  }

  @media (max-width: 480px) {
    margin-left: 0;
  }
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

// ── New styled components ─────────────────────────────────────

const BrandMeta = styled.div`
  font-size: 12px;
  color: #6B7280;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
`;

const MatchChip = styled.span`
  background: ${p => p.score >= 80 ? '#D1FAE5' : p.score >= 60 ? '#FEF3C7' : '#F3F4F6'};
  color: ${p => p.score >= 80 ? '#065F46' : p.score >= 60 ? '#92400E' : '#6B7280'};
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
`;

const FlowTabs = styled.div`
  display: flex;
  margin: 0 24px 12px;
  background: #F3F4F6;
  border-radius: 12px;
  padding: 3px;
  gap: 2px;
  @media (max-width: 768px) { margin: 0 16px 10px; }
`;

const FlowTab = styled.button`
  flex: 1;
  padding: 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  background: ${p => p.active ? '#fff' : 'transparent'};
  color: ${p => p.active ? '#0F0F0F' : '#9CA3AF'};
  box-shadow: ${p => p.active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'};
`;

const EmailFieldRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid #F3F4F6;
  background: #fff;
  &:last-child { border-bottom: none; }
`;

const FieldLabel = styled.span`
  font-size: 11.5px;
  font-weight: 700;
  color: #9CA3AF;
  width: 52px;
  flex-shrink: 0;
`;

const FieldValue = styled.span`
  font-size: 13px;
  color: ${p => p.$masked ? '#9CA3AF' : '#0F0F0F'};
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: ${p => p.$masked ? '0.5px' : 'normal'};
`;

const LockIcon = styled.span`
  font-size: 11px;
  opacity: 0.7;
`;

const SubjectInput = styled.input`
  flex: 1;
  font-size: 13px;
  color: #0F0F0F;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
`;

const PitchBodyWrap = styled.div`
  margin: 10px 24px 0;
  border: 1.5px solid #E5E7EB;
  border-radius: 14px;
  overflow: hidden;
  @media (max-width: 768px) { margin: 10px 16px 0; }
`;

const PitchBodyHeader = styled.div`
  padding: 8px 14px 6px;
  font-size: 10px;
  font-weight: 700;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  border-bottom: 1px solid #F9FAFB;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const EditHint = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${tokens.accentDeep};
  background: ${tokens.accentSoft};
  padding: 2px 8px;
  border-radius: 6px;
`;

const PitchTextarea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  font-size: 13px;
  color: #374151;
  line-height: 1.6;
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
  background: #fff;
  min-height: 160px;
  max-height: 220px;

  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 12px;
    min-height: 120px;
    max-height: 160px;
  }
`;

const PersonalizationBar = styled.div`
  margin: 10px 24px 0;
  background: #F0FDF4;
  border: 1px solid #A7F3D0;
  border-radius: 11px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    margin: 8px 16px 0;
    padding: 6px 10px;
    gap: 6px;
  }
`;

const PersonalizationLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #059669;
  white-space: nowrap;
`;

const PersonalizationTags = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const PersonalizationTag = styled.span`
  font-size: 10.5px;
  font-weight: 600;
  color: #065F46;
  background: #D1FAE5;
  padding: 2px 8px;
  border-radius: 8px;
  text-transform: capitalize;
`;

const PrimaryBtn = styled.button`
  width: 100%;
  padding: 15px 20px;
  background: ${tokens.action};
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, transform 0.1s;
  box-sizing: border-box;
  font-family: ${tokens.fontSans};
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:hover:not(:disabled) { background: ${tokens.actionHover}; }
  &:active:not(:disabled) { transform: scale(0.98); }

  @media (max-width: 768px) {
    padding: 15px 16px;
    font-size: 1rem;
  }
`;

const SecondaryRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const SecondaryBtn = styled.button`
  flex: 1;
  padding: 10px;
  background: ${tokens.white};
  border: 1px solid #ebebeb;
  color: ${tokens.ink};
  font-size: 12.5px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  &:hover { background: ${tokens.paper}; border-color: ${tokens.accentBorder}; }

  @media (max-width: 768px) {
    padding: 9px 8px;
    font-size: 12px;
    border-radius: 10px;
  }
`;

const NoContactNote = styled.div`
  padding: 13px 16px;
  background: #FEF3C7;
  color: #92400E;
  border-radius: 12px;
  font-size: 13px;
  text-align: center;
`;

const FormSubmitNote = styled.div`
  margin: 0 24px 12px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  font-size: 0.86rem;
  color: #7c4a1a;
  line-height: 1.45;
  text-align: left;

  strong {
    display: block;
    color: #b45309;
    margin-bottom: 0.2rem;
    font-weight: 700;
  }

  @media (max-width: 768px) {
    margin: 0 16px 10px;
    font-size: 0.82rem;
  }
`;

const PkgBody = styled.div`
  padding: 0 20px 8px;

  @media (max-width: 768px) {
    padding: 0 16px 8px;
  }
`;

const PkgPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 0.75rem;
`;

const PkgPill = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.22rem 0.5rem;
  border-radius: 6px;
  background: ${p => (
    p.$tone === 'ok' ? tokens.accentSoft :
    p.$tone === 'email' ? '#fef3c7' :
    p.$tone === 'form' ? '#eff6ff' :
    p.$tone === 'gift' ? '#fce7f3' :
    '#f4f4f4'
  )};
  color: ${p => (
    p.$tone === 'ok' ? tokens.accentDeep :
    p.$tone === 'email' ? '#92400e' :
    p.$tone === 'form' ? '#1d4ed8' :
    p.$tone === 'gift' ? '#9d174d' :
    '#444'
  )};
`;

const MatchBox = styled.div`
  background: ${tokens.accentSoft};
  border-radius: 12px;
  padding: 0.8rem 0.95rem;
  margin-bottom: 0.75rem;
`;

const MatchBoxTitle = styled.div`
  color: ${tokens.accentDeep};
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
`;

const MatchBoxBody = styled.p`
  margin: 0;
  font-size: 0.88rem;
  color: #1f4d3f;
  line-height: 1.45;
`;

const InfoBlock = styled.div`
  background: ${tokens.paper};
  border-radius: 12px;
  padding: 0.85rem 0.95rem;
  margin-bottom: 0.65rem;
`;

const InfoLabel = styled.div`
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #888;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-weight: 600;
  font-size: 0.98rem;
  color: ${tokens.ink};
  word-break: break-all;
  line-height: 1.35;
`;

const InfoMeta = styled.div`
  font-size: 0.75rem;
  color: ${tokens.muted};
  margin-top: 0.25rem;
`;

const FlagBtn = styled.button`
  flex-shrink: 0;
  border: none;
  background: transparent;
  padding: 0.3rem;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.15s ease;
  margin-left: auto;

  &:hover {
    color: #ef4444;
    background: #fef2f2;
  }
`;

const FormTip = styled.div`
  margin-top: 10px;
  padding: 10px 14px;
  background: ${tokens.accentSoft};
  border: 1px solid ${tokens.accentBorder};
  border-radius: 10px;
  font-size: 13px;
  color: ${tokens.accentDeep};
  text-align: center;
  line-height: 1.4;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 8px 10px;
    margin-top: 8px;
  }

  @media (max-width: 380px) {
    font-size: 11px;
    padding: 8px;
  }
`;

const MethodCaption = styled.div`
  font-size: 12px;
  color: #6B7280;
  text-align: center;
  margin-top: 6px;
`;

const MediaKitNudgePulse = styled.div`
  margin: 12px 24px 20px;
  background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
  border-radius: 13px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: pulseGlow 2s ease-in-out infinite;

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4); }
    50% { box-shadow: 0 0 0 8px rgba(124, 58, 237, 0); }
  }

  @media (max-width: 768px) {
    margin: 10px 16px 16px;
    padding: 12px 14px;
    gap: 10px;
    border-radius: 11px;
  }
`;

const MediaKitNudgeAttached = styled.div`
  margin: 12px 24px 20px;
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  border-radius: 13px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    margin: 10px 16px 16px;
    padding: 10px 12px;
    gap: 8px;
    border-radius: 11px;
  }
`;

const MediaKitNudgeIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;

  ${MediaKitNudgePulse} & {
    background: rgba(255, 255, 255, 0.2);
  }

  ${MediaKitNudgeAttached} & {
    background: #10B981;
    color: white;
    font-weight: 700;
    font-size: 12px;
  }
`;

const MediaKitNudgeText = styled.div`
  flex: 1;

  ${MediaKitNudgePulse} & {
    color: white;
  }
`;

const MediaKitNudgeTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: inherit;

  ${MediaKitNudgePulse} & {
    color: white;
  }

  ${MediaKitNudgeAttached} & {
    color: #065F46;
  }
`;

const MediaKitNudgeSub = styled.div`
  font-size: 11px;
  margin-top: 1px;

  ${MediaKitNudgePulse} & {
    color: rgba(255, 255, 255, 0.85);
  }

  ${MediaKitNudgeAttached} & {
    color: #6B7280;
  }
`;

const MediaKitNudgeBtnPulse = styled.button`
  background: white;
  color: #7C3AED;
  font-size: 11px;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const MediaKitEnrichBtn = styled.button`
  background: #10B981;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 7px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: #059669;
  }
`;

// ── Pool nudge banner (viral, exciting design) ──
const PoolNudgeBanner = styled.div`
  margin: 0 24px 16px;
  padding: 16px;
  background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
  }

  @media (max-width: 768px) {
    margin: 0 16px 12px;
    padding: 14px;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`;

const PoolNudgeContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

const PoolNudgeEmoji = styled.span`
  font-size: 20px;
  flex-shrink: 0;
`;

const PoolNudgeTextWrap = styled.div`
  flex: 1;
`;

const PoolNudgeTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: white;
  line-height: 1.3;
`;

const PoolNudgeDesc = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 2px;
`;

const PoolNudgeCTA = styled.span`
  background: white;
  color: #7C3AED;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.02);
  }

  @media (max-width: 768px) {
    text-align: center;
    padding: 10px 14px;
  }
`;

// ── Success screen ─────────────────────────────────────────────

const SuccessScreen = styled.div`
  padding-bottom: 24px;
`;

const SuccessHero = styled.div`
  padding: 32px 24px 20px;
  text-align: center;
`;

const SuccessIconWrap = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #D1FAE5;
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 14px;
`;

const SuccessTitle = styled.div`
  font-size: 20px;
  font-weight: 900;
  color: #0F0F0F;
  margin-bottom: 6px;
`;

const SuccessSub = styled.div`
  font-size: 13px;
  color: #6B7280;
  line-height: 1.5;
`;

const SuccessPipelineCard = styled.div`
  margin: 0 24px 14px;
  background: #F0FDF4;
  border: 1.5px solid #A7F3D0;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  @media (max-width: 768px) { margin: 0 16px 14px; }
`;

const SuccessBrandLogo = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: linear-gradient(135deg, #5B21B6, #7C3AED);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: #fff;
  font-size: 16px;
  flex-shrink: 0;
  overflow: hidden;
`;

const SuccessPipelineInfo = styled.div`
  flex: 1;
`;

const SuccessPipelineBrand = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #0F0F0F;
`;

const SuccessPipelineMeta = styled.div`
  font-size: 11.5px;
  color: #059669;
  font-weight: 600;
  margin-top: 2px;
`;

const SuccessWindowBadge = styled.div`
  background: #D1FAE5;
  border-radius: 10px;
  padding: 8px 12px;
  text-align: center;
  flex-shrink: 0;
`;

const SuccessWindowDays = styled.div`
  font-size: 20px;
  font-weight: 900;
  color: #059669;
  line-height: 1;
`;

const SuccessWindowLabel = styled.div`
  font-size: 9px;
  color: #065F46;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-top: 2px;
`;

const SuccessTips = styled.div`
  margin: 0 24px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  @media (max-width: 768px) { margin: 0 16px 14px; }
`;

const SuccessTip = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #F9FAFB;
  border-radius: 12px;
  padding: 12px 13px;
`;

const SuccessTipIcon = styled.div`
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
  color: #6B7280;
`;

const SuccessTipText = styled.div`
  font-size: 12.5px;
  color: #374151;
  line-height: 1.5;
  strong { color: #0F0F0F; }
`;

const SuccessKitNudge = styled.div`
  margin: 0 24px 16px;
  background: #0F0F0F;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  @media (max-width: 768px) { margin: 0 16px 16px; }
`;

const SuccessKitText = styled.div`
  flex: 1;
`;

const SuccessKitTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 3px;
`;

const SuccessKitSub = styled.div`
  font-size: 11px;
  color: #9CA3AF;
`;

const SuccessKitBtn = styled.button`
  background: #fff;
  color: #0F0F0F;
  font-size: 12px;
  font-weight: 800;
  padding: 9px 14px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
`;

// Pool nudge in success screen
const SuccessPoolNudge = styled.div`
  margin: 0 24px 16px;
  background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
  }

  @media (max-width: 768px) { margin: 0 16px 16px; }
`;

const SuccessPoolText = styled.div`
  flex: 1;
`;

const SuccessPoolTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin-bottom: 2px;
`;

const SuccessPoolSub = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
`;

const SuccessPoolBtn = styled.span`
  background: white;
  color: #7C3AED;
  font-size: 12px;
  font-weight: 700;
  padding: 9px 14px;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
`;

const SuccessActions = styled.div`
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  @media (max-width: 768px) { padding: 0 16px; }
`;

const SuccessSecondaryBtn = styled.button`
  width: 100%;
  padding: 11px;
  background: transparent;
  color: #6B7280;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  text-align: center;
`;

export default AIPitchModal;
