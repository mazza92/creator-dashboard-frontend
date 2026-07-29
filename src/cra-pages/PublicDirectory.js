import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { Input, Select, Spin, Pagination, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

// Normalize API base URL - remove trailing slash to prevent double slashes
const getApiBase = () => {
  const base = process.env.REACT_APP_API_BASE || 
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');
  return base.replace(/\/+$/, ''); // Remove trailing slashes
};
const API_BASE = getApiBase();

const PublicDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 24 });

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minFollowers: searchParams.get('minFollowers') || '',
    featuredOnly: searchParams.get('featured') === 'true'
  });

  
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [pagination.page, filters]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/public/categories`);
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
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
        ...(filters.minFollowers && { min_followers: filters.minFollowers }),
        ...(filters.featuredOnly && { featured_only: true })
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

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
    updateURLParams({ search: value });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
    updateURLParams({ [key]: value });
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

  const followerOptions = [
    { label: 'Any Size', value: '' },
    { label: '1K+ followers', value: '1000' },
    { label: '5K+ followers', value: '5000' },
    { label: '10K+ followers', value: '10000' },
    { label: '50K+ followers', value: '50000' },
    { label: '100K+ followers', value: '100000' }
  ];

  return (
    <>
      <Helmet>
        <title>PR Brand Directory | 2,000+ Brands Accepting Influencer Applications</title>
        <meta name="description" content="Find and apply to 2,000+ brands seeking influencers for PR packages. Search beauty, fashion, tech, and lifestyle brands accepting creator applications." />
        <meta property="og:title" content="PR Brand Directory - Find Brands Accepting Influencer Applications" />
        <meta property="og:description" content="Browse 2,000+ brands with open PR programs. Get application links, response rates, and follower requirements." />
        <link rel="canonical" href="https://newcollab.co/directory" />
      </Helmet>

      <Container>
        <Hero>
          <HeroContent>
            <h1>Find Brands That Want to Work With You</h1>
            <p>Browse 2,000+ brands actively seeking influencers for PR packages and paid collaborations</p>
          </HeroContent>
        </Hero>

        <FiltersSection>
          <SearchBar>
            <Input
              size="large"
              placeholder="Search brand names..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </SearchBar>

          <FilterRow>
            <FilterItem>
              <label>Category</label>
              <Select
                size="large"
                style={{ width: '100%' }}
                placeholder="All Categories"
                value={filters.category || undefined}
                onChange={(value) => handleFilterChange('category', value)}
                allowClear
              >
                {categories.map(cat => (
                  <Select.Option key={cat.value} value={cat.value}>
                    {cat.label} ({cat.count})
                  </Select.Option>
                ))}
              </Select>
            </FilterItem>

            <FilterItem>
              <label>Minimum Followers</label>
              <Select
                size="large"
                style={{ width: '100%' }}
                placeholder="Any size"
                value={filters.minFollowers || undefined}
                onChange={(value) => handleFilterChange('minFollowers', value)}
                allowClear
              >
                {followerOptions.map(opt => (
                  <Select.Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Option>
                ))}
              </Select>
            </FilterItem>

            <FilterItem>
              <Button
                size="large"
                type={filters.featuredOnly ? 'primary' : 'default'}
                icon={<FilterOutlined />}
                onClick={() => handleFilterChange('featuredOnly', !filters.featuredOnly)}
              >
                Featured Only
              </Button>
            </FilterItem>
          </FilterRow>
        </FiltersSection>

        {loading ? (
          <LoadingSpinner text="Loading brands..." minHeight="400px" />
        ) : (
          <>
            <ResultsHeader>
              <h2>
                {filters.featuredOnly && '⭐ Featured Brands'}
                {filters.category && ` in ${categories.find(c => c.value === filters.category)?.label}`}
                {!filters.featuredOnly && !filters.category && 'All Brands'}
              </h2>
              <ResultCount>{pagination.total} brands found</ResultCount>
            </ResultsHeader>

            <BrandGrid>
              {brands.map(brand => (
                <BrandCard key={brand.slug} to={`/brand/${brand.slug}`}>
                  {brand.isFeatured && <FeaturedBadge>⭐ Featured</FeaturedBadge>}

                  <BrandLogo>
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 900; color: #0F0F0F; background: #FAFAFA;">${brand.name.charAt(0)}</div>`;
                        }}
                      />
                    ) : (
                      <PlaceholderLogo>{brand.name.charAt(0)}</PlaceholderLogo>
                    )}
                  </BrandLogo>

                  <BrandInfo>
                    <BrandName>{brand.name}</BrandName>
                    <BrandCategory>{brand.category?.replace('_', ' ')}</BrandCategory>

                    {brand.description && (
                      <BrandDescription>{brand.description}</BrandDescription>
                    )}

                    <BrandStats>
                      {brand.minFollowers !== null && brand.minFollowers !== undefined && (
                        <StatItem>
                          <span>📊</span> {brand.minFollowers >= 1000
                            ? `${(brand.minFollowers / 1000).toFixed(0)}K+`
                            : brand.minFollowers}+ followers
                        </StatItem>
                      )}
                      {brand.responseRate !== null && brand.responseRate !== undefined && (
                        <StatItem>
                          <span>✉️</span> {brand.responseRate}% response rate
                        </StatItem>
                      )}
                      {brand.avgResponseTime && (
                        <StatItem>
                          <span>⏱️</span> ~{brand.avgResponseTime} days
                        </StatItem>
                      )}
                    </BrandStats>

                    <ApplyButton>View Application Details →</ApplyButton>
                  </BrandInfo>
                </BrandCard>
              ))}
            </BrandGrid>

            {brands.length === 0 && (
              filters.search.trim() && !filters.category && !filters.featuredOnly ? (
                // Discovery fallback when searching for a brand not in directory
                <DiscoveryFallback>
                  <DiscoveryIcon>🔍</DiscoveryIcon>
                  <DiscoveryTitle>"{filters.search}" not in our directory yet</DiscoveryTitle>
                  <DiscoveryText>
                    Sign up free to search for any brand's PR contact. We can find emails for brands not in our curated list.
                  </DiscoveryText>
                  <SignUpButton to="/register/creator">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Sign up to find {filters.search}'s PR contact
                  </SignUpButton>
                </DiscoveryFallback>
              ) : (
                <EmptyState>
                  <h3>No brands found</h3>
                  <p>Try adjusting your filters or search terms</p>
                </EmptyState>
              )
            )}

            {pagination.total > pagination.limit && (
              <PaginationContainer>
                <Pagination
                  current={pagination.page}
                  total={pagination.total}
                  pageSize={pagination.limit}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </PaginationContainer>
            )}
          </>
        )}

        <CTASection>
          <h2>Want Full Access?</h2>
          <p>Sign up for free to unlock application links and save brands to your pipeline</p>
          <Link to="/register/creator">
            <Button type="primary" size="large">Create Free Account</Button>
          </Link>
        </CTASection>
      </Container>
    </>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: #FAFAFA;
