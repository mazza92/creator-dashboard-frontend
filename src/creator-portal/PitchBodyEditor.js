import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { htmlToPitchPlain, pitchPlainToHtml } from '../utils/pitchBodyFormat';

const Editor = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-height: ${props => props.$minHeight || '260px'};
  max-height: 420px;
  overflow-y: auto;
  padding: 14px;
  border: 1.5px solid ${props => props.$border || '#e5e7eb'};
  border-radius: 10px;
  font-size: 13.5px;
  line-height: 1.7;
  color: ${props => props.$color || '#111827'};
  background: #fff;
  font-family: inherit;
  white-space: pre-wrap;
  word-wrap: break-word;
  outline: none;

  &:focus {
    border-color: ${props => props.$focusBorder || '#ec4899'};
    box-shadow: 0 0 0 3px ${props => props.$focusRing || 'rgba(236, 72, 153, 0.18)'};
  }

  &:empty:before {
    content: attr(data-placeholder);
    color: #9ca3af;
    pointer-events: none;
  }

  a,
  a.pitch-social-link {
    color: #2563eb;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
  }
`;

export default function PitchBodyEditor({
  value,
  onChange,
  placeholder = 'Your pitch...',
  minHeight,
  border,
  focusBorder,
  focusRing,
  color,
}) {
  const ref = useRef(null);
  const seeded = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const html = pitchPlainToHtml(value);
    if (!seeded.current) {
      node.innerHTML = html;
      seeded.current = true;
      return;
    }
    if (document.activeElement === node) return;
    if (node.innerHTML !== html) node.innerHTML = html;
  }, [value]);

  const handleInput = () => {
    onChange?.(htmlToPitchPlain(ref.current));
  };

  const handleClick = (event) => {
    const anchor = event.target.closest?.('a[href]');
    if (!anchor) return;
    event.preventDefault();
    window.open(anchor.href, '_blank', 'noopener,noreferrer');
  };

  return (
    <Editor
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      data-placeholder={placeholder}
      onInput={handleInput}
      onClick={handleClick}
      $minHeight={minHeight}
      $border={border}
      $focusBorder={focusBorder}
      $focusRing={focusRing}
      $color={color}
    />
  );
}
