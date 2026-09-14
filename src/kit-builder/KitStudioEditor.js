'use client';

import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import PublicKitView from '../components/PublicKitView';
import { KIT_LAYOUTS, normalizeKitLayout } from './templates';
import { RATE_OFFERS, formatRate, ratesFromDraft, suggestRates } from './pricingOffers';
import {
  ACCENTS, BRAND_LOGO_SLOTS, COVER_SAMPLES, EXAMPLE_SLOTS, FONT_PAIRS, LOOKS, TESTIMONIAL_SLOTS,
  normalizeBrandLogos, normalizeExamplePosts, normalizeKitTheme, normalizeTestimonials, useKitFonts,
} from './themes';
import { CONTENT_FORMATS, DEFAULT_FORMAT_IDS, formatIdsFromServices, servicesFromFormatIds } from './contentFormats';
import { NICHE_OPTIONS } from '../constants/brandCategories';
import { FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';

export const STUDIO_FONT = "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";

export const STUDIO_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_ABOUT_CHARS = 150;
export const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#E4405F', Icon: FaInstagram },
  { id: 'tiktok', label: 'TikTok', color: '#111827', Icon: FaTiktok },
  { id: 'youtube', label: 'YouTube', color: '#FF0000', Icon: FaYoutube },
];

export function cleanSocialHandle(raw) {
  return String(raw || '').trim().replace(/^@+/, '').replace(/[^a-zA-Z0-9._]/g, '').slice(0, 40);
}

export function socialProfileUrl(platform, handle) {
  const h = cleanSocialHandle(handle);
  if (!h) return '';
  if (platform === 'tiktok') return `https://tiktok.com/@${h}`;
  if (platform === 'youtube') return `https://youtube.com/@${h}`;
  if (platform === 'instagram') return `https://instagram.com/${h}`;
  return '';
}

export function seedSocialProfiles(list, fallback = {}) {
  const rows = (Array.isArray(list) ? list : []).map((item) => ({
    platform: SOCIAL_PLATFORMS.some((p) => p.id === (item && item.platform)) ? item.platform : 'instagram',
    handle: (item && item.handle) || '',
    followers: item && item.followers != null ? String(item.followers) : '',
  }));
  while (rows.length > 1 && !cleanSocialHandle(rows[rows.length - 1].handle) && !rows[rows.length - 1].followers) {
    rows.pop();
  }
  if (!rows.length) {
    rows.push({
      platform: fallback.socialPlatform || fallback.social_platform || 'instagram',
      handle: fallback.handle || fallback.social_handle || '',
      followers: fallback.followers != null ? String(fallback.followers) : '',
    });
  } else if (rows.length === 1 && !rows[0].followers && fallback.followers) {
    rows[0] = { ...rows[0], followers: String(fallback.followers) };
  }
  return rows.slice(0, SOCIAL_PLATFORMS.length);
}

export function primarySocial(profiles = []) {
  return (profiles || []).find((row) => cleanSocialHandle(row.handle)) || profiles[0] || {};
}

export function postUrlKey(url) {
  const raw = String(url || '').trim().toLowerCase().replace(/\/+$/, '').split('?')[0];
  const tiktok = raw.match(/\/video\/(\d+)/);
  if (tiktok) return `tt:${tiktok[1]}`;
  const ig = raw.match(/\/(?:p|reel|reels|tv)\/([^/]+)/);
  if (ig) return `ig:${ig[1]}`;
  const shorts = raw.match(/\/shorts\/([^/]+)/);
  if (shorts) return `yt:${shorts[1]}`;
  return raw;
}

