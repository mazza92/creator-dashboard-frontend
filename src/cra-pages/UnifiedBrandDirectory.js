import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { Spin, message } from 'antd';
import { Search, Lock, Mail, Heart, Sparkles, Check, Target, X, ChevronDown } from 'lucide-react';
import { normalizeCategory, categoryLabel } from '../constants/brandCategories';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import UpgradeModal from '../creator-portal/UpgradeModal';
import PRPackageModal from '../creator-portal/PRPackageModal';
import { UnlockModalV2 } from '../creator-portal/unlockV2';
import LandingPageLayout from '../Layouts/LandingPageLayout';
import { creatorTokens as tokens } from '../theme/creatorTokens';
import LoadingSpinner from '../components/LoadingSpinner';

// Feature flag for V2 modal testing
const USE_UNLOCK_V2 = true;

const isMicroFriendlyBrand = (brand) => {
  if (!brand) return false;
  // Admin-curated flag from pr_brands.micro_friendly is the source of truth
  if (brand.micro_friendly === true || brand.is_micro_friendly === true) return true;
  if (brand.micro_friendly === false || brand.is_micro_friendly === false) return false;
  // Fallback heuristic only for API responses that don't include the flag
  const min = brand.minFollowers ?? brand.min_followers;
  if (min == null || min === '' || Number(min) === 0) return true;
  return Number(min) <= 10000;
};

const brandHasEmail = (brand) => {
  const email = brand?.contact_email || brand?.pr_email || brand?.email || brand?.verified_email;
  if (email && String(email).includes('@')) return true;
  return !!(brand?.hasEmailContact || brand?.has_email_contact || brand?.has_email || brand?.verified_contact || brand?.hasEmail);
};

const brandHasForm = (brand) => {
  const url = brand?.application_form_url || brand?.application_url || brand?.pr_form_url || brand?.form_url;
  if (url && String(url).length > 4) return true;
  return !!(brand?.has_application_form || brand?.hasApplication || brand?.has_application || brand?.hasForm);
};

