import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { ArrowUpRight, Check, Copy, Lock, Mail, X } from 'lucide-react';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';
import { PRO_PRICE_MONTHLY } from '../config/proOffer';
import UpgradeModal from './UpgradeModal';
import { brandMarkEmoji } from './brandMarkEmoji';

const VIEWS = [
  { id: 'all', label: 'All gigs' },
  { id: 'for_you', label: 'Your niche' },
  { id: 'new', label: 'New' },
  { id: 'high_pay', label: '$500+' },
  { id: 'applied', label: 'Applied' },
];

const FREE_PREVIEW = 3;

function money(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return '';
  if (v >= 1000) return `$${Math.round(v / 1000).toLocaleString('en-US')}K`;
  return `$${Math.round(v).toLocaleString('en-US')}`;
}

function payText(gig) {
  const label = String(gig?.pay_label || '').trim();
  if (/[$£€₹]\s*\d/.test(label)) return label;
  const amount = Number(gig?.pr_value_usd);
  if (Number.isFinite(amount) && amount > 0) return `$${amount.toLocaleString('en-US')}`;
  return label || 'Paid';
}

function postedLabel(iso) {
  if (!iso) return '';
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';
  const days = Math.floor((Date.now() - then.getTime()) / 86400000);
  if (days <= 0) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  if (days < 14) return `Posted ${days} days ago`;
  return `Posted ${then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

function gigTitles(gig) {
  const poster = String(gig?.brand_name || '').trim();
  const unknown = Boolean(gig?.brand_unknown) || !poster || /^unknown brand$/i.test(poster);
  const headline = String(gig?.headline || '').trim();
  const brand = unknown ? '' : poster;
  const title = brand || headline || 'Paid UGC gig';
  const subtitle = brand && headline && headline.toLowerCase() !== brand.toLowerCase() ? headline : '';
  return { title, subtitle };
}

function sourceName(gig) {
  return String(gig?.source_label || '').trim();
}

function applyLabel(gig) {
  if (gig?.apply_mode === 'email') return 'Send application by email';
  if (gig?.apply_mode === 'kit') return 'Apply with my kit';
  const src = sourceName(gig);
  return src ? `Copy & apply on ${src}` : 'Copy & apply';
}

function Mark({ gig, size = 44 }) {
  const { title } = gigTitles(gig);
  const [broken, setBroken] = useState(false);
  const src = String(gig?.logo || '').trim();
  const mark = brandMarkEmoji({ name: title, category: gig?.category });
  return (
    <MarkBox $size={size} style={!src || broken ? { background: mark.bg } : undefined}>
      {src && !broken
        ? <img src={src} alt="" onError={() => setBroken(true)} />
        : <span aria-hidden>{mark.emoji}</span>}
    </MarkBox>
  );
}

function GigTags({ gig }) {
  const src = sourceName(gig);
  return (
    <Tags>
      {gig.is_new && <Tag $tone="new">New</Tag>}
      {gig.is_match && <Tag $tone="fit">Your niche</Tag>}
      {gig.deliverable && <Tag>{gig.deliverable}</Tag>}
      {gig.location && <Tag>{gig.location}</Tag>}
      {src && <Tag>via {src}</Tag>}
    </Tags>
  );
}

function GigTile({ gig, onOpen }) {
  if (gig.locked) {
    return (
      <Tile type="button" onClick={() => onOpen(gig)} $locked aria-label={`Locked gig paying ${payText(gig)}`}>
        <TileTop>
          <MarkBox $size={44} $ghost><Lock size={16} /></MarkBox>
          <TileHead>
            <Blur $w="62%" />
            <Blur $w="88%" $thin />
          </TileHead>
          <Pay>{payText(gig)}</Pay>
        </TileTop>
        <GigTags gig={gig} />
        <TileFoot>
          <span>{postedLabel(gig.posted_at)}</span>
          <UnlockHint><Lock size={13} /> Unlock with Pro</UnlockHint>
        </TileFoot>
      </Tile>
    );
  }
  const { title, subtitle } = gigTitles(gig);
  return (
    <Tile type="button" onClick={() => onOpen(gig)} $applied={gig.already_applied}>
      <TileTop>
        <Mark gig={gig} />
        <TileHead>
          <TileTitle>{title}</TileTitle>
          {subtitle && <TileSub>{subtitle}</TileSub>}
        </TileHead>
        <Pay>{payText(gig)}</Pay>
      </TileTop>
      <GigTags gig={gig} />
      <TileFoot>
        <span>{postedLabel(gig.posted_at)}</span>
        {gig.already_applied
          ? <AppliedHint><Check size={13} /> Applied</AppliedHint>
          : <ViewHint>View gig <ArrowUpRight size={14} /></ViewHint>}
      </TileFoot>
    </Tile>
  );
}

function ProBanner({ stats, onUpgrade }) {
  const total = stats?.total || 0;
  const open = money(stats?.open_pay_usd);
  return (
    <Banner>
      <div>
        <strong>You're seeing {FREE_PREVIEW} of {total} paid gigs.</strong>
        <span>
          Pro opens every brief{open ? `, ${open} in open pay right now` : ''}, and Polly writes each application for you.
        </span>
      </div>
      <BannerCta type="button" onClick={onUpgrade}>Unlock all gigs · {PRO_PRICE_MONTHLY}</BannerCta>
    </Banner>
  );
}

function GigSheet({ gig, onClose, onApplied, onUpgrade }) {
  const [draft, setDraft] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState(gig.already_applied ? 'confirm' : 'ready');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(gig);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    apiClient.post(`/api/opportunities/${gig.id}/application-draft`, {}, { timeout: 30000 })
      .then((res) => {
        if (!alive) return;
        const d = res.data?.draft || null;
        setDraft(d);
        setText(d?.body || '');
        if (res.data?.gig) setDetail((prev) => ({ ...prev, ...res.data.gig }));
      })
      .catch((err) => {
        if (!alive) return;
        if (err.response?.status === 402) onUpgrade();
        else if (err.response?.status === 404) setError('This gig just closed. Pick another one.');
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [gig.id, onUpgrade]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const fullText = () => (draft?.subject ? `Subject: ${draft.subject}\n\n${text}` : text);

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch (_) { /* clipboard blocked */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const apply = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    const mode = detail.apply_mode || 'url';
    // Copy while this page still has focus; a background page triggers Chrome's clipboard prompt.
    let copying = null;
    if (mode === 'url') {
      try { copying = navigator.clipboard.writeText(fullText()).catch(() => {}); } catch (_) { /* clipboard blocked */ }
    }
    const tab = mode === 'url' ? window.open('', '_blank') : null;
    if (tab) {
      try {
        tab.document.title = 'Opening gig…';
        tab.document.body.style.cssText = 'font-family:system-ui,sans-serif;display:grid;place-items:center;height:100vh;margin:0;color:#555';
        tab.document.body.textContent = 'Opening the gig… your application is copied.';
      } catch (_) { /* tab not writable */ }
    }
    await copying;
    let data = {};
    try {
      const res = await apiClient.post(`/api/opportunities/${gig.id}/apply`, {}, { timeout: 30000 });
      data = res.data || {};
      window.dispatchEvent(new CustomEvent('nc-credits-changed'));
    } catch (err) {
      const status = err.response?.status;
      const body = err.response?.data || {};
      if (status === 409) {
        data = body;
      } else {
        if (tab) tab.close();
        setBusy(false);
        if (body.error === 'limit_reached' || status === 403 || status === 402) {
          onUpgrade();
        } else {
          setError(body.error || 'Could not open this gig. Try again.');
        }
        return;
      }
    }
    const url = data.external_apply_url;
    const email = data.apply_email;
    if (tab) {
      if (url) {
        tab.opener = null;
        tab.location.href = url;
      } else {
        tab.close();
      }
    }
    if (!url && email) {
      const subject = encodeURIComponent(draft?.subject || 'UGC application');
      window.location.href = `mailto:${email}?subject=${subject}&body=${encodeURIComponent(text)}`;
    }
    onApplied(gig.id);
    setStage((data.apply_mode || mode) === 'kit' ? 'done' : 'confirm');
    setBusy(false);
  };

  const confirm = async (done) => {
    if (!done) {
      setStage('ready');
      return;
    }
    try {
      await apiClient.post(`/api/opportunities/${gig.id}/application-status`, { status: 'submitted' });
    } catch (_) { /* tracked as clicked either way */ }
    setStage('done');
  };

  const { title, subtitle } = gigTitles(detail);
  const src = sourceName(detail);

  return (
    <Overlay onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <Sheet role="dialog" aria-modal="true" aria-label={title}>
        <SheetHead>
          <Mark gig={detail} size={52} />
          <div>
            <SheetTitle>{title}</SheetTitle>
            {subtitle && <TileSub>{subtitle}</TileSub>}
          </div>
          <CloseBtn type="button" onClick={onClose} aria-label="Close"><X size={18} /></CloseBtn>
        </SheetHead>

        <SheetPay>
          <b>{payText(detail)}</b>
          <span>{postedLabel(detail.posted_at)}</span>
        </SheetPay>
        <GigTags gig={detail} />

        {detail.summary && <Brief>{detail.summary}</Brief>}

        <Section>
          <SectionHead>
            <div>
              <h3>Your application</h3>
              <p>Polly wrote this from your kit. Edit anything before you send it.</p>
            </div>
            {!loading && text && (
              <GhostBtn type="button" onClick={copy}>
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </GhostBtn>
            )}
          </SectionHead>
          {loading
            ? <DraftSkeleton><i /><i /><i /><i /></DraftSkeleton>
            : <Draft value={text} onChange={(e) => setText(e.target.value)} rows={10} spellCheck />}
        </Section>

        {error && <ErrorNote>{error}</ErrorNote>}

        <SheetFoot>
          {stage === 'confirm' && (
            <Confirm>
              <strong>{src ? `Finished applying on ${src}?` : 'Finished applying?'}</strong>
              <span>We'll keep it in your Applied list so nothing slips.</span>
              <ConfirmRow>
                <PrimaryBtn type="button" onClick={() => confirm(true)}><Check size={16} /> Yes, I applied</PrimaryBtn>
                <GhostBtn type="button" onClick={apply} disabled={busy}>
                  {busy ? 'Opening…' : <>Open again <ArrowUpRight size={14} /></>}
                </GhostBtn>
              </ConfirmRow>
            </Confirm>
          )}
          {stage === 'done' && (
            <Done>
              <Check size={18} />
              <div>
                <strong>Application logged.</strong>
                <span>It's in your Applied tab with everything else you've sent.</span>
              </div>
            </Done>
          )}
          {stage === 'ready' && (
            <>
              <PrimaryBtn type="button" onClick={apply} disabled={busy || loading || !!error}>
                {busy ? 'Opening…' : (
                  <>
                    {detail.apply_mode === 'email' ? <Mail size={16} /> : null}
                    {applyLabel(detail)}
                    {detail.apply_mode !== 'email' && <ArrowUpRight size={16} />}
                  </>
                )}
              </PrimaryBtn>
              {detail.apply_mode !== 'email' && detail.apply_mode !== 'kit' && (
                <FootNote>We copy your application, then open the gig. Paste it into their form.</FootNote>
              )}
            </>
          )}
        </SheetFoot>
      </Sheet>
    </Overlay>
  );
}

function AppliedList({ items, loading, onBrowse }) {
  if (loading) return <Grid>{[0, 1, 2, 3].map((i) => <SkeletonTile key={i} />)}</Grid>;
  if (!items.length) {
    return (
      <Empty>
        <strong>No applications yet.</strong>
        <span>Pick a gig, Polly writes the application, you paste and send. It shows up here.</span>
        <PrimaryBtn type="button" onClick={onBrowse}>Browse paid gigs</PrimaryBtn>
      </Empty>
    );
  }
  return (
    <Rows>
      {items.map((item) => {
        const { title, subtitle } = gigTitles(item);
        return (
          <Row key={item.id}>
            <Mark gig={item} size={40} />
            <RowMain>
              <TileTitle>{title}</TileTitle>
              <TileSub>{[subtitle, item.source_label && `via ${item.source_label}`].filter(Boolean).join(' · ')}</TileSub>
            </RowMain>
            <RowPay>{payText(item)}</RowPay>
            <Status $tone={item.status === 'submitted' ? 'ok' : item.live ? 'wait' : 'off'}>
              {item.status === 'submitted' ? 'Applied' : item.live ? 'Opened' : 'Closed'}
            </Status>
          </Row>
        );
      })}
    </Rows>
  );
}

export default function PaidGigs() {
  const [view, setView] = useState('all');
  const [gigs, setGigs] = useState([]);
  const [stats, setStats] = useState(null);
  const [counts, setCounts] = useState({});
  const [appliedCount, setAppliedCount] = useState(0);
  const [isPro, setIsPro] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [applications, setApplications] = useState([]);
  const [openGig, setOpenGig] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const reqId = useRef(0);

  const load = useCallback(async (nextView, offset = 0) => {
    const id = ++reqId.current;
    if (offset) setLoadingMore(true); else setLoading(true);
    setError('');
    try {
      if (nextView === 'applied') {
        const res = await apiClient.get('/api/opportunities/paid-gigs/applied', { timeout: 30000 });
        if (id !== reqId.current) return;
        setApplications(res.data?.applications || []);
        return;
      }
      const res = await apiClient.get('/api/opportunities/paid-gigs', {
        params: { view: nextView, offset, limit: 24 },
        timeout: 45000,
      });
      if (id !== reqId.current) return;
      const data = res.data || {};
      setGigs((prev) => (offset ? [...prev, ...(data.gigs || [])] : (data.gigs || [])));
      setStats(data.stats || null);
      setCounts(data.counts || {});
      setAppliedCount(data.applied_count || 0);
      setIsPro(Boolean(data.is_pro));
      setHasMore(Boolean(data.has_more));
    } catch (_) {
      if (id === reqId.current) setError('Paid gigs did not load. Try again in a moment.');
    } finally {
      if (id === reqId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => { load(view, 0); }, [view, load]);

  const upgrade = useCallback(() => setShowUpgrade(true), []);
  const closeSheet = useCallback(() => setOpenGig(null), []);

  const open = (gig) => {
    if (gig.locked) upgrade();
    else setOpenGig(gig);
  };

  const markApplied = useCallback((gigId) => {
    setGigs((prev) => prev.map((g) => (g.id === gigId ? { ...g, already_applied: true } : g)));
    setAppliedCount((n) => n + 1);
  }, []);

  const tabCount = (id) => (id === 'applied' ? appliedCount : counts[id]);
  const newThisWeek = stats?.new_this_week || 0;
  const bannerAt = !isPro && view === 'all' ? Math.min(FREE_PREVIEW, gigs.length) : -1;

  return (
    <Page>
      <Hero>
        <Eyebrow>Paid UGC radar</Eyebrow>
        <h1>Every paid UGC gig, <em>one place</em></h1>
        <p>
          Brands post paid UGC on SideShift, Upwork, Craigslist and more. We scan them all daily,
          so you never miss one. Polly writes your application, you apply on their site.
        </p>
        {stats && (
          <StatRow>
            <Stat><b>{stats.total}</b><span>live paid gigs</span></Stat>
            <Stat><b>{newThisWeek}</b><span>new this week</span></Stat>
            {stats.median_pay_usd ? <Stat><b>{money(stats.median_pay_usd)}</b><span>typical pay</span></Stat> : null}
            {stats.open_pay_usd ? <Stat><b>{money(stats.open_pay_usd)}</b><span>open right now</span></Stat> : null}
          </StatRow>
        )}
      </Hero>

      <Tabs role="tablist" aria-label="Filter paid gigs">
        {VIEWS.map(({ id, label }) => {
          const n = tabCount(id);
          return (
            <TabBtn
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              $active={view === id}
              onClick={() => setView(id)}
            >
              {label}
              {Number.isFinite(n) && n > 0 && <em>{n}</em>}
            </TabBtn>
          );
        })}
      </Tabs>

      {error && (
        <Empty>
          <strong>{error}</strong>
          <GhostBtn type="button" onClick={() => load(view, 0)}>Retry</GhostBtn>
        </Empty>
      )}

      {!error && view === 'applied' && (
        <AppliedList items={applications} loading={loading} onBrowse={() => setView('all')} />
      )}

      {!error && view !== 'applied' && (
        loading ? (
          <Grid>{[0, 1, 2, 3, 4, 5].map((i) => <SkeletonTile key={i} />)}</Grid>
        ) : gigs.length ? (
          <>
            <Grid>
              {gigs.map((gig, i) => (
                <React.Fragment key={gig.id}>
                  {i === bannerAt && <ProBanner stats={stats} onUpgrade={upgrade} />}
                  <GigTile gig={gig} onOpen={open} />
                </React.Fragment>
              ))}
              {bannerAt === gigs.length && <ProBanner stats={stats} onUpgrade={upgrade} />}
            </Grid>
            {hasMore && (
              <More>
                <GhostBtn type="button" onClick={() => load(view, gigs.length)} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Show more gigs'}
                </GhostBtn>
              </More>
            )}
          </>
        ) : (
          <Empty>
            <strong>{view === 'for_you' ? 'No gigs in your niche today.' : 'Nothing here right now.'}</strong>
            <span>New gigs land every day. Check All gigs, most briefs take any niche.</span>
            {view !== 'all' && <GhostBtn type="button" onClick={() => setView('all')}>See all gigs</GhostBtn>}
          </Empty>
        )
      )}

      {openGig && (
        <GigSheet
          gig={openGig}
          onClose={closeSheet}
          onApplied={markApplied}
          onUpgrade={() => { setOpenGig(null); upgrade(); }}
        />
      )}

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} source="paid_gigs" />
    </Page>
  );
}

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
`;
const slideIn = keyframes`
  from { transform: translateX(24px); opacity: 0; }
  to { transform: none; opacity: 1; }
`;
const slideUp = keyframes`
  from { transform: translateY(24px); opacity: 0; }
  to { transform: none; opacity: 1; }
`;
const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const Page = styled.div`
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 16px clamp(16px, 4vw, 32px) 72px;
  box-sizing: border-box;
  font-family: ${t.fontSans};
  color: ${t.ink};
`;

const Hero = styled.header`
  padding: 12px 0 22px;

  h1 {
    font-family: ${t.fontDisplay};
    font-size: clamp(28px, 4.4vw, 44px);
    font-weight: 400;
    letter-spacing: -.03em;
    line-height: 1.08;
    margin: 0;
  }
  h1 em { font-style: italic; color: ${t.accentDeep}; }
  p {
    font-size: clamp(14px, 1.6vw, 16px);
    color: ${t.muted};
    margin: 10px 0 0;
    max-width: 36rem;
    line-height: 1.5;
  }
`;

const Eyebrow = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: ${t.accentDeep};
  margin-bottom: 8px;
`;

const StatRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 112px;
  padding: 12px 16px;
  border-radius: ${t.radiusCard};
  background: ${t.white};
  border: 1px solid ${t.line};

  b { font-size: 22px; font-weight: 700; letter-spacing: -.02em; }
  span { font-size: 12px; color: ${t.muted}; }

  &:first-child b { color: ${t.accentDeep}; }
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 0 18px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const TabBtn = styled.button`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border-radius: ${t.radiusPill};
  border: 1px solid ${(p) => (p.$active ? t.ink : t.line)};
  background: ${(p) => (p.$active ? t.ink : t.white)};
  color: ${(p) => (p.$active ? '#fff' : t.inkSoft)};
  font: 600 13.5px ${t.fontSans};
  cursor: pointer;
  transition: border-color .15s, background .15s;

  em {
    font-style: normal;
    font-size: 11.5px;
    font-weight: 700;
    padding: 1px 7px;
    border-radius: ${t.radiusPill};
    background: ${(p) => (p.$active ? 'rgba(255,255,255,.18)' : t.subtle)};
    color: ${(p) => (p.$active ? '#fff' : t.muted)};
  }

  &:hover { border-color: ${(p) => (p.$active ? t.ink : t.borderHover)}; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 760px) { grid-template-columns: 1fr; }
`;

const Tile = styled.button`
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
  width: 100%;
  padding: 18px;
  border-radius: ${t.radiusCard};
  border: 1px solid ${t.line};
  background: ${t.white};
  font-family: inherit;
  color: inherit;
  cursor: pointer;
  animation: ${fadeUp} .25s ease both;
  transition: box-shadow .18s, border-color .18s, transform .18s;

  &:hover {
    border-color: ${t.borderHover};
    box-shadow: ${t.shadowHover};
    transform: translateY(-1px);
  }
  &:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }

  ${(p) => p.$locked && css`background: ${t.cream};`}
  ${(p) => p.$applied && css`opacity: .72;`}
