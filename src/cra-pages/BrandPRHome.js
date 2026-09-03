import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import api from '../config/api';
import UpgradeModal from '../creator-portal/UpgradeModal';
import { categoryEmoji, categoryLabel } from '../constants/brandCategories';
import { consumeUpgradeDeeplink, dismissUpgradeDeeplink, stripUpgradeQuery } from '../utils/upgradeDeeplink';
import { trackApplyEvent } from '../utils/applyAnalytics';
import { creatorTokens as tokens } from '../theme/creatorTokens';

const ROSE = '#E11D48';
const INK = tokens.ink;
const MUTED = tokens.muted;
const LINE = tokens.line;
const BG = tokens.paper;
const GREEN = tokens.accent;
const GREEN_BG = tokens.accentSoft;
const GREEN_DEEP = tokens.accentDeep;
const HOT = tokens.hot;
const CREAM = tokens.cream;
const FONT = tokens.fontSans;
const DISPLAY = tokens.fontDisplay;

const DIR_CHIPS = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'skincare', label: 'Skincare', emoji: categoryEmoji('skincare') },
  { id: 'beauty', label: 'Makeup', emoji: categoryEmoji('beauty') },
  { id: 'haircare', label: 'Hair', emoji: categoryEmoji('haircare') },
  { id: 'fashion', label: 'Fashion', emoji: categoryEmoji('fashion') },
  { id: 'wellness', label: 'Wellness', emoji: categoryEmoji('wellness') },
];

const TRACK_STEPS = [
  { label: 'Review', emoji: '👀' },
  { label: 'Ships', emoji: '📦' },
  { label: '3 posts', emoji: '📸' },
];

function statusToStage(status) {
  if (status === 'posted') return 2;
  if (status === 'ships') return 1;
  return 0;
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function logoHue(name) {
  let h = 0;
  for (const ch of String(name || '')) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 42% 38%)`;
}

function fmtFollowers(n) {
  const num = Number(n) || 0;
  if (num >= 1000) return `${Math.round(num / 1000)}K+`;
  if (num > 0) return `${num.toLocaleString()}+`;
  return 'Open to all sizes';
}

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [value];
    } catch {
      return value.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function shipsUS(regions) {
  return asList(regions).some((r) => /^(us|usa|united states|worldwide)$/i.test(String(r)));
}

function regionLabel(regions) {
  const list = asList(regions);
  if (!list.length) return '';
  return list.map((r) => (String(r).toUpperCase() === 'UNITED STATES' ? 'US' : r)).join(', ');
}

function collabLabel(type) {
  const t = String(type || 'gifted').toLowerCase();
  if (t.includes('gift')) return 'gifted';
  return t;
}

function cardStats(brand) {
  const stats = [];
  const min = Number(brand.minFollowers) || 0;
  stats.push({
    value: min > 0 ? fmtFollowers(min) : 'Any size',
    label: 'min following',
  });

  const rate = Number(brand.responseRate);
  if (Number.isFinite(rate) && rate > 0) {
    stats.push({ value: `${Math.round(rate)}%`, label: 'reply rate' });
  } else if (brand.avgResponseTime) {
    stats.push({ value: `~${brand.avgResponseTime}d`, label: 'avg reply' });
  }

  const ships = regionLabel(brand.regions);
  if (ships) stats.push({ value: ships, label: 'ships to' });

  if (brand.hasForm) stats.push({ value: 'PR form', label: 'we submit it' });
  else if (brand.microFriendly) stats.push({ value: 'Micro OK', label: 'open to small accounts' });

  const namedPlatforms = (brand.platforms || []).filter((p) => p && !/^socials?$/i.test(String(p)));
  if (namedPlatforms.length && stats.length < 4) {
    stats.push({ value: namedPlatforms.slice(0, 2).join(' + '), label: 'they want' });
  }

  return stats.slice(0, 4);
}

function productLine(brand) {
  const hero = brand.heroProduct;
  const value = brand.estimatedValue;
  if (hero && value) return `PR box could include ${hero} · ~$${value}`;
  if (hero) return `PR box could include ${hero}`;
  if (value) return `PR box typically ~$${value}`;
  return 'PR box: gifted product if they pick you';
}

function normalizeBrand(raw, appliedMap) {
  if (!raw) return null;
  const id = raw.id;
  const regions = asList(raw.regions);
  const platforms = asList(raw.platforms);
  const applied = appliedMap.get(id);
  return {
    id,
    slug: raw.slug,
    name: raw.name || raw.brand_name,
    logo: raw.logo || raw.logo_url,
    category: raw.category,
    description: raw.description,
    cover: raw.cover || raw.coverImage || raw.cover_image_url,
    website: raw.website,
    niches: asList(raw.niches),
    instagram: raw.instagram || raw.instagram_handle,
    tiktok: raw.tiktok || raw.tiktok_handle,
    avgResponseTime: raw.avg_response_time ?? raw.avgResponseTime,
    heroProduct: raw.hero_product || raw.heroProduct,
    minFollowers: raw.min_followers ?? raw.minFollowers ?? 0,
    microFriendly: !!(raw.micro_friendly ?? raw.microFriendly),
    regions,
    platforms,
    collaborationType: collabLabel(raw.collaboration_type || raw.collaborationType),
    estimatedValue: raw.estimated_value ?? raw.estimatedValue ?? raw.avg_product_value ?? raw.price_point ?? raw.pricePoint,
    matchScore: raw.match_score ?? raw.matchScore ?? null,
    hasForm: !!(raw.has_application_form || raw.hasApplication),
    hasEmail: !!(raw.has_email_contact || raw.hasEmailContact),
    responseRate: raw.response_rate ?? raw.responseRate,
    applyStatus: applied?.apply_status || raw.apply_status || null,
    applied: Boolean(applied || raw.apply_status),
  };
}

function websiteHost(url) {
  if (!url) return '';
  try {
    const href = url.startsWith('http') ? url : `https://${url}`;
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return String(url).replace(/^https?:\/\//, '').replace(/^www\./, '');
  }
}

function websiteHref(url) {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://${url}`;
}

function handleDisplay(handle) {
  if (!handle) return '';
  const h = String(handle).replace(/^https?:\/\/(www\.)?(instagram|tiktok)\.com\/@?/i, '').replace(/\/$/, '');
  return h.startsWith('@') ? h : `@${h}`;
}

function creditCopy(quota) {
  if (!quota) return 'Credits';
  if (quota.is_unlimited) return 'Pro · unlimited';
  const n = Number(quota.remaining);
  if (!Number.isFinite(n)) return 'Credits';
  if (n <= 0) return 'No credits left';
  return n === 1 ? '1 credit left' : `${n} credits left`;
}

function creditLimit(quota) {
  const limit = Number(quota?.limit);
  return Number.isFinite(limit) && limit > 0 ? Math.min(limit, 6) : 3;
}

function upgradeFeature(quota) {
  if (!quota || quota.is_unlimited) return 'credits';
  const n = Number(quota.remaining);
  if (n <= 0) return 'limit_reached';
  if (n === 1) return 'last_unlock';
  return 'credits';
}

function emitCredits(quota) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('nc-credits-changed', { detail: quota || null }));
}

function Paywall({ quota, isOpen, onClose }) {
  return (
    <UpgradeModal
      isOpen={isOpen}
      onClose={() => {
        dismissUpgradeDeeplink();
        onClose();
      }}
      currentCount={quota?.used || 0}
      limit={quota?.limit || 3}
      unlockRemaining={quota?.remaining ?? 0}
      feature={upgradeFeature(quota)}
    />
  );
}

