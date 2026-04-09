'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input, Select, Spin, Pagination } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import LandingPageLayoutNext from '../components/LandingPageLayoutNext';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://api.newcollab.co');

const Page = styled.div`
  background: #fafafa;
  min-height: 100vh;
`;

const Hero = styled.div`
  padding: 120px 24px 44px;
  background: linear-gradient(135deg, #3b82f6 0%, #ec4899 100%);
  color: white;
  text-align: center;

  h1 {
    margin: 0 0 12px 0;
    font-size: 40px;
    line-height: 1.15;
    font-weight: 800;
  }

  p {
    margin: 0 auto;
    max-width: 860px;
    opacity: 0.95;
    font-size: 18px;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    padding: 104px 18px 38px;
    h1 { font-size: 30px; }
    p { font-size: 16px; }
  }
`;

const QuickLinks = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 18px;
`;

const QuickLink = styled(Link)`
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: white;
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
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
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  padding: 18px;
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr auto;
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
  margin-top: 22px;
`;

const CardLink = styled(Link)`
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  padding: 18px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  display: block;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
  }
`;

const Logo = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Name = styled.div`
  font-weight: 800;
  font-size: 16px;
  margin-bottom: 6px;
  color: #111827;
`;

const Desc = styled.div`
  font-size: 13px;
  line-height: 1.55;
  color: #6b7280;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 60px;
`;

const MetaRow = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Meta = styled.span`
  font-size: 11px;
  background: #f3f4f6;
  color: #374151;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 600;
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
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6 0%, #ec4899 100%);
  }

  @media (max-width: 768px) {
    padding: 18px 16px;
    margin: 20px 0 24px;
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
    font-size: 20px;
    font-weight: 800;
    color: #111827;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .badge {
    background: linear-gradient(135deg, #3b82f6 0%, #ec4899 100%);
    color: white;
    font-size: 10px;
    padding: 4px 10px;
    border-radius: 999px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
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
  color: #6b7280;
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
  background: white;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  min-width: 0;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
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
  background: #f3f4f6;
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
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .category {
    font-size: 12px;
    color: #6b7280;
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
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
    transform: scale(1.02);
    color: white;
  }

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 12px;
  }
`;

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
      setCategory(urlCategory.trim());
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
      params.set('category', category.trim());
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
          <h1>{collectionTitle || 'Direct PR Application Forms — Brand Directory'}</h1>
          <p>
            {collectionDescription ||
              'Browse brands with PR application forms, requirements, and influencer-friendly programs. Filter by category and search by brand name.'}
          </p>
          <QuickLinks>
            <QuickLink href="/directory/skincare">Skincare</QuickLink>
            <QuickLink href="/directory/k-beauty">K-Beauty</QuickLink>
            <QuickLink href="/directory/australia">Australia</QuickLink>
          </QuickLinks>
        </Hero>

        <Container>
          <Filters>
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
                { value: 'new', label: '🆕 Added This Week' },
                { value: 'active', label: '⚡ Actively Reviewing' },
                { value: 'responsive', label: '✨ High Response Rate' },
              ]}
            />
            <Select
              size="large"
              value={contactType || undefined}
              placeholder="All brands"
              allowClear
              onChange={(val) => {
                const next = val || '';
                setPage(1);
                setContactType(next);
                updateUrl({ contactType: next, page: 1 });
              }}
              options={[
                { value: 'application', label: '🔗 Has Application Form' },
                { value: 'email', label: '✉️ Has PR Email' },
              ]}
              suffixIcon={<FilterOutlined />}
            />
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
                            <span style={{ fontWeight: 900, color: '#16a34a' }}>
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
                        Sign up to pitch
                      </ApplyButton>
                    </OpenPRCard>
                  );
                })}
              </OpenPRGrid>
            </OpenPRSection>
          )}

          {loading ? (
            <Center>
              <Spin size="large" />
            </Center>
          ) : (
            <>
              <Grid>
                {brands.map((brand) => (
                  <CardLink key={brand.slug || brand.id} href={`/brand/${brand.slug}`}>
                    <Logo>
                      {brand.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={brand.logo} alt={brand.name || 'Brand'} />
                      ) : (
                        <span style={{ fontWeight: 900, color: '#3b82f6' }}>
                          {(brand.name || 'B').slice(0, 1)}
                        </span>
                      )}
                    </Logo>
                    <Name>{brand.name}</Name>
                    <Desc>{brand.description || 'PR applications and influencer partnerships.'}</Desc>
                    <MetaRow>
                      {brand.category ? <Meta>{brand.category}</Meta> : null}
                      {brand.minFollowers ? (
                        <Meta>{Math.round(brand.minFollowers / 1000)}K+ followers</Meta>
                      ) : null}
                      {typeof brand.responseRate === 'number' ? (
                        <Meta>{brand.responseRate}% response</Meta>
                      ) : null}
                    </MetaRow>
                  </CardLink>
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

