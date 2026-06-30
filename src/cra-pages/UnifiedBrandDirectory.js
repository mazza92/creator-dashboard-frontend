import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { Input, Select, Spin, Pagination, Button, Progress, message } from 'antd';
import { Search, Crown, Lock, Users, Mail, Heart, Sparkles, Zap, Check, Target, Clock, ExternalLink, Link2, X } from 'lucide-react';
import { getCategoryColors } from '../utils/categoryColors';
import { normalizeCategory, categoryLabel } from '../constants/brandCategories';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import UpgradeModal from '../creator-portal/UpgradeModal';
import AIPitchModal from '../creator-portal/AIPitchModal';
import LandingPageLayout from '../Layouts/LandingPageLayout';
import { tokens } from '../theme/tokens';
import LoadingSpinner from '../components/LoadingSpinner';

// Normalize API base URL - remove trailing slash to prevent double slashes
const getApiBase = () => {
  const base = process.env.REACT_APP_API_BASE || 
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');
  return base.replace(/\/+$/, ''); // Remove trailing slashes
};
const API_BASE = getApiBase();

// Helper to generate favicon URL from website
const getFaviconUrl = (website) => {
  if (!website) return null;
  try {
    const domain = new URL(website.startsWith('http') ? website : `https://${website}`).hostname;
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  } catch {
    return null;
  }
};

