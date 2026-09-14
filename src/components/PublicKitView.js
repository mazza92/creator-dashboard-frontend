import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { FaInstagram, FaShare, FaYoutube } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';
import { categoryEmoji, categoryLabel } from '../constants/brandCategories';
import { kitBrandCta } from '../lib/kitBrandCta';
import { formatKitNumber, normalizePublicKit } from '../lib/publicKit';
import { COVER_SAMPLES, EXAMPLE_SLOTS, resolveThemeTokens, servicesForNiche, useKitFonts } from '../kit-builder/themes';
import { normalizeKitLayout } from '../kit-builder/templates';
import KitPostEmbed, { parseSocialUrl } from '../kit-builder/KitPostEmbed';

const SOCIAL_META = {
  instagram: { Icon: FaInstagram, label: 'Instagram', color: '#E4405F' },
  tiktok: { Icon: FaTiktok, label: 'TikTok', color: '#111827' },
  youtube: { Icon: FaYoutube, label: 'YouTube', color: '#FF0000' },
};

function socialMeta(platform) {
  return SOCIAL_META[platform] || SOCIAL_META.instagram;
}

function mediaKey(url) {
  const parsed = parseSocialUrl(url);
  if (!parsed) return '';
  if (parsed.platform === 'tiktok' && parsed.id) return `tiktok:${parsed.id}`;
  const href = String(parsed.href || '');
  if (parsed.platform === 'instagram') {
    const code = (href.match(/\/(?:p|reel|reels|tv)\/([^/?]+)/i) || [])[1];
    if (code) return `instagram:${code.toLowerCase()}`;
  }
  if (parsed.platform === 'youtube') {
    try {
      const parsedUrl = new URL(href);
      const id = parsedUrl.searchParams.get('v')
        || (parsedUrl.pathname.match(/\/(?:embed|shorts|live)\/([^/]+)/) || [])[1];
      if (id) return `youtube:${id}`;
    } catch {
      /* use href fallback */
    }
  }
  return href.replace(/\/+$/, '').replace(/^https?:\/\/(www\.)?/i, '').toLowerCase();
}

function exampleWorkItems(theme = {}, posts = []) {
  const byKey = new Map();
  const push = (item) => {
    const raw = typeof item === 'string' ? { url: item } : (item || {});
    const parsed = parseSocialUrl(raw.url || raw.post_url);
    if (!parsed) return;
    const key = mediaKey(parsed.href);
    if (!key) return;
    const title = String(raw.title || '').trim();
    const description = String(raw.description || raw.body || '').trim();
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { url: parsed.href, title, description });
      return;
    }
    if (!existing.title && title) existing.title = title;
    if (!existing.description && description) existing.description = description;
  };
  (Array.isArray(theme.example_posts) ? theme.example_posts : []).forEach(push);
  (Array.isArray(theme.examples) ? theme.examples : []).forEach(push);
  if (!byKey.size) {
    posts.forEach((post) => push(post?.post_url));
  }
  return Array.from(byKey.values()).slice(0, EXAMPLE_SLOTS);
}

