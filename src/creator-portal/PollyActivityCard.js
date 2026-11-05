import React from 'react';
import styled from 'styled-components';
import { Clock, CornerUpRight, ExternalLink, Eye, MessageCircle, PenLine, Send } from 'lucide-react';
import { creatorTokens as t } from '../theme/creatorTokens';
import { openInGmail } from './openInGmail';

// "While you were away": what Polly did and what brands did, newest proof first. Rows that need the creator
// carry their own one-tap action; everything else is proof the outreach ran without them.

const KIND = {
  reply: { Icon: MessageCircle, tone: 'win' },
  kit_view: { Icon: Eye, tone: 'win' },
  followup_sent: { Icon: CornerUpRight, tone: 'done' },
  sent: { Icon: Send, tone: 'done' },
  next: { Icon: Clock, tone: 'next' },
  todo_followup: { Icon: PenLine, tone: 'todo' },
  todo_draft: { Icon: PenLine, tone: 'todo' },
};

export function ago(iso, now = Date.now()) {
  const at = Date.parse(iso || '');
  if (!at) return '';
  const diff = Math.round((at - now) / 60000);
  const abs = Math.abs(diff);
  if (abs < 1) return 'just now';
  const unit = abs < 60 ? [abs, 'min'] : abs < 1440 ? [Math.round(abs / 60), 'h'] : [Math.round(abs / 1440), 'd'];
  const label = `${unit[0]}${unit[1] === 'min' ? ' min' : unit[1]}`;
  return diff < 0 ? `${label} ago` : `in ${label}`;
}

export default function PollyActivityCard({ activity, onChip, disabled }) {
  const items = activity?.items || [];
  if (!items.length) return null;
  const counts = activity.counts || {};
  const month = activity.month || {};
  const proof = items.filter((i) => !i.type.startsWith('todo'));
  const todo = items.filter((i) => i.type.startsWith('todo'));
  const stats = [
    counts.sent ? `${counts.sent} sent` : null,
    counts.followups ? `${counts.followups} follow-up${counts.followups > 1 ? 's' : ''}` : null,
    counts.kit_views ? `${counts.kit_views} kit view${counts.kit_views > 1 ? 's' : ''}` : null,
    counts.replies ? `${counts.replies} repl${counts.replies > 1 ? 'ies' : 'y'}` : null,
  ].filter(Boolean);
  const pct = month.goal ? Math.min(100, Math.round((100 * (month.pitches || 0)) / month.goal)) : 0;

  const row = (item, idx) => {
    const { Icon, tone } = KIND[item.type] || KIND.sent;
    return (
      <Row key={`${item.type}-${item.brand_id || idx}`}>
        <Dot className={tone}><Icon size={15} aria-hidden="true" /></Dot>
        <RowText>
          <span><b>{item.brand_name}</b> {item.text}</span>
          <Meta>
            {item.at && item.type !== 'next' ? <span>{ago(item.at)}</span> : null}
            {item.gmail_url ? (
              <a href={item.gmail_url} target="_blank" rel="noopener noreferrer" onClick={(e) => openInGmail(e, item.gmail_url)}>
                View in Gmail <ExternalLink size={12} aria-hidden="true" />
              </a>
            ) : null}
          </Meta>
        </RowText>
        {item.chip ? (
          <RowBtn type="button" className={tone === 'todo' ? 'primary' : ''} disabled={disabled}
            onClick={() => onChip && onChip(item.chip)}>
            {item.chip.label}
          </RowBtn>
        ) : null}
      </Row>
    );
  };

  return (
    <Card aria-label="While you were away">
      <Head>
        <Kicker>While you were away</Kicker>
        {stats.length ? <Stats>{stats.map((s) => <span key={s}>{s}</span>)}</Stats> : null}
      </Head>
      {proof.length ? <List>{proof.map(row)}</List> : null}
      {todo.length ? (
        <>
          <SubHead>Needs you</SubHead>
          <List>{todo.map(row)}</List>
        </>
      ) : null}
      {month.goal ? (
        <Month>
          <div><span>This month</span><b>{month.pitches || 0} of {month.goal} pitches sent</b></div>
          <Bar aria-hidden="true"><i style={{ width: `${pct}%` }} /></Bar>
        </Month>
      ) : null}
    </Card>
  );
}

const Card = styled.section`
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  margin-top: 12px;
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 16px;
  padding: 14px;
  @media (max-width: 480px) { padding: 12px; }
`;

const Head = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
`;

const Kicker = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${t.accent};
`;

const Stats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  span {
    font-size: 12px;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 999px;
    background: #f1efe9;
    color: ${t.ink};
  }
`;

const SubHead = styled.div`
  margin: 12px 0 6px;
  font-size: 12px;
  font-weight: 700;
  color: ${t.muted};
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 2px;
`;

const Row = styled.li`
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  & + & { border-top: 1px solid ${t.line}; }
  @media (max-width: 420px) {
    grid-template-columns: 28px minmax(0, 1fr);
    > button { grid-column: 2; justify-self: start; }
  }
`;

const Dot = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eef0f3;
  color: #3a3f4a;
  &.win { background: #e7f3ee; color: #165c3f; }
  &.done { background: #eef0f3; color: #3a3f4a; }
  &.next { background: #faf6ea; color: #7a5a12; }
  &.todo { background: #fdf0e7; color: #9a3f0e; }
`;

const RowText = styled.div`
  min-width: 0;
  display: grid;
  gap: 2px;
  font-size: 14px;
  line-height: 1.4;
  color: ${t.ink};
  b { font-weight: 700; }
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: ${t.muted};
  a {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    color: ${t.accent};
    font-weight: 600;
    text-decoration: none;
  }
  a:hover { text-decoration: underline; }
`;

const RowBtn = styled.button`
  min-height: 36px;
  padding: 6px 12px;
  border-radius: ${t.radiusBtn};
  border: 1px solid ${t.line};
  background: ${t.white};
  color: ${t.ink};
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  &.primary { background: ${t.ink}; border-color: ${t.ink}; color: #fff; }
  &:disabled { opacity: 0.6; cursor: default; }
  &:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }
`;

const Month = styled.div`
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid ${t.line};
  display: grid;
  gap: 6px;
  font-size: 13px;
  > div:first-child { display: flex; justify-content: space-between; gap: 8px; color: ${t.muted}; }
  b { color: ${t.ink}; font-weight: 700; }
`;

const Bar = styled.div`
  height: 6px;
  border-radius: 999px;
  background: #eceae4;
  overflow: hidden;
  i { display: block; height: 100%; background: #1f7a4d; border-radius: 999px; }
`;
