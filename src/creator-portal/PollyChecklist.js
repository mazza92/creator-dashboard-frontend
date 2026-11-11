import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';
import GoalModal from './tracker/GoalModal';

// Getting started, inside Polly's chat (it scrolls with the thread, nothing pinned): goal set, first pitches
// sent, plan seen on the calendar. Hidden once all three are done or dismissed. GET /api/tracker.getting_started.

export function PollyChecklist({ onOpenTracker }) {
  const [gs, setGs] = useState(null);
  const [goalOpen, setGoalOpen] = useState(false);

  const load = useCallback(() => {
    apiClient.get('/api/tracker')
      .then(({ data: d }) => { if (d && d.success !== false) setGs(d.getting_started || null); })
      .catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    window.addEventListener('nc-tracker-changed', load);
    return () => window.removeEventListener('nc-tracker-changed', load);
  }, [load]);

  const hide = () => {
    setGs((d) => (d ? { ...d, show: false } : d));
    apiClient.post('/api/tracker/checklist/hide').catch(() => {});
  };

  if (!gs?.show) return null;
  return (
    <Checklist aria-label="Getting started">
      <div className="h">
        <b>Getting started</b>
        <span>{gs.done} of {gs.total}</span>
        <button type="button" aria-label="Hide getting started" onClick={hide}>×</button>
      </div>
      <span className="bar" aria-hidden="true"><i style={{ width: `${(gs.done / gs.total) * 100}%` }} /></span>
      <ul>
        <li className={gs.goal ? 'done' : ''}>
          <span className="bx">{gs.goal ? '✓' : ''}</span>
          {gs.goal ? 'Set your goal' : <button type="button" onClick={() => setGoalOpen(true)}>Set your goal</button>}
        </li>
        <li className={gs.pitched ? 'done' : ''}><span className="bx">{gs.pitched ? '✓' : ''}</span>Send your first pitches</li>
        <li className={gs.calendar ? 'done' : ''}>
          <span className="bx">{gs.calendar ? '✓' : ''}</span>
          {gs.calendar ? 'See your plan on the calendar' : <button type="button" onClick={onOpenTracker}>See your plan on the calendar</button>}
        </li>
      </ul>
      {goalOpen ? <GoalModal onClose={() => setGoalOpen(false)} onSaved={() => { setGoalOpen(false); load(); }} /> : null}
    </Checklist>
  );
}

const Checklist = styled.div`
  margin: 4px auto 10px;
  max-width: 600px;
  padding: 10px 12px;
  border: 1px solid ${t.line};
  border-radius: 14px;
  background: ${t.white};
  font-family: ${t.fontSans};
  display: grid;
  gap: 7px;

  .h { display: flex; align-items: center; gap: 8px; font-size: 13px; }
  .h span { color: ${t.muted}; font-size: 12.5px; }
  .h button { margin-left: auto; border: 0; background: none; color: ${t.muted}; font-size: 18px; line-height: 1; cursor: pointer; padding: 0 2px; }
  .bar { height: 4px; border-radius: 999px; background: ${t.subtle}; overflow: hidden; display: block; }
  .bar i { display: block; height: 100%; background: ${t.accent}; border-radius: 999px; }
  ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 5px; }
  li { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: ${t.ink}; }
  li.done { color: ${t.muted}; text-decoration: line-through; }
  li button { border: 0; background: none; padding: 0; font: inherit; font-weight: 600; color: ${t.ink}; text-decoration: underline; cursor: pointer; text-align: left; }
  .bx {
    width: 17px; height: 17px; border-radius: 50%; border: 1.5px solid ${t.line}; flex-shrink: 0;
    display: grid; place-items: center; font-size: 10px; color: ${t.white};
  }
  li.done .bx { background: ${t.accent}; border-color: ${t.accent}; }

`;
