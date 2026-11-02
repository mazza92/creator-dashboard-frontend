'use client';

// newcollab.co/ugc: the brand pitch for performance UGC (pay per view). Linked from cold brand outreach, so it
// carries ref/utm params through to the brand signup at app.newcollab.co/for-brands. Same look as the homepage.
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  ArrowRight, BadgeDollarSign, Check, ChevronDown, Eye, Megaphone, ShieldCheck, SlidersHorizontal, Sparkles, Users, X,
} from 'lucide-react';
import LandingPageLayoutNext from '../components/LandingPageLayoutNext';
import { AutoTikTok, EXAMPLES, VideoWall } from '../../creator-portal/PromoteVisuals';

const SIGNUP = 'https://app.newcollab.co/for-brands';
const CPM = 2.5; // example pay per 1,000 views used in the calculator
const FEE = 0.2;

const t = {
  ink: '#12141a', inkSoft: '#2a2e38', muted: '#5c6470', line: '#e4e2dc', paper: '#f7f5f0', white: '#fff',
  accent: '#0d7a5f', accentDeep: '#095a46', accentSoft: '#eef6f3', mint: '#7ce0b8', hot: '#e85d3b',
};

const FAQ = [
  ['How do you count views?', 'We read each post’s public view count on TikTok or Instagram every day for 30 days after it goes live. You pay for the views it reaches in that window, up to the cap you set per video.'],
  ['Can we use the videos in our ads?', 'Yes. Tap “Use as ad” on any post and we get the creator’s go-ahead for paid usage, for a small bonus to the creator. You can then run it as a Spark Ad or a Partnership Ad.'],
  ['What stops fake views?', 'Posts with views that don’t match their likes and comments are held and reviewed before anyone is paid. Creators who game views are removed.'],
  ['Do creators need our product?', 'Your choice. Creators who already own it can post the same day, or you ship to a small group we match to you and they still get paid on views, so they actually post.'],
  ['Can we choose who posts?', 'You set who can join: region, niche and minimum followers. You approve each post before it counts, or let it approve itself after 48 hours.'],
  ['What does it cost?', 'You set a budget and a rate per 1,000 views. Our 20% fee is included in that budget. Unspent budget is refunded, and you can pause or stop anytime.'],
];

/** Carry ref/utm params from the outreach link into the brand signup. */
function useSignupHref() {
  const [href, setHref] = useState(`${SIGNUP}?ref=ugc_page`);
  useEffect(() => {
    try {
      const inbound = new URLSearchParams(window.location.search);
      const out = new URLSearchParams({ ref: inbound.get('ref') || 'ugc_page' });
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'oref'].forEach((k) => {
        if (inbound.get(k)) out.set(k, inbound.get(k));
      });
      if (!out.get('utm_campaign')) out.set('utm_campaign', 'performance_ugc');
      setHref(`${SIGNUP}?${out.toString()}`);
    } catch (_) { /* keep default */ }
  }, []);
  return href;
}

