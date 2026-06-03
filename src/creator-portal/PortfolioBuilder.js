import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { message } from 'antd';
import { apiClient, getRuntimeApiUrl } from '../config/api';
import { FaInstagram, FaTiktok, FaYoutube, FaLock, FaEye, FaCamera } from 'react-icons/fa';
import UpgradeModal from './UpgradeModal';

const FREE_POST_LIMIT = 3;

// ── Niche product suggestions ──────────────────────────────────
const NICHE_PRODUCTS = {
  beauty:   [{ emoji: '🧴', name: 'Moisturizer' }, { emoji: '💄', name: 'Lip product' }, { emoji: '🌸', name: 'Toner' }],
  skincare: [{ emoji: '☀️', name: 'SPF serum' }, { emoji: '💆', name: 'Face mask' }, { emoji: '🧴', name: 'Cleanser' }],
  fitness:  [{ emoji: '💪', name: 'Protein powder' }, { emoji: '🏃', name: 'Activewear' }, { emoji: '⚡', name: 'Pre-workout' }],
  wellness: [{ emoji: '🌿', name: 'Supplements' }, { emoji: '🧘', name: 'Wellness tool' }, { emoji: '💊', name: 'Vitamins' }],
  food:     [{ emoji: '🍳', name: 'Kitchen tool' }, { emoji: '🥗', name: 'Snack product' }, { emoji: '☕', name: 'Coffee/drinks' }],
  fashion:  [{ emoji: '👗', name: 'Outfit piece' }, { emoji: '👟', name: 'Shoes' }, { emoji: '👜', name: 'Accessory' }],
  default:  [{ emoji: '📦', name: 'Product you use' }, { emoji: '⭐', name: 'Favourite item' }, { emoji: '🛒', name: 'Recent purchase' }],
};

const SCRIPT_HOOKS = {
  beauty:   '"I tested this for two weeks and I finally have thoughts..."',
  skincare: '"This is what my skin actually looks like before I start..."',
  fitness:  '"Three weeks in. Here is what actually changed..."',
  wellness: '"I was skeptical. Here is what happened after 14 days..."',
  default:  '"I have been using this every day and I need to talk about it..."',
};

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: FaInstagram, color: '#E4405F', types: ['reel', 'photo', 'story'] },
  { id: 'tiktok',    label: 'TikTok',    icon: FaTiktok,    color: '#000000', types: ['tiktok'] },
  { id: 'youtube',   label: 'YouTube',   icon: FaYoutube,   color: '#FF0000', types: ['youtube', 'short'] },
];

const POST_TYPE_LABELS = {
  reel: 'Reel', photo: 'Photo post', story: 'Story',
  tiktok: 'TikTok video', youtube: 'YouTube video', short: 'YouTube Short',
};

const COLLAB_TYPES = [
  { id: 'gifted',  label: 'Gifted' },
  { id: 'paid',    label: 'Paid' },
  { id: 'organic', label: 'Organic' },
  { id: 'own',     label: 'My own content' },
];

const formatNumber = (n) => {
  if (!n) return null;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};

