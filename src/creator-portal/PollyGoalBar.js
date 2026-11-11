import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';
import GoalModal from './tracker/GoalModal';
import { Flame } from './tracker/TrackerIcons';
import { money } from './tracker/trackerModel';

// Pinned at the top of Polly (outside the scrolling thread): the month's goal, progress, what needs the
// creator, and today's hot brand. One tap opens the Tracker. GET /api/tracker (same payload as the Tracker).

function monthName(key) {
  const [y, m] = String(key || '').split('-').map(Number);
  if (!y || !m) return 'This month';
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long' });
}

export default function PollyGoalBar({ onOpenTracker }) {
  const [data, setData] = useState(null);
  const [goalOpen, setGoalOpen] = useState(false);

  const load = useCallback(() => {
    apiClient.get('/api/tracker')
      .then(({ data: d }) => { if (d && d.success !== false && d.goal) setData(d); })
      .catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    window.addEventListener('nc-tracker-changed', load);
    return () => window.removeEventListener('nc-tracker-changed', load);
  }, [load]);

  if (!data) return null;
  const g = data.goal;
  const amount = Number(g.amount_cents) || 0;
  const paid = Number(g.paid_cents) || 0;
  const gifted = Number(g.gifted_cents) || 0;
  const total = Number(g.total_cents) || paid + gifted;
  const paidW = amount ? Math.min(100, (paid / amount) * 100) : 0;
  const giftW = amount ? Math.min(100 - paidW, (gifted / amount) * 100) : 0;
  const moves = Number(data.your_move_count) || 0;
  const hot = data.hot && data.hot.brand_name ? data.hot : null;

  return (
    <Bar aria-label="Your monthly goal">
      <button type="button" className="main" onClick={onOpenTracker}>
        <span className="top">
          <span className="lbl">🎯 {monthName(data.month)} goal</span>
          <span className="amt"><b>{money(total)}</b> of {money(amount)}</span>
        </span>
        <span className="track" aria-hidden="true">
          <span className="paid" style={{ width: `${paidW}%` }} />
          <span className="gift" style={{ width: `${giftW}%` }} />
        </span>
        <span className="meta">
          {moves ? <span className="move">{moves} thing{moves === 1 ? '' : 's'} need{moves === 1 ? 's' : ''} you</span>
            : <span>{data.days_left} day{data.days_left === 1 ? '' : 's'} left</span>}
          {hot ? <span className="hot"><Flame size={12} /> {hot.brand_name}</span> : null}
        </span>
      </button>
      {g.set ? (
        <button type="button" className="cta" onClick={onOpenTracker}>Tracker →</button>
      ) : (
        <button type="button" className="cta set" onClick={() => setGoalOpen(true)}>Set my goal</button>
      )}
      {goalOpen ? (
        <GoalModal onClose={() => setGoalOpen(false)} onSaved={() => { setGoalOpen(false); load(); }} />
      ) : null}
    </Bar>
  );
}

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 16px 2px;
  padding: 10px 12px;
  border: 1px solid ${t.line};
  border-radius: 14px;
  background: ${t.white};
  box-shadow: 0 1px 2px rgba(18, 20, 26, 0.04);
  font-family: ${t.fontSans};
  min-width: 0;

  .main {
    flex: 1;
    min-width: 0;
    display: grid;
    gap: 6px;
    border: 0;
    background: none;
    padding: 0;
    text-align: left;
    font: inherit;
    color: ${t.ink};
    cursor: pointer;
  }
  .top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; min-width: 0; }
  .lbl { font-size: 12px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: ${t.muted}; white-space: nowrap; }
  .amt { font-size: 13.5px; color: ${t.inkSoft}; white-space: nowrap; }
  .amt b { color: ${t.ink}; font-size: 15px; }
  .track { display: flex; height: 6px; border-radius: 999px; background: ${t.subtle}; overflow: hidden; }
  .paid { background: ${t.accent}; }
  .gift { background: #e0a84a; }
  .meta { display: flex; gap: 10px; font-size: 12.5px; color: ${t.muted}; min-width: 0; }
  .meta > span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .move { color: ${t.hot}; font-weight: 600; }
  .hot { display: inline-flex; align-items: center; gap: 4px; color: ${t.ink}; }

  .cta {
    flex-shrink: 0;
    border: 1px solid ${t.line};
    background: ${t.white};
    color: ${t.ink};
    border-radius: 999px;
    padding: 7px 12px;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  .cta.set { background: ${t.ink}; color: ${t.white}; border-color: ${t.ink}; }

  @media (max-width: 840px) {
    margin: 6px 12px 2px;
    padding: 9px 10px;
    .cta { padding: 6px 10px; font-size: 12.5px; }
  }
`;
