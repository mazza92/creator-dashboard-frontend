import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api';
import CreatorCard from '../components/CreatorCard';
import { FaFilter, FaSort, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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

const BrandMarketplace = () => {
  const navigate = useNavigate();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNiche, setSelectedNiche] = useState('All Niches');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortBy, setSortBy] = useState('newest');
  const [isMobile, setIsMobile] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const topRef = useRef(null);

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
      // Don't send public=true for brand users - they should see all creators

      const response = await apiClient.get(`/api/marketplace/creators?${params.toString()}`);
      if (response.status === 200) {
        setCreators(response.data.creators || []);
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
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [fetchCreators]);
  
  // Calculate pagination
  const totalPages = Math.ceil(creators.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCreators = creators.slice(startIndex, endIndex);
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Smooth scroll to top
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleProposePRPackage = (creatorId) => {
    // Brand is logged in, go directly to PR offer form
    navigate(`/brand/dashboard/pr-offers?create=true&creator_id=${creatorId}`);
  };

  const handleViewProfile = (creator) => {
    // Navigate to creator profile page (not public profile)
    navigate(`/creator/profile/${creator.id}`);
  };

  // Get unique countries from creators for location filter
  const [availableCountries, setAvailableCountries] = useState([]);
  
  useEffect(() => {
    if (creators.length > 0) {
      const countries = [...new Set(creators.map(c => c.country).filter(Boolean))].sort();
      setAvailableCountries(countries);
    }
  }, [creators]);
  
  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = isMobile ? 5 : 7;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 4);
      }
      
      // Adjust if at the end
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div style={{
      width: '100%'
    }}>
      <div ref={topRef} style={{ position: 'absolute', top: -100 }} />
      {/* Header */}
      <header style={{
        padding: isMobile ? '16px 0' : '24px 0',
        marginBottom: isMobile ? 20 : 24
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
        margin: '0 auto 24px',
        padding: 0,
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

        {/* Items per page selector */}
        {!loading && creators.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              style={{
                padding: '8px 12px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                color: '#1f2937',
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={96}>96</option>
            </select>
          </div>
        )}
        
        {/* Results count */}
        <div style={{ color: '#6b7280', fontSize: 14, fontWeight: 500 }}>
          {!loading && creators.length > 0 && (
            `Showing ${startIndex + 1}–${Math.min(endIndex, creators.length)} of ${creators.length} creator${creators.length !== 1 ? 's' : ''}`
          )}
        </div>
      </section>

      {/* Creator Cards Grid */}
      <section aria-label="Creator listings" style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 0 32px 0'
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
              gap: 24,
              marginBottom: 40
            }}>
              {currentCreators.map(creator => (
                <div key={creator.id} data-creator-id={creator.id}>
                  <CreatorCard
                    creator={creator}
                    onProposePRPackage={() => handleProposePRPackage(creator.id)}
                    onViewProfile={handleViewProfile}
                  />
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
                padding: '32px 0',
                flexWrap: 'wrap'
              }}>
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    border: '1.5px solid #e5e7eb',
                    borderRadius: 8,
                    background: currentPage === 1 ? '#f9fafb' : '#fff',
                    color: currentPage === 1 ? '#9ca3af' : '#1f2937',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.target.style.background = '#f9fafb';
                      e.target.style.borderColor = '#26A69A';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== 1) {
                      e.target.style.background = '#fff';
                      e.target.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  <FaChevronLeft style={{ fontSize: 12 }} />
                  {!isMobile && 'Previous'}
                </button>
                
                {/* Page Numbers */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {getPageNumbers().map((page, index) => {
                    if (page === '...') {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          style={{
                            padding: '10px 12px',
                            color: '#9ca3af',
                            fontSize: 14,
                            fontWeight: 500
                          }}
                        >
                          ...
                        </span>
                      );
                    }
                    
                    const isActive = page === currentPage;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        style={{
                          minWidth: 40,
                          height: 40,
                          padding: '0 12px',
                          border: isActive ? '1.5px solid #26A69A' : '1.5px solid #e5e7eb',
                          borderRadius: 8,
                          background: isActive ? '#26A69A' : '#fff',
                          color: isActive ? '#fff' : '#1f2937',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.target.style.background = '#f9fafb';
                            e.target.style.borderColor = '#26A69A';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.target.style.background = '#fff';
                            e.target.style.borderColor = '#e5e7eb';
                          }
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    border: '1.5px solid #e5e7eb',
                    borderRadius: 8,
                    background: currentPage === totalPages ? '#f9fafb' : '#fff',
                    color: currentPage === totalPages ? '#9ca3af' : '#1f2937',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: currentPage === totalPages ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages) {
                      e.target.style.background = '#f9fafb';
                      e.target.style.borderColor = '#26A69A';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== totalPages) {
                      e.target.style.background = '#fff';
                      e.target.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  {!isMobile && 'Next'}
                  <FaChevronRight style={{ fontSize: 12 }} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default BrandMarketplace;

