import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiX, FiInstagram, FiMail, FiExternalLink, FiZap, FiLock, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import { message } from 'antd';
import PROnboarding from '../components/PROnboarding';
import UpgradeModal from './UpgradeModal';

// Brand colors
const primaryBlue = '#3B82F6';
const brightMagenta = '#EC4899';
const warmOrange = '#F59E0B';
const successGreen = '#10B981';

// Utility function to get brand cover image for discovery cards
const getBrandCoverImage = (brand) => {
  // If we have a cover image, use it
  if (brand.cover_image_url) {
    return brand.cover_image_url;
  }

  // Use category-based placeholder from Unsplash (high quality stock photos)
  const categoryImages = {
    beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
    fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
    tech: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
    gaming: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80',
    food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    lifestyle: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    fitness: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    home: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800&q=80',
    travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
    pets: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80'
  };

  const category = brand.category?.toLowerCase() || 'lifestyle';
  return categoryImages[category] || categoryImages.lifestyle;
};

// Utility function to get brand logo URL (for small icons)
const getBrandLogoUrl = (brand) => {
  // Don't use Instagram CDN (CORS blocked)
  // Only try Clearbit Logo API
  if (brand.website) {
    try {
      const url = new URL(brand.website.startsWith('http') ? brand.website : `https://${brand.website}`);
      const domain = url.hostname.replace('www.', '');
      return `https://logo.clearbit.com/${domain}`;
    } catch (e) {
      return null;
    }
  }

  return null;
};

// Get brand description from notes field
const getBrandDescription = (brand) => {
  if (!brand.notes) return null;
  const description = brand.notes.replace('Scraped: ', '').trim();
  return description.length > 120 ? description.substring(0, 120) + '...' : description;
};

// Minimalist Container - No extra decorations
const Container = styled.div`
  width: 100%;
  max-width: 100%;
  background: #FAFAFA;
  padding: 0;
  min-height: 100vh;
`;

// Floating badge on saved brands

// Celebration confetti overlay

// Progress stats at top

// Daily Goal Progress Bar

// Achievement unlock modal

// Quick hint tooltip

// Swipe indicators
const SwipeIndicator = styled(motion.div)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 48px;
  z-index: 10;
  opacity: 0;
  user-select: none;
  pointer-events: none;

  ${props => props.direction === 'left' && `
    left: 40px;
  `}

  ${props => props.direction === 'right' && `
    right: 40px;
  `}
`;

const SwipeLabel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  font-weight: 800;
  padding: 16px 32px;
  border-radius: 16px;
  opacity: 0;
  user-select: none;
  pointer-events: none;

  ${props => props.direction === 'left' && `
    color: #EF4444;
    background: rgba(239, 68, 68, 0.15);
    border: 3px solid #EF4444;
  `}

  ${props => props.direction === 'right' && `
    color: ${successGreen};
    background: rgba(16, 185, 129, 0.15);
    border: 3px solid ${successGreen};
  `}
`;

// Undo toast
const UndoToast = styled(motion.div)`
  position: fixed;
  bottom: 160px;
  left: 50%;
  transform: translateX(-50%);
  background: #374151;
  color: white;
  padding: 12px 20px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1001;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
`;

const UndoButton = styled.button`
  background: white;
  color: #374151;
  border: none;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #F3F4F6;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

// Next card peek (shows slightly behind current card)

// Streak indicator

// Page header (simplified, no duplicate)
const PageHeader = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 20px 20px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const PlanBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;

  ${props => {
    if (props.tier === 'elite') {
      return `
        background: linear-gradient(135deg, #3B82F6, #EC4899);
        color: white;
      `;
    } else if (props.tier === 'pro') {
      return `
        background: #3B82F6;
        color: white;
      `;
    } else {
      return `
        background: #F3F4F6;
        color: #6B7280;
        border: 1px solid #E5E7EB;
      `;
    }
  }}

  svg {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 5px 10px;

    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

const Counter = styled.div`
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;

  strong {
    color: #111827;
  }

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

// Card area - focused and centered with proper layout structure
const CardArea = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    padding: 0 16px;
    gap: 16px;
  }