const UnifiedBrandDirectory = ({ collectionMode, collectionTitle, collectionDescription }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Detect if we're inside dashboard or public route
  const isDashboardView = location.pathname.startsWith('/creator/dashboard');

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPrBrands, setOpenPrBrands] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 24 });
  const [savedBrandIds, setSavedBrandIds] = useState(new Set());

  // Subscription/quota tracking (for logged-in users)
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [unlockBalance, setUnlockBalance] = useState({ remaining: 5, used: 0, tier: 'free', reset_at: null });
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const FREE_UNLOCK_LIMIT = 5; // Free users get 5 brand unlocks per month

  // Pitch modal state
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [selectedBrandForPitch, setSelectedBrandForPitch] = useState(null);
  const [pitchedBrands, setPitchedBrands] = useState(new Set());

  // V4: Welcome card for first-time users after onboarding
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    activity: searchParams.get('activity') || '', // 'new', 'active', 'responsive'
    contactType: searchParams.get('contactType') || '' // 'application', 'email', or '' for all
  });

  // Discovery state
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveredBrand, setDiscoveredBrand] = useState(null);
  const [discoveryError, setDiscoveryError] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchOpenPrBrands();
    if (user) {
      fetchSubscriptionStatus();
      fetchSavedBrands();
    }
  }, [user]);

  useEffect(() => {
    fetchBrands();
  }, [pagination.page, filters]);

  // V4: Check if user just completed onboarding (first login welcome experience)
  useEffect(() => {
    const justCompleted = sessionStorage.getItem('justCompletedOnboarding');
    if (justCompleted === 'true' && isDashboardView) {
      setShowWelcomeCard(true);
      // Clear the flag so it only shows once
      sessionStorage.removeItem('justCompletedOnboarding');
    }
  }, [isDashboardView]);

  const fetchOpenPrBrands = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/admin/brands/open-pr-featured`);
      setOpenPrBrands(Array.isArray(data.brands) ? data.brands : []);
    } catch (error) {
      console.error('Error fetching open PR brands:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/public/categories`);
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      // Fetch subscription tier
      const subResponse = await axios.get(`${API_BASE}/api/subscription/status`, {
        withCredentials: true
      });
      setSubscriptionTier(subResponse.data.tier || 'free');

      // Fetch unlock balance from new credit unlock system
      const balanceResponse = await axios.get(`${API_BASE}/api/pr-crm/unlocks/balance`, {
        withCredentials: true
      });
      if (balanceResponse.data) {
        setUnlockBalance({
          remaining: balanceResponse.data.remaining ?? 5,
          used: balanceResponse.data.used ?? 0,
          tier: balanceResponse.data.tier || 'free',
          reset_at: balanceResponse.data.reset_at
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchSavedBrands = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/pr-crm/pipeline`, {
        withCredentials: true
      });
      if (response.data.success) {
        const saved = new Set(response.data.pipeline.map(item => item.brand_id));
        setSavedBrandIds(saved);

        // Also populate pitched/contacted brands from pipeline
        const pitched = new Set(
          response.data.pipeline
            .filter(item => item.stage === 'pitched')
            .map(item => item.brand_id)
        );
        setPitchedBrands(pitched);
      }
    } catch (error) {
      console.error('Error fetching saved brands:', error);
    }
  };

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.activity && { activity: filters.activity }),
        ...(filters.contactType && { contact_type: filters.contactType })
      };

      const { data } = await axios.get(`${API_BASE}/api/public/brands`, { params });
      setBrands(data.brands);
      setPagination(prev => ({ ...prev, total: data.pagination.total }));
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBrand = async (brand, e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (!user) {
      message.info('Sign up to save brands!');
      navigate('/register/creator');
      return;
    }

    try {
      // Toggle save/unsave
      if (savedBrandIds.has(brand.id)) {
        // Unsave
        await axios.delete(`${API_BASE}/api/pr-crm/pipeline/brand/${brand.id}`, {
          withCredentials: true
        });
        setSavedBrandIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(brand.id);
          return newSet;
        });
        window.dispatchEvent(new CustomEvent('savedBrandCountChanged'));
        message.success('Brand removed from saved list');
      } else {
        // Save
        await axios.post(`${API_BASE}/api/pr-crm/pipeline/save`,
          { brand_id: brand.id, slug: brand.slug },
          { withCredentials: true }
        );
        setSavedBrandIds(prev => new Set([...prev, brand.id]));
        window.dispatchEvent(new CustomEvent('savedBrandCountChanged'));
        message.success({
          content: `✓ ${brand.name} saved to your Pipeline!`,
          duration: 3,
          style: {
            marginTop: '10vh',
            fontSize: '15px',
            fontWeight: 600
          }
        });
      }
    } catch (error) {
      console.error('Error saving brand:', error);
      message.error('Failed to save brand');
    }
  };

  const handlePitchBrand = (brand, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      message.info('Sign up to contact brands!');
      navigate('/register/creator');
      return;
    }

    // Check unlock limit for free users (backend also enforces this)
    const isPro = subscriptionTier === 'pro' || subscriptionTier === 'elite';
    if (!isPro && unlockBalance.remaining <= 0) {
      setUpgradeModalVisible(true);
      return;
    }

    // Open pitch modal
    setSelectedBrandForPitch(brand);
    setShowPitchModal(true);
  };

  const handleOpenPrApplyClick = async (brand, e, isExternal, applyUrl, isApplicationForm) => {
    if (!user || !isExternal || !isApplicationForm) return;

    e.preventDefault();
    e.stopPropagation();

    const isPro = subscriptionTier === 'pro' || subscriptionTier === 'elite';
    if (!isPro && unlockBalance.remaining <= 0) {
      setUpgradeModalVisible(true);
      return;
    }

    const formWindow = window.open('about:blank', '_blank');
    if (formWindow) {
      formWindow.opener = null;
    }

    setPitchedBrands(prev => new Set([...prev, brand.id]));
    setSavedBrandIds(prev => new Set([...prev, brand.id]));

    try {
      await axios.post(`${API_BASE}/api/pr-crm/track-pitch`, {
        brand_id: brand.id,
        slug: brand.slug
      }, { withCredentials: true });

      const response = await axios.get(`${API_BASE}/api/pr-crm/unlocks/balance`, {
        withCredentials: true
      });
      if (response.data) {
        setUnlockBalance({
          remaining: response.data.remaining ?? 5,
          used: response.data.used ?? 0,
          tier: response.data.tier || 'free',
          reset_at: response.data.reset_at
        });
      }
    } catch (error) {
      console.error('Error tracking PR form application:', error);
      if (formWindow) {
        formWindow.close();
      }
      setPitchedBrands(prev => {
        const updated = new Set(prev);
        updated.delete(brand.id);
        return updated;
      });
      message.error('Could not track this application. Please try again.');
      return;
    }

    if (formWindow) {
      formWindow.location.href = applyUrl;
    } else {
      window.location.href = applyUrl;
    }

    setTimeout(() => {
      navigate(`/creator/dashboard/pr-pipeline?confirmBrand=${brand.id}&method=form`);
    }, 700);
  };

  const handlePitchSent = async (brandArg, context = {}) => {
    const contactedBrand = brandArg || selectedBrandForPitch;
    const method = context?.method || 'email';

    // Mark brand as contacted locally
    if (contactedBrand) {
      setPitchedBrands(prev => new Set([...prev, contactedBrand.id]));
      setSavedBrandIds(prev => new Set([...prev, contactedBrand.id]));
    }
    setShowPitchModal(false);
    setSelectedBrandForPitch(null);

    // Re-fetch unlock balance from API to ensure accurate count
    try {
      const response = await axios.get(`${API_BASE}/api/pr-crm/unlocks/balance`, {
        withCredentials: true
      });
      if (response.data) {
        setUnlockBalance({
          remaining: response.data.remaining ?? 5,
          used: response.data.used ?? 0,
          tier: response.data.tier || 'free',
          reset_at: response.data.reset_at
        });
      }
    } catch (error) {
      // Fallback to decrementing locally if API fails
      setUnlockBalance(prev => ({
        ...prev,
        remaining: Math.max(0, (prev.remaining ?? 5) - 1)
      }));
    }

    if (contactedBrand) {
      message.success(
        method === 'form'
          ? 'PR form opened. Confirm your application in Saved so we can track follow-ups.'
          : 'Email opened. Confirm it in Saved so we can track follow-ups.'
      );

      navigate(
        `/creator/dashboard/pr-pipeline?confirmBrand=${contactedBrand.id}&method=${method}`
      );
    }
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
    // Reset discovery state when search changes
    setDiscoveredBrand(null);
    setDiscoveryError('');
    updateURLParams({ search: value });
  };

  // Discovery function for brands not in curated list
  const handleDiscoverBrand = async () => {
    if (!filters.search.trim()) return;

    setDiscoveryLoading(true);
    setDiscoveryError('');
    setDiscoveredBrand(null);

    try {
      const response = await axios.post(`${API_BASE}/api/pr-crm/brands/discover`, {
        query: filters.search.trim()
      }, { withCredentials: true });

      if (response.data.success && response.data.brand) {
        setDiscoveredBrand(response.data);
        if (response.data.rate_limit) {
          setRateLimitInfo(response.data.rate_limit);
        }
      } else {
        setDiscoveryError(response.data.message || 'We couldn\'t find a verified contact for this brand yet.');
      }
    } catch (err) {
      console.error('Discovery error:', err);
      if (err.response?.status === 429) {
        setRateLimitInfo({
          remaining: 0,
          limit: err.response.data?.daily_limit || 5,
        });
        setDiscoveryError(err.response.data?.error || 'Daily discovery limit reached. Try again tomorrow.');
      } else if (err.response?.status === 401) {
        // User not authenticated - this shouldn't happen in dashboard view but handle gracefully
        setDiscoveryError('Please log in to use brand discovery.');
      } else {
        setDiscoveryError(err.response?.data?.error || 'We couldn\'t find this brand. Try a different search.');
      }
    } finally {
      setDiscoveryLoading(false);
    }
  };

  // Handle clicking on discovered brand
  const handleSelectDiscoveredBrand = () => {
    if (discoveredBrand?.brand) {
      // Open pitch modal with the discovered brand
      setSelectedBrandForPitch({
        id: discoveredBrand.brand.id,
        brand_name: discoveredBrand.brand.brand_name,
        name: discoveredBrand.brand.brand_name,
        contact_email: discoveredBrand.brand.contact_email,
        category: discoveredBrand.brand.category,
        website: discoveredBrand.brand.website,
        has_application_form: discoveredBrand.brand.has_application_form,
        application_form_url: discoveredBrand.brand.application_form_url,
        verified_contact: discoveredBrand.verified_contact,
        discovery_tier: discoveredBrand.discovery_tier,
        alternative_emails: discoveredBrand.alternative_emails || [],
        is_discovered: discoveredBrand.source === 'discovered'
      });
      setShowPitchModal(true);
    }
  };

  const handleFilterChange = (key, value) => {
    // Check if free user is trying to use PRO "responsive" filter
    if (key === 'activity' && value === 'responsive' && subscriptionTier !== 'pro' && subscriptionTier !== 'elite') {
      setUpgradeModalVisible(true);
      return;
    }
    const nextValue = key === 'category' && value ? (normalizeCategory(value) || value) : value;
    setFilters(prev => ({ ...prev, [key]: nextValue }));
    setPagination(prev => ({ ...prev, page: 1 }));
    updateURLParams({ [key]: nextValue });
  };

  const updateURLParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isBrandSaved = (brandId) => savedBrandIds.has(brandId);

  const content = (
    <>
      {/* Only show default Helmet if not in collection mode */}
      {!collectionMode && (
        <Helmet>
          <title>500+ PR Forms for Brands (2026): Direct Application Links | NewCollab</title>
          <meta name="description" content="Browse 500+ verified PR forms for brands—direct application links, PR list requirements, and micro-influencer friendly options. Filter by beauty, skincare, K-beauty & fashion. Apply free." />
          <meta name="keywords" content="pr forms for brands, pr forms, pr application form, pr list application, skincare pr list, k-beauty pr forms, brands that send pr to small influencers, influencer pr list requirements" />
          <meta property="og:title" content="500+ PR Forms for Brands: Direct Application Links" />
          <meta property="og:description" content="Verified PR forms for brands with direct application links. 500+ beauty, skincare, and lifestyle brands—micro-influencer friendly. Start applying today." />
          <link rel="canonical" href="https://newcollab.co/directory" />
        </Helmet>
      )}

      <Container $isDashboard={isDashboardView}>
        {/* Hero Section - Only show on public /directory page */}
        {!isDashboardView && (
          <Hero>
            <HeroContent>
              <h1>{collectionTitle || '500+ PR Forms for Brands: Direct Application Links'}</h1>
              <p>{collectionDescription || 'Browse verified PR forms for brands—500+ direct application links, PR requirements, and options for small creators in beauty, skincare, K-beauty, tech, and fashion.'}</p>
            </HeroContent>
          </Hero>
        )}

        <ContentWrapper>
          {/* V4: Welcome card for first-time users after onboarding */}
          {showWelcomeCard && isDashboardView && (
            <WelcomeCard>
              <WelcomeClose onClick={() => setShowWelcomeCard(false)}>
                <X size={16} />
              </WelcomeClose>
              <WelcomeGrid>
                <div>
                  <WelcomeTag>You're in!</WelcomeTag>
                  <WelcomeTitle>Welcome to NewCollab</WelcomeTitle>
                  <WelcomeSub>
                    We found <strong>{pagination.total || 500}+ brands</strong> that match your niche and are actively working with creators like you.
                  </WelcomeSub>
                </div>
                <WelcomeBtn onClick={() => setShowWelcomeCard(false)}>
                  Start browsing
                </WelcomeBtn>
              </WelcomeGrid>
            </WelcomeCard>
          )}

          {/* Monthly Quota Tracker - Show for logged-in FREE users */}
          {user && subscriptionTier === 'free' && isDashboardView && (() => {
            const remaining = unlockBalance.remaining ?? FREE_UNLOCK_LIMIT;
            const used = FREE_UNLOCK_LIMIT - remaining;
            return (
              <QuotaStrip $atLimit={remaining <= 0}>
                <QuotaIconBox $atLimit={remaining <= 0}>
                  <Mail size={20} />
                </QuotaIconBox>
                <QuotaBody>
                  <QuotaTitle>
                    {remaining} remaining ({used} used of {FREE_UNLOCK_LIMIT})
                  </QuotaTitle>
                  <QuotaBarTrack>
                    <QuotaBarFill $atLimit={remaining <= 0} style={{ width: `${Math.min((used / FREE_UNLOCK_LIMIT) * 100, 100)}%` }} />
                  </QuotaBarTrack>
                  <QuotaMeta $atLimit={remaining <= 0}>
                    {remaining <= 0
                      ? 'Limit reached · Upgrade to contact more brands'
                      : `Resets ${unlockBalance.reset_at ? new Date(unlockBalance.reset_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'next month'}`}
                  </QuotaMeta>
                </QuotaBody>
                <QuotaCTA onClick={() => setUpgradeModalVisible(true)}>
                  {remaining <= 0 ? 'Get Unlimited' : 'Upgrade to Pro'}
                </QuotaCTA>
              </QuotaStrip>
            );
          })()}

          {/* Search + Filters Row */}
          <SearchRow>
            <SearchWrap>
              <Input
                size="large"
                placeholder="Search brand names..."
                prefix={<Search size={17} />}
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
              />
            </SearchWrap>
            <Select
              size="large"
              placeholder="All Categories"
              value={filters.category || undefined}
              onChange={(value) => handleFilterChange('category', value)}
              allowClear
              style={{ minWidth: 160 }}
            >
              {categories.map(cat => (
                <Select.Option key={cat.value} value={cat.value}>
                  {cat.label} ({cat.count})
                </Select.Option>
              ))}
            </Select>
            <Select
              size="large"
              placeholder="All Brands"
              value={filters.activity || undefined}
              onChange={(value) => handleFilterChange('activity', value)}
              allowClear
              style={{ minWidth: 160 }}
            >
              <Select.Option value="new">Added This Week</Select.Option>
              <Select.Option value="active">Actively Reviewing</Select.Option>
              <Select.Option value="responsive">
                High Response Rate {subscriptionTier !== 'pro' && subscriptionTier !== 'elite' && <ProBadgeInline>PRO</ProBadgeInline>}
              </Select.Option>
            </Select>
          </SearchRow>
          <ContactFilterBar>
            <ContactFilterLabel>How to apply:</ContactFilterLabel>
            <ContactPill
              type="button"
              $active={!filters.contactType}
              onClick={() => handleFilterChange('contactType', '')}
            >
              All brands
            </ContactPill>
            <ContactPill
              type="button"
              $active={filters.contactType === 'application'}
              onClick={() => handleFilterChange('contactType', 'application')}
            >
              <Link2 size={14} /> PR application form
            </ContactPill>
            <ContactPill
              type="button"
              $active={filters.contactType === 'email'}
              onClick={() => handleFilterChange('contactType', 'email')}
            >
              <Mail size={14} /> PR email contact
            </ContactPill>
          </ContactFilterBar>

          {/* Open PR Applications - Featured Section */}
          {!filters.search && !filters.category && openPrBrands.length > 0 && (
            <OpenPRSection>
            <OpenPRHeader>
              <h2>
                <Target size={20} /> Open PR Applications
              </h2>
              <span className="badge">Apply Now</span>
            </OpenPRHeader>
            <OpenPRSubtitle>
              {user
                ? "These brands are actively accepting PR applications. Click to apply directly!"
                : "These brands are actively accepting PR applications. Sign up free to access application forms!"}
            </OpenPRSubtitle>
            <OpenPRGrid>
              {openPrBrands.map((brand) => {
                const logoUrl = brand.logo || getFaviconUrl(brand.website);

                // Determine URL and button behavior based on login state
                let applyUrl, buttonText, isExternal, isApplicationForm = false;
                if (!user) {
                  // Not logged in: redirect to signup
                  applyUrl = '/register/creator';
                  buttonText = 'Sign up to contact brand';
                  isExternal = false;
                } else if (brand.application_url) {
                  // Logged in + has application form: direct link
                  applyUrl = brand.application_url;
                  buttonText = 'Apply Now';
                  isExternal = true;
                  isApplicationForm = true;
                } else if (brand.website) {
                  // Logged in + no form but has website: link to website
                  applyUrl = brand.website.startsWith('http') ? brand.website : `https://${brand.website}`;
                  buttonText = 'Visit Website';
                  isExternal = true;
                } else {
                  // Logged in + no form, no website: link to brand detail page
                  applyUrl = isDashboardView ? `/creator/dashboard/brand/${brand.slug}` : `/brand/${brand.slug}`;
                  buttonText = 'View Details';
                  isExternal = false;
                }

                return (
                  <OpenPRCard key={brand.slug || brand.id}>
                    <OpenPRCardHeader>
                      <OpenPRLogo>
                        {logoUrl ? (
                          <img src={logoUrl} alt={brand.name} />
                        ) : (
                          <span style={{ fontWeight: 900, color: '#0F0F0F' }}>
                            {(brand.name || 'B').slice(0, 1)}
                          </span>
                        )}
                      </OpenPRLogo>
                      <OpenPRInfo>
                        <div className="name">{brand.name}</div>
                        <div className="category">{brand.category}</div>
                      </OpenPRInfo>
                    </OpenPRCardHeader>
                    <ApplyButton
                      href={applyUrl}
                      target={isExternal ? "_blank" : "_self"}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      onClick={(e) => handleOpenPrApplyClick(brand, e, isExternal, applyUrl, isApplicationForm)}
                    >
                      {user ? (
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      ) : (
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                      {buttonText}
                    </ApplyButton>
                  </OpenPRCard>
                );
              })}
            </OpenPRGrid>
          </OpenPRSection>
          )}

          {/* Brand Grid */}
          {loading ? (
            <LoadingSpinner text="Loading brands..." minHeight="400px" />
          ) : brands.length === 0 && filters.search.trim() ? (
            // Discovery fallback when search returns no results
            <DiscoveryFallback>
              {discoveredBrand ? (
                // Show discovered brand
                <DiscoveredBrandCard onClick={handleSelectDiscoveredBrand}>
                  <DiscoveredBadge>
                    {discoveredBrand.source === 'curated' ? '✓ Found in directory' :
                     discoveredBrand.discovery_tier === 2 ? '🔍 Found on website' :
                     discoveredBrand.discovery_tier === 3 ? '✨ Generated contact' :
                     '✨ Found via search'}
                  </DiscoveredBadge>
                  <DiscoveredBrandName>{discoveredBrand.brand.brand_name}</DiscoveredBrandName>
                  <DiscoveredBrandEmail>{discoveredBrand.brand.contact_email}</DiscoveredBrandEmail>

                  {/* Show tier badge for discovered brands */}
                  {discoveredBrand.discovery_tier === 2 && (
                    <TierBadge $tier={2}>
                      ✓ Scraped from official website
                    </TierBadge>
                  )}
                  {discoveredBrand.discovery_tier === 3 && (
                    <TierBadge $tier={3}>
                      ⚡ Generated from common patterns
                    </TierBadge>
                  )}

                  {/* Show unverified warning for Tier 3 */}
                  {discoveredBrand.verified_contact === false && (
                    <UnverifiedBadge>
                      ⚠️ Unverified - may not be correct
                    </UnverifiedBadge>
                  )}

                  {/* Show alternative emails for Tier 3 */}
                  {discoveredBrand.alternative_emails && discoveredBrand.alternative_emails.length > 0 && (
                    <AlternativeEmails onClick={(e) => e.stopPropagation()}>
                      <h5>Try these if no response:</h5>
                      <ul>
                        {discoveredBrand.alternative_emails.slice(0, 3).map((email, idx) => (
                          <li key={idx} onClick={() => navigator.clipboard.writeText(email)}>
                            {email} <span style={{opacity: 0.5, fontSize: '10px'}}>(click to copy)</span>
                          </li>
                        ))}
                      </ul>
                    </AlternativeEmails>
                  )}

                  <DiscoveryButton as="div" style={{ marginTop: '16px', justifyContent: 'center' }}>
                    <Mail size={16} /> Contact this brand
                  </DiscoveryButton>
                  {rateLimitInfo && rateLimitInfo.remaining !== undefined && (
                    <RateLimitInfo>
                      {rateLimitInfo.remaining} of {rateLimitInfo.limit} daily discoveries remaining
                    </RateLimitInfo>
                  )}
                </DiscoveredBrandCard>
              ) : (
                // Show discovery prompt
                <>
                  <DiscoveryIcon>🔍</DiscoveryIcon>
                  <DiscoveryTitle>"{filters.search}" not in our directory yet</DiscoveryTitle>
                  <DiscoveryText>
                    We'll search their website for PR contacts, or generate likely email addresses.
                  </DiscoveryText>
                  <DiscoveryButton onClick={handleDiscoverBrand} disabled={discoveryLoading}>
                    {discoveryLoading ? (
                      <>
                        <Spin size="small" style={{ marginRight: 8 }} />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search size={18} />
                        Search for {filters.search}'s PR contact
                      </>
                    )}
                  </DiscoveryButton>
                  {discoveryError && (
                    <DiscoveryError>{discoveryError}</DiscoveryError>
                  )}
                  {rateLimitInfo && rateLimitInfo.remaining === 0 && (
                    <RateLimitInfo>
                      Daily discovery limit reached. Try again tomorrow!
                    </RateLimitInfo>
                  )}
                </>
              )}
            </DiscoveryFallback>
          ) : (
            <>
              <BrandGrid>
              {brands.map(brand => {
                const isSaved = isBrandSaved(brand.id);
                const isPitched = pitchedBrands.has(brand.id);
                const isPro = subscriptionTier === 'pro' || subscriptionTier === 'elite';
                const unlocksLeft = unlockBalance.remaining;

                // Use dashboard route for logged-in creators in dashboard, public route otherwise
                const brandUrl = isDashboardView && user
                  ? `/creator/dashboard/brand/${brand.slug}`
                  : `/brand/${brand.slug}`;

                return (
                  <BrandCard
                    key={brand.slug}
                    to={brandUrl}
                  >
                    {brand.isFeatured && (
                      <FeaturedBadge>
                        <Sparkles size={14} /> Featured
                      </FeaturedBadge>
                    )}

                    <BrandLogo>
                      {brand.logo ? (
                        <LogoImg
                          src={brand.logo}
                          alt={brand.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            const placeholder = e.target.parentElement.querySelector('[data-placeholder]');
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <LogoPlaceholder data-placeholder style={{ display: brand.logo ? 'none' : 'flex' }}>
                        {brand.name.charAt(0)}
                      </LogoPlaceholder>
                    </BrandLogo>

                    <BrandInfo>
                      <BrandName>{brand.name}</BrandName>
                      {brand.description && (
                        <BrandDescription>{brand.description}</BrandDescription>
                      )}

                      {/* Quick Wins - Match Score & Value Badges */}
                      <QuickWinBadges>
                        {brand.responseRate >= 40 && (
                          <MatchBadge>🔥 {brand.responseRate}% reply rate</MatchBadge>
                        )}
                        {brand.estimatedValue && (
                          <ValueBadge>💝 ~${brand.estimatedValue} value</ValueBadge>
                        )}
                      </QuickWinBadges>

                      <CardTags>
                        {brand.category && (() => {
                          const catStyle = getCategoryColors(brand.category);
                          return (
                            <CategoryTag $bg={catStyle.bg} $color={catStyle.text} $border={catStyle.border}>
                              {categoryLabel(brand.category)}
                            </CategoryTag>
                          );
                        })()}
                        {brand.minFollowers !== null && brand.minFollowers !== undefined && brand.minFollowers > 0 && (
                          <TagFollowers>{(brand.minFollowers / 1000).toFixed(0)}K+ followers</TagFollowers>
                        )}
                      </CardTags>

                      <CardDivider />

                      <CardStats>
                        {brand.responseRate !== null && brand.responseRate !== undefined && (
                          <>
                            <StatItem>
                              <StatValue className="green">{brand.responseRate}%</StatValue>
                              <StatLabel>Response rate</StatLabel>
                            </StatItem>
                            <StatDivider />
                          </>
                        )}
                        {brand.pitchStats && brand.pitchStats.totalPitches > 0 && (
                          <StatItem>
                            <StatValue>{brand.pitchStats.totalPitches}</StatValue>
                            <StatLabel>Creators pitched</StatLabel>
                          </StatItem>
                        )}
                      </CardStats>

                      {brand.pitchStats && brand.pitchStats.totalResponses > 0 && (
                        <ResponsesLine>
                          <PulsingDot /> <ResponsesCount>{brand.pitchStats.totalResponses}</ResponsesCount> creator{brand.pitchStats.totalResponses !== 1 ? 's' : ''} got a reply recently
                        </ResponsesLine>
                      )}

                      {/* Action buttons - only show in dashboard view for logged-in users */}
                      {isDashboardView && user && (
                        <CardActions>
                          <PitchButton
                            onClick={(e) => handlePitchBrand(brand, e)}
                            $pitched={isPitched}
                            disabled={isPitched}
                          >
                            {isPitched ? (
                              <><Check size={16} /> Contacted</>
                            ) : (
                              <><Mail size={16} /> Contact</>
                            )}
                          </PitchButton>
                          <SaveActionButton
                            onClick={(e) => handleSaveBrand(brand, e)}
                            $saved={isSaved}
                          >
                            {isSaved ? (
                              <><Heart size={16} fill="currentColor" /> Saved</>
                            ) : (
                              <><Heart size={16} /> Save</>
                            )}
                          </SaveActionButton>
                        </CardActions>
                      )}

                      {!user && !isDashboardView && (
                        <SignupCTA>
                          <Lock size={16} /> Sign up to contact brand
                        </SignupCTA>
                      )}
                    </BrandInfo>
                  </BrandCard>
                );
              })}
              </BrandGrid>

              <PaginationContainer>
                <Pagination
                  current={pagination.page}
                  total={pagination.total}
                  pageSize={pagination.limit}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(total) => `${total} brands`}
                  showLessItems
                  responsive
                />
              </PaginationContainer>
            </>
          )}
        </ContentWrapper>
      </Container>

      {/* Upgrade Modal */}
      {upgradeModalVisible && (
        <UpgradeModal
          isOpen={upgradeModalVisible}
          onClose={() => setUpgradeModalVisible(false)}
          currentCount={unlockBalance.used}
          limit={FREE_UNLOCK_LIMIT}
          feature={unlockBalance.remaining <= 0 ? 'unlock_paywall' : 'pitch'}
          resetAt={unlockBalance.reset_at}
        />
      )}

      {/* Brand Contact Modal */}
      {showPitchModal && selectedBrandForPitch && (
        <AIPitchModal
          isOpen={showPitchModal}
          onClose={() => {
            setShowPitchModal(false);
            setSelectedBrandForPitch(null);
          }}
          brand={selectedBrandForPitch}
          onPitchSent={handlePitchSent}
          onUnlockUsed={fetchSubscriptionStatus}
        />
      )}
    </>
  );

  // Wrap with LandingPageLayout for public view, return plain content for dashboard
  return isDashboardView ? content : <LandingPageLayout>{content}</LandingPageLayout>;
};

