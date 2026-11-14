import Link from 'next/link';
import GuideShell from './GuideShell';
import { jsonLd } from '@/src/lib/jsonLd';

// Free, ungated UGC Starter Guide (2026-11-14). Original Newcollab content built
// from our own guides and data; every section links to the deeper guide.

const URL_ = 'https://newcollab.co/ugc-starter-guide';
const TITLE = 'Free UGC Starter Guide (2026): Scripts, Rates, Pitches & Contracts | Newcollab';
const DESCRIPTION =
  'The free UGC beginner guide: a 30-day plan, hook and script formulas, a rate card based on 81 paid UGC gigs, pitch email templates, contract red flags and a free portfolio. No email needed.';
const UPDATED = '2026-11-14';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['ugc guide', 'free ugc guide', 'ugc beginner guide', 'ugc guide for beginners', 'ugc starter kit', 'ugc pitch templates', 'ugc script template', 'ugc rate card'],
  alternates: { canonical: URL_ },
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'article', url: URL_, siteName: 'Newcollab' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

const FAQ = [
  { q: 'Is this UGC guide really free?', a: 'Yes. The full guide is on this page with no email, signup or payment. The portfolio builder it links to is free too.' },
  { q: 'Do I need followers to start UGC?', a: 'No. Brands buy UGC to run on their own ads and pages, so they hire on your samples, not your audience.' },
  { q: 'How much should a beginner charge for UGC?', a: 'Most beginners start between $50 and $150 per video for organic use, plus fees for paid ad usage, raw footage and extra hooks. Across 81 paid US UGC gigs listed on Newcollab in September and October 2026, the median posted pay was $150.' },
  { q: 'What equipment do I need?', a: 'A recent phone, window light and a quiet room. A clip-on microphone is the first upgrade worth buying.' },
  { q: 'Can I do UGC from Canada, the UK or Europe?', a: 'Yes. Brands in all of these markets hire UGC creators. Quote in the brand’s currency and follow your local ad disclosure rules.' },
];

const SECTIONS = [
  ['plan', 'The 30-day plan'],
  ['portfolio', 'Your starter portfolio'],
  ['script', 'The script formula'],
  ['hooks', '15 hooks to steal'],
  ['rates', 'What to charge'],
  ['pitch', 'Pitch email templates'],
  ['contracts', 'Contract red flags'],
  ['work', 'Where to find work'],
  ['faq', 'FAQ'],
];

