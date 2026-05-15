import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { message, Spin } from 'antd';
import {
  FiZap, FiCheck, FiCopy, FiExternalLink, FiLock, FiPlus, FiTrash2,
  FiChevronDown, FiChevronUp, FiDollarSign, FiBriefcase, FiLink
} from 'react-icons/fi';
import { apiClient } from '../config/api';

// Niche options
const NICHE_OPTIONS = [
  'Beauty', 'Skincare', 'Makeup', 'Haircare', 'Fashion', 'Lifestyle',
  'Fitness', 'Health', 'Wellness', 'Food', 'Travel', 'Tech',
  'Gaming', 'Parenting', 'Home', 'DIY', 'Finance', 'Education'
];

// Content type options
const CONTENT_TYPE_OPTIONS = [
  'Instagram Posts', 'Instagram Reels', 'Instagram Stories',
  'TikTok Videos', 'YouTube Videos', 'YouTube Shorts',
  'Unboxing', 'Reviews', 'Tutorials', 'GRWM'
];

const MediaKit = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [canEdit, setCanEdit] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [hasExistingKit, setHasExistingKit] = useState(false);
  const [publicUrl, setPublicUrl] = useState(null);

  // Expandable sections
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showRates, setShowRates] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    display_name: '',
    tagline: '',
    profile_photo_url: '',
    location: '',
    total_followers: 0,
    engagement_rate: '',
    platforms: [],
    niches: [],
    content_types: [],
    collaborations: [],
    rates: [],
    currency: 'USD',
    accepts_gifted: true,
    accepts_paid: true,
    is_published: false,
  });

  useEffect(() => {
    fetchMediaKit();
  }, []);

  const fetchMediaKit = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/media-kit');

      if (response.data.success) {
        const { media_kit, profile: creatorProfile, can_edit, subscription_tier, public_url, has_kit } = response.data;

        setProfile(creatorProfile);
        setCanEdit(can_edit);
        setSubscriptionTier(subscription_tier || 'free');
        setHasExistingKit(has_kit);
        setPublicUrl(public_url);

        if (media_kit) {
          setFormData({
            display_name: media_kit.display_name || creatorProfile?.username || '',
            tagline: media_kit.tagline || '',
            profile_photo_url: media_kit.profile_photo_url || creatorProfile?.profile_image || '',
            location: media_kit.location || creatorProfile?.location || '',
            total_followers: media_kit.total_followers || creatorProfile?.followers_count || 0,
            engagement_rate: media_kit.engagement_rate || creatorProfile?.engagement_rate || '',
            platforms: media_kit.platforms || [],
            niches: media_kit.niches || creatorProfile?.niches || [],
            content_types: media_kit.content_types || [],
            collaborations: media_kit.collaborations || [],
            rates: media_kit.rates || [],
            currency: media_kit.currency || 'USD',
            accepts_gifted: media_kit.accepts_gifted !== false,
            accepts_paid: media_kit.accepts_paid !== false,
            is_published: media_kit.is_published || false,
          });
          // Show sections if they have data
          if (media_kit.collaborations?.length > 0) setShowPortfolio(true);
          if (media_kit.rates?.length > 0) setShowRates(true);
        } else if (creatorProfile) {
          setFormData(prev => ({
            ...prev,
            display_name: creatorProfile.username || '',
            profile_photo_url: creatorProfile.profile_image || '',
            location: creatorProfile.location || '',
            total_followers: creatorProfile.followers_count || 0,
            engagement_rate: creatorProfile.engagement_rate || '',
            niches: Array.isArray(creatorProfile.niches) ? creatorProfile.niches :
                    creatorProfile.niches ? [creatorProfile.niches] : [],
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching media kit:', err);
      message.error('Failed to load media kit data');
    } finally {
      setLoading(false);
    }
  };

  // AI Generate tagline
  const generateTagline = async () => {
    if (!canEdit) return;
    try {
      setGenerating(true);
      const response = await apiClient.post('/api/media-kit/generate-tagline', {
        niches: formData.niches,
        followers: formData.total_followers,
        username: formData.display_name,
      });

      if (response.data.success && response.data.tagline) {
        setFormData(prev => ({ ...prev, tagline: response.data.tagline }));
        message.success('Tagline generated!');
      }
    } catch (err) {
      const nichesStr = formData.niches.length > 0 ? formData.niches.slice(0, 2).join(' & ') : 'content';
      const fallback = `${nichesStr} creator passionate about authentic brand partnerships`;
      setFormData(prev => ({ ...prev, tagline: fallback }));
      message.success('Tagline generated!');
    } finally {
      setGenerating(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleNiche = (niche) => {
    if (!canEdit) return;
    const updated = formData.niches.includes(niche)
      ? formData.niches.filter(n => n !== niche)
      : [...formData.niches, niche];
    updateField('niches', updated);
  };

  const toggleContentType = (type) => {
    if (!canEdit) return;
    const updated = formData.content_types.includes(type)
      ? formData.content_types.filter(t => t !== type)
      : [...formData.content_types, type];
    updateField('content_types', updated);
  };

  // Portfolio functions
  const addCollaboration = () => {
    updateField('collaborations', [
      ...formData.collaborations,
      { brand: '', type: 'gifted', description: '', url: '' }
    ]);
  };

  const updateCollaboration = (index, field, value) => {
    const updated = [...formData.collaborations];
    updated[index] = { ...updated[index], [field]: value };
    updateField('collaborations', updated);
  };

  const removeCollaboration = (index) => {
    updateField('collaborations', formData.collaborations.filter((_, i) => i !== index));
  };

  // Rates functions
  const addRate = () => {
    updateField('rates', [
      ...formData.rates,
      { name: '', price: '', deliverables: '' }
    ]);
  };

  const updateRate = (index, field, value) => {
    const updated = [...formData.rates];
    updated[index] = { ...updated[index], [field]: value };
    updateField('rates', updated);
  };

  const removeRate = (index) => {
    updateField('rates', formData.rates.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!formData.display_name.trim()) {
      message.error('Display name is required');
      return;
    }
    if (formData.niches.length === 0) {
      message.error('Please select at least one niche');
      return;
    }

    try {
      setPublishing(true);
      await apiClient.post('/api/media-kit', formData);
      const response = await apiClient.post('/api/media-kit/publish');

      if (response.data.success) {
        message.success('Media kit published!');
        setPublicUrl(response.data.public_url);
        setFormData(prev => ({ ...prev, is_published: true }));
        setHasExistingKit(true);
        setCanEdit(subscriptionTier !== 'free');
      } else {
        message.error(response.data.error || 'Failed to publish');
      }
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  const handleSave = async () => {
    if (!canEdit) {
      message.warning('Upgrade to Pro to edit');
      return;
    }
    try {
      setSaving(true);
      const response = await apiClient.post('/api/media-kit', formData);
      if (response.data.success) {
        message.success('Saved!');
        setHasExistingKit(true);
      }
    } catch (err) {
      message.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const copyPublicUrl = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      message.success('Link copied!');
    }
  };

  const formatFollowers = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spin size="large" />
        <LoadingText>Loading your media kit...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>Media Kit</Title>
          <Subtitle>Your professional profile for brand partnerships</Subtitle>
        </HeaderContent>
        {formData.is_published && publicUrl && (
          <PublishedBadge>
            <FiCheck /> Live
            <CopyButton onClick={copyPublicUrl}><FiCopy /> Copy</CopyButton>
          </PublishedBadge>
        )}
      </Header>

      {!canEdit && (
        <UpgradeBanner>
          <FiLock />
          <span>Upgrade to Pro for unlimited edits</span>
          <UpgradeButton onClick={() => window.location.href = '/creator/dashboard/settings'}>
            Upgrade
          </UpgradeButton>
        </UpgradeBanner>
      )}

      <ContentGrid>
        <EditorSection>
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <EditHint>Auto-filled from your account</EditHint>
            </CardHeader>
            <ProfilePreview>
              <ProfilePhoto
                src={formData.profile_photo_url || '/default-avatar.png'}
                alt={formData.display_name}
                onError={(e) => e.target.src = '/default-avatar.png'}
              />
              <ProfileInfo>
                <ProfileName>{formData.display_name || 'Your Name'}</ProfileName>
                <ProfileStats>
                  <Stat><StatValue>{formatFollowers(formData.total_followers)}</StatValue> <StatLabel>followers</StatLabel></Stat>
                  {formData.engagement_rate && (
                    <Stat><StatValue>{formData.engagement_rate}%</StatValue> <StatLabel>engagement</StatLabel></Stat>
                  )}
                </ProfileStats>
                {formData.location && <ProfileLocation>{formData.location}</ProfileLocation>}
              </ProfileInfo>
            </ProfilePreview>
          </Card>

          {/* Tagline */}
          <Card>
            <CardHeader>
              <CardTitle>Tagline</CardTitle>
              <GenerateButton onClick={generateTagline} disabled={generating || !canEdit}>
                {generating ? <Spin size="small" /> : <FiZap />}
                {generating ? 'Generating...' : 'AI Generate'}
              </GenerateButton>
            </CardHeader>
            <TaglineInput
              value={formData.tagline}
              onChange={(e) => updateField('tagline', e.target.value.substring(0, 150))}
              placeholder="Click 'AI Generate' for a professional tagline"
              disabled={!canEdit}
              maxLength={150}
            />
            <CharCount>{formData.tagline.length}/150</CharCount>
          </Card>

          {/* Niches */}
          <Card>
            <CardHeader>
              <CardTitle>Niches</CardTitle>
            </CardHeader>
            <TagGrid>
              {NICHE_OPTIONS.map(niche => (
                <Tag key={niche} $selected={formData.niches.includes(niche)} onClick={() => toggleNiche(niche)}>
                  {niche}
                </Tag>
              ))}
            </TagGrid>
          </Card>

          {/* Content Types */}
          <Card>
            <CardHeader>
              <CardTitle>Content Types</CardTitle>
            </CardHeader>
            <TagGrid>
              {CONTENT_TYPE_OPTIONS.map(type => (
                <Tag key={type} $selected={formData.content_types.includes(type)} onClick={() => toggleContentType(type)}>
                  {type}
                </Tag>
              ))}
            </TagGrid>
          </Card>

          {/* Portfolio - Expandable */}
          <Card>
            <ExpandableHeader onClick={() => setShowPortfolio(!showPortfolio)}>
              <CardHeaderLeft>
                <FiBriefcase />
                <CardTitle>Portfolio</CardTitle>
                <OptionalBadge>Optional</OptionalBadge>
              </CardHeaderLeft>
              {showPortfolio ? <FiChevronUp /> : <FiChevronDown />}
            </ExpandableHeader>

            <AnimatePresence>
              {showPortfolio && (
                <ExpandableContent
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SectionNote>Showcase your past brand collaborations</SectionNote>

                  {formData.collaborations.map((collab, index) => (
                    <CollabItem key={index}>
                      <CollabRow>
                        <Input
                          placeholder="Brand name"
                          value={collab.brand}
                          onChange={(e) => updateCollaboration(index, 'brand', e.target.value)}
                          disabled={!canEdit}
                        />
                        <Select
                          value={collab.type}
                          onChange={(e) => updateCollaboration(index, 'type', e.target.value)}
                          disabled={!canEdit}
                        >
                          <option value="gifted">Gifted</option>
                          <option value="paid">Paid</option>
                          <option value="affiliate">Affiliate</option>
                          <option value="ambassador">Ambassador</option>
                        </Select>
                        <RemoveBtn onClick={() => removeCollaboration(index)} disabled={!canEdit}>
                          <FiTrash2 />
                        </RemoveBtn>
                      </CollabRow>
                      <Input
                        placeholder="Brief description (e.g., 3 Reels for product launch)"
                        value={collab.description}
                        onChange={(e) => updateCollaboration(index, 'description', e.target.value)}
                        disabled={!canEdit}
                        style={{ marginTop: 8 }}
                      />
                      <Input
                        placeholder="Link to content (optional)"
                        value={collab.url}
                        onChange={(e) => updateCollaboration(index, 'url', e.target.value)}
                        disabled={!canEdit}
                        style={{ marginTop: 8 }}
                      />
                    </CollabItem>
                  ))}

                  <AddButton onClick={addCollaboration} disabled={!canEdit}>
                    <FiPlus /> Add Collaboration
                  </AddButton>
                </ExpandableContent>
              )}
            </AnimatePresence>
          </Card>

          {/* Rates - Expandable */}
          <Card>
            <ExpandableHeader onClick={() => setShowRates(!showRates)}>
              <CardHeaderLeft>
                <FiDollarSign />
                <CardTitle>Rates & Packages</CardTitle>
                <OptionalBadge>Optional</OptionalBadge>
              </CardHeaderLeft>
              {showRates ? <FiChevronUp /> : <FiChevronDown />}
            </ExpandableHeader>

            <AnimatePresence>
              {showRates && (
                <ExpandableContent
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SectionNote>Let brands know your pricing</SectionNote>

                  <CheckboxRow>
                    <CheckboxLabel $checked={formData.accepts_gifted}>
                      <input type="checkbox" checked={formData.accepts_gifted} onChange={(e) => updateField('accepts_gifted', e.target.checked)} disabled={!canEdit} />
                      Open to gifted
                    </CheckboxLabel>
                    <CheckboxLabel $checked={formData.accepts_paid}>
                      <input type="checkbox" checked={formData.accepts_paid} onChange={(e) => updateField('accepts_paid', e.target.checked)} disabled={!canEdit} />
                      Open to paid
                    </CheckboxLabel>
                  </CheckboxRow>

                  {formData.rates.map((rate, index) => (
                    <RateItem key={index}>
                      <RateRow>
                        <Input
                          placeholder="Package name (e.g., Instagram Reel)"
                          value={rate.name}
                          onChange={(e) => updateRate(index, 'name', e.target.value)}
                          disabled={!canEdit}
                        />
                        <PriceInput>
                          <span>$</span>
                          <input
                            type="number"
                            placeholder="Price"
                            value={rate.price}
                            onChange={(e) => updateRate(index, 'price', e.target.value)}
                            disabled={!canEdit}
                          />
                        </PriceInput>
                        <RemoveBtn onClick={() => removeRate(index)} disabled={!canEdit}>
                          <FiTrash2 />
                        </RemoveBtn>
                      </RateRow>
                      <Input
                        placeholder="What's included (e.g., 1 Reel + Stories + Usage rights)"
                        value={rate.deliverables}
                        onChange={(e) => updateRate(index, 'deliverables', e.target.value)}
                        disabled={!canEdit}
                        style={{ marginTop: 8 }}
                      />
                    </RateItem>
                  ))}

                  <AddButton onClick={addRate} disabled={!canEdit}>
                    <FiPlus /> Add Package
                  </AddButton>
                </ExpandableContent>
              )}
            </AnimatePresence>
          </Card>
        </EditorSection>

        {/* Preview & Actions */}
        <PreviewSection>
          <StickyPreview>
            <PreviewCard>
              <PreviewHeader>
                <PreviewPhoto src={formData.profile_photo_url || '/default-avatar.png'} alt={formData.display_name} />
                <PreviewInfo>
                  <PreviewName>{formData.display_name || 'Your Name'}</PreviewName>
                  <PreviewTagline>{formData.tagline || 'Your tagline here'}</PreviewTagline>
                </PreviewInfo>
              </PreviewHeader>

              <PreviewStats>
                <PreviewStat>
                  <PreviewStatValue>{formatFollowers(formData.total_followers)}</PreviewStatValue>
                  <PreviewStatLabel>Followers</PreviewStatLabel>
                </PreviewStat>
                {formData.engagement_rate && (
                  <PreviewStat>
                    <PreviewStatValue>{formData.engagement_rate}%</PreviewStatValue>
                    <PreviewStatLabel>Engagement</PreviewStatLabel>
                  </PreviewStat>
                )}
              </PreviewStats>

              {formData.niches.length > 0 && (
                <PreviewTags>
                  {formData.niches.slice(0, 4).map(niche => (
                    <PreviewTag key={niche}>{niche}</PreviewTag>
                  ))}
                  {formData.niches.length > 4 && <PreviewTag>+{formData.niches.length - 4}</PreviewTag>}
                </PreviewTags>
              )}

              {formData.collaborations.length > 0 && (
                <PreviewSection2>
                  <PreviewSectionTitle><FiBriefcase /> {formData.collaborations.length} Past Collabs</PreviewSectionTitle>
                </PreviewSection2>
              )}

              {formData.rates.length > 0 && (
                <PreviewSection2>
                  <PreviewSectionTitle><FiDollarSign /> {formData.rates.length} Packages</PreviewSectionTitle>
                </PreviewSection2>
              )}

              <PreviewBadges>
                {formData.accepts_gifted && <PreviewBadge>Open to Gifted</PreviewBadge>}
                {formData.accepts_paid && <PreviewBadge $paid>Open to Paid</PreviewBadge>}
              </PreviewBadges>
            </PreviewCard>

            <ActionsCard>
              {formData.is_published ? (
                <>
                  <PublishedStatus><FiCheck /> Your media kit is live!</PublishedStatus>
                  <UrlBox>
                    <UrlText>{publicUrl}</UrlText>
                    <UrlActions>
                      <IconButton onClick={copyPublicUrl}><FiCopy /></IconButton>
                      <IconButton as="a" href={publicUrl} target="_blank"><FiExternalLink /></IconButton>
                    </UrlActions>
                  </UrlBox>
                  {canEdit && (
                    <SaveButton onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </SaveButton>
                  )}
                </>
              ) : (
                <>
                  <PublishButton onClick={handlePublish} disabled={publishing || formData.niches.length === 0}>
                    {publishing ? <><Spin size="small" /> Publishing...</> : <><FiZap /> Publish Media Kit</>}
                  </PublishButton>
                  <PublishNote>
                    Available at <strong>newcollab.co/kit/{formData.display_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'username'}</strong>
                  </PublishNote>
                  <SaveDraftButton onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Draft'}
                  </SaveDraftButton>
                </>
              )}
            </ActionsCard>
          </StickyPreview>
        </PreviewSection>
      </ContentGrid>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
  overflow-x: hidden;

  *, *::before, *::after {
    box-sizing: border-box;
  }

  @media (max-width: 768px) {
    padding: 16px;
    width: 100%;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
`;

const LoadingText = styled.div`
  color: #6B7280;
  font-size: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #111827;
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: #6B7280;
  margin: 4px 0 0 0;
`;

const PublishedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ECFDF5;
  color: #059669;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  background: #059669;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #047857; }
`;

const UpgradeBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  border-radius: 12px;
  margin-bottom: 24px;
  color: #92400E;
  font-size: 14px;
  @media (max-width: 600px) { flex-direction: column; text-align: center; }
`;

const UpgradeButton = styled.button`
  padding: 6px 14px;
  background: #F59E0B;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  margin-left: auto;
  &:hover { background: #D97706; }
  @media (max-width: 600px) { margin-left: 0; }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  width: 100%;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const EditorSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  max-width: 100%;
`;

const PreviewSection = styled.div`
  min-width: 0;
  max-width: 100%;

  @media (max-width: 968px) {
    order: -1;
  }
`;

const StickyPreview = styled.div`
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 100%;

  @media (max-width: 968px) {
    position: relative;
    top: 0;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #E5E7EB;
  overflow: hidden;

  @media (max-width: 600px) {
    padding: 16px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
`;

const CardHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: #111827;
`;

const EditHint = styled.span`
  font-size: 12px;
  color: #9CA3AF;
`;

const OptionalBadge = styled.span`
  font-size: 11px;
  color: #9CA3AF;
  background: #F3F4F6;
  padding: 2px 8px;
  border-radius: 4px;
`;

const ExpandableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 4px 0;

  &:hover { color: #3B82F6; }
`;

const ExpandableContent = styled(motion.div)`
  overflow: hidden;
  margin-top: 16px;
`;

const SectionNote = styled.div`
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 12px;
`;

const ProfilePreview = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  @media (max-width: 400px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ProfilePhoto = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #E5E7EB;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.div`
  font-size: 17px;
  font-weight: 700;
  color: #111827;
`;

const ProfileStats = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 4px;
  flex-wrap: wrap;
`;

const Stat = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
`;

const StatValue = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #3B82F6;
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: #6B7280;
`;

const ProfileLocation = styled.div`
  font-size: 13px;
  color: #6B7280;
  margin-top: 4px;
`;

const GenerateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const TaglineInput = styled.textarea`
  width: 100%;
  max-width: 100%;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  min-height: 70px;
  font-family: inherit;
  &:focus { outline: none; border-color: #3B82F6; }
  &:disabled { background: #F9FAFB; cursor: not-allowed; }
`;

const CharCount = styled.div`
  font-size: 11px;
  color: #9CA3AF;
  text-align: right;
  margin-top: 4px;
`;

const TagGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.button`
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: 1.5px solid ${props => props.$selected ? '#3B82F6' : '#E5E7EB'};
  background: ${props => props.$selected ? '#EFF6FF' : 'white'};
  color: ${props => props.$selected ? '#3B82F6' : '#374151'};
  &:hover { border-color: #3B82F6; }
`;

const CollabItem = styled.div`
  background: #F9FAFB;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
`;

const CollabRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const RateItem = styled.div`
  background: #F9FAFB;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
`;

const RateRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  &:focus { outline: none; border-color: #3B82F6; }
  &:disabled { background: #F3F4F6; }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  min-width: 100px;
  &:focus { outline: none; border-color: #3B82F6; }

  @media (max-width: 600px) {
    min-width: unset;
    width: 100%;
  }
`;

const PriceInput = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  background: white;
  padding-left: 10px;
  min-width: 100px;

  span { color: #6B7280; }
  input {
    border: none;
    padding: 10px 12px 10px 4px;
    font-size: 14px;
    width: 80px;
    min-width: 0;
    &:focus { outline: none; }
  }

  @media (max-width: 600px) {
    min-width: unset;
    width: 100%;
    input { width: 100%; }
  }
`;

const RemoveBtn = styled.button`
  padding: 10px;
  border: none;
  background: #FEE2E2;
  color: #DC2626;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
  &:hover { background: #FECACA; }
  &:disabled { opacity: 0.5; }

  @media (max-width: 600px) {
    align-self: flex-end;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  border: 1.5px dashed #D1D5DB;
  background: white;
  color: #6B7280;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 8px;
  &:hover:not(:disabled) { border-color: #3B82F6; color: #3B82F6; }
  &:disabled { opacity: 0.5; }
`;

const CheckboxRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${props => props.$checked ? '#111827' : '#6B7280'};
  cursor: pointer;
  input { width: 16px; height: 16px; accent-color: #3B82F6; }
`;

// Preview Card Styles
const PreviewCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #E5E7EB;
  overflow: hidden;

  @media (max-width: 600px) {
    padding: 16px;
  }
`;

const PreviewHeader = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const PreviewPhoto = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
`;

const PreviewInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PreviewName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
`;

const PreviewTagline = styled.div`
  font-size: 12px;
  color: #6B7280;
  margin-top: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PreviewStats = styled.div`
  display: flex;
  gap: 24px;
  padding: 12px 0;
  border-top: 1px solid #F3F4F6;
  border-bottom: 1px solid #F3F4F6;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const PreviewStat = styled.div`
  text-align: center;
`;

const PreviewStatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
`;

const PreviewStatLabel = styled.div`
  font-size: 11px;
  color: #6B7280;
  text-transform: uppercase;
`;

const PreviewTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
`;

const PreviewTag = styled.span`
  padding: 4px 10px;
  background: #F3F4F6;
  border-radius: 12px;
  font-size: 12px;
  color: #374151;
`;

const PreviewSection2 = styled.div`
  padding: 8px 0;
  border-top: 1px solid #F3F4F6;
`;

const PreviewSectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6B7280;
`;

const PreviewBadges = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const PreviewBadge = styled.span`
  padding: 4px 10px;
  background: ${props => props.$paid ? '#ECFDF5' : '#EFF6FF'};
  color: ${props => props.$paid ? '#059669' : '#3B82F6'};
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
`;

const ActionsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;

  @media (max-width: 600px) {
    padding: 16px;
  }
`;

const PublishedStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: #ECFDF5;
  color: #059669;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
`;

const UrlBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #F9FAFB;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  min-width: 0;
  max-width: 100%;
`;

const UrlText = styled.div`
  flex: 1;
  font-size: 12px;
  color: #374151;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
`;

const UrlActions = styled.div`
  display: flex;
  gap: 4px;
`;

const IconButton = styled.button`
  padding: 6px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  color: #6B7280;
  cursor: pointer;
  display: flex;
  text-decoration: none;
  &:hover { background: #F3F4F6; color: #111827; }
`;

const PublishButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const PublishNote = styled.div`
  font-size: 12px;
  color: #6B7280;
  text-align: center;
  word-break: break-word;
  strong { color: #3B82F6; }
`;

const SaveButton = styled.button`
  padding: 12px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  &:hover:not(:disabled) { background: #2563EB; }
  &:disabled { opacity: 0.6; }
`;

const SaveDraftButton = styled.button`
  padding: 10px;
  background: white;
  color: #6B7280;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  &:hover { background: #F9FAFB; }
`;

export default MediaKit;
