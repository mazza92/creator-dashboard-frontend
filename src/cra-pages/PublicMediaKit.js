import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://api.newcollab.co';

const formatNumber = (n) => {
  if (!n) return null;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};

const PLATFORM_LABEL = { instagram: 'IG', tiktok: 'TikTok', youtube: 'YT' };
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

const PublicMediaKit = ({ username }) => {
  const [kit, setKit]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    axios.get(`${API_BASE}/api/portfolio/public/${username}`)
      .then(r => setKit(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <KitPage><KitLoading>Loading...</KitLoading></KitPage>;
  if (notFound) return <KitPage><KitLoading>Kit not found</KitLoading></KitPage>;
  if (!kit) return null;

  const { posts = [], rates_reel, rates_tiktok, rates_photo, rates_gifted } = kit;
  const hasRates = rates_reel || rates_tiktok || rates_photo;
  const brands = [...new Set(posts.filter(p => p.brand_name && p.collab_type !== 'own').map(p => p.brand_name))];

  return (
    <KitPage>
      <KitWrap>

        {/* Header */}
        <KitHeader>
          <KitHeaderInner>
            <KitAvatar>
              {kit.avatar_url
                ? <img src={kit.avatar_url} alt={kit.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>{(kit.first_name || kit.username || '?').charAt(0).toUpperCase()}</span>
              }
            </KitAvatar>
            <KitHeaderInfo>
              <KitName>{kit.first_name || kit.username}</KitName>
              {kit.tagline && <KitTagline>{kit.tagline}</KitTagline>}
              {kit.niches?.length > 0 && (
                <KitNicheTags>
                  {kit.niches.slice(0, 4).map(n => (
                    <KitNicheTag key={n}>{n}</KitNicheTag>
                  ))}
                </KitNicheTags>
              )}
            </KitHeaderInfo>
          </KitHeaderInner>
        </KitHeader>

        {/* Stats strip */}
        <KitStatsStrip>
          {kit.follower_count && (
            <KitStatItem>
              <KitStatVal>{formatNumber(kit.follower_count)}</KitStatVal>
              <KitStatSub>followers</KitStatSub>
            </KitStatItem>
          )}
          {kit.engagement_rate > 0 && (
            <KitStatItem>
              <KitStatVal>{kit.engagement_rate.toFixed(1)}%</KitStatVal>
              <KitStatSub>engagement</KitStatSub>
            </KitStatItem>
          )}
          {kit.country && (
            <KitStatItem>
              <KitStatVal>{kit.country}</KitStatVal>
              <KitStatSub>market</KitStatSub>
            </KitStatItem>
          )}
          {posts.length > 0 && (
            <KitStatItem>
              <KitStatVal>{posts.length}</KitStatVal>
              <KitStatSub>posts</KitStatSub>
            </KitStatItem>
          )}
        </KitStatsStrip>

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
                    <KitPostImg featured={isFeatured} niche={kit.niches?.[0]?.toLowerCase()}>
                      <KitPostEmoji>{post.platform === 'tiktok' ? '▶' : post.platform === 'youtube' ? '▶' : '📸'}</KitPostEmoji>
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
            <KitCTASub>Usually responds within 48 hours</KitCTASub>
          </KitCTAText>
          <KitCTABtn href={`mailto:?subject=Collab with ${kit.username}`}>
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
  padding: 28px 24px 24px;
  @media (max-width: 480px) { padding: 24px 16px 20px; }
`;

const KitHeaderInner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const KitAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7C3AED, #E11D48);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 900;
  color: #fff;
  flex-shrink: 0;
  border: 2px solid rgba(255,255,255,0.15);
  overflow: hidden;
  @media (max-width: 480px) { width: 52px; height: 52px; font-size: 20px; }
`;

const KitHeaderInfo = styled.div`
  flex: 1;
`;

const KitName = styled.div`
  font-size: 22px;
  font-weight: 900;
  color: #fff;
  margin-bottom: 4px;
  @media (max-width: 480px) { font-size: 18px; }
`;

const KitTagline = styled.div`
  font-size: 13px;
  color: rgba(255,255,255,0.6);
  line-height: 1.4;
  margin-bottom: 10px;
`;

const KitNicheTags = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const KitNicheTag = styled.span`
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.8);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: capitalize;
`;

const KitStatsStrip = styled.div`
  display: flex;
  border-bottom: 1px solid #F3F4F6;
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
`;

const KitStatItem = styled.div`
  flex: 1;
  min-width: 80px;
  padding: 16px 12px;
  text-align: center;
  border-right: 1px solid #F3F4F6;
  &:last-child { border-right: none; }
`;

const KitStatVal = styled.div`
  font-size: 18px;
  font-weight: 900;
  color: #0F0F0F;
`;

const KitStatSub = styled.div`
  font-size: 10px;
  color: #9CA3AF;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
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
  background: ${p =>
    p.niche === 'beauty' || p.niche === 'skincare' ? 'linear-gradient(135deg,#FDF2F8,#F5F3FF)' :
    p.niche === 'fitness' || p.niche === 'wellness' ? 'linear-gradient(135deg,#F0FDF4,#ECFDF5)' :
    p.niche === 'food' ? 'linear-gradient(135deg,#FFFBEB,#FEF3C7)' :
    'linear-gradient(135deg,#EFF6FF,#F5F3FF)'
  };
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
