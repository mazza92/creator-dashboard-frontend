'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { ArrowUp } from 'lucide-react';
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

export default function ScanInput({ onSubmit, busy = false, large = false, chips = true, autoFocus = false,
  placeholder = 'Type a brand, e.g. Glow Recipe or @glowrecipe', hint = 'Live TikTok data · free · no login' }) {
  const [value, setValue] = useState('');
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
          go(value);
        }}
      >
        <Field
          ref={inputRef}
          $large={large}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label="Brand to scan"
          autoFocus={autoFocus}
          maxLength={80}
        />
        <Row>
          <Hint><i /> {hint}</Hint>
          <Send type="submit" disabled={!value.trim() || busy} aria-label="Scan brand">
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
