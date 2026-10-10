import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';

const Card = styled.div`
  margin-top: 12px;
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 18px;
  padding: 14px 16px 12px;
  font-family: ${t.fontSans};
  color: ${t.ink};
  min-width: 0;
`;

const Head = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
  .kicker {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${t.accent};
  }
  .count { font-size: 12.5px; color: ${t.muted}; }
`;

const Track = styled.div`
  height: 6px;
  border-radius: 999px;
  background: ${t.line};
  overflow: hidden;
  margin-bottom: 6px;
  div { height: 100%; background: ${t.accent}; border-radius: 999px; transition: width 0.3s; }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 10px;
  align-items: start;
  padding: 10px 0;
  & + & { border-top: 1px solid ${t.line}; }
  opacity: ${(p) => (p.$muted ? 0.55 : 1)};
  .mark {
    width: 22px; height: 22px; border-radius: 50%;
    border: 1.5px solid ${(p) => (p.$done ? '#16A34A' : t.line)};
    background: ${(p) => (p.$done ? '#16A34A' : t.white)};
    color: #fff; font-size: 12px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    margin-top: 1px;
  }
  .label { font-size: 14px; font-weight: 600; text-decoration: ${(p) => (p.$done ? 'line-through' : 'none')}; }
  .detail { font-size: 12.5px; color: ${t.inkSoft}; line-height: 1.45; margin-top: 2px; }
  .side { font-size: 12.5px; color: ${t.muted}; white-space: nowrap; padding-top: 2px; }
`;

const Go = styled.button`
  border: 1px solid ${t.ink};
  background: ${t.ink};
  color: ${t.white};
  border-radius: 999px;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:disabled { opacity: 0.5; cursor: default; }
`;

const Foot = styled.div`
  border-top: 1px solid ${t.line};
  margin-top: 2px;
  padding-top: 10px;
  font-size: 12.5px;
  color: ${t.muted};
  line-height: 1.5;
`;

function plural(n, word, many) {
  return `${n} ${n === 1 ? word : (many || `${word}s`)}`;
}

/** Pro's week as a checklist. The latest board in the thread refreshes itself from the server. */
export default function MondayBoard({ board: initial, live, busy, onChip }) {
  const [board, setBoard] = useState(initial);

  useEffect(() => {
    setBoard(initial);
  }, [initial]);

  useEffect(() => {
    if (!live) return undefined;
    let cancelled = false;
    apiClient.get('/api/polly/board')
      .then((res) => { if (!cancelled && res.data?.board) setBoard(res.data.board); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [live]);

  if (!board?.tasks?.length) return null;
  const tasks = board.tasks;
  const done = tasks.filter((task) => task.done).length;
  const stats = board.stats || {};

  return (
    <Card>
      <Head>
        <span className="kicker">Monday board · week of {board.week_label}</span>
        <span className="count">{done} of {tasks.length} done</span>
      </Head>
      <Track><div style={{ width: `${Math.round((100 * done) / tasks.length)}%` }} /></Track>
      {tasks.map((task) => (
        <Row key={task.id} $done={task.done} $muted={task.locked && !task.done}>
          <span className="mark" aria-hidden="true">{task.done ? '✓' : task.locked ? '🔒' : ''}</span>
          <div style={{ minWidth: 0 }}>
            <div className="label">{task.label}</div>
            {!task.done ? (
              <div className="detail">
                {task.locked ? 'Unlocks once Gmail is connected and your kit is published.' : task.detail}
              </div>
            ) : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {task.progress ? <span className="side">{task.progress.done}/{task.progress.total}</span> : null}
            {task.chip ? (
              <Go type="button" disabled={busy} onClick={() => onChip(task.chip)} title={task.chip.label}>
                Go
              </Go>
            ) : null}
          </div>
        </Row>
      ))}
      <Foot>
        This week: {plural(stats.pitched || 0, 'brand')} pitched · {plural(stats.kit_views || 0, 'kit view')} ·{' '}
        {plural(stats.replies || 0, 'reply', 'replies')}
        {stats.month_target ? <> · {stats.month_sent || 0}/{stats.month_target} this month</> : null}
      </Foot>
    </Card>
  );
}