// ── Component ──────────────────────────────────────────────────
const PortfolioBuilder = ({ currentUser, subscriptionTier }) => {
  const [view, setView]           = useState('dashboard'); // dashboard | add | guide
  const [step, setStep]           = useState(1);
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [kitViews, setKitViews]   = useState({ views_this_week: 0, recent: [] });
  const [saving, setSaving]       = useState(false);
  const [showRates, setShowRates] = useState(false);
  const [kitSettings, setKitSettings] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState(null);

  // Step form state
  const [postUrl, setPostUrl]       = useState('');
  const [platform, setPlatform]     = useState('instagram');
  const [postType, setPostType]     = useState('reel');
  const [brandName, setBrandName]   = useState('');
  const [collabType, setCollabType] = useState('gifted');
  const [stats, setStats]           = useState({ views: '', likes: '', comments: '', shares: '' });
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [urlDetecting, setUrlDetecting] = useState(false);

  const niche = (currentUser?.niches?.[0] || currentUser?.niche || 'default').toLowerCase();
  const isPro = subscriptionTier === 'pro' || subscriptionTier === 'elite';
  const atPostLimit = !isPro && posts.length >= FREE_POST_LIMIT;

  const handleUpgradeClick = (feature) => {
    setUpgradeFeature(feature);
    setShowUpgradeModal(true);
  };

  useEffect(() => {
    fetchPosts();
    fetchKitViews();
    fetchKitSettings();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await apiClient.get('/api/portfolio/posts');
      setPosts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchKitViews = async () => {
    try {
      const res = await apiClient.get('/api/portfolio/views');
      setKitViews(res.data);
    } catch (e) { /* silent */ }
  };

  const fetchKitSettings = async () => {
    try {
      const res = await apiClient.get('/api/portfolio/settings');
      setKitSettings(res.data);
    } catch (e) { /* silent */ }
  };

  const handleUrlChange = async (url) => {
    setPostUrl(url);
    if (!url.includes('http')) return;
    setUrlDetecting(true);
    try {
      // Use oEmbed endpoint to get thumbnail + platform detection
      const res = await apiClient.post('/api/portfolio/oembed', { url });
      setPlatform(res.data.platform);
      setPostType(res.data.post_type);
      if (res.data.thumbnail_url) {
        setThumbnailUrl(res.data.thumbnail_url);
      }
    } catch (e) {
      // Fallback to simple URL detection
      try {
        const res = await apiClient.post('/api/portfolio/detect-url', { url });
        setPlatform(res.data.platform);
        setPostType(res.data.post_type);
      } catch (e2) { /* silent */ }
    }
    finally { setUrlDetecting(false); }
  };

  const resetForm = () => {
    setPostUrl(''); setPlatform('instagram'); setPostType('reel');
    setBrandName(''); setCollabType('gifted'); setThumbnailUrl('');
    setStats({ views: '', likes: '', comments: '', shares: '' });
    setStep(1);
  };

  const handleSavePost = async () => {
    // Validate Step 1 fields
    if (!platform || !postType) {
      message.error('Select a platform and post type');
      return;
    }

    // Validate Step 2 fields
    if (collabType !== 'own' && !brandName.trim()) {
      message.error('Please enter a brand name');
      return;
    }
    if (!collabType) {
      message.error('Please select a collab type');
      return;
    }

    // Validate Step 3 fields - all engagement stats required
    const viewsNum = parseInt(stats.views.replace(/[^0-9]/g, '')) || 0;
    const likesNum = parseInt(stats.likes.replace(/[^0-9]/g, '')) || 0;
    const commentsNum = parseInt(stats.comments.replace(/[^0-9]/g, '')) || 0;
    const sharesNum = parseInt(stats.shares.replace(/[^0-9]/g, '')) || 0;

    if (!stats.views.trim()) {
      message.error('Please enter the number of views');
      return;
    }
    if (!stats.likes.trim()) {
      message.error('Please enter the number of likes');
      return;
    }
    if (!stats.comments.trim()) {
      message.error('Please enter the number of comments');
      return;
    }
    if (!stats.shares.trim()) {
      message.error('Please enter the number of shares');
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('/api/portfolio/posts', {
        post_url:    postUrl,
        platform,
        post_type:   postType,
        brand_name:  collabType === 'own' ? null : brandName.trim(),
        collab_type: collabType,
        thumbnail_url: thumbnailUrl || null,
        views:       viewsNum,
        likes:       likesNum,
        comments:    commentsNum,
        shares:      sharesNum,
        display_order: posts.length,
      });
      await fetchPosts();
      message.success('Added to your portfolio');
      resetForm();
      setView('dashboard');
    } catch (e) {
      message.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      await apiClient.patch('/api/portfolio/settings', { publish: true });
      message.success('Kit published');
      fetchPosts();
      fetchKitSettings(); // Refresh to get the kit_slug
    } catch (e) {
      message.error('Failed to publish');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await apiClient.delete(`/api/portfolio/posts/${postId}`);
      setPosts(p => p.filter(post => post.id !== postId));
    } catch (e) {
      message.error('Failed to remove');
    }
  };

  const kitUrl = `newcollab.co/kit/${kitSettings?.kit_slug || currentUser?.username || ''}`;

  // ── VIEWS ───────────────────────────────────────────────────

  if (view === 'guide') return (
    <GuideView
      niche={niche}
      onBack={() => setView('dashboard')}
      onDone={() => { setView('add'); setStep(1); }}
    />
  );

  if (view === 'add') return (
    <AddPostView
      step={step}
      setStep={setStep}
      postUrl={postUrl}
      setPostUrl={handleUrlChange}
      platform={platform}
      setPlatform={p => { setPlatform(p); setPostType(PLATFORMS.find(x => x.id === p)?.types[0] || 'post'); }}
      postType={postType}
      setPostType={setPostType}
      brandName={brandName}
      setBrandName={setBrandName}
      collabType={collabType}
      setCollabType={setCollabType}
      stats={stats}
      setStats={setStats}
      thumbnailUrl={thumbnailUrl}
      setThumbnailUrl={setThumbnailUrl}
      urlDetecting={urlDetecting}
      saving={saving}
      onSave={handleSavePost}
      onBack={() => { setView('dashboard'); resetForm(); }}
    />
  );

  // Dashboard view
  return (
    <Container>
      <DashHeader>
        <DashTitle>My Kit</DashTitle>
        <DashActions>
          {posts.length > 0 && (
            <PreviewBtn onClick={handlePublish}>
              Publish kit
            </PreviewBtn>
          )}
          <ShareChip onClick={() => {
            navigator.clipboard.writeText(`https://${kitUrl}`);
            message.success('Link copied');
          }}>
            {kitUrl}
          </ShareChip>
        </DashActions>
      </DashHeader>

      {/* Kit view stats - Pro feature */}
      {isPro && kitViews.views_this_week > 0 && (
        <ViewsCard>
          <ViewsLeft>
            <ViewsNum>{kitViews.views_this_week}</ViewsNum>
            <ViewsLabel>kit views this week</ViewsLabel>
          </ViewsLeft>
          <ViewsList>
            {kitViews.recent.slice(0, 2).map((v, i) => (
              <ViewRow key={v.id}>
                <ViewDot style={{ background: i === 0 ? '#10B981' : '#7C3AED' }} />
                <ViewText>
                  {v.referrer
                    ? `Via ${new URL(v.referrer).hostname.replace('www.', '')}`
                    : 'Direct visit'}
                  <ViewTime>
                    {Math.round((Date.now() - new Date(v.viewed_at)) / 3600000)}h ago
                  </ViewTime>
                </ViewText>
              </ViewRow>
            ))}
          </ViewsList>
        </ViewsCard>
      )}

      {/* Kit views teaser for free users */}
      {!isPro && (
        <ViewsTeaserCard onClick={() => handleUpgradeClick('kit_views')}>
          <ViewsTeaserLeft>
            <FaEye size={18} style={{ color: '#9CA3AF' }} />
            <ViewsTeaserText>
              <ViewsTeaserTitle>Track your kit views</ViewsTeaserTitle>
              <ViewsTeaserSub>See when brands are checking out your portfolio</ViewsTeaserSub>
            </ViewsTeaserText>
          </ViewsTeaserLeft>
          <ProBadge><FaLock size={10} /> Pro</ProBadge>
        </ViewsTeaserCard>
      )}

      {/* Empty state */}
      {posts.length === 0 && !loading && (
        <EmptyState>
          <EmptyTitle>Build your portfolio</EmptyTitle>
          <EmptyBody>
            Add posts you have created — branded or organic. Each one builds your case for a collab.
          </EmptyBody>
          <EmptyActions>
            <PrimaryBtn onClick={() => setView('add')}>Paste a post URL</PrimaryBtn>
            <SecondaryBtn onClick={() => setView('guide')}>Starting from scratch</SecondaryBtn>
          </EmptyActions>
        </EmptyState>
      )}

      {/* Post grid */}
      {posts.length > 0 && (
        <>
          <SectionLabel>Your posts ({posts.length})</SectionLabel>
          <PostGrid>
            {posts.map(post => (
              <PostThumb key={post.id}>
                <PostThumbImg niche={niche} hasThumbnail={!!post.thumbnail_url}>
                  {post.thumbnail_url ? (
                    <PostThumbImage src={post.thumbnail_url} alt={post.brand_name || 'Post'} />
                  ) : (
                    <PostThumbEmoji><PlatformIcon platform={post.platform} size={28} /></PostThumbEmoji>
                  )}
                  <PostThumbBadge>{POST_TYPE_LABELS[post.post_type] || post.post_type}</PostThumbBadge>
                  <PostThumbPlatform><PlatformIcon platform={post.platform} size={14} /></PostThumbPlatform>
                </PostThumbImg>
                <PostThumbInfo>
                  <PostThumbBrand>{post.brand_name || 'My own content'}</PostThumbBrand>
                  <PostThumbMeta>
                    {post.collab_type}
                    {post.views > 0 && ` · ${formatNumber(post.views)} views`}
                  </PostThumbMeta>
                </PostThumbInfo>
                <PostThumbDelete onClick={() => handleDeletePost(post.id)}>✕</PostThumbDelete>
              </PostThumb>
            ))}
            {atPostLimit ? (
              <AddPostCard locked onClick={() => handleUpgradeClick('portfolio_limit')}>
                <AddPostIcon><FaLock size={16} /></AddPostIcon>
                <AddPostLabel>Upgrade to add more</AddPostLabel>
                <AddPostLimit>{posts.length}/{FREE_POST_LIMIT} posts</AddPostLimit>
              </AddPostCard>
            ) : (
              <AddPostCard onClick={() => { resetForm(); setView('add'); }}>
                <AddPostIcon>+</AddPostIcon>
                <AddPostLabel>Add post</AddPostLabel>
                {!isPro && <AddPostLimit>{posts.length}/{FREE_POST_LIMIT} free</AddPostLimit>}
              </AddPostCard>
            )}
          </PostGrid>

          {/* Rate card */}
          <RatesSection>
            <RatesSectionHeader onClick={() => setShowRates(!showRates)}>
              <SectionLabel style={{ margin: 0 }}>Packages & Rates</SectionLabel>
              <ToggleIcon>{showRates ? '▲' : '▼'}</ToggleIcon>
            </RatesSectionHeader>
            {showRates && <RatesEditor kitSettings={kitSettings} onSaved={fetchKitSettings} />}
          </RatesSection>
        </>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentCount={posts.length}
        limit={FREE_POST_LIMIT}
        feature={upgradeFeature}
      />
    </Container>
  );
};

// ── Add post flow ──────────────────────────────────────────────
const AddPostView = ({
  step, setStep, postUrl, setPostUrl, platform, setPlatform,
  postType, setPostType, brandName, setBrandName, collabType,
  setCollabType, stats, setStats, thumbnailUrl, setThumbnailUrl,
  urlDetecting, saving, onSave, onBack
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      message.error('Please upload an image (PNG, JPG, GIF, or WebP)');
      return;
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      message.error('Image must be under 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const baseUrl = getRuntimeApiUrl();
      const response = await fetch(`${baseUrl}/api/portfolio/upload-thumbnail`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      if (data.thumbnail_url) {
        setThumbnailUrl(data.thumbnail_url);
        message.success('Thumbnail uploaded');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Thumbnail upload error:', err);
      message.error('Failed to upload thumbnail');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Determine if we should show upload prompt (no auto-thumbnail found)
  const showUploadPrompt = postUrl && !urlDetecting && !thumbnailUrl;
  const isInstagram = platform === 'instagram';

  return (
    <Container>
      <StepNav>
        <BackBtn onClick={step === 1 ? onBack : () => setStep(s => s - 1)}>← Back</BackBtn>
        <StepTitle>Add content</StepTitle>
        <StepCount>{step} / 3</StepCount>
      </StepNav>

      <ProgressWrap>
        <ProgressBar>
          <ProgressFill style={{ width: `${(step / 3) * 100}%` }} />
        </ProgressBar>
      </ProgressWrap>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepPanel key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <StepQ>Where's the post?</StepQ>
            <StepSub>Paste a link from Instagram, TikTok, or YouTube. We detect the platform automatically.</StepSub>

            <UrlInputWrap active={!!postUrl}>
              <UrlInner>
                <UrlIcon>🔗</UrlIcon>
                <UrlInput
                  value={postUrl}
                  onChange={e => setPostUrl(e.target.value)}
                  placeholder="Paste your post URL here"
                />
                {urlDetecting && <UrlSpinner>...</UrlSpinner>}
              </UrlInner>
              {postUrl && platform && !urlDetecting && (
                <UrlDetected hasThumbnail={!!thumbnailUrl}>
                  <UrlDot />
                  <UrlDetectedText>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)} detected
                    {thumbnailUrl && ' • Thumbnail found'}
                  </UrlDetectedText>
                </UrlDetected>
              )}
            </UrlInputWrap>

            {/* Hidden file input for thumbnail upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
              onChange={handleThumbnailUpload}
              style={{ display: 'none' }}
            />

            {/* Thumbnail preview or upload prompt */}
            {showUploadPrompt && (
              <ThumbnailUploadSection>
                <ThumbnailPlaceholder onClick={() => fileInputRef.current?.click()}>
                  {uploading ? (
                    <ThumbnailSpinner>Uploading...</ThumbnailSpinner>
                  ) : (
                    <>
                      <ThumbnailPlaceholderIcon>
                        {isInstagram ? <FaInstagram size={32} color="#E4405F" /> : <FaCamera size={28} color="#9CA3AF" />}
                      </ThumbnailPlaceholderIcon>
                      <ThumbnailPlaceholderText>
                        {isInstagram
                          ? "Instagram thumbnails can't be auto-fetched"
                          : "No thumbnail found"}
                      </ThumbnailPlaceholderText>
                      <ThumbnailUploadBtn>
                        <FaCamera size={12} /> Add thumbnail
                      </ThumbnailUploadBtn>
                    </>
                  )}
                </ThumbnailPlaceholder>
              </ThumbnailUploadSection>
            )}

            {/* Show uploaded/detected thumbnail */}
            {thumbnailUrl && !urlDetecting && (
              <ThumbnailPreviewSection>
                <ThumbnailPreviewSmall src={thumbnailUrl} alt="Thumbnail" />
                <ThumbnailPreviewInfo>
                  <ThumbnailPreviewCheck>✓ Thumbnail ready</ThumbnailPreviewCheck>
                  <ThumbnailChangeBtn onClick={() => fileInputRef.current?.click()}>
                    Change
                  </ThumbnailChangeBtn>
                </ThumbnailPreviewInfo>
              </ThumbnailPreviewSection>
            )}

            <FieldLabel style={{ marginTop: 20, marginBottom: 10 }}>Platform</FieldLabel>
            <PlatformGrid>
              {PLATFORMS.map(p => (
                <PlatformChip
                  key={p.id}
                  selected={platform === p.id}
                  onClick={() => setPlatform(p.id)}
                >
                  <PlatformIconWrap selected={platform === p.id}>
                    <PlatformIcon platform={p.id} size={24} />
                  </PlatformIconWrap>
                  <PlatformLabel selected={platform === p.id}>{p.label}</PlatformLabel>
                </PlatformChip>
              ))}
            </PlatformGrid>

            <FieldLabel style={{ marginTop: 16, marginBottom: 10 }}>Post type</FieldLabel>
            <TypePills>
              {(PLATFORMS.find(p => p.id === platform)?.types || []).map(t => (
                <TypePill key={t} selected={postType === t} onClick={() => setPostType(t)}>
                  {POST_TYPE_LABELS[t] || t}
                </TypePill>
              ))}
            </TypePills>

            <PrimaryBtn style={{ marginTop: 24 }} onClick={() => setStep(2)}>Next</PrimaryBtn>
          </StepPanel>
        )}

        {step === 2 && (
          <StepPanel key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <StepQ>Brand and collab type</StepQ>
            <StepSub>No brand? Select "My own content" — original posts count too.</StepSub>

            {/* Show auto-detected thumbnail preview */}
            {thumbnailUrl && (
              <ThumbnailPreviewWrap>
                <ThumbnailPreviewImg src={thumbnailUrl} alt="Post preview" />
                <ThumbnailPreviewLabel>Thumbnail auto-detected</ThumbnailPreviewLabel>
              </ThumbnailPreviewWrap>
            )}

            <FieldLabel>
              Brand name {collabType !== 'own' && <RequiredStar>*</RequiredStar>}
            </FieldLabel>
            <TextInput
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              placeholder={collabType === 'own' ? 'Optional for own content' : 'e.g. Kopari Beauty'}
              disabled={collabType === 'own'}
            />

            <FieldLabel style={{ marginTop: 16, marginBottom: 10 }}>
              Collab type <RequiredStar>*</RequiredStar>
            </FieldLabel>
            <CollabPills>
              {COLLAB_TYPES.map(c => (
                <CollabPill key={c.id} selected={collabType === c.id} onClick={() => setCollabType(c.id)}>
                  {c.label}
                </CollabPill>
              ))}
            </CollabPills>

            <PrimaryBtn
              style={{ marginTop: 20 }}
              onClick={() => setStep(3)}
              disabled={collabType !== 'own' && !brandName.trim()}
            >
              Next
            </PrimaryBtn>
          </StepPanel>
        )}

        {step === 3 && (
          <StepPanel key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <StepQ>Engagement numbers</StepQ>
            <StepSub>All fields are required. These are shown to brands as proof of performance.</StepSub>

            <StatGrid>
              {[
                { key: 'views',    label: 'Views' },
                { key: 'likes',    label: 'Likes' },
                { key: 'comments', label: 'Comments' },
                { key: 'shares',   label: 'Shares' },
              ].map(({ key, label }) => (
                <StatInputWrap key={key} hasValue={!!stats[key].trim()}>
                  <StatInputLabel>{label} <RequiredStar>*</RequiredStar></StatInputLabel>
                  <StatInput
                    value={stats[key]}
                    onChange={e => setStats(s => ({ ...s, [key]: e.target.value }))}
                    placeholder="0"
                  />
                </StatInputWrap>
              ))}
            </StatGrid>

            {/* Preview card */}
            <PreviewLabel>Preview</PreviewLabel>
            <PostPreviewCard>
              <PostPreviewImg niche="default" hasThumbnail={!!thumbnailUrl}>
                {thumbnailUrl ? (
                  <PostPreviewThumb src={thumbnailUrl} alt="Preview" />
                ) : (
                  <PostPreviewEmoji><PlatformIcon platform={platform} size={36} /></PostPreviewEmoji>
                )}
                <PostPreviewBadge>{POST_TYPE_LABELS[postType] || postType}</PostPreviewBadge>
              </PostPreviewImg>
              <PostPreviewBody>
                <PostPreviewBrand>
                  {brandName || 'My own content'}
                  <CollabChip type={collabType}>{collabType}</CollabChip>
                </PostPreviewBrand>
                <PostPreviewStats>
                  {stats.views && <span>{formatNumber(parseInt(stats.views.replace(/\D/g,'')))} views</span>}
                  {stats.likes && <span>{formatNumber(parseInt(stats.likes.replace(/\D/g,'')))} likes</span>}
                  {stats.comments && <span>{formatNumber(parseInt(stats.comments.replace(/\D/g,'')))} comments</span>}
                </PostPreviewStats>
              </PostPreviewBody>
            </PostPreviewCard>

            <PrimaryBtn
              style={{ marginTop: 16 }}
              onClick={onSave}
              disabled={saving || !stats.views.trim() || !stats.likes.trim() || !stats.comments.trim() || !stats.shares.trim()}
            >
              {saving ? 'Saving...' : 'Save to my portfolio'}
            </PrimaryBtn>
            <SecondaryBtn style={{ marginTop: 8 }} onClick={() => setStep(2)}>Edit details</SecondaryBtn>
          </StepPanel>
        )}
      </AnimatePresence>
    </Container>
  );
};

// ── Guide view (no content yet) ────────────────────────────────
const GuideView = ({ niche, onBack, onDone }) => {
  const products = NICHE_PRODUCTS[niche] || NICHE_PRODUCTS.default;
  const hook = SCRIPT_HOOKS[niche] || SCRIPT_HOOKS.default;
  const [selected, setSelected] = useState(null);

  return (
    <Container>
      <StepNav>
        <BackBtn onClick={onBack}>← Back</BackBtn>
        <StepTitle>Create your first post</StepTitle>
        <div />
      </StepNav>

      <GuideDark>
        <GuideEyebrow>No posts yet? No problem.</GuideEyebrow>
        <GuideTitle>Create your first collab-worthy post today</GuideTitle>
        <GuideSub>Based on your niche. Takes about 20 minutes to film.</GuideSub>
      </GuideDark>

      <GuideSection>
        <GuideSectionLabel>Products you probably own</GuideSectionLabel>
        <ProductScroll>
          {products.map((p, i) => (
            <ProductCard key={i} selected={selected === i} onClick={() => setSelected(i)}>
              <ProductEmoji>{p.emoji}</ProductEmoji>
              <ProductName>{p.name}</ProductName>
            </ProductCard>
          ))}
        </ProductScroll>
      </GuideSection>

      <GuideSection>
        <GuideSectionLabel>What to film — 3 shots</GuideSectionLabel>
        {[
          { n: 1, title: 'The before', body: 'Show the product or your starting point. Natural light. Keep it real. 4 seconds.' },
          { n: 2, title: 'The use', body: 'Apply, wear, or use it. No need to be perfect. The authenticity is the point. 8 seconds.' },
          { n: 3, title: 'Your reaction', body: 'Talk to camera. Tell them one thing you noticed. This is where the comments come from. 10 seconds.' },
        ].map(s => (
          <SequenceItem key={s.n}>
            <SeqNum>{s.n}</SeqNum>
            <SeqBody>
              <SeqTitle>{s.title}</SeqTitle>
              <SeqText>{s.body}</SeqText>
            </SeqBody>
          </SequenceItem>
        ))}
      </GuideSection>

      <GuideSection>
        <GuideSectionLabel>Hook to open with</GuideSectionLabel>
        <ScriptCard>
          <ScriptLabel>First 2 seconds</ScriptLabel>
          <ScriptText>{hook}</ScriptText>
        </ScriptCard>
      </GuideSection>

      <GuideSection style={{ paddingBottom: 32 }}>
        <PrimaryBtn onClick={onDone}>I filmed it — add to my kit</PrimaryBtn>
      </GuideSection>
    </Container>
  );
};

// ── Rates editor ───────────────────────────────────────────────
const RatesEditor = ({ kitSettings, onSaved }) => {
  const [reel, setReel]     = useState('');
  const [tiktok, setTiktok] = useState('');
  const [photo, setPhoto]   = useState('');
  const [gifted, setGifted] = useState(true);
  const [saved, setSaved]   = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load from kitSettings when available
  useEffect(() => {
    if (kitSettings && !loaded) {
      setReel(kitSettings.rates_reel || '');
      setTiktok(kitSettings.rates_tiktok || '');
      setPhoto(kitSettings.rates_photo || '');
      setGifted(kitSettings.rates_gifted !== false);
      setLoaded(true);
    }
  }, [kitSettings, loaded]);

  const save = async () => {
    try {
      await apiClient.patch('/api/portfolio/settings', {
        rates_reel: reel ? parseInt(reel) : null,
        rates_tiktok: tiktok ? parseInt(tiktok) : null,
        rates_photo: photo ? parseInt(photo) : null,
        rates_gifted: gifted,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onSaved) onSaved();
    } catch (e) { message.error('Failed to save rates'); }
  };

  return (
    <RatesWrap>
      {[
        { label: 'Instagram Reel', val: reel, set: setReel },
        { label: 'TikTok video',   val: tiktok, set: setTiktok },
        { label: 'Photo post',     val: photo, set: setPhoto },
      ].map(({ label, val, set }) => (
        <RateRow key={label}>
          <RateLabel>{label}</RateLabel>
          <RateInput
            value={val}
            onChange={e => set(e.target.value)}
            placeholder="from $..."
          />
        </RateRow>
      ))}
      <RateRow>
        <RateLabel>Open to gifted collabs</RateLabel>
        <GiftedToggle active={gifted} onClick={() => setGifted(!gifted)}>
          {gifted ? 'Yes' : 'No'}
        </GiftedToggle>
      </RateRow>
      <PrimaryBtn onClick={save} style={{ marginTop: 12 }}>
        {saved ? 'Saved' : 'Save rates'}
      </PrimaryBtn>
    </RatesWrap>
  );
};

// ── Helpers ────────────────────────────────────────────────────
const PlatformIcon = ({ platform, size = 22 }) => {
  const p = PLATFORMS.find(x => x.id === platform);
  if (!p) return <FaInstagram size={size} color="#E4405F" />;
  const Icon = p.icon;
  return <Icon size={size} color={p.color} />;
};

// ── Styled components ──────────────────────────────────────────
const shimmer = keyframes`0%{background-position:200% 0}100%{background-position:-200% 0}`;

const Container = styled.div`
  max-width: 640px;
  margin: 0 auto;
  padding-bottom: 80px;
`;

const DashHeader = styled.div`
  padding: 20px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

const DashTitle = styled.h1`
  font-size: 22px;
  font-weight: 900;
  color: #0F0F0F;
  margin: 0;
`;

const DashActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const PreviewBtn = styled.button`
  background: #0F0F0F;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
`;

const ShareChip = styled.button`
  background: #F3F4F6;
  color: #6B7280;
  font-size: 11.5px;
  font-weight: 500;
  padding: 7px 12px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @media (max-width: 380px) { max-width: 130px; }
`;

const ViewsCard = styled.div`
  margin: 0 16px 16px;
  background: #fff;
  border-radius: 16px;
  padding: 14px;
  border: 1.5px solid #E5E7EB;
  display: flex;
  align-items: center;
  gap: 16px;
  @media (max-width: 480px) { flex-direction: column; align-items: flex-start; gap: 10px; }
`;

const ViewsLeft = styled.div`
  flex-shrink: 0;
`;

const ViewsNum = styled.div`
  font-size: 28px;
  font-weight: 900;
  color: #0F0F0F;
  line-height: 1;
`;

const ViewsLabel = styled.div`
  font-size: 11px;
  color: #9CA3AF;
  margin-top: 3px;
`;

const ViewsList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ViewRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ViewDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const ViewText = styled.div`
  font-size: 12px;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const ViewTime = styled.span`
  color: #9CA3AF;
`;

const ViewsTeaserCard = styled.div`
  margin: 0 16px 16px;
  background: linear-gradient(135deg, #F9FAFB, #F3F4F6);
  border-radius: 16px;
  padding: 16px;
  border: 1.5px dashed #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: #7C3AED;
    background: linear-gradient(135deg, #F5F3FF, #EDE9FE);
  }
`;

const ViewsTeaserLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ViewsTeaserText = styled.div``;

const ViewsTeaserTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #374151;
`;

const ViewsTeaserSub = styled.div`
  font-size: 12px;
  color: #9CA3AF;
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
`;

const EmptyState = styled.div`
  margin: 16px 16px;
  border: 2px dashed #E5E7EB;
  border-radius: 18px;
  padding: 32px 20px;
  text-align: center;
`;

const EmptyTitle = styled.div`
  font-size: 17px;
  font-weight: 800;
  color: #0F0F0F;
  margin-bottom: 8px;
`;

const EmptyBody = styled.div`
  font-size: 13px;
  color: #6B7280;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const EmptyActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 280px;
  margin: 0 auto;
`;

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 800;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 12px 16px 8px;
`;

const PostGrid = styled.div`
  padding: 0 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  @media (max-width: 480px) { grid-template-columns: repeat(2, 1fr); }
`;

const PostThumb = styled.div`
  position: relative;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  border: 1.5px solid #F3F4F6;
`;

const PostThumbImg = styled.div`
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

const PostThumbImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PostThumbEmoji = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
`;

const PostThumbPlatform = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PostThumbBadge = styled.div`
  position: absolute;
  bottom: 6px;
  left: 6px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 5px;
`;

const PostThumbInfo = styled.div`
  padding: 8px 8px 9px;
`;

const PostThumbBrand = styled.div`
  font-size: 11.5px;
  font-weight: 700;
  color: #0F0F0F;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PostThumbMeta = styled.div`
  font-size: 10px;
  color: #9CA3AF;
  margin-top: 2px;
  text-transform: capitalize;
`;

const PostThumbDelete = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 10px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AddPostCard = styled.div`
  border: 2px dashed ${p => p.locked ? '#E5E7EB' : '#E5E7EB'};
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  cursor: pointer;
  transition: all 0.15s;
  background: ${p => p.locked ? 'linear-gradient(135deg, #F9FAFB, #F3F4F6)' : 'transparent'};
  &:hover {
    border-color: ${p => p.locked ? '#7C3AED' : '#7C3AED'};
    background: ${p => p.locked ? 'linear-gradient(135deg, #F5F3FF, #EDE9FE)' : 'transparent'};
  }
`;

const AddPostIcon = styled.div`
  font-size: 24px;
  color: #9CA3AF;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AddPostLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #9CA3AF;
`;

const AddPostLimit = styled.div`
  font-size: 10px;
  color: #D1D5DB;
  margin-top: 4px;
`;

const RatesSection = styled.div`
  margin: 20px 16px 0;
`;

const RatesSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

const ToggleIcon = styled.span`
  font-size: 11px;
  color: #9CA3AF;
`;

const RatesWrap = styled.div`
  background: #fff;
  border: 1.5px solid #E5E7EB;
  border-radius: 14px;
  padding: 16px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RateRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const RateLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  flex: 1;
`;

const RateInput = styled.input`
  width: 110px;
  padding: 8px 10px;
  border: 1.5px solid #E5E7EB;
  border-radius: 10px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  text-align: right;
  &:focus { border-color: #7C3AED; }
`;

const GiftedToggle = styled.button`
  padding: 7px 16px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  border: 1.5px solid ${p => p.active ? '#0F0F0F' : '#E5E7EB'};
  background: ${p => p.active ? '#0F0F0F' : '#fff'};
  color: ${p => p.active ? '#fff' : '#9CA3AF'};
  cursor: pointer;
`;

// ── Step-flow styles ───────────────────────────────────────────

const StepNav = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #F3F4F6;
  background: #fff;
`;

const BackBtn = styled.button`
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
`;

const StepTitle = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #0F0F0F;
`;

const StepCount = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #9CA3AF;
`;

const ProgressWrap = styled.div`
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #F3F4F6;
  padding-bottom: 12px;
`;

const ProgressBar = styled.div`
  height: 3px;
  background: #F3F4F6;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 10px;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #7C3AED, #E11D48);
  transition: width 0.3s ease;
`;

const StepPanel = styled(motion.div)`
  padding: 24px 16px 20px;
`;

const StepQ = styled.div`
  font-size: 20px;
  font-weight: 900;
  color: #0F0F0F;
  line-height: 1.2;
  margin-bottom: 6px;
`;

const StepSub = styled.div`
  font-size: 13px;
  color: #6B7280;
  line-height: 1.45;
  margin-bottom: 20px;
`;

const FieldLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RequiredStar = styled.span`
  color: #E11D48;
  font-weight: 700;
`;

const OptionalTag = styled.span`
  font-size: 9px;
  font-weight: 600;
  color: #D1D5DB;
  text-transform: lowercase;
  letter-spacing: 0;
`;

const ThumbnailPreviewWrap = styled.div`
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  border: 1.5px solid #E5E7EB;
`;

const ThumbnailPreviewImg = styled.img`
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
`;

const ThumbnailPreviewLabel = styled.div`
  padding: 8px 12px;
  background: #F0FDF4;
  font-size: 11px;
  font-weight: 600;
  color: #059669;
  display: flex;
  align-items: center;
  gap: 6px;
  &::before {
    content: '✓';
  }
`;

const UrlInputWrap = styled.div`
  border: 2px solid ${p => p.active ? '#7C3AED' : '#E5E7EB'};
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.2s;
`;

const UrlInner = styled.div`
  display: flex;
  align-items: center;
  padding: 13px 14px;
  gap: 10px;
`;

const UrlIcon = styled.div`
  font-size: 18px;
  flex-shrink: 0;
`;

const UrlInput = styled.input`
  flex: 1;
  font-size: 14px;
  color: #0F0F0F;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  &::placeholder { color: #D1D5DB; }
`;

const UrlSpinner = styled.div`
  font-size: 12px;
  color: #9CA3AF;
`;

const UrlDetected = styled.div`
  padding: 8px 14px 10px;
  background: #F0FDF4;
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #A7F3D0;
`;

const UrlDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10B981;
  flex-shrink: 0;
`;

const UrlDetectedText = styled.div`
  font-size: 11.5px;
  font-weight: 600;
  color: #059669;
`;

const ThumbnailUploadSection = styled.div`
  margin-top: 16px;
`;

const ThumbnailPlaceholder = styled.div`
  border: 2px dashed #E5E7EB;
  border-radius: 14px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #FAFAFA;
  &:hover {
    border-color: #7C3AED;
    background: #F5F3FF;
  }
`;

const ThumbnailPlaceholderIcon = styled.div`
  margin-bottom: 8px;
`;

const ThumbnailPlaceholderText = styled.div`
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 10px;
`;

const ThumbnailUploadBtn = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #0F0F0F;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 10px;
`;

const ThumbnailSpinner = styled.div`
  font-size: 13px;
  color: #7C3AED;
  font-weight: 600;
  padding: 20px;
`;

const ThumbnailPreviewSection = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #F0FDF4;
  border: 1.5px solid #A7F3D0;
  border-radius: 12px;
`;

const ThumbnailPreviewSmall = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
`;

const ThumbnailPreviewInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ThumbnailPreviewCheck = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #059669;
`;

const ThumbnailChangeBtn = styled.button`
  background: none;
  border: none;
  font-size: 12px;
  color: #6B7280;
  cursor: pointer;
  text-decoration: underline;
  &:hover {
    color: #374151;
  }
`;

const PlatformGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  @media (max-width: 480px) { grid-template-columns: repeat(3, 1fr); }
`;

const PlatformChip = styled.div`
  padding: 12px 8px;
  border: 2px solid ${p => p.selected ? '#0F0F0F' : '#E5E7EB'};
  background: ${p => p.selected ? '#0F0F0F' : '#fff'};
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s;
`;

const PlatformIconWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${p => p.selected ? 'rgba(255,255,255,0.15)' : '#F9FAFB'};
  transition: all 0.15s;
`;

const PlatformLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${p => p.selected ? '#fff' : '#374151'};
`;

const TypePills = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const TypePill = styled.button`
  padding: 8px 16px;
  border: 2px solid ${p => p.selected ? '#0F0F0F' : '#E5E7EB'};
  background: ${p => p.selected ? '#0F0F0F' : '#fff'};
  color: ${p => p.selected ? '#fff' : '#374151'};
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
`;

const TextInput = styled.input`
  width: 100%;
  padding: 13px 14px;
  border: 2px solid #E5E7EB;
  border-radius: 14px;
  font-size: 14px;
  color: #0F0F0F;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  &:focus { border-color: #7C3AED; }
  &::placeholder { color: #D1D5DB; }
`;

const CollabPills = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const CollabPill = styled.button`
  padding: 9px 18px;
  border: 2px solid ${p => p.selected ? '#0F0F0F' : '#E5E7EB'};
  background: ${p => p.selected ? '#0F0F0F' : '#fff'};
  color: ${p => p.selected ? '#fff' : '#374151'};
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
`;

const StatInputWrap = styled.div`
  background: ${p => p.hasValue ? '#F0FDF4' : '#F9FAFB'};
  border: 1.5px solid ${p => p.hasValue ? '#A7F3D0' : '#E5E7EB'};
  border-radius: 12px;
  padding: 11px 13px;
  transition: all 0.2s;
`;

const StatInputLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 3px;
`;

const StatInput = styled.input`
  font-size: 16px;
  font-weight: 700;
  color: #0F0F0F;
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-family: inherit;
  &::placeholder { color: #D1D5DB; font-weight: 400; font-size: 14px; }
`;

const PreviewLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 8px;
`;

const PostPreviewCard = styled.div`
  border: 1.5px solid #E5E7EB;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
`;

const PostPreviewImg = styled.div`
  height: 100px;
  background: ${p => p.hasThumbnail ? '#000' : 'linear-gradient(135deg, #F5F3FF, #FDF2F8)'};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const PostPreviewThumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PostPreviewEmoji = styled.div`
  font-size: 36px;
`;

const PostPreviewBadge = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: #0F0F0F;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 7px;
`;

const PostPreviewBody = styled.div`
  padding: 12px 13px;
`;

const PostPreviewBrand = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #0F0F0F;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
`;

const CollabChip = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 8px;
  text-transform: capitalize;
  background: ${p =>
    p.type === 'paid' ? '#D1FAE5' :
    p.type === 'gifted' ? '#EFF6FF' :
    '#F3F4F6'};
  color: ${p =>
    p.type === 'paid' ? '#065F46' :
    p.type === 'gifted' ? '#1D4ED8' :
    '#6B7280'};
`;

const PostPreviewStats = styled.div`
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6B7280;
  span { font-weight: 600; }
`;

// ── Guide styles ───────────────────────────────────────────────

const GuideDark = styled.div`
  background: #0F0F0F;
  padding: 20px 16px 18px;
`;

const GuideEyebrow = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

const GuideTitle = styled.div`
  font-size: 19px;
  font-weight: 900;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 4px;
`;

const GuideSub = styled.div`
  font-size: 12px;
  color: rgba(255,255,255,0.5);
`;

const GuideSection = styled.div`
  padding: 16px 16px 0;
`;

const GuideSectionLabel = styled.div`
  font-size: 11px;
  font-weight: 800;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 10px;
`;

const ProductScroll = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { display: none; }
`;

const ProductCard = styled.div`
  flex-shrink: 0;
  width: 88px;
  background: ${p => p.selected ? '#FFF1F2' : '#fff'};
  border: 2px solid ${p => p.selected ? '#E11D48' : '#E5E7EB'};
  border-radius: 14px;
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
`;

const ProductEmoji = styled.div`
  font-size: 26px;
  margin-bottom: 6px;
`;

const ProductName = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #0F0F0F;
  line-height: 1.3;
`;

const SequenceItem = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 12px 13px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border: 1.5px solid #F3F4F6;
  margin-bottom: 8px;
`;

const SeqNum = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #0F0F0F;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
`;

const SeqBody = styled.div``;

const SeqTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #0F0F0F;
`;

const SeqText = styled.div`
  font-size: 12px;
  color: #6B7280;
  margin-top: 2px;
  line-height: 1.45;
`;

const ScriptCard = styled.div`
  background: #F5F3FF;
  border: 1.5px solid #DDD6FE;
  border-radius: 14px;
  padding: 14px;
`;

const ScriptLabel = styled.div`
  font-size: 10px;
  font-weight: 800;
  color: #7C3AED;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 8px;
`;

const ScriptText = styled.div`
  font-size: 13.5px;
  color: #374151;
  line-height: 1.6;
  font-style: italic;
`;

// ── Shared buttons ─────────────────────────────────────────────

const PrimaryBtn = styled.button`
  width: 100%;
  background: #0F0F0F;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  padding: 15px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:hover:not(:disabled) { opacity: 0.88; }
`;

const SecondaryBtn = styled.button`
  width: 100%;
  background: #F3F4F6;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
  padding: 13px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  &:hover { background: #E5E7EB; }
`;

export default PortfolioBuilder;
