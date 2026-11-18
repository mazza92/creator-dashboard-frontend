import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { creatorTokens as t } from '../theme/creatorTokens';

// While the first pitches are written (a few seconds): Polly's real steps, live, instead of a spinner.
// Steps tick off on a short timer; the batch replaces this card as soon as the pitches are back.

export function atWorkSteps({ niche, names = [], hot = false }) {
  const n = names.length || 3;
  const list = names.length ? ` (${names.join(', ')})` : '';
  return [
    `Scanning your ${niche ? `${niche} ` : ''}profile & portfolio…`,
    `Selecting ${n} high-intent brand${n === 1 ? '' : 's'}${list}…`,
    `Writing ${n} custom pitch${n === 1 ? '' : 'es'} tailored to each brand${hot ? ' and its UGC ads' : ''}…`,
  ];
}

export default function PollyAtWork({ avatar, niche, names, hot }) {
  const steps = atWorkSteps({ niche, names, hot });
  const [done, setDone] = useState(0);
  useEffect(() => {
    const a = setTimeout(() => setDone(1), 700);
    const b = setTimeout(() => setDone(2), 1600);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  return (
    <Card role="status" aria-live="polite">
      <Face>{avatar ? <img src={avatar} alt="" /> : null}</Face>
      <h3>Polly is on it</h3>
      <Steps>
        {steps.map((text, i) => {
          const state = i < done ? 'done' : i === done ? 'now' : 'next';
          return (
            <li key={text} className={state}>
              <span className="mark" aria-hidden="true">{state === 'done' ? '✓' : state === 'now' ? (i === 2 ? '✍️' : '•') : ''}</span>
              <span>{text}</span>
            </li>
          );
        })}
      </Steps>
    </Card>
  );
}

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 61, 139, 0.35); }
  50% { box-shadow: 0 0 0 10px rgba(255, 61, 139, 0); }
`;

const fadeIn = keyframes`from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; }`;

const Card = styled.div`
  width: 100%;
  max-width: 520px;
  margin: 12px auto;
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 20px;
  padding: 26px 22px 22px;
  text-align: center;
  font-family: ${t.fontSans};
  color: ${t.ink};
  box-sizing: border-box;
  h3 { margin: 12px 0 14px; font-size: 18px; font-weight: 800; }
`;

const Face = styled.div`
  width: 56px; height: 56px; margin: 0 auto; border-radius: 50%; background: #eee;
  animation: ${pulse} 1.6s ease-in-out infinite;
  img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
`;

const Steps = styled.ul`
  list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; text-align: left;
  li { display: flex; gap: 10px; align-items: flex-start; font-size: 14.5px; line-height: 1.4; animation: ${fadeIn} .3s ease; }
  li.next { opacity: 0.35; }
  li.now { font-weight: 600; }
  .mark {
    flex: none; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800; background: #f1efea; color: ${t.muted};
  }
  li.done .mark { background: ${t.accentSoft}; color: ${t.accent}; }
  li.now .mark { background: #ffe3ee; color: #ff3d8b; }
`;
