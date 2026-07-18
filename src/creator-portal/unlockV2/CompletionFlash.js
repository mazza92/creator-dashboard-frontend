import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FLASH, getFlashDuration } from './copyDictionary';

/**
 * CompletionFlash - Modern success celebration moment
 *
 * Clean, elegant animation inspired by Stripe/Linear.
 * Duration scales based on user's total unlocks.
 */

const scaleIn = keyframes`
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
`;

const drawCheck = keyframes`
  0% { stroke-dashoffset: 24; }
  100% { stroke-dashoffset: 0; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Container = styled.div`
  padding: 40px 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #f7f5f0;
  font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  overflow: hidden;
  min-height: min(400px, 65vh);

  @media (max-width: 480px) {
    padding: 32px 20px;
    min-height: min(360px, 60vh);
  }
`;

const SuccessCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0d7a5f 0%, #095a46 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow:
    0 0 0 8px rgba(13, 122, 95, 0.12),
    0 10px 40px -10px rgba(13, 122, 95, 0.35);
  animation: ${scaleIn} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
`;

const CheckIcon = styled.svg`
  width: 36px;
  height: 36px;

  path {
    stroke: white;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    stroke-dasharray: 24;
    stroke-dashoffset: 24;
    animation: ${drawCheck} 0.4s ease-out 0.3s forwards;
  }
`;

const Title = styled.div`
  font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif;
  font-size: 1.55rem;
  font-weight: 400;
  color: #12141a;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
  animation: ${fadeUp} 0.4s ease-out 0.2s both;
`;

const Subline = styled.div`
  font-size: 0.9rem;
  color: #5c6470;
  font-weight: 500;
  animation: ${fadeUp} 0.4s ease-out 0.35s both;
`;

const ProgressDots = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 24px;
  animation: ${fadeUp} 0.4s ease-out 0.5s both;
`;

const Dot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0d7a5f;
  opacity: ${props => 0.3 + (props.$index * 0.23)};
  animation: ${scaleIn} 0.3s ease-out ${props => 0.6 + (props.$index * 0.1)}s both;
`;

/**
 * @param {Object} props
 * @param {number} props.totalUnlocks - User's total unlock count
 * @param {boolean} props.fastMode - Whether user has fast mode enabled
 * @param {Function} props.onComplete - Callback when flash animation completes
 */
const CompletionFlash = ({ totalUnlocks = 0, fastMode = false, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Get duration based on unlock count
    let duration = getFlashDuration(totalUnlocks);

    // Skip entirely if fast mode or duration is 0
    if (fastMode || duration === 0) {
      onComplete?.();
      return;
    }

    // Auto-complete after duration
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [totalUnlocks, fastMode, onComplete]);

  if (!visible) return null;

  return (
    <Container>
      <SuccessCircle>
        <CheckIcon viewBox="0 0 24 24">
          <path d="M5 12l5 5L19 7" />
        </CheckIcon>
      </SuccessCircle>
      <Title>{FLASH.title}</Title>
      <Subline>{FLASH.subline}</Subline>
      <ProgressDots>
        <Dot $index={0} />
        <Dot $index={1} />
        <Dot $index={2} />
      </ProgressDots>
    </Container>
  );
};

export default CompletionFlash;