function money(n) {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

export default function UgcBrandsClient() {
  const signup = useSignupHref();
  const [budget, setBudget] = useState(1000);
  const views = ((budget * (1 - FEE)) / CPM) * 1000;
  const postsLo = Math.max(3, Math.round(views / 9000));
  const postsHi = Math.max(5, Math.round(views / 5000));
  const fixedVideos = Math.floor(budget / 150);

  return (
    <LandingPageLayoutNext canonicalUrl="https://newcollab.co/ugc" hideHeader>
      <Bar>
        <a href="/" className="logo"><img src="/newcollab-logo-dark.png" alt="Newcollab" /></a>
        <span className="for">For brands</span>
        <a href={signup} className="cta">Launch a campaign</a>
      </Bar>
      <Page>
        <Hero>
          <div className="copy">
            <Pill><span className="dot" /> Performance UGC for DTC brands</Pill>
            <h1><span>Pay for views,</span> <span><em>not promises.</em></span></h1>
            <p className="kw">Real creators post about your product. You pay only for the views they deliver.</p>
            <p>
              No fixed fee per video and no guesswork on ROI. Set a budget and a rate per 1,000 views, creators in your
              niche post on their own TikTok and Instagram, and the videos that perform become your next ads.
            </p>
            <div className="ctas">
              <Primary href={signup}>Launch your first campaign <ArrowRight size={18} /></Primary>
              <Ghost href="#how">See how it works</Ghost>
            </div>
            <small>Start from $300 · Pause anytime · Unspent budget refunded</small>
          </div>
          <Stack aria-hidden="true">
            <AutoTikTok {...EXAMPLES[1]} className="side left" radius={22} link={false} branded={false} />
            <AutoTikTok {...EXAMPLES[2]} className="side right" radius={22} link={false} branded={false} />
            <AutoTikTok {...EXAMPLES[0]} className="front" radius={24} link={false} branded={false} />
            <Bubble className="b1"><Eye size={15} /> <span><b>48,200</b> views</span></Bubble>
            <Bubble className="b2"><BadgeDollarSign size={15} /> <span><b>$2.50</b> per 1K views</span></Bubble>
            <Bubble className="b3"><Megaphone size={15} /> <span><b>Boosted</b> as a Spark Ad</span></Bubble>
          </Stack>
        </Hero>

        <Section id="problem">
          <Head className="center">
            <Eyebrow>The old way</Eyebrow>
            <h2>You pay first and hope it performs</h2>
          </Head>
          <Old>
            <li><X size={18} /><div><b>$150 to $400 per UGC video</b><span>Paid upfront, before a single person sees it.</span></div></li>
            <li><X size={18} /><div><b>Gifting that never posts</b><span>Only 20 to 40% of gifted creators usually post.</span></div></li>
            <li><X size={18} /><div><b>Influencer fees on a forecast</b><span>A flat fee and a rough ROI projection. If it flops, the money is gone.</span></div></li>
          </Old>
        </Section>

        <Section id="how">
          <Head className="center">
            <Eyebrow>The Newcollab way</Eyebrow>
            <h2>Performance UGC in three steps</h2>
          </Head>
          <Steps>
            <li>
              <span className="n">1</span>
              <SlidersHorizontal size={22} />
              <b>Set your reward</b>
              <p>Pick a budget and a rate per 1,000 views, a cap per video, and who can join: region, niche, follower count. Optional: ship free product to a few matched creators.</p>
            </li>
            <li>
              <span className="n">2</span>
              <Users size={22} />
              <b>Creators post on their own accounts</b>
              <p>UGC creators in your niche join in one tap and post on TikTok or Instagram, with a brief and the hooks already working in your category. First videos often land the same day.</p>
            </li>
            <li>
              <span className="n">3</span>
              <BadgeDollarSign size={22} />
              <b>Pay for views, boost the winners</b>
              <p>Views are counted daily for 30 days. You pay for what each post actually reached, then turn the top performers into Spark Ads or Partnership Ads.</p>
            </li>
          </Steps>
        </Section>

        <Dark id="calculator">
          <div className="copy">
            <Eyebrow className="light">What your budget buys</Eyebrow>
            <h2>Know your cost per view <em>before</em> you spend.</h2>
            <p className="sub">Your rate per 1,000 views is fixed by you. No surprises, no blind ROI projections. You see every view you pay for.</p>
            <ul>
              <li><Check size={18} /><span>Every post, view and dollar in one live dashboard</span></li>
              <li><Check size={18} /><span>Caps per video and per month, so spend never runs away</span></li>
              <li><Check size={18} /><span>Pause, top up or stop whenever you want</span></li>
            </ul>
          </div>
          <Calc>
            <div className="top"><span>Monthly budget</span><b>{money(budget)}</b></div>
            <input type="range" min={300} max={5000} step={100} value={budget} onChange={(e) => setBudget(Number(e.target.value))} aria-label="Monthly budget" />
            <div className="out">
              <div><span>Views delivered</span><strong>{Math.round(views / 1000).toLocaleString('en-US')}K</strong></div>
              <div><span>Creator posts</span><strong>{postsLo} to {postsHi}</strong></div>
            </div>
            <div className="vs">Same budget at $150 per UGC video: <b>{fixedVideos} videos</b> and zero guaranteed views.</div>
            <small>Example at $2.50 per 1,000 views, with our 20% fee included. Your results depend on your rate and niche.</small>
          </Calc>
        </Dark>

        <Wall>
          <VideoWall branded={false} />
          <small>UGC by creators on Newcollab.</small>
        </Wall>

        <Section id="benefits">
          <Head className="center">
            <Eyebrow>What you get</Eyebrow>
            <h2>Reach today, ads tomorrow</h2>
          </Head>
          <Benefits>
            <li><Eye size={20} /><b>Organic reach on real accounts</b><p>Every post lives on the creator&apos;s feed, in front of their audience, not just in your ad account.</p></li>
            <li><Megaphone size={20} /><b>Proven ad creative</b><p>You only boost videos that already pulled views organically, so your ads start from a winner.</p></li>
            <li><Sparkles size={20} /><b>Hooks that already work</b><p>Our AI scans your category on TikTok and hands creators the hooks and formats getting views right now.</p></li>
            <li><ShieldCheck size={20} /><b>Fraud checks built in</b><p>Views that don&apos;t match engagement are held for review. You never pay for bots.</p></li>
          </Benefits>
        </Section>

        <Section id="for">
          <Fit>
            <div>
              <Eyebrow>Built for</Eyebrow>
              <h2>Small, growing and mid-size DTC brands</h2>
              <p>Beauty, skincare, wellness, home, food and pets. If people film your product, creators can make it work for you, without an agency retainer.</p>
            </div>
            <div className="nums">
              <div><b>3,600+</b><span>UGC creators on Newcollab</span></div>
              <div><b>US · UK · CA · AU · EU</b><span>Creator regions</span></div>
              <div><b>From $300</b><span>No minimum contract</span></div>
            </div>
          </Fit>
        </Section>

        <Section id="faq">
          <Head className="center">
            <Eyebrow>FAQ</Eyebrow>
            <h2>Questions brands ask</h2>
          </Head>
          <Faq>
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>{q}<ChevronDown size={18} /></summary>
                <p>{a}</p>
              </details>
            ))}
          </Faq>
        </Section>

        <Final>
          <h2>Get your first creator videos this week.</h2>
          <p>Set a budget, pick your rate, and only pay for the views you get.</p>
          <Primary href={signup} className="light">Launch your first campaign <ArrowRight size={18} /></Primary>
          <small>We set up your first campaign with you, free.</small>
        </Final>
      </Page>
    </LandingPageLayoutNext>
  );
}

