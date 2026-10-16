import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { creatorTokens as tokens } from '../../theme/creatorTokens';
import BriefMemo, { hasBrief } from './BriefMemo';

const FIELDS = [
  {
    key: 'message',
    label: 'The one thing to get across',
    hint: 'If creators remember one line, make it this.',
    placeholder: 'e.g. Bite replaces your toothpaste tube: chew, brush, done.',
    max: 280,
    rows: 2,
  },
  {
    key: 'must_include',
    label: 'Must show or say',
    hint: 'Shots, features or words you need in the video.',
    placeholder: 'e.g. Show chewing a bit and the foam. Mention it’s plastic-free and travel-friendly.',
    max: 500,
    rows: 3,
  },
  {
    key: 'avoid',
    label: 'Please avoid',
    placeholder: 'e.g. Comparing us to other brands, medical or whitening claims.',
    max: 300,
    rows: 2,
  },
  {
    key: 'tags',
    label: 'Tag & hashtags',
    placeholder: '@bite #plasticfree #zerowaste',
    max: 160,
  },
  {
    key: 'reference_url',
    label: 'Reference video',
    optional: true,
    hint: 'A post you love. Creators will match the vibe, not copy it.',
    placeholder: 'https://www.tiktok.com/@…',
    max: 600,
    type: 'url',
  },
];

function emptyDraft(brief) {
  return FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: brief?.[f.key] || '' }), {});
}

