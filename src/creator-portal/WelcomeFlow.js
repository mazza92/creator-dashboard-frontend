import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Copy, Info, Lock, Pencil, ShieldCheck, Zap } from 'lucide-react';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';
import { BrandLogo, MONO_COLORS, matchPill, nicheText } from './PollyFirstRun';
import { PitchWriting } from '../components/creator/DirectPitch';

/**
 * Welcome flow for newly approved creators (start journey v2, Nov 2026): one full-screen, focused flow, never the
 * Polly chat, until they've chosen how to start.
 *
 *   matches  "We found N brands that fit your travel content"  (list rows: logo, name, signal, tags)
 *   pitch    their personalized pitch to the top match          (Edit, Copy pitch)
 *   goal     their UGC plan (optional): goal, rate per video, the outreach it takes
 *   choose   "Let Polly handle the outreach" (7 days free) or "I'll pitch manually" (3 free pitches)
 *
 * Manual path, still in the flow:  pick 3 brands -> review & copy each pitch -> track (mark sent) -> upgrade.
 * Choosing manual is recorded (start-choice 'free'): from then on every paywall is the $19 plan, not the free week.
 * Only "I'll keep pitching manually" (or the close button) goes back to Polly's chat.
 *
 * Profile still being verified (data.verified === false): same flow, outreach locked. They read and edit their
 * pitch but can't copy or send it; "I'll pitch manually" opens the verify step (what the review checks) with
 * "Skip the wait" (Pro at $19/mo: no free week while unverified)
 *
 * Back after verification (data.back_verified): they explored while being verified, so they've seen the matches
 * and their pitch. The flow opens on "You're verified" and goes straight to how to start. or "Explore my brands meanwhile" back to Polly.
 */

const STEPS = ['matches', 'pitch', 'goal', 'choose'];
const MANUAL = ['pick', 'review', 'track', 'done'];
const SHOWN = 6; // fills a phone screen; "Show +N more brands" opens the rest
// UGC creators sell content production, not reach: goals and the rate per video are plain UGC numbers, never
// derived from follower count. The creator's own goal (set at signup) is preselected; the step shows the plan
// that reaches it.
const GOAL_TIERS = [
  { id: 't200', amount_cents: 20000, label: 'Get started' },
  { id: 't400', amount_cents: 40000, label: 'Build momentum' },
  { id: 't1000', amount_cents: 100000, label: 'Grow your UGC business' },
];
const DEFAULT_RATE = 100;

function money(cents) {
  return `$${Math.round((cents || 0) / 100).toLocaleString('en-US')}`;
}

export function outreachPlan(goalCents, rateDollars, replyRate = 0.08, dealRate = 0.35) {
  const rate = Math.max(1, Number(rateDollars) || 0);
  const deals = Math.max(1, Math.ceil((goalCents / 100) / rate));
  const pitches = Math.ceil(deals / Math.max(0.001, replyRate * dealRate));
  const perWeek = Math.max(1, Math.round(pitches / 4.3));
  const perDay = Math.max(1, Math.ceil(perWeek / 5));
  return { deals, pitches, perWeek, perDay };
}

async function draftPitch(brandId) {
  const { data } = await apiClient.post('/api/polly/pitch/draft', { brand_id: brandId, source: 'welcome' });
  if (data?.pitch) return { status: 'ready', subject: data.pitch.subject || '', body: data.pitch.body || '', email: data.pitch.email || '', mailto: data.pitch.mailto || '' };
  if (data?.verification_locked) return { status: 'error', message: 'More pitches unlock once your profile is verified.' };
  return { status: data?.paywall ? 'paywall' : 'error', message: String(data?.message || '').replace(/\*\*/g, '') };
}

function BrandRow({ brand, index, right = null, onClick, detail = '', expanded }) {
  const [icon, label] = brand.searched ? ['🔎', 'Your pick'] : matchPill(brand);
  const tags = (brand.tags || []).join(' • ');
  const Tag = onClick ? RowButton : RowStatic;
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick}
      aria-expanded={expanded === undefined ? undefined : expanded}>
      <BrandLogo brand={brand} color={MONO_COLORS[index % MONO_COLORS.length]} size={52} />
      <span className="tx">
        <b>{brand.brand_name}</b>
        <span className="pill"><span aria-hidden="true">{icon}</span> {label}</span>
        {tags ? <span className="tags">{tags}</span> : null}
        {detail ? <span className="about">{detail}</span> : null}
      </span>
      {right}
    </Tag>
  );
}

// Matches step: a tap opens the brand's quick description (what they sell, why they fit). Rows with nothing more to
// say get no arrow, so nothing looks tappable that isn't.
function MatchRow({ brand, index, open, onToggle }) {
  const about = String(brand.about || brand.why || '').trim();
  if (!about) return <BrandRow brand={brand} index={index} />;
  return (
    <BrandRow brand={brand} index={index} onClick={onToggle} expanded={open} detail={open ? about : ''}
      right={<ChevronDown size={18} className={open ? 'chev open' : 'chev'} aria-hidden="true" />} />
  );
}

