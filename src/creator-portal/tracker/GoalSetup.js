import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { apiClient } from '../../config/api';
import { creatorTokens as t } from '../../theme/creatorTokens';
import { centsFromInput, money, pitchMath } from './trackerModel';

// One monthly collab goal: paid deals + gifted products at retail value. Used in onboarding (after niches),
// as a Polly card for creators without a goal, in Account Settings and from the Tracker header.
// GET /api/tracker/goal/suggest -> starter / suggested / stretch; POST /api/tracker/goal.

const GOAL_MIN_CENTS = 5000;
const OPTION_LABEL = { starter: 'Easy start', suggested: 'Recommended', stretch: 'Big month' };

function compactFollowers(n) {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1).replace(/\.0$/, '')}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`;
  return String(v);
}

function nicheLabel(id) {
  return String(id || '').replace(/_/g, ' ').toLowerCase();
}

export function useGoalSuggestion(enabled = true) {
  const [state, setState] = useState({ loaded: false, data: null, error: false });
  useEffect(() => {
    if (!enabled) return undefined;
    let live = true;
    apiClient.get('/api/tracker/goal/suggest')
      .then(({ data }) => {
        if (!live) return;
        const ok = data && Array.isArray(data.options) && data.options.length;
        setState({ loaded: true, data: ok ? data : null, error: !ok });
      })
      .catch(() => { if (live) setState({ loaded: true, data: null, error: true }); });
    return () => { live = false; };
  }, [enabled]);
  return state;
}

export function GoalBasis({ basis }) {
  if (!basis) return null;
  const bits = [];
  if (basis.followers) bits.push(`${compactFollowers(basis.followers)} followers`);
  if (basis.niches?.length) bits.push(basis.niches.slice(0, 2).map(nicheLabel).join(' and '));
  return (
    <Basis>
      {bits.length ? <>Creators like you (<b>{bits.join(', ')}</b>) </> : 'Creators like you '}
      usually get <b>{money(basis.rate_low_cents)}–{money(basis.rate_high_cents)} per paid video</b>
      {basis.gifted_avg_cents ? <>, plus free products worth about <b>{money(basis.gifted_avg_cents)}</b> each</> : null}.
    </Basis>
  );
}

export default function GoalSetup({
  suggestion: given,
  variant = 'card',
  onSaved,
  onSkip,
  onUnavailable,
  saveLabel = 'Set my goal',
  skipLabel = 'Skip for now',
}) {
  const fetched = useGoalSuggestion(!given);
  const data = given || fetched.data;
  const current = data?.current?.amount_cents ? Number(data.current.amount_cents) : null;
  const options = useMemo(() => data?.options || [], [data]);
  const [picked, setPicked] = useState(null);
  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!data || picked) return;
    const match = current && options.find((o) => Number(o.amount_cents) === current);
    if (current && !match) {
      setPicked('custom');
      setCustom(String(Math.round(current / 100)));
    } else {
      setPicked(match?.id || data.recommended || 'suggested');
    }
  }, [data, current, options, picked]);

  useEffect(() => {
    if (!given && fetched.loaded && !fetched.data && onUnavailable) onUnavailable();
  }, [given, fetched.loaded, fetched.data, onUnavailable]);

  if (!data) return null;

  const option = options.find((o) => o.id === picked);
  const amountCents = picked === 'custom' ? centsFromInput(custom) : Number(option?.amount_cents) || null;
  const baseMath = (options.find((o) => o.id === 'suggested') || options[0])?.math;
  const math = option?.math && picked !== 'custom' ? option.math : pitchMath(amountCents, baseMath);
  const tooLow = amountCents != null && amountCents < GOAL_MIN_CENTS;

  const save = async () => {
    if (!amountCents || tooLow) {
      setError(`Pick a goal of at least ${money(GOAL_MIN_CENTS)}.`);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { data: res } = await apiClient.post('/api/tracker/goal', {
        amount_cents: amountCents,
        source: picked === 'custom' ? 'custom' : 'suggested',
      });
      if (res?.success === false) throw new Error(res.error || 'Could not save');
      try { window.dispatchEvent(new Event('nc-tracker-changed')); } catch (_) { /* ignore */ }
      // Polly posted the week's plan in chat: the layout takes the creator there (see CreatorDashboardLayout).
      try { window.dispatchEvent(new CustomEvent('nc-goal-saved', { detail: res?.goal || {} })); } catch (_) { /* ignore */ }
      if (onSaved) onSaved(res?.goal || { amount_cents: amountCents, math });
    } catch (err) {
      setError(err?.response?.data?.error === 'amount_required' ? 'Type an amount in dollars.' : 'Could not save your goal. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Wrap $variant={variant}>
      <GoalBasis basis={data.basis} />
      <Options role="radiogroup" aria-label="Monthly goal">
        {options.map((o) => (
          <Option
            key={o.id}
            type="button"
            role="radio"
            aria-checked={picked === o.id}
            $on={picked === o.id}
            onClick={() => { setPicked(o.id); setError(''); }}
          >
            <span className={o.id === data.recommended ? 'tag rec' : 'tag'}>{OPTION_LABEL[o.id] || o.id}</span>
            <span className="v">{money(o.amount_cents)}</span>
            <span className="k">about {o.math?.deals || o.deals} collab{(o.math?.deals || o.deals) === 1 ? '' : 's'}</span>
          </Option>
        ))}
      </Options>
      <Custom>
        <label htmlFor={`goal-custom-${variant}`}>Or pick your own: $</label>
        <input
          id={`goal-custom-${variant}`}
          type="text"
          inputMode="numeric"
          placeholder={options[1] ? String(Math.round(options[1].amount_cents / 100)) : '500'}
          value={custom}
          onFocus={() => setPicked('custom')}
          onChange={(e) => { setCustom(e.target.value.replace(/[^\d.,]/g, '').slice(0, 9)); setPicked('custom'); setError(''); }}
        />
        <span className="per">a month</span>
      </Custom>
      {math && !tooLow ? (
        <MathLine aria-live="polite">
          <b>Your plan: pitch about {Math.max(1, Math.round(math.pitches / 4.3))} brands a week.</b> Usually 1 in
          {' '}{Math.max(1, Math.round(1 / (math.reply_rate || 1)))} brands writes back, and 1 in
          {' '}{Math.max(1, Math.round(1 / (math.deal_rate || 1)))} of those says yes. Polly finds the brands for you.
        </MathLine>
      ) : null}
      <Note>Free products count at their store price. You can change your goal any time.</Note>
      {error ? <Err role="alert">{error}</Err> : null}
      <Actions>
        <button type="button" className="primary" onClick={save} disabled={saving || !amountCents}>
          {saving ? 'Planning your week…' : saveLabel}
        </button>
        {onSkip ? <button type="button" className="ghost" onClick={onSkip} disabled={saving}>{skipLabel}</button> : null}
      </Actions>
    </Wrap>
  );
}

const Wrap = styled.div`
  display: grid;
  gap: 12px;
  min-width: 0;
  font-family: ${t.fontSans};
  color: ${t.ink};
