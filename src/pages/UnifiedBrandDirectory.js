import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { Input, Select, Spin, Pagination, Button, Badge, Progress, message } from 'antd';
import { SearchOutlined, FilterOutlined, HeartOutlined, HeartFilled, CrownOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import UpgradeModal from '../creator-portal/UpgradeModal';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const UnifiedBrandDirectory = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Detect if we're inside dashboard or public route
  const isDashboardView = location.pathname.startsWith('/creator/dashboard');

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 24 });
  const [savedBrandIds, setSavedBrandIds] = useState(new Set());

  // Subscription/quota tracking (for logged-in users)
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [dailyUnlocksUsed, setDailyUnlocksUsed] = useState(0);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const DAILY_UNLOCK_LIMIT = 5; // Free users get 5 unlocks per day

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minFollowers: searchParams.get('minFollowers') || '',
    featuredOnly: searchParams.get('featured') === 'true'
  });

  useEffect(() => {
    fetchCategories();
    if (user) {
      fetchSubscriptionStatus();
      fetchSavedBrands();
    }
  }, [user]);

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

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/subscription/status`, {
        withCredentials: true
      });
      setSubscriptionTier(response.data.tier || 'free');
      setDailyUnlocksUsed(response.data.daily_unlocks_used || 0);
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

  const handleSaveBrand = async (brand, e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (!user) {
      message.info('Sign up to save brands to your pipeline!');
      navigate('/register/creator');
      return;
    }

    // Check daily unlock limit for FREE users (unsaving doesn't count)
    if (subscriptionTier === 'free' && dailyUnlocksUsed >= DAILY_UNLOCK_LIMIT && !savedBrandIds.has(brand.id)) {
      setUpgradeModalVisible(true);
      return;
    }

    try {
      // Toggle save/unsave
      if (savedBrandIds.has(brand.id)) {
        // Unsave (doesn't count against quota)
        await axios.delete(`${API_BASE}/api/pr-crm/pipeline/brand/${brand.id}`, {
          withCredentials: true
        });
        setSavedBrandIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(brand.id);
          return newSet;
        });
        message.success('Brand removed from pipeline');
      } else {
        // Save (counts against daily quota for FREE users)
        await axios.post(`${API_BASE}/api/pr-crm/pipeline/save`,
          { brand_id: brand.id },
          { withCredentials: true }
        );
        setSavedBrandIds(prev => new Set([...prev, brand.id]));

        // Increment daily unlock count for free users
        if (subscriptionTier === 'free') {
          setDailyUnlocksUsed(prev => prev + 1);
        }

        message.success(`${brand.name} saved to pipeline!`);
      }
    } catch (error) {
      console.error('Error saving brand:', error);
      message.error('Failed to save brand');
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

  const isBrandSaved = (brandId) => savedBrandIds.has(brandId);

  return (
    <>
      <Helmet>
        <title>PR Brand Directory | 500+ Brands Accepting Influencer Applications</title>
        <meta name="description" content="Find and apply to 500+ brands seeking influencers for PR packages. Search beauty, fashion, tech, and lifestyle brands accepting creator applications." />
        <meta property="og:title" content="PR Brand Directory - Find Brands Accepting Influencer Applications" />
        <meta property="og:description" content="Browse 500+ brands with open PR programs. Get application links, response rates, and follower requirements." />
        <link rel="canonical" href="https://newcollab.co/directory" />
      </Helmet>

      <Container $isDashboard={isDashboardView}>
        {/* Hero Section - Only show on public /directory page */}
        {!isDashboardView && (
          <Hero>
            <HeroContent>
              <h1>Find Brands That Want to Work With You</h1>
              <p>Browse {pagination.total}+ brands actively seeking influencers for PR packages and paid collaborations</p>
            </HeroContent>
          </Hero>
        )}

        {/* Daily Quota Tracker - Show for logged-in FREE users */}
        {user && subscriptionTier === 'free' && (
          <QuotaBanner $isDashboard={isDashboardView}>
            <Progress
              percent={(dailyUnlocksUsed / DAILY_UNLOCK_LIMIT) * 100}
              showInfo={false}
              strokeColor="#EC4899"
            />
            <QuotaText>
              <span><strong>{dailyUnlocksUsed}/{DAILY_UNLOCK_LIMIT}</strong> applications used today</span>
              <Button type="link" onClick={() => setUpgradeModalVisible(true)}>
                Upgrade for unlimited <CrownOutlined />
              </Button>
            </QuotaText>
            {dailyUnlocksUsed >= DAILY_UNLOCK_LIMIT && (
              <QuotaWarning>
                ⏰ Come back tomorrow for 5 more free applications, or upgrade now!
              </QuotaWarning>
            )}
          </QuotaBanner>
        )}

        {/* Filters Section */}
        <FiltersSection $isDashboard={isDashboardView}>
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
                placeholder="Any Size"
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
              <label>Show Featured Only</label>
              <Select
                size="large"
                style={{ width: '100%' }}
                value={filters.featuredOnly ? 'true' : 'false'}
                onChange={(value) => handleFilterChange('featuredOnly', value === 'true')}
              >
                <Select.Option value="false">All Brands</Select.Option>
                <Select.Option value="true">Featured Only</Select.Option>
              </Select>
            </FilterItem>
          </FilterRow>
        </FiltersSection>

        {/* Brand Grid */}
        {loading ? (
          <LoadingContainer>
            <Spin size="large" />
          </LoadingContainer>
        ) : (
          <>
            <BrandGrid>
              {brands.map(brand => (
                <BrandCard
                  key={brand.slug}
                  to={`/brand/${brand.slug}`}
                >
                  {brand.isFeatured && (
                    <FeaturedBadge>
                      <CrownOutlined /> Featured
                    </FeaturedBadge>
                  )}

                  {user && (
                    <SaveButton
                      onClick={(e) => handleSaveBrand(brand, e)}
                      $saved={isBrandSaved(brand.id)}
                    >
                      {isBrandSaved(brand.id) ? <HeartFilled /> : <HeartOutlined />}
                    </SaveButton>
                  )}

                  <BrandLogo>
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} />
                    ) : (
                      <LogoPlaceholder>{brand.name.charAt(0)}</LogoPlaceholder>
                    )}
                  </BrandLogo>

                  <BrandInfo>
                    <BrandName>{brand.name}</BrandName>
                    {brand.description && (
                      <BrandDescription>{brand.description}</BrandDescription>
                    )}

                    <BrandMeta>
                      {brand.category && <MetaTag>{brand.category}</MetaTag>}
                      {brand.minFollowers && (
                        <MetaTag>{(brand.minFollowers / 1000).toFixed(0)}K+ followers</MetaTag>
                      )}
                    </BrandMeta>

                    {brand.responseRate && (
                      <ResponseRate>
                        {brand.responseRate}% response rate
                      </ResponseRate>
                    )}
                  </BrandInfo>
                </BrandCard>
              ))}
            </BrandGrid>

            <PaginationContainer>
              <Pagination
                current={pagination.page}
                total={pagination.total}
                pageSize={pagination.limit}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={(total) => `${total} brands found`}
              />
            </PaginationContainer>
          </>
        )}
      </Container>

      {/* Upgrade Modal */}
      {upgradeModalVisible && (
        <UpgradeModal
          isOpen={upgradeModalVisible}
          onClose={() => setUpgradeModalVisible(false)}
          currentCount={dailyUnlocksUsed}
          limit={DAILY_UNLOCK_LIMIT}
          feature="brand applications"
        />
      )}
    </>
  );
};

// Styled Components
const Container = styled.div`
  width: 100%;
  max-width: ${props => props.$isDashboard ? '100%' : '100%'};
  background: ${props => props.$isDashboard ? 'transparent' : '#FAFAFA'};
  min-height: ${props => props.$isDashboard ? 'auto' : '100vh'};
  padding-bottom: ${props => props.$isDashboard ? '40px' : '80px'};
  ${props => props.$isDashboard && `
    padding-left: 0;
    padding-right: 0;
    margin: 0;
  `}
