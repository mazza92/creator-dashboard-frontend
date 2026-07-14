import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { LOADING, TOKENS } from './copyDictionary';

/**
 * LootBoxLoading - 4-card progressive reveal loading animation
 *
 * Cards appear when real backend events fire, not on fixed timers.
 * Each card has a bouncy pop-in animation when its dependency resolves.
 *
 * When showFallback is true, displays cycling status text to keep
 * users engaged during slow API calls (Claude-style thinking indicator).
 */

const pop = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
`;

const fadeInOut = keyframes`
  0% { opacity: 0; transform: translateY(4px); }
  15% { opacity: 1; transform: translateY(0); }
  85% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-4px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const progressFill = keyframes`
  from { width: 0%; }
  to { width: 100%; }
`;

const Container = styled.div`
  padding: 26px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: ${TOKENS.lootBg};
  color: #fff;
  position: relative;
  overflow: hidden;
  min-height: 400px;

  &::before {
    content: "";
    position: absolute;
    top: -60px;
    right: -50px;
    width: 220px;
    height: 220px;
    border-radius: 50%;
    background: radial-gradient(closest-side, rgba(232, 57, 95, 0.28), transparent);
  }
`;

const Title = styled.div`
  position: relative;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #ffb8c6;
  text-transform: uppercase;
  margin-bottom: 6px;
`;

const BrandName = styled.div`
  position: relative;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.01em;
  margin-bottom: 24px;
`;

const ProgressBar = styled.div`
  position: relative;
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 24px;
`;

const ProgressFill = styled.div`
  display: block;
  height: 100%;
  width: ${props => props.$progress}%;
  background: linear-gradient(90deg, #ff9a4d, #e8395f);
  border-radius: 4px;
  transition: width 0.3s ease-out;
`;

const CardStack = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const LootCard = styled.div`
  background: ${props => props.$done
    ? 'rgba(80, 255, 160, 0.08)'
    : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$done
    ? 'rgba(80, 255, 160, 0.24)'
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 11px;
  padding: 11px 13px;
  display: flex;
  align-items: center;
  gap: 9px;
  color: ${props => props.$done ? '#7df0aa' : 'rgba(255, 255, 255, 0.4)'};
  font-size: 12px;
  font-weight: 700;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => props.$visible ? 'scale(1)' : 'scale(0.8)'};
  animation: ${props => props.$animating ? pop : 'none'} ${TOKENS.lootCardPopDuration} ${TOKENS.lootCardPopEasing} forwards;
`;

const CardIcon = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${props => props.$done
    ? 'rgba(80, 255, 160, 0.2)'
    : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$done ? '#7df0aa' : 'rgba(255, 255, 255, 0.4)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  flex-shrink: 0;
`;

const FallbackText = styled.div`
  position: relative;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 16px;
  font-weight: 600;
`;

const CyclingText = styled.div`
  position: relative;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 16px;
  font-weight: 600;
  min-height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const CyclingTextContent = styled.span`
  animation: ${fadeInOut} ${props => props.$duration}ms ease-in-out;
`;

const ThinkingDots = styled.span`
  display: inline-flex;
  gap: 3px;

  span {
    width: 4px;
    height: 4px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    animation: ${pulse} 1.4s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
`;

/**
 * @param {Object} props
 * @param {string} props.brandName - Name of the brand being unlocked
 * @param {Object} props.cardStates - State of each card { inbox: bool, pitch: bool, strategy: bool, ready: bool }
 * @param {string|null} props.animatingCard - Key of the card currently animating
 * @param {boolean} props.showFallback - Whether to show cycling status text
 */
const LootBoxLoading = ({ brandName, cardStates, animatingCard, showFallback }) => {
  // Cycling text state for slow API calls
  const [textIndex, setTextIndex] = useState(0);
  const [textKey, setTextKey] = useState(0); // Key to trigger re-animation

  // Cycle through status texts when showFallback is active
  useEffect(() => {
    if (!showFallback) {
      setTextIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % LOADING.cyclingTexts.length);
      setTextKey(prev => prev + 1); // Trigger re-animation
    }, LOADING.cyclingIntervalMs);

    return () => clearInterval(interval);
  }, [showFallback]);

  // Calculate progress based on completed cards
  const completedCount = Object.values(cardStates).filter(Boolean).length;
  const progress = (completedCount / LOADING.cards.length) * 100;

  return (
    <Container>
      <Title>{LOADING.title}</Title>
      <BrandName>{brandName}</BrandName>

      <ProgressBar>
        <ProgressFill $progress={progress} />
      </ProgressBar>

      <CardStack>
        {LOADING.cards.map((card, index) => {
          const isDone = cardStates[card.key];
          const isAnimating = animatingCard === card.key;
          // Card is visible if it's done OR any card after it is done (shouldn't happen)
          // OR if we're in fallback mode
          const isVisible = isDone || showFallback;

          return (
            <LootCard
              key={card.key}
              $done={isDone}
              $visible={isVisible}
              $animating={isAnimating}
            >
              <CardIcon $done={isDone}>
                {isDone ? card.done : card.pending}
              </CardIcon>
              {card.text}
            </LootCard>
          );
        })}
      </CardStack>

      {showFallback && (
        <CyclingText>
          <CyclingTextContent
            key={textKey}
            $duration={LOADING.cyclingIntervalMs}
          >
            {LOADING.cyclingTexts[textIndex]}
          </CyclingTextContent>
          <ThinkingDots>
            <span />
            <span />
            <span />
          </ThinkingDots>
        </CyclingText>
      )}
    </Container>
  );
};

export default LootBoxLoading;
