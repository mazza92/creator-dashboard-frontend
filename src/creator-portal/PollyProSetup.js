import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { ArrowLeft, Check, Pencil, RefreshCw, X } from 'lucide-react';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';

// Pro setup: a short, full-screen journey that teaches Autopilot how the creator sounds, what they offer, what
// brands should see first and who to pitch, then shows a real first pitch and goes live. Every screen saves as
// the creator goes (Polly chat uses the same choices), so closing it halfway loses nothing: it resumes where they
// left off, and Autopilot keeps running on smart defaults meanwhile. Opened with `section`, it edits one part.

export const SETUP_STEPS = ['welcome', 'voice', 'offer', 'work', 'brands', 'pitch', 'live'];
const LAST = SETUP_STEPS.length - 1;
const SECTION_TITLES = { voice: 'Your voice', offer: 'Your offer', work: 'Your best work', brands: 'Your brands' };

const DEALS = [
  { id: 'gifted', label: 'Gifted only' },
  { id: 'auto', label: 'Gifted first, paid when they pay' },
  { id: 'paid', label: 'Paid only' },
];
const TARGETS = [30, 60, 100, 150];
const MAX_NICHES = 3;
const MAX_POSTS = 2;
const NICHE_LABEL = (id) => String(id || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function fmt(n) {
  const v = Number(n) || 0;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`;
  return String(v);
}

function engagementLabel(raw) {
  const v = Number(raw);
  if (!v) return '';
  return `${(v <= 1 ? v * 100 : v).toFixed(1).replace(/\.0$/, '')}%`;
}

function cleanPostUrl(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  const url = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(url);
    if (!/(tiktok\.com|instagram\.com|youtube\.com|youtu\.be)$/i.test(u.hostname.replace(/^www\./, ''))) return '';
    return `https://${u.hostname}${u.pathname}`.replace(/\/$/, '');
  } catch (_) {
    return '';
  }
}

const ERRORS = {
  no_matches: "I couldn't find a brand with a working email in your niches today. I'll keep looking and pitch as soon as one shows up.",
  needs_location: 'Add where brands should ship your products on the Offer step, then try again.',
  no_contact_email: "That brand's inbox didn't check out. Try another angle and I'll pick the next brand.",
};

