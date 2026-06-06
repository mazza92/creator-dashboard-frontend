import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { DatePicker, message } from 'antd';
import { Check, Lock, Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { tokens } from '../theme/tokens';
import { CATEGORY_LABELS, CANONICAL_CATEGORIES } from '../constants/brandCategories';

const getApiBase = () => {
  const base = process.env.REACT_APP_API_BASE ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');
  return base.replace(/\/+$/, '');
};
const API_BASE = getApiBase();

// Use canonical categories from constants (exclude 'other' for now, add at end)
const CATEGORIES = CANONICAL_CATEGORIES
  .filter(c => c !== 'other')
  .map(c => ({ value: c, label: CATEGORY_LABELS[c] }));
CATEGORIES.push({ value: 'other', label: 'Other' });

const REGIONS = [
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'CA', label: 'Canada' },
  { value: 'EU', label: 'Europe' },
  { value: 'Worldwide', label: 'Worldwide' }
];

const FOLLOWER_RANGES = [
  { value: 'Under 1K', label: 'Under 1K' },
  { value: '1K-10K', label: '1K - 10K' },
  { value: '10K-50K', label: '10K - 50K' },
  { value: '50K-100K', label: '50K - 100K' },
  { value: '100K+', label: '100K+' },
  { value: 'Any', label: 'Any size' }
];

// SVG icons for content types
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const BlogIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const CONTENT_TYPES = [
  { value: 'TikTok', label: 'TikTok', Icon: TikTokIcon },
  { value: 'Instagram Reel', label: 'Reel', Icon: InstagramIcon },
  { value: 'Instagram Story', label: 'Story', Icon: InstagramIcon },
  { value: 'YouTube', label: 'YouTube', Icon: YouTubeIcon },
  { value: 'Blog', label: 'Blog Post', Icon: BlogIcon }
];

// Use same niches as brand categories for consistency
const CREATOR_NICHES = CANONICAL_CATEGORIES
  .filter(c => c !== 'other')
  .map(c => ({ value: c, label: CATEGORY_LABELS[c] }));

const CREATOR_COUNTS = [
  { value: '3-5', label: '3 - 5', sub: 'Small batch' },
  { value: '5-10', label: '5 - 10', sub: 'Standard' },
  { value: '10-20', label: '10 - 20', sub: 'Wide reach' }
];

const BrandSubmitPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    brand_name: '',
    brand_website: '',
    brand_email: '',
    brand_category: 'food',
    product_name: '',
    campaign_description: '',
    pr_value_usd: '',
    application_deadline: null,
    creator_count_range: '5-10',
    shipping_regions: ['US'],
    follower_ranges: ['1K-10K', '10K-50K'],
    content_types: ['TikTok', 'Instagram Reel'],
    creator_niches: [],
    additional_notes: '',
    spots_total: 10
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field, value) => {
    setFormData(prev => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const countMap = { '3-5': 5, '5-10': 10, '10-20': 20 };
      const payload = {
        ...formData,
        pr_value_usd: parseInt(formData.pr_value_usd) || null,
        application_deadline: formData.application_deadline
          ? formData.application_deadline.format('YYYY-MM-DD')
          : null,
        spots_total: countMap[formData.creator_count_range] || 10
      };

      await axios.post(`${API_BASE}/api/opportunities/public/submit`, payload);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting:', error);
      message.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const goTo = (newStep) => {
    setStep(newStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const brandInitials = formData.brand_name
    ? formData.brand_name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2)
    : 'B';

  if (submitted) {
    return (
      <PageWrap>
        <TopBar>
          <LogoLink href="/">
            <LogoImg src="/newcollab-logo-dark.png" alt="NEWCOLLAB" />
          </LogoLink>
          <TopBarLabel>For Brands</TopBarLabel>
        </TopBar>

        <FormWrapper>
          <FormCard style={{ borderRadius: 16, marginTop: 40 }}>
            <ConfirmScreen>
              <ConfirmIcon><Check size={32} strokeWidth={3} /></ConfirmIcon>
              <ConfirmTitle>Listing submitted</ConfirmTitle>
              <ConfirmSub>
                We'll review your listing and notify you at {formData.brand_email} within 24 hours.
                Once live, creators can start applying.
              </ConfirmSub>

              <ConfirmSteps>
                <ConfirmStep>
                  <ConfirmStepNum>1</ConfirmStepNum>
                  <ConfirmStepText>
                    <ConfirmStepTitle>Review (within 24 hours)</ConfirmStepTitle>
                    <ConfirmStepSub>We verify your brand and listing details.</ConfirmStepSub>
                  </ConfirmStepText>
                </ConfirmStep>
                <ConfirmStep>
                  <ConfirmStepNum>2</ConfirmStepNum>
                  <ConfirmStepText>
                    <ConfirmStepTitle>Goes live to 650+ creators</ConfirmStepTitle>
                    <ConfirmStepSub>Matched creators in your niche see it first.</ConfirmStepSub>
                  </ConfirmStepText>
                </ConfirmStep>
                <ConfirmStep>
                  <ConfirmStepNum>3</ConfirmStepNum>
                  <ConfirmStepText>
                    <ConfirmStepTitle>Applications arrive in your inbox</ConfirmStepTitle>
                    <ConfirmStepSub>Each includes the creator's profile and media kit.</ConfirmStepSub>
                  </ConfirmStepText>
                </ConfirmStep>
              </ConfirmSteps>

              <ContactBox>
                Questions? Email <strong>team@newcollab.co</strong>
              </ContactBox>
            </ConfirmScreen>
          </FormCard>
        </FormWrapper>
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      {/* Header */}
      <TopBar>
        <LogoLink href="/">
          <LogoImg src="/newcollab-logo.png" alt="NEWCOLLAB" />
        </LogoLink>
        <TopBarLink href="/for-brands">For Brands</TopBarLink>
      </TopBar>

      {/* Hero */}
      <Hero>
        <HeroEyebrow>
          <LiveDot />
          650+ active creators on Newcollab
        </HeroEyebrow>
        <HeroTitle>
          Get your product in front of<br />
          <span>vetted micro-creators</span>
        </HeroTitle>
        <HeroSub>
          Post your campaign for free. Creators apply with their media kit.<br />
          You review and approve each creator before shipping.
        </HeroSub>
        <HeroStats>
          <HeroStat><HeroStatVal>Free</HeroStatVal><HeroStatLbl>To post</HeroStatLbl></HeroStat>
          <HeroStatDivider />
          <HeroStat><HeroStatVal>24h</HeroStatVal><HeroStatLbl>Review time</HeroStatLbl></HeroStat>
          <HeroStatDivider />
          <HeroStat><HeroStatVal>40%+</HeroStatVal><HeroStatLbl>Creator reply rate</HeroStatLbl></HeroStat>
          <HeroStatDivider />
          <HeroStat><HeroStatVal>21 days</HeroStatVal><HeroStatLbl>Avg delivery</HeroStatLbl></HeroStat>
        </HeroStats>
      </Hero>

      {/* Form */}
      <FormWrapper>
        {/* Progress */}
        <ProgressCard>
          <ProgressSteps>
            {[1, 2, 3, 4].map(s => (
              <ProgressStep key={s} $done={s < step} $active={s === step}>
                <StepNum $done={s < step} $active={s === step}>
                  {s < step ? <Check size={12} /> : s}
                </StepNum>
                <StepLabel>{['Your brand', 'Campaign', 'Creators', 'Review'][s - 1]}</StepLabel>
              </ProgressStep>
            ))}
          </ProgressSteps>
        </ProgressCard>

        <FormCard>
          {/* Step 1: Brand Info */}
          {step === 1 && (
            <StepContent>
              <StepTitle>Tell us about your brand</StepTitle>
              <StepSub>We use this to match you with the right creators and verify your listing.</StepSub>

              <FieldGroup>
                <Field>
                  <FieldLabel>Brand name</FieldLabel>
                  <Input
                    type="text"
                    placeholder="e.g. Aura Bora"
                    value={formData.brand_name}
                    onChange={e => updateField('brand_name', e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel>Website</FieldLabel>
                  <Input
                    type="url"
                    placeholder="https://yourbrand.com"
                    value={formData.brand_website}
                    onChange={e => updateField('brand_website', e.target.value)}
                  />
                  <FieldHint>Used to verify your brand.</FieldHint>
                </Field>

                <Field>
                  <FieldLabel>Your email</FieldLabel>
                  <Input
                    type="email"
                    placeholder="you@yourbrand.com"
                    value={formData.brand_email}
                    onChange={e => updateField('brand_email', e.target.value)}
                  />
                  <FieldHint>For listing updates and creator applications. Not shown publicly.</FieldHint>
                </Field>

                <Field>
                  <FieldLabel>Category</FieldLabel>
                  <ChipGrid>
                    {CATEGORIES.map(cat => (
                      <Chip
                        key={cat.value}
                        $selected={formData.brand_category === cat.value}
                        onClick={() => updateField('brand_category', cat.value)}
                      >
                        {cat.label}
                      </Chip>
                    ))}
                  </ChipGrid>
                </Field>
              </FieldGroup>

              <TrustBar>
                <TrustItem><Lock size={13} /> Secure</TrustItem>
                <TrustItem><Clock size={13} /> Reviewed in 24h</TrustItem>
                <TrustItem><Star size={13} /> Free to post</TrustItem>
              </TrustBar>

              <FormNav>
                <NavBtn onClick={() => goTo(2)} disabled={!formData.brand_name || !formData.brand_website || !formData.brand_email}>
                  Continue <ChevronRight size={16} />
                </NavBtn>
              </FormNav>
            </StepContent>
          )}

          {/* Step 2: Campaign */}
          {step === 2 && (
            <StepContent>
              <StepTitle>What are you sending?</StepTitle>
              <StepSub>Be specific. Creators decide whether to apply based on this.</StepSub>

              <FieldGroup>
                <Field>
                  <FieldLabel>Product name</FieldLabel>
                  <Input
                    type="text"
                    placeholder="e.g. Cactus Rose Sparkling Water 12-pack"
                    value={formData.product_name}
                    onChange={e => updateField('product_name', e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel>What you want creators to do</FieldLabel>
                  <TextArea
                    rows={4}
                    placeholder="e.g. We're sending a 12-pack variety box ahead of our summer launch. Looking for honest taste-test content - TikTok or Reel, no script needed."
                    value={formData.campaign_description}
                    onChange={e => updateField('campaign_description', e.target.value)}
                  />
                  <FieldHint>2-4 sentences works best. Keep it conversational.</FieldHint>
                </Field>

                <FieldRow>
                  <Field>
                    <FieldLabel>PR kit value (USD)</FieldLabel>
                    <ValueInput>
                      <ValuePrefix>$</ValuePrefix>
                      <Input
                        type="number"
                        placeholder="48"
                        value={formData.pr_value_usd}
                        onChange={e => updateField('pr_value_usd', e.target.value)}
                        style={{ borderRadius: '0 8px 8px 0', borderLeft: 'none' }}
                      />
                    </ValueInput>
                  </Field>
                  <Field>
                    <FieldLabel>Application deadline</FieldLabel>
                    <StyledDatePicker
                      placeholder="Select date"
                      format="MMMM D, YYYY"
                      value={formData.application_deadline}
                      onChange={date => updateField('application_deadline', date)}
                      style={{ width: '100%', height: 44 }}
                    />
                  </Field>
                </FieldRow>

                <Field>
                  <FieldLabel>How many creators?</FieldLabel>
                  <RadioCards>
                    {CREATOR_COUNTS.map(opt => (
                      <RadioCard
                        key={opt.value}
                        $selected={formData.creator_count_range === opt.value}
                        onClick={() => updateField('creator_count_range', opt.value)}
                      >
                        <RadioCardVal>{opt.label}</RadioCardVal>
                        <RadioCardLbl>{opt.sub}</RadioCardLbl>
                      </RadioCard>
                    ))}
                  </RadioCards>
                </Field>

                <Field>
                  <FieldLabel>Ships to</FieldLabel>
                  <ChipGrid>
                    {REGIONS.map(r => (
                      <Chip
                        key={r.value}
                        $selected={formData.shipping_regions.includes(r.value)}
                        onClick={() => toggleArrayField('shipping_regions', r.value)}
                      >
                        {r.label}
                      </Chip>
                    ))}
                  </ChipGrid>
                </Field>
              </FieldGroup>

              <FormNav>
                <BackBtn onClick={() => goTo(1)}><ChevronLeft size={16} /> Back</BackBtn>
                <NavBtn onClick={() => goTo(3)} disabled={!formData.product_name || !formData.campaign_description || !formData.pr_value_usd || formData.shipping_regions.length === 0}>
                  Continue <ChevronRight size={16} />
                </NavBtn>
              </FormNav>
            </StepContent>
          )}

          {/* Step 3: Creators */}
          {step === 3 && (
            <StepContent>
              <StepTitle>Who are you looking for?</StepTitle>
              <StepSub>This helps us show your opportunity to the right creators.</StepSub>

              <FieldGroup>
                <Field>
                  <FieldLabel>Follower range</FieldLabel>
                  <ChipGrid>
                    {FOLLOWER_RANGES.map(r => (
                      <Chip
                        key={r.value}
                        $selected={formData.follower_ranges.includes(r.value)}
                        onClick={() => toggleArrayField('follower_ranges', r.value)}
                      >
                        {r.label}
                      </Chip>
                    ))}
                  </ChipGrid>
                  <FieldHint>Select all that apply. Micro-creators (1K-50K) have highest engagement.</FieldHint>
                </Field>

                <Field>
                  <FieldLabel>Content type</FieldLabel>
                  <ContentTypeGrid>
                    {CONTENT_TYPES.map(t => (
                      <ContentTypeCard
                        key={t.value}
                        $selected={formData.content_types.includes(t.value)}
                        onClick={() => toggleArrayField('content_types', t.value)}
                      >
                        <ContentTypeIconWrap $selected={formData.content_types.includes(t.value)}>
                          <t.Icon />
                        </ContentTypeIconWrap>
                        <ContentTypeLabel>{t.label}</ContentTypeLabel>
                      </ContentTypeCard>
                    ))}
                  </ContentTypeGrid>
                </Field>

                <Field>
                  <FieldLabel>Creator niche <OptionalLabel>(optional)</OptionalLabel></FieldLabel>
                  <ChipGrid>
                    {CREATOR_NICHES.map(n => (
                      <Chip
                        key={n.value}
                        $selected={formData.creator_niches.includes(n.value)}
                        onClick={() => toggleArrayField('creator_niches', n.value)}
                      >
                        {n.label}
                      </Chip>
                    ))}
                  </ChipGrid>
                </Field>

                <Field>
                  <FieldLabel>Anything else? <OptionalLabel>(optional)</OptionalLabel></FieldLabel>
                  <TextArea
                    rows={2}
                    placeholder="e.g. NYC-based preferred. Must be 21+. No dietary restrictions."
                    value={formData.additional_notes}
                    onChange={e => updateField('additional_notes', e.target.value)}
                  />
                </Field>
              </FieldGroup>

              <FormNav>
                <BackBtn onClick={() => goTo(2)}><ChevronLeft size={16} /> Back</BackBtn>
                <NavBtn onClick={() => goTo(4)} disabled={formData.follower_ranges.length === 0 || formData.content_types.length === 0}>
                  Review listing <ChevronRight size={16} />
                </NavBtn>
              </FormNav>
            </StepContent>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <StepContent>
              <StepTitle>Review your listing</StepTitle>
              <StepSub>This is how creators will see your opportunity.</StepSub>

              <FieldGroup>
                {/* Preview */}
                <PreviewBlock>
                  <PreviewLabel>Listing preview</PreviewLabel>
                  <PreviewBrandRow>
                    <PreviewLogo>{brandInitials}</PreviewLogo>
                    <div>
                      <PreviewBrandName>{formData.brand_name || 'Your Brand'}</PreviewBrandName>
                      <PreviewBrandSub>
                        {CATEGORY_LABELS[formData.brand_category] || formData.brand_category} · Ships {formData.shipping_regions.join(', ') || 'US'}
                      </PreviewBrandSub>
                    </div>
                  </PreviewBrandRow>
                  <PreviewDesc>
                    {formData.campaign_description?.substring(0, 150) || 'Your description here...'}
                    {formData.campaign_description?.length > 150 ? '...' : ''}
                  </PreviewDesc>
                  <PreviewChips>
                    <PreviewChip>{formData.follower_ranges.join(' / ')} followers</PreviewChip>
                    <PreviewChip>{formData.content_types.join(' or ')}</PreviewChip>
                    {formData.pr_value_usd && <PreviewChip>~${formData.pr_value_usd} value</PreviewChip>}
                  </PreviewChips>
                </PreviewBlock>

                {/* Summary */}
                <SummaryBox>
                  <SummaryLabel>Summary</SummaryLabel>
                  <SummaryRow><span>Brand</span><strong>{formData.brand_name}</strong></SummaryRow>
                  <SummaryRow><span>Product</span><strong>{formData.product_name}</strong></SummaryRow>
                  <SummaryRow><span>Creators</span><strong>{formData.creator_count_range}</strong></SummaryRow>
                  <SummaryRow><span>PR value</span><GreenText>~${formData.pr_value_usd || '?'} per creator</GreenText></SummaryRow>
                  <SummaryRow><span>Cost to you</span><strong>Free</strong></SummaryRow>
                </SummaryBox>

                {/* What happens next */}
                <WhatNextBox>
                  <WhatNextLabel>What happens next</WhatNextLabel>
                  <WhatNextStep>
                    <WhatNextNum>1</WhatNextNum>
                    <div>
                      <WhatNextTitle>We review and publish within 24h</WhatNextTitle>
                      <WhatNextSub>We verify your listing and notify you when it's live.</WhatNextSub>
                    </div>
                  </WhatNextStep>
                  <WhatNextStep>
                    <WhatNextNum>2</WhatNextNum>
                    <div>
                      <WhatNextTitle>Creators apply with their media kit</WhatNextTitle>
                      <WhatNextSub>You receive applications by email and approve individually.</WhatNextSub>
                    </div>
                  </WhatNextStep>
                  <WhatNextStep>
                    <WhatNextNum>3</WhatNextNum>
                    <div>
                      <WhatNextTitle>Approved creators receive your address</WhatNextTitle>
                      <WhatNextSub>Only after you approve do we share shipping details.</WhatNextSub>
                    </div>
                  </WhatNextStep>
                  <WhatNextStep $last>
                    <WhatNextNum>4</WhatNextNum>
                    <div>
                      <WhatNextTitle>Creators post content</WhatNextTitle>
                      <WhatNextSub>We track delivery and follow up on your behalf.</WhatNextSub>
                    </div>
                  </WhatNextStep>
                </WhatNextBox>

                {/* Privacy note */}
                <PrivacyNote>
                  <Lock size={16} />
                  <span>
                    Your address is never shown publicly. Creators only receive it after your approval.
                  </span>
                </PrivacyNote>
              </FieldGroup>

              <FormNav>
                <BackBtn onClick={() => goTo(3)}><ChevronLeft size={16} /> Back</BackBtn>
                <SubmitBtn onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit for review'}
                </SubmitBtn>
              </FormNav>
            </StepContent>
          )}
        </FormCard>
      </FormWrapper>
    </PageWrap>
  );
};

// Styled Components
const PageWrap = styled.div`
  background: #F5F5F7;
  min-height: 100vh;
`;

const TopBar = styled.div`
  background: ${tokens.textPrimary};
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LogoLink = styled.a`
  display: flex;
  align-items: center;
`;

const LogoImg = styled.img`
  height: 28px;
  width: auto;
`;

const TopBarLabel = styled.div`
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  font-weight: 500;
`;

const TopBarLink = styled.a`
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  font-weight: 500;
  text-decoration: none;
  padding: 6px 12px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  transition: all 0.15s;

  &:hover {
    background: rgba(255,255,255,0.1);
    color: #fff;
  }
`;

const Hero = styled.div`
  background: ${tokens.textPrimary};
  padding: 32px 24px 48px;
  text-align: center;
`;

const HeroEyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 16px;
`;

const LiveDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
`;

const HeroTitle = styled.h1`
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0 0 12px;

  span { color: #a78bfa; }

  @media (max-width: 640px) {
    font-size: 24px;
  }
`;

const HeroSub = styled.p`
  font-size: 14px;
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
  max-width: 440px;
  margin: 0 auto 24px;
`;

const HeroStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
`;

const HeroStat = styled.div``;

const HeroStatVal = styled.div`
  font-size: 20px;
  font-weight: 900;
  color: #fff;
  margin-bottom: 2px;
`;

const HeroStatLbl = styled.div`
  font-size: 10px;
  color: rgba(255,255,255,0.5);
  font-weight: 500;
`;

const HeroStatDivider = styled.div`
  width: 1px;
  height: 28px;
  background: rgba(255,255,255,0.12);

  @media (max-width: 640px) {
    display: none;
  }
`;

const FormWrapper = styled.div`
  max-width: 560px;
  margin: -20px auto 0;
  padding: 0 16px 60px;
  position: relative;
  z-index: 10;
`;

const ProgressCard = styled.div`
  background: #fff;
  border-radius: 12px 12px 0 0;
  padding: 16px 20px;
  border: 1px solid ${tokens.border};
  border-bottom: none;
`;

const ProgressSteps = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ProgressStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  flex: 1;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 12px;
    left: calc(50% + 12px);
    right: calc(-50% + 12px);
    height: 2px;
    background: ${p => p.$done ? tokens.textPrimary : tokens.border};
    z-index: 0;
  }
`;

const StepNum = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  background: ${p => p.$done ? '#059669' : p.$active ? tokens.textPrimary : '#f3f4f6'};
  color: ${p => (p.$done || p.$active) ? '#fff' : '#9ca3af'};
  border: 2px solid ${p => p.$done ? '#059669' : p.$active ? tokens.textPrimary : tokens.border};
  position: relative;
  z-index: 1;
`;

const StepLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: ${tokens.textMuted};
`;

const FormCard = styled.div`
  background: #fff;
  border: 1px solid ${tokens.border};
  border-top: none;
  border-radius: 0 0 12px 12px;
  padding: 24px;
`;

const StepContent = styled.div``;

const StepTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: ${tokens.textPrimary};
  margin: 0 0 4px;
`;

const StepSub = styled.p`
  font-size: 13px;
  color: ${tokens.textMuted};
  margin: 0 0 20px;
  line-height: 1.5;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Field = styled.div``;

const FieldLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${tokens.textSecondary};
  margin-bottom: 8px;
`;

const OptionalLabel = styled.span`
  font-weight: 400;
  color: ${tokens.textMuted};
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid ${tokens.border};
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 14px;
  font-family: inherit;
  color: ${tokens.textPrimary};
  background: #fff;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${tokens.textPrimary};
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid ${tokens.border};
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 14px;
  font-family: inherit;
  color: ${tokens.textPrimary};
  background: #fff;
  outline: none;
  resize: none;
  line-height: 1.6;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${tokens.textPrimary};
  }
`;

const FieldHint = styled.div`
  font-size: 11px;
  color: ${tokens.textMuted};
  margin-top: 6px;
`;

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const ChipGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button`
  border: 1px solid ${p => p.$selected ? tokens.textPrimary : tokens.border};
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: ${p => p.$selected ? '#fff' : tokens.textSecondary};
  background: ${p => p.$selected ? tokens.textPrimary : '#fff'};
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;

  &:hover {
    border-color: ${p => p.$selected ? tokens.textPrimary : '#9ca3af'};
  }
`;

const ValueInput = styled.div`
  display: flex;
  border: 1px solid ${tokens.border};
  border-radius: 8px;
  overflow: hidden;

  &:focus-within {
    border-color: ${tokens.textPrimary};
  }

  input {
    border: none;
    &:focus { border: none; }
  }
`;

const ValuePrefix = styled.div`
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  background: #f9fafb;
  border-right: 1px solid ${tokens.border};
  color: ${tokens.textMuted};
`;

const StyledDatePicker = styled(DatePicker)`
  .ant-picker-input > input {
    font-size: 14px;
  }
`;

const RadioCards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const RadioCard = styled.div`
  border: 1px solid ${p => p.$selected ? tokens.textPrimary : tokens.border};
  border-radius: 8px;
  padding: 14px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
  background: ${p => p.$selected ? '#f9fafb' : '#fff'};

  &:hover {
    border-color: ${p => p.$selected ? tokens.textPrimary : '#9ca3af'};
  }
`;

const RadioCardVal = styled.div`
  font-size: 15px;
  font-weight: 800;
  color: ${tokens.textPrimary};
  margin-bottom: 2px;
`;

const RadioCardLbl = styled.div`
  font-size: 11px;
  color: ${tokens.textMuted};
`;

const ContentTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;

  @media (max-width: 500px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ContentTypeCard = styled.div`
  border: 1px solid ${p => p.$selected ? tokens.textPrimary : tokens.border};
  border-radius: 10px;
  padding: 14px 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
  background: ${p => p.$selected ? '#f9fafb' : '#fff'};

  &:hover {
    border-color: ${p => p.$selected ? tokens.textPrimary : '#9ca3af'};
  }
`;

const ContentTypeIconWrap = styled.div`
  width: 28px;
  height: 28px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.$selected ? tokens.textPrimary : '#9ca3af'};

  svg {
    width: 22px;
    height: 22px;
  }
`;

const ContentTypeLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${tokens.textSecondary};
`;

const TrustBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 16px 0;
  border-top: 1px solid ${tokens.border};
  margin-top: 20px;
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: ${tokens.textMuted};
  font-weight: 500;
`;

const FormNav = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 24px;
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 18px;
  border: 1px solid ${tokens.border};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${tokens.textMuted};
  background: #fff;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    border-color: ${tokens.textPrimary};
    color: ${tokens.textPrimary};
  }
`;

const NavBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px;
  background: ${tokens.textPrimary};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitBtn = styled(NavBtn)`
  background: #059669;
`;

const PreviewBlock = styled.div`
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 10px;
  padding: 16px;
`;

const PreviewLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: ${tokens.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
`;

const PreviewBrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const PreviewLogo = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: ${tokens.violet};
`;

const PreviewBrandName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${tokens.textPrimary};
`;

const PreviewBrandSub = styled.div`
  font-size: 11px;
  color: ${tokens.textMuted};
`;

const PreviewDesc = styled.div`
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.5;
  margin-bottom: 10px;
`;

const PreviewChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const PreviewChip = styled.div`
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 10px;
  color: ${tokens.textSecondary};
`;

const SummaryBox = styled.div`
  background: #f9fafb;
  border: 1px solid ${tokens.border};
  border-radius: 10px;
  padding: 14px 16px;
`;

const SummaryLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${tokens.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 5px 0;

  span { color: ${tokens.textMuted}; }
  strong { color: ${tokens.textPrimary}; font-weight: 600; }
`;

const GreenText = styled.strong`
  color: #059669 !important;
`;

const WhatNextBox = styled.div`
  border: 1px solid ${tokens.border};
  border-radius: 10px;
  overflow: hidden;
`;

const WhatNextLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${tokens.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 12px 14px;
  background: #f9fafb;
  border-bottom: 1px solid ${tokens.border};
`;

const WhatNextStep = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: ${p => p.$last ? 'none' : `1px solid ${tokens.border}`};
`;

const WhatNextNum = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${tokens.textPrimary};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  flex-shrink: 0;
`;

const WhatNextTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
`;

const WhatNextSub = styled.div`
  font-size: 12px;
  color: ${tokens.textMuted};
`;

const PrivacyNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 12px;
  color: #065f46;
  line-height: 1.5;
`;

const ConfirmScreen = styled.div`
  text-align: center;
  padding: 12px 0;
`;

const ConfirmIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #d1fae5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #065f46;
`;

const ConfirmTitle = styled.div`
  font-size: 20px;
  font-weight: 900;
  margin-bottom: 8px;
`;

const ConfirmSub = styled.div`
  font-size: 14px;
  color: ${tokens.textMuted};
  line-height: 1.6;
  margin-bottom: 24px;
`;

const ConfirmSteps = styled.div`
  text-align: left;
  margin-bottom: 20px;
`;

const ConfirmStep = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${tokens.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ConfirmStepNum = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${tokens.textPrimary};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
`;

const ConfirmStepText = styled.div`
  flex: 1;
`;

const ConfirmStepTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${tokens.textPrimary};
  margin-bottom: 2px;
`;

const ConfirmStepSub = styled.div`
  font-size: 12px;
  color: ${tokens.textMuted};
`;

const ContactBox = styled.div`
  background: #f9fafb;
  border: 1px solid ${tokens.border};
  border-radius: 8px;
  padding: 14px;
  font-size: 13px;
  color: ${tokens.textMuted};

  strong {
    color: ${tokens.textPrimary};
  }
`;

export default BrandSubmitPage;