// Styled Components
const Container = styled.div`
  width: 100%;
  background: ${props => props.$isDashboard ? 'transparent' : '#FAFAFA'};
  min-height: ${props => props.$isDashboard ? 'auto' : '100vh'};
  padding-bottom: ${props => props.$isDashboard ? '40px' : '80px'};
`;

const ContentWrapper = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 28px 32px;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

// V4: Welcome Card for first-time users after onboarding
const WelcomeCard = styled.div`
  background: #0F0F0F;
  border-radius: 18px;
  padding: 24px 26px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(225,29,72,0.45) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const WelcomeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: center;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const WelcomeTag = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #FDA4AF;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 5px;
`;

const WelcomeTitle = styled.div`
  font-size: 19px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.4px;
  margin-bottom: 5px;
`;

const WelcomeSub = styled.div`
  font-size: 13px;
  color: rgba(255,255,255,0.55);
  line-height: 1.5;

  strong {
    color: rgba(255,255,255,0.85);
  }
`;

const WelcomeBtn = styled.button`
  background: #E11D48;
  color: #fff;
  border: none;
  border-radius: 11px;
  padding: 12px 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  position: relative;
  z-index: 1;
  transition: all 0.15s;

  &:hover {
    background: #BE123C;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const WelcomeClose = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255,255,255,0.6);
  z-index: 2;
  transition: all 0.15s;

  &:hover {
    background: rgba(255,255,255,0.2);
    color: #fff;
  }
`;

