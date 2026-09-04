import React, { useRef } from 'react';
import styled from 'styled-components';
import { creatorTokens as tokens } from '../../theme/creatorTokens';

/**
 * Accessible underline tabs (tablist / tab / tabpanel pairing).
 * Keyboard: Left/Right, Home/End. Counts are optional and hidden when 0.
 */
export default function SegmentTabs({
  tabs = [],
  value,
  onChange,
  'aria-label': ariaLabel = 'Sections',
}) {
  const listRef = useRef(null);
  const ids = tabs.map((tab) => tab.id);
  const activeIndex = Math.max(0, ids.indexOf(value));

  function move(nextIndex) {
    const i = (nextIndex + tabs.length) % tabs.length;
    const next = tabs[i];
    if (!next) return;
    onChange?.(next.id);
    const buttons = listRef.current?.querySelectorAll('[role="tab"]');
    buttons?.[i]?.focus();
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(activeIndex + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(activeIndex - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      move(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      move(tabs.length - 1);
    }
  }

  return (
    <TabList ref={listRef} role="tablist" aria-label={ariaLabel} onKeyDown={onKeyDown}>
      {tabs.map((tab) => {
        const selected = tab.id === value;
        const count = Number(tab.count);
        const showCount = Number.isFinite(count) && count > 0;
        return (
          <Tab
            key={tab.id}
            type="button"
            role="tab"
            id={`seg-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={tab.panelId || `seg-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            $active={selected}
            onClick={() => onChange?.(tab.id)}
          >
            {tab.label}
            {showCount && <CountBadge>{count > 99 ? '99+' : count}</CountBadge>}
          </Tab>
        );
      })}
    </TabList>
  );
}

const TabList = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-bottom: 1px solid ${tokens.line};
  margin: 0 0 4px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Tab = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 10px 2px 12px;
  margin-bottom: -1px;
  font-size: 15px;
  font-weight: 650;
  letter-spacing: -.01em;
  color: ${(p) => (p.$active ? tokens.ink : tokens.muted)};
  background: none;
  border: 0;
  border-bottom: 2px solid ${(p) => (p.$active ? tokens.ink : 'transparent')};
  cursor: pointer;
  font-family: ${tokens.fontSans};
  transition: color 0.15s ease;

  &:hover { color: ${tokens.ink}; }
  &:focus-visible {
    outline: 2px solid ${tokens.accent};
    outline-offset: 3px;
    border-radius: 4px;
  }
`;

const CountBadge = styled.span`
  background: ${tokens.ink};
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  padding: 3px 6px;
  border-radius: 999px;
  min-width: 18px;
  text-align: center;
`;
