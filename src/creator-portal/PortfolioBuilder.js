import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { message } from 'antd';
import { FaEye, FaLock } from 'react-icons/fa';
import { apiClient, getRuntimeApiUrl } from '../config/api';
import UpgradeModal from './UpgradeModal';
import KitStudioEditor, { STUDIO_FONT, cleanSocialHandle, primarySocial, seedSocialProfiles, studioPublishError } from '../kit-builder/KitStudioEditor';
import { matchOfferId, ratesFromDraft } from '../kit-builder/pricingOffers';
import { COVER_SAMPLES, normalizeExamples, normalizeKitTheme, resolveCoverUrl } from '../kit-builder/themes';
import KitLoading from '../kit-builder/KitLoading';
import { normalizeKitLayout } from '../kit-builder/templates';
import { clearKitDraft, readKitDraft } from '../kit-builder/draft';
import PortfolioLiveModal from '../kit-builder/PortfolioLiveModal';

function followerString(user, settings) {
  const n = Number(
    settings?.social_follower_count
    || settings?.follower_count
    || user?.social_follower_count
    || user?.followers_count
    || user?.followers
    || 0
  ) || 0;
  return n ? String(n) : '';
}

function seedKitSocialProfiles(theme, settings, user) {
  const officialPlatform = String(settings?.social_platform || user?.social_platform || '').toLowerCase();
  const officialHandle = String(settings?.social_handle || user?.social_handle || '').replace(/^@+/, '');
  const officialFollowers = followerString(user, settings);
  const existing = Array.isArray(theme?.social_profiles) ? theme.social_profiles : [];
  if (existing.length) {
    return existing.map((row) => {
      if ((row.platform || '').toLowerCase() !== 'tiktok') return row;
      return {
        ...row,
        handle: row.handle || officialHandle,
        followers: String(row.followers || '').replace(/[^\d]/g, '') || officialFollowers,
      };
    });
  }
  if (officialPlatform === 'tiktok' && officialHandle) {
    return [{
      platform: 'tiktok',
      handle: officialHandle,
      followers: officialFollowers,
    }];
  }
  return existing;
}

function draftToSettingsPatch(draft, currentUser) {
  const profiles = seedSocialProfiles(draft.socialProfiles || draft.social_profiles, draft);
  const primary = primarySocial(profiles);
  const profileFollowers = profiles
    .map((row) => Number(String(row.followers || '').replace(/[^\d]/g, '')) || 0)
    .filter(Boolean);
  const followers = profileFollowers.length
    ? Math.max(...profileFollowers)
    : Number(String(draft.followers || '').replace(/[^\d]/g, ''))
      || Number(currentUser?.social_follower_count || currentUser?.followers_count || currentUser?.followers || 0)
      || 0;
  const rates = ratesFromDraft(draft, followers);
  const social_handle = cleanSocialHandle(primary.handle || draft.handle);
  const social_platform = primary.platform || draft.socialPlatform || '';
  const social_profiles = profiles
    .filter((row) => cleanSocialHandle(row.handle))
    .map((row) => ({
      platform: row.platform,
      handle: cleanSocialHandle(row.handle),
      followers: String(row.followers || '').replace(/[^\d]/g, '').slice(0, 10),
      url: row.platform === 'tiktok'
        ? `https://tiktok.com/@${cleanSocialHandle(row.handle)}`
        : row.platform === 'youtube'
          ? `https://youtube.com/@${cleanSocialHandle(row.handle)}`
          : `https://instagram.com/${cleanSocialHandle(row.handle)}`,
    }));
  return {
    kit_layout: normalizeKitLayout(draft.layout),
    rates_reel: rates.reel || null,
    rates_tiktok: rates.tiktok || null,
    rates_photo: rates.photo || null,
    rates_gifted: rates.gifted,
    kit_theme: normalizeKitTheme({
      look: draft.look,
      font: draft.font,
      accent: draft.accent,
      cover_url: draft.cover_url,
      display_name: draft.name,
      headline: draft.headline,
      about: draft.about,
      location: draft.location,
      email: draft.email,
      social_platform,
      social_handle,
      social_profiles,
      examples: Array.isArray(draft.example_posts) && draft.example_posts.length
        ? draft.example_posts
        : draft.examples,
      example_posts: Array.isArray(draft.example_posts) && draft.example_posts.length
        ? draft.example_posts
        : draft.examples,
      brand_logos: draft.brand_logos,
      testimonials: draft.testimonials,
      services: draft.services,
    }),
  };
}

