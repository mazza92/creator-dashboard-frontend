import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiArrowRight, FiFileText, FiLock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

/**
 * MediaKitRequired - Blocking modal that requires creators to complete their media kit
 * before accessing pitch/contact features.
 *
 * Design inspired by: LinkedIn profile gates, Fiverr seller requirements, Upwork profile completeness
 */

const MediaKitRequired = ({
  isOpen,
  onClose,
  missingFields = [],
  isPublished = false,
  percentage = 0,
  hasKit = false,
}) => {
  const navigate = useNavigate();

  const handleGoToMediaKit = () => {
    onClose();
    navigate('/creator/dashboard/my-kit');
  };

  if (!isOpen) return null;

  const allFieldsComplete = missingFields.length === 0;
  const needsPublish = allFieldsComplete && !isPublished;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Modal
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>

          <IconContainer>
            <LockIconWrapper>
              <FiLock size={28} />
            </LockIconWrapper>
          </IconContainer>

          <Title>Complete your media kit to pitch brands</Title>

          <Subtitle>
            Brands won't review pitches without seeing your portfolio.
            Complete and publish your media kit to start connecting with brands.
          </Subtitle>

          {/* Progress Ring */}
          <ProgressSection>
            <ProgressRing percentage={percentage}>
              <svg viewBox="0 0 100 100">
                <circle
                  className="bg"
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  strokeWidth="8"
                />
                <circle
                  className="progress"
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  strokeWidth="8"
                  strokeDasharray={`${percentage * 2.83} 283`}
                  strokeLinecap="round"
                />
              </svg>
              <ProgressText>{percentage}%</ProgressText>
            </ProgressRing>
            <ProgressLabel>
              {percentage === 100 ? 'Ready to publish!' : 'Kit Completion'}
            </ProgressLabel>
          </ProgressSection>

          {/* Checklist */}
          <Checklist>
            {!hasKit && (
              <ChecklistItem $pending>
                <CheckIcon $pending><FiX /></CheckIcon>
                <CheckLabel>Create your media kit</CheckLabel>
              </ChecklistItem>
            )}

            {hasKit && (
              <>
                {/* Show completed fields */}
                {['Display Name', 'Tagline', 'Niche', 'Content Types', 'Followers'].map((field) => {
                  const isPending = missingFields.some(f => f.label === field);
                  return (
                    <ChecklistItem key={field} $pending={isPending}>
                      <CheckIcon $pending={isPending}>
                        {isPending ? <FiX /> : <FiCheck />}
                      </CheckIcon>
                      <CheckLabel>{field}</CheckLabel>
                    </ChecklistItem>
                  );
                })}

                {/* Published status */}
                <ChecklistItem $pending={!isPublished} $highlight={needsPublish}>
                  <CheckIcon $pending={!isPublished}>
                    {isPublished ? <FiCheck /> : <FiX />}
                  </CheckIcon>
                  <CheckLabel>
                    {needsPublish ? 'Publish your kit (final step!)' : 'Published & visible to brands'}
                  </CheckLabel>
                </ChecklistItem>
              </>
            )}
          </Checklist>

          {/* Stats callout */}
          <StatsCallout>
            <StatIcon><FiFileText /></StatIcon>
            <StatText>
              Creators with complete media kits get <strong>3x more brand replies</strong>
            </StatText>
          </StatsCallout>

          {/* CTA */}
          <PrimaryButton onClick={handleGoToMediaKit}>
            {!hasKit ? 'Create my media kit' : needsPublish ? 'Publish my kit' : 'Complete my kit'}
            <FiArrowRight />
          </PrimaryButton>

          <SecondaryText>
            Takes less than 2 minutes to complete
          </SecondaryText>
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
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  padding: 20px;
`;

const Modal = styled(motion.div)`
  background: white;
  border-radius: 24px;
  max-width: 440px;
  width: 100%;
  padding: 32px;
  position: relative;
  text-align: center;

  @media (max-width: 480px) {
    padding: 24px 20px;
    border-radius: 20px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #F3F4F6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6B7280;
  transition: all 0.2s;

  &:hover {
    background: #E5E7EB;
    color: #111827;
  }
`;

const IconContainer = styled.div`
  margin-bottom: 20px;
`;

const LockIconWrapper = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: #DC2626;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
  line-height: 1.3;
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: #6B7280;
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const ProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
`;

const ProgressRing = styled.div`
  position: relative;
  width: 80px;
  height: 80px;

  svg {
    transform: rotate(-90deg);
    width: 100%;
    height: 100%;
  }

  circle.bg {
    stroke: #E5E7EB;
  }

  circle.progress {
    stroke: ${props => props.percentage === 100 ? '#10B981' : '#3B82F6'};
    transition: stroke-dasharray 0.5s ease;
  }
`;

const ProgressText = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: 700;
  color: #111827;
`;

const ProgressLabel = styled.span`
  font-size: 13px;
  color: #6B7280;
  margin-top: 8px;
`;

const Checklist = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  text-align: left;
`;

const ChecklistItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: ${props => props.$highlight ? '#FEF3C7' : props.$pending ? '#FEF2F2' : '#F0FDF4'};
  border-radius: 10px;
  transition: all 0.2s;
`;

const CheckIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.$pending ? '#FEE2E2' : '#D1FAE5'};
  color: ${props => props.$pending ? '#DC2626' : '#059669'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
`;

const CheckLabel = styled.span`
  font-size: 14px;
  color: #374151;
  font-weight: 500;
`;

const StatsCallout = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #EFF6FF;
  border-radius: 12px;
  margin-bottom: 24px;
`;

const StatIcon = styled.div`
  color: #3B82F6;
  font-size: 16px;
`;

const StatText = styled.span`
  font-size: 13px;
  color: #1E40AF;

  strong {
    font-weight: 700;
  }
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #111827 0%, #1F2937 100%);
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

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryText = styled.p`
  font-size: 12px;
  color: #9CA3AF;
  margin: 12px 0 0 0;
`;

export default MediaKitRequired;
