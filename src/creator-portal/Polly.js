import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';
import UpgradeModal from './UpgradeModal';
import { UserContext } from '../contexts/UserContext';
import PollyRichText from './pollyMarkdown';
import { scrubPollyVoice } from './pollyVoice';
import {
  clearOrphanPollyLocal,
  readOrphanPollyLocal,
  readPollyLocal,
  threadsLookCopied,
  writePollyLocal,
} from './pollyStorage';
import { brandMarkEmoji } from './brandMarkEmoji';

const STARTER_LABELS = {
  paid_ugc: 'Show paid UGC I can apply to now',
  line_up: 'Pitch 3 brands for me today',
  name_a_brand: 'Write a pitch for a brand I name',
  more_replies: 'Make my kit get more replies',
};

const STARTER_HINTS = {
  paid_ugc: 'Live briefs — tap Apply',
  line_up: "I'll draft the emails",
  name_a_brand: 'You pick, I write it',
  more_replies: 'Rates, bio, and proof brands open',
};

const STARTERS = [
  { id: 'paid_ugc', label: 'Show paid UGC I can apply to now', hint: STARTER_HINTS.paid_ugc, action: 'suggest_gigs', skip_discovery: true },
  { id: 'line_up', label: 'Pitch 3 brands for me today', hint: STARTER_HINTS.line_up, action: 'suggest_brands', skip_discovery: true },
  { id: 'name_a_brand', label: 'Write a pitch for a brand I name', hint: STARTER_HINTS.name_a_brand, action: 'ask_brand' },
  { id: 'more_replies', label: 'Make my kit get more replies', hint: STARTER_HINTS.more_replies, action: 'coach_profile' },
];