const Hero = styled.div`
  background: ${tokens.surface};
  border-bottom: 1px solid ${tokens.border};
  padding: 140px 24px 48px;
  text-align: center;
  margin-top: 0;

  @media (max-width: 768px) {
    padding: 110px 20px 40px;
  }
`;

const HeroContent = styled.div`
  max-width: 720px;
  margin: 0 auto;

  h1 {
    font-size: 38px;
    font-weight: 800;
    color: ${tokens.textPrimary};
    margin-bottom: 14px;
    line-height: 1.15;
    letter-spacing: -0.5px;

    @media (max-width: 768px) {
      font-size: 28px;
    }
  }

  p {
    font-size: 16px;
    color: ${tokens.textMuted};
    line-height: 1.6;
    margin-bottom: 0;
  }
`;

const QuotaStrip = styled.div`
  background: ${props => props.$atLimit ? '#FEF2F2' : tokens.surface};
  border: 1px solid ${props => props.$atLimit ? '#FECACA' : tokens.border};
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: ${tokens.shadowCard};

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const QuotaIconBox = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: ${props => props.$atLimit ? '#FEE2E2' : tokens.subtle};
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: ${props => props.$atLimit ? '#DC2626' : tokens.textSecondary};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const QuotaBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const QuotaTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${tokens.textPrimary};
  margin-bottom: 5px;
`;

