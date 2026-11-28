import React, { useContext, useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { message } from 'antd';
import api from '../config/api';
import { UserContext } from '../contexts/UserContext';
import UpgradeModal from './UpgradeModal';
import TikTokVideo from '../components/TikTokVideo';
import { MAX_DAILY_PITCHES, PRO_PRICE } from '../config/proOffer';
import { BRAND_ICON } from './PromoteVisuals';

// Verification status page (Nov 2026: verification is separate from activation). Creators being verified already
// use the app (their brands, pitches, plan); only sending waits. This page says where the check stands and what it
// looks for. No promised turnaround: approvals go by profile quality, not a queue.

// Real UGC from creators, self-hosted (tiktok_media), tagged with what each one does well.
export const GOOD_UGC = [
  { id: '7697236927891705110', handle: 'ugcbyanna.uk', tag: 'Product in hand' },
  { id: '7683928810101771542', handle: 'simpleexplorerugc', tag: 'Face on camera' },
  { id: '7702541231523384598', handle: 'alicia_ugc', tag: 'Hook in 3 seconds' },
  { id: '7705535872690621718', handle: 'sarah_ugc223', tag: 'Natural light' },
  { id: '7702427286099856662', handle: 'ugcbysahara', tag: 'Shows the result' },
  { id: '7683925529241701654', handle: 'simpleexplorerugc', tag: 'Close-up texture' },
  { id: '7694309119670357270', handle: 'ketgalvagni', tag: 'No filter' },
  { id: '7694185219435285780', handle: 'beautyofjoseon_official', tag: 'Real skin' },
];

// What review checks (services/profile_quality.py: 12+ posts, a post in the last 30 days, visual quality)
// and what brands look for before they send product or pay for a video.
const LOOK_FOR = [
  { icon: '🙋‍♀️', bg: '#ffe8ef', title: 'Your face on camera',
    text: 'Brands pay for real people. Show up in the first 3 seconds and talk to the camera.',
    avoid: 'Faceless or AI-only videos' },
  { icon: '☀️', bg: '#fff4d6', title: 'Natural, even light',
    text: 'Film facing a window or in daylight so skin tones and products look true.',
    avoid: 'Dark rooms, harsh shadows' },
  { icon: '📱', bg: '#e3f7f4', title: 'Sharp, vertical video',
    text: 'Vertical 9:16, in focus and steady. Clean your lens, prop your phone.',
    avoid: 'Blurry, shaky or low-res clips' },
  { icon: '🎙️', bg: '#ede9fe', title: 'Your real voice',
    text: 'Speak in your own words, like you’re telling a friend. Clear audio, no loud music over you.',
    avoid: 'Robotic AI voiceovers' },
  { icon: '🎨', bg: '#e0f2fe', title: 'True colours',
    text: 'Brands need to see the real product colour and texture.',
    avoid: 'Beauty filters, heavy edits' },
  { icon: '🗓️', bg: '#dcfce7', title: 'An active profile',
    text: 'At least 12 posts and one in the last 30 days, so brands can see you’re creating now.',
    avoid: 'A page with no recent posts' },
];

const PRO_POINTS = [
  ['Start sending today', ', no review wait'],
  [`Up to ${MAX_DAILY_PITCHES} brand pitches daily`, ' from your Gmail'],
  ['Automatic follow-ups', ' and who opened your portfolio'],
  ['Paid UGC briefs', ' and unlimited gifting applications'],
];

function appliedLabel(iso) {
  if (!iso) return 'Received';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Received';
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? `Today, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function Clip({ item, who = false, className }) {
  return (
    <Tile className={className} href={`https://www.tiktok.com/@${item.handle}/video/${item.id}`} target="_blank"
      rel="noopener noreferrer" aria-label={`${item.tag}: example video by @${item.handle}`}>
      <TikTokVideo id={item.id} handle={item.handle} />
      {who ? <Who>@{item.handle}</Who> : <PlayDot aria-hidden="true">▶</PlayDot>}
      <Chip>{item.tag}</Chip>
    </Tile>
  );
}

function Examples() {
  return (
    <Dark>
      <h3>What good UGC looks like</h3>
      <p>Real creators doing exactly this. Tap one to watch.</p>
      <Strip>
        {GOOD_UGC.map((item) => <Clip key={item.id} item={item} who />)}
      </Strip>
    </Dark>
  );
}