export default function BrandPRHome() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = location.pathname.includes('pr-brands') ? 'dir' : 'foryou';

  const [quota, setQuota] = useState(null);
  const [appliedMap, setAppliedMap] = useState(() => new Map());
  const [matched, setMatched] = useState([]);
  const [dirBrands, setDirBrands] = useState([]);
  const [dirTotal, setDirTotal] = useState(0);
  const [userNiches, setUserNiches] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDir, setLoadingDir] = useState(false);
  const [dirQuery, setDirQuery] = useState('');
  const [dirCat, setDirCat] = useState('all');
  const [dirMicro, setDirMicro] = useState(false);
  const [dirUS, setDirUS] = useState(false);
  const [dirPage, setDirPage] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [showAc, setShowAc] = useState(false);
  const [acIndex, setAcIndex] = useState(-1);
  const acRef = useRef(null);
  const debounceRef = useRef(null);
  const sentinelRef = useRef(null);
  const fetchingDirRef = useRef(false);

  const [view, setView] = useState('list');
  const [step, setStep] = useState(1);
  const [current, setCurrent] = useState(null);
  const [pack, setPack] = useState(null);
  const [packLoading, setPackLoading] = useState(false);
  const [picked, setPicked] = useState([]);
  const [ship, setShip] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    phone: '',
  });
  const [saveShip, setSaveShip] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [doneBrand, setDoneBrand] = useState(null);
  const [relatedRemote, setRelatedRemote] = useState([]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const applySourceRef = useRef('foryou');

  const setTab = (name) => {
    navigate(name === 'dir' ? '/creator/dashboard/pr-brands' : '/creator/dashboard/for-you');
  };

  const mergeApplied = useCallback((list, map) => (
    (list || []).map((b) => normalizeBrand(b, map)).filter(Boolean)
  ), []);

  const loadCore = useCallback(async () => {
    setLoadingList(true);
    try {
      const [initRes, appsRes, forYouRes] = await Promise.all([
        api.get('/api/pr-crm/dashboard-init'),
        api.get('/api/pr-crm/applications'),
        api.get('/api/pr-crm/for-you'),
      ]);
      const nextQuota = initRes.data?.unlock_balance || null;
      setQuota(nextQuota);
      emitCredits(nextQuota);
      setUserNiches(initRes.data?.user_niches || []);

      const apps = appsRes.data?.applications || [];
      const map = new Map(apps.map((a) => [a.id, a]));
      setAppliedMap(map);

      const liveMatched = mergeApplied(forYouRes.data?.matched || [], map);
      const dropped = apps
        .filter((a) => !liveMatched.some((b) => b.id === a.id))
        .map((a) => normalizeBrand(a, map));
      setMatched([...dropped, ...liveMatched]);
    } catch (err) {
      console.error('Brand PR home load failed', err);
    } finally {
      setLoadingList(false);
    }
  }, [mergeApplied]);

  const loadDirectory = useCallback(async (page = 1, append = false, queryOverride) => {
    if (append && fetchingDirRef.current) return;
    fetchingDirRef.current = true;
    setLoadingDir(true);
    try {
      const params = {
        page,
        limit: 24,
      };
      const q = (queryOverride !== undefined ? queryOverride : dirQuery).trim();
      if (q) params.search = q;
      if (dirCat !== 'all') params.category = dirCat;
      if (dirUS) params.region = 'US';
      if (dirMicro) params.micro_friendly = '1';
      if (userNiches.length) params.prefer_niches = userNiches.join(',');
      const { data } = await api.get('/api/public/brands', { params });
      const mapped = mergeApplied(data.brands || [], new Map());
      setDirBrands((prev) => (append ? [...prev, ...mapped.filter((b) => !prev.some((p) => p.id === b.id))] : mapped));
      setDirTotal(Number(data.pagination?.total) || mapped.length);
      setDirPage(page);
    } catch (err) {
      console.error('Directory load failed', err);
      if (!append) setDirBrands([]);
    } finally {
      fetchingDirRef.current = false;
      setLoadingDir(false);
    }
  }, [dirCat, dirMicro, dirQuery, dirUS, mergeApplied, userNiches]);

  useEffect(() => {
    loadCore();
  }, [loadCore]);

  useEffect(() => {
    if (view !== 'list') return;
    trackApplyEvent('apply_home_view', { source: tab === 'dir' ? 'directory' : 'foryou' });
  }, [tab, view]);

  useEffect(() => {
    if (view !== 'done' || !doneBrand?.id) {
      setRelatedRemote([]);
      return;
    }
    let cancelled = false;
    api.get(`/api/pr-crm/related/${doneBrand.id}`)
      .then(({ data }) => {
        if (cancelled) return;
        const list = (data?.brands || []).map((b) => normalizeBrand(b, appliedMap)).filter(Boolean);
        setRelatedRemote(list.slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setRelatedRemote([]);
      });
    return () => { cancelled = true; };
  }, [view, doneBrand, appliedMap]);

  useEffect(() => {
    if (tab !== 'dir') return;
    loadDirectory(1, false);
    // Search is submitted explicitly; do not refetch while typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, dirCat, dirMicro, dirUS, userNiches]);

  useEffect(() => {
    const feature = consumeUpgradeDeeplink(searchParams);
    if (!feature) return;
    applySourceRef.current = 'deeplink';
    trackApplyEvent('apply_paywall', { source: 'deeplink', meta: { reason: feature } });
    setShowUpgrade(true);
    const { next, changed } = stripUpgradeQuery(searchParams);
    if (changed) setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const slug = searchParams.get('brand');
    if (!slug || loadingList) return;
    const fromLists = [...matched, ...dirBrands].find((b) => b.slug === slug);
    const open = async () => {
      if (fromLists) {
        openApply(fromLists, 'deeplink');
      } else {
        try {
          const { data } = await api.get('/api/public/brands', { params: { slug, limit: 1 } });
          const brand = (data.brands || [])[0];
          if (brand) openApply(normalizeBrand(brand, appliedMap), 'deeplink');
        } catch (err) {
          console.error('Deep-link brand failed', err);
        }
      }
      const next = new URLSearchParams(searchParams);
      next.delete('brand');
      setSearchParams(next, { replace: true });
    };
    open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loadingList]);

  async function openApply(brand, source) {
    if (!brand) return;
    if (brand.applied) return;
    applySourceRef.current = source || (tab === 'dir' ? 'directory' : 'foryou');
    const remaining = quota?.is_unlimited ? 99 : Number(quota?.remaining);
    if (Number.isFinite(remaining) && remaining <= 0) {
      trackApplyEvent('apply_paywall', {
        source: applySourceRef.current,
        brand_id: brand.id,
        meta: { reason: 'no_credits' },
      });
      setShowUpgrade(true);
      return;
    }
    trackApplyEvent('apply_opened', { source: applySourceRef.current, brand_id: brand.id });
    setCurrent(brand);
    setView('apply');
    setStep(1);
    setPicked([]);
    setAgreed(false);
    setSubmitError('');
    setPack(null);
    setPackLoading(true);
    try {
      const { data } = await api.get(`/api/pr-crm/apply-pack/${brand.id}`);
      setPack(data);
      if (data.brand) {
        setCurrent((prev) => normalizeBrand({
          ...data.brand,
          match_score: prev?.matchScore ?? data.brand.match_score,
          apply_status: prev?.applyStatus,
        }, appliedMap) || prev);
      }
      if (data.already_applied) {
        setAppliedMap((prev) => {
          const next = new Map(prev);
          next.set(brand.id, { ...brand, apply_status: data.apply_status || 'review' });
          return next;
        });
        setMatched((prev) => prev.map((b) => (b.id === brand.id ? { ...b, applied: true, applyStatus: data.apply_status || 'review' } : b)));
        setDirBrands((prev) => prev.map((b) => (b.id === brand.id ? { ...b, applied: true, applyStatus: data.apply_status || 'review' } : b)));
        setView('list');
        return;
      }
      const saved = data.shipping || {};
      setShip((prev) => ({
        ...prev,
        full_name: saved.full_name || prev.full_name,
        address_line1: saved.address_line1 || prev.address_line1,
        address_line2: saved.address_line2 || prev.address_line2,
        city: saved.city || prev.city,
        state: saved.state || saved.region || prev.state,
        zip: saved.zip || saved.postal_code || prev.zip,
        country: saved.country || prev.country,
        phone: saved.phone || prev.phone,
      }));
    } catch (err) {
      console.error('Apply pack failed', err);
      setSubmitError('Could not load this apply. Try again.');
    } finally {
      setPackLoading(false);
    }
  }

  function togglePost(post) {
    const key = post.post_url;
    setPicked((prev) => {
      if (prev.some((p) => p.post_url === key)) return prev.filter((p) => p.post_url !== key);
      if (prev.length >= 3) return prev;
      return [...prev, post];
    });
  }

  function shipReady() {
    return Boolean(ship.address_line1.trim() && ship.city.trim() && ship.zip.trim());
  }

  async function submitApply() {
    if (!current) return;
    if (picked.length !== 3) {
      setSubmitError('Pick 3 posts.');
      setStep(2);
      return;
    }
    if (!shipReady()) {
      setSubmitError('Add a full shipping address.');
      return;
    }
    if (!agreed) {
      setSubmitError('Agree to the content requests to apply.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const { data } = await api.post(`/api/pr-crm/brands/${current.id}/apply`, {
        selected_posts: picked.map((p) => ({
          post_url: p.post_url,
          thumbnail_url: p.thumbnail_url || '',
        })),
        shipping: ship,
        save_shipping: saveShip,
        agreed: true,
        source: applySourceRef.current || (tab === 'dir' ? 'directory' : 'foryou'),
      });
      trackApplyEvent('apply_submitted', {
        source: applySourceRef.current,
        brand_id: current.id,
        meta: { application_id: data.application_id || null },
      });
      if (data.quota) {
        setQuota(data.quota);
        emitCredits(data.quota);
      }
      const nextApp = { ...current, apply_status: data.status || 'review' };
      setAppliedMap((prev) => {
        const next = new Map(prev);
        next.set(current.id, nextApp);
        return next;
      });
      const mark = (b) => (b.id === current.id ? { ...b, applied: true, applyStatus: data.status || 'review' } : b);
      setMatched((prev) => {
        const exists = prev.some((b) => b.id === current.id);
        return exists ? prev.map(mark) : [{ ...current, applied: true, applyStatus: data.status || 'review' }, ...prev];
      });
      setDirBrands((prev) => prev.map(mark));
      setDoneBrand(current);
      setView('done');
    } catch (err) {
      const status = err.response?.status;
      const payload = err.response?.data || {};
      if (status === 402 || payload.paywall) {
        const nextQuota = { ...(quota || {}), remaining: 0, used: quota?.limit || 3, is_unlimited: false };
        setQuota(nextQuota);
        emitCredits(nextQuota);
        showPaywall('submit_402', applySourceRef.current);
        return;
      }
      if (status === 409) {
        setMatched((prev) => prev.map((b) => (b.id === current.id ? { ...b, applied: true, applyStatus: 'review' } : b)));
        setView('list');
        return;
      }
      setSubmitError(payload.error || 'Could not apply. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const relatedLocal = useMemo(() => {
    if (!doneBrand) return [];
    const pool = [...dirBrands, ...matched].filter((b) => b.id !== doneBrand.id && !b.applied);
    const same = pool.filter((b) => b.category && b.category === doneBrand.category);
    const rest = pool.filter((b) => !same.includes(b));
    return [...same, ...rest].slice(0, 4);
  }, [doneBrand, dirBrands, matched]);
  const related = relatedRemote.length ? relatedRemote : relatedLocal;

  function defaultApplySource() {
    return tab === 'dir' ? 'directory' : 'foryou';
  }

  function showPaywall(reason, source) {
    trackApplyEvent('apply_paywall', {
      source: source || applySourceRef.current || defaultApplySource(),
      brand_id: current?.id || doneBrand?.id || null,
      meta: { reason: reason || 'credits' },
    });
    setShowUpgrade(true);
  }

  const remaining = quota?.is_unlimited ? 99 : Number(quota?.remaining);
  const noCredits = Number.isFinite(remaining) && remaining <= 0 && !quota?.is_unlimited;
  const forYouCards = useMemo(() => mergeApplied(matched, appliedMap), [matched, appliedMap, mergeApplied]);
  const dirCards = useMemo(() => mergeApplied(dirBrands, appliedMap), [dirBrands, appliedMap, mergeApplied]);
  const hasMoreDir = dirCards.length > 0 && dirCards.length < dirTotal;

  useEffect(() => {
    if (tab !== 'dir' || !hasMoreDir) return;
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      if (fetchingDirRef.current) return;
      loadDirectory(dirPage + 1, true);
    }, { rootMargin: '560px 0px' });
    io.observe(node);
    return () => io.disconnect();
  }, [tab, hasMoreDir, dirPage, loadDirectory]);

  function renderCard(brand, variant) {
    const stats = cardStats(brand);
    const cat = brand.category || '';
    const catEmoji = categoryEmoji(cat);
    const catName = categoryLabel(cat);
    return (
      <Card key={brand.id}>
        {brand.cover && (
          <CardMedia>
            <CardCover src={brand.cover} alt="" />
            <CoverChips>
              {catName && (
                <CatChip>
                  <span aria-hidden="true">{catEmoji}</span> {catName}
                </CatChip>
              )}
              {brand.microFriendly && (
                <CatChip $tone="ok">
                  <span aria-hidden="true">🌱</span> Micro
                </CatChip>
              )}
            </CoverChips>
          </CardMedia>
        )}
        <CardBody>
          <Row1>
            {brand.logo ? (
              <LogoImg src={brand.logo} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <LogoFallback style={{ background: logoHue(brand.name) }}>{initials(brand.name)}</LogoFallback>
            )}
            <Meta>
              <h3>{brand.name}</h3>
              {!brand.cover && (
                <ChipRow>
                  {catName && (
                    <CatChip>
                      <span aria-hidden="true">{catEmoji}</span> {catName}
                    </CatChip>
                  )}
                  {brand.microFriendly && (
                    <CatChip $tone="ok">
                      <span aria-hidden="true">🌱</span> Micro
                    </CatChip>
                  )}
                </ChipRow>
              )}
            </Meta>
            <Badges>
              {brand.matchScore != null && (
                <Score><b>{Math.round(brand.matchScore)}%</b> fit</Score>
              )}
              {brand.applied && <AppliedBadge>Applied</AppliedBadge>}
            </Badges>
          </Row1>
          <Offer>
            <OfferKicker>Could be in the PR box</OfferKicker>
            <strong>{brand.heroProduct || 'A gifted product they choose'}</strong>
            <span>
              {brand.estimatedValue
                ? `Typical value ~$${brand.estimatedValue} if they pick you`
                : 'Gifted product if they pick you — they pick what’s in the box'}
            </span>
          </Offer>
          {variant === 'dir' && brand.description && <Blurb>{brand.description}</Blurb>}
          {stats.length > 0 && (
            <StatGrid>
              {stats.map((s) => (
                <Stat key={`${s.value}-${s.label}`}>
                  <b>{s.value}</b>
                  <em>{s.label}</em>
                </Stat>
              ))}
            </StatGrid>
          )}
          {brand.applied ? (
            <Tracker stage={statusToStage(brand.applyStatus)} compact />
          ) : noCredits ? (
            <Cta type="button" onClick={() => showPaywall('card_credits')}>Get more credits</Cta>
          ) : (
            <Cta type="button" onClick={() => openApply(brand)}>Apply for Brand PR</Cta>
          )}
        </CardBody>
      </Card>
    );
  }

  const fetchSuggestions = useCallback(async (query) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowAc(false);
      return;
    }
    try {
      const { data } = await api.get('/api/pr-crm/brands/search-suggestions', { params: { q: query.trim() } });
      const list = data?.suggestions || [];
      setSuggestions(list);
      setShowAc(true);
      setAcIndex(-1);
    } catch (err) {
      setSuggestions([]);
    }
  }, []);

  function onSearchChange(value) {
    setDirQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 150);
  }

  function pickSuggestion(suggestion) {
    setShowAc(false);
    setSuggestions([]);
    setDirQuery(suggestion.name);
    loadDirectory(1, false, suggestion.name);
  }

  function onSearchKeyDown(e) {
    if (!showAc || !suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAcIndex((i) => (i < suggestions.length - 1 ? i + 1 : i));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAcIndex((i) => (i > 0 ? i - 1 : -1));
    } else if (e.key === 'Enter' && acIndex >= 0 && suggestions[acIndex]) {
      e.preventDefault();
      pickSuggestion(suggestions[acIndex]);
    } else if (e.key === 'Escape') {
      setShowAc(false);
      setAcIndex(-1);
    }
  }

  useEffect(() => {
    const onDoc = (event) => {
      if (acRef.current && !acRef.current.contains(event.target)) {
        setShowAc(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function runDirSearch(e) {
    e.preventDefault();
    setShowAc(false);
    loadDirectory(1, false);
  }

  if (view === 'apply' && current) {
    const posts = pack?.posts || [];
    const examples = pack?.examples || [];
    return (
      <Page $narrow>
        <ApplyTop>
          <Back type="button" onClick={() => (step === 1 ? setView('list') : setStep(step - 1))}>←</Back>
          <Stepper>
            <Dot $on={step === 1} />
            <StepLine />
            <Dot $on={step === 2} />
            <StepLine />
            <Dot $on={step === 3} />
          </Stepper>
          <span style={{ width: 28 }} />
        </ApplyTop>
        <StepLabel>Request PR package in 3 steps</StepLabel>
        <Block style={{ marginTop: 8 }}>
          {step === 1 && current.cover && (
            <Cover src={current.cover} alt="" />
          )}
          <BrandHead>
            {current.logo ? <LogoImg src={current.logo} alt="" /> : <LogoFallback style={{ background: logoHue(current.name) }}>{initials(current.name)}</LogoFallback>}
            <div>
              <h3>{current.name}</h3>
              <p>{categoryEmoji(current.category || '')} {categoryLabel(current.category || '')} · {productLine(current)}</p>
              {current.website && (
                <WebLink href={websiteHref(current.website)} target="_blank" rel="noopener noreferrer">
                  {websiteHost(current.website)}
                </WebLink>
              )}
            </div>
          </BrandHead>
        </Block>

        {packLoading && <Hint>Loading apply details…</Hint>}

        {step === 1 && (
          <>
            {current.description && (
              <Block>
                <h2>About</h2>
                <AboutText>{current.description}</AboutText>
              </Block>
            )}
            <Block>
              <h2>What they look for</h2>
              <FactGrid>
                {current.responseRate != null && Number(current.responseRate) > 0 && (
                  <Fact><b>{Math.round(Number(current.responseRate))}%</b><em>reply rate</em></Fact>
                )}
                <Fact><b>{current.estimatedValue ? `~$${current.estimatedValue}` : 'Gifted'}</b><em>PR value</em></Fact>
                <Fact><b>{fmtFollowers(current.minFollowers)}</b><em>min followers</em></Fact>
                {current.avgResponseTime ? (
                  <Fact><b>~{current.avgResponseTime}d</b><em>avg reply</em></Fact>
                ) : null}
              </FactGrid>
              <Pills>
                <Pill>{current.collaborationType || 'gifted'}</Pill>
                {current.microFriendly && <Pill>Works with micro-creators</Pill>}
                {current.hasForm && <Pill>Program form</Pill>}
                {regionLabel(current.regions) && <Pill>Ships {regionLabel(current.regions)}</Pill>}
                {(current.platforms || []).map((p) => <Pill key={p}>{p}</Pill>)}
                {(current.niches || []).slice(0, 4).map((n) => <Pill key={n}>{categoryEmoji(n)} {categoryLabel(n)}</Pill>)}
              </Pills>
              {(current.instagram || current.tiktok) && (
                <SocialRow>
                  {current.instagram && (
                    <SocialA href={`https://instagram.com/${String(current.instagram).replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                      IG {handleDisplay(current.instagram)}
                    </SocialA>
                  )}
                  {current.tiktok && (
                    <SocialA href={`https://www.tiktok.com/@${String(current.tiktok).replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                      TikTok {handleDisplay(current.tiktok)}
                    </SocialA>
                  )}
                </SocialRow>
              )}
            </Block>
            <Block>
              <h2>What their last PR looked like</h2>
              {examples.length ? (
                <EmbedRow>
                  {examples.map((ex) => {
                    const isTikTok = (ex.platform === 'tiktok' || /^\d{8,}$/.test(String(ex.id || ''))) && String(ex.id || '').length >= 8;
                    if (isTikTok) {
                      return (
                        <Embed key={ex.id}>
                          <iframe
                            title={ex.title}
                            src={`https://www.tiktok.com/player/v1/${ex.id}?music_info=0&description=0`}
                            allow="fullscreen"
                          />
                          <div className="cap"><b>{ex.title}</b>{ex.handle}</div>
                        </Embed>
                      );
                    }
                    return (
                      <ThumbCard key={ex.id} href={ex.url} target="_blank" rel="noopener noreferrer">
                        {ex.thumbnail_url ? <img src={ex.thumbnail_url} alt="" /> : <div className="ph" />}
                        <div className="cap"><b>{ex.title}</b>{ex.handle || 'Instagram'}</div>
                      </ThumbCard>
                    );
                  })}
                </EmbedRow>
              ) : (
                <EmptyNote>No recent PR campaigns yet</EmptyNote>
              )}
            </Block>
            <Foot>
              <Cta type="button" onClick={() => setStep(2)}>Apply for Brand PR</Cta>
            </Foot>
          </>
        )}

        {step === 2 && (
          <>
            <Block>
              <h2>Show them your best 3</h2>
              <Sub>Pick 3 posts. Required. This is what they see on your fit card. Fresh each apply.</Sub>
              {posts.length ? (
                <Picker>
                  {posts.map((post) => {
                    const on = picked.some((p) => p.post_url === post.post_url);
                    return (
                      <Post
                        key={post.post_url}
                        type="button"
                        $on={on}
                        style={{ backgroundImage: post.thumbnail_url ? `url(${post.thumbnail_url})` : undefined }}
                        onClick={() => togglePost(post)}
                      >
                        <span className="tick">{on ? '✓' : ''}</span>
                      </Post>
                    );
                  })}
                </Picker>
              ) : (
                <EmptyNote>We could not load posts from your connected account yet. Reconnect TikTok or Instagram, then try again.</EmptyNote>
              )}
            </Block>
            <Foot>
              <Cta type="button" disabled={picked.length !== 3} onClick={() => setStep(3)}>Continue</Cta>
              <Note>Pick 3 posts. Required. {picked.length} of 3 selected</Note>
            </Foot>
          </>
        )}

        {step === 3 && (
          <>
            <Block>
              <h2>Where should the box go?</h2>
              <Sub>Only used if they pick you. Saved after the first apply.</Sub>
              <Lab>Full name</Lab>
              <Input value={ship.full_name} onChange={(e) => setShip({ ...ship, full_name: e.target.value })} placeholder="Maya Chen" />
              <Lab>Address line 1</Lab>
              <Input value={ship.address_line1} onChange={(e) => setShip({ ...ship, address_line1: e.target.value })} placeholder="1847 Barton Springs Rd" />
              <Lab>Address line 2</Lab>
              <Input value={ship.address_line2} onChange={(e) => setShip({ ...ship, address_line2: e.target.value })} placeholder="Apt, suite (optional)" />
              <Grid2>
                <div>
                  <Lab>City</Lab>
                  <Input value={ship.city} onChange={(e) => setShip({ ...ship, city: e.target.value })} placeholder="Austin" />
                </div>
                <div>
                  <Lab>Region / state</Lab>
                  <Input value={ship.state} onChange={(e) => setShip({ ...ship, state: e.target.value })} placeholder="TX" />
                </div>
              </Grid2>
              <Grid2>
                <div>
                  <Lab>Postal code</Lab>
                  <Input value={ship.zip} onChange={(e) => setShip({ ...ship, zip: e.target.value })} placeholder="78704" />
                </div>
                <div>
                  <Lab>Country</Lab>
                  <Select value={ship.country} onChange={(e) => setShip({ ...ship, country: e.target.value })}>
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                  </Select>
                </div>
              </Grid2>
              <Lab>Phone (carrier)</Lab>
              <Input value={ship.phone} onChange={(e) => setShip({ ...ship, phone: e.target.value })} placeholder="+1 512 555 0199" />
              <SaveRow>
                <input type="checkbox" checked={saveShip} onChange={(e) => setSaveShip(e.target.checked)} />
                Save for the next apply
              </SaveRow>
            </Block>
            <Block>
              <h2>If they ship</h2>
              <Agree>
                <li><strong>Product only.</strong> No payment.</li>
                <li>If they send a box: <strong>one post</strong> on your account + <strong>one photo or video</strong> they can reuse as ads.</li>
                <li>Post within 14 days of delivery.</li>
              </Agree>
              <Chk>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                I agree with content requests
              </Chk>
            </Block>
            <Foot>
              <Cta type="button" disabled={submitting || !agreed || !shipReady()} onClick={submitApply}>
                {submitting ? 'Applying…' : 'Apply for Brand PR'}
              </Cta>
              {submitError && <Note style={{ color: ROSE }}>{submitError}</Note>}
              <Note>We add you to their list. The brand never gets a cold email from you.</Note>
            </Foot>
          </>
        )}
        <Paywall quota={quota} isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </Page>
    );
  }

  if (view === 'done' && doneBrand) {
    return (
      <Page $narrow>
        <Done>
          <CheckMark>✓</CheckMark>
          <h2>You’re in the running</h2>
          <p>
            {doneBrand.name} will see your posts and where to ship. If they pick you, the box comes to your address. We’ll email you either way.
          </p>
        </Done>
        {noCredits && (
          <OutBanner type="button" onClick={() => showPaywall('done_last_credit')}>
            <b>That was your last free credit</b>
            <span>Go Pro to apply to every brand that gifts your size. No pitch.</span>
          </OutBanner>
        )}
        <Tracker stage={0} />
        <Related>
          <h3>More brands like this</h3>
          <p className="sub">Same kind of gift. Tap a row to apply.</p>
          <RelGrid>
            {related.length ? related.map((b) => (
              <Rel
                key={b.id}
                type="button"
                onClick={() => {
                  trackApplyEvent('apply_related_click', { source: 'related', brand_id: b.id });
                  openApply(b, 'related');
                }}
              >
                {b.logo ? (
                  <RelMark src={b.logo} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <RelFallback style={{ background: logoHue(b.name) }}>{initials(b.name)}</RelFallback>
                )}
                <RelMeta>
                  <h4>{b.name}</h4>
                  <CatChip>
                    <span aria-hidden="true">{categoryEmoji(b.category || '')}</span>
                    {categoryLabel(b.category || '') || 'Brand'}
                  </CatChip>
                </RelMeta>
                <RelGo>Apply →</RelGo>
              </Rel>
            )) : (
              <EmptyNote className="empty">Browse Directory for more brands that gift your size.</EmptyNote>
            )}
          </RelGrid>
          <Note>
            <Back type="button" onClick={() => { setView('list'); setTab('dir'); }}>Browse Directory</Back>
          </Note>
        </Related>
        <Paywall quota={quota} isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </Page>
    );
  }

  return (
    <Page>
      <ListHead>
        <Hero>
          <div>
            <Eyebrow>{tab === 'foryou' ? 'For your following' : 'Search the roster'}</Eyebrow>
            <h1>
              {tab === 'foryou' ? <>Brands waiting to <em>gift you</em></> : <>Find a box you <em>want</em></>}
            </h1>
            <p>
              {tab === 'foryou'
                ? (noCredits
                  ? 'No free credits left. Go Pro to keep requesting boxes this month.'
                  : remaining === 1
                    ? 'Last free credit this month. Pick a brand you’d actually post.'
                    : 'Apply in 3 steps. We take it to the brand. You never write a pitch.')
                : (noCredits
                  ? 'No free credits left. Go Pro to apply from Directory too.'
                  : 'Same 3-step apply. We submit. They pick.')}
            </p>
          </div>
          <CreditMeter quota={quota} onClick={() => { if (!quota?.is_unlimited) showPaywall('meter'); }} />
        </Hero>
      </ListHead>

      {tab === 'foryou' && (
        <>
          <List>
            {loadingList && !forYouCards.length && <EmptyNote>Finding brands that gift your following…</EmptyNote>}
            {!loadingList && !forYouCards.length && <EmptyNote>No matches yet. Open Directory and request a box from a brand you like.</EmptyNote>}
            {forYouCards.map((b) => renderCard(b, 'foryou'))}
          </List>
        </>
      )}

      {tab === 'dir' && (
        <>
          <SearchRow onSubmit={runDirSearch} ref={acRef}>
            <SearchField
              type="search"
              value={dirQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={onSearchKeyDown}
              onFocus={() => dirQuery.trim().length >= 2 && suggestions.length > 0 && setShowAc(true)}
              placeholder={dirTotal > 0 ? `Search ${dirTotal.toLocaleString()} brands…` : 'Search a brand you want a box from'}
              autoComplete="off"
              aria-label="Search brands"
              aria-autocomplete="list"
            />
            <SearchBtn type="submit">Search</SearchBtn>
            <AcDropdown $open={showAc && dirQuery.trim().length >= 2}>
              {suggestions.length > 0 ? (
                suggestions.map((s, idx) => (
                  <AcItem
                    key={s.id}
                    type="button"
                    className={acIndex === idx ? 'active' : ''}
                    onMouseDown={() => pickSuggestion(s)}
                    onMouseEnter={() => setAcIndex(idx)}
                  >
                    <AcLogo $hasImage={!!s.logo}>
                      {s.logo ? (
                        <img src={s.logo} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      ) : initials(s.name)[0]}
                    </AcLogo>
                    <span>
                      <b>{s.name}</b>
                      <em>{s.category ? `${categoryEmoji(s.category)} ${categoryLabel(s.category)}` : 'Brand'}</em>
                    </span>
                  </AcItem>
                ))
              ) : (
                <AcEmpty>Press Search to find “{dirQuery}”</AcEmpty>
              )}
            </AcDropdown>
          </SearchRow>
          <Chips>
            {DIR_CHIPS.map((c) => (
              <Chip key={c.id} type="button" $on={dirCat === c.id} onClick={() => setDirCat(c.id)}>
                <span aria-hidden="true">{c.emoji}</span> {c.label}
              </Chip>
            ))}
            <Chip type="button" $on={dirMicro} onClick={() => setDirMicro((v) => !v)}>
              <span aria-hidden="true">🌱</span> Micro-friendly
            </Chip>
            <Chip type="button" $on={dirUS} onClick={() => setDirUS((v) => !v)}>
              <span aria-hidden="true">🇺🇸</span> Ships US
            </Chip>
          </Chips>
          <DirCount>
            {dirCards.length > 0
              ? `Showing ${dirCards.length.toLocaleString()} of ${dirTotal.toLocaleString()} ${dirTotal === 1 ? 'brand' : 'brands'}`
              : `${dirTotal.toLocaleString()} ${dirTotal === 1 ? 'brand' : 'brands'}`}
          </DirCount>
          <List>
            {loadingDir && !dirCards.length && <EmptyNote>Searching brands…</EmptyNote>}
            {!loadingDir && !dirCards.length && <EmptyNote>No brands match. Try another search or clear a filter.</EmptyNote>}
            {dirCards.map((b) => renderCard(b, 'dir'))}
            {hasMoreDir && (
              <MoreSentinel ref={sentinelRef}>
                {loadingDir ? 'Loading more brands…' : 'Scroll for more'}
              </MoreSentinel>
            )}
            {!hasMoreDir && dirCards.length > 0 && (
              <MoreSentinel as="p">That’s all {dirTotal.toLocaleString()} brands for this search.</MoreSentinel>
            )}
          </List>
        </>
      )}

      <Paywall quota={quota} isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </Page>
  );
}

function CreditMeter({ quota, onClick }) {
  const remaining = quota?.is_unlimited ? null : Number(quota?.remaining);
  const limit = creditLimit(quota);
  const out = remaining != null && Number.isFinite(remaining) && remaining <= 0;
  const low = remaining != null && Number.isFinite(remaining) && remaining <= 1;
  return (
    <QuotaBtn type="button" onClick={onClick} $out={out} $low={low} $pro={!!quota?.is_unlimited}>
      {!quota?.is_unlimited && Number.isFinite(remaining) && (
        <Dots aria-hidden="true">
          {Array.from({ length: limit }).map((_, i) => (
            <i key={i} className={i < remaining ? 'on' : ''} />
          ))}
        </Dots>
      )}
      <span>{creditCopy(quota)}</span>
      {!quota?.is_unlimited && Number.isFinite(remaining) && remaining > 0 && (
        <CreditHint>this month · first PR starts here</CreditHint>
      )}
    </QuotaBtn>
  );
}

function Tracker({ stage = 0, compact = false }) {
  const fill = Math.max(0, stage) * 33.333;
  return (
    <TrackerBox $compact={compact}>
      <Track>
        <Bar />
        <Fill style={{ width: `${fill}%` }} />
        {TRACK_STEPS.map((step, i) => (
          <Tcol key={step.label} className={i < stage ? 'done' : i === stage ? 'now' : ''}>
            <Node aria-hidden="true">{i < stage ? '✓' : step.emoji}</Node>
            <span>{step.label}</span>
          </Tcol>
        ))}
      </Track>
      {!compact && <TrackNote>They only ship if they pick you.</TrackNote>}
    </TrackerBox>
  );
}

const Page = styled.div`
  width: 100%;
  max-width: ${(p) => (p.$narrow ? '560px' : '1120px')};
  margin: 0 auto;
  padding: ${(p) => (p.$narrow ? '8px 16px 48px' : '16px clamp(16px, 4vw, 32px) 72px')};
  background: transparent;
  min-height: calc(100vh - 80px);
  font-family: ${FONT};
  color: ${INK};
  box-sizing: border-box;
`;
const ListHead = styled.div`
  padding-bottom: 4px;
`;
const Hero = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 20px 28px;
  padding: 12px 0 22px;

  h1 {
    font-family: ${DISPLAY};
    font-size: clamp(26px, 4.2vw, 42px);
    font-weight: 400;
    letter-spacing: -.03em;
    line-height: 1.1;
    margin: 0;
  }
  h1 em {
    font-style: italic;
    color: ${GREEN_DEEP};
  }
  p {
    font-size: clamp(14px, 1.6vw, 16px);
    color: ${MUTED};
    margin: 10px 0 0;
    max-width: 34rem;
    line-height: 1.5;
  }

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
    padding: 8px 0 16px;
  }
`;
const Eyebrow = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${GREEN_DEEP};
  margin-bottom: 8px;
`;
const QuotaBtn = styled.button`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  background: ${(p) => (p.$out ? '#FFF1F2' : p.$low ? '#FFF7ED' : CREAM)};
  border: 1px solid ${(p) => (p.$out ? ROSE : p.$low ? '#FDBA74' : tokens.accentBorder)};
  color: ${(p) => (p.$out ? ROSE : GREEN_DEEP)};
  border-radius: 16px;
  padding: 12px 14px;
  white-space: nowrap;
  cursor: ${(p) => (p.$pro ? 'default' : 'pointer')};
  box-shadow: ${tokens.shadowCard};
  min-width: 156px;

  @media (max-width: 800px) {
    flex-direction: row;
    align-items: center;
    width: 100%;
    min-width: 0;
    white-space: normal;
    padding: 10px 12px;
  }
`;
const Dots = styled.span`
  display: inline-flex;
  gap: 5px;
  i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #e4e2dc;
    display: block;
  }
  i.on { background: ${GREEN}; }
`;
const CreditHint = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${MUTED};
  white-space: normal;
  line-height: 1.3;
  max-width: 140px;

  @media (max-width: 800px) { display: none; }
`;
const OutBanner = styled.button`
  display: block;
  width: 100%;
  margin: 0 0 12px;
  text-align: left;
  border: 1px solid #FECDD3;
  background: #FFF1F2;
  border-radius: 14px;
  padding: 12px 14px;
  cursor: pointer;
  b { display: block; font-size: 13px; color: ${INK}; }
  span { display: block; margin-top: 3px; font-size: 12px; color: ${MUTED}; line-height: 1.35; }
`;
const Hint = styled.p`
  padding: 0 4px 12px;
  font-size: 14px;
  color: ${MUTED};
  line-height: 1.45;
  strong { color: ${INK}; }
`;
const List = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 8px 0 24px;

  @media (min-width: 720px) {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
`;
const Card = styled.article`
  background: ${CREAM};
  border: 1px solid ${LINE};
  border-radius: 20px;
  overflow: hidden;
  box-shadow: ${tokens.shadowCard};
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-2px);
      border-color: ${tokens.accentBorder};
      box-shadow: ${tokens.shadowHover};
    }
  }
`;
const CardMedia = styled.div`
  position: relative;
  isolation: isolate;

  &::after {
    content: '';
    position: absolute;
    inset: auto 0 0;
    height: 56%;
    background: linear-gradient(180deg, transparent, rgba(17, 17, 17, 0.28));
    pointer-events: none;
  }
`;
const CardCover = styled.img`
  width: 100%;
  height: clamp(96px, 16vw, 140px);
  object-fit: cover;
  background: ${tokens.subtle};
  display: block;
`;
const CoverChips = styled.div`
  position: absolute;
  left: 12px;
  bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: calc(100% - 24px);
  z-index: 1;
`;
const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;
const CatChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -.01em;
  white-space: nowrap;
  border-radius: 999px;
  padding: 5px 10px 5px 8px;
  background: ${(p) => (p.$tone === 'ok' ? GREEN_BG : CREAM)};
  color: ${(p) => (p.$tone === 'ok' ? GREEN_DEEP : INK)};
  border: 1px solid ${(p) => (p.$tone === 'ok' ? tokens.accentBorder : 'rgba(17,17,17,0.08)')};
  box-shadow: 0 1px 2px rgba(17, 17, 17, 0.06);

  ${CoverChips} & {
    background: ${(p) => (p.$tone === 'ok' ? GREEN_BG : 'rgba(255,252,247,0.94)')};
    backdrop-filter: blur(8px);
  }
`;
const CardBody = styled.div`
  padding: 20px 20px 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;

  @media (max-width: 640px) {
    padding: 16px 16px 14px;
  }
`;
const Row1 = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  min-width: 0;
`;
const LogoImg = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  object-fit: cover;
  background: #f4f4f4;
  flex-shrink: 0;
`;
const LogoFallback = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #fff;
  font-size: 13px;
  flex-shrink: 0;
`;
const Meta = styled.div`
  min-width: 0;
  flex: 1;
  h3 {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
    letter-spacing: -.02em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  p { font-size: 13px; color: ${MUTED}; margin-top: 3px; }
`;
const Badges = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;
const Score = styled.span`
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${GREEN_DEEP};
  background: ${GREEN_BG};
  border-radius: 999px;
  padding: 6px 10px;
  white-space: nowrap;
  b { font-size: 15px; font-weight: 750; letter-spacing: -.02em; }
`;
const AppliedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: -.01em;
  color: ${GREEN_DEEP};
  background: ${GREEN_BG};
  border: 1px solid ${tokens.accentBorder};
  border-radius: 999px;
  padding: 5px 10px 5px 8px;
  white-space: nowrap;

  &::before {
    content: '✓';
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${GREEN};
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    display: grid;
    place-items: center;
    line-height: 1;
  }
`;
const Offer = styled.div`
  margin-top: 18px;
  padding: 12px 14px 12px 16px;
  border-radius: 14px;
  background: #fff7f3;
  border: 1px solid #f3d4c8;
  box-shadow: inset 3px 0 0 ${HOT};

  strong {
    display: block;
    font-size: 16px;
    font-weight: 650;
    letter-spacing: -.02em;
    line-height: 1.3;
  }
  span {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    color: ${HOT};
    font-weight: 600;
  }
`;
const OfferKicker = styled.div`
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${HOT};
  margin-bottom: 4px;
`;
const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 18px;
`;
const Stat = styled.div`
  background: ${tokens.subtle};
  border-radius: 12px;
  padding: 10px 12px;
  min-width: 0;
  b {
    display: block;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: -.01em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  em {
    display: block;
    margin-top: 2px;
    font-style: normal;
    font-size: 11px;
    color: ${MUTED};
    font-weight: 600;
  }
`;

const Pills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
`;
const Pill = styled.span`
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  padding: 6px 10px;
  background: ${(p) => (
    p.$tone === 'ok' ? GREEN_BG
      : p.$tone === 'hot' ? '#FDE8E2'
        : p.$tone === 'form' ? '#EFF6FF'
          : tokens.subtle
  )};
  color: ${(p) => (
    p.$tone === 'ok' ? GREEN_DEEP
      : p.$tone === 'hot' ? '#9A3412'
        : p.$tone === 'form' ? '#1D4ED8'
          : '#3f3f3f'
  )};
`;
const Cta = styled.button`
  margin-top: 20px;
  width: 100%;
  border: ${(p) => (p.$ghost ? `1px solid ${LINE}` : 0)};
  background: ${(p) => (p.$ghost ? CREAM : INK)};
  color: ${(p) => (p.$ghost ? INK : '#fff')};
  border-radius: 12px;
  padding: 13px 12px;
  font-weight: 650;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  grid-column: ${(p) => (p.$ghost ? '1 / -1' : 'auto')};
  &:disabled { background: #e5e5e5; color: #888; cursor: default; }
  &:hover:not(:disabled) { background: ${(p) => (p.$ghost ? tokens.subtle : tokens.actionHover)}; }
`;
const Blurb = styled.p`
  margin-top: 12px;
  font-size: 13px;
  color: ${MUTED};
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;
const Stats = styled.div`
  display: flex;
  gap: 14px;
  margin-top: 10px;
  b { display: block; font-size: 13px; }
  em { font-style: normal; font-size: 10px; color: ${MUTED}; font-weight: 600; }
`;
const SearchRow = styled.form`
  position: relative;
  display: flex;
  gap: 8px;
  padding: 4px;
  margin-bottom: 12px;
  background: ${CREAM};
  border: 1px solid ${LINE};
  border-radius: 14px;
  box-shadow: ${tokens.shadowCard};
  max-width: 640px;
  width: 100%;
  min-width: 0;
`;
const SearchField = styled.input`
  flex: 1;
  border: 0;
  background: transparent;
  box-shadow: none;
  min-width: 0;
  padding: 10px 12px;
  font-size: 16px;
  font-family: inherit;
  outline: none;
`;
const AcDropdown = styled.div`
  display: ${(p) => (p.$open ? 'block' : 'none')};
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: ${CREAM};
  border: 1px solid ${LINE};
  border-radius: 14px;
  box-shadow: ${tokens.shadowHover};
  z-index: 20;
  max-height: 320px;
  overflow-y: auto;
`;
const AcItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  border-bottom: 1px solid ${LINE};

  &:last-child { border-bottom: 0; }
  &:hover, &.active { background: ${tokens.subtle}; }

  b { display: block; font-size: 14px; color: ${INK}; }
  em { display: block; font-size: 12px; color: ${MUTED}; font-style: normal; margin-top: 2px; }
`;
const AcLogo = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${(p) => (p.$hasImage ? '#fff' : GREEN)};
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid ${LINE};
  img { width: 100%; height: 100%; object-fit: contain; }
`;
const AcEmpty = styled.div`
  padding: 14px 16px;
  font-size: 13px;
  color: ${MUTED};
`;
const SearchBtn = styled.button`
  border: 0;
  background: ${INK};
  color: #fff;
  border-radius: 10px;
  padding: 10px 14px;
  font-weight: 650;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;

  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`;
const Chips = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 0 0 14px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(17,17,17,0.28) transparent;
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { background: rgba(17,17,17,0.18); border-radius: 999px; }
`;
const Chip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid ${(p) => (p.$on ? GREEN_DEEP : LINE)};
  background: ${(p) => (p.$on ? GREEN_DEEP : CREAM)};
  color: ${(p) => (p.$on ? '#fff' : MUTED)};
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  font-family: inherit;
`;
const DirCount = styled.p`
  padding: 0 2px 12px;
  font-size: 13px;
  color: ${MUTED};
`;
const MoreSentinel = styled.div`
  grid-column: 1 / -1;
  padding: 18px 8px 8px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: ${MUTED};
`;
const ApplyTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0 0;
  gap: 8px;
`;
const Back = styled.button`
  border: 0;
  background: none;
  color: ${MUTED};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`;
const Stepper = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  flex: 1;
  justify-content: center;
  padding: 0 4px;
  min-width: 0;
`;
const Dot = styled.span`
  width: ${(p) => (p.$on ? '18px' : '8px')};
  height: 8px;
  border-radius: ${(p) => (p.$on ? '99px' : '50%')};
  background: ${(p) => (p.$on ? INK : '#ddd')};
`;
const StepLine = styled.span`
  width: min(28px, 8vw);
  height: 2px;
  background: #e5e5e5;
`;
const StepLabel = styled.p`
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: ${MUTED};
  padding: 8px 0 0;
`;
const Block = styled.div`
  margin: 10px 0;
  background: ${CREAM};
  border: 1px solid ${LINE};
  border-radius: 16px;
  padding: 16px;
  box-shadow: ${tokens.shadowCard};
  h2 { font-size: 16px; margin: 0 0 6px; font-family: ${DISPLAY}; font-weight: 400; }
`;
const Sub = styled.p`
  font-size: 12px;
  color: ${MUTED};
  margin: 0 0 10px;
  line-height: 1.4;
`;
const BrandHead = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  h3 { margin: 0; font-size: 15px; }
  p { margin: 2px 0 0; font-size: 12px; color: ${MUTED}; }
`;
const Cover = styled.img`
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 12px;
  background: #f4f4f4;
`;
const WebLink = styled.a`
  display: inline-block;
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${INK};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;
const AboutText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #444;
  line-height: 1.5;
`;
const FactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 4px 0 14px;
`;
const Fact = styled.div`
  background: ${tokens.subtle};
  border-radius: 12px;
  padding: 10px 12px;
  b { display: block; font-size: 14px; }
  em { font-style: normal; font-size: 11px; color: ${MUTED}; font-weight: 600; margin-top: 2px; display: block; }
`;
const SocialRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;
const SocialA = styled.a`
  font-size: 12px;
  font-weight: 600;
  color: ${INK};
  text-decoration: none;
  background: #F4F4F4;
  border-radius: 999px;
  padding: 5px 10px;
  &:hover { background: #ececec; }
`;
const ThumbCard = styled.a`
  flex: 0 0 168px;
  scroll-snap-align: start;
  background: #111;
  border-radius: 14px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  img, .ph {
    width: 168px;
    height: 210px;
    object-fit: cover;
    display: block;
    background: #222;
  }
  .cap { background: #fff; padding: 8px 10px; font-size: 11px; color: ${MUTED}; line-height: 1.3; }
  .cap b { display: block; color: ${INK}; font-size: 12px; margin-bottom: 2px; }
`;
const EmbedRow = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 6px;
`;
const Embed = styled.div`
  flex: 0 0 168px;
  scroll-snap-align: start;
  background: #111;
  border-radius: 14px;
  overflow: hidden;
  iframe { width: 168px; height: 280px; border: 0; display: block; background: #111; }
  .cap { background: #fff; padding: 8px 10px; font-size: 11px; color: ${MUTED}; line-height: 1.3; }
  .cap b { display: block; color: ${INK}; font-size: 12px; margin-bottom: 2px; }
`;
const Picker = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
`;
const Post = styled.button`
  border: 2px solid ${(p) => (p.$on ? INK : LINE)};
  border-radius: 12px;
  overflow: hidden;
  min-height: 96px;
  background: #ddd center/cover no-repeat;
  position: relative;
  cursor: pointer;
  .tick {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${(p) => (p.$on ? INK : '#fff')};
    border: 2px solid ${(p) => (p.$on ? INK : '#ccc')};
    color: #fff;
    font-size: 11px;
    display: grid;
    place-items: center;
  }
`;
const Lab = styled.label`
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: ${MUTED};
  margin: 10px 0 4px;
`;
const Input = styled.input`
  width: 100%;
  border: 1px solid ${LINE};
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 16px;
  background: #fff;
  box-sizing: border-box;
`;
const Select = styled.select`
  width: 100%;
  border: 1px solid ${LINE};
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 16px;
  background: #fff;
  box-sizing: border-box;
`;
const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;
const SaveRow = styled.label`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-top: 10px;
  font-size: 12px;
  color: ${MUTED};
  line-height: 1.35;
  input { width: auto; margin-top: 2px; }
`;
const Agree = styled.ul`
  font-size: 13px;
  color: #444;
  line-height: 1.45;
  padding-left: 16px;
  margin: 0;
  li { margin: 8px 0 0; }
`;
const Chk = styled.label`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-top: 12px;
  font-size: 13px;
  font-weight: 600;
  input { width: auto; margin-top: 3px; }
`;
const Foot = styled.div`
  padding: 8px 0 20px;
`;
const Note = styled.p`
  font-size: 11px;
  color: ${MUTED};
  text-align: center;
  margin-top: 8px;
  line-height: 1.4;
`;
const EmptyNote = styled.p`
  padding: 28px 8px;
  text-align: center;
  font-size: 14px;
  color: ${MUTED};
  line-height: 1.45;
  grid-column: 1 / -1;
`;
const Done = styled.div`
  margin: 36px 8px 8px;
  text-align: center;
  h2 {
    font-family: ${DISPLAY};
    font-size: clamp(24px, 7vw, 32px);
    font-weight: 400;
    letter-spacing: -.03em;
    margin: 0 0 10px;
  }
  p { font-size: 15px; color: ${MUTED}; line-height: 1.5; margin: 0; }
`;
const CheckMark = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: ${GREEN_BG};
  color: ${GREEN};
  display: grid;
  place-items: center;
  margin: 0 auto 14px;
  font-size: 20px;
  font-weight: 700;
`;
const Related = styled.div`
  margin: 8px 0 24px;
  h3 { font-family: ${DISPLAY}; font-size: 22px; font-weight: 400; margin: 0; }
  .sub { font-size: 13px; color: ${MUTED}; margin: 4px 0 12px; line-height: 1.4; }
`;
const RelGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const Rel = styled.button`
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 72px;
  background: ${CREAM};
  border: 1px solid ${LINE};
  border-radius: 16px;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  box-shadow: ${tokens.shadowCard};

  &:hover {
    border-color: ${tokens.accentBorder};
    background: #fff;
  }

  @media (max-width: 380px) {
    grid-template-columns: 44px minmax(0, 1fr);
  }
`;
const RelMark = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: contain;
  background: #fff;
  border: 1px solid ${LINE};
  flex-shrink: 0;
`;
const RelFallback = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #fff;
  font-size: 12px;
  flex-shrink: 0;
`;
const RelMeta = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;

  h4 {
    font-size: 14px;
    font-weight: 700;
    margin: 0;
    letter-spacing: -.02em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
`;
const RelGo = styled.span`
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  color: ${GREEN_DEEP};
  white-space: nowrap;

  @media (max-width: 380px) {
    display: none;
  }
`;
const trackPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(13, 122, 95, 0.35); }
  70% { box-shadow: 0 0 0 8px rgba(13, 122, 95, 0); }
  100% { box-shadow: 0 0 0 0 rgba(13, 122, 95, 0); }
`;
const TrackerBox = styled.div`
  margin: ${(p) => (p.$compact ? '18px 0 0' : '18px 0 8px')};
  background: ${(p) => (p.$compact
    ? 'linear-gradient(180deg, #f3faf7 0%, #eef6f3 100%)'
    : 'linear-gradient(180deg, #fffdf8 0%, #f3faf7 100%)')};
  border: 1px solid ${tokens.accentBorder};
  border-radius: 18px;
  padding: ${(p) => (p.$compact ? '16px 10px 14px' : '20px 12px 16px')};
`;
const Track = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  position: relative;
`;
const Bar = styled.div`
  position: absolute;
  left: 16.666%;
  right: 16.666%;
  top: 13px;
  height: 4px;
  border-radius: 99px;
  background: #d7e8e2;
`;
const Fill = styled.div`
  position: absolute;
  left: 16.666%;
  top: 13px;
  height: 4px;
  border-radius: 99px;
  background: linear-gradient(90deg, ${GREEN}, #19a37c);
`;
const Node = styled.i`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e8efeC;
  display: grid;
  place-items: center;
  font-style: normal;
  font-size: 14px;
  font-weight: 800;
  color: ${INK};
  box-sizing: border-box;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(18, 20, 26, 0.08);
`;
const Tcol = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  span {
    margin-top: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #8a938e;
    line-height: 1.25;
  }
  &.done span { color: ${GREEN_DEEP}; font-weight: 700; }
  &.now span { color: ${INK}; font-weight: 750; }
  &.done ${Node} {
    background: ${GREEN};
    color: #fff;
    font-size: 13px;
  }
  &.now ${Node} {
    background: #fff;
    border-color: ${GREEN};
    animation: ${trackPulse} 2s infinite;
  }
`;
const TrackNote = styled.p`
  font-size: 11px;
  color: ${MUTED};
  text-align: center;
  margin-top: 12px;
  line-height: 1.4;
`;
