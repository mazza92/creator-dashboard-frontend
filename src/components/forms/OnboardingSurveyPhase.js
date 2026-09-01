import React from 'react';
import styled from 'styled-components';
import {
  SURVEY_SEGMENTS,
  SURVEY_INTENTS,
  SURVEY_PAINS,
  SURVEY_PROGRESS_HINT,
} from './onboardingSurveyConfig';

const colors = {
  rose: '#E11D48',
  black: '#0F0F0F',
  border: '#EBEBEB',
  text: '#0F0F0F',
  text2: '#5A5A5A',
  text3: '#A0A0A0',
};

const ProgressWrap = styled.div`
  margin-bottom: 26px;
`;

const ProgressTop = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${colors.text3};
  margin-bottom: 10px;
`;

const DotRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Dot = styled.span`
  width: ${(p) => (p.$active ? '10px' : '8px')};
  height: ${(p) => (p.$active ? '10px' : '8px')};
  border-radius: 50%;
  background: ${(p) => (p.$active ? colors.black : colors.border)};
  transition: all 0.2s ease;
`;

const Headline = styled.h2`
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
  color: ${colors.black};
`;

const Subline = styled.p`
  font-size: 14px;
  color: ${colors.text2};
  line-height: 1.6;
  margin-bottom: 18px;
`;

const Question = styled.p`
  font-size: 15px;
  font-weight: 700;
  color: ${colors.text};
  margin-bottom: 4px;
  line-height: 1.4;
`;

const QuestionHint = styled.p`
  font-size: 13px;
  color: ${colors.text2};
  margin-bottom: 14px;
  line-height: 1.5;
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
`;

const OptionCard = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  border: 1.5px solid ${(p) => (p.$selected ? colors.black : colors.border)};
  background: ${(p) => (p.$selected ? '#F8F8F8' : '#fff')};
  border-radius: 12px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    border-color: ${(p) => (p.$selected ? colors.black : '#ccc')};
  }
`;

const OptionIcon = styled.span`
  font-size: 18px;
  line-height: 1.2;
  flex-shrink: 0;
`;

const OptionLabel = styled.span`
  font-size: 13.5px;
  font-weight: 600;
  color: ${colors.text};
  line-height: 1.45;
`;

const OtherInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid ${colors.border};
  border-radius: 11px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  margin-top: 8px;
  margin-bottom: 4px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${colors.black};
    box-shadow: 0 0 0 3px rgba(15, 15, 15, 0.06);
  }
`;

const BtnRow = styled.div`
  display: flex;
  gap: 9px;
  margin-top: 16px;
  align-items: center;