function formatStat(n) {
  const v = Number(n) || 0;
  if (v >= 1000000) return `${(v / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(v);
}

export function studioPublishError({ name, handle, socialPlatform, socialProfiles, email, about, examples } = {}) {
  if (!String(name || '').trim()) return 'Add the name that should appear on this UGC portfolio.';
  const filled = (socialProfiles || []).filter((row) => (
    SOCIAL_PLATFORMS.some((item) => item.id === row.platform) && cleanSocialHandle(row.handle)
  ));
  const legacyOk = SOCIAL_PLATFORMS.some((item) => item.id === socialPlatform) && cleanSocialHandle(handle);
  if (!filled.length && !legacyOk) {
    return 'Add your Instagram, TikTok, or YouTube handle so brands can find you.';
  }
  if (!STUDIO_EMAIL_RE.test(String(email || '').trim())) return 'Add an email so brands can reach you from this portfolio.';
  if (String(about || '').trim().length < MIN_ABOUT_CHARS) {
    return `About you needs at least ${MIN_ABOUT_CHARS} characters — who you are, who you shoot for, and how you work.`;
  }
  if (!normalizeExamplePosts(examples).length) return 'Add at least one Instagram, TikTok, or YouTube post.';
  return '';
}

export function seedExamplePosts(list) {
  const next = (list || []).map((item) => {
    if (typeof item === 'string') return { url: item, title: '', description: '' };
    return {
      url: (item && item.url) || '',
      title: (item && item.title) || '',
      description: (item && item.description) || (item && item.body) || '',
    };
  });
  while (next.length > 1 && !next[next.length - 1].url && !next[next.length - 1].title && !next[next.length - 1].description) {
    next.pop();
  }
  return next.length ? next.slice(0, EXAMPLE_SLOTS) : [{ url: '', title: '', description: '' }];
}

export function seedExamples(list) {
  return seedExamplePosts(list);
}

export function studioPersonName(name, fallback = '') {
  const typed = String(name || '').trim();
  if (typed && typed.toLowerCase() !== 'your name') return typed;
  return String(fallback || '').trim();
}

export function seedLogos(list) {
  const next = (list || []).map((row) => ({
    name: row && row.name ? row.name : '',
    logo_url: row && row.logo_url ? row.logo_url : '',
  }));
  while (next.length > 1 && !next[next.length - 1].name && !next[next.length - 1].logo_url) next.pop();
  return next.length ? next.slice(0, BRAND_LOGO_SLOTS) : [{ name: '', logo_url: '' }];
}

export function seedTestimonials(list) {
  const next = (Array.isArray(list) ? list : []).map((row) => ({
    quote: row && row.quote ? row.quote : (row && row.text ? row.text : ''),
    name: row && row.name ? row.name : '',
    role: row && row.role ? row.role : (row && row.brand ? row.brand : ''),
  }));
  while (
    next.length > 1
    && !String(next[next.length - 1].quote || '').trim()
    && !String(next[next.length - 1].name || '').trim()
    && !String(next[next.length - 1].role || '').trim()
  ) {
    next.pop();
  }
  return next.length
    ? next.slice(0, TESTIMONIAL_SLOTS)
    : [{ quote: '', name: '', role: '' }];
}

export function buildStudioKit({
  layout, name, handle, socialPlatform, socialProfiles, niche, followers, email, headline, about, location,
  offerId, customRates, look, font, accent, coverUrl, examples, brandLogos, testimonials, formatIds, extras = {},
}) {
  const profiles = seedSocialProfiles(socialProfiles, { handle, socialPlatform, followers });
  const primary = primarySocial(profiles);
  const socialHandle = cleanSocialHandle(primary.handle);
  const platform = SOCIAL_PLATFORMS.some((item) => item.id === primary.platform) ? primary.platform : '';
  const profileFollowers = profiles
    .map((row) => Number(String(row.followers || '').replace(/[^\d]/g, '')) || 0)
    .filter(Boolean);
  // Avoid `?.` + `??` together — Next 16.1.3 SWC emits undeclared `_ref` in prod.
  const followerCount = extras.followerCount != null
    ? extras.followerCount
    : (profileFollowers.length ? Math.max(...profileFollowers) : (Number(String(followers || '').replace(/[^\d]/g, '')) || 0));
  const rates = ratesFromDraft({ offerId, customRates }, followerCount);
  const slug = String(socialHandle || name || extras.username || 'you')
    .replace(/^@/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '') || 'you';
  const services = servicesFromFormatIds((formatIds && formatIds.length) ? formatIds : DEFAULT_FORMAT_IDS);
  const themeProfiles = profiles
    .filter((row) => cleanSocialHandle(row.handle))
    .map((row) => ({
      platform: row.platform,
      handle: cleanSocialHandle(row.handle),
      followers: String(row.followers || '').replace(/[^\d]/g, '').slice(0, 10),
      url: socialProfileUrl(row.platform, row.handle),
    }));
  const displayName = studioPersonName(name, extras.displayName);
  const theme = normalizeKitTheme({
    look, font, accent, cover_url: coverUrl, display_name: displayName, headline, about, location, email,
    social_platform: platform,
    social_handle: socialHandle,
    social_profiles: themeProfiles,
    examples,
    example_posts: examples,
    brand_logos: normalizeBrandLogos(brandLogos),
    testimonials: normalizeTestimonials(testimonials),
    services,
  });
  const socials = {};
  themeProfiles.forEach((row) => { if (row.url) socials[row.platform] = row.url; });
  const extraRates = extras.rates || {};
  return {
    username: extras.username || slug,
    first_name: displayName || 'Your name',
    display_name: displayName || 'Your name',
    tagline: headline,
    bio: about,
    niches: extras.niches || [niche],
    follower_count: extras.followerCount != null ? extras.followerCount : followerCount,
    email: theme.email,
    social_handle: socialHandle,
    social_platform: platform,
    social_profiles: themeProfiles.map((row) => ({
      ...row,
      handle: row.handle ? `@${row.handle}` : '',
    })),
    socials,
    likes_count: extras.likesCount || 0,
    video_count: extras.videoCount || 0,
    avg_views: extras.avgViews || 0,
    engagement_rate: extras.engagementRate != null ? extras.engagementRate : 4.2,
    rates_reel: extraRates.reel != null ? extraRates.reel : rates.reel,
    rates_tiktok: extraRates.tiktok != null ? extraRates.tiktok : rates.tiktok,
    rates_photo: extraRates.photo != null ? extraRates.photo : rates.photo,
    rates_gifted: extraRates.gifted != null ? extraRates.gifted : rates.gifted,
    kit_layout: layout,
    kit_theme: theme,
    avatar_url: extras.avatarUrl || '',
    posts: extras.posts || [],
  };
}

export default function KitStudioEditor({
  initial = {},
  persist: persistDraft,
  extras = {},
  footer,
  formTop,
  embedded = false,
  onUploadLogo,
  busy = false,
  busyLabel = 'Publishing portfolio',
}) {
  const [pane, setPane] = useState('edit');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [layout, setLayout] = useState(normalizeKitLayout(initial.layout));
  const [name, setName] = useState(initial.name || '');
  const [socialProfiles, setSocialProfiles] = useState(seedSocialProfiles(
    initial.socialProfiles || initial.social_profiles,
    initial,
  ));
  const [niche, setNiche] = useState(initial.niche || 'beauty');
  const [email, setEmail] = useState(initial.email || '');
  const [headline, setHeadline] = useState(initial.headline || 'Honest product-in-real-life content.');
  const [about, setAbout] = useState(initial.about || 'I make UGC that looks like a friend recommended the product — not an ad. Talking-to-camera, real usage, and stills brands can post the same week. First briefs in 5–7 days.');
  const [location, setLocation] = useState(initial.location || 'London');
  const [offerId, setOfferId] = useState(initial.offerId || 'gifted');
  const [customRates, setCustomRates] = useState(initial.customRates || {
    reel: initial.customReel || '',
    tiktok: initial.customTiktok || '',
    photo: initial.customPhoto || '',
    gifted: initial.gifted !== false,
  });
  const [formatIds, setFormatIds] = useState(formatIdsFromServices(initial.services) || DEFAULT_FORMAT_IDS);
  const [look, setLook] = useState(initial.look || 'ivory');
  const [font, setFont] = useState(initial.font || 'playfair');
  const [accent, setAccent] = useState(initial.accent || '');
  const [coverUrl, setCoverUrl] = useState(initial.cover_url || COVER_SAMPLES[0].url);
  const [examples, setExamples] = useState(seedExamplePosts(
    (Array.isArray(initial.example_posts) && initial.example_posts.length)
      ? initial.example_posts
      : initial.examples
  ));
  const [brandLogos, setBrandLogos] = useState(seedLogos(initial.brand_logos));
  const [testimonials, setTestimonials] = useState(seedTestimonials(initial.testimonials));
  const [uploadingAt, setUploadingAt] = useState(-1);

  useKitFonts(font);

  const kit = buildStudioKit({
    layout, name, socialProfiles, niche, email, headline, about, location,
    offerId, customRates, look, font, accent, coverUrl, examples, brandLogos, testimonials, formatIds, extras,
  });
  const followerCount = kit.follower_count || 0;
  const suggested = suggestRates(followerCount);
  const appliedPreview = ratesFromDraft({ offerId, customRates }, followerCount);
  const slug = kit.username;

  const draftRef = useRef({});
  const primary = primarySocial(socialProfiles);
  draftRef.current = {
    layout, name, socialProfiles, social_profiles: socialProfiles,
    handle: primary.handle || '',
    socialPlatform: primary.platform || 'instagram',
    followers: primary.followers || '',
    niche, email, headline, about, location, offerId, customRates, look, font, accent, cover_url: coverUrl,
    examples,
    example_posts: examples,
    brand_logos: brandLogos,
    testimonials,
    services: servicesFromFormatIds(formatIds),
    formatIds,
  };

  const persist = (patch) => {
    const next = { ...draftRef.current, ...patch, touched: true };
    draftRef.current = next;
    persistDraft && persistDraft(next);
  };

  const setExampleAt = (index, patch) => {
    const next = examples.map((row, i) => (i === index ? { ...row, ...patch } : row));
    setExamples(next);
    persist({ examples: next, example_posts: next });
  };

  const persistSocial = (next) => {
    const primary = primarySocial(next);
    persist({
      socialProfiles: next,
      social_profiles: next,
      handle: primary.handle || '',
      socialPlatform: primary.platform || 'instagram',
      followers: primary.followers || '',
    });
  };

  const setSocialAt = (index, patch) => {
    const next = socialProfiles.map((row, i) => (i === index ? { ...row, ...patch } : row));
    setSocialProfiles(next);
    persistSocial(next);
  };

  const addSocial = () => {
    const used = new Set(socialProfiles.map((row) => row.platform));
    const nextPlatform = SOCIAL_PLATFORMS.find((item) => !used.has(item.id));
    if (!nextPlatform) return;
    const next = [...socialProfiles, { platform: nextPlatform.id, handle: '', followers: '' }];
    setSocialProfiles(next);
    persistSocial(next);
  };

  const removeSocial = (index) => {
    if (socialProfiles.length <= 1) return;
    const next = socialProfiles.filter((_, i) => i !== index);
    setSocialProfiles(next);
    persistSocial(next);
  };

  const setLogoAt = (index, patch) => {
    const next = brandLogos.map((row, i) => (i === index ? { ...row, ...patch } : row));
    setBrandLogos(next);
    persist({ brand_logos: next });
  };

  const addExample = () => {
    if (examples.length >= EXAMPLE_SLOTS) return;
    const next = [...examples, { url: '', title: '', description: '' }];
    setExamples(next);
    persist({ examples: next, example_posts: next });
  };

  const tiktokVideos = Array.isArray(extras.tiktokVideos) ? extras.tiktokVideos.filter((row) => row && row.url) : [];
  const officialFollowers = String(extras.officialFollowers || '').replace(/[^\d]/g, '');
  const officialHandle = cleanSocialHandle(extras.officialHandle);
  const officialPlatform = String(extras.officialPlatform || '').toLowerCase();
  const officialLikes = Number(extras.likesCount || 0) || 0;

  useEffect(() => {
    if (studioPersonName(name) || !extras.displayName) return;
    setName(extras.displayName);
    persist({ name: extras.displayName });
  }, [extras.displayName]);

  useEffect(() => {
    if (officialPlatform !== 'tiktok' || (!officialFollowers && !officialHandle)) return;
    setSocialProfiles((prev) => {
      const rows = Array.isArray(prev) && prev.length ? prev : [{ platform: 'tiktok', handle: '', followers: '' }];
      let changed = false;
      const next = rows.map((row) => {
        if (row.platform !== 'tiktok') return row;
        const patch = { ...row };
        if (!cleanSocialHandle(patch.handle) && officialHandle) {
          patch.handle = officialHandle;
          changed = true;
        }
        if (!String(patch.followers || '').replace(/[^\d]/g, '') && officialFollowers) {
          patch.followers = officialFollowers;
          changed = true;
        }
        return patch;
      });
      if (!next.some((row) => row.platform === 'tiktok') && officialHandle) {
        changed = true;
        next.unshift({ platform: 'tiktok', handle: officialHandle, followers: officialFollowers || '' });
      }
      return changed ? next : prev;
    });
  }, [officialFollowers, officialHandle, officialPlatform]);

  const selectedPostKeys = new Set(
    examples.map((row) => postUrlKey(row.url)).filter(Boolean)
  );
  const selectedTikTokCount = tiktokVideos.filter((video) => selectedPostKeys.has(postUrlKey(video.url))).length;
  const selectedTikTokPreview = tiktokVideos.filter((video) => selectedPostKeys.has(postUrlKey(video.url))).slice(0, 4);

  useEffect(() => {
    if (!pickerOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setPickerOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [pickerOpen]);

  const toggleTikTokVideo = (video) => {
    const key = postUrlKey(video.url);
    if (!key) return;
    const selectedIdx = examples.findIndex((row) => postUrlKey(row.url) === key);
    let next;
    if (selectedIdx >= 0) {
      next = examples.filter((_, i) => i !== selectedIdx);
      if (!next.length) next = [{ url: '', title: '', description: '' }];
    } else {
      const row = {
        url: video.url,
        title: video.title || '',
        description: video.description || '',
      };
      const blankIdx = examples.findIndex((item) => !String(item.url || '').trim());
      if (blankIdx >= 0) {
        next = examples.map((item, i) => (i === blankIdx ? row : item));
      } else if (examples.length < EXAMPLE_SLOTS) {
        next = [...examples, row];
      } else {
        return;
      }
    }
    setExamples(next);
    persist({ examples: next, example_posts: next });
  };

  const addLogo = () => {
    if (brandLogos.length >= BRAND_LOGO_SLOTS) return;
    const next = [...brandLogos, { name: '', logo_url: '' }];
    setBrandLogos(next);
    persist({ brand_logos: next });
  };

  const setTestimonialAt = (index, patch) => {
    const next = testimonials.map((row, i) => (i === index ? { ...row, ...patch } : row));
    setTestimonials(next);
    persist({ testimonials: next });
  };

  const addTestimonial = () => {
    if (testimonials.length >= TESTIMONIAL_SLOTS) return;
    const next = [...testimonials, { quote: '', name: '', role: '' }];
    setTestimonials(next);
    persist({ testimonials: next });
  };

  const removeTestimonial = (index) => {
    const next = testimonials.length <= 1
      ? [{ quote: '', name: '', role: '' }]
      : testimonials.filter((_, i) => i !== index);
    setTestimonials(next);
    persist({ testimonials: next });
  };

  const handleLogoUpload = async (index, file) => {
    if (!file || !onUploadLogo) return;
    setUploadingAt(index);
    try {
      const url = await onUploadLogo(file);
      if (url) setLogoAt(index, { logo_url: url });
    } finally {
      setUploadingAt(-1);
    }
  };

  return (
    <Shell>
      {busy ? (
        <Busy role="status" aria-live="polite">
          <BusyCard>
            <BusyTrack><BusyBar /></BusyTrack>
            <BusyLabel>{busyLabel}</BusyLabel>
          </BusyCard>
        </Busy>
      ) : null}
      <MobileTabs $embedded={embedded}>
        <Tab type="button" $on={pane === 'edit'} onClick={() => setPane('edit')}>Edit</Tab>
        <Tab type="button" $on={pane === 'preview'} onClick={() => setPane('preview')}>Preview</Tab>
      </MobileTabs>

      <Grid $embedded={embedded}>
        <Form $pane={pane}>
          {formTop}

          <Label>Portfolio layout</Label>
          <Layouts>
            {KIT_LAYOUTS.map((item) => (
              <LayoutBtn key={item.id} type="button" $on={layout === item.id} onClick={() => { setLayout(item.id); persist({ layout: item.id }); }}>
                <b>{item.name}</b>
                <span>{item.blurb}</span>
              </LayoutBtn>
            ))}
          </Layouts>

          <Label>Look</Label>
          <Looks>
            {LOOKS.map((item) => (
              <LookBtn key={item.id} type="button" $on={look === item.id} $bg={item.bg} $ink={item.ink} onClick={() => { setLook(item.id); persist({ look: item.id }); }}>
                {item.name}
              </LookBtn>
            ))}
          </Looks>

          <Label>Type</Label>
          <Fonts>
            {FONT_PAIRS.map((item) => (
              <FontBtn
                key={item.id}
                type="button"
                $on={font === item.id}
                $face={item.headline}
                $italic={item.headlineItalic}
                $weight={item.headlineWeight}
                onClick={() => { setFont(item.id); persist({ font: item.id }); }}
              >
                {item.sample}
              </FontBtn>
            ))}
          </Fonts>

          <Label>Accent</Label>
          <Accents>
            {ACCENTS.map((hex) => (
              <AccentBtn key={hex} type="button" $hex={hex} $on={accent === hex} onClick={() => { const next = accent === hex ? '' : hex; setAccent(next); persist({ accent: next }); }} />
            ))}
          </Accents>

          <Label>Cover background</Label>
          <Hint>Aesthetic textures and landscapes — not portraits. Your photo belongs in About.</Hint>
          <Covers>
            {COVER_SAMPLES.map((item) => (
              <CoverBtn key={item.id} type="button" $on={coverUrl === item.url} onClick={() => { setCoverUrl(item.url); persist({ cover_url: item.url }); }}>
                <img src={`${item.url.replace('w=2000', 'w=480')}`} alt={item.label} />
                <em>{item.label}</em>
              </CoverBtn>
            ))}
          </Covers>
          <Field>
            <span>Or paste an image URL</span>
            <input value={coverUrl} onChange={(e) => { setCoverUrl(e.target.value); persist({ cover_url: e.target.value }); }} placeholder="https://" />
          </Field>

          <Label>Your posts</Label>
          {tiktokVideos.length ? (
            <>
              <Hint>Choose from your TikTok videos, or paste any Instagram, TikTok, or YouTube link below.</Hint>
              <PickerLaunch type="button" onClick={() => setPickerOpen(true)}>
                {selectedTikTokPreview.length ? (
                  <PickerThumbs>
                    {selectedTikTokPreview.map((video) => (
                      video.cover_url
                        ? <img key={video.id || video.url} src={video.cover_url} alt="" />
                        : <PickerThumbBlank key={video.id || video.url} />
                    ))}
                  </PickerThumbs>
                ) : null}
                <PickerLaunchCopy>
                  <b>{selectedTikTokCount ? `${selectedTikTokCount} video${selectedTikTokCount === 1 ? '' : 's'} selected` : 'Choose TikTok videos'}</b>
                  <span>
                    {selectedTikTokCount
                      ? `From ${tiktokVideos.length} pulled with Login Kit`
                      : `${tiktokVideos.length} videos from your TikTok`}
                  </span>
                </PickerLaunchCopy>
              </PickerLaunch>
            </>
          ) : (
            <Hint>Paste at least one Instagram Reel, TikTok, or YouTube link. Add a short title so brands know what they’re looking at.</Hint>
          )}
          {tiktokVideos.length ? <Hint>Or paste a link</Hint> : null}
          {examples.map((row, i) => (
            <PostCard key={`ex-${i}`}>
              <Field>
                <span>Post {i + 1} link</span>
                <input
                  value={row.url}
                  onChange={(e) => setExampleAt(i, { url: e.target.value })}
                  placeholder={i === 0 ? 'https://www.tiktok.com/@you/video/…' : 'https://'}
                  inputMode="url"
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              </Field>
              <Field>
                <span>Title</span>
                <input
                  value={row.title}
                  onChange={(e) => setExampleAt(i, { title: e.target.value })}
                  placeholder="Hotel unboxing for Weleda"
                />
              </Field>
              <Field>
                <span>Description</span>
                <textarea
                  rows={2}
                  value={row.description}
                  onChange={(e) => setExampleAt(i, { description: e.target.value })}
                  placeholder="What this post was about, the product, or the brief."
                />
              </Field>
            </PostCard>
          ))}
          {examples.length < EXAMPLE_SLOTS && (
            <AddMore type="button" onClick={addExample}>Add more</AddMore>
          )}

          <Label>What I make</Label>
          <Hint>Tap the formats you actually shoot. Brands scan this before they open a brief.</Hint>
          <Formats>
            {CONTENT_FORMATS.map((item) => {
              const on = formatIds.includes(item.id);
              return (
                <FormatBtn
                  key={item.id}
                  type="button"
                  $on={on}
                  title={item.body}
                  onClick={() => {
                    const next = on ? formatIds.filter((id) => id !== item.id) : [...formatIds, item.id];
                    setFormatIds(next);
                    persist({ formatIds: next, services: servicesFromFormatIds(next) });
                  }}
                >
                  {item.title}
                </FormatBtn>
              );
            })}
          </Formats>

          <Label>Brands you’ve worked with</Label>
          <Hint>Paste a logo URL (PNG or SVG). Name is optional. Add only the brands you want on the wall.</Hint>
          {brandLogos.map((row, i) => (
            <Row key={`logo-${i}`}>
              <Field>
                <span>Brand {i + 1}</span>
                <input
                  value={row.name}
                  onChange={(e) => setLogoAt(i, { name: e.target.value })}
                  placeholder="Brand name"
                />
              </Field>
              <Field>
                <span>Logo URL</span>
                <LogoUrlRow>
                  <input
                    value={row.logo_url}
                    onChange={(e) => setLogoAt(i, { logo_url: e.target.value })}
                    placeholder="https://…/logo.png"
                    inputMode="url"
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                  {onUploadLogo ? (
                    <UploadBtn>
                      {uploadingAt === i ? '…' : 'Upload'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          e.target.value = '';
                          handleLogoUpload(i, file);
                        }}
                      />
                    </UploadBtn>
                  ) : null}
                </LogoUrlRow>
              </Field>
            </Row>
          ))}
          {brandLogos.length < BRAND_LOGO_SLOTS && (
            <AddMore type="button" onClick={addLogo}>Add more</AddMore>
          )}

          <Label>Testimonials</Label>
          <Hint>Quotes from brands you’ve worked with — feedback, DMs, or a short review. Shows on your public portfolio.</Hint>
          {testimonials.map((row, i) => (
            <PostCard key={`quote-${i}`}>
              <Field>
                <span>Quote {i + 1}</span>
                <textarea
                  rows={3}
                  value={row.quote}
                  onChange={(e) => setTestimonialAt(i, { quote: e.target.value })}
                  placeholder="“Easy to brief and delivered on time — content our team could post as-is.”"
                />
              </Field>
              <Row>
                <Field>
                  <span>From (name)</span>
                  <input
                    value={row.name}
                    onChange={(e) => setTestimonialAt(i, { name: e.target.value })}
                    placeholder="Alex"
                  />
                </Field>
                <Field>
                  <span>Brand / role</span>
                  <input
                    value={row.role}
                    onChange={(e) => setTestimonialAt(i, { role: e.target.value })}
                    placeholder="Weleda · Creator lead"
                  />
                </Field>
              </Row>
              {testimonials.length > 1 ? (
                <AddMore type="button" onClick={() => removeTestimonial(i)} style={{ color: '#b45309' }}>
                  Remove quote
                </AddMore>
              ) : null}
            </PostCard>
          ))}
          {testimonials.length < TESTIMONIAL_SLOTS && (
            <AddMore type="button" onClick={addTestimonial}>Add another quote</AddMore>
          )}

          <Label>Your details</Label>
          <Row>
            <Field>
              <span>Name on the portfolio *</span>
              <input value={name} onChange={(e) => { setName(e.target.value); persist({ name: e.target.value }); }} placeholder="Gigi" />
            </Field>
            <Field>
              <span>Email *</span>
              <input value={email} onChange={(e) => { setEmail(e.target.value); persist({ email: e.target.value }); }} placeholder="you@email.com" inputMode="email" autoCapitalize="off" autoCorrect="off" />
            </Field>
          </Row>
          <Row>
            <Field>
              <span>Niche</span>
              <select value={niche} onChange={(e) => { setNiche(e.target.value); persist({ niche: e.target.value }); }}>
                {NICHE_OPTIONS.map((item) => (
                  <option key={item.id} value={item.id}>{item.label.replace(/^[^\s]+\s/, '')}</option>
                ))}
              </select>
            </Field>
            <Field>
              <span>Location</span>
              <input value={location} onChange={(e) => { setLocation(e.target.value); persist({ location: e.target.value }); }} placeholder="Paris" />
            </Field>
          </Row>
          <FieldBlock>
            <span>Social handles *</span>
            <Hint style={{ margin: '0 0 8px' }}>Add every platform you want brands to check. Followers can differ by channel.</Hint>
            {socialProfiles.map((row, i) => {
              const used = new Set(socialProfiles.map((item, idx) => (idx === i ? null : item.platform)));
              return (
                <SocialCard key={`${row.platform}-${i}`}>
                  <PlatformPick>
                    {SOCIAL_PLATFORMS.map((item) => {
                      const taken = used.has(item.id);
                      const Icon = item.Icon;
                      return (
                        <PlatformBtn
                          key={item.id}
                          type="button"
                          $on={row.platform === item.id}
                          $color={item.color}
                          disabled={taken && row.platform !== item.id}
                          aria-label={item.label}
                          onClick={() => { if (!taken || row.platform === item.id) setSocialAt(i, { platform: item.id }); }}
                        >
                          <Icon size={16} />
                        </PlatformBtn>
                      );
                    })}
                  </PlatformPick>
                  <SocialFields>
                    <SocialInput
                      value={row.handle}
                      onChange={(e) => setSocialAt(i, { handle: e.target.value })}
                      placeholder="@gigi"
                      autoCapitalize="off"
                      autoCorrect="off"
                    />
                    <SocialFollowRow $withRemove={socialProfiles.length > 1}>
                      <SocialInput
                        value={row.followers}
                        onChange={(e) => setSocialAt(i, { followers: e.target.value })}
                        placeholder="Followers on this platform"
                        inputMode="numeric"
                      />
                      {socialProfiles.length > 1 ? (
                        <RemoveSocial type="button" onClick={() => removeSocial(i)} aria-label="Remove handle">×</RemoveSocial>
                      ) : null}
                    </SocialFollowRow>
                    {row.platform === 'tiktok' && officialFollowers && officialPlatform === 'tiktok' ? (
                      <Hint style={{ margin: '4px 0 0' }}>
                        Official from TikTok: {Number(officialFollowers).toLocaleString()} followers
                        {officialLikes ? ` · ${Number(officialLikes).toLocaleString()} likes` : ''}
                      </Hint>
                    ) : null}
                  </SocialFields>
                </SocialCard>
              );
            })}
            {socialProfiles.length < SOCIAL_PLATFORMS.length ? (
              <AddMore type="button" onClick={addSocial}>Add another platform</AddMore>
            ) : null}
          </FieldBlock>
          <Field>
            <span>Headline</span>
            <input value={headline} onChange={(e) => { setHeadline(e.target.value); persist({ headline: e.target.value }); }} />
          </Field>
          <Field>
            <span>About you *</span>
            <textarea
              rows={4}
              value={about}
              onChange={(e) => { setAbout(e.target.value); persist({ about: e.target.value }); }}
              placeholder="Who you are, who you shoot for, and how you work. Example: I make UGC that looks like a friend recommended the product — talking-to-camera, real usage, and stills brands can post the same week."
            />
            <Count $ok={String(about || '').trim().length >= MIN_ABOUT_CHARS}>
              {String(about || '').trim().length} / {MIN_ABOUT_CHARS} min
              {String(about || '').trim().length < MIN_ABOUT_CHARS
                ? ' · tell the brand who you are and why they should work with you'
                : ' · good length for a brand brief'}
            </Count>
          </Field>

          <Label>Packages</Label>
          <Hint>Start from our suggested floor for your follower count, or enter what you already charge.</Hint>
          <Offers>
            {RATE_OFFERS.map((item) => {
              const applied = item.apply(followerCount);
              return (
                <OfferBtn key={item.id} type="button" $on={offerId === item.id} onClick={() => { setOfferId(item.id); persist({ offerId: item.id }); }}>
                  <b>{item.name}</b>
                  <span>{item.blurb}</span>
                  <em>{item.id === 'gifted' ? 'Product + shipping' : `Reel ${formatRate(applied.reel)} · TikTok ${formatRate(applied.tiktok)}`}</em>
                </OfferBtn>
              );
            })}
            <OfferBtn type="button" $on={offerId === 'custom'} onClick={() => { setOfferId('custom'); persist({ offerId: 'custom' }); }}>
              <b>Custom rates</b>
              <span>You already know what to charge.</span>
              <em>Edit Reel, TikTok, and photo below</em>
            </OfferBtn>
          </Offers>
          <Hint>
            Suggested floor at {followerCount.toLocaleString()} followers:
            reel {formatRate(suggested.reel)}, TikTok {formatRate(suggested.tiktok)}, photo {formatRate(suggested.photo)}.
            {' '}
            <UseSuggested
              type="button"
              onClick={() => {
                const next = {
                  reel: String(suggested.reel),
                  tiktok: String(suggested.tiktok),
                  photo: String(suggested.photo),
                  gifted: true,
                };
                setOfferId('custom');
                setCustomRates(next);
                persist({ offerId: 'custom', customRates: next });
              }}
            >
              Use suggested rates
            </UseSuggested>
          </Hint>
          <Row>
            <Field>
              <span>Reel from $</span>
              <input
                value={offerId === 'custom' ? customRates.reel : (appliedPreview.reel || '')}
                onChange={(e) => {
                  const next = { ...customRates, reel: e.target.value, tiktok: customRates.tiktok || String(suggested.tiktok), photo: customRates.photo || String(suggested.photo), gifted: customRates.gifted !== false };
                  setOfferId('custom');
                  setCustomRates(next);
                  persist({ offerId: 'custom', customRates: next });
                }}
                inputMode="numeric"
                placeholder={String(suggested.reel)}
              />
            </Field>
            <Field>
              <span>TikTok from $</span>
              <input
                value={offerId === 'custom' ? customRates.tiktok : (appliedPreview.tiktok || '')}
                onChange={(e) => {
                  const next = { ...customRates, tiktok: e.target.value, reel: customRates.reel || String(suggested.reel), photo: customRates.photo || String(suggested.photo), gifted: customRates.gifted !== false };
                  setOfferId('custom');
                  setCustomRates(next);
                  persist({ offerId: 'custom', customRates: next });
                }}
                inputMode="numeric"
                placeholder={String(suggested.tiktok)}
              />
            </Field>
          </Row>
          <Row>
            <Field>
              <span>Photo from $</span>
              <input
                value={offerId === 'custom' ? customRates.photo : (appliedPreview.photo || '')}
                onChange={(e) => {
                  const next = { ...customRates, photo: e.target.value, reel: customRates.reel || String(suggested.reel), tiktok: customRates.tiktok || String(suggested.tiktok), gifted: customRates.gifted !== false };
                  setOfferId('custom');
                  setCustomRates(next);
                  persist({ offerId: 'custom', customRates: next });
                }}
                inputMode="numeric"
                placeholder={String(suggested.photo)}
              />
            </Field>
            <GiftedCheck>
              <input
                type="checkbox"
                checked={kit.rates_gifted !== false}
                onChange={(e) => {
                  const next = { ...customRates, gifted: e.target.checked, reel: customRates.reel || String(appliedPreview.reel || suggested.reel), tiktok: customRates.tiktok || String(appliedPreview.tiktok || suggested.tiktok), photo: customRates.photo || String(appliedPreview.photo || suggested.photo) };
                  setOfferId('custom');
                  setCustomRates(next);
                  persist({ offerId: 'custom', customRates: next });
                }}
              />
              Also open to gifted PR
            </GiftedCheck>
          </Row>

          {footer}
        </Form>

        <Preview $pane={pane}>
          <PreviewLabel>Live preview · {KIT_LAYOUTS.find((l) => l.id === layout)?.name}</PreviewLabel>
          <PreviewFrame>
            <PublicKitView kit={kit} username={slug} preview />
          </PreviewFrame>
        </Preview>
      </Grid>
      {pickerOpen && tiktokVideos.length ? (
        <PickerScrim
          role="dialog"
          aria-modal="true"
          aria-label="Choose TikTok videos"
          onClick={() => setPickerOpen(false)}
        >
          <PickerModal onClick={(event) => event.stopPropagation()}>
            <PickerHead>
              <div>
                <PickerKicker>Your TikTok</PickerKicker>
                <PickerTitle>Choose videos for this portfolio</PickerTitle>
                <Hint style={{ margin: '6px 0 0' }}>
                  {selectedTikTokCount} selected · tap to add or remove
                </Hint>
              </div>
              <PickerClose type="button" onClick={() => setPickerOpen(false)} aria-label="Close">×</PickerClose>
            </PickerHead>
            <PickerGrid>
              {tiktokVideos.map((video) => {
                const on = selectedPostKeys.has(postUrlKey(video.url));
                return (
                  <PickerCard
                    key={video.id || video.url}
                    type="button"
                    $on={on}
                    onClick={() => toggleTikTokVideo(video)}
                  >
                    {video.cover_url ? <img src={video.cover_url} alt="" /> : <PickerBlank />}
                    <PickerMeta>
                      <b>{video.title || 'TikTok video'}</b>
                      <span>
                        {video.views != null ? `${formatStat(video.views)} views` : 'TikTok'}
                        {video.likes != null ? ` · ${formatStat(video.likes)} likes` : ''}
                      </span>
                    </PickerMeta>
                    {on ? <PickerCheck>✓</PickerCheck> : null}
                  </PickerCard>
                );
              })}
            </PickerGrid>
            <PickerDone type="button" onClick={() => setPickerOpen(false)}>
              Done
            </PickerDone>
          </PickerModal>
        </PickerScrim>
      ) : null}
    </Shell>
  );
}

const slide = keyframes`
  0% { transform: translateX(-120%); }
  100% { transform: translateX(320%); }
`;
const Shell = styled.div`
  position: relative;
  min-width: 0;
  overflow-x: clip;
`;
const Busy = styled.div`
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  background: rgba(246, 244, 239, .72);
  backdrop-filter: blur(6px);
`;
const BusyCard = styled.div`
  display: grid;
  justify-items: center;
  gap: 14px;
  width: min(240px, 78vw);
  padding: 22px 20px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #ece7dc;
  box-shadow: 0 18px 50px rgba(20, 17, 14, .08);
`;
const BusyTrack = styled.div`
  width: 100%;
  height: 2px;
  border-radius: 99px;
  background: #e6e1d6;
  overflow: hidden;
`;
const BusyBar = styled.div`
  width: 36%;
  height: 100%;
  border-radius: 99px;
  background: #c4a574;
  animation: ${slide} 1.05s cubic-bezier(.4,0,.2,1) infinite;
`;
const BusyLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: #8a8478;
`;
const MobileTabs = styled.div`
  display: none;
  @media (max-width: 960px) {
    display: flex;
    position: sticky;
    top: ${p => p.$embedded ? '0' : '96px'};
    z-index: 30;
    max-width: 1180px;
    margin: 0 auto;
    padding: ${p => p.$embedded ? '0 0 12px' : '8px 16px 12px'};
    gap: 8px;
    background: #f8fafc;
  }
`;
const Tab = styled.button`
  flex: 1;
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid ${p => p.$on ? '#0f172a' : '#e2e8f0'};
  background: ${p => p.$on ? '#0f172a' : '#fff'};
  color: ${p => p.$on ? '#fff' : '#0f172a'};
  font: 700 14px/1 ${STUDIO_FONT};
  cursor: pointer;
`;
const Grid = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  min-width: 0;
  padding: ${p => p.$embedded ? '8px 0 48px' : '24px 24px 80px'};
  display: grid;
  grid-template-columns: minmax(0, 400px) minmax(0, 1fr);
  gap: 28px;
  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
    padding: ${p => p.$embedded ? '4px 0 48px' : '8px 16px 64px'};
    gap: 16px;
  }