const brandIsAffiliateForm = (brand) => {
  const url = String(brand?.application_form_url || brand?.application_url || brand?.pr_form_url || '').toLowerCase();
  return /superfiliate|affiliate|ambassador|portal\/sign/.test(url);
};

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
  const [userNiches, setUserNiches] = useState([]); // silent soft-sort from saved niches
  const [loading, setLoading] = useState(true);
  const [openPrBrands, setOpenPrBrands] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 24 });
  const [savedBrandIds, setSavedBrandIds] = useState(new Set());

  // Infinite scroll state
  const [fetchingMore, setFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1); // Track current page to avoid stale closures

  // Subscription/quota tracking (for logged-in users)
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [unlockBalance, setUnlockBalance] = useState({ remaining: 3, used: 0, pack_credits: 0, tier: 'free', reset_at: null });
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const FREE_UNLOCK_LIMIT = 3; // Free users get 3 brand unlocks per month

  // Pitch modal state
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [selectedBrandForPitch, setSelectedBrandForPitch] = useState(null);
  const [pitchedBrands, setPitchedBrands] = useState(new Set());
  const [unlockedBrands, setUnlockedBrands] = useState(new Set()); // Brands where contact was revealed

  // V4: Welcome card for first-time users after onboarding
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);

  const [filters, setFilters] = useState({
    // For You deep-link uses ?search= (also accept legacy ?q=)
    search: searchParams.get('search') || searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    activity: searchParams.get('activity') || '', // 'new', 'active', 'responsive'
    contactType: searchParams.get('contactType') || '', // 'application', 'email', or '' for all
    // Dashboard Discover defaults to micro-friendly (preview parity); ?micro=0 turns it off
    microOnly: searchParams.get('micro') === '0'
      ? false
      : (searchParams.get('micro') === '1'
        || searchParams.get('filter') === 'micro'
        || (location.pathname.startsWith('/creator/dashboard') && searchParams.get('micro') == null)),
    region: searchParams.get('region') || '',
  });
  const filtersRef = useRef(filters); // Track current filters to avoid stale closures in loadMoreBrands
  const [searchDraft, setSearchDraft] = useState(
    searchParams.get('search') || searchParams.get('q') || ''
  );
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState('');
  const categoryPickerRef = useRef(null);

  // Keep search filter in sync when navigating from For You with ?search= / ?q=
  useEffect(() => {
    const incoming = searchParams.get('search') || searchParams.get('q');
    if (incoming == null) return;
    setFilters((prev) => (prev.search === incoming ? prev : { ...prev, search: incoming }));
    setSearchDraft((prev) => (prev === incoming ? prev : incoming));
    if (searchParams.get('q') && !searchParams.get('search')) {
      const next = new URLSearchParams(searchParams);
      next.set('search', incoming);
      next.delete('q');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Discovery state
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveredBrand, setDiscoveredBrand] = useState(null);
  const [discoveryError, setDiscoveryError] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState(null);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    fetchOpenPrBrands();
    if (user) {
      // Use combined endpoint for faster loading (reduces 4 API calls to 1)
      fetchDashboardInit();
    } else {
      setUserNiches([]);
    }
  }, [user]);

  // Keep filtersRef in sync to avoid stale closures in loadMoreBrands
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Fetch brands when filters change (NOT on page change - that's handled by infinite scroll)
  useEffect(() => {
    fetchBrands();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, userNiches]);

  // V4: Check if user just completed onboarding (first login welcome experience)
  useEffect(() => {
    const justCompleted = sessionStorage.getItem('justCompletedOnboarding');
    if (justCompleted === 'true' && isDashboardView) {
      setShowWelcomeCard(true);
      // Clear the flag so it only shows once
      sessionStorage.removeItem('justCompletedOnboarding');
    }
  }, [isDashboardView]);

  // Handle brand URL param to open specific brand modal (e.g., from better matches redirect)
  useEffect(() => {
    const brandSlug = searchParams.get('brand');
    if (brandSlug && user) {
      // Fetch the brand by slug and open the modal
      const openBrandBySlug = async () => {
        try {
          // Use the brands list API with slug filter
          const { data } = await axios.get(`${API_BASE}/api/public/brands`, {
            params: { slug: brandSlug, limit: 1 }
          });
          const brand = data.brands?.[0];
          if (brand) {
            // Map API fields to expected format
            // API returns: name, logo, description, coverImage, etc.
            // Modal expects: brand_name, logo_url, notes, etc.
            setSelectedBrandForPitch({
              id: brand.id,
              brand_name: brand.name || brand.brand_name,  // API returns 'name'
              name: brand.name || brand.brand_name,
              category: brand.category,
              website: brand.website,
              logo_url: brand.logo,  // API returns 'logo'
              slug: brand.slug,
              description: brand.description,
              niches: brand.niches,
              regions: brand.regions,
              hasApplication: brand.hasApplication,
              hasEmailContact: brand.hasEmailContact,
            });
            setShowPitchModal(true);
            // Clear the brand param from URL
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('brand');
            setSearchParams(newParams, { replace: true });
          } else {
            message.error('Brand not found');
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('brand');
            setSearchParams(newParams, { replace: true });
          }
        } catch (error) {
          console.error('Error fetching brand by slug:', error);
          message.error('Brand not found');
          // Clear the invalid param
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('brand');
          setSearchParams(newParams, { replace: true });
        }
      };
      openBrandBySlug();
    }
  }, [searchParams, user]);

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

  // Combined dashboard initialization - replaces 4 separate API calls
  const fetchDashboardInit = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/pr-crm/dashboard-init`, {
        withCredentials: true
      });
      if (data.success) {
        // Set subscription tier
        setSubscriptionTier(data.subscription?.tier || 'free');

        // Set unlock balance
        if (data.unlock_balance) {
          setUnlockBalance({
            remaining: data.unlock_balance.remaining ?? FREE_UNLOCK_LIMIT,
            used: data.unlock_balance.used ?? 0,
            pack_credits: data.unlock_balance.pack_credits ?? 0,
            tier: data.unlock_balance.tier || 'free',
            reset_at: data.unlock_balance.reset_at
          });
        }

        // Set saved/pitched brands
        setSavedBrandIds(new Set(data.saved_brand_ids || []));
        setPitchedBrands(new Set(data.pitched_brand_ids || []));

        // Set unlocked brands
        setUnlockedBrands(new Set(data.unlocked_brand_ids || []));

        // Set user niches
        const niches = (data.user_niches || [])
          .map((n) => String(n).trim().toLowerCase())
          .filter(Boolean)
          .flatMap((n) => {
            if (n.includes('&') || n.includes(',')) {
              return n.split(/[&,]/).map((p) => p.trim()).filter(Boolean);
            }
            return [n];
          })
          .map((n) => {
            const canon = normalizeCategory(n);
            if (n.includes('parent') || n.includes('baby')) return 'baby';
            if (n.includes('beauty') || n.includes('makeup')) return 'beauty';
            return canon && canon !== 'other' ? canon : n;
          })
          .filter(Boolean);
        setUserNiches([...new Set(niches)]);
      }
    } catch (error) {
      console.error('Error in dashboard init:', error);
      // Fallback to individual calls if combined endpoint fails
      fetchSubscriptionStatus();
      fetchSavedBrands();
      fetchUnlockedBrands();
      fetchUserNiches();
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
          remaining: balanceResponse.data.remaining ?? FREE_UNLOCK_LIMIT,
          used: balanceResponse.data.used ?? 0,
          pack_credits: balanceResponse.data.pack_credits ?? 0,
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

  const fetchUnlockedBrands = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/pr-crm/unlocks/brands`, {
        withCredentials: true
      });
      if (response.data.success) {
        setUnlockedBrands(new Set(response.data.unlocked_brand_ids));
      }
    } catch (error) {
      console.error('Error fetching unlocked brands:', error);
    }
  };

  const fetchUserNiches = async () => {
    if (!isDashboardView) return;
    try {
      const { data } = await axios.get(`${API_BASE}/profile`, { withCredentials: true });
      const raw =
        data?.creator_niches ||
        data?.niches ||
        data?.niche ||
        [];
      let list = raw;
      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          list = Array.isArray(parsed) ? parsed : raw.split(',');
        } catch {
          list = raw.split(',');
        }
      }
      if (!Array.isArray(list)) list = [];
      const normalized = list
        .map((n) => String(n).trim().toLowerCase())
        .filter(Boolean)
        .flatMap((n) => {
          if (n.includes('&') || n.includes(',')) {
            return n.split(/[&,]/).map((p) => p.trim()).filter(Boolean);
          }
          return [n];
        })
        .map((n) => {
          const canon = normalizeCategory(n);
          if (n.includes('parent') || n.includes('baby')) return 'baby';
          if (n.includes('beauty') || n.includes('makeup')) return 'beauty';
          return canon && canon !== 'other' ? canon : n;
        })
        .filter(Boolean);
      setUserNiches([...new Set(normalized)]);
    } catch (error) {
      console.warn('Could not load niches for Discover sort:', error);
    }
  };

  const fetchBrands = async (loadMore = false) => {
    // Guard against multiple simultaneous fetches
    if (loadMore && isFetchingRef.current) {
      return;
    }

    if (loadMore) {
      isFetchingRef.current = true;
      setFetchingMore(true);
    } else {
      setLoading(true);
      // Reset refs on fresh fetch
      hasMoreRef.current = true;
      setHasMore(true);
      pageRef.current = 1;
    }

    try {
      // Use pageRef and filtersRef to avoid stale closure issues with loadMoreBrands callback
      const pageToFetch = loadMore ? pageRef.current + 1 : 1;
      // Use filtersRef.current to get latest filters (avoids stale closure in loadMoreBrands)
      const currentFilters = filtersRef.current;
      const params = {
        page: pageToFetch,
        limit: pagination.limit,
        ...(currentFilters.search && { search: currentFilters.search }),
        ...(currentFilters.category && { category: currentFilters.category }),
        ...(currentFilters.activity && { activity: currentFilters.activity }),
        ...(currentFilters.contactType && { contact_type: currentFilters.contactType }),
        ...(currentFilters.region && { region: currentFilters.region }),
        // Soft sort from onboarding niches (no UI) — skip when category filter is set
        ...(isDashboardView && user && userNiches.length > 0 && !currentFilters.category && {
          prefer_niches: userNiches.join(',')
        })
      };

      const { data } = await axios.get(`${API_BASE}/api/public/brands`, { params });

      if (loadMore) {
        // Update page ref BEFORE state updates
        pageRef.current = pageToFetch;
        // Append to existing brands
        setBrands(prev => {
          const newBrands = [...prev, ...data.brands];
          // Check if we've loaded all brands
          if (newBrands.length >= data.pagination.total || data.brands.length < pagination.limit) {
            hasMoreRef.current = false;
            setHasMore(false);
          }
          return newBrands;
        });
        setPagination(prev => ({ ...prev, page: pageToFetch, total: data.pagination.total }));
      } else {
        // Replace brands (initial load or filter change)
        pageRef.current = 1;
        setBrands(data.brands);
        setPagination(prev => ({ ...prev, page: 1, total: data.pagination.total }));
        // Check if we've loaded all brands on initial load
        if (data.brands.length >= data.pagination.total || data.brands.length < pagination.limit) {
          hasMoreRef.current = false;
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
      setFetchingMore(false);
      isFetchingRef.current = false;
    }
  };

  // Load more brands callback for infinite scroll - uses refs to avoid stale closures
  const loadMoreBrands = useCallback(() => {
    // Check refs instead of state to avoid dependency loops
    if (!isFetchingRef.current && hasMoreRef.current) {
      fetchBrands(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Intersection Observer for infinite scroll using callback ref
  const observerRef = useRef(null);

  const setLoadMoreRef = useCallback((node) => {
    // Disconnect previous observer if exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Save the DOM node reference
    loadMoreRef.current = node;

    // If no node, nothing to observe
    if (!node) return;

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !isFetchingRef.current) {
          loadMoreBrands();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    observerRef.current.observe(node);
  }, [loadMoreBrands]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

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
          remaining: response.data.remaining ?? FREE_UNLOCK_LIMIT,
          used: response.data.used ?? 0,
          pack_credits: response.data.pack_credits ?? 0,
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
    const stayOpen = Boolean(context?.stayOpen);
    const alreadyRecorded = Boolean(context?.alreadyRecorded);
    const goPipeline = context?.goPipeline;

    if (contactedBrand && !alreadyRecorded) {
      setPitchedBrands(prev => new Set([...prev, contactedBrand.id]));
      setSavedBrandIds(prev => new Set([...prev, contactedBrand.id]));
    }

    if (stayOpen) {
      message.success('Email opened. Keep going with your next steps.');
      return;
    }

    setShowPitchModal(false);
    setSelectedBrandForPitch(null);

    try {
      const response = await axios.get(`${API_BASE}/api/pr-crm/unlocks/balance`, {
        withCredentials: true
      });
      if (response.data) {
        setUnlockBalance({
          remaining: response.data.remaining ?? FREE_UNLOCK_LIMIT,
          used: response.data.used ?? 0,
          pack_credits: response.data.pack_credits ?? 0,
          tier: response.data.tier || 'free',
          reset_at: response.data.reset_at
        });
      }
    } catch (error) {
      setUnlockBalance(prev => ({
        ...prev,
        remaining: Math.max(0, (prev.remaining ?? FREE_UNLOCK_LIMIT) - 1)
      }));
    }

    if (contactedBrand) {
      if (goPipeline) {
        message.success(
          method === 'form'
            ? 'PR form opened. Confirm your application in Saved so we can track follow-ups.'
            : 'Email opened. Confirm it in Saved so we can track follow-ups.'
        );
        navigate(
          `/creator/dashboard/pr-pipeline?confirmBrand=${contactedBrand.id}&method=${method}`
        );
      } else {
        message.success('Pitch started. Unlock another brand when you are ready.');
      }
    }
  };

  const handleSearch = (value) => {
    const next = typeof value === 'string' ? value : searchDraft;
    setSearchDraft(next);
    setFilters(prev => ({ ...prev, search: next }));
    setPagination(prev => ({ ...prev, page: 1 }));
    setHasMore(true); // Reset infinite scroll
    // Reset discovery state when search changes
    setDiscoveredBrand(null);
    setDiscoveryError('');
    updateURLParams({ search: next });
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault?.();
    setShowAutocomplete(false);
    setSuggestions([]);
    handleSearch(searchDraft);
  };

  // Autocomplete: fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowAutocomplete(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/api/pr-crm/brands/search-suggestions`, {
        params: { q: query },
        withCredentials: true
      });

      if (response.data.success) {
        const newSuggestions = response.data.suggestions || [];
        setSuggestions(newSuggestions);
        setShowAutocomplete(true);
        setActiveIndex(-1);
      }
    } catch (error) {
      console.error('[Autocomplete] Error:', error);
      setSuggestions([]);
    }
  }, []);

  // Autocomplete: handle input change with debounce
  const handleSearchInputChange = useCallback((value) => {
    setSearchDraft(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 150);
  }, [fetchSuggestions]);

  // Autocomplete: keyboard navigation
  const handleSearchKeyDown = (e) => {
    if (!showAutocomplete || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          e.preventDefault();
          handleSelectSuggestion(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        setShowAutocomplete(false);
        setActiveIndex(-1);
        break;
      default:
        break;
    }
  };

  // Autocomplete: select a suggestion
  const handleSelectSuggestion = (suggestion) => {
    setShowAutocomplete(false);
    setSuggestions([]);
    setSearchDraft(suggestion.name);

    // Find the brand in our list or open pitch modal directly
    const existingBrand = brands.find(b => b.id === suggestion.id);
    if (existingBrand) {
      setSelectedBrandForPitch(existingBrand);
      setShowPitchModal(true);
    } else {
      // Search for it to load into the grid
      handleSearch(suggestion.name);
    }
  };

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    // Micro-creator filter is Pro-gated (admin-curated micro_friendly flag)
    if (key === 'microOnly' && value && subscriptionTier !== 'pro' && subscriptionTier !== 'elite') {
      setUpgradeModalVisible(true);
      return;
    }
    const nextValue = key === 'category' && value ? (normalizeCategory(value) || value) : value;
    setFilters(prev => ({ ...prev, [key]: nextValue }));
    setPagination(prev => ({ ...prev, page: 1 }));
    setHasMore(true); // Reset infinite scroll
    if (key === 'microOnly') {
      // Persist off-state so dashboard default (micro on) does not re-apply
      updateURLParams({ micro: nextValue ? '1' : '0' });
    } else {
      updateURLParams({ [key]: nextValue });
    }
  };

  const updateURLParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const isProUser = subscriptionTier === 'pro' || subscriptionTier === 'elite';
  // Pro-gated: the micro filter only actually applies for Pro/Elite, even when
  // the dashboard default or a ?micro=1 deep link sets it in state.
  const microFilterActive = !!filters.microOnly && isProUser;

  const displayedBrands = microFilterActive
    ? brands.filter((b) => {
        if (b.micro_friendly === true || b.is_micro_friendly === true) return true;
        if (b.micro_friendly === false || b.is_micro_friendly === false) return false;
        const min = b.minFollowers ?? b.min_followers;
        return min == null || min === 0 || Number(min) <= 10000;
      })
    : brands;

  const selectedCategory = useMemo(
    () => categories.find((c) => c.value === filters.category) || null,
    [categories, filters.category]
  );

  const filteredCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) =>
      `${c.label} ${c.value}`.toLowerCase().includes(q)
    );
  }, [categories, categoryQuery]);

  useEffect(() => {
    if (!categoryOpen) return undefined;
    const onPointerDown = (e) => {
      if (!categoryPickerRef.current?.contains(e.target)) {
        setCategoryOpen(false);
        setCategoryQuery('');
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setCategoryOpen(false);
        setCategoryQuery('');
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [categoryOpen]);

  const pickCategory = (value) => {
    handleFilterChange('category', value || '');
    setCategoryOpen(false);
    setCategoryQuery('');
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
          <title>2,000+ PR Forms for Brands (2026): Direct Application Links | NewCollab</title>
          <meta name="description" content="Browse 2,000+ verified PR forms for brands—direct application links, PR list requirements, and micro-influencer friendly options. Filter by beauty, skincare, K-beauty & fashion. Apply free." />
          <meta name="keywords" content="pr forms for brands, pr forms, pr application form, pr list application, skincare pr list, k-beauty pr forms, brands that send pr to small influencers, influencer pr list requirements" />
          <meta property="og:title" content="2,000+ PR Forms for Brands: Direct Application Links" />
          <meta property="og:description" content="Verified PR forms for brands with direct application links. 2,000+ beauty, skincare, and lifestyle brands—micro-influencer friendly. Start applying today." />
          <link rel="canonical" href="https://newcollab.co/directory" />
        </Helmet>
      )}

      <Container $isDashboard={isDashboardView}>
        {/* Hero Section - Only show on public /directory page */}
        {!isDashboardView && (
          <Hero>
            <HeroContent>
              <h1>{collectionTitle || '2,000+ PR Forms for Brands: Direct Application Links'}</h1>
              <p>{collectionDescription || 'Browse verified PR forms for brands—2,000+ direct application links, PR requirements, and options for small creators in beauty, skincare, K-beauty, tech, and fashion.'}</p>
            </HeroContent>
          </Hero>
        )}

        <ContentWrapper>
          {isDashboardView && (
            <DashboardDiscoverHeader>
              <DashboardEyebrow>Discover</DashboardEyebrow>
              <DashboardTitle>
                Find PR emails & forms
              </DashboardTitle>
              <DashboardSub>
                Search any brand for a brand email or signup form. Filter for micros, email, or forms.
              </DashboardSub>
            </DashboardDiscoverHeader>
          )}

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
                    We found <strong>{(pagination.total || 0).toLocaleString()} brands</strong> that match your niche and are actively working with creators like you.
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
            const packCredits = unlockBalance.pack_credits || 0;
            const used = unlockBalance.used ?? Math.max(0, FREE_UNLOCK_LIMIT - Math.min(remaining, FREE_UNLOCK_LIMIT));
            return (
              <QuotaBanner $exhausted={remaining <= 0}>
                <QuotaDots>
                  {[0, 1, 2].map(i => (
                    <QuotaDot key={i} $filled={i < used} />
                  ))}
                </QuotaDots>
                <QuotaText>
                  <QuotaTitle>
                    {packCredits > 0
                      ? `${remaining} packs left`
                      : `${remaining} of ${FREE_UNLOCK_LIMIT} unlocks left`}
                  </QuotaTitle>
                  <QuotaSub>
                    {remaining <= 0
                      ? 'Keep sending with Pro at $19/mo'
                      : `Resets ${unlockBalance.reset_at ? new Date(unlockBalance.reset_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'monthly'}`}
                  </QuotaSub>
                </QuotaText>
                {remaining <= 0 && (
                  <QuotaUpgrade onClick={() => setUpgradeModalVisible(true)}>
                    Go Pro · $19/mo
                  </QuotaUpgrade>
                )}
              </QuotaBanner>
            );
          })()}

          {/* Search CTA + full category filter */}
          <SearchToolsRow>
            <SearchCtaForm onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
              <SearchCtaInput
                ref={searchInputRef}
                type="search"
                placeholder={
                  pagination.total > 0
                    ? `Search ${pagination.total.toLocaleString()} brands…`
                    : 'Search brands…'
                }
                value={searchDraft}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => searchDraft.length >= 2 && suggestions.length > 0 && setShowAutocomplete(true)}
                autoComplete="off"
                aria-label="Search brands"
              />
              <SearchCtaButton type="submit">Search</SearchCtaButton>

              {/* Autocomplete Dropdown */}
              <AutocompleteDropdown $open={showAutocomplete && searchDraft.length >= 2} ref={autocompleteRef}>
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion, idx) => (
                    <AutocompleteItem
                      key={suggestion.id}
                      className={activeIndex === idx ? 'active' : ''}
                      onMouseDown={() => handleSelectSuggestion(suggestion)}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <AutocompleteLogo $hasImage={!!suggestion.logo}>
                        {suggestion.logo ? (
                          <img
                            src={suggestion.logo}
                            alt=""
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentNode.textContent = suggestion.name.charAt(0).toUpperCase();
                            }}
                          />
                        ) : (
                          suggestion.name.charAt(0).toUpperCase()
                        )}
                      </AutocompleteLogo>
                      <AutocompleteInfo>
                        <AutocompleteName>{suggestion.name}</AutocompleteName>
                        <AutocompleteCategory>{suggestion.category || 'Brand'}</AutocompleteCategory>
                      </AutocompleteInfo>
                    </AutocompleteItem>
                  ))
                ) : (
                  searchDraft.length >= 2 && (
                    <AutocompleteNoMatch>
                      Press "Search" to find "{searchDraft}"
                    </AutocompleteNoMatch>
                  )
                )}
              </AutocompleteDropdown>
            </SearchCtaForm>
            <CategoryPicker ref={categoryPickerRef}>
              <CategoryTrigger
                type="button"
                $active={!!filters.category}
                $open={categoryOpen}
                onClick={() => setCategoryOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={categoryOpen}
              >
                <CategoryTriggerText>
                  {selectedCategory ? selectedCategory.label : 'All categories'}
                </CategoryTriggerText>
                {filters.category ? (
                  <CategoryClear
                    type="button"
                    aria-label="Clear category"
                    onClick={(e) => {
                      e.stopPropagation();
                      pickCategory('');
                    }}
                  >
                    <X size={14} />
                  </CategoryClear>
                ) : (
                  <CategoryChevron $open={categoryOpen}>
                    <ChevronDown size={16} />
                  </CategoryChevron>
                )}
              </CategoryTrigger>

              {categoryOpen && (
                <CategoryMenu role="listbox">
                  <CategorySearchWrap>
                    <Search size={15} />
                    <CategorySearchInput
                      autoFocus
                      type="search"
                      placeholder="Filter categories…"
                      value={categoryQuery}
                      onChange={(e) => setCategoryQuery(e.target.value)}
                    />
                  </CategorySearchWrap>
                  <CategoryList>
                    <CategoryOption
                      type="button"
                      $active={!filters.category}
                      onClick={() => pickCategory('')}
                    >
                      <span>All categories</span>
                      {!filters.category && <Check size={14} />}
                    </CategoryOption>
                    {filteredCategories.map((cat) => (
                      <CategoryOption
                        key={cat.value}
                        type="button"
                        $active={filters.category === cat.value}
                        onClick={() => pickCategory(cat.value)}
                      >
                        <span>
                          {cat.label}
                          <CategoryCount>{cat.count}</CategoryCount>
                        </span>
                        {filters.category === cat.value && <Check size={14} />}
                      </CategoryOption>
                    ))}
                    {filteredCategories.length === 0 && (
                      <CategoryEmpty>No categories match</CategoryEmpty>
                    )}
                  </CategoryList>
                </CategoryMenu>
              )}
            </CategoryPicker>
          </SearchToolsRow>

          <ContactFilterBar>
            <ContactPill
              type="button"
              $active={microFilterActive}
              onClick={() => handleFilterChange('microOnly', !microFilterActive)}
            >
              {isProUser ? 'Works with micro-creators' : '🔒 Works with micro-creators'}
            </ContactPill>
            <ContactPill
              type="button"
              $active={filters.contactType === 'email'}
              onClick={() => handleFilterChange('contactType', filters.contactType === 'email' ? '' : 'email')}
            >
              Has PR email
            </ContactPill>
            <ContactPill
              type="button"
              $active={filters.contactType === 'application'}
              onClick={() => handleFilterChange('contactType', filters.contactType === 'application' ? '' : 'application')}
            >
              Has form / signup
            </ContactPill>
            <ContactPill
              type="button"
              $active={filters.region === 'US'}
              onClick={() => handleFilterChange('region', filters.region === 'US' ? '' : 'US')}
            >
              Ships US
            </ContactPill>
            <ContactPill
              type="button"
              $active={filters.region === 'Canada'}
              onClick={() => handleFilterChange('region', filters.region === 'Canada' ? '' : 'Canada')}
            >
              Canada
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
                    <Mail size={16} /> Get PR Package
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
              {displayedBrands.map(brand => {
                const isSaved = isBrandSaved(brand.id);
                const isPitched = pitchedBrands.has(brand.id);
                const isUnlocked = unlockedBrands.has(brand.id);
                const isPro = subscriptionTier === 'pro' || subscriptionTier === 'elite';
                const unlocksLeft = unlockBalance.remaining;

                // Use dashboard route for logged-in creators in dashboard, public route otherwise
                const brandUrl = isDashboardView && user
                  ? `/creator/dashboard/brand/${brand.slug}`
                  : `/brand/${brand.slug}`;

                const microFriendly = isMicroFriendlyBrand(brand);
                const hasEmail = brandHasEmail(brand);
                const hasForm = brandHasForm(brand);
                const isAffiliate = hasForm && brandIsAffiliateForm(brand);
                const minFollowers = brand.minFollowers ?? brand.min_followers;
                const giftValue = brand.estimatedValue || brand.price_point || brand.pricePoint || 45;
                const replyRate = brand.responseRate ?? brand.response_rate;
                const blurb = brand.description
                  || (brand.category
                    ? `${categoryLabel(brand.category)} brand. Unlock the email or form.`
                    : 'Unlock a brand email or program form.');

                return (
                  <BrandCard
                    key={brand.slug}
                    to={brandUrl}
                  >
                    {(brand.isFeatured || isUnlocked) && (
                      <CardTopMeta>
                        {brand.isFeatured && (
                          <MetaPill $tone="hot"><Sparkles size={12} /> Featured</MetaPill>
                        )}
                        {isUnlocked && (
                          <UnlockedInline><Check size={12} /> Unlocked</UnlockedInline>
                        )}
                      </CardTopMeta>
                    )}

                    <CardNameRow>
                      {brand.logo ? (
                        <CardAvatar
                          src={brand.logo}
                          alt=""
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <CardAvatarFallback>{(brand.name || '?').charAt(0)}</CardAvatarFallback>
                      )}
                      <div>
                        <BrandName>{brand.name}</BrandName>
                        {brand.category && (
                          <CardNiche>{categoryLabel(brand.category)}</CardNiche>
                        )}
                      </div>
                    </CardNameRow>

                    <BrandDescription>{blurb}</BrandDescription>

                    <CardTags>
                      {microFriendly && <Pill $tone="ok">Works with micro-creators</Pill>}
                      {hasEmail && <Pill $tone="email">PR email</Pill>}
                      {hasForm && <Pill $tone="form">Program form</Pill>}
                      {isAffiliate && <Pill $tone="aff">Affiliate signup</Pill>}
                      {minFollowers > 0 && (
                        <Pill>{(Number(minFollowers) / 1000).toFixed(0)}K+ followers</Pill>
                      )}
                    </CardTags>

                    <PreviewStats>
                      {replyRate != null && replyRate !== '' && (
                        <PreviewStat>
                          {replyRate}%
                          <em>reply rate</em>
                        </PreviewStat>
                      )}
                      <PreviewStat>
                        ~${giftValue}
                        <em>PR value</em>
                      </PreviewStat>
                      {brand.pitchStats?.totalPitches > 0 && (
                        <PreviewStat>
                          {brand.pitchStats.totalPitches}
                          <em>pitched</em>
                        </PreviewStat>
                      )}
                    </PreviewStats>

                    {brand.pitchStats?.totalResponses > 0 && (
                      <ResponsesLine>
                        <PulsingDot />
                        <span>
                          <ResponsesCount>{brand.pitchStats.totalResponses}</ResponsesCount>
                          {' '}creator{brand.pitchStats.totalResponses !== 1 ? 's' : ''} got a reply recently
                        </span>
                      </ResponsesLine>
                    )}

                    {isDashboardView && user && (
                      <CardActions>
                        <PitchButton
                          onClick={(e) => handlePitchBrand(brand, e)}
                          $pitched={isPitched || isUnlocked}
                          disabled={isPitched}
                        >
                          {isPitched ? (
                            <><Check size={16} /> {tokens.ctaContacted}</>
                          ) : isUnlocked ? (
                            <><Mail size={16} /> {tokens.ctaViewBrandPr}</>
                          ) : (
                            <><Mail size={16} /> {tokens.ctaGetBrandPr}</>
                          )}
                        </PitchButton>
                        <SaveActionButton
                          onClick={(e) => handleSaveBrand(brand, e)}
                          $saved={isSaved}
                          aria-label={isSaved ? 'Unsave brand' : 'Save brand'}
                        >
                          <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
                        </SaveActionButton>
                      </CardActions>
                    )}

                    {!user && !isDashboardView && (
                      <SignupCTA>
                        <Lock size={16} /> Sign up to contact brand
                      </SignupCTA>
                    )}
                  </BrandCard>
                );
              })}
              </BrandGrid>

              {/* Infinite Scroll: Loading more trigger */}
              {hasMore && !loading && (
                <LoadMoreTrigger ref={setLoadMoreRef}>
                  {fetchingMore && (
                    <LoadingSpinnerSmall>
                      <Spin size="default" />
                    </LoadingSpinnerSmall>
                  )}
                </LoadMoreTrigger>
              )}

              {/* End of results */}
              {!hasMore && brands.length > 0 && !loading && (
                <EndOfResults>
                  🎉 You've seen all {pagination.total} brands! Check back for new additions.
                </EndOfResults>
              )}
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
          unlockRemaining={unlockBalance.remaining}
        />
      )}

      {/* PR Package Modal (V2 or legacy) */}
      {showPitchModal && selectedBrandForPitch && (
        USE_UNLOCK_V2 ? (
          <UnlockModalV2
            isOpen={showPitchModal}
            onClose={() => {
              fetchUnlockedBrands();
              fetchSubscriptionStatus();
              setShowPitchModal(false);
              setSelectedBrandForPitch(null);
            }}
            brand={selectedBrandForPitch}
            onPitchSent={(brand, ctx) => {
              handlePitchSent(brand, ctx);
              if (!ctx?.stayOpen) {
                fetchSubscriptionStatus();
                fetchUnlockedBrands();
              }
            }}
            onOpenOpportunities={() => {
              sessionStorage.setItem('foryouForceOpportunities', '1');
              sessionStorage.setItem('foryouTabPicked', '1');
              setShowPitchModal(false);
              setSelectedBrandForPitch(null);
              navigate('/creator/dashboard/for-you');
            }}
            isPro={subscriptionTier === 'pro' || subscriptionTier === 'elite'}
            onUpgrade={() => {
              setShowPitchModal(false);
              setUpgradeModalVisible(true);
            }}
          />
        ) : (
          <PRPackageModal
            isOpen={showPitchModal}
            onClose={() => {
              fetchUnlockedBrands();
              fetchSubscriptionStatus();
              setShowPitchModal(false);
              setSelectedBrandForPitch(null);
            }}
            brand={selectedBrandForPitch}
            onPitchSent={(brand) => {
              handlePitchSent(brand);
              fetchSubscriptionStatus();
              fetchUnlockedBrands();
            }}
            isPro={subscriptionTier === 'pro' || subscriptionTier === 'elite'}
          />
        )
      )}
    </>
  );

  // Wrap with LandingPageLayout for public view, return plain content for dashboard
  return isDashboardView ? content : <LandingPageLayout>{content}</LandingPageLayout>;
};

