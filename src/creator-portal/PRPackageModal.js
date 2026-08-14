import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCopy, FiCheck, FiClock, FiArrowRight, FiLock, FiExternalLink, FiStar, FiFlag, FiRefreshCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api';
import { message, Tooltip, Modal as AntModal } from 'antd';
import UpgradeModal from './UpgradeModal';
import { trackProBeginCheckout } from '../utils/subscriptionAnalytics';

/**
 * PR Package Modal - V2 Single Pitch with Mandatory Edit
 *
 * Key changes from V1:
 * 1. Single pitch (no Short/Growing/Founder tabs)
 * 2. Editable subject + body in-place
 * 3. Character delta counter with personalization nudge
 * 4. Send button gated until 20+ chars edited OR friction modal confirmed
 * 5. "Try another version" for variant regeneration (max 3)
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
  const [kitPublished, setKitPublished] = useState(false);

  // Editable pitch state
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [originalSubject, setOriginalSubject] = useState('');
  const [originalBody, setOriginalBody] = useState('');

  // Edit tracking
  const [charDelta, setCharDelta] = useState(0);
  const [hasConfirmedSendAsIs, setHasConfirmedSendAsIs] = useState(false);

  // Regeneration state
  const [regenCount, setRegenCount] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const MAX_REGENS = 3;

  // UI state
  const [copiedField, setCopiedField] = useState(null);
  const [animationStep, setAnimationStep] = useState(0);
  const [showAnimation, setShowAnimation] = useState(true);
  const [showFrictionModal, setShowFrictionModal] = useState(false);

  const bodyTextareaRef = useRef(null);
  const navigate = useNavigate();

  // Check if creator has a published media kit (from API response)
  const hasPublishedKit = kitPublished || creatorProfile?.has_media_kit || false;

  // Calculate character delta whenever edits change
  useEffect(() => {
    const subjectDiff = Math.abs(editedSubject.length - originalSubject.length) +
      (editedSubject !== originalSubject ? editedSubject.split('').filter((c, i) => c !== originalSubject[i]).length : 0);
    const bodyDiff = Math.abs(editedBody.length - originalBody.length) +
      (editedBody !== originalBody ? editedBody.split('').filter((c, i) => c !== originalBody[i]).length : 0);

    // Simple diff: count chars that differ
    let diff = 0;
    const maxSubLen = Math.max(editedSubject.length, originalSubject.length);
    for (let i = 0; i < maxSubLen; i++) {
      if (editedSubject[i] !== originalSubject[i]) diff++;
    }
    const maxBodyLen = Math.max(editedBody.length, originalBody.length);
    for (let i = 0; i < maxBodyLen; i++) {
      if (editedBody[i] !== originalBody[i]) diff++;
    }
    setCharDelta(diff);
  }, [editedSubject, editedBody, originalSubject, originalBody]);

  // Minimum edit threshold
  const MIN_EDIT_CHARS = 20;
  const hasMinimumEdits = charDelta >= MIN_EDIT_CHARS;
  const canSend = hasMinimumEdits || hasConfirmedSendAsIs;

  // Handle upgrade to Pro via Stripe checkout
  const handleUpgradeClick = async () => {
    try {
      setUpgradeLoading(true);
      trackProBeginCheckout({ tier: 'pro', source: 'pr_package_modal' });
      const response = await apiClient.post('/api/subscription/create-checkout', { tier: 'pro' });
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

  // Animation steps
  const ANIMATION_STEPS = [
    { text: `Finding ${brand?.brand_name || brand?.name || 'brand'}'s inbox...`, sub: 'Verified contact from our directory' },
    { text: 'Writing your pitch...', sub: 'Personalized for your profile' },
    { text: 'Package ready', sub: 'Edit and send', done: true },
  ];

  // Generate PR Package
  const generatePackage = useCallback(async (isRegen = false) => {
    if (!brand) return;

    if (isRegen) {
      setIsRegenerating(true);
    } else {
      setLoading(true);
      setShowAnimation(true);
      setAnimationStep(0);
    }
    setError(null);

    // Animation sequence
    const animationInterval = !isRegen ? setInterval(() => {
      setAnimationStep(prev => {
        if (prev < ANIMATION_STEPS.length - 2) return prev + 1;
        return prev;
      });
    }, 1200) : null;

    try {
      const response = await apiClient.post('/api/pr-crm/generate-pr-package', {
        brand_id: brand.brand_id || brand.id,
        slug: brand.slug,
        regenerate: isRegen,
      });

      if (animationInterval) clearInterval(animationInterval);

      if (response.data.success) {
        setPackageData(response.data.package);
        setBrandEmail(response.data.brand_email);
        setApplicationUrl(response.data.application_form_url);
        setKitPublished(response.data.kit_published || false);

        // Set initial pitch content (use 'short' since all variants are now the same)
        const pitch = response.data.package.pitches?.short || response.data.package.pitches?.growing;
        if (pitch) {
          setOriginalSubject(pitch.subject || '');
          setOriginalBody(pitch.body_plain || '');
          setEditedSubject(pitch.subject || '');
          setEditedBody(pitch.body_plain || '');
        }

        // Reset edit confirmation on new generation
        setHasConfirmedSendAsIs(false);

        if (!isRegen) {
          setAnimationStep(ANIMATION_STEPS.length - 1);
          setTimeout(() => {
            setShowAnimation(false);
          }, 600);
        }

        if (isRegen) {
          setRegenCount(prev => prev + 1);
          message.success('New pitch version generated');
        }
      } else {
        setError(response.data.error || 'Failed to generate PR Package');
        setShowAnimation(false);
      }
    } catch (err) {
      if (animationInterval) clearInterval(animationInterval);
      console.error('PR Package error:', err);

      if (err.response?.status === 402) {
        setShowPaywall(true);
        setShowAnimation(false);
      } else if ([403, 500, 503].includes(err.response?.status)) {
        message.warning('AI service temporarily unavailable. Please try again in a few minutes.');
        setError('AI service temporarily unavailable. Please try again shortly.');
        setShowAnimation(false);
      } else {
        setError(err.response?.data?.error || 'Failed to generate PR Package');
        setShowAnimation(false);
      }
    } finally {
      setLoading(false);
      setIsRegenerating(false);
    }
  }, [brand]);

  useEffect(() => {
    if (isOpen && brand) {
      // Reset state on open
      setRegenCount(0);
      setHasConfirmedSendAsIs(false);
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

  // Copy full pitch
  const copyFullPitch = async () => {
    const fullPitch = `Subject: ${editedSubject}\n\n${editedBody}`;
    await copyToClipboard(fullPitch, 'pitch');
  };

  // Handle send click
  const handleSendClick = () => {
    if (canSend) {
      handleSendPitch();
    } else {
      // Show friction modal
      setShowFrictionModal(true);
    }
  };

  // Handle friction modal confirm (send without edit)
  const handleConfirmSendAsIs = () => {
    setHasConfirmedSendAsIs(true);
    setShowFrictionModal(false);
    handleSendPitch();
  };

  // Open email client with pitch
  const handleSendPitch = () => {
    if (!brandEmail) return;

    const subject = encodeURIComponent(editedSubject);
    const body = encodeURIComponent(editedBody);
    const mailtoUrl = `mailto:${brandEmail}?subject=${subject}&body=${body}`;

    window.open(mailtoUrl, '_blank');

    if (onPitchSent) {
      onPitchSent({
        brand,
        subject: editedSubject,
        edited: charDelta > 0,
        editedChars: charDelta,
      });
    }
  };

  // Handle regeneration
  const handleRegenerate = () => {
    if (regenCount >= MAX_REGENS) {
      message.info('Ready to send? You\'ve seen 3 versions.');
      return;
    }
    generatePackage(true);
  };

  if (!isOpen) return null;

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
              <RetryButton onClick={() => generatePackage()}>Try Again</RetryButton>
            </ErrorContainer>
          )}

          {/* Package Content */}
          {packageData && !showAnimation && !error && (
            <>
              <PackageContent>
                {/* Brand contact */}
                <ContactSection>
                  <SectionLabel>BRAND EMAIL</SectionLabel>
                  <ContactCard>
                    <ContactEmail>{brandEmail || 'Loading...'}</ContactEmail>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Tooltip title="Report invalid email">
                        <FlagBtn
                          type="button"
                          onClick={() => {
                            const subject = encodeURIComponent(`${brandName} - Invalid Contact Report`);
                            const body = encodeURIComponent(`Hi Newcollab team,\n\nThe contact email for ${brandName} (${brandEmail}) appears to be invalid.\n\nPlease update this brand's contact information.\n\nThank you!`);
                            window.open(`mailto:team@newcollab.co?subject=${subject}&body=${body}`, '_blank');
                          }}
                        >
                          <FiFlag size={14} />
                        </FlagBtn>
                      </Tooltip>
                      <CopyButton
                        onClick={() => copyToClipboard(brandEmail, 'email')}
                        $copied={copiedField === 'email'}
                      >
                        {copiedField === 'email' ? <FiCheck /> : <FiCopy />}
                        {copiedField === 'email' ? 'Copied' : 'Copy'}
                      </CopyButton>
                    </div>
                  </ContactCard>
                  <CreditsUsed>1 credit used</CreditsUsed>
                </ContactSection>

                {/* Editable Pitch */}
                <PitchSection>
                  <SectionLabel>YOUR PITCH</SectionLabel>

                  {/* Subject Line */}
                  <InputGroup>
                    <InputLabel>Subject line</InputLabel>
                    <SubjectInput
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      placeholder="Enter subject line..."
                    />
                  </InputGroup>

                  {/* Body */}
                  <InputGroup>
                    <InputLabel>Body</InputLabel>
                    <BodyTextarea
                      ref={bodyTextareaRef}
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      placeholder="Enter your pitch..."
                      rows={10}
                    />
                  </InputGroup>

                  {/* Edit Counter + Nudge */}
                  <EditCounter $hasEdits={charDelta > 0} $ready={hasMinimumEdits}>
                    <EditCounterLine>
                      You've edited {charDelta} character{charDelta !== 1 ? 's' : ''}
                    </EditCounterLine>
                    {!hasMinimumEdits && (
                      <EditNudge>
                        Personalize to 3x your reply rate. Add one real detail about your routine or style.
                      </EditNudge>
                    )}
                  </EditCounter>

                  {/* Media Kit Status */}
                  {hasPublishedKit ? (
                    <KitAttached>
                      <FiCheck /> Media kit auto-attached
                    </KitAttached>
                  ) : (
                    <KitPrompt onClick={() => { onClose(); navigate('/creator/dashboard/my-kit'); }}>
                      <KitPromptIcon><FiStar /></KitPromptIcon>
                      <KitPromptText>
                        <KitPromptMain>Brands prioritize creators with portfolios</KitPromptMain>
                        <KitPromptSub>Add yours to increase reply rates</KitPromptSub>
                      </KitPromptText>
                    </KitPrompt>
                  )}
                </PitchSection>

                {/* Best Time (collapsed) */}
                {packageData.timing && (
                  <TimingRow>
                    <FiClock size={12} />
                    <span>Best time: {packageData.timing.day}, {packageData.timing.time_range}</span>
                  </TimingRow>
                )}

                {/* What They Gift */}
                {brand?.avg_gift_value && (
                  <GiftRow>
                    <GiftLabel>WHAT THEY OFTEN GIFT</GiftLabel>
                    <GiftValue>~${brand.avg_gift_value} avg gift</GiftValue>
                  </GiftRow>
                )}
              </PackageContent>

              {/* Action Buttons */}
              <ActionFooter>
                {/* Primary: Try Another Version */}
                <RegenButton
                  onClick={handleRegenerate}
                  disabled={isRegenerating || regenCount >= MAX_REGENS}
                >
                  <FiRefreshCw className={isRegenerating ? 'spin' : ''} />
                  {isRegenerating ? 'Generating...' : regenCount >= MAX_REGENS ? 'Ready to send?' : 'Try another version'}
                  {regenCount > 0 && regenCount < MAX_REGENS && (
                    <RegenCounter>{MAX_REGENS - regenCount} left</RegenCounter>
                  )}
                </RegenButton>

                {/* Primary: Send Pitch */}
                <SendButton
                  onClick={handleSendClick}
                  $ready={canSend}
                >
                  Send pitch <FiArrowRight />
                </SendButton>

                {/* Secondary Actions */}
                <SecondaryActions>
                  {applicationUrl && (
                    <SecondaryLink href={applicationUrl} target="_blank" rel="noopener noreferrer">
                      Apply via form
                    </SecondaryLink>
                  )}
                  <SecondaryDot>·</SecondaryDot>
                  <SecondaryButton onClick={copyFullPitch}>
                    {copiedField === 'pitch' ? 'Copied!' : 'Copy to send from your email'}
                  </SecondaryButton>
                </SecondaryActions>
              </ActionFooter>
            </>
          )}
        </Modal>
      </Overlay>

      {/* Friction Modal - Send without editing */}
      <AntModal
        open={showFrictionModal}
        onCancel={() => setShowFrictionModal(false)}
        footer={null}
        centered
        width={400}
      >
        <FrictionContent>
          <FrictionTitle>Send without personalizing?</FrictionTitle>
          <FrictionText>
            Personalized pitches get <strong>5x higher reply rates</strong>. Adding just one personal detail makes a huge difference.
          </FrictionText>
          <FrictionButtons>
            <FrictionSecondary onClick={() => setShowFrictionModal(false)}>
              Go back and edit
            </FrictionSecondary>
            <FrictionPrimary onClick={handleConfirmSendAsIs}>
              Send as-is anyway
            </FrictionPrimary>
          </FrictionButtons>
        </FrictionContent>
      </AntModal>

      {/* Paywall Modal */}
      <UpgradeModal
        isOpen={showPaywall}
        onClose={() => {
          setShowPaywall(false);
          onClose();
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

// Package Content
const PackageContent = styled.div`
  padding: 16px 18px;
  overflow-y: auto;
  flex: 1;
`;

// Contact Section
const ContactSection = styled.div`
  margin-bottom: 20px;
`;

const SectionLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: #8a8f98;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

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
  font-size: 13px;
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

  &:hover {
    color: #ef4444;
    background: #fef2f2;
  }
`;

const CreditsUsed = styled.div`
  font-size: 10px;
  color: #8a8f98;
  margin-top: 6px;
`;

// Pitch Section
const PitchSection = styled.div`
  margin-bottom: 16px;
`;

const InputGroup = styled.div`
  margin-bottom: 12px;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 6px;
`;

const SubjectInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #15161a;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
  transition: all 0.15s;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const BodyTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  font-size: 12.5px;
  line-height: 1.6;
  color: #15161a;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
  resize: vertical;
  min-height: 180px;
  font-family: inherit;
  transition: all 0.15s;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const EditCounter = styled.div`
  padding: 10px 12px;
  background: ${props => props.$ready ? '#dcfce7' : props.$hasEdits ? '#fef3c7' : '#f3f4f6'};
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.2s;
`;

const EditCounterLine = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #374151;
  text-align: center;
`;

const EditNudge = styled.div`
  font-size: 10.5px;
  color: #6b7280;
  text-align: center;
  margin-top: 4px;
`;

const KitAttached = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  color: #0f7a44;
  font-weight: 700;
  padding: 8px 10px;
  background: #d4f4e2;
  border-radius: 7px;
`;

const KitPrompt = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
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

// Timing Row
const TimingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #6b7280;
  padding: 8px 0;
  border-top: 1px solid #f3f4f6;
`;

// Gift Row
const GiftRow = styled.div`
  padding: 12px 0;
  border-top: 1px solid #f3f4f6;
`;

const GiftLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: #8a8f98;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const GiftValue = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #15161a;
`;

// Action Footer
const ActionFooter = styled.div`
  padding: 16px 18px;
  border-top: 1px solid #ececef;
  background: #fafafa;
`;

const RegenButton = styled.button`
  width: 100%;
  background: #fff;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 0;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const RegenCounter = styled.span`
  font-size: 10px;
  color: #9ca3af;
  font-weight: 600;
  margin-left: 4px;
`;

const SendButton = styled.button`
  width: 100%;
  background: ${props => props.$ready ? '#3b82f6' : '#9ca3af'};
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 14px 0;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s;

  &:hover {
    background: ${props => props.$ready ? '#2563eb' : '#6b7280'};
  }
`;

const SecondaryActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 11px;
`;

const SecondaryLink = styled.a`
  color: #3b82f6;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const SecondaryDot = styled.span`
  color: #d1d5db;
`;

const SecondaryButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-weight: 600;
  font-size: inherit;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #374151;
  }
`;

// Friction Modal
const FrictionContent = styled.div`
  padding: 8px;
  text-align: center;
`;

const FrictionTitle = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #15161a;
  margin-bottom: 12px;
`;

const FrictionText = styled.div`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const FrictionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const FrictionSecondary = styled.button`
  flex: 1;
  background: #fff;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
`;

const FrictionPrimary = styled.button`
  flex: 1;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #dc2626;
  }
`;

export default PRPackageModal;
