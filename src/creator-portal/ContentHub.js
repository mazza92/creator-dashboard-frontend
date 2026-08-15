import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { message } from 'antd';
import api from '../config/api';
import { trackContentHubEvent } from '../utils/contentHubAnalytics';

const PINK = '#e8395f';
const PINK_HOVER = '#c92549';

const CONTENT_TYPES = [
  { id: 'unboxing', label: 'Unboxing', emoji: '📦' },
  { id: 'review', label: 'Review', emoji: '✨' },
  { id: 'grwm', label: 'GRWM', emoji: '💄' },
  { id: 'haul', label: 'Haul', emoji: '🛍️' },
  { id: 'tutorial', label: 'Tutorial', emoji: '🎓' },
  { id: 'lifestyle', label: 'Lifestyle', emoji: '🌿' },
  { id: 'other', label: 'Other', emoji: '✏️' },
];

const TYPE_LABELS = Object.fromEntries(CONTENT_TYPES.map((t) => [t.id, t.label]));
const TYPE_EMOJI = Object.fromEntries(CONTENT_TYPES.map((t) => [t.id, t.emoji]));

const EXAMPLES = [
  {
    kind: 'UNBOXING',
    caption: 'Unboxing my Sephora PR haul',
    brand: '@sephora',
    views: '21K',
    videoId: '7352118652675558699',
    url: 'https://www.tiktok.com/@carolinapeterscosta/video/7352118652675558699',
  },
  {
    kind: 'GRWM',
    caption: 'Get ready with me using Rare Beauty',
    brand: '@rarebeauty',
    views: '8.5K',
    videoId: '7589700971270262023',
    url: 'https://www.tiktok.com/@sarahhlux/video/7589700971270262023',
  },
  {
    kind: 'REVIEW',
    caption: 'Honest review of Glow Recipe',
    brand: '@glowrecipe',
    views: '54K',
    videoId: '7501013732617653535',
    url: 'https://www.tiktok.com/@skylerreneee/video/7501013732617653535',
  },
  {
    kind: 'HAUL',
    caption: 'Byoma J-beauty haul for glowy skin',
    brand: '@byoma',
    views: '3.2K',
    videoId: '7639514862124567839',
    url: 'https://www.tiktok.com/@erin_reneeee/video/7639514862124567839',
  },
];

function relativeTime(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const sec = Math.max(0, (Date.now() - then) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) {
    const n = Math.floor(sec / 60);
    return `${n} minute${n === 1 ? '' : 's'} ago`;
  }
  if (sec < 86400) {
    const n = Math.floor(sec / 3600);
    return `${n} hour${n === 1 ? '' : 's'} ago`;
  }
  if (sec < 604800) {
    const n = Math.floor(sec / 86400);
    return `${n} day${n === 1 ? '' : 's'} ago`;
  }
  return new Date(iso).toLocaleDateString();
}

function statusMeta(status, brandResponse) {
  if (status === 'brand_responded' || brandResponse) {
    return { cls: 'responded', label: 'Brand responded' };
  }
  if (status === 'pushed_to_brand') return { cls: 'pushed', label: 'Pushed to brand' };
  if (status === 'approved') return { cls: 'approved', label: 'Approved' };
  if (status === 'rejected') return { cls: 'rejected', label: 'Rejected' };
  if (status === 'flagged') return { cls: 'pending', label: 'In review' };
  return { cls: 'pending', label: 'Pending review' };
}

function brandResponseMeta(value) {
  if (!value) return null;
  if (value === 'not_interested') {
    return { tone: 'muted', label: 'Not this time' };
  }
  if (value === 'no_response') {
    return { tone: 'muted', label: 'Waiting on brand' };
  }
  const wins = {
    interested: { tone: 'win', emoji: '🎉', label: 'They loved it' },
    wants_more_content: { tone: 'win', emoji: '🔥', label: 'Wants more content' },
    wants_paid_collab: { tone: 'paid', emoji: '💰', label: 'Paid collab interest' },
  };
  return wins[value] || { tone: 'win', emoji: '🎉', label: 'Brand is in' };
}

