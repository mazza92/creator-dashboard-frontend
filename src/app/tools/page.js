import Link from 'next/link';
import ToolsShell from './ToolsShell';
import { SITE, TOOLS, variantsFor } from './_catalog';
import { jsonLd } from '@/src/lib/jsonLd';

const URL_ = `${SITE}/tools`;
const TITLE = 'Free UGC Tools for Creators: Hooks, Scripts, Pitches & Rates | Newcollab';
const DESCRIPTION = 'Free tools for UGC creators: hook generator, script generator, pitch email generator, rate calculator and portfolio builder. No signup.';

export const metadata = {
  title: TITLE, description: DESCRIPTION, alternates: { canonical: URL_ },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL_, type: 'website', siteName: 'Newcollab' },
};

const ink = '#0f172a';
const muted = '#475569';
const card = { display: 'block', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, textDecoration: 'none', color: ink };

export default function ToolsHub() {
  const all = [...Object.entries(TOOLS).map(([k, t]) => ({ href: `/tools/${k}`, name: t.name, tagline: t.tagline, variants: variantsFor(k) })),
    { href: '/media-kit', name: 'UGC Portfolio Builder', tagline: 'Publish your samples and rates on one link brands can open.', variants: [] }];
  const schema = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Free UGC tools', url: URL_,
    mainEntity: { '@type': 'ItemList', itemListElement: all.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${t.href}`, name: t.name })) },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <ToolsShell canonicalUrl={URL_}>
        <main style={{ background: '#f8fafc', color: ink }}>
          <div style={{ maxWidth: 1080, margin: '0 auto', padding: '160px 20px 80px', lineHeight: 1.6 }}>
            <h1 style={{ fontSize: 'clamp(30px, 5vw, 44px)', letterSpacing: '-.03em', lineHeight: 1.1, margin: '0 0 12px' }}>Free UGC Tools for Creators</h1>
            <p style={{ color: muted, fontSize: 18, maxWidth: 720 }}>Write hooks, scripts and pitch emails, price your work and publish a portfolio. Free, no signup, built by Newcollab for UGC creators in the US, Canada and Europe.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginTop: 28 }}>
              {all.map((t) => (
                <div key={t.href} style={card}>
                  <Link href={t.href} style={{ color: ink, textDecoration: 'none' }}><h2 style={{ fontSize: 21, margin: '0 0 6px' }}>{t.name}</h2></Link>
                  <p style={{ color: muted, margin: '0 0 12px' }}>{t.tagline}</p>
                  <Link href={t.href} style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>Open the tool →</Link>
                  {t.variants.length > 0 && (
                    <p style={{ color: muted, fontSize: 14, margin: '12px 0 0' }}>
                      {t.variants.map((v, i) => <span key={v.slug}>{i ? ' · ' : ''}<Link href={`${t.href}/${v.slug}`} style={{ color: muted }}>{v.label}</Link></span>)}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <p style={{ color: muted, marginTop: 36 }}>New to UGC? Start with the <Link href="/ugc-starter-guide" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>free UGC Starter Guide</Link>.</p>
          </div>
        </main>
      </ToolsShell>
    </>
  );
}
