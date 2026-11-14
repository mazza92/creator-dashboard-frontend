'use client';

import Link from 'next/link';
import LandingPageLayoutNext from '../components/LandingPageLayoutNext';

const ink = '#0f172a';
const muted = '#475569';
const wrap = { maxWidth: 1080, margin: '0 auto', padding: '170px 20px 72px', color: ink, lineHeight: 1.6 };
const h1 = { fontSize: 'clamp(28px, 5vw, 42px)', letterSpacing: '-.03em', lineHeight: 1.12, margin: '8px 0 14px' };
const h2 = { fontSize: 'clamp(20px, 3vw, 26px)', letterSpacing: '-.02em', margin: '48px 0 12px' };
const chip = (active) => ({
  display: 'inline-block', padding: '8px 14px', borderRadius: 999, margin: '0 8px 8px 0', fontSize: 14, fontWeight: 600,
  textDecoration: 'none', border: '1px solid #e2e8f0', background: active ? ink : '#fff', color: active ? '#fff' : ink,
});
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14, marginTop: 20 };
const card = { display: 'flex', gap: 12, alignItems: 'center', padding: 14, border: '1px solid #e2e8f0', borderRadius: 14, background: '#fff', textDecoration: 'none', color: ink };
const avatar = { width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flex: '0 0 52px', background: '#e2e8f0' };
const btn = { display: 'inline-block', background: ink, color: '#fff', padding: '13px 20px', borderRadius: 12, fontWeight: 700, textDecoration: 'none' };
const a = { color: '#4f46e5', fontWeight: 600, textDecoration: 'none' };

function initials(handle) {
  return (handle || '?').replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase();
}

export default function PortfolioHubView({ title, intro, hubs, activeHub, creators, total, canonicalUrl }) {
  return (
    <LandingPageLayoutNext canonicalUrl={canonicalUrl}>
      <main style={{ background: '#f8fafc' }}>
        <div style={wrap}>
          <nav aria-label="Breadcrumb" style={{ fontSize: 14, color: muted }}>
            <Link href="/" style={{ color: muted, textDecoration: 'none' }}>Home</Link>
            {' / '}
            {activeHub ? (
              <Link href="/ugc-portfolio-examples" style={{ color: muted, textDecoration: 'none' }}>UGC portfolio examples</Link>
            ) : 'UGC portfolio examples'}
          </nav>
          <h1 style={h1}>{title}</h1>
          <p style={{ color: muted, maxWidth: 760, fontSize: 17, margin: 0 }}>{intro}</p>
          <p style={{ color: muted, maxWidth: 760, fontSize: 15 }}>
            Every portfolio here belongs to a creator approved on Newcollab in the last 30 days, with real sample posts on
            their page. {total ? `${total} portfolios right now.` : ''}
          </p>

          <div style={{ marginTop: 22 }}>
            <Link href="/ugc-portfolio-examples" style={chip(!activeHub)}>All niches</Link>
            {hubs.filter((h) => h.count > 0).map((h) => (
              <Link key={h.slug} href={`/ugc-portfolio-examples/${h.slug}`} style={chip(activeHub === h.slug)}>
                {h.label} ({h.count})
              </Link>
            ))}
          </div>

          {creators.length ? (
            <div style={grid}>
              {creators.map((c) => (
                <Link key={c.slug} href={`/kit/${c.slug}`} style={card}>
                  {c.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.avatar} alt={`@${c.handle}`} style={avatar} loading="lazy" width={52} height={52} />
                  ) : (
                    <div style={{ ...avatar, display: 'grid', placeItems: 'center', fontWeight: 700, color: muted }}>{initials(c.handle)}</div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{c.handle}</div>
                    <div style={{ fontSize: 14, color: muted }}>
                      {(c.niches || []).slice(0, 2).join(' & ') || 'Lifestyle'}
                    </div>
                    <div style={{ fontSize: 13, color: muted }}>
                      {c.followers_label} followers{c.platform ? ` on ${c.platform}` : ''}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: muted, marginTop: 24 }}>New portfolios in this niche are being approved. Check back soon.</p>
          )}

          <h2 style={h2}>What these UGC portfolios have in common</h2>
          <ul style={{ color: muted, paddingLeft: 22, maxWidth: 760 }}>
            <li>Short vertical samples up front, so a brand sees the work in seconds.</li>
            <li>Clear niches, so brands know which products the creator films well.</li>
            <li>Platforms and audience size in one line, without hiding small numbers.</li>
            <li>One link the creator puts in their bio and every pitch email.</li>
          </ul>
          <p style={{ color: muted, maxWidth: 760 }}>
            Building your own? Read <Link href="/blog/how-to-build-a-ugc-portfolio-brands-want-2026" style={a}>how to build a UGC portfolio brands hire from</Link>,
            {' '}learn <Link href="/blog/how-to-make-ugc-videos-brands-pay-for-2026" style={a}>the hooks and formats brands pay for</Link>,
            {' '}and set prices with the <Link href="/blog/ugc-rates-how-much-to-charge-2026" style={a}>UGC rates guide</Link>.
          </p>

          <div style={{ marginTop: 36, padding: 24, borderRadius: 16, background: '#fff', border: '1px solid #e2e8f0', maxWidth: 760 }}>
            <h2 style={{ ...h2, marginTop: 0 }}>Publish your UGC portfolio free</h2>
            <p style={{ color: muted }}>No account, no Canva, no follower minimum. Brands can open it from one link.</p>
            <Link href="/media-kit?utm_source=portfolio_examples&utm_medium=organic" style={btn}>Build my free UGC portfolio</Link>
          </div>

          <p style={{ color: muted, fontSize: 14, marginTop: 28 }}>
            Hiring UGC creators? <Link href="/brands/pr-packages" style={a}>Run a gifted UGC campaign with creators like these</Link>.
          </p>
        </div>
      </main>
    </LandingPageLayoutNext>
  );
}