export default function PollyProSetup({
  open, section = null, firstName = '', trialDays = 0, gmail = null, returnReason = '', onClose, onDone, onSaved,
}) {
  const [data, setData] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [finished, setFinished] = useState(false);
  const [preview, setPreview] = useState(null);
  const bodyRef = useRef(null);
  const dialogRef = useRef(null);
  const single = Boolean(section);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setError('');
    setFinished(false);
    apiClient.get('/api/polly/autopilot/setup').then((res) => {
      if (cancelled || !res.data?.success) return;
      const d = res.data;
      setData(d);
      setForm(formFrom(d));
      if (section) setStep(Math.max(1, SETUP_STEPS.indexOf(section)));
      else if (returnReason === 'gmail_connected' || returnReason === 'gmail_scope') setStep(LAST);
      else setStep(Math.min(LAST, d.step || 0));
    }).catch(() => {
      if (!cancelled) setError("I couldn't load your setup. Check your connection and try again.");
    });
    return () => { cancelled = true; };
  }, [open, section, returnReason]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0; }, [step]);

  const set = useCallback((patch) => setForm((f) => ({ ...f, ...patch })), []);

  const save = async (patch) => {
    const res = await apiClient.post('/api/polly/autopilot/setup', patch);
    if (res.data?.success) setData(res.data);
    return res.data;
  };

  const patchFor = (i) => {
    const f = form || {};
    switch (SETUP_STEPS[i]) {
      case 'voice':
        return f.voice === 'sample' && f.styleRules.length
          ? { voice: 'sample', style_rules: f.styleRules, style_summary: f.styleSummary, tone: f.tone }
          : { voice: 'preset', tone: f.tone };
      case 'offer':
        return { deal: f.deal, offer_type: f.offerType, city: f.city.trim(), country: f.country.trim() };
      case 'work':
        return { proof_posts: f.posts, win: f.win, lead_metric: f.showEngagement ? 'engagement' : 'views' };
      case 'brands':
        return { niches: f.niches, monthly_target: f.target };
      default:
        return {};
    }
  };

  const next = async (skip = false) => {
    if (!form || saving) return;
    setError('');
    setSaving(true);
    try {
      if (single) {
        await save(patchFor(step));
        onSaved?.();
        onClose?.();
        return;
      }
      const target = Math.min(LAST, step + 1);
      await save({ ...(skip ? {} : patchFor(step)), step: target });
      setStep(target);
    } catch (_) {
      setError("That didn't save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const goLive = async () => {
    setSaving(true);
    setError('');
    try {
      await save({ done: true, step: LAST });
      setFinished(true);
      setTimeout(() => onDone?.(), 1400);
    } catch (_) {
      setError("I couldn't switch Autopilot on. Try again in a moment.");
    } finally {
      setSaving(false);
    }
  };

  const connectGmail = async () => {
    setSaving(true);
    setError('');
    try {
      await save({ step: LAST });
      const res = await apiClient.get('/api/polly/autopilot/gmail/connect');
      if (res.data?.url) window.location.href = res.data.url;
      else setSaving(false);
    } catch (_) {
      setError("Gmail didn't open. Try again in a moment.");
      setSaving(false);
    }
  };

  if (!open) return null;

  const gmailConnected = Boolean(gmail?.connected || data?.gmail_connected);
  const name = SETUP_STEPS[step];
  const valid = !form ? false
    : name === 'offer' ? Boolean(form.city.trim())
      : name === 'brands' ? form.niches.length > 0
        : true;
  const canSkip = !single && ['offer', 'work', 'brands'].includes(name) && Boolean(data);

  let primary = null;
  if (single) primary = { label: saving ? 'Saving…' : 'Save', onClick: () => next() };
  else if (name === 'welcome') primary = { label: "Let's go", onClick: () => next() };
  else if (name === 'pitch') primary = { label: 'Looks great, write them all like this', onClick: () => next() };
  else if (name === 'live') {
    primary = gmailConnected
      ? { label: saving ? 'Switching on…' : 'Turn on Autopilot', onClick: goLive }
      : { label: saving ? 'Opening Google…' : 'Connect Gmail', onClick: connectGmail };
  } else primary = { label: saving ? 'Saving…' : 'Continue', onClick: () => next() };

  return (
    <Overlay role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <Dialog
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={single ? SECTION_TITLES[section] || 'Autopilot preferences' : 'Set up Autopilot'}
        $single={single}
      >
        <Top>
          {!single && step > 0 && !finished ? (
            <IconBtn type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} aria-label="Back">
              <ArrowLeft size={18} /> <span>Back</span>
            </IconBtn>
          ) : <span className="title">{single ? SECTION_TITLES[section] || 'Preferences' : ''}</span>}
          {single ? <span aria-hidden="true" /> : (
            <Bars aria-label={step ? `Step ${step} of ${LAST}` : undefined}>
              {Array.from({ length: LAST }, (_, i) => <i key={i} className={i < step ? 'on' : ''} />)}
            </Bars>
          )}
          <IconBtn type="button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </IconBtn>
        </Top>

        <Body ref={bodyRef}>
          {!form ? (
            error ? <ErrorNote role="alert">{error}</ErrorNote> : <Loading>One sec, loading your setup…</Loading>
          ) : finished ? (
            <Done>
              <div className="ok"><Check size={34} /></div>
              <h2>Autopilot is on.</h2>
              <p>Your first pitches go out within the hour. I&apos;ll tell you here when a brand replies.</p>
            </Done>
          ) : (
            <StepView key={step}>
              {name === 'welcome' && (
                <Welcome firstName={firstName} trialDays={trialDays} target={form.target} />
              )}
              {name === 'voice' && <VoiceStep form={form} set={set} tones={data.tones} single={single} />}
              {name === 'offer' && <OfferStep form={form} set={set} options={data.offer.options} single={single} />}
              {name === 'work' && <WorkStep form={form} set={set} data={data} single={single} />}
              {name === 'brands' && <BrandsStep form={form} set={set} data={data} single={single} />}
              {name === 'pitch' && <PitchStep cache={preview} setCache={setPreview} />}
              {name === 'live' && (
                <LiveStep connected={gmailConnected} email={gmail?.email} returnReason={returnReason} />
              )}
              {error ? <ErrorNote role="alert">{error}</ErrorNote> : null}
            </StepView>
          )}
        </Body>

        {form && !finished && (
          <Foot>
            <span className="hint">
              {single ? 'Used for every pitch from now on, here and in chat.'
                : name === 'welcome' ? 'About 2 minutes' : `Step ${step} of ${LAST}`}
            </span>
            <div className="actions">
              {canSkip && <Btn type="button" onClick={() => next(true)} disabled={saving}>Skip</Btn>}
              <Btn $primary type="button" onClick={primary.onClick} disabled={saving || !valid}>{primary.label}</Btn>
            </div>
          </Foot>
        )}
      </Dialog>
    </Overlay>
  );
}

