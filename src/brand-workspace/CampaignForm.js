// Campaign fields shared by signup step 3 and "New campaign" in the workspace. Controlled: value + onChange.
import React from 'react';
import styled from 'styled-components';
import { CANONICAL_CATEGORIES, CATEGORY_LABELS } from '../constants/brandCategories';

export const REGIONS = [
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'EU', label: 'Europe' },
  { value: 'Worldwide', label: 'Worldwide' },
];

export const FOLLOWER_RANGES = [
  { value: '1K-10K', label: '1K – 10K' },
  { value: '10K-50K', label: '10K – 50K' },
  { value: '50K-100K', label: '50K – 100K' },
  { value: 'Any', label: 'Any size' },
];

export const CONTENT_TYPES = ['TikTok', 'Instagram Reel', 'Instagram Story', 'YouTube'];

export const CREATOR_COUNTS = [
  { value: '3-5', label: '3 – 5', sub: 'Small batch' },
  { value: '5-10', label: '5 – 10', sub: 'Standard' },
  { value: '10-20', label: '10 – 20', sub: 'Wide reach' },
];

export const CATEGORIES = CANONICAL_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] || 'Other' }));

export const EMPTY_CAMPAIGN = {
  product_name: '',
  campaign_description: '',
  pr_value_usd: '',
  creator_count_range: '5-10',
  shipping_regions: ['US'],
  follower_ranges: ['1K-10K', '10K-50K'],
  content_types: ['TikTok'],
  additional_notes: '',
};

const COUNT_TO_SPOTS = { '3-5': 5, '5-10': 10, '10-20': 20 };

export function campaignReady(v) {
  return Boolean(v.product_name.trim() && v.campaign_description.trim() && Number(v.pr_value_usd) > 0
    && v.shipping_regions.length && v.follower_ranges.length && v.content_types.length);
}

export function campaignPayload(v, extra = {}) {
  return {
    ...v,
    product_name: v.product_name.trim(),
    campaign_description: v.campaign_description.trim(),
    pr_value_usd: parseInt(v.pr_value_usd, 10) || null,
    spots_total: COUNT_TO_SPOTS[v.creator_count_range] || 10,
    creator_niches: [],
    ...extra,
  };
}

const C = {
  ink: '#111214',
  soft: '#3f424a',
  muted: '#6b6f78',
  line: '#e3e5ea',
  accent: '#e8395f',
  accentSoft: '#fef2f4',
};

export const Field = styled.label`
  display: block;
  margin-bottom: 18px;

  > span {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: ${C.ink};
    margin-bottom: 8px;
  }

  > small {
    display: block;
    font-size: 12px;
    color: ${C.muted};
    margin-top: 6px;
  }
`;

export const TextInput = styled.input`
  width: 100%;
  height: 52px;
  border: 1px solid ${C.line};
  border-radius: 14px;
  padding: 0 16px;
  font-size: 16px;
  color: ${C.ink};
  background: #fff;
  outline: 0;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &::placeholder { color: #a3a6ad; }
  &:focus { border-color: ${C.ink}; box-shadow: 0 0 0 4px rgba(17, 18, 20, 0.06); }
`;

const TextArea = styled.textarea`
  width: 100%;
  border: 1px solid ${C.line};
  border-radius: 14px;
  padding: 14px 16px;
  font-size: 16px;
  line-height: 1.5;
  color: ${C.ink};
  background: #fff;
  outline: 0;
  resize: vertical;
  font-family: inherit;

  &::placeholder { color: #a3a6ad; }
  &:focus { border-color: ${C.ink}; box-shadow: 0 0 0 4px rgba(17, 18, 20, 0.06); }
`;

export const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Chip = styled.button`
  border: 1px solid ${(p) => (p.$on ? C.ink : C.line)};
  background: ${(p) => (p.$on ? C.ink : '#fff')};
  color: ${(p) => (p.$on ? '#fff' : C.soft)};
  border-radius: 999px;
  padding: 9px 14px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover { border-color: ${C.ink}; }
`;

const Counts = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  button {
    border: 1px solid ${C.line};
    background: #fff;
    border-radius: 14px;
    padding: 12px 8px;
    cursor: pointer;
    text-align: center;
  }

  button.on {
    border-color: ${C.ink};
    box-shadow: 0 0 0 1px ${C.ink} inset;
  }

  b { display: block; font-size: 16px; color: ${C.ink}; }
  small { font-size: 12px; color: ${C.muted}; }
`;

const Money = styled.div`
  position: relative;

  span {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${C.muted};
    font-size: 16px;
  }

  input { padding-left: 32px; }
`;

function toggle(list, value) {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

export default function CampaignForm({ value, onChange }) {
  const set = (field, v) => onChange({ ...value, [field]: v });
  return (
    <div>
      <Field>
        <span>What are you gifting?</span>
        <TextInput
          value={value.product_name}
          onChange={(e) => set('product_name', e.target.value)}
          placeholder="e.g. Vitamin C glow serum"
        />
      </Field>
      <Field>
        <span>What should creators make?</span>
        <TextArea
          rows={3}
          value={value.campaign_description}
          onChange={(e) => set('campaign_description', e.target.value)}
          placeholder="e.g. Film your morning routine with the serum and share your honest first impression. No script."
        />
        <small>2–4 sentences. Creators decide to apply based on this.</small>
      </Field>
      <Field>
        <span>Product value (USD)</span>
        <Money>
          <span>$</span>
          <TextInput
            type="number"
            inputMode="numeric"
            min="1"
            value={value.pr_value_usd}
            onChange={(e) => set('pr_value_usd', e.target.value)}
            placeholder="45"
          />
        </Money>
      </Field>
      <Field as="div">
        <span>How many creators?</span>
        <Counts>
          {CREATOR_COUNTS.map((c) => (
            <button key={c.value} type="button" className={value.creator_count_range === c.value ? 'on' : ''}
              onClick={() => set('creator_count_range', c.value)}>
              <b>{c.label}</b><small>{c.sub}</small>
            </button>
          ))}
        </Counts>
      </Field>
      <Field as="div">
        <span>Ships to</span>
        <Chips>
          {REGIONS.map((r) => (
            <Chip key={r.value} type="button" $on={value.shipping_regions.includes(r.value)}
              onClick={() => set('shipping_regions', toggle(value.shipping_regions, r.value))}>{r.label}</Chip>
          ))}
        </Chips>
      </Field>
      <Field as="div">
        <span>Creator size</span>
        <Chips>
          {FOLLOWER_RANGES.map((r) => (
            <Chip key={r.value} type="button" $on={value.follower_ranges.includes(r.value)}
              onClick={() => set('follower_ranges', toggle(value.follower_ranges, r.value))}>{r.label}</Chip>
          ))}
        </Chips>
      </Field>
      <Field as="div">
        <span>Content</span>
        <Chips>
          {CONTENT_TYPES.map((t) => (
            <Chip key={t} type="button" $on={value.content_types.includes(t)}
              onClick={() => set('content_types', toggle(value.content_types, t))}>{t}</Chip>
          ))}
        </Chips>
      </Field>
      <Field>
        <span>Anything else? <small style={{ display: 'inline', fontWeight: 400 }}>(optional)</small></span>
        <TextArea
          rows={2}
          value={value.additional_notes}
          onChange={(e) => set('additional_notes', e.target.value)}
          placeholder="e.g. US creators 21+, no competitor content in the last 30 days."
        />
      </Field>
    </div>
  );
}