// Styled Components
const Container = styled.div`
  width: 100%;
  background: ${props => props.$isDashboard ? tokens.paper : '#FAFAFA'};
  min-height: ${props => props.$isDashboard ? 'auto' : '100vh'};
  padding-bottom: ${props => props.$isDashboard ? '40px' : '80px'};
  font-family: ${tokens.fontSans};
`;

const ContentWrapper = styled.div`
  max-width: 1160px;
  margin: 0 auto;
  padding: 1.35rem 1.35rem 2.5rem;
  font-family: ${tokens.fontSans};

  @media (max-width: 768px) {
    padding: 1rem 0.9rem 5.5rem;
  }
`;

const DashboardDiscoverHeader = styled.div`
  margin-bottom: 1.15rem;
`;

const DashboardEyebrow = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #8a8a8a;
  margin-bottom: 0.35rem;
`;

const DashboardTitle = styled.h1`
  font-family: ${tokens.fontDisplay};
  font-size: clamp(1.7rem, 3vw, 2.35rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0 0 0.4rem;
  color: ${tokens.ink};
`;

const DashboardSub = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: ${tokens.muted};
  max-width: 36rem;
  line-height: 1.45;
`;

const SearchToolsRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: 0.55rem;
  margin-bottom: 0.75rem;
  max-width: 720px;

  @media (max-width: 640px) {
    flex-direction: column;
    max-width: none;
  }
`;

const SearchCtaForm = styled.form`
  display: flex;
  gap: 0.45rem;
  background: ${tokens.white};
  border: 1px solid ${tokens.line};
  border-radius: 14px;
  padding: 0.4rem;
  box-shadow: ${tokens.shadowCard};
  flex: 1;
  min-width: 0;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.35rem;
  }
