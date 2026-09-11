import React from 'react';
import styled from 'styled-components';
import { FaInstagram, FaShare, FaTiktok, FaYoutube } from 'react-icons/fa';
import { categoryEmoji, categoryLabel } from '../constants/brandCategories';
import { kitBrandCta } from '../lib/kitBrandCta';
import { formatKitNumber, normalizePublicKit } from '../lib/publicKit';

const FONT = "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
const INK = '#0F172A';
const MUTED = '#64748B';
const LINE = '#E2E8F0';
const BG = '#F8FAFC';
const SURFACE = '#FFFFFF';
const ACCENT = '#4F46E5';
const ACCENT_HOVER = '#4338CA';
const ACCENT_SOFT = '#EEF2FF';
const GREEN = '#059669';
const GREEN_SOFT = '#ECFDF5';

const PLATFORM_DISPLAY = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' };
const POST_TYPE_LABEL = {
  reel: 'Reel', photo: 'Photo', story: 'Story',
  tiktok: 'Video', youtube: 'Video', short: 'Short',
};

function PlatformIcon({ platform, size = 16 }) {
  if (platform === 'tiktok') return <FaTiktok size={size} color="currentColor" />;
  if (platform === 'youtube') return <FaYoutube size={size} color="#FF0000" />;
  return <FaInstagram size={size} color="#E4405F" />;
}