const QuotaBarTrack = styled.div`
  height: 4px;
  background: ${tokens.subtle};
  border-radius: 2px;
  overflow: hidden;
  max-width: 280px;
  margin-bottom: 5px;
`;

const QuotaBarFill = styled.div`
  height: 100%;
  background: ${props => props.$atLimit ? '#DC2626' : tokens.proGradient};
  border-radius: 2px;
  transition: width 0.4s ease;
`;

const QuotaMeta = styled.div`
  font-size: 11px;
  color: ${props => props.$atLimit ? '#DC2626' : tokens.textMuted};
  font-weight: ${props => props.$atLimit ? '600' : '400'};
`;

const QuotaCTA = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: ${tokens.proGradient};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const SearchRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  .ant-select,
  .ant-input-affix-wrapper {
    border-radius: ${tokens.radiusInput};
    border-color: ${tokens.border};

    &:hover {
      border-color: ${tokens.borderHover};
    }

    &:focus,
    &.ant-input-affix-wrapper-focused {
      border-color: ${tokens.action};
      box-shadow: none;
    }
  }

  .ant-select-selector {
    border-radius: ${tokens.radiusInput} !important;
    font-size: 13px;
    font-weight: 500;
    color: ${tokens.textSecondary};
  }

  .ant-input {
    font-size: 13.5px;
  }
