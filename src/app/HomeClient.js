'use client';

// newcollab.co homepage for creators, in the same look as the in-app Promote page: one clear H1, real numbers,
// autoplaying UGC. Structure: hero, proof, problem (top survey pains), how it works, features, pricing, FAQ, CTA. The hero renders with no fade-in so the H1 paints
// straight away (LCP). Brand cards come from the server (page.js), so crawlers get real links.
import React from 'react';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import {
  ArrowRight, BadgeDollarSign, Bot, Check, ChevronDown, Eye, Gift, LayoutTemplate, Radar, Sparkles,
} from 'lucide-react';
import LandingPageLayoutNext from './components/LandingPageLayoutNext';
import { AutoTikTok, EXAMPLES, VideoWall } from '../creator-portal/PromoteVisuals';
import { HOME_FAQ } from './homeFaq';

const SIGNUP = '/register/creator';


const t = {
  ink: '#12141a', inkSoft: '#2a2e38', muted: '#5c6470', line: '#e4e2dc', paper: '#f7f5f0', white: '#fff',
  accent: '#0d7a5f', accentDeep: '#095a46', accentSoft: '#eef6f3', mint: '#7ce0b8', hot: '#e85d3b',
};

/** 2788 -> "2,700+", 323 -> "320+": real numbers, rounded down so they stay true for a while. */
export function roundDown(n) {
  const v = Number(n) || 0;
  const step = v >= 1000 ? 100 : 10;
  return `${(Math.floor(v / step) * step).toLocaleString('en-US')}+`;
}

