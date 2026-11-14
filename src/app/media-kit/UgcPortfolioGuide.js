import Link from 'next/link';

// Server-rendered guide under the /media-kit builder, so the page answers
// "UGC portfolio" searches with real content (not only builder UI).
// FAQ items are shared with the FAQPage schema in page.js; keep them visible.

export const PORTFOLIO_FAQ = [
  {
    q: 'Is the UGC portfolio builder free?',
    a: 'Yes. Publish a public UGC portfolio at newcollab.co/media-kit with no account, no Canva and no paid template.',
  },
  {
    q: 'What should a UGC portfolio include?',
    a: 'Six to eight short vertical sample videos, the formats you film, your niches, a starting rate card, a short about section and a way to contact you. Brands scan the samples first, so put your strongest hook at the top.',
  },
  {
    q: 'Can I make a UGC portfolio with no brand experience?',
    a: 'Yes. Film spec samples with products you already own, the same way you would for a brand. Most brands judge the quality of the clips, not whether a brand paid for them.',
  },
  {
    q: 'Do I need a media kit to pitch brands?',
    a: 'Yes. Brands ignore pitches without proof. Publish a free UGC portfolio and paste the link in your pitch emails, Instagram bio and TikTok description. Signed-in creators can also attach their kit automatically when they pitch from the Newcollab directory.',
  },
  {
    q: 'Is a UGC portfolio the same as a media kit?',
    a: 'The portfolio is your sample videos. The media kit is your rates, niche and contact details. The free builder puts both on one public page brands can open.',
  },
];

const EXAMPLES = [
  { slug: 'chic_beauty_body', niche: 'Beauty & skincare' },
  { slug: 'tula__t', niche: 'Fashion' },
  { slug: 'nicolelefko', niche: 'Lifestyle, food & pets' },
  { slug: 'realnjmama', niche: 'Family, home & beauty' },
];

const wrap = { maxWidth: 820, margin: '0 auto', padding: '56px 24px 72px', color: '#0f172a', lineHeight: 1.65, fontSize: 16 };
const h2 = { fontSize: 'clamp(22px, 3.4vw, 28px)', letterSpacing: '-.02em', margin: '44px 0 12px', lineHeight: 1.2 };
const muted = { color: '#475569' };
const card = { display: 'block', padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff', textDecoration: 'none', color: '#0f172a' };
const a = { color: '#4f46e5', fontWeight: 600, textDecoration: 'none' };

export default function UgcPortfolioGuide() {
  return (
    <section style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }} aria-labelledby="ugc-portfolio-guide">
      <div style={wrap}>
        <h2 id="ugc-portfolio-guide" style={{ ...h2, marginTop: 0 }}>What is a UGC portfolio?</h2>
        <p style={muted}>
          A UGC portfolio is a single page of short sample videos that shows brands how you film a product, plus your rates
          and how to reach you. Brands hiring user-generated content open it before they look at your follower count,
          because they are buying footage for their own ads and pages, not your audience. A good one gets you hired
          with 500 followers; a messy camera-roll link gets ignored at 50,000.
        </p>

        <h2 style={h2}>What to put in your UGC portfolio</h2>
        <ul style={{ ...muted, paddingLeft: 22 }}>
          <li><strong>6 to 8 sample videos</strong>, vertical, 15 to 30 seconds, captions on, no watermark. Lead with your best hook.</li>
          <li><strong>Range of formats</strong>: a talking-head testimonial, a problem/solution, a product demo, an unboxing.</li>
          <li><strong>Your niches</strong>, so brands know which products you film well (skincare, home, fitness, food...).</li>
          <li><strong>A starting rate card</strong> in your currency (USD, CAD, GBP or EUR). The builder above suggests a floor for your follower count.</li>
          <li><strong>A two-line about section</strong>: what you film and how fast you deliver.</li>
          <li><strong>Brands you have worked with</strong> and any results, once you have them.</li>
          <li><strong>One clear way to contact you.</strong></li>
        </ul>
        <p style={muted}>
          Full walkthrough: <Link href="/blog/how-to-build-a-ugc-portfolio-brands-want-2026" style={a}>how to build a UGC portfolio brands hire from</Link>.
        </p>

        <h2 style={h2}>UGC portfolio examples</h2>
        <p style={muted}>Real portfolios published by creators approved on Newcollab this month:</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, margin: '16px 0' }}>
          {EXAMPLES.map((e) => (
            <Link key={e.slug} href={`/kit/${e.slug}`} style={card}>
              <div style={{ fontWeight: 700 }}>@{e.slug}</div>
              <div style={{ ...muted, fontSize: 14 }}>{e.niche}</div>
            </Link>
          ))}
        </div>

        <h2 style={h2}>How to use your portfolio to get UGC work</h2>
        <ol style={{ ...muted, paddingLeft: 22 }}>
          <li>Put the link in your Instagram bio and TikTok description. You will see when a brand opens it.</li>
          <li>Add it to every pitch email, right under your first line. Brands negotiate less once they have seen the work.</li>
          <li>Set prices before you pitch with our <Link href="/blog/ugc-rates-how-much-to-charge-2026" style={a}>UGC rates guide</Link>.</li>
          <li>Improve your samples with the <Link href="/blog/how-to-make-ugc-videos-brands-pay-for-2026" style={a}>hooks and formats brands pay for</Link>.</li>
          <li>Pitch brands that hire UGC creators: start with <Link href="/blog/brands-that-pay-for-ugc-content-2026" style={a}>brands that pay for UGC</Link>.</li>
        </ol>

        <h2 style={h2}>UGC portfolio FAQ</h2>
        {PORTFOLIO_FAQ.map((f) => (
          <div key={f.q} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', margin: '10px 0' }}>
            <h3 style={{ fontSize: 17, margin: '0 0 6px' }}>{f.q}</h3>
            <p style={{ ...muted, margin: 0 }}>{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