function isOpenerOnlyThread(msgs) {
  if (!Array.isArray(msgs) || msgs.length !== 1) return false;
  const m = msgs[0] || {};
  if (String(m.role || '').toLowerCase() !== 'assistant') return false;
  if ((m.brands || []).length || (m.gigs || []).length || m.pitch || (m.task_chips || []).length) return false;
  const c = String(m.content || '');
  return /i['’]m polly|creator assistant|what do you want to land first|mind if i ask you/i.test(c);
}

function usableThreadMessages(msgs) {
  if (!Array.isArray(msgs) || !msgs.length) return [];
  return isOpenerOnlyThread(msgs) ? [] : msgs;
}

function normalizeStarters(list) {
  return (list || []).map((s) => {
    let next = { ...s, hint: s.hint || STARTER_HINTS[s.id] };
    if (s?.id === 'paid_ugc') next.label = STARTER_LABELS.paid_ugc;
    if (s?.id === 'name_a_brand') next.label = STARTER_LABELS.name_a_brand;
    if (s?.id === 'more_replies') next.label = STARTER_LABELS.more_replies;
    if (s?.id === 'line_up' && /3 brands/i.test(s.label || '')) next.label = STARTER_LABELS.line_up;
    if (s?.id === 'portfolio' || (s?.action === 'coach_portfolio' && /portfolio|review my kit/i.test(s?.label || ''))) {
      next = { ...next, label: 'Review my kit', action: s.action || 'coach_portfolio' };
    }
    return next;
  }).filter((s) => s.id !== 'more_gigs');
}

function composerStarters(list, messages) {
  const hasGigs = (messages || []).some((msg) => (msg.gigs || []).length);
  return (list || []).filter((s) => {
    if (s.id === 'more_gigs') return false;
    if (hasGigs && s.id === 'paid_ugc') return false;
    return true;
  });
}

function isUnlockChip(s) {
  return s?.action === 'unlock_pro' || s?.id === 'unlock_pro';
}

const KIT_EDITOR_PATH = '/creator/dashboard/my-kit';

function stripKitEditorPaths(text) {
  return String(text || '')
    .replace(/_{1,2}\s*\/?(?:https?:\/\/[^\s_]+)?creator\/dashboard\/my-kit\s*_{1,2}/gi, '')
    .replace(/(?:here'?s the link:?\s*)?(?:https?:\/\/[^\s)]+)?\/?creator\/dashboard\/my-kit/gi, '')
    .replace(/here'?s the link:?\s*/gi, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function wantsPortfolioCta(text) {
  return /creator\/dashboard\/my-kit|open your kit|publish.{0,40}kit|\bmy kit\b|isn't published|not published/i.test(
    text || ''
  );
}

function portfolioAction() {
  return { label: 'My portfolio', href: KIT_EDITOR_PATH, external: false };
}

function kitActionsFrom(data, content) {
  const incoming = Array.isArray(data?.kit_actions) ? data.kit_actions : [];
  const actions = incoming.map((a) => (
    !a.external && /open my kit/i.test(a.label || '') ? { ...a, label: 'My portfolio' } : a
  ));
  if (actions.length) return actions;
  const text = content || data?.message || '';
  if (
    data?.intent === 'coach_portfolio'
    || data?.intent === 'coach_profile'
    || wantsPortfolioCta(text)
  ) {
    return [portfolioAction()];
  }
  return [];
}

function kitUi(msg) {
  const source = msg?.content || '';
  const actions = (msg?.kit_actions || []).length
    ? msg.kit_actions
    : (wantsPortfolioCta(source) ? [portfolioAction()] : []);
  return { text: stripKitEditorPaths(source), actions };
}

function gigBlurb(gig) {
  return String(gig?.summary || gig?.blurb || '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function gigPayText(gig) {
  const label = String(gig?.pay_label || '').trim();
  if (/\$\s*\d/.test(label)) return label;
  const amount = Number(gig?.pr_value_usd);
  if (Number.isFinite(amount) && amount > 0) {
    return `$${amount.toLocaleString('en-US')}`;
  }
  return label;
}

function gigDedupeKey(gig) {
  const norm = (value) => String(value || '')
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
    .replace(/\$[\d,]+(?:\s*[-–]\s*\$?[\d,]+)?/g, ' ')
    .replace(/\b\d+\s*k\b/g, ' ')
    .replace(/\bstreaming\b/g, 'stream')
    .replace(/\blive[\s-]*stream\b/g, 'live stream')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const stripBrand = (text, brand) => {
    let keep = text;
    brand.split(' ').filter((word) => word.length >= 3).forEach((word) => {
      keep = keep.replace(new RegExp(`\\b${word}\\b`, 'g'), ' ');
    });
    return keep.replace(/\s+/g, ' ').trim();
  };
  const brand = norm(gig?.brand_name || gig?.name);
  const source = String(gig?.source_platform || gig?.source_label || '').trim().toLowerCase();
  let title = stripBrand(norm(gig?.product_name), brand);
  if (title.length < 10) {
    title = stripBrand(norm(gig?.blurb || gig?.campaign_description), brand)
      .split(' ')
      .slice(0, 8)
      .join(' ');
  }
  return `${brand}|${source}|${title}`;
}

function uniqueGigs(gigs) {
  const seen = new Set();
  const out = [];
  (gigs || []).forEach((gig) => {
    const key = gigDedupeKey(gig);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(gig);
  });
  return out;
}

function gigApplyLabel(gig) {
  if (gig?.already_applied) return 'Open again';
  const mode = gig?.apply_mode || (gig?.external_apply_url ? 'url' : 'kit');
  if (mode === 'email') return 'Apply via email';
  if (mode === 'url' || gig?.is_sourced || gig?.external_apply_url) return 'Apply here';
  return 'Apply with kit';
}

function launchGigApply(gig, data = {}) {
  const mode = data.apply_mode || gig?.apply_mode || (gig?.external_apply_url ? 'url' : gig?.apply_email ? 'email' : 'kit');
  const url = data.external_apply_url || gig?.external_apply_url;
  const email = data.apply_email || gig?.apply_email;
  if ((mode === 'email' || (!url && email)) && email) {
    window.location.href = `mailto:${email}`;
    return;
  }
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
}

function brandBlurb(brand) {
  const desc = String(brand?.description || '').replace(/\s+/g, ' ').trim();
  if (desc && !/already sit in/i.test(desc)) return desc;
  const why = String(brand?.why || '').replace(/\s+/g, ' ').trim();
  if (why && !/already sit in/i.test(why)) return why;
  return '';
}

function contactLineFor(brand) {
  const name = String(brand?.name || 'this brand').trim();
  const lines = [
    `Pitch ${name} for me`,
    `Write a pitch for ${name}`,
    `Draft an email to ${name}`,
    `Let's pitch ${name}`,
    `Reach out to ${name}`,
    `Let's try ${name}`,
    `Send a note to ${name}`,
    `Start with ${name}`,
    `Get me in with ${name}`,
    `Contact ${name}`,
  ];
  contactLineFor._n = (contactLineFor._n || 0) + 1;
  return lines[(contactLineFor._n - 1) % lines.length];
}

const LOCATION_GAP = /\[\s*CITY\s*,\s*COUNTRY\s*\]/i;

function pitchHasPlaceholder(pitch) {
  return LOCATION_GAP.test(String(pitch?.body || '')) || Boolean(pitch?.needs_location);
}

function patchLastPitch(msgs, update) {
  if (!update || !Array.isArray(msgs)) return msgs || [];
  const next = msgs.map((msg) => ({ ...msg }));
  for (let i = next.length - 1; i >= 0; i -= 1) {
    if (next[i]?.pitch?.body || next[i]?.pitch?.subject) {
      next[i] = { ...next[i], pitch: { ...next[i].pitch, ...update } };
      break;
    }
  }
  return next;
}

function PitchBodyText({ body }) {
  const text = String(body || '');
  const parts = text.split(/(\[\s*CITY\s*,\s*COUNTRY\s*\])/i);
  return (
    <PitchBody>
      {parts.map((part, i) => (
        LOCATION_GAP.test(part) ? <PitchGap key={i}>{part}</PitchGap> : part
      ))}
    </PitchBody>
  );
}

function BrandLogoMark({ brand }) {
  const src = String(brand?.logo || brand?.logo_url || '').trim();
  const [broken, setBroken] = useState(false);
  useEffect(() => { setBroken(false); }, [src]);
  const mark = brandMarkEmoji({
    name: brand?.name,
    category: brand?.category,
    niche: brand?.niche,
  });
  if (!src || broken) {
    return (
      <span className="mark-fallback" style={{ background: mark.bg }} aria-hidden>
        {mark.emoji}
      </span>
    );
  }
  return <img src={src} alt="" onError={() => setBroken(true)} />;
}

function chatTextWithoutPitch(text, hasPitch) {
  if (!hasPitch || !text) return text || '';
  const cut = String(text).search(
    /\n\s*(\*\*)?Subject:|Make sure you pop this into an email|Hey team at |Hi [^\n]{0,60},\s*\n\s*I create/i
  );
  if (cut > 24) return String(text).slice(0, cut).trim();
  return text;
}

function newId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const POLLY_AVATAR_URL = 'https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/polly_ai_influencer_manager.jpg?token=eyJraWQiOiI3MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvcG9sbHlfYWlfaW5mbHVlbmNlcl9tYW5hZ2VyLmpwZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODk2NTUxNDksImV4cCI6MTgyMTE5MTE0OX0.XgvysSRJ4o0-zs0CLqvUhsTQe0NWEQIucYdhbzJD07U';

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  font-family: ${t.fontSans};
`;

const Thread = styled.div`
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 12px 16px 8px;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }

  @media (max-width: 840px) {
    padding: 8px 12px 6px;
  }
`;

const Empty = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px 8px 32px;
`;

const ResumePending = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 14px;
  padding: 24px 4px 12px;
`;

const ResumeBar = styled.div`
  height: ${p => p.$h || 14}px;
  width: ${p => p.$w || '72%'};
  max-width: 100%;
  border-radius: 10px;
  background: ${t.subtle};
  align-self: ${p => (p.$end ? 'flex-end' : 'flex-start')};
`;

const AvatarMark = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 18%;
  margin-bottom: 14px;
  box-shadow: 0 2px 12px rgba(15, 40, 32, 0.14);
`;

const Title = styled.h1`
  font-family: ${t.fontDisplay};
  font-size: clamp(28px, 4.5vw, 40px);
  font-weight: 400;
  letter-spacing: -0.03em;
  color: ${t.ink};
  margin: 0 0 8px;
`;

const Sub = styled.p`
  color: ${t.muted};
  font-size: 16px;
  line-height: 1.5;
  margin: 0 auto 22px;
  max-width: 42ch;
  white-space: pre-line;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
`;

const SuggestGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  max-width: 520px;
  margin: 4px auto 0;
  text-align: left;
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const SuggestCard = styled.button`
  border: 1px solid ${t.line};
  background: ${t.cream};
  border-radius: 16px;
  padding: 14px 16px;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  .title {
    font-size: 14.5px;
    font-weight: 600;
    color: ${t.ink};
    line-height: 1.3;
  }
  .hint {
    font-size: 12.5px;
    color: ${t.muted};
    margin-top: 4px;
    line-height: 1.35;
  }
  &:hover { background: ${t.white}; border-color: ${t.borderHover}; }
  &:disabled { opacity: 0.55; cursor: default; }
`;

const Chip = styled.button`
  border: 1px solid ${t.line};
  background: ${p => (p.$emphasis ? t.action : t.cream)};
  color: ${p => (p.$emphasis ? '#fff' : t.ink)};
  border-radius: ${t.radiusPill};
  padding: 10px 14px;
  font-size: 14px;
  font-weight: ${p => (p.$emphasis ? 600 : 500)};
  cursor: pointer;
  font-family: inherit;
  &:hover { border-color: ${p => (p.$emphasis ? t.action : t.borderHover)}; background: ${p => (p.$emphasis ? t.action : t.white)}; }
`;

const Turn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 auto 22px;
  width: 100%;
  max-width: 720px;
`;

const UserRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const UserBubble = styled.div`
  max-width: min(85%, 560px);
  background: ${t.ink};
  color: #fff;
  border-radius: 22px;
  padding: 10px 16px;
  font-size: 15.5px;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const AssistantRow = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 12px;
  align-items: start;
`;

const PollyFace = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center 18%;
  margin-top: 2px;
  flex-shrink: 0;
  background: ${t.line};
`;

const AssistantText = styled.div`
  font-size: 15.5px;
  line-height: 1.7;
  color: ${t.ink};
  padding-top: 2px;
  p { margin: 0 0 0.9em; }
  p:last-child { margin-bottom: 0; }
  h3, h4 {
    font-family: ${t.fontSans};
    font-size: 15.5px;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin: 0 0 0.55em;
  }
  ul, ol {
    margin: 0 0 0.9em;
    padding-left: 1.25em;
  }
  li { margin: 0.28em 0; }
  strong { font-weight: 650; }
  em { font-style: italic; }
  u { text-underline-offset: 3px; text-decoration-thickness: 1.5px; }
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.92em;
    background: ${t.subtle};
    padding: 0.08em 0.35em;
    border-radius: 6px;
  }
  a { color: ${t.action}; font-weight: 600; }
`;

const BrandList = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
`;

const GigList = styled.div`
  display: grid;
  gap: 10px;
  min-width: 0;
`;

const GigCardShell = styled.article`
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 16px;
  padding: 12px 14px 12px;
  min-width: 0;
`;

const GigTop = styled.div`
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
`;

const GigHead = styled.div`
  min-width: 0;
`;

const GigTitleRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
`;

const GigName = styled.div`
  font-weight: 650;
  font-size: 15px;
  letter-spacing: -0.01em;
  color: ${t.ink};
  line-height: 1.25;
  min-width: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const GigPay = styled.div`
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 650;
  color: ${t.ink};
  font-variant-numeric: tabular-nums;
`;

const GigProduct = styled.div`
  margin-top: 2px;
  font-size: 13px;
  color: ${t.inkSoft};
  line-height: 1.35;
`;

const GigDeliverable = styled.div`
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
  color: ${t.ink};
  line-height: 1.35;
`;

const GigMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-top: 4px;
  font-size: 12px;
  color: ${t.muted};
  line-height: 1.3;
`;

const GigBody = styled.div`
  margin-top: 8px;
`;

const GigText = styled.p`
  margin: 0;
  font-size: 13.5px;
  line-height: 1.5;
  color: ${t.inkSoft};
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  ${p => (p.$open ? '' : `
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `)}
`;

const MoreLink = styled.button`
  margin-top: 4px;
  padding: 0;
  border: 0;
  background: none;
  color: ${t.muted};
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:hover { color: ${t.ink}; }
`;

const GigActions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
`;

const GigMoreRow = styled.div`
  margin-top: 10px;
`;

const ShowMoreBtn = styled.button`
  width: 100%;
  border: 1px solid ${t.line};
  background: ${t.white};
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 600;
  color: ${t.ink};
  cursor: pointer;
  font-family: inherit;
  &:hover { background: ${t.cream}; }
  &:disabled { opacity: 0.5; cursor: default; }
`;

const BrandCard = styled.div`
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 16px;
  padding: 10px 12px;
  min-width: 0;
`;

const Logo = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: ${t.subtle};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: ${t.muted};
  flex-shrink: 0;
  img { width: 100%; height: 100%; object-fit: contain; background: #fff; }
  .mark-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    line-height: 1;
  }
`;

const BrandMeta = styled.div`
  min-width: 0;
  overflow: hidden;
  .name { font-weight: 600; font-size: 14px; color: ${t.ink}; }
  .cat { font-size: 12px; color: ${t.muted}; margin-top: 2px; }
  .why {
    font-size: 13px;
    color: ${t.inkSoft};
    margin-top: 4px;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const ContactBtn = styled.button`
  background: ${t.action};
  color: #fff;
  border: 0;
  border-radius: ${t.radiusBtn};
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  &:disabled { opacity: 0.55; cursor: wait; }
`;

const BriefCard = styled.div`
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 16px;
  padding: 14px 16px;
  margin: 8px 0 16px;
  .kicker { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: ${t.accent}; }
  .title { font-family: ${t.fontDisplay}; font-size: 22px; margin: 4px 0 8px; }
  .summary { font-size: 14px; color: ${t.inkSoft}; line-height: 1.5; }
  .priority { margin-top: 10px; font-size: 13px; color: ${t.ink}; }
  ul { margin: 8px 0 0; padding-left: 18px; color: ${t.muted}; font-size: 13px; }
`;

const PitchCard = styled.div`
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 16px;
  padding: 14px;
  min-width: 0;
`;

const PitchLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${t.accent};
  margin-bottom: 8px;
`;

const PitchSubject = styled.div`
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
`;

const PitchBody = styled.pre`
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 13.5px;
  line-height: 1.5;
  color: ${t.inkSoft};
  margin: 0 0 12px;
`;

const PitchGap = styled.mark`
  background: #fde8e8;
  color: #9b1c1c;
  font-weight: 700;
  padding: 0 3px;
  border-radius: 4px;
`;

const PitchCoach = styled.div`
  background: #fff6e8;
  border: 1px solid #f0d9b0;
  color: #6b4a12;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.4;
  margin: 0 0 12px;
`;

const PitchActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Primary = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${t.action};
  color: #fff;
  border-radius: ${t.radiusBtn};
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
`;

const Ghost = styled.button`
  background: ${t.subtle};
  color: ${t.ink};
  border: 0;
  border-radius: ${t.radiusBtn};
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
`;

const bounce = keyframes`
  0%, 80%, 100% { opacity: .35; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-3px); }
`;

const Typing = styled.div`
  display: flex;
  gap: 5px;
  padding: 8px 2px 2px;
  span {
    width: 6px; height: 6px; border-radius: 50%;
    background: ${t.muted};
    animation: ${bounce} 1.1s infinite;
  }
  span:nth-child(2) { animation-delay: .15s; }
  span:nth-child(3) { animation-delay: .3s; }
`;

const ComposerWrap = styled.div`
  flex-shrink: 0;
  padding: 8px 16px 16px;
  background: linear-gradient(180deg, rgba(247,245,240,0) 0%, ${t.paper} 28%);

  @media (max-width: 840px) {
    padding: 8px 12px 12px;
  }
`;

const ChipRow = styled(Chips)`
  justify-content: flex-start;
  margin: 0 auto 10px;
  max-width: 720px;
  padding: 0 4px;
`;

const Composer = styled.form`
  display: flex;
  gap: 8px;
  align-items: flex-end;
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 28px;
  padding: 6px 6px 6px 18px;
  box-shadow: ${t.shadowCard};
`;

const Input = styled.textarea`
  flex: 1;
  resize: none;
  border: 0;
  outline: none;
  font-family: inherit;
  font-size: 15.5px;
  line-height: 1.45;
  min-height: 28px;
  max-height: 160px;
  background: transparent;
  color: ${t.ink};
  padding: 10px 0;
`;

const Send = styled.button`
  background: ${t.action};
  color: #fff;
  border: 0;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
  margin-bottom: 2px;
  &:disabled { opacity: 0.35; cursor: default; }
`;

function GigDesc({ text }) {
  const [open, setOpen] = useState(false);
  const cleaned = gigBlurb({ summary: text });
  if (!cleaned) return null;
  const long = cleaned.length > 240;
  return (
    <GigBody>
      <GigText $open={open || !long}>{cleaned}</GigText>
      {long ? (
        <MoreLink type="button" onClick={() => setOpen((v) => !v)}>
          {open ? 'Show less' : 'Show more'}
        </MoreLink>
      ) : null}
    </GigBody>
  );
}

function GigCard({ gig, busy, applying, onApply }) {
  const poster = String(gig?.brand_name || gig?.name || '').trim();
  const unknown = Boolean(gig?.brand_unknown) || /^unknown brand$/i.test(poster);
  const headline = String(gig?.headline || '').trim();
  const brand = unknown ? '' : poster;
  const title = brand || headline || 'Paid UGC offer';
  const rest = brand
    ? headline.replace(new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[-–:|]\\s*`, 'i'), '').trim()
    : headline;
  const subtitle = brand && rest && rest.toLowerCase() !== brand.toLowerCase()
    && !/^(affiliate|overview|what we|what to expect|why partner|welcome|how it works)/i.test(rest)
    ? rest
    : '';
  const source = gig?.source_label || (gig?.is_sourced ? 'other platform' : '');
  const deliverable = String(gig?.deliverable || '').trim();
  const summary = gigBlurb(gig);
  const pay = gigPayText(gig);
  const showDeliverable = deliverable && !summary.toLowerCase().includes(deliverable.toLowerCase());
  return (
    <GigCardShell>
      <GigTop>
        <Logo>
          <BrandLogoMark brand={{ name: title, logo: gig?.logo, category: gig?.category }} />
        </Logo>
        <GigHead>
          <GigTitleRow>
            <GigName>{title}</GigName>
            {pay ? <GigPay>{pay}</GigPay> : null}
          </GigTitleRow>
          {subtitle ? <GigProduct>{subtitle}</GigProduct> : null}
          <GigMeta>
            {gig?.location ? <span>{gig.location}</span> : null}
            {source ? <span>via {source}</span> : null}
            {gig?.category ? <span>{gig.category}</span> : null}
          </GigMeta>
        </GigHead>
      </GigTop>
      {showDeliverable ? <GigDeliverable>{deliverable}</GigDeliverable> : null}
      <GigDesc text={summary} />
      <GigActions>
        <ContactBtn
          type="button"
          disabled={busy || applying}
          onClick={onApply}
        >
          {applying ? 'Opening…' : gigApplyLabel(gig)}
        </ContactBtn>
      </GigActions>
    </GigCardShell>
  );
}

