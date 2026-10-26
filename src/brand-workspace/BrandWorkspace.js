// Brand workspace (/brand/workspace): a Lightreel-style app for brands. Sidebar with new scan, recent
// scans and sections; main pane runs Brand Scan as a chat, plus roster, saved creators and billing.
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  Bookmark, CheckCircle2, Clock, CreditCard, Gift, Lock, LogOut, Megaphone, Menu, Plus, Radar, Search,
  Sparkles, Users, X,
} from 'lucide-react';
import { CATEGORY_LABELS } from '../constants/brandCategories';
import CampaignForm, { EMPTY_CAMPAIGN, campaignPayload, campaignReady } from './CampaignForm';
import WorkspaceSkeleton, { ListSkeleton } from './WorkspaceSkeleton';
import { Banner, Empty, H1, Pane, PlainLink, Plan, Primary, Sub } from './ui';
import { UserContext } from '../contexts/UserContext';
import ScanInput from '../app/brands/scan/ScanInput';
import { ScanTurn, useScanTurns } from '../app/brands/scan/ScanReport';
import { scan as t } from '../app/brands/scan/theme';
import WorkspaceRoster from './WorkspaceRoster';
import {
  createCampaign, getCampaigns, getSaved, getScanHistory, getWorkspace, openPortal, pollInsight, pollScan,
  removeCreator, saveCreator, startCheckout, startInsight, startScan,
} from './workspaceApi';

// One runner for both: a brand name is a Brand Scan, {kind} is a prompt-library insight or a question.
const startAny = (input) => (typeof input === 'string' ? startScan(input) : startInsight(input.kind, input.question));

// "Glow Recipe" is a brand to scan; "which skincare creators film routines in Texas?" is a question.
const QUESTION_START = /^(who|what|which|where|when|why|how|find|show|give|list|compare|analy[sz]e|rate|are|is|do|does|can|should|best|top)\b/i;
export function isQuestion(text) {
  const t = String(text || '').trim();
  return t.includes('?') || QUESTION_START.test(t) || t.split(/\s+/).length >= 5;
}
const pollAny = (id, input) => (typeof input === 'string' ? pollScan(id) : pollInsight(id, input.kind));

const SIDEBAR = 260;

// ============================================================================
// SHELL
// ============================================================================

const Shell = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  overflow-x: clip;
  background: ${t.bg};
  color: ${t.ink};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  *, *::before, *::after { box-sizing: border-box; }
`;

const Side = styled.aside`
  position: fixed;
  inset: 0 auto 0 0;
  width: ${SIDEBAR}px;
  display: flex;
  flex-direction: column;
  background: #fbfbfc;
  border-right: 1px solid ${t.lineSoft};
  padding: 14px 10px;
  z-index: 30;
  transition: transform 0.2s ease;

  @media (max-width: 900px) {
    transform: translateX(${(p) => (p.$open ? '0' : '-100%')});
    box-shadow: ${(p) => (p.$open ? '0 0 40px rgba(0,0,0,0.12)' : 'none')};
  }
`;

const Scrim = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: ${(p) => (p.$open ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: rgba(17, 18, 20, 0.3);
    z-index: 25;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 14px;

  b {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  small {
    font-size: 11px;
    font-weight: 600;
    color: ${t.accent};
    background: ${t.accentSoft};
    border-radius: 6px;
    padding: 2px 6px;
    margin-left: 6px;
  }

  button {
    display: none;
    border: 0;
    background: none;
    color: ${t.muted};
    cursor: pointer;
  }

  @media (max-width: 900px) {
    button { display: block; }
  }
`;

const NewScan = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border: 1px solid ${t.line};
  background: #fff;
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 14px;
  font-weight: 600;
  color: ${t.ink};
  cursor: pointer;
  margin-bottom: 10px;

  &:hover { border-color: ${t.ink}; }
`;

const Nav = styled.nav`
  display: grid;
  gap: 2px;

  a {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    color: ${t.inkSoft};
    text-decoration: none;
  }

  a:hover { background: ${t.lineSoft}; color: ${t.ink}; }

  a.active {
    background: ${t.lineSoft};
    color: ${t.ink};
    font-weight: 600;
  }
`;

const SideLabel = styled.div`
  font-size: 12px;
  color: ${t.muted2};
  padding: 18px 12px 6px;