export default function RosterBriefModal({ open, brief, brandName, onClose, onSave }) {
  const [draft, setDraft] = useState(() => emptyDraft(brief));
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const firstRef = useRef(null);
  const briefRef = useRef(brief);
  const closeRef = useRef(onClose);
  briefRef.current = brief;
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    setDraft(emptyDraft(briefRef.current));
    setPreview(false);
    setError('');
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => firstRef.current?.focus(), 30);
    const onKey = (e) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!open) return null;

  const tooLong = FIELDS.find((f) => draft[f.key].length > f.max);
  const filled = hasBrief(draft);

  async function save(e) {
    e.preventDefault();
    if (tooLong) return;
    setSaving(true);
    setError('');
    try {
      await onSave(draft);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Could not save the brief');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Backdrop onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <Panel role="dialog" aria-modal="true" aria-labelledby="brief-title" onSubmit={save}>
        <Top>
          <div>
            <h2 id="brief-title">Creator brief</h2>
            <p>Your picked creators read this before they film. Short and specific works best.</p>
          </div>
          <Close type="button" aria-label="Close" onClick={onClose}>×</Close>
        </Top>

        <Fixed>
          <span>Already agreed</span>
          1 organic post tagging you · 1 raw UGC video · 6-month ad usage
        </Fixed>

        <Toggle role="tablist">
          <button type="button" role="tab" aria-selected={!preview} onClick={() => setPreview(false)}>Write</button>
          <button
            type="button"
            role="tab"
            aria-selected={preview}
            disabled={!filled}
            onClick={() => setPreview(true)}
          >
            Preview as creator
          </button>
        </Toggle>

        <Body>
          {preview ? (
            <BriefMemo brief={draft} brandName={brandName} compact />
          ) : (
            FIELDS.map((f, i) => {
              const len = draft[f.key].length;
              const Input = f.rows ? 'textarea' : 'input';
              return (
                <Field key={f.key}>
                  <LabelRow>
                    <label htmlFor={`brief-${f.key}`}>
                      {f.label}{f.optional && <em> (optional)</em>}
                    </label>
                    {len > f.max * 0.7 && <Count $over={len > f.max}>{len}/{f.max}</Count>}
                  </LabelRow>
                  {f.hint && <Hint>{f.hint}</Hint>}
                  <Input
                    id={`brief-${f.key}`}
                    ref={i === 0 ? firstRef : undefined}
                    type={f.type || (f.rows ? undefined : 'text')}
                    rows={f.rows}
                    placeholder={f.placeholder}
                    value={draft[f.key]}
                    onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                  />
                </Field>
              );
            })
          )}
        </Body>

        <Foot>
          {error ? <Err role="alert">{error}</Err> : <small>Every field is optional. Save anytime and edit later.</small>}
          <div>
            <Ghost type="button" onClick={onClose}>Cancel</Ghost>
            <Primary type="submit" disabled={saving || !!tooLong}>
              {saving ? 'Saving…' : filled ? 'Save brief' : 'Clear brief'}
            </Primary>
          </div>
        </Foot>
      </Panel>
    </Backdrop>
  );
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(18, 20, 26, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  @media (max-width: 560px) { align-items: flex-end; padding: 0; }
`;

const Panel = styled.form`
  width: 100%;
  max-width: 560px;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  background: ${tokens.white};
  border-radius: 18px;
  box-shadow: 0 24px 64px rgba(18, 20, 26, 0.24);
  font-family: ${tokens.fontSans};
  color: ${tokens.ink};
  overflow: hidden;
  @media (max-width: 560px) { border-radius: 18px 18px 0 0; max-height: 92vh; }
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 22px 0;
  h2 { margin: 0; font-family: ${tokens.fontDisplay}; font-weight: 400; font-size: 28px; }
  p { margin: 4px 0 0; font-size: 14px; color: ${tokens.muted}; }
`;

const Close = styled.button`
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid ${tokens.line};
  background: ${tokens.white};
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: ${tokens.muted};
`;

const Fixed = styled.div`
  margin: 16px 22px 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: ${tokens.accentSoft};
  color: ${tokens.accentDeep};
  font-size: 13px;
  font-weight: 600;
  span {
    display: block;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    opacity: 0.75;
    margin-bottom: 2px;
  }
`;

const Toggle = styled.div`
  display: flex;
  gap: 4px;
  margin: 16px 22px 0;
  padding: 3px;
  background: ${tokens.paper};
  border-radius: 10px;
  button {
    flex: 1;
    padding: 8px 10px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    color: ${tokens.muted};
    cursor: pointer;
  }
  button[aria-selected='true'] { background: ${tokens.white}; color: ${tokens.ink}; box-shadow: 0 1px 3px rgba(18,20,26,0.08); }
  button:disabled { opacity: 0.45; cursor: default; }
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 22px 8px;
`;

const Field = styled.div`
  & + & { margin-top: 14px; }
  textarea, input {
    width: 100%;
    box-sizing: border-box;
    margin-top: 6px;
    padding: 10px 12px;
    font: inherit;
    font-size: 15px;
    line-height: 1.45;
    color: ${tokens.ink};
    border: 1px solid ${tokens.line};
    border-radius: ${tokens.radiusInput};
    background: ${tokens.white};
    resize: vertical;
  }
  textarea:focus, input:focus { outline: none; border-color: ${tokens.accent}; box-shadow: 0 0 0 3px ${tokens.accentSoft}; }
  ::placeholder { color: #a3a8b0; }
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  label { font-size: 14px; font-weight: 700; }
  em { font-style: normal; font-weight: 400; color: ${tokens.muted}; }
`;

const Hint = styled.div`
  font-size: 12px;
  color: ${tokens.muted};
  margin-top: 2px;
`;

const Count = styled.span`
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: ${(p) => (p.$over ? tokens.hot : tokens.muted)};
`;

const Foot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 22px 18px;
  border-top: 1px solid ${tokens.line};
  small { font-size: 12px; color: ${tokens.muted}; }
  div { display: flex; gap: 8px; flex: none; }
`;

const Err = styled.span`
  font-size: 13px;
  color: ${tokens.hot};
`;

const Ghost = styled.button`
  padding: 10px 14px;
  border-radius: ${tokens.radiusBtn};
  border: 1px solid ${tokens.line};
  background: ${tokens.white};
  font: inherit;
  font-weight: 600;
  cursor: pointer;
`;

const Primary = styled.button`
  padding: 10px 16px;
  border-radius: ${tokens.radiusBtn};
  border: 0;
  background: ${tokens.action};
  color: ${tokens.white};
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  &:disabled { opacity: 0.55; cursor: default; }
`;