export default function Waitlist() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [gig, setGig] = useState(null);
  const tracked = useRef(false);
  const { handleLogout } = useContext(UserContext);
  const welcome = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('welcome') === '1';

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await api.get('/api/user/approval-status');
        setStatus(data);
        // Waitlist emails link here with ?skip=1: open the skip-the-line checkout straight away.
        if (data.can_skip_with_pro && new URLSearchParams(window.location.search).get('skip') === '1') {
          setShowUpgrade(true);
        }
        if (!tracked.current) {
          tracked.current = true;
          api.post('/api/user/track-waitlist-view').catch((err) => console.error('Failed to track waitlist view:', err));
        }
        if (data.status === 'approved' || data.status === 'pro_approved') {
          window.location.href = '/creator/dashboard/for-you?approved=true';
        }
      } catch (err) {
        console.error('Failed to fetch approval status:', err);
        message.error('Failed to load your application status');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // A real live paid brief for the hero card (desktop only). Hidden if none.
    api.get('/api/public/showcase')
      .then(({ data }) => setGig((data?.gigs || []).find((g) => g.pay) || null))
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <Page><Center><Spinner /><Muted>Loading your application…</Muted></Center></Page>
    );
  }
  if (!status) {
    return (
      <Page><Center><Muted>We couldn’t load your application. Please refresh the page.</Muted></Center></Page>
    );
  }

  const rejected = status.status === 'rejected';
  const name = status.first_name || '';
  const openCheckout = () => setShowUpgrade(true);

  return (
    <Page>
      <Wrap>
        <Header>
          <Logo><img src={BRAND_ICON} alt="" width={30} height={30} />newcollab</Logo>
          <HeadLinks>
            <BackLink href="/creator/dashboard/for-you">← My brands</BackLink>
            <Ghost type="button" onClick={handleLogout}>Sign out</Ghost>
          </HeadLinks>
        </Header>

        <Hero>
          <div>
            {rejected ? (
              <Received $warn><b>!</b> Not ready yet</Received>
            ) : (
              <Received><b>✓</b> {welcome ? 'Application received' : `Applied ${appliedLabel(status.applied_at).replace(/^Today, .*/, 'today')}`}</Received>
            )}
            <H1>
              {rejected
                ? <>Your profile isn’t ready for outreach yet{name ? <>, <span>{name}</span></> : ''}</>
                : <>We’re verifying your profile{name ? <>, <span>{name}</span></> : ''}</>}
            </H1>
            <Lede>
              {rejected ? (
                status.rejection_reason
                  || 'Brands look for the things below before they reply. Keep exploring your brands and pitches, update your profile, or skip the review with Pro.'
              ) : (
                <>Your matched brands and your first pitch are already waiting in your dashboard.{' '}
                  <strong>Sending unlocks once your profile is verified</strong>, so brands only hear from creators
                  who are ready. We’ll email you the moment it’s done.</>
              )}
            </Lede>
            <Explore href="/creator/dashboard/for-you">Explore my brands</Explore>

            {!rejected && (
              <Status>
                <StatusTop><span>Your application</span><Pill>In review</Pill></StatusTop>
                <Steps>
                  <Step $state="done"><Bar><i /></Bar><b>Applied</b><small>{appliedLabel(status.applied_at)}</small></Step>
                  <Step $state="now"><Bar><i /></Bar><b>Profile check</b><small>In progress</small></Step>
                  <Step><Bar><i /></Bar><b>Sending unlocks</b><small>Your pitches go out</small></Step>
                </Steps>
                <Eta>
                  <span aria-hidden="true">✉️</span>
                  <span>
                    We’ll email {status.email_masked ? <strong>{status.email_masked}</strong> : 'you'} as soon as
                    there’s a decision. No need to keep this page open.
                  </span>
                </Eta>
              </Status>
            )}

            {status.post_nudge && (
              <Polly>
                <Avatar aria-hidden="true">P</Avatar>
                <div>
                  <strong>Tip from Polly:</strong>{' '}
                  {status.post_nudge.latest_post_days_ago
                    ? `your last post was ${status.post_nudge.latest_post_days_ago} days ago. `
                    : 'I couldn’t spot a recent post on your profile. '}
                  Brands check your page before they send product, so <strong>post this week</strong> to move
                  your review along.
                </div>
              </Polly>
            )}
          </div>

          <Collage aria-label="Examples of good UGC">
            <Col className="c1"><Clip item={GOOD_UGC[0]} /><Clip item={GOOD_UGC[3]} /></Col>
            <Col className="c2"><Clip item={GOOD_UGC[2]} /><Clip item={GOOD_UGC[4]} /></Col>
            <Col className="c3"><Clip item={GOOD_UGC[1]} /><Clip item={GOOD_UGC[6]} /></Col>
            <ReviewFloat aria-hidden="true">
              <i>🔍</i><div><b>Profile review</b><small>Checking posts &amp; video quality</small></div>
            </ReviewFloat>
            {gig && (
              <GigFloat>
                <GigBrand>{gig.brand}</GigBrand><GigOpen>Open now</GigOpen>
                <GigPay>{gig.pay}</GigPay>
                <GigWhat>{gig.title}</GigWhat>
                <GigFoot>A live brief on Newcollab{gig.regions?.length ? ` · ${gig.regions.join(', ')}` : ''}</GigFoot>
              </GigFloat>
            )}
          </Collage>
        </Hero>

        {status.can_skip_with_pro !== false && (
          <Section id="skip" style={{ paddingTop: 8 }}>
            <Pro>
              <div>
                <ProBadge>⚡ SKIP THE REVIEW</ProBadge>
                <ProTitle>Start pitching brands today</ProTitle>
                <ProSub>
                  Pro skips the review: Polly starts today and sends up to {MAX_DAILY_PITCHES} brand pitches daily to brands
                  that fit you, each one written for that brand, from your Gmail, with follow-ups.
                </ProSub>
                <ProList>
                  {PRO_POINTS.map(([b, rest]) => <li key={b}><span><strong>{b}</strong>{rest}</span></li>)}
                </ProList>
              </div>
              <ProSide>
                <Price>{PRO_PRICE}<small>/month</small></Price>
                <PriceLine>About 30¢ a pitch. Cancel or pause anytime.</PriceLine>
                <Cta type="button" onClick={openCheckout}>Skip the line &amp; start today</Cta>
                <CtaNote>Secure checkout with Stripe</CtaNote>
              </ProSide>
            </Pro>
          </Section>
        )}

        {/* Mobile: the examples come right after the Pro card; desktop keeps them under the checklist. */}
        <MobileOnly><Examples /></MobileOnly>

        <Section>
          <Kicker>What brands look for</Kicker>
          <H2>Content brands say yes to</H2>
          <Sub>This is what we check during review, and what brands look at before they send product or pay for a video.</Sub>
          <Grid>
            {LOOK_FOR.map((card) => (
              <Card key={card.title}>
                <Ic style={{ background: card.bg }} aria-hidden="true">{card.icon}</Ic>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <Avoid>{card.avoid}</Avoid>
              </Card>
            ))}
          </Grid>

          <DesktopOnly><Examples /></DesktopOnly>
        </Section>

        <Footer>
          Just subscribed?{' '}
          <LinkBtn type="button" onClick={() => window.location.reload()}>Refresh this page</LinkBtn>
          {' · '}
          <LinkBtn type="button" onClick={handleLogout}>Sign out</LinkBtn>
        </Footer>
      </Wrap>

      {status.can_skip_with_pro !== false && (
        <Sticky><Cta type="button" onClick={openCheckout}>⚡ Skip the line · {PRO_PRICE}/mo</Cta></Sticky>
      )}

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} feature="waitlist_skip" />
    </Page>
  );
}

