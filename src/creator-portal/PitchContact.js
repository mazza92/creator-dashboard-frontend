import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Info } from 'lucide-react';
import api from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';

// The "To:" line on a pitch: which kind of inbox it is (with a short tip), and "Not working?" to report it. A report
// is checked on our side; when there's a verified alternative it replaces this address (and the brand's directory
// contact when the old one is dead), so Send / Open email use it.

const CREATOR_INBOX = /^(pr|press|media|influencers?|creators?|collabs?|collaborations?|partnerships?|partners?|marketing|social|brand|brands|ambassadors?|affiliates?|ugc|community)([._-].*)?$/i;
const MAIN_INBOX = /^(hello|hi|hey|info|contact|contactus|enquiries|inquiries|team|mail|office|general|admin|support|help|care|customerservice|cs|service|sales|shop|orders?)([._-].*)?$/i;

export function inboxKind(email) {
  const local = String(email || '').split('@')[0].trim();
  if (!local) return '';
  if (CREATOR_INBOX.test(local)) return 'team';
  if (MAIN_INBOX.test(local)) return 'main';
  return 'direct';
}

const LABEL = { team: 'Creator / PR team', main: 'Main inbox', direct: 'Direct contact' };

function tipText(kind, brand) {
  const name = brand || 'This brand';
  if (kind === 'main') {
    return `${name} doesn't list a dedicated creator or PR person (common for smaller brands), so this goes to their main inbox, which their founders or marketing team read.`;
  }
  if (kind === 'team') return `This goes to ${name}'s team for creators, PR or partnerships: the people who decide on collabs.`;
  return `A direct contact at ${name}, the best inbox we found for creator collabs.`;
}

export const REPORT_RESULT = {
  replaced: (e) => `Thanks! That inbox wasn't working, so we switched to ${e}. It's verified, and every creator gets the fix.`,
  alternative: (e) => `Thanks! We found another verified contact: ${e}. Your pitch now goes there.`,
  kept: () => 'Thanks for flagging it. That address checks out as deliverable on our side, and we have no better one yet. Our team will take a look.',
  flagged: () => 'Thanks, it’s flagged for our team. Meanwhile you can reach them through their website contact form or a DM.',
};

export default function PitchContact({ email, brandId, brandName, onChanged, compact = false }) {
  const [shown, setShown] = useState(email);
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false); // tapped open (touch screens, or to keep it open)
  const tip = hover || pinned;
  const [state, setState] = useState('idle'); // idle | confirm | sending | done
  const [result, setResult] = useState('');
  const ref = useRef(null);

  useEffect(() => { setShown(email); }, [email]);
  useEffect(() => {
    if (!pinned) return undefined;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setPinned(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [pinned]);

  if (!shown) return null;
  const kind = inboxKind(shown);

  const report = async () => {
    setState('sending');
    try {
      const { data } = await api.post('/api/polly/pitch/report-email', { brand_id: brandId, email: shown });
      const outcome = data?.outcome || 'flagged';
      if (data?.email) {
        setShown(data.email);
        if (onChanged) onChanged(data.email, data.mailto || null);
      }
      setResult((REPORT_RESULT[outcome] || REPORT_RESULT.flagged)(data?.email));
    } catch (_) {
      setResult('Couldn’t send the report. Try again in a moment.');
    }
    setState('done');
  };

  return (
    <Wrap $compact={compact}>
      <div className="line" ref={ref}>
        <span className="to">To: {shown}</span>
        <button type="button" className="kind" aria-expanded={tip} aria-label={`About this contact: ${LABEL[kind]}`}
          onClick={(e) => { e.stopPropagation(); setPinned((v) => !v); }}
          onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
          onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
          {LABEL[kind]} <Info size={12} aria-hidden="true" />
        </button>
        {state === 'idle' && brandId ? (
          <button type="button" className="report" onClick={() => setState('confirm')}>Not working?</button>
        ) : null}
        {tip ? (
          <Tip role="tooltip">
            {tipText(kind, brandName)}
            <span className="fine">We always use a brand&apos;s creator or PR contact when there is one.</span>
          </Tip>
        ) : null}
      </div>
      {state === 'confirm' ? (
        <div className="confirm">
          <span>Did this email bounce, or is it the wrong team?</span>
          <button type="button" className="yes" onClick={report}>Report it &amp; find another</button>
          <button type="button" className="no" onClick={() => setState('idle')}>Cancel</button>
        </div>
      ) : null}
      {state === 'sending' ? <div className="result">Checking {brandName || 'the brand'}&apos;s contacts…</div> : null}
      {state === 'done' ? <div className="result" role="status">{result}</div> : null}
    </Wrap>
  );
}

const Wrap = styled.div`
  margin: ${(p) => (p.$compact ? '6px 0 0' : '0 0 6px')};
  font-family: ${t.fontSans};
  .line { position: relative; display: flex; align-items: center; flex-wrap: wrap; gap: 6px 8px; font-size: 12.5px; color: ${t.muted}; }
  .to { color: ${t.ink}; font-weight: 600; word-break: break-all; }
  .kind {
    display: inline-flex; align-items: center; gap: 4px; border: 1px solid ${t.line}; background: #fff; color: ${t.muted};
    border-radius: 999px; padding: 2px 8px; font: inherit; font-size: 11.5px; font-weight: 600; cursor: help;
  }
  .report {
    border: 0; background: none; padding: 0; font: inherit; font-size: 12px; color: ${t.muted};
    text-decoration: underline; text-underline-offset: 2px; cursor: pointer;
  }
  .report:hover { color: ${t.ink}; }
  .confirm {
    margin-top: 8px; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 12.5px; color: ${t.ink};
    background: #fafafa; border: 1px solid ${t.line}; border-radius: 12px; padding: 8px 10px;
  }
  .confirm .yes {
    border: 0; border-radius: 999px; padding: 6px 12px; background: ${t.ink}; color: #fff; font: inherit;
    font-size: 12px; font-weight: 700; cursor: pointer;
  }
  .confirm .no { border: 0; background: none; font: inherit; font-size: 12px; color: ${t.muted}; cursor: pointer; }
  .result { margin-top: 6px; font-size: 12.5px; line-height: 1.45; color: ${t.accentDeep}; }
`;

const Tip = styled.span`
  position: absolute; top: calc(100% + 6px); left: 0; z-index: 20; width: min(320px, 86vw);
  background: ${t.ink}; color: #fff; border-radius: 12px; padding: 10px 12px; font-size: 12.5px; line-height: 1.45;
  box-shadow: 0 10px 24px rgba(18, 20, 26, 0.2);
  .fine { display: block; margin-top: 6px; color: #c9ced8; font-size: 11.5px; }
`;