`;

const Hero = styled.div`
  background: white;
  border-bottom: 1px solid #E5E5E5;
  padding: 140px 24px 48px;
  text-align: center;

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
    margin-bottom: 14px;
    line-height: 1.15;
    letter-spacing: -0.5px;
    color: #0F0F0F;

    @media (max-width: 768px) {
      font-size: 28px;
    }
  }

  p {
    font-size: 16px;
    color: #6B6B6B;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: 15px;
    }
  }
`;

const FiltersSection = styled.div`
  max-width: 1200px;
  margin: -30px auto 40px;
  padding: 0 20px;
`;

const SearchBar = styled.div`
  margin-bottom: 16px;

  .ant-input-affix-wrapper {
    border-radius: 10px;
    border: 1px solid #E5E5E5;
  }
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  background: white;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid #E5E5E5;
`;

const FilterItem = styled.div`
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
  }
`;

const ResultsHeader = styled.div`
  max-width: 1200px;
  margin: 0 auto 30px;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
  }
`;

const ResultCount = styled.span`
  color: #666;
  font-size: 14px;
`;

const BrandGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BrandCard = styled(Link)`
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 14px;
  padding: 20px;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    border-color: #D4D4D4;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
`;

const FeaturedBadge = styled.span`
  position: absolute;
  top: 14px;
  right: 14px;
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FDE68A;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2px;
`;

const BrandLogo = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlaceholderLogo = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 900;
  color: #0F0F0F;
  background: #FAFAFA;
`;

const BrandInfo = styled.div`
  text-align: center;
`;

const BrandName = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
`;

const BrandCategory = styled.div`
  font-size: 11px;
  color: #6B6B6B;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.3px;
  margin-bottom: 12px;
`;

const BrandDescription = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const BrandStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const StatItem = styled.div`
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  span {
    font-size: 16px;
  }
`;

const ApplyButton = styled.div`
  background: #0F0F0F;
  color: white;
  padding: 11px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  margin-top: 16px;
  transition: background 0.2s ease;

  &:hover {
    background: #262626;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #666;

  h3 {
    font-size: 24px;
    margin-bottom: 12px;
  }
`;

// Discovery Fallback Components
const DiscoveryFallback = styled.div`
  text-align: center;
  padding: 48px 24px;
  background: white;
  border-radius: 16px;
  border: 1px solid #E5E5E5;
  max-width: 600px;
  margin: 40px auto;
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


const SignUpButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #0F0F0F;
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: #262626;
    color: white;
  }
`;


const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px 20px;
`;

const CTASection = styled.div`
  max-width: 600px;
  margin: 60px auto;
  padding: 40px;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);

  h2 {
    font-size: 28px;
    margin-bottom: 12px;
  }

  p {
    color: #666;
    margin-bottom: 24px;
  }
`;

export default PublicDirectory;