export default function HomeClient({ brands = [], stats }) {
  const s = {
    brands: roundDown(stats.brands), gigs: roundDown(stats.gigs), lists: roundDown(stats.lists),
    creators: roundDown(stats.creators),
  };
  return (
    <LandingPageLayoutNext>
      <Page>
        {/* 1. Hero: who it's for, the outcome, one action */}
        <Hero>
          <div className="copy">
            <Pill><span className="dot" /> For new and working UGC creators</Pill>
            <h1><span>Get gifted.</span> <span>Get <em>paid</em>.</span> <span>Get seen.</span></h1>
            <p className="kw">Grow your brand deals on autopilot.</p>
            <p>
              Newcollab finds the brands that fit you, pitches them for you and follows up. You land PR packages and
              paid UGC without hours of outreach.
            </p>
            <div className="ctas">
              <Primary href={SIGNUP}>Start free <ArrowRight size={18} /></Primary>
              <Ghost href="/directory">Browse {s.brands} brands</Ghost>
            </div>
            <small>Free plan · No card needed · No follower minimum</small>
          </div>
          <HeroVisual />
        </Hero>

        {/* 2. Proof: real numbers */}
        <Stats aria-label="Newcollab in numbers">
          <div><b>{s.creators}</b><span>creators on Newcollab</span></div>
          <div><b>{s.brands}</b><span>brands with open PR forms</span></div>
          <div><b>{s.lists}</b><span>open gift lists</span></div>
          <div><b>{s.gigs}</b><span>live paid UGC gigs</span></div>
        </Stats>

        {/* 3. Problem: the top three survey pains, nothing else */}
        <Section id="problem">
          <Head className="center">
            <Eyebrow>Sound familiar?</Eyebrow>
            <h2>Brand deals shouldn't feel like guesswork</h2>
          </Head>
          <Problems>
            <li><b>56%</b><span>don't know which brands to reach out to</span></li>
            <li><b>34%</b><span>pitch brands and never hear back</span></li>
            <li><b>32%</b><span>don't have a portfolio to show yet</span></li>
          </Problems>
          <small className="src">From our 2026 survey of creators on Newcollab.</small>
        </Section>

        {/* 4. Solution: how it works, each step answers one pain */}
        <Section id="how-it-works">
          <Split>
            <div className="copy">
              <Eyebrow>How it works</Eyebrow>
              <h2>Newcollab fixes all three. <em>On autopilot.</em></h2>
              <Flow>
                <li>
                  <span className="n">1</span>
                  <div><b>Get matched with brands</b><p>See gift lists, paid gigs and brands that work with creators your size, picked for your niche.</p></div>
                </li>
                <li>
                  <span className="n">2</span>
                  <div><b>Polly pitches for you</b><p>Your AI agent writes short, personal pitches, sends them from your Gmail and follows up. No more silence.</p></div>
                </li>
                <li>
                  <span className="n">3</span>
                  <div><b>Get gifted and paid</b><p>Your free portfolio shows brands your best work, and Polly drafts your reply with a fair rate when they say yes.</p></div>
                </li>
              </Flow>
              <Primary href={SIGNUP}>Start free <ArrowRight size={18} /></Primary>
            </div>
            <Chat aria-hidden="true">
              <div className="bar"><span className="av"><Bot size={15} /></span> Polly</div>
              <p className="me">Find skincare brands that gift small creators</p>
              <p className="bot">Found 12 that fit you. 4 have open gift lists, so start there. Want me to pitch the rest?</p>
              <p className="me">Yes, keep it short</p>
              <p className="bot">On it. 3 go out from your Gmail today, the rest this week. I'll follow up on day 4.</p>
            </Chat>
          </Split>
        </Section>

        {/* 5. Feature: paid UGC (the #2 want) with real UGC as proof */}
        <Dark id="paid-ugc">
          <div className="copy">
            <Eyebrow className="light">Paid UGC</Eyebrow>
            <h2>Every paid UGC gig. <em>One feed.</em></h2>
            <p className="sub">We scan SideShift, Upwork, Craigslist and more every day, so you never miss a paid gig. {s.gigs} live right now.</p>
            <ul>
              <li><Check size={18} /><span>Filtered to your niche, new gigs first</span></li>
              <li><Check size={18} /><span>Polly writes your application in seconds</span></li>
            </ul>
            <Primary href={SIGNUP} className="light">See paid gigs <ArrowRight size={18} /></Primary>
          </div>
          <Gigs aria-hidden="true">
            <div className="head"><span><Radar size={14} /> Paid UGC radar</span><b>Live</b></div>
            {[
              ['Skincare brand', '3 TikToks · product shipped', '$150', '#f4c7c3'],
              ['Pet food brand', '2 Reels · voiceover', '$220', '#d8f4c3'],
              ['Home fragrance', '1 unboxing video', '$90', '#c3e0f4'],
            ].map(([n, d, pay, c]) => (
              <div className="gig" key={n}>
                <span className="av" style={{ background: c }} />
                <span className="tx"><b>{n}</b><em>{d}</em></span>
                <span className="pay">{pay}</span>
              </div>
            ))}
            <div className="foot"><Sparkles size={14} /> Polly drafted your application</div>
          </Gigs>
        </Dark>
        <Wall>
          <VideoWall />
          <small>UGC by creators on Newcollab. Tap one to watch it on TikTok.</small>
        </Wall>

        {/* 6. Feature: portfolio (the #3 pain) */}
        <Section id="portfolio">
          <Split className="flip">
            <Folio aria-hidden="true">
              <div className="top">
                <span className="av" />
                <div><b>@yourname</b><span>UGC creator · Skincare & home</span></div>
              </div>
              <div className="clips">
                {EXAMPLES.slice(3, 6).map((v) => <AutoTikTok key={v.id} {...v} link={false} branded={false} radius={12} />)}
              </div>
              <div className="cta">Work with me</div>
            </Folio>
            <div className="copy">
              <Eyebrow>Free portfolio</Eyebrow>
              <h2>No collabs yet? You can still look the part.</h2>
              <p>Your best videos, niches and rates on one link brands actually open. Ready in minutes, free forever.</p>
              <Primary href="/media-kit"><LayoutTemplate size={18} /> Build my free portfolio</Primary>
            </div>
          </Split>
        </Section>

        {/* 7. Brands: proof of supply + crawlable links */}
        <Section id="brands">
          <Head className="row">
            <div>
              <Eyebrow>Brand directory</Eyebrow>
              <h2>Brands sending PR packages to creators</h2>
            </div>
            <Link href="/directory" className="all">All {s.brands} brands <ArrowRight size={15} /></Link>
          </Head>
          {brands.length > 0 ? (
            <Brands>
              {brands.slice(0, 12).map((b) => (
                <li key={b.slug}>
                  <Link href={`/brand/${b.slug}`}>
                    <Logo>{b.logo ? <img src={b.logo} alt="" loading="lazy" /> : (b.name || '?').charAt(0)}</Logo>
                    <span className="nm">{b.name}</span>
                    {b.category && <span className="cat">{b.category}</span>}
                  </Link>
                </li>
              ))}
            </Brands>
          ) : (
            <Empty>Browse beauty, skincare, fashion, home, food, tech and wellness brands in the <Link href="/directory">brand directory</Link>.</Empty>
          )}
        </Section>

        {/* 8. Pricing: one plan per audience */}
        <Section id="pricing">
          <Head className="center">
            <Eyebrow>Pricing</Eyebrow>
            <h2>Start free. Upgrade when you're ready to grow.</h2>
          </Head>
          <Plans>
            <Plan>
              <span className="for">For your first brand deals</span>
              <h3>Free</h3>
              <div className="price">$0<span> forever</span></div>
              <ul>
                <li><Check size={16} /> Gift lists and {s.brands} brands</li>
                <li><Check size={16} /> Free portfolio and media kit</li>
                <li><Check size={16} /> Polly writes your pitches</li>
                <li><Check size={16} /> 3 brand applications a month</li>
              </ul>
              <Ghost href={SIGNUP}>Start free</Ghost>
            </Plan>
            <Plan className="pro">
              <span className="for">For working UGC creators</span>
              <h3>Pro</h3>
              <div className="price">$19<span> / month</span></div>
              <ul>
                <li><Check size={16} /> Polly pitches 3 brands every weekday, with follow-ups</li>
                <li><Check size={16} /> Every paid UGC gig</li>
                <li><Check size={16} /> Unlimited applications</li>
                <li><Check size={16} /> Reply drafts with a fair rate when brands say yes</li>
              </ul>
              <Primary href={`${SIGNUP}?plan=pro`} className="light">Put my deals on autopilot <ArrowRight size={18} /></Primary>
              <small>Cancel anytime</small>
            </Plan>
          </Plans>
        </Section>

        {/* 9. Objections */}
        <Section id="faq">
          <Head className="center">
            <Eyebrow>FAQ</Eyebrow>
            <h2>Questions creators ask</h2>
          </Head>
          <Faq>
            {HOME_FAQ.map((f) => (
              <details key={f.question}>
                <summary>{f.question}<ChevronDown size={18} /></summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </Faq>
        </Section>

        {/* 10. Final CTA */}
        <Final>
          <img src="/apple-touch-icon.png" alt="" className="wm" aria-hidden="true" />
          <h2>Your next brand deal starts today.</h2>
          <p>Join {s.creators} creators getting gifted, paid and seen.</p>
          <Primary href={SIGNUP} className="light">Start free <ArrowRight size={18} /></Primary>
          <Link href="/brands/pr-packages" className="brands">Are you a brand? Get UGC from our creators <ArrowRight size={14} /></Link>
        </Final>
      </Page>
    </LandingPageLayoutNext>
  );
}

function HeroVisual() {
  const [a, b, c] = EXAMPLES;
  return (
    <Stack>
      <AutoTikTok {...b} className="side left" radius={22} />
      <AutoTikTok {...c} className="side right" radius={22} />
      <AutoTikTok {...a} className="front" radius={24} />
      <Bubble className="b1"><Gift size={15} /> <span><b>Gifted</b> PR package shipped</span></Bubble>
      <Bubble className="b2"><BadgeDollarSign size={15} /> <span><b>Paid</b> UGC gig approved</span></Bubble>
      <Bubble className="b3"><Eye size={15} /> <span><b>Seen</b> a brand opened your portfolio</span></Bubble>
    </Stack>
  );
}

/* ---------- styles ---------- */

const float = keyframes`0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); }`;
const blink = keyframes`0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; }`;

const Page = styled.div`
  max-width: 1120px; margin: 0 auto; padding: 120px 20px 72px; color: ${t.ink};
  display: grid; grid-template-columns: minmax(0, 1fr); gap: 72px;
  > * { min-width: 0; }
  /* the site-wide reset sets every element to 400: give emphasis its weight back */
  b, strong, summary { font-weight: 700; }
  h3 { font-weight: 800; }
  h1 *, h2 *, h3 > :not(.tag) { font-weight: inherit; }
  h2 { margin: 0; font-size: clamp(26px, 4vw, 38px); line-height: 1.1; letter-spacing: -0.025em; font-weight: 800; }
  h2 em { font-style: normal; color: ${t.accent}; white-space: nowrap; }
  @media (max-width: 768px) { padding: 100px 16px 56px; gap: 56px; }
`;
const Hero = styled.section`
  display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 32px; align-items: center;
  .copy { display: grid; gap: 16px; min-width: 0; }
  h1 { margin: 0; font-size: clamp(40px, 6.4vw, 68px); line-height: 1; letter-spacing: -0.035em; font-weight: 800; }
  h1 span { white-space: nowrap; }
  h1 em { font-style: normal; color: ${t.accent}; }
  .kw { font-size: clamp(18px, 2.2vw, 21px); font-weight: 700; color: ${t.ink}; }
  p { margin: 0; color: ${t.muted}; font-size: 16.5px; line-height: 1.55; max-width: 540px; }
  p b { color: ${t.ink}; }
  .ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 6px; }
  small { color: ${t.muted}; font-size: 13px; }
  @media (max-width: 860px) { grid-template-columns: 1fr; gap: 40px; }
  @media (max-width: 480px) { .ctas a { flex: 1 1 100%; justify-content: center; } }
`;
const Pill = styled.span`
  justify-self: start; display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px;
  background: ${t.accentSoft}; color: ${t.accentDeep}; font-size: 13px; font-weight: 700;
  .dot { width: 7px; height: 7px; border-radius: 50%; background: ${t.accent}; }
`;
const Primary = styled(Link)`
  display: inline-flex; align-items: center; gap: 8px; justify-self: start; padding: 14px 22px; border-radius: 14px;
  background: ${t.ink}; color: #fff; font-weight: 700; font-size: 16px; text-decoration: none; white-space: nowrap;
  transition: transform 0.15s ease, background 0.15s ease;
  &:hover { background: #000; color: #fff; transform: translateY(-1px); }
  &.light { background: #fff; color: ${t.ink}; }
  &.light:hover { background: ${t.accentSoft}; color: ${t.ink}; }
`;
const Ghost = styled(Link)`
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
  @media (max-width: 560px) {
    height: 380px; max-width: 340px;
    .front { width: 180px; } .side { width: 138px; top: 42px; }
  }
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
  @media (max-width: 560px) {
    font-size: 12px; padding: 7px 10px;
    &.b1 { left: -4px; top: 70px; } &.b2 { right: -4px; top: 170px; } &.b3 { left: 0; bottom: 14px; }
  }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
const Stats = styled.section`
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: -32px;
  div { background: ${t.white}; border: 1px solid ${t.line}; border-radius: 18px; padding: 18px; display: grid; gap: 2px; }
  b { font-size: clamp(24px, 3vw, 32px); font-weight: 800; letter-spacing: -0.02em; }
  span { font-size: 13.5px; color: ${t.muted}; }
  @media (max-width: 760px) { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: -20px; div { padding: 14px; } }
`;
const Section = styled.section`
  scroll-margin-top: 100px; display: grid; gap: 24px; min-width: 0;
  .src { color: ${t.muted}; font-size: 12.5px; margin-top: -12px; text-align: center; }
`;
const Head = styled.div`
  display: grid; gap: 10px; max-width: 720px;
  &.center { justify-self: center; text-align: center; justify-items: center; }
  &.row { max-width: none; display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
  .lead { margin: 0; color: ${t.muted}; font-size: 16px; line-height: 1.55; }
  .all { display: inline-flex; align-items: center; gap: 6px; color: ${t.ink}; font-weight: 700; text-decoration: none; }
  .all:hover { color: ${t.accent}; }
`;
const Eyebrow = styled.div`
  font-size: 12.5px; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase; color: ${t.accent};
  &.light { color: ${t.mint}; }
`;
const Problems = styled.ul`
  list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px;
  li { background: ${t.white}; border: 1px solid ${t.line}; border-radius: 22px; padding: 24px; display: grid; gap: 6px; text-align: center; }
  b { font-size: clamp(40px, 5vw, 52px); font-weight: 800; letter-spacing: -0.03em; line-height: 1; color: ${t.hot}; }
  span { font-size: 16.5px; color: ${t.inkSoft}; line-height: 1.4; }
  @media (max-width: 760px) {
    grid-template-columns: 1fr; gap: 8px;
    li { grid-template-columns: 86px 1fr; text-align: left; align-items: center; padding: 16px 18px; }
    b { font-size: 34px; }
  }
`;
const Flow = styled.ol`
  list-style: none; margin: 6px 0 8px; padding: 0; display: grid; gap: 18px;
  li { display: flex; gap: 14px; align-items: flex-start; }
  .n { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; flex-shrink: 0; background: ${t.ink}; color: #fff; font-weight: 800; }
  div { display: grid; gap: 3px; }
  b { font-size: 17px; }
  p { margin: 0; color: ${t.muted}; font-size: 15px; line-height: 1.5; }
`;
const Dark = styled.section`
  position: relative; overflow: hidden; scroll-margin-top: 100px;
  display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 32px; align-items: center;
  background: ${t.ink}; color: #fff; border-radius: 28px; padding: 40px;
  .copy { display: grid; gap: 16px; min-width: 0; }
  h2 em { color: ${t.mint}; }
  ul { list-style: none; margin: 4px 0 6px; padding: 0; display: grid; gap: 14px; }
  li { display: flex; gap: 12px; align-items: flex-start; }
  li > svg, li > img { flex-shrink: 0; margin-top: 3px; color: ${t.mint}; }
  li div { display: grid; gap: 3px; }
  li span { color: rgba(255, 255, 255, 0.85); font-size: 15.5px; line-height: 1.5; }
  .sub { margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.55; }
  @media (max-width: 860px) { grid-template-columns: 1fr; padding: 26px 18px; border-radius: 22px; }
`;
const Gigs = styled.div`
  background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 14px;
  display: grid; gap: 8px; min-width: 0;
  .head { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: rgba(255, 255, 255, 0.7); }
  .head span { display: inline-flex; align-items: center; gap: 6px; }
  .head b { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: rgba(124, 224, 184, 0.18); color: ${t.mint}; }
  .gig { display: flex; align-items: center; gap: 12px; background: rgba(255, 255, 255, 0.07); border-radius: 14px; padding: 12px; }
  .av { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; }
  .tx { display: grid; min-width: 0; flex: 1; }
  .tx b { font-size: 14.5px; }
  .tx em { font-style: normal; font-size: 12.5px; color: rgba(255, 255, 255, 0.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pay { font-weight: 800; font-size: 17px; color: ${t.mint}; }
  .foot { display: flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(255, 255, 255, 0.75); padding: 2px 2px 0; }
  .foot svg { color: ${t.mint}; }
`;
const Wall = styled.div`
  margin-top: -48px; display: grid; gap: 8px; min-width: 0;
  small { color: ${t.muted}; font-size: 12.5px; text-align: center; }
  @media (max-width: 768px) { margin-top: -36px; }
`;
const Brands = styled.ul`
  list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px;
  a {
    display: grid; grid-template-columns: 44px minmax(0, 1fr); grid-template-rows: auto auto; column-gap: 12px;
    align-items: center; padding: 12px; border-radius: 16px; background: ${t.white}; border: 1px solid ${t.line};
    text-decoration: none; color: ${t.ink}; transition: border-color 0.15s ease, transform 0.15s ease;
  }
  a:hover { border-color: ${t.ink}; transform: translateY(-1px); }
  .nm { font-weight: 700; font-size: 14.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cat { grid-column: 2; font-size: 12.5px; color: ${t.muted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  @media (max-width: 960px) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (max-width: 680px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 380px) { grid-template-columns: 1fr; }
`;
const Logo = styled.span`
  grid-row: 1 / 3; width: 44px; height: 44px; border-radius: 12px; overflow: hidden; display: grid; place-items: center;
  background: ${t.paper}; font-weight: 800; color: ${t.muted};
  img { width: 100%; height: 100%; object-fit: contain; background: #fff; }
`;
const Empty = styled.p`margin: 0; color: ${t.muted}; a { color: ${t.ink}; font-weight: 700; }`;
const Split = styled.div`
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 40px; align-items: center;
  .copy { display: grid; gap: 14px; min-width: 0; }
  .copy p { margin: 0; color: ${t.muted}; font-size: 16px; line-height: 1.55; }
  @media (max-width: 860px) {
    grid-template-columns: 1fr; gap: 28px;
    &.flip > :first-child { order: 2; }
  }
`;
const Chat = styled.div`
  background: ${t.white}; border: 1px solid ${t.line}; border-radius: 24px; padding: 18px; display: grid; gap: 10px;
  box-shadow: 0 24px 50px rgba(18, 20, 26, 0.08); max-width: 440px; width: 100%; justify-self: center;
  .bar { display: flex; align-items: center; gap: 8px; font-weight: 800; padding-bottom: 6px; border-bottom: 1px solid ${t.line}; }
  .av { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: ${t.accent}; color: #fff; }
  p { margin: 0; padding: 10px 14px; border-radius: 18px; font-size: 14.5px; line-height: 1.45; max-width: 85%; }
  .me { justify-self: end; background: ${t.ink}; color: #fff; border-bottom-right-radius: 6px; }
  .bot { justify-self: start; background: ${t.paper}; border-bottom-left-radius: 6px; }
  .typing { display: flex; gap: 4px; padding: 14px; }
  .typing span { width: 7px; height: 7px; border-radius: 50%; background: ${t.muted}; animation: ${blink} 1.2s infinite; }
  .typing span:nth-child(2) { animation-delay: 0.2s; } .typing span:nth-child(3) { animation-delay: 0.4s; }
`;
const Folio = styled.div`
  background: ${t.white}; border: 1px solid ${t.line}; border-radius: 24px; padding: 18px; display: grid; gap: 14px;
  box-shadow: 0 24px 50px rgba(18, 20, 26, 0.08); max-width: 440px; width: 100%; justify-self: center;
  .top { display: flex; align-items: center; gap: 12px; }
  .top .av { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #f4c7c3, #c3e0f4); flex-shrink: 0; }
  .top div { display: grid; }
  .top span { font-size: 13px; color: ${t.muted}; }
  .clips { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .cta { text-align: center; padding: 12px; border-radius: 12px; background: ${t.ink}; color: #fff; font-weight: 700; }
`;
const Plans = styled.div`
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; max-width: 860px; width: 100%; justify-self: center;
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`;
const Plan = styled.article`
  background: ${t.white}; border: 1px solid ${t.line}; border-radius: 24px; padding: 26px; display: grid; gap: 14px;
  align-content: start;
  .for { font-size: 12.5px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: ${t.accent}; }
  &.pro .for { color: ${t.mint}; }
  h3 { margin: 0; font-size: 18px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .tag { font-size: 12px; padding: 3px 9px; border-radius: 999px; background: rgba(124, 224, 184, 0.18); color: ${t.mint}; }
  .price { font-size: 44px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; }
  .price span { font-size: 15px; font-weight: 500; color: ${t.muted}; letter-spacing: 0; }
  ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
  li { display: flex; gap: 8px; align-items: flex-start; font-size: 15px; line-height: 1.45; }
  li svg { flex-shrink: 0; margin-top: 3px; color: ${t.accent}; }
  a { justify-self: stretch; justify-content: center; margin-top: 6px; }
  small { text-align: center; color: ${t.muted}; font-size: 13px; }
  &.pro { background: ${t.ink}; color: #fff; border-color: ${t.ink}; }
  &.pro .price span, &.pro small { color: rgba(255, 255, 255, 0.6); }
  &.pro li svg { color: ${t.mint}; }
`;
const Faq = styled.div`
  display: grid; gap: 10px; max-width: 860px; width: 100%; justify-self: center;
  details { background: ${t.white}; border: 1px solid ${t.line}; border-radius: 16px; padding: 4px 18px; }
  summary {
    list-style: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 12px;
    padding: 14px 0; font-weight: 700; font-size: 16px;
  }
  summary::-webkit-details-marker { display: none; }
  summary svg { flex-shrink: 0; transition: transform 0.2s ease; color: ${t.muted}; }
  details[open] summary svg { transform: rotate(180deg); }
  p { margin: 0 0 16px; color: ${t.muted}; font-size: 15px; line-height: 1.6; }
`;
const Final = styled.section`
  position: relative; overflow: hidden; text-align: center; display: grid; gap: 14px; justify-items: center;
  background: ${t.accent}; color: #fff; border-radius: 28px; padding: 56px 24px;
  .wm { position: absolute; right: -40px; bottom: -40px; width: 200px; opacity: 0.14; transform: rotate(-12deg); border-radius: 40px; pointer-events: none; }
  > *:not(.wm) { position: relative; }
  p { margin: 0; color: rgba(255, 255, 255, 0.82); font-size: 17px; }
  a { justify-self: center; }
  a.brands { display: inline-flex; align-items: center; gap: 6px; margin-top: 6px; color: rgba(255, 255, 255, 0.85); font-size: 14px; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
  @media (max-width: 768px) { padding: 40px 18px; border-radius: 22px; }
`;