`;

const CategoryPicker = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 200px;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const CategoryTrigger = styled.button`
  width: 100%;
  height: 100%;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  background: ${p => (p.$active ? tokens.accentSoft : tokens.white)};
  border: 1px solid ${p => (p.$open || p.$active ? tokens.accentBorder : tokens.line)};
  border-radius: 14px;
  box-shadow: ${tokens.shadowCard};
  cursor: pointer;
  font-family: ${tokens.fontSans};
  transition: border-color 0.15s, background 0.15s;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    border-color: ${tokens.accentBorder};
  }

  @media (max-width: 640px) {
    min-height: 44px;
  }
`;

const CategoryTriggerText = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${tokens.ink};
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CategoryChevron = styled.span`
  display: grid;
  place-items: center;
  color: ${tokens.muted};
  flex-shrink: 0;
  transition: transform 0.15s;
  transform: rotate(${p => (p.$open ? '180deg' : '0deg')});
`;

const CategoryClear = styled.button`
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 999px;
  background: ${tokens.white};
  color: ${tokens.muted};
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;

  &:hover {
    color: ${tokens.ink};
    background: #f4f4f4;
  }
`;

const CategoryMenu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 40;
  background: ${tokens.white};
  border: 1px solid ${tokens.line};
  border-radius: 14px;
  box-shadow: ${tokens.shadowHover};
  overflow: hidden;
  min-width: 220px;

  @media (max-width: 640px) {
    right: 0;
    left: 0;
    min-width: 0;
  }
`;

const CategorySearchWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 0.8rem;
  border-bottom: 1px solid ${tokens.line};
  color: ${tokens.muted};
`;

const CategorySearchInput = styled.input`
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 0.86rem;
  color: ${tokens.ink};
  font-family: ${tokens.fontSans};
  min-width: 0;

  &::placeholder {
    color: ${tokens.muted};
  }

  &::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }
`;

const CategoryList = styled.div`
  max-height: 260px;
  overflow-y: auto;
  padding: 0.35rem;
`;

const CategoryOption = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border: 0;
  background: ${p => (p.$active ? tokens.accentSoft : 'transparent')};
  color: ${p => (p.$active ? tokens.accentDeep : tokens.ink)};
  border-radius: 10px;
  padding: 0.55rem 0.65rem;
  font-size: 0.86rem;
  font-weight: ${p => (p.$active ? 600 : 500)};
  font-family: ${tokens.fontSans};
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${p => (p.$active ? tokens.accentSoft : tokens.paper)};
  }

  svg {
    flex-shrink: 0;
    color: ${tokens.accent};
  }
`;

const CategoryCount = styled.span`
  margin-left: 0.35rem;
  color: ${tokens.muted};
  font-weight: 500;
  font-size: 0.78rem;
`;

const CategoryEmpty = styled.div`
  padding: 0.85rem 0.65rem;
  font-size: 0.84rem;
  color: ${tokens.muted};
  text-align: center;
`;

