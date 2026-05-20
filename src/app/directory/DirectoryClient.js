'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input, Select, Pagination } from 'antd';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SearchOutlined, LinkOutlined, MailOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import LandingPageLayoutNext from '../components/LandingPageLayoutNext';
import { getCategoryColors } from '../../utils/categoryColors';
import { normalizeCategory, categoryLabel } from '../../constants/brandCategories';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://api.newcollab.co');

const Page = styled.div`
  background: #FAFAFA;
  min-height: 100vh;
`;

const Hero = styled.div`
  padding: 140px 24px 48px;
  background: white;
  border-bottom: 1px solid #E5E5E5;
  text-align: center;

  h1 {
    margin: 0 0 14px 0;
    font-size: 38px;
    line-height: 1.15;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #0F0F0F;
  }

  p {
    margin: 0 auto;
    max-width: 720px;
    color: #6B6B6B;
    font-size: 16px;
    line-height: 1.6;
    font-weight: 400;
  }

  @media (max-width: 768px) {
    padding: 110px 20px 40px;
    h1 { font-size: 28px; }
    p { font-size: 15px; }
  }
`;

const QuickLinks = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 24px;
`;

const QuickLink = styled(Link)`
  background: #F5F5F5;
  border: 1px solid #E5E5E5;
  color: #0F0F0F;
  text-decoration: none;
  padding: 10px 18px;
  border-radius: 100px;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;

  &:hover {
    background: #0F0F0F;
    border-color: #0F0F0F;
    color: white;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: -22px auto 0;
  padding: 0 24px 60px;

  @media (max-width: 768px) {
    padding: 0 16px 40px;
  }

  @media (max-width: 380px) {
    padding: 0 12px 32px;
  }
`;

const Filters = styled.div`
  background: white;
  border-radius: 14px;
  border: 1px solid #E5E5E5;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  .ant-input-affix-wrapper, .ant-select-selector {
    border-radius: 10px !important;
    border-color: #E5E5E5 !important;
  }
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ContactFilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid #EBEBEB;
`;

const ContactFilterLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #525252;
  margin-right: 4px;
  white-space: nowrap;
`;

const ContactPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid ${(p) => (p.$active ? '#0F0F0F' : '#E5E5E5')};
  background: ${(p) => (p.$active ? '#0F0F0F' : '#FFFFFF')};
  color: ${(p) => (p.$active ? '#FFFFFF' : '#525252')};

  &:hover {
    border-color: #0F0F0F;
    color: ${(p) => (p.$active ? '#FFFFFF' : '#0F0F0F')};
  }

  .anticon {
    font-size: 14px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

const Card = styled(Link)`
  background: #FFFFFF;
  border: 1px solid #EBEBEB;
  border-radius: 20px;
  padding: 20px;
  position: relative;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;

  &:hover {
    border-color: #D4D4D4;
    box-shadow: 0 8px 28px rgba(15,15,15,0.08);
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
  border-radius: 100px;
  border: 1px solid #FDE68A;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LogoWrap = styled.div`
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

  img {
    max-width: 65%;
    max-height: 60%;
    width: auto;
    height: auto;
    object-fit: contain;
    mix-blend-mode: multiply;
  }
`;

const LogoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0F0F0F;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -1px;
`;

const BrandInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Name = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #0F0F0F;
  margin: 0 0 5px;
  letter-spacing: -0.2px;
  text-align: center;
`;

const Desc = styled.p`
  font-size: 12.5px;
  color: #8C8C8C;
  line-height: 1.55;
  margin: 0 0 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center;
`;

const TagRow = styled.div`
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
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
`;

const TagFollowers = styled.span`
  background: #F5F3FF;
  color: #7C3AED;
  border: 1px solid #DDD6FE;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
`;

const Divider = styled.div`
  height: 1px;
  background: #EBEBEB;
  margin: 0 -20px 14px;
`;

const StatsRow = styled.div`
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
  color: #0F0F0F;

  &.green { color: #059669; }
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: #8C8C8C;
  font-weight: 500;
  letter-spacing: 0.2px;
  white-space: nowrap;
`;

const StatDivider = styled.div`
  width: 1px;
  height: 28px;
  background: #EBEBEB;
`;

const SocialProof = styled.div`
  text-align: center;
  font-size: 11.5px;
  color: #8C8C8C;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  svg {
    width: 12px;
    height: 12px;
    color: #059669;
    flex-shrink: 0;
  }
`;

const CardCTA = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #0F0F0F;
  color: white;
  padding: 11px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  margin-top: auto;

  &:hover {
    background: #262626;
    color: white;
  }

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

const Center = styled.div`
  display: flex;
  justify-content: center;
  padding: 34px 0;
`;

// Open PR Applications Featured Section
const OpenPRSection = styled.section`
  margin: 28px 0 32px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  border: 1px solid #E5E5E5;
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
    margin: 20px 0 24px;
  }

  @media (max-width: 380px) {
    padding: 16px 12px;
    border-radius: 14px;
  }