`;

const History = styled.div`
  flex: 1;
  overflow-y: auto;
  display: grid;
  align-content: start;
  gap: 1px;

  button {
    text-align: left;
    border: 0;
    background: none;
    border-radius: 8px;
    padding: 7px 12px;
    font-size: 13px;
    color: ${t.inkSoft};
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  button:hover { background: ${t.lineSoft}; color: ${t.ink}; }

  p {
    font-size: 12px;
    color: ${t.muted2};
    padding: 6px 12px;
  }
`;

const UpgradeCard = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  margin: 0 0 12px;
  padding: 11px 12px;
  border: 1px solid ${t.accentRing};
  border-radius: 12px;
  background: ${t.accentSoft};
  color: ${t.accent};
  text-align: left;
  cursor: pointer;
  font: inherit;

  svg { flex: 0 0 auto; margin-top: 2px; }

  span { font-size: 12px; color: ${t.muted}; line-height: 1.4; }

  b { display: block; font-size: 13px; color: ${t.ink}; }

  &:hover { border-color: ${t.accent}; }
`;

const Account = styled.div`
  border-top: 1px solid ${t.lineSoft};
  padding: 12px 8px 2px;
  display: flex;
  align-items: center;
  gap: 10px;

  .av {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    flex: 0 0 30px;
    background: ${t.ink};
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 13px;
    font-weight: 700;
    overflow: hidden;
  }

  .av img { width: 100%; height: 100%; object-fit: cover; }

  .who { flex: 1; min-width: 0; }

  .who b, .who span {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .who b { font-size: 13px; }
  .who span { font-size: 11px; color: ${t.muted}; }

  button {
    border: 0;
    background: none;
    color: ${t.muted};
    cursor: pointer;
    padding: 4px;
  }

  button:hover { color: ${t.ink}; }
`;

const Main = styled.main`
  flex: 1;
  min-width: 0;
  margin-left: ${SIDEBAR}px;

  @media (max-width: 900px) {
    margin-left: 0;
  }
`;

const TopBar = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: flex;
    align-items: center;
    gap: 10px;
    position: sticky;
    top: 0;
    z-index: 20;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.94);
    border-bottom: 1px solid ${t.lineSoft};
    font-weight: 700;

    button {
      border: 0;
      background: none;
      cursor: pointer;
      color: ${t.ink};
      display: grid;
    }
  }
`;





const Meter = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: ${t.muted};
  margin: 10px 4px 0;

  b { color: ${t.ink}; font-weight: 600; }
`;

const Library = styled.div`
  margin-top: 40px;

  h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 6px;
  }
`;

const Prompt = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
  border: 0;
  border-bottom: 1px solid ${t.lineSoft};
  background: none;
  padding: 14px 4px;
  cursor: pointer;

  .ic {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex: 0 0 40px;
    background: ${(p) => p.$bg};
    color: ${(p) => p.$fg};
  }

  .tx { flex: 1; min-width: 0; }
  .tx b { display: block; font-size: 14px; font-weight: 600; color: ${t.ink}; margin-bottom: 2px; }
  .tx span { font-size: 13px; color: ${t.muted}; }

  .go {
    font-size: 12px;
    font-weight: 600;
    border: 1px solid ${t.line};
    border-radius: 8px;
    padding: 5px 10px;
    color: ${t.ink};
    white-space: nowrap;
  }

  &:hover .go { border-color: ${t.ink}; }

  &:disabled { cursor: default; }
  &:disabled .ic { filter: grayscale(1); opacity: 0.55; }
  &:disabled .tx b { color: ${t.muted}; }
  &:disabled .go { border-color: ${t.lineSoft}; color: ${t.muted2}; display: inline-flex; align-items: center; gap: 4px; }

  @media (max-width: 560px) {
    .go { display: none; }
  }