function KitMessage({ msg, onOpen }) {
  const ui = kitUi(msg);
  const body = chatTextWithoutPitch(ui.text, !!msg.pitch);
  return (
    <>
      <AssistantText>
        <PollyRichText text={scrubPollyVoice(body)} />
      </AssistantText>
      {ui.actions.length > 0 && (
        <PitchActions style={{ marginTop: 12 }}>
          {ui.actions.map((action) => (
            action.external ? (
              <Primary
                key={action.href}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {action.label}
              </Primary>
            ) : (
              <Ghost
                key={action.href}
                type="button"
                onClick={() => onOpen(action.href)}
              >
                {action.label}
              </Ghost>
            )
          ))}
        </PitchActions>
      )}
    </>
  );
}

export default function Polly() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useContext(UserContext) || {};
  const creatorId = user?.creator_id;
  const [greeting, setGreeting] = useState(
    "Hey, I'm Polly. I'm your Creator Assistant — I line up brand PR to pitch, and I find all paid UGC offers across all the platforms out there so you have them here in one place.\n\nWhat do you want to land first?"
  );
  const [credits, setCredits] = useState(null);
  const [messages, setMessages] = useState([]);
  const [ready, setReady] = useState(false);
  const [suggested, setSuggested] = useState([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [contactingId, setContactingId] = useState(null);
  const [applyingGigId, setApplyingGigId] = useState(null);
  const [mailHold, setMailHold] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [starters, setStarters] = useState(STARTERS);
  const [loadingMore, setLoadingMore] = useState(false);
  const [brief, setBrief] = useState(null);
  const threadRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(messages);
  const suggestedRef = useRef(suggested);
  const creatorIdRef = useRef(creatorId);
  const hydratedRef = useRef(false);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { suggestedRef.current = suggested; }, [suggested]);
  useEffect(() => { creatorIdRef.current = creatorId; }, [creatorId]);

  useLayoutEffect(() => {
    if (!creatorId) {
      if (userLoading === false) setReady(true);
      return;
    }
    const local = readPollyLocal(creatorId);
    const cached = usableThreadMessages(local?.messages);
    if (!cached.length) return;
    setMessages(cached);
    setSuggested(local?.suggested || []);
    hydratedRef.current = true;
    setReady(true);
  }, [creatorId, userLoading]);

  useEffect(() => {
    if (!creatorId || !hydratedRef.current) return;
    writePollyLocal(creatorId, messages, suggested);
  }, [creatorId, messages, suggested]);

  useEffect(() => {
    let cancelled = false;
    const applyServerThread = (msgs, brands, ownerId) => {
      const usable = usableThreadMessages(msgs);
      if (!usable.length) return false;
      hydratedRef.current = true;
      setMessages(usable);
      setSuggested(Array.isArray(brands) ? brands : []);
      setReady(true);
      if (ownerId) writePollyLocal(ownerId, usable, brands || []);
      return true;
    };

    (async () => {
      try {
        const res = await apiClient.get('/api/polly/thread');
        if (cancelled || !res.data?.success) return;
        applyServerThread(
          res.data.messages,
          res.data.suggested_brands,
          creatorIdRef.current,
        );
      } catch (_) { /* bootstrap still runs */ }
    })();

    (async () => {
      try {
        const res = await apiClient.get('/api/polly/bootstrap');
        if (cancelled || !res.data?.success) return;
        if (res.data.greeting) setGreeting(res.data.greeting);
        if (Array.isArray(res.data.starters) && res.data.starters.length) {
          setStarters(normalizeStarters(res.data.starters));
        }
        if (res.data.brief) setBrief(res.data.brief);
        if (res.data.credits) setCredits(res.data.credits);
        const ownerId = res.data.profile?.creator_id || creatorIdRef.current;
        const serverMsgs = Array.isArray(res.data.messages) ? res.data.messages : [];
        const serverSuggested = Array.isArray(res.data.suggested_brands) ? res.data.suggested_brands : [];
        const local = ownerId ? readPollyLocal(ownerId) : null;
        const orphan = readOrphanPollyLocal();
        clearOrphanPollyLocal();

        if (orphan?.messages?.length && threadsLookCopied(orphan.messages, serverMsgs)) {
          hydratedRef.current = true;
          setMessages([]);
          setSuggested([]);
          setReady(true);
          if (ownerId) writePollyLocal(ownerId, [], []);
          apiClient.put('/api/polly/thread', { messages: [], suggested_brands: [] }).catch(() => {});
          return;
        }

        if (applyServerThread(serverMsgs, serverSuggested, ownerId)) return;
        if (applyServerThread(local?.messages, local?.suggested, ownerId)) return;

        if (!messagesRef.current.length) {
          hydratedRef.current = true;
          setMessages([]);
          setSuggested([]);
        }
        setReady(true);
      } catch (err) {
        console.warn('Polly bootstrap', err);
        if (!cancelled && !messagesRef.current.length) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const persistThread = useCallback((nextMessages, nextSuggested) => {
    apiClient.put('/api/polly/thread', {
      messages: nextMessages,
      suggested_brands: nextSuggested,
    }).catch(() => {});
  }, []);

  const send = useCallback(async (text, extras = {}) => {
    const content = (text || '').trim();
    if (!content && !extras.action) return;
    const userMsg = content ? { id: newId(), role: 'user', content } : null;
    const history = userMsg ? [...messagesRef.current, userMsg] : messagesRef.current;
    if (userMsg) setMessages(history);
    setDraft('');
    setBusy(true);
    try {
      const payload = {
        messages: history.map(({ role, content: c, brands, gigs, pitch, id }) => ({
          id, role, content: c, brands, gigs, pitch,
        })),
        suggested_brands: suggestedRef.current,
        ...extras,
      };
      const res = await apiClient.post('/api/polly/chat', payload, { timeout: 90000 });
      const data = res.data || {};
      if (data.credits) {
        setCredits(data.credits);
        try {
          window.dispatchEvent(new CustomEvent('nc-credits-changed', { detail: data.credits }));
        } catch (_) { /* ignore */ }
      }
      let nextSuggested = suggestedRef.current;
      if (Array.isArray(data.suggested_brands)) {
        nextSuggested = data.suggested_brands;
        setSuggested(data.suggested_brands);
      } else if (Array.isArray(data.brands) && data.brands.length) {
        nextSuggested = data.brands;
        setSuggested(data.brands);
      }
      if (Array.isArray(data.starters) && data.starters.length) {
        setStarters(normalizeStarters(data.starters));
      }
      let thread = history;
      if (data.pitch_update) {
        thread = patchLastPitch(history, data.pitch_update);
        setMailHold(false);
      }
      const rawMessage = data.message || 'Done.';
      const gigs = uniqueGigs(data.gigs || []);
      const assistant = {
        id: newId(),
        role: 'assistant',
        content: stripKitEditorPaths(scrubPollyVoice(rawMessage)),
        brands: data.brands || [],
        gigs,
        gigs_has_more: typeof data.gigs_has_more === 'boolean'
          ? data.gigs_has_more
          : gigs.length >= 3,
        pitch: data.pitch || null,
        kit_actions: kitActionsFrom(data, rawMessage),
        task_chips: data.task_chips || [],
      };
      const next = [...thread, assistant];
      setMessages(next);
      persistThread(next, nextSuggested);
      if (data.pitch) {
        try { window.dispatchEvent(new Event('savedBrandCountChanged')); } catch (_) { /* ignore */ }
      }
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data || {};
      if (status === 402 || data.paywall) {
        if (data.credits) {
          setCredits(data.credits);
          try {
            window.dispatchEvent(new CustomEvent('nc-credits-changed', { detail: data.credits }));
          } catch (_) { /* ignore */ }
        }
        const rawMessage = data.message
          || "You're out of free unlocks this month.\n\nUnlock Pro and I'll keep pitching with you.";
        const assistant = {
          id: newId(),
          role: 'assistant',
          content: stripKitEditorPaths(scrubPollyVoice(rawMessage)),
          brands: data.brands || [],
          gigs: uniqueGigs(data.gigs || []),
          pitch: data.pitch || null,
          kit_actions: kitActionsFrom(data, rawMessage),
          task_chips: data.task_chips?.length
            ? data.task_chips
            : [{ id: 'unlock_pro', label: 'Unlock Pro to keep pitching', action: 'unlock_pro' }],
        };
        const next = [...history, assistant];
        setMessages(next);
        persistThread(next, suggestedRef.current);
      } else {
        const assistant = {
          id: newId(),
          role: 'assistant',
          content: data.error || data.message || 'Something went wrong. Try again.',
        };
        setMessages(prev => [...prev, assistant]);
      }
    } finally {
      setBusy(false);
      setContactingId(null);
      inputRef.current?.focus();
    }
  }, [persistThread]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (busy) return;
    send(draft);
  };

  const sendStarter = (chip) => {
    if (busy || loadingMore || !chip) return;
    if (chip.action === 'unlock_pro' || chip.id === 'unlock_pro') {
      setShowUpgrade(true);
      return;
    }
    send(chip.label, {
      action: chip.action,
      brand_id: chip.brand_id,
      brand_name: chip.brand_name,
      skip_discovery: Boolean(chip.skip_discovery),
      starter: chip.id,
      task_id: chip.task_id,
      chip_id: chip.id,
      is_followup: Boolean(chip.is_followup) || chip.id === 'draft_followup' || /follow-?up/i.test(chip.label || ''),
    });
  };

  const loadMoreGigs = async () => {
    if (busy || loadingMore) return;
    const history = messagesRef.current || [];
    const exclude = [];
    history.forEach((msg) => {
      (msg.gigs || []).forEach((gig) => {
        if (gig?.id != null) exclude.push(gig.id);
      });
    });
    setLoadingMore(true);
    try {
      let extra = [];
      let hasMore = false;
      try {
        const res = await apiClient.post('/api/polly/gigs/more', {
          exclude_ids: exclude,
          messages: history.map(({ role, content: c, brands, gigs, pitch, id }) => ({
            id, role, content: c, brands, gigs, pitch,
          })),
        }, { timeout: 30000 });
        extra = uniqueGigs(res.data?.gigs || []);
        hasMore = Boolean(res.data?.gigs_has_more);
      } catch (err) {
        if (err.response?.status !== 404) throw err;
        const res = await apiClient.post('/api/polly/chat', {
          messages: [
            ...history.map(({ role, content: c, brands, gigs, pitch, id }) => ({
              id, role, content: c, brands, gigs, pitch,
            })),
            { role: 'user', content: 'Show more offers' },
          ],
          suggested_brands: suggestedRef.current,
          action: 'suggest_gigs',
          starter: 'more_gigs',
          chip_id: 'more_gigs',
        }, { timeout: 90000 });
        extra = uniqueGigs(res.data?.gigs || []);
        hasMore = res.data?.gigs_has_more !== false && extra.length >= 3;
        if (Array.isArray(res.data?.starters) && res.data.starters.length) {
          setStarters(normalizeStarters(res.data.starters));
        }
      }
      setMessages((prev) => {
        let last = -1;
        prev.forEach((msg, i) => {
          if ((msg.gigs || []).length) last = i;
        });
        const next = prev.map((msg, i) => {
          if (i !== last) return msg;
          const merged = uniqueGigs([...(msg.gigs || []), ...extra]);
          return {
            ...msg,
            gigs: merged,
            gigs_has_more: Boolean(hasMore && extra.length),
          };
        });
        persistThread(next, suggestedRef.current);
        return next;
      });
    } catch (_) { /* keep the list; user can retry */ }
    finally {
      setLoadingMore(false);
    }
  };

  const contactBrand = (brand) => {
    if (busy || !brand?.id) return;
    setContactingId(brand.id);
    send(contactLineFor(brand), {
      action: 'generate_pitch',
      brand_id: brand.id,
      brand_name: brand.name,
    });
  };

  const applyGig = async (gig) => {
    if (busy || !gig?.id) return;
    setApplyingGigId(gig.id);
    try {
      const res = await apiClient.post(`/api/opportunities/${gig.id}/apply`, {}, { timeout: 30000 });
      const data = res.data || {};
      if (typeof data.used === 'number') {
        try {
          window.dispatchEvent(new CustomEvent('nc-credits-changed', { detail: { used: data.used } }));
        } catch (_) { /* ignore */ }
      }
      setMessages((prev) => prev.map((msg) => {
        if (!Array.isArray(msg.gigs)) return msg;
        return {
          ...msg,
          gigs: msg.gigs.map((g) => (g.id === gig.id ? { ...g, already_applied: true } : g)),
        };
      }));
      launchGigApply(gig, data);
    } catch (err) {
      const status = err.response?.status;
      const errData = err.response?.data || {};
      if (errData.error === 'limit_reached' || status === 403 || status === 402) {
        setShowUpgrade(true);
      } else if (status === 409) {
        setMessages((prev) => prev.map((msg) => {
          if (!Array.isArray(msg.gigs)) return msg;
          return {
            ...msg,
            gigs: msg.gigs.map((g) => (g.id === gig.id ? { ...g, already_applied: true } : g)),
          };
        }));
        launchGigApply(gig);
      }
    } finally {
      setApplyingGigId(null);
    }
  };

  const copyPitch = async (pitch) => {
    if (pitchHasPlaceholder(pitch)) {
      setMailHold(true);
      return;
    }
    try { await navigator.clipboard.writeText(pitch.body || ''); } catch (_) { /* ignore */ }
  };

  const openMail = (pitch) => {
    if (pitchHasPlaceholder(pitch)) {
      setMailHold(true);
      return;
    }
    if (pitch?.mailto) window.location.href = pitch.mailto;
  };

  const resizeInput = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const lastGigIdx = messages.reduce((acc, m, i) => ((m.gigs || []).length ? i : acc), -1);

  return (
    <Shell>
      <Thread ref={threadRef}>
        {!ready && messages.length === 0 ? (
          <ResumePending>
            <ResumeBar $w="58%" $h="44" />
            <ResumeBar $w="42%" $h="36" $end />
            <ResumeBar $w="70%" $h="54" />
          </ResumePending>
        ) : messages.length === 0 ? (
          <Empty>
            <AvatarMark src={POLLY_AVATAR_URL} alt="Polly" />
            <Title>Polly</Title>
            <Sub>{greeting}</Sub>
            <SuggestGrid>
              {starters.map((s) => (
                <SuggestCard
                  key={s.id || s.label}
                  type="button"
                  onClick={() => sendStarter(s)}
                  disabled={busy}
                >
                  <div className="title">{s.label}</div>
                  {s.hint ? <div className="hint">{s.hint}</div> : null}
                </SuggestCard>
              ))}
            </SuggestGrid>
          </Empty>
        ) : null}
        {brief && messages.length > 0 && (
          <BriefCard>
            <div className="kicker">Polly brief</div>
            <div className="title">{brief.title}</div>
            <div className="summary">{brief.summary}</div>
            {brief.priority ? <div className="priority">🎯 {brief.priority}</div> : null}
            {brief.watched?.length ? (
              <ul>
                {brief.watched.map((item, i) => <li key={`${item}-${i}`}>{item}</li>)}
              </ul>
            ) : null}
            {brief.chips?.length ? (
              <Chips style={{ marginTop: 12 }}>
                {brief.chips.map((s) => (
                  <Chip
                    key={s.id || s.label}
                    type="button"
                    $emphasis={isUnlockChip(s)}
                    onClick={() => sendStarter(s)}
                    disabled={busy}
                  >
                    {s.label}
                  </Chip>
                ))}
              </Chips>
            ) : null}
          </BriefCard>
        )}
        {messages.map((msg, idx) => (
          <Turn key={msg.id || msg.content}>
            {msg.role === 'user' ? (
              <UserRow>
                <UserBubble>{msg.content}</UserBubble>
              </UserRow>
            ) : (
              <AssistantRow>
                <PollyFace src={POLLY_AVATAR_URL} alt="" />
                <div>
                  {msg.kind === 'alert' ? <PitchLabel>Kit view</PitchLabel> : null}
                  {msg.kind === 'nudge' ? <PitchLabel>Polly nudge</PitchLabel> : null}
                  <KitMessage msg={msg} onOpen={navigate} />
                  {msg.task_chips?.length > 0 && (
                    <Chips style={{ marginTop: 12 }}>
                      {msg.task_chips.map((s) => (
                        <Chip
                          key={s.id || s.label}
                          type="button"
                          $emphasis={isUnlockChip(s)}
                          onClick={() => sendStarter(s)}
                          disabled={busy}
                        >
                          {s.label}
                        </Chip>
                      ))}
                    </Chips>
                  )}
                  {uniqueGigs(msg.gigs).length > 0 && (
                    <>
                      <GigList style={{ marginTop: 12 }}>
                        {uniqueGigs(msg.gigs).map((gig) => (
                          <GigCard
                            key={gig.id}
                            gig={gig}
                            busy={busy}
                            applying={applyingGigId === gig.id}
                            onApply={() => applyGig(gig)}
                          />
                        ))}
                      </GigList>
                      {idx === lastGigIdx && msg.gigs_has_more !== false && (
                        <GigMoreRow>
                          <ShowMoreBtn
                            type="button"
                            onClick={loadMoreGigs}
                            disabled={busy || loadingMore}
                          >
                            {loadingMore ? 'Loading more…' : 'Show more offers'}
                          </ShowMoreBtn>
                        </GigMoreRow>
                      )}
                    </>
                  )}
                  {msg.brands?.length > 0 && (
                    <BrandList style={{ marginTop: 12 }}>
                      {msg.brands.map((brand) => (
                        <BrandCard key={brand.id}>
                          <Logo>
                            <BrandLogoMark brand={brand} />
                          </Logo>
                          <BrandMeta>
                            <div className="name">{brand.name}</div>
                            <div className="cat">
                              {[brand.category, brand.match_score ? `${brand.match_score}% match` : null]
                                .filter(Boolean)
                                .join(' · ')}
                            </div>
                            {brandBlurb(brand) ? <div className="why">{brandBlurb(brand)}</div> : null}
                          </BrandMeta>
                          <ContactBtn
                            type="button"
                            disabled={busy}
                            onClick={() => contactBrand(brand)}
                          >
                            {contactingId === brand.id ? 'Writing…' : 'Contact'}
                          </ContactBtn>
                        </BrandCard>
                      ))}
                    </BrandList>
                  )}
                  {msg.pitch && (
                    <PitchCard style={{ marginTop: 12 }}>
                      <PitchLabel>
                        {msg.pitch.is_followup ? 'Follow-up for' : 'Pitch for'}{' '}
                        {msg.pitch.brand_name || 'this brand'}
                      </PitchLabel>
                      <PitchSubject>{msg.pitch.subject}</PitchSubject>
                      {pitchHasPlaceholder(msg.pitch) ? (
                        <PitchCoach>
                          Don&apos;t send this yet. Tell Polly your city and country
                          {mailHold ? ' — brands clock leftover [CITY, COUNTRY] instantly.' : ' so the shipping line looks professional.'}
                        </PitchCoach>
                      ) : null}
                      <PitchBodyText body={msg.pitch.body} />
                      <PitchActions>
                        {msg.pitch.mailto && (
                          <Primary href={msg.pitch.mailto} onClick={(e) => { e.preventDefault(); openMail(msg.pitch); }}>
                            Open email
                          </Primary>
                        )}
                        <Ghost type="button" onClick={() => copyPitch(msg.pitch)}>
                          {msg.pitch.is_followup ? 'Copy follow-up' : 'Copy pitch'}
                        </Ghost>
                      </PitchActions>
                    </PitchCard>
                  )}
                </div>
              </AssistantRow>
            )}
          </Turn>
        ))}
        {busy && (
          <Turn>
            <AssistantRow>
              <PollyFace src={POLLY_AVATAR_URL} alt="" />
              <Typing aria-label="Polly is typing"><span /><span /><span /></Typing>
            </AssistantRow>
          </Turn>
        )}
      </Thread>
      <ComposerWrap>
        {messages.length > 0 && composerStarters(starters, messages).length > 0 && (
          <ChipRow>
            {composerStarters(starters, messages).map((s) => (
              <Chip
                key={s.id || s.label}
                type="button"
                $emphasis={isUnlockChip(s)}
                onClick={() => sendStarter(s)}
                disabled={busy || loadingMore}
              >
                {s.label}
              </Chip>
            ))}
          </ChipRow>
        )}
        <Composer onSubmit={onSubmit}>
          <Input
            ref={inputRef}
            rows={1}
            placeholder="Ask anything"
            value={draft}
            disabled={busy}
            onChange={(e) => {
              setDraft(e.target.value);
              resizeInput(e.target);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!busy) send(draft);
              }
            }}
          />
          <Send type="submit" disabled={busy || !draft.trim()} aria-label="Send">↑</Send>
        </Composer>
      </ComposerWrap>
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        currentCount={credits?.used || 0}
        limit={credits?.limit || 3}
        unlockRemaining={credits?.remaining ?? 0}
        feature={Number(credits?.remaining) <= 0 ? 'unlock_paywall' : 'credits'}
      />
    </Shell>
  );
}