const ink = '#0f172a';
const muted = '#475569';
const s = {
  page: { background: '#f8fafc', color: ink },
  wrap: { maxWidth: 820, margin: '0 auto', padding: '170px 20px 80px', lineHeight: 1.65, fontSize: 17 },
  h1: { fontSize: 'clamp(30px, 5.4vw, 46px)', letterSpacing: '-.03em', lineHeight: 1.1, margin: '10px 0 16px' },
  h2: { fontSize: 'clamp(22px, 3.4vw, 30px)', letterSpacing: '-.02em', lineHeight: 1.2, margin: '56px 0 14px', scrollMarginTop: 120 },
  h3: { fontSize: 19, margin: '24px 0 8px' },
  p: { color: muted, margin: '0 0 14px' },
  eyebrow: { fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#4f46e5' },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', margin: '16px 0' },
  mono: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', margin: '16px 0', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 14.5, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: ink },
  table: { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: 15, background: '#fff' },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #e2e8f0', background: '#f1f5f9' },
  td: { padding: '10px 12px', borderBottom: '1px solid #e2e8f0', color: muted, verticalAlign: 'top' },
  a: { color: '#4f46e5', fontWeight: 600, textDecoration: 'none' },
  btn: { display: 'inline-block', background: ink, color: '#fff', padding: '14px 22px', borderRadius: 12, fontWeight: 700, textDecoration: 'none' },
  toc: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, margin: '20px 0 8px', padding: 0, listStyle: 'none' },
  tocA: { display: 'block', padding: '10px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, color: ink, textDecoration: 'none', fontWeight: 600, fontSize: 15 },
};

function Table({ head, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={s.table}>
        <thead><tr>{head.map((h) => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} style={s.td}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function More({ href, children }) {
  return <p style={s.p}>Go deeper: <Link href={href} style={s.a}>{children}</Link></p>;
}

const HOOKS = [
  'I did not expect a $[price] [product] to [result].',
  'Stop scrolling if you [have this problem].',
  '3 things I wish I knew before buying [category].',
  'I have tried [number] [category] and this is the only one I rebought.',
  'POV: you finally found a [product] that [result].',
  'If you [specific situation], you need to see this.',
  'I thought this was overhyped. Here is what happened.',
  'This fixed my [problem] in [time].',
  'The [product] my [friend / partner / mum] keeps stealing.',
  'Things in my [room / bag / routine] that just make sense.',
  'You are using [category] wrong. Try this.',
  'Rating every [category] I own, starting with the one I use daily.',
  'Watch this before you buy another [category].',
  'Day [X] of using [product] and I have notes.',
  'Start with the result on screen, then rewind to show how you got there.',
];

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to start as a UGC creator in 30 days',
  description: 'A free 30-day plan to become a UGC creator: film samples, publish a portfolio, set rates and pitch brands.',
  totalTime: 'P30D',
  step: [
    { '@type': 'HowToStep', name: 'Pick a niche and film samples', text: 'Choose one or two niches and film 6 to 8 vertical sample videos with products you own.' },
    { '@type': 'HowToStep', name: 'Publish a UGC portfolio', text: 'Put your samples, niches and starting rates on one free portfolio page.' },
    { '@type': 'HowToStep', name: 'Set rates', text: 'Start between $50 and $150 per video for organic use and price paid usage on top.' },
    { '@type': 'HowToStep', name: 'Pitch brands and apply to UGC jobs', text: 'Pitch 3 to 5 brands every weekday with a one-line idea and your portfolio link, and follow up once.' },
  ],
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Free UGC Starter Guide (2026)',
  description: DESCRIPTION,
  datePublished: UPDATED,
  dateModified: UPDATED,
  author: { '@type': 'Person', name: 'Mazza', jobTitle: 'Founder, Newcollab' },
  publisher: { '@type': 'Organization', name: 'Newcollab', url: 'https://newcollab.co' },
  mainEntityOfPage: URL_,
  isAccessibleForFree: true,
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

export default function UgcStarterGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <GuideShell>
        <main style={s.page}>
          <article style={s.wrap}>
            <div style={s.eyebrow}>Free guide · No email needed · Updated November 2026</div>
            <h1 style={s.h1}>The Free UGC Starter Guide</h1>
            <p style={{ ...s.p, fontSize: 19 }}>
              Everything a beginner UGC creator needs in one page: a 30-day plan, a script formula and 15 hooks, a rate card
              built on real gig data, pitch email templates, contract red flags and where to find work. Free, ungated, and
              written for creators in the US, Canada and Europe.
            </p>
            <p style={{ ...s.p, fontSize: 15 }}>By Mazza, Founder of Newcollab.</p>
            <nav aria-label="Guide sections">
              <ol style={s.toc}>
                {SECTIONS.map(([id, label], i) => (
                  <li key={id}><a href={`#${id}`} style={s.tocA}>{i + 1}. {label}</a></li>
                ))}
              </ol>
            </nav>

            <h2 id="plan" style={s.h2}>1. The 30-day plan</h2>
            <p style={s.p}>
              A UGC creator makes short videos and photos that brands run on their own ads, product pages and accounts. You
              sell content, not your audience, so you can start with zero followers. Here is the month that gets you from
              nothing to your first briefs:
            </p>
            <Table head={['Week', 'Do this', 'Done when']} rows={[
              ['1', 'Pick 1-2 niches. Film 4 samples with products you own.', '4 clean 15-30s vertical clips'],
              ['2', 'Film 4 more. Publish your portfolio. Set starting rates.', 'One portfolio link with 8 samples and prices'],
              ['3', 'List 30 brands. Pitch 3-5 every weekday. Apply to UGC jobs.', '15-25 pitches sent'],
              ['4', 'Follow up once. Deliver any gifted or paid briefs.', 'First brief delivered, added to portfolio'],
            ]} />
            <More href="/blog/how-to-become-a-ugc-creator-2026">How to become a UGC creator, step by step</More>

            <h2 id="portfolio" style={s.h2}>2. Your starter portfolio</h2>
            <p style={s.p}>Brands open your portfolio before they read your pitch. A starter portfolio needs:</p>
            <ul style={{ ...s.p, paddingLeft: 22 }}>
              <li>6 to 8 vertical samples, 15 to 30 seconds, captions on, no watermark.</li>
              <li>A mix of formats: talking-head testimonial, problem/solution, unboxing, close-up demo.</li>
              <li>Your niches, platforms and a starting rate card.</li>
              <li>Two lines on what you film and how fast you deliver, and how to contact you.</li>
            </ul>
            <div style={s.card}>
              <p style={{ ...s.p, color: ink, fontWeight: 600 }}>Build it free in a few minutes, no account needed.</p>
              <Link href="/media-kit?utm_source=starter_guide&utm_medium=organic" style={s.btn}>Build my free UGC portfolio</Link>
              <p style={{ ...s.p, marginTop: 12, fontSize: 15 }}>
                See <Link href="/ugc-portfolio-examples" style={s.a}>real UGC portfolio examples</Link> from creators approved this month.
              </p>
            </div>

            <h2 id="script" style={s.h2}>3. The script formula</h2>
            <p style={s.p}>Most UGC ads that work follow the same five beats in about 30 seconds:</p>
            <Table head={['Seconds', 'Beat', 'What to say or show']} rows={[
              ['0-3', 'Hook', 'One line that stops the scroll (see the hooks below).'],
              ['3-8', 'Problem', 'The annoying situation, in the viewer’s words.'],
              ['8-20', 'Product + demo', 'Close-ups of the product being used. Show, then say.'],
              ['20-26', 'Proof', 'What changed for you, honestly, in the same light.'],
              ['26-30', 'Call to action', 'A light next step the brand can keep or cut.'],
            ]} />
            <p style={s.p}>
              Film every video with three different hooks on the same body. Brands test hooks, so three versions make you
              look like a pro for ten extra minutes of work. Never invent results, and avoid medical or guaranteed-result claims.
            </p>
            <More href="/blog/how-to-make-ugc-videos-brands-pay-for-2026">The 6 UGC formats brands buy, filming setup and delivery specs</More>
            <p style={s.p}>Want a script for your product right now? Use the free <Link href="/tools/ugc-script-generator" style={s.a}>UGC script generator</Link>.</p>

            <h2 id="hooks" style={s.h2}>4. 15 hooks to steal</h2>
            <ol style={{ ...s.p, paddingLeft: 22 }}>
              {HOOKS.map((h) => <li key={h} style={{ marginBottom: 6 }}>{h}</li>)}
            </ol>

            <p style={s.p}>Need more? Generate 10 hooks for your product with the free <Link href="/tools/ugc-hook-generator" style={s.a}>UGC hook generator</Link>.</p>

            <h2 id="rates" style={s.h2}>5. What to charge</h2>
            <p style={s.p}>
              Across the 81 paid UGC gigs for US creators that Newcollab listed in September and October 2026, the median
              posted pay was <strong>$150</strong>, and the middle half of offers ranged from $35 to $600. Beginners usually
              start at $50 to $150 per video for organic use and add fees on top:
            </p>
            <Table head={['Item', 'Starting point']} rows={[
              ['Base video (organic use, 1 hook, 1 revision)', '$50 to $150'],
              ['Paid ad usage, 30 days', '+30 to 50% of base'],
              ['Extra hook', '+$15 to $40 each'],
              ['Raw footage', '+25 to 50% of base'],
              ['Whitelisting / Spark Ads', 'Monthly fee'],
              ['Rush (under 72 hours)', '+25%'],
            ]} />
            <p style={s.p}>
              Quote in the brand’s currency (USD, CAD, GBP or EUR). Gifted collabs are fine for your first 3 to 5 portfolio
              pieces, never for paid ad usage.
            </p>
            <More href="/blog/ugc-rates-how-much-to-charge-2026">Full UGC rate card, packages and negotiation scripts</More>
            <p style={s.p}>Price a specific job with the free <Link href="/tools/ugc-rate-calculator" style={s.a}>UGC rate calculator</Link>.</p>

            <h2 id="pitch" style={s.h2}>6. Pitch email templates</h2>
            <p style={s.p}>
              A pitch that gets replies is short, about the brand’s product, and has one link. Copy these and fill in the
              brackets.
            </p>
            <h3 style={s.h3}>Template 1: The cold pitch</h3>
            <div style={s.mono}>{`Subject: UGC idea for [product]

Hi [first name],

I'm [name], a UGC creator who films [niche] content. I'd love to make a 20-second [format, e.g. problem/solution] video for [product], opening with: "[hook]".

Samples and rates: [portfolio link]

Would you like me to send three hook options for your next ad test?

[name]`}</div>
            <h3 style={s.h3}>Template 2: The follow-up (5 to 7 days later)</h3>
            <div style={s.mono}>{`Subject: Re: UGC idea for [product]

Hi [first name], bumping this in case it got buried. Happy to film a first video for [product] this week, with three hooks you can test.

Portfolio: [portfolio link]

[name]`}</div>
            <h3 style={s.h3}>Template 3: When they ask for your rates</h3>
            <div style={s.mono}>{`Thanks for asking! Two options:

Starter: 1 video, 1 hook, organic use on your channels, 1 revision: [price]
Ads: 1 video, 3 hooks, 30 days of paid usage, captioned + clean files: [price]

Most brands testing ads pick the Ads package. I can deliver within [X] days of receiving the product.`}</div>
            <h3 style={s.h3}>Template 4: When they offer product only</h3>
            <div style={s.mono}>{`Thank you, I'd love to try [product]. For a gifted collab I can film one video for your organic channels. If you'd like to run it as an ad, paid usage starts at [price] for 30 days.`}</div>
            <p style={s.p}>
              Find brands to pitch in the <Link href="/directory" style={s.a}>Newcollab brand directory</Link>, or start with{' '}
              <Link href="/blog/brands-that-pay-for-ugc-content-2026" style={s.a}>brands that pay for UGC</Link>.
            </p>

            <h2 id="contracts" style={s.h2}>7. Contract red flags</h2>
            <p style={s.p}>Get the terms in writing before you film. Walk away, or ask for changes, when you see:</p>
            <ul style={{ ...s.p, paddingLeft: 22 }}>
              <li><strong>Perpetual or unlimited usage</strong> for a beginner fee.</li>
              <li><strong>Paid ad usage</strong> in a gifted, product-only deal.</li>
              <li><strong>Unlimited revisions</strong> or no definition of a revision.</li>
              <li><strong>No payment date</strong>, or payment only &quot;after the campaign ends&quot;.</li>
              <li><strong>No kill fee</strong> if they cancel after you have filmed.</li>
              <li><strong>Exclusivity</strong> that blocks a whole category without extra pay.</li>
              <li><strong>Raw footage</strong> included for free.</li>
              <li>Any request to <strong>pay a fee</strong>, share bank logins, or move to a chat app before anything is in writing.</li>
            </ul>
            <More href="/blog/ugc-contract-usage-rights-2026">UGC contract checklist and email agreement template</More>

            <h2 id="work" style={s.h2}>8. Where to find work</h2>
            <Table head={['Source', 'Best for']} rows={[
              ['UGC platforms', 'Steady briefs with payment handled for you'],
              ['Freelance job boards', 'Bigger, longer projects'],
              ['Brand creator programs', 'Repeat work with one brand'],
              ['Direct pitching', 'Your own prices and long-term clients'],
              ['Newcollab', 'Gift lists, paid UGC gigs and AI pitching to brands, with no follower minimum'],
            ]} />
            <p style={s.p}>
              Compare the main options in <Link href="/blog/best-ugc-platforms-for-creators-2026" style={s.a}>the best UGC platforms for creators</Link>{' '}
              and see beginner-friendly sources in <Link href="/blog/ugc-jobs-for-beginners-2026" style={s.a}>UGC jobs for beginners</Link>.
            </p>

            <h2 id="faq" style={s.h2}>9. FAQ</h2>
            {FAQ.map((f) => (
              <div key={f.q} style={s.card}>
                <h3 style={{ ...s.h3, margin: '0 0 6px' }}>{f.q}</h3>
                <p style={{ ...s.p, margin: 0 }}>{f.a}</p>
              </div>
            ))}

            <div style={{ ...s.card, marginTop: 40, textAlign: 'center', padding: 28 }}>
              <h2 style={{ ...s.h2, margin: '0 0 10px' }}>Start with step 2 today</h2>
              <p style={s.p}>Publish your free UGC portfolio. Every other step is easier with one link brands can open.</p>
              <Link href="/media-kit?utm_source=starter_guide&utm_medium=organic&utm_content=footer" style={s.btn}>Build my free UGC portfolio</Link>
            </div>
          </article>
        </main>
      </GuideShell>
    </>
  );
}
