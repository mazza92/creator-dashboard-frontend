import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { OTHER_COUNTRY, PINNED_COUNTRIES, countryName, flagFor, searchCountries } from '../../utils/countries';

// Searchable country picker (WAI-ARIA combobox + listbox): type to filter, arrows to move, Enter to pick,
// Escape to close. Pinned countries first, then A-Z. The last option is "My country isn't listed", which
// asks for the country's name and explains we don't have brands shipping there yet.

const c = {
  rose: '#E11D48', black: '#0F0F0F', border: '#E6E3E0', text: '#0F0F0F', text2: '#5A5A5A', text3: '#9A9A9A',
  hover: '#F6F3F1', danger: '#BE123C',
};

const Wrap = styled.div`
  position: relative;
`;

const Field = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Flag = styled.span`
  position: absolute;
  left: 13px;
  font-size: 18px;
  line-height: 1;
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  height: 48px;
  padding: 0 40px 0 ${(p) => (p.$hasFlag ? '42px' : '14px')};
  border: 1.5px solid ${(p) => (p.$invalid ? c.danger : c.border)};
  border-radius: 12px;
  background: #fff;
  font: inherit;
  font-size: 16px;
  color: ${c.text};
  outline: none;
  transition: border-color .15s, box-shadow .15s;
  &:focus { border-color: ${c.black}; box-shadow: 0 0 0 3px rgba(15,15,15,.07); }
  &::placeholder { color: ${c.text3}; }
`;

const Chevron = styled.button`
  position: absolute;
  right: 6px;
  width: 34px;
  height: 34px;
  border: 0;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: ${c.text2};
  display: grid;
  place-items: center;
  &:hover { background: ${c.hover}; }
  svg { transition: transform .15s; transform: rotate(${(p) => (p.$open ? '180deg' : '0deg')}); }
`;

const List = styled.ul`
  position: absolute;
  z-index: 30;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  margin: 0;
  padding: 6px;
  list-style: none;
  max-height: 288px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid ${c.border};
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(15,15,15,.12), 0 2px 6px rgba(15,15,15,.06);
  overscroll-behavior: contain;
`;

const Option = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 10px;
  border-radius: 9px;
  cursor: pointer;
  font-size: 15px;
  color: ${c.text};
  background: ${(p) => (p.$active ? c.hover : 'transparent')};
  font-weight: ${(p) => (p.$selected ? 700 : 500)};
  span.flag { font-size: 18px; width: 22px; text-align: center; }
  span.check { margin-left: auto; color: ${c.rose}; font-weight: 800; }
`;

const Divider = styled.li`
  height: 1px;
  margin: 6px 4px;
  background: ${c.border};
`;

const OtherOption = styled(Option)`
  color: ${c.text2};
  font-size: 14px;
`;

const Empty = styled.li`
  padding: 12px 10px 6px;
  font-size: 13px;
  color: ${c.text3};
`;

const OtherBox = styled.div`
  margin-top: 10px;
  padding: 14px;
  border-radius: 12px;
  background: #FFF7ED;
  border: 1px solid #FED7AA;
  font-size: 13.5px;
  line-height: 1.5;
  color: #7C2D12;
  label { display: block; font-weight: 700; color: ${c.text}; margin: 10px 0 6px; font-size: 13px; }
`;

const OtherInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  height: 44px;
  padding: 0 12px;
  border: 1.5px solid ${(p) => (p.$invalid ? c.danger : c.border)};
  border-radius: 10px;
  font: inherit;
  font-size: 16px;
  background: #fff;
  outline: none;
  &:focus { border-color: ${c.black}; }
`;

const NOT_LISTED = { code: OTHER_COUNTRY, name: "My country isn't listed", flag: '🌐', aliases: [] };

