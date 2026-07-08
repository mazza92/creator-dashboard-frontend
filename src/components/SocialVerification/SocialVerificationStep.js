import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaInstagram, FaTiktok } from 'react-icons/fa6';
import { HiCheckCircle, HiXCircle, HiExclamationTriangle } from 'react-icons/hi2';
import { apiClient } from '../../utils/api';

// ============================================================================
// COLORS & DESIGN TOKENS
// ============================================================================
const colors = {
  rose: '#E11D48',
  black: '#0F0F0F',
  violet: '#7C3AED',
  green: '#059669',
  amber: '#D97706',
  border: '#EBEBEB',
  text: '#0F0F0F',
  text2: '#5A5A5A',
  text3: '#A0A0A0',
  instagram: '#E1306C',
  tiktok: '#000000',
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================
const Container = styled.div`
  width: 100%;
`;

const Headline = styled.h2`
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
  color: ${colors.black};
  text-align: center;
`;

const Subline = styled.p`
  font-size: 14px;
  color: ${colors.text2};
  line-height: 1.6;
  margin-bottom: 24px;
  text-align: center;
`;

const PlatformTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const PlatformTab = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.$active && props.$platform === 'instagram' && `
    background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
    color: white;
    border: none;
  `}

  ${props => props.$active && props.$platform === 'tiktok' && `
    background: ${colors.black};
    color: white;
    border: none;
  `}

  ${props => !props.$active && `
    background: white;
    color: ${colors.text2};
    border: 1.5px solid ${colors.border};
    &:hover { border-color: ${colors.text3}; }
  `}

  svg { font-size: 18px; }
`;

const ConnectButton = styled.button`
  width: 100%;
  padding: 16px 24px;
  background: ${colors.black};
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;

  &:hover:not(:disabled) { background: #222; }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TrustBullets = styled.div`
  background: #F8F8F8;
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 20px;
`;

const TrustTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: ${colors.text3};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
`;

const TrustItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: ${colors.text2};
  margin-bottom: 8px;
  line-height: 1.5;

  &:last-child { margin-bottom: 0; }

  &::before {
    content: '✓';
    color: ${colors.green};
    font-weight: bold;
  }
`;

const SkipLink = styled.button`
  display: block;
  width: 100%;
  padding: 12px;
  background: none;
  border: none;
  font-size: 13px;
  color: ${colors.text3};
  cursor: pointer;
  text-align: center;
  font-family: 'Inter', sans-serif;

  &:hover { color: ${colors.text2}; text-decoration: underline; }
`;

// Loading Screen
const LoadingWrap = styled.div`
  text-align: center;
  padding: 20px 0;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid ${colors.border};
  border-top-color: ${colors.black};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 8px;
`;

const LoadingSubtext = styled.div`
  font-size: 13px;
  color: ${colors.text3};
`;

// Success Screen
const SuccessWrap = styled.div`
  text-align: center;
  padding: 10px 0;
`;

const SuccessIcon = styled.div`
  font-size: 64px;
  color: ${colors.green};
  margin-bottom: 16px;
`;

const SuccessHandle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 4px;
`;

const SuccessStats = styled.div`
  font-size: 13px;
  color: ${colors.text3};
  margin-bottom: 20px;
`;

const ContinueButton = styled.button`
  width: 100%;
  padding: 16px 24px;
  background: ${colors.black};
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: #222; }
`;

// Failure Screen
const FailureWrap = styled.div`
  text-align: center;
  padding: 10px 0;
`;

const FailureIcon = styled.div`
  font-size: 56px;
  color: ${props => props.$blocked ? colors.rose : colors.amber};
  margin-bottom: 16px;
`;

const FailureTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.text};
  margin-bottom: 10px;
`;

const FailureMessage = styled.div`
  font-size: 14px;
  color: ${colors.text2};
  line-height: 1.6;
  margin-bottom: 20px;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 14px 24px;
  background: ${props => props.$secondary ? 'white' : colors.black};
  color: ${props => props.$secondary ? colors.text : 'white'};
  border: ${props => props.$secondary ? `1.5px solid ${colors.border}` : 'none'};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 10px;

  &:hover {
    background: ${props => props.$secondary ? '#F8F8F8' : '#222'};
  }
`;

const ErrorText = styled.div`
  color: ${colors.rose};
  font-size: 13px;
  margin-top: 8px;
  margin-bottom: 8px;
