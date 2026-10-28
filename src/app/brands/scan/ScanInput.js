'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ArrowUp, X } from 'lucide-react';
import { EXAMPLE_BRANDS } from './scanApi';
import { scan } from './theme';

const Box = styled.form`
  width: 100%;
  background: ${scan.bg};
  border: 1px solid ${scan.line};
  border-radius: 20px;
  padding: 14px 14px 12px 20px;
  box-shadow: 0 1px 2px rgba(16, 17, 20, 0.04), 0 8px 24px rgba(16, 17, 20, 0.06);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  text-align: left;

  &:focus-within {
    border-color: ${scan.accent};
    box-shadow: 0 0 0 4px ${scan.accentRing}, 0 8px 24px rgba(16, 17, 20, 0.06);
  }
`;

const Field = styled.input`
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: ${(p) => (p.$large ? '18px' : '16px')};
  min-width: 0;
  text-overflow: ellipsis;

  @media (max-width: 560px) {
    font-size: 16px;
  }
  line-height: 1.5;
  color: ${scan.ink};
  padding: 6px 0 14px;

  &::placeholder {
    color: ${scan.muted2};
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Hint = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${scan.muted};

  i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${scan.green};
    box-shadow: 0 0 0 3px ${scan.greenSoft};
  }
`;

const Send = styled.button`
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 50%;
  border: 0;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #fff;
  background: ${scan.accent};
  transition: background 0.15s ease, transform 0.15s ease, opacity 0.15s ease;

  &:hover:not(:disabled) {
    background: ${scan.accentHover};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
`;

const Chip = styled.button`
  border: 1px solid ${scan.line};
  background: ${scan.bg};
  color: ${scan.inkSoft};
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;

  &:hover {
    border-color: ${scan.ink};
    color: ${scan.ink};
  }

  &.ghost {
    border-style: dashed;
  }
`;

// Pre-typed prompt (prompt library): the sentence is written for the user, with blanks to fill in.
// parts: strings and {key, placeholder, value?, optional?}. Tab moves between blanks, Enter runs it.
const Fill = styled.div`
  font-size: ${(p) => (p.$large ? '18px' : '16px')};
  line-height: 1.9;
  color: ${scan.ink};
  padding: 2px 0 12px;

  @media (max-width: 560px) {
    font-size: 16px;
  }

  input {
    font: inherit;
    color: ${scan.ink};
    background: ${scan.bgSoft};
    border: 1px solid ${scan.lineSoft};
    border-radius: 8px;
    padding: 1px 8px;
    margin: 0 2px;
    max-width: 100%;
    outline: 0;
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  input::placeholder { color: ${scan.muted2}; }
  input:focus { border-color: ${scan.accent}; background: ${scan.bg}; }
`;

const FillTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: ${scan.muted};
  margin-bottom: 2px;

  kbd {
    font: inherit;
    font-size: 11px;
    border: 1px solid ${scan.line};
    border-radius: 5px;
    padding: 0 5px;
    background: ${scan.bgSoft};
  }

  button {
    border: 0;
    background: none;
    color: ${scan.muted};
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font: inherit;
    font-size: 12px;
    padding: 2px 0;
  }