function formFrom(d) {
  const p = d.profile || {};
  return {
    tone: p.tone || 'brief',
    voice: p.voice || 'preset',
    styleRules: p.style_rules || [],
    styleSummary: p.style_summary || '',
    sample: '',
    deal: d.offer?.deal || 'auto',
    offerType: d.offer?.offer_type || 'gifted_ugc',
    city: d.offer?.city || '',
    country: d.offer?.country || '',
    posts: (p.proof_posts || []).slice(0, MAX_POSTS),
    win: p.win || '',
    showEngagement: Boolean(d.stats?.engagement_strong && d.stats?.lead_metric === 'engagement'),
    niches: (d.niches || []).slice(0, MAX_NICHES),
    target: TARGETS.includes(d.monthly_target) ? d.monthly_target : 60,
  };
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

function Q({ k, title, sub, single }) {
  return (
    <QHead>
      {!single && <span className="k">{k}</span>}
      <h2>{title}</h2>
      {sub ? <p>{sub}</p> : null}
    </QHead>
  );
}

function Welcome({ firstName, trialDays, target }) {
  return (
    <Hero>
      <div>
        <Badge>★ {trialDays ? `Pro · your free ${trialDays === 7 ? 'week' : `${trialDays} days`} started` : 'Welcome to Pro'}</Badge>
        <h1>
          {firstName ? `${firstName}, let's` : "Let's"} build your <em>pitch machine</em>.
        </h1>
        <p>
          Four quick choices. I&apos;ll learn how you sound and what makes you worth gifting, then pitch {target} brands
          a month with emails that read like you wrote each one. When you chat with me, I use the same choices.
        </p>
        <Plan>
          <li><span className="ic">✍️</span><b>Your voice</b><span>30s</span></li>
          <li><span className="ic">🎁</span><b>Your offer</b><span>20s</span></li>
          <li><span className="ic">⭐</span><b>Your best work</b><span>30s</span></li>
          <li><span className="ic">🎯</span><b>Your brands</b><span>15s</span></li>
          <li><span className="ic">👀</span><b>See a real pitch, then go live</b><span>30s</span></li>
        </Plan>
      </div>
      <Month aria-label="What Autopilot does each month">
        <div className="row"><span>Each month on Autopilot</span></div>
        <b>{target} brands</b>
        <div className="row"><span>A pitch written for each brand</span><Check size={16} /></div>
        <div className="row"><span>Follow-ups on day 4 and day 10</span><Check size={16} /></div>
        <div className="row"><span>Sent from your own Gmail</span><Check size={16} /></div>
        <div className="row"><span>Nothing to approve</span><Check size={16} /></div>
      </Month>
    </Hero>
  );
}

function VoiceStep({ form, set, tones, single }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [example, setExample] = useState('');

  const learn = async () => {
    setBusy(true);
    setErr('');
    try {
      const res = await apiClient.post('/api/polly/autopilot/setup/sample', { sample: form.sample });
      set({ styleRules: res.data.rules || [], styleSummary: res.data.summary || '' });
      setExample(res.data.example_opener || '');
    } catch (e) {
      setErr(e.response?.data?.error || "I couldn't read that one. Try a longer caption or email.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Q single={single} k="1 → Your voice" title="How should your pitches sound?"
        sub="Brands reply to people, not templates. Pick a tone or let me learn yours." />
      <Seg role="group" aria-label="Voice">
        <Opt type="button" aria-pressed={form.voice === 'preset'} onClick={() => set({ voice: 'preset' })}>
          <span className="l">A</span>
          <span>Pick a tone<small>Six styles, each with an example</small></span>
          <Check className="ck" size={18} />
        </Opt>
        <Opt type="button" aria-pressed={form.voice === 'sample'} onClick={() => set({ voice: 'sample' })}>
          <span className="l">B</span>
          <span>Write like me<small>Paste a caption or an email you wrote. I&apos;ll copy your style</small></span>
          <Check className="ck" size={18} />
        </Opt>
      </Seg>
      {form.voice === 'preset' ? (
        <Tones role="group" aria-label="Tone">
          {tones.map((tone) => (
            <Tone key={tone.id} type="button" aria-pressed={form.tone === tone.id} onClick={() => set({ tone: tone.id })}>
              <b>{tone.emoji} {tone.label}</b>
              <i>&ldquo;{tone.example}&rdquo;</i>
            </Tone>
          ))}
        </Tones>
      ) : (
        <div>
          <Field
            as="textarea"
            aria-label="Your writing sample"
            placeholder="Paste a caption, a DM or an email you wrote: 2 or 3 sentences is plenty."
            value={form.sample}
            onChange={(e) => set({ sample: e.target.value })}
            maxLength={1500}
          />
          <Row>
            <Btn type="button" onClick={learn} disabled={busy || form.sample.trim().split(/\s+/).length < 12}>
              {busy ? 'Reading your style…' : form.styleRules.length ? 'Learn it again' : 'Learn my style'}
            </Btn>
            <Small>I keep it clear for brands: no all-lowercase or slang they might misread.</Small>
          </Row>
          {err ? <ErrorNote role="alert">{err}</ErrorNote> : null}
          {form.styleRules.length > 0 && (
            <Box style={{ marginTop: 14 }}>
              <h3>
                {form.styleSummary || 'Your style'}
                <ChipTag style={{ marginLeft: 8 }}>✓ Saved for every pitch</ChipTag>
              </h3>
              <Learned>{form.styleRules.map((r) => <ChipTag key={r} $soft>{r}</ChipTag>)}</Learned>
              {example ? (
                <>
                  <Small>How your pitches will open:</Small>
                  <Quote>{example}</Quote>
                </>
              ) : null}
              <Checks>
                <div>Every pitch is still checked before it sends: under 120 words, one idea, a clear ask</div>
                <div>Never invents numbers or experiences you didn&apos;t share</div>
              </Checks>
            </Box>
          )}
        </div>
      )}
    </>
  );
}

function OfferStep({ form, set, options, single }) {
  return (
    <>
      <Q single={single} k="2 → Your offer" title="What do you offer brands?"
        sub="I'll ask for the right thing, and switch to your paid rate when a brand pays creators." />
      <Grid2>
        <Box>
          <h3>Deal type</h3>
          <Pills role="radiogroup" aria-label="Deal type">
            {DEALS.map((d) => (
              <Pill key={d.id} type="button" role="radio" aria-checked={form.deal === d.id} onClick={() => set({ deal: d.id })}>
                {d.label}
              </Pill>
            ))}
          </Pills>
          <h3>What you create for a gifted product</h3>
          <Pills role="radiogroup" aria-label="What you create">
            {options.map((o) => (
              <Pill key={o.id} type="button" role="radio" aria-checked={form.offerType === o.id}
                onClick={() => set({ offerType: o.id })}>
                {o.label}
              </Pill>
            ))}
          </Pills>
        </Box>
        <Box>
          <h3>Ship products to</h3>
          <Small>Brands need this to send you something. Only your city and country go in pitches.</Small>
          <Field aria-label="City" placeholder="City" value={form.city} onChange={(e) => set({ city: e.target.value })} />
          <Field aria-label="Country" placeholder="Country" value={form.country}
            onChange={(e) => set({ country: e.target.value })} />
          <Note>💡 Paid pitches use the rate on your media kit. You can change it there any time.</Note>
        </Box>
      </Grid2>
    </>
  );
}

function WorkStep({ form, set, data, single }) {
  const [link, setLink] = useState('');
  const [linkErr, setLinkErr] = useState('');
  const stats = data.stats || {};
  const posts = useMemo(() => {
    const known = data.posts || [];
    const extra = form.posts.filter((u) => !known.some((p) => p.post_url === u)).map((u) => ({ post_url: u }));
    return [...extra, ...known];
  }, [data.posts, form.posts]);

  const toggle = (url) => {
    const on = form.posts.includes(url);
    if (on) set({ posts: form.posts.filter((u) => u !== url) });
    else set({ posts: [...form.posts, url].slice(-MAX_POSTS) });
  };
  const addLink = (e) => {
    e.preventDefault();
    const url = cleanPostUrl(link);
    if (!url) { setLinkErr('Paste a TikTok, Instagram or YouTube link.'); return; }
    setLinkErr('');
    setLink('');
    if (!form.posts.includes(url)) set({ posts: [...form.posts, url].slice(-MAX_POSTS) });
  };
  const eng = engagementLabel(stats.engagement);

  return (
    <>
      <Q single={single} k="3 → Your best work" title="What should brands see first?"
        sub="I picked your strongest posts. Swap them for any two you're proud of." />
      <Box style={{ marginBottom: 14 }}>
        <h3>Lead with these 2 posts <ChipTag $gold style={{ marginLeft: 8 }}>{form.posts.length}/{MAX_POSTS} picked</ChipTag></h3>
        {posts.length ? (
          <Posts>
            {posts.slice(0, 8).map((p) => {
              const on = form.posts.includes(p.post_url);
              return (
                <Post key={p.post_url} type="button" aria-pressed={on} onClick={() => toggle(p.post_url)}
                  aria-label={`${on ? 'Remove' : 'Use'} post${p.views ? ` with ${fmt(p.views)} views` : ''}`}>
                  {p.thumbnail_url ? <img src={p.thumbnail_url} alt="" loading="lazy" /> : <span className="ph">Link</span>}
                  {on ? <em><Check size={12} /></em> : null}
                  {p.views ? <span className="v">▶ {fmt(p.views)}</span> : null}
                </Post>
              );
            })}
          </Posts>
        ) : <Small>I don&apos;t see your posts yet. Paste links to your two best below.</Small>}
        <LinkForm onSubmit={addLink}>
          <Field aria-label="Add a post by link" placeholder="Or paste a link: tiktok.com/@you/video/…" value={link}
            onChange={(e) => setLink(e.target.value)} />
          <Btn type="submit" disabled={!link.trim()}>Add</Btn>
        </LinkForm>
        {linkErr ? <ErrorNote role="alert">{linkErr}</ErrorNote> : null}
      </Box>
      <Grid2>
        <Box>
          <h3>Stats in your pitch</h3>
          {stats.avg_views ? <Stat><span>Avg views per video</span><b>{stats.avg_views}</b></Stat> : null}
          {stats.followers ? <Stat><span>Followers</span><b>{fmt(stats.followers)}</b></Stat> : null}
          {eng ? (
            stats.engagement_strong ? (
              <Toggle>
                <input type="checkbox" checked={form.showEngagement} onChange={(e) => set({ showEngagement: e.target.checked })} />
                <span>Lead with my {eng} engagement</span>
              </Toggle>
            ) : (
              <Stat><span>Engagement {eng} <small>· below average, I leave it out</small></span><ChipTag $warn>Hidden</ChipTag></Stat>
            )
          ) : null}
          {!stats.avg_views && !stats.followers ? <Small>I&apos;ll add your stats once your profile syncs.</Small> : null}
        </Box>
        <Box>
          <h3>A win to mention <Small as="span">(optional)</Small></h3>
          <Field as="textarea" style={{ minHeight: 84 }} aria-label="Your best result with a brand"
            placeholder="e.g. My video for a skincare brand drove 300+ link clicks in 48 hours."
            value={form.win} maxLength={160} onChange={(e) => set({ win: e.target.value })} />
          <Small>Only real results. I&apos;ll use it word for word.</Small>
        </Box>
      </Grid2>
    </>
  );
}

function BrandsStep({ form, set, data, single }) {
  const options = Array.from(new Set([...(form.niches || []), ...(data.niche_options || [])]));
  const toggle = (id) => {
    const on = form.niches.includes(id);
    if (on) set({ niches: form.niches.filter((n) => n !== id) });
    else if (form.niches.length < MAX_NICHES) set({ niches: [...form.niches, id] });
  };
  return (
    <>
      <Q single={single} k="4 → Your brands" title="Who should I pitch?"
        sub="I pick brands in your niches that gift or pay creators your size, each with a verified inbox." />
      <Grid2>
        <Box>
          <h3>Niches <Small as="span">(up to {MAX_NICHES})</Small></h3>
          <Pills role="group" aria-label="Niches">
            {options.map((id) => {
              const on = form.niches.includes(id);
              return (
                <Pill key={id} type="button" aria-pressed={on} disabled={!on && form.niches.length >= MAX_NICHES}
                  onClick={() => toggle(id)}>
                  {NICHE_LABEL(id)}
                </Pill>
              );
            })}
          </Pills>
        </Box>
        <Box>
          <h3>Brands a month</h3>
          <Pills role="radiogroup" aria-label="Brands a month">
            {TARGETS.map((n) => (
              <Pill key={n} type="button" role="radio" aria-checked={form.target === n} onClick={() => set({ target: n })}>
                {n}{n === 60 ? ' · recommended' : ''}
              </Pill>
            ))}
          </Pills>
          <Note>I send every weekday, at the hours brands read email, and never pitch the same brand twice.</Note>
        </Box>
      </Grid2>
    </>
  );
}

function PitchStep({ cache, setCache }) {
  const [res, setResLocal] = useState(cache);
  const setRes = useCallback((v) => setResLocal((cur) => {
    const nextRes = typeof v === 'function' ? v(cur) : v;
    setCache(nextRes);
    return nextRes;
  }), [setCache]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(!cache);
  const [tab, setTab] = useState(0);
  const [angle, setAngle] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(cache ? { subject: cache.item.subject, body: cache.item.body } : null);

  const load = useCallback(async (nextAngle, brandId) => {
    setBusy(true);
    setErr('');
    setEditing(false);
    try {
      const r = await apiClient.post('/api/polly/autopilot/setup/preview', { angle: nextAngle, brand_id: brandId });
      setRes(r.data);
      setDraft({ subject: r.data.item.subject, body: r.data.item.body });
      setTab(0);
    } catch (e) {
      const code = e.response?.data?.error;
      setErr(ERRORS[code] || (typeof code === 'string' && code.length < 140 ? code : "I couldn't write it just now. Try again in a moment."));
    } finally {
      setBusy(false);
    }
  }, [setRes]);

  // Written once per setup: coming back to this step shows the same pitch instead of drafting a new brand.
  useEffect(() => { if (!cache) load(0); }, [load]); // eslint-disable-line react-hooks/exhaustive-deps

  const another = () => {
    const n = angle + 1;
    setAngle(n);
    load(n, res?.item?.brand_id);
  };

  const saveEdit = async () => {
    try {
      await apiClient.patch(`/api/polly/autopilot/items/${res.item.id}`, draft);
      setRes((r) => ({ ...r, item: { ...r.item, ...draft } }));
      setEditing(false);
    } catch (_) {
      setErr("Your edit didn't save. Try again.");
    }
  };

  const item = res?.item;
  const mails = item ? [
    { subject: item.subject, body: item.body },
    ...(res.followups || []),
  ] : [];
  const mail = mails[tab];
  const words = item ? item.body.replace(/https?:\/\/\S+/g, ' ').split(/\s+/).filter(Boolean).length : 0;

  return (
    <>
      <Q k="5 → Your first pitch" title="Here's a real pitch I'd send today."
        sub="Written for this brand's product, in your voice. Edit anything, or ask for another angle." />
      {busy && !item ? (
        <Writing aria-live="polite"><RefreshCw size={18} className="spin" /> Picking your best match and writing your pitch…</Writing>
      ) : err && !item ? (
        <ErrorNote role="alert">{err}</ErrorNote>
      ) : item ? (
        <Preview>
          <div>
            <Tabs role="tablist" aria-label="Emails">
              {['Pitch', 'Day 4 follow-up', 'Day 10 follow-up'].slice(0, mails.length).map((l, i) => (
                <button key={l} type="button" role="tab" aria-selected={tab === i} onClick={() => { setTab(i); setEditing(false); }}>{l}</button>
              ))}
            </Tabs>
            <Mail aria-busy={busy}>
              <div className="h">
                <span>To: {item.brand_name}{item.to_email ? ` · ${item.to_email}` : ''}</span>
                {editing && tab === 0 ? (
                  <Field aria-label="Subject" value={draft.subject} onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))} />
                ) : <b>{mail.subject}</b>}
              </div>
              {editing && tab === 0 ? (
                <Field as="textarea" aria-label="Pitch" style={{ minHeight: 260, border: 0, borderRadius: 0 }}
                  value={draft.body} onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))} />
              ) : <div className="b">{mail.body}</div>}
            </Mail>
            <Row>
              {editing ? (
                <>
                  <Btn $primary type="button" onClick={saveEdit}>Save edit</Btn>
                  <Btn type="button" onClick={() => { setEditing(false); setDraft({ subject: item.subject, body: item.body }); }}>Cancel</Btn>
                </>
              ) : (
                <>
                  <Btn type="button" onClick={another} disabled={busy}>
                    <RefreshCw size={15} className={busy ? 'spin' : ''} /> {busy ? 'Writing…' : 'Try another angle'}
                  </Btn>
                  {tab === 0 && <Btn type="button" onClick={() => setEditing(true)} disabled={busy}><Pencil size={15} /> Edit</Btn>}
                </>
              )}
            </Row>
            {err ? <ErrorNote role="alert">{err}</ErrorNote> : null}
          </div>
          <Side>
            <Box>
              <h3>Send-ready checks <ChipTag style={{ marginLeft: 6 }}>{words} words</ChipTag></h3>
              <Checks>
                {(res.checks || []).filter((c) => c.ok).map((c) => <div key={c.label}>{c.label}</div>)}
              </Checks>
            </Box>
            <Box>
              <h3>Every pitch after this</h3>
              <Checks>
                <div>A new product idea for each brand, never the same email twice</div>
                <div>Subject lines rotate, and I keep the ones brands open</div>
                <div>I stop following up the moment a brand replies</div>
              </Checks>
            </Box>
          </Side>
        </Preview>
      ) : null}
    </>
  );
}

