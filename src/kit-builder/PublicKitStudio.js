'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import KitStudioEditor, { STUDIO_FONT, buildStudioKit, cleanSocialHandle, primarySocial, seedSocialProfiles, studioPublishError } from './KitStudioEditor';
import { RATE_OFFERS } from './pricingOffers';
import { COVER_SAMPLES, normalizeKitTheme } from './themes';
import { normalizeKitLayout } from './templates';
import { readKitDraft, writeKitDraft } from './draft';
import { getRuntimeApiUrl } from '../config/api';
import PortfolioLiveModal from './PortfolioLiveModal';

const EDIT_TOKEN_KEY = 'newcollab_free_portfolio_token';

function publicKitUrl(slug) {
  if (typeof window === 'undefined') return `https://newcollab.co/kit/${slug}`;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return `${window.location.origin}/kit/${slug}`;
  return `https://newcollab.co/kit/${slug}`;
}

export default function PublicKitStudio() {
  const saved = useMemo(() => normalizeKitTheme(readKitDraft() || {}), []);
  const draft0 = useMemo(() => readKitDraft() || {}, []);
  const loggedIn = typeof window !== 'undefined' && !!localStorage.getItem('token');
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [live, setLive] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shareModal, setShareModal] = useState(null);
  const [tiktokVideos, setTiktokVideos] = useState([]);
  const [official, setOfficial] = useState({
    followers: '',
    handle: '',
    platform: '',
    likes: 0,
    engagementRate: 0,
  });

  const initial = {
    layout: normalizeKitLayout(draft0.layout),
    name: draft0.name || saved.display_name || '',
    handle: draft0.handle || saved.social_handle || official.handle || '',
    socialPlatform: draft0.socialPlatform || saved.social_platform || official.platform || 'instagram',
    socialProfiles: draft0.socialProfiles || draft0.social_profiles || saved.social_profiles,
    niche: draft0.niche || 'beauty',
    followers: draft0.followers || official.followers || '',
    email: draft0.email || saved.email || '',
    headline: draft0.headline || saved.headline || 'Honest product-in-real-life content.',
    about: draft0.about || saved.about || 'I make UGC that looks like a friend recommended the product — not an ad. Talking-to-camera, real usage, and stills brands can post the same week. First briefs in 5–7 days.',
    location: draft0.location || saved.location || 'London',
    offerId: draft0.offerId || RATE_OFFERS[0].id,
    customRates: draft0.customRates,
    look: draft0.look || saved.look,
    font: draft0.font || saved.font,
    accent: draft0.accent || saved.accent || '',
    cover_url: draft0.cover_url || saved.cover_url || COVER_SAMPLES[0].url,
    examples: draft0.example_posts || draft0.examples || saved.example_posts || saved.examples,
    example_posts: draft0.example_posts || saved.example_posts,
    brand_logos: draft0.brand_logos || saved.brand_logos,
    testimonials: draft0.testimonials || saved.testimonials,
    services: draft0.services || saved.services,
  };
  const draftRef = useRef(initial);

  useEffect(() => {
    if (!loggedIn) return undefined;
    let cancelled = false;
    const base = getRuntimeApiUrl() || '';
    fetch(`${base}/api/portfolio/settings`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setTiktokVideos(Array.isArray(data.tiktok_videos) ? data.tiktok_videos : []);
        setOfficial({
          followers: data.social_follower_count || data.follower_count ? String(data.social_follower_count || data.follower_count) : '',
          handle: data.social_handle || '',
          platform: data.social_platform || '',
          likes: Number(data.likes_count || 0) || 0,
          videos: Number(data.video_count || 0) || 0,
          avgViews: Number(data.avg_views || 0) || 0,
          displayName: data.display_name || '',
          bio: data.bio || '',
          engagementRate: Number(data.engagement_rate || 0) || 0,
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [loggedIn]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const next = 'Free UGC portfolio builder | Publish a UGC portfolio | newcollab';
    if (document.title === next) return undefined;
    const prev = document.title;
    document.title = next;
    return () => { document.title = prev; };
  }, []);

  const persist = (next) => {
    draftRef.current = next;
    writeKitDraft(next);
  };

  const publish = async () => {
    const draft = { ...initial, ...draftRef.current };
    const kit = buildStudioKit({
      layout: draft.layout,
      name: draft.name,
      handle: draft.handle,
      socialPlatform: draft.socialPlatform,
      socialProfiles: draft.socialProfiles || draft.social_profiles,
      niche: draft.niche,
      followers: draft.followers,
      email: draft.email,
      headline: draft.headline,
      about: draft.about,
      location: draft.location,
      offerId: draft.offerId,
      customRates: draft.customRates,
      look: draft.look,
      font: draft.font,
      accent: draft.accent,
      coverUrl: draft.cover_url,
      examples: draft.example_posts || draft.examples,
      brandLogos: draft.brand_logos,
      testimonials: draft.testimonials,
      formatIds: draft.formatIds,
    });
    const blocked = studioPublishError({ ...draft, socialProfiles: draft.socialProfiles || draft.social_profiles });
    if (blocked) {
      setError(blocked);
      return;
    }
    const primary = primarySocial(seedSocialProfiles(draft.socialProfiles || draft.social_profiles, draft));
    setPublishing(true);
    setError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem(EDIT_TOKEN_KEY) : '';
      const base = getRuntimeApiUrl() || '';
      const res = await fetch(`${base}/api/portfolio/free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edit_token: token || undefined,
          handle: cleanSocialHandle(primary.handle || draft.handle),
          social_platform: primary.platform || draft.socialPlatform,
          name: draft.name,
          email: draft.email,
          niche: draft.niche,
          followers: kit.follower_count || draft.followers || '',
          layout: kit.kit_layout,
          kit_theme: kit.kit_theme,
          rates_reel: kit.rates_reel,
          rates_tiktok: kit.rates_tiktok,
          rates_photo: kit.rates_photo,
          rates_gifted: kit.rates_gifted,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'email_in_use' && data.slug) {
          throw new Error(`This email already has a live portfolio at newcollab.co/kit/${data.slug}. Update it from the browser that published it.`);
        }
        throw new Error(data.error || 'Could not publish');
      }
      if (data.edit_token) localStorage.setItem(EDIT_TOKEN_KEY, data.edit_token);
      const alreadyLive = !!live;
      setLive({ slug: data.slug, url: publicKitUrl(data.slug), edit_token: data.edit_token });
      setShareModal({ updated: alreadyLive, slug: data.slug });
    } catch (e) {
      setError(e.message || 'Could not publish this portfolio');
    } finally {
      setPublishing(false);
    }
  };

    const copyUrl = async () => {
    if (!live || !live.url) return;
    try {
      await navigator.clipboard.writeText(live.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Page>
      <Hero>
        <Eyebrow>Free UGC portfolio builder</Eyebrow>
        <h1>Free UGC portfolio for creators. Publish in minutes.</h1>
        <p>
          Build a public UGC portfolio brands can open — rates, posts, and packages — without Canva and without an account.
          Your free portfolio lives at <strong>newcollab.co/kit/you</strong>. Paste that link in your Instagram bio and TikTok description so we can track when a brand opens it.
        </p>
      </Hero>
      <KitStudioEditor
        initial={initial}
        persist={persist}
        extras={{
          tiktokVideos,
          officialFollowers: official.followers,
          officialHandle: official.handle,
          officialPlatform: official.platform,
          likesCount: official.likes,
          videoCount: official.videos,
          avgViews: official.avgViews,
          displayName: official.displayName,
          bio: official.bio,
          engagementRate: official.engagementRate,
          followerCount: Number(String(official.followers || '').replace(/[^\d]/g, '')) || undefined,
        }}
        busy={publishing}
        busyLabel={live ? 'Updating portfolio' : 'Publishing portfolio'}
        footer={(
          <>
            {live ? (
              <LiveCard>
                <LiveKicker>Your free UGC portfolio is live</LiveKicker>
                <LiveUrl>{live.url.replace(/^https?:\/\//, '')}</LiveUrl>
                <p>
                  Paste this link in your Instagram bio and TikTok profile description. When a brand taps it, we record the view on this portfolio.
                </p>
                <LiveActions>
                  <PublishBtn type="button" onClick={copyUrl}>{copied ? 'Copied' : 'Copy portfolio link'}</PublishBtn>
                  <GhostLink href={live.url} target="_blank" rel="noopener noreferrer">View portfolio</GhostLink>
                  <GhostBtn type="button" onClick={publish} disabled={publishing}>
                    {publishing ? 'Updating…' : 'Update live portfolio'}
                  </GhostBtn>
                </LiveActions>
                {error ? <Err>{error}</Err> : null}
              </LiveCard>
            ) : (
              <>
                {error ? <Err>{error}</Err> : null}
                <PublishBtn type="button" onClick={publish} disabled={publishing}>
                  {publishing ? 'Publishing…' : 'Publish this UGC portfolio free'}
                </PublishBtn>
                <Sub>
                  No account needed. {loggedIn ? <a href="/creator/dashboard/my-kit">Open My Kit to edit your signed-in portfolio</a> : 'Keep the link in your bio so brands can find you.'}
                </Sub>
              </>
            )}
          </>
        )}
      />
      <PortfolioLiveModal
        open={!!shareModal}
        slug={shareModal && shareModal.slug ? shareModal.slug : (live && live.slug)}
        updated={!!(shareModal && shareModal.updated)}
        onClose={() => setShareModal(null)}
        onView={() => {
          const href = (live && live.url) || (shareModal && shareModal.slug ? publicKitUrl(shareModal.slug) : '');
          setShareModal(null);
          if (href) window.open(href, '_blank', 'noopener,noreferrer');
        }}
      />
    </Page>
  );
}

const Page = styled.div`
  font-family: ${STUDIO_FONT};
  background: #f8fafc;
  color: #0f172a;
  min-height: 100vh;
  overflow-x: hidden;
`;
const Hero = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 128px 24px 12px;
  h1 { font-size: clamp(28px, 5vw, 40px); letter-spacing: -.03em; margin: 8px 0 12px; line-height: 1.12; }
  p { color: #475569; font-size: 16px; max-width: 720px; line-height: 1.6; margin: 0; }
  @media (max-width: 768px) { padding: 108px 16px 8px; }
`;
const Eyebrow = styled.div`
  font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #4f46e5;
`;
const PublishBtn = styled.button`
  display: block; margin-top: 24px; text-align: center; background: #0f172a; color: #fff;
  text-decoration: none; border-radius: 12px; padding: 14px 16px; font-weight: 700;
  min-height: 48px; box-sizing: border-box; border: 0; width: 100%; cursor: pointer;
  font-family: inherit; font-size: 15px;
  &:disabled { opacity: .6; cursor: wait; }
`;
const GhostBtn = styled.button`
  display: block; margin-top: 10px; text-align: center;
  border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px;
  color: #0f172a; text-decoration: none; font-weight: 700; min-height: 44px; box-sizing: border-box;
  width: 100%; background: #fff; cursor: pointer; font-family: inherit; font-size: 15px;
  &:disabled { opacity: .6; cursor: wait; }
`;
const GhostLink = styled.a`
  display: block; margin-top: 10px; text-align: center;
  border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px;
  color: #0f172a; text-decoration: none; font-weight: 700; min-height: 44px; box-sizing: border-box;
  width: 100%; background: #fff; cursor: pointer; font-family: inherit; font-size: 15px;
`;
const Sub = styled.p`
  font-size: 13px; color: #64748b; text-align: center; margin: 12px 0 0;
  a { color: #0f172a; font-weight: 600; }
`;
const Err = styled.p`
  margin: 16px 0 0; color: #b91c1c; font-size: 13px; font-weight: 600;
`;
const LiveCard = styled.div`
  margin-top: 24px; padding: 16px; border-radius: 14px; background: #eef2ff; border: 1px solid #c7d2fe;
  p { margin: 8px 0 0; font-size: 14px; color: #334155; line-height: 1.5; }
`;
const LiveKicker = styled.div`
  font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #4f46e5;
`;
const LiveUrl = styled.div`
  margin-top: 6px; font-size: 16px; font-weight: 800; word-break: break-all;
`;
const LiveActions = styled.div``;
