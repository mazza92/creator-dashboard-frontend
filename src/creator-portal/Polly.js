import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import HotTag from './HotTag';
import { POLLY_AVATAR_URL } from '../config/pollyAvatar';
import styled, { keyframes } from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient, API_URL } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';
import UpgradeModal from './UpgradeModal';
import { AutopilotCard, AutopilotSettings, autopilotChip, useAutopilot } from './PollyAutopilot';
import PollyProSetup from './PollyProSetup';
import MondayBoard from './PollyBoard';
import CreatorHooks from './PollyHooks';
import { usePitchFacts } from './PollyPitchFacts';
import PollyWelcome from './PollyWelcome';
import { useTrialOffer } from '../utils/trialOffer';
import GiftingRadar from './PollyRadar';
import PitchBatchCard from './PollyPitchBatch';
import PollyActivityCard from './PollyActivityCard';
import PollyGoalPlanCard from './PollyGoalPlanCard';
import PollyHotlistCard from './PollyHotlistCard';
import PollyUpsellCard from './PollyUpsellCard';
import PollySentCard from './PollySentCard';
import { UserContext } from '../contexts/UserContext';
import PollyRichText from './pollyMarkdown';
import { ReplySignalChip } from '../components/ReplySignal';
import { scrubPollyVoice } from './pollyVoice';
import {
  clearOrphanPollyLocal,
  readOrphanPollyLocal,
  readPollyLocal,
  threadsLookCopied,
  writePollyLocal,
} from './pollyStorage';
import { brandMarkEmoji } from './brandMarkEmoji';
import { PollyChecklist } from './PollyChecklist';
import PollyFirstRun from './PollyFirstRun';
import { TRACKER_PATH, chipHref } from './tracker/trackerModel';
import { captureUpgradeDeeplink, dismissUpgradeDeeplink, isWinbackUpgradePending } from '../utils/upgradeDeeplink';

const STARTER_LABELS = {
  paid_ugc: 'Show paid UGC I can apply to now',
  line_up: 'Pitch 3 gifted brands for me today',
  name_a_brand: 'Write a pitch for a brand I name',
  more_replies: 'Make my kit get more replies',
};

const STARTER_HINTS = {
  gifted_lists: 'Brands that send boxes to creators your size',
  paid_ugc: 'Live briefs — tap Apply',
  line_up: "I'll draft the emails",
  name_a_brand: 'You pick, I write it',
  more_replies: 'Rates, bio, and proof brands open',
};

const DIRECTORY_PATH = '/creator/dashboard/pr-brands';
const STICK_THRESHOLD_PX = 80;

const AUTOPILOT_NOTICES = {
  gmail_connected: "Gmail connected. Your first pitches go out within the hour, then new ones every weekday. Nothing to approve.",
  review: "Here's what I lined up. Change brands or target any time in settings.",
  pro_started: "You're on Pro. Set your pitch style, connect Gmail, and your first pitches go out within the hour.",
  connect_gmail: "Connect Gmail and I'll send your waiting pitches on your next send day.",
  resume: "Autopilot is paused. Switch it back on and I'll pick up on your next send day.",
  gmail_denied: 'Gmail was not connected. You can try again any time.',
  gmail_failed: "Gmail didn't connect. Try again in a moment.",
};

const AUTOPILOT_STARTER = {
  id: 'autopilot',
  label: 'Do my outreach for me',
  hint: 'Pro: I send your pitches from Gmail and turn a yes into paid',
  action: 'autopilot',
};

// Same chip the server leads every row with (polly_discovery.TARGETS_CHIP), so it shows before bootstrap returns.
// The brands the creator saved with + Target in the Brands feed.
const TARGETS_STARTER = {
  id: 'pitch_targets',
  label: 'Pitch my saved brands',
  hint: 'The brands you saved in Brands',
  action: 'pitch_targets',
};

// Same deep answer brands get ("Hooks creators reuse in…"), read from creators this creator's size. 1 free, 4/mo on Pro.
const HOOKS_STARTER = { id: 'creator_hooks', label: '🎣 Hooks that work in my niche', action: 'creator_hooks' };

const STARTERS = [
  TARGETS_STARTER,
  { id: 'line_up', label: 'Pitch 3 gifted brands for me today', hint: STARTER_HINTS.line_up, action: 'suggest_brands', skip_discovery: true, deal: 'gifted' },
  { id: 'gifted_lists', label: 'Find brands to contact', hint: STARTER_HINTS.gifted_lists, action: 'suggest_brands', deal: 'gifted', skip_discovery: true },
  { id: 'name_a_brand', label: 'Write a pitch for a brand I name', hint: STARTER_HINTS.name_a_brand, action: 'ask_brand' },
  { id: 'more_replies', label: 'Make my kit get more replies', hint: STARTER_HINTS.more_replies, action: 'coach_profile' },
  { id: 'paid_ugc', label: 'Show paid UGC I can apply to now', hint: STARTER_HINTS.paid_ugc, action: 'suggest_gigs', skip_discovery: true },
];

const DEEP_LINK_CHIPS = {
  checkin_replied: { label: 'They replied', action: 'task_act' },
  checkin_quiet: { label: 'Still quiet', action: 'task_act' },
  checkin_not_sent: { label: 'I never sent it', action: 'task_act' },
  // Email one-tap already logged the bounce and looked for a new inbox; Polly answers with what it found.
  checkin_result: { label: 'My pitch email bounced', action: 'checkin_result' },
  pr_arrived: { label: 'Yes arrived', action: 'task_act' },
  pr_not_yet: { label: 'Not yet', action: 'task_act' },
  move_on: { label: 'Move on to next brand', action: 'task_act' },
  draft_followup: { label: 'Draft a follow-up', action: 'generate_pitch', is_followup: true },
  pitch_targets: { label: 'Pitch my saved brands', action: 'pitch_targets' },
  help_reply: { label: 'Help me reply', action: 'chat' },
  // Renewal note: we can't read their inbox, so the creator tells Polly how outreach is going.
  a_brand_replied: { label: 'A brand replied to my pitch. Help me answer it', action: 'chat' },
  tune_outreach: { label: 'No replies yet. What should we change to get more?', action: 'coach_profile' },
  paid_reply: { label: 'Write my reply', action: 'paid_reply' },
  ad_usage: { label: 'Ask them to run it as an ad', action: 'ad_usage' },
  open_board: { label: 'Open my weekly report', action: 'board' },
  need_idea: { label: 'Need a content idea', action: 'chat' },
  line_up: { label: 'Line up brands for me', action: 'suggest_brands', deal: 'gifted' },
  send_draft: { label: 'Show my pitch', action: 'generate_pitch' },
  pitch_brand: { label: 'Pitch this brand for me', action: 'generate_pitch' },
  // Paid offer check-in: add what they offered on the Tracker (opens the deal drawer on the amount).
  open_tracker_deal: { label: 'Add the amount', action: 'link' },
};


function takePitchSamples(brandId) {
  if (!brandId) return [];
  const key = `pollyPitchSamples:${brandId}`;
  try {
    const raw = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    const list = JSON.parse(raw || '[]');
    return Array.isArray(list) ? list.slice(0, 3) : [];
  } catch (_) {
    return [];
  }
}

function logPitchHandoff(pitch, method) {
  if (!pitch?.brand_id || pitch.is_reply) return Promise.resolve(null);
  return apiClient
    .post('/api/polly/pitch/handoff', {
      brand_id: pitch.brand_id,
      brand_name: pitch.brand_name || pitch.name || null,
      is_followup: Boolean(pitch.is_followup),
      method,
    })
    .then((res) => res?.data || null)
    .catch(() => null);
}

function csrfToken() {
  try {
    const cookie = document.cookie.split('; ').find((row) => row.startsWith('csrf_access_token='));
    return (cookie && cookie.split('=')[1]) || localStorage.getItem('csrf_token') || '';
  } catch (_) {
    return '';
  }
}

const BATCH_AFTER_CONNECT_KEY = 'pollySendBatchAfterConnect';

// Past this, a turn is treated as stuck: the skeleton gives way to a retry chip.
const TURN_TIMEOUT_MS = 40000;
// The first turn finds brands and writes every pitch in one go: give it longer before offering a retry.
const FIRST_BATCH_TIMEOUT_MS = 90000;

const INTENT_KIND = {
  suggest_brands: 'brands',
  generate_pitch: 'pitch',
  suggest_gigs: 'gigs',
};