const PortfolioBuilder = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [kitSettings, setKitSettings] = useState(null);
  const [kitViews, setKitViews] = useState({ views_this_week: 0, recent: [] });
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [publishing, setPublishing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [shareModal, setShareModal] = useState(null);
  const [studioReady, setStudioReady] = useState(false);
  const saveTimer = useRef(null);
  const latestDraft = useRef(null);
  const saveChain = useRef(Promise.resolve());

  const isPro = subscriptionTier === 'pro' || subscriptionTier === 'elite';
  const kitTheme = normalizeKitTheme(kitSettings?.kit_theme);

  const fetchKitSettings = async () => {
    const res = await apiClient.get('/api/portfolio/settings');
    setKitSettings(res.data);
    return res.data;
  };

  const fetchKitViews = async () => {
    try {
      const [portfolioRes, crmRes] = await Promise.all([
        apiClient.get('/api/portfolio/views').catch(() => null),
        apiClient.get('/api/pr-crm/kit-views').catch(() => null),
      ]);
      const portfolio = portfolioRes?.data || {};
      const crm = crmRes?.data || {};
      setKitViews({
        ...portfolio,
        views_this_week: crm.views_this_week != null ? crm.views_this_week : (portfolio.views_this_week || 0),
        brands_this_week: crm.brands_this_week || 0,
        teaser_brand_name: crm.teaser_brand_name || null,
        views: crm.views || [],
        is_pro: crm.is_pro,
      });
    } catch (e) { /* silent */ }
  };

  useEffect(() => {
    (async () => {
      try {
        const [settingsRes, postsRes, subRes] = await Promise.all([
          apiClient.get('/api/portfolio/settings').catch(() => null),
          apiClient.get('/api/portfolio/posts').catch(() => null),
          apiClient.get('/api/subscription/status').catch(() => null),
        ]);
        setSubscriptionTier(subRes?.data?.tier || 'free');
        const loadedPosts = Array.isArray(postsRes?.data) ? postsRes.data : [];

        let settings = settingsRes?.data || {};
        const draft = readKitDraft();
        if (draft?.touched) {
          await apiClient.patch('/api/portfolio/settings', draftToSettingsPatch(draft, currentUser));
          const refreshed = await apiClient.get('/api/portfolio/settings');
          settings = refreshed.data || settings;
          clearKitDraft();
        }
        const theme = normalizeKitTheme(settings.kit_theme);
        const postUrls = loadedPosts.map((post) => post.post_url).filter(Boolean);
        if (!theme.examples.length && postUrls.length) {
          await apiClient.patch('/api/portfolio/settings', {
            kit_theme: { ...theme, examples: normalizeExamples(postUrls) },
          });
          const refreshed = await apiClient.get('/api/portfolio/settings');
          settings = refreshed.data || settings;
        }
        setKitSettings(settings);
        await fetchKitViews();
        setStudioReady(true);
      } catch (e) {
        setKitSettings({});
        setStudioReady(true);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const saveDraft = (draft) => {
    if (draft) latestDraft.current = draft;
    const run = async () => {
      const current = latestDraft.current;
      if (!current) return;
      await apiClient.patch('/api/portfolio/settings', draftToSettingsPatch(current, currentUser));
    };
    saveChain.current = saveChain.current.then(run, run).catch((e) => {
      message.error(e.response?.data?.error || 'Could not save kit');
    });
    return saveChain.current;
  };

  const persist = (draft) => {
    latestDraft.current = draft;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveDraft(draft), 450);
  };

  const flushSave = async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (latestDraft.current) await saveDraft(latestDraft.current);
  };

  const handlePublish = async () => {
    const draft = latestDraft.current || {};
    const blocked = studioPublishError({
      name: draft.name || kitTheme.display_name,
      handle: draft.handle || kitTheme.social_handle || currentUser?.username,
      socialPlatform: draft.socialPlatform || kitTheme.social_platform,
      socialProfiles: draft.socialProfiles || draft.social_profiles || kitTheme.social_profiles,
      email: draft.email || kitTheme.email,
      about: draft.about || kitTheme.about,
      examples: draft.examples || kitTheme.example_posts || kitTheme.examples,
    });
    if (blocked) {
      message.error(blocked);
      return;
    }
    setPublishing(true);
    try {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      const wasPublished = !!kitSettings?.kit_published;
      const patch = latestDraft.current
        ? { ...draftToSettingsPatch(latestDraft.current, currentUser), publish: true }
        : { publish: true };
      await apiClient.patch('/api/portfolio/settings', patch);
      const next = await fetchKitSettings();
      setShareModal({
        updated: wasPublished,
        slug: next?.kit_slug || next?.kitSlug || slug,
      });
    } catch (e) {
      message.error(e.response?.data?.error || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  const slug = kitSettings?.kit_slug || currentUser?.username || '';
  const kitPath = `/kit/${slug}`;
  const publicUrl = slug ? `${window.location.origin}${kitPath}` : '';
  const hasWork = !!(kitTheme.examples.length || kitTheme.display_name || kitSettings?.kit_published);

  const handleViewPortfolio = async () => {
    if (!slug) {
      message.info('Publish your portfolio first to get a public URL.');
      return;
    }
    if (!hasWork && !kitSettings?.kit_published) {
      message.info('Add a post or publish to view your live portfolio.');
      return;
    }
    await flushSave();
    window.open(kitSettings?.kit_published ? publicUrl : kitPath, '_blank', 'noopener,noreferrer');
  };

  const handleUploadLogo = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${getRuntimeApiUrl()}/api/portfolio/upload-thumbnail`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await response.json();
      if (!data.thumbnail_url) throw new Error(data.error || 'Upload failed');
      return data.thumbnail_url;
    } catch (e) {
      message.error('Could not upload logo');
      return '';
    }
  };

  const niche = (currentUser?.niches?.[0] || currentUser?.niche || 'beauty').toLowerCase();
  const followers = followerString(currentUser, kitSettings);
  const initial = useMemo(() => ({
    layout: normalizeKitLayout(kitSettings?.kit_layout),
    name: kitTheme.display_name && String(kitTheme.display_name).toLowerCase() !== 'your name'
      ? kitTheme.display_name
      : '',
    handle: kitTheme.social_handle
      ? `@${kitTheme.social_handle}`
      : (kitSettings?.social_handle
        ? `@${kitSettings.social_handle}`
        : (currentUser?.username ? `@${currentUser.username}` : '')),
    socialPlatform: kitTheme.social_platform || kitSettings?.social_platform || 'instagram',
    socialProfiles: seedKitSocialProfiles(kitTheme, kitSettings, currentUser),
    niche: ['beauty', 'skincare', 'fashion', 'fitness', 'wellness', 'food', 'lifestyle'].includes(niche) ? niche : 'lifestyle',
    followers: followers || '',
    email: kitTheme.email || '',
    headline: kitTheme.headline || kitSettings?.kit_tagline || 'Honest product-in-real-life content.',
    about: kitTheme.about || kitSettings?.bio || '',
    location: kitTheme.location || '',
    offerId: matchOfferId(kitSettings || {}, Number(followers || 0)),
    customRates: {
      reel: kitSettings?.rates_reel || '',
      tiktok: kitSettings?.rates_tiktok || '',
      photo: kitSettings?.rates_photo || '',
      gifted: kitSettings?.rates_gifted !== false,
    },
    look: kitTheme.look,
    font: kitTheme.font,
    accent: kitTheme.accent,
    cover_url: resolveCoverUrl(kitTheme.cover_url || COVER_SAMPLES[0].url),
    examples: (Array.isArray(kitTheme.example_posts) && kitTheme.example_posts.length)
      ? kitTheme.example_posts
      : kitTheme.examples,
    example_posts: (Array.isArray(kitTheme.example_posts) && kitTheme.example_posts.length)
      ? kitTheme.example_posts
      : kitTheme.examples,
    brand_logos: kitTheme.brand_logos,
    testimonials: kitTheme.testimonials,
    services: kitTheme.services,
  }), [kitSettings, kitTheme, currentUser, niche, followers]);

  const extras = {
    username: slug || currentUser?.username || 'you',
    displayName: kitTheme.display_name && String(kitTheme.display_name).toLowerCase() !== 'your name'
      ? kitTheme.display_name
      : (slug || currentUser?.username || ''),
    niches: Array.isArray(currentUser?.niches) && currentUser.niches.length
      ? currentUser.niches
      : [initial.niche],
    avatarUrl: kitSettings?.avatar_url || currentUser?.image_profile || currentUser?.avatar_url || currentUser?.profile_photo_url || '',
    posts: [],
    tiktokVideos: Array.isArray(kitSettings?.tiktok_videos) ? kitSettings.tiktok_videos : [],
    officialFollowers: Number(kitSettings?.social_follower_count || kitSettings?.follower_count || currentUser?.followers_count || 0) || 0,
    officialHandle: kitSettings?.social_handle || currentUser?.social_handle || '',
    officialPlatform: kitSettings?.social_platform || currentUser?.social_platform || '',
    likesCount: Number(kitSettings?.likes_count || currentUser?.total_likes || 0) || 0,
    videoCount: Number(kitSettings?.video_count || currentUser?.social_media_count || currentUser?.total_posts || 0) || 0,
    avgViews: Number(kitSettings?.avg_views || 0) || (() => {
      const views = (Array.isArray(kitSettings?.tiktok_videos) ? kitSettings.tiktok_videos : [])
        .map((row) => Number(row?.views || 0))
        .filter((n) => n > 0);
      return views.length ? Math.round(views.reduce((a, b) => a + b, 0) / views.length) : 0;
    })(),
    bio: kitSettings?.bio || '',
    engagementRate: Number(kitSettings?.engagement_rate || currentUser?.engagement_rate || 0) || undefined,
    followerCount: Number(followers || 0) || undefined,
  };

  if (loading || !studioReady || !kitSettings) {
    return <KitLoading label="Loading portfolio" />;
  }

  return (
    <Page>
      <DashHeader>
        <div>
          <DashTitle>My Kit</DashTitle>
          {kitSettings.kit_published && slug ? (
            <DashUrl>newcollab.co/kit/{slug}</DashUrl>
          ) : (
            <DashUrl>Free portfolio · publish when you’re ready</DashUrl>
          )}
        </div>
        <DashActions>
          <GhostBtn type="button" onClick={handleViewPortfolio}>View portfolio</GhostBtn>
          <PublishBtn type="button" onClick={handlePublish} disabled={publishing}>
            {publishing
              ? (kitSettings.kit_published ? 'Updating…' : 'Publishing…')
              : 'Publish this portfolio'}
          </PublishBtn>
        </DashActions>
      </DashHeader>

      <KitStudioEditor
        embedded
        initial={initial}
        extras={extras}
        persist={persist}
        onUploadLogo={handleUploadLogo}
        onSave={flushSave}
        busy={publishing}
        busyLabel={kitSettings.kit_published ? 'Updating portfolio' : 'Publishing portfolio'}
        formTop={(
          <>
            {isPro && (kitViews.views_this_week > 0 || kitViews.portfolio_clicks > 0) && (
              <StatsCard>
                <StatsNum>{kitViews.views_this_week || 0}</StatsNum>
                <StatsLabel>kit views this week</StatsLabel>
              </StatsCard>
            )}
            {!isPro && (
              <ViewsTeaserCard type="button" onClick={() => setShowUpgradeModal(true)}>
                <ViewsTeaserLeft>
                  <FaEye size={18} style={{ color: '#9CA3AF' }} />
                  <ViewsTeaserText>
                    <ViewsTeaserTitle>
                      {kitViews.teaser_brand_name
                        ? `${kitViews.teaser_brand_name} reviewed your application`
                        : 'See which brands viewed your portfolio'}
                    </ViewsTeaserTitle>
                    <ViewsTeaserSub>
                      {kitViews.teaser_brand_name
                        ? (kitViews.brands_this_week > 1
                          ? `${kitViews.brands_this_week - 1} more brand${kitViews.brands_this_week - 1 === 1 ? '' : 's'} this week. Pro shows every view.`
                          : 'Pro shows every brand that opens your kit.')
                        : 'Brand view tracking is the Pro add-on. Building and publishing your portfolio is free.'}
                    </ViewsTeaserSub>
                  </ViewsTeaserText>
                </ViewsTeaserLeft>
                <ProBadge><FaLock size={10} /> Pro</ProBadge>
              </ViewsTeaserCard>
            )}
          </>
        )}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="kit_views"
      />
      <PortfolioLiveModal
        open={!!shareModal}
        slug={shareModal?.slug || slug}
        updated={!!shareModal?.updated}
        onClose={() => setShareModal(null)}
        onView={() => {
          setShareModal(null);
          handleViewPortfolio();
        }}
      />
    </Page>
  );
};

export default PortfolioBuilder;

const Page = styled.div`
  font-family: ${STUDIO_FONT};
  color: #0f172a;
  max-width: 1180px;
  margin: 0 auto;
  min-width: 0;
  padding: 0 16px 24px;
  @media (max-width: 840px) {
    padding: 0 12px 24px;
  }
`;
const DashHeader = styled.div`
  padding: 8px 0 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  min-width: 0;
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;
const DashTitle = styled.h1`
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -.03em;
  margin: 0;
`;
const DashUrl = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
`;
const DashActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
  @media (max-width: 640px) {
    width: 100%;
    button { flex: 1; }
  }
`;
const GhostBtn = styled.button`
  min-height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #0f172a;
  font: 700 13px/1 ${STUDIO_FONT};
  cursor: pointer;
`;
const PublishBtn = styled.button`
  min-height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  border: 0;
  background: #0f172a;
  color: #fff;
  font: 700 13px/1 ${STUDIO_FONT};
  cursor: pointer;
  opacity: ${p => p.disabled ? .6 : 1};
`;
const StatsCard = styled.div`
  margin-bottom: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 16px;
`;
const StatsNum = styled.div`
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
`;
const StatsLabel = styled.div`
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
`;
const ViewsTeaserCard = styled.button`
  width: 100%;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #F9FAFB, #F3F4F6);
  border-radius: 16px;
  padding: 16px;
  border: 1.5px dashed #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  text-align: left;
  font: inherit;
  &:hover {
    border-color: #7C3AED;
    background: linear-gradient(135deg, #F5F3FF, #EDE9FE);
  }
`;
const ViewsTeaserLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;
const ViewsTeaserText = styled.div`
  min-width: 0;
`;
const ViewsTeaserTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #374151;
`;
const ViewsTeaserSub = styled.div`
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 2px;
`;
const ProBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #7C3AED, #EC4899);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  flex-shrink: 0;
`;