/* ---------- styles (shared look with the homepage) ---------- */

const float = keyframes`0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); }`;

const Bar = styled.header`
  max-width: 1120px; margin: 0 auto; padding: 20px 20px 0; display: flex; align-items: center; gap: 12px;
  .logo img { height: 28px; width: auto; display: block; }
  .for { font-size: 13px; font-weight: 700; color: ${t.muted}; border-left: 1px solid ${t.line}; padding-left: 12px; }
  .cta { margin-left: auto; background: ${t.ink}; color: #fff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 10px 16px; border-radius: 12px; white-space: nowrap; }
  .cta:hover { background: #000; color: #fff; }
  @media (max-width: 768px) { padding: 16px 16px 0; .for { display: none; } }
`;
const Page = styled.div`
  max-width: 1120px; margin: 0 auto; padding: 48px 20px 72px; color: ${t.ink};
  display: grid; grid-template-columns: minmax(0, 1fr); gap: 72px;
  > * { min-width: 0; }
  b, strong, summary { font-weight: 700; }
  h3 { font-weight: 800; }
  h1 *, h2 * { font-weight: inherit; }
  h2 { margin: 0; font-size: clamp(26px, 4vw, 38px); line-height: 1.1; letter-spacing: -0.025em; font-weight: 800; }
  h2 em { font-style: normal; color: ${t.accent}; }
  @media (max-width: 768px) { padding: 32px 16px 56px; gap: 56px; }
`;
const Hero = styled.section`
  display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 32px; align-items: center;
  .copy { display: grid; gap: 16px; min-width: 0; }
  h1 { margin: 0; font-size: clamp(40px, 6.4vw, 68px); line-height: 1; letter-spacing: -0.035em; font-weight: 800; }
  h1 span { white-space: nowrap; }
  h1 em { font-style: normal; color: ${t.accent}; }
  .kw { font-size: clamp(18px, 2.2vw, 21px); font-weight: 700; color: ${t.ink}; }
  p { margin: 0; color: ${t.muted}; font-size: 16.5px; line-height: 1.55; max-width: 540px; }
  .ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 6px; }
  small { color: ${t.muted}; font-size: 13px; }
  @media (max-width: 860px) { grid-template-columns: 1fr; gap: 40px; }
  @media (max-width: 480px) { .ctas a { flex: 1 1 100%; justify-content: center; } h1 span { white-space: normal; } }
`;
const Pill = styled.span`
  justify-self: start; display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px;
  background: ${t.accentSoft}; color: ${t.accentDeep}; font-size: 13px; font-weight: 700;
  .dot { width: 7px; height: 7px; border-radius: 50%; background: ${t.accent}; }
`;
const Primary = styled.a`
  display: inline-flex; align-items: center; gap: 8px; justify-self: start; padding: 14px 22px; border-radius: 14px;
  background: ${t.ink}; color: #fff; font-weight: 700; font-size: 16px; text-decoration: none; white-space: nowrap;
  transition: transform 0.15s ease, background 0.15s ease;
  &:hover { background: #000; color: #fff; transform: translateY(-1px); }
  &.light { background: #fff; color: ${t.ink}; }
  &.light:hover { background: ${t.accentSoft}; color: ${t.ink}; }
`;
const Ghost = styled.a`
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 20px; border-radius: 14px;
  border: 1px solid ${t.line}; background: ${t.white}; color: ${t.ink}; font-weight: 700; font-size: 16px;
  text-decoration: none; white-space: nowrap;
  &:hover { border-color: ${t.ink}; color: ${t.ink}; }
`;
const Stack = styled.div`
  position: relative; height: 470px; max-width: 440px; width: 100%; margin: 0 auto;
  .front { position: absolute; left: 50%; top: 0; width: 226px; transform: translateX(-50%); z-index: 3; }
  .side { position: absolute; top: 52px; width: 180px; z-index: 1; opacity: 0.92; }
  .left { left: 0; transform: rotate(-7deg); }
  .right { right: 0; transform: rotate(7deg); }
  @media (max-width: 560px) { height: 380px; max-width: 340px; .front { width: 180px; } .side { width: 138px; top: 42px; } }
`;
const Bubble = styled.div`
  position: absolute; z-index: 4; display: inline-flex; align-items: center; gap: 7px; padding: 9px 13px;
  border-radius: 999px; background: #fff; color: ${t.ink}; font-size: 13px; white-space: nowrap;
  box-shadow: 0 12px 28px rgba(18, 20, 26, 0.16); animation: ${float} 4s ease-in-out infinite;
  b { font-weight: 800; margin-right: 3px; }
  svg { flex-shrink: 0; color: ${t.accent}; }
  &.b1 { left: -14px; top: 96px; }
  &.b2 { right: -14px; top: 210px; animation-delay: 1.3s; background: ${t.accent}; color: #fff; }
  &.b2 svg { color: ${t.mint}; }
  &.b3 { left: 2px; bottom: 26px; animation-delay: 2.2s; }
  @media (max-width: 560px) { font-size: 12px; padding: 7px 10px; &.b1 { left: -4px; top: 70px; } &.b2 { right: -4px; top: 170px; } &.b3 { left: 0; bottom: 14px; } }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
const Section = styled.section`scroll-margin-top: 100px; display: grid; gap: 24px; min-width: 0;`;
const Head = styled.div`
  display: grid; gap: 10px; max-width: 720px;
  &.center { justify-self: center; text-align: center; justify-items: center; }