`;

const Basis = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${t.inkSoft};
  b { font-weight: 600; color: ${t.ink}; }
`;

const Options = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 420px) { grid-template-columns: minmax(0, 1fr); }
`;

const Option = styled.button`
  display: grid;
  gap: 2px;
  text-align: left;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${(p) => (p.$on ? t.accent : t.line)};
  box-shadow: ${(p) => (p.$on ? `inset 0 0 0 1px ${t.accent}` : 'none')};
  background: ${(p) => (p.$on ? t.accentSoft : t.white)};
  font: inherit;
  color: inherit;
  cursor: pointer;
  min-width: 0;

  .tag { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${t.muted}; }
  .tag.rec { color: ${t.accentDeep}; }
  .v { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.2; }
  .k { font-size: 12px; color: ${t.muted}; }

  &:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }

  @media (max-width: 420px) {
    grid-template-columns: auto 1fr auto;
    align-items: baseline;
    gap: 10px;
    padding: 10px 12px;
    .v { font-size: 18px; }
  }
`;

const Custom = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  font-size: 14px;
  color: ${t.inkSoft};
  label { white-space: nowrap; }

  input {
    width: 96px;
    min-width: 0;
    flex: 0 1 96px;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid ${t.line};
    font: inherit;
    font-size: 15px;
    color: ${t.ink};
    background: ${t.white};
  }
  input:focus { outline: 2px solid ${t.accentBorder}; border-color: ${t.accent}; }
  .per { color: ${t.muted}; white-space: nowrap; }
`;

const MathLine = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${t.inkSoft};
  background: ${t.subtle};
  border-radius: 10px;
  padding: 10px 12px;
  font-variant-numeric: tabular-nums;
  b { color: ${t.ink}; }
`;

const Note = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${t.muted};
`;

const Err = styled.div`
  color: #b42318;
  font-size: 13px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;

  button { border-radius: ${t.radiusBtn}; padding: 10px 16px; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
  .primary { background: ${t.action}; color: ${t.white}; border: 0; }
  .primary:disabled { opacity: .6; cursor: default; }
  .ghost { background: none; border: 0; color: ${t.muted}; padding-left: 4px; }
`;
