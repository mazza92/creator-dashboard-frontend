import React, { useState } from 'react';
import styled from 'styled-components';
import { creatorTokens as t } from '../theme/creatorTokens';
import GoalSetup, { useGoalSuggestion } from './tracker/GoalSetup';
import { money } from './tracker/trackerModel';

// Polly card for creators who haven't set a monthly goal yet (GET /api/tracker/goal/suggest -> current null).
// "Later" hides it for the session.

const LATER_KEY = 'polly_goal_later';

function readLater() {
  try { return sessionStorage.getItem(LATER_KEY) === '1'; } catch (_) { return false; }
}

export default function PollyGoalCard({ avatar, Row, Wrap, onOpenTracker }) {
  const [later, setLater] = useState(readLater);
  const [saved, setSaved] = useState(null);
  const { data } = useGoalSuggestion(!later);

  if (later || !data) return null;
  if (data.current && !saved) return null;

  const dismiss = () => {
    setLater(true);
    try { sessionStorage.setItem(LATER_KEY, '1'); } catch (_) { /* ignore */ }
  };

  return (
    <Wrap>
      <Row>
        {avatar}
        <Card aria-label="Your monthly goal">
          {saved ? (
            <Done>
              <b>Goal set: {money(saved.amount_cents)} a month.</b>
              {saved.math?.pitches ? (
                <span> That&apos;s about {saved.math.pitches} brands to pitch. I&apos;m lining them up in your Tracker.</span>
              ) : <span> I&apos;m lining up the brands in your Tracker.</span>}
              <div><button type="button" onClick={onOpenTracker}>Open my Tracker</button></div>
            </Done>
          ) : (
            <>
              <Head>
                <b>What do you want to earn from collabs this month?</b>
                <span>One goal for gifted products and paid deals together. I&apos;ll work out how many brands it takes.</span>
              </Head>
              <GoalSetup suggestion={data} variant="polly" onSaved={setSaved} onSkip={dismiss} skipLabel="Later" />
            </>
          )}
        </Card>
      </Row>
    </Wrap>
  );
}

const Card = styled.div`
  width: 100%;
  max-width: 560px;
  min-width: 0;
  box-sizing: border-box;
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 16px;
  padding: 16px 18px;
  display: grid;
  gap: 12px;

  @media (max-width: 480px) { padding: 14px; }
`;

const Head = styled.div`
  display: grid;
  gap: 2px;
  b { font-size: 15px; color: ${t.ink}; }
  span { font-size: 13px; color: ${t.muted}; }
`;

const Done = styled.div`
  font-size: 14px;
  color: ${t.inkSoft};
  line-height: 1.5;
  b { color: ${t.ink}; }
  div { margin-top: 10px; }
  button {
    background: ${t.action};
    color: ${t.white};
    border: 0;
    border-radius: ${t.radiusBtn};
    padding: 9px 14px;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
`;