function LiveStep({ connected, email, returnReason }) {
  return (
    <>
      <Q k="6 → Go live" title={connected ? "You're all set. Switch it on." : "Connect Gmail and I'll start today."}
        sub="Pitches go from your own address, so replies land in your inbox." />
      <Grid2>
        {connected ? (
          <GmailBox>
            <b><Check size={16} /> Gmail connected{email ? `: ${email}` : ''}</b>
            <Small>Your first pitches go out within the hour of switching on.</Small>
          </GmailBox>
        ) : (
          <GmailBox>
            {returnReason === 'gmail_scope' ? (
              <ErrorNote role="alert">Google didn&apos;t give me permission to send. Tick the box below on the Google screen, then Continue.</ErrorNote>
            ) : <b>On the Google screen, tick this box:</b>}
            <Consent aria-hidden="true"><span>Send email on your behalf</span><span className="bx"><Check size={14} /></span></Consent>
            <Small>That&apos;s the only permission I ask for. I can&apos;t read your inbox.</Small>
          </GmailBox>
        )}
        <Box>
          <h3>I run it all for you</h3>
          <Checks>
            <div>New brands every weekday, at the hours brands read email</div>
            <div>Follow-ups on day 4 and day 10, each with a new angle</div>
            <div>Dead inboxes swapped for verified ones before sending</div>
            <div>Nothing to approve. Change your style any time in Preferences</div>
          </Checks>
        </Box>
      </Grid2>
    </>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const rise = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; }`;
const spin = keyframes`to { transform: rotate(360deg); }`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1300;
  background: rgba(18, 20, 26, 0.45);
  display: grid;
  place-items: center;
  padding: 24px;
  animation: ${fadeIn} 0.2s ease both;
  @media (max-width: 640px) { padding: 0; }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
const Dialog = styled.div`
  width: min(1040px, 100%);
  height: min(760px, calc(100dvh - 48px));
  background: ${t.white};
  border-radius: 24px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.22);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  outline: none;
  font-family: ${t.fontSans};
  color: ${t.ink};
  animation: ${rise} 0.25s ease both;
  ${(p) => p.$single && css`width: min(760px, 100%); height: auto; max-height: calc(100dvh - 48px);`}
  @media (max-width: 640px) {
    width: 100%;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }
  @media (prefers-reduced-motion: reduce) { animation: none; }
  h1, h2, h3 { margin: 0; letter-spacing: -0.01em; }