// ---------------------------------------------------------------------------------------------------------------
const c = {
  ink: '#12141a', ink2: '#3a3f4b', muted: '#6b7280', line: '#ece8e1', paper: '#faf7f2',
  brand: '#72e1d7', pink: '#ff3d8b', coral: '#ff5a5f', amber: '#f59e0b', green: '#16a34a',
};
const mobile = '@media (max-width: 760px)';

const Page = styled.div`
  min-height: 100vh;
  color: ${c.ink};
  font-family: Inter, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background:
    radial-gradient(1200px 600px at 85% -10%, #ffe7ef 0%, rgba(255, 231, 239, 0) 60%),
    radial-gradient(900px 500px at -10% 10%, #e3f7f4 0%, rgba(227, 247, 244, 0) 55%),
    ${c.paper};
  * { box-sizing: border-box; }
`;
const Wrap = styled.div`
  max-width: 1160px; margin: 0 auto; padding: 0 24px;
  ${mobile} { padding: 0 16px; }
`;
const spin = keyframes`to { transform: rotate(360deg); }`;
const Center = styled.div`min-height: 100vh; display: grid; place-items: center; align-content: center; gap: 14px;`;
const Spinner = styled.div`
  width: 34px; height: 34px; border-radius: 50%; border: 3px solid ${c.line}; border-top-color: ${c.pink};
  animation: ${spin} 0.8s linear infinite;
`;
const Muted = styled.div`color: ${c.muted}; font-size: 15px;`;