export default function WelcomeFlow({ data, onTrial, onClose }) {
  const brands = data?.brands || [];
  const lead = brands[0];
  const niche = nicheText(data?.niches);
  const total = Number(data?.planned_total) || brands.length;
  const freeLeft = Math.max(1, Math.min(3, Number(data?.free_left) || 3));
  const unverified = data?.verified === false;
  const backVerified = Boolean(data?.back_verified) && !unverified;
  const resume = backVerified ? 'verified'
    : data?.start_pick === 'free' && !unverified ? 'pick' : data?.start_pick ? 'choose' : 'matches';
  const [step, setStep] = useState(resume);
  const [more, setMore] = useState(false);
  const [openBrand, setOpenBrand] = useState(null);
  const [pitches, setPitches] = useState({});
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState('');
  const [goal, setGoal] = useState(null); // {options, pick, rate, reply, deal}
  const [saving, setSaving] = useState(false);
  const [picked, setPicked] = useState(lead ? [lead.brand_id] : []);
  const [at, setAt] = useState(0);
  const [review, setReview] = useState(null); // GET /api/creator/verification, on the verify step
  const [sent, setSent] = useState({});
  // Manual path: brands they look up in the directory themselves (not in their matches), added inline.
  const [extra, setExtra] = useState([]);
  const [q, setQ] = useState('');
  const [found, setFound] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef(null);
  const top = useRef(null);

  useEffect(() => { if (top.current) top.current.scrollTop = 0; setEditing(false); }, [step, at]);

  const pitchFor = async (brand) => {
    if (!brand || pitches[brand.brand_id]?.status === 'ready' || pitches[brand.brand_id]?.status === 'writing') return;
    setPitches((p) => ({ ...p, [brand.brand_id]: { status: 'writing' } }));
    let out;
    try { out = await draftPitch(brand.brand_id); } catch (_) { out = { status: 'error', message: 'Could not write this pitch. Try again.' }; }
    setPitches((p) => ({ ...p, [brand.brand_id]: out }));
  };

  useEffect(() => { if (step === 'pitch') pitchFor(lead); }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (step !== 'goal' || goal) return;
    apiClient.get('/api/tracker/goal/suggest').then(({ data: res }) => {
      const m = (res?.options || [])[0]?.math || {};
      const current = Number(res?.current?.amount_cents) || 0;
      const options = GOAL_TIERS.some((o) => o.amount_cents === current) || !current
        ? GOAL_TIERS : [{ id: 'mine', amount_cents: current, label: 'Your goal' }, ...GOAL_TIERS];
      const pick = (options.find((o) => o.amount_cents === current) || options.find((o) => o.id === 't400')).id;
      setGoal({ options, pick, initial: pick, rate: DEFAULT_RATE, reply: m.reply_rate || 0.08, deal: m.deal_rate || 0.35 });
    }).catch(() => setGoal({ options: GOAL_TIERS, pick: 't400', initial: null, rate: DEFAULT_RATE, reply: 0.08, deal: 0.35 }));
  }, [step, goal]);

  const allBrands = [...brands, ...extra.filter((e) => !brands.some((b) => b.brand_id === e.brand_id))];
  const selectedBrands = picked.map((id) => allBrands.find((b) => b.brand_id === id)).filter(Boolean);

  const search = (value) => {
    setQ(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (value.trim().length < 2) { setFound([]); setSearching(false); return; }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const { data: res } = await apiClient.get('/api/pr-crm/brands/search-suggestions', { params: { q: value.trim() } });
        setFound((res?.suggestions || []).slice(0, 6).map((x) => ({
          brand_id: Number(x.id), brand_name: x.name, logo: x.logo, category: x.category,
          tags: x.category ? [String(x.category).replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())] : [],
          searched: true,
        })).filter((x) => x.brand_id));
      } catch (_) { setFound([]); }
      setSearching(false);
    }, 200);
  };
  useEffect(() => {
    if (step !== 'review') return;
    selectedBrands.forEach((b) => pitchFor(b));
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const editPitch = (brandId, patch) => setPitches((p) => ({ ...p, [brandId]: { ...p[brandId], ...patch } }));

  const copy = async (brand, logHandoff) => {
    const p = pitches[brand.brand_id];
    if (!p || p.status !== 'ready') return;
    const text = `${p.email ? `To: ${p.email}\n` : ''}Subject: ${p.subject}\n\n${p.body}`;
    try { await navigator.clipboard.writeText(text); } catch (_) { /* clipboard blocked: the text is on screen */ }
    setCopied(String(brand.brand_id));
    setTimeout(() => setCopied(''), 1800);
    if (logHandoff) {
      apiClient.post('/api/polly/pitch/handoff', { method: 'copy_pitch', brand_id: brand.brand_id, brand_name: brand.brand_name }).catch(() => {});
    }
  };

  useEffect(() => {
    if (step !== 'verify' || review) return;
    apiClient.get('/api/creator/verification').then(({ data: res }) => setReview(res || {})).catch(() => setReview({}));
  }, [step, review]);

  const choose = async (choice) => {
    // Being verified: manual pitching waits for verification, so nothing is recorded yet (the free-week offer
    // stays theirs); the verify step explains and offers the skip.
    if (choice === 'free' && unverified) { setStep('verify'); return; }
    try { await apiClient.post('/api/subscription/start-choice', { choice }); } catch (_) { /* never block */ }
    if (choice === 'trial') { onTrial('welcome_trial'); return; }
    setStep('pick');
  };

  const saveGoal = async () => {
    const opt = goal?.options?.find((o) => o.id === goal.pick);
    if (!opt || goal.pick === goal.initial) { setStep('choose'); return; } // their signup goal: nothing to save
    setSaving(true);
    try { await apiClient.post('/api/tracker/goal', { amount_cents: opt.amount_cents, source: 'custom' }); } catch (_) { /* optional step */ }
    setSaving(false);
    setStep('choose');
  };

  const markSent = (brand) => {
    if (sent[brand.brand_id]) return;
    setSent((s) => ({ ...s, [brand.brand_id]: true }));
    apiClient.post('/api/polly/pitch/sent-check', { brand_id: brand.brand_id, brand_name: brand.brand_name, sent: true, method: 'copy_pitch' }).catch(() => {});
  };

  const manual = MANUAL.includes(step);
  const order = manual ? MANUAL : backVerified ? ['verified', 'choose'] : STEPS;
  const back = () => {
    if (step === 'verify') { setStep('choose'); return; }
    if (step === 'review' && at > 0) { setAt(at - 1); return; }
    const i = order.indexOf(step);
    if (i > 0) setStep(order[i - 1]);
    else if (manual) setStep('choose');
  };
  const canBack = step !== 'matches' && step !== 'done' && step !== 'verified';

  let body = null;
  let foot = null;

  if (step === 'verified') {
    body = (
      <>
        <Center>
          <span className="ok" aria-hidden="true"><ShieldCheck size={34} /></span>
          <Eyebrow>Profile verified</Eyebrow>
          <H1 $center>You&apos;re verified <span aria-hidden="true">🎉</span></H1>
          <Sub $center>Sending is unlocked. Your {total} matched brand{total === 1 ? '' : 's'} and the pitches you prepared are ready to go.</Sub>
        </Center>
        <List>{brands.slice(0, 3).map((b, i) => <BrandRow key={b.brand_id} brand={b} index={i} />)}</List>
      </>
    );
    foot = <Primary type="button" onClick={() => setStep('choose')}>Choose how to start <ArrowRight size={18} aria-hidden="true" /></Primary>;
  } else if (step === 'matches') {
    const list = more ? brands : brands.slice(0, SHOWN);
    body = (
      <>
        <Eyebrow>Your brand opportunities are ready</Eyebrow>
        <H1>We found {total} brand{total === 1 ? '' : 's'} that fit your {niche ? `${niche} ` : ''}content <span aria-hidden="true">🎉</span></H1>
        <Sub>These brands are investing in creator content and match your niche and style.</Sub>
        <List>
          {list.map((b, i) => (
            <MatchRow key={b.brand_id} brand={b} index={i} open={openBrand === b.brand_id}
              onToggle={() => setOpenBrand((cur) => (cur === b.brand_id ? null : b.brand_id))} />
          ))}
        </List>
        {brands.length > SHOWN ? (
          <More type="button" aria-expanded={more} onClick={() => setMore((v) => !v)}>
            {more ? 'Show fewer' : `Show +${Math.max(brands.length, total) - SHOWN} more brands`}
            {more ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
          </More>
        ) : null}
      </>
    );
    foot = <Primary type="button" onClick={() => setStep('pitch')}>Preview my first pitch <ArrowRight size={18} aria-hidden="true" /></Primary>;
  } else if (step === 'pitch') {
    const p = pitches[lead?.brand_id] || { status: 'writing' };
    body = (
      <>
        <Eyebrow>Preview your pitch</Eyebrow>
        <BrandRow brand={lead} index={0} />
        <H2>Your personalized pitch</H2>
        <PitchBox pitch={p} brandName={lead?.brand_name} editing={editing}
          onEdit={(patch) => editPitch(lead.brand_id, patch)} onRetry={() => { setPitches((x) => ({ ...x, [lead.brand_id]: null })); pitchFor(lead); }} />
        {p.status === 'ready' && unverified ? (
          <>
            <Ghost type="button" $wide onClick={() => setEditing((v) => !v)}><Pencil size={16} aria-hidden="true" /> {editing ? 'Done' : 'Edit pitch'}</Ghost>
            <LockNote role="note">
              <span className="ic" aria-hidden="true"><Lock size={14} strokeWidth={2.5} /></span>
              <span><b>Sending unlocks once your profile is verified.</b> Your pitch is saved and ready to go.</span>
            </LockNote>
          </>
        ) : p.status === 'ready' ? (
          <Pair>
            <Ghost type="button" onClick={() => setEditing((v) => !v)}><Pencil size={16} aria-hidden="true" /> {editing ? 'Done' : 'Edit'}</Ghost>
            <Green type="button" onClick={() => copy(lead, false)}><Copy size={16} aria-hidden="true" /> {copied === String(lead.brand_id) ? 'Copied' : 'Copy pitch'}</Green>
          </Pair>
        ) : null}
      </>
    );
    foot = <Primary type="button" disabled={p.status === 'writing'} onClick={() => setStep('goal')}>Continue <ArrowRight size={18} aria-hidden="true" /></Primary>;
  } else if (step === 'goal') {
    const opt = goal?.options?.find((o) => o.id === goal.pick);
    const plan = opt ? outreachPlan(opt.amount_cents, goal.rate, goal.reply, goal.deal) : null;
    body = (
      <>
        <Eyebrow>Your UGC plan</Eyebrow>
        <H1>{opt ? `Let's work towards your first ${money(opt.amount_cents)} month.` : "Let's set your monthly goal."}</H1>
        <Sub>How much would you like to earn from paid UGC deals each month?</Sub>
        {!goal ? <Muted>Loading your plan…</Muted> : (
          <>
            <Options role="radiogroup" aria-label="Monthly goal">
              {goal.options.map((o) => (
                <Option key={o.id} type="button" role="radio" aria-checked={goal.pick === o.id} $on={goal.pick === o.id}
                  onClick={() => setGoal((g) => ({ ...g, pick: o.id }))}>
                  <span className="dot" aria-hidden="true">{goal.pick === o.id ? <Check size={13} strokeWidth={3} /> : null}</span>
                  <b>{money(o.amount_cents)}</b>
                  <span className="lbl">{o.label}</span>
                </Option>
              ))}
            </Options>
            <Label htmlFor="wf-rate">Estimated rate per UGC video ($)</Label>
            <Input id="wf-rate" type="number" min="1" inputMode="numeric" value={goal.rate}
              onChange={(e) => setGoal((g) => ({ ...g, rate: e.target.value }))} />
            {plan ? (
              <>
                <Label as="div">Your estimated monthly outreach plan</Label>
                <Stats>
                  <div><b>{plan.deals}</b><span>Paid collaborations</span></div>
                  <div><b>{plan.pitches}</b><span>Brand pitches</span></div>
                  <div><b>{plan.perWeek}</b><span>Pitches per week</span></div>
                  <div><b>{plan.perDay}</b><span>Pitches per day</span></div>
                </Stats>
                <Muted>Polly can handle your daily outreach while you focus on creating content.</Muted>
              </>
            ) : null}
          </>
        )}
      </>
    );
    foot = (
      <>
        <Primary type="button" disabled={saving || !goal} onClick={saveGoal}>{saving ? 'Saving…' : 'Continue'} <ArrowRight size={18} aria-hidden="true" /></Primary>
        <TextLink type="button" onClick={() => setStep('choose')}>Skip for now</TextLink>
      </>
    );
  } else if (step === 'choose') {
    body = (
      <>
        <H1>How do you want to start?</H1>
        <Sub>Get brand deals on your terms.</Sub>
        <Rec>
          <span className="badge">Recommended</span>
          <div className="head"><span className="ic" aria-hidden="true"><Zap size={20} /></span><div><b>Let Polly handle the outreach</b><span>Automated pitching, follow-ups and new brand opportunities every day.</span></div></div>
          <Primary type="button" onClick={() => choose('trial')}>{unverified ? 'Skip the wait · $19/mo' : 'Start 7 days free'} <ArrowRight size={18} aria-hidden="true" /></Primary>
          <Fine>{unverified ? 'Skips the profile review: Polly starts sending today. $19/month, cancel anytime.' : '$0 today, then $19/month. Cancel anytime.'}</Fine>
        </Rec>
        <Or><span>or</span></Or>
        <ManualRow type="button" onClick={() => choose('free')}>
          <Pencil size={20} aria-hidden="true" />
          <span><b>I&apos;ll pitch manually</b><span>{unverified ? 'Unlocks once your profile is verified.' : `Get ${freeLeft} free pitches and try it yourself.`}</span></span>
          <ChevronRight size={18} aria-hidden="true" />
        </ManualRow>
      </>
    );
  } else if (step === 'verify') {
    const notReady = review?.status === 'not_ready';
    body = (
      <>
        <Eyebrow>Profile verification</Eyebrow>
        <H1>{notReady ? 'Your profile isn’t ready for outreach yet' : 'We’re checking your profile'}</H1>
        <Sub>Brands on Newcollab hear from creators who are ready for collabs, so every profile is checked before its first pitch goes out. Here’s what we look for:</Sub>
        {!review ? <Muted>Loading…</Muted> : (
          <Checks>
            {(review.checks || []).map((c) => (
              <li key={c.id} className={c.ok === true ? 'ok' : c.ok === false ? 'no' : ''}>
                <span className="mk" aria-hidden="true">{c.ok === true ? <Check size={14} strokeWidth={3} /> : c.ok === false ? '!' : <ShieldCheck size={14} />}</span>
                <span><b>{c.label}</b>{c.detail ? <span>{c.detail}</span> : null}</span>
              </li>
            ))}
          </Checks>
        )}
        <Steps>
          <div className="hd"><Info size={18} aria-hidden="true" /> Meanwhile</div>
          <ol>
            <li>Explore your {total} matched brands</li>
            <li>Your first pitch is saved and ready</li>
            <li>Polly writes the rest the moment you&apos;re verified</li>
          </ol>
        </Steps>
      </>
    );
    foot = (
      <>
        <Green type="button" $wide onClick={() => choose('trial')}>Skip the wait · $19/mo</Green>
        <Fine>Pro skips the review: Polly starts sending today. Cancel anytime.</Fine>
        <TextLink type="button" onClick={() => onClose('verify')}>Explore my brands meanwhile</TextLink>
      </>
    );
  } else if (step === 'pick') {
    const full = picked.length >= freeLeft;
    body = (
      <>
        <H1>Pick {freeLeft} brand{freeLeft === 1 ? '' : 's'} to pitch</H1>
        <Sub>You have {freeLeft} free pitch{freeLeft === 1 ? '' : 'es'}. Choose the brands you want to reach out to.</Sub>
        <Search $top>
          <Label htmlFor="wf-search">Looking for a specific brand?</Label>
          <Input id="wf-search" type="search" placeholder="Search 3,000+ brands, e.g. Away" value={q}
            onChange={(e) => search(e.target.value)} autoComplete="off" />
          {searching ? <Muted>Searching…</Muted> : null}
          {!searching && q.trim().length >= 2 && !found.length ? <Muted>No brand found with that name yet.</Muted> : null}
          {found.length ? (
            <List>
              {found.filter((b) => !allBrands.some((x) => x.brand_id === b.brand_id)).map((b, i) => {
                const on = picked.includes(b.brand_id);
                return (
                  <BrandRow key={`s${b.brand_id}`} brand={b} index={i + 3}
                    onClick={() => {
                      if (on) { setPicked((p) => p.filter((x) => x !== b.brand_id)); return; }
                      if (full) return;
                      setExtra((xs) => (xs.some((x) => x.brand_id === b.brand_id) ? xs : [...xs, b]));
                      setPicked((p) => [...p, b.brand_id]);
                      setQ('');
                      setFound([]);
                    }}
                    right={<Box $on={on} aria-hidden="true">{on ? <Check size={15} strokeWidth={3} /> : null}</Box>} />
                );
              })}
            </List>
          ) : null}
        </Search>
        <List>
          {allBrands.map((b, i) => {
            const on = picked.includes(b.brand_id);
            return (
              <BrandRow key={b.brand_id} brand={b} index={i}
                onClick={() => setPicked((p) => (on ? p.filter((x) => x !== b.brand_id) : full ? p : [...p, b.brand_id]))}
                right={<Box $on={on} aria-hidden="true">{on ? <Check size={15} strokeWidth={3} /> : null}</Box>} />
            );
          })}
        </List>
      </>
    );
    foot = (
      <>
        <Muted $center>{picked.length} of {freeLeft} selected</Muted>
        <Green type="button" $wide disabled={!picked.length} onClick={() => { setAt(0); setStep('review'); }}>Continue</Green>
      </>
    );
  } else if (step === 'review') {
    const brand = selectedBrands[at];
    const p = pitches[brand?.brand_id] || { status: 'writing' };
    const last = at >= selectedBrands.length - 1;
    body = brand ? (
      <>
        <H1>Review your pitch</H1>
        <Sub>A personalized pitch for {brand.brand_name}{niche ? `, based on your ${niche} content` : ''}.</Sub>
        <BrandRow brand={brand} index={at} />
        <PitchBox pitch={p} brandName={brand.brand_name} editing={editing}
          onEdit={(patch) => editPitch(brand.brand_id, patch)} onRetry={() => { setPitches((x) => ({ ...x, [brand.brand_id]: null })); pitchFor(brand); }} />
        {p.status === 'ready' ? (
          <>
            <Pair>
              <Ghost type="button" onClick={() => setEditing((v) => !v)}><Pencil size={16} aria-hidden="true" /> {editing ? 'Done' : 'Edit'}</Ghost>
              <Green type="button" onClick={() => copy(brand, true)}><Copy size={16} aria-hidden="true" /> {copied === String(brand.brand_id) ? 'Copied' : 'Copy pitch'}</Green>
            </Pair>
            {p.mailto ? <TextLink as="a" href={p.mailto} onClick={() => copy(brand, true)}>Or open it in my email app</TextLink> : null}
          </>
        ) : null}
        <Pager>
          <button type="button" aria-label="Show previous pitch" disabled={at === 0} onClick={() => setAt(at - 1)}><ChevronLeft size={18} /></button>
          <span><b>{brand.brand_name}</b>{at + 1} of {selectedBrands.length}</span>
          <button type="button" aria-label="Show next pitch" disabled={last} onClick={() => setAt(at + 1)}><ChevronRight size={18} /></button>
        </Pager>
      </>
    ) : null;
    foot = <Primary type="button" onClick={() => (last ? setStep('track') : setAt(at + 1))}>{last ? 'Track my outreach' : 'Next pitch'} <ArrowRight size={18} aria-hidden="true" /></Primary>;
  } else if (step === 'track') {
    body = (
      <>
        <H1>Your outreach tracker</H1>
        <Sub>Keep track of the {selectedBrands.length} pitch{selectedBrands.length === 1 ? '' : 'es'} you&apos;re sending manually.</Sub>
        <List>
          {selectedBrands.map((b, i) => (
            <TrackRow key={b.brand_id} type="button" onClick={() => markSent(b)} aria-pressed={!!sent[b.brand_id]}>
              <BrandLogo brand={b} color={MONO_COLORS[i % MONO_COLORS.length]} size={52} />
              <span className="tx"><b>{b.brand_name}</b><span className={sent[b.brand_id] ? 'st sent' : 'st'}>{sent[b.brand_id] ? 'Sent' : 'Ready to send'}</span></span>
              <Box $on={!!sent[b.brand_id]} aria-hidden="true">{sent[b.brand_id] ? <Check size={15} strokeWidth={3} /> : null}</Box>
            </TrackRow>
          ))}
        </List>
        <Steps>
          <div className="hd"><Info size={18} aria-hidden="true" /> Next steps</div>
          <ol><li>Copy each pitch and send it from your Gmail</li><li>Mark it as &quot;Sent&quot; here</li><li>Track replies in your Tracker</li></ol>
        </Steps>
      </>
    );
    foot = <Primary type="button" onClick={() => setStep('done')}>Continue <ArrowRight size={18} aria-hidden="true" /></Primary>;
  } else if (step === 'done') {
    body = (
      <Center>
        <span className="ok" aria-hidden="true"><Check size={34} strokeWidth={3} /></span>
        <H1 $center>You&apos;ve used your {selectedBrands.length || freeLeft} free pitch{(selectedBrands.length || freeLeft) === 1 ? '' : 'es'}!</H1>
        <Sub $center>Want to keep the momentum going? Let Polly handle your outreach, follow-ups and new brand opportunities automatically.</Sub>
        <Ticks>
          {['Finds new relevant brands daily', 'Sends up to 20 personalized pitches', 'Follows up and tracks every reply', 'Daily summary in your inbox'].map((x) => (
            <li key={x}><Check size={17} strokeWidth={3} aria-hidden="true" />{x}</li>
          ))}
        </Ticks>
      </Center>
    );
    foot = (
      <>
        <Green type="button" $wide onClick={() => onTrial('welcome_manual_done')}>Let Polly take over · $19/mo</Green>
        <Fine>$19/mo. Cancel anytime.</Fine>
        <TextLink type="button" onClick={() => onClose('manual')}>I&apos;ll keep pitching manually</TextLink>
      </>
    );
  }

  const idx = step === 'verify' ? STEPS.length - 1 : order.indexOf(step);
  return (
    <Overlay role="dialog" aria-modal="true" aria-label="Welcome to Newcollab">
      <Bar>
        {canBack ? <IconBtn type="button" aria-label="Back" onClick={back}><ArrowLeft size={20} /></IconBtn> : <span className="sp" />}
        <Dots aria-hidden="true">{order.map((s, i) => <i key={s} className={i <= idx ? 'on' : ''} />)}</Dots>
        {manual ? <span className="free">{freeLeft} free pitch{freeLeft === 1 ? '' : 'es'}</span> : <span className="sp" />}
      </Bar>
      <Scroll ref={top}><Inner>{body}</Inner></Scroll>
      {foot ? <Foot><Inner>{foot}</Inner></Foot> : null}
    </Overlay>
  );
}

function PitchBox({ pitch, brandName, editing, onEdit, onRetry }) {
  if (!pitch || pitch.status === 'writing') return <Card><PitchWriting brandName={brandName} /></Card>;
  if (pitch.status !== 'ready') {
    return (
      <Card>
        <Muted>{pitch.message || 'Could not write this pitch.'}</Muted>
        <TextLink type="button" onClick={onRetry}>Try again</TextLink>
      </Card>
    );
  }
  if (editing) {
    return (
      <Card>
        <Label htmlFor="wf-subject">Subject</Label>
        <Input id="wf-subject" value={pitch.subject} onChange={(e) => onEdit({ subject: e.target.value })} />
        <Label htmlFor="wf-body">Message</Label>
        <Area id="wf-body" rows={12} value={pitch.body} onChange={(e) => onEdit({ body: e.target.value })} />
      </Card>
    );
  }
  return (
    <Card>
      <div className="subj"><b>Subject:</b> {pitch.subject}</div>
      <div className="body">{pitch.body}</div>
    </Card>
  );
}

const fade = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; }`;

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 1200; display: flex; flex-direction: column;
  background: #f6f5f2; color: ${t.ink}; font-family: ${t.fontSans};
`;
const Bar = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 16px; background: #fff; border-bottom: 1px solid ${t.line};
  .sp { width: 36px; }
  .free { font-size: 12.5px; font-weight: 700; color: ${t.accentDeep}; background: ${t.accentSoft}; padding: 6px 10px; border-radius: 999px; white-space: nowrap; }
`;
const IconBtn = styled.button`
  width: 36px; height: 36px; display: grid; place-items: center; border: 0; background: none; border-radius: 10px; cursor: pointer; color: ${t.ink};
  &:hover { background: ${t.subtle}; }
`;
const Dots = styled.div`
  display: flex; gap: 6px;
  i { width: 22px; height: 5px; border-radius: 3px; background: ${t.line}; }
  i.on { background: ${t.accent}; }
`;
const Scroll = styled.div`flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;`;
const Inner = styled.div`
  width: 100%; max-width: 480px; margin: 0 auto; padding: 22px 18px; box-sizing: border-box;
  animation: ${fade} .25s ease both; display: grid; gap: 14px;
`;
const Foot = styled.div`
  background: #fff; border-top: 1px solid ${t.line};
  > div { padding-top: 12px; padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px)); gap: 8px; animation: none; }