function PublicKitView({
  kit: rawKit,
  username,
  copied,
  onShare,
  onSocialClick,
  onPortfolioClick,
  onContactClick,
}) {
  const kit = normalizePublicKit(rawKit);
  if (!kit) return null;

  const brandCta = kitBrandCta(username || kit.username);
  const handle = `@${String(username || kit.username || '').replace(/^@/, '')}`;
  const intro = kit.tagline && kit.tagline !== kit.bio ? kit.tagline : (kit.bio || kit.tagline);
  const posts = kit.posts || [];
  const primarySocial = kit.socialProfiles[0];
  const hasRates = !!(kit.ratesReel || kit.ratesTiktok || kit.ratesPhoto);

  const videoPosts = posts.filter((p) => (
    p.post_type === 'reel' || p.platform === 'tiktok' || p.platform === 'youtube'
  ));
  const avgViews = videoPosts.length
    ? Math.round(videoPosts.reduce((sum, p) => sum + (p.views || 0), 0) / videoPosts.length)
    : 0;
  const showEngagement = kit.engagementRate > 0 && kit.engagementRate < 100;

  const facts = [];
  kit.socialProfiles.forEach((profile) => {
    facts.push({
      key: `p-${profile.platform}`,
      eyebrow: PLATFORM_DISPLAY[profile.platform] || profile.platform,
      value: formatKitNumber(profile.followers) || profile.handle || PLATFORM_DISPLAY[profile.platform],
      sub: profile.followers && profile.handle ? profile.handle : 'Followers',
      href: profile.url,
      platform: profile.platform,
      tone: 'accent',
    });
  });
  if (!kit.socialProfiles.length && kit.followerCount) {
    facts.push({ key: 'followers', eyebrow: 'Reach', value: formatKitNumber(kit.followerCount), sub: 'Followers', tone: 'accent' });
  }
  if (kit.primaryAgeRange) {
    facts.push({ key: 'age', eyebrow: 'Audience', value: kit.primaryAgeRange.replace('-', '–'), sub: 'Primary age' });
  }
  if (kit.regions.length) {
    facts.push({ key: 'geo', eyebrow: 'Market', value: kit.regions.slice(0, 2).join(', '), sub: kit.regions.length > 2 ? kit.regions.slice(2).join(', ') : 'Audience geo' });
  }
  if (showEngagement) {
    facts.push({ key: 'eng', eyebrow: 'Engagement', value: `${kit.engagementRate.toFixed(1)}%`, sub: 'Reported rate' });
  }
  if (avgViews > 0) {
    facts.push({ key: 'views', eyebrow: 'Typical views', value: formatKitNumber(avgViews), sub: 'Across posted videos' });
  }
  if (kit.gifted) {
    facts.push({ key: 'gifted', eyebrow: 'Collab', value: 'Gifted PR', sub: 'Product + shipping', tone: 'green' });
  }

  return (
    <Page>
      <Wrap>
        <Hero>
          <TopBar>
            <Eyebrow>Creator media kit</Eyebrow>
            <ShareBtn type="button" onClick={onShare}>
              <FaShare size={12} />
              {copied ? 'Copied' : 'Share'}
            </ShareBtn>
          </TopBar>

          <HeroMain>
            <AvatarRing>
              <Avatar>
                {kit.avatarUrl
                  ? <img src={kit.avatarUrl} alt={handle} />
                  : <span>@</span>}
              </Avatar>
            </AvatarRing>
            <div>
              <NameRow>
                <Name>{handle}</Name>
                {kit.isPro ? <ReadyBadge>PR-ready</ReadyBadge> : null}
              </NameRow>
              {intro ? <Bio>{intro}</Bio> : null}
              {kit.niches.length > 0 && (
                <Chips>
                  {kit.niches.slice(0, 6).map((n) => (
                    <Chip key={n}>
                      <span aria-hidden="true">{categoryEmoji(n)}</span>
                      {categoryLabel(n)}
                    </Chip>
                  ))}
                </Chips>
              )}
            </div>
          </HeroMain>
        </Hero>

        {facts.length > 0 && (
          <Section>
            <SectionKicker>Snapshot</SectionKicker>
            <SectionTitle>Fit at a glance</SectionTitle>
            <FactGrid>
              {facts.slice(0, 6).map((fact) => {
                const inner = (
                  <>
                    <FactEyebrow>{fact.eyebrow}</FactEyebrow>
                    <FactValue>{fact.value}</FactValue>
                    <FactSub>{fact.sub}</FactSub>
                  </>
                );
                if (fact.href) {
                  return (
                    <FactCard
                      key={fact.key}
                      $tone={fact.tone}
                      as="a"
                      href={fact.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => fact.platform && onSocialClick && onSocialClick(fact.platform)}
                    >
                      {inner}
                    </FactCard>
                  );
                }
                return <FactCard key={fact.key} $tone={fact.tone}>{inner}</FactCard>;
              })}
            </FactGrid>
          </Section>
        )}

        {kit.socialProfiles.length > 1 && (
          <Section>
            <SectionKicker>Channels</SectionKicker>
            <SectionTitle>Open the profile</SectionTitle>
            <ChannelList>
              {kit.socialProfiles.map((profile) => (
                <ChannelLink
                  key={profile.platform}
                  href={profile.url || undefined}
                  as={profile.url ? 'a' : 'div'}
                  target={profile.url ? '_blank' : undefined}
                  rel={profile.url ? 'noopener noreferrer' : undefined}
                  onClick={() => onSocialClick && onSocialClick(profile.platform)}
                >
                  <ChannelIcon $platform={profile.platform}>
                    <PlatformIcon platform={profile.platform} size={18} />
                  </ChannelIcon>
                  <div>
                    <ChannelName>{PLATFORM_DISPLAY[profile.platform] || profile.platform}</ChannelName>
                    <ChannelMeta>
                      {profile.handle || 'Profile'}
                      {profile.followers ? ` · ${formatKitNumber(profile.followers)} followers` : ''}
                    </ChannelMeta>
                  </div>
                  {profile.url ? <ChannelCta>Open</ChannelCta> : null}
                </ChannelLink>
              ))}
            </ChannelList>
          </Section>
        )}

        <Section>
          <SectionKicker>{kit.postsSource === 'scrape' ? 'Recent work' : 'Content'}</SectionKicker>
            <SectionTitle>{posts.length ? 'Does the look fit?' : 'See the content before you brief'}</SectionTitle>
          {posts.length > 0 ? (
            <PostGrid>
              {posts.slice(0, 9).map((post, i) => (
                <PostCard
                  key={post.id || i}
                  href={post.post_url || undefined}
                  as={post.post_url ? 'a' : 'div'}
                  target={post.post_url ? '_blank' : undefined}
                  rel={post.post_url ? 'noopener noreferrer' : undefined}
                  onClick={() => post.id && onPortfolioClick && onPortfolioClick(post.id)}
                >
                  {post.thumbnail_url
                    ? <img src={post.thumbnail_url} alt={post.brand_name || 'Creator post'} />
                    : (
                      <PostFallback>
                        <PlatformIcon platform={post.platform} size={28} />
                      </PostFallback>
                    )}
                  <PostOverlay>
                    <span>
                      {(PLATFORM_DISPLAY[post.platform] || post.platform || 'Post')}
                      {POST_TYPE_LABEL[post.post_type] ? ` · ${POST_TYPE_LABEL[post.post_type]}` : ''}
                    </span>
                    {post.views > 0 ? <b>{formatKitNumber(post.views)} views</b> : null}
                  </PostOverlay>
                </PostCard>
              ))}
            </PostGrid>
          ) : (
            <EmptyWork>
              <EmptyWorkCopy>
                <strong>No portfolio stills on this kit yet</strong>
                <span>
                  {primarySocial?.url
                    ? `Open ${handle} on ${PLATFORM_DISPLAY[primarySocial.platform] || 'social'} to judge content quality, lighting, and brand fit.`
                    : 'Content examples will show here once this creator adds recent work.'}
                </span>
                {primarySocial?.url ? (
                  <EmptyWorkBtn
                    href={primarySocial.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onSocialClick && onSocialClick(primarySocial.platform)}
                  >
                    Review on {PLATFORM_DISPLAY[primarySocial.platform] || 'social'}
                  </EmptyWorkBtn>
                ) : null}
              </EmptyWorkCopy>
            </EmptyWork>
          )}
        </Section>

        {(kit.brands.length > 0 || kit.gifted || hasRates) && (
          <Section>
            <SectionKicker>Partnership</SectionKicker>
            <SectionTitle>How brands work with {handle}</SectionTitle>
            {kit.brands.length > 0 && (
              <BrandRow>
                {kit.brands.map((b) => <BrandPill key={b}>{b}</BrandPill>)}
              </BrandRow>
            )}
            {kit.gifted && (
              <GiftedNote>
                <b>Open to gifted PR</b>
                First campaign is product + shipping only. Usage and paid terms are agreed on Newcollab after you get in touch.
              </GiftedNote>
            )}
            {hasRates && (
              <RateCard>
                {kit.ratesReel > 0 && <RateRow><span>Instagram Reel</span><b>from ${kit.ratesReel.toLocaleString()}</b></RateRow>}
                {kit.ratesTiktok > 0 && <RateRow><span>TikTok video</span><b>from ${kit.ratesTiktok.toLocaleString()}</b></RateRow>}
                {kit.ratesPhoto > 0 && <RateRow><span>Photo post</span><b>from ${kit.ratesPhoto.toLocaleString()}</b></RateRow>}
              </RateCard>
            )}
          </Section>
        )}

        <CTA>
          <div>
            <CTATitle>Want to work with {handle}?</CTATitle>
            <CTASub>
              Create a free brand account to brief this creator on Newcollab.
              First campaign is product + shipping only.
            </CTASub>
          </div>
          <CTABtn href={brandCta} onClick={onContactClick}>Get in touch</CTABtn>
        </CTA>

        <Footer>
          <span>newcollab.co/kit/{kit.username}</span>
          <span>Media kit by <BrandMark>Newcollab</BrandMark></span>
        </Footer>
      </Wrap>

      <StickyBar>
        <StickyMeta>
          <b>{handle}</b>
          <span>
            {primarySocial
              ? `${PLATFORM_DISPLAY[primarySocial.platform] || primarySocial.platform}${primarySocial.followers ? ` · ${formatKitNumber(primarySocial.followers)}` : ''}`
              : kit.niches[0] || 'Creator'}
          </span>
        </StickyMeta>
        <StickyBtn href={brandCta} onClick={onContactClick}>Get in touch</StickyBtn>
      </StickyBar>
    </Page>
  );
}