function SocialMeta({ profiles = [], location, className }) {
  const filled = (profiles || []).filter((p) => p.url || p.handle);
  if (!filled.length && !location) return null;
  return (
    <CoverMeta className={className}>
      <SocialList>
        {filled.map((profile) => {
          const { Icon, label: platformLabel } = socialMeta(profile.platform);
          const label = profile.handle || platformLabel;
          const count = profile.followers ? formatKitNumber(profile.followers) : '';
          const inner = (
            <>
              <Icon size={14} aria-hidden="true" />
              <span>{label}{count ? ` · ${count}` : ''}</span>
            </>
          );
          return profile.url ? (
            <CoverSocial
              key={`${profile.platform}-${label}`}
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${platformLabel}${count ? ` ${count}` : ''}`}
            >
              {inner}
            </CoverSocial>
          ) : (
            <CoverSocial as="span" key={`${profile.platform}-${label}`}>{inner}</CoverSocial>
          );
        })}
      </SocialList>
      {location ? <span>{filled.length ? ' · ' : ''}{location}</span> : null}
    </CoverMeta>
  );
}

function FollowerChip({ profile }) {
  const { Icon, label, color } = socialMeta(profile.platform);
  const count = formatKitNumber(profile.followers);
  if (!count) return null;
  const inner = (
    <>
      <Icon size={14} color={color} aria-hidden="true" />
      <span>{count}</span>
    </>
  );
  return profile.url ? (
    <Chip
      as="a"
      href={profile.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${count} on ${label}`}
    >
      {inner}
    </Chip>
  ) : (
    <Chip aria-label={`${count} on ${label}`}>{inner}</Chip>
  );
}

function PublicKitView({
  kit: rawKit,
  username,
  copied,
  preview = false,
  onShare,
  onSocialClick: _onSocialClick,
  onContactClick,
}) {
  const kit = normalizePublicKit(rawKit);
  useKitFonts(kit?.theme?.font || 'playfair');
  if (!kit) return null;
  const tokens = resolveThemeTokens(kit.theme);
  const layout = normalizeKitLayout(kit.layout);
  const brandCta = kitBrandCta(username || kit.username);
  const handle = `@${String(username || kit.username || '').replace(/^@/, '')}`;
  const socials = (kit.socialProfiles || []).filter((p) => p.url || p.handle);
  const social = socials[0];
  const socialLabel = social?.handle || handle;
  const displayName = kit.displayName || handle;
  const headline = kit.headline || kit.tagline || '';
  const about = [kit.about, kit.bio].find((text) => text && text !== headline) || '';
  const posts = kit.posts || [];
  const hasRates = !!(kit.ratesReel || kit.ratesTiktok || kit.ratesPhoto);
  const niche = kit.niches[0] || 'lifestyle';
  const services = (kit.theme.services && kit.theme.services.length)
    ? kit.theme.services
    : servicesForNiche(niche);
  const cover = kit.coverUrl || COVER_SAMPLES[0].url;
  const perPlatformFollowers = socials.filter((p) => p.followers);

  const posterByKey = {};
  posts.forEach((post) => {
    const key = mediaKey(post.post_url);
    if (key && post.thumbnail_url) posterByKey[key] = post.thumbnail_url;
  });
  const workItems = exampleWorkItems(kit.theme, posts);
  const logos = kit.theme.brand_logos || [];

  const videoPosts = posts.filter((p) => (
    p.post_type === 'reel' || p.platform === 'tiktok' || p.platform === 'youtube'
  ));
  const avgViews = videoPosts.length
    ? Math.round(videoPosts.reduce((sum, p) => sum + (p.views || 0), 0) / videoPosts.length)
    : 0;

  const workSection = (
    <Section $center>
      <DisplayTitle>Example videos</DisplayTitle>
      {workItems.length > 0 ? (
        <VideoRow>
          {workItems.map((item) => (
            <WorkCard key={item.url}>
              <KitPostEmbed url={item.url} poster={posterByKey[mediaKey(item.url)]} />
              {item.title ? <b>{item.title}</b> : null}
              {item.description ? <span>{item.description}</span> : null}
            </WorkCard>
          ))}
        </VideoRow>
      ) : (
        <EmptyWork>
          <strong>Your videos will live here</strong>
          <span>Paste Instagram, TikTok, or YouTube links. They show as a clean grid — not the platform player chrome.</span>
        </EmptyWork>
      )}
    </Section>
  );

  const packagesSection = (kit.gifted || hasRates) ? (
    <Section>
      <Kicker>Packages</Kicker>
      <Title>How to work together</Title>
      <PackageGrid>
        {kit.gifted && (
          <PackageCard>
            <em>Start here</em>
            <b>Gifted PR</b>
            <span>Product + shipping. First collab for most brands.</span>
          </PackageCard>
        )}
        {kit.ratesReel > 0 && (
          <PackageCard>
            <em>Video</em>
            <b>from ${kit.ratesReel.toLocaleString()}</b>
            <span>Instagram Reel or short-form video.</span>
          </PackageCard>
        )}
        {kit.ratesTiktok > 0 && (
          <PackageCard>
            <em>TikTok</em>
            <b>from ${kit.ratesTiktok.toLocaleString()}</b>
            <span>Native TikTok with usage to agree after.</span>
          </PackageCard>
        )}
        {kit.ratesPhoto > 0 && (
          <PackageCard>
            <em>Stills</em>
            <b>from ${kit.ratesPhoto.toLocaleString()}</b>
            <span>Photo post or product stills.</span>
          </PackageCard>
        )}
      </PackageGrid>
    </Section>
  ) : null;

  const aboutSection = (
    <Section>
      <AboutGrid $hasPortrait={!!kit.avatarUrl}>
        {kit.avatarUrl ? (
          <Portrait>
            <img src={kit.avatarUrl} alt={displayName} />
          </Portrait>
        ) : null}
        <div>
          <Kicker>About me</Kicker>
          <Title>{`Hi, I’m ${displayName}`}</Title>
          {about ? <Copy>{about}</Copy> : null}
          <MetaRow>
            {kit.niches.slice(0, 4).map((n) => (
              <Chip key={n}><span aria-hidden="true">{categoryEmoji(n)}</span>{categoryLabel(n)}</Chip>
            ))}
            {kit.location ? <Chip>{kit.location}</Chip> : null}
            {perPlatformFollowers.length
              ? perPlatformFollowers.map((p) => (
                <FollowerChip key={`followers-${p.platform}`} profile={p} />
              ))
              : (kit.followerCount ? <Chip>{formatKitNumber(kit.followerCount)} followers</Chip> : null)}
            {kit.likesCount ? <Chip>{formatKitNumber(kit.likesCount)} likes</Chip> : null}
            {kit.videoCount ? <Chip>{formatKitNumber(kit.videoCount)} videos</Chip> : null}
            {kit.email ? <Chip as="a" href={`mailto:${kit.email}`} $email>{kit.email}</Chip> : null}
            {(kit.avgViews > 0 ? kit.avgViews : avgViews) > 0 ? (
              <Chip>{formatKitNumber(kit.avgViews > 0 ? kit.avgViews : avgViews)} avg views</Chip>
            ) : null}
          </MetaRow>
        </div>
      </AboutGrid>
    </Section>
  );

  const servicesSection = services.length ? (
    <Section>
      <Kicker>What I make</Kicker>
      <DisplayTitle>Content brands can actually run</DisplayTitle>
      <ServiceGrid>
        {services.map((item) => (
          <ServiceCard key={item.title}>
            <b>{item.title}</b>
            <span>{item.body}</span>
          </ServiceCard>
        ))}
      </ServiceGrid>
    </Section>
  ) : null;

  const brandsSection = (logos.length || kit.brands.length) ? (
    <Section $center>
      <DisplayTitle $accent>Previously worked with</DisplayTitle>
      {logos.length ? (
        <LogoWall>
          {logos.map((item) => (
            <LogoItem key={item.logo_url} title={item.name || undefined}>
              <img src={item.logo_url} alt={item.name || 'Brand'} />
            </LogoItem>
          ))}
        </LogoWall>
      ) : (
        <Wordmarks>
          {kit.brands.map((b) => <span key={b}>{b}</span>)}
        </Wordmarks>
      )}
    </Section>
  ) : null;

  return (
    <ThemeProvider theme={tokens}>
      <Page data-kit-root $t={tokens} $preview={preview}>
        {layout !== 'gallery' && (
          <Cover $preview={preview} $src={cover}>
            <CoverShade />
            <CoverBar>
              <Eyebrow>UGC portfolio</Eyebrow>
              {onShare ? (
                <ShareBtn type="button" onClick={onShare}>
                  <FaShare size={12} />
                  {copied ? 'Copied' : 'Share portfolio'}
                </ShareBtn>
              ) : <span />}
            </CoverBar>
            <CoverCopy>
              <Name>{displayName}</Name>
              {headline ? <Lead>{headline}</Lead> : null}
              {socials.length ? (
                <SocialMeta profiles={socials} location={kit.location} />
              ) : (
                <CoverMeta>
                  {social?.url ? (
                    <CoverSocial href={social.url} target="_blank" rel="noopener noreferrer">{socialLabel}</CoverSocial>
                  ) : socialLabel}
                  {kit.location ? ` · ${kit.location}` : ''}
                  {!perPlatformFollowers.length && kit.followerCount ? ` · ${formatKitNumber(kit.followerCount)}` : ''}
                </CoverMeta>
              )}
              <CoverCta href={brandCta} onClick={onContactClick}>Let’s work together</CoverCta>
            </CoverCopy>
          </Cover>
        )}

        <Site>
          {layout === 'gallery' && (
            <GalleryHead>
              <div>
                <Name>{displayName}</Name>
                {headline ? <Lead $ink>{headline}</Lead> : null}
                <SocialMeta profiles={socials} location={kit.location} />
              </div>
              <CoverCta href={brandCta} onClick={onContactClick}>Let’s work together</CoverCta>
            </GalleryHead>
          )}

          {layout === 'ratecard' ? (
            <>
              {packagesSection}
              {aboutSection}
              {workSection}
              {servicesSection}
              {brandsSection}
            </>
          ) : layout === 'gallery' ? (
            <>
              {workSection}
              {aboutSection}
              {servicesSection}
              {packagesSection}
              {brandsSection}
            </>
          ) : (
            <>
              {aboutSection}
              {servicesSection}
              {workSection}
              {brandsSection}
              {packagesSection}
            </>
          )}

          <CTA>
            <div>
              <CTATitle>Want to work with {displayName}?</CTATitle>
              <CTASub>First campaign is product + shipping. Brief them on Newcollab.</CTASub>
            </div>
            <CoverCta href={brandCta} onClick={onContactClick}>Get in touch</CoverCta>
          </CTA>
          <Footer>
            <span>newcollab.co/kit/{kit.username}</span>
            <BrandLink href="https://newcollab.co">Portfolio by <b>Newcollab</b></BrandLink>
          </Footer>
        </Site>
      </Page>
    </ThemeProvider>
  );
}

export default PublicKitView;

const Page = styled.div`
  --kit-bg: ${p => p.$t.bg};
  --kit-surface: ${p => p.$t.surface};
  --kit-ink: ${p => p.$t.ink};
  --kit-muted: ${p => p.$t.muted};
  --kit-line: ${p => p.$t.line};
  --kit-accent: ${p => p.$t.accent};
  --kit-overlay: ${p => p.$t.overlay};
  --kit-radius: ${p => p.$t.radius}px;
  min-height: ${p => p.$preview ? 'auto' : '100vh'};
  background: var(--kit-bg);
  color: var(--kit-ink);
  font-family: ${p => p.$t.bodyFont} !important;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -webkit-text-size-adjust: 100%;
`;

const Cover = styled.header`
  position: relative;
  overflow: hidden;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #1a1612;
  background-image: ${p => (p.$src ? `url(${p.$src})` : 'none')};
  background-size: cover;
  background-position: center;
  width: 100%;
  flex-shrink: 0;
  ${p => p.$preview ? `
    min-height: 240px;
  ` : `
    min-height: 420px;
    min-height: clamp(400px, 52vh, 560px);
  `}
  @media (max-width: 640px) {
    ${p => p.$preview ? `
      min-height: 200px;
    ` : `
      min-height: 360px;
      min-height: clamp(340px, 46vh, 480px);
    `}
  }
`;
const CoverShade = styled.div`
  position: absolute; inset: 0; background: var(--kit-overlay);
`;
const CoverBar = styled.div`
  position: relative; z-index: 1;
  display: flex; justify-content: space-between; align-items: center;
  padding: 22px 28px 0;
  @media (max-width: 640px) { padding: 16px 20px 0; }
`;
const Eyebrow = styled.div`
  font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; opacity: .85;
  font-family: ${p => p.theme.bodyFont} !important;
`;
const ShareBtn = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  min-height: 44px; min-width: 44px;
  background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.25);
  font: 500 13px/1 ${p => p.theme.bodyFont};
  padding: 8px 14px; border-radius: 999px; cursor: pointer;
`;
const CoverCopy = styled.div`
  position: relative; z-index: 1;
  padding: 48px 28px 56px;
  max-width: 760px;
  @media (max-width: 640px) { padding: 32px 20px 44px; }
`;
const Name = styled.h1`
  margin: 0;
  font-family: ${p => p.theme.headlineFont} !important;
  font-weight: ${p => p.theme.headlineWeight || 500} !important;
  font-style: ${p => p.theme.headlineItalic ? 'italic' : 'normal'};
  font-size: clamp(32px, 6vw, 64px); line-height: 1.02; letter-spacing: -.03em;
`;
const Lead = styled.p`
  margin: 14px 0 0; max-width: 36rem; font-size: 18px; line-height: 1.45;
  font-family: ${p => p.theme.bodyFont} !important;
  color: ${p => p.$ink ? 'var(--kit-ink)' : 'rgba(255,255,255,.92)'};
  @media (max-width: 640px) { font-size: 16px; }
`;
const CoverMeta = styled.div`
  margin-top: 12px; font-size: 12px; letter-spacing: .04em; text-transform: uppercase; opacity: .85;
  font-family: ${p => p.theme.bodyFont} !important;
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px;
`;
const SocialList = styled.span`
  display: inline-flex; flex-wrap: wrap; align-items: center; gap: 8px 12px;
`;
const CoverSocial = styled.a`
  color: inherit; text-decoration: none;
  display: inline-flex; align-items: center; gap: 6px;
  letter-spacing: .04em;
  svg { flex-shrink: 0; display: block; }
  &:hover { text-decoration: underline; }
`;
const CoverCta = styled.a`
  display: inline-flex; align-items: center; justify-content: center;
  width: max-content; max-width: 100%;
  margin-top: 24px; min-height: 44px;
  background: ${p => p.theme.accent}; color: ${p => p.theme.accentInk};
  text-decoration: none; font-weight: 600 !important; font-size: 13px; padding: 12px 20px;
  border-radius: 999px;
  font-family: ${p => p.theme.bodyFont} !important;
`;

const Site = styled.div`
  max-width: 880px; margin: 0 auto; padding: 40px 0 56px;
  @media (max-width: 640px) { padding: 28px 0 40px; }
`;
const GalleryHead = styled.div`
  display: flex; justify-content: space-between; align-items: flex-end; gap: 20px;
  padding: 12px 28px 24px;
  ${CoverCta} { margin-top: 0; }
  @media (max-width: 640px) {
    flex-direction: column; align-items: flex-start; padding: 8px 20px 20px;
  }
`;
const Section = styled.section`
  padding: 36px 28px;
  text-align: ${p => p.$center ? 'center' : 'left'};
  @media (max-width: 640px) { padding: 28px 20px; }
`;
const Kicker = styled.div`
  font-size: 11px; font-weight: 700 !important; letter-spacing: .14em; text-transform: uppercase;
  color: var(--kit-accent); margin-bottom: 8px;
  font-family: ${p => p.theme.bodyFont} !important;
`;
const Title = styled.h2`
  margin: 0 0 14px;
  font-family: ${p => p.theme.headlineFont} !important;
  font-weight: ${p => p.theme.headlineWeight || 500} !important;
  font-style: ${p => p.theme.headlineItalic ? 'italic' : 'normal'};
  font-size: clamp(24px, 4vw, 34px); letter-spacing: -.03em; line-height: 1.15;
`;
const DisplayTitle = styled.h2`
  margin: 0 0 20px;
  font-family: ${p => p.theme.headlineFont} !important;
  font-weight: ${p => p.theme.headlineWeight || 500} !important;
  font-style: italic;
  font-size: clamp(24px, 4vw, 34px);
  letter-spacing: -.02em;
  line-height: 1.2;
  color: ${p => p.$accent ? p.theme.accent : 'var(--kit-ink)'};
`;
const Copy = styled.p`
  margin: 0 0 16px; font-size: 16px; line-height: 1.65; color: var(--kit-muted); max-width: 40rem;
  font-family: ${p => p.theme.bodyFont} !important;
`;
const AboutGrid = styled.div`
  display: grid;
  grid-template-columns: ${p => p.$hasPortrait ? '148px minmax(0, 1fr)' : '1fr'};
  gap: 28px;
  align-items: center;
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 18px;
    align-items: start;
  }
`;
const Portrait = styled.div`
  width: 148px;
  height: 148px;
  overflow: hidden;
  background: var(--kit-surface);
  border-radius: 22px;
  border: 1px solid var(--kit-line);
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
  span { display: grid; place-items: center; height: 100%; font-size: 32px; color: var(--kit-muted); }
`;
const MetaRow = styled.div` display: flex; flex-wrap: wrap; gap: 8px; `;
const Chip = styled.span`
  display: inline-flex; align-items: center; gap: 7px;
  border: 1px solid ${p => p.$email ? 'var(--kit-accent)' : 'var(--kit-line)'};
  background: var(--kit-surface);
  padding: 8px 12px; border-radius: 999px; font-size: 12px; font-weight: 600 !important;
  font-family: ${p => p.theme.bodyFont} !important;
  color: inherit; text-decoration: none;
  svg { flex-shrink: 0; display: block; }
`;
const ServiceGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  @media (max-width: 720px) { grid-template-columns: 1fr; }
`;
const ServiceCard = styled.div`
  background: var(--kit-surface); border: 1px solid var(--kit-line);
  border-radius: var(--kit-radius); padding: 18px 16px;
  b {
    display: block;
    font-family: ${p => p.theme.headlineFont} !important;
    font-size: 22px;
    font-weight: ${p => p.theme.headlineWeight || 500} !important;
    margin-bottom: 8px;
  }
  span { display: block; font-size: 14px; line-height: 1.5; color: var(--kit-muted); font-family: ${p => p.theme.bodyFont} !important; }
`;
const VideoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px 20px;
  align-items: flex-start;
`;
const WorkCard = styled.div`
  flex: 0 1 180px;
  width: 180px;
  max-width: 180px;
  text-align: left;
  color: var(--kit-ink);
  b {
    display: block;
    margin-top: 10px;
    color: var(--kit-ink);
    font-family: ${p => p.theme.headlineFont} !important;
    font-size: 15px;
    font-weight: ${p => p.theme.headlineWeight || 500} !important;
    line-height: 1.25;
    word-break: break-word;
  }
  span {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.45;
    color: var(--kit-muted);
    font-family: ${p => p.theme.bodyFont} !important;
    word-break: break-word;
  }
  @media (max-width: 640px) {
    flex: 0 1 calc(50% - 6px);
    width: calc(50% - 6px);
    max-width: none;
  }
`;
const LogoWall = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 28px 36px;
  max-width: 820px;
  margin: 0 auto;
  padding: 8px 8px 4px;
  @media (max-width: 640px) { gap: 22px 24px; }
`;
const LogoItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  max-width: 150px;
  img {
    display: block;
    max-height: 42px;
    max-width: 150px;
    width: auto;
    height: auto;
    object-fit: contain;
    filter: ${p => p.theme.id === 'ink' ? 'grayscale(1) invert(1)' : 'grayscale(1) contrast(1.15)'};
  }
`;
const Wordmarks = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 28px;
  max-width: 720px;
  margin: 0 auto;
  span {
    font-family: ${p => p.theme.headlineFont} !important;
    font-size: 22px;
    font-weight: 500 !important;
    letter-spacing: -.02em;
  }
`;
const EmptyWork = styled.div`
  border: 1px dashed var(--kit-line); border-radius: var(--kit-radius); padding: 22px;
  strong { display: block; margin-bottom: 6px; }
  span { color: var(--kit-muted); font-size: 14px; line-height: 1.5; }
`;
const PackageGrid = styled.div`
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;
const PackageCard = styled.div`
  background: var(--kit-surface); border: 1px solid var(--kit-line);
  border-radius: var(--kit-radius); padding: 18px 16px;
  em { display: block; font-style: normal; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--kit-accent); }
  b {
    display: block;
    font-family: ${p => p.theme.headlineFont} !important;
    font-size: 28px;
    font-weight: ${p => p.theme.headlineWeight || 500} !important;
    margin: 6px 0;
  }
  span { color: var(--kit-muted); font-size: 14px; line-height: 1.45; }
