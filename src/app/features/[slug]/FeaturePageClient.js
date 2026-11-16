'use client';

import Link from 'next/link';
import styled from 'styled-components';
import LandingPageLayoutNext from '../../components/LandingPageLayoutNext';
import { SIGNUP } from '../_data';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function shortDate(iso) {
  const d = new Date(iso);
  return iso && !Number.isNaN(d.getTime()) ? `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}` : '';
}
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

function LiveBlock({ kind, showcase }) {
  if (!showcase) return null;
  if (kind === 'gigs' && showcase.gigs.length) {
    return (
      <Live aria-labelledby="live-title">
        <div className="head">
          <h2 id="live-title">Latest paid UGC jobs</h2>
          {showcase.counts?.live_gigs ? <span>{showcase.counts.live_gigs} live right now</span> : null}
        </div>
        <ul className="rows">
          {showcase.gigs.map((g, i) => (
            <li key={`${g.brand}-${i}`}>
              <div>
                <b>{g.title}</b>
                <span>{[g.brand, (g.formats || []).join(', '), (g.regions || []).join(', ')].filter(Boolean).join(' · ')}</span>
              </div>
              <div className="r">
                {g.pay ? <em>{g.pay}</em> : null}
                {g.posted ? <small>{shortDate(g.posted)}</small> : null}
              </div>
            </li>
          ))}
        </ul>
        <a className="more" href={`${SIGNUP}?ref=features&source_page=ugc-jobs`}>See every UGC job and apply →</a>
      </Live>
    );
  }
  if (kind === 'hooks' && showcase.hooks.length) {
    return (
      <Live aria-labelledby="live-title">
        <div className="head">
          <h2 id="live-title">Today’s top UGC hook by niche</h2>
          <span>From brands’ recent ads</span>
        </div>
        <ul className="hooks">
          {showcase.hooks.map((h) => (
            <li key={h.niche}>
              <small>{cap(h.niche)}{h.pattern ? ` · ${h.pattern}` : ''}</small>
              <q>{h.hook}</q>
            </li>
          ))}
        </ul>
        <a className="more" href={`${SIGNUP}?ref=features&source_page=ugc-ad-examples`}>Open the full UGC Pulse →</a>
      </Live>
    );
  }
  if (kind === 'hot' && showcase.hot_brands.length) {
    return (
      <Live aria-labelledby="live-title">
        <div className="head">
          <h2 id="live-title">🔥 Brands found running ads this month</h2>
          {showcase.counts?.hot_brands ? <span>{showcase.counts.hot_brands} found in the last 30 days</span> : null}
        </div>
        <ul className="brands">
          {showcase.hot_brands.map((b) => (
            <li key={b.slug}>
              <Link href={`/brand/${b.slug}`}>
                <span className="logo" aria-hidden="true">{b.logo ? <img src={b.logo} alt="" loading="lazy" /> : (b.name || '?')[0]}</span>
                <span className="t"><b>{b.name}</b><small>{[cap(b.category) || 'Brand', b.seen_on ? `seen ${shortDate(b.seen_on)}` : null].filter(Boolean).join(' · ')}</small></span>
              </Link>
            </li>
          ))}
        </ul>
        <Link className="more" href="/directory">Browse every hot brand in the directory →</Link>
      </Live>
    );
  }
  return null;
}