`;
const Eyebrow = styled.div`font-size: 12px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: ${t.accent};`;
const H1 = styled.h1`
  margin: 0; font-size: 26px; line-height: 1.2; letter-spacing: -0.02em; font-weight: 800;
  text-align: ${(p) => (p.$center ? 'center' : 'left')};
`;
const H2 = styled.h2`margin: 4px 0 0; font-size: 19px; font-weight: 800;`;
const Sub = styled.p`
  margin: -4px 0 4px; font-size: 15px; line-height: 1.45; color: ${t.muted};
  text-align: ${(p) => (p.$center ? 'center' : 'left')};
`;
const Muted = styled.p`margin: 0; font-size: 14px; color: ${t.muted}; text-align: ${(p) => (p.$center ? 'center' : 'left')};`;
const List = styled.div`display: grid; gap: 10px;`;
const rowCss = `
  display: flex; align-items: center; gap: 14px; width: 100%; box-sizing: border-box; text-align: left;
  padding: 12px 14px; border-radius: 16px; background: #fff; border: 1px solid ${t.line}; font-family: inherit; color: ${t.ink};
  .tx { display: grid; gap: 3px; min-width: 0; flex: 1; }
  .tx b { font-size: 16px; font-weight: 750; }
  .pill { font-size: 13px; font-weight: 650; color: ${t.accentDeep}; }
  .tags { font-size: 13px; color: ${t.muted}; }
  .chev { color: ${t.muted}; flex: none; transition: transform .15s ease; }
  .chev.open { transform: rotate(180deg); }
  .about { margin-top: 4px; font-size: 14px; line-height: 1.45; color: ${t.inkSoft}; }
  &[aria-expanded='true'] { align-items: flex-start; }
  &[aria-expanded='true'] .chev { margin-top: 16px; }