const Header = styled.header`
  display: flex; align-items: center; justify-content: space-between; padding: 20px 0;
  ${mobile} { padding: 14px 0; }
`;
const Logo = styled.div`
  display: flex; align-items: center; gap: 10px; font-weight: 800; letter-spacing: -0.02em; font-size: 18px;
  img { border-radius: 8px; }
`;
const HeadLinks = styled.div`display: flex; align-items: center; gap: 18px;`;
const BackLink = styled.a`
  font-size: 14px; font-weight: 700; color: ${c.ink}; text-decoration: none;
  &:hover { text-decoration: underline; }
`;
const Explore = styled.a`
  display: inline-flex; align-items: center; justify-content: center; margin: 0 0 22px; padding: 13px 20px;
  border-radius: 14px; background: ${c.ink}; color: #fff; font-weight: 800; font-size: 15.5px; text-decoration: none;
  &:hover { opacity: 0.9; }
`;
const Ghost = styled.button`
  background: none; border: 0; cursor: pointer; font-size: 14px; color: ${c.muted}; padding: 6px 0;
  &:hover { color: ${c.ink}; }
`;

const Hero = styled.div`
  display: grid; grid-template-columns: 1.05fr 1fr; gap: 48px; align-items: center; padding: 24px 0 48px;
  ${mobile} { grid-template-columns: 1fr; gap: 22px; padding: 6px 0 20px; }
`;
const Received = styled.span`
  display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px solid ${c.line};
  border-radius: 999px; padding: 6px 12px 6px 6px; font-size: 13px; font-weight: 600; color: ${c.ink2};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  b {
    width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-size: 13px; color: #fff;
    background: ${(p) => (p.$warn ? c.amber : c.green)};
  }
`;
const H1 = styled.h1`
  font-size: 46px; line-height: 1.05; letter-spacing: -0.035em; margin: 18px 0 14px; font-weight: 800;
  span { background: linear-gradient(90deg, ${c.pink}, ${c.coral}); -webkit-background-clip: text; background-clip: text; color: transparent; }
  ${mobile} { font-size: 32px; margin: 14px 0 10px; }
`;
const Lede = styled.p`
  font-size: 18px; line-height: 1.5; color: ${c.ink2}; margin: 0 0 24px; max-width: 520px;
  strong { color: ${c.ink}; }
  ${mobile} { font-size: 16px; margin-bottom: 18px; }
`;
const Status = styled.div`
  background: #fff; border: 1px solid ${c.line}; border-radius: 20px; padding: 18px 20px; max-width: 520px;
  box-shadow: 0 10px 30px -18px rgba(18, 20, 26, 0.25);
`;
const StatusTop = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;
  > span { font-weight: 700; font-size: 15px; }
`;
const pulse = keyframes`50% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }`;
const Pill = styled.span`
  display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #b45309;
  background: #fff7e6; border: 1px solid #fde7b0; padding: 4px 10px; border-radius: 999px;
  &::before {
    content: ''; width: 7px; height: 7px; border-radius: 50%; background: ${c.amber};
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.25); animation: ${pulse} 1.6s ease-in-out infinite;
  }
`;
const Steps = styled.div`display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;`;
const Bar = styled.div`
  height: 6px; border-radius: 99px; background: #eee9e2; overflow: hidden; margin-bottom: 10px;
  i { display: block; height: 100%; border-radius: 99px; }
`;
const Step = styled.div`
  ${Bar} i {
    width: ${(p) => (p.$state === 'done' ? '100%' : p.$state === 'now' ? '55%' : '0')};
    background: ${(p) => (p.$state === 'done' ? c.green : `linear-gradient(90deg, ${c.amber}, #fbbf24)`)};
  }
  b { display: block; font-size: 13px; }
  small { display: block; font-size: 12px; color: ${c.muted}; margin-top: 2px; }
  ${mobile} { small { display: none; } }
`;
const Eta = styled.div`
  margin-top: 14px; padding-top: 14px; border-top: 1px dashed ${c.line}; font-size: 13px; color: ${c.ink2};
  display: flex; gap: 8px; align-items: flex-start; line-height: 1.45;
