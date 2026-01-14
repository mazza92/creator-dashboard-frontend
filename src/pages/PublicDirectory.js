import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { Input, Select, Spin, Pagination, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

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
        <title>PR Brand Directory | 500+ Brands Accepting Influencer Applications</title>
        <meta name="description" content="Find and apply to 500+ brands seeking influencers for PR packages. Search beauty, fashion, tech, and lifestyle brands accepting creator applications." />
        <meta property="og:title" content="PR Brand Directory - Find Brands Accepting Influencer Applications" />
        <meta property="og:description" content="Browse 500+ brands with open PR programs. Get application links, response rates, and follower requirements." />
        <link rel="canonical" href="https://newcollab.co/directory" />
      </Helmet>

      <Container>
        <Hero>
          <HeroContent>
            <h1>Find Brands That Want to Work With You</h1>
            <p>Browse 500+ brands actively seeking influencers for PR packages and paid collaborations</p>
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
          <LoadingContainer>
            <Spin size="large" />
          </LoadingContainer>
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
                          e.target.parentElement.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; color: #667eea; background: linear-gradient(135deg, #667eea22, #764ba222);">${brand.name.charAt(0)}</div>`;
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
              <EmptyState>
                <h3>No brands found</h3>
                <p>Try adjusting your filters or search terms</p>
              </EmptyState>
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const Hero = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;

  h1 {
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 20px;

    @media (max-width: 768px) {
      font-size: 32px;
    }
  }

  p {
    font-size: 20px;
    opacity: 0.9;

    @media (max-width: 768px) {
      font-size: 16px;
    }
  }
`;

const FiltersSection = styled.div`
  max-width: 1200px;
  margin: -30px auto 40px;
  padding: 0 20px;
`;

const SearchBar = styled.div`
  margin-bottom: 20px;

  .ant-input-affix-wrapper {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const FilterItem = styled.div`
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
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
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
`;

const FeaturedBadge = styled.span`
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
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
  font-weight: 700;
  color: #667eea;
  background: linear-gradient(135deg, #667eea22, #764ba222);
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
  font-size: 12px;
  color: #667eea;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
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
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  margin-top: 16px;
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