`;

const Hero = styled.div`
  background: linear-gradient(135deg, #3B82F6 0%, #EC4899 100%);
  color: white;
  padding: 60px 24px 40px;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;

  h1 {
    font-size: 42px;
    font-weight: 700;
    margin-bottom: 16px;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 32px;
    }
  }

  p {
    font-size: 18px;
    opacity: 0.95;
    margin-bottom: 0;
  }
`;

const QuotaBanner = styled.div`
  background: ${props => props.$isDashboard ? 'white' : 'rgba(255, 255, 255, 0.15)'};
  backdrop-filter: ${props => props.$isDashboard ? 'none' : 'blur(10px)'};
  padding: 16px 24px;
  border-radius: 12px;
  margin: ${props => props.$isDashboard ? '0 24px 24px' : '24px 0 0'};
  box-shadow: ${props => props.$isDashboard ? '0 2px 8px rgba(0, 0, 0, 0.06)' : 'none'};
  color: ${props => props.$isDashboard ? '#111827' : 'white'};
`;

const QuotaText = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 14px;

  button {
    color: ${props => props.theme?.isDashboard ? '#EC4899' : 'white'};
    padding: 0 8px;

    &:hover {
      color: #FCD34D;
    }
  }
`;

const QuotaWarning = styled.div`
  margin-top: 8px;
  font-size: 13px;
  color: #F59E0B;
  font-weight: 500;
`;

const FiltersSection = styled.div`
  max-width: 1200px;
  margin: ${props => props.$isDashboard ? '0 auto 32px' : '-20px auto 32px'};
  padding: 0 24px;
`;

const SearchBar = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 12px;
  margin-bottom: 16px;
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const FilterItem = styled.div`
  label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #6B7280;
    margin-bottom: 8px;
    text-transform: uppercase;
  }
`;

const BrandGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
`;

const BrandCard = styled(Link)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  position: relative;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #F59E0B, #EAB308);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SaveButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: ${props => props.$saved ? '#EC4899' : 'white'};
  color: ${props => props.$saved ? 'white' : '#6B7280'};
  border: ${props => props.$saved ? 'none' : '1px solid #E5E7EB'};
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;

  &:hover {
    transform: scale(1.1);
    background: ${props => props.$saved ? '#DB2777' : '#F3F4F6'};
  }
`;

const BrandLogo = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  border: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const LogoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #3B82F6, #EC4899);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  font-weight: 700;
`;

const BrandInfo = styled.div`
  text-align: center;
  width: 100%;
`;

const BrandName = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
`;

const BrandDescription = styled.p`
  font-size: 13px;
  color: #6B7280;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const BrandMeta = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 8px;
`;

const MetaTag = styled.span`
  background: #F3F4F6;
  color: #4B5563;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
`;

const ResponseRate = styled.div`
  color: #10B981;
  font-size: 12px;
  font-weight: 600;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 48px;
  padding: 0 24px;
`;

export default UnifiedBrandDirectory;
