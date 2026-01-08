import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api';
import CreatorCard from '../components/CreatorCard';
import { FaFilter, FaSort } from 'react-icons/fa';

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
  }, [fetchCreators]);

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

  return (
    <div style={{
      width: '100%'
    }}>
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

        {/* Results count */}
        <div style={{ marginLeft: 'auto', color: '#6b7280', fontSize: 14 }}>
          {!loading && `${creators.length} creator${creators.length !== 1 ? 's' : ''} found`}
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
                  onViewProfile={handleViewProfile}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default BrandMarketplace;

