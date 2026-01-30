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
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%);
  border-radius: 20px;
  border: 2px solid #f59e0b;
  position: relative;
  overflow: hidden;

  &::before {
    content: '🔥';
    position: absolute;
    top: -10px;
    right: 20px;
    font-size: 48px;
    opacity: 0.3;
  }

  @media (max-width: 768px) {
    padding: 18px;
    margin: 20px 0 24px;
  }
`;

const OpenPRHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: #92400e;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .badge {
    background: #dc2626;
    color: white;
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 999px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  @media (max-width: 768px) {
    h2 { font-size: 18px; }
  }
`;

const OpenPRSubtitle = styled.p`
  margin: 0 0 18px;
  color: #a16207;
  font-size: 14px;
  line-height: 1.5;
`;

const OpenPRGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
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

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
`;

const OpenPRCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
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
`;

const ApplyButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  color: white;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.15s ease;

  &:hover {
    background: linear-gradient(135deg, #15803d 0%, #166534 100%);
    transform: scale(1.02);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

// Curated list of brands with OPEN PR application forms
// Update this list to feature brands actively accepting applications
const OPEN_PR_BRANDS = [
  {
    name: 'Glow Recipe',
    slug: 'glow-recipe',
    category: 'Skincare',
    logo: 'https://icons.duckduckgo.com/ip3/glowrecipe.com.ico',
    formUrl: 'https://www.glowrecipe.com/pages/become-a-glow-gang-affiliate',
  },
  {
    name: 'ColourPop',
    slug: 'colourpop-cosmetics',
    category: 'Beauty',
    logo: 'https://icons.duckduckgo.com/ip3/colourpop.com.ico',
    formUrl: 'https://colourpop.com/pages/collab',
  },
  {
    name: 'Tower 28',
    slug: 'tower-28',
    category: 'Beauty',
    logo: 'https://icons.duckduckgo.com/ip3/tower28beauty.com.ico',
    formUrl: 'https://tower28beauty.com/pages/tower-28-affiliate-program',
  },
  {
    name: 'Summer Fridays',
    slug: 'summer-fridays',
    category: 'Skincare',
    logo: 'https://icons.duckduckgo.com/ip3/summerfridays.com.ico',
    formUrl: 'https://summerfridays.com/pages/affiliate-program',
  },
  {
    name: 'The Ordinary',
    slug: 'the-ordinary',
    category: 'Skincare',
    logo: 'https://icons.duckduckgo.com/ip3/theordinary.com.ico',
    formUrl: 'https://theordinary.com/en/affiliates.html',
  },
  {
    name: 'Rare Beauty',
    slug: 'rare-beauty-by-selena-gomez',
    category: 'Beauty',
    logo: 'https://icons.duckduckgo.com/ip3/rarebeauty.com.ico',
    formUrl: 'https://www.rarebeauty.com/pages/affiliate',
  },
];

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

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState(initialSearch || '');
  // Keep category case-sensitive to match API values
  const [category, setCategory] = useState(initialCategory ? initialCategory.trim() : '');
  const [minFollowers, setMinFollowers] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const limit = 24;

  // Initialize filters from URL (but let explicit props win)
  useEffect(() => {
    if (didInitFromUrl.current) return;
    didInitFromUrl.current = true;

    const urlSearch = searchParams?.get('search') || '';
    const urlCategory = searchParams?.get('category') || '';
    const urlMinFollowers = searchParams?.get('minFollowers') || '';
    const urlFeatured = searchParams?.get('featured') === 'true';
    const urlPage = Number(searchParams?.get('page') || '1');

    if (!initialSearch && urlSearch) setSearch(urlSearch);
    if (!initialCategory && urlCategory) {
      setCategory(urlCategory.trim());
    }
    if (urlMinFollowers) setMinFollowers(urlMinFollowers);
    if (urlFeatured) setFeaturedOnly(true);
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

  const followerOptions = [
    { label: 'Any size', value: '' },
    { label: '1K+ followers', value: '1000' },
    { label: '5K+ followers', value: '5000' },
    { label: '10K+ followers', value: '10000' },
    { label: '50K+ followers', value: '50000' },
    { label: '100K+ followers', value: '100000' },
  ];

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
    if (minFollowers) params.set('min_followers', minFollowers);
    if (featuredOnly) params.set('featured_only', 'true');
    return params.toString();
  }, [page, search, category, minFollowers, featuredOnly, initialCountry]);

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
              placeholder="Any size"
              value={minFollowers || undefined}
              onChange={(val) => {
                const next = val || '';
                setPage(1);
                setMinFollowers(next);
                updateUrl({ minFollowers: next, page: 1 });
              }}
              options={followerOptions.map((o) => ({ value: o.value, label: o.label }))}
            />
            <Select
              size="large"
              value={featuredOnly ? 'true' : 'false'}
              onChange={(val) => {
                const next = val === 'true';
                setPage(1);
                setFeaturedOnly(next);
                updateUrl({ featured: next ? 'true' : '', page: 1 });
              }}
              options={[
                { value: 'false', label: 'All brands' },
                { value: 'true', label: 'Featured only' },
              ]}
              suffixIcon={<FilterOutlined />}
            />
          </Filters>

          {/* Open PR Applications - Featured Section */}
          {!search && !category && !initialCountry && (
            <OpenPRSection>
              <OpenPRHeader>
                <h2>
                  <span>🎯</span> Open PR Applications
                </h2>
                <span className="badge">Apply Now</span>
              </OpenPRHeader>
              <OpenPRSubtitle>
                These brands are actively accepting PR applications. Apply directly through their forms — no account needed!
              </OpenPRSubtitle>
              <OpenPRGrid>
                {OPEN_PR_BRANDS.map((brand) => (
                  <OpenPRCard key={brand.slug}>
                    <OpenPRCardHeader>
                      <OpenPRLogo>
                        {brand.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={brand.logo} alt={brand.name} />
                        ) : (
                          <span style={{ fontWeight: 900, color: '#16a34a' }}>
                            {brand.name.slice(0, 1)}
                          </span>
                        )}
                      </OpenPRLogo>
                      <OpenPRInfo>
                        <div className="name">{brand.name}</div>
                        <div className="category">{brand.category}</div>
                      </OpenPRInfo>
                    </OpenPRCardHeader>
                    <ApplyButton
                      href={brand.formUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Apply Now
                    </ApplyButton>
                  </OpenPRCard>
                ))}
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