`;
const Top = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid ${t.line};
  padding-top: max(12px, env(safe-area-inset-top));
  > :last-child { justify-self: end; }
  .title { font-weight: 700; font-size: 15px; }
`;
const IconBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font: inherit;
  font-weight: 600;
  font-size: 14px;
  color: ${t.muted};
  background: none;
  border: 0;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  justify-self: start;
  &:hover { color: ${t.ink}; background: ${t.paper}; }
  &:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }
  @media (max-width: 420px) { span { display: none; } }
`;
const Bars = styled.div`
  display: flex;
  gap: 6px;
  i { width: 40px; height: 5px; border-radius: 99px; background: ${t.line}; transition: background 0.2s; }
  i.on { background: ${t.accent}; }
  @media (max-width: 640px) { i { width: 22px; } }
`;
const Body = styled.div`
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 28px clamp(16px, 4vw, 44px) 32px;
  min-width: 0;
`;
const StepView = styled.div`
  animation: ${rise} 0.3s ease both;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
const Foot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  border-top: 1px solid ${t.line};
  background: ${t.white};
  .hint { color: ${t.muted}; font-size: 13px; }
  .actions { display: flex; gap: 8px; margin-left: auto; }
  @media (max-width: 640px) {
    .hint { display: none; }
    .actions { width: 100%; }
    .actions button:last-child { flex: 1; }
  }
