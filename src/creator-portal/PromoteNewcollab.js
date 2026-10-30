// Promote Newcollab: creators apply, we approve, then they post about Newcollab and earn per 1,000 views.
// API: GET /api/promote, POST /api/promote/apply | /videos | /payout (services/ugc_program on the backend).
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Copy, Eye, Link2, Megaphone, Send, Smartphone, Wallet } from 'lucide-react';
import { AutoTikTok, EXAMPLES, EarningsSlider, HeroStack, VideoWall } from './PromoteVisuals';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';

const money = (cents) => {
  const c = Number(cents) || 0;
  return c % 100 === 0 ? `$${(c / 100).toLocaleString()}` : `$${(c / 100).toFixed(2)}`;
};
const num = (n) => (Number(n) || 0).toLocaleString();
const shortDate = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '');

const HOOKS = [
  {
    title: 'The free PR box', example: EXAMPLES[0],
    hook: '"I get free PR boxes with under 5K followers. Here\'s the app I use."',
    show: 'Open Newcollab, scroll the open gift lists, tap Join the list. Cut to a box you received (any brand).',
    close: '"It\'s free to start. Link in my bio."',
  },
  {
    title: 'Stop waiting for brands', example: EXAMPLES[2],
    hook: '"Stop waiting for brands to DM you. Do this instead."',
    show: 'Show Polly writing a pitch to a brand in your niche and sending it from your Gmail. Keep it under 10 seconds.',
    close: '"Polly pitches brands for me every weekday. Link in bio."',
  },
  {
    title: 'Paid UGC, one place', example: EXAMPLES[4],
    hook: '"Where I find paid UGC gigs without scrolling 10 sites."',
    show: 'Screen-record the Paid UGC board. Tap a gig, show Polly writing the application.',
    close: '"New gigs every day. It\'s called Newcollab, link in bio."',
  },
];

const RULES_DO = [
  'Say "Newcollab" out loud or on screen',
  'Put your referral link in your bio or caption',
  'Turn on TikTok\'s Paid partnership label, or add #ad',
  'Keep it public, original and at least 15 seconds',
  'Show the app on screen (a screen recording is perfect)',
];
const RULES_DONT = [
  'Promise free products or income. Brands choose who they gift.',
  'Buy views, use bots or engagement groups',
  'Repost someone else\'s video',
  'Post before you were approved (those don\'t count)',
];