`;

const SearchWrap = styled.div`
  flex: 1;
  min-width: 240px;
`;

const FreeBadgeInline = styled.span`
  background: ${tokens.success};
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  margin-left: 8px;
`;

const ProBadgeInline = styled.span`
  background: ${tokens.proGradient};
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  margin-left: 8px;
`;

const BrandGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const BrandCard = styled(Link)`
  background: ${tokens.surface};
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusCard};
  padding: 20px;
  position: relative;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;

  &:hover {
    border-color: ${tokens.borderHover};
    box-shadow: ${tokens.shadowHover};
    transform: translateY(-2px);
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 10;
  background: #FEF3C7;
  color: #92400E;
  padding: 4px 9px;
  border-radius: ${tokens.radiusPill};
  border: 1px solid #FDE68A;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  letter-spacing: 0.2px;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const CardActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: auto;
`;

const PitchButton = styled.button`
  flex: 1;
  background: ${props => props.$pitched ? tokens.successLight : tokens.action};
  color: ${props => props.$pitched ? tokens.success : 'white'};
  border: ${props => props.$pitched ? `1px solid ${tokens.successBorder}` : 'none'};
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1px;
  cursor: ${props => props.$pitched || props.disabled ? 'default' : 'pointer'};
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 40px;

  &:hover:not(:disabled) {
    background: ${props => props.$pitched ? tokens.successLight : tokens.actionHover};
    transform: ${props => props.$pitched ? 'none' : 'translateY(-1px)'};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 14px;
    min-height: 44px;
  }
`;

const SaveActionButton = styled.button`
  flex: 1;
  background: ${props => props.$saved ? tokens.primaryLight : 'transparent'};
  color: ${props => props.$saved ? tokens.primary : tokens.textSecondary};
  border: 1px solid ${props => props.$saved ? tokens.primaryBorder : tokens.border};
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  min-height: 40px;
  letter-spacing: 0.1px;

  &:hover {
    background: ${props => props.$saved ? tokens.primaryLight : tokens.primaryLight};
    color: ${props => props.$saved ? tokens.primary : tokens.primary};
    border-color: ${props => props.$saved ? tokens.primaryBorder : tokens.primaryBorder};
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 14px;
    min-height: 44px;
  }
`;

const BrandLogo = styled.div`
  width: 100%;
  aspect-ratio: 2.2 / 1;
  background: #FFFFFF;
  border: 1px solid #F0F0F0;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  overflow: hidden;
  position: relative;
`;

const LogoImg = styled.img`
  max-width: 65%;
  max-height: 60%;
  width: auto;
  height: auto;
  object-fit: contain;
  object-position: center;
  image-rendering: -webkit-optimize-contrast;
  mix-blend-mode: multiply;
`;

const LogoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${tokens.textPrimary};
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -1px;
`;

const BrandInfo = styled.div`
  text-align: center;
  width: 100%;
`;

const BrandName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${tokens.textPrimary};
  margin-bottom: 5px;
  letter-spacing: -0.2px;
  text-align: center;
`;

const BrandDescription = styled.p`
  font-size: 12.5px;
  color: ${tokens.textMuted};
  line-height: 1.55;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center;
`;

// Quick Wins Badges
const QuickWinBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
`;

const MatchBadge = styled.span`
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  color: #92400E;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: 1px solid #FCD34D;
`;

const ValueBadge = styled.span`
  background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
  color: #065F46;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: 1px solid #A7F3D0;
`;

const CardTags = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 14px;
  flex-wrap: wrap;
`;

const CategoryTag = styled.span`
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
  border: 1px solid ${(p) => p.$border};
  padding: 4px 10px;
  border-radius: ${tokens.radiusPill};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1px;
  text-transform: capitalize;
`;

const ContactFilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 14px 16px;
  background: ${tokens.surface};
  border: 1px solid ${tokens.border};
  border-radius: 14px;
`;

const ContactFilterLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${tokens.textSecondary};
  margin-right: 4px;
  white-space: nowrap;
`;

const ContactPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: ${tokens.radiusPill};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid ${(p) => (p.$active ? tokens.action : tokens.border)};
  background: ${(p) => (p.$active ? tokens.action : tokens.surface)};
  color: ${(p) => (p.$active ? '#FFFFFF' : tokens.textSecondary)};

  &:hover {
    border-color: ${tokens.action};
    color: ${(p) => (p.$active ? '#FFFFFF' : tokens.textPrimary)};
  }
`;

const TagFollowers = styled.span`
  background: ${tokens.accentLight};
  color: ${tokens.accent};
  border: 1px solid ${tokens.accentBorder};
  padding: 4px 10px;
  border-radius: ${tokens.radiusPill};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1px;
`;

const CardDivider = styled.div`
  height: 1px;
  background: ${tokens.border};
  margin: 0 -20px 14px;
`;

const CardStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 14px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: ${tokens.textPrimary};

  &.green {
    color: ${tokens.success};
  }
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: ${tokens.textMuted};
  font-weight: 500;
  letter-spacing: 0.2px;
  white-space: nowrap;
`;

const StatDivider = styled.div`
  width: 1px;
  height: 28px;
  background: ${tokens.border};
`;

const ResponsesLine = styled.div`
  text-align: center;
  font-size: 11.5px;
  color: ${tokens.textMuted};
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const PulsingDot = styled.span`
  width: 8px;
  height: 8px;
  background: #10B981;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.2); }
  }
`;

const ResponsesCount = styled.span`
  color: ${tokens.success};
  font-weight: 700;
`;

const SignupCTA = styled.div`
  margin-top: 16px;
  padding: 10px 16px;
  background: transparent;
  color: ${tokens.textPrimary};
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusBtn};
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s;

  &:hover {
    background: ${tokens.action};
    color: white;
    border-color: ${tokens.action};
  }

  svg {
    width: 15px;
    height: 15px;
    color: ${tokens.textMuted};
  }

  &:hover svg {
    color: white;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 48px;

  .ant-pagination {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px;
  }

  .ant-pagination-item,
  .ant-pagination-prev,
  .ant-pagination-next {
    min-width: 36px;
    height: 36px;
    line-height: 34px;
    border-radius: 10px;
    border: 1px solid #E5E7EB;
    background: white;

    a {
      color: #374151;
      font-weight: 500;
    }

    &:hover {
      border-color: #0F0F0F;

      a {
        color: #0F0F0F;
      }
    }
  }

  .ant-pagination-item-active {
    background: #0F0F0F;
    border-color: #0F0F0F;

    a {
      color: white !important;
    }
  }

  .ant-pagination-total-text {
    font-size: 14px;
    color: #6B7280;
    font-weight: 500;
    order: -1;
    width: 100%;
    text-align: center;
    margin-bottom: 8px;
  }

  @media (max-width: 768px) {
    margin-top: 32px;

    .ant-pagination-item,
    .ant-pagination-prev,
    .ant-pagination-next {
      min-width: 32px;
      height: 32px;
      line-height: 30px;
      border-radius: 8px;
      font-size: 13px;
    }

    .ant-pagination-jump-prev,
    .ant-pagination-jump-next {
      min-width: 28px;
    }

    .ant-pagination-total-text {
      font-size: 13px;
      margin-bottom: 4px;
    }
  }

  @media (max-width: 380px) {
    .ant-pagination-item,
    .ant-pagination-prev,
    .ant-pagination-next {
      min-width: 30px;
      height: 30px;
      line-height: 28px;
      font-size: 12px;
    }
  }
`;

// Discovery Fallback Components
const DiscoveryFallback = styled.div`
  text-align: center;
  padding: 48px 24px;
  background: white;
  border-radius: 16px;
  border: 1px solid #E5E5E5;
  margin: 24px 0;
`;

const DiscoveryIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
`;

const DiscoveryTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #0F0F0F;
  margin: 0 0 8px;
`;

const DiscoveryText = styled.p`
  font-size: 14px;
  color: #6B6B6B;
  margin: 0 0 24px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const DiscoveryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
  color: white;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const DiscoveredBrandCard = styled.div`
  max-width: 400px;
  margin: 24px auto 0;
  background: white;
  border: 2px solid #0EA5E9;
  border-radius: 16px;
  padding: 24px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(14, 165, 233, 0.2);
  }