`;
const RowStatic = styled.div`${rowCss}`;
const RowButton = styled.button`${rowCss} cursor: pointer; &:hover { border-color: #cfd8d4; }`;
const TrackRow = styled.button`
  ${rowCss} cursor: pointer;
  .st { justify-self: start; font-size: 12.5px; font-weight: 600; color: ${t.muted}; background: ${t.subtle}; padding: 4px 10px; border-radius: 999px; }
  .st.sent { color: ${t.accentDeep}; background: ${t.accentSoft}; }
`;
const Box = styled.span`
  width: 26px; height: 26px; flex: none; border-radius: 7px; display: grid; place-items: center;
  border: 2px solid ${(p) => (p.$on ? t.accent : '#cfd4dc')}; background: ${(p) => (p.$on ? t.accent : '#fff')}; color: #fff;
`;
const More = styled.button`
  display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 13px; border: 0;
  border-radius: 14px; background: ${t.accentSoft}; color: ${t.accentDeep}; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer;
`;
const btn = `
  display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 50px; padding: 13px 16px;
  border-radius: 14px; font-family: inherit; font-size: 16px; font-weight: 750; cursor: pointer; text-decoration: none; box-sizing: border-box;
  &:disabled { opacity: .55; cursor: default; }
`;
const Primary = styled.button`${btn} width: 100%; border: 0; background: ${t.ink}; color: #fff;`;
const Green = styled.button`${btn} ${(p) => (p.$wide ? 'width: 100%;' : 'flex: 1;')} border: 0; background: ${t.accent}; color: #fff;`;
const Ghost = styled.button`${btn} ${(p) => (p.$wide ? 'width: 100%;' : 'flex: 1;')} border: 1px solid ${t.line}; background: #fff; color: ${t.ink};`;
const Pair = styled.div`display: flex; gap: 10px;`;
const TextLink = styled.button`
  display: block; width: 100%; padding: 8px; border: 0; background: none; font-family: inherit; font-size: 14.5px; font-weight: 600;
  color: ${t.accentDeep}; text-decoration: underline; text-underline-offset: 3px; text-align: center; cursor: pointer;
`;
const Fine = styled.p`margin: 0; text-align: center; font-size: 13px; color: ${t.muted};`;
const Card = styled.div`
  background: #fff; border: 1px solid ${t.line}; border-radius: 16px; padding: 16px; display: grid; gap: 10px; min-width: 0;
  .subj { font-size: 14.5px; padding-bottom: 10px; border-bottom: 1px solid ${t.line}; overflow-wrap: anywhere; }
  .body { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 14.5px; line-height: 1.55; color: ${t.inkSoft}; }
`;
const Label = styled.label`font-size: 13px; font-weight: 700; color: ${t.inkSoft};`;
const field = `width: 100%; box-sizing: border-box; border: 1px solid ${t.line}; border-radius: 12px; padding: 12px; font-family: inherit; font-size: 16px; background: #fff; color: ${t.ink};`;
const Input = styled.input`${field}`;
const Area = styled.textarea`${field} line-height: 1.5; resize: vertical;`;
const Options = styled.div`display: grid; gap: 10px;`;
const Search = styled.div`
  display: grid; gap: 8px; padding: 12px 14px; border-radius: 16px; background: #fff; border: 1px dashed ${t.line};
`;
const Option = styled.button`
  display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px; border-radius: 14px; cursor: pointer; font-family: inherit; text-align: left;
  border: 1.5px solid ${(p) => (p.$on ? t.accent : t.line)}; background: ${(p) => (p.$on ? t.accentSoft : '#fff')}; color: ${t.ink};
  .dot { width: 20px; height: 20px; border-radius: 50%; flex: none; display: grid; place-items: center; color: #fff;
    border: 2px solid ${(p) => (p.$on ? t.accent : '#cfd4dc')}; background: ${(p) => (p.$on ? t.accent : '#fff')}; }
  b { font-size: 17px; }
  .lbl { margin-left: auto; font-size: 14px; color: ${t.muted}; }
`;
const Stats = styled.div`
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; background: ${t.accentSoft}; border-radius: 14px; padding: 12px 6px;
  div { display: grid; gap: 2px; text-align: center; }
  b { font-size: 22px; color: ${t.accentDeep}; }
  span { font-size: 11.5px; color: ${t.inkSoft}; line-height: 1.25; }
`;
const Rec = styled.div`
  position: relative; border: 2px solid ${t.accent}; border-radius: 18px; background: #fff; padding: 22px 16px 16px; display: grid; gap: 12px;
  .badge { position: absolute; top: -12px; left: 16px; background: ${t.accent}; color: #fff; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; }
  .head { display: flex; gap: 12px; align-items: flex-start; }
  .head .ic { width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; background: #fff7e6; color: #f59e0b; flex: none; }
  .head b { display: block; font-size: 17px; }
  .head span { font-size: 14px; line-height: 1.45; color: ${t.muted}; }
`;
const Or = styled.div`
  display: flex; align-items: center; gap: 12px; color: ${t.muted}; font-size: 13px; text-transform: uppercase;
  &::before, &::after { content: ''; flex: 1; height: 1px; background: ${t.line}; }
`;
const ManualRow = styled.button`
  display: flex; align-items: center; gap: 14px; width: 100%; padding: 16px; border-radius: 16px; border: 1px solid ${t.line};
  background: #fff; font-family: inherit; color: ${t.ink}; text-align: left; cursor: pointer;
  > span { flex: 1; display: grid; gap: 2px; }
  b { font-size: 16px; } span span { font-size: 14px; color: ${t.muted}; }
`;
const Pager = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  button { width: 40px; height: 40px; border-radius: 50%; border: 1px solid ${t.line}; background: #fff; display: grid; place-items: center; cursor: pointer; }
  button:disabled { opacity: .4; cursor: default; }
  span { display: grid; text-align: center; font-size: 13px; color: ${t.muted}; }
  span b { font-size: 15px; color: ${t.ink}; }
`;
const Steps = styled.div`
  background: ${t.accentSoft}; border-radius: 14px; padding: 14px 16px;
  .hd { display: flex; align-items: center; gap: 8px; font-weight: 750; color: ${t.accentDeep}; }
  ol { margin: 8px 0 0; padding-left: 22px; display: grid; gap: 6px; font-size: 14px; color: ${t.inkSoft}; }
`;
const LockNote = styled.div`
  display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 14px; background: ${t.subtle};
  font-size: 14px; line-height: 1.45; color: ${t.inkSoft};
  b { color: ${t.ink}; }
  .ic { flex: none; width: 24px; height: 24px; border-radius: 50%; background: ${t.ink}; color: #fff; display: grid; place-items: center; margin-top: 1px; }
`;
const Checks = styled.ul`
  list-style: none; margin: 0; padding: 0; display: grid; gap: 10px;
  li { display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; border: 1px solid ${t.line}; border-radius: 14px; background: #fff; }
  li > span:last-child { display: grid; gap: 2px; font-size: 14.5px; }
  li > span:last-child span { font-size: 13px; color: ${t.muted}; }
  .mk {
    flex: none; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 14px;
    background: ${t.subtle}; color: ${t.muted};
  }
  li.ok .mk { background: ${t.accent}; color: #fff; }
  li.no .mk { background: #FEF3C7; color: #B45309; }
`;
const Center = styled.div`
  display: grid; gap: 14px; justify-items: center; text-align: center; padding-top: 10px;
  .ok { width: 72px; height: 72px; border-radius: 50%; display: grid; place-items: center; background: ${t.accentSoft}; color: ${t.accent}; }
`;
const Ticks = styled.ul`
  list-style: none; margin: 4px 0 0; padding: 0; display: grid; gap: 10px; justify-self: stretch; text-align: left;
  li { display: flex; align-items: center; gap: 10px; font-size: 15px; } svg { color: ${t.accent}; flex: none; }
`;