export default function PromoteNewcollab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const { data: d } = await apiClient.get('/api/promote');
      if (!d?.success) throw new Error(d?.error || 'Could not load');
      setData(d);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Could not load');
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  const post = async (path, body, okText) => {
    setBusy(true);
    try {
      const { data: d } = await apiClient.post(`/api/promote/${path}`, body);
      if (!d?.success) throw new Error(d?.error || 'That didn\'t work');
      setData(d);
      if (okText) setToast(okText);
      return true;
    } catch (err) {
      setToast(err.response?.data?.error || err.message || 'That didn\'t work');
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (error && !data) return <Page><Note>{error}</Note></Page>;
  if (!data) return <Page><Note>Loading…</Note></Page>;

  const p = data.program || {};
  const m = data.member;
  const approved = m && (m.status === 'approved' || m.status === 'paused');

  return (
    <Page>
      {toast && <Toast role="status">{toast}</Toast>}
      {approved ? (
        <Hero>
          <Eyebrow><Megaphone size={14} /> Promote Newcollab</Eyebrow>
          <h1>Your <em>earnings</em></h1>
          <p>{money(p.cpm_cents)} per 1,000 views, up to {money(p.video_cap_cents)} a video. Views update every day.</p>
          {!p.open && <Closed>This round's budget is used up. We'll email you when the next one opens.</Closed>}
        </Hero>
      ) : (
        <>
          <Splash>
            <div className="copy">
              <Pill><span className="dot" /> New · Newcollab pays creators</Pill>
              <h1>Post about Newcollab. <em>Get paid per view.</em></h1>
              <p>
                <b>{money(p.cpm_cents)} for every 1,000 views</b> on your TikTok or Reel. No follower minimum, no
                brand to wait on. Post, paste the link, watch it add up.
              </p>
              <div className="ctas">
                <Primary as="a" href="#apply">{m ? 'See my application' : 'Start earning'} <ArrowRight size={16} /></Primary>
                <span className="left">{money(p.budget_left_cents)} left this round</span>
              </div>
              {!p.open && <Closed>This round's budget is used up. We'll email you when the next one opens.</Closed>}
            </div>
            <HeroStack cpmCents={p.cpm_cents} />
          </Splash>

          <Duo>
            <EarningsSlider cpmCents={p.cpm_cents} capCents={p.video_cap_cents} minViews={p.min_views} />
            <Steps>
              <li><span className="ic"><Send size={18} /></span><div><b>Apply in 30 seconds</b><span>Your TikTok and where to send your money.</span></div></li>
              <li><span className="ic"><Smartphone size={18} /></span><div><b>Post one video</b><span>Use a hook from the brief. Screen-record the app, add your link.</span></div></li>
              <li><span className="ic"><Wallet size={18} /></span><div><b>Get paid</b><span>Views lock after 30 days, then we pay you by PayPal or Wise.</span></div></li>
            </Steps>
          </Duo>
        </>
      )}

      {!m && <ApplyCard program={p} busy={busy} onApply={(body) => post('apply', body, 'Application sent. We review within 48 hours.')} />}
      {!approved && (
        <section>
          <SectionHead><h2>Videos that work</h2><span>Talk to camera, show your phone, keep it real.</span></SectionHead>
          <VideoWall />
        </section>
      )}
      {m && m.status === 'applied' && (
        <Card>
          <h2>Application received</h2>
          <p className="muted">We review applications within 48 hours and email you when you're in. Your brief and earnings dashboard unlock here.</p>
        </Card>
      )}
      {m && m.status === 'rejected' && (
        <>
          <Card>
            <h2>Not this round</h2>
            <p className="muted">{m.note || 'We picked a small group for this round. You can apply again below.'}</p>
          </Card>
          <ApplyCard program={p} member={m} busy={busy} onApply={(body) => post('apply', body, 'Application sent.')} />
        </>
      )}
      {approved && <Dashboard data={data} busy={busy} post={post} />}
      {approved && <Brief program={p} />}
      {!approved && <Brief program={p} preview />}
    </Page>
  );
}

function ApplyCard({ program, member, busy, onApply }) {
  const [form, setForm] = useState({
    tiktok_handle: member?.tiktok_handle || '', instagram_handle: member?.instagram_handle || '',
    payout_method: member?.payout_method || 'paypal', payout_handle: member?.payout_handle || '',
  });
  const [ig, setIg] = useState(Boolean(member?.instagram_handle));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <Card as="form" id="apply" className="apply" onSubmit={(e) => { e.preventDefault(); onApply(form); }}>
      <div className="head">
        <h2>Apply in 30 seconds</h2>
        <span className="muted">We review within 48 hours.</span>
      </div>
      <Grid2>
        <label>Your TikTok<input value={form.tiktok_handle} onChange={set('tiktok_handle')} placeholder="@yourhandle" autoComplete="off" /></label>
        <label>
          <span className="payrow">
            Pay me by
            <select value={form.payout_method} onChange={set('payout_method')} aria-label="Payout method">
              <option value="paypal">PayPal</option>
              <option value="wise">Wise</option>
            </select>
          </span>
          <input type="email" value={form.payout_handle} onChange={set('payout_handle')} placeholder="you@email.com" />
        </label>
      </Grid2>
      {ig ? (
        <label>Instagram <em>(optional, for Reels)</em><input value={form.instagram_handle} onChange={set('instagram_handle')} placeholder="@yourhandle" /></label>
      ) : (
        <button type="button" className="link" onClick={() => setIg(true)}>+ I post Reels too</button>
      )}
      <Primary type="submit" disabled={busy || !program.open}>{busy ? 'Sending…' : 'Apply now'} {!busy && <ArrowRight size={16} />}</Primary>
    </Card>
  );
}

function statusChip(v) {
  if (v.status === 'paid') return { tone: 'ok', label: `Paid ${money(v.paid_cents)}` };
  if (v.status === 'ready') return { tone: 'ok', label: 'Ready to pay' };
  if (v.status === 'flagged') return { tone: 'warn', label: 'Under review' };
  if (v.status === 'rejected') return { tone: 'bad', label: 'Not eligible' };
  return { tone: 'live', label: 'Counting views' };
}

