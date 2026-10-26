// Brand workspace (/brand/workspace): a Lightreel-style app for brands. Sidebar with new scan, recent
// scans and sections; main pane runs Brand Scan as a chat, plus roster, saved creators and billing.
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  Bookmark, Clock, CreditCard, LogOut, Menu, Plus, Radar, Search, Sparkles, TrendingUp, Users, X,
} from 'lucide-react';
import { UserContext } from '../contexts/UserContext';
import ScanInput from '../app/brands/scan/ScanInput';
import { ScanTurn, useScanTurns } from '../app/brands/scan/ScanReport';
import { scan as t } from '../app/brands/scan/theme';
import BrandPRRoster from '../cra-pages/BrandPRRoster';
import {
  getSaved, getScanHistory, getWorkspace, openPortal, pollScan, removeCreator, saveCreator, startCheckout, startScan,
} from './workspaceApi';

const SIDEBAR = 260;

// ============================================================================
// SHELL
// ============================================================================

const Shell = styled.div`
  display: flex;
  min-height: 100vh;
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

const Pane = styled.div`
  max-width: ${(p) => (p.$wide ? '1100px' : '780px')};
  margin: 0 auto;
  padding: 32px 20px 180px;

  @media (max-width: 900px) {
    padding: 20px 16px 180px;
  }
`;

const Banner = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  border: 1px solid ${(p) => (p.$tone === 'warn' ? '#fde2b3' : '#fbd5de')};
  background: ${(p) => (p.$tone === 'warn' ? '#fff8eb' : t.accentSoft)};
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.5;
  color: ${t.ink2};
  margin-bottom: 24px;

  svg { flex: 0 0 auto; margin-top: 2px; color: ${(p) => (p.$tone === 'warn' ? '#d97706' : t.accent)}; }
`;

const H1 = styled.h1`
  font-size: clamp(24px, 3.4vw, 32px);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: ${(p) => (p.$left ? 'left' : 'center')};
  margin: ${(p) => (p.$left ? '0 0 6px' : '12vh 0 24px')};
`;

const Sub = styled.p`
  font-size: 15px;
  color: ${t.muted};
  margin: 0 0 24px;
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

const Empty = styled.div`
  border: 1px dashed ${t.line};
  border-radius: 18px;
  padding: 32px 24px;
  text-align: center;
  color: ${t.muted};
  font-size: 15px;
  line-height: 1.6;

  svg { color: ${t.muted2}; margin-bottom: 8px; }
  b { display: block; color: ${t.ink}; font-size: 17px; margin-bottom: 6px; }
`;

const Primary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  background: ${t.accent};
  color: #fff !important;
  font-size: 15px;
  font-weight: 600;
  padding: 12px 18px;
  border-radius: 12px;
  text-decoration: none;
  border: 0;
  cursor: pointer;

  &:hover { background: ${t.accentHover}; }
  &[aria-disabled='true'] { opacity: 0.6; pointer-events: none; }
`;

const Plan = styled.div`
  border: 1px solid ${t.line};
  border-radius: 18px;
  padding: 22px;
  margin-bottom: 16px;

  h3 { font-size: 16px; margin: 0 0 4px; }
  p { color: ${t.muted}; font-size: 14px; line-height: 1.6; margin: 0; }
  .price { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin: 12px 0 4px; }
  .price span { font-size: 14px; font-weight: 500; color: ${t.muted}; }
  ul { margin: 12px 0 0; padding-left: 18px; color: ${t.ink2}; font-size: 14px; line-height: 1.8; }
`;

const RosterFrame = styled.div`
  margin: 0 -20px;

  @media (max-width: 900px) {
    margin: 0 -16px;
  }
`;

// ============================================================================
// VIEWS
// ============================================================================

const PROMPTS = [
  { icon: Search, bg: '#e8f7ed', fg: '#0f9d58', title: 'Scan a competitor', text: 'See every TikTok creator posting about them, the hooks they reuse and their top videos.', action: 'focus' },
  { icon: TrendingUp, bg: '#eef2ff', fg: '#4f46e5', title: 'Scan a category leader', text: 'Learn the creator playbook of the biggest brand in your niche.', brand: 'Glow Recipe' },
  { icon: Users, bg: '#fef2f4', fg: '#e8395f', title: 'Scan your own brand', text: 'Find the creators already talking about you, gifted or not.', own: true },
  { icon: Sparkles, bg: '#fff8eb', fg: '#d97706', title: 'Find the next hook', text: 'Scan a fast-growing brand to spot the scripted hooks creators are repeating right now.', brand: 'Bubble Skincare' },
];

