import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { Input, Select, Spin, Pagination, Button, Badge, Progress, message } from 'antd';
import { SearchOutlined, FilterOutlined, HeartOutlined, HeartFilled, CrownOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import UpgradeModal from '../creator-portal/UpgradeModal';
import LandingPageLayout from '../Layouts/LandingPageLayout';

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
  const [dailyUnlocksUsed, setDailyUnlocksUsed] = useState(0);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const DAILY_UNLOCK_LIMIT = 5; // Free users get 5 unlocks per day

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    activity: searchParams.get('activity') || '', // 'new', 'active', 'responsive'
    contactType: searchParams.get('contactType') || '' // 'application', 'email', or '' for all
  });

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
    // Check if free user is trying to use PRO "responsive" filter
    if (key === 'activity' && value === 'responsive' && subscriptionTier !== 'pro' && subscriptionTier !== 'elite') {
      setUpgradeModalVisible(true);
      return;
    }
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

  const isBrandSaved = (brandId) => savedBrandIds.has(brandId);

  const content = (
    <>
      {/* Only show default Helmet if not in collection mode */}
      {!collectionMode && (
        <Helmet>
          <title>Direct PR Application Forms: 500+ Brand PR Lists (2026) | NewCollab</title>
          <meta name="description" content="Access direct PR application forms for 500+ brands. Find PR list requirements, application links, and brands that send PR packages to small influencers. Filter by beauty, skincare, K-beauty, tech, and fashion." />
          <meta name="keywords" content="pr forms, pr application form, pr list application, skincare pr list, k-beauty pr forms, pr packages australia, brands that send pr to small influencers, influencer pr list requirements" />
          <meta property="og:title" content="Direct PR Application Forms - 500+ Brand PR Lists" />
          <meta property="og:description" content="Direct links to PR application forms and requirements for 500+ beauty, skincare, and lifestyle brands. Micro-influencer friendly." />
          <link rel="canonical" href="https://newcollab.co/directory" />
        </Helmet>
      )}

      <Container $isDashboard={isDashboardView}>
        {/* Hero Section - Only show on public /directory page */}
        {!isDashboardView && (
          <Hero>
            <HeroContent>
              <h1>{collectionTitle || 'Direct PR Application Forms - 500+ Brand PR Lists'}</h1>
              <p>{collectionDescription || `Access direct PR application forms and requirements for ${pagination.total}+ brands. Find brands that send PR to small influencers, skincare PR lists, K-beauty forms, and more.`}</p>
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
              <label>Brand Activity</label>
              <Select
                size="large"
                style={{ width: '100%' }}
                placeholder="All Brands"
                value={filters.activity || undefined}
                onChange={(value) => handleFilterChange('activity', value)}
                allowClear
              >
                <Select.Option value="new">
                  🆕 Added This Week
                </Select.Option>
                <Select.Option value="active">
                  ⚡ Actively Reviewing
                </Select.Option>
                <Select.Option value="responsive">
                  ✨ High Response Rate {subscriptionTier !== 'pro' && subscriptionTier !== 'elite' && <ProBadgeInline>PRO</ProBadgeInline>}
                </Select.Option>
              </Select>
            </FilterItem>

            <FilterItem>
              <label>Contact Type</label>
              <Select
                size="large"
                style={{ width: '100%' }}
                value={filters.contactType || undefined}
                onChange={(value) => handleFilterChange('contactType', value)}
                placeholder="All Brands"
                allowClear
              >
                <Select.Option value="application">
                  🔗 Has Application Form <FreeBadgeInline>FREE</FreeBadgeInline>
                </Select.Option>
                <Select.Option value="email">
                  ✉️ Has PR Email <ProBadgeInline>PRO</ProBadgeInline>
                </Select.Option>
              </Select>
            </FilterItem>
          </FilterRow>
        </FiltersSection>

        {/* Open PR Applications - Featured Section */}
        {!filters.search && !filters.category && openPrBrands.length > 0 && (
          <OpenPRSection $isDashboard={isDashboardView}>
            <OpenPRHeader>
              <h2>
                <span>🎯</span> Open PR Applications
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
                let applyUrl, buttonText, isExternal;
                if (!user) {
                  // Not logged in: redirect to signup
                  applyUrl = '/register/creator';
                  buttonText = 'Sign up to apply';
                  isExternal = false;
                } else if (brand.application_url) {
                  // Logged in + has application form: direct link
                  applyUrl = brand.application_url;
                  buttonText = 'Apply Now';
                  isExternal = true;
                } else if (brand.website) {
                  // Logged in + no form but has website: link to website
                  applyUrl = brand.website.startsWith('http') ? brand.website : `https://${brand.website}`;
                  buttonText = 'Visit Website';
                  isExternal = true;
                } else {
                  // Logged in + no form, no website: link to brand detail page
                  applyUrl = `/brand/${brand.slug}`;
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
                    <ApplyButton
                      href={applyUrl}
                      target={isExternal ? "_blank" : "_self"}
                      rel={isExternal ? "noopener noreferrer" : undefined}
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
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; color: #667eea; background: linear-gradient(135deg, #667eea22, #764ba222); border-radius: 12px;">${brand.name.charAt(0)}</div>`;
                        }}
                      />
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
                      {brand.minFollowers !== null && brand.minFollowers !== undefined && brand.minFollowers > 0 && (
                        <MetaTag>{(brand.minFollowers / 1000).toFixed(0)}K+ followers</MetaTag>
                      )}
                    </BrandMeta>

                    {brand.responseRate !== null && brand.responseRate !== undefined && (
                      <ResponseRate>
                        {brand.responseRate}% response rate
                      </ResponseRate>
                    )}

                    {!user && !isDashboardView && (
                      <SignupCTA>
                        <LockOutlined /> Sign up to view application link
                      </SignupCTA>
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

  // Wrap with LandingPageLayout for public view, return plain content for dashboard
  return isDashboardView ? content : <LandingPageLayout>{content}</LandingPageLayout>;
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
  padding: 120px 24px 60px;
  text-align: center;
  margin-top: 0;

  @media (max-width: 768px) {
    padding: 100px 24px 50px;
  }
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

const FreeBadgeInline = styled.span`
  background: #52c41a;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  margin-left: 8px;
`;

const ProBadgeInline = styled.span`
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  margin-left: 8px;
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

const SignupCTA = styled.div`
  margin-top: 16px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #3B82F6, #EC4899);
  color: white;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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

// Open PR Applications Featured Section
const OpenPRSection = styled.section`
  max-width: 1200px;
  margin: ${props => props.$isDashboard ? '0 auto 28px' : '28px auto 32px'};
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

export default UnifiedBrandDirectory;