const CAP_NOTE = {
  video: 'Hit the per-video max',
  month: 'Hit your $150 monthly max',
  budget: 'Round budget used up',
  min_views: 'Pays from 2,000 views',
};

function Dashboard({ data, busy, post }) {
  const { member, totals, videos, referrals, program } = data;
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [editPay, setEditPay] = useState(false);
  const [pay, setPay] = useState({ payout_method: member.payout_method || 'paypal', payout_handle: member.payout_handle || '' });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(member.ref_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked: the link stays visible to copy by hand */ }
  };

  return (
    <>
      <Card>
        <Earn>
          <div><span>Earned</span><b>{money(totals.earned_cents)}</b></div>
          <div><span>Paid</span><b>{money(totals.paid_cents)}</b></div>
          <div><span>Views</span><b>{num(totals.views)}</b></div>
          <div><span>Left this month</span><b>{money(totals.month_left_cents)}</b></div>
        </Earn>
        <Small>
          Views update once a day. Earnings lock 30 days after you post, then we pay you by {member.payout_method === 'wise' ? 'Wise' : 'PayPal'} ({member.payout_handle}).{' '}
          <button type="button" className="link" onClick={() => setEditPay((x) => !x)}>Change</button>
        </Small>
        {editPay && (
          <Grid2 as="form" onSubmit={async (e) => { e.preventDefault(); if (await post('payout', pay, 'Payout details saved')) setEditPay(false); }}>
            <select value={pay.payout_method} onChange={(e) => setPay((x) => ({ ...x, payout_method: e.target.value }))}>
              <option value="paypal">PayPal</option>
              <option value="wise">Wise</option>
            </select>
            <Row>
              <input type="email" value={pay.payout_handle} onChange={(e) => setPay((x) => ({ ...x, payout_handle: e.target.value }))} />
              <Secondary type="submit" disabled={busy}>Save</Secondary>
            </Row>
          </Grid2>
        )}
      </Card>

      <Card>
        <h2>Your referral link</h2>
        <p className="muted">
          Put it in your bio or caption. Every creator who signs up through it is tracked to you, and you earn
          {' '}{money(program.pro_bonus_cents)} when they stay on Pro past their first month.
        </p>
        <Row>
          <LinkBox><Link2 size={15} /><span>{member.ref_link}</span></LinkBox>
          <Secondary type="button" onClick={copy}>{copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy</>}</Secondary>
        </Row>
        <Small>{num(referrals.signups)} {referrals.signups === 1 ? 'signup' : 'signups'} · {num(referrals.pro_bonuses)} Pro {referrals.pro_bonuses === 1 ? 'bonus' : 'bonuses'}</Small>
      </Card>

      <Card>
        <h2>Submit a video</h2>
        <p className="muted">Post first, then paste the link. Only videos posted after you were approved count.</p>
        <Row as="form" onSubmit={async (e) => { e.preventDefault(); if (await post('videos', { url }, 'Video added. Views show up within a day.')) setUrl(''); }}>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.tiktok.com/@you/video/… or instagram.com/reel/…" aria-label="Video link" />
          <Primary type="submit" disabled={busy || !url.trim() || member.status !== 'approved' || !program.open}>{busy ? 'Adding…' : 'Add video'}</Primary>
        </Row>
        {member.status === 'paused' && <Small>Your account is paused. Reach out to team@newcollab.co.</Small>}

        {videos.length === 0 ? (
          <Empty>No videos yet. Pick a hook from the brief below and post your first one.</Empty>
        ) : (
          <Videos>
            {videos.map((v) => {
              const chip = statusChip(v);
              return (
                <li key={v.id}>
                  <div className="top">
                    <a href={v.url} target="_blank" rel="noopener noreferrer">
                      {v.platform === 'tiktok' ? 'TikTok' : 'Reel'} · {shortDate(v.posted_at || v.submitted_at)} <ArrowUpRight size={13} />
                    </a>
                    <Chip $tone={chip.tone}>{chip.label}</Chip>
                  </div>
                  <div className="nums">
                    <span><Eye size={14} /> {num(v.views)} views</span>
                    <b>{money(v.earned_cents)}</b>
                  </div>
                  <div className="meta">
                    {v.status === 'counting' && v.pays_on ? `Locks ${shortDate(v.pays_on)}` : ''}
                    {v.capped_by && CAP_NOTE[v.capped_by] ? `${v.status === 'counting' && v.pays_on ? ' · ' : ''}${CAP_NOTE[v.capped_by]}` : ''}
                    {v.note ? ` ${v.note}` : ''}
                    {!v.views_at && v.status === 'counting' ? 'Views show up within a day' : ''}
                  </div>
                </li>
              );
            })}
          </Videos>
        )}
      </Card>
    </>
  );
}