export default PublicKitView;

const Page = styled.div`
  min-height: 100vh;
  background: ${BG};
  padding: 32px 16px 56px;
  font-family: ${FONT};
  color: ${INK};
  -webkit-font-smoothing: antialiased;
  @media (max-width: 720px) { padding: 0 0 96px; }
`;

const Wrap = styled.div`
  max-width: 720px;
  margin: 0 auto;
  background: ${SURFACE};
  border: 1px solid ${LINE};
  border-top: 3px solid ${ACCENT};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  @media (max-width: 480px) { border-radius: 0; border-left: 0; border-right: 0; box-shadow: none; }
`;

const Hero = styled.header`
  padding: 20px 24px 8px;
  @media (max-width: 480px) { padding: 16px 16px 4px; }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Eyebrow = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${ACCENT};
`;

const ShareBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${SURFACE};
  border: 1px solid ${LINE};
  color: ${INK};
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  padding: 7px 12px;
  border-radius: 8px;
  cursor: pointer;
  &:hover { background: ${BG}; }
`;

const HeroMain = styled.div`
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 16px;
  align-items: start;
  padding-bottom: 20px;
  border-bottom: 1px solid ${LINE};
  @media (max-width: 560px) {
    grid-template-columns: 64px 1fr;
    gap: 14px;
  }