`;

const OpenPRHeader = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #0F0F0F;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .badge {
    background: #E11D48;
    color: white;
    font-size: 10px;
    padding: 4px 10px;
    border-radius: 100px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  @media (max-width: 768px) {
    h2 { font-size: 16px; }
    gap: 8px;
  }

  @media (max-width: 380px) {
    h2 { font-size: 15px; }
  }
`;

const OpenPRSubtitle = styled.p`
  margin: 0 0 18px;
  color: #6B6B6B;
  font-size: 14px;
  line-height: 1.5;

  @media (max-width: 480px) {
    font-size: 13px;
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
  background: #FAFAFA;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid #E5E5E5;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;
  min-width: 0;

  &:hover {
    border-color: #D4D4D4;
    background: white;
  }

  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 10px;
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
  background: white;
  border: 1px solid #E5E5E5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 70%;
    height: 70%;
    object-fit: contain;
    mix-blend-mode: multiply;
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
    font-weight: 600;
    font-size: 14px;
    color: #0F0F0F;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .category {
    font-size: 12px;
    color: #6B6B6B;
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
  background: #0F0F0F;
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #262626;
    color: white;
  }

  svg {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    padding: 9px 12px;
    font-size: 11px;
  }
`;

const formatCategoryLabel = (category) => categoryLabel(category);

const CONTACT_FILTER_OPTIONS = [
  { value: '', label: 'All brands', icon: null },
  { value: 'application', label: 'PR application form', icon: LinkOutlined },
  { value: 'email', label: 'PR email contact', icon: MailOutlined },
];

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