`;

// Simplified card stack - adjusted height to fit all content
const CardStack = styled.div`
  position: relative;
  height: calc(100vh - 300px);
  max-height: 620px;
  width: 100%;
  touch-action: pan-y;

  @media (max-width: 768px) {
    height: calc(100vh - 300px);
    max-height: 580px;
  }
`;

// Modern, clean card design with height constraints
const BrandCard = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  cursor: grab;
  display: flex;
  flex-direction: column;

  &:active {
    cursor: grabbing;
  }
`;

// Brand cover image area (hero image style) - reduced height for better content fit
const BrandImage = styled.div`
  height: 32%;
  min-height: 160px;
  max-height: 200px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    height: 28%;
    min-height: 140px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  /* Overlay gradient for better text readability if we add text on image */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 80px;
    background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
    pointer-events: none;
  }
`;

// Logo overlay (small logo in corner of cover image)
const LogoOverlay = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    bottom: 12px;
    left: 12px;
  }
`;

const LogoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  color: #3B82F6;
  background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
  border-radius: 8px;
`;

// Clean content area - compact padding for better space utilization
const CardContent = styled.div`
  flex: 1;
  padding: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const BrandName = styled.h2`
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 6px 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 19px;
  }
`;

const BrandDescription = styled.p`
  font-size: 13px;
  line-height: 1.5;
  color: #6B7280;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  @media (max-width: 768px) {
    font-size: 12px;
    margin: 0 0 10px 0;
  }
`;

const Category = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, ${primaryBlue}15, ${brightMagenta}15);
  color: ${primaryBlue};
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
`;

// Info badges - simplified
const InfoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const InfoBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  background: #F9FAFB;
  border-radius: 8px;
  font-size: 12px;
  color: #4B5563;
  font-weight: 500;

  svg {
    color: #9CA3AF;
    flex-shrink: 0;
  }
`;

const ValueBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
  color: #1E40AF;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
`;

const ResponseRate = styled.div`
  background: linear-gradient(135deg, ${successGreen}15, ${successGreen}20);
  color: ${successGreen};
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 10px;
`;

const Description = styled.p`
  font-size: 13px;
  line-height: 1.5;
  color: #6B7280;
  margin: 10px 0;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  @media (max-width: 768px) {
    font-size: 12px;
    margin: 8px 0;
  }
`;

// Contact info - clean layout with auto margins to push to bottom
const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #F3F4F6;
`;

const ContactItem = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${primaryBlue};
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;

  svg {
    flex-shrink: 0;
  }

  &:hover {
    gap: 12px;
  }
`;

// Locked contact section for free users - more compact design
const LockedContactSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px dashed #cbd5e0;
  border-radius: 10px;
  text-align: center;
  margin-top: 6px;

  svg {
    color: #6b7280;
    width: 18px;
    height: 18px;
  }
`;

const LockedText = styled.div`
  strong {
    display: block;
    font-size: 14px;
    color: #1f2937;
    margin-bottom: 3px;
  }

  p {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
    line-height: 1.4;
  }
`;

// Action buttons - separated from card with proper spacing
const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  padding-bottom: 20px;

  @media (max-width: 768px) {
    padding-bottom: 100px;
    gap: 20px;
  }
`;