`;
const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font: inherit;
  font-weight: 700;
  font-size: 15px;
  border-radius: 14px;
  padding: 12px 18px;
  min-height: 46px;
  cursor: pointer;
  border: 1px solid ${(p) => (p.$primary ? t.ink : t.line)};
  background: ${(p) => (p.$primary ? t.ink : t.white)};
  color: ${(p) => (p.$primary ? '#fff' : t.ink)};
  &:disabled { opacity: 0.45; cursor: default; }
  &:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }
  .spin { animation: ${spin} 1s linear infinite; }
`;
const QHead = styled.div`
  display: grid;
  gap: 6px;
  margin-bottom: 20px;
  .k { font-size: 12px; font-weight: 700; letter-spacing: 0.04em; color: ${t.accent}; }
  h2 { font-family: ${t.fontDisplay}; font-weight: 400; font-size: clamp(28px, 3.4vw, 38px); line-height: 1.1; }
  p { margin: 0; color: ${t.muted}; font-size: 15px; }
`;
const Hero = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 28px;
  align-items: center;
  h1 { font-family: ${t.fontDisplay}; font-weight: 400; font-size: clamp(34px, 4.6vw, 52px); line-height: 1.02; margin: 14px 0 12px; }
  h1 em { font-style: italic; color: ${t.accent}; }
  p { margin: 0 0 18px; color: ${t.muted}; font-size: 16px; line-height: 1.5; }
  @media (max-width: 760px) { grid-template-columns: 1fr; gap: 20px; }