`;

const Dock = styled.div`
  position: fixed;
  left: ${SIDEBAR}px;
  right: 0;
  bottom: 0;
  padding: 16px 20px 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #fff 32%);
  z-index: 15;

  > div { max-width: 780px; margin: 0 auto; }

  @media (max-width: 900px) {
    left: 0;
    padding: 12px 16px 16px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
`;

const Card = styled.div`
  position: relative;
  border: 1px solid ${t.line};
  border-radius: 14px;
  padding: 14px;

  .top { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; }

  .av {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${t.lineSoft};
    display: grid;
    place-items: center;
    font-weight: 700;
    color: ${t.muted};
    overflow: hidden;
    flex: 0 0 36px;
  }

  .av img { width: 100%; height: 100%; object-fit: cover; }
  b { display: block; font-size: 14px; }
  small { font-size: 12px; color: ${t.muted}; }

  .row { display: flex; gap: 8px; margin-top: 10px; }

  a, button {
    font-size: 12px;
    font-weight: 600;
    border: 1px solid ${t.line};
    border-radius: 8px;
    padding: 6px 10px;
    background: #fff;
    color: ${t.ink};
    text-decoration: none;
    cursor: pointer;
  }
`;






const HeadRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  > a, > button { flex-shrink: 0; white-space: nowrap; }

  @media (max-width: 560px) {
    flex-direction: column;
    gap: 0;
    margin-bottom: 16px;
  }
`;

const CampaignList = styled.ul`
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: grid;
  gap: 10px;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border: 1px solid ${t.line};
    border-radius: 14px;
    padding: 14px 16px;
  }

  .main { min-width: 0; display: grid; gap: 4px; justify-items: start; }
  .main b { font-size: 15px; }
  .main small { font-size: 12px; color: ${t.muted}; }

  .badge {
    font-size: 12px;
    font-weight: 600;
    border-radius: 999px;
    padding: 3px 10px;
  }

  button {
    border: 1px solid ${t.ink};
    background: ${t.ink};
    color: #fff;
    border-radius: 10px;
    padding: 9px 14px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .wait {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: ${t.muted};
    white-space: nowrap;
  }

  @media (max-width: 560px) {
    li { flex-direction: column; align-items: stretch; }
    button { width: 100%; }
  }
`;

// ============================================================================
// VIEWS
// ============================================================================

function prompts(ws) {
  const cat = ws.brand.category;
  const niche = (CATEGORY_LABELS[cat] || '').toLowerCase();
  const hasNiche = Boolean(niche) && cat !== 'other';
  const nicheLabel = hasNiche ? niche : 'your category';
  return [
    { id: 'competitor', icon: Search, bg: '#e8f7ed', fg: '#0f9d58', title: 'Scan a competitor',
      text: 'Every TikTok creator posting about them, the hooks they reuse and their top videos.', action: 'focus' },
    { id: 'gifting', icon: Gift, bg: '#eef2ff', fg: '#4f46e5', title: `Brands seeding ${nicheLabel} creators`,
      text: `Which brands are gifting small ${nicheLabel} creators right now, and how many.`, kind: 'gifting_brands',
      needsNiche: true },
    { id: 'hooks', icon: Sparkles, bg: '#fff8eb', fg: '#d97706', title: `Hooks that work in ${nicheLabel}`,
      text: 'Opening lines and formats that win in your niche, with the videos behind them.', kind: 'niche_hooks',
      needsNiche: true },
    { id: 'creators', icon: Users, bg: '#fef2f4', fg: '#e8395f', title: `Find ${nicheLabel} creators`,
      text: 'Small creators who fit a gifted campaign, and what each one is good at.', kind: 'niche_creators',
      needsNiche: true },
    { id: 'own', icon: Megaphone, bg: '#f1f5f9', fg: '#334155', title: 'Scan your own brand',
      text: 'The creators already talking about you, gifted or not.', own: true },
  ].map((p) => ({ ...p, hasNiche }));
}

function ScanView({ ws, onScanned, savedRefs, onSave, campaignCta }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { turns, run, busy, reset } = useScanTurns({
    start: startAny, poll: pollAny, source: 'workspace', onDone: onScanned,
  });
  const dockRef = useRef(null);
  const handled = useRef('');
  const pendingLeft = !ws.approved ? (ws.scans || {}).pending_left || 0 : null;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const b = params.get('b');
    const fresh = params.get('new');
    const welcome = params.get('welcome');
    if (fresh && handled.current !== `new:${fresh}`) {
      handled.current = `new:${fresh}`;
      reset();
      navigate('/brand/workspace', { replace: true });
    } else if (b && handled.current !== `b:${b}:${params.get('t') || ''}`) {
      handled.current = `b:${b}:${params.get('t') || ''}`;
      run(b);
      navigate('/brand/workspace', { replace: true });
    } else if (welcome && ws.free_scan && handled.current !== 'welcome') {
      // Their landing-page scan, now with the full creators list (served from cache, not re-charged).
      handled.current = 'welcome';
      run(ws.free_scan);
      navigate('/brand/workspace', { replace: true });
    }
  }, [location.search, navigate, reset, run, ws.free_scan]);

  useEffect(() => {
    if (turns.length) {
      const last = document.getElementById(`turn-${turns[turns.length - 1].id}`);
      if (last) last.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [turns.length]);

  const focus = () => {
    const input = dockRef.current && dockRef.current.querySelector('input');
    if (input) input.focus();
  };

  const scans = ws.scans || {};
  const left = scans.limit == null ? null : Math.max(0, scans.limit - scans.used_today);
  let meter;
  if (!ws.approved) {
    meter = pendingLeft ? 'Your free competitor scan · full results' : 'Free scan used · more scans unlock once you’re approved';
  } else {
    meter = left == null ? 'Unlimited scans' : `${left} of ${scans.limit} scans left today`;
  }

  const locked = (p) => {
    if (!ws.approved) {
      if (p.action === 'focus' || p.own) return !pendingLeft ? 'After approval' : '';
      return 'After approval';
    }
    if (p.needsNiche && !p.hasNiche) return 'Pick a category';
    return '';
  };

  const ask = (question) => run({ kind: 'ask', question, label: question });
  const submit = (text) => (ws.approved && isQuestion(text) ? ask(text) : run(text));

  const pick = (p) => {
    if (p.action === 'focus') return focus();
    if (p.own) return run(ws.brand.name);
    return run({ kind: p.kind, label: p.title });
  };

  const list = prompts(ws);
  return (
    <>
      <Pane>
        {turns.length === 0 ? (
          <>
            <H1>Whose creators do you want to see?</H1>
            <div ref={dockRef}>
              <ScanInput onSubmit={submit} busy={busy || (!ws.approved && !pendingLeft)} chips={false} large autoFocus
                hint="Live TikTok data" maxLength={300} label="Brand to scan or question"
                placeholder={ws.approved ? 'Scan a brand or ask, e.g. which tech creators film desk setups?' : 'Type a brand, e.g. Glow Recipe or @glowrecipe'}
                shortPlaceholder={ws.approved ? 'Scan a brand or ask…' : 'Type any brand…'} />
            </div>
            <Meter><span>{meter}</span><b>{scans.subscribed ? 'Pro' : ws.approved ? 'Free plan' : ''}</b></Meter>
            {!ws.approved && ws.free_scan && (
              <Meter style={{ marginTop: 14 }}>
                <span>Your free scan: <PlainLink type="button" onClick={() => run(ws.free_scan)}>{ws.free_scan} →</PlainLink></span>
              </Meter>
            )}
            <Library>
              <h2><Bookmark size={15} /> Prompt library</h2>
              {list.map((p) => {
                const why = locked(p);
                return (
                  <Prompt key={p.id} type="button" $bg={p.bg} $fg={p.fg} onClick={() => pick(p)} disabled={Boolean(why)}>
                    <span className="ic"><p.icon size={18} /></span>
                    <span className="tx"><b>{p.title}</b><span>{p.text}</span></span>
                    <span className="go">{why ? <><Lock size={12} /> {why}</> : 'Use prompt →'}</span>
                  </Prompt>
                );
              })}
            </Library>
          </>
        ) : (
          turns.map((turn) => (
            <ScanTurn key={turn.id} turn={turn} savedRefs={savedRefs} onSave={ws.approved ? onSave : undefined}
              onScan={ws.approved ? (name) => run(name) : undefined}
              onAsk={ws.approved ? ask : undefined}
              cta={turn.scan && turn.scan.gate === 'daily_limit'
                ? { label: 'See plans', onClick: () => navigate('/brand/workspace/billing') }
                : campaignCta} />
          ))
        )}
      </Pane>
      {turns.length > 0 && (
        <Dock ref={dockRef}>
          <div><ScanInput onSubmit={submit} busy={busy} chips={false} hint="Live TikTok data" maxLength={300} label="Brand to scan or question"
            placeholder={ws.approved ? 'Ask a follow-up or scan another brand…' : 'Scan another brand…'} shortPlaceholder={ws.approved ? 'Ask or scan…' : 'Scan a brand…'} /></div>
        </Dock>
      )}
    </>
  );
}

const STATUS = {
  in_review: { label: 'In review', tone: '#d97706', bg: '#fff8eb' },
  active: { label: 'Live · picking creators', tone: '#0f9d58', bg: '#e8f7ed' },
  locked: { label: 'Creators locked · shipping', tone: '#2563eb', bg: '#eff4ff' },
  shipped: { label: 'Shipped', tone: '#7c3aed', bg: '#f4effe' },
  closed: { label: 'Closed', tone: '#6b6f78', bg: '#f0f1f3' },
  rejected: { label: 'Not approved', tone: '#c92549', bg: '#fef2f4' },
};

function CampaignsView({ ws, onChanged }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [openToken, setOpenToken] = useState('');
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_CAMPAIGN);
  const [busy, setBusy] = useState(false);
  const [paywall, setPaywall] = useState(false);

  const load = useCallback(() => {
    getCampaigns().then(setData).catch((err) => setError(err.message));
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (new URLSearchParams(location.search).get('new') && data) {
      startNew();
      navigate('/brand/workspace/roster', { replace: true });
    }
  }, [data, location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const items = (data && data.campaigns) || [];

  const startNew = () => {
    if (!data) return;
    if (data.can_create) { setCreating(true); setPaywall(false); return; }
    setPaywall(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const out = await createCampaign(campaignPayload(draft));
      setData((d) => ({ ...d, campaigns: out.campaigns || d.campaigns }));
      setCreating(false);
      setDraft(EMPTY_CAMPAIGN);
      load();
      if (onChanged) onChanged();
    } catch (err) {
      if (err.code === 'PAYWALL') { setCreating(false); setPaywall(true); } else setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const checkout = async () => {
    setBusy(true);
    try {
      const url = await startCheckout();
      if (url) window.location.href = url;
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Waiting for approval: show where things stand, nothing to buy or start.
  if (!ws.approved) {
    const first = items[0];
    return (
      <Pane>
        <H1 $left>Campaigns</H1>
        <Sub>Your gifted campaigns and the creators applying to them.</Sub>
        <Empty>
          <Clock size={28} />
          <b>Pending review</b>
          {first
            ? <>Your campaign for <strong>{first.product_name}</strong> is saved. It goes live to vetted creators as soon as your account is approved (usually within 24h).</>
            : 'Your account is being reviewed (usually within 24h). You can set up your first campaign once it’s approved.'}
        </Empty>
      </Pane>
    );
  }

  if (openToken) {
    return <WorkspaceRoster token={openToken} onBack={() => setOpenToken('')} />;
  }

  return (
    <Pane>
      <HeadRow>
        <div>
          <H1 $left>Campaigns</H1>
          <Sub>Pick creators, lock your list and ship. Each campaign gets 5–10 ad-ready videos.</Sub>
        </div>
        {!creating && data && (
          <Primary as="button" type="button" onClick={startNew} style={{ marginTop: 0 }}>
            <Plus size={16} /> New campaign
          </Primary>
        )}
      </HeadRow>

      {error && <Banner>{error}</Banner>}

      {paywall && data && (
        <Plan>
          <h3>{data.reason === 'first_in_review' ? 'Your free campaign is in review' : 'Your free campaign is used'}</h3>
          <p>Run more gifted campaigns, side by side, with Newcollab Pro.</p>
          <div className="price">$299 <span>/ month</span></div>
          <ul>
            <li>A new campaign every month, up to 10 creators each</li>
            <li>Unlimited Brand Scans and full creator lists</li>
            <li>5–10 ad-ready videos per campaign, 6-month ad rights</li>
          </ul>
          <Primary as="button" type="button" aria-disabled={busy} onClick={checkout}>
            <CreditCard size={16} /> Upgrade · $299/mo
          </Primary>
          <PlainLink type="button" style={{ marginLeft: 14 }} onClick={() => setPaywall(false)}>Not now</PlainLink>
        </Plan>
      )}

      {creating && (
        <Plan as="form" onSubmit={submit}>
          <h3>{items.length ? 'New campaign' : 'Your first campaign · free'}</h3>
          <p style={{ marginBottom: 18 }}>We review it, then it goes live to vetted creators in your niche.</p>
          <CampaignForm value={draft} onChange={setDraft} />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Primary as="button" type="submit" aria-disabled={busy || !campaignReady(draft)} style={{ marginTop: 0 }}>
              Start my campaign
            </Primary>
            <PlainLink type="button" onClick={() => setCreating(false)}>Cancel</PlainLink>
          </div>
        </Plan>
      )}

      {!data && !error && <ListSkeleton rows={2} />}

      {data && items.length === 0 && !creating && (
        <Empty>
          <Users size={28} />
          <b>No campaign yet</b>
          Tell us what you want to gift and we&apos;ll fill your roster with vetted creators. Your first campaign is free.
          <div><Primary as="button" type="button" onClick={startNew}>Try your first campaign free</Primary></div>
        </Empty>
      )}

      <CampaignList>
        {items.map((c) => {
          const st = STATUS[c.status] || STATUS.in_review;
          return (
            <li key={c.id}>
              <div className="main">
                <b>{c.product_name}</b>
                <span className="badge" style={{ color: st.tone, background: st.bg }}>{st.label}</span>
                <small>
                  {c.creator_count_range ? `${c.creator_count_range} creators` : ''}
                  {c.created_at ? ` · started ${new Date(c.created_at).toLocaleDateString()}` : ''}
                </small>
              </div>
              {c.roster_token ? (
                <button type="button" onClick={() => setOpenToken(c.roster_token)}>Open roster</button>
              ) : (
                <span className="wait"><CheckCircle2 size={14} /> We&apos;re reviewing it</span>
              )}
            </li>
          );
        })}
      </CampaignList>
    </Pane>
  );
}

function SavedView({ saved, onRemove, approved }) {
  return (
    <Pane $wide>
      <H1 $left>Saved creators</H1>
      <Sub>Creators you bookmarked from your scans. Add them to your next campaign.</Sub>
      {saved.length === 0 ? (
        <Empty>
          <Bookmark size={28} />
          <b>Nothing saved yet</b>
          {approved
            ? 'Run a scan and tap the bookmark on any Newcollab creator you like.'
            : 'Saving creators unlocks when your account is approved.'}
        </Empty>
      ) : (
        <Grid>
          {saved.map((c) => (
            <Card key={c.ref}>
              <div className="top">
                <div className="av">{c.avatar_url ? <img src={c.avatar_url} alt="" /> : (c.handle || '?').replace('@', '').slice(0, 1).toUpperCase()}</div>
                <div style={{ minWidth: 0 }}>
                  <b>{c.handle}</b>
                  <small>{[c.followers, (c.niches || [])[0]].filter(Boolean).join(' · ')}</small>
                </div>
              </div>
              {c.from_scan && <small>From your {c.from_scan} scan</small>}
              <div className="row">
                {c.preview_url && <a href={c.preview_url} target="_blank" rel="noopener noreferrer">View profile</a>}
                <button type="button" onClick={() => onRemove(c.ref)}>Remove</button>
              </div>
            </Card>
          ))}
        </Grid>
      )}
    </Pane>
  );
}

function BillingView({ ws, onRefresh }) {
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const subscribed = ws.scans && ws.scans.subscribed;
  const returned = new URLSearchParams(location.search).get('billing');
  const activating = returned === 'success' && !subscribed;
  // Stripe sends them back before its webhook lands; re-check for a little while until Pro shows up.
  useEffect(() => {
    if (!activating || !onRefresh) return undefined;
    let n = 0;
    const timer = setInterval(() => { n += 1; onRefresh(); if (n >= 10) clearInterval(timer); }, 3000);
    return () => clearInterval(timer);
  }, [activating, onRefresh]);
  const go = async (fn) => {
    setBusy(true);
    setError('');
    try {
      const url = await fn();
      if (url) window.location.href = url;
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Pane>
      <H1 $left>Plan & billing</H1>
      <Sub>Your first campaign is free. Upgrade anytime.</Sub>
      {activating && (
        <Banner $tone="ok"><CheckCircle2 size={16} /><span><b>Payment received.</b> Pro turns on in a few seconds.</span></Banner>
      )}
      {returned === 'success' && subscribed && (
        <Banner $tone="ok"><CheckCircle2 size={16} /><span><b>You&apos;re on Pro.</b> Unlimited scans and more campaigns are on.</span></Banner>
      )}
      <Plan>
        <h3>{subscribed ? 'Newcollab Pro · active' : 'Free plan'}</h3>
        <p>{subscribed ? 'Unlimited Brand Scans and a new gifted campaign every month.' : 'One free gifted campaign and 3 new Brand Scans a day.'}</p>
        {!subscribed && (
          <>
            <div className="price">$299 <span>/ month</span></div>
            <ul>
              <li>Unlimited Brand Scans and full creator lists</li>
              <li>A new gifted campaign every month, up to 10 creators</li>
              <li>5–10 ad-ready videos with 6-month ad rights</li>
              <li>Cancel anytime</li>
            </ul>
          </>
        )}
        <Primary as="button" type="button" aria-disabled={busy || activating} onClick={() => go(subscribed ? openPortal : startCheckout)}>
          <CreditCard size={16} /> {subscribed ? 'Manage billing' : 'Upgrade · $299/mo'}
        </Primary>
        {error && <p style={{ color: t.accent, marginTop: 10 }}>{error}</p>}
      </Plan>
    </Pane>
  );
}

// ============================================================================
// WORKSPACE
// ============================================================================

export default function BrandWorkspace() {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogout } = useContext(UserContext) || {};
  const [ws, setWs] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [saved, setSaved] = useState([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getWorkspace();
      setWs(data);
      getScanHistory().then(setHistory).catch(() => {});
      getSaved().then(setSaved).catch(() => {});
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setOpen(false); }, [location.pathname, location.search]);

  // Waiting for approval: re-check when the tab comes back into view and every minute, so an approval shows
  // up without a reload.
  const [justApproved, setJustApproved] = useState(false);
  const pending = Boolean(ws && !ws.approved);
  useEffect(() => {
    if (!pending) return undefined;
    const recheck = () => {
      if (document.visibilityState === 'hidden') return;
      getWorkspace().then((fresh) => {
        if (fresh.approved) {
          setJustApproved(true);
          getScanHistory().then(setHistory).catch(() => {});
        }
        setWs(fresh);
      }).catch(() => {});
    };
    const timer = setInterval(recheck, 60000);
    window.addEventListener('focus', recheck);
    document.addEventListener('visibilitychange', recheck);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', recheck);
      document.removeEventListener('visibilitychange', recheck);
    };
  }, [pending]);
  useEffect(() => {
    const prev = document.title;
    document.title = 'Brand workspace · Newcollab';
    return () => { document.title = prev; };
  }, []);

  const savedRefs = useMemo(() => new Set(saved.map((c) => c.ref)), [saved]);
  const onSave = useCallback(async (card, save) => {
    try {
      setSaved(save ? await saveCreator(card) : await removeCreator((card.handle || '').toLowerCase()));
    } catch {
      // keep the current list; the toggle simply doesn't change
    }
  }, []);
  const onScanned = useCallback(() => {
    getScanHistory().then(setHistory).catch(() => {});
    getWorkspace().then(setWs).catch(() => {});
  }, []);

  const campaignCta = useMemo(() => {
    if (!ws) return undefined;
    if (ws.roster && ws.roster.token) return { label: 'Pick creators for your campaign', onClick: () => navigate('/brand/workspace/roster') };
    if (ws.campaign || !ws.approved) return { label: 'View my campaign', onClick: () => navigate('/brand/workspace/roster') };
    return { label: 'Try your first campaign free', onClick: () => navigate('/brand/workspace/roster?new=1') };
  }, [navigate, ws]);

  if (error) {
    return (
      <Shell><Main><Pane><Empty><b>We couldn&apos;t open your workspace</b>{error}
        <div><Primary href="/login?returnTo=%2Fbrand%2Fworkspace">Log in again</Primary></div></Empty></Pane></Main></Shell>
    );
  }
  if (!ws) {
    return <WorkspaceSkeleton />;
  }

  const name = ws.brand.name || 'Your brand';
  const status = ws.approval_status;

  return (
    <Shell>
      <Scrim $open={open} onClick={() => setOpen(false)} />
      <Side $open={open}>
        <Logo>
          <span><b>newcollab</b><small>Brands</small></span>
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)}><X size={18} /></button>
        </Logo>
        <NewScan type="button" onClick={() => navigate(`/brand/workspace?new=${Date.now()}`)}>
          <Plus size={16} /> New scan
        </NewScan>
        <Nav>
          <NavLink to="/brand/workspace" end><Radar size={16} /> Brand Scan</NavLink>
          <NavLink to="/brand/workspace/roster"><Users size={16} /> Campaigns & roster</NavLink>
          <NavLink to="/brand/workspace/saved"><Bookmark size={16} /> Saved creators</NavLink>
          <NavLink to="/brand/workspace/billing"><CreditCard size={16} /> Plan & billing</NavLink>
        </Nav>
        <SideLabel>Recent scans</SideLabel>
        <History>
          {history.length === 0 && <p>No scans yet</p>}
          {history.map((h) => (
            <button key={h.key} type="button" title={h.name}
              onClick={() => navigate(`/brand/workspace?b=${encodeURIComponent(h.name)}&t=${Date.now()}`)}>
              {h.name}
            </button>
          ))}
        </History>
        {!(ws.scans && ws.scans.subscribed) && (
          <UpgradeCard type="button" onClick={() => { setOpen(false); navigate('/brand/workspace/billing'); }}>
            <Sparkles size={15} />
            <span><b>Upgrade to Pro</b>Unlimited scans and campaigns</span>
          </UpgradeCard>
        )}
        <Account>
          <div className="av">{ws.brand.logo ? <img src={ws.brand.logo} alt="" /> : name.slice(0, 1).toUpperCase()}</div>
          <div className="who"><b>{name}</b><span>{ws.user.email}</span></div>
          <button type="button" aria-label="Log out" title="Log out" onClick={() => (handleLogout ? handleLogout() : navigate('/login'))}>
            <LogOut size={16} />
          </button>
        </Account>
      </Side>

      <Main>
        <TopBar>
          <button type="button" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={20} /></button>
          newcollab <span style={{ color: t.muted, fontWeight: 500 }}>· {name}</span>
        </TopBar>
        {status === 'pending' && (
          <Pane style={{ paddingBottom: 0 }}>
            <Banner $tone="warn">
              <Clock size={16} />
              <span>
                <b>Your account is being reviewed</b> (usually within 24h). Meanwhile you get one full competitor scan. Daily scans, the prompt library and saving creators unlock once you&apos;re approved.
                <small style={{ display: 'block', marginTop: 4, color: t.muted }}>Signed in as {ws.user.email}</small>
              </span>
            </Banner>
          </Pane>
        )}
        {justApproved && status !== 'pending' && (
          <Pane style={{ paddingBottom: 0 }}>
            <Banner $tone="ok">
              <CheckCircle2 size={16} />
              <span><b>You&apos;re approved.</b> Daily scans, the prompt library and your campaigns are unlocked.</span>
            </Banner>
          </Pane>
        )}
        {status === 'rejected' && (
          <Pane style={{ paddingBottom: 0 }}>
            <Banner>
              <Clock size={16} />
              <span>We couldn&apos;t approve this brand account yet. Email <a href="mailto:team@newcollab.co">team@newcollab.co</a> and we&apos;ll take another look.</span>
            </Banner>
          </Pane>
        )}
        <Routes>
          <Route index element={<ScanView ws={ws} onScanned={onScanned} savedRefs={savedRefs} onSave={onSave} campaignCta={campaignCta} />} />
          <Route path="roster" element={<CampaignsView ws={ws} onChanged={onScanned} />} />
          <Route path="saved" element={<SavedView saved={saved} approved={ws.approved} onRemove={async (ref) => setSaved(await removeCreator(ref))} />} />
          <Route path="billing" element={<BillingView ws={ws} onRefresh={onScanned} />} />
          <Route path="*" element={<ScanView ws={ws} onScanned={onScanned} savedRefs={savedRefs} onSave={onSave} campaignCta={campaignCta} />} />
        </Routes>
      </Main>
    </Shell>
  );
}
