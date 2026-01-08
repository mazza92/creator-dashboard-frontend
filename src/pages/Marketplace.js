import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api';
import CreatorCard from '../components/CreatorCard';
import { FaFilter, FaSort } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import Login from '../components/Login';
import Signup from '../components/forms/Signup';
import { UserContext } from '../contexts/UserContext';
import LandingPageLayout from '../Layouts/LandingPageLayout';

const NICHE_OPTIONS = [
  'All Niches',
  'Skincare & Beauty',
  'Fashion & Style',
  'Tech & Gadgets',
  'Wellness & Fitness',
  'Food & Nutrition',
  'Travel & Adventure',
  'Gaming',
  'Sustainable/Eco',
  'Parenting & Family',
  'Home & Lifestyle',
  'Music & Entertainment',
  'Sports & Outdoors',
  'Health & Medical',
  'Finance & Business',
  'Arts & Crafts',
  'Education',
  'Automotive',
  'Pet Products',
  'Books & Literature',
  'Photography'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Creators' },
  { value: 'engagement', label: 'Highest Engagement' },
  { value: 'followers', label: 'Most Followers' }
];

const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = React.useContext(UserContext);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNiche, setSelectedNiche] = useState('All Niches');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortBy, setSortBy] = useState('newest');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [selectedCreatorId, setSelectedCreatorId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [totalAvailable, setTotalAvailable] = useState(null);
  const [isLimited, setIsLimited] = useState(false);
  const [viewedCreators, setViewedCreators] = useState(new Set());
  const [signupModalTriggered, setSignupModalTriggered] = useState(false);
  const triggerRef = useRef(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchCreators = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedNiche !== 'All Niches') {
        params.append('niche', selectedNiche);
      }
      if (selectedLocation !== 'All Locations') {
        params.append('country', selectedLocation);
      }
      params.append('sort', sortBy);
      params.append('public', 'true'); // Only public profiles

      const response = await apiClient.get(`/api/marketplace/creators?${params.toString()}`);
      if (response.status === 200) {
        setCreators(response.data.creators || []);
        setTotalAvailable(response.data.total_available || response.data.creators?.length || 0);
        setIsLimited(response.data.is_limited || false);
      }
    } catch (err) {
      console.error('Error fetching creators:', err);
      setError(err.response?.data?.error || 'Failed to load creators');
    } finally {
      setLoading(false);
    }
  }, [selectedNiche, selectedLocation, sortBy]);

  useEffect(() => {
    fetchCreators();
    // Reset viewed creators count when filters change
    setViewedCreators(new Set());
    setSignupModalTriggered(false);
    triggerRef.current = false;
  }, [fetchCreators]);

  const handleProposePRPackage = (creatorId) => {
    if (user && user.role === 'brand') {
      // Brand is logged in, go directly to PR offer form
      navigate(`/brand/dashboard/pr-offers?create=true&creator_id=${creatorId}`);
    } else {
      // Not logged in or not a brand, show login/signup
      setSelectedCreatorId(creatorId);
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    if (selectedCreatorId) {
      // Redirect to PR offer form with creator_id
      navigate(`/brand/dashboard/pr-offers?create=true&creator_id=${selectedCreatorId}`);
    }
  };

  const handleSignupClick = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const handleLoginClick = () => {
    // Close signup modal and check if content should be blocked
    handleCloseSignupModal();
    setShowLoginModal(true);
  };

  const handleSignupSuccess = (data) => {
    setShowSignupModal(false);
    // If user signed up as brand and there's a selected creator, redirect to PR offer form
    if (selectedCreatorId && (data?.user_role === 'brand' || data?.role === 'brand')) {
      navigate(`/brand/dashboard/pr-offers?create=true&creator_id=${selectedCreatorId}`);
    } else if (data?.user_role === 'creator' || data?.role === 'creator') {
      // If user signed up as creator, redirect to creator dashboard
      navigate('/creator/dashboard/overview');
    } else {
      // Default: redirect back to marketplace after signup
      navigate('/marketplace');
    }
  };

  const handleCloseSignupModal = () => {
    setShowSignupModal(false);
    // If user viewed 10+ creators and closes modal, redirect to signup page
    if (signupModalTriggered || viewedCreators.size >= 10) {
      // Redirect to signup page with marketplace context
      // Use a small delay to ensure modal closes smoothly before redirect
      setTimeout(() => {
        navigate('/register?from=marketplace&viewed=10');
      }, 100);
    }
  };

  // Get unique countries from creators for location filter
  const [availableCountries, setAvailableCountries] = useState([]);
  
  useEffect(() => {
    if (creators.length > 0) {
      const countries = [...new Set(creators.map(c => c.country).filter(Boolean))].sort();
      setAvailableCountries(countries);
    }
  }, [creators]);

  // Scroll detection: Track viewed creators and trigger signup modal after 10 creators
  useEffect(() => {
    // Only trigger for non-brand users (creators and unauthenticated)
    const isNonBrand = !user || (user && user.role !== 'brand');
    
    if (!isNonBrand || signupModalTriggered || creators.length === 0) {
      return;
    }

    // Reset trigger ref when effect runs
    triggerRef.current = false;

    // Use Intersection Observer to track which creator cards have been viewed
    const observerOptions = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.5 // Trigger when 50% of the card is visible
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const creatorId = entry.target.getAttribute('data-creator-id');
          if (creatorId) {
            setViewedCreators(prev => {
              const newSet = new Set(prev);
              newSet.add(creatorId);
              
              // Trigger signup modal when 10 creators have been viewed (only once)
              if (newSet.size >= 10 && !triggerRef.current) {
                triggerRef.current = true;
                // Use setTimeout to avoid state update issues
                setTimeout(() => {
                  setSignupModalTriggered(true);
                  setShowSignupModal(true);
                }, 100);
              }
              
              return newSet;
            });
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      // Observe all creator cards
      const creatorCards = document.querySelectorAll('[data-creator-id]');
      creatorCards.forEach(card => observer.observe(card));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [creators, user, signupModalTriggered]);

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Creator Marketplace - Discover Top Influencers",
    "description": "Browse our curated gallery of verified creators. Find the perfect influencer for your brand collaboration. Filter by niche, engagement rate, followers, and location.",
    "url": "https://newcollab.co/marketplace",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": creators.length,
      "itemListElement": creators.slice(0, 20).map((creator, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Person",
          "name": creator.username || `${creator.first_name || ''} ${creator.last_name || ''}`.trim() || 'Creator',
          "url": `https://newcollab.co/c/${creator.username}`,
          "image": creator.profile_pic,
          "jobTitle": "Content Creator",
          "description": `Creator specializing in ${creator.categories?.join(', ') || creator.niche || 'various niches'} with ${creator.followers_count?.toLocaleString() || 'N/A'} followers`,
          ...(creator.avg_engagement_rate && {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": parseFloat(creator.avg_engagement_rate).toFixed(1),
              "bestRating": "10",
              "ratingCount": "1"
            }
          })
        }
      }))
    },
    "publisher": {
      "@type": "Organization",
      "name": "Newcollab",
      "logo": {
        "@type": "ImageObject",
        "url": "https://newcollab.co/logo.png"
      }
    }
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://newcollab.co"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Marketplace",
        "item": "https://newcollab.co/marketplace"
      }
    ]
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Newcollab",
    "url": "https://newcollab.co",
    "logo": "https://newcollab.co/logo.png",
    "description": "Platform connecting brands with verified content creators for PR packages and brand collaborations",
    "sameAs": [
      "https://www.linkedin.com/company/newcollab/",
      "https://x.com/newcollab_",
      "https://www.instagram.com/newcollab.co/",
      "https://www.tiktok.com/@newcollabco"
    ]
  };

  const pageTitle = "Creator Marketplace - Discover Top Influencers & Content Creators | Newcollab";
  const pageDescription = "Browse our curated gallery of 10,000+ verified creators. Find the perfect influencer for your brand collaboration. Filter by niche, engagement rate, followers, and location. Connect with high-engagement micro-influencers ready for PR packages.";
  const pageKeywords = "creator marketplace, influencer marketplace, find creators, content creator directory, micro influencer platform, brand collaboration, PR packages, influencer marketing, creator discovery, verified creators";

  return (
    <LandingPageLayout canonicalUrl="https://newcollab.co/marketplace">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content="https://newcollab.co/marketplace" />
        <meta property="og:image" content="https://newcollab.co/og-marketplace.jpg" />
        <meta property="og:site_name" content="Newcollab" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://newcollab.co/og-marketplace.jpg" />
        <meta name="twitter:creator" content="@newcollab" />
        <meta name="twitter:site" content="@newcollab" />
        
        {/* Additional SEO tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="language" content="English" />
        <meta name="author" content="Newcollab" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(organizationData)}
        </script>
      </Helmet>

      {/* Noscript fallback for crawlers - outside Helmet */}
      <noscript>
        <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <h1>Creator Marketplace - Discover Top Influencers & Content Creators</h1>
          <p>Browse our curated gallery of 10,000+ verified creators. Find the perfect influencer for your brand collaboration. Filter by niche, engagement rate, followers, and location. Connect with high-engagement micro-influencers ready for PR packages.</p>
          <p>Please enable JavaScript to view the full marketplace experience.</p>
          <p><a href="https://newcollab.co/register">Sign up free</a> to access our full roster of vetted creators and send PR offers instantly.</p>
        </div>
      </noscript>

      <main style={{
        minHeight: '100vh',
        background: '#f9fafb'
      }}>
        {/* Header */}
        <header style={{
          padding: isMobile ? '120px 16px 24px' : '48px 24px 32px',
          marginBottom: isMobile ? 24 : 32
        }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <h1 style={{
              margin: '0 0 8px 0',
              fontSize: isMobile ? 28 : 36,
              fontWeight: 700,
              color: '#1f2937',
              lineHeight: 1.2
            }}>
              Creator Marketplace
            </h1>
            <p style={{
              margin: 0,
              fontSize: isMobile ? 16 : 18,
              color: '#6b7280',
              lineHeight: 1.5
            }}>
              Discover verified creators ready to collaborate with your brand
            </p>
          </div>
        </header>

        {/* Filters and Sort */}
        <section aria-label="Filter and sort creators" style={{
          maxWidth: 1400,
          margin: '0 auto 32px',
          padding: '0 24px',
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Niche Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaFilter style={{ color: '#6b7280', fontSize: 16 }} />
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              style={{
                padding: '8px 16px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                color: '#1f2937',
                background: '#fff',
                cursor: 'pointer',
                minWidth: 200
              }}
            >
              {NICHE_OPTIONS.map(niche => (
                <option key={niche} value={niche}>{niche}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaFilter style={{ color: '#6b7280', fontSize: 16 }} />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{
                padding: '8px 16px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                color: '#1f2937',
                background: '#fff',
                cursor: 'pointer',
                minWidth: 200
              }}
            >
              <option value="All Locations">All Locations</option>
              {availableCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaSort style={{ color: '#6b7280', fontSize: 16 }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 16px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                color: '#1f2937',
                background: '#fff',
                cursor: 'pointer',
                minWidth: 200
              }}
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div style={{ marginLeft: 'auto', color: '#6b7280', fontSize: 14 }}>
            {!loading && `${creators.length} creator${creators.length !== 1 ? 's' : ''} found`}
          </div>
        </section>

        {/* Creator Cards Grid */}
        <section aria-label="Creator listings" style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 24px 48px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 64 }}>
              <div style={{ fontSize: 16, color: '#6b7280' }}>Loading creators...</div>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: 64 }}>
              <div style={{ fontSize: 16, color: '#dc2626' }}>{error}</div>
            </div>
          ) : creators.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#1f2937', marginBottom: 8 }}>
                No creators found
              </div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>
                Try adjusting your filters
              </div>
            </div>
          ) : (
            <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 24
            }}>
              {creators.map(creator => (
                <div key={creator.id} data-creator-id={creator.id}>
                  <CreatorCard
                    creator={creator}
                    onProposePRPackage={() => handleProposePRPackage(creator.id)}
                  />
                </div>
              ))}
            </div>
            
            {/* Teaser message for non-brand users (creators and unauthenticated) */}
            {(!user || (user && user.role !== 'brand')) && isLimited && totalAvailable > creators.length && (
              <div style={{
                textAlign: 'center',
                padding: isMobile ? '40px 16px' : '48px 24px',
                marginTop: 32,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 16,
                color: '#fff'
              }}>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: isMobile ? 20 : 28,
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
                }}>
                  Stop Searching. Start Collaborating.
                </h3>
                <p style={{
                  margin: '0 0 24px 0',
                  fontSize: isMobile ? 14 : 16,
                  opacity: 0.95,
                  maxWidth: 600,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  lineHeight: 1.6
                }}>
                  Sign up free to access our full roster of vetted, high-engagement creators and send PR offers instantly.
                </p>
                <button
                  onClick={() => setShowSignupModal(true)}
                  style={{
                    padding: '14px 32px',
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#667eea',
                    background: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                >
                  Sign Up Free
                </button>
              </div>
            )}
            </>
          )}
        </section>

        {/* Login Modal */}
        {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: 20
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: '40px 32px',
            maxWidth: 420,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <button
              onClick={() => {
                setShowLoginModal(false);
                setSelectedCreatorId(null);
              }}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                border: 'none',
                background: 'transparent',
                fontSize: 24,
                cursor: 'pointer',
                color: '#9ca3af',
                padding: 4,
                lineHeight: 1,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f3f4f6';
                e.target.style.color = '#6b7280';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#9ca3af';
              }}
            >
              ×
            </button>
            <Login
              onSuccess={handleLoginSuccess}
              showSignupLink={true}
              onSignupClick={handleSignupClick}
              isModal={true}
            />
          </div>
        </div>
        )}

        {/* Signup Modal */}
        {showSignupModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseSignupModal();
              setSelectedCreatorId(null);
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: isMobile ? '16px' : '24px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 24,
              padding: 0,
              maxWidth: isMobile ? '100%' : 520,
              width: '100%',
              maxHeight: '95vh',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                handleCloseSignupModal();
                setSelectedCreatorId(null);
              }}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                border: 'none',
                background: 'rgba(0, 0, 0, 0.05)',
                fontSize: 20,
                cursor: 'pointer',
                color: '#6b7280',
                padding: '8px',
                lineHeight: 1,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.color = '#1f2937';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              ×
            </button>
            
            {/* Modal Content - No extra padding wrapper, let Signup component handle it */}
            <div style={{
              overflowY: 'auto',
              maxHeight: '95vh',
              padding: isMobile ? '32px 20px' : '48px 40px'
            }}>
              <Signup
                onSuccess={handleSignupSuccess}
                isModal={true}
                onLoginClick={handleLoginClick}
              />
            </div>
          </div>
        </div>
        )}
        
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to { 
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
      </main>
    </LandingPageLayout>
  );
};

export default Marketplace;