`;

// ============================================================================
// FAILURE REASON MESSAGES
// ============================================================================
const FAILURE_MESSAGES = {
  restricted_region: {
    title: 'newcollab isn\'t available in your region yet',
    message: 'We\'re currently focused on serving creators in select markets. We appreciate your interest and hope to expand to your region soon.',
    blocked: true,
    actions: ['home']
  },
  private: {
    title: 'Your account is set to private',
    message: 'Brands need to see your content before working with you. Switch your account to public and try again.',
    blocked: false,
    actions: ['recheck', 'try_other']
  },
  below_follower_min: {
    title: 'You need at least 500 followers',
    message: 'Keep growing your audience! Once you reach 500 followers, come back and connect your account.',
    blocked: false,
    actions: ['browse', 'profile']
  },
  below_post_min: {
    title: 'You need at least 5 posts',
    message: 'Brands want to see your content style. Post a few more times, then come back and try again.',
    blocked: false,
    actions: ['recheck', 'try_other']
  },
  profile_not_found: {
    title: 'Account not found',
    message: 'We couldn\'t find that username. Double-check the spelling and make sure your account is public.',
    blocked: false,
    actions: ['recheck']
  },
  oauth_error: {
    title: 'Connection failed',
    message: 'We couldn\'t connect to your account. This can happen if you cancelled the authorization or there was a technical issue. Please try again.',
    blocked: false,
    actions: ['retry', 'try_other']
  },
  fetch_error: {
    title: 'Verification failed',
    message: 'Something went wrong while checking your account. Please try again.',
    blocked: false,
    actions: ['retry']
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const SocialVerificationStep = ({
  onSuccess,
  onSkip,
  isGrandfathered = false,
  grandfatheredUntil = null
}) => {
  const [screen, setScreen] = useState('connect'); // 'connect' | 'loading' | 'success' | 'failure'
  const [platform, setPlatform] = useState('instagram');
  const [verifiedHandle, setVerifiedHandle] = useState(null);
  const [stats, setStats] = useState(null);
  const [failureReason, setFailureReason] = useState(null);
  const [isCheckingRegion, setIsCheckingRegion] = useState(true);
  const [regionBlocked, setRegionBlocked] = useState(false);
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Check URL params for OAuth callback result and region on mount
  useEffect(() => {
    handleOAuthCallback();
    checkRegion();
  }, []);

  // Handle OAuth callback from URL params
  const handleOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const socialStatus = urlParams.get('social');
    const oauthPlatform = urlParams.get('platform');
    const handle = urlParams.get('handle');
    const reason = urlParams.get('reason');

    if (socialStatus === 'success' && handle) {
      // OAuth succeeded - show success screen
      setVerifiedHandle(handle);
      setPlatform(oauthPlatform || 'instagram');
      // Fetch stats from the API since OAuth callback doesn't include them in URL
      fetchVerificationStatus();
      setScreen('success');
      // Clean up URL params
      window.history.replaceState({}, '', window.location.pathname);
    } else if (socialStatus === 'failed') {
      // OAuth failed - show failure screen
      setPlatform(oauthPlatform || 'instagram');
      setFailureReason(reason || 'oauth_error');
      setScreen('failure');
      // Clean up URL params
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  // Fetch verification status to get stats after OAuth success
  const fetchVerificationStatus = async () => {
    try {
      const res = await apiClient.get('/api/social/status');
      if (res.data) {
        setStats({
          followers: res.data.follower_count,
          posts: res.data.media_count
        });
      }
    } catch (err) {
      console.error('Error fetching verification status:', err);
    }
  };

  const checkRegion = async () => {
    try {
      const res = await apiClient.get('/api/social/check-region');
      if (!res.data.allowed) {
        setRegionBlocked(true);
        setFailureReason('restricted_region');
        setScreen('failure');
      }
    } catch (err) {
      console.error('Error checking region:', err);
    } finally {
      setIsCheckingRegion(false);
    }
  };

  const handleVerify = () => {
    // Redirect to OAuth flow - the backend will handle verification
    setIsVerifying(true);

    // Get the API base URL for OAuth redirect
    const apiBase = process.env.REACT_APP_API_BASE || 'https://api.newcollab.co';

    if (platform === 'instagram') {
      window.location.href = `${apiBase}/api/social/connect/instagram`;
    } else if (platform === 'tiktok') {
      window.location.href = `${apiBase}/api/social/connect/tiktok`;
    }
  };

  const handleRetry = () => {
    setScreen('connect');
    setFailureReason(null);
    setError(null);
  };

  const handleTryOther = () => {
    setPlatform(platform === 'instagram' ? 'tiktok' : 'instagram');
    setScreen('connect');
    setFailureReason(null);
    setError(null);
  };

  const handleContinue = () => {
    if (onSuccess) {
      onSuccess({ platform, handle: verifiedHandle, stats });
    }
  };

  const handleSkipClick = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const handleBrowse = () => {
    window.location.href = '/creator/dashboard/brands';
  };

  const handleProfile = () => {
    window.location.href = '/creator/dashboard/profile';
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  // Loading state
  if (isCheckingRegion) {
    return (
      <Container>
        <LoadingWrap>
          <LoadingSpinner />
          <LoadingText>Checking eligibility...</LoadingText>
        </LoadingWrap>
      </Container>
    );
  }

  // Connect Screen
  if (screen === 'connect') {
    return (
      <Container>
        <Headline>Verify your creator account</Headline>
        <Subline>
          Connect your {platform === 'instagram' ? 'Instagram' : 'TikTok'} account
          to verify your audience and unlock pitching.
        </Subline>

        <PlatformTabs>
          <PlatformTab
            $platform="instagram"
            $active={platform === 'instagram'}
            onClick={() => { setPlatform('instagram'); setError(null); }}
          >
            <FaInstagram /> Instagram
          </PlatformTab>
          <PlatformTab
            $platform="tiktok"
            $active={platform === 'tiktok'}
            onClick={() => { setPlatform('tiktok'); setError(null); }}
          >
            <FaTiktok /> TikTok
          </PlatformTab>
        </PlatformTabs>

        {error && <ErrorText>{error}</ErrorText>}

        <ConnectButton
          onClick={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? 'Connecting...' : `Connect ${platform === 'instagram' ? 'Instagram' : 'TikTok'}`}
        </ConnectButton>

        <TrustBullets>
          <TrustTitle>What we check</TrustTitle>
          <TrustItem>Account is public (not private)</TrustItem>
          <TrustItem>At least 500 followers</TrustItem>
          <TrustItem>At least 5 posts/videos</TrustItem>
          <TrustItem>We never post or access your DMs</TrustItem>
        </TrustBullets>

        {isGrandfathered && grandfatheredUntil && (
          <SkipLink onClick={handleSkipClick}>
            Skip for now (required by {new Date(grandfatheredUntil).toLocaleDateString()})
          </SkipLink>
        )}
      </Container>
    );
  }

  // Loading Screen (shown while redirecting to OAuth)
  if (screen === 'loading') {
    return (
      <Container>
        <LoadingWrap>
          <LoadingSpinner />
          <LoadingText>Connecting to {platform === 'instagram' ? 'Instagram' : 'TikTok'}...</LoadingText>
          <LoadingSubtext>You'll be redirected to authorize</LoadingSubtext>
        </LoadingWrap>
      </Container>
    );
  }

  // Success Screen
  if (screen === 'success') {
    return (
      <Container>
        <SuccessWrap>
          <SuccessIcon>
            <HiCheckCircle />
          </SuccessIcon>
          <Headline>Verified!</Headline>
          <SuccessHandle>@{verifiedHandle}</SuccessHandle>
          {stats && (
            <SuccessStats>
              {stats.followers?.toLocaleString()} followers · {stats.posts?.toLocaleString()} {platform === 'tiktok' ? 'videos' : 'posts'}
            </SuccessStats>
          )}
          <Subline>
            You're ready to start pitching brands. You have 5 free PR Packages this month.
          </Subline>
          <ContinueButton onClick={handleContinue}>
            Continue
          </ContinueButton>
        </SuccessWrap>
      </Container>
    );
  }

  // Failure Screen
  if (screen === 'failure') {
    const failure = FAILURE_MESSAGES[failureReason] || FAILURE_MESSAGES.fetch_error;

    return (
      <Container>
        <FailureWrap>
          <FailureIcon $blocked={failure.blocked}>
            {failure.blocked ? <HiXCircle /> : <HiExclamationTriangle />}
          </FailureIcon>
          <FailureTitle>{failure.title}</FailureTitle>
          <FailureMessage>{failure.message}</FailureMessage>

          {failure.actions.includes('recheck') && (
            <ActionButton onClick={handleRetry}>
              Try again
            </ActionButton>
          )}
          {failure.actions.includes('retry') && (
            <ActionButton onClick={handleRetry}>
              Try again
            </ActionButton>
          )}
          {failure.actions.includes('try_other') && (
            <ActionButton $secondary onClick={handleTryOther}>
              Try {platform === 'instagram' ? 'TikTok' : 'Instagram'} instead
            </ActionButton>
          )}
          {failure.actions.includes('browse') && (
            <ActionButton onClick={handleBrowse}>
              Browse brands anyway
            </ActionButton>
          )}
          {failure.actions.includes('profile') && (
            <ActionButton $secondary onClick={handleProfile}>
              Complete your profile
            </ActionButton>
          )}
          {failure.actions.includes('home') && (
            <ActionButton $secondary onClick={handleGoHome}>
              ← Back to Home
            </ActionButton>
          )}

          {!failure.blocked && isGrandfathered && (
            <SkipLink onClick={handleSkipClick}>
              Skip verification for now
            </SkipLink>
          )}
        </FailureWrap>
      </Container>
    );
  }

  return null;
};

export default SocialVerificationStep;