export default function ContentHub() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [postUrl, setPostUrl] = useState('');
  const [brandQuery, setBrandQuery] = useState('');
  const [brandId, setBrandId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showAc, setShowAc] = useState(false);
  const [freeTextMode, setFreeTextMode] = useState(false);
  const [freeText, setFreeText] = useState('');
  const [contentType, setContentType] = useState(null);
  const [description, setDescription] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const suggestTimer = useRef(null);
  const viewedHistory = useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/creator/content-submissions');
      if (res.data?.success) {
        setSubmissions(res.data.submissions || []);
      }
    } catch (err) {
      message.error('Could not load submissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    trackContentHubEvent('content_hub_viewed');
    load();
  }, [load]);

  useEffect(() => {
    if (!loading && !viewedHistory.current) {
      viewedHistory.current = true;
      trackContentHubEvent('content_hub_submission_history_viewed', {
        submission_count: submissions.length,
      });
    }
  }, [loading, submissions.length]);

  const openModal = () => {
    setModalOpen(true);
    setFormError('');
    trackContentHubEvent('content_hub_submit_clicked');
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const fetchSuggestions = (q) => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (!q || q.length < 2) {
      setSuggestions([]);
      setShowAc(false);
      return;
    }
    suggestTimer.current = setTimeout(async () => {
      try {
        const res = await api.get('/api/pr-crm/brands/search-suggestions', { params: { q } });
        const list = res.data?.suggestions || [];
        setSuggestions(list);
        setShowAc(list.length > 0);
      } catch {
        setSuggestions([]);
        setShowAc(false);
      }
    }, 220);
  };

  const selectBrand = (brand) => {
    setBrandQuery(brand.name);
    setBrandId(brand.id);
    setShowAc(false);
    setFreeTextMode(false);
    setFreeText('');
    trackContentHubEvent('content_hub_brand_selected', {
      brand_id: brand.id,
      from_directory: true,
    });
  };

  const toggleFreeText = () => {
    const next = !freeTextMode;
    setFreeTextMode(next);
    if (next) {
      setBrandId(null);
      setShowAc(false);
    }
  };

  const validUrl = postUrl.trim().startsWith('https://') && (
    /tiktok\.com|instagram\.com|youtube\.com|youtu\.be/i.test(postUrl)
  );
  const hasBrand = Boolean(brandId) || (freeTextMode && freeText.trim().length > 0);
  const canSubmit = validUrl && hasBrand && contentType && consent && !submitting;

  const resetForm = () => {
    setPostUrl('');
    setBrandQuery('');
    setBrandId(null);
    setSuggestions([]);
    setShowAc(false);
    setFreeTextMode(false);
    setFreeText('');
    setContentType(null);
    setDescription('');
    setConsent(false);
    setFormError('');
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setFormError('');
    try {
      const body = {
        post_url: postUrl.trim(),
        content_type: contentType,
        description: description.trim() || undefined,
        consent_given: true,
      };
      if (brandId) body.brand_id = brandId;
      else body.brand_name_freetext = freeText.trim();

      const res = await api.post('/api/creator/content-submissions', body);
      if (!res.data?.success) {
        setFormError(res.data?.error || 'Could not submit');
        return;
      }
      trackContentHubEvent('content_hub_submitted', {
        submission_id: res.data.submission?.id,
        content_type: contentType,
        has_freetext_brand: !brandId,
      });
      if (!brandId) {
        trackContentHubEvent('content_hub_brand_selected', {
          from_directory: false,
        });
      }
      message.success("Submitted. We'll review and push to the brand within a few days.");
      closeModal();
      resetForm();
      load();
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not submit. Try again.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const countLabel = useMemo(() => {
    const n = submissions.length;
    return n ? `· ${n}` : '· 0';
  }, [submissions.length]);

  return (
    <Page>
      <SectionHead>
        <SectionTag>New feature</SectionTag>
        <SectionTitle>Brand Content <span>Hub</span></SectionTitle>
        <SectionSub>
          Turn your organic content into brand deals. Submit videos where you tagged or mentioned a brand and we'll take them straight to the brand.
        </SectionSub>
      </SectionHead>

      <ValueCard>
        <ValueIcon>💵</ValueIcon>
        <ValueContent>
          <ValueTitle>Already made content tagging a brand?</ValueTitle>
          <ValueDesc>
            Post it here. We'll take it to them directly. If they like it, they may <strong>gift you more product</strong>, <strong>pay you for more content</strong>, or open a long-term collab.
          </ValueDesc>
          <ValueCta type="button" onClick={openModal}>
            + Submit branded content
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </ValueCta>
        </ValueContent>
      </ValueCard>

      <ExamplesBlock>
        <ExamplesLbl>Types of content that work best</ExamplesLbl>
        <ExamplesGrid>
          {EXAMPLES.map((ex) => (
            <Example key={ex.kind}>
              <ExPlayer
                src={`https://www.tiktok.com/player/v1/${ex.videoId}?music_info=0&description=0&autoplay=0&progress_bar=1&play_button=1&volume_control=0&fullscreen_button=0&timestamp=0&loop=0&rel=0&native_context_menu=0&closed_caption=0`}
                title={ex.caption}
                allow="encrypted-media; fullscreen; accelerometer; autoplay; clipboard-write; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
              <ExFrame>
                <ExTop><span className="dot" />{ex.kind}</ExTop>
                <ExMeta>
                  <ExCaption>{ex.caption}</ExCaption>
                  <ExBottom>
                    <ExBrand>{ex.brand}</ExBrand>
                    <a href={ex.url} target="_blank" rel="noopener noreferrer">▶ {ex.views}</a>
                  </ExBottom>
                </ExMeta>
              </ExFrame>
            </Example>
          ))}
        </ExamplesGrid>
      </ExamplesBlock>

      <SubsHeader>
        <SubsTitle>Your submissions <span>{countLabel}</span></SubsTitle>
      </SubsHeader>

      {loading ? (
        <EmptyBox>Loading…</EmptyBox>
      ) : submissions.length === 0 ? (
        <EmptyBox>
          <EmptyIcon>📤</EmptyIcon>
          <EmptyTitle>No submissions yet</EmptyTitle>
          <EmptyDesc>
            Submit your first branded content to start your Newcollab portfolio. Any post where you tag a brand works.
          </EmptyDesc>
          <ValueCta type="button" onClick={openModal} style={{ marginTop: 8 }}>
            + Submit your first
          </ValueCta>
        </EmptyBox>
      ) : (
        <SubsTable>
          <SubRow className="header">
            <div>Post</div>
            <div>Brand</div>
            <div>Type</div>
            <div>Submitted</div>
            <div>Status</div>
            <div>Brand response</div>
          </SubRow>
          {submissions.map((s) => {
            const st = statusMeta(s.status, s.brand_response_status);
            const response = brandResponseMeta(s.brand_response_status);
            const isWin = response && response.tone !== 'muted';
            const title = s.description || TYPE_LABELS[s.content_type] || 'Post';
            return (
              <SubRow
                key={s.id}
                as="a"
                href={s.post_url}
                target="_blank"
                rel="noopener noreferrer"
                $win={isWin}
              >
                <div className="sub-post">
                  <Thumb $kind={s.content_type}>{TYPE_EMOJI[s.content_type] || '▶'}</Thumb>
                  <span>{title}</span>
                </div>
                <div className="brand">{s.brand_name || s.brand_name_freetext || '—'}</div>
                <div><TypePill>{TYPE_LABELS[s.content_type] || s.content_type}</TypePill></div>
                <div className="date">{relativeTime(s.created_at)}</div>
                <div><StatusPill className={st.cls}>{st.label}</StatusPill></div>
                <div>
                  {s.status === 'rejected' && (s.rejection_reason_label || s.rejection_reason) ? (
                    <ResponsePill $tone="muted">
                      {s.rejection_reason_label || s.rejection_reason}
                    </ResponsePill>
                  ) : response ? (
                    <ResponsePill $tone={response.tone}>
                      {response.emoji ? <span>{response.emoji}</span> : null}
                      {response.label}
                    </ResponsePill>
                  ) : (
                    <span className="date">—</span>
                  )}
                </div>
              </SubRow>
            );
          })}
        </SubsTable>
      )}

      {modalOpen && (
        <Backdrop onClick={closeModal}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalHead>
              <ModalTitle>Submit branded content</ModalTitle>
              <ModalSub>Share a post where you tagged or mentioned a brand. We'll review and push it to them.</ModalSub>
              <CloseBtn type="button" onClick={closeModal} aria-label="Close">×</CloseBtn>
            </ModalHead>
            <ModalBody>
              <Field>
                <Label>Post URL<span>*</span></Label>
                <input
                  type="url"
                  placeholder="https://www.tiktok.com/@yourhandle/video/..."
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                />
                <Hint>Works with TikTok, Instagram Reels, and YouTube Shorts.</Hint>
              </Field>

              <Field>
                <Label>Which brand?<span>*</span></Label>
                <BrandWrap>
                  <input
                    className="brand-input"
                    placeholder="Search brand (Sephora, Rare Beauty, Byoma...)"
                    value={brandQuery}
                    onChange={(e) => {
                      setBrandQuery(e.target.value);
                      setBrandId(null);
                      fetchSuggestions(e.target.value);
                    }}
                    onFocus={() => suggestions.length && setShowAc(true)}
                  />
                  {showAc && (
                    <AcDrop>
                      {suggestions.map((b) => (
                        <AcOpt key={b.id} type="button" onClick={() => selectBrand(b)}>
                          {b.logo ? (
                            <img src={b.logo} alt="" />
                          ) : (
                            <AcLogo>{(b.name || '?').slice(0, 2).toUpperCase()}</AcLogo>
                          )}
                          <div>
                            <div className="name">{b.name}</div>
                            <div className="cat">{b.category || 'Brand'}</div>
                          </div>
                        </AcOpt>
                      ))}
                    </AcDrop>
                  )}
                </BrandWrap>
                <Hint>
                  <button type="button" className="link" onClick={toggleFreeText}>
                    Can't find your brand?
                  </button>
                </Hint>
              </Field>

              {freeTextMode && (
                <Field>
                  <Label>Enter brand name</Label>
                  <input
                    maxLength={100}
                    placeholder="Enter brand name"
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                  />
                  <Hint>We'll add this brand to our directory during review.</Hint>
                </Field>
              )}

              <Field>
                <Label>Content type<span>*</span></Label>
                <Pills>
                  {CONTENT_TYPES.map((t) => (
                    <TypeBtn
                      key={t.id}
                      type="button"
                      $on={contentType === t.id}
                      onClick={() => setContentType(t.id)}
                    >
                      {t.emoji} {t.label}
                    </TypeBtn>
                  ))}
                </Pills>
              </Field>

              <Field>
                <Label>Short description <em>(optional)</em></Label>
                <textarea
                  maxLength={200}
                  placeholder="In one sentence, what did you say about the product?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Hint>
                  <span className="count">{description.length}/200</span>
                  Helps us pitch it better to the brand.
                </Hint>
              </Field>

              <Consent $on={consent} onClick={() => setConsent((v) => !v)}>
                <ConsentBox $on={consent}>✓</ConsentBox>
                <span>
                  <strong>I'm open to this brand contacting me</strong> for future paid or gifted collaborations based on this content.
                </span>
              </Consent>

              {formError && <FormError>{formError}</FormError>}
            </ModalBody>
            <ModalActions>
              <GhostBtn type="button" onClick={closeModal}>Cancel</GhostBtn>
              <PrimaryBtn type="button" disabled={!canSubmit} onClick={submit}>
                {submitting ? 'Submitting…' : 'Submit for review'}
              </PrimaryBtn>
            </ModalActions>
          </ModalCard>
        </Backdrop>
      )}
    </Page>
  );
}

const Page = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  padding: 32px 24px 80px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, "Segoe UI", Roboto, sans-serif;
  color: #15161a;
`;

const SectionHead = styled.div`margin-bottom: 24px;`;
const SectionTag = styled.div`
  display: inline-flex; align-items: center; gap: 6px;
  background: #fef2f4; color: ${PINK};
  font-size: 11px; font-weight: 800; padding: 5px 10px; border-radius: 100px;
  letter-spacing: .06em; text-transform: uppercase; margin-bottom: 10px;
`;
const SectionTitle = styled.h1`
  font-size: 32px; font-weight: 800; letter-spacing: -.02em; line-height: 1.2;
  margin: 0 0 6px; color: #15161a;
  span { color: ${PINK}; }
`;
const SectionSub = styled.p`
  font-size: 15px; color: #6b6f78; max-width: 640px; line-height: 1.55; margin: 0;
`;

const ValueCard = styled.div`
  background: linear-gradient(135deg, #fff5f7 0%, #faf5ff 100%);
  border: 1px solid #fde8ec; border-radius: 20px; padding: 28px; margin-bottom: 24px;
  display: flex; gap: 24px; align-items: center; position: relative; overflow: hidden;
  @media (max-width: 640px) { flex-direction: column; text-align: center; padding: 24px 20px; }
`;
const ValueIcon = styled.div`
  width: 64px; height: 64px; border-radius: 16px; flex-shrink: 0;
  background: linear-gradient(135deg, ${PINK} 0%, ${PINK_HOVER} 100%);
  display: flex; align-items: center; justify-content: center; font-size: 32px;
  box-shadow: 0 8px 20px rgba(232,57,95,.25);
`;
const ValueContent = styled.div`flex: 1;`;
const ValueTitle = styled.div`
  font-size: 22px; font-weight: 800; letter-spacing: -.01em; margin-bottom: 6px; line-height: 1.25;
  @media (max-width: 640px) { font-size: 19px; }
`;
const ValueDesc = styled.div`
  font-size: 14.5px; color: #4a4d55; line-height: 1.55; margin-bottom: 14px;
  strong { color: #15161a; font-weight: 700; }
`;
const ValueCta = styled.button`
  display: inline-flex; align-items: center; gap: 8px;
  background: ${PINK}; color: #fff; padding: 12px 20px; border-radius: 11px;
  font-weight: 700; font-size: 14.5px; border: none; cursor: pointer;
  box-shadow: 0 4px 12px rgba(232,57,95,.28);
  &:hover { background: ${PINK_HOVER}; }
`;

const ExamplesBlock = styled.div`margin-bottom: 28px;`;
const ExamplesLbl = styled.div`
  font-size: 11px; font-weight: 800; color: #6b6f78; text-transform: uppercase;
  letter-spacing: .08em; margin-bottom: 12px;
`;
const ExamplesGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  @media (max-width: 820px) { grid-template-columns: repeat(2, 1fr); }
`;
const Example = styled.div`
  position: relative; aspect-ratio: 9/16; border-radius: 14px; overflow: hidden;
  background: #111; box-shadow: 0 2px 8px rgba(15,17,20,.06);
  &:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(15,17,20,.1); }
`;
const ExPlayer = styled.iframe`
  position: absolute; inset: 0; width: 100%; height: 100%;
  border: 0; background: #000;
`;
const ExFrame = styled.div`
  position: absolute; inset: 0; pointer-events: none;
  display: flex; flex-direction: column; justify-content: space-between;
  padding: 10px;
  background: linear-gradient(180deg, rgba(0,0,0,.45) 0%, transparent 22%, transparent 62%, rgba(0,0,0,.72) 100%);
`;
const ExTop = styled.div`
  display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; color: #fff;
  text-shadow: 0 1px 4px rgba(0,0,0,.6);
  .dot { width: 6px; height: 6px; background: #fff; border-radius: 50%; }
`;
const ExMeta = styled.div`color: #fff;`;
const ExCaption = styled.div`
  font-size: 12px; font-weight: 800; line-height: 1.2; letter-spacing: -.01em;
  text-shadow: 0 1px 4px rgba(0,0,0,.7); margin-bottom: 8px;
`;
const ExBottom = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  font-size: 10px; font-weight: 700;
  a { color: #fff; pointer-events: auto; text-decoration: none; }
`;
const ExBrand = styled.span`
  background: rgba(255,255,255,.2); padding: 3px 7px; border-radius: 100px; font-size: 9.5px;
  backdrop-filter: blur(4px);
`;

const SubsHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding-top: 8px;
`;
const SubsTitle = styled.div`
  font-size: 16px; font-weight: 800;
  span { color: #6b6f78; font-weight: 600; }
`;
const SubsTable = styled.div`
  background: #fff; border: 1px solid #f1f2f4; border-radius: 14px; overflow: hidden;
  @media (max-width: 820px) { background: transparent; border: none; }
`;
const SubRow = styled.div`
  display: grid; grid-template-columns: 1.4fr 1fr .8fr .8fr 1fr .9fr; gap: 12px;
  padding: 16px 20px; align-items: center; border-top: 1px solid #f1f2f4;
  font-size: 13.5px; color: inherit; text-decoration: none;
  &:first-child { border-top: none; }
  &.header {
    background: #fafafa; font-size: 10.5px; font-weight: 800; color: #6b6f78;
    text-transform: uppercase; letter-spacing: .06em; padding-top: 11px; padding-bottom: 11px;
  }
  &:not(.header):hover { background: ${p => p.$win ? '#fff8fb' : '#fafafa'}; }
  ${p => p.$win ? `
    background: linear-gradient(90deg, #fff8fb 0%, #fff 55%);
    box-shadow: inset 3px 0 0 ${PINK};
  ` : ''}
  .sub-post { display: flex; align-items: center; gap: 10px; font-weight: 600; }
  .brand { font-weight: 600; }
  .date { color: #6b6f78; font-size: 12.5px; }
  @media (max-width: 820px) {
    grid-template-columns: 1fr; gap: 8px; padding: 14px 16px;
    &.header { display: none; }
    &:not(.header) {
      border: 1px solid #f1f2f4; border-radius: 10px; margin: 8px 0; background: #fff;
    }
  }
`;
const Thumb = styled.div`
  width: 36px; height: 44px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px;
  background: ${p => (
    p.$kind === 'grwm' ? 'linear-gradient(135deg,#fde68a,#f59e0b)'
    : p.$kind === 'review' ? 'linear-gradient(135deg,#c4b5fd,#7c3aed)'
    : p.$kind === 'haul' ? 'linear-gradient(135deg,#a7f3d0,#059669)'
    : 'linear-gradient(135deg,#f4c4b8,#e8395f)'
  )};
`;
const TypePill = styled.span`
  display: inline-flex; background: #fafafa; color: #4a4d55;
  padding: 3px 8px; border-radius: 100px; font-size: 11.5px; font-weight: 600;
`;
const StatusPill = styled.span`
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11.5px; font-weight: 700; padding: 4px 10px; border-radius: 100px;
  &.pending { background: #fef3c7; color: #8a5d0a; }
  &.approved { background: #dbeafe; color: #1e40af; }
  &.pushed { background: #fef2f4; color: ${PINK}; }
  &.responded { background: #e8f7ed; color: #0d6b3b; }
  &.rejected { background: #f3f4f6; color: #4b5563; }
`;

const winPulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(232,57,95,.28); }
  50% { transform: scale(1.03); box-shadow: 0 0 0 6px rgba(232,57,95,0); }
`;
const ResponsePill = styled.span`
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 800; padding: 6px 11px; border-radius: 100px;
  letter-spacing: -.01em; white-space: nowrap;
  ${p => p.$tone === 'win' && css`
    background: linear-gradient(135deg, #fff1f4 0%, #fde8ec 100%);
    color: #c92549;
    border: 1px solid #f9c5d1;
    animation: ${winPulse} 1.6s ease-in-out 3;
  `}
  ${p => p.$tone === 'paid' && css`
    background: linear-gradient(135deg, #fff7e6 0%, #fde68a 100%);
    color: #92400e;
    border: 1px solid #fbbf24;
    animation: ${winPulse} 1.6s ease-in-out 3;
  `}
  ${p => p.$tone === 'muted' && css`
    background: #f3f4f6;
    color: #6b7280;
    font-weight: 600;
  `}
`;

const EmptyBox = styled.div`
  padding: 56px 24px; text-align: center; background: #fff;
  border: 1px dashed #e5e7eb; border-radius: 14px;
`;
const EmptyIcon = styled.div`
  width: 56px; height: 56px; background: #fafafa; border-radius: 14px;
  display: flex; align-items: center; justify-content: center; font-size: 26px; margin: 0 auto 14px;
`;
const EmptyTitle = styled.div`font-size: 16px; font-weight: 800; margin-bottom: 4px;`;
const EmptyDesc = styled.div`
  font-size: 13.5px; color: #6b6f78; max-width: 340px; margin: 0 auto 16px; line-height: 1.5;
`;

const Backdrop = styled.div`
  position: fixed; inset: 0; background: rgba(15,17,20,.55); backdrop-filter: blur(6px);
  z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px;
`;
const ModalCard = styled.div`
  background: #fff; border-radius: 20px; width: 100%; max-width: 520px;
  max-height: calc(100vh - 40px); overflow-y: auto;
  box-shadow: 0 24px 60px rgba(15,17,20,.12);
`;
const ModalHead = styled.div`
  padding: 22px 24px 16px; border-bottom: 1px solid #f1f2f4; position: relative;
`;
const ModalTitle = styled.div`font-size: 19px; font-weight: 800; margin-bottom: 4px;`;
const ModalSub = styled.div`font-size: 13px; color: #6b6f78; line-height: 1.5; padding-right: 28px;`;
const CloseBtn = styled.button`
  position: absolute; top: 16px; right: 16px; width: 30px; height: 30px; border-radius: 50%;
  background: #f7f7f8; border: none; cursor: pointer; font-size: 18px; color: #6b6f78;
`;
const ModalBody = styled.div`padding: 20px 24px 4px;`;
const Field = styled.div`
  margin-bottom: 16px;
  input, textarea {
    width: 100%; padding: 11px 14px; font-size: 14px; border: 1.5px solid #e5e7eb;
    background: #fff; border-radius: 10px; outline: none; font-family: inherit; color: #15161a;
    box-sizing: border-box;
    &:focus { border-color: ${PINK}; box-shadow: 0 0 0 3px rgba(232,57,95,.1); }
  }
  textarea { min-height: 70px; resize: vertical; }
`;
const Label = styled.label`
  display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px;
  span { color: ${PINK}; margin-left: 2px; }
  em { color: #6b6f78; font-weight: 500; font-style: normal; }
`;
const Hint = styled.div`
  font-size: 11.5px; color: #6b6f78; margin-top: 5px; line-height: 1.4;
  .count { float: right; }
  .link { background: none; border: none; color: ${PINK}; font-weight: 600; cursor: pointer; padding: 0; font-size: inherit; }
`;
const BrandWrap = styled.div`
  position: relative;
  .brand-input { padding-left: 14px; }
`;
const AcDrop = styled.div`
  position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #fff;
  border: 1px solid #e5e7eb; border-radius: 10px; box-shadow: 0 4px 16px rgba(15,17,20,.06);
  z-index: 5; max-height: 200px; overflow-y: auto;
`;
const AcOpt = styled.button`
  display: flex; align-items: center; gap: 10px; padding: 10px 14px; width: 100%;
  background: #fff; border: none; border-bottom: 1px solid #f1f2f4; cursor: pointer; text-align: left;
  img { width: 24px; height: 24px; border-radius: 6px; object-fit: cover; }
  .name { font-weight: 700; font-size: 13.5px; color: #15161a; }
  .cat { font-size: 11px; color: #6b6f78; }
  &:hover { background: #fafafa; }
`;
const AcLogo = styled.div`
  width: 24px; height: 24px; border-radius: 6px; background: ${PINK}; color: #fff;
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 10px; flex-shrink: 0;
`;
const Pills = styled.div`display: flex; flex-wrap: wrap; gap: 6px;`;
const TypeBtn = styled.button`
  padding: 8px 12px; background: ${p => p.$on ? '#fef2f4' : '#fafafa'};
  border: 1.5px solid ${p => p.$on ? PINK : '#e5e7eb'};
  border-radius: 100px; font-size: 12.5px; font-weight: 600;
  color: ${p => p.$on ? PINK : '#4a4d55'}; cursor: pointer;
`;
const Consent = styled.div`
  display: flex; gap: 10px; padding: 12px 14px; background: ${p => p.$on ? '#fef2f4' : '#fafafa'};
  border-radius: 10px; align-items: flex-start; cursor: pointer;
  border: 1.5px solid ${p => p.$on ? '#fde8ec' : '#f1f2f4'};
  font-size: 12.5px; color: #2b2d33; line-height: 1.5; margin-bottom: 8px;
  strong { font-weight: 700; color: #15161a; }
`;
const ConsentBox = styled.div`
  width: 20px; height: 20px; border: 1.5px solid ${p => p.$on ? PINK : '#9ca0a8'};
  border-radius: 5px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  color: ${p => p.$on ? '#fff' : 'transparent'}; font-weight: 800; font-size: 12px;
  background: ${p => p.$on ? PINK : '#fff'}; margin-top: 1px;
`;
const FormError = styled.div`
  color: ${PINK}; font-size: 13px; font-weight: 600; margin: 8px 0 12px;
`;
const ModalActions = styled.div`
  padding: 14px 24px 22px; display: flex; gap: 8px; position: sticky; bottom: 0;
  background: #fff; border-top: 1px solid #f1f2f4;
`;
const GhostBtn = styled.button`
  flex: 1; padding: 12px 18px; border-radius: 10px; font-weight: 700; font-size: 14px;
  background: transparent; color: #4a4d55; border: 1.5px solid #e5e7eb; cursor: pointer;
`;
const PrimaryBtn = styled.button`
  flex: 1; padding: 12px 18px; border-radius: 10px; font-weight: 700; font-size: 14px;
  background: ${PINK}; color: #fff; border: none; cursor: pointer;
  box-shadow: 0 4px 12px rgba(232,57,95,.24);
  &:disabled { opacity: .5; cursor: not-allowed; background: #9ca0a8; box-shadow: none; }
`;
