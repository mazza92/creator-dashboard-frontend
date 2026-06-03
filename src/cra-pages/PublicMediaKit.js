import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FaInstagram, FaTiktok, FaYoutube, FaShare, FaEye, FaLinkedinIn, FaTwitter } from 'react-icons/fa';

const API_BASE = process.env.REACT_APP_API_URL || 'https://api.newcollab.co';

const formatNumber = (n) => {
  if (!n) return null;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};

// Parse niches - handle both array and JSON string formats
const parseNiches = (niches) => {
  if (!niches) return [];
  if (Array.isArray(niches)) return niches;
  if (typeof niches === 'string') {
    try {
      const parsed = JSON.parse(niches);
      return Array.isArray(parsed) ? parsed : [niches];
    } catch {
      return [niches];
    }
  }
  return [];
};

const PLATFORM_LABEL = { instagram: 'IG', tiktok: 'TikTok', youtube: 'YT' };
const PLATFORM_DISPLAY = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' };
const POST_TYPE_LABEL = {
  reel: 'Reel', photo: 'Photo', story: 'Story',
  tiktok: 'TikTok', youtube: 'Video', short: 'Short',
};
const COLLAB_COLOR = {
  paid:    { bg: '#D1FAE5', color: '#065F46' },
  gifted:  { bg: '#EFF6FF', color: '#1D4ED8' },
  organic: { bg: '#F3F4F6', color: '#6B7280' },
  own:     { bg: '#F3F4F6', color: '#6B7280' },
};

// Abbreviate long region names for compact display
const abbreviateRegion = (region) => {
  const abbrevs = {
    'North America': 'NA',
    'South America': 'SA',
    'Europe': 'EU',
    'Asia': 'Asia',
    'Africa': 'Africa',
    'Oceania': 'OCE',
    'Middle East': 'ME',
    'United States': 'US',
    'United Kingdom': 'UK',
  };
  return abbrevs[region] || region;
};

const PlatformIcon = ({ platform, size = 28 }) => {
  if (platform === 'tiktok') return <FaTiktok size={size} color="#000" />;
  if (platform === 'youtube') return <FaYoutube size={size} color="#FF0000" />;
  return <FaInstagram size={size} color="#E4405F" />;
};