function Brief({ program, preview }) {
  const [open, setOpen] = useState(!preview);
  return (
    <Card>
      <BriefHead type="button" onClick={() => setOpen((x) => !x)} aria-expanded={open}>
        <h2>{preview ? 'What you\'d post' : 'Your brief'}</h2>
        <ChevronDown size={18} style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </BriefHead>
      {open && (
        <BriefBody>
          <h3>What Newcollab is</h3>
          <p>
            Newcollab helps small creators get gifted PR boxes and paid UGC work. Creators join brands' open gift
            lists, Polly (our assistant) writes and sends brand pitches from their own Gmail, and the Paid UGC board
            collects paid gigs from across the web every day. It's free to start; Pro unlocks more.
          </p>
          <h3>Who it's for</h3>
          <p>Creators of any size who want free products, brand deals or paid UGC, especially if brands don't DM them yet.</p>

          <h3>3 hooks that work</h3>
          <p className="muted">The videos show the style (talk to camera, phone in hand). Your video is about Newcollab.</p>
          <Hooks>
            {HOOKS.map((h) => (
              <li key={h.title}>
                <div className="txt">
                  <b>{h.title}</b>
                  <p><span>Hook</span>{h.hook}</p>
                  <p><span>Show</span>{h.show}</p>
                  <p><span>Close</span>{h.close}</p>
                </div>
                {h.example && <AutoTikTok {...h.example} tag="Style example" radius={14} className="vid" />}
              </li>
            ))}
          </Hooks>

          <Rules>
            <div>
              <h3>Do</h3>
              <ul>{RULES_DO.map((r) => <li key={r}><Check size={14} /> {r}</li>)}</ul>
            </div>
            <div>
              <h3>Don't</h3>
              <ul>{RULES_DONT.map((r) => <li key={r}>✕ {r}</li>)}</ul>
            </div>
          </Rules>

          <h3>How pay works</h3>
          <ul className="plain">
            <li>{money(program.cpm_cents)} per 1,000 views, once a video passes {(program.min_views || 2000).toLocaleString()} views.</li>
            <li>Up to {money(program.video_cap_cents)} per video and {money(program.creator_month_cap_cents)} per month.</li>
            <li>Views count for 30 days after you post, then lock. We pay within a week of that by PayPal or Wise.</li>
            <li>{money(program.pro_bonus_cents)} extra for every creator who signs up with your link and stays on Pro past their first month.</li>
            <li>Videos with suspicious views (big views, almost no likes) are reviewed before we pay.</li>
          </ul>
        </BriefBody>
      )}
    </Card>
  );
}

const Page = styled.div`
  max-width: 980px;
  margin: 0 auto;
  padding: 24px 16px 64px;
  color: ${t.ink};
  display: grid;
  grid-template-columns: minmax(0, 1fr);  /* the video wall is wider than the page: never let it widen the grid */
  gap: 16px;
  > * { min-width: 0; }
`;
const Note = styled.p`color: ${t.muted};`;
const Hero = styled.section`
  h1 { font-size: clamp(26px, 5vw, 36px); margin: 8px 0 10px; line-height: 1.15; letter-spacing: -0.02em; }
  h1 em { font-style: italic; color: ${t.accent}; }
  p { margin: 0; color: ${t.muted}; line-height: 1.55; max-width: 620px; }
  p b { color: ${t.ink}; }
`;
const Eyebrow = styled.div`
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: ${t.accent};
`;
const Stats = styled.div`
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 18px;
  @media (max-width: 560px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;
const Stat = styled.div`
  background: ${t.white}; border: 1px solid ${t.line}; border-radius: 14px; padding: 12px 14px;
  b { display: block; font-size: 20px; }
  span { font-size: 12.5px; color: ${t.muted}; }