const SearchCtaInput = styled.input`
  flex: 1;
  border: 0;
  outline: none;
  padding: 0.75rem 0.9rem;
  background: transparent;
  min-width: 0;
  font-size: 0.95rem;
  color: ${tokens.ink};
  font-family: ${tokens.fontSans};

  &::placeholder {
    color: ${tokens.muted};
  }

  /* Hide native search clear on some browsers so layout stays clean */
  &::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }
`;

const SearchCtaButton = styled.button`
  border: 0;
  background: ${tokens.action};
  color: #fff;
  padding: 0.75rem 1.15rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.92rem;
  cursor: pointer;
  font-family: ${tokens.fontSans};
  flex-shrink: 0;
  transition: background 0.2s, transform 0.1s;

  &:hover {
    background: ${tokens.actionHover};
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 480px) {
    width: 100%;
    min-height: 44px;
  }
`;

// Autocomplete dropdown styles
const AutocompleteDropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  z-index: 100;
  max-height: 320px;
  overflow-y: auto;
  display: ${props => props.$open ? 'block' : 'none'};
`;

const AutocompleteItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid ${tokens.border};

  &:last-child {
    border-bottom: none;
  }

  &:hover, &.active {
    background: ${tokens.wash};
  }
`;

const AutocompleteLogo = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${props => props.$hasImage ? '#fff' : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid ${tokens.border};

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 4px;
  }