`;

const TileTop = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
`;

const TileHead = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 2px;
`;

const TileTitle = styled.div`
  font-size: 15.5px;
  font-weight: 700;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const TileSub = styled.div`
  font-size: 13.5px;
  color: ${t.muted};
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Pay = styled.div`
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -.01em;
  color: ${t.accentDeep};
  background: ${t.accentSoft};
  border-radius: 10px;
  padding: 6px 10px;
  white-space: nowrap;
`;

const MarkBox = styled.div`
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 12px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: ${(p) => (p.$ghost ? t.subtle : t.paper)};
  color: ${t.muted};
  font-size: ${(p) => Math.round(p.$size * 0.48)}px;
  border: 1px solid ${t.line};

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const Blur = styled.i`
  display: block;
  width: ${(p) => p.$w};
  height: ${(p) => (p.$thin ? 10 : 14)}px;
  margin-top: ${(p) => (p.$thin ? 4 : 2)}px;
  border-radius: 6px;
  background: linear-gradient(90deg, #e9e5dc, #f2efe8);
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Tag = styled.span`
  font-size: 12px;
  font-weight: 600;
  padding: 4px 9px;
  border-radius: ${t.radiusPill};
  background: ${t.paper};
  color: ${t.inkSoft};
  border: 1px solid ${t.line};
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${(p) => p.$tone === 'new' && css`
    background: #fff1ec; color: ${t.hot}; border-color: #f8cfc2;
  `}
  ${(p) => p.$tone === 'fit' && css`
    background: ${t.accentSoft}; color: ${t.accentDeep}; border-color: ${t.accentBorder};
  `}
