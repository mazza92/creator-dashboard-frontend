import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiInstagram, FiExternalLink, FiZap, FiCheck, FiSend, FiBookmark, FiLock, FiAlertCircle, FiArrowRight, FiFilter, FiChevronDown } from 'react-icons/fi';
import api from '../config/api';
import { message } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PROnboarding from '../components/PROnboarding';
import UpgradeModal from './UpgradeModal';
import AIPitchModal from './AIPitchModal';
import PRPackageModal from './PRPackageModal';
import { UnlockModalV2 } from './unlockV2';
import ProfileCompleteness from '../components/ProfileCompleteness';

// Feature flag for V2 modal testing - set to true to use new verdict-first design
const USE_UNLOCK_V2 = true;

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
  background: #f7f5f0;
  padding: 0;
  min-height: 100vh;
  font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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

// ============================================
// UNIVERSAL BRAND DISCOVERY COMPONENTS
// ============================================

const SearchContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 0 20px 16px;

  @media (max-width: 768px) {
    padding: 0 16px 12px;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 48px 14px 16px;
  font-size: 15px;
  font-weight: 500;
  border: 2px solid #E5E7EB;
  border-radius: 14px;
  background: #fff;
  color: #111827;
  transition: all 0.2s;
  outline: none;

  &::placeholder {
    color: #9CA3AF;
    font-weight: 400;
  }

  &:focus {
    border-color: ${primaryBlue};
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 14px;
  background: linear-gradient(135deg, ${primaryBlue}, ${brightMagenta});
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    transform: translateY(-50%) scale(1.02);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Autocomplete dropdown styles
const AutocompleteDropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  z-index: 100;
  max-height: 320px;
  overflow-y: auto;
  display: ${props => props.$open ? 'block' : 'none'};
`;

const AutocompleteItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #F3F4F6;

  &:last-child {
    border-bottom: none;
  }

  &:hover, &.active {
    background: #F9FAFB;
  }

  &.active {
    background: #EEF2FF;
  }
`;

const AutocompleteLogo = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.$hasImage ? '#fff' : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid #E5E7EB;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 4px;
  }
`;

const AutocompleteInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AutocompleteName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AutocompleteCategory = styled.div`
  font-size: 13px;
  color: #6B7280;
  text-transform: capitalize;
`;

const AutocompleteNoMatch = styled.div`
  padding: 16px;
  text-align: center;
  color: #6B7280;
  font-size: 14px;
`;

const DiscoveryFallback = styled.div`
  max-width: 500px;
  margin: 40px auto;
  padding: 32px 24px;
  text-align: center;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
`;

const FallbackIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const FallbackTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
`;

const FallbackDescription = styled.p`
  font-size: 14px;
  color: #6B7280;
  margin: 0 0 20px;
  line-height: 1.5;
`;

const DiscoverButton = styled.button`
  padding: 14px 28px;
  background: linear-gradient(135deg, ${primaryBlue}, ${brightMagenta});
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(236, 72, 153, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const DiscoveredBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.9);
  backdrop-filter: blur(8px);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 5;
`;

const UnverifiedBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 12px;
  background: rgba(245, 158, 11, 0.9);
  backdrop-filter: blur(8px);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 5;
`;

const SearchResultCard = styled.div`
  max-width: 500px;
  margin: 0 auto 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;

  &:hover {
    border-color: ${primaryBlue};
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
  }
`;

const SearchResultLogo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const SearchResultInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SearchResultName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
`;

const SearchResultMeta = styled.div`
  font-size: 12px;
  color: #6B7280;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BackToFeed = styled.button`
  background: none;
  border: none;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;

  &:hover {
    color: #111827;
  }
`;

const RateLimitWarning = styled.div`
  max-width: 500px;
  margin: 20px auto;
  padding: 16px 20px;
  background: #FEF3C7;
  border: 1px solid #F59E0B;
  border-radius: 12px;
  text-align: center;

  p {
    margin: 0;
    font-size: 14px;
    color: #92400E;
  }
`;

// V4: Welcome Card for first-time users after onboarding
const WelcomeCard = styled.div`
  background: #0F0F0F;
  border-radius: 18px;
  padding: 24px 26px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(225,29,72,0.45) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const WelcomeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: center;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const WelcomeTag = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #FDA4AF;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 5px;
`;

const WelcomeTitle = styled.div`
  font-size: 19px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.4px;
  margin-bottom: 5px;
`;

const WelcomeSub = styled.div`
  font-size: 13px;
  color: rgba(255,255,255,0.55);
  line-height: 1.5;

  strong {
    color: rgba(255,255,255,0.85);
  }
`;

const WelcomeBtn = styled.button`
  background: #E11D48;
  color: #fff;
  border: none;
  border-radius: 11px;
  padding: 12px 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  position: relative;
  z-index: 1;
  transition: all 0.15s;

  &:hover {
    background: #BE123C;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const WelcomeClose = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255,255,255,0.6);
  z-index: 2;
  transition: all 0.15s;

  &:hover {
    background: rgba(255,255,255,0.2);
    color: #fff;
  }
`;

// Media Kit Completion Banner
const MediaKitBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border: 1px solid #F59E0B;
  border-radius: 14px;
  margin-top: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
  }
`;

const MediaKitBannerIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #F59E0B;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
`;

const MediaKitBannerContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const MediaKitBannerTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #92400E;
  margin-bottom: 2px;
`;

const MediaKitBannerText = styled.div`
  font-size: 12px;
  color: #B45309;
`;

const MediaKitBannerAction = styled.div`
  width: 32px;
  height: 32px;
  background: rgba(146, 64, 14, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #92400E;
  flex-shrink: 0;
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

// Quick Win Components
const MatchScoreBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
  z-index: 5;
`;

const RecentActivityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #166534;
  font-weight: 500;
`;

const PulseDot = styled.span`
  width: 6px;
  height: 6px;
  background: #22C55E;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
  }
`;

const EstimatedValue = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  color: #92400E;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #FCD34D;
  margin-right: 8px;
`;

const FollowUpHint = styled.div`
  text-align: center;
  font-size: 11px;
  color: #7C3AED;
  background: #F5F3FF;
  border-radius: 8px;
  padding: 8px 12px;
  margin-top: 12px;
  font-weight: 500;
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

  ${props => props.variant === 'bookmark' && `
    background: white;
    color: #F59E0B;
    border: 2px solid #FEF3C7;
    width: 56px;
    height: 56px;
    font-size: 20px;

    &:hover {
      background: #FFFBEB;
      border-color: #FCD34D;
      box-shadow: 0 12px 32px rgba(245, 158, 11, 0.2);
    }

    &:disabled {
      background: #FEF3C7;
      color: #D97706;
      border-color: #FCD34D;
      opacity: 1;
    }
  `}

  ${props => props.variant === 'pitch' && `
    background: linear-gradient(135deg, #3B82F6, #EC4899);
    color: white;
    border: 2px solid transparent;
    font-size: 24px;
    width: 80px;
    height: 80px;

    &:hover {
      box-shadow: 0 12px 32px rgba(59, 130, 246, 0.4);
      transform: translateY(-6px) scale(1.05);
    }

    &:disabled {
      background: linear-gradient(135deg, #10B981, #34D399);
      opacity: 1;
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

// ============================================
// INFINITE SCROLL GRID COMPONENTS
// ============================================

const BrandGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 0 20px 100px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 0 12px 100px;
  }

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`;

const GridCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const GridCardImage = styled.div`
  position: relative;
  width: 100%;
  padding-top: 65%;
  background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  ${GridCard}:hover & img {
    transform: scale(1.05);
  }
`;

const GridCardLogo = styled.div`
  position: absolute;
  bottom: -20px;
  left: 12px;
  width: 44px;
  height: 44px;
  background: white;
  border-radius: 10px;
  padding: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
    bottom: -16px;
    left: 10px;
  }
`;

const GridCardLogoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: ${primaryBlue};
  background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
  border-radius: 6px;
`;

const GridCardContent = styled.div`
  padding: 28px 14px 14px;

  @media (max-width: 640px) {
    padding: 22px 10px 12px;
  }
`;

const GridCardName = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 640px) {
    font-size: 13px;
  }
`;

const GridCardCategory = styled.span`
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: #6B7280;
  text-transform: capitalize;
  margin-bottom: 8px;

  @media (max-width: 640px) {
    font-size: 10px;
  }
`;

const GridCardMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const GridMetaBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${props => props.variant === 'success' ? '#ECFDF5' : props.variant === 'value' ? '#FEF3C7' : '#F3F4F6'};
  color: ${props => props.variant === 'success' ? '#059669' : props.variant === 'value' ? '#B45309' : '#4B5563'};
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;

  @media (max-width: 640px) {
    padding: 3px 6px;
    font-size: 9px;
  }
`;

const GridCardBadge = styled.div`
  position: absolute;
  top: 10px;
  ${props => props.position === 'left' ? 'left: 10px;' : 'right: 10px;'}
  padding: 5px 10px;
  background: ${props => {
    if (props.variant === 'match') return 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)';
    if (props.variant === 'micro') return '#10B981';
    if (props.variant === 'new') return '#3B82F6';
    return 'rgba(0,0,0,0.6)';
  }};
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 20px;
  z-index: 3;
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 640px) {
    padding: 4px 8px;
    font-size: 9px;
  }
`;

const GridCardSaved = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F59E0B;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 3;

  @media (max-width: 640px) {
    width: 28px;
    height: 28px;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;

  &::after {
    content: '';
    width: 32px;
    height: 32px;
    border: 3px solid #E5E7EB;
    border-top-color: ${primaryBlue};
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadMoreTrigger = styled.div`
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  max-width: 1200px;
  margin: 0 auto 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }

  @media (max-width: 640px) {
    padding: 10px 12px;
    gap: 8px;
  }
`;

const FilterChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: ${props => props.active ? '#111827' : 'white'};
  color: ${props => props.active ? 'white' : '#374151'};
  border: 1px solid ${props => props.active ? '#111827' : '#E5E7EB'};
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#1F2937' : '#F9FAFB'};
    border-color: ${props => props.active ? '#1F2937' : '#D1D5DB'};
  }

  svg {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 640px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

const ResultsCount = styled.div`
  padding: 0 20px;
  max-width: 1200px;
  margin: 0 auto 12px;
  font-size: 13px;
  color: #6B7280;

  strong {
    color: #111827;
    font-weight: 600;
  }

  @media (max-width: 640px) {
    padding: 0 12px;
    font-size: 12px;
  }
`;

const EndOfResults = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #9CA3AF;
  font-size: 14px;

  .emoji {
    font-size: 32px;
    margin-bottom: 8px;
  }
`;

const PRBrandDiscovery = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState({ currentCount: 0, limit: 3, feature: 'pitches' });
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [pitchesSentThisWeek, setPitchesSentThisWeek] = useState(0);
  const [pitchedBrands, setPitchedBrands] = useState(new Set()); // Track brands already pitched
  const [savedBrands, setSavedBrands] = useState(new Set()); // Track bookmarked brands
  const [seenBrandIds, setSeenBrandIds] = useState(new Set()); // Track all brands shown to avoid duplicates
  const [fetchingMore, setFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Track if more brands available
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [selectedBrandForPitch, setSelectedBrandForPitch] = useState(null);
  // Feature flag for PR Package pivot - set to true to enable new modal
  const [usePRPackageModal] = useState(true);
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);
  const [brandMatchCount, setBrandMatchCount] = useState(0);
  // Kit nudge interstitial state
  const [kitNudgeBrand, setKitNudgeBrand] = useState(null);
  const [showKitNudge, setShowKitNudge] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [mediaKitComplete, setMediaKitComplete] = useState(false);
  const [mediaKitCompleteness, setMediaKitCompleteness] = useState(null);

  // Filter state
  const [activeFilter, setActiveFilter] = useState('all');
  const CATEGORY_FILTERS = ['all', 'beauty', 'skincare', 'fashion', 'wellness', 'lifestyle', 'food', 'fitness'];

  // Universal Brand Discovery state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [discoveryError, setDiscoveryError] = useState(null);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const debounceRef = useRef(null);

  // Infinite scroll refs
  const loadMoreRef = useRef(null);
  const gridRef = useRef(null);

  // Using centralized api client from config/api.js

  // V4: Check if user just completed onboarding (first login experience)
  useEffect(() => {
    const justCompleted = sessionStorage.getItem('justCompletedOnboarding');
    if (justCompleted === 'true') {
      setShowWelcomeCard(true);
      // Clear the flag so it only shows once
      sessionStorage.removeItem('justCompletedOnboarding');
    }
  }, []);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('prOnboardingCompleted');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
    fetchBrands();
    fetchSubscriptionStatus();
    fetchCreatorProfile();
    fetchMediaKitStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // For You → Discover deep-link: ?q=BrandName runs existing discover search
  useEffect(() => {
    const q = searchParams.get('q');
    if (!q || q.trim().length < 2) return;
    const query = q.trim();
    setSearchQuery(query);
    const next = new URLSearchParams(searchParams);
    next.delete('q');
    setSearchParams(next, { replace: true });
    (async () => {
      setSearchLoading(true);
      setSearchMode(true);
      setSearchResult(null);
      setDiscoveryError(null);
      setRateLimitInfo(null);
      try {
        const response = await api.post('/api/pr-crm/brands/discover', { query });
        if (response.data.success) {
          if (response.data.found) {
            setSearchResult({
              brand: response.data.brand,
              source: response.data.source,
              discoveryTier: response.data.discovery_tier,
              verifiedContact: response.data.verified_contact,
              isNewDiscovery: response.data.is_new_discovery,
            });
          } else if (!response.data.can_discover) {
            setRateLimitInfo(response.data.rate_limit);
          } else {
            setDiscoveryError(response.data.message || `We couldn't find "${query}" in our database.`);
          }
        }
      } catch (error) {
        console.error('Error searching brand from For You:', error);
        setDiscoveryError('An error occurred while searching. Please try again.');
      } finally {
        setSearchLoading(false);
      }
    })();
  }, [searchParams, setSearchParams]);

  // Handle brand URL param - opens unlock modal for specified brand slug
  useEffect(() => {
    const brandSlug = searchParams.get('brand');
    if (brandSlug) {
      // Find brand in loaded brands first
      const foundBrand = brands.find(b => b.slug === brandSlug);
      if (foundBrand) {
        setSelectedBrandForPitch(foundBrand);
        setShowPitchModal(true);
        // Clear the URL param
        setSearchParams({});
      } else if (brands.length > 0 || !loading) {
        // Fetch brand by slug if not in loaded brands (but only after initial load)
        const fetchBrandBySlug = async () => {
          try {
            const response = await api.get(`/api/pr-crm/brand/${brandSlug}`);
            if (response.data.success && response.data.brand) {
              const brand = response.data.brand;
              // Parse JSON fields if needed
              const parsedBrand = {
                ...brand,
                regions: typeof brand.regions === 'string' && brand.regions.startsWith('[')
                  ? JSON.parse(brand.regions)
                  : brand.regions,
                niches: typeof brand.niches === 'string' && brand.niches.startsWith('[')
                  ? JSON.parse(brand.niches)
                  : brand.niches,
              };
              setSelectedBrandForPitch(parsedBrand);
              setShowPitchModal(true);
            }
          } catch (error) {
            console.error('Error fetching brand by slug:', error);
          }
          // Clear the URL param regardless
          setSearchParams({});
        };
        fetchBrandBySlug();
      }
    }
  }, [searchParams, brands, loading, setSearchParams]);

  // Fetch creator profile to check kit status
  const fetchCreatorProfile = async () => {
    try {
      const response = await api.get('/profile');
      setCreatorProfile(response.data);
    } catch (error) {
      // Silently fail
    }
  };

  // Fetch media kit completeness status - requires 4 portfolio posts + published
  const fetchMediaKitStatus = async () => {
    try {
      // Fetch portfolio settings and posts count in parallel
      const [portfolioRes, postsRes] = await Promise.all([
        api.get('/api/portfolio/settings'),
        api.get('/api/portfolio/posts')
      ]);

      console.log('[PRBrandDiscovery] Portfolio settings:', portfolioRes.data);
      console.log('[PRBrandDiscovery] Portfolio posts:', postsRes.data);

      const portfolio = portfolioRes.data;
      // API returns array directly, not {posts: [...]}
      const posts = Array.isArray(postsRes.data) ? postsRes.data : [];
      const postCount = posts.length;

      // Simple requirements: 3 posts + published
      const isPublished = portfolio?.kit_published === true;
      const hasEnoughPosts = postCount >= 3;

      console.log('[PRBrandDiscovery] Kit check:', {
        isPublished,
        postCount,
        hasEnoughPosts
      });

      // Kit is complete if published AND has 3+ posts
      const isComplete = isPublished && hasEnoughPosts;

      // Calculate percentage (2 requirements: posts and published)
      const postsProgress = Math.min(postCount, 3); // 0-3
      const publishedProgress = isPublished ? 1 : 0;
      const percentage = Math.round(((postsProgress / 3) * 0.8 + publishedProgress * 0.2) * 100);

      console.log('[PRBrandDiscovery] Completeness result:', { isComplete, postCount, isPublished, percentage });

      setMediaKitComplete(isComplete);
      setMediaKitCompleteness({
        isComplete,
        isPublished,
        hasKit: true,
        postCount,
        percentage,
      });
    } catch (error) {
      console.error('[PRBrandDiscovery] Error fetching media kit:', error);
      setMediaKitComplete(false);
    }
  };

  // Intersection Observer for infinite scroll
  const loadMoreBrands = useCallback(async () => {
    if (fetchingMore || !hasMore || searchMode) return;

    setFetchingMore(true);
    try {
      const excludeArray = Array.from(seenBrandIds);
      const categoryParam = activeFilter !== 'all' ? `&category=${activeFilter}` : '';
      const response = await api.get(`/api/pr-crm/brands?limit=24&exclude_ids=${excludeArray.join(',')}${categoryParam}`);

      if (response.data.success) {
        if (response.data.brands.length === 0) {
          setHasMore(false);
        } else {
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

          // Check if we got fewer brands than requested (end of results)
          if (response.data.brands.length < 24) {
            setHasMore(false);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching more brands:', error);
    } finally {
      setFetchingMore(false);
    }
  }, [fetchingMore, hasMore, seenBrandIds, activeFilter, searchMode]);

  // Set up Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMoreBrands();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadMoreBrands, loading]);

  // Reset when filter changes
  useEffect(() => {
    setBrands([]);
    setSeenBrandIds(new Set());
    setHasMore(true);
    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await api.get('/api/subscription/status');
      setSubscriptionTier(response.data.tier || 'free');
      setPitchesSentThisWeek(response.data.pitches_sent_this_week || 0);

      // Load pitched brands from pipeline
      const pipelineResponse = await api.get('/api/pr-crm/pipeline?stage=pitched');
      if (pipelineResponse.data.success && pipelineResponse.data.pipeline) {
        const pitched = new Set(pipelineResponse.data.pipeline.map(b => b.brand_id || b.id));
        setPitchedBrands(pitched);
      }

      // Load saved brands
      const savedResponse = await api.get('/api/pr-crm/pipeline?stage=saved');
      if (savedResponse.data.success && savedResponse.data.pipeline) {
        const saved = new Set(savedResponse.data.pipeline.map(b => b.brand_id || b.id));
        setSavedBrands(saved);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const fetchBrands = async (excludeIds = [], reset = false) => {
    try {
      setLoading(true);
      // Build query params with exclusions and category filter
      const excludeIdsParam = excludeIds.length > 0 ? `&exclude_ids=${excludeIds.join(',')}` : '';
      const categoryParam = activeFilter !== 'all' ? `&category=${activeFilter}` : '';
      const response = await api.get(`/api/pr-crm/brands?limit=24${excludeIdsParam}${categoryParam}`);

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

        if (reset) {
          setBrands(parsedBrands);
          setSeenBrandIds(new Set(parsedBrands.map(b => b.id)));
        } else {
          setBrands(prev => [...prev, ...parsedBrands]);
          const newSeenIds = new Set([...Array.from(seenBrandIds), ...parsedBrands.map(b => b.id)]);
          setSeenBrandIds(newSeenIds);
        }

        // V4: Set brand match count for welcome card
        setBrandMatchCount(response.data.total_count || parsedBrands.length);

        // Check if we have more to load
        if (parsedBrands.length < 24) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      message.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // AUTOCOMPLETE HANDLERS
  // ============================================

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowAutocomplete(false);
      return;
    }

    try {
      const response = await api.get(`/api/pr-crm/brands/search-suggestions?q=${encodeURIComponent(query)}`);
      if (response.data.success) {
        setSuggestions(response.data.suggestions || []);
        setShowAutocomplete(true);
        setActiveIndex(-1);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  // Handle input change with debounce
  const handleSearchInput = useCallback((value) => {
    setSearchQuery(value);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the API call
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 150);
  }, [fetchSuggestions]);

  // Handle keyboard navigation
  const handleSearchKeyDown = (e) => {
    if (!showAutocomplete || suggestions.length === 0) {
      if (e.key === 'Enter') {
        // Let form submit handle it
        return;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          handleSelectSuggestion(suggestions[activeIndex]);
        } else {
          setShowAutocomplete(false);
          // Let form submit naturally
          handleSearchSubmit(e);
        }
        break;
      case 'Escape':
        setShowAutocomplete(false);
        setActiveIndex(-1);
        break;
      default:
        break;
    }
  };

  // Handle selecting a suggestion
  const handleSelectSuggestion = async (suggestion) => {
    setShowAutocomplete(false);
    setSuggestions([]);
    setSearchQuery(suggestion.name);

    // Find the full brand from existing brands list or fetch it
    const existingBrand = brands.find(b => b.id === suggestion.id);
    if (existingBrand) {
      // Open the pitch modal directly
      setSelectedBrandForPitch(existingBrand);
      setShowPitchModal(true);
    } else {
      // Fetch the brand details and open modal
      try {
        setSearchLoading(true);
        const response = await api.post('/api/pr-crm/brands/discover', {
          query: suggestion.name
        });

        if (response.data.success && response.data.found) {
          setSelectedBrandForPitch(response.data.brand);
          setShowPitchModal(true);
        }
      } catch (error) {
        console.error('Error fetching brand:', error);
        message.error('Failed to load brand details');
      } finally {
        setSearchLoading(false);
      }
    }
  };

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================
  // UNIVERSAL BRAND DISCOVERY HANDLERS
  // ============================================

  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      message.warning('Please enter at least 2 characters');
      return;
    }

    // Close autocomplete
    setShowAutocomplete(false);
    setSuggestions([]);

    setSearchLoading(true);
    setSearchMode(true);
    setSearchResult(null);
    setDiscoveryError(null);
    setRateLimitInfo(null);

    try {
      const response = await api.post('/api/pr-crm/brands/discover', {
        query: searchQuery.trim()
      });

      if (response.data.success) {
        if (response.data.found) {
          // Found a brand
          setSearchResult({
            brand: response.data.brand,
            source: response.data.source,
            discoveryTier: response.data.discovery_tier,
            verifiedContact: response.data.verified_contact,
            isNewDiscovery: response.data.is_new_discovery
          });

          if (response.data.is_new_discovery) {
            message.success(`Found "${response.data.brand.brand_name}" and added to our directory!`);
          }
        } else {
          // Not found
          if (!response.data.can_discover) {
            setRateLimitInfo(response.data.rate_limit);
          } else {
            setDiscoveryError(response.data.message || `We couldn't find "${searchQuery}" in our database.`);
          }
        }
      }
    } catch (error) {
      console.error('Error searching brand:', error);
      setDiscoveryError('An error occurred while searching. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSearchResult = () => {
    if (searchResult?.brand) {
      // Show the discovered brand in pitch modal directly
      setSelectedBrandForPitch(searchResult.brand);
      setShowPitchModal(true);
    }
  };

  const handleBackToFeed = () => {
    setSearchMode(false);
    setSearchQuery('');
    setSearchResult(null);
    setDiscoveryError(null);
    setRateLimitInfo(null);
  };

  // Handle clicking on a brand card in the grid
  const handleBrandClick = (brand) => {
    // Kit nudge AFTER first unlock — never block first aha
    const unlockCount = Number(localStorage.getItem('nc_unlock_count') || '0');
    const hasSeenNudge = localStorage.getItem('nc_kit_nudge_seen');
    const hasKit = creatorProfile?.has_media_kit ||
                   (creatorProfile?.portfolio_post_count && creatorProfile.portfolio_post_count > 0);

    if (!hasKit && !hasSeenNudge && unlockCount >= 1) {
      localStorage.setItem('nc_kit_nudge_seen', 'true');
      setKitNudgeBrand(brand);
      setShowKitNudge(true);
      return;
    }

    // Open the unlock modal
    setSelectedBrandForPitch(brand);
    setShowPitchModal(true);
  };

  // Toggle save/bookmark brand
  const handleToggleSave = async (e, brand) => {
    e.stopPropagation(); // Prevent card click

    if (savedBrands.has(brand.id)) {
      // Remove from saved
      try {
        await api.delete(`/api/pr-crm/pipeline/${brand.id}`);
        setSavedBrands(prev => {
          const newSet = new Set(prev);
          newSet.delete(brand.id);
          return newSet;
        });
        message.success('Removed from saved');
      } catch (error) {
        console.error('Error removing brand:', error);
      }
    } else {
      // Add to saved
      try {
        await api.post('/api/pr-crm/pipeline/save', { brand_id: brand.id });
        setSavedBrands(prev => new Set([...prev, brand.id]));
        setSavedCount(prev => prev + 1);
        message.success(`${brand.brand_name} saved!`);
      } catch (error) {
        console.error('Error saving brand:', error);
        message.error('Failed to save brand');
      }
    }
  };

  const handleKitNudgeSkip = () => {
    setShowKitNudge(false);
    setSelectedBrandForPitch(kitNudgeBrand);
    setShowPitchModal(true);
    setKitNudgeBrand(null);
  };

  const handleKitNudgeBuild = () => {
    setShowKitNudge(false);
    setKitNudgeBrand(null);
    navigate('/creator/dashboard/my-kit');
  };

  // Called when user sends a pitch from the modal
  const handlePitchSent = (brand, context = {}) => {
    if (context?.stayOpen) {
      setPitchedBrands(prev => new Set([...prev, brand.id]));
      return;
    }
    setPitchedBrands(prev => new Set([...prev, brand.id]));
    if (!context?.alreadyRecorded) {
      setPitchesSentThisWeek(prev => prev + 1);
    }
    setShowPitchModal(false);
    if (context?.goPipeline !== false) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Initial loading state - show skeleton grid
  const isInitialLoading = loading && brands.length === 0;

  return (
    <Container>
      <PROnboarding visible={showOnboarding} onClose={() => setShowOnboarding(false)} />

      {/* V4: Welcome card for first-time users + Profile completeness widget */}
      <div style={{ padding: '16px 16px 0', maxWidth: '900px', margin: '0 auto' }}>
        {showWelcomeCard && (
          <WelcomeCard>
            <WelcomeClose onClick={() => setShowWelcomeCard(false)}>
              <FiX size={16} />
            </WelcomeClose>
            <WelcomeGrid>
              <div>
                <WelcomeTag>You're in!</WelcomeTag>
                <WelcomeTitle>Welcome to NewCollab</WelcomeTitle>
                <WelcomeSub>
                  We found <strong>{brandMatchCount}+ brands</strong> that match your niche and are actively working with creators like you.
                </WelcomeSub>
              </div>
              <WelcomeBtn onClick={() => setShowWelcomeCard(false)}>
                Start pitching
              </WelcomeBtn>
            </WelcomeGrid>
          </WelcomeCard>
        )}
        <ProfileCompleteness />

      </div>

      <PageHeader>
        <Title>Brands that send PR to small creators</Title>
        <PlanBadge tier={subscriptionTier}>
          {subscriptionTier === 'elite' && (
            <>
              <FiZap /> Elite (Unlimited)
            </>
          )}
          {subscriptionTier === 'pro' && (
            <>
              <FiZap /> Pro (Unlimited)
            </>
          )}
          {subscriptionTier === 'free' && (
            <>
              <FiSend size={14} /> {5 - pitchesSentThisWeek} free Brand PR unlocks this month
            </>
          )}
        </PlanBadge>
      </PageHeader>

      {/* Universal Brand Discovery Search */}
      <SearchContainer>
        <form onSubmit={handleSearchSubmit}>
          <SearchInputWrapper ref={searchInputRef}>
            <SearchInput
              type="text"
              placeholder="Search any brand — Rhode, e.l.f., Alo, Glossier…"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => searchQuery.length >= 2 && suggestions.length > 0 && setShowAutocomplete(true)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <SearchButton type="submit" disabled={searchLoading || searchQuery.trim().length < 2}>
              {searchLoading ? '...' : '🔍 Search'}
            </SearchButton>

            {/* Autocomplete Dropdown */}
            <AutocompleteDropdown $open={showAutocomplete && searchQuery.length >= 2} ref={autocompleteRef}>
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, idx) => (
                  <AutocompleteItem
                    key={suggestion.id}
                    className={activeIndex === idx ? 'active' : ''}
                    onMouseDown={() => handleSelectSuggestion(suggestion)}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <AutocompleteLogo $hasImage={!!suggestion.logo}>
                      {suggestion.logo ? (
                        <img
                          src={suggestion.logo}
                          alt=""
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.textContent = suggestion.name.charAt(0).toUpperCase();
                          }}
                        />
                      ) : (
                        suggestion.name.charAt(0).toUpperCase()
                      )}
                    </AutocompleteLogo>
                    <AutocompleteInfo>
                      <AutocompleteName>{suggestion.name}</AutocompleteName>
                      <AutocompleteCategory>{suggestion.category || 'Brand'}</AutocompleteCategory>
                    </AutocompleteInfo>
                  </AutocompleteItem>
                ))
              ) : (
                searchQuery.length >= 2 && (
                  <AutocompleteNoMatch>
                    Press "Search" to discover "{searchQuery}"
                  </AutocompleteNoMatch>
                )
              )}
            </AutocompleteDropdown>
          </SearchInputWrapper>
        </form>
      </SearchContainer>

      {/* Search Mode: Show results or fallback */}
      {searchMode && (
        <div style={{ padding: '0 20px', maxWidth: '540px', margin: '0 auto' }}>
          <BackToFeed onClick={handleBackToFeed}>
            ← Back to discovery feed
          </BackToFeed>

          {searchLoading && (
            <DiscoveryFallback>
              <FallbackIcon>🔍</FallbackIcon>
              <FallbackTitle>Searching...</FallbackTitle>
              <FallbackDescription>Looking for "{searchQuery}" in our database</FallbackDescription>
            </DiscoveryFallback>
          )}

          {!searchLoading && searchResult && (
            <SearchResultCard onClick={handleSelectSearchResult}>
              <SearchResultLogo>
                {getBrandLogoUrl(searchResult.brand) ? (
                  <img
                    src={getBrandLogoUrl(searchResult.brand)}
                    alt={searchResult.brand.brand_name}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#6B7280' }}>
                    {searchResult.brand.brand_name?.charAt(0) || '?'}
                  </span>
                )}
              </SearchResultLogo>
              <SearchResultInfo>
                <SearchResultName>{searchResult.brand.brand_name}</SearchResultName>
                <SearchResultMeta>
                  {searchResult.brand.category && <span>{searchResult.brand.category}</span>}
                  {searchResult.source === 'discovered' && (
                    <span style={{ color: primaryBlue }}>✨ Found via search</span>
                  )}
                  {searchResult.source === 'curated' && (
                    <span style={{ color: successGreen }}>✓ Verified directory</span>
                  )}
                </SearchResultMeta>
              </SearchResultInfo>
              <div style={{ color: primaryBlue, fontWeight: '600', fontSize: '14px' }}>
                Pitch →
              </div>
            </SearchResultCard>
          )}

          {!searchLoading && rateLimitInfo && (
            <RateLimitWarning>
              <p>⚠️ {rateLimitInfo.message}</p>
            </RateLimitWarning>
          )}

          {!searchLoading && discoveryError && !rateLimitInfo && (
            <DiscoveryFallback>
              <FallbackIcon>🤔</FallbackIcon>
              <FallbackTitle>Brand not found yet</FallbackTitle>
              <FallbackDescription>
                We couldn't find "{searchQuery}" in our database. We're constantly adding new brands based on creator searches.
              </FallbackDescription>
              <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '16px' }}>
                Try searching for a different brand or browse our curated directory below.
              </p>
            </DiscoveryFallback>
          )}
        </div>
      )}

      {/* Regular Discovery Feed - Infinite Scroll Grid (hidden during search mode) */}
      {!searchMode && (
      <>
        {/* Category Filter Bar */}
        <FilterBar>
          {CATEGORY_FILTERS.map(category => (
            <FilterChip
              key={category}
              active={activeFilter === category}
              onClick={() => setActiveFilter(category)}
            >
              {category === 'all' ? '✨ All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </FilterChip>
          ))}
        </FilterBar>

        {/* Results Count */}
        {brands.length > 0 && (
          <ResultsCount>
            <strong>{brandMatchCount || brands.length}+</strong> brands that work with micro-creators
          </ResultsCount>
        )}

        {/* Initial Loading State */}
        {isInitialLoading && (
          <LoadingSpinner />
        )}

        {/* Brand Grid */}
        <BrandGrid ref={gridRef}>
          <AnimatePresence>
            {brands.map((brand, index) => (
              <GridCard
                key={brand.id}
                onClick={() => handleBrandClick(brand)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.3 }}
                layout
              >
                {/* Badges */}
                {brand.response_rate >= 50 && (
                  <GridCardBadge variant="match" position="left">
                    🔥 {brand.response_rate}% reply
                  </GridCardBadge>
                )}
                {brand.min_followers && brand.min_followers <= 5000 && (
                  <GridCardBadge variant="micro" position="left">
                    Micro-friendly
                  </GridCardBadge>
                )}

                {/* Saved indicator / Save button */}
                {savedBrands.has(brand.id) && (
                  <GridCardSaved onClick={(e) => handleToggleSave(e, brand)}>
                    <FiBookmark size={16} fill="#F59E0B" />
                  </GridCardSaved>
                )}

                {/* Already pitched indicator */}
                {pitchedBrands.has(brand.id) && (
                  <GridCardBadge variant="new" position="right">
                    <FiCheck size={12} /> Opened
                  </GridCardBadge>
                )}

                {/* Cover Image */}
                <GridCardImage>
                  <img
                    src={getBrandCoverImage(brand)}
                    alt={brand.brand_name}
                    loading="lazy"
                  />
                  <GridCardLogo>
                    {getBrandLogoUrl(brand) ? (
                      <img
                        src={getBrandLogoUrl(brand)}
                        alt={`${brand.brand_name} logo`}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <GridCardLogoPlaceholder>
                        {brand.brand_name.charAt(0)}
                      </GridCardLogoPlaceholder>
                    )}
                  </GridCardLogo>
                </GridCardImage>

                {/* Content */}
                <GridCardContent>
                  <GridCardName>{brand.brand_name}</GridCardName>
                  <GridCardCategory>{brand.category || 'Lifestyle'}</GridCardCategory>

                  <GridCardMeta>
                    {brand.response_rate && brand.response_rate >= 30 && (
                      <GridMetaBadge variant="success">
                        ⚡ {brand.response_rate}% reply
                      </GridMetaBadge>
                    )}
                    {(brand.avg_product_value || brand.estimated_value) && (
                      <GridMetaBadge variant="value">
                        💝 ~${brand.avg_product_value || brand.estimated_value}
                      </GridMetaBadge>
                    )}
                    {brand.collaboration_type && (
                      <GridMetaBadge>
                        {brand.collaboration_type === 'gifted' ? '🎁' : '💵'} {brand.collaboration_type}
                      </GridMetaBadge>
                    )}
                  </GridCardMeta>
                </GridCardContent>
              </GridCard>
            ))}
          </AnimatePresence>
        </BrandGrid>

        {/* Loading state */}
        {(loading || fetchingMore) && (
          <LoadingSpinner />
        )}

        {/* Load more trigger for infinite scroll */}
        {!loading && hasMore && (
          <LoadMoreTrigger ref={loadMoreRef}>
            {fetchingMore && <LoadingSpinner />}
          </LoadMoreTrigger>
        )}

        {/* End of results */}
        {!loading && !hasMore && brands.length > 0 && (
          <EndOfResults>
            <div className="emoji">🎉</div>
            You've seen all {brands.length} brands! Check back soon for new additions.
          </EndOfResults>
        )}

        {/* Empty state */}
        {!loading && brands.length === 0 && (
          <EmptyState>
            <div className="emoji">🔍</div>
            <h3>No brands found</h3>
            <p>Try a different category or search for a specific brand.</p>
          </EmptyState>
        )}
      </>
      )}

      {/* Pitch Modal - V2 (verdict-first), PR Package, or legacy AI Pitch */}
      {USE_UNLOCK_V2 ? (
        <UnlockModalV2
          isOpen={showPitchModal}
          onClose={() => {
            fetchSubscriptionStatus();
            setShowPitchModal(false);
          }}
          brand={selectedBrandForPitch}
          onPitchSent={handlePitchSent}
          isPro={subscriptionTier === 'pro' || subscriptionTier === 'elite'}
          onOpenOpportunities={() => {
            sessionStorage.setItem('foryouForceOpportunities', '1');
            sessionStorage.setItem('foryouTabPicked', '1');
            setShowPitchModal(false);
            window.location.href = '/creator/dashboard/for-you';
          }}
          onUpgrade={() => {
            setUpgradeInfo({ currentCount: 3, limit: 3, feature: 'unlocks' });
            setShowUpgradeModal(true);
          }}
        />
      ) : usePRPackageModal ? (
        <PRPackageModal
          isOpen={showPitchModal}
          onClose={() => {
            // Refresh subscription status when modal closes (unlock happens on package generation)
            fetchSubscriptionStatus();
            setShowPitchModal(false);
          }}
          brand={selectedBrandForPitch}
          onPitchSent={handlePitchSent}
          isPro={subscriptionTier === 'pro' || subscriptionTier === 'elite'}
        />
      ) : (
        <AIPitchModal
          isOpen={showPitchModal}
          onClose={() => setShowPitchModal(false)}
          brand={selectedBrandForPitch}
          onPitchSent={handlePitchSent}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentCount={upgradeInfo.currentCount}
        limit={upgradeInfo.limit}
        feature={upgradeInfo.feature}
      />

      {/* Kit Nudge Interstitial */}
      <AnimatePresence>
        {showKitNudge && (
          <KitNudgeOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleKitNudgeSkip}
          >
            <KitNudgeCard
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <KitNudgeStat>3×</KitNudgeStat>
              <KitNudgeTitle>
                Pitches with a media kit get 3x more replies
              </KitNudgeTitle>
              <KitNudgeSub>
                Build yours in 2 minutes before pitching{' '}
                {kitNudgeBrand?.brand_name || 'this brand'}.
              </KitNudgeSub>
              <KitNudgePrimary onClick={handleKitNudgeBuild}>
                Build my kit
              </KitNudgePrimary>
              <KitNudgeSecondary onClick={handleKitNudgeSkip}>
                Pitch without kit
              </KitNudgeSecondary>
            </KitNudgeCard>
          </KitNudgeOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
};

// Kit nudge interstitial styled components
const KitNudgeOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
  padding: 0 0 env(safe-area-inset-bottom);

  @media (min-width: 600px) {
    align-items: center;
  }
`;

const KitNudgeCard = styled(motion.div)`
  background: white;
  border-radius: 24px 24px 0 0;
  padding: 32px 24px 40px;
  width: 100%;
  max-width: 480px;
  text-align: center;

  @media (min-width: 600px) {
    border-radius: 24px;
    padding: 40px 32px;
  }
`;

const KitNudgeStat = styled.div`
  font-size: 48px;
  font-weight: 800;
  color: #0F0F0F;
  line-height: 1;
  margin-bottom: 12px;
`;

const KitNudgeTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #0F0F0F;
  margin: 0 0 8px;
  line-height: 1.3;
`;

const KitNudgeSub = styled.p`
  font-size: 14px;
  color: #6B7280;
  margin: 0 0 28px;
  line-height: 1.5;
`;

const KitNudgePrimary = styled.button`
  width: 100%;
  padding: 16px;
  background: #0F0F0F;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;
  transition: opacity 0.2s;
  &:hover { opacity: 0.85; }
`;

const KitNudgeSecondary = styled.button`
  width: 100%;
  padding: 14px;
  background: none;
  color: #6B7280;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
  &:hover { color: #0F0F0F; }
`;

export default PRBrandDiscovery;