`;
const Eyebrow = styled.div`
  font-size: 12.5px; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase; color: ${t.accent};
  &.light { color: ${t.mint}; }
`;
const Old = styled.ul`
  list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px;
  li { display: flex; gap: 12px; align-items: flex-start; background: ${t.white}; border: 1px solid ${t.line}; border-radius: 20px; padding: 20px; }
  li > svg { flex-shrink: 0; color: ${t.hot}; margin-top: 3px; }
  div { display: grid; gap: 4px; }
  b { font-size: 17px; }
  span { color: ${t.muted}; font-size: 15px; line-height: 1.5; }
  @media (max-width: 860px) { grid-template-columns: 1fr; }
`;
const Steps = styled.ol`
  list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px;
  li { background: ${t.paper}; border-radius: 22px; padding: 24px; display: grid; gap: 10px; align-content: start; position: relative; }
  .n { position: absolute; top: 20px; right: 20px; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: ${t.ink}; color: #fff; font-weight: 800; font-size: 14px; }
  li > svg { color: ${t.accent}; }
  b { font-size: 18px; }
  p { margin: 0; color: ${t.muted}; font-size: 15px; line-height: 1.55; }
  @media (max-width: 860px) { grid-template-columns: 1fr; }
`;
const Dark = styled.section`
  position: relative; overflow: hidden; scroll-margin-top: 100px;
  display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 32px; align-items: center;
  background: ${t.ink}; color: #fff; border-radius: 28px; padding: 40px;
  .copy { display: grid; gap: 16px; min-width: 0; }
  h2 em { color: ${t.mint}; }
  .sub { margin: 0; color: rgba(255, 255, 255, 0.72); font-size: 16px; line-height: 1.55; }
  ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
  li { display: flex; gap: 10px; align-items: flex-start; }
  li svg { flex-shrink: 0; margin-top: 3px; color: ${t.mint}; }
  li span { color: rgba(255, 255, 255, 0.85); font-size: 15.5px; }
  @media (max-width: 860px) { grid-template-columns: 1fr; padding: 26px 18px; border-radius: 22px; }
`;
const Calc = styled.div`
  background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 22px; padding: 22px;
  display: grid; gap: 14px; min-width: 0;
  .top { display: flex; justify-content: space-between; align-items: baseline; }
  .top span { color: rgba(255, 255, 255, 0.65); font-size: 14px; }
  .top b { font-size: 26px; font-variant-numeric: tabular-nums; }
  input[type='range'] { width: 100%; accent-color: ${t.mint}; height: 28px; }
  .out { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .out div { background: rgba(255, 255, 255, 0.07); border-radius: 14px; padding: 14px; display: grid; gap: 2px; }
  .out span { font-size: 12.5px; color: rgba(255, 255, 255, 0.65); }
  .out strong { font-size: 30px; line-height: 1.1; color: ${t.mint}; font-variant-numeric: tabular-nums; }
  .vs { font-size: 14px; color: rgba(255, 255, 255, 0.8); border-top: 1px dashed rgba(255, 255, 255, 0.18); padding-top: 12px; }
  small { color: rgba(255, 255, 255, 0.5); font-size: 12px; }
`;
const Wall = styled.div`
  margin-top: -40px; display: grid; gap: 8px; min-width: 0;
  small { color: ${t.muted}; font-size: 12.5px; text-align: center; }
`;
const Benefits = styled.ul`
  list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px;
  li { background: ${t.white}; border: 1px solid ${t.line}; border-radius: 20px; padding: 20px; display: grid; gap: 8px; align-content: start; }
  li > svg { color: ${t.accent}; }
  b { font-size: 16.5px; }
  p { margin: 0; color: ${t.muted}; font-size: 14.5px; line-height: 1.5; }
  @media (max-width: 960px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;
const Fit = styled.div`
  display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 28px; align-items: center;
  background: ${t.paper}; border-radius: 26px; padding: 32px;
  > div:first-child { display: grid; gap: 12px; }
  p { margin: 0; color: ${t.muted}; font-size: 16px; line-height: 1.55; }
  .nums { display: grid; gap: 10px; }
  .nums div { background: ${t.white}; border: 1px solid ${t.line}; border-radius: 16px; padding: 14px 16px; display: grid; }
  .nums b { font-size: 22px; letter-spacing: -0.01em; }
  .nums span { font-size: 13.5px; color: ${t.muted}; }
  @media (max-width: 860px) { grid-template-columns: 1fr; padding: 22px 18px; }
`;
const Faq = styled.div`
  display: grid; gap: 10px; max-width: 860px; width: 100%; justify-self: center;
  details { background: ${t.white}; border: 1px solid ${t.line}; border-radius: 16px; padding: 4px 18px; }
  summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 0; font-size: 16px; }
  summary::-webkit-details-marker { display: none; }
  summary svg { flex-shrink: 0; transition: transform 0.2s ease; color: ${t.muted}; }
  details[open] summary svg { transform: rotate(180deg); }
  p { margin: 0 0 16px; color: ${t.muted}; font-size: 15px; line-height: 1.6; }
`;
const Final = styled.section`
  text-align: center; display: grid; gap: 14px; justify-items: center;
  background: ${t.accent}; color: #fff; border-radius: 28px; padding: 56px 24px;
  p { margin: 0; color: rgba(255, 255, 255, 0.85); font-size: 17px; }
  small { color: rgba(255, 255, 255, 0.75); font-size: 13px; }
  @media (max-width: 768px) { padding: 40px 18px; border-radius: 22px; }
`;