`;

const DiscoveredBadge = styled.span`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
`;

const UnverifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #FEF3C7;
  color: #92400E;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  margin-top: 8px;
`;

const TierBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${props => props.$tier === 2 ? '#DCFCE7' : '#E0E7FF'};
  color: ${props => props.$tier === 2 ? '#166534' : '#3730A3'};
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 600;
  margin-top: 4px;
`;

const AlternativeEmails = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
  text-align: left;

  h5 {
    font-size: 11px;
    font-weight: 600;
    color: #6B7280;
    margin: 0 0 8px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    font-size: 12px;
    color: #4B5563;
    padding: 4px 0;
    cursor: pointer;

    &:hover {
      color: #0EA5E9;
    }
  }
`;

const DiscoveredBrandName = styled.h4`
  font-size: 18px;
  font-weight: 700;
  color: #0F0F0F;
  margin: 8px 0 4px;
  text-align: center;
`;

const DiscoveredBrandEmail = styled.div`
  font-size: 14px;
  color: #0EA5E9;
  font-weight: 500;
  text-align: center;
  margin-bottom: 16px;
`;

const DiscoveryError = styled.div`
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #991B1B;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  margin-top: 16px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;

const RateLimitInfo = styled.div`
  font-size: 12px;
  color: #6B6B6B;
  margin-top: 16px;