`;
const Badge = styled.span`
  display: inline-flex;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #8a5b0c;
  background: #fbf1dc;
  padding: 5px 11px;
  border-radius: 999px;
`;
const Plan = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
  li { display: grid; grid-template-columns: 30px 1fr auto; gap: 10px; align-items: center; padding: 10px 12px; border-radius: 14px; background: ${t.paper}; font-size: 15px; }
  li > span:last-child { font-size: 12px; color: ${t.muted}; }
  .ic { width: 30px; height: 30px; border-radius: 9px; display: grid; place-items: center; background: ${t.accentSoft}; font-size: 15px; }
  b { font-weight: 600; }
`;
const Month = styled.div`
  background: ${t.ink};
  color: #fff;
  border-radius: 22px;
  padding: 22px;
  display: grid;
  gap: 12px;
  .row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: rgba(255, 255, 255, 0.8); }
  .row svg { color: #7ce0b8; }
  b { font-family: ${t.fontDisplay}; font-weight: 400; font-size: 44px; line-height: 1; color: #7ce0b8; }
  @media (max-width: 760px) { b { font-size: 36px; } }
`;
const Seg = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;
const Opt = styled.button`
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 12px;
  align-items: center;
  text-align: left;
  font: inherit;
  font-weight: 600;
  padding: 13px 14px;
  border-radius: 14px;
  border: 1px solid ${t.line};
  background: ${t.white};
  color: ${t.ink};
  cursor: pointer;
  small { display: block; color: ${t.muted}; font-size: 13px; font-weight: 400; }
  .l { width: 28px; height: 28px; border-radius: 8px; border: 1px solid ${t.line}; display: grid; place-items: center; font-weight: 800; font-size: 13px; }
  .ck { opacity: 0; color: ${t.accent}; }
  &[aria-pressed='true'] { border-color: ${t.accent}; background: ${t.accentSoft}; }
  &[aria-pressed='true'] .l { background: ${t.accent}; color: #fff; border-color: ${t.accent}; }
  &[aria-pressed='true'] .ck { opacity: 1; }
  &:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }
`;
const Tones = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  @media (max-width: 760px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 440px) { grid-template-columns: 1fr; }
`;
const Tone = styled.button`
  text-align: left;
  font: inherit;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid ${t.line};
  background: ${t.white};
  color: ${t.ink};
  cursor: pointer;
  display: grid;
  gap: 6px;
  align-content: start;
  transition: background 0.15s, border-color 0.15s;
  b { font-size: 14.5px; font-weight: 700; }
  i { font-size: 13px; color: ${t.muted}; line-height: 1.4; }
  &:hover { border-color: ${t.accentBorder}; }
  &[aria-pressed='true'] { background: ${t.accentDeep}; border-color: ${t.accentDeep}; color: #fff; }
  &[aria-pressed='true'] i { color: rgba(255, 255, 255, 0.85); }
  &:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }
`;
const Field = styled.input`
  font: inherit;
  font-size: 16px;
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${t.line};
  background: ${t.paper};
  color: ${t.ink};
  box-sizing: border-box;
  resize: vertical;
  min-height: ${(p) => (p.as === 'textarea' ? '120px' : 'auto')};
  line-height: 1.5;
  &:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 1px; }
