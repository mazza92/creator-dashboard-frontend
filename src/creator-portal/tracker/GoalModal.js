import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { creatorTokens as t } from '../../theme/creatorTokens';
import GoalSetup, { useGoalSuggestion } from './GoalSetup';

// One goal modal for the whole dashboard: "Edit goal" on the Tracker, and the prompt every creator without a
// goal sees when they open the dashboard (free and Pro), so all active creators get a goal.

const SNOOZE_KEY = 'nc_goal_prompt_snoozed';
// No prompt on top of first-run flows or checkout.
const SKIP_PATHS = ['/onboarding', '/creator/dashboard/settings', '/creator/dashboard/autopilot/setup'];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function snoozedToday() {
  try { return localStorage.getItem(SNOOZE_KEY) === today(); } catch (_) { return false; }
}

function snooze() {
  try { localStorage.setItem(SNOOZE_KEY, today()); } catch (_) { /* ignore */ }
}

export default function GoalModal({ onClose, onSaved, suggestion, title, intro, skipLabel = 'Cancel' }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return createPortal(
    <Back onClick={onClose}>
      <Card role="dialog" aria-modal="true" aria-labelledby="goal-modal-title" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="x" aria-label="Close" onClick={onClose}>×</button>
        <div className="head">
          <span className="emoji" aria-hidden="true">🎯</span>
          <h2 id="goal-modal-title">{title || 'How much do you want to make from brands this month?'}</h2>
          <p>{intro || 'Pick a goal and Polly plans your pitches to get there. Paid videos and free products both count.'}</p>
        </div>
        <GoalSetup suggestion={suggestion} variant="modal" onSaved={onSaved} onSkip={onClose} skipLabel={skipLabel}
          saveLabel="Save my goal" onUnavailable={onClose} />
      </Card>
    </Back>,
    document.body,
  );
}

// Dashboard-wide prompt: shows once a day to any creator without a goal until they set one.
export function GoalPrompt({ pathname = '' }) {
  const blocked = snoozedToday() || SKIP_PATHS.some((p) => pathname.startsWith(p));
  const [enabled] = useState(!blocked);
  const { data } = useGoalSuggestion(enabled);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled || !data || data.current) return undefined;
    const id = setTimeout(() => setOpen(true), 900); // let the page paint first
    return () => clearTimeout(id);
  }, [enabled, data]);

  const close = useCallback(() => { snooze(); setOpen(false); }, []);
  if (!open) return null;
  return (
    <GoalModal
      suggestion={data}
      onClose={close}
      onSaved={() => setOpen(false)}
      skipLabel="Later"
      title="Set your goal for this month"
      intro="How much do you want to make from brands? Pick one and Polly plans the pitches to get you there."
    />
  );
}

const fade = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const rise = keyframes`from { opacity: 0; transform: translateY(16px) scale(.98); } to { opacity: 1; transform: none; }`;

const Back = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(18, 20, 26, 0.45);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: ${fade} .18s ease-out;

  @media (max-width: 640px) { align-items: flex-end; padding: 0; }
`;

const Card = styled.div`
  position: relative;
  background: ${t.white};
  border-radius: 22px;
  width: min(560px, 100%);
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  padding: 28px 24px 22px;
  box-sizing: border-box;
  font-family: ${t.fontSans};
  box-shadow: 0 24px 60px rgba(18, 20, 26, 0.18);
  animation: ${rise} .22s ease-out;

  .x {
    position: absolute; top: 14px; right: 14px;
    width: 34px; height: 34px; border-radius: 50%; border: 0;
    background: ${t.subtle}; color: ${t.ink}; font-size: 20px; line-height: 1; cursor: pointer;
  }
  .head { display: grid; gap: 6px; margin: 0 0 16px; padding-right: 36px; }
  .emoji { font-size: 28px; line-height: 1; }
  h2 { margin: 4px 0 0; font-size: 21px; line-height: 1.25; font-weight: 700; color: ${t.ink}; letter-spacing: -0.01em; }
  .head p { margin: 0; font-size: 14.5px; line-height: 1.5; color: ${t.inkSoft}; }

  @media (max-width: 640px) {
    border-radius: 22px 22px 0 0;
    max-height: 92dvh;
    padding: 22px 16px calc(20px + env(safe-area-inset-bottom));
    h2 { font-size: 19px; }
  }
`;

const POLLY_PATH = '/creator/dashboard/for-you';

// When a saved goal comes with Polly's plan in chat, show it where creators already are: Polly.
// (The Tracker stays put: it refreshes in place.)
export function GoalPlanHandoff() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const onSaved = (e) => {
      if (!e?.detail?.posted_plan) return;
      if (location.pathname.startsWith('/creator/dashboard/tracker')) return;
      if (!location.pathname.startsWith(POLLY_PATH)) navigate(POLLY_PATH);
      setTimeout(() => { try { window.dispatchEvent(new Event('nc-polly-reload')); } catch (_) { /* ignore */ } }, 400);
    };
    window.addEventListener('nc-goal-saved', onSaved);
    return () => window.removeEventListener('nc-goal-saved', onSaved);
  }, [navigate, location.pathname]);
  return null;
}