// Server-sent events from /chat/stream. Returns {status, data}, or null when streaming
// isn't available so the caller can fall back to the plain request.
async function postChatStream(payload, { onIntent, onDelta, onReset, signal } = {}) {
  if (typeof fetch !== 'function' || typeof TextDecoder === 'undefined') return null;
  const headers = { 'Content-Type': 'application/json', Accept: 'text/event-stream' };
  const csrf = csrfToken();
  if (csrf) headers['X-CSRF-Token'] = csrf;
  let res;
  try {
    res = await fetch(`${API_URL || ''}/api/polly/chat/stream`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    return null;
  }
  if (!res.ok || !res.body || !(res.headers.get('content-type') || '').includes('text/event-stream')) {
    return null;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result = null;
  while (!result) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let cut = buffer.indexOf('\n\n');
    while (cut >= 0) {
      const block = buffer.slice(0, cut);
      buffer = buffer.slice(cut + 2);
      for (const line of block.split('\n')) {
        if (!line.startsWith('data:')) continue;
        let event;
        try { event = JSON.parse(line.slice(5)); } catch (_) { continue; }
        if (event.type === 'intent') onIntent?.(event.intent);
        else if (event.type === 'delta') onDelta?.(event.text || '');
        else if (event.type === 'reset') onReset?.();
        else if (event.type === 'done') result = { status: event.status || 200, data: event.data || {} };
      }
      cut = buffer.indexOf('\n\n');
    }
  }
  try { reader.cancel(); } catch (_) { /* ignore */ }
  if (!result) throw new Error('Polly stream ended early');
  return result;
}

function lockedPitchFrom(data) {
  const p = data?.paywall_payload;
  if (!p || !Array.isArray(p.preview) || !p.preview.length) return null;
  return { brand_name: p.brand_name || null, lines: p.preview, kind: p.kind || 'pitch' };
}

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
  const out = (list || []).map((s) => {
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
  // Targets lead every row exactly once, like with_radar_chip on the server. The TikTok radar chip is retired.
  return [TARGETS_STARTER, ...out.filter((s) => s.action !== 'gifting_radar' && s.action !== 'pitch_targets')];
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
  const text = String(gig?.summary || gig?.blurb || '')
    .replace(/\s+/g, ' ')
    .replace(/\s+,/g, ',')
    .replace(/,{2,}/g, ',')
    .trim();
  if (!text || text.length < 24) return '';
  if (/^[a-z]/.test(text)) return '';
  if (/^(usd|eur|gbp)\b/i.test(text)) return '';
  if (/\ba to\b/i.test(text) || /,\s*,/.test(text) || /\bof\s*,/.test(text)) return '';
  return text;
}

function gigPostedLabel(iso) {
  if (!iso) return '';
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';
  const days = Math.floor((Date.now() - then.getTime()) / 86400000);
  if (days <= 0) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  if (days < 14) return `Posted ${days} days ago`;
  return `Posted ${then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

function gigPayText(gig) {
  const label = String(gig?.pay_label || '').trim();
  if (/[$£€₹]\s*\d/.test(label)) return label;
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

// Pitches never wait on a city: older drafts may still carry the placeholder, shown (and sent) without it.
function dropLocationPlaceholder(text) {
  const ph = /\[\s*city\s*,\s*country\s*\]/i;
  if (!text || !ph.test(text)) return text;
  return text
    .replace(/\s+(?:to|in|from|out of)\s+\[\s*city\s*,\s*country\s*\]/gi, '')
    .replace(/\[\s*city\s*,\s*country\s*\]/gi, '')
    .replace(/[ \t]+([.,!?;:])/g, '$1');
}

function cleanMailto(mailto) {
  if (!mailto || !/city/i.test(decodeURIComponentSafe(mailto))) return mailto;
  const [head, query = ''] = mailto.split('?');
  const parts = query.split('&').map((kv) => {
    const [k, v = ''] = kv.split('=');
    return `${k}=${encodeURIComponent(dropLocationPlaceholder(decodeURIComponentSafe(v)))}`;
  });
  return `${head}?${parts.join('&')}`;
}

function decodeURIComponentSafe(v) {
  try { return decodeURIComponent(v); } catch (_) { return v; }
}

function canSendForMe(pitch) {
  return Boolean(pitch?.email && pitch?.brand_id && !pitch?.is_reply && !pitch?.is_followup && !pitch?.sent_via_gmail);
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


const LiveToast = styled.div`
  position: fixed;
  z-index: 60;
  left: 50%;
  top: 76px;
  transform: translateX(-50%);
  width: min(520px, calc(100vw - 24px));
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #12141a;
  color: #fff;
  font-size: 14px;
  line-height: 1.4;
  box-shadow: 0 12px 30px rgba(18, 20, 26, 0.25);
  @media (max-width: 768px) { top: 116px; }
  > span:nth-child(2) { flex: 1; min-width: 0; }
  b { font-weight: 700; }
  button { background: none; border: 0; color: #c9ccd3; font-size: 20px; line-height: 1; min-width: 32px; min-height: 32px; cursor: pointer; }
`;

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
  overflow-anchor: none;
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

const Sub = styled.div`
  color: ${t.muted};
  font-size: 16px;
  line-height: 1.5;
  margin: 0 auto 22px;
  max-width: 42ch;

  p { margin: 0 0 10px; }
  p:last-child { margin-bottom: 0; }
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
  /* minmax(0, 1fr): a long link in a pitch must wrap, not widen the whole column past the screen */
  grid-template-columns: 32px minmax(0, 1fr);
  > * { min-width: 0; }
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

const BatchCta = styled.div`
  margin-top: 12px;
  display: grid;
  gap: 6px;
  button {
    width: 100%;
    min-height: 50px;
    border: 0;
    border-radius: 14px;
    background: ${t.ink};
    color: #fff;
    font: inherit;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
  }
  button:disabled { opacity: 0.6; cursor: default; }
  button:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }
  span { text-align: center; font-size: 12.5px; color: ${t.muted}; }
  button.alt {
    min-height: 40px;
    background: none;
    color: ${t.ink};
    font-size: 14px;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const SendForMe = styled.button`
  border: 0;
  border-radius: ${t.radiusBtn};
  background: ${t.ink};
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  padding: 10px 16px;
  min-height: 44px;
  cursor: pointer;
  &:disabled { opacity: 0.55; cursor: default; }
`;

const PitchSentNote = styled.div`
  margin: 0 0 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: #e7f3ee;
  color: #165c3f;
  font-size: 13.5px;
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  .name-link { display: inline-block; text-decoration: none; }
  .name-link span { color: ${t.muted}; font-weight: 500; }
  .name-link:hover { text-decoration: underline; text-underline-offset: 3px; }
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

const PitchEdited = styled.span`
  margin-left: 8px;
  padding: 2px 7px;
  border-radius: 999px;
  background: #ECFDF5;
  color: #047857;
  font-size: 10.5px;
  letter-spacing: 0.02em;
  text-transform: none;
`;

function pitchEditedLabel(iso) {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return 'Updated';
  const mins = (Date.now() - at.getTime()) / 60000;
  if (mins < 5) return 'Updated just now';
  return `Updated ${at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}

const PitchPrefsLine = styled.div`
  font-size: 11.5px;
  color: ${t.muted};
  margin: 2px 0 6px;
`;

const PitchSubject = styled.div`
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
`;

const PitchTo = styled.div`
  font-size: 13px;
  color: ${t.muted};
  margin-bottom: 4px;
  word-break: break-all;
`;

const PitchHint = styled.div`
  font-size: 12.5px;
  line-height: 1.45;
  color: ${t.muted};
  margin-top: 10px;
`;

const LockedLines = styled.div`
  font-size: 13.5px;
  line-height: 1.5;
  color: ${t.inkSoft};
  white-space: pre-wrap;
`;

const LockedBlur = styled.div`
  margin: 6px 0 12px;
  filter: blur(4px);
  user-select: none;
  pointer-events: none;
  font-size: 13.5px;
  line-height: 1.5;
  color: ${t.inkSoft};
`;

const UnlockBtn = styled.button`
  background: ${t.action};
  color: #fff;
  border: none;
  border-radius: ${t.radiusBtn};
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`;

const PitchBody = styled.pre`
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
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

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

const WorkingStatus = styled.div`
  font-size: 13px;
  color: ${t.muted};
  margin-top: 2px;
  animation: ${fadeUp} .25s ease;
`;

const SkeletonCard = styled.div`
  height: 64px;
  border-radius: 14px;
  border: 1px solid ${t.line};
  background: linear-gradient(90deg, ${t.subtle} 0px, ${t.white} 80px, ${t.subtle} 160px);
  background-size: 400px 100%;
  animation: ${shimmer} 1.2s linear infinite;
`;

const SkeletonList = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 10px;
  width: min(420px, 100%);
`;

const RevealIn = styled.div`
  animation: ${fadeUp} .3s ease both;
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

  @media (max-width: 840px) {
    display: ${p => (p.$hidden ? 'none' : 'flex')};
    flex-wrap: nowrap;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x proximity;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    margin: 0 -12px 8px;
    padding: 0 12px;
    gap: 6px;
    mask-image: linear-gradient(90deg, #000 85%, transparent);
    -webkit-mask-image: linear-gradient(90deg, #000 85%, transparent);
    &::-webkit-scrollbar { display: none; }
    & > button {
      flex: 0 0 auto;
      white-space: nowrap;
      scroll-snap-align: start;
      padding: 7px 12px;
      font-size: 13px;
    }
  }
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
  const posted = gigPostedLabel(gig?.posted_at);
  const meta = [
    gig?.location,
    source ? `via ${source}` : '',
    posted,
  ].filter(Boolean).join(' · ');
  const showDeliverable = deliverable.length > 8
    && !summary.toLowerCase().includes(deliverable.toLowerCase());
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
          {meta ? <GigMeta>{meta}</GigMeta> : null}
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

const WORKING_STEPS = {
  brands: ['Reading your profile…', 'Checking who’s picking creators this week…', 'Picking your best 3…'],
  pitch: ['Reading the brand…', 'Matching it to your content…', 'Writing your pitch…'],
  first_batch: ['Reading your profile…', 'Finding the brands most likely to answer you…', 'Writing your pitches…',
    'Tailoring each one to that brand…'],
  gigs: ['Scanning paid boards…', 'Filtering for your size…'],
  chat: ['Thinking…'],
};

function workingKind(extras, text) {
  const action = extras?.action;
  if (extras?.then_batch) return 'first_batch';
  if (action === 'suggest_brands') return 'brands';
  if (action === 'generate_pitch' || extras?.brand_id) return 'pitch';
  if (action === 'suggest_gigs') return 'gigs';
  if (/\b(brands?|match|who should i pitch)\b/i.test(text || '')) return 'brands';
  if (/\b(pitch|email|write)\b/i.test(text || '')) return 'pitch';
  return 'chat';
}

function PollyWorking({ kind }) {
  const steps = WORKING_STEPS[kind] || WORKING_STEPS.chat;
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    if (steps.length < 2) return undefined;
    const id = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1100);
    return () => clearInterval(id);
  }, [kind, steps.length]);
  return (
    <div>
      <Typing aria-label="Polly is typing"><span /><span /><span /></Typing>
      <WorkingStatus key={step}>{steps[step]}</WorkingStatus>
      {kind === 'brands' && (
        <SkeletonList aria-hidden="true">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </SkeletonList>
      )}
    </div>
  );
}

function useStreamedText(text, active) {
  const [shown, setShown] = useState(active ? '' : text);
  useEffect(() => {
    if (!active || !text) {
      setShown(text);
      return undefined;
    }
    // Stream like a chat model: fast, word-sized chunks, capped at ~0.9s total.
    const words = text.split(/(\s+)/);
    const perTick = Math.max(1, Math.ceil(words.length / 45));
    let i = 0;
    setShown('');
    const id = setInterval(() => {
      i += perTick;
      setShown(words.slice(0, i).join(''));
      if (i >= words.length) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [text, active]);
  return shown;
}

function KitMessage({ msg, onOpen, stream = false }) {
  const ui = kitUi(msg);
  const body = chatTextWithoutPitch(ui.text, !!msg.pitch);
  const shown = useStreamedText(scrubPollyVoice(body), stream);
  return (
    <>
      <AssistantText>
        <PollyRichText text={shown} />
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
  const [searchParams] = useSearchParams();
  const { user, loading: userLoading } = useContext(UserContext) || {};
  const creatorId = user?.creator_id;
  const [greeting, setGreeting] = useState(
    "Hey, I'm Polly. I'm your Creator Assistant — I get you on brands' gifted PR lists and write the pitches for the ones worth emailing. When you're ready for paid work, I pull paid UGC offers from across the platforms into one place.\n\nWhat do you want to land first?"
  );
  const [credits, setCredits] = useState(null);
  const [messages, setMessages] = useState([]);
  const [ready, setReady] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  // A deep-linked task waits for the server thread; show Polly working meanwhile.
  const [pendingLinkKind, setPendingLinkKind] = useState(() => {
    const base = DEEP_LINK_CHIPS[searchParams.get('chip')];
    return base && base.action !== 'link' ? workingKind({ action: base.action, brand_id: searchParams.get('brand_id') }, base.label) : null;
  });
  const turnInFlightRef = useRef(false);
  const [suggested, setSuggested] = useState([]);
  const [draft, setDraft] = useState('');
  const [composerFocused, setComposerFocused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyKind, setBusyKind] = useState('chat');
  const [streamId, setStreamId] = useState(null);
  const [liveText, setLiveText] = useState('');
  const liveTextRef = useRef('');
  const [contactingId, setContactingId] = useState(null);
  const [applyingGigId, setApplyingGigId] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [mailTriedId, setMailTriedId] = useState(null);
  const [loggedSentId, setLoggedSentId] = useState(null);
  const [autoAction, setAutoAction] = useState(null);
  const autoFiredRef = useRef(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [autopilotOpen, setAutopilotOpen] = useState(false);
  const [autopilotSettingsOpen, setAutopilotSettingsOpen] = useState(false);
  const [autopilotNotice, setAutopilotNotice] = useState('');
  const pitchFacts = usePitchFacts();
  const [welcomeDone, setWelcomeDone] = useState(false);
  // First run (bootstrap.first_run): the welcome with lined-up brands and two choices, until the creator picks.
  const [firstRun, setFirstRun] = useState(null);
  const pendingTrialRef = useRef(false);
  const [autopilotReturn, setAutopilotReturn] = useState('');
  const autopilot = useAutopilot(Boolean(creatorId));
  const autopilotAutoOpenedRef = useRef(false);
  const [setup, setSetup] = useState({ open: false, section: null });
  const setupAutoOpenedRef = useRef(false);
  const [starters, setStarters] = useState(STARTERS);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hooksBusy, setHooksBusy] = useState(false);
  const threadRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const inputRef = useRef(null);
  const messagesRef = useRef(messages);
  const suggestedRef = useRef(suggested);
  const creatorIdRef = useRef(creatorId);
  const hydratedRef = useRef(false);

  useEffect(() => {
    const brand = searchParams.get('brand');
    if (!brand) return;
    navigate(`/creator/dashboard/pr-brands?${searchParams.toString()}`, { replace: true });
  }, [searchParams, navigate]);

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
    const onPlan = () => {
      apiClient.get('/api/polly/thread').then((res) => {
        const msgs = Array.isArray(res.data?.messages) ? res.data.messages : [];
        if (!res.data?.success || !msgs.length || turnInFlightRef.current) return;
        setMessages(msgs);
        setTimeout(() => {
          const el = threadRef.current;
          if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        }, 80);
      }).catch(() => {});
    };
    window.addEventListener('nc-polly-reload', onPlan);
    return () => window.removeEventListener('nc-polly-reload', onPlan);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const applyServerThread = (msgs, brands, ownerId) => {
      const usable = usableThreadMessages(msgs);
      if (!usable.length) return false;
      hydratedRef.current = true;
      // A turn started off the local cache owns the thread until it lands.
      if (turnInFlightRef.current) return true;
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
        setFirstRun(res.data.first_run || null);
        if (res.data.credits) setCredits(res.data.credits);
        const ownerId = res.data.profile?.creator_id || creatorIdRef.current;
        const serverMsgs = Array.isArray(res.data.messages) ? res.data.messages : [];
        if (res.data.first_run && !serverMsgs.length) {
          // Welcome: the server cleared Polly's earlier auto-notes; drop any cached copy so they don't come back.
          hydratedRef.current = true;
          setMessages([]);
          setSuggested([]);
          setReady(true);
          if (ownerId) writePollyLocal(ownerId, [], []);
          return;
        }
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
          if (res.data.auto_action?.action) setAutoAction(res.data.auto_action);
        }
        setReady(true);
      } catch (err) {
        console.warn('Polly bootstrap', err);
        if (!cancelled && !messagesRef.current.length) setReady(true);
      } finally {
        if (!cancelled) setServerReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Chat-style scroll: stay pinned to the newest message unless the reader scrolled up.
  useEffect(() => {
    const el = threadRef.current;
    if (!el) return undefined;
    let lastTop = el.scrollTop;
    const pin = () => {
      if (stickToBottomRef.current) el.scrollTop = el.scrollHeight;
      lastTop = el.scrollTop;
    };
    // Only an upward move unpins: our own pins move down, and late-loading content doesn't scroll.
    const onScroll = () => {
      const top = el.scrollTop;
      if (el.scrollHeight - top - el.clientHeight < STICK_THRESHOLD_PX) stickToBottomRef.current = true;
      else if (top < lastTop - 2) stickToBottomRef.current = false;
      lastTop = top;
    };
    const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(pin) : null;
    const watchChildren = () => {
      if (!resize) return;
      resize.disconnect();
      resize.observe(el);
      Array.from(el.children).forEach((child) => resize.observe(child));
    };
    const mutations = new MutationObserver(() => {
      watchChildren();
      pin();
    });
    watchChildren();
    mutations.observe(el, { childList: true });
    el.addEventListener('scroll', onScroll, { passive: true });
    pin();
    return () => {
      el.removeEventListener('scroll', onScroll);
      mutations.disconnect();
      if (resize) resize.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    if (messages[messages.length - 1]?.role === 'user') stickToBottomRef.current = true;
    if (stickToBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, busy, autopilotOpen]);

  const reloadAutopilot = autopilot.reload;
  const openAutopilot = useCallback(() => {
    setAutopilotOpen(true);
    reloadAutopilot();
  }, [reloadAutopilot]);

  // Free-week signups (?ref=polly_trial7 from the creator cold email). The server remembers the offer, so it
  // survives approval delays and new devices; the stored ref is a fallback for the first load.
  const trialOffer = useTrialOffer(Boolean(serverReady && creatorId));
  const invitedTrial = Boolean(trialOffer?.invited && trialOffer?.days);
  useEffect(() => {
    if (!serverReady || !creatorId) return;
    let offer = null;
    try { offer = localStorage.getItem('nc_offer'); } catch (_) { /* storage blocked */ }
    if (offer === 'polly_trial7') {
      try { localStorage.removeItem('nc_offer'); } catch (_) { /* storage blocked */ }
      pendingTrialRef.current = true;
    }
  }, [serverReady, creatorId]);
  useEffect(() => {
    if (!invitedTrial) return;
    let shown = false;
    try { shown = sessionStorage.getItem('polly_trial_shown') === '1'; } catch (_) { /* ignore */ }
    if (!shown) pendingTrialRef.current = true;
  }, [invitedTrial]);

  // The free week opens right after the first brands land (value first, then the offer), or straight away on a
  // returning visit. Once per session.
  useEffect(() => {
    if (!pendingTrialRef.current || autopilotOpen || busy) return;
    if (messages.length === 0) return;
    const brandsShown = messages.some((m) => m.role === 'assistant' && (m.brands?.length || m.pitch));
    // New this session (welcome or first matches running): wait for the brands. Returning: show it now.
    if (!brandsShown && (welcomeDone || autoFiredRef.current)) return;
    pendingTrialRef.current = false;
    try { sessionStorage.setItem('polly_trial_shown', '1'); } catch (_) { /* ignore */ }
    openAutopilot();
  }, [messages, autopilotOpen, busy, openAutopilot, welcomeDone]);

  useEffect(() => {
    const ap = autopilot.state;
    if (!ap || autopilotAutoOpenedRef.current) return;
    autopilotAutoOpenedRef.current = true;
    if (ap.is_pro && (ap.gmail?.connected || (ap.send_via === 'newcollab' && ap.relay?.available)) && (ap.items || []).some((i) => i.status === 'draft')) {
      setAutopilotOpen(true);
    }
  }, [autopilot.state]);

  const openSetup = useCallback((section) => setSetup({ open: true, section: section || null }), []);
  const closeSetup = useCallback(() => {
    setSetup({ open: false, section: null });
    reloadAutopilot();
    setAutopilotOpen(true);
  }, [reloadAutopilot]);
  const finishSetup = useCallback(() => {
    setSetup({ open: false, section: null });
    setAutopilotReturn('');
    setAutopilotNotice("Autopilot is on. Your first pitches go out within the hour, then new ones every weekday.");
    reloadAutopilot();
    setAutopilotOpen(true);
  }, [reloadAutopilot]);

  const persistThread = useCallback((nextMessages, nextSuggested) => {
    apiClient.put('/api/polly/thread', {
      messages: nextMessages,
      suggested_brands: nextSuggested,
    }).catch(() => {});
  }, []);

  const settleRadar = useCallback((radar) => {
    if (!radar?.run_id) return;
    setMessages((prev) => {
      let changed = false;
      const next = prev.map((msg) => {
        if (msg.radar?.run_id !== radar.run_id || msg.radar.status === radar.status) return msg;
        changed = true;
        return { ...msg, radar };
      });
      if (!changed) return prev;
      persistThread(next, suggestedRef.current);
      return next;
    });
  }, [persistThread]);

  const [sendingBatch, setSendingBatch] = useState(false);

  // Live proof while Polly is open: a brand opening the creator's media kit (or a logged reply) pops up here.
  // In-app only, no email. Checks every 45s while the tab is visible.
  const [liveToast, setLiveToast] = useState(null);
  useEffect(() => {
    if (!ready || !creatorId) return undefined;
    let since = new Date().toISOString();
    let stopped = false;
    let hideTimer = null;
    const check = async () => {
      if (stopped || document.visibilityState !== 'visible') return;
      try {
        const { data } = await apiClient.get('/api/polly/activity/live', { params: { since } });
        if (data?.now) since = data.now;
        const ev = (data?.events || [])[0];
        if (ev && !stopped) {
          setLiveToast(ev);
          clearTimeout(hideTimer);
          hideTimer = setTimeout(() => setLiveToast(null), 8000);
        }
      } catch (_) { /* quiet: it's a bonus, never an error */ }
    };
    const id = setInterval(check, 45000);
    return () => { stopped = true; clearInterval(id); clearTimeout(hideTimer); };
  }, [ready, creatorId]);

  const connectGmailForBatch = useCallback(async (pending = '1') => {
    try {
      localStorage.setItem(BATCH_AFTER_CONNECT_KEY, typeof pending === 'string' ? pending : '1');
      const res = await apiClient.get('/api/polly/autopilot/gmail/connect');
      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }
    } catch (_) { /* fall through */ }
    try { localStorage.removeItem(BATCH_AFTER_CONNECT_KEY); } catch (_) { /* ignore */ }
    setMessages((prev) => [...prev, {
      id: newId(), role: 'assistant', content: "Gmail didn't open. Try again in a moment.",
    }]);
  }, []);

  const sendBatch = useCallback(async () => {
    if (sendingBatch) return;
    setSendingBatch(true);
    let reply;
    try {
      const res = await apiClient.post('/api/polly/pitch-batch/send', {}, { timeout: 60000 });
      reply = res.data || {};
    } catch (err) {
      const data = err.response?.data || {};
      if (err.response?.status === 409 && data.error === 'gmail_not_connected') {
        setSendingBatch(false);
        connectGmailForBatch();
        return;
      }
      reply = { message: data.message || data.error || "The send didn't go through. Try again." };
    }
    const results = Array.isArray(reply.results) ? reply.results : [];
    const byBrand = new Map(results.map((r) => [String(r.brand_id), r]));
    const current = messagesRef.current;
    let batchIdx = -1;
    current.forEach((m, i) => { if (m.pitch_batch?.items?.length) batchIdx = i; });
    const patched = current.map((m, i) => {
      if (i !== batchIdx || !byBrand.size) return m;
      const items = m.pitch_batch.items.map((item) => (
        byBrand.has(String(item.brand_id)) ? (() => {
          const r = byBrand.get(String(item.brand_id));
          return { ...item, status: r.status, sent_at: r.sent_at || item.sent_at, to: r.to || item.to,
            gmail_url: r.gmail_url || item.gmail_url };
        })() : item
      ));
      return { ...m, pitch_batch: { ...m.pitch_batch, items, status: reply.sent ? 'sent' : m.pitch_batch.status } };
    });
    const next = [...patched, {
      id: newId(),
      role: 'assistant',
      content: scrubPollyVoice(reply.message || 'Done.'),
      task_chips: reply.task_chips || [],
      sent_summary: reply.sent_summary || null,
    }];
    setMessages(next);
    if (reply.sent) {
      try { window.dispatchEvent(new Event('nc-tracker-changed')); } catch (_) { /* ignore */ }
    }
    if (reply.sent_summary) {
      // Land on the win, not on an older card: after the Gmail redirect the thread may not be at the bottom.
      setTimeout(() => {
        const el = threadRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }, 80);
    }
    persistThread(next, suggestedRef.current);
    if (reply.sent) {
      try { window.dispatchEvent(new Event('savedBrandCountChanged')); } catch (_) { /* ignore */ }
    }
    setSendingBatch(false);
  }, [sendingBatch, connectGmailForBatch, persistThread]);

  // 'Send for me' on a single pitch card: the pitch Polly stored for that brand goes out from their Gmail.
  const [sendingPitchId, setSendingPitchId] = useState(null);
  const sendSingle = useCallback(async (brandId) => {
    if (!brandId || sendingPitchId) return;
    setSendingPitchId(brandId);
    let reply;
    try {
      const res = await apiClient.post('/api/polly/pitch/send', { brand_id: brandId }, { timeout: 45000 });
      reply = res.data || {};
    } catch (err) {
      const data = err.response?.data || {};
      if (err.response?.status === 409 && data.error === 'gmail_not_connected') {
        setSendingPitchId(null);
        connectGmailForBatch(`brand:${brandId}`);
        return;
      }
      reply = { message: data.message || "The send didn't go through. Try again, or tap Open email." };
    }
    const sentOk = (reply.results || []).some((r) => r.status === 'sent');
    const current = messagesRef.current.map((m) => (
      sentOk && m.pitch && String(m.pitch.brand_id) === String(brandId) ? { ...m, pitch: { ...m.pitch, sent_via_gmail: true } } : m
    ));
    const next = [...current, {
      id: newId(), role: 'assistant', content: scrubPollyVoice(reply.message || 'Done.'),
      task_chips: reply.task_chips || [], sent_summary: reply.sent_summary || null,
    }];
    setMessages(next);
    persistThread(next, suggestedRef.current);
    if (reply.sent_summary) {
      setTimeout(() => {
        const el = threadRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }, 80);
    }
    setSendingPitchId(null);
  }, [sendingPitchId, connectGmailForBatch, persistThread]);

  const send = useCallback(async (text, extras = {}) => {
    const content = (text || '').trim();
    if (!content && !extras.action) return;
    const userMsg = content ? { id: newId(), role: 'user', content } : null;
    const history = userMsg ? [...messagesRef.current, userMsg] : messagesRef.current;
    if (userMsg) setMessages(history);
    setDraft('');
    setBusyKind(workingKind(extras, content));
    liveTextRef.current = '';
    setLiveText('');
    setBusy(true);
    turnInFlightRef.current = true;
    const abort = typeof AbortController === 'function' ? new AbortController() : null;
    const turnTimeout = extras?.then_batch ? FIRST_BATCH_TIMEOUT_MS : TURN_TIMEOUT_MS;
    const abortTimer = abort ? setTimeout(() => abort.abort(), turnTimeout) : null;
    try {
      const payload = {
        messages: history.map(({ role, content: c, brands, gigs, pitch, id }) => ({
          id, role, content: c, brands, gigs, pitch,
        })),
        suggested_brands: suggestedRef.current,
        ...extras,
      };
      let result = null;
      try {
        result = await postChatStream(payload, {
          signal: abort?.signal,
          onIntent: (intent) => { if (INTENT_KIND[intent]) setBusyKind(INTENT_KIND[intent]); },
          onDelta: (chunk) => {
            liveTextRef.current += chunk;
            setLiveText(liveTextRef.current);
          },
          onReset: () => {
            liveTextRef.current = '';
            setLiveText('');
          },
        });
      } catch (streamErr) {
        if (abort?.signal.aborted) throw streamErr;
        console.warn('Polly stream', streamErr);
        result = {
          status: 500,
          data: { success: false, error: 'Polly lost the connection. Try again.' },
        };
      }
      if (!result) {
        const res = await apiClient.post('/api/polly/chat', payload, {
          timeout: turnTimeout,
          signal: abort?.signal,
        });
        result = { status: res.status || 200, data: res.data || {} };
      }
      if (result.status >= 400) {
        const httpErr = new Error(`Polly chat ${result.status}`);
        httpErr.response = { status: result.status, data: result.data };
        throw httpErr;
      }
      const data = result.data || {};
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
      }
      if (data.pitch_batch?.items?.length) {
        thread = thread.map((m) => (m.pitch_batch ? { ...m, pitch_batch: null } : m));
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
        gigs_locked: Number(data.gigs_locked) || 0,
        pitch: data.pitch || null,
        pitch_batch: data.pitch_batch?.items?.length ? data.pitch_batch : null,
        kit_actions: kitActionsFrom(data, rawMessage),
        task_chips: data.task_chips || [],
        locked_pitch: lockedPitchFrom(data),
        ...(data.board ? { kind: 'board', board: data.board } : {}),
        ...(data.radar ? { radar: data.radar } : {}),
      };
      const next = [...thread, assistant];
      setStreamId(liveTextRef.current ? null : assistant.id);
      liveTextRef.current = '';
      setLiveText('');
      setMessages(next);
      persistThread(next, nextSuggested);
      if (data.pitch || data.pitch_batch) {
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
          || "You're out of free credits this month.\n\nOn Pro I pitch 3 new brands for you every weekday from your Gmail, with follow-ups on day 4 and day 10, and show you who opened your kit. That's daily outreach you couldn't keep up by hand. When a brand replies, I write your answer. Unlimited roster applications too.";
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
            : [{ id: 'unlock_pro', label: 'Put Polly to work · Pro', action: 'unlock_pro' }],
          locked_pitch: lockedPitchFrom(data),
        };
        const next = [...history, assistant];
        setMessages(next);
        persistThread(next, suggestedRef.current);
        // Free credits used up (the 4th send): show the goal-based paywall now, at peak intent.
        // The written pitch stays in the thread either way.
        if (status === 402) setShowUpgrade(true);
      } else {
        const timedOut = abort?.signal.aborted || err.code === 'ECONNABORTED';
        const retry = extras.action
          ? [{ ...extras, id: extras.starter || extras.chip_id || 'retry', label: 'Try again' }]
          : [];
        const assistant = {
          id: newId(),
          role: 'assistant',
          content: timedOut
            ? "That's taking me longer than it should. Tap below and I'll try again."
            : (data.error || data.message || 'Something went wrong. Try again.'),
          task_chips: retry,
        };
        setMessages(prev => [...prev, assistant]);
      }
    } finally {
      if (abortTimer) clearTimeout(abortTimer);
      turnInFlightRef.current = false;
      liveTextRef.current = '';
      setLiveText('');
      setBusy(false);
      setContactingId(null);
      if (!window.matchMedia?.('(pointer: coarse)').matches) inputRef.current?.focus();
    }
  }, [persistThread]);

  const firstVisit = ready && !welcomeDone && messages.length === 0
    && !(creatorId && readPollyLocal(creatorId)?.messages?.length);
  const welcomeMode = firstVisit && !firstRun && Boolean(pitchFacts.facts?.needs_confirm);

  // Pro setup journey: right after checkout or Gmail, and once a session for Pro creators who haven't finished
  // it (pre-filled, resumes where they left off). Free creators never see it.
  useEffect(() => {
    const ap = autopilot.state;
    if (!ap?.is_pro || !ap.available || !ap.setup || ap.setup.done || setupAutoOpenedRef.current) return;
    if (welcomeMode) return;
    const fromCheckout = ['pro_started', 'gmail_connected', 'gmail_scope'].includes(autopilotReturn);
    let shown = false;
    try { shown = sessionStorage.getItem('pro_setup_shown') === '1'; } catch (_) { /* ignore */ }
    if (!fromCheckout && shown) return;
    setupAutoOpenedRef.current = true;
    try { sessionStorage.setItem('pro_setup_shown', '1'); } catch (_) { /* ignore */ }
    setSetup({ open: true, section: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autopilot.state, autopilotReturn]);

  const finishWelcome = useCallback((niches) => {
    setWelcomeDone(true);
    if (pitchFacts.facts) pitchFacts.setFacts({ ...pitchFacts.facts, niches, needs_confirm: false });
    if (!autoAction && !autoFiredRef.current && !messagesRef.current.length) {
      autoFiredRef.current = true;
      // Brands first, in under a second. Pitches (and credits) only when the creator taps "Write all 3 pitches".
      send('', { action: 'suggest_brands', starter: 'first_matches', chip_id: 'first_matches', deal: 'gifted',
        skip_discovery: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAction, pitchFacts.facts, send]);

  useEffect(() => {
    if (!autoAction || !ready || busy || autoFiredRef.current) return;
    // First visit: the welcome card asks one question first; brands load when they tap "Find my brands".
    if (firstVisit && (!pitchFacts.loaded || welcomeMode)) return;
    autoFiredRef.current = true;
    const action = autoAction;
    setAutoAction(null);
    if (messagesRef.current.length) return;
    send('', action);
  }, [autoAction, ready, busy, send, firstVisit, welcomeMode, pitchFacts.loaded]);

  // Gmail: write the first pitches (free credits spent here, after Gmail is connected).
  // Myself: show the lined-up brands as cards; each Contact writes one pitch (one free credit), nothing up front.
  const writeFirstPitches = (choice, brandIds) => {
    setFirstRun(null);
    apiClient.post('/api/polly/first-run', { choice }).catch(() => {});
    if (choice === 'manual') {
      sendStarter({ id: 'show_brands', action: 'show_brands', brand_ids: brandIds, label: "I'll pitch brands myself" });
      return;
    }
    sendStarter({ id: 'pitch_all', action: 'pitch_batch', brand_ids: brandIds, label: 'Start contacting brands for me' });
  };


  // "Start contacting brands for me": Gmail first, pitches (and free credits) only once it's connected, so the
  // creator never sees 0 credits next to a second "Connect Gmail" prompt. "Myself": brand cards, pay per Contact.
  const startFirstRun = (choice, brandIds) => {
    if (busy) return;
    if (choice === 'gmail' && !autopilot.state?.gmail?.connected) {
      connectGmailForBatch(`firstrun:${brandIds.join(',')}`);
      return;
    }
    writeFirstPitches(choice, brandIds);
  };

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
    if (chip.action === 'open_directory') {
      navigate(chip.href || DIRECTORY_PATH);
      return;
    }
    if (chip.action === 'link' || chip.id === 'open_tracker_deal') {
      navigate(chipHref(chip));
      return;
    }
    if (chip.action === 'autopilot' || chip.id === 'autopilot') {
      openAutopilot();
      return;
    }
    if (chip.action === 'creator_hooks') {
      runHooks();
      return;
    }
    send(chip.label, {
      action: chip.action,
      brand_id: chip.brand_id,
      brand_ids: chip.brand_ids,
      brand_name: chip.brand_name,
      deal: chip.deal,
      confirm_cold: Boolean(chip.confirm_cold),
      skip_discovery: Boolean(chip.skip_discovery),
      starter: chip.id,
      task_id: chip.task_id,
      chip_id: chip.id,
      sample_posts: chip.sample_posts,
      radar: chip.radar,
      signal_type: chip.signal_type,
      niche: chip.niche,
      to_email: chip.to_email,
      is_followup: Boolean(chip.is_followup) || chip.id === 'draft_followup' || /follow-?up/i.test(chip.label || ''),
    });
  };

  const deepLinkRef = useRef(false);
  useEffect(() => {
    if (serverReady && !creatorId && userLoading === false) setPendingLinkKind(null);
  }, [serverReady, creatorId, userLoading]);

  // Link chips (?chip=open_tracker_deal&brand_id=…) don't need the thread: go straight there.
  useEffect(() => {
    const chipId = searchParams.get('chip');
    const base = DEEP_LINK_CHIPS[chipId];
    if (!base || base.action !== 'link' || deepLinkRef.current) return;
    deepLinkRef.current = true;
    navigate(chipHref({ ...base, id: chipId, brand_id: Number(searchParams.get('brand_id')) || undefined }), { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const chipId = searchParams.get('chip');
    if (!chipId || deepLinkRef.current || !ready || !serverReady || !creatorId) return;
    deepLinkRef.current = true;
    setPendingLinkKind(null);
    navigate('/creator/dashboard/for-you', { replace: true });
    // A new creator's first open belongs to the welcome (lined-up brands + the two choices). Email links like
    // "Meet Polly" (?chip=line_up) must not send a message over it; the welcome already lines up their brands.
    if (firstRun) return;
    const base = DEEP_LINK_CHIPS[chipId];
    if (!base) return;
    const brandName = searchParams.get('brand_name') || '';
    const brandId = Number(searchParams.get('brand_id')) || undefined;
    const taskId = Number(searchParams.get('task_id')) || undefined;
    let label = base.label;
    if (chipId === 'checkin_replied' && brandName) label = `${brandName} replied`;
    else if (chipId === 'checkin_result' && brandName) label = `My ${brandName} email bounced`;
    else if (chipId === 'draft_followup') label = brandName ? `Draft a follow-up to ${brandName}` : 'Draft a follow-up to the brand that viewed my kit';
    else if (chipId === 'send_draft' && brandName) label = `Send my ${brandName} pitch`;
    else if (chipId === 'paid_reply' && brandName) label = `Write my reply to ${brandName}`;
    else if (chipId === 'ad_usage' && brandName) label = `Ask ${brandName} to run it as an ad`;
    else if (chipId === 'pitch_brand' && brandName) {
      const angle = (searchParams.get('angle') || '').trim();
      // From UGC Pulse: build the pitch around a hook that's working in this brand's own ads.
      label = angle ? `Pitch ${brandName} for me with this angle: "${angle}"` : `Pitch ${brandName} for me`;
    }
    const samplePosts = chipId === 'pitch_brand' ? takePitchSamples(brandId) : [];
    sendStarter({
      ...base, id: chipId, label, brand_id: brandId, brand_name: brandName || undefined, task_id: taskId,
      sample_posts: samplePosts.length ? samplePosts : undefined,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, ready, serverReady, creatorId, firstRun]);

  useEffect(() => {
    const result = searchParams.get('autopilot');
    if (!result) return;
    let pendingSend = null;
    try {
      // localStorage: Google may hand back to a new tab, where sessionStorage is empty.
      pendingSend = localStorage.getItem(BATCH_AFTER_CONNECT_KEY) || sessionStorage.getItem(BATCH_AFTER_CONNECT_KEY);
    } catch (_) { /* ignore */ }
    const batchPending = Boolean(pendingSend);
    if (batchPending) {
      if (!serverReady) return;
      try { localStorage.removeItem(BATCH_AFTER_CONNECT_KEY); sessionStorage.removeItem(BATCH_AFTER_CONNECT_KEY); } catch (_) { /* ignore */ }
      navigate('/creator/dashboard/for-you', { replace: true });
      if (result === 'gmail_connected') {
        autopilot.reload();
        if (pendingSend && pendingSend.startsWith('brand:')) sendSingle(pendingSend.slice(6));
        else if (pendingSend && pendingSend.startsWith('firstrun:')) {
          const ids = pendingSend.slice(9).split(',').map(Number).filter(Boolean);
          writeFirstPitches('gmail', ids);
        } else sendBatch();
      } else {
        setMessages((prev) => [...prev, {
          id: newId(), role: 'assistant', content: `${AUTOPILOT_NOTICES[result] || "Gmail didn't connect."} Your pitches are still here.`,
        }]);
      }
      return;
    }
    if (result === 'gmail_connected') {
      if (!serverReady) return;
      if (!credits?.is_unlimited) {
        // Free creators still on their free pitches: no Autopilot pitch here, just the confirmation.
        navigate('/creator/dashboard/for-you', { replace: true });
        setMessages((prev) => [...prev, {
          id: newId(), role: 'assistant',
          content: "Gmail connected ✓ Tap **Send for me** on any pitch and it goes out from your own address.",
        }]);
        return;
      }
    }
    setAutopilotNotice(AUTOPILOT_NOTICES[result] || '');
    setAutopilotReturn(result);
    openAutopilot();
    navigate('/creator/dashboard/for-you', { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, navigate, openAutopilot, serverReady]);

  // Email upgrade CTAs (?upgrade=pro): open the Autopilot card, which carries the $19 upgrade.
  useEffect(() => {
    if (!searchParams.get('upgrade')) return;
    captureUpgradeDeeplink(searchParams);
    if (isWinbackUpgradePending()) {
      setShowUpgrade(true);
    } else {
      dismissUpgradeDeeplink();
      openAutopilot();
    }
    navigate('/creator/dashboard/for-you', { replace: true });
  }, [searchParams, navigate, openAutopilot]);

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

  const runHooks = async () => {
    if (busy || hooksBusy) return;
    setHooksBusy(true);
    try {
      const { data } = await apiClient.post('/api/polly/hooks', {}, { timeout: 60000 });
      if (data?.gated) {
        setMessages((prev) => [...prev,
          { id: newId(), role: 'user', content: HOOKS_STARTER.label.replace(/^\S+\s/, '') },
          { id: newId(), role: 'assistant', content: data.message,
            task_chips: data.allowance?.pro ? [] : [{ id: 'unlock_pro', label: 'Get 4 scans a month · Pro', action: 'unlock_pro' }] }]);
        return;
      }
      const [ask, card] = data?.messages || [];
      if (!card) throw new Error(data?.error || 'Could not scan your niche.');
      setMessages((prev) => [...prev, { ...ask, id: newId() }, { ...card, id: newId(), hooks: { ...card.hooks, scan: data.scan } }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: newId(), role: 'assistant', content: err?.response?.data?.error || err.message || 'Could not scan your niche. Try again.',
      }]);
    } finally {
      setHooksBusy(false);
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

  const flashCopied = (key) => {
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1800);
  };

  const copyPitch = async (pitch, msgId) => {
    const body = dropLocationPlaceholder(pitch.body || '');
    const text = pitch.subject ? `Subject: ${pitch.subject}\n\n${body}` : body;
    try { await navigator.clipboard.writeText(text); } catch (_) { /* ignore */ }
    flashCopied(`${msgId}:pitch`);
    logPitchHandoff(pitch, 'copy_pitch');
  };

  const copyEmail = async (pitch, msgId) => {
    if (!pitch?.email) return;
    try { await navigator.clipboard.writeText(pitch.email); } catch (_) { /* ignore */ }
    flashCopied(`${msgId}:email`);
    logPitchHandoff(pitch, 'copy_email');
  };

  const openMail = (pitch, msgId) => {
    if (!pitch?.mailto) return;
    setMailTriedId(msgId);
    logPitchHandoff(pitch, 'open_email').then((res) => {
      if (res?.logged_sent) setLoggedSentId(msgId);
    });
    window.location.href = cleanMailto(pitch.mailto);
  };

  // "Send them myself": the same hand-off as a single pitch, from the batch card.
  const openBatchMail = (item) => {
    if (!item?.mailto) return Promise.resolve(false);
    const logged = logPitchHandoff(item, 'open_email').then((res) => {
      const ok = Boolean(res?.logged_sent);
      if (ok) { try { window.dispatchEvent(new Event('nc-tracker-changed')); } catch (_) { /* ignore */ } }
      return ok;
    });
    window.location.href = cleanMailto(item.mailto);
    return logged;
  };

  const copyBatchPitch = async (item) => {
    const body = dropLocationPlaceholder(item?.body || '');
    const text = item?.subject ? `Subject: ${item.subject}\n\n${body}` : body;
    try { await navigator.clipboard.writeText(text); } catch (_) { /* ignore */ }
    logPitchHandoff(item, 'copy_pitch');
  };

  const resizeInput = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const hasLocalThread = Boolean(creatorId && readPollyLocal(creatorId)?.messages?.length);

  const lastGigIdx = messages.reduce((acc, m, i) => ((m.gigs || []).length ? i : acc), -1);
  const lastBoardIdx = messages.reduce((acc, m, i) => (m.board ? i : acc), -1);

  const apChip = autopilotChip(autopilot.state)
    || (!autopilot.state && credits?.is_unlimited ? { label: '⚡ Autopilot', attention: false } : null);
  const closeAutopilot = () => { setAutopilotOpen(false); setAutopilotNotice(''); };
  // The composer row is fixed: Radar, Autopilot, gifted brands. Everything else is a chip on a message.
  const targetsStarter = (starters || []).find((s) => s.action === 'pitch_targets') || TARGETS_STARTER;
  const giftedStarter = STARTERS.find((s) => s.id === 'gifted_lists');

  return (
    <Shell>
      {liveToast ? (
        <LiveToast role="status" aria-live="polite">
          <span aria-hidden="true">{liveToast.type === 'reply' ? '🎉' : '👀'}</span>
          <span><b>{liveToast.brand_name}</b> {liveToast.type === 'reply' ? 'replied to your pitch' : 'just opened your media kit'}</span>
          <button type="button" aria-label="Dismiss" onClick={() => setLiveToast(null)}>×</button>
        </LiveToast>
      ) : null}
      <Thread ref={threadRef}>
        {firstRun ? (
          <PollyFirstRun
            data={firstRun}
            firstName={user?.first_name || ''}
            avatar={POLLY_AVATAR_URL}
            busy={busy}
            onStart={startFirstRun}
          />
        ) : null}
        {!firstRun && ready && creatorId && !welcomeMode ? (
          <PollyChecklist onOpenTracker={() => navigate(TRACKER_PATH)} />
        ) : null}
        {firstRun ? null : welcomeMode ? (
          <PollyWelcome
            facts={pitchFacts.facts}
            firstName={user?.first_name || ''}
            trialDays={invitedTrial || pendingTrialRef.current ? (trialOffer?.days || 7) : 0}
            avatar={POLLY_AVATAR_URL}
            onDone={finishWelcome}
          />
        ) : pendingLinkKind && messages.length === 0 ? null : !ready && messages.length === 0 && !hasLocalThread ? (
          <Turn>
            <AssistantRow>
              <PollyFace src={POLLY_AVATAR_URL} alt="" />
              <PollyWorking kind="brands" />
            </AssistantRow>
          </Turn>
        ) : !ready && messages.length === 0 ? (
          <ResumePending>
            <ResumeBar $w="58%" $h="44" />
            <ResumeBar $w="42%" $h="36" $end />
            <ResumeBar $w="70%" $h="54" />
          </ResumePending>
        ) : messages.length === 0 && !autoAction && !(busy && autoFiredRef.current) ? (
          <Empty>
            <AvatarMark src={POLLY_AVATAR_URL} alt="Polly" />
            <Title>Polly</Title>
            <Sub><PollyRichText text={scrubPollyVoice(greeting)} /></Sub>
            <SuggestGrid>
              {[...starters, ...(apChip && !autopilotOpen ? [AUTOPILOT_STARTER] : [])].map((s) => (
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
        {messages.map((msg, idx) => (
          <Turn key={msg.id || `${idx}-${msg.role}`}>
            {msg.role === 'user' ? (
              <UserRow>
                <UserBubble>{msg.content}</UserBubble>
              </UserRow>
            ) : (
              <AssistantRow>
                <PollyFace src={POLLY_AVATAR_URL} alt="" />
                <div>
                  {msg.kind === 'alert' ? <PitchLabel>Kit view</PitchLabel> : null}
                  {msg.kind === 'autopilot' ? <PitchLabel>Autopilot</PitchLabel> : null}
                  {msg.kind === 'nudge' ? <PitchLabel>Polly nudge</PitchLabel> : null}
                  <KitMessage msg={msg} onOpen={navigate} stream={msg.id === streamId} />
                  {msg.hooks ? (
                    <CreatorHooks hooks={msg.hooks} onBrand={(b) => contactBrand({ id: b.pitch_id, name: b.name })} />
                  ) : null}
                  {msg.board ? (
                    <MondayBoard
                      board={msg.board}
                      live={idx === lastBoardIdx}
                      busy={busy}
                      onChip={sendStarter}
                    />
                  ) : null}
                  {msg.radar ? (
                    <GiftingRadar radar={msg.radar} busy={busy} onChip={sendStarter} onSettled={settleRadar} />
                  ) : null}
                  {!msg.goal_plan && !msg.hotlist && !msg.upsell && msg.task_chips?.filter((c) => !(msg.brands?.length && (c.action === 'pitch_batch' || isUnlockChip(c)))).length > 0 && (
                    <Chips style={{ marginTop: 12 }}>
                      {msg.task_chips.filter((c) => !(msg.brands?.length && (c.action === 'pitch_batch' || isUnlockChip(c)))).map((s) => (
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
                      {msg.gigs_locked > 0 && (
                        <GigMoreRow>
                          <ShowMoreBtn type="button" onClick={() => setShowUpgrade(true)}>
                            🔒 {msg.gigs_locked} more paid gigs · Unlock with Pro
                          </ShowMoreBtn>
                        </GigMoreRow>
                      )}
                      {idx === lastGigIdx && !msg.gigs_locked && msg.gigs_has_more !== false && (
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
                    <RevealIn>
                    <BrandList style={{ marginTop: 12 }}>
                      {msg.brands.map((brand) => (
                        <BrandCard key={brand.id}>
                          <Logo
                            as={brand.slug ? 'a' : 'div'}
                            href={brand.slug ? `/creator/dashboard/pr-brands?brand=${encodeURIComponent(brand.slug)}` : undefined}
                            aria-label={brand.slug ? `See ${brand.name}` : undefined}
                            onClick={brand.slug ? (e) => { e.preventDefault(); navigate(`/creator/dashboard/pr-brands?brand=${encodeURIComponent(brand.slug)}`); } : undefined}
                          >
                            <BrandLogoMark brand={brand} />
                          </Logo>
                          <BrandMeta>
                            {brand.slug ? (
                              <a
                                className="name name-link"
                                href={`/creator/dashboard/pr-brands?brand=${encodeURIComponent(brand.slug)}`}
                                onClick={(e) => { e.preventDefault(); navigate(`/creator/dashboard/pr-brands?brand=${encodeURIComponent(brand.slug)}`); }}
                              >
                                {brand.meta_ads ? <HotTag /> : null}{brand.name} <span aria-hidden="true">›</span>
                              </a>
                            ) : <div className="name">{brand.meta_ads ? <HotTag /> : null}{brand.name}</div>}
                            <div className="cat">
                              {[brand.category, brand.match_score ? `${brand.match_score}% match` : null,
                                brand.ships_to_you ? 'Ships to you' : brand.shipping_note || null]
                                .filter(Boolean)
                                .join(' · ')}
                            </div>
                            {brandBlurb(brand) ? <div className="why">{brandBlurb(brand)}</div> : null}
                            {brand.reply_signal ? (
                              <div style={{ marginTop: 6 }}><ReplySignalChip signal={brand.reply_signal} /></div>
                            ) : null}
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
                    {(() => {
                      // An offer under a brand list goes after the cards, as the one big button.
                      const unlock = (msg.task_chips || []).find((c) => isUnlockChip(c));
                      if (!unlock || (msg.task_chips || []).some((c) => c.action === 'pitch_batch')) return null;
                      return (
                        <BatchCta>
                          <button type="button" disabled={busy} onClick={() => sendStarter(unlock)}>{unlock.label} →</button>
                        </BatchCta>
                      );
                    })()}
                    {(() => {
                      const batch = (msg.task_chips || []).find((c) => c.action === 'pitch_batch');
                      if (!batch) return null;
                      const n = (batch.brand_ids || []).length || 3;
                      const free = !credits?.is_unlimited;
                      return (
                        <BatchCta>
                          <button type="button" disabled={busy} onClick={() => sendStarter(batch)}>
                            {free ? `Write my ${n} free pitches` : `Write all ${n} pitches`} →
                          </button>
                          <span>
                            {free ? `Uses your ${n} free pitches. ` : ''}You check each one before anything is sent.
                          </span>
                          <button type="button" className="alt" disabled={busy}
                            onClick={() => sendStarter({ id: 'more_brands', label: 'Show me other brands', action: 'suggest_brands' })}>
                            Not a fit? Show me 3 other brands
                          </button>
                        </BatchCta>
                      );
                    })()}
                    </RevealIn>
                  )}
                  {msg.locked_pitch?.lines?.length > 0 && !msg.pitch && (
                    <PitchCard style={{ marginTop: 12 }}>
                      <PitchLabel>
                        {msg.locked_pitch.kind === 'reply' ? 'Reply to' : 'Pitch for'}{' '}
                        {msg.locked_pitch.brand_name || 'this brand'}
                      </PitchLabel>
                      <LockedLines>{msg.locked_pitch.lines.join('\n\n')}</LockedLines>
                      <LockedBlur aria-hidden="true">
                        {msg.locked_pitch.kind === 'reply'
                          ? 'If you\u2019d like to run the video as an ad, I offer 30 days of paid usage at my rate. Happy to sort that now or once you\u2019ve seen the video.'
                          : 'Here\u2019s why your audience fits and the exact content I\u2019d make for you, plus two recent posts that show it. Happy to send over a quick concept if useful.'}
                      </LockedBlur>
                      <UnlockBtn type="button" onClick={() => setShowUpgrade(true)}>
                        {msg.locked_pitch.kind === 'reply' ? 'Finish this reply with Pro' : 'Unlock this pitch with Pro'}
                      </UnlockBtn>
                    </PitchCard>
                  )}
                  {msg.pitch && (
                    <PitchCard style={{ marginTop: 12 }}>
                      <PitchLabel>
                        {msg.pitch.is_reply ? 'Reply to' : msg.pitch.is_followup ? 'Follow-up for' : 'Pitch for'}{' '}
                        {msg.pitch.brand_name || 'this brand'}
                        {msg.pitch.edited_at ? <PitchEdited>{pitchEditedLabel(msg.pitch.edited_at)}</PitchEdited> : null}
                      </PitchLabel>
                      {msg.pitch.email ? <PitchTo>To: {msg.pitch.email}</PitchTo> : null}
                      {msg.pitch.prefs_line && !msg.pitch.is_reply ? <PitchPrefsLine>{msg.pitch.prefs_line}</PitchPrefsLine> : null}
                      {msg.pitch.stats_line && !msg.pitch.is_reply ? <PitchPrefsLine>{msg.pitch.stats_line}</PitchPrefsLine> : null}
                      <PitchSubject>{msg.pitch.subject}</PitchSubject>
                      <PitchBodyText body={dropLocationPlaceholder(msg.pitch.body)} />
                      {msg.pitch.sent_via_gmail ? (
                        <PitchSentNote>✓ Sent from your Gmail. I follow up on day 4 and day 10 if they&apos;re quiet.</PitchSentNote>
                      ) : null}
                      <PitchActions>
                        {canSendForMe(msg.pitch) && (
                          <SendForMe
                            type="button"
                            disabled={busy || Boolean(sendingPitchId)}
                            onClick={() => sendSingle(msg.pitch.brand_id)}
                          >
                            {String(sendingPitchId) === String(msg.pitch.brand_id) ? 'Sending…'
                              : autopilot.state?.gmail?.connected ? 'Send from my Gmail' : 'Send for me'}
                          </SendForMe>
                        )}
                        {msg.pitch.mailto && !msg.pitch.sent_via_gmail && (
                          canSendForMe(msg.pitch) ? (
                            <Ghost as="a" href={msg.pitch.mailto} onClick={(e) => { e.preventDefault(); openMail(msg.pitch, msg.id); }}>
                              Open email
                            </Ghost>
                          ) : (
                            <Primary href={msg.pitch.mailto} onClick={(e) => { e.preventDefault(); openMail(msg.pitch, msg.id); }}>
                              Open email
                            </Primary>
                          )
                        )}
                        {msg.pitch.email && (
                          <Ghost type="button" onClick={() => copyEmail(msg.pitch, msg.id)}>
                            {copiedKey === `${msg.id}:email` ? 'Copied' : 'Copy email'}
                          </Ghost>
                        )}
                        {msg.pitch.is_reply || msg.pitch.is_followup || !msg.pitch.email ? (
                          <Ghost type="button" onClick={() => copyPitch(msg.pitch, msg.id)}>
                            {copiedKey === `${msg.id}:pitch` ? 'Copied' : (msg.pitch.is_reply ? 'Copy reply' : msg.pitch.is_followup ? 'Copy follow-up' : 'Copy pitch')}
                          </Ghost>
                        ) : null}
                      </PitchActions>
                      {msg.pitch.is_reply ? null : mailTriedId === msg.id && loggedSentId === msg.id ? (
                        <PitchHint>
                          Marked as sent. I&apos;ll check on day 4 whether {msg.pitch.brand_name || 'they'} replied
                          and draft the follow-up. Nothing opened? Copy the email and the pitch into Gmail or your mail app.
                        </PitchHint>
                      ) : mailTriedId === msg.id ? (
                        <PitchHint>
                          Nothing opened? Copy the email and the pitch, paste them into Gmail or your mail app,
                          then tap &ldquo;I sent it&rdquo; so I can track the follow-up.
                        </PitchHint>
                      ) : null}
                    </PitchCard>
                  )}
                  {msg.sent_summary?.sent?.length > 0 && (
                    <PollySentCard summary={msg.sent_summary} onChip={sendStarter} disabled={busy} />
                  )}
                  {msg.activity?.items?.length > 0 && (
                    <PollyActivityCard activity={msg.activity} onChip={sendStarter} disabled={busy} />
                  )}
                  {msg.upsell ? (
                    <PollyUpsellCard upsell={msg.upsell} chips={msg.task_chips || []} onChip={sendStarter} disabled={busy} />
                  ) : null}
                  {msg.hotlist?.brands?.length > 0 && (
                    <PollyHotlistCard hotlist={msg.hotlist} chips={msg.task_chips || []} onChip={sendStarter}
                      onContact={contactBrand} disabled={busy} />
                  )}
                  {msg.goal_plan?.days?.length > 0 && (
                    <PollyGoalPlanCard plan={msg.goal_plan} chips={msg.task_chips || []} onChip={sendStarter} disabled={busy} />
                  )}
                  {msg.pitch_batch?.items?.length > 0 && (
                    <PitchBatchCard
                      batch={msg.pitch_batch}
                      available={autopilot.state ? autopilot.state.available !== false : true}
                      gmailConnected={Boolean(autopilot.state?.gmail?.connected)}
                      sending={sendingBatch}
                      disabled={busy}
                      onSend={sendBatch}
                      onConnect={connectGmailForBatch}
                      onOpenMail={openBatchMail}
                      onCopy={copyBatchPitch}
                      free={!credits?.is_unlimited}
                    />
                  )}
                </div>
              </AssistantRow>
            )}
          </Turn>
        ))}
        {autopilotOpen && !welcomeMode && (
          <Turn>
            <AssistantRow>
              <PollyFace src={POLLY_AVATAR_URL} alt="" />
              <AutopilotCard
                state={autopilot.state}
                setState={autopilot.setState}
                reload={autopilot.reload}
                notice={autopilotNotice}
                returnReason={autopilotReturn}
                onClose={closeAutopilot}
                onOpenSettings={() => setAutopilotSettingsOpen(true)}
                onOpenSetup={openSetup}
                onUpgrade={() => setShowUpgrade(true)}
              />
            </AssistantRow>
          </Turn>
        )}
        {(busy || pendingLinkKind) && (
          <Turn>
            <AssistantRow>
              <PollyFace src={POLLY_AVATAR_URL} alt="" />
              {liveText ? (
                <AssistantText aria-live="polite">
                  <PollyRichText text={scrubPollyVoice(liveText)} />
                </AssistantText>
              ) : (
                <PollyWorking kind={busy ? busyKind : pendingLinkKind} />
              )}
            </AssistantRow>
          </Turn>
        )}
      </Thread>
      <ComposerWrap>
        {messages.length > 0 && !draft.trim() && (
          <ChipRow $hidden={composerFocused}>
            <Chip type="button" onClick={() => sendStarter(giftedStarter)} disabled={busy || loadingMore}>
              {giftedStarter.label}
            </Chip>
            <Chip type="button" onClick={() => sendStarter(targetsStarter)} disabled={busy || loadingMore}>
              {targetsStarter.label}
            </Chip>
            {apChip ? (
              <Chip
                type="button"
                $emphasis={apChip.attention}
                aria-expanded={autopilotOpen}
                onClick={() => (autopilotOpen ? closeAutopilot() : openAutopilot())}
              >
                {apChip.label}
              </Chip>
            ) : null}
          </ChipRow>
        )}
        <Composer onSubmit={onSubmit}>
          <Input
            ref={inputRef}
            rows={1}
            placeholder="Ask anything"
            value={draft}
            disabled={busy}
            onFocus={() => setComposerFocused(true)}
            onBlur={() => setComposerFocused(false)}
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
        source="polly"
      />
      <PollyProSetup
        open={setup.open}
        section={setup.section}
        firstName={user?.first_name || ''}
        trialDays={invitedTrial ? trialOffer.days : 0}
        gmail={autopilot.state?.gmail}
        returnReason={setup.section ? '' : autopilotReturn}
        onClose={closeSetup}
        onDone={finishSetup}
        onSaved={reloadAutopilot}
      />
      <AutopilotSettings
        isOpen={autopilotSettingsOpen}
        state={autopilot.state}
        setState={autopilot.setState}
        onClose={() => setAutopilotSettingsOpen(false)}
        onOpenSetup={(section) => { setAutopilotSettingsOpen(false); openSetup(section); }}
      />
    </Shell>
  );
}