`;
const Closed = styled.div`
  margin-top: 12px; padding: 10px 14px; border-radius: 12px; background: #fff4e5; color: #8a4b00; font-size: 14px;
`;
const Card = styled.section`
  background: ${t.white}; border: 1px solid ${t.line}; border-radius: 18px; padding: 20px;
  display: grid; gap: 12px; min-width: 0; scroll-margin-top: 90px;
  h2 { margin: 0; font-size: 18px; }
  &.apply { border: 2px solid ${t.ink}; box-shadow: 0 16px 40px rgba(18, 20, 26, 0.08); }
  .head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap; }
  .payrow { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .payrow select { width: auto; padding: 2px 6px; font-size: 13px; background: none; border: 0; font-weight: 700; }
  .link { justify-self: start; border: 0; background: none; padding: 0; font: inherit; font-size: 14px; color: ${t.inkSoft}; text-decoration: underline; cursor: pointer; }
  .muted { margin: 0; color: ${t.muted}; font-size: 14.5px; line-height: 1.5; }
  label { display: grid; gap: 6px; font-size: 13px; font-weight: 600; color: ${t.inkSoft}; }
  label em { font-weight: 400; color: ${t.muted}; font-style: normal; }
  input, textarea, select {
    font: inherit; font-size: 15px; width: 100%; box-sizing: border-box; min-width: 0;
    border: 1px solid ${t.line}; border-radius: 10px; padding: 10px 12px; background: ${t.cream}; color: ${t.ink};
  }
  @media (max-width: 480px) { padding: 16px; }
`;
const Grid2 = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;
const Row = styled.div`
  display: flex; gap: 8px; align-items: center; min-width: 0;
  input { flex: 1; }
  @media (max-width: 480px) { flex-wrap: wrap; > button { width: 100%; justify-content: center; } }
`;
const Primary = styled.button`
  border: 0; border-radius: 12px; padding: 11px 18px; background: ${t.action}; color: #fff; font: inherit;
  font-weight: 700; cursor: pointer; white-space: nowrap; justify-self: start;
  &:disabled { opacity: 0.45; cursor: default; }
`;
const Secondary = styled.button`
  display: inline-flex; align-items: center; gap: 6px; border: 1px solid ${t.line}; border-radius: 12px;
  padding: 10px 14px; background: ${t.white}; font: inherit; font-weight: 600; cursor: pointer; white-space: nowrap;
`;
const LinkBox = styled.div`
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 10px;
  background: ${t.accentSoft}; color: ${t.accentDeep}; font-size: 14px;
  span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;
const Small = styled.p`
  margin: 0; font-size: 13px; color: ${t.muted};
  .link { border: 0; background: none; padding: 0; font: inherit; color: ${t.ink}; text-decoration: underline; cursor: pointer; }
`;
const Earn = styled.div`
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px;
  div { background: ${t.paper}; border-radius: 12px; padding: 12px; min-width: 0; }
  span { display: block; font-size: 12.5px; color: ${t.muted}; }
  b { font-size: 22px; }
  @media (max-width: 560px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;
const Empty = styled.p`margin: 4px 0 0; padding: 14px; border-radius: 12px; background: ${t.paper}; color: ${t.muted}; font-size: 14px;`;
const Videos = styled.ul`
  list-style: none; margin: 4px 0 0; padding: 0; display: grid; gap: 8px;
  li { border: 1px solid ${t.line}; border-radius: 12px; padding: 12px 14px; display: grid; gap: 6px; }
  .top, .nums { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  a { display: inline-flex; align-items: center; gap: 4px; color: ${t.ink}; font-weight: 600; text-decoration: none; }
  .nums span { display: inline-flex; align-items: center; gap: 6px; color: ${t.muted}; font-size: 14px; }
  .nums b { font-size: 18px; }
  .meta { font-size: 12.5px; color: ${t.muted}; }
  .meta:empty { display: none; }
`;
const TONES = {
  live: ['#eef6f3', '#095a46'], ok: ['#e8f7ee', '#0a6b3d'], warn: ['#fff4e5', '#8a4b00'], bad: ['#fdecec', '#9b1c1c'],
};
const Chip = styled.span`
  font-size: 12px; font-weight: 700; padding: 3px 9px; border-radius: 999px; white-space: nowrap;
  background: ${(p) => TONES[p.$tone][0]}; color: ${(p) => TONES[p.$tone][1]};
`;
const BriefHead = styled.button`
  display: flex; justify-content: space-between; align-items: center; border: 0; background: none; padding: 0;
  font: inherit; color: inherit; cursor: pointer; text-align: left;
`;
const BriefBody = styled.div`
  display: grid; gap: 8px; font-size: 14.5px; line-height: 1.55;
  h3 { margin: 10px 0 0; font-size: 15px; }
  p { margin: 0; color: ${t.inkSoft}; }
  ul.plain { margin: 0; padding-left: 18px; color: ${t.inkSoft}; display: grid; gap: 4px; }
`;
const Hooks = styled.ol`
  list-style: none; margin: 0; padding: 0; display: grid; gap: 10px;
  li {
    background: ${t.paper}; border-radius: 14px; padding: 12px; display: grid; gap: 14px;
    grid-template-columns: minmax(0, 1fr) 128px; align-items: center;
  }
  .txt { display: grid; gap: 4px; min-width: 0; }
  @media (max-width: 480px) { li { grid-template-columns: minmax(0, 1fr) 96px; gap: 10px; } }
  li b { font-size: 14.5px; }
  li p { font-size: 14px; }
  li p span {
    display: inline-block; min-width: 44px; margin-right: 6px; font-size: 11px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.05em; color: ${t.accent};
  }
`;
const Rules = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  ul { list-style: none; margin: 6px 0 0; padding: 0; display: grid; gap: 6px; color: ${t.inkSoft}; }
  li { display: flex; gap: 6px; align-items: flex-start; }
  li svg { flex-shrink: 0; margin-top: 3px; color: ${t.accent}; }
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;
const Toast = styled.div`
  position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 50; max-width: calc(100% - 32px);
  background: ${t.ink}; color: #fff; padding: 10px 16px; border-radius: 12px; font-size: 14px;
`;

const Splash = styled.section`
  display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 24px; align-items: center;
  padding: 8px 0 4px;
  .copy { display: grid; gap: 14px; min-width: 0; }
  h1 { margin: 0; font-size: clamp(32px, 5.6vw, 52px); line-height: 1.02; letter-spacing: -0.03em; font-weight: 800; }
  h1 em { font-style: normal; color: ${t.accent}; }
  p { margin: 0; color: ${t.muted}; font-size: 16.5px; line-height: 1.55; }
  p b { color: ${t.ink}; }
  .ctas { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .ctas a { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; padding: 14px 22px; font-size: 16px; }
  .left { font-size: 13.5px; color: ${t.muted}; }
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`;
const Pill = styled.span`
  justify-self: start; display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px;
  background: ${t.accentSoft}; color: ${t.accentDeep}; font-size: 12.5px; font-weight: 700;
  .dot { width: 7px; height: 7px; border-radius: 50%; background: ${t.accent}; }
`;
const Duo = styled.section`
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px;
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`;
const Steps = styled.ol`
  list-style: none; margin: 0; padding: 18px; display: grid; gap: 14px; align-content: center;
  background: ${t.white}; border: 1px solid ${t.line}; border-radius: 22px;
  li { display: flex; gap: 12px; align-items: flex-start; }
  .ic { width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; flex-shrink: 0;
    background: ${t.accentSoft}; color: ${t.accentDeep}; }
  div { display: grid; gap: 2px; }
  b { font-size: 15.5px; }
  div span { font-size: 13.5px; color: ${t.muted}; line-height: 1.45; }
`;
const SectionHead = styled.div`
  display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap; margin: 8px 0 12px;
  h2 { margin: 0; font-size: 20px; }
  span { font-size: 14px; color: ${t.muted}; }
`;