`;

const AvatarRing = styled.div`
  width: 72px;
  height: 72px;
`;

const Avatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  background: ${BG};
  border: 1px solid ${LINE};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 600;
  color: ${MUTED};
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
  @media (max-width: 560px) { width: 64px; height: 64px; }
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Name = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.2;
`;

const Bio = styled.p`
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.55;
  color: #334155;
  max-width: 40rem;
`;

const ReadyBadge = styled.span`
  background: #EEF2FF;
  color: ${ACCENT};
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${ACCENT_SOFT};
  border: 1px solid #C7D2FE;
  color: #3730A3;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 9px;
  border-radius: 999px;
`;

const Section = styled.section`
  padding: 20px 24px;
  border-bottom: 1px solid ${LINE};
  &:last-of-type { border-bottom: 0; }
  @media (max-width: 480px) { padding: 18px 16px; }
`;

const SectionKicker = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${ACCENT};
  margin-bottom: 4px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
`;

const FactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  @media (min-width: 640px) { grid-template-columns: repeat(4, 1fr); }
`;

const FactCard = styled.div`
  display: block;
  text-decoration: none;
  color: inherit;
  border-radius: 10px;
  padding: 12px;
  min-height: 88px;
  border: 1px solid ${(p) => (p.$tone === 'accent' ? '#C7D2FE' : p.$tone === 'green' ? '#A7F3D0' : LINE)};
  background: ${(p) => (p.$tone === 'accent' ? ACCENT_SOFT : p.$tone === 'green' ? GREEN_SOFT : SURFACE)};
  transition: border-color 0.15s ease;
  &[href]:hover {
    border-color: ${ACCENT};
  }
`;

const FactEyebrow = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: ${MUTED};
  margin-bottom: 8px;
`;

const FactValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
`;

const FactSub = styled.div`
  margin-top: 6px;
  font-size: 12px;
  color: ${MUTED};
`;

const ChannelList = styled.div`
  display: grid;
  gap: 8px;
`;

const ChannelLink = styled.a`
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px;
  background: ${SURFACE};
  border: 1px solid ${LINE};
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  &:hover { background: ${BG}; }
`;

const ChannelIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: ${BG};
  border: 1px solid ${LINE};
  color: ${INK};