function ScanView({ ws, onScanned, savedRefs, onSave, campaignCta }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { turns, run, busy, reset } = useScanTurns({
    start: startScan, poll: pollScan, source: 'workspace', onDone: onScanned,
  });
  const dockRef = useRef(null);
  const handled = useRef('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const b = params.get('b');
    const fresh = params.get('new');
    if (fresh && handled.current !== `new:${fresh}`) {
      handled.current = `new:${fresh}`;
      reset();
      navigate('/brand/workspace', { replace: true });
    } else if (b && handled.current !== `b:${b}:${params.get('t') || ''}`) {
      handled.current = `b:${b}:${params.get('t') || ''}`;
      run(b);
      navigate('/brand/workspace', { replace: true });
    }
  }, [location.search, navigate, reset, run]);

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
  const meter = !ws.approved
    ? 'Free scan · creator lists unlock when your account is approved'
    : left == null ? 'Unlimited scans' : `${left} of ${scans.limit} new brand scans left today`;

  const pick = (p) => {
    if (p.action === 'focus') return focus();
    return run(p.own ? ws.brand.name : p.brand);
  };

  return (
    <>
      <Pane>
        {turns.length === 0 ? (
          <>
            <H1>Whose creators do you want to see?</H1>
            <div ref={dockRef}>
              <ScanInput onSubmit={run} busy={busy} chips={false} large autoFocus hint="Live TikTok data"
                placeholder="Type a brand, e.g. Glow Recipe or @glowrecipe" />
            </div>
            <Meter><span>{meter}</span><b>{scans.subscribed ? 'Pro' : ws.approved ? 'Free plan' : ''}</b></Meter>
            <Library>
              <h2><Bookmark size={15} /> Prompt library</h2>
              {PROMPTS.map((p) => (
                <Prompt key={p.title} type="button" $bg={p.bg} $fg={p.fg} onClick={() => pick(p)}>
                  <span className="ic"><p.icon size={18} /></span>
                  <span className="tx"><b>{p.title}</b><span>{p.text}</span></span>
                  <span className="go">Use prompt →</span>
                </Prompt>
              ))}
            </Library>
          </>
        ) : (
          turns.map((turn) => (
            <ScanTurn key={turn.id} turn={turn} savedRefs={savedRefs} onSave={ws.approved ? onSave : undefined}
              cta={turn.scan && turn.scan.gate === 'daily_limit'
                ? { label: 'See plans', onClick: () => navigate('/brand/workspace/billing') }
                : campaignCta} />
          ))
        )}
      </Pane>
      {turns.length > 0 && (
        <Dock ref={dockRef}>
          <div><ScanInput onSubmit={run} busy={busy} chips={false} hint="Live TikTok data" placeholder="Scan another brand…" /></div>
        </Dock>
      )}
    </>
  );
}

function RosterView({ ws }) {
  if (ws.roster && ws.roster.token) {
    return <RosterFrame><BrandPRRoster token={ws.roster.token} /></RosterFrame>;
  }
  const campaign = ws.campaign;
  return (
    <Pane>
      <H1 $left>Roster</H1>
      <Sub>The creators applying to your gifted campaign, ready to pick, lock and ship.</Sub>
      <Empty>
        <Users size={28} />
        {campaign ? (
          <>
            <b>Your campaign for {campaign.product_name || 'your product'} is being set up</b>
            We&apos;re reviewing it now. Once it&apos;s live, creators who apply show up here and you pick who to gift.
          </>
        ) : (
          <>
            <b>No campaign yet</b>
            Tell us what you want to gift and we&apos;ll fill your roster with vetted creators. Your first campaign is free.
            <div><Primary href="/for-brands?ref=workspace">Try your first campaign free</Primary></div>
          </>
        )}
      </Empty>
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

function BillingView({ ws }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const token = ws.roster && ws.roster.token;
  const subscribed = ws.scans && ws.scans.subscribed;
  const go = async (fn) => {
    setBusy(true);
    setError('');
    try {
      const url = await fn(token);
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
      <Sub>Your first campaign is free. Subscribe when you want more.</Sub>
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
        {token ? (
          <Primary as="button" type="button" aria-disabled={busy} onClick={() => go(subscribed ? openPortal : startCheckout)}>
            <CreditCard size={16} /> {subscribed ? 'Manage billing' : 'Subscribe · $299/mo'}
          </Primary>
        ) : (
          <p style={{ marginTop: 14 }}>Billing opens once your first campaign is live.</p>
        )}
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
    if (ws.campaign) return { label: 'View my campaign', onClick: () => navigate('/brand/workspace/roster') };
    return { label: 'Try your first campaign free', href: '/for-brands?ref=workspace' };
  }, [navigate, ws]);

  if (error) {
    return (
      <Shell><Main><Pane><Empty><b>We couldn&apos;t open your workspace</b>{error}
        <div><Primary href="/login?returnTo=%2Fbrand%2Fworkspace">Log in again</Primary></div></Empty></Pane></Main></Shell>
    );
  }
  if (!ws) {
    return <Shell><Main><Pane><Meter><span>Loading your workspace…</span></Meter></Pane></Main></Shell>;
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
          <NavLink to="/brand/workspace/roster"><Users size={16} /> Roster</NavLink>
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
              <span><b>Your account is being reviewed</b> (usually within 24h). You can run one free scan meanwhile. Full creator lists, saving creators and daily scans unlock once you&apos;re approved.</span>
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
          <Route path="roster" element={<RosterView ws={ws} />} />
          <Route path="saved" element={<SavedView saved={saved} approved={ws.approved} onRemove={async (ref) => setSaved(await removeCreator(ref))} />} />
          <Route path="billing" element={<BillingView ws={ws} />} />
          <Route path="*" element={<ScanView ws={ws} onScanned={onScanned} savedRefs={savedRefs} onSave={onSave} campaignCta={campaignCta} />} />
        </Routes>
      </Main>
    </Shell>
  );
}