const ActionButton = styled(motion.button)`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
  }

  &:active {
    transform: translateY(-2px) scale(0.95);
  }

  @media (max-width: 768px) {
    width: 68px;
    height: 68px;
    font-size: 24px;
  }

  ${props => props.variant === 'pass' && `
    background: white;
    color: #EF4444;
    border: 2px solid #FEE2E2;

    &:hover {
      background: #FEF2F2;
      border-color: #FECACA;
      box-shadow: 0 12px 32px rgba(239, 68, 68, 0.2);
    }
  `}

  ${props => props.variant === 'save' && `
    background: linear-gradient(135deg, #10B981, #34D399);
    color: white;
    border: 2px solid transparent;
    font-size: 28px;

    &:hover {
      background: linear-gradient(135deg, #059669, #10B981);
      box-shadow: 0 12px 32px rgba(16, 185, 129, 0.4);
      transform: translateY(-6px) scale(1.05);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `}
`;

// Empty state - minimal
const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;

  .emoji {
    font-size: 64px;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: #6B7280;
    margin: 0;
  }

  @media (max-width: 768px) {
    padding: 40px 20px;

    .emoji {
      font-size: 48px;
    }

    h3 {
      font-size: 18px;
    }

    p {
      font-size: 13px;
    }
  }
`;

const PRBrandDiscovery = () => {
  const [brands, setBrands] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState({ currentCount: 0, limit: 5, feature: 'brands saved' });
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [brandsSavedCount, setBrandsSavedCount] = useState(0);
  const [pitchesSentThisMonth, setPitchesSentThisMonth] = useState(0);
  const [revealedBrands, setRevealedBrands] = useState(new Set()); // Track which brands have been revealed
  const [revealingContact, setRevealingContact] = useState(false);
  const [seenBrandIds, setSeenBrandIds] = useState(new Set()); // Track all brands shown to avoid duplicates
  const [fetchingMore, setFetchingMore] = useState(false);
                    
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Check for achievement unlocks
    const FREE_BRAND_LIMIT = 5;

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('prOnboardingCompleted');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
    fetchBrands();
    fetchSubscriptionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch more brands when nearing the end of current batch
  useEffect(() => {
    const fetchMoreIfNeeded = async () => {
      // When we're 3 brands away from the end and not already fetching
      if (currentIndex >= brands.length - 3 && !fetchingMore && brands.length > 0) {
        setFetchingMore(true);
        try {
          const excludeArray = Array.from(seenBrandIds);
          const response = await axios.get(`${API_BASE}/api/pr-crm/brands?limit=20&exclude_ids=${excludeArray.join(',')}`, {
            withCredentials: true
          });

          if (response.data.success && response.data.brands.length > 0) {
            const parsedBrands = response.data.brands.map(brand => ({
              ...brand,
              regions: typeof brand.regions === 'string' && brand.regions.startsWith('[')
                ? JSON.parse(brand.regions)
                : brand.regions,
              niches: typeof brand.niches === 'string' && brand.niches.startsWith('[')
                ? JSON.parse(brand.niches)
                : brand.niches,
            }));

            // Append new brands to existing list
            setBrands(prev => [...prev, ...parsedBrands]);

            // Track new brand IDs
            const newSeenIds = new Set([...Array.from(seenBrandIds), ...parsedBrands.map(b => b.id)]);
            setSeenBrandIds(newSeenIds);
          }
        } catch (error) {
          console.error('Error fetching more brands:', error);
        } finally {
          setFetchingMore(false);
        }
      }
    };

    fetchMoreIfNeeded();
  }, [currentIndex, brands.length, fetchingMore, seenBrandIds, API_BASE]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/subscription/status`, {
        withCredentials: true
      });
      setSubscriptionTier(response.data.tier || 'free');
      setBrandsSavedCount(response.data.brands_saved_count || 0);
      setPitchesSentThisMonth(response.data.pitches_sent_this_month || 0);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const fetchBrands = async (excludeIds = []) => {
    try {
      setLoading(true);
      // Build query params with exclusions
      const excludeIdsParam = excludeIds.length > 0 ? `&exclude_ids=${excludeIds.join(',')}` : '';
      const response = await axios.get(`${API_BASE}/api/pr-crm/brands?limit=20${excludeIdsParam}`, {
        withCredentials: true
      });

      if (response.data.success) {
        const parsedBrands = response.data.brands.map(brand => ({
          ...brand,
          regions: typeof brand.regions === 'string' && brand.regions.startsWith('[')
            ? JSON.parse(brand.regions)
            : brand.regions,
          niches: typeof brand.niches === 'string' && brand.niches.startsWith('[')
            ? JSON.parse(brand.niches)
            : brand.niches,
        }));
        setBrands(parsedBrands);
        // Track these brand IDs as seen
        const newSeenIds = new Set([...Array.from(seenBrandIds), ...parsedBrands.map(b => b.id)]);
        setSeenBrandIds(newSeenIds);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      message.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (currentIndex >= brands.length) return;

    const brand = brands[currentIndex];
    try {
      await axios.post(`${API_BASE}/api/pr-crm/pipeline/save`,
        { brand_id: brand.id },
        { withCredentials: true }
      );
      message.success(`${brand.brand_name} saved to pipeline!`);

      setSavedCount(prev => prev + 1);
      setBrandsSavedCount(prev => prev + 1); // Update the saved count for quota display
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error saving brand:', error);

      // Check if it's an upgrade required error
      if (error.response && error.response.status === 403 && error.response.data.upgrade_required) {
        setUpgradeInfo({
          currentCount: error.response.data.current_count,
          limit: error.response.data.limit,
          feature: 'brands saved'
        });
        setShowUpgradeModal(true);
      } else {
        message.error('Failed to save brand');
      }
    }
  };

  // Double tap to quick save
  
  const handlePass = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleContactBrand = async () => {
    if (currentIndex >= brands.length) return;
    const brand = brands[currentIndex];

    // Check if already contacted
    if (revealedBrands.has(brand.id)) {
      return; // Already contacted, just show it
    }

    try {
      setRevealingContact(true);

      // Check limits first
      const checkResponse = await axios.post(
        `${API_BASE}/api/subscription/check-limits`,
        { action_type: 'send_pitch' },
        { withCredentials: true }
      );

      if (!checkResponse.data.allowed) {
        // Show upgrade modal
        setUpgradeInfo({
          currentCount: checkResponse.data.current_count,
          limit: checkResponse.data.limit,
          feature: 'brand contacts'
        });
        setShowUpgradeModal(true);
        setRevealingContact(false);
        return;
      }

      // Record the contact (increment pitch count)
      await axios.post(
        `${API_BASE}/api/pr-crm/reveal-contact`,
        { brand_id: brand.id },
        { withCredentials: true }
      );

      // Save to pipeline
      await axios.post(
        `${API_BASE}/api/pr-crm/pipeline/save`,
        { brand_id: brand.id },
        { withCredentials: true }
      );

      // Mark as revealed/contacted locally
      setRevealedBrands(prev => new Set([...prev, brand.id]));
      setPitchesSentThisMonth(prev => prev + 1);
      message.success(`Contact revealed and ${brand.brand_name} added to pipeline!`);

      // Advance to next brand
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error contacting brand:', error);
      if (error.response && error.response.status === 403) {
        setUpgradeInfo({
          currentCount: error.response.data.current_count,
          limit: error.response.data.limit,
          feature: 'brand contacts'
        });
        setShowUpgradeModal(true);
      } else {
        message.error('Failed to contact brand');
      }
    } finally {
      setRevealingContact(false);
    }
  };

  if (loading) {
    return (
      <Container>

      <PageHeader>
          <Title>Loading brands...</Title>
        </PageHeader>

      </Container>
    );
  }

  const currentBrand = brands[currentIndex];

  return (
    <Container>
      <PROnboarding visible={showOnboarding} onClose={() => setShowOnboarding(false)} />

      <PageHeader>
        <Title>Discover Brands</Title>
        <PlanBadge tier={subscriptionTier}>
          {subscriptionTier === 'elite' && (
            <>
              <FiZap /> Elite
            </>
          )}
          {subscriptionTier === 'pro' && (
            <>
              <FiZap /> Pro ({20 - pitchesSentThisMonth} contacts left)
            </>
          )}
          {subscriptionTier === 'free' && (
            <>
              Free ({10 - pitchesSentThisMonth} free contacts left)
            </>
          )}
        </PlanBadge>
      </PageHeader>

      <CardArea>
        <CardStack>
          {!currentBrand ? (
            <EmptyState>
              <div className="emoji">🎉</div>
              <h3>All caught up!</h3>
              <p>You've viewed all available brands. Check back later for more.</p>
            </EmptyState>
          ) : (
            <AnimatePresence>
              <BrandCard
                key={currentBrand.id}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{
                  x: 0,
                  opacity: 0,
                  transition: { duration: 0.2 }
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <BrandImage>
                  {/* Cover Image */}
                  <img
                    src={getBrandCoverImage(currentBrand)}
                    alt={currentBrand.brand_name}
                  />

                  {/* Logo Overlay */}
                  <LogoOverlay>
                    {getBrandLogoUrl(currentBrand) ? (
                      <img
                        src={getBrandLogoUrl(currentBrand)}
                        alt={`${currentBrand.brand_name} logo`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const placeholder = e.target.parentElement.querySelector('div');
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <LogoPlaceholder style={{ display: getBrandLogoUrl(currentBrand) ? 'none' : 'flex' }}>
                      {currentBrand.brand_name.charAt(0)}
                    </LogoPlaceholder>
                  </LogoOverlay>
                </BrandImage>

                <CardContent>
                  <BrandName>{currentBrand.brand_name}</BrandName>
                  {getBrandDescription(currentBrand) && (
                    <BrandDescription>{getBrandDescription(currentBrand)}</BrandDescription>
                  )}
                  {currentBrand.category && <Category>{currentBrand.category}</Category>}

                  <InfoRow>
                    {currentBrand.min_followers && (
                      <InfoBadge>
                        <FiInstagram size={14} />
                        {currentBrand.min_followers.toLocaleString()}+ followers
                      </InfoBadge>
                    )}
                    {currentBrand.regions && (
                      <InfoBadge>
                        🌍 {Array.isArray(currentBrand.regions) ? currentBrand.regions.join(', ') : currentBrand.regions}
                      </InfoBadge>
                    )}
                    {currentBrand.avg_product_value && (
                      <ValueBadge>
                        💰 ${currentBrand.avg_product_value} avg value
                      </ValueBadge>
                    )}
                    {currentBrand.collaboration_type && (
                      <InfoBadge>
                        🤝 {currentBrand.collaboration_type}
                      </InfoBadge>
                    )}
                    {currentBrand.payment_offered && (
                      <ValueBadge>
                        💵 Paid collaboration
                      </ValueBadge>
                    )}
                  </InfoRow>

                  {currentBrand.response_rate && (
                    <ResponseRate>
                      ⚡ {currentBrand.response_rate}% response rate
                    </ResponseRate>
                  )}

                  {currentBrand.pitch_advice && (
                    <Description>💡 {currentBrand.pitch_advice}</Description>
                  )}

                  <ContactInfo>
                    {/* Show Instagram handle (it's public anyway) */}
                    {currentBrand.instagram_handle && (
                      <ContactItem
                        href={`https://instagram.com/${currentBrand.instagram_handle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FiInstagram size={16} />
                        {currentBrand.instagram_handle}
                      </ContactItem>
                    )}
                    {currentBrand.website && (
                      <ContactItem
                        href={currentBrand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FiExternalLink size={16} />
                        Visit website
                      </ContactItem>
                    )}

                    {/* CONTACT GATING: Reveal button system */}
                    {currentBrand.contact_email && (
                      revealedBrands.has(currentBrand.id) ? (
                        // Contact already revealed - show it
                        <ContactItem href={`mailto:${currentBrand.contact_email}`}>
                          <FiMail size={16} />
                          {currentBrand.contact_email}
                        </ContactItem>
                      ) : null
                    )}
                  </ContactInfo>
                </CardContent>
              </BrandCard>
            </AnimatePresence>
          )}
        </CardStack>
      </CardArea>

      {currentBrand && (
        <ActionButtons>
          <ActionButton
            variant="pass"
            onClick={handlePass}
            whileTap={{ scale: 0.9 }}
          >
            <FiX />
            <span style={{ fontSize: '13px', marginTop: '4px' }}>Skip</span>
          </ActionButton>
          <ActionButton
            variant="save"
            onClick={handleContactBrand}
            disabled={revealingContact}
            whileTap={{ scale: 0.9 }}
          >
            {revealingContact ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ fontSize: '28px' }}
              >
                ⟳
              </motion.div>
            ) : (
              <FiCheck />
            )}
            <span style={{ fontSize: '13px', marginTop: '4px' }}>
              Contact
            </span>
          </ActionButton>
        </ActionButtons>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentCount={upgradeInfo.currentCount}
        limit={upgradeInfo.limit}
        feature={upgradeInfo.feature}
      />
    </Container>
  );
};

export default PRBrandDiscovery;