`;
const Form = styled.div`
  min-width: 0;
  @media (max-width: 960px) {
    display: ${p => p.$pane === 'preview' ? 'none' : 'block'};
  }
`;
const Label = styled.div`
  font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
  color: #64748b; margin: 28px 0 10px;
  &:first-child { margin-top: 0; }
`;
const Hint = styled.p`
  font-size: 13px; color: #64748b; line-height: 1.45; margin: 0 0 10px;
`;
const Layouts = styled.div` display: grid; gap: 8px; `;
const LayoutBtn = styled.button`
  text-align: left; border: 1px solid ${p => p.$on ? '#4f46e5' : '#e2e8f0'};
  background: ${p => p.$on ? '#eef2ff' : '#fff'};
  border-radius: 12px; padding: 12px 14px; cursor: pointer; font-family: inherit;
  min-height: 44px;
  b { display: block; font-size: 14px; }
  span { display: block; font-size: 12px; color: #64748b; margin-top: 2px; }
`;
const Looks = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(88px, 1fr)); gap: 6px;
`;
const LookBtn = styled.button`
  min-height: 44px; min-width: 0; border-radius: 10px; cursor: pointer; font: 600 11px/1 ${STUDIO_FONT};
  border: 2px solid ${p => p.$on ? '#0f172a' : 'transparent'};
  background: ${p => p.$bg}; color: ${p => p.$ink};
`;
const Fonts = styled.div`
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px;
  @media (max-width: 380px) { grid-template-columns: minmax(0, 1fr); }
`;
const FontBtn = styled.button`
  text-align: left; border: 1px solid ${p => p.$on ? '#4f46e5' : '#e2e8f0'};
  background: ${p => p.$on ? '#eef2ff' : '#fff'};
  border-radius: 10px; padding: 10px 12px; cursor: pointer;
  min-height: 44px; min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-family: ${p => p.$face} !important;
  font-style: ${p => p.$italic ? 'italic' : 'normal'};
  font-weight: ${p => p.$weight || 500} !important;
  font-size: 16px;
  @media (max-width: 480px) { font-size: 15px; padding: 10px; }
`;
const Accents = styled.div` display: flex; flex-wrap: wrap; gap: 8px; `;
const AccentBtn = styled.button`
  width: 32px; height: 32px; border-radius: 999px; background: ${p => p.$hex};
  border: 2px solid ${p => p.$on ? '#0f172a' : 'transparent'}; cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.08);
`;
const Covers = styled.div`
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px;
  @media (max-width: 640px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;
const CoverBtn = styled.button`
  position: relative;
  aspect-ratio: 16 / 10; padding: 0; border-radius: 10px; overflow: hidden; cursor: pointer;
  border: 2px solid ${p => p.$on ? '#4f46e5' : 'transparent'};
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
  em {
    position: absolute; left: 6px; bottom: 6px;
    font-style: normal; font-size: 10px; font-weight: 700; letter-spacing: .04em;
    text-transform: uppercase; color: #fff;
    text-shadow: 0 1px 4px rgba(0,0,0,.45);
  }
`;
const Row = styled.div`
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px;
  @media (max-width: 640px) { grid-template-columns: minmax(0, 1fr); }
`;
const AddMore = styled.button`
  display: flex; align-items: center; justify-content: center;
  width: 100%; box-sizing: border-box;
  margin: 8px 0 4px; min-height: 40px; padding: 0 14px;
  border: 1px dashed #cbd5e1; border-radius: 10px; background: #fff;
  color: #334155; font: 600 13px/1 ${STUDIO_FONT}; cursor: pointer;
`;
const Field = styled.label`
  display: grid; gap: 6px; margin-top: 10px; font-size: 12px; color: #64748b; font-weight: 600;
  min-width: 0;
  input, select, textarea {
    border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;
    font: 16px/1.4 ${STUDIO_FONT}; color: #0f172a; background: #fff;
    width: 100%; box-sizing: border-box;
  }
  input, select { min-height: 44px; padding-top: 0; padding-bottom: 0; }
`;
const FieldBlock = styled.div`
  display: grid; gap: 6px; margin-top: 10px; font-size: 12px; color: #64748b; font-weight: 600;
  min-width: 0;
`;
const Count = styled.span`
  font-size: 11px;
  font-weight: 600;
  line-height: 1.45;
  color: ${p => p.$ok ? '#15803d' : '#b45309'};
`;
const SocialCard = styled.div`
  display: grid; gap: 8px; margin-top: 8px;
  padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff;
  min-width: 0;
`;
const PlatformPick = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px;
`;
const PlatformBtn = styled.button`
  width: 44px; height: 44px; border-radius: 12px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1.5px solid ${p => p.$on ? p.$color : '#e2e8f0'};
  background: ${p => p.$on ? p.$color : '#fff'};
  color: ${p => p.$on ? '#fff' : p.$color};
  opacity: ${p => p.disabled ? .35 : 1};
  &:disabled { cursor: not-allowed; }
`;
const SocialFields = styled.div`
  display: grid; gap: 8px; min-width: 0;
`;
const SocialInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  min-height: 44px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 12px;
  font: 16px/1.4 ${STUDIO_FONT};
  color: #0f172a;
  background: #fff;
`;
const SocialFollowRow = styled.div`
  display: grid;
  grid-template-columns: ${p => p.$withRemove ? 'minmax(0, 1fr) 44px' : 'minmax(0, 1fr)'};
  gap: 8px;
  align-items: stretch;
`;
const RemoveSocial = styled.button`
  width: 44px; min-height: 44px; border-radius: 10px; cursor: pointer;
  border: 1px solid #e2e8f0; background: #fff; color: #64748b;
  font: 700 22px/1 ${STUDIO_FONT};
`;
const LogoUrlRow = styled.div`
  display: flex; gap: 8px; align-items: stretch;
  min-width: 0;
  input { flex: 1; min-width: 0; }
  @media (max-width: 480px) {
    flex-wrap: wrap;
    input { flex: 1 1 100%; }
  }
`;
const UploadBtn = styled.label`
  position: relative;
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 72px; min-height: 44px; padding: 0 10px;
  border: 1px solid #e2e8f0; border-radius: 10px; background: #fff;
  color: #334155; font: 600 12px/1 ${STUDIO_FONT}; cursor: pointer;
  input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
`;
const Offers = styled.div` display: grid; gap: 8px; `;
const OfferBtn = styled.button`
  text-align: left; border: 1px solid ${p => p.$on ? '#4f46e5' : '#e2e8f0'};
  background: ${p => p.$on ? '#eef2ff' : '#fff'};
  border-radius: 12px; padding: 12px 14px; cursor: pointer; font-family: inherit;
  min-height: 44px;
  b { display: block; font-size: 14px; }
  span, em { display: block; font-size: 12px; color: #64748b; margin-top: 2px; font-style: normal; }
`;
const Formats = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px;
`;
const FormatBtn = styled.button`
  border: 1px solid ${p => p.$on ? '#4f46e5' : '#e2e8f0'};
  background: ${p => p.$on ? '#eef2ff' : '#fff'};
  color: ${p => p.$on ? '#3730a3' : '#334155'};
  border-radius: 999px; padding: 8px 12px; cursor: pointer;
  min-height: 36px; font: 600 13px/1 ${STUDIO_FONT};
`;
const PostCard = styled.div`
  margin-top: 10px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 14px; background: #fff;
  > label:first-child { margin-top: 0; }
`;
const PickerLaunch = styled.button`
  display: flex; align-items: center; gap: 12px; width: 100%;
  margin: 10px 0 6px; padding: 10px 12px; text-align: left;
  border: 1px solid #e2e8f0; border-radius: 14px; background: #fff;
  cursor: pointer; font-family: inherit;
  &:hover { border-color: #c7d2fe; }
`;
const PickerThumbs = styled.div`
  display: flex; flex-shrink: 0;
  img, span {
    width: 36px; height: 48px; object-fit: cover; border-radius: 6px;
    border: 1.5px solid #fff; background: #e2e8f0; margin-left: -8px;
  }
  img:first-child, span:first-child { margin-left: 0; }
`;
const PickerThumbBlank = styled.span``;
const PickerLaunchCopy = styled.div`
  min-width: 0;
  b { display: block; font: 700 14px/1.3 ${STUDIO_FONT}; color: #0f172a; }
  span { display: block; margin-top: 2px; font: 500 12px/1.3 ${STUDIO_FONT}; color: #64748b; }
`;
const PickerScrim = styled.div`
  position: fixed; inset: 0; z-index: 90;
  display: grid; place-items: center; padding: 16px;
  background: rgba(15, 23, 42, .45);
`;
const PickerModal = styled.div`
  width: min(720px, 100%);
  max-height: min(84vh, 820px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 24px 64px rgba(15, 23, 42, .2);
  overflow: hidden;
`;
const PickerHead = styled.div`
  display: flex; justify-content: space-between; gap: 12px; align-items: flex-start;
  padding: 18px 18px 12px;
`;
const PickerKicker = styled.div`
  font: 700 11px/1 ${STUDIO_FONT}; letter-spacing: .08em; text-transform: uppercase; color: #4f46e5;
`;
const PickerTitle = styled.h3`
  margin: 6px 0 0; font: 700 18px/1.25 ${STUDIO_FONT}; color: #0f172a;
`;
const PickerClose = styled.button`
  width: 36px; height: 36px; border: 0; background: #f8fafc; border-radius: 10px;
  color: #334155; font: 700 22px/1 ${STUDIO_FONT}; cursor: pointer; flex-shrink: 0;
`;
const PickerDone = styled.button`
  margin: 12px 18px 18px; min-height: 44px; border: 0; border-radius: 12px;
  background: #0f172a; color: #fff; font: 700 14px/1 ${STUDIO_FONT}; cursor: pointer;
`;
const PickerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  padding: 0 18px;
  overflow: auto;
`;
const PickerCard = styled.button`
  position: relative;
  display: grid;
  gap: 6px;
  text-align: left;
  padding: 0 0 8px;
  border: 1.5px solid ${p => p.$on ? '#4f46e5' : '#e2e8f0'};
  background: ${p => p.$on ? '#eef2ff' : '#fff'};
  border-radius: 14px;
  cursor: pointer;
  overflow: hidden;
  font-family: inherit;
  img {
    width: 100%;
    aspect-ratio: 9 / 16;
    object-fit: cover;
    background: #e2e8f0;
    display: block;
  }
`;
const PickerBlank = styled.div`
  width: 100%;
  aspect-ratio: 9 / 16;
  background: #e2e8f0;
`;
const PickerMeta = styled.div`
  padding: 0 8px;
  min-width: 0;
  b {
    display: block;
    font: 700 11px/1.3 ${STUDIO_FONT};
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  span {
    display: block;
    font: 500 10px/1.3 ${STUDIO_FONT};
    color: #64748b;
    margin-top: 2px;
  }
`;
const PickerCheck = styled.em`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #4f46e5;
  color: #fff;
  font: 700 12px/22px ${STUDIO_FONT};
  text-align: center;
  font-style: normal;
`;
const UseSuggested = styled.button`
  display: inline; border: 0; padding: 0; background: none;
  color: #4f46e5; font: 700 13px/1.45 ${STUDIO_FONT}; cursor: pointer;
`;
const GiftedCheck = styled.label`
  display: flex; align-items: center; gap: 8px; margin-top: 28px;
  font: 600 13px/1.4 ${STUDIO_FONT}; color: #334155; cursor: pointer;
  input { width: 18px; height: 18px; accent-color: #4f46e5; }
`;
const Preview = styled.div`
  min-width: 0;
  @media (max-width: 960px) {
    display: ${p => p.$pane === 'edit' ? 'none' : 'block'};
  }
`;
const PreviewLabel = styled.div`
  font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
  color: #64748b; margin-bottom: 10px;
`;
const PreviewFrame = styled.div`
  border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #fff;
  max-height: 1100px; overflow-y: auto;
  @media (max-width: 960px) {
    max-height: none;
    border-radius: 12px;
  }
`;
