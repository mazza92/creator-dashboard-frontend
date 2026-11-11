import React from 'react';
import styled from 'styled-components';
import { creatorTokens as t } from '../theme/creatorTokens';
import { money } from './tracker/trackerModel';

// Polly's "here's your plan" card, posted right after a goal is set (backend creator_tracker.goal_plan_message):
// goal in plain words, this week's brands day by day, and one next step that fits the creator.

const MAX_PER_DAY = 3;

export default function PollyGoalPlanCard({ plan, chips = [], onChip, disabled }) {
  if (!plan || !Array.isArray(plan.days) || !plan.days.length) return null;
  const [primary, ...rest] = chips;
  return (
    <Card aria-label="Your plan this week">
      <Head>
        <span className="kicker">Your plan · {plan.month}</span>
        <span className="goal">{money(plan.amount_cents)} goal</span>
      </Head>
      <Stats>
        <div><b>{plan.per_week}</b><span>brands a week</span></div>
        <div><b>~{plan.deals}</b><span>collab{plan.deals === 1 ? '' : 's'} to land</span></div>
        <div><b>{plan.paid}</b><span>paid asks this week</span></div>
      </Stats>
      {plan.reply_one_in && plan.deal_one_in ? (
        <Why>Usually 1 in {plan.reply_one_in} brands writes back, and 1 in {plan.deal_one_in} of those says yes.
          That&apos;s why we pitch a lot of brands, and I do the writing.</Why>
      ) : null}
      <Days>
        {plan.days.map((d) => (
          <Day key={d.date}>
            <span className={d.label === 'Today' ? 'when today' : 'when'}>{d.label}</span>
            <span className="brands">
              {d.brands.slice(0, MAX_PER_DAY).map((b) => (
                <Brand key={b.brand_id} $paid={b.offer === 'paid'}>
                  {b.brand_name}<i>{b.offer === 'paid' ? 'paid' : 'gifted'}</i>
                </Brand>
              ))}
              {d.brands.length > MAX_PER_DAY ? <span className="more">+{d.brands.length - MAX_PER_DAY} more</span> : null}
            </span>
          </Day>
        ))}
      </Days>
      {plan.note ? <Note>{plan.note}</Note> : null}
      {primary ? (
        <Actions>
          <button type="button" className="primary" disabled={disabled} onClick={() => onChip && onChip(primary)}>
            {primary.label}
          </button>
          {rest.map((c) => (
            <button key={c.id || c.label} type="button" className="ghost" disabled={disabled}
              onClick={() => onChip && onChip(c)}>
              {c.label}
            </button>
          ))}
        </Actions>
      ) : null}
    </Card>
  );
}

const Card = styled.div`
  margin-top: 10px;
  width: 100%;
  max-width: 560px;
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid ${t.line};
  border-radius: 16px;
  background: ${t.white};
  padding: 14px 14px 12px;
  display: grid;
  gap: 12px;
  font-family: ${t.fontSans};
  color: ${t.ink};
`;

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  .kicker { font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${t.accent}; }
  .goal { font-size: 15px; font-weight: 700; }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  div { background: ${t.subtle}; border-radius: 12px; padding: 10px; display: grid; gap: 2px; min-width: 0; }
  b { font-size: 20px; line-height: 1.1; }
  span { font-size: 12.5px; color: ${t.muted}; }
`;

const Why = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${t.inkSoft};
`;

const Days = styled.div`
  display: grid;
  gap: 2px;
  border-top: 1px solid ${t.line};
  padding-top: 6px;
`;

const Day = styled.div`
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  padding: 7px 0;
  border-bottom: 1px solid ${t.subtle};
  &:last-child { border-bottom: 0; }

  .when { font-size: 13px; font-weight: 600; color: ${t.inkSoft}; padding-top: 3px; white-space: nowrap; }
  .when.today { color: ${t.hot}; }
  .brands { display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }
  .more { font-size: 12.5px; color: ${t.muted}; align-self: center; }

  @media (max-width: 420px) { grid-template-columns: 74px minmax(0, 1fr); gap: 8px; .when { font-size: 12.5px; } }
`;

const Brand = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 4px 9px;
  border-radius: 999px;
  border: 1px solid ${t.line};
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  i {
    font-style: normal;
    font-size: 11px;
    font-weight: 600;
    color: ${(p) => (p.$paid ? t.accentDeep : '#9a5b00')};
  }
`;

const Note = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${t.ink};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  button {
    border-radius: 999px;
    padding: 10px 16px;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  button:disabled { opacity: .6; cursor: default; }
  .primary { background: ${t.ink}; color: ${t.white}; border: 1px solid ${t.ink}; }
  .ghost { background: ${t.white}; color: ${t.ink}; border: 1px solid ${t.line}; }

  @media (max-width: 420px) {
    button { width: 100%; }
  }
`;