`;
const Polly = styled.div`
  display: flex; gap: 12px; align-items: flex-start; margin-top: 14px; max-width: 520px; background: #fff4f7;
  border: 1px solid #ffd3e1; border-radius: 16px; padding: 14px 16px; font-size: 14px; line-height: 1.45; color: ${c.ink2};
  strong { color: ${c.ink}; }
`;
const Avatar = styled.div`
  width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #ff8fb5, ${c.coral});
  flex: none; display: grid; place-items: center; color: #fff; font-weight: 800;
`;

const Tile = styled.a`
  position: relative; display: block; border-radius: 18px; overflow: hidden; aspect-ratio: 9 / 16;
  background: linear-gradient(160deg, #e9e4dc, #d9d3ca); color: #fff; text-decoration: none;
  box-shadow: 0 18px 40px -22px rgba(18, 20, 26, 0.45);
`;
const PlayDot = styled.span`
  position: absolute; top: 10px; left: 10px; width: 26px; height: 26px; border-radius: 50%; z-index: 2;
  background: rgba(0, 0, 0, 0.45); color: #fff; font-size: 10px; display: grid; place-items: center;
`;
const Who = styled.span`
  position: absolute; left: 10px; top: 10px; font-size: 11px; font-weight: 600; z-index: 2;
  background: rgba(0, 0, 0, 0.45); padding: 3px 8px; border-radius: 999px;
`;
const Chip = styled.span`
  position: absolute; left: 10px; bottom: 10px; z-index: 2; background: rgba(255, 255, 255, 0.95); color: ${c.ink};
  font-size: 12px; font-weight: 700; padding: 6px 10px; border-radius: 999px; display: inline-flex; gap: 6px;
  &::before { content: '✓'; color: ${c.green}; font-weight: 900; }
`;
const Collage = styled.div`
  position: relative; height: 690px;
  ${mobile} { display: none; }
`;
const Col = styled.div`
  position: absolute; width: 31%; display: flex; flex-direction: column; gap: 14px;
  &.c1 { left: 0; top: 48px; } &.c2 { left: 34.5%; top: 0; } &.c3 { left: 69%; top: 70px; }
`;
const Float = styled.div`
  position: absolute; z-index: 3; background: #fff; border-radius: 16px; border: 1px solid ${c.line};
  box-shadow: 0 20px 50px -20px rgba(18, 20, 26, 0.35); color: ${c.ink};
`;
const ReviewFloat = styled(Float)`
  right: -12px; top: 8px; padding: 10px 14px; display: flex; gap: 10px; align-items: center;
  i { width: 30px; height: 30px; border-radius: 10px; background: #e6f6f4; display: grid; place-items: center; font-style: normal; }
  b { display: block; font-size: 13px; } small { color: ${c.muted}; font-size: 12px; }
`;
const GigFloat = styled(Float)`left: -34px; bottom: 110px; width: 250px; padding: 14px 16px;`;
const GigBrand = styled.span`
  display: inline-block; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: middle;
  background: #fff1e6; color: #c2410c; font-size: 12px; font-weight: 700; padding: 3px 9px; border-radius: 999px;
`;
const GigOpen = styled.span`
  float: right; font-size: 12px; color: ${c.green}; font-weight: 600;
  &::before { content: '● '; }
`;
const GigPay = styled.div`font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin: 8px 0 2px;`;
const GigWhat = styled.div`font-size: 13px; color: ${c.ink2}; line-height: 1.35;`;
const GigFoot = styled.div`margin-top: 10px; padding-top: 8px; border-top: 1px solid ${c.line}; font-size: 11px; color: ${c.muted};`;

const Section = styled.section`
  padding: 44px 0;
  ${mobile} { padding: 26px 0; }
`;
const Kicker = styled.div`font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: ${c.pink};`;
const H2 = styled.h2`
  font-size: 34px; letter-spacing: -0.03em; margin: 8px 0; line-height: 1.1;
  ${mobile} { font-size: 26px; }
`;
const Sub = styled.p`color: ${c.ink2}; font-size: 16px; margin: 0 0 26px; max-width: 640px; line-height: 1.5;`;
const Grid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
  ${mobile} { grid-template-columns: 1fr 1fr; gap: 10px; }
`;
const Card = styled.div`
  background: #fff; border: 1px solid ${c.line}; border-radius: 18px; padding: 18px;
  h3 { margin: 0 0 6px; font-size: 16px; letter-spacing: -0.01em; }
  p { margin: 0; color: ${c.ink2}; font-size: 14px; line-height: 1.45; }
  ${mobile} {
    padding: 14px; border-radius: 16px;
    h3 { font-size: 14.5px; } p { font-size: 13px; }
  }
`;
const Ic = styled.div`
  width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; font-size: 20px; margin-bottom: 12px;
  ${mobile} { width: 34px; height: 34px; font-size: 17px; margin-bottom: 8px; }
`;
const Avoid = styled.div`
  margin-top: 10px; font-size: 12.5px; color: #b42318; font-weight: 600;
  &::before { content: '✕ '; }
`;
const Dark = styled.div`
  background: #111317; border-radius: 28px; padding: 30px; color: #fff; margin-top: 22px;
  h3 { margin: 0 0 4px; font-size: 22px; letter-spacing: -0.02em; }
  p { margin: 0 0 18px; color: #b6bac4; font-size: 14px; }
  ${mobile} { padding: 20px 16px; border-radius: 22px; }
`;
const DesktopOnly = styled.div`
  ${mobile} { display: none; }
`;
const MobileOnly = styled.div`
  display: none;
  ${mobile} { display: block; margin-bottom: 8px; }
`;
const Strip = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
  ${Tile} { box-shadow: none; background: #23262d; }
  ${Chip} { font-size: 11px; }
  ${mobile} {
    display: flex; overflow-x: auto; margin: 0 -16px; padding: 0 16px; scroll-snap-type: x mandatory;
    ${Tile} { flex: 0 0 44%; scroll-snap-align: start; }
  }
`;

const Pro = styled.div`
  display: grid; grid-template-columns: 1.2fr 1fr; gap: 28px; align-items: center; border-radius: 28px; padding: 34px; color: #fff;
  background:
    radial-gradient(600px 300px at 100% 0%, rgba(255, 90, 95, 0.45), rgba(255, 90, 95, 0) 60%),
    radial-gradient(500px 300px at 0% 100%, rgba(114, 225, 215, 0.35), rgba(114, 225, 215, 0) 60%),
    #15171c;
  ${mobile} { grid-template-columns: 1fr; padding: 22px 18px; gap: 18px; border-radius: 22px; }
`;
const ProBadge = styled.span`
  display: inline-flex; gap: 6px; align-items: center; background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18); padding: 5px 11px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: 0.04em;
`;
const ProTitle = styled(H2)`color: #fff; margin-top: 14px;`;
const ProSub = styled(Sub)`color: #c9ccd4;`;
const ProList = styled.ul`
  list-style: none; padding: 0; margin: 0; display: grid; gap: 10px;
  li { display: flex; gap: 10px; font-size: 15px; color: #e7e9ee; line-height: 1.4; }
  li::before { content: '✓'; color: ${c.brand}; font-weight: 900; }
  strong { color: #fff; }
`;
const ProSide = styled.div`
  background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px; padding: 22px;
`;
const Price = styled.div`
  font-size: 44px; font-weight: 800; letter-spacing: -0.03em;
  small { font-size: 16px; color: #a8adb8; font-weight: 500; }
`;
const PriceLine = styled.div`font-size: 13px; color: #c9ccd4; margin: 4px 0 16px;`;
const Cta = styled.button`
  display: block; width: 100%; text-align: center; border: 0; cursor: pointer; color: #fff; font-weight: 800; font-size: 16px;
  padding: 16px; border-radius: 14px; font-family: inherit;
  background: linear-gradient(90deg, ${c.pink}, ${c.coral}); box-shadow: 0 12px 30px -12px rgba(255, 61, 139, 0.7);
  transition: transform 0.15s ease;
  &:hover { transform: translateY(-1px); }
`;
const CtaNote = styled.div`text-align: center; font-size: 13px; color: #a8adb8; margin-top: 10px;`;

const Footer = styled.footer`
  padding: 26px 0 60px; text-align: center; font-size: 13px; color: ${c.muted};
  ${mobile} { padding-bottom: 104px; }
`;
const LinkBtn = styled.button`
  background: none; border: 0; padding: 0; cursor: pointer; color: ${c.ink2}; text-decoration: underline; font: inherit;
`;
const Sticky = styled.div`
  display: none;
  ${mobile} {
    display: block; position: fixed; left: 0; right: 0; bottom: 0; z-index: 20; padding: 10px 16px 14px;
    background: rgba(250, 247, 242, 0.92); backdrop-filter: blur(8px); border-top: 1px solid ${c.line};
    ${Cta} { padding: 13px; font-size: 15px; }
  }
`;