`;

const TileFoot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  font-size: 12.5px;
  color: ${t.muted};
`;

const ViewHint = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 700;
  color: ${t.ink};
`;
const UnlockHint = styled(ViewHint)`color: ${t.accentDeep};`;
const AppliedHint = styled(ViewHint)`color: ${t.success};`;

const Banner = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-radius: ${t.radiusCard};
  background: ${t.ink};
  color: #fff;

  div { display: flex; flex-direction: column; gap: 4px; }
  strong { font-size: 16px; }
  span { font-size: 13.5px; color: rgba(255,255,255,.72); line-height: 1.45; }

  @media (max-width: 760px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const BannerCta = styled.button`
  flex-shrink: 0;
  height: 44px;
  padding: 0 18px;
  border-radius: ${t.radiusBtn};
  border: 0;
  background: #fff;
  color: ${t.ink};
  font: 700 14px ${t.fontSans};
  cursor: pointer;
  &:hover { background: ${t.cream}; }
`;

const PrimaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  padding: 0 20px;
  width: 100%;
  border-radius: ${t.radiusBtn};
  border: 0;
  background: ${t.action};
  color: #fff;
  font: 700 15px ${t.fontSans};
  cursor: pointer;
  &:hover:not(:disabled) { background: ${t.actionHover}; }
  &:disabled { opacity: .5; cursor: default; }
`;

const GhostBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border-radius: ${t.radiusBtn};
  border: 1px solid ${t.line};
  background: ${t.white};
  color: ${t.ink};
  font: 600 13.5px ${t.fontSans};
  cursor: pointer;
  white-space: nowrap;
  &:hover:not(:disabled) { border-color: ${t.borderHover}; }
  &:disabled { opacity: .5; cursor: default; }
`;

const More = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  padding: 48px 20px;
  border: 1px dashed ${t.line};
  border-radius: ${t.radiusCard};
  background: ${t.cream};

  strong { font-size: 16px; }
  span { font-size: 14px; color: ${t.muted}; max-width: 26rem; line-height: 1.5; }
  ${PrimaryBtn} { width: auto; margin-top: 6px; }
`;

const SkeletonTile = styled.div`
  height: 168px;
  border-radius: ${t.radiusCard};
  border: 1px solid ${t.line};
  background: linear-gradient(90deg, ${t.white} 0, ${t.paper} 50%, ${t.white} 100%);
  background-size: 800px 100%;
  animation: ${shimmer} 1.3s linear infinite;
`;

const Rows = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${t.line};
  border-radius: ${t.radiusCard};
  background: ${t.white};
  overflow: hidden;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  & + & { border-top: 1px solid ${t.line}; }

  @media (max-width: 560px) {
    grid-template-columns: auto minmax(0, 1fr) auto;
    & > :nth-child(3) { display: none; }
  }