`;

const ChannelName = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

const ChannelMeta = styled.div`
  font-size: 13px;
  color: ${MUTED};
`;

const ChannelCta = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${ACCENT};
`;

const PostGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  @media (max-width: 520px) { grid-template-columns: repeat(2, 1fr); }
`;

const PostCard = styled.a`
  position: relative;
  display: block;
  aspect-ratio: 4 / 5;
  border-radius: 10px;
  overflow: hidden;
  background: ${BG};
  border: 1px solid ${LINE};
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const PostFallback = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: ${BG};
`;

const PostOverlay = styled.div`
  position: absolute;
  left: 0; right: 0; bottom: 0;
  padding: 24px 10px 10px;
  background: linear-gradient(180deg, transparent, rgba(15, 23, 42, 0.72));
  color: #fff;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  font-weight: 500;
  b { font-weight: 600; }
`;

const EmptyWork = styled.div`
  border-radius: 10px;
  background: ${SURFACE};
  border: 1px solid ${LINE};
`;

const EmptyWorkCopy = styled.div`
  padding: 16px;
  display: grid;
  gap: 6px;
  strong { font-size: 14px; font-weight: 600; }
  span { font-size: 13px; line-height: 1.55; color: ${MUTED}; max-width: 36rem; }
`;

const EmptyWorkBtn = styled.a`
  display: inline-flex;
  width: fit-content;
  margin-top: 8px;
  background: ${ACCENT};
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 8px;
  &:hover { background: ${ACCENT_HOVER}; }
`;

const BrandRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
`;

const BrandPill = styled.span`
  background: ${BG};
  border: 1px solid ${LINE};
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
`;

const GiftedNote = styled.div`
  background: ${SURFACE};
  border: 1px solid ${LINE};
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.55;
  color: #334155;
  b { display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: ${INK}; }
`;

const RateCard = styled.div`
  margin-top: 10px;
  background: ${SURFACE};
  border: 1px solid ${LINE};
  border-radius: 10px;
  overflow: hidden;
`;

const RateRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  font-size: 14px;
  border-bottom: 1px solid ${LINE};
  &:last-child { border-bottom: 0; }
  b { font-weight: 600; }
`;

const CTA = styled.div`
  margin: 20px 24px 12px;
  padding: 16px;
  border-radius: 12px;
  background: ${ACCENT_SOFT};
  border: 1px solid #C7D2FE;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  @media (max-width: 640px) {
    margin: 16px;
    flex-direction: column;
    align-items: stretch;
  }
`;

const CTATitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
`;

const CTASub = styled.div`
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.5;
  color: ${MUTED};
  max-width: 28rem;
`;

const CTABtn = styled.a`
  display: inline-flex;
  justify-content: center;
  background: ${ACCENT};
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  text-decoration: none;
  padding: 9px 14px;
  border-radius: 8px;
  white-space: nowrap;
  &:hover { background: ${ACCENT_HOVER}; }
`;

const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 0 24px 20px;
  font-size: 12px;
  color: ${MUTED};
  @media (max-width: 480px) { padding: 0 16px 20px; }
`;

const BrandMark = styled.b`
  color: ${ACCENT};
  font-weight: 600;
`;

const StickyBar = styled.div`
  display: none;
  @media (max-width: 720px) {
    display: flex;
    position: fixed;
    left: 50%;
    bottom: 16px;
    transform: translateX(-50%);
    width: calc(100% - 24px);
    max-width: 720px;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    background: ${INK};
    color: #fff;
    border-radius: 12px;
    padding: 10px 10px 10px 14px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
    z-index: 20;
  }
`;

const StickyMeta = styled.div`
  min-width: 0;
  b { display: block; font-size: 13px; font-weight: 600; }
  span { font-size: 12px; color: #94A3B8; }
`;

const StickyBtn = styled.a`
  flex-shrink: 0;
  background: ${ACCENT};
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 8px;
`;