`;

const AutocompleteInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AutocompleteName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${tokens.ink};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AutocompleteCategory = styled.div`
  font-size: 12px;
  color: ${tokens.muted};
  text-transform: capitalize;
`;

const AutocompleteNoMatch = styled.div`
  padding: 14px 16px;
  text-align: center;
  color: ${tokens.muted};
  font-size: 13px;
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

// Compact quota tracker - matches ForYou design
const QuotaBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${tokens.white};
  border: 1px solid #ebebeb;
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  margin-bottom: 1rem;
  max-width: 480px;

  @media (max-width: 640px) {
    gap: 10px;
    padding: 0.7rem 0.8rem;
    max-width: none;
  }
`;

// Segmented progress bar - 5 dots
const QuotaDots = styled.div`
  display: flex;
  gap: 3px;
`;

const QuotaDot = styled.div`
  width: 24px;
  height: 6px;
  border-radius: 3px;
  background: ${props => props.$filled ? '#10B981' : '#E5E7EB'};
  transition: all 0.3s ease;

  @media (max-width: 640px) {
    width: 20px;
    height: 5px;
  }
`;

const QuotaText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuotaTitle = styled.div`
  font-weight: 600;
  font-size: 13px;
  color: #374151;
`;

const QuotaSub = styled.div`
  font-size: 12px;
  color: #9CA3AF;