`;
const CTA = styled.div`
  margin: 12px 28px 0; padding: 24px; border-radius: var(--kit-radius);
  background: var(--kit-surface); border: 1px solid var(--kit-line);
  display: flex; justify-content: space-between; align-items: center; gap: 20px;
  ${CoverCta} { margin-top: 0; }
  @media (max-width: 640px) {
    margin: 8px 20px 0; flex-direction: column; align-items: flex-start;
  }
`;
const CTATitle = styled.div`
  font-family: ${p => p.theme.headlineFont} !important;
  font-weight: ${p => p.theme.headlineWeight || 500} !important;
  font-size: clamp(22px, 5vw, 28px); line-height: 1.1;
`;
const CTASub = styled.div`
  margin-top: 6px; color: var(--kit-muted); font-size: 14px;
`;
const Footer = styled.footer`
  display: flex; justify-content: space-between; gap: 12px;
  padding: 28px 28px 0; font-size: 12px; color: var(--kit-muted);
  b { color: var(--kit-accent); font-weight: 600 !important; }
  @media (max-width: 640px) {
    padding: 22px 20px 0; flex-wrap: wrap;
  }
`;
const BrandLink = styled.a`
  color: inherit; text-decoration: none;
  &:hover b { text-decoration: underline; }
`;
