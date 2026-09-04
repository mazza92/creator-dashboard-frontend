import React from 'react';
import styled, { keyframes } from 'styled-components';
import { creatorTokens as tokens } from '../../theme/creatorTokens';

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

export function compactCount(n) {
  const num = Number(n);
  if (!Number.isFinite(num) || num <= 0) return null;
  if (num >= 1_000_000) {
    const v = num / 1_000_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (num >= 1000) {
    const v = num / 1000;
    if (num >= 100_000) return `${Math.round(v)}K`;
    return `${v.toFixed(1).replace(/\.0$/, '')}K`;
  }
  return Math.round(num).toLocaleString();
}

export function parseSocial(raw) {
  if (!raw) return null;
  let value = raw;
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { return null; }
  }
  if (!value || typeof value !== 'object') return null;
  const followers = Number(value.followers) || 0;
  const following = Number(value.following) || 0;
  const likes = Number(value.likes) || 0;
  const posts = Number(value.posts) || 0;
  return {
    platform: String(value.platform || '').toLowerCase(),
    handle: String(value.handle || '').replace(/^@/, ''),
    nickname: String(value.nickname || ''),
    followers,
    following,
    likes,
    posts,
    bio: String(value.bio || '').trim(),
    verified: !!value.verified,
    avatarUrl: value.avatar_url || value.avatarUrl || '',
  };
}

function cleanHandle(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/^https?:\/\/(www\.)?(instagram|tiktok)\.com\/@?/i, '')
    .replace(/\/$/, '')
    .replace(/^@/, '')
    .split('?')[0]
    .trim();
}

function websiteHost(url) {
  if (!url) return '';
  try {
    const href = url.startsWith('http') ? url : `https://${url}`;
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return String(url).replace(/^https?:\/\//, '').replace(/^www\./, '');
  }
}

function websiteHref(url) {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://${url}`;
}

function VerifiedBadge() {
  return (
    <Verified aria-label="Verified" title="Verified">
      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
        <circle cx="10" cy="10" r="10" fill="#20D5EC" />
        <path d="M5.8 10.4l2.4 2.4 5.9-6" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Verified>
  );
}

/**
 * TikTok-style brand identity: name | @handle, bio, and real metrics only.
 * Never invents follower / like counts — omit a stat when it is missing.
 */
export default function BrandSocialHeader({
  name,
  logo,
  initials: initialsText,
  logoHue,
  handle,
  tiktok,
  instagram,
  website,
  bio,
  kicker,
  social,
  loading = false,
}) {
  const parsed = parseSocial(social);
  const tt = cleanHandle(tiktok || (parsed?.platform === 'tiktok' ? parsed.handle : ''));
  const ig = cleanHandle(instagram || (parsed?.platform === 'instagram' ? parsed.handle : ''));
  const displayHandle = cleanHandle(parsed?.handle || handle || tt || ig);
  const displayBio = (parsed?.bio || bio || '').trim();
  const verified = !!parsed?.verified;

  const metrics = [
    { label: 'Following', value: compactCount(parsed?.following) },
    { label: 'Followers', value: compactCount(parsed?.followers) },
    parsed?.platform === 'instagram'
      ? { label: 'Posts', value: compactCount(parsed?.posts) }
      : { label: 'Likes', value: compactCount(parsed?.likes) },
  ].filter((m) => m.value);

  const showMetricSkeleton = loading && metrics.length === 0 && (tt || ig);

  return (
    <Wrap>
      <Identity>
        {logo ? (
          <Logo src={logo} alt="" />
        ) : (
          <LogoFallback style={{ background: logoHue }}>{initialsText}</LogoFallback>
        )}
        <Copy>
          <NameRow>
            <Name>{name}</Name>
            {displayHandle && (
              <>
                <Sep aria-hidden="true">|</Sep>
                <Handle>@{displayHandle}</Handle>
              </>
            )}
            {verified && <VerifiedBadge />}
          </NameRow>
          {kicker && <Kicker>{kicker}</Kicker>}
        </Copy>
      </Identity>

      {displayBio && <Bio>{displayBio}</Bio>}

      {metrics.length > 0 && (
        <Metrics aria-label="Social stats">
          {metrics.map((m) => (
            <Metric key={m.label}>
              <b>{m.value}</b> {m.label}
            </Metric>
          ))}
        </Metrics>
      )}
      {showMetricSkeleton && (
        <Metrics aria-hidden="true">
          <Skel $w="88px" />
          <Skel $w="104px" />
          <Skel $w="72px" />
        </Metrics>
      )}

      <Links>
        {tt && (
          <LinkChip href={`https://www.tiktok.com/@${tt}`} target="_blank" rel="noopener noreferrer">
            TikTok @{tt}
          </LinkChip>
        )}
        {ig && (
          <LinkChip href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer">
            Instagram @{ig}
          </LinkChip>
        )}
        {website && (
          <LinkChip href={websiteHref(website)} target="_blank" rel="noopener noreferrer">
            {websiteHost(website)}
          </LinkChip>
        )}
      </Links>
    </Wrap>
  );
}

const Wrap = styled.div`
  min-width: 0;
`;

const Identity = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  min-width: 0;
`;

const Logo = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  object-fit: cover;
  background: ${tokens.subtle};
  flex-shrink: 0;
`;

const LogoFallback = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #fff;
  font-size: 15px;
  flex-shrink: 0;
`;

const Copy = styled.div`
  min-width: 0;
  flex: 1;
  padding-top: 2px;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
`;

const Name = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 750;
  letter-spacing: -.02em;
  color: ${tokens.ink};
  line-height: 1.2;
`;

const Sep = styled.span`
  color: ${tokens.line};
  font-weight: 400;
  font-size: 16px;
`;

const Handle = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: ${tokens.muted};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Verified = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  line-height: 0;
`;

const Kicker = styled.p`
  margin: 6px 0 0;
  font-size: 13px;
  color: ${tokens.muted};
  line-height: 1.4;
`;

const Bio = styled.p`
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.45;
  color: ${tokens.inkSoft};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Metrics = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  margin-top: 12px;
  font-size: 14px;
  color: ${tokens.ink};
`;

const Metric = styled.span`
  white-space: nowrap;
  b {
    font-weight: 750;
    letter-spacing: -.02em;
  }
`;

const Skel = styled.span`
  display: inline-block;
  height: 14px;
  width: ${(p) => p.$w || '80px'};
  border-radius: 6px;
  background: linear-gradient(90deg, ${tokens.subtle} 25%, #f6f1e8 50%, ${tokens.subtle} 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Links = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
`;

const LinkChip = styled.a`
  font-size: 12px;
  font-weight: 650;
  color: ${tokens.ink};
  text-decoration: none;
  background: ${tokens.subtle};
  border: 1px solid ${tokens.line};
  border-radius: 999px;
  padding: 6px 10px;
  &:hover { background: #ebe6dc; }
  &:focus-visible {
    outline: 2px solid ${tokens.accent};
    outline-offset: 2px;
  }
`;
