'use client';

// newcollab.co homepage for creators, in the same look as Promote Newcollab: one clear H1, real numbers,
// autoplaying UGC and three ways in (gifted, paid, seen). The hero renders with no fade-in so the H1 paints
// straight away (LCP). Brand cards come from the server (page.js), so crawlers get real links.
import React from 'react';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import {
  ArrowRight, BadgeDollarSign, Bot, Check, ChevronDown, Eye, Gift, LayoutTemplate, Mail, Search, Sparkles, Store,
} from 'lucide-react';
import LandingPageLayoutNext from './components/LandingPageLayoutNext';
import { AutoTikTok, BrandMark, EarningsSlider, EXAMPLES, VideoWall } from '../creator-portal/PromoteVisuals';
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
        <Hero>
          <div className="copy">
            <Pill><span className="dot" /> Free for creators · No follower minimum</Pill>
            <h1><span>Get gifted.</span> <span>Get <em>paid</em>.</span> <span>Get seen.</span></h1>
            <p className="kw">PR packages, paid UGC gigs and brand deals for creators.</p>
            <p>
              Join brand gift lists in one tap, pick up paid UGC gigs and let <b>Polly</b>, your AI agent, pitch
              brands for you. Built for UGC creators and new creators, not just big accounts.
            </p>
            <div className="ctas">
              <Primary href={SIGNUP}>Start free <ArrowRight size={18} /></Primary>
              <Ghost href="/directory">Browse {s.brands} brands</Ghost>
            </div>
            <small>Free forever plan · No card needed</small>
          </div>
          <HeroVisual />
        </Hero>

        <Stats aria-label="Newcollab in numbers">
          <div><b>{s.brands}</b><span>brands with open PR forms</span></div>
          <div><b>{s.lists}</b><span>open gift lists</span></div>
          <div><b>{s.gigs}</b><span>live paid UGC gigs</span></div>
          <div><b>{s.creators}</b><span>creators on Newcollab</span></div>
        </Stats>

        <Section id="features">
          <Head>
            <Eyebrow>One app, three ways in</Eyebrow>
            <h2>Everything a creator needs to land brand deals</h2>
          </Head>
          <Ways>
            <Way>
              <span className="ic"><Gift size={20} /></span>
              <h3>Get gifted</h3>
              <p>Brands open gift lists for the products they want to send. Apply in one tap with your portfolio. When a brand picks you, the PR package ships to your door.</p>
              <Link href="/directory">Find PR packages <ArrowRight size={15} /></Link>
            </Way>
            <Way>
              <span className="ic"><BadgeDollarSign size={20} /></span>
              <h3>Get paid</h3>
              <p>Apply to paid UGC gigs from brands, or earn per view with Promote Newcollab. Your first paid video can come before your first big following.</p>
              <a href="#paid-ugc">See paid UGC <ArrowRight size={15} /></a>
            </Way>
            <Way>
              <span className="ic"><Eye size={20} /></span>
              <h3>Get seen</h3>
              <p>Publish a free portfolio brands can open from your bio, and let Polly put it in front of matched brands with pitches that sound like you.</p>
              <Link href="/media-kit">Make your free portfolio <ArrowRight size={15} /></Link>
            </Way>
          </Ways>
        </Section>

        <Dark id="paid-ugc">
          <div className="copy">
            <Eyebrow className="light">Paid UGC</Eyebrow>
            <h2>Post videos. <em>Get paid</em> for the views.</h2>
            <ul>
              <li>
                <Store size={18} />
                <div><b>Paid gigs from brands</b><span>{s.gigs} live gigs right now. Brands post the brief and the budget, you apply with your portfolio.</span></div>
              </li>
              <li>
                <BrandMark size={18} radius={5} />
                <div><b>Promote Newcollab</b><span>$2.50 per 1,000 views on TikTok or Reels about Newcollab, from 2,000 views and up to $40 a video. Paid by PayPal or Wise.</span></div>
              </li>
            </ul>
            <Primary href={SIGNUP} className="light">Start earning <ArrowRight size={18} /></Primary>
          </div>
          <EarningsSlider cpmCents={250} capCents={4000} minViews={2000} />
        </Dark>
        <Wall>
          <VideoWall />
          <small>Real videos by creators on Newcollab. Tap one to watch it on TikTok.</small>
        </Wall>

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

        <Section id="polly">
          <Split>
            <div className="copy">
              <Eyebrow>Meet Polly</Eyebrow>
              <h2>Your AI agent for brand deals</h2>
              <p>Polly does the boring part of outreach so you can make content.</p>
              <Ticks>
                <li><Search size={17} /> Finds brands that fit your niche and are open to creators</li>
                <li><Sparkles size={17} /> Shows the hooks and formats working for a brand on TikTok</li>
                <li><Mail size={17} /> Writes your pitch, and on Pro sends 3 a weekday from your Gmail with follow-ups</li>
              </Ticks>
            </div>
            <Chat aria-hidden="true">
              <div className="bar"><span className="av"><Bot size={15} /></span> Polly</div>
              <p className="me">Find skincare brands that gift small creators</p>
              <p className="bot">Found 12 that fit you. 4 have open gift lists, so start there. Want me to write the pitches?</p>
              <p className="me">Yes, keep it short</p>
              <p className="bot typing"><span /><span /><span /></p>
            </Chat>
          </Split>
        </Section>

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
              <h2>A UGC portfolio brands actually open</h2>
              <p>Put your best videos, niches and rates on one link. Use it in your bio, your pitches and every gift list you apply to. No Canva, no account to start.</p>
              <Primary href="/media-kit"><LayoutTemplate size={18} /> Build my portfolio free</Primary>
            </div>
          </Split>
        </Section>

        <Section id="how-it-works">
          <Head>
            <Eyebrow>How it works</Eyebrow>
            <h2>From sign-up to your first collab</h2>
          </Head>
          <Steps>
            <li><span>1</span><b>Make your profile</b><p>Add your socials and niches. Your portfolio is built from it in minutes.</p></li>
            <li><span>2</span><b>Apply or let Polly pitch</b><p>Join gift lists and paid gigs in one tap, or let Polly reach out to brands for you.</p></li>
            <li><span>3</span><b>Post and get rewarded</b><p>Get your PR package or payment, post your content and build the portfolio for the next deal.</p></li>
          </Steps>
        </Section>

        <Section id="pricing">
          <Head>
            <Eyebrow>Pricing</Eyebrow>
            <h2>Free to start. Pro when you want Polly on autopilot.</h2>
          </Head>
          <Plans>
            <Plan>
              <h3>Free</h3>
              <div className="price">$0<span> forever</span></div>
              <ul>
                <li><Check size={16} /> Brand directory and gift lists</li>
                <li><Check size={16} /> Paid UGC gigs and Promote Newcollab</li>
                <li><Check size={16} /> Free portfolio and media kit</li>
                <li><Check size={16} /> 3 brand applications a month</li>
                <li><Check size={16} /> Polly writes your pitches</li>
              </ul>
              <Ghost href={SIGNUP}>Start free</Ghost>
            </Plan>
            <Plan className="pro">
              <h3>Pro <span className="tag">For busy creators</span></h3>
              <div className="price">$19<span> / month</span></div>
              <ul>
                <li><Check size={16} /> Everything in Free</li>
                <li><Check size={16} /> Unlimited brand and gift list applications</li>
                <li><Check size={16} /> Polly pitches 3 matched brands every weekday from your Gmail</li>
                <li><Check size={16} /> Automatic follow-ups and reply drafts</li>
                <li><Check size={16} /> Full For You feed and priority brand alerts</li>
              </ul>
              <Primary href={`${SIGNUP}?plan=pro`} className="light">Put Polly to work <ArrowRight size={18} /></Primary>
              <small>Cancel anytime</small>
            </Plan>
          </Plans>
        </Section>

        <Section id="faq">
          <Head>
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

        <ForBrands>
          <div>
            <b>Are you a brand?</b>
            <span>Open a gift list and get UGC from {s.creators} creators.</span>
          </div>
          <Link href="/brands/pr-packages">Newcollab for brands <ArrowRight size={15} /></Link>
        </ForBrands>

        <Final>
          <img src="/apple-touch-icon.png" alt="" className="wm" aria-hidden="true" />
          <h2>Your next PR package is one tap away.</h2>
          <p>Join {s.creators} creators getting gifted, paid and seen.</p>
          <Primary href={SIGNUP} className="light">Start free <ArrowRight size={18} /></Primary>
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
  h2 em { font-style: normal; color: ${t.accent}; }
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
const Section = styled.section`scroll-margin-top: 100px; display: grid; gap: 24px; min-width: 0;`;
const Head = styled.div`
  display: grid; gap: 10px; max-width: 720px;
  &.row { max-width: none; display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
  .all { display: inline-flex; align-items: center; gap: 6px; color: ${t.ink}; font-weight: 700; text-decoration: none; }
  .all:hover { color: ${t.accent}; }
`;
const Eyebrow = styled.div`
  font-size: 12.5px; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase; color: ${t.accent};
  &.light { color: ${t.mint}; }
`;
const Ways = styled.div`
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px;
  @media (max-width: 860px) { grid-template-columns: 1fr; }
`;
const Way = styled.article`
  background: ${t.white}; border: 1px solid ${t.line}; border-radius: 22px; padding: 24px; display: grid; gap: 10px;
  align-content: start;
  .ic { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; background: ${t.accentSoft}; color: ${t.accentDeep}; }
  h3 { margin: 6px 0 0; font-size: 21px; letter-spacing: -0.01em; }
  p { margin: 0; color: ${t.muted}; font-size: 15px; line-height: 1.55; }
  a { display: inline-flex; align-items: center; gap: 6px; margin-top: 4px; color: ${t.ink}; font-weight: 700; text-decoration: none; }
  a:hover { color: ${t.accent}; }
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
  li b { font-size: 16px; }
  li span { color: rgba(255, 255, 255, 0.7); font-size: 14.5px; line-height: 1.5; }
  @media (max-width: 860px) { grid-template-columns: 1fr; padding: 26px 18px; border-radius: 22px; }
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
const Ticks = styled.ul`
  list-style: none; margin: 4px 0 0; padding: 0; display: grid; gap: 12px;
  li { display: flex; gap: 10px; align-items: flex-start; font-size: 15.5px; line-height: 1.45; }
  svg { flex-shrink: 0; margin-top: 2px; color: ${t.accent}; }
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
const Steps = styled.ol`
  list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px;
  li { background: ${t.paper}; border-radius: 22px; padding: 22px; display: grid; gap: 8px; align-content: start; }
  li span { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: ${t.ink}; color: #fff; font-weight: 800; }
  li b { font-size: 17px; margin-top: 4px; }
  li p { margin: 0; color: ${t.muted}; font-size: 15px; line-height: 1.5; }
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`;
const Plans = styled.div`
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; max-width: 860px;
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`;
const Plan = styled.article`
  background: ${t.white}; border: 1px solid ${t.line}; border-radius: 24px; padding: 26px; display: grid; gap: 14px;
  align-content: start;
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
  display: grid; gap: 10px; max-width: 860px;
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
const ForBrands = styled.section`
  display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap;
  padding: 20px 24px; border-radius: 20px; background: ${t.paper}; border: 1px solid ${t.line};
  div { display: grid; gap: 2px; }
  b { font-size: 17px; }
  span { color: ${t.muted}; font-size: 14.5px; }
  a { display: inline-flex; align-items: center; gap: 6px; color: ${t.ink}; font-weight: 700; text-decoration: none; }
  a:hover { color: ${t.accent}; }
`;
const Final = styled.section`
  position: relative; overflow: hidden; text-align: center; display: grid; gap: 14px; justify-items: center;
  background: ${t.accent}; color: #fff; border-radius: 28px; padding: 56px 24px;
  .wm { position: absolute; right: -40px; bottom: -40px; width: 200px; opacity: 0.14; transform: rotate(-12deg); border-radius: 40px; pointer-events: none; }
  > *:not(.wm) { position: relative; }
  p { margin: 0; color: rgba(255, 255, 255, 0.82); font-size: 17px; }
  a { justify-self: center; }
  @media (max-width: 768px) { padding: 40px 18px; border-radius: 22px; }
`;
