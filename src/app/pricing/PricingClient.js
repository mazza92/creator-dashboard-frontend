'use client';

import Link from 'next/link';
import styled from 'styled-components';
import LandingPageLayoutNext from '../components/LandingPageLayoutNext';
import { SIGNUP } from '../features/_data';
import { PRICING_FAQ } from './faq';



const FREE = [
  'Brand directory: 3,000+ brands with PR contacts or forms',
  'Free UGC portfolio and media kit',
  'Free UGC tools and starter guide',
  'Polly writes your pitches',
  '3 brand applications a month',
  'Brand deal tracker',
];
const PRO = [
  'Polly pitches 3 brands every weekday from your Gmail, with follow-ups',
  'Every paid UGC gig in the feed',
  'Unlimited applications',
  'Full UGC Pulse: daily hooks brands run in their ads',
  'Reply drafts with a fair rate when brands say yes',
  'Everything in Free',
];

export default function PricingClient() {
  return (
    <LandingPageLayoutNext canonicalUrl="https://newcollab.co/pricing">
      <Page>
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><i aria-hidden="true">/</i><span>Pricing</span></nav>
        <header>
          <div className="eyebrow">Pricing</div>
          <h1>Start free. Upgrade when you’re ready to grow.</h1>
          <p className="nc-quick-answer">
            Newcollab is free for UGC creators, with no follower minimum. Pro is $19 a month when you want Polly to pitch
            brands for you every weekday and see every paid UGC gig. No commission on your deals. Cancel anytime.
          </p>
        </header>
        <Plans>
          <section aria-labelledby="free-plan">
            <span className="for">For your first brand deals</span>
            <h2 id="free-plan">Free</h2>
            <div className="price">$0<span> forever</span></div>
            <ul>{FREE.map((x) => <li key={x}>{x}</li>)}</ul>
            <a className="ghost" href={`${SIGNUP}?ref=pricing`}>Start free</a>
          </section>
          <section className="pro" aria-labelledby="pro-plan">
            <span className="for">Your weekly UGC routine, done for you</span>
            <h2 id="pro-plan">Pro</h2>
            <div className="price">$19<span> / month</span></div>
            <ul>{PRO.map((x) => <li key={x}>{x}</li>)}</ul>
            <a className="primary" href={`${SIGNUP}?plan=pro&ref=pricing`}>Start with Pro</a>
            <small>Cancel anytime</small>
          </section>
        </Plans>
        <section className="nc-faq">
          <h2>Pricing questions</h2>
          {PRICING_FAQ.map(([q, a], i) => (
            <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </section>
        <p className="more">
          See what each part does: <Link href="/features/ugc-jobs">UGC jobs</Link>, <Link href="/features/ugc-ad-examples">UGC ad examples</Link>,{' '}
          <Link href="/features/brands-hiring-ugc-creators">brands hiring UGC creators</Link>, <Link href="/features/ai-pitch-email-writer">AI pitch email writer</Link>{' '}
          and the <Link href="/features/brand-deal-tracker">brand deal tracker</Link>. Are you a brand? <Link href="/brands/pr-packages">See the brand offer</Link>.
        </p>
      </Page>
    </LandingPageLayoutNext>
  );
}

const Page = styled.main`
  max-width: 980px; margin: 0 auto; padding: 128px 20px 72px; color: #12141a;
  @media (max-width: 640px) { padding: 92px 16px 56px; }
  .crumbs { font-size: 13.5px; color: #6B7280; display: flex; gap: 6px; }
  .crumbs a { color: #6B7280; text-decoration: none; }
  .crumbs i { font-style: normal; color: #C7C3BA; }
  header { margin: 18px 0 30px; max-width: 760px; }
  .eyebrow { font-size: 12.5px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: #0d7a5f; }
  h1 { font-size: clamp(30px, 4.6vw, 48px); line-height: 1.08; letter-spacing: -.03em; margin: 10px 0 14px; font-weight: 800; }
  header p { font-size: 17.5px; line-height: 1.6; color: #2a2e38; margin: 0; }
  .nc-faq { margin-top: 48px; max-width: 800px; }
  .nc-faq h2 { font-size: 26px; font-weight: 800 !important; letter-spacing: -.02em; margin: 0 0 10px; }
  .nc-faq details { border-bottom: 1px solid #ECE9E1; }
  .nc-faq summary { cursor: pointer; padding: 15px 0; font-weight: 700; font-size: 16.5px; list-style: none; display: flex; justify-content: space-between; gap: 14px; }
  .nc-faq summary::-webkit-details-marker { display: none; }
  .nc-faq summary::after { content: '+'; color: #9CA3AF; font-size: 20px; line-height: 1; }
  .nc-faq details[open] summary::after { content: '−'; }
  .nc-faq p { margin: 0 0 16px; line-height: 1.65; color: #2a2e38; }
  .more { margin-top: 32px; color: #4B5563; line-height: 1.7; }
  .more a { color: #0d7a5f; font-weight: 700; }
`;

const Plans = styled.div`
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px;
  @media (max-width: 760px) { grid-template-columns: minmax(0, 1fr); }
  section { border: 1px solid #ECE9E1; border-radius: 20px; background: #fff; padding: 24px; display: flex; flex-direction: column; }
  section.pro { background: #12141a; color: #fff; border-color: #12141a; }
  .for { font-size: 13px; font-weight: 700; color: #6B7280; }
  .pro .for { color: #C9CBD1; }
  h2 { margin: 6px 0 4px; font-size: 22px; font-weight: 800 !important; color: inherit; }
  .price { font-size: 40px; font-weight: 800; letter-spacing: -.02em; }
  .price span { font-size: 15px; font-weight: 600; color: #9CA3AF; }
  ul { list-style: none; padding: 0; margin: 16px 0 20px; display: grid; gap: 9px; flex: 1; }
  li { padding-left: 24px; position: relative; font-size: 15px; line-height: 1.45; }
  li::before { content: '✓'; position: absolute; left: 0; color: #0d7a5f; font-weight: 800; }
  .pro li::before { color: #6EE7B7; }
  .primary, .ghost { display: flex; justify-content: center; align-items: center; height: 48px; border-radius: 999px; font-weight: 800; text-decoration: none; }
  .ghost { border: 1px solid #DDD8CC; color: #12141a; }
  .primary { background: #fff; color: #12141a; }
  small { text-align: center; margin-top: 8px; color: #9CA3AF; }
`;
