import React from 'react';
import styled from 'styled-components';
import { Check, ExternalLink } from 'lucide-react';
import { creatorTokens as t } from '../theme/creatorTokens';
import { openInGmail } from './openInGmail';

// The moment the pitches go out: proof (each email, a link to it in their Gmail), what Polly does next with
// real dates, the one thing to know when a brand answers, and (free) one offer to keep going.

function day(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function PollySentCard({ summary, onChip, disabled }) {
  const sent = summary?.sent || [];
  if (!sent.length) return null;
  const [day4, day10] = summary.followups || [];
  const n = sent.length;

  return (
    <Card aria-label="Pitches sent">
      <Head>
        <Badge aria-hidden="true"><Check size={18} strokeWidth={3} /></Badge>
        <div>
          <h3>{n} pitch{n > 1 ? 'es' : ''} sent</h3>
          {summary.from ? <span>from {summary.from}</span> : null}
        </div>
      </Head>

      <Sent>
        {sent.map((s) => (
          <li key={s.brand_id || s.brand_name}>
            <div>
              <b>{s.brand_name}</b>
              {s.to ? <span>{s.to}</span> : null}
            </div>
            {s.gmail_url ? (
              <a href={s.gmail_url} target="_blank" rel="noopener noreferrer" onClick={(e) => openInGmail(e, s.gmail_url)}>
                View <ExternalLink size={12} aria-hidden="true" />
              </a>
            ) : null}
          </li>
        ))}
      </Sent>

      <Next>
        <h4>What happens next</h4>
        <ol>
          <li><i /><span><b>Replies</b> land straight in your Gmail inbox</span></li>
          {day4 ? <li><i /><span><b>{day(day4)}</b> · I follow up with anyone who&apos;s quiet</span></li> : null}
          {day10 ? <li><i /><span><b>{day(day10)}</b> · last follow-up, same thread</span></li> : null}
        </ol>
      </Next>

      {summary.rates ? (
        <Tip>
          <span>If a brand asks your rate: <b>{summary.rates}</b></span>
          {!summary.rates_saved ? (
            <button type="button" disabled={disabled}
              onClick={() => onChip && onChip({ id: 'save_rates', label: 'Put these rates on my kit', action: 'save_rates' })}>
              Add to my kit
            </button>
          ) : null}
        </Tip>
      ) : null}

      {!summary.pro_offer && summary.credits_left > 0 ? (
        <More type="button" disabled={disabled}
          onClick={() => onChip && onChip({ id: 'more_brands', label: 'Find my next brands', action: 'suggest_brands' })}>
          Pitch {summary.credits_left} more brand{summary.credits_left > 1 ? 's' : ''} · {summary.credits_left} free left →
        </More>
      ) : null}

      {summary.pro_offer ? (
        <Pro>
          <b>Want me to keep going?</b>
          <span>I&apos;ll pitch 15 new brands a week for you, follow up and draft your replies. You just answer.</span>
          <button type="button" disabled={disabled}
            onClick={() => onChip && onChip({ id: 'unlock_pro', label: 'Keep pitching for me', action: 'unlock_pro' })}>
            Keep pitching for me · $19/mo
          </button>
        </Pro>
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
  padding: 16px;
  display: grid;
  gap: 14px;
  @media (max-width: 480px) { padding: 14px; }
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  h3 { margin: 0; font-size: 18px; line-height: 1.25; color: ${t.ink}; }
  span { font-size: 13px; color: ${t.muted}; word-break: break-all; }
  > div { min-width: 0; display: grid; gap: 2px; }
`;

const Badge = styled.span`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1f7a4d;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const Sent = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid ${t.line};
  border-radius: 12px;
  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 12px;
    min-width: 0;
  }
  li + li { border-top: 1px solid ${t.line}; }
  li > div { min-width: 0; display: grid; gap: 1px; }
  b { font-size: 14px; color: ${t.ink}; }
  li span { font-size: 12.5px; color: ${t.muted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  a {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 32px;
    padding: 0 10px;
    border-radius: 999px;
    border: 1px solid ${t.line};
    font-size: 12.5px;
    font-weight: 600;
    color: ${t.ink};
    text-decoration: none;
  }
`;

const Next = styled.div`
  h4 { margin: 0 0 8px; font-size: 13px; font-weight: 700; color: ${t.muted}; text-transform: uppercase; letter-spacing: 0.05em; }
  ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
  li { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; line-height: 1.45; color: ${t.inkSoft}; }
  li i {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    margin-top: 6px;
    border-radius: 50%;
    background: #1f7a4d;
  }
  b { color: ${t.ink}; font-weight: 650; }
`;

const Tip = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f6f4ee;
  font-size: 13.5px;
  line-height: 1.45;
  color: ${t.inkSoft};
  b { color: ${t.ink}; }
  button {
    min-height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid ${t.line};
    background: ${t.white};
    font: inherit;
    font-size: 12.5px;
    font-weight: 600;
    color: ${t.ink};
    cursor: pointer;
  }
`;

const More = styled.button`
  width: 100%;
  min-height: 48px;
  border: 0;
  border-radius: 12px;
  background: ${t.ink};
  color: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  &:disabled { opacity: 0.6; }
`;

const Pro = styled.div`
  display: grid;
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  background: #12141a;
  color: #fff;
  b { font-size: 15.5px; }
  span { font-size: 13.5px; line-height: 1.5; color: #d9dce2; }
  button {
    margin-top: 4px;
    min-height: 44px;
    border-radius: 12px;
    border: 0;
    background: #7ce0b8;
    color: #12141a;
    font: inherit;
    font-size: 14.5px;
    font-weight: 800;
    cursor: pointer;
  }
  button:disabled { opacity: 0.6; }
`;
