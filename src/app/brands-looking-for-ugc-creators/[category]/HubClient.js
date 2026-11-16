'use client';

import Link from 'next/link';
import styled from 'styled-components';
import LandingPageLayoutNext from '../../components/LandingPageLayoutNext';
import { HUB_BASE } from '../_hubs';

const SIGNUP = 'https://app.newcollab.co/register/creator';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const day = (iso) => { const d = new Date(iso); return iso && !Number.isNaN(d.getTime()) ? `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}` : ''; };

function Chips({ b }) {
  const chips = [];
  if (b.brief) chips.push(['brief', 'Paid UGC brief open']);
  if (b.creatorAds) chips.push(['creator', 'Creator-style ads']);
  if (b.hot) chips.push(['hot', `🔥 Ads seen ${day(b.seenOn)}`]);
  if (b.gifting) chips.push(['gift', 'Gifts creators']);
  return <span className="chips">{chips.map(([k, t]) => <i key={k} className={k}>{t}</i>)}</span>;
}

export default function HubClient({ hub, data, faq, others }) {
  const brands = data?.brands || [];
  const total = data?.total || 0;
  const label = hub.label.toLowerCase();
  const cta = `${SIGNUP}?ref=ugc-hub&source_page=${hub.slug}`;
  return (
    <LandingPageLayoutNext canonicalUrl={`https://newcollab.co${HUB_BASE}/${hub.slug}`}>
      <Page>
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><i aria-hidden="true">/</i>
          <Link href={HUB_BASE}>Brands looking for UGC creators</Link><i aria-hidden="true">/</i><span>{hub.label}</span>
        </nav>
        <header>
          <div className="eyebrow">UGC brands · {hub.label}</div>
          <h1>{hub.label} brands looking for UGC creators</h1>
          <p className="nc-quick-answer">
            {total
              ? `${total} ${label} brands on Newcollab show a real sign that they buy creator content: an open paid UGC brief, creator-style ads, ads seen in the last 30 days, or gifting creators. Strongest signals first, updated daily.`
              : `We're refreshing this list. Browse the ${label} brand directory meanwhile.`}
          </p>
          <div className="actions">
            <a className="primary" href={cta}>Pitch these brands with Polly</a>
            <Link className="ghost" href={hub.directory}>All {label} brands</Link>
          </div>
        </header>

        {brands.length > 0 && (
          <section aria-labelledby="list-title">
            <h2 id="list-title">The list</h2>
            <ol className="list">
              {brands.map((b) => (
                <li key={b.slug}>
                  <Link href={`/brand/${b.slug}`}>
                    <span className="logo" aria-hidden="true">{b.logo ? <img src={b.logo} alt="" loading="lazy" /> : (b.name || '?')[0]}</span>
                    <span className="t"><b>{b.name}</b><Chips b={b} /></span>
                    <span className="go" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ol>
            {total > brands.length ? <p className="more">Showing the top {brands.length} of {total}. <a href={cta}>See them all free</a>.</p> : null}
          </section>
        )}

        <section className="prose">
          <h2>What the signals mean</h2>
          <ul>
            <li><b>Paid UGC brief open:</b> the brand has a paid UGC job live on Newcollab right now.</li>
            <li><b>Creator-style ads:</b> their ads use first-person, creator-made videos, the kind UGC creators make.</li>
            <li><b>🔥 Ads seen:</b> we found them running ads in a public ad library in the last 30 days. Brands that advertise need fresh videos all the time.</li>
            <li><b>Gifts creators:</b> we have seen them sending products to creators.</li>
          </ul>
          <h2>How to pitch {label} brands</h2>
          <p>{hub.tip} Keep the email under 120 words, name one product, propose one video and link two samples. Brands with 🔥 run ads, so offer raw footage and three hook variations their ad team can test.</p>
          <p>Need the words? Use the free <Link href="/tools/ugc-pitch-email-generator">UGC pitch email generator</Link>, check <Link href="/blog/ugc-rates-how-much-to-charge-2026">what to charge</Link>, or let <Link href="/features/ai-pitch-email-writer">Polly pitch up to 20 brands a day</Link> for you.</p>
        </section>

        <section className="nc-faq">
          <h2>Frequently asked questions</h2>
          {faq.map(([q, a], i) => (
            <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </section>

        <section>
          <h2>Other niches</h2>
          <div className="others">
            {others.map((o) => <Link key={o.slug} href={`${HUB_BASE}/${o.slug}`}>{o.label} brands looking for UGC creators</Link>)}
          </div>
          <p className="links"><Link href="/features/brands-hiring-ugc-creators">Brands hiring UGC creators</Link> · <Link href="/features/ugc-jobs">Paid UGC jobs</Link> · <Link href="/features/ugc-ad-examples">UGC ad examples</Link></p>
        </section>
      </Page>
    </LandingPageLayoutNext>
  );
}

const Page = styled.main`
  max-width: 980px; margin: 0 auto; padding: 128px 20px 72px; color: #12141a;
  @media (max-width: 640px) { padding: 92px 16px 56px; }
  .crumbs { font-size: 13.5px; color: #6B7280; display: flex; gap: 6px; flex-wrap: wrap; }
  .crumbs a { color: #6B7280; text-decoration: none; }
  .crumbs i { font-style: normal; color: #C7C3BA; }
  header { margin: 18px 0 30px; max-width: 800px; }
  .eyebrow { font-size: 12.5px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: #0d7a5f; }
  h1 { font-size: clamp(30px, 4.6vw, 48px); line-height: 1.08; letter-spacing: -.03em; margin: 10px 0 14px; font-weight: 800; }
  header p { font-size: 17.5px; line-height: 1.6; color: #2a2e38; margin: 0 0 20px; }
  .actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .primary, .ghost { display: inline-flex; align-items: center; height: 46px; padding: 0 20px; border-radius: 999px; font-weight: 800; font-size: 15px; text-decoration: none; }
  .primary { background: #12141a; color: #fff; }
  .ghost { border: 1px solid #DDD8CC; color: #12141a; background: #fff; }
  section { margin-top: 40px; }
  h2 { font-size: clamp(21px, 3vw, 26px); font-weight: 800 !important; letter-spacing: -.02em; margin: 0 0 14px; }
  .list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .list a { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid #ECE9E1; border-radius: 14px; background: #fff; text-decoration: none; color: inherit; }
  .list a:hover { border-color: #12141a; }
  .logo { width: 40px; height: 40px; border-radius: 10px; background: #F4F2EC; display: grid; place-items: center; overflow: hidden; flex: none; font-weight: 800; }
  .logo img { width: 100%; height: 100%; object-fit: contain; background: #fff; }
  .t { display: grid; gap: 4px; min-width: 0; flex: 1; }
  .t b { font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .chips { display: flex; flex-wrap: wrap; gap: 4px; }
  .chips i { font-style: normal; font-size: 11.5px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #F4F2EC; color: #4B5563; }
  .chips i.brief { background: #ECFDF3; color: #047857; }
  .chips i.hot { background: #FFF4E5; color: #B45309; }
  .chips i.creator { background: #F3EEFF; color: #6D28D9; }
  .go { color: #9CA3AF; }
  .more { margin-top: 12px; color: #4B5563; }
  .more a, .prose a, .links a { color: #0d7a5f; font-weight: 700; }
  .prose p, .prose li { font-size: 16.5px; line-height: 1.7; color: #2a2e38; max-width: 780px; }
  .prose ul { padding-left: 20px; }
  .nc-faq details { border-bottom: 1px solid #ECE9E1; max-width: 800px; }
  .nc-faq summary { cursor: pointer; padding: 15px 0; font-weight: 700; font-size: 16.5px; list-style: none; display: flex; justify-content: space-between; gap: 14px; }
  .nc-faq summary::-webkit-details-marker { display: none; }
  .nc-faq summary::after { content: '+'; color: #9CA3AF; font-size: 20px; line-height: 1; }
  .nc-faq details[open] summary::after { content: '−'; }
  .nc-faq p { margin: 0 0 16px; line-height: 1.65; color: #2a2e38; }
  .others { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 8px; }
  .others a { padding: 12px 14px; border: 1px solid #ECE9E1; border-radius: 12px; background: #FAF8F3; color: #12141a; text-decoration: none; font-weight: 600; font-size: 14.5px; }
  .others a:hover { border-color: #12141a; }
  .links { margin-top: 16px; font-size: 14px; }
  @media (max-width: 760px) { .list { grid-template-columns: minmax(0, 1fr); } }
`;
