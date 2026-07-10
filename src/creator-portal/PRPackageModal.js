import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCopy, FiCheck, FiClock, FiArrowRight, FiLock, FiExternalLink, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api';
import { message } from 'antd';
import UpgradeModal from './UpgradeModal';

/**
 * PR Package Modal - Complete PR Package with 6 sections:
 * 1. Verified PR contact
 * 2. Pitch in 3 tones (Short, Growing, Founder)
 * 3. Optimal send timing
 * 4. Content Playbook (5 ideas) - Pro
 * 5. Follow-up sequence (Day 3, 8, 14) - Pro
 * 6. Reply prediction - Pro personalized
 */

const PRPackageModal = ({
  isOpen,
  onClose,
  brand,
  onPitchSent,
  creatorProfile,
  isPro = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [packageData, setPackageData] = useState(null);
  const [brandEmail, setBrandEmail] = useState(null);
  const [applicationUrl, setApplicationUrl] = useState(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // UI state
  const [selectedTone, setSelectedTone] = useState('growing');
  const [copiedField, setCopiedField] = useState(null);
  const [animationStep, setAnimationStep] = useState(0);
  const [showAnimation, setShowAnimation] = useState(true);

  const navigate = useNavigate();

  // Check if creator has a published media kit
  // API response may include kit_published, fallback to creatorProfile.has_media_kit
  const hasPublishedKit = packageData?.kit_published ?? creatorProfile?.has_media_kit ?? false;

  // Handle upgrade to Pro via Stripe checkout
  const handleUpgradeClick = async () => {
    try {
      setUpgradeLoading(true);
      const response = await apiClient.post('/api/subscription/create-checkout', { tier: 'pro' });
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
      setUpgradeLoading(false);
    }
  };

  // Animation steps with emotional copy
  const ANIMATION_STEPS = [
    { text: `Finding ${brand?.brand_name || brand?.name || 'brand'}'s inbox...`, sub: 'Verified contact from our directory' },
    { text: 'Writing your pitch (3 tones)...', sub: 'Written for your voice, not a template' },
    { text: 'Planning content that gets you noticed...', sub: 'Content brands actually check before replying' },
    { text: 'Preparing your follow-up strategy...', sub: 'Because one message rarely lands the deal' },
    { text: 'Package ready', sub: 'Everything you need, in one place', done: true },
  ];

  // Generate PR Package
  const generatePackage = useCallback(async () => {
    if (!brand) return;

    setLoading(true);
    setError(null);
    setShowAnimation(true);
    setAnimationStep(0);

    // Start animation sequence - but DON'T go to final "Package ready" step until API completes
    // This prevents users from seeing "Package ready" while still waiting
    const animationInterval = setInterval(() => {
      setAnimationStep(prev => {
        // Stop at step 3 (index 3 = "Preparing your follow-up strategy"), don't go to "Package ready" (index 4)
        if (prev < ANIMATION_STEPS.length - 2) return prev + 1;
        return prev; // Stay on step 3 until API completes
      });
    }, 1200);

    try {
      // Use brand_id if available (from pipeline), otherwise fall back to id (from brand discovery)
      const response = await apiClient.post('/api/pr-crm/generate-pr-package', {
        brand_id: brand.brand_id || brand.id,
        slug: brand.slug,
      });

      clearInterval(animationInterval);

      if (response.data.success) {
        setPackageData(response.data.package);
        setBrandEmail(response.data.brand_email);
        setApplicationUrl(response.data.application_form_url);

        // NOW show "Package ready" step
        setAnimationStep(ANIMATION_STEPS.length - 1);

        // Brief pause to show "Package ready" then reveal content
        setTimeout(() => {
          setShowAnimation(false);
        }, 600);
      } else {
        setError(response.data.error || 'Failed to generate PR Package');
        setShowAnimation(false);
      }
    } catch (err) {
      clearInterval(animationInterval);
      console.error('PR Package error:', err);

      if (err.response?.status === 402) {
        // Paywall triggered - show upgrade modal
        setShowPaywall(true);
        setShowAnimation(false);
      } else {
        // Media kit enforcement removed - let users try the feature
        // Backend should also be updated to remove the media_kit_required check
        setError(err.response?.data?.error || 'Failed to generate PR Package');
        setShowAnimation(false);
      }
    } finally {
      setLoading(false);
    }
  }, [brand]);

  useEffect(() => {
    if (isOpen && brand) {
      generatePackage();
    }
  }, [isOpen, brand, generatePackage]);

  // Copy to clipboard
  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Get current pitch based on selected tone
  const getCurrentPitch = () => {
    if (!packageData?.pitches) return null;
    return packageData.pitches[selectedTone] || packageData.pitches.growing;
  };

  // Open email client with pitch
  const handleSendPitch = () => {
    const pitch = getCurrentPitch();
    if (!pitch || !brandEmail) return;

    const subject = encodeURIComponent(pitch.subject || '');
    const body = encodeURIComponent(pitch.body_plain || '');
    const mailtoUrl = `mailto:${brandEmail}?subject=${subject}&body=${body}`;

    window.open(mailtoUrl, '_blank');

    if (onPitchSent) {
      onPitchSent({
        brand,
        tone: selectedTone,
        subject: pitch.subject,
      });
    }
  };

  if (!isOpen) return null;

  const pitch = getCurrentPitch();
  const brandName = brand?.brand_name || brand?.name || 'Brand';

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <Modal
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <ModalHeader>
            {(brand?.logo_url || brand?.logo) ? (
              <BrandLogoImg src={brand.logo_url || brand.logo} alt={brandName} />
            ) : (
              <BrandLogo $color={brand?.logo_color || '#f4b400'}>
                {brandName.charAt(0).toUpperCase()}
              </BrandLogo>
            )}
            <BrandMeta>
              <BrandName>{brandName}</BrandName>
              <BrandRow>
                <BrandCategory>{brand?.category || 'Brand'}</BrandCategory>
                {brand?.match_score && (
                  <MatchBadge>{brand.match_score}% match</MatchBadge>
                )}
              </BrandRow>
            </BrandMeta>
            <CloseButton onClick={onClose}>
              <FiX />
            </CloseButton>
          </ModalHeader>

          {/* Loading Animation */}
          {showAnimation && (
            <AnimationContainer>
              <AnimationSteps>
                {ANIMATION_STEPS.map((step, idx) => (
                  <AnimationStep
                    key={idx}
                    $active={animationStep >= idx}
                    $current={animationStep === idx}
                    $done={step.done && animationStep === idx}
                  >
                    <StepIndicator $active={animationStep >= idx} $done={step.done && animationStep === idx}>
                      {animationStep > idx || (step.done && animationStep === idx) ? (
                        <FiCheck size={12} />
                      ) : (
                        <StepDot $active={animationStep === idx} />
                      )}
                    </StepIndicator>
                    <StepContent>
                      <StepText $active={animationStep >= idx}>{step.text}</StepText>
                      {animationStep === idx && (
                        <StepSub
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {step.sub}
                        </StepSub>
                      )}
                    </StepContent>
                  </AnimationStep>
                ))}
              </AnimationSteps>
            </AnimationContainer>
          )}

          {/* Error State */}
          {error && !showAnimation && (
            <ErrorContainer>
              <ErrorText>{error}</ErrorText>
              <RetryButton onClick={generatePackage}>Try Again</RetryButton>
            </ErrorContainer>
          )}

          {/* Package Content */}
          {packageData && !showAnimation && !error && (
            <>
              <UnlockedRibbon>
                <FiCheck /> Your PR Package is ready
              </UnlockedRibbon>

              <PackageContent>
                {/* Section 1: Verified PR Contact */}
                <PackageSection>
                  <SectionHeader>
                    <SectionNumber>1</SectionNumber>
                    <SectionTitle>Verified PR contact</SectionTitle>
                    <VerifiedBadge><FiCheck size={10} /> Verified</VerifiedBadge>
                  </SectionHeader>
                  <ContactCard>
                    <ContactEmail>{brandEmail || 'Loading...'}</ContactEmail>
                    <CopyButton
                      onClick={() => copyToClipboard(brandEmail, 'email')}
                      $copied={copiedField === 'email'}
                    >
                      {copiedField === 'email' ? <FiCheck /> : <FiCopy />}
                      {copiedField === 'email' ? 'Copied' : 'Copy'}
                    </CopyButton>
                  </ContactCard>
                  {applicationUrl && (
                    <ApplicationLink href={applicationUrl} target="_blank" rel="noopener noreferrer">
                      <FiExternalLink size={12} /> Application form available
                    </ApplicationLink>
                  )}
                </PackageSection>

                {/* Section 2: Pitch Composer */}
                <PackageSection>
                  <SectionHeader>
                    <SectionNumber>2</SectionNumber>
                    <SectionTitle>Your pitch, ready to send</SectionTitle>
                    <SectionSub>3 tones</SectionSub>
                  </SectionHeader>

                  <ToneToggle>
                    {['short', 'growing', 'founder'].map(tone => (
                      <ToneButton
                        key={tone}
                        $active={selectedTone === tone}
                        onClick={() => setSelectedTone(tone)}
                      >
                        {tone === 'short' ? 'Short' : tone === 'growing' ? 'Growing' : 'Founder-tone'}
                      </ToneButton>
                    ))}
                  </ToneToggle>

                  <PitchComposer key={`pitch-${selectedTone}`}>
                    <FieldLine>
                      <FieldLabel>To</FieldLabel>
                      <FieldValue>{brandEmail}</FieldValue>
                    </FieldLine>
                    <FieldLine $subject>
                      <FieldLabel>Subject</FieldLabel>
                      <FieldValue $bold>{pitch?.subject || 'Loading...'}</FieldValue>
                    </FieldLine>
                    <PitchBody>
                      {pitch?.body_plain ? (
                        pitch.body_plain.split('\n\n').map((para, idx) => (
                          <p key={idx}>{para}</p>
                        ))
                      ) : (
                        <p>Loading pitch content...</p>
                      )}
                      <PitchFade />
                    </PitchBody>
                  </PitchComposer>

                  {hasPublishedKit ? (
                    <KitAttached>
                      <FiCheck /> Media kit auto-attached
                    </KitAttached>
                  ) : (
                    <KitPrompt onClick={() => { onClose(); navigate('/creator/dashboard/my-kit'); }}>
                      <KitPromptIcon><FiStar /></KitPromptIcon>
                      <KitPromptText>
                        <KitPromptMain>Brands prioritize creators with portfolios</KitPromptMain>
                        <KitPromptSub>Add yours to increase reply rates →</KitPromptSub>
                      </KitPromptText>
                    </KitPrompt>
                  )}

                  <SendButton onClick={handleSendPitch}>
                    Send Pitch <FiArrowRight />
                  </SendButton>
                  <SendSub>Opens in your email app</SendSub>
                </PackageSection>

                {/* Section 3: Optimal Timing */}
                <PackageSection>
                  <SectionHeader>
                    <SectionNumber>3</SectionNumber>
                    <SectionTitle>Best time to send</SectionTitle>
                  </SectionHeader>
                  <TimingCard>
                    <TimingIcon><FiClock /></TimingIcon>
                    <TimingContent>
                      <TimingDay>
                        {packageData.timing?.day}, {packageData.timing?.time_range}
                      </TimingDay>
                      <TimingSub>
                        {packageData.timing?.sample_size > 0 ? (
                          <>Based on {packageData.timing.sample_size} {brandName} replies</>
                        ) : (
                          <>Category average timing</>
                        )}
                        {packageData.timing?.uplift_multiplier > 1 && (
                          <> &middot; {packageData.timing.uplift_multiplier}x higher reply rate</>
                        )}
                      </TimingSub>
                    </TimingContent>
                  </TimingCard>
                </PackageSection>

                {/* Section 4: Content Playbook (Pro) */}
                <PackageSection>
                  <SectionHeader>
                    <SectionNumber>4</SectionNumber>
                    <SectionTitle>Content {brandName} notices</SectionTitle>
                    {!isPro && <ProBadge>PRO</ProBadge>}
                  </SectionHeader>
                  <PlaybookIntro>
                    5 content ideas to post <strong>before</strong> pitching. Brands check your last posts before replying.
                  </PlaybookIntro>

                  <PlaybookList>
                    {(packageData.content_ideas || []).slice(0, isPro ? 5 : 2).map((idea, idx) => (
                      <PlaybookItem key={idx}>
                        <PlaybookNum>{idx + 1}</PlaybookNum>
                        <PlaybookText>
                          "{idea.title}" <PlaybookFormat>{idea.format}</PlaybookFormat>
                        </PlaybookText>
                      </PlaybookItem>
                    ))}
                    {!isPro && packageData.content_ideas?.length > 2 && (
                      <PlaybookItem $blurred>
                        <PlaybookNum>3</PlaybookNum>
                        <PlaybookText $blurred>
                          Get access to 3 more content ideas tailored to {brandName}'s aesthetic
                        </PlaybookText>
                      </PlaybookItem>
                    )}
                  </PlaybookList>

                  {!isPro && (
                    <ProCTA onClick={handleUpgradeClick}>
                      <FiLock size={12} /> Unlock all 5 content ideas with Pro
                    </ProCTA>
                  )}
                </PackageSection>

                {/* Section 5: Follow-up Sequence (Pro) */}
                <PackageSection>
                  <SectionHeader>
                    <SectionNumber>5</SectionNumber>
                    <SectionTitle>Follow-up sequence</SectionTitle>
                    {!isPro && <ProBadge>PRO</ProBadge>}
                  </SectionHeader>

                  <FollowupTeaser>
                    <FollowupTitle>3 follow-ups, drafted and ready</FollowupTitle>
                    <FollowupSub>Creators who follow up land 3x more deals.</FollowupSub>

                    <FollowupTimeline>
                      {['day3', 'day8', 'day14'].map((day, idx) => (
                        <React.Fragment key={day}>
                          <FollowupStep $blurred={!isPro}>
                            <FollowupDay>Day {day.replace('day', '')}</FollowupDay>
                            <FollowupType>
                              {day === 'day3' ? 'Nudge' : day === 'day8' ? 'Value add' : 'Close'}
                            </FollowupType>
                          </FollowupStep>
                          {idx < 2 && <FollowupArrow>→</FollowupArrow>}
                        </React.Fragment>
                      ))}
                    </FollowupTimeline>

                    {!isPro && (
                      <ProCTA onClick={handleUpgradeClick}>
                        <FiLock size={12} /> Turn on follow-ups with Pro
                      </ProCTA>
                    )}

                    {isPro && packageData.follow_ups && (
                      <FollowupDetails>
                        {Object.entries(packageData.follow_ups).map(([day, data]) => (
                          <FollowupDetail key={day}>
                            <FollowupDetailDay>Day {day.replace('day', '')}</FollowupDetailDay>
                            <FollowupDetailSubject>{data.subject}</FollowupDetailSubject>
                            <FollowupDetailBody>{data.body}</FollowupDetailBody>
                          </FollowupDetail>
                        ))}
                      </FollowupDetails>
                    )}
                  </FollowupTeaser>
                </PackageSection>

                {/* Section 6: Reply Prediction */}
                <PackageSection $last>
                  <SectionHeader>
                    <SectionNumber>6</SectionNumber>
                    <SectionTitle>Reply prediction</SectionTitle>
                  </SectionHeader>

                  <PredictionCard>
                    <PredictionRow>
                      <PredictionLabel>{brandName} average reply rate</PredictionLabel>
                      <PredictionValue>{packageData.prediction?.brand_avg || 25}%</PredictionValue>
                    </PredictionRow>
                    <PredictionRow $pro>
                      <PredictionLabel>Personalized for your profile</PredictionLabel>
                      <PredictionValue>
                        {isPro ? (
                          <>{packageData.prediction?.personalized || 30}% expected</>
                        ) : (
                          <>
                            <BlurredValue>{packageData.prediction?.personalized || 30}%</BlurredValue>
                            <ProBadgeSmall>PRO</ProBadgeSmall>
                          </>
                        )}
                      </PredictionValue>
                    </PredictionRow>
                  </PredictionCard>
                </PackageSection>
              </PackageContent>

              {/* Footer */}
              <PackageFooter>
                <FooterText>Package saved to your library</FooterText>
                {!isPro && (
                  <FooterCTA onClick={handleUpgradeClick}>
                    Get Pro &mdash; unlimited packages →
                  </FooterCTA>
                )}
              </PackageFooter>
            </>
          )}
        </Modal>
      </Overlay>

      {/* Paywall Modal */}
      <UpgradeModal
        isOpen={showPaywall}
        onClose={() => {
          setShowPaywall(false);
          onClose(); // Also close the PR Package modal
        }}
        feature="unlock_paywall"
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled(motion.div)`
  background: #fff;
  border-radius: 18px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.24);
`;

const ModalHeader = styled.div`
  padding: 16px 18px 12px;
  border-bottom: 1px solid #ececef;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BrandLogo = styled.div`
  width: 44px;
  height: 44px;
  background: ${props => props.$color};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 18px;
  color: #15161a;
`;

const BrandLogoImg = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
`;

const BrandMeta = styled.div`
  flex: 1;
`;

const BrandName = styled.div`
  font-size: 16px;
  font-weight: 800;
  line-height: 1.15;
  color: #15161a;
`;

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
`;

const BrandCategory = styled.span`
  font-size: 10.5px;
  color: #8a8f98;
  font-weight: 600;
  text-transform: capitalize;
`;

const MatchBadge = styled.span`
  background: #d4f4e2;
  color: #0f7a44;
  font-size: 9.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 8px;
`;

const CloseButton = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #f1f2f4;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a8f98;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #e5e6e8;
    color: #15161a;
  }
`;

// Animation
const AnimationContainer = styled.div`
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AnimationSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 320px;
`;

const AnimationStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  opacity: ${props => props.$active ? 1 : 0.3};
  transition: opacity 0.3s;
`;

const StepIndicator = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${props => props.$done ? '#0f7a44' : props.$active ? '#15161a' : '#e5e6e8'};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
`;

const StepDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$active ? '#fff' : 'transparent'};
`;

const StepContent = styled.div`
  flex: 1;
  padding-top: 2px;
`;

const StepText = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.$active ? '#15161a' : '#8a8f98'};
`;

const StepSub = styled(motion.div)`
  font-size: 11px;
  color: #8a8f98;
  margin-top: 2px;
`;

// Error
const ErrorContainer = styled.div`
  padding: 40px 24px;
  text-align: center;
`;

const ErrorText = styled.div`
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 16px;
`;

const RetryButton = styled.button`
  background: #15161a;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
`;

// Unlocked Ribbon
const UnlockedRibbon = styled.div`
  background: linear-gradient(90deg, #dcfce7, #f0fdf4);
  border-bottom: 1px solid #a7f3d0;
  padding: 9px 18px;
  font-size: 11px;
  color: #0f7a44;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
`;

// Package Content
const PackageContent = styled.div`
  padding: 8px 18px 20px;
  overflow-y: auto;
  flex: 1;
`;

const PackageSection = styled.div`
  padding: 14px 0;
  border-bottom: ${props => props.$last ? 'none' : '1px solid #ececef'};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const SectionNumber = styled.div`
  width: 22px;
  height: 22px;
  background: #15161a;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #15161a;
`;

const SectionSub = styled.span`
  font-size: 10.5px;
  color: #8a8f98;
  margin-left: auto;
  font-weight: 600;
`;

const VerifiedBadge = styled.span`
  margin-left: auto;
  color: #0f7a44;
  font-size: 9.5px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 3px;
`;

// Section 1: Contact
const ContactCard = styled.div`
  background: #f9fafb;
  border: 1px solid #ececef;
  border-radius: 11px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ContactEmail = styled.div`
  flex: 1;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12.5px;
  color: #15161a;
  font-weight: 600;
`;

const CopyButton = styled.button`
  background: ${props => props.$copied ? '#0f7a44' : '#15161a'};
  color: #fff;
  border: none;
  font-size: 10.5px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 7px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;
`;

const ApplicationLink = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 10.5px;
  color: #3b82f6;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

// Section 2: Pitch
const ToneToggle = styled.div`
  display: flex;
  background: #f4f4f6;
  border-radius: 9px;
  padding: 3px;
  margin-bottom: 8px;
`;

const ToneButton = styled.button`
  flex: 1;
  text-align: center;
  padding: 6px 0;
  font-size: 10.5px;
  font-weight: 700;
  color: ${props => props.$active ? '#15161a' : '#8a8f98'};
  background: ${props => props.$active ? '#fff' : 'transparent'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'};
`;

const PitchComposer = styled.div`
  border: 1px solid #ececef;
  border-radius: 9px;
  overflow: hidden;
`;

const FieldLine = styled.div`
  display: flex;
  font-size: 11.5px;
  padding: 8px 12px;
  background: ${props => props.$subject ? '#fff' : '#f9fafb'};
  border-bottom: ${props => props.$subject ? 'none' : '1px solid #ececef'};
`;

const FieldLabel = styled.span`
  width: 52px;
  color: #8a8f98;
  font-weight: 600;
`;

const FieldValue = styled.span`
  color: #15161a;
  font-weight: ${props => props.$bold ? 700 : 600};
`;

const PitchBody = styled.div`
  padding: 11px 12px;
  font-size: 11.5px;
  line-height: 1.55;
  color: #15161a;
  position: relative;
  max-height: 120px;
  overflow: hidden;

  p {
    margin-bottom: 6px;
  }
`;

const PitchFade = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 36px;
  background: linear-gradient(to bottom, rgba(255,255,255,0), #fff);
`;

const KitAttached = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  color: #0f7a44;
  font-weight: 700;
  margin-top: 8px;
  padding: 6px 10px;
  background: #d4f4e2;
  border-radius: 7px;
`;

const KitPrompt = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    transform: translateY(-1px);
  }
`;

const KitPromptIcon = styled.div`
  width: 28px;
  height: 28px;
  background: #fde68a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #92400e;
  font-size: 14px;
  flex-shrink: 0;
`;

const KitPromptText = styled.div`
  flex: 1;
`;

const KitPromptMain = styled.div`
  font-size: 11.5px;
  font-weight: 700;
  color: #92400e;
  line-height: 1.3;
`;

const KitPromptSub = styled.div`
  font-size: 10.5px;
  color: #b45309;
  font-weight: 600;
  margin-top: 1px;
`;

const SendButton = styled.button`
  width: 100%;
  background: #15161a;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 0;
  font-size: 13px;
  font-weight: 800;
  margin-top: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s;

  &:hover {
    background: #2a2b2f;
  }
`;

const SendSub = styled.div`
  text-align: center;
  font-size: 10px;
  color: #8a8f98;
  margin-top: 5px;
`;

// Section 3: Timing
const TimingCard = styled.div`
  background: #fff9ec;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TimingIcon = styled.div`
  width: 28px;
  height: 28px;
  background: #fde68a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #92400e;
  font-size: 14px;
`;

const TimingContent = styled.div`
  flex: 1;
`;

const TimingDay = styled.div`
  font-size: 12px;
  font-weight: 800;
  color: #92400e;
`;

const TimingSub = styled.div`
  font-size: 10.5px;
  color: #92400e;
  opacity: 0.8;
`;

// Section 4: Content Playbook
const PlaybookIntro = styled.div`
  font-size: 10.5px;
  color: #6b7280;
  margin-bottom: 8px;
`;

const PlaybookList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const PlaybookItem = styled.div`
  background: #fff;
  border: 1px solid #ececef;
  border-radius: 9px;
  padding: 9px 11px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 11px;
  opacity: ${props => props.$blurred ? 0.5 : 1};
  filter: ${props => props.$blurred ? 'blur(2px)' : 'none'};
`;

const PlaybookNum = styled.div`
  width: 20px;
  height: 20px;
  background: #f1f2f4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: #6b7280;
  flex-shrink: 0;
`;

const PlaybookText = styled.div`
  flex: 1;
  line-height: 1.4;
  color: #15161a;
`;

const PlaybookFormat = styled.span`
  color: #8a8f98;
  font-size: 10px;
`;

// Section 5: Follow-ups
const FollowupTeaser = styled.div`
  background: #faf5ff;
  border: 1px dashed #d8b4fe;
  border-radius: 11px;
  padding: 12px;
`;

const FollowupTitle = styled.div`
  font-size: 12px;
  font-weight: 800;
  color: #15161a;
  margin-bottom: 2px;
`;

const FollowupSub = styled.div`
  font-size: 10.5px;
  color: #6b7280;
  margin-bottom: 9px;
`;

const FollowupTimeline = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
`;

const FollowupStep = styled.div`
  background: #fff;
  border: 1px solid #ececef;
  border-radius: 7px;
  padding: 6px 9px;
  filter: ${props => props.$blurred ? 'blur(1.5px)' : 'none'};
`;

const FollowupDay = styled.div`
  font-size: 10px;
  font-weight: 800;
  color: #15161a;
`;

const FollowupType = styled.div`
  font-size: 9.5px;
  color: #6b7280;
`;

const FollowupArrow = styled.span`
  color: #c026d3;
  font-size: 11px;
`;

const FollowupDetails = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FollowupDetail = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 10px;
`;

const FollowupDetailDay = styled.div`
  font-size: 10px;
  font-weight: 800;
  color: #8b5cf6;
  margin-bottom: 4px;
`;

const FollowupDetailSubject = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #15161a;
  margin-bottom: 4px;
`;

const FollowupDetailBody = styled.div`
  font-size: 10.5px;
  color: #6b7280;
  line-height: 1.4;
`;

// Section 6: Prediction
const PredictionCard = styled.div`
  background: #f9fafb;
  border: 1px solid #ececef;
  border-radius: 10px;
  padding: 10px 12px;
`;

const PredictionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  padding: 2px 0;
  color: ${props => props.$pro ? '#8b5cf6' : '#15161a'};
`;

const PredictionLabel = styled.span`
  color: #6b7280;
  font-weight: 600;
`;

const PredictionValue = styled.span`
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const BlurredValue = styled.span`
  filter: blur(4px);
`;

// Pro badges
const ProBadge = styled.span`
  margin-left: auto;
  background: linear-gradient(90deg, #8b5cf6, #c026d3);
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 8px;
  letter-spacing: 0.03em;
`;

const ProBadgeSmall = styled.span`
  background: linear-gradient(90deg, #8b5cf6, #c026d3);
  color: #fff;
  font-size: 8.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 6px;
`;

const ProCTA = styled.div`
  background: linear-gradient(90deg, #8b5cf6, #c026d3);
  color: #fff;
  text-align: center;
  font-size: 11px;
  font-weight: 800;
  padding: 10px 0;
  border-radius: 9px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
`;

// Footer
const PackageFooter = styled.div`
  background: #f9fafb;
  border-top: 1px solid #ececef;
  padding: 10px 18px;
  font-size: 10.5px;
  color: #6b7280;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FooterText = styled.span``;

const FooterCTA = styled.button`
  color: #e8395f;
  font-weight: 700;
  background: none;
  border: none;
  cursor: pointer;
  font-size: inherit;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

export default PRPackageModal;