export default function CountryCombobox({
  value,
  onChange,
  otherName = '',
  onOtherNameChange,
  allowOther = true,
  invalid = false,
  otherInvalid = false,
  placeholder = 'Search countries',
  id,
  describedBy,
  otherMessage = "We don't have brands shipping there yet. Tell us where you are and we'll let you know as soon as we do.",
}) {
  const autoId = useId().replace(/:/g, '');
  const inputId = id || `country-${autoId}`;
  const listId = `${inputId}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const wrapRef = useRef(null);
  const otherRef = useRef(null);

  const selectedLabel = value === OTHER_COUNTRY ? NOT_LISTED.name : countryName(value);
  const options = useMemo(() => {
    const found = searchCountries(query);
    return allowOther ? [...found, NOT_LISTED] : found;
  }, [query, allowOther]);
  const pinnedCount = query ? 0 : PINNED_COUNTRIES.length;

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${active}"]`);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const openList = () => {
    if (open) return;
    const idx = options.findIndex((o) => o.code === value);
    setActive(idx >= 0 ? idx : 0);
    setOpen(true);
  };

  const pick = (opt) => {
    onChange(opt.code);
    setOpen(false);
    setQuery('');
    if (opt.code === OTHER_COUNTRY) {
      setTimeout(() => otherRef.current && otherRef.current.focus(), 30);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) { openList(); return; }
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { openList(); return; }
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Home' && open) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End' && open) {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === 'Enter') {
      if (open && options[active]) {
        e.preventDefault();
        pick(options[active]);
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        setOpen(false);
        setQuery('');
      }
    } else if (e.key === 'Tab' && open) {
      setOpen(false);
      setQuery('');
    }
  };

  const showFlag = !open || !query;
  const flag = value === OTHER_COUNTRY ? '🌐' : flagFor(value);
  const activeId = open && options[active] ? `${inputId}-opt-${options[active].code}` : undefined;

  return (
    <Wrap ref={wrapRef}>
      <Field>
        {showFlag && flag && <Flag aria-hidden="true">{flag}</Flag>}
        <Input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={selectedLabel || placeholder}
          value={open ? query : selectedLabel}
          $hasFlag={showFlag && Boolean(flag)}
          $invalid={invalid}
          onChange={(e) => { setQuery(e.target.value); setActive(0); if (!open) setOpen(true); }}
          onFocus={openList}
          onClick={openList}
          onKeyDown={onKeyDown}
        />
        <Chevron
          type="button"
          tabIndex={-1}
          aria-label={open ? 'Close country list' : 'Open country list'}
          $open={open}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (open) { setOpen(false); setQuery(''); } else { openList(); inputRef.current && inputRef.current.focus(); }
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Chevron>
      </Field>

      {open && (
        <List ref={listRef} id={listId} role="listbox" aria-label="Countries">
          {options.length === (allowOther ? 1 : 0) && <Empty role="presentation">No match in the countries we serve yet.</Empty>}
          {options.map((opt, i) => {
            const isOther = opt.code === OTHER_COUNTRY;
            const Row = isOther ? OtherOption : Option;
            return (
              <React.Fragment key={opt.code}>
                {((pinnedCount && i === pinnedCount) || (isOther && i > 0)) && <Divider role="presentation" />}
                <Row
                  id={`${inputId}-opt-${opt.code}`}
                  data-index={i}
                  role="option"
                  aria-selected={opt.code === value}
                  $active={i === active}
                  $selected={opt.code === value}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseMove={() => setActive(i)}
                  onClick={() => pick(opt)}
                >
                  <span className="flag" aria-hidden="true">{opt.flag}</span>
                  {opt.name}
                  {opt.code === value && <span className="check" aria-hidden="true">✓</span>}
                </Row>
              </React.Fragment>
            );
          })}
        </List>
      )}

      {value === OTHER_COUNTRY && (
        <OtherBox role="status">
          {otherMessage}
          <label htmlFor={`${inputId}-other`}>Which country are you in?</label>
          <OtherInput
            ref={otherRef}
            id={`${inputId}-other`}
            type="text"
            maxLength={80}
            autoComplete="country-name"
            placeholder="e.g. South Africa"
            value={otherName}
            $invalid={otherInvalid}
            aria-invalid={otherInvalid || undefined}
            onChange={(e) => onOtherNameChange && onOtherNameChange(e.target.value)}
          />
        </OtherBox>
      )}
    </Wrap>
  );
}
