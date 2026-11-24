'use client';

import Link from 'next/link';
import styled from 'styled-components';
import LandingPageLayoutNext from '../components/LandingPageLayoutNext';
import { HUB_LINKS } from './data';

const SIGNUP = 'https://app.newcollab.co/register/creator';

// One page layout for both monthly UGC data pages. Each brand carries `chips`: [[className, text], ...] built on the
// server (functions can't cross into a client component).
export default function UgcDataPage({ url, slug, eyebrow, title, answer, brands, total, sections, faq, related }) {
  const cta = `${SIGNUP}?ref=ugc-data&source_page=${slug}`;
  return (
    <LandingPageLayoutNext canonicalUrl={url}>
      <Page>
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><i aria-hidden="true">/</i><span>{title}</span>
        </nav>
        <header>
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p className="nc-quick-answer">{answer}</p>
          <div className="actions">
            <a className="primary" href={cta}>Pitch these brands with Polly</a>
            <Link className="ghost" href="/brands-looking-for-ugc-creators">Brands looking for UGC creators</Link>
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
                    <span className="t">
                      <b>{b.name}</b>
                      <span className="chips">
                        {b.category ? <i className="cat">{b.category}</i> : null}
                        {(b.chips || []).map(([k, text]) => <i key={text} className={k}>{text}</i>)}
                      </span>
                    </span>
                    <span className="go" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ol>
            {total > brands.length ? <p className="more">Showing the top {brands.length} of {total}. <a href={cta}>See them all free</a>.</p> : null}
          </section>
        )}

        {sections.map(({ h, body }) => (
          <section className="prose" key={h}>
            <h2>{h}</h2>
            {body}
          </section>
        ))}

        <section className="nc-faq">
          <h2>Frequently asked questions</h2>
          {faq.map(([q, a], i) => (
            <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </section>

        <section>
          <h2>UGC brands by niche</h2>
          <div className="others">
            {HUB_LINKS.map(([s, l]) => <Link key={s} href={`/brands-looking-for-ugc-creators/${s}`}>{l} brands looking for UGC creators</Link>)}
          </div>
          <p className="links">
            {(related || []).map(([href, label], i) => (
              <span key={href}>{i ? ' · ' : ''}<Link href={href}>{label}</Link></span>
            ))}
          </p>
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
  .ghost { border: 1px solid #e4e2dc; color: #12141a; background: #fff; }
  section { margin-top: 40px; }
  h2 { font-size: clamp(21px, 3vw, 26px); font-weight: 800 !important; letter-spacing: -.02em; margin: 0 0 14px; }
  .list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .list a { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid #e4e2dc; border-radius: 14px; background: #fff; text-decoration: none; color: inherit; }
  .list a:hover { border-color: #12141a; }
  .logo { width: 40px; height: 40px; border-radius: 10px; background: #f3f2ef; display: grid; place-items: center; overflow: hidden; flex: none; font-weight: 800; }
  .logo img { width: 100%; height: 100%; object-fit: contain; background: #fff; }
  .t { display: grid; gap: 4px; min-width: 0; flex: 1; }
  .t b { font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .chips { display: flex; flex-wrap: wrap; gap: 4px; }
  .chips i { font-style: normal; font-size: 11.5px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #f3f2ef; color: #4B5563; }
  .chips i.cat { text-transform: capitalize; }
  .chips i.good { background: #eef6f3; color: #095a46; }
  .chips i.hot { background: #FFF4E5; color: #B45309; }
  .go { color: #9CA3AF; }
  .more { margin-top: 12px; color: #4B5563; }
  .more a, .prose a, .links a { color: #0d7a5f; font-weight: 700; }
  .prose p, .prose li { font-size: 16.5px; line-height: 1.7; color: #2a2e38; max-width: 780px; }
  .prose ul { padding-left: 20px; }
  .nc-faq details { border-bottom: 1px solid #e4e2dc; max-width: 800px; }
  .nc-faq summary { cursor: pointer; padding: 15px 0; font-weight: 700; font-size: 16.5px; list-style: none; display: flex; justify-content: space-between; gap: 14px; }
  .nc-faq summary::-webkit-details-marker { display: none; }
  .nc-faq summary::after { content: '+'; color: #9CA3AF; font-size: 20px; line-height: 1; }
  .nc-faq details[open] summary::after { content: '−'; }
  .nc-faq p { margin: 0 0 16px; line-height: 1.65; color: #2a2e38; }
  .others { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 8px; }
  .others a { padding: 12px 14px; border: 1px solid #e4e2dc; border-radius: 12px; background: #fafafa; color: #12141a; text-decoration: none; font-weight: 600; font-size: 14.5px; }
  .others a:hover { border-color: #12141a; }
  .links { margin-top: 16px; font-size: 14px; }
  @media (max-width: 760px) { .list { grid-template-columns: minmax(0, 1fr); } }
`;
