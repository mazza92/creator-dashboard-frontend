'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { suggestRates } from '../../kit-builder/pricingOffers';
import { API, PLATFORMS, REGIONS } from './_catalog';

const ink = '#0f172a';
const muted = '#475569';
const box = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, boxShadow: '0 1px 2px rgba(15,23,42,.04)' };
const label = { display: 'block', fontSize: 13, fontWeight: 700, color: ink, margin: '12px 0 6px' };
const input = { width: '100%', boxSizing: 'border-box', padding: '11px 12px', border: '1px solid #cbd5e1', borderRadius: 10, fontSize: 16, fontFamily: 'inherit', color: ink, background: '#fff' };
const btn = { marginTop: 16, width: '100%', padding: '13px 16px', border: 0, borderRadius: 12, background: ink, color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' };
const small = { fontSize: 13, color: muted };
const out = { marginTop: 18, padding: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' };
const copyBtn = { border: '1px solid #cbd5e1', background: '#fff', borderRadius: 8, padding: '6px 10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: ink };

function Field({ id, name, children }) {
  return (
    <div>
      <label htmlFor={id} style={label}>{name}</label>
      {children}
    </div>
  );
}

function Copy({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      style={copyBtn}
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { setDone(false); }
      }}
    >
      {done ? 'Copied' : 'Copy'}
    </button>
  );
}

function PortfolioNudge() {
  return (
    <p style={{ ...small, marginTop: 14 }}>
      Next step: put your samples and rates on a <Link href="/media-kit?utm_source=tools&utm_medium=organic" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>free UGC portfolio</Link> so brands can say yes.
    </p>
  );
}

function AiTool({ kind, defaults }) {
  const [form, setForm] = useState({
    product: defaults.product || '', niche: defaults.niche || '', audience: defaults.audience || '',
    benefit: defaults.benefit || '', brand: '', platform: defaults.platform || 'any',
  });
  const [state, setState] = useState({ loading: false, error: '', result: null });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function run(e) {
    e.preventDefault();
    if (!form.product.trim()) { setState({ loading: false, error: 'Add the product first.', result: null }); return; }
    setState({ loading: true, error: '', result: null });
    try {
      const res = await fetch(`${API}/${kind}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Try again.');
      setState({ loading: false, error: '', result: data });
    } catch (err) {
      setState({ loading: false, error: err.message || 'Something went wrong. Try again.', result: null });
    }
  }

  const r = state.result;
  const scriptText = r?.beats ? r.beats.map((b) => `${b.time} ${b.beat}: ${b.line}\nShot: ${b.shot}`).join('\n\n') : '';
  const pitchText = r?.body ? `Subject: ${r.subject}\n\n${r.body}` : '';

  return (
    <form style={box} onSubmit={run}>
      {kind === 'pitch' && (
        <Field id="t-brand" name="Brand">
          <input id="t-brand" style={input} value={form.brand} onChange={set('brand')} placeholder="e.g. Glow Recipe" maxLength={60} />
        </Field>
      )}
      <Field id="t-product" name="Product">
        <input id="t-product" style={input} value={form.product} onChange={set('product')} placeholder="e.g. vitamin C serum" maxLength={80} required />
      </Field>
      <Field id="t-niche" name="Your niche">
        <input id="t-niche" style={input} value={form.niche} onChange={set('niche')} placeholder="e.g. skincare" maxLength={40} />
      </Field>
      {kind !== 'pitch' && (
        <Field id="t-aud" name={kind === 'script' ? 'What it does for you' : 'Who it is for'}>
          {kind === 'script' ? (
            <input id="t-aud" style={input} value={form.benefit} onChange={set('benefit')} placeholder="e.g. makes my skin look brighter" maxLength={120} />
          ) : (
            <input id="t-aud" style={input} value={form.audience} onChange={set('audience')} placeholder="e.g. busy parents" maxLength={80} />
          )}
        </Field>
      )}
      <Field id="t-platform" name="Platform">
        <select id="t-platform" style={input} value={form.platform} onChange={set('platform')}>
          <option value="any">TikTok and Reels</option>
          {Object.values(PLATFORMS).map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </Field>
      <button type="submit" style={{ ...btn, opacity: state.loading ? 0.7 : 1 }} disabled={state.loading}>
        {state.loading ? 'Writing…' : kind === 'hooks' ? 'Generate 10 hooks' : kind === 'script' ? 'Write my script' : 'Write my pitch'}
      </button>
      <p style={{ ...small, marginTop: 8 }}>Free. No signup. Nothing you type is published.</p>
      {state.error && <p style={{ color: '#b91c1c', fontWeight: 600 }} role="alert">{state.error}</p>}

      {r?.hooks && (
        <div style={out} aria-live="polite">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Your hooks</strong><Copy text={r.hooks.join('\n')} />
          </div>
          <ol style={{ paddingLeft: 20, margin: '10px 0 0', color: ink }}>{r.hooks.map((h) => <li key={h} style={{ marginBottom: 6 }}>{h}</li>)}</ol>
          <PortfolioNudge />
        </div>
      )}
      {r?.beats && (
        <div style={out} aria-live="polite">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Your 30-second script</strong><Copy text={scriptText} />
          </div>
          {r.beats.map((b) => (
            <div key={b.beat + b.time} style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700 }}>{b.time} · {b.beat}</div>
              <div style={{ color: ink }}>{b.line}</div>
              <div style={small}>Shot: {b.shot}</div>
            </div>
          ))}
          {r.alt_hooks?.length ? <p style={{ ...small, marginTop: 12 }}>Alternative hooks: {r.alt_hooks.join(' / ')}</p> : null}
          <PortfolioNudge />
        </div>
      )}
      {r?.body && (
        <div style={out} aria-live="polite">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Your pitch email</strong><Copy text={pitchText} />
          </div>
          <p style={{ margin: '10px 0 6px', fontWeight: 600 }}>Subject: {r.subject}</p>
          <div style={{ whiteSpace: 'pre-wrap', color: ink }}>{r.body}</div>
          <PortfolioNudge />
        </div>
      )}
    </form>
  );
}

const USAGE = { none: ['Organic only (brand’s own channels)', 0], d30: ['Paid ads, 30 days', 0.4], d90: ['Paid ads, 90 days', 0.8], forever: ['Perpetual usage', 1.5] };

function round5(n) { return Math.max(5, Math.round(n / 5) * 5); }

function RateCalculator({ defaults }) {
  const [f, setF] = useState({ region: defaults.region || 'us', followers: 2000, deliverable: 'ugc', videos: 1, usage: 'none', hooks: 0, raw: false, whitelist: false, rush: false });
  const set = (k, num) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : num ? Number(e.target.value) : e.target.value });
  const reg = REGIONS[f.region];

  const calc = useMemo(() => {
    const s = suggestRates(f.followers);
    const base = f.deliverable === 'ugc' ? Math.max(75, s.reel) : s[f.deliverable];
    let per = base * (1 + USAGE[f.usage][1]);
    if (f.raw) per += base * 0.35;
    if (f.rush) per += base * 0.25;
    per += f.hooks * 25;
    const monthly = f.whitelist ? base * 0.5 : 0;
    const total = per * f.videos;
    const conv = (n) => round5(n * reg.rate);
    return { per: conv(per), low: conv(total * 0.85), high: conv(total * 1.2), monthly: monthly ? conv(monthly) : 0 };
  }, [f, reg]);

  const money = (n) => `${reg.symbol}${n.toLocaleString('en-US')}`;
  const summary = `${f.videos} UGC video${f.videos > 1 ? 's' : ''}${f.hooks ? ` + ${f.hooks} extra hook${f.hooks > 1 ? 's' : ''}` : ''}, ${USAGE[f.usage][0].toLowerCase()}${f.raw ? ', raw footage' : ''}${f.rush ? ', rush delivery' : ''}: ${money(calc.low)} to ${money(calc.high)} ${reg.currency}${calc.monthly ? `, plus ${money(calc.monthly)}/month for whitelisting` : ''}.`;

  return (
    <div style={box}>
      <Field id="r-region" name="Where the brand is">
        <select id="r-region" style={input} value={f.region} onChange={set('region')}>
          {Object.entries(REGIONS).map(([k, v]) => <option key={k} value={k}>{v.label} ({v.currency})</option>)}
        </select>
      </Field>
      <Field id="r-followers" name="Your followers (main platform)">
        <input id="r-followers" type="number" min={0} step={100} style={input} value={f.followers} onChange={set('followers', true)} />
      </Field>
      <Field id="r-deliv" name="Deliverable">
        <select id="r-deliv" style={input} value={f.deliverable} onChange={set('deliverable')}>
          <option value="ugc">UGC video (brand posts it)</option>
          <option value="reel">Instagram Reel on your account</option>
          <option value="tiktok">TikTok on your account</option>
          <option value="photo">Photo</option>
        </select>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field id="r-videos" name="How many">
          <input id="r-videos" type="number" min={1} max={20} style={input} value={f.videos} onChange={set('videos', true)} />
        </Field>
        <Field id="r-hooks" name="Extra hooks each">
          <input id="r-hooks" type="number" min={0} max={5} style={input} value={f.hooks} onChange={set('hooks', true)} />
        </Field>
      </div>
      <Field id="r-usage" name="Usage">
        <select id="r-usage" style={input} value={f.usage} onChange={set('usage')}>
          {Object.entries(USAGE).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}
        </select>
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12, fontSize: 15 }}>
        <label><input type="checkbox" checked={f.raw} onChange={set('raw')} /> Raw footage</label>
        <label><input type="checkbox" checked={f.whitelist} onChange={set('whitelist')} /> Whitelisting / Spark Ads</label>
        <label><input type="checkbox" checked={f.rush} onChange={set('rush')} /> Rush (under 72h)</label>
      </div>
      <div style={out} aria-live="polite">
        <div style={small}>Suggested price</div>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.02em' }}>{money(calc.low)} – {money(calc.high)} <span style={{ fontSize: 16, fontWeight: 600, color: muted }}>{reg.currency}</span></div>
        <div style={small}>About {money(calc.per)} per video{calc.monthly ? ` · plus ${money(calc.monthly)} per month for whitelisting` : ''}</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 }}>
          <Copy text={summary} /><span style={small}>Copies a one-line quote for your reply.</span>
        </div>
        {reg.currency !== 'USD' && <p style={{ ...small, marginTop: 10 }}>Converted from USD at an approximate rate; check today’s rate before quoting.</p>}
        <PortfolioNudge />
      </div>
    </div>
  );
}

export default function ToolWidget({ kind, defaults = {} }) {
  return kind === 'rates' ? <RateCalculator defaults={defaults} /> : <AiTool kind={kind} defaults={defaults} />;
}