`;

const BackBtn = styled.button`
  background: transparent;
  color: ${colors.text2};
  border: 1.5px solid ${colors.border};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 16px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  flex-shrink: 0;

  &:hover { background: #f5f5f5; }
`;

const ContinueBtn = styled.button`
  flex: 1;
  padding: 13px 16px;
  border-radius: 12px;
  border: none;
  background: ${colors.black};
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  opacity: ${(p) => (p.disabled ? 0.6 : 1)};

  &:hover:not(:disabled) { background: #1a1a1a; }
`;

const SkipLink = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  font-size: 12.5px;
  font-weight: 600;
  color: ${colors.text3};
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  padding: 8px 4px;
  flex-shrink: 0;

  &:hover { color: ${colors.text2}; }
`;

const ErrorMsg = styled.div`
  color: ${colors.rose};
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
`;

const CelebrationList = styled.ul`
  margin: 16px 0 20px;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CelebrationItem = styled.li`
  font-size: 14px;
  color: ${colors.text2};
  line-height: 1.5;
  padding-left: 20px;
  position: relative;

  &::before {
    content: '•';
    position: absolute;
    left: 0;
    color: ${colors.rose};
    font-weight: 900;
  }
`;

function SurveyProgress({ step }) {
  return (
    <ProgressWrap>
      <ProgressTop>
        <span>{SURVEY_PROGRESS_HINT[step]}</span>
        <DotRow aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <Dot key={n} $active={n <= step} />
          ))}
        </DotRow>
      </ProgressTop>
    </ProgressWrap>
  );
}

function SurveyActions({
  showBack,
  onBack,
  onContinue,
  onSkip,
  continueLabel = 'Continue →',
  continueDisabled,
  loading,
  skipLabel = 'Skip for now',
}) {
  return (
    <>
      <BtnRow>
        {showBack && (
          <BackBtn type="button" onClick={onBack} disabled={loading}>
            ← Back
          </BackBtn>
        )}
        <ContinueBtn
          type="button"
          onClick={onContinue}
          disabled={continueDisabled || loading}
        >
          {loading ? 'Saving...' : continueLabel}
        </ContinueBtn>
        {onSkip && (
          <SkipLink type="button" onClick={onSkip} disabled={loading}>
            {skipLabel}
          </SkipLink>
        )}
      </BtnRow>
    </>
  );
}

export function OnboardingSurveyStep1({
  segment,
  setSegment,
  error,
  loading,
  onBack,
  onContinue,
  onSkip,
}) {
  return (
    <>
      <SurveyProgress step={1} />
      <Headline>Welcome to Newcollab 👋</Headline>
      <Subline>
        Quick 3-step setup so we can match you with the right brands. Takes 30 seconds.
      </Subline>
      <Question>Where are you in your UGC journey?</Question>
      <QuestionHint>We&apos;ll personalize your dashboard based on where you&apos;re starting.</QuestionHint>
      <OptionList>
        {SURVEY_SEGMENTS.map((opt) => (
          <OptionCard
            key={opt.value}
            type="button"
            $selected={segment === opt.value}
            onClick={() => setSegment(opt.value)}
          >
            <OptionIcon>{opt.icon}</OptionIcon>
            <OptionLabel>{opt.label}</OptionLabel>
          </OptionCard>
        ))}
      </OptionList>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <SurveyActions
        showBack={!!onBack}
        onBack={onBack}
        onContinue={onContinue}
        onSkip={onSkip}
        continueDisabled={!segment}
        loading={loading}
      />
    </>
  );
}

export function OnboardingSurveyStep2({
  intent,
  toggleIntent,
  intentOther,
  setIntentOther,
  error,
  loading,
  onBack,
  onContinue,
  onSkip,
}) {
  return (
    <>
      <SurveyProgress step={2} />
      <Question>What do you want to get out of Newcollab?</Question>
      <QuestionHint>Pick up to 3 — you can change these anytime.</QuestionHint>
      <OptionList>
        {SURVEY_INTENTS.map((opt) => (
          <OptionCard
            key={opt.value}
            type="button"
            $selected={intent.includes(opt.value)}
            onClick={() => toggleIntent(opt.value)}
          >
            <OptionIcon>{opt.icon}</OptionIcon>
            <OptionLabel>{opt.label}</OptionLabel>
          </OptionCard>
        ))}
      </OptionList>
      {intent.includes('other') && (
        <OtherInput
          type="text"
          placeholder="Tell us what you're looking for..."
          value={intentOther}
          onChange={(e) => setIntentOther(e.target.value.slice(0, 200))}
          maxLength={200}
        />
      )}
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <SurveyActions
        showBack
        onBack={onBack}
        onContinue={onContinue}
        onSkip={onSkip}
        continueDisabled={intent.length === 0}
        loading={loading}
      />
    </>
  );
}

export function OnboardingSurveyStep3({
  pain,
  togglePain,
  painOther,
  setPainOther,
  error,
  loading,
  onBack,
  onContinue,
  onSkip,
}) {
  return (
    <>
      <SurveyProgress step={3} />
      <Question>What&apos;s your biggest challenge right now?</Question>
      <QuestionHint>We&apos;ll surface tools to help. Pick up to 3.</QuestionHint>
      <OptionList>
        {SURVEY_PAINS.map((opt) => (
          <OptionCard
            key={opt.value}
            type="button"
            $selected={pain.includes(opt.value)}
            onClick={() => togglePain(opt.value)}
          >
            <OptionIcon>{opt.icon}</OptionIcon>
            <OptionLabel>{opt.label}</OptionLabel>
          </OptionCard>
        ))}
      </OptionList>
      {pain.includes('other') && (
        <OtherInput
          type="text"
          placeholder="What's getting in your way?"
          value={painOther}
          onChange={(e) => setPainOther(e.target.value.slice(0, 200))}
          maxLength={200}
        />
      )}
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <SurveyActions
        showBack
        onBack={onBack}
        onContinue={onContinue}
        onSkip={onSkip}
        continueLabel="Save & see my brands →"
        continueDisabled={pain.length === 0}
        loading={loading}
      />
    </>
  );
}

export function OnboardingCelebration({
  firstName,
  onContinue,
  loading,
}) {
  const displayName = firstName?.trim() || 'there';

  return (
    <>
      <Headline>You&apos;re all set, {displayName} 🎉</Headline>
      <Subline style={{ marginBottom: 8 }}>
        Your dashboard is ready. Here&apos;s what you can do next:
      </Subline>
      <CelebrationList>
        <CelebrationItem>
          Pitch <strong>brand matches</strong> picked for your niche
        </CelebrationItem>
        <CelebrationItem>
          Browse the <strong>full directory</strong> to find more brands
        </CelebrationItem>
        <CelebrationItem>
          Track pitches and follow-ups from one place
        </CelebrationItem>
      </CelebrationList>
      <ContinueBtn type="button" onClick={onContinue} disabled={loading}>
        {loading ? 'Loading...' : "Let's start"}
      </ContinueBtn>
    </>
  );
}