`;

// Open PR Applications Featured Section
const OpenPRSection = styled.section`
  margin-bottom: 20px;
  padding: 24px;
  background: ${tokens.surface};
  border-radius: ${tokens.radiusCard};
  border: 1px solid ${tokens.border};
  box-shadow: ${tokens.shadowCard};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #E11D48;
  }

  @media (max-width: 768px) {
    padding: 18px 16px;
    margin: 20px auto 24px;
  }

  @media (max-width: 380px) {
    padding: 16px 12px;
    border-radius: 16px;
  }
`;

const OpenPRHeader = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
    color: ${tokens.textPrimary};
    display: flex;
    align-items: center;
    gap: 8px;
    letter-spacing: -0.3px;

    svg {
      width: 20px;
      height: 20px;
      color: ${tokens.primary};
    }
  }

  .badge {
    background: #E11D48;
    color: white;
    font-size: 10px;
    padding: 4px 10px;
    border-radius: ${tokens.radiusPill};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  @media (max-width: 768px) {
    h2 { font-size: 17px; }
    gap: 8px;
  }

  @media (max-width: 380px) {
    h2 { font-size: 16px; }
  }
`;

const OpenPRSubtitle = styled.p`
  margin: 0 0 18px;
  color: ${tokens.textMuted};
  font-size: 13px;
  line-height: 1.5;

  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 14px;
  }
`;

const OpenPRGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const OpenPRCard = styled.div`
  background: ${tokens.surface};
  border: 1px solid ${tokens.border};
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s;
  min-width: 0;

  &:hover {
    transform: translateY(-2px);
    border-color: ${tokens.borderHover};
    box-shadow: ${tokens.shadowHover};
  }

  @media (max-width: 480px) {
    padding: 14px;
    border-radius: 12px;
  }
`;

const OpenPRCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const OpenPRLogo = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  background: ${tokens.subtle};
  border: 1px solid ${tokens.border};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }
`;

const OpenPRInfo = styled.div`
  flex: 1;
  min-width: 0;

  .name {
    font-weight: 700;
    font-size: 14px;
    color: ${tokens.textPrimary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .category {
    font-size: 12px;
    color: ${tokens.textMuted};
  }

  @media (max-width: 480px) {
    .name { font-size: 13px; }
    .category { font-size: 11px; }
  }
`;

const ApplyButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  color: ${tokens.textPrimary};
  border: 1px solid ${tokens.border};
  padding: 9px 14px;
  border-radius: ${tokens.radiusBtn};
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    background: ${tokens.action};
    border-color: ${tokens.action};
    color: white;
    transform: translateY(-1px);
  }

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    color: ${tokens.textMuted};
  }

  &:hover svg {
    color: white;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 12px;
  }
`;

export default UnifiedBrandDirectory;
