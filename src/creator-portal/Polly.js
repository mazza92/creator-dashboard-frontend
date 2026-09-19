import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
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

const STARTERS = [
  { id: 'line_up', label: 'Find me 3 brands to pitch today', action: 'suggest_brands', skip_discovery: true },
  { id: 'name_a_brand', label: 'Write a pitch for a brand I name', action: 'ask_brand' },
  { id: 'more_replies', label: 'Help me get more replies from brands', action: 'coach_profile' },
];

function isOpenerOnlyThread(msgs) {
  if (!Array.isArray(msgs) || msgs.length !== 1) return false;
  const m = msgs[0] || {};
  if (String(m.role || '').toLowerCase() !== 'assistant') return false;
  if ((m.brands || []).length || m.pitch || (m.task_chips || []).length) return false;
  const c = String(m.content || '');
  return /i['’]m polly|creator assistant|what do you want to land first|mind if i ask you/i.test(c);
}

function normalizeStarters(list) {
  return (list || []).map((s) => {
    if (s?.id === 'portfolio' || (s?.action === 'coach_portfolio' && /portfolio|review my kit/i.test(s?.label || ''))) {
      return { ...s, label: 'Review my kit', action: s.action || 'coach_portfolio' };
    }
    return s;
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

function brandBlurb(brand) {
  const desc = String(brand?.description || '').replace(/\s+/g, ' ').trim();
  if (desc && !/already sit in/i.test(desc)) return desc;
  const why = String(brand?.why || '').replace(/\s+/g, ' ').trim();
  if (why && !/already sit in/i.test(why)) return why;
  return '';
}

function BrandLogoMark({ brand }) {
  const src = brand?.logo || brand?.logo_url || '';
  const [broken, setBroken] = useState(false);
  const initial = String(brand?.name || '?').slice(0, 1);
  if (!src || broken) return initial;
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
  font-weight: 600;
  color: ${t.muted};
  img { width: 100%; height: 100%; object-fit: contain; background: #fff; }
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
  const { user } = useContext(UserContext) || {};
  const creatorId = user?.creator_id;
  const [greeting, setGreeting] = useState(
    "Hey, I'm Polly. I will be your Creator Assistant to help you unlock brand PR and paid UGC deals.\n\nWhat do you want to land first?"
  );
  const [credits, setCredits] = useState(null);
  const [messages, setMessages] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [contactingId, setContactingId] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [starters, setStarters] = useState(STARTERS);
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

  useEffect(() => {
    if (!creatorId || !hydratedRef.current) return;
    writePollyLocal(creatorId, messages, suggested);
  }, [creatorId, messages, suggested]);

  useEffect(() => {
    let cancelled = false;
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
          if (ownerId) writePollyLocal(ownerId, [], []);
          apiClient.put('/api/polly/thread', { messages: [], suggested_brands: [] }).catch(() => {});
          return;
        }

        const usableServer = isOpenerOnlyThread(serverMsgs) ? [] : serverMsgs;
        const usableLocal = isOpenerOnlyThread(local?.messages) ? [] : (local?.messages || []);

        if (usableServer.length) {
          hydratedRef.current = true;
          setMessages(usableServer);
          setSuggested(serverSuggested);
          if (ownerId) writePollyLocal(ownerId, usableServer, serverSuggested);
          return;
        }

        if (usableLocal.length) {
          hydratedRef.current = true;
          setMessages(usableLocal);
          setSuggested(local.suggested || []);
          return;
        }

        hydratedRef.current = true;
        setMessages([]);
        setSuggested([]);
      } catch (err) {
        console.warn('Polly bootstrap', err);
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
        messages: history.map(({ role, content: c, brands, pitch, id }) => ({
          id, role, content: c, brands, pitch,
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
      const rawMessage = data.message || 'Done.';
      const assistant = {
        id: newId(),
        role: 'assistant',
        content: stripKitEditorPaths(scrubPollyVoice(rawMessage)),
        brands: data.brands || [],
        pitch: data.pitch || null,
        kit_actions: kitActionsFrom(data, rawMessage),
        task_chips: data.task_chips || [],
      };
      const next = [...history, assistant];
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
    if (busy || !chip) return;
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

  const contactBrand = (brand) => {
    if (busy || !brand?.id) return;
    setContactingId(brand.id);
    send(`Let's hit up ${brand.name}`, {
      action: 'generate_pitch',
      brand_id: brand.id,
      brand_name: brand.name,
    });
  };

  const copyPitch = async (pitch) => {
    try { await navigator.clipboard.writeText(pitch.body || ''); } catch (_) { /* ignore */ }
  };

  const openMail = (pitch) => {
    if (pitch?.mailto) window.location.href = pitch.mailto;
  };

  const resizeInput = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <Shell>
      <Thread ref={threadRef}>
        {messages.length === 0 && (
          <Empty>
            <AvatarMark src={POLLY_AVATAR_URL} alt="Polly" />
            <Title>Polly</Title>
            <Sub>{greeting}</Sub>
            <Chips>
              {starters.map((s) => (
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
          </Empty>
        )}
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
        {messages.map((msg) => (
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
                      <PitchBody>{msg.pitch.body}</PitchBody>
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
        {messages.length > 0 && starters.length > 0 && (
          <ChipRow>
            {starters.map((s) => (
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