`;

function slotWidth(slot, value) {
  const text = value || slot.placeholder || '';
  return `${Math.min(Math.max(text.length, 6), 46) + 1}ch`;
}

function TemplateFill({ template, values, setValues, large, onClear }) {
  const refs = React.useRef([]);
  const narrow = useNarrow();
  const slots = template.parts.filter((p) => typeof p !== 'string');
  useEffect(() => {
    const first = slots.findIndex((s) => !values[s.key]);
    const el = refs.current[first < 0 ? 0 : first];
    if (el) el.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template]);
  const move = (i, back) => {
    const next = refs.current[(i + (back ? -1 : 1) + slots.length) % slots.length];
    if (next) next.focus();
  };
  let n = -1;
  return (
    <>
      <FillTop>
        <span>{slots.length > 1 && !narrow ? <>Press <kbd>Tab</kbd> for the next blank</> : 'Fill in the blank'}</span>
        <button type="button" onClick={onClear} aria-label="Clear prompt"><X size={13} /> Clear</button>
      </FillTop>
      <Fill $large={large}>
        {template.parts.map((part, i) => {
          if (typeof part === 'string') return <React.Fragment key={i}>{part}</React.Fragment>;
          n += 1;
          const idx = n;
          return (
            <input key={part.key} ref={(el) => { refs.current[idx] = el; }} value={values[part.key] || ''}
              placeholder={part.placeholder} aria-label={part.placeholder} maxLength={part.maxLength || 80}
              style={{ width: slotWidth(part, values[part.key]) }}
              onChange={(e) => setValues({ ...values, [part.key]: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Tab' && slots.length > 1) { e.preventDefault(); move(idx, e.shiftKey); }
                if (e.key === 'Escape') onClear();
              }} />
          );
        })}
      </Fill>
    </>
  );
}

function templateReady(template, values) {
  return template.parts.every((p) => typeof p === 'string' || p.optional || String(values[p.key] || '').trim());
}

// Phones get a placeholder that fits the input instead of one cut mid-word.
function useNarrow(maxWidth = 560) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const sync = () => setNarrow(mq.matches);
    sync();
    if (mq.addEventListener) mq.addEventListener('change', sync); else mq.addListener(sync);
    return () => { if (mq.removeEventListener) mq.removeEventListener('change', sync); else mq.removeListener(sync); };
  }, [maxWidth]);
  return narrow;
}

export default function ScanInput({ onSubmit, busy = false, large = false, chips = true, autoFocus = false,
  placeholder = 'Type a brand, e.g. Glow Recipe or @glowrecipe', shortPlaceholder = 'Type any brand…',
  hint = 'Live TikTok data · free · no login', maxLength = 80, label = 'Brand to scan',
  template = null, onTemplateSubmit, onClearTemplate }) {
  const [value, setValue] = useState('');
  const [values, setValues] = useState({});
  useEffect(() => {
    const start = {};
    ((template && template.parts) || []).forEach((p) => { if (typeof p !== 'string' && p.value) start[p.key] = p.value; });
    setValues(start);
  }, [template]);
  const filled = template ? templateReady(template, values) : Boolean(value.trim());
  const narrow = useNarrow();
  const inputRef = React.useRef(null);
  const go = (brand) => {
    const clean = String(brand || '').trim();
    if (!clean || busy) return;
    onSubmit(clean);
    setValue('');
  };

  return (
    <div>
      <Box
        onSubmit={(e) => {
          e.preventDefault();
          if (template) {
            if (!filled || busy) return;
            const clean = {};
            Object.keys(values).forEach((k) => { clean[k] = String(values[k] || '').trim(); });
            onTemplateSubmit(clean);
            return;
          }
          go(value);
        }}
      >
        {template ? (
          <TemplateFill template={template} values={values} setValues={setValues} large={large} onClear={onClearTemplate} />
        ) : (
        <Field
          ref={inputRef}
          $large={large}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={narrow ? shortPlaceholder : placeholder}
          aria-label={label}
          autoFocus={autoFocus}
          maxLength={maxLength}
        />
        )}
        <Row>
          <Hint><i /> {hint}</Hint>
          <Send type="submit" disabled={!filled || busy} aria-label={template ? 'Run prompt' : 'Scan brand'}>
            <ArrowUp size={18} strokeWidth={2.5} />
          </Send>
        </Row>
      </Box>
      {chips && (
        <Chips>
          {EXAMPLE_BRANDS.map((b) => (
            <Chip key={b} type="button" onClick={() => go(b)}>{b}</Chip>
          ))}
          <Chip type="button" className="ghost" onClick={() => inputRef.current && inputRef.current.focus()}>
            Your competitor →
          </Chip>
        </Chips>
      )}
    </div>
  );
}