const PublicMediaKit = ({ username }) => {
  const [kit, setKit]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!username) return;
    axios.get(`${API_BASE}/api/portfolio/public/${username}`)
      .then(r => setKit(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  const handleShare = async () => {
    const url = `https://newcollab.co/kit/${username}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${kit.first_name || kit.username}'s Media Kit`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      // User cancelled or error
    }
  };

  if (loading) return <KitPage><KitLoading>Loading...</KitLoading></KitPage>;
  if (notFound) return <KitPage><KitLoading>Kit not found</KitLoading></KitPage>;
  if (!kit) return null;

  const { posts = [], rates_reel, rates_tiktok, rates_photo, rates_gifted } = kit;
  const hasRates = !!(rates_reel || rates_tiktok || rates_photo);
  const brands = [...new Set(posts.filter(p => p.brand_name && p.collab_type !== 'own').map(p => p.brand_name))];

  // Parse niches properly
  const niches = parseNiches(kit.niches);

  // Detect platforms from posts
  const platforms = [...new Set(posts.map(p => p.platform))].filter(Boolean);

  return (
    <KitPage>
      <KitWrap>

        {/* Header */}
        <KitHeader>
          <KitHeaderTop>
            {kit.is_pro && kit.kit_views != null && (
              <KitViewsCounter>
                <FaEye size={12} style={{ opacity: 0.7 }} />
                <span>{kit.kit_views} KIT VIEWS THIS WEEK</span>
              </KitViewsCounter>
            )}
            {!kit.is_pro && <div />}
            <KitShareBtn onClick={handleShare}>
              <FaShare size={12} />
              <span>{copied ? 'Copied!' : 'Share kit'}</span>
            </KitShareBtn>
          </KitHeaderTop>

          <KitHeaderInner>
            <KitAvatarWrap>
              <KitAvatar>
                {kit.avatar_url
                  ? <img src={kit.avatar_url} alt={kit.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span>{(kit.first_name || kit.username || '?').charAt(0).toUpperCase()}</span>
                }
              </KitAvatar>
            </KitAvatarWrap>
            <KitHeaderInfo>
              <KitName>{kit.first_name || kit.username}</KitName>
              {kit.tagline && <KitTagline>{kit.tagline}</KitTagline>}
              <KitChipsRow>
                {niches.slice(0, 3).map(n => (
                  <KitNicheTag key={n}>{n.replace(/["[\]]/g, '')}</KitNicheTag>
                ))}
              </KitChipsRow>
              {kit.socials && Object.keys(kit.socials).length > 0 && (
                <KitSocialsRow>
                  {kit.socials.instagram && (
                    <KitSocialLink href={kit.socials.instagram} target="_blank" rel="noopener noreferrer">
                      <FaInstagram size={18} />
                    </KitSocialLink>
                  )}
                  {kit.socials.tiktok && (
                    <KitSocialLink href={kit.socials.tiktok} target="_blank" rel="noopener noreferrer">
                      <FaTiktok size={16} />
                    </KitSocialLink>
                  )}
                  {kit.socials.youtube && (
                    <KitSocialLink href={kit.socials.youtube} target="_blank" rel="noopener noreferrer">
                      <FaYoutube size={18} />
                    </KitSocialLink>
                  )}
                  {kit.socials.linkedin && (
                    <KitSocialLink href={kit.socials.linkedin} target="_blank" rel="noopener noreferrer">
                      <FaLinkedinIn size={16} />
                    </KitSocialLink>
                  )}
                  {kit.socials.twitter && (
                    <KitSocialLink href={kit.socials.twitter} target="_blank" rel="noopener noreferrer">
                      <FaTwitter size={16} />
                    </KitSocialLink>
                  )}
                </KitSocialsRow>
              )}
            </KitHeaderInfo>
          </KitHeaderInner>
        </KitHeader>

        {/* Stats section */}
        <KitStatsSection>
          <KitStatsGrid>
            {kit.follower_count > 0 && (
              <KitStatCard>
                <KitStatVal>{formatNumber(kit.follower_count)}</KitStatVal>
                <KitStatSub>followers</KitStatSub>
              </KitStatCard>
            )}
            {kit.engagement_rate > 0 && (
              <KitStatCard>
                <KitStatVal>{kit.engagement_rate.toFixed(1)}%</KitStatVal>
                <KitStatSub>engagement</KitStatSub>
              </KitStatCard>
            )}
            {posts.length > 0 && (
              <KitStatCard>
                <KitStatVal>{posts.length}</KitStatVal>
                <KitStatSub>posts</KitStatSub>
              </KitStatCard>
            )}
            {kit.primary_age_range && (
              <KitStatCard>
                <KitStatVal>{kit.primary_age_range}</KitStatVal>
                <KitStatSub>audience age</KitStatSub>
              </KitStatCard>
            )}
            {kit.regions?.length > 0 && (
              <KitStatCard>
                <KitStatVal>{kit.regions.slice(0, 2).map(abbreviateRegion).join(', ')}</KitStatVal>
                <KitStatSub>regions</KitStatSub>
              </KitStatCard>
            )}
          </KitStatsGrid>

          {/* Platform breakdown */}
          {platforms.length > 0 && (
            <KitPlatformStats>
              {platforms.map(platform => {
                const platformPosts = posts.filter(p => p.platform === platform);
                const totalViews = platformPosts.reduce((sum, p) => sum + (p.views || 0), 0);
                return (
                  <KitPlatformStatRow key={platform}>
                    <KitPlatformStatIcon>
                      <PlatformIcon platform={platform} size={16} />
                    </KitPlatformStatIcon>
                    <KitPlatformStatName>{PLATFORM_DISPLAY[platform]}</KitPlatformStatName>
                    <KitPlatformStatValue>
                      {platformPosts.length} posts
                      {totalViews > 0 && ` · ${formatNumber(totalViews)} views`}
                    </KitPlatformStatValue>
                  </KitPlatformStatRow>
                );
              })}
            </KitPlatformStats>
          )}
        </KitStatsSection>

        {/* Portfolio grid */}
        {posts.length > 0 && (
          <>
            <KitSectionLabel>Portfolio</KitSectionLabel>
            <KitGrid>
              {posts.map((post, i) => {
                const collab = COLLAB_COLOR[post.collab_type] || COLLAB_COLOR.own;
                const isFeatured = post.is_featured || i === 0;
                return (
                  <KitPostCard key={post.id} featured={isFeatured} href={post.post_url || undefined} target="_blank" rel="noopener noreferrer" as={post.post_url ? 'a' : 'div'}>
                    <KitPostImg featured={isFeatured} niche={kit.niches?.[0]?.toLowerCase()} hasThumbnail={!!post.thumbnail_url}>
                      {post.thumbnail_url ? (
                        <KitPostThumb src={post.thumbnail_url} alt={post.brand_name || 'Post'} />
                      ) : (
                        <KitPostEmoji><PlatformIcon platform={post.platform} size={28} /></KitPostEmoji>
                      )}
                      <KitPostPlatformBadge platform={post.platform}>
                        {PLATFORM_LABEL[post.platform] || post.platform} · {POST_TYPE_LABEL[post.post_type] || post.post_type}
                      </KitPostPlatformBadge>
                    </KitPostImg>
                    <KitPostBody>
                      <KitPostBrandRow>
                        <KitPostBrand>{post.brand_name || 'Original content'}</KitPostBrand>
                        <KitPostCollabChip style={{ background: collab.bg, color: collab.color }}>
                          {post.collab_type === 'own' ? 'Original' : post.collab_type}
                        </KitPostCollabChip>
                      </KitPostBrandRow>
                      {(post.views || post.likes) > 0 && (
                        <KitPostStats>
                          {post.views > 0 && <span>{formatNumber(post.views)} views</span>}
                          {post.likes > 0 && <span>{formatNumber(post.likes)} likes</span>}
                          {post.comments > 0 && <span>{formatNumber(post.comments)} comments</span>}
                        </KitPostStats>
                      )}
                    </KitPostBody>
                  </KitPostCard>
                );
              })}
            </KitGrid>
          </>
        )}

        {/* Brands worked with */}
        {brands.length > 0 && (
          <>
            <KitSectionLabel>Brands worked with</KitSectionLabel>
            <BrandsRow>
              {brands.map(b => <BrandPill key={b}>{b}</BrandPill>)}
              {rates_gifted && <BrandPill open>Open to gifted</BrandPill>}
            </BrandsRow>
          </>
        )}

        {/* Rate card */}
        {hasRates && (
          <>
            <KitSectionLabel>Packages</KitSectionLabel>
            <RateCard>
              {rates_reel && (
                <RateCardRow>
                  <RateCardLabel>Instagram Reel + Story</RateCardLabel>
                  <RateCardPrice>from ${rates_reel.toLocaleString()}</RateCardPrice>
                </RateCardRow>
              )}
              {rates_tiktok && (
                <RateCardRow>
                  <RateCardLabel>TikTok video</RateCardLabel>
                  <RateCardPrice>from ${rates_tiktok.toLocaleString()}</RateCardPrice>
                </RateCardRow>
              )}
              {rates_photo && (
                <RateCardRow>
                  <RateCardLabel>Photo post</RateCardLabel>
                  <RateCardPrice>from ${rates_photo.toLocaleString()}</RateCardPrice>
                </RateCardRow>
              )}
              {rates_gifted && (
                <RateCardRow gifted>
                  <RateCardLabel>Gifted collabs</RateCardLabel>
                  <RateCardPrice style={{ color: '#059669' }}>Open</RateCardPrice>
                </RateCardRow>
              )}
            </RateCard>
          </>
        )}

        {/* CTA */}
        <KitCTA>
          <KitCTAText>
            <KitCTATitle>Interested in working together?</KitCTATitle>
            <KitCTASub>Sign up as a brand to connect with {kit.first_name || kit.username}</KitCTASub>
          </KitCTAText>
          <KitCTABtn href="/register/brand">
            Get in touch
          </KitCTABtn>
        </KitCTA>

        <KitFooter>
          <KitFooterLeft>newcollab.co/kit/{kit.username}</KitFooterLeft>
          <KitFooterRight>Media kit by <KitBrand>Newcollab</KitBrand></KitFooterRight>
        </KitFooter>

      </KitWrap>
    </KitPage>
  );
};

// ── Public page styles ─────────────────────────────────────────

const KitPage = styled.div`
  min-height: 100vh;
  background: #F5F5F3;
  padding: 24px 16px 60px;
  @media (max-width: 480px) { padding: 0 0 60px; }
`;

const KitWrap = styled.div`
  max-width: 720px;
  margin: 0 auto;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.08);
  @media (max-width: 480px) { border-radius: 0; box-shadow: none; }
`;

const KitLoading = styled.div`
  text-align: center;
  padding: 80px 20px;
  font-size: 14px;
  color: #9CA3AF;
`;

const KitHeader = styled.div`
  background: #0F0F0F;
  padding: 16px 24px 24px;
  @media (max-width: 480px) { padding: 12px 16px 20px; }
`;

const KitHeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const KitViewsCounter = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const KitShareBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: rgba(255,255,255,0.2);
  }
`;

const KitHeaderInner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const KitAvatarWrap = styled.div`
  flex-shrink: 0;
  padding: 3px;
  background: linear-gradient(135deg, #7C3AED, #E11D48, #F59E0B);
  border-radius: 50%;
`;

const KitAvatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #1F1F1F;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  overflow: hidden;
  border: 3px solid #0F0F0F;
  @media (max-width: 480px) { width: 60px; height: 60px; font-size: 24px; }
`;

const KitHeaderInfo = styled.div`
  flex: 1;
  padding-top: 4px;
`;

const KitName = styled.div`
  font-size: 24px;
  font-weight: 900;
  color: #fff;
  margin-bottom: 4px;
  @media (max-width: 480px) { font-size: 20px; }
`;

const KitTagline = styled.div`
  font-size: 14px;
  color: rgba(255,255,255,0.7);
  line-height: 1.4;
  margin-bottom: 12px;
  @media (max-width: 480px) { font-size: 13px; }
`;

const KitChipsRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
`;

const KitNicheTag = styled.span`
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.9);
  font-size: 11px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
  text-transform: capitalize;
`;

const KitSocialsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
`;

const KitSocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  color: #fff;
  transition: all 0.2s;
  &:hover {
    background: rgba(255,255,255,0.2);
    transform: scale(1.1);
  }
`;

const KitStatsSection = styled.div`
  padding: 20px 20px 16px;
  border-bottom: 1px solid #F3F4F6;
`;

const KitStatsGrid = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 16px;

  @media (max-width: 420px) {
    flex-wrap: wrap;
  }
`;

const KitStatCard = styled.div`
  flex: 1;
  min-width: 0;
  background: #F9FAFB;
  border-radius: 8px;
  padding: 8px 4px;
  text-align: center;

  @media (max-width: 420px) {
    flex: 1 1 calc(33.333% - 4px);
    min-width: calc(33.333% - 4px);
  }
`;

const KitStatVal = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #0F0F0F;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const KitStatSub = styled.div`
  font-size: 8px;
  color: #9CA3AF;
  margin-top: 1px;
  text-transform: uppercase;
  letter-spacing: 0.2px;
`;

const KitPlatformStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const KitPlatformStatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #F9FAFB;
  border-radius: 10px;
`;

const KitPlatformStatIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
`;

const KitPlatformStatName = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #0F0F0F;
  flex: 1;
`;

const KitPlatformStatValue = styled.div`
  font-size: 12px;
  color: #6B7280;
  font-weight: 500;
`;

const KitSectionLabel = styled.div`
  font-size: 10px;
  font-weight: 800;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 16px 20px 8px;
`;

const KitGrid = styled.div`
  padding: 0 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  @media (max-width: 600px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 380px) { grid-template-columns: 1fr 1fr; gap: 6px; padding: 0 12px; }
`;

const KitPostCard = styled.a`
  background: #F9FAFB;
  border-radius: 14px;
  overflow: hidden;
  border: 1.5px solid #F3F4F6;
  text-decoration: none;
  display: block;
  transition: transform 0.15s;
  &:hover { transform: translateY(-2px); }
  ${p => p.featured ? `grid-column: span 1;` : ''}
`;

const KitPostImg = styled.div`
  padding-top: 100%;
  position: relative;
  overflow: hidden;
  background: ${p => p.hasThumbnail ? '#000' :
    p.niche === 'beauty' || p.niche === 'skincare' ? 'linear-gradient(135deg,#FDF2F8,#F5F3FF)' :
    p.niche === 'fitness' || p.niche === 'wellness' ? 'linear-gradient(135deg,#F0FDF4,#ECFDF5)' :
    p.niche === 'food' ? 'linear-gradient(135deg,#FFFBEB,#FEF3C7)' :
    'linear-gradient(135deg,#EFF6FF,#F5F3FF)'
  };
`;

const KitPostThumb = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const KitPostEmoji = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
`;

const KitPostPlatformBadge = styled.div`
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 6px;
  background: ${p => p.platform === 'tiktok' ? '#0F0F0F' : p.platform === 'youtube' ? '#EF4444' : '#E11D48'};
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.2px;
`;

const KitPostBody = styled.div`
  padding: 8px 10px 10px;
`;

const KitPostBrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 4px;
`;

const KitPostBrand = styled.div`
  font-size: 11.5px;
  font-weight: 700;
  color: #0F0F0F;
`;

const KitPostCollabChip = styled.span`
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  text-transform: capitalize;
`;

const KitPostStats = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 10px;
  color: #9CA3AF;
  font-weight: 500;
`;

const BrandsRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 0 20px 16px;
`;

const BrandPill = styled.div`
  padding: 6px 14px;
  background: ${p => p.open ? '#F0FDF4' : '#F9FAFB'};
  border: 1px solid ${p => p.open ? '#A7F3D0' : '#E5E7EB'};
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  color: ${p => p.open ? '#059669' : '#374151'};
`;

const RateCard = styled.div`
  margin: 0 16px 16px;
  border: 1.5px solid #E5E7EB;
  border-radius: 16px;
  overflow: hidden;
`;

const RateCardRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  border-bottom: 1px solid #F3F4F6;
  background: ${p => p.gifted ? '#F0FDF4' : '#fff'};
  &:last-child { border-bottom: none; }
`;

const RateCardLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
`;

const RateCardPrice = styled.div`
  font-size: 14px;
  font-weight: 900;
  color: #0F0F0F;
`;

const KitCTA = styled.div`
  margin: 8px 16px 0;
  background: #0F0F0F;
  border-radius: 18px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  @media (max-width: 480px) { flex-direction: column; text-align: center; gap: 14px; margin: 8px 12px 0; }
`;

const KitCTAText = styled.div``;

const KitCTATitle = styled.div`
  font-size: 16px;
  font-weight: 900;
  color: #fff;
  margin-bottom: 3px;
`;

const KitCTASub = styled.div`
  font-size: 12px;
  color: rgba(255,255,255,0.5);
`;

const KitCTABtn = styled.a`
  background: #fff;
  color: #0F0F0F;
  font-size: 13px;
  font-weight: 800;
  padding: 12px 22px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  display: inline-block;
  @media (max-width: 480px) { width: 100%; text-align: center; }
`;

const KitFooter = styled.div`
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #F3F4F6;
  margin-top: 16px;
  @media (max-width: 480px) { flex-direction: column; gap: 4px; text-align: center; padding: 12px; }
`;

const KitFooterLeft = styled.div`
  font-size: 12px;
  color: #9CA3AF;
`;

const KitFooterRight = styled.div`
  font-size: 12px;
  color: #9CA3AF;
`;

const KitBrand = styled.span`
  color: #E11D48;
  font-weight: 800;
`;

export default PublicMediaKit;