`;

const QuotaUpgrade = styled.button`
  background: #111827;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: #1F2937;
  }
`;

const BrandGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.7rem;
  }
`;

const BrandCard = styled(Link)`
  background: ${tokens.white};
  border: 1px solid #ebebeb;
  border-radius: 14px;
  padding: 1rem 1.05rem;
  position: relative;
  transition: border-color 0.2s, transform 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  text-decoration: none;
  color: inherit;
  box-shadow: none;

  &:hover {
    border-color: #b8d5cb;
    transform: translateY(-2px);
  }

  @media (max-width: 640px) {
    padding: 0.95rem 1rem;
  }
`;

const CardTopMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: center;
`;

const MetaPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.22rem 0.5rem;
  border-radius: 6px;
  background: ${p => (p.$tone === 'hot' ? '#fdeee9' : tokens.accentSoft)};
  color: ${p => (p.$tone === 'hot' ? '#b33a1f' : tokens.accentDeep)};
`;

const UnlockedInline = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  color: ${tokens.accent};
`;

const CardNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
`;

const CardAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: contain;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  flex-shrink: 0;
`;

const CardAvatarFallback = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(145deg, #1a1a1a, #3d3d3d);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
`;

const CardNiche = styled.div`
  font-size: 0.8rem;
  color: ${tokens.muted};
  margin-top: 1px;
`;

const CardActions = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin-top: auto;
`;

const PitchButton = styled.button`
  background: ${props => (props.$pitched ? tokens.accentSoft : tokens.action)};
  color: ${props => (props.$pitched ? tokens.accentDeep : 'white')};
  border: ${props => (props.$pitched ? `1px solid ${tokens.accentBorder}` : 'none')};
  border-radius: 10px;
  padding: 0.7rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: ${props => (props.$pitched || props.disabled ? 'default' : 'pointer')};
  transition: background 0.2s, transform 0.12s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 42px;
  font-family: ${tokens.fontSans};
  width: 100%;

  &:hover:not(:disabled) {
    background: ${props => (props.$pitched ? tokens.accentSoft : tokens.actionHover)};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

const SaveActionButton = styled.button`
  width: 42px;
  height: 42px;
  background: ${props => (props.$saved ? tokens.accentSoft : tokens.white)};
  color: ${props => (props.$saved ? tokens.accentDeep : tokens.textSecondary)};
  border: 1px solid ${props => (props.$saved ? tokens.accentBorder : '#ebebeb')};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    border-color: ${tokens.accentBorder};
    color: ${tokens.accentDeep};
    background: ${tokens.accentSoft};
  }
`;

const BrandName = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: ${tokens.textPrimary};
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
  text-align: left;

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`;

const BrandDescription = styled.p`
  font-size: 0.86rem;
  color: ${tokens.muted};
  line-height: 1.5;
  margin: 0;
  text-align: left;
`;

const Pill = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.22rem 0.5rem;
  border-radius: 6px;
  background: ${p => (
    p.$tone === 'ok' ? tokens.accentSoft :
    p.$tone === 'email' ? '#fef3c7' :
    p.$tone === 'form' ? '#eff6ff' :
    p.$tone === 'aff' ? '#fce7f3' :
    '#f4f4f4'
  )};
  color: ${p => (
    p.$tone === 'ok' ? tokens.accentDeep :
    p.$tone === 'email' ? '#92400e' :
    p.$tone === 'form' ? '#1d4ed8' :
    p.$tone === 'aff' ? '#9d174d' :
    '#444'
  )};
`;

const CardTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
`;

const PreviewStats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${tokens.ink};
`;

const PreviewStat = styled.div`
  em {
    display: block;
    font-style: normal;
    font-weight: 500;
    font-size: 0.68rem;
    color: ${tokens.muted};
  }
`;

const ContactFilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.15rem;

  @media (max-width: 480px) {
    gap: 0.35rem;
    margin-bottom: 1rem;
  }
`;

const ContactPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid ${(p) => (p.$active ? tokens.action : '#ebebeb')};
  background: ${(p) => (p.$active ? tokens.action : tokens.white)};
  color: ${(p) => (p.$active ? '#fff' : '#555')};
  font-family: ${tokens.fontSans};
  -webkit-tap-highlight-color: transparent;

  &:hover {
    border-color: ${(p) => (p.$active ? tokens.action : tokens.accent)};
    color: ${(p) => (p.$active ? '#fff' : tokens.accentDeep)};
  }

  @media (max-width: 480px) {
    padding: 0.38rem 0.72rem;
    font-size: 0.78rem;
    min-height: 36px;
  }
`;

const ResponsesLine = styled.div`
  font-size: 0.75rem;
  color: ${tokens.muted};
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.35;
`;

const PulsingDot = styled.span`
  width: 7px;
  height: 7px;
  background: ${tokens.accent};
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
`;

const ResponsesCount = styled.span`
  color: ${tokens.accentDeep};
  font-weight: 700;
`;

const SignupCTA = styled.div`
  margin-top: 0.15rem;
  padding: 0.7rem 1rem;
  background: transparent;
  color: ${tokens.textPrimary};
  border: 1px solid #ebebeb;
  border-radius: 10px;
  font-size: 0.86rem;
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

// Infinite Scroll Components
const LoadMoreTrigger = styled.div`
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
`;

const LoadingSpinnerSmall = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const EndOfResults = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #9CA3AF;
  font-size: 14px;
  margin-top: 24px;

  @media (max-width: 768px) {
    padding: 32px 16px;
    font-size: 13px;
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
