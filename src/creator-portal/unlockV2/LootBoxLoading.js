import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { LOADING } from './copyDictionary';
import { creatorTokens as t } from '../../theme/creatorTokens';

/**
 * Unlock loading — progressive checklist while Brand PR package builds.
 * Paper/cream + green accent (rebuild). Mobile-first.
 */

const pop = keyframes`
  0% { transform: scale(0.92); opacity: 0; }
  60% { transform: scale(1.03); }
  100% { transform: scale(1); opacity: 1; }
`;

const fadeInOut = keyframes`
  0% { opacity: 0; transform: translateY(4px); }
  15% { opacity: 1; transform: translateY(0); }
  85% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-4px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
`;

const Container = styled.div`
  padding: 28px 20px 32px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  text-align: left;
  background: ${t.paper};
  color: ${t.ink};
  position: relative;
  overflow: hidden;
  min-height: min(420px, 70vh);
  font-family: ${t.fontSans};

  &::before {
    content: "";
    position: absolute;
    top: -80px;
    right: -60px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(closest-side, rgba(13, 122, 95, 0.14), transparent);
    pointer-events: none;
  }

  @media (max-width: 480px) {
    padding: 22px 16px 28px;
    min-height: min(380px, 65vh);
  }
`;

const Eyebrow = styled.div`
  position: relative;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: ${t.accentDeep};
  text-transform: uppercase;
  margin-bottom: 0.45rem;
`;

const BrandName = styled.div`
  position: relative;
  font-family: ${t.fontDisplay};
  font-size: clamp(1.45rem, 5vw, 1.85rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: ${t.ink};
  margin-bottom: 0.35rem;
`;

const Subline = styled.div`
  position: relative;
  font-size: 0.88rem;
  color: ${t.muted};
  margin-bottom: 1.25rem;
  line-height: 1.4;
`;

const ProgressBar = styled.div`
  position: relative;
  width: 100%;
  height: 6px;
  background: ${t.line};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1.15rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.$progress}%;
  background: linear-gradient(90deg, ${t.accent}, ${t.accentDeep});
  background-size: 200% 100%;
  animation: ${shimmer} 1.8s ease infinite;
  border-radius: 4px;
  transition: width 0.35s ease-out;
`;

const CardStack = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

const LootCard = styled.div`
  background: ${props => (props.$done ? t.accentSoft : t.white)};
  border: 1px solid ${props => (props.$done ? t.accentBorder : t.line)};
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: ${props => (props.$done ? t.accentDeep : t.muted)};
  font-size: 0.86rem;
  font-weight: 600;
  opacity: ${props => (props.$visible ? 1 : 0.35)};
  transform: ${props => (props.$visible ? 'scale(1)' : 'scale(0.98)')};
  animation: ${props => (props.$animating ? pop : 'none')} 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
`;

const CardIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => (props.$done ? t.accent : '#ebebeb')};
  color: ${props => (props.$done ? '#fff' : t.muted)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 800;
  flex-shrink: 0;
`;

const CyclingText = styled.div`
  position: relative;
  font-size: 0.82rem;
  color: ${t.muted};
  margin-top: 1.1rem;
  font-weight: 500;
  min-height: 1.25rem;
  display: flex;
  align-items: center;
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
    background: ${t.accent};
    border-radius: 50%;
    animation: ${pulse} 1.4s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
`;

/**
 * @param {Object} props
 * @param {string} props.brandName
 * @param {Object} props.cardStates
 * @param {string|null} props.animatingCard
 * @param {boolean} props.showFallback
 */
const LootBoxLoading = ({ brandName, cardStates, animatingCard, showFallback }) => {
  const [textIndex, setTextIndex] = useState(0);
  const [textKey, setTextKey] = useState(0);

  useEffect(() => {
    if (!showFallback) {
      setTextIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % LOADING.cyclingTexts.length);
      setTextKey(prev => prev + 1);
    }, LOADING.cyclingIntervalMs);

    return () => clearInterval(interval);
  }, [showFallback]);

  const completedCount = Object.values(cardStates).filter(Boolean).length;
  const progress = (completedCount / LOADING.cards.length) * 100;

  return (
    <Container>
      <Eyebrow>{LOADING.title}</Eyebrow>
      <BrandName>{brandName}</BrandName>
      <Subline>{LOADING.subline}</Subline>

      <ProgressBar>
        <ProgressFill $progress={Math.max(progress, 8)} />
      </ProgressBar>

      <CardStack>
        {LOADING.cards.map((card) => {
          const isDone = cardStates[card.key];
          const isAnimating = animatingCard === card.key;
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