`;
const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin-top: 10px;
`;
const Small = styled.p`
  margin: 0;
  color: ${t.muted};
  font-size: 13px;
  font-weight: 400;
`;
const Note = styled.p`
  margin: 4px 0 0;
  color: ${t.muted};
  font-size: 13px;
`;
const Box = styled.div`
  border: 1px solid ${t.line};
  border-radius: 16px;
  padding: 16px;
  display: grid;
  gap: 10px;
  align-content: start;
  background: ${t.white};
  min-width: 0;
  h3 { font-size: 16px; font-weight: 700; display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
`;
const ChipTag = styled.span`
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: ${(p) => (p.$warn ? '#fdf0e3' : p.$gold ? '#fbf1dc' : t.accentSoft)};
  color: ${(p) => (p.$warn ? '#a4500d' : p.$gold ? '#8a5b0c' : t.accentDeep)};
  ${(p) => p.$soft && css`font-weight: 600; background: ${t.paper}; color: ${t.inkSoft};`}
`;
const Learned = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;
const Quote = styled.blockquote`
  margin: 0;
  padding: 12px 14px;
  border-left: 3px solid ${t.accent};
  background: ${t.paper};
  border-radius: 0 12px 12px 0;
  font-size: 14.5px;
  line-height: 1.55;
`;
const Checks = styled.div`
  display: grid;
  gap: 8px;
  div { display: flex; gap: 8px; align-items: flex-start; font-size: 13.5px; line-height: 1.4; padding: 9px 11px; border-radius: 12px; background: ${t.paper}; }
  div::before { content: '✓'; color: ${t.accent}; font-weight: 800; }
`;
const Grid2 = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`;
const Pills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;
const Pill = styled.button`
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 13px;
  min-height: 38px;
  border-radius: 999px;
  border: 1px solid ${t.line};
  background: ${t.white};
  color: ${t.ink};
  cursor: pointer;
  &[aria-pressed='true'], &[aria-checked='true'] { background: ${t.ink}; color: #fff; border-color: ${t.ink}; }
  &:disabled { opacity: 0.4; cursor: default; }
  &:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }
`;
const Posts = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  @media (max-width: 640px) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
`;
const Post = styled.button`
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: 12px;
  border: 2px solid transparent;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  background: linear-gradient(160deg, #cfd8d4, #6d7d77);
  font: inherit;
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ph { position: absolute; inset: 0; display: grid; place-items: center; color: #fff; font-weight: 700; font-size: 13px; }
  .v { position: absolute; left: 7px; bottom: 6px; color: #fff; font-size: 12px; font-weight: 800; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7); }
  em { position: absolute; right: 6px; top: 6px; width: 22px; height: 22px; border-radius: 50%; background: ${t.accent}; color: #fff; display: grid; place-items: center; }
  &[aria-pressed='true'] { border-color: ${t.accent}; box-shadow: 0 0 0 2px ${t.accent}; }
  &[aria-pressed='false'] img { opacity: 0.75; }
  &:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }
`;
const LinkForm = styled.form`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
`;
const Stat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  padding: 9px 11px;
  border-radius: 10px;
  background: ${t.paper};
  small { color: ${t.muted}; font-size: 12px; }
`;
const Toggle = styled.label`
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 14px;
  padding: 9px 11px;
  border-radius: 10px;
  background: ${t.paper};
  cursor: pointer;
  input { width: 18px; height: 18px; accent-color: ${t.accent}; }
`;
const Preview = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr);
  gap: 16px;
  @media (max-width: 860px) { grid-template-columns: 1fr; }
`;
const Side = styled.div`
  display: grid;
  gap: 14px;
  align-content: start;
`;
const Tabs = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  overflow-x: auto;
  button { flex-shrink: 0; font: inherit; font-size: 13px; font-weight: 700; padding: 7px 12px; border-radius: 999px; border: 1px solid ${t.line}; background: ${t.white}; color: ${t.muted}; cursor: pointer; }
  button[aria-selected='true'] { background: ${t.ink}; color: #fff; border-color: ${t.ink}; }
`;
const Mail = styled.div`
  border: 1px solid ${t.line};
  border-radius: 18px;
  overflow: hidden;
  background: ${t.white};
  .h { padding: 12px 16px; border-bottom: 1px solid ${t.line}; display: grid; gap: 4px; font-size: 13.5px; }
  .h span { color: ${t.muted}; overflow-wrap: anywhere; }
  .h b { font-size: 15px; }
  .b { padding: 16px; font-size: 14.5px; line-height: 1.6; white-space: pre-line; overflow-wrap: anywhere; }
  &[aria-busy='true'] .b { opacity: 0.5; }
`;
const GmailBox = styled.div`
  display: grid;
  gap: 10px;
  align-content: start;
  padding: 16px;
  border-radius: 16px;
  background: ${t.paper};
  b { display: flex; gap: 6px; align-items: center; }
`;
const Consent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 14px;
  .bx { width: 22px; height: 22px; border-radius: 6px; background: #1a73e8; color: #fff; display: grid; place-items: center; }
`;
const Writing = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px;
  border-radius: 16px;
  background: ${t.paper};
  color: ${t.muted};
  .spin { animation: ${spin} 1s linear infinite; }
`;
const Done = styled.div`
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 10px;
  padding: 60px 0;
  .ok { width: 76px; height: 76px; border-radius: 50%; background: ${t.accentSoft}; color: ${t.accentDeep}; display: grid; place-items: center; }
  h2 { font-family: ${t.fontDisplay}; font-weight: 400; font-size: 38px; }
  p { margin: 0; color: ${t.muted}; max-width: 380px; }
`;
const Loading = styled.p`
  color: ${t.muted};
  text-align: center;
  padding: 40px 0;
`;
const ErrorNote = styled.p`
  margin: 10px 0 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fdf0e3;
  color: #8a3f08;
  font-size: 14px;
`;
