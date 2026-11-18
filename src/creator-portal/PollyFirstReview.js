import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ArrowRight, Loader2, RefreshCw, X } from 'lucide-react';
import { creatorTokens as t } from '../theme/creatorTokens';
import { batchItemReady } from './PollyPitchBatch';
import { BrandLogo, MONO_COLORS, intentTag } from './PollyFirstRun';

// Step 1 of 2 on the first pitches: Polly's approval queue. Every pitch is open and editable, any brand can be
// swapped for another match (only that pitch is rewritten), and one button approves them all. Gmail is asked
// for only then (step 2), so the creator sees the work before giving any access.

function cleanBody(body) {
  return String(body || '')
    .replace(/\s+(?:to|in|from|out of)\s+\[\s*city\s*,\s*country\s*\]/gi, '')
    .replace(/\[\s*city\s*,\s*country\s*\]/gi, '');
}

function PitchEditor({ item, onSave, disabled }) {
  const [text, setText] = useState(cleanBody(item.body));
  const [saved, setSaved] = useState(false);
  useEffect(() => { setText(cleanBody(item.body)); }, [item.brand_id, item.body]);
  const save = async () => {
    const next = text.trim();
    if (!next || next === cleanBody(item.body).trim()) return;
    await onSave(item, next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };
  return (
    <>
      <Body
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={save}
        disabled={disabled}
        rows={Math.min(14, Math.max(6, Math.ceil(text.length / 52)))}
        aria-label={`Pitch to ${item.brand_name}`}
      />
      <EditHint>{saved ? '✓ Saved' : 'Tap the text to edit it. Changes save automatically.'}</EditHint>
    </>
  );
}

export default function PollyFirstReview({
  batch, brandFacts = {}, swapOptions = [], gmailConnected, sending, disabled, swappingId,
  onApprove, onEdit, onSwap, onManual, free = true,
}) {
  const [drawerFor, setDrawerFor] = useState(null);
  const items = (batch?.items || []).filter((i) => !(i.status === 'sent' || i.status === 'already_sent'));
  if (!items.length) return null;
  const ready = items.filter(batchItemReady).length;
  const inBatch = new Set(items.map((i) => String(i.brand_id)));
  const options = swapOptions.filter((b) => !inBatch.has(String(b.brand_id)));

  return (
    <Wrap>
      <Progress>
        <div className="label"><b>Step 1 of 2</b> · Review &amp; approve your {items.length} {free ? 'free ' : ''}pitch{items.length === 1 ? '' : 'es'}</div>
        <div className="bar"><span style={{ width: '50%' }} /></div>
      </Progress>

      {items.map((item, idx) => {
        const facts = { ...(brandFacts[String(item.brand_id)] || {}), brand_name: item.brand_name, logo: item.brand_logo || brandFacts[String(item.brand_id)]?.logo };
        const swapping = String(swappingId) === String(item.brand_id);
        return (
          <Pitch key={item.brand_id || idx} $busy={swapping}>
            <Head>
              <BrandLogo brand={facts} color={MONO_COLORS[idx % MONO_COLORS.length]} size={38} />
              <div className="id">
                <span className="nm">{item.brand_name}</span>
                <span className="tag">{intentTag({ ...facts, meta_ads: item.meta_ads || facts.meta_ads })}</span>
              </div>
              {options.length ? (
                <SwapBtn type="button" onClick={() => setDrawerFor(item)} disabled={disabled || swapping || sending}>
                  Swap brand <RefreshCw size={13} aria-hidden="true" />
                </SwapBtn>
              ) : null}
            </Head>
            {swapping ? (
              <Swapping><Loader2 size={16} className="spin" aria-hidden="true" /> Writing a new pitch…</Swapping>
            ) : (
              <>
                {item.email ? <Meta>To: {item.email}</Meta> : <Meta className="warn">No PR inbox on file. Swap this one.</Meta>}
                {item.subject ? <Subject>{item.subject}</Subject> : null}
                <PitchEditor item={item} onSave={onEdit} disabled={disabled || sending} />
              </>
            )}
          </Pitch>
        );
      })}

      <Footer>
        <span className="count"><b>{ready} of {items.length}</b><span className="long"> {free ? 'free ' : ''}pitch{items.length === 1 ? '' : 'es'}</span> ready</span>
        <Approve type="button" onClick={onApprove} disabled={disabled || sending || !ready}>
          {sending ? 'Sending…' : 'Approve & start autopilot'} {sending ? null : <ArrowRight size={17} aria-hidden="true" />}
        </Approve>
      </Footer>
      <Under>
        {gmailConnected
          ? 'They go out from your Gmail. I follow up on day 4 and day 10.'
          : 'Next: connect Gmail so they go out from your own address (send-only access).'}
        {onManual ? <> · <button type="button" onClick={onManual}>Not on Gmail? Send them myself</button></> : null}
      </Under>

      {drawerFor ? (
        <>
          <Scrim onClick={() => setDrawerFor(null)} />
          <Drawer role="dialog" aria-label={`Swap ${drawerFor.brand_name}`}>
            <DrawerHead>
              <div>
                <b>Swap {drawerFor.brand_name}</b>
                <span>Pick another brand from your matches</span>
              </div>
              <button type="button" onClick={() => setDrawerFor(null)} aria-label="Close"><X size={18} /></button>
            </DrawerHead>
            <DrawerList>
              {options.map((b, i) => (
                <li key={b.brand_id}>
                  <button type="button" onClick={() => { onSwap(drawerFor, b); setDrawerFor(null); }}>
                    <BrandLogo brand={b} color={MONO_COLORS[(i + 3) % MONO_COLORS.length]} size={34} />
                    <span className="nm">{b.brand_name}</span>
                    <span className="tag">{intentTag(b)}</span>
                  </button>
                </li>
              ))}
            </DrawerList>
          </Drawer>
        </>
      ) : null}
    </Wrap>
  );
}

const spin = keyframes`to { transform: rotate(360deg); }`;
const slideIn = keyframes`from { transform: translateX(100%); } to { transform: none; }`;

const Wrap = styled.div`
  width: 100%; min-width: 0; max-width: 100%; box-sizing: border-box; margin-top: 12px; display: grid;
  grid-template-columns: minmax(0, 1fr); gap: 12px; font-family: ${t.fontSans}; color: ${t.ink};
  .spin { animation: ${spin} 1s linear infinite; }
`;

const Progress = styled.div`
  .label { font-size: 13.5px; color: ${t.muted}; margin-bottom: 8px; }
  .label b { color: ${t.ink}; }
  .bar { height: 6px; border-radius: 999px; background: #ebe8e1; overflow: hidden; }
  .bar span { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #ff3d8b, #ff5a5f); }
`;

const Pitch = styled.article`
  box-sizing: border-box; min-width: 0; background: ${t.white}; border: 1px solid ${t.line}; border-radius: 18px; padding: 16px;
  opacity: ${(p) => (p.$busy ? 0.75 : 1)};
  @media (max-width: 480px) { padding: 14px 12px; }
`;

const Head = styled.div`
  display: flex; align-items: center; gap: 10px;
  .id { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
  .nm { font-size: 16px; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tag { font-size: 12px; font-weight: 600; color: ${t.accentDeep}; }
`;

const SwapBtn = styled.button`
  flex: none; display: inline-flex; align-items: center; gap: 5px; border: 1px solid ${t.line}; background: #fff;
  border-radius: 999px; padding: 6px 11px; font-family: inherit; font-size: 12.5px; font-weight: 700; color: ${t.ink};
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: default; }
`;

const Meta = styled.div`
  margin-top: 12px; font-size: 12.5px; color: ${t.muted};
  &.warn { color: ${t.hot}; font-weight: 600; }
`;

const Subject = styled.div`margin-top: 4px; font-size: 14px; font-weight: 700;`;

const Body = styled.textarea`
  display: block; width: 100%; box-sizing: border-box; margin-top: 8px; padding: 12px; resize: vertical;
  border: 1px solid #ece9e2; border-radius: 12px; background: #fbfaf7; color: ${t.ink};
  font-family: inherit; font-size: 14px; line-height: 1.55;
  &:focus { outline: none; border-color: ${t.accentBorder}; background: #fff; }
`;

const EditHint = styled.div`margin-top: 6px; font-size: 12px; color: #8a909c;`;

const Swapping = styled.div`
  display: flex; align-items: center; gap: 8px; margin-top: 14px; font-size: 14px; color: ${t.muted};
`;

const Footer = styled.div`
  position: sticky; bottom: 8px; z-index: 3;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  background: ${t.ink}; color: #fff; border-radius: 16px; padding: 10px 10px 10px 16px;
  box-shadow: 0 10px 30px rgba(18, 20, 26, 0.25);
  .count { font-size: 13.5px; color: #c9ced8; white-space: nowrap; }
  .count b { color: #fff; }
  @media (max-width: 480px) { .count .long { display: none; } padding-left: 12px; }
`;

const Approve = styled.button`
  display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 12px; padding: 12px 14px;
  background: linear-gradient(90deg, #ff3d8b, #ff5a5f); color: #fff; font-family: inherit; font-size: 14.5px;
  font-weight: 800; cursor: pointer; white-space: nowrap; flex-shrink: 1; min-width: 0;
  &:disabled { opacity: 0.6; cursor: default; }
  @media (max-width: 420px) { font-size: 13.5px; padding: 12px 11px; gap: 4px; }
`;

const Under = styled.div`
  text-align: center; font-size: 12.5px; color: #8a909c; line-height: 1.5;
  button { border: 0; background: none; padding: 0; font: inherit; color: ${t.ink}; text-decoration: underline; cursor: pointer; }
`;

const Scrim = styled.div`position: fixed; inset: 0; background: rgba(18, 20, 26, 0.35); z-index: 1200;`;

const Drawer = styled.aside`
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 1201; width: min(380px, 92vw);
  background: #fff; box-shadow: -10px 0 30px rgba(18, 20, 26, 0.15); display: flex; flex-direction: column;
  animation: ${slideIn} .22s ease;
`;

const DrawerHead = styled.div`
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 18px 18px 12px;
  border-bottom: 1px solid ${t.line};
  b { display: block; font-size: 16px; }
  span { display: block; font-size: 13px; color: ${t.muted}; margin-top: 2px; }
  button { border: 0; background: none; cursor: pointer; color: ${t.muted}; padding: 4px; }
`;

const DrawerList = styled.ul`
  list-style: none; margin: 0; padding: 8px; overflow-y: auto; flex: 1;
  button {
    width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px; border: 0; background: none;
    border-radius: 12px; cursor: pointer; font-family: inherit; text-align: left;
  }
  button:hover { background: #f7f5f0; }
  .nm { flex: 1; font-size: 14.5px; font-weight: 700; color: ${t.ink}; }
  .tag { font-size: 11.5px; font-weight: 600; color: ${t.accentDeep}; white-space: nowrap; }
`;