export default function DirectoryClient({
  collectionTitle,
  collectionDescription,
  initialCategory,
  initialSearch,
  initialCountry,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const didInitFromUrl = useRef(false);

  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openPrBrands, setOpenPrBrands] = useState([]);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState(initialSearch || '');
  // Keep category case-sensitive to match API values
  const [category, setCategory] = useState(initialCategory ? initialCategory.trim() : '');
  const [activity, setActivity] = useState(''); // 'new', 'active', 'responsive'
  const [contactType, setContactType] = useState(''); // 'application', 'email', or '' for all

  const limit = 24;

  // Initialize filters from URL (but let explicit props win)
  useEffect(() => {
    if (didInitFromUrl.current) return;
    didInitFromUrl.current = true;

    const urlSearch = searchParams?.get('search') || '';
    const urlCategory = searchParams?.get('category') || '';
    const urlActivity = searchParams?.get('activity') || '';
    const urlContactType = searchParams?.get('contactType') || '';
    const urlPage = Number(searchParams?.get('page') || '1');

    if (!initialSearch && urlSearch) setSearch(urlSearch);
    if (!initialCategory && urlCategory) {
      setCategory(normalizeCategory(urlCategory) || urlCategory.trim());
    }
    if (urlActivity) setActivity(urlActivity);
    if (urlContactType) setContactType(urlContactType);
    if (Number.isFinite(urlPage) && urlPage > 1) setPage(urlPage);
  }, [searchParams, initialSearch, initialCategory]);

  const updateUrl = (next) => {
    const params = new URLSearchParams(searchParams?.toString() || '');

    Object.entries(next).forEach(([k, v]) => {
      if (v === '' || v === false || v == null) params.delete(k);
      else params.set(k, String(v));
    });

    // Keep URLs clean
    if (params.get('page') === '1') params.delete('page');

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    // For region-based filtering (client-side), fetch more brands
    if (initialCountry) {
      params.set('page', '1');
      params.set('limit', '500');
    } else {
      params.set('page', String(page));
      params.set('limit', String(limit));
    }
    if (search) params.set('search', search);
    if (category) {
      const canon = normalizeCategory(category) || category.trim();
      params.set('category', canon);
    }
    if (activity) params.set('activity', activity);
    if (contactType) params.set('contact_type', contactType);
    return params.toString();
  }, [page, search, category, activity, contactType, initialCountry]);

  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      try {
        const res = await fetch(`${API_BASE}/api/public/categories`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCategories(Array.isArray(data.categories) ? data.categories : []);
      } catch (_) {
        // ignore
      }
    }
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load Open PR Featured brands
  useEffect(() => {
    let cancelled = false;
    async function loadOpenPrBrands() {
      try {
        const res = await fetch(`${API_BASE}/api/admin/brands/open-pr-featured`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setOpenPrBrands(Array.isArray(data.brands) ? data.brands : []);
      } catch (_) {
        // ignore - section will not show if no brands
      }
    }
    loadOpenPrBrands();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadBrands() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/public/brands?${queryParams}`);
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const data = await res.json();
        if (cancelled) return;
        let brandsList = Array.isArray(data.brands) ? data.brands : [];

        // Client-side region filtering (API doesn't support this natively)
        if (initialCountry) {
          brandsList = brandsList.filter(brand =>
            Array.isArray(brand.regions) &&
            brand.regions.some(r => r.toLowerCase() === initialCountry.toLowerCase())
          );
        }

        setBrands(brandsList);
        setTotal(initialCountry ? brandsList.length : (data?.pagination?.total || 0));

        // Log for debugging if no brands found with filters
        if (brandsList.length === 0 && (category || initialCountry || search)) {
          console.log('No brands found with filters:', { category, initialCountry, search, queryParams });
        }
      } catch (e) {
        console.error('Error loading brands:', e);
        if (!cancelled) {
          setBrands([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadBrands();
    return () => {
      cancelled = true;
    };
  }, [queryParams, category, initialCountry, search]);

  return (
    <LandingPageLayoutNext canonicalUrl="https://newcollab.co/directory">
      <Page>
        <Hero>
          <h1>{collectionTitle || '500+ PR Forms for Brands: Direct Application Links'}</h1>
          <p>
            {collectionDescription ||
              'Browse verified PR forms for brands—500+ direct application links, PR requirements, and options for small creators in beauty, skincare, K-beauty, tech, and fashion.'}
          </p>
          <QuickLinks>
            <QuickLink href="/directory/skincare">Skincare</QuickLink>
            <QuickLink href="/directory/k-beauty">K-Beauty</QuickLink>
            <QuickLink href="/directory/australia">Australia</QuickLink>
          </QuickLinks>
        </Hero>

        <Container>
          <Filters>
            <FilterRow>
              <Input
                size="large"
                allowClear
                placeholder="Search brands…"
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => {
                  const next = e.target.value || '';
                  setPage(1);
                  setSearch(next);
                  updateUrl({ search: next, page: 1 });
                }}
              />
              <Select
                size="large"
                allowClear
                placeholder="All categories"
                value={category || undefined}
                onChange={(val) => {
                  const next = val ? val.trim() : '';
                  setPage(1);
                  setCategory(next);
                  updateUrl({ category: next, page: 1 });
                }}
                options={(categories || []).map((c) => ({
                  value: c.value,
                  label: `${c.label}${typeof c.count === 'number' ? ` (${c.count})` : ''}`,
                }))}
              />
              <Select
                size="large"
                allowClear
                placeholder="All brands"
                value={activity || undefined}
                onChange={(val) => {
                  const next = val || '';
                  setPage(1);
                  setActivity(next);
                  updateUrl({ activity: next, page: 1 });
                }}
                options={[
                  { value: 'new', label: 'Added this week' },
                  { value: 'active', label: 'Actively reviewing' },
                  { value: 'responsive', label: 'High response rate' },
                ]}
              />
            </FilterRow>
            <ContactFilterBar>
              <ContactFilterLabel>How to apply:</ContactFilterLabel>
              {CONTACT_FILTER_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = contactType === opt.value;
                return (
                  <ContactPill
                    key={opt.value || 'all'}
                    type="button"
                    $active={active}
                    onClick={() => {
                      setPage(1);
                      setContactType(opt.value);
                      updateUrl({ contactType: opt.value, page: 1 });
                    }}
                  >
                    {Icon ? <Icon /> : null}
                    {opt.label}
                  </ContactPill>
                );
              })}
            </ContactFilterBar>
          </Filters>

          {/* Open PR Applications - Featured Section */}
          {!search && !category && !initialCountry && openPrBrands.length > 0 && (
            <OpenPRSection>
              <OpenPRHeader>
                <h2>
                  <span>🎯</span> Open PR Applications
                </h2>
                <span className="badge">Apply Now</span>
              </OpenPRHeader>
              <OpenPRSubtitle>
                These brands are actively accepting PR applications. Sign up free to access application forms!
              </OpenPRSubtitle>
              <OpenPRGrid>
                {openPrBrands.map((brand) => {
                  const logoUrl = brand.logo || getFaviconUrl(brand.website);
                  return (
                    <OpenPRCard key={brand.slug || brand.id}>
                      <OpenPRCardHeader>
                        <OpenPRLogo>
                          {logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
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
                      <ApplyButton href="https://app.newcollab.co/register/creator">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Sign up to contact brand
                      </ApplyButton>
                    </OpenPRCard>
                  );
                })}
              </OpenPRGrid>
            </OpenPRSection>
          )}

          {loading ? (
            <LoadingSpinner text="Loading brands..." minHeight="400px" />
          ) : (
            <>
              <Grid>
                {brands.map((brand) => (
                  <Card key={brand.slug || brand.id} href={`/brand/${brand.slug}`}>
                    {brand.isFeatured && (
                      <FeaturedBadge>
                        ✦ Featured
                      </FeaturedBadge>
                    )}
                    <LogoWrap>
                      {brand.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={brand.logo} alt={brand.name || 'Brand'} />
                      ) : (
                        <LogoPlaceholder>{(brand.name || 'B').slice(0, 1)}</LogoPlaceholder>
                      )}
                    </LogoWrap>
                    <BrandInfo>
                      <Name>{brand.name}</Name>
                      {brand.description && (
                        <Desc>{brand.description}</Desc>
                      )}
                      <TagRow>
                        {brand.category && (() => {
                          const catStyle = getCategoryColors(brand.category);
                          return (
                            <CategoryTag $bg={catStyle.bg} $color={catStyle.text} $border={catStyle.border}>
                              {formatCategoryLabel(brand.category)}
                            </CategoryTag>
                          );
                        })()}
                        {brand.minFollowers > 0 && (
                          <TagFollowers>{Math.round(brand.minFollowers / 1000)}K+ followers</TagFollowers>
                        )}
                      </TagRow>
                      {(typeof brand.responseRate === 'number' || (brand.pitchStats?.totalPitches > 0)) && (
                        <>
                          <Divider />
                          <StatsRow>
                            {typeof brand.responseRate === 'number' && (
                              <>
                                <StatItem>
                                  <StatValue className="green">{brand.responseRate}%</StatValue>
                                  <StatLabel>Response rate</StatLabel>
                                </StatItem>
                                {brand.pitchStats?.totalPitches > 0 && <StatDivider />}
                              </>
                            )}
                            {brand.pitchStats?.totalPitches > 0 && (
                              <StatItem>
                                <StatValue>{brand.pitchStats.totalPitches}</StatValue>
                                <StatLabel>Creators pitched</StatLabel>
                              </StatItem>
                            )}
                          </StatsRow>
                          {brand.pitchStats?.totalResponses > 0 && (
                            <SocialProof>
                              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <strong>{brand.pitchStats.totalResponses}</strong> creator{brand.pitchStats.totalResponses !== 1 ? 's' : ''} got a response
                            </SocialProof>
                          )}
                        </>
                      )}
                    </BrandInfo>
                    <CardCTA
                      href="https://app.newcollab.co/register/creator"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Sign up to contact brand
                    </CardCTA>
                  </Card>
                ))}
              </Grid>

              {total > limit && (
                <Center>
                  <Pagination
                    current={page}
                    total={total}
                    pageSize={limit}
                    showSizeChanger={false}
                    onChange={(p) => {
                      setPage(p);
                      updateUrl({ page: p });
                      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </Center>
              )}
            </>
          )}
        </Container>
      </Page>
    </LandingPageLayoutNext>
  );
}

