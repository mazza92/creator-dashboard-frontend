import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { tokens } from '../theme/tokens';
import { Users, MapPin, Check } from 'lucide-react';

// Social platform icons
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// Platform colors for badges
const PLATFORM_STYLES = {
  tiktok: { bg: '#000000', color: '#fff' },
  instagram: { bg: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff' },
  youtube: { bg: '#FF0000', color: '#fff' },
  default: { bg: '#f3f4f6', color: '#374151' }
};

// Helper to get icon and style for content type
const getContentTypeConfig = (type) => {
  const lower = type.toLowerCase();
  if (lower.includes('tiktok')) {
    return { icon: <TikTokIcon />, style: PLATFORM_STYLES.tiktok, label: 'TikTok' };
  }
  if (lower.includes('reel')) {
    return { icon: <InstagramIcon />, style: PLATFORM_STYLES.instagram, label: 'Reel' };
  }
  if (lower.includes('story')) {
    return { icon: <InstagramIcon />, style: PLATFORM_STYLES.instagram, label: 'Story' };
  }
  if (lower.includes('instagram')) {
    return { icon: <InstagramIcon />, style: PLATFORM_STYLES.instagram, label: 'Instagram' };
  }
  if (lower.includes('youtube')) {
    return { icon: <YouTubeIcon />, style: PLATFORM_STYLES.youtube, label: 'YouTube' };
  }
  return { icon: null, style: PLATFORM_STYLES.default, label: type };
};

const getApiBase = () => {
  const base = process.env.REACT_APP_API_BASE ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');
  return base.replace(/\/+$/, '');
};
const API_BASE = getApiBase();
const FREE_APP_LIMIT = 3;

const inferNicheFromText = (text = '') => {
  const t = text.toLowerCase();
  if (/(parent|mom|dad|kids|family)/.test(t)) return 'Parenting';
  if (/(beauty|skincare|makeup)/.test(t)) return 'Beauty';
  if (/(fitness|gym|workout)/.test(t)) return 'Fitness';
  if (/(food|recipe|cook)/.test(t)) return 'Food';
  if (/(fashion|outfit|style)/.test(t)) return 'Fashion';
  return null;
};

/** Compact pay signal for the card — never dump long compensation blurbs. */
const formatPayLabel = (payLabel, prValueUsd) => {
  if (prValueUsd) return `$${prValueUsd}`;
  if (!payLabel) return null;
  const raw = String(payLabel).trim();
  const dollar = raw.match(/\$[\d,]+(?:\s*[-–]\s*\$?[\d,]+)?(?:\s*\/\s*\w+)?/);
  if (dollar) return dollar[0];
  if (/gift|free\s*product|product\s*only|pr\s*package/i.test(raw)) return 'Gifted product';
  if (/unpaid|no\s*pay/i.test(raw)) return 'Unpaid';
  if (/performance|bonus|volume|per\s*video|videos?\s*per/i.test(raw)) return 'Paid · volume + bonuses';
  if (/paid|ugc|rate|compensation/i.test(raw)) return 'Paid';
  if (raw.length <= 32) return raw;
  return 'Paid opportunity';
};

const OpportunitiesTab = ({ pitchLimits, onShowUpgrade, isPro, onCountChange, onLimitsChange }) => {
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState({ matched: [], others: [] });
  const [applying, setApplying] = useState(null);
  const [applied, setApplied] = useState(new Set());
  const [localUsed, setLocalUsed] = useState(null);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/opportunities/list`, {
        withCredentials: true
      });
      if (response.data.success) {
        const matched = response.data.matched || [];
        const others = response.data.others || [];
        setOpportunities({ matched, others });
        // Notify parent of total count for badge
        onCountChange?.(matched.length + others.length);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const usedApps = localUsed ?? pitchLimits?.used ?? 0;
  const creditsLeft = isPro ? FREE_APP_LIMIT : Math.max(0, FREE_APP_LIMIT - usedApps);
  const canApply = isPro || creditsLeft > 0;

  const openApplyTarget = (mode, url, email) => {
    if (mode === 'email' && email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent('Creator application via Newcollab')}`;
      return;
    }
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  /** Deduct quota via API, then open email / URL / kit success */
  const handleApply = async (opp) => {
    if (!canApply) {
      onShowUpgrade?.('opportunities');
      return;
    }

    setApplying(opp.id);
    try {
      const response = await axios.post(
        `${API_BASE}/api/opportunities/${opp.id}/apply`,
        {},
        { withCredentials: true }
      );
      const data = response.data || {};
      setApplied(prev => new Set([...prev, opp.id]));
      if (typeof data.used === 'number') {
        setLocalUsed(data.used);
        onLimitsChange?.(data.used);
      } else {
        setLocalUsed(usedApps + 1);
      }

      const mode = data.apply_mode || opp.apply_mode || 'kit';
      const url = data.external_apply_url || opp.external_apply_url;
      const email = data.apply_email || opp.apply_email;
      if (mode === 'url' || mode === 'email' || mode === 'external') {
        openApplyTarget(mode === 'external' ? (email && !url ? 'email' : 'url') : mode, url, email);
      }
    } catch (err) {
      if (err.response?.data?.error === 'limit_reached') {
        onShowUpgrade?.('opportunities');
      }
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return <LoadingText>Finding opportunities for you...</LoadingText>;
  }

  const allOpps = [...(opportunities.matched || []), ...(opportunities.others || [])];

  if (allOpps.length === 0) {
    return (
      <EmptyState>
        <EmptyIcon>📣</EmptyIcon>
        <EmptyTitle>No open opportunities right now</EmptyTitle>
        <EmptyText>Check back soon. New campaigns are added weekly.</EmptyText>
      </EmptyState>
    );
  }

  return (
    <Wrap>
      {/* Intro Card */}
      <IntroCard>
        <IntroIcon>📣</IntroIcon>
        <IntroText>
          <IntroTitle>Brands are looking for creators right now</IntroTitle>
          <IntroSub>Apply with one tap — we open the brand’s form or email. Each apply uses 1 credit.</IntroSub>
        </IntroText>
      </IntroCard>

      {/* Credit Indicator (free users only) — always 3/month for opportunities */}
      {!isPro && (
        <CreditRow>
          <CreditLeft>
            <CreditPips>
              {[...Array(FREE_APP_LIMIT)].map((_, i) => (
                <Pip key={i} $used={i >= creditsLeft} />
              ))}
            </CreditPips>
            <CreditText>
              <strong>{creditsLeft} application{creditsLeft !== 1 ? 's' : ''}</strong> left this month
            </CreditText>
          </CreditLeft>
          <CreditUpgrade onClick={() => onShowUpgrade?.('opportunities')}>
            Unlimited with Pro ›
          </CreditUpgrade>
        </CreditRow>
      )}

      {/* Matched to your niche */}
      {opportunities.matched?.length > 0 && (
        <SectionLabel>Matched to your niche</SectionLabel>
      )}

      {(opportunities.matched || []).map(opp => (
        <OppCard
          key={opp.id}
          opp={opp}
          isPro={isPro}
          applying={applying === opp.id}
          applied={applied.has(opp.id) || opp.already_applied}
          onApply={() => handleApply(opp)}
        />
      ))}

      {/* Open opportunities */}
      {opportunities.others?.length > 0 && (
        <SectionLabel style={{ marginTop: 8 }}>Open opportunities</SectionLabel>
      )}

      {(opportunities.others || []).map(opp => (
        <OppCard
          key={opp.id}
          opp={opp}
          isPro={isPro}
          applying={applying === opp.id}
          applied={applied.has(opp.id) || opp.already_applied}
          onApply={() => handleApply(opp)}
        />
      ))}
    </Wrap>
  );
};

const OppCard = ({ opp, isPro, applying, applied, onApply }) => {
  const mode = opp.apply_mode || (opp.external_apply_url ? 'url' : 'kit');
  const isExternal = mode === 'url' || mode === 'email' || mode === 'external' || opp.is_sourced;
  const platformLabel = opp.source_platform
    ? opp.source_platform.charAt(0).toUpperCase() + opp.source_platform.slice(1)
    : null;

  const inferredNiche = inferNicheFromText(
    `${opp.product_name || ''} ${opp.campaign_description || ''} ${(opp.creator_niches || []).join(' ')}`
  );
  const rawNiche =
    opp.display_niche ||
    (opp.creator_niches?.length ? opp.creator_niches[0] : null) ||
    (opp.brand_category && opp.brand_category.toLowerCase() !== 'other'
      ? String(opp.brand_category).replace(/_/g, ' ')
      : null);
  const nicheLabel =
    (rawNiche && String(rawNiche).length <= 28 ? rawNiche : null) ||
    inferredNiche ||
    (rawNiche ? String(rawNiche).split(/[,·(]/)[0].trim().slice(0, 24) : null) ||
    'Creator gig';

  const regions = (opp.shipping_regions || []).join(' / ') || 'Worldwide';
  const payLabel = formatPayLabel(opp.pay_label, opp.pr_value_usd);
  const payIsMoney = Boolean(payLabel && /^\$|paid/i.test(payLabel));

  const renderContentTypes = () => {
    if (!opp.content_types?.length) return null;
    return opp.content_types.map((type) => {
      const config = getContentTypeConfig(type);
      return (
        <PlatformBadge key={type} $bg={config.style.bg} $color={config.style.color}>
          {config.icon}
          {config.label}
        </PlatformBadge>
      );
    });
  };

  const buttonLabel = () => {
    if (applying) return 'Applying...';
    if (mode === 'email') return 'Email to apply';
    if (isExternal) return platformLabel ? `Apply here · ${platformLabel}` : 'Apply here';
    return 'Apply with media kit';
  };

  return (
    <Card>
      <CardTop>
        {opp.brand_logo_url ? (
          <BrandLogoImg src={opp.brand_logo_url} alt={opp.brand_name} />
        ) : (
          <BrandLogoFallback>{opp.brand_name.substring(0, 2).toUpperCase()}</BrandLogoFallback>
        )}
        <BrandBlock>
          <BrandNameRow>
            <BrandName>{opp.brand_name}</BrandName>
            <VerifiedBadge>
              <Check size={10} color="#fff" strokeWidth={3} />
            </VerifiedBadge>
          </BrandNameRow>
          <BrandSub>
            {nicheLabel} · Ships {regions}
          </BrandSub>
        </BrandBlock>
        <BadgeStack>
          <OpenBadge><LiveDot />Open</OpenBadge>
        </BadgeStack>
      </CardTop>

      {opp.product_name && <ProductName>{opp.product_name}</ProductName>}
      <CardDesc>{opp.campaign_description}</CardDesc>

      <ChipRow>
        {opp.follower_ranges?.length > 0 && (
          <Chip><Users size={12} /> {opp.follower_ranges.join(' or ')} followers</Chip>
        )}
        {renderContentTypes()}
        {opp.shipping_regions?.length > 0 && (
          <Chip><MapPin size={12} /> {opp.shipping_regions.join(' · ')}</Chip>
        )}
      </ChipRow>

      {payLabel && (
        <PayLine>
          <PayKey>{opp.is_sourced ? 'Pay' : 'PR value'}</PayKey>
          <PayVal $money={payIsMoney}>{payLabel}</PayVal>
        </PayLine>
      )}

      {applied ? (
        <AppliedState>
          <Check size={16} /> {isExternal ? 'Applied — link opened' : 'Applied - under brand review'}
        </AppliedState>
      ) : (
        <ApplyBtn type="button" onClick={onApply} disabled={applying}>
          {buttonLabel()}
        </ApplyBtn>
      )}

      {!applied && (
        <ApplyNote>
          {mode === 'email'
            ? 'Opens your email app · uses 1 application credit'
            : isExternal
              ? 'Opens the brand’s apply page · uses 1 application credit'
              : isPro
                ? 'Sends your media kit to the brand'
                : 'Uses 1 application credit'}
        </ApplyNote>
      )}
    </Card>
  );
};

// Styled Components
const Wrap = styled.div``;

const LoadingText = styled.p`
  font-size: 13px;
  color: ${tokens.textMuted};
  padding: 40px 0;
  text-align: center;
`;

const IntroCard = styled.div`
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
`;

const IntroIcon = styled.span`
  font-size: 28px;
  flex-shrink: 0;
`;

const IntroText = styled.div`
  flex: 1;
`;

const IntroTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${tokens.textPrimary};
  margin-bottom: 3px;
`;

const IntroSub = styled.div`
  font-size: 12px;
  color: ${tokens.textMuted};
  line-height: 1.5;
`;

const CreditRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 16px;
`;

const CreditLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CreditPips = styled.div`
  display: flex;
  gap: 4px;
`;

const Pip = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.$used ? '#e5e7eb' : tokens.textPrimary};
`;

const CreditText = styled.div`
  font-size: 12px;
  color: ${tokens.textMuted};

  strong {
    color: ${tokens.textPrimary};
    font-weight: 700;
  }
`;

const CreditUpgrade = styled.button`
  font-size: 12px;
  font-weight: 700;
  color: ${tokens.accent};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
`;

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${tokens.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 10px;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 12px;
  transition: box-shadow 0.15s;

  &:hover {
    box-shadow: 0 4px 18px rgba(0,0,0,0.07);
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
`;

const BrandLogoImg = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
`;

const BrandLogoFallback = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: ${tokens.textMuted};
  flex-shrink: 0;
`;

const BrandBlock = styled.div`
  flex: 1;
`;

const BrandNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 2px;
`;

const BrandName = styled.div`
  font-size: 15px;
  font-weight: 800;
  color: ${tokens.textPrimary};
`;

const VerifiedBadge = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${tokens.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const BrandSub = styled.div`
  font-size: 12px;
  color: ${tokens.textMuted};
`;

const BadgeStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const OpenBadge = styled.span`
  background: #d1fae5;
  color: #065f46;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LiveDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #059669;
`;

const UrgencyBadge = styled.span`
  background: ${p => p.$medium ? '#fef3c7' : '#fee2e2'};
  color: ${p => p.$medium ? '#92400e' : '#991b1b'};
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
`;

const ClosingBadge = styled.span`
  background: ${p => p.$critical ? '#fee2e2' : p.$high ? '#ffedd5' : '#fef3c7'};
  color: ${p => p.$critical ? '#991b1b' : p.$high ? '#c2410c' : '#92400e'};
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 3px;
  ${p => p.$critical && `
    animation: pulse 1.5s ease-in-out infinite;
  `}

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const ProductName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${tokens.textPrimary};
  margin-bottom: 6px;
`;

const CardDesc = styled.p`
  font-size: 13px;
  color: ${tokens.textSecondary};
  line-height: 1.6;
  margin-bottom: 14px;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
`;

const Chip = styled.div`
  background: #f9fafb;
  border: 1px solid ${tokens.border};
  border-radius: 8px;
  padding: 4px 9px;
  font-size: 11px;
  color: ${tokens.textSecondary};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PlatformBadge = styled.div`
  background: ${p => p.$bg};
  color: ${p => p.$color};
  border-radius: 20px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;

  svg {
    flex-shrink: 0;
  }
`;

const PayLine = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 14px;
  padding: 10px 0 0;
  border-top: 1px solid ${tokens.border};
`;

const PayKey = styled.span`
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: ${tokens.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const PayVal = styled.span`
  font-size: 13px;
  font-weight: ${p => (p.$money ? 700 : 600)};
  color: ${p => (p.$money ? '#059669' : tokens.textPrimary)};
  line-height: 1.35;
`;

const SpotsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
`;

const SpotsLabel = styled.span`
  font-size: 11px;
  color: ${tokens.textMuted};
  flex-shrink: 0;
`;

const SpotsTrack = styled.div`
  flex: 1;
  height: 5px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const SpotsFill = styled.div`
  height: 100%;
  border-radius: 4px;
  width: ${p => p.$percent}%;
  background: ${p => p.$urgency === 'critical' ? tokens.primary : p.$urgency === 'high' ? '#d97706' : '#059669'};
`;

const SpotsCount = styled.span`
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  color: ${p => p.$urgency === 'critical' ? tokens.primary : p.$urgency === 'high' ? '#d97706' : tokens.textSecondary};
`;

const ApplyBtn = styled.button`
  width: 100%;
  background: ${tokens.textPrimary};
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AppliedState = styled.div`
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #059669;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 10px;
  border: 1px solid #bbf7d0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ApplyNote = styled.div`
  font-size: 11px;
  color: ${tokens.textMuted};
  text-align: center;
  margin-top: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${tokens.textPrimary};
  margin-bottom: 8px;
`;

const EmptyText = styled.div`
  font-size: 14px;
  color: ${tokens.textMuted};
  margin-bottom: 24px;
`;

export default OpportunitiesTab;
