import Link from 'next/link';
import ToolsShell from './ToolsShell';
import ToolWidget from './ToolWidget';
import { NICHES, SITE, TOOLS, variantsFor } from './_catalog';
import { jsonLd } from '@/src/lib/jsonLd';

// Server-rendered tool page: working tool + variant-specific examples, tips, how-to and FAQ.

const ink = '#0f172a';
const muted = '#475569';
const s = {
  page: { background: '#f8fafc', color: ink },
  wrap: { maxWidth: 1080, margin: '0 auto', padding: '160px 20px 80px', lineHeight: 1.65 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28, alignItems: 'start', marginTop: 24 },
  h1: { fontSize: 'clamp(30px, 5vw, 44px)', letterSpacing: '-.03em', lineHeight: 1.1, margin: '8px 0 12px' },
  h2: { fontSize: 'clamp(21px, 3vw, 27px)', letterSpacing: '-.02em', margin: '52px 0 12px' },
  p: { color: muted, margin: '0 0 12px', fontSize: 17 },
  crumb: { fontSize: 14, color: muted },
  cA: { color: muted, textDecoration: 'none' },
  a: { color: '#4f46e5', fontWeight: 600, textDecoration: 'none' },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 18px', margin: '12px 0' },
  chip: (on) => ({ display: 'inline-block', padding: '7px 13px', borderRadius: 999, margin: '0 8px 8px 0', fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid #e2e8f0', background: on ? ink : '#fff', color: on ? '#fff' : ink }),
  narrow: { maxWidth: 780 },
};

function examplesFor(tool, v) {
  const d = v?.data;
  if (tool.kind === 'hooks') {
    if (d?.hooks) return { title: `Example ${v.label} UGC hooks`, list: d.hooks };
    return { title: 'Example UGC hooks', list: [NICHES.skincare.hooks[0], NICHES.home.hooks[0], NICHES.pets.hooks[0], NICHES.fitness.hooks[0], NICHES.food.hooks[1], NICHES.tech.hooks[3]] };
  }
  if (tool.kind === 'script') {
    const n = v?.type === 'niche' ? d : NICHES.skincare;
    const beats = ['Hook (0-3s)', 'Problem (3-8s)', 'Product + demo (8-20s)', 'Proof (20-26s)', 'Call to action (26-30s)'];
    const lines = [n.hooks[0], ...n.script.slice(1)];
    return { title: `Example 30-second ${n.label.toLowerCase()} UGC script (${n.product})`, script: beats.map((b, i) => [b, i === 1 ? n.script[0] : lines[i]]) };
  }
  if (tool.kind === 'pitch') {
    const n = v?.type === 'niche' ? d : NICHES.skincare;
    return {
      title: `Example ${n.label.toLowerCase()} UGC pitch email`,
      email: `Subject: UGC idea for your ${n.product}\n\nHi [first name],\n\nI'm a UGC creator who films ${n.label.toLowerCase()} content. I'd love to make ${n.pitchIdea}, opening with: "${n.hooks[0]}"\n\nSamples and rates: [portfolio link]\n\nWould you like three hook options for your next ad test?\n\n[your name]`,
    };
  }
  return null;
}

function faqFor(tool, v) {
  const base = {
    hooks: [
      ['How long should a UGC hook be?', 'One spoken line under about 14 words, plus the first shot: roughly the first one to three seconds of the video.'],
      ['How many hooks should I give a brand?', 'Three per video is a strong default. Brands test hooks against each other, and the body of the video can stay the same.'],
      ['Can I use trending sounds in UGC hooks?', 'Not in videos a brand will run as ads, unless the sound is licensed for commercial use. Use the trend’s format instead.'],
    ],
    script: [
      ['How long should a UGC script be?', 'About 30 seconds for most paid social ads, around 70 to 80 spoken words, filmed vertical.'],
      ['Should I read the script word for word?', 'No. Use it as a structure and say it in your own words; scripted delivery is the most common reason UGC gets rejected.'],
      ['What goes in the proof beat?', 'An honest, specific observation from your own use. Never invent results or make medical claims.'],
    ],
    pitch: [
      ['How long should a UGC pitch email be?', 'Under about 120 words: who you are, one video idea, your portfolio link and a short question.'],
      ['Who should I send UGC pitches to?', 'The marketing, social or partnerships contact if you can find one; otherwise the brand’s PR or creator inbox.'],
      ['When should I follow up?', 'Once, five to seven days later, with a short note and the same link.'],
    ],
    rates: [
      ['How much should a beginner charge for UGC?', 'Most beginners start between $50 and $150 per video for organic use. Across 81 paid US UGC gigs listed on Newcollab in September and October 2026, the median posted pay was $150.'],
      ['How do I price usage rights?', 'A common starting point is to add 30 to 50 percent of your base rate for 30 days of paid ads, more for longer periods, and price whitelisting monthly.'],
      ['Do followers matter for UGC rates?', 'Less than for influencer posts. If the brand only posts the video on its own channels, price the work and usage; if you also post it, your audience matters more.'],
    ],
  }[tool.kind];
  const extra = v?.type === 'region' ? [[`What currency should ${v.data.short} creators quote in?`, `Quote in the brand’s currency: ${v.data.currency} for brands in ${v.data.label}, USD for US brands. ${v.data.note}`]] : [];
  return [...extra, ...base];
}

export default function ToolPage({ toolSlug, variant }) {
  const tool = TOOLS[toolSlug];
  const v = variant || null;
  const url = `${SITE}/tools/${toolSlug}${v ? `/${v.slug}` : ''}`;
  const heading = v
    ? v.type === 'region' ? `UGC Rate Calculator for ${v.data.short} Creators` : v.type === 'platform' ? tool.name.replace('UGC ', `${v.label} UGC `) : `${v.label} ${tool.name}`
    : `Free ${tool.name}`;
  const intro = v?.type === 'platform' ? v.data.intro : v?.type === 'region' ? `Work out what to charge brands in ${v.data.label}, in ${v.data.currency}. ${v.data.note}` : tool.tagline;
  const defaults = v?.type === 'niche'
    ? { product: v.data.product, niche: v.label.toLowerCase(), audience: v.data.audience, benefit: v.data.benefit }
    : v?.type === 'platform' ? { platform: v.data.value } : v?.type === 'region' ? { region: v.slug } : {};
  const ex = examplesFor(tool, v);
  const tips = v?.data?.tips || [];
  const faq = faqFor(tool, v);
  const siblings = variantsFor(toolSlug);
  const others = Object.entries(TOOLS).filter(([k]) => k !== toolSlug);

  const schemas = [
    {
      '@context': 'https://schema.org', '@type': 'WebApplication', name: heading, url,
      applicationCategory: 'BusinessApplication', operatingSystem: 'Web', isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@type': 'Organization', name: 'Newcollab', url: SITE },
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Free UGC tools', item: `${SITE}/tools` },
        { '@type': 'ListItem', position: 2, name: tool.name, item: `${SITE}/tools/${toolSlug}` },
        ...(v ? [{ '@type': 'ListItem', position: 3, name: v.label, item: url }] : []),
      ],
    },
  ];

  return (
    <>
      {schemas.map((d, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(d) }} />)}
      <ToolsShell canonicalUrl={url}>
        <main style={s.page}>
          <div style={s.wrap}>
            <nav aria-label="Breadcrumb" style={s.crumb}>
              <Link href="/tools" style={s.cA}>Free UGC tools</Link>{' / '}
              {v ? <><Link href={`/tools/${toolSlug}`} style={s.cA}>{tool.name}</Link>{' / '}{v.label}</> : tool.name}
            </nav>
            <div style={s.grid}>
              <div>
                <h1 style={s.h1}>{heading}</h1>
                <p style={s.p}>{intro}</p>
                <p style={{ ...s.p, fontSize: 15 }}>Free, no signup, made by <Link href="/" style={s.a}>Newcollab</Link> for UGC creators in the US, Canada and Europe.</p>
                <h2 style={{ ...s.h2, marginTop: 24, fontSize: 20 }}>How to use it</h2>
                <ol style={{ ...s.p, paddingLeft: 22 }}>{tool.howTo.map((h) => <li key={h}>{h}</li>)}</ol>
              </div>
              <ToolWidget kind={tool.kind} defaults={defaults} />
            </div>

            <div style={s.narrow}>
              {ex?.list && (<><h2 style={s.h2}>{ex.title}</h2><ol style={{ ...s.p, paddingLeft: 22 }}>{ex.list.map((h) => <li key={h} style={{ marginBottom: 6 }}>{h}</li>)}</ol></>)}
              {ex?.script && (<><h2 style={s.h2}>{ex.title}</h2>{ex.script.map(([b, l]) => <div key={b} style={s.card}><strong>{b}</strong><div style={{ color: muted }}>{l}</div></div>)}</>)}
              {ex?.email && (<><h2 style={s.h2}>{ex.title}</h2><div style={{ ...s.card, whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 14.5 }}>{ex.email}</div></>)}

              {tips.length > 0 && (<><h2 style={s.h2}>{v.type === 'region' ? `Tips for ${v.data.short} creators` : `${v.label} UGC tips`}</h2><ul style={{ ...s.p, paddingLeft: 22 }}>{tips.map((t) => <li key={t}>{t}</li>)}</ul></>)}
              {v?.type === 'region' && (<><h2 style={s.h2}>Pricing notes for {v.data.label}</h2><p style={s.p}>{v.data.note}</p></>)}

              <h2 style={s.h2}>What is {tool.kind === 'rates' ? 'a UGC rate' : tool.kind === 'pitch' ? 'a good UGC pitch' : tool.kind === 'script' ? 'a UGC script' : 'a UGC hook'}?</h2>
              <p style={s.p}>{tool.what}</p>
              <p style={s.p}>Go deeper: <Link href={tool.guide} style={s.a}>{tool.kind === 'rates' ? 'the full UGC rates guide' : tool.kind === 'pitch' ? 'pitch templates in the UGC Starter Guide' : 'how to make UGC videos brands pay for'}</Link>, or start with the <Link href="/ugc-starter-guide" style={s.a}>free UGC Starter Guide</Link>.</p>

              <h2 style={s.h2}>FAQ</h2>
              {faq.map(([q, a]) => <div key={q} style={s.card}><h3 style={{ fontSize: 17, margin: '0 0 6px' }}>{q}</h3><p style={{ ...s.p, margin: 0, fontSize: 16 }}>{a}</p></div>)}

              {siblings.length > 0 && (<>
                <h2 style={s.h2}>{tool.name} by {tool.variantsBy.includes('region') ? 'region' : 'niche and platform'}</h2>
                <div>
                  <Link href={`/tools/${toolSlug}`} style={s.chip(!v)}>All</Link>
                  {siblings.map((x) => <Link key={x.slug} href={`/tools/${toolSlug}/${x.slug}`} style={s.chip(v?.slug === x.slug)}>{x.label}</Link>)}
                </div>
              </>)}

              <h2 style={s.h2}>More free UGC tools</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {others.map(([k, t]) => (
                  <Link key={k} href={`/tools/${k}`} style={{ ...s.card, margin: 0, textDecoration: 'none', color: ink }}>
                    <strong>{t.name}</strong><div style={{ color: muted, fontSize: 15 }}>{t.tagline}</div>
                  </Link>
                ))}
                <Link href="/media-kit" style={{ ...s.card, margin: 0, textDecoration: 'none', color: ink }}>
                  <strong>Free UGC Portfolio Builder</strong><div style={{ color: muted, fontSize: 15 }}>Publish your samples and rates on one link brands can open.</div>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </ToolsShell>
    </>
  );
}