`;

const RowMain = styled.div`min-width: 0;`;
const RowPay = styled.div`font-weight: 700; color: ${t.accentDeep};`;

const Status = styled.span`
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: ${t.radiusPill};
  ${(p) => (p.$tone === 'ok'
    ? css`background: ${t.successLight}; color: ${t.success};`
    : p.$tone === 'wait'
      ? css`background: #fff7ed; color: #c2410c;`
      : css`background: ${t.subtle}; color: ${t.muted};`)}
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(18, 20, 26, .38);
  display: flex;
  justify-content: flex-end;

  @media (max-width: 640px) { align-items: flex-end; }
`;

const Sheet = styled.div`
  width: min(520px, 100%);
  height: 100%;
  overflow-y: auto;
  background: ${t.cream};
  box-shadow: -12px 0 40px rgba(18,20,26,.18);
  padding: 22px 22px 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${slideIn} .22s ease both;

  @media (max-width: 640px) {
    height: auto;
    max-height: 92vh;
    border-radius: 20px 20px 0 0;
    animation: ${slideUp} .22s ease both;
  }
`;

const SheetHead = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;
`;

const SheetTitle = styled.h2`
  font-size: 19px;
  font-weight: 700;
  line-height: 1.3;
  margin: 2px 0 4px;
`;

const CloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${t.line};
  background: ${t.white};
  display: grid;
  place-items: center;
  cursor: pointer;
  color: ${t.ink};
`;

const SheetPay = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  b { font-size: 28px; letter-spacing: -.02em; color: ${t.accentDeep}; }
  span { font-size: 13px; color: ${t.muted}; }
`;

const Brief = styled.p`
  margin: 0;
  font-size: 14.5px;
  line-height: 1.6;
  color: ${t.inkSoft};
  white-space: pre-line;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: ${t.radiusCard};
  background: ${t.white};
  border: 1px solid ${t.line};
`;

const SectionHead = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  h3 { margin: 0; font-size: 15px; }
  p { margin: 3px 0 0; font-size: 12.5px; color: ${t.muted}; }
`;

const Draft = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid ${t.line};
  border-radius: ${t.radiusInput};
  padding: 12px;
  font: 14px/1.55 ${t.fontSans};
  color: ${t.ink};
  background: ${t.paper};
  resize: vertical;
  &:focus { outline: 2px solid ${t.accentBorder}; border-color: ${t.accent}; }
`;

const DraftSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 6px 0;
  i {
    display: block;
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(90deg, ${t.paper} 0, ${t.subtle} 50%, ${t.paper} 100%);
    background-size: 800px 100%;
    animation: ${shimmer} 1.3s linear infinite;
  }
  i:nth-child(2) { width: 92%; }
  i:nth-child(3) { width: 80%; }
  i:nth-child(4) { width: 55%; }
`;

const ErrorNote = styled.div`
  font-size: 13.5px;
  color: #b42318;
  background: #fef3f2;
  border: 1px solid #fecdca;
  border-radius: ${t.radiusBtn};
  padding: 10px 12px;
`;

const SheetFoot = styled.div`
  position: sticky;
  bottom: 0;
  margin: auto -22px 0;
  padding: 14px 22px 18px;
  background: ${t.cream};
  border-top: 1px solid ${t.line};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FootNote = styled.div`
  font-size: 12px;
  color: ${t.muted};
  text-align: center;
`;

const Confirm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  strong { font-size: 15px; }
  span { font-size: 13px; color: ${t.muted}; }
`;

const ConfirmRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  margin-top: 8px;
  ${GhostBtn} { height: 48px; }
`;

const Done = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: ${t.success};
  div { display: flex; flex-direction: column; gap: 2px; color: ${t.ink}; }
  strong { font-size: 15px; }
  span { font-size: 13px; color: ${t.muted}; }
`;