export default function FeaturePageClient({ feature: f, showcase, others }) {
  const cta = `${SIGNUP}?ref=features&source_page=${f.slug}`;
  return (
    <LandingPageLayoutNext canonicalUrl={`https://newcollab.co/features/${f.slug}`}>
      <Page>
        <Crumbs aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href="/features">Features</Link><span aria-hidden="true">/</span>
          <span>{f.nav}</span>
        </Crumbs>

        <Hero>
          <div className="eyebrow">{f.eyebrow}</div>
          <h1>{f.h1}</h1>
          <p className="nc-quick-answer">{f.answer}</p>
          <div className="actions">
            <a className="primary" href={cta}>Start free</a>
            <Link className="ghost" href="/pricing">See pricing</Link>
          </div>
          <small className="plan">{f.plan} · No follower minimum</small>
        </Hero>

        <LiveBlock kind={f.live} showcase={showcase} />

        <Cards>
          {f.cards.map(([t, d]) => (
            <div key={t}><h3>{t}</h3><p>{d}</p></div>
          ))}
        </Cards>

        <Block>
          <h2>How it works</h2>
          <Steps>
            {f.steps.map(([t, d], i) => (
              <li key={t}><span className="n">{i + 1}</span><div><h3>{t}</h3><p>{d}</p></div></li>
            ))}
          </Steps>
        </Block>

        {f.sections.map((s) => (
          <Block key={s.h2} className="prose">
            <h2>{s.h2}</h2>
            {s.body.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
          </Block>
        ))}

        <Block className="prose">
          <h2>Found by brands, even inside AI assistants</h2>
          <p>
            Brands can search Newcollab creators from ChatGPT, Claude and Gemini. Creators with a published UGC portfolio
            show up there by handle, so your work is discoverable wherever brands look. <Link href="/integrations">How the AI
            integrations work</Link>.
          </p>
        </Block>

        <Block className="nc-faq">
          <h2>Frequently asked questions</h2>
          {f.faq.map(([q, a], i) => (
            <details key={q} open={i === 0}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </Block>

        <Block>
          <h2>Related guides and free tools</h2>
          <Related>
            {f.related.map(([href, label]) => <li key={href}><Link href={href}>{label}</Link></li>)}
          </Related>
        </Block>

        <Block>
          <h2>More Newcollab features</h2>
          <Others>
            {others.map((o) => (
              <Link key={o.slug} href={`/features/${o.slug}`}><b>{o.nav}</b><span>{o.navHint}</span></Link>
            ))}
          </Others>
        </Block>

        <Final>
          <h2>Start free today</h2>
          <p>Free plan, no follower minimum. Pro is $19 a month when you want Polly to run it for you. Cancel anytime.</p>
          <a className="primary" href={cta}>Start free</a>
        </Final>
      </Page>
    </LandingPageLayoutNext>
  );
}

const Page = styled.main`
  max-width: 980px; margin: 0 auto; padding: 128px 20px 72px; color: #12141a;
  @media (max-width: 640px) { padding: 92px 16px 56px; }
`;

const Crumbs = styled.nav`
  font-size: 13.5px; color: #6B7280; display: flex; gap: 6px; flex-wrap: wrap;
  a { color: #6B7280; text-decoration: none; }
  a:hover { color: #12141a; text-decoration: underline; }
  span[aria-hidden] { color: #C7C3BA; }
`;

const Hero = styled.header`
  margin: 18px 0 36px; max-width: 800px;
  .eyebrow { font-size: 12.5px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: #0d7a5f; }
  h1 { font-size: clamp(32px, 5vw, 52px); line-height: 1.06; letter-spacing: -.03em; margin: 10px 0 16px; font-weight: 800; }
  p { font-size: 18px; line-height: 1.6; color: #2a2e38; margin: 0 0 22px; }
  .actions { display: flex; gap: 10px; flex-wrap: wrap; }
  .plan { display: block; margin-top: 12px; color: #6B7280; font-size: 13.5px; }
  @media (max-width: 640px) { p { font-size: 16.5px; } }
  .primary, .ghost {
    display: inline-flex; align-items: center; height: 48px; padding: 0 22px; border-radius: 999px; font-weight: 800;
    font-size: 15.5px; text-decoration: none;
  }
  .primary { background: #12141a; color: #fff; }
  .ghost { border: 1px solid #DDD8CC; color: #12141a; background: #fff; }
`;

const Live = styled.section`
  border: 1px solid #ECE9E1; border-radius: 18px; background: #fff; padding: 20px 22px; margin: 0 0 40px;
  .head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
  .head h2 { margin: 0; font-size: 19px; font-weight: 800; letter-spacing: -.01em; }
  .head span { font-size: 13px; color: #0d7a5f; font-weight: 700; }
  ul { list-style: none; margin: 0; padding: 0; }
  .rows li { display: flex; justify-content: space-between; gap: 14px; padding: 12px 0; border-top: 1px solid #F1EFE9; }
  .rows li:first-child { border-top: 0; }
  .rows b { display: block; font-size: 15px; line-height: 1.35; }
  .rows span { font-size: 13px; color: #6B7280; }
  .rows .r { text-align: right; flex: none; display: grid; gap: 2px; }
  .rows em { font-style: normal; font-weight: 800; color: #0d7a5f; }
  .rows small { color: #9CA3AF; font-size: 12px; }
  .hooks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .hooks li { background: #FAF8F3; border-radius: 12px; padding: 12px 14px; display: grid; gap: 4px; }
  .hooks small { font-size: 12px; font-weight: 700; color: #6B7280; }
  .hooks q { font-size: 15.5px; font-weight: 700; line-height: 1.4; }
  .brands { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .brands a { display: flex; gap: 10px; align-items: center; padding: 10px; border-radius: 12px; text-decoration: none; color: inherit; border: 1px solid #F1EFE9; }
  .brands a:hover { border-color: #12141a; }
  .logo { width: 36px; height: 36px; border-radius: 10px; background: #F4F2EC; display: grid; place-items: center; overflow: hidden; flex: none; font-weight: 800; }
  .logo img { width: 100%; height: 100%; object-fit: contain; background: #fff; }
  .t { display: grid; min-width: 0; }
  .t b { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .t small { font-size: 12px; color: #6B7280; }
  .more { display: inline-block; margin-top: 12px; font-weight: 800; color: #0d7a5f; text-decoration: none; font-size: 14.5px; }
  @media (max-width: 760px) { .hooks { grid-template-columns: minmax(0, 1fr); } .brands { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
`;

const Cards = styled.div`
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-bottom: 8px;
  div { border: 1px solid #ECE9E1; border-radius: 16px; background: #FAF8F3; padding: 18px; }
  h3 { margin: 0 0 6px; font-size: 16.5px; font-weight: 800; }
  p { margin: 0; color: #4B5563; font-size: 14.5px; line-height: 1.55; }
  @media (max-width: 760px) { grid-template-columns: minmax(0, 1fr); }
`;

const Block = styled.section`
  margin-top: 44px;
  h2 { font-size: clamp(22px, 3vw, 28px); letter-spacing: -.02em; font-weight: 800 !important; margin: 0 0 14px; }
  &.prose p { font-size: 17px; line-height: 1.7; color: #2a2e38; margin: 0 0 14px; max-width: 760px; }
  &.prose a { color: #0d7a5f; font-weight: 700; }
  &.nc-faq details { border-bottom: 1px solid #ECE9E1; max-width: 800px; }
  &.nc-faq summary { cursor: pointer; padding: 15px 0; font-weight: 700; font-size: 16.5px; list-style: none; display: flex; justify-content: space-between; gap: 14px; }
  &.nc-faq summary::-webkit-details-marker { display: none; }
  &.nc-faq summary::after { content: '+'; color: #9CA3AF; font-size: 20px; line-height: 1; }
  &.nc-faq details[open] summary::after { content: '−'; }
  &.nc-faq p { margin: 0 0 16px; color: #2a2e38; line-height: 1.65; font-size: 16px; }
`;

const Steps = styled.ol`
  list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px;
  li { display: flex; gap: 14px; align-items: flex-start; }
  .n { flex: none; width: 32px; height: 32px; border-radius: 50%; background: #12141a; color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 14px; }
  h3 { margin: 4px 0 4px; font-size: 16px; font-weight: 800; }
  p { margin: 0; color: #4B5563; font-size: 14.5px; line-height: 1.55; }
  @media (max-width: 760px) { grid-template-columns: minmax(0, 1fr); }
`;

const Related = styled.ul`
  margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 28px;
  li { border-top: 1px solid #ECE9E1; }
  a { display: block; padding: 11px 0; color: #12141a; text-decoration: none; font-size: 15.5px; }
  a:hover { text-decoration: underline; }
  @media (max-width: 760px) { grid-template-columns: minmax(0, 1fr); }
`;

const Others = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px;
  a { display: grid; gap: 3px; padding: 14px 16px; border: 1px solid #ECE9E1; border-radius: 14px; background: #fff; text-decoration: none; color: inherit; }
  a:hover { border-color: #12141a; }
  b { font-size: 15px; }
  span { font-size: 13px; color: #6B7280; }
`;

const Final = styled.section`
  margin-top: 56px; padding: 32px 24px; border-radius: 22px; background: #12141a; color: #fff; text-align: center;
  h2 { margin: 0 0 8px; font-size: 28px; font-weight: 800; letter-spacing: -.02em; color: #fff; }
  p { margin: 0 auto 18px; max-width: 520px; color: #C9CBD1; line-height: 1.6; }
  .primary { display: inline-flex; height: 48px; align-items: center; padding: 0 24px; border-radius: 999px; background: #fff; color: #12141a; font-weight: 800; text-decoration: none; }
`;
