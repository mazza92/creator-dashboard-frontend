import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { FaBaby, FaGraduationCap, FaBriefcase, FaUserTie, FaGamepad, FaRunning, FaTshirt, FaLaptop, FaUtensils, FaPlane, FaDog, FaTools, FaMusic, FaBook, FaLeaf, FaGem, FaShoppingCart, FaInstagram, FaYoutube, FaTwitter, FaFacebook, FaCamera, FaVideo, FaMicrophone, FaBookOpen, FaTiktok, FaSnapchat, FaLinkedin, FaPinterest, FaTwitch, FaHeartbeat, FaHome, FaPaw, FaTv, FaFutbol, FaPaintBrush, FaUserFriends, FaChartLine, FaCar, FaLink, FaFacebookF, FaWhatsapp, FaLinkedinIn, FaGift } from 'react-icons/fa';
import { GiLipstick } from 'react-icons/gi';
import { Helmet } from 'react-helmet-async';
import { FiVideo, FiCamera, FiFilm, FiImage } from 'react-icons/fi';
import { MdOutlineLiveTv, MdOutlineAudiotrack } from 'react-icons/md';
import PROfferForm from './PROfferForm';
import LandingPageLayout from '../Layouts/LandingPageLayout';

// Platform icon components using React Icons for reliable display
const getPlatformIconComponent = (platform) => {
  if (!platform) return <FaLink style={{ color: BRAND_COLOR, fontSize: 24 }} />;
  
  const platformLower = platform.toLowerCase();
  const iconStyle = { fontSize: 24, color: BRAND_COLOR };
  
  if (platformLower.includes('instagram')) {
    return <FaInstagram style={{ ...iconStyle, color: '#E1306C' }} />;
  } else if (platformLower.includes('youtube')) {
    return <FaYoutube style={{ ...iconStyle, color: '#FF0000' }} />;
  } else if (platformLower.includes('tiktok')) {
    return <FaTiktok style={{ ...iconStyle, color: '#000000' }} />;
  } else if (platformLower.includes('facebook')) {
    return <FaFacebook style={{ ...iconStyle, color: '#1877F2' }} />;
  } else if (platformLower.includes('twitter') || platformLower.includes('x')) {
    return <FaTwitter style={{ ...iconStyle, color: '#1DA1F2' }} />;
  } else if (platformLower.includes('linkedin')) {
    return <FaLinkedin style={{ ...iconStyle, color: '#0A66C2' }} />;
  } else if (platformLower.includes('snapchat')) {
    return <FaSnapchat style={{ ...iconStyle, color: '#FFFC00' }} />;
  } else if (platformLower.includes('pinterest')) {
    return <FaPinterest style={{ ...iconStyle, color: '#BD081C' }} />;
  } else if (platformLower.includes('twitch')) {
    return <FaTwitch style={{ ...iconStyle, color: '#9146FF' }} />;
  } else {
    return <FaLink style={{ ...iconStyle }} />;
  }
};

const BRAND_COLOR = '#10b981'; // Updated to use the requested green
const BG_COLOR = '#F9FAFB';
const TEXT_COLOR = '#1F2937';
const SUBTLE_TEXT = '#6B7280';

// Icon maps for audience and topics (copy from SponsorOffers.js)
const audienceIcons = {
  "Gen Z (18-24)": <FaBaby style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Millennials (25-34)": <FaUserTie style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Gen X (35-54)": <FaBriefcase style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Boomers (55+)": <FaGraduationCap style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Families": <FaBaby style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Professionals": <FaUserTie style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Students": <FaGraduationCap style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Gamers": <FaGamepad style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Fitness Enthusiasts": <FaRunning style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Fashion Lovers": <FaTshirt style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Tech Enthusiasts": <FaLaptop style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Foodies": <FaUtensils style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Travelers": <FaPlane style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Beauty Enthusiasts": <GiLipstick style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Parents": <FaBaby style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Pet Owners": <FaDog style={{ fontSize: '16px', color: '#26A69A' }} />,
  "DIY Enthusiasts": <FaTools style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Music Lovers": <FaMusic style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Book Readers": <FaBook style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Eco-Conscious": <FaLeaf style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Luxury Buyers": <FaGem style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Budget Shoppers": <FaShoppingCart style={{ fontSize: '16px', color: '#26A69A' }} />,
};

const topicIcons = {
  "Fashion": <FaTshirt style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Beauty": <GiLipstick style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Fitness": <FaRunning style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Gaming": <FaGamepad style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Travel": <FaPlane style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Food & Drink": <FaUtensils style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Technology": <FaLaptop style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Lifestyle": <FaUserFriends style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Education": <FaGraduationCap style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Entertainment": <FaChartLine style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Health & Wellness": <FaHeartbeat style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "DIY & Crafts": <FaTools style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Parenting": <FaBaby style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Sustainability": <FaLeaf style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Business & Finance": <FaBriefcase style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Automotive": <FaCar style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Home & Garden": <FaHome style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Pets": <FaPaw style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Music": <FaMusic style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Books & Literature": <FaBook style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Movies & TV": <FaTv style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Sports": <FaFutbol style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Photography": <FaCamera style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Art & Design": <FaPaintBrush style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Science": <FaChartLine style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "News & Politics": <FaChartLine style={{ fontSize: '16px', color: '#7c3aed' }} />,
  "Humor & Memes": <FaChartLine style={{ fontSize: '16px', color: '#7c3aed' }} />,
};

// Helper to get ad slot currency (defaults to EUR)
function getSlotCurrency(slot) {
  if (!slot || !slot.currency) return 'EUR';
  const currency = slot.currency.toString().trim().toUpperCase();
  // Validate it's a supported currency
  const supported = ['EUR', 'USD', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK'];
  return supported.includes(currency) ? currency : 'EUR';
}

// Helper to format price - now uses currency utility
function formatPrice(price, currency = null) {
  const { formatPrice: formatPriceUtil } = require('../utils/currency');
  return formatPriceUtil(price, currency);
}

// Helper to get content format badge with modern styling
function getContentFormatBadge(format) {
  if (!format) format = 'Post';
  const f = format.toLowerCase();
  
  // Define format styles following modern app design patterns
  const formatStyles = {
    'reels': {
      label: 'Reels',
      icon: <FiVideo style={{ fontSize: 14 }} />,
      bgColor: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)', // Instagram Reels gradient
      textColor: '#fff',
      borderColor: 'transparent'
    },
    'reel': {
      label: 'Reels',
      icon: <FiVideo style={{ fontSize: 14 }} />,
      bgColor: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)',
      textColor: '#fff',
      borderColor: 'transparent'
    },
    'video': {
      label: 'Video',
      icon: <FiVideo style={{ fontSize: 14 }} />,
      bgColor: '#f0f9ff',
      textColor: '#0369a1',
      borderColor: '#bae6fd'
    },
    'stories': {
      label: 'Stories',
      icon: <FiCamera style={{ fontSize: 14 }} />,
      bgColor: 'linear-gradient(135deg, #833AB4 0%, #E1306C 100%)', // Instagram Stories gradient
      textColor: '#fff',
      borderColor: 'transparent'
    },
    'story': {
      label: 'Stories',
      icon: <FiCamera style={{ fontSize: 14 }} />,
      bgColor: 'linear-gradient(135deg, #833AB4 0%, #E1306C 100%)',
      textColor: '#fff',
      borderColor: 'transparent'
    },
    'live': {
      label: 'Live',
      icon: <MdOutlineLiveTv style={{ fontSize: 14 }} />,
      bgColor: '#fee2e2',
      textColor: '#dc2626',
      borderColor: '#fecaca',
      pulse: true // Add pulse animation for live
    },
    'short': {
      label: 'Shorts',
      icon: <FiFilm style={{ fontSize: 14 }} />,
      bgColor: '#fef3c7',
      textColor: '#d97706',
      borderColor: '#fde68a'
    },
    'shorts': {
      label: 'Shorts',
      icon: <FiFilm style={{ fontSize: 14 }} />,
      bgColor: '#fef3c7',
      textColor: '#d97706',
      borderColor: '#fde68a'
    },
    'podcast': {
      label: 'Podcast',
      icon: <MdOutlineAudiotrack style={{ fontSize: 14 }} />,
      bgColor: '#e0e7ff',
      textColor: '#4338ca',
      borderColor: '#c7d2fe'
    },
    'audio': {
      label: 'Audio',
      icon: <MdOutlineAudiotrack style={{ fontSize: 14 }} />,
      bgColor: '#e0e7ff',
      textColor: '#4338ca',
      borderColor: '#c7d2fe'
    },
    'post': {
      label: 'Post',
      icon: <FiImage style={{ fontSize: 14 }} />,
      bgColor: '#f0fdf4',
      textColor: '#166534',
      borderColor: '#bbf7d0'
    },
    'static': {
      label: 'Post',
      icon: <FiImage style={{ fontSize: 14 }} />,
      bgColor: '#f0fdf4',
      textColor: '#166534',
      borderColor: '#bbf7d0'
    }
  };
  
  // Find matching format
  let style = formatStyles['post']; // default
  for (const [key, value] of Object.entries(formatStyles)) {
    if (f.includes(key)) {
      style = value;
      break;
    }
  }
  
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        borderRadius: 12,
        background: style.bgColor,
        color: style.textColor,
        border: `1px solid ${style.borderColor}`,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.2,
        textTransform: 'capitalize',
        boxShadow: style.pulse ? '0 0 8px rgba(220, 38, 38, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
        animation: style.pulse ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center' }}>{style.icon}</span>
      <span>{style.label}</span>
    </div>
  );
}

const fadeInStyle = `
  @keyframes fadeIn { 
    from { opacity: 0; transform: translateY(-4px);} 
    to { opacity: 1; transform: translateY(0);} 
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const COVER_GRADIENT = 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)';
const COVER_HEIGHT = 180;

const PublicCreatorProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmounts, setBidAmounts] = useState({});
  const [expandedDescriptions, setExpandedDescriptions] = useState({}); // for project descriptions
  const [copied, setCopied] = useState(false); // for share copy link feedback
  const [bidErrors, setBidErrors] = useState({}); // Track errors for each bid input
  const [showPROfferForm, setShowPROfferForm] = useState(false);

  // No longer hiding header - we want navigation available

  useEffect(() => {
    setLoading(true);
    console.log('🔍 [PublicCreatorProfile] Fetching profile for', username);
    const apiBase = process.env.REACT_APP_API_URL || '';
    fetch(`${apiBase}/c/${username}`)
      .then(res => {
        if (!res.ok) throw new Error('Profile not found');
        return res.json();
      })
      .then(data => {
        console.log('🔍 [PublicCreatorProfile] Received data:', data);
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ [PublicCreatorProfile] Fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  const handleBidChange = (id, value) => {
    setBidAmounts(bids => ({ ...bids, [id]: value.replace(/[^0-9.]/g, '') }));
    setBidErrors(errors => ({ ...errors, [id]: undefined })); // Clear error on change
  };

  const handleSubmitBid = (projectId) => {
    const slot = profile.projects.find(p => p.id === projectId);
    const bidValue = parseFloat(bidAmounts[projectId]);
    if (isNaN(bidValue) || bidValue < slot.starting_bid) {
      setBidErrors(errors => ({ ...errors, [projectId]: 'Your offer must be equal or above starting bid price' }));
      return;
    }
    // For MVP, always redirect to main registration page
    navigate(`/register`);
  };

  // Transform social_links object to array if needed
  let socialLinksArr = [];
  if (profile && profile.social_links) {
    if (Array.isArray(profile.social_links)) {
      socialLinksArr = profile.social_links;
    } else if (typeof profile.social_links === 'object' && profile.social_links !== null) {
      socialLinksArr = Object.entries(profile.social_links).map(([platform, url]) => ({
        platform,
        url,
      }));
    }
  }
  // Debug: log social_links and computed array
  console.log('profile.social_links:', profile && profile.social_links);
  console.log('socialLinksArr:', socialLinksArr);

  if (error) return (
    <div style={{ textAlign: 'center', marginTop: 64, color: TEXT_COLOR }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>
        {/* Broken link/ghost SVG illustration */}
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
          <circle cx="40" cy="40" r="40" fill="#F3F4F6"/>
          <path d="M28 52c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="32" cy="36" r="3" fill="#D1D5DB"/>
          <circle cx="48" cy="36" r="3" fill="#D1D5DB"/>
        </svg>
      </div>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Profile Not Found</div>
      <div style={{ color: SUBTLE_TEXT, fontSize: 16, marginBottom: 24 }}>
        Sorry, this creator profile doesn't exist or is no longer public.
      </div>
      <button
        onClick={() => navigate('/')}
        style={{
          background: BRAND_COLOR,
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '10px 22px',
          fontWeight: 700,
          fontSize: 16,
          cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(16,185,129,0.10)',
        }}
      >
        Back to Home
      </button>
    </div>
  );
  if (!profile) return null;

  // Share URL
  const shareUrl = `https://newcollab.co/c/${profile.username}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const shareButtons = [
    {
      icon: <FaLink size={18} />, label: copied ? 'Copied!' : 'Copy Link', onClick: handleCopy, color: '#10b981',
    },
    {
      icon: <FaTwitter size={18} />, label: 'X', onClick: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check%20out%20this%20creator%20on%20Newcollab!`, '_blank'), color: '#1da1f2',
    },
    {
      icon: <FaFacebookF size={18} />, label: 'Facebook', onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank'), color: '#1877f3',
    },
    {
      icon: <FaWhatsapp size={18} />, label: 'WhatsApp', onClick: () => window.open(`https://wa.me/?text=Check%20out%20this%20creator%20on%20Newcollab!%20${encodeURIComponent(shareUrl)}`, '_blank'), color: '#25d366',
    },
    {
      icon: <FaLinkedinIn size={18} />, label: 'LinkedIn', onClick: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank'), color: '#0a66c2',
    },
  ];

  // Dynamic SEO & Social Meta Tags
  const metaTitle = `@${profile.username} | Creator Profile on Newcollab`;
  const metaDescription = profile.bio || 'Discover this creator on Newcollab.';
  const metaImage = profile.image_profile || 'https://newcollab.co/og-image.png';
  const metaUrl = `https://newcollab.co/c/${profile.username}`;

  return (
    <LandingPageLayout>
      <div style={{ background: BG_COLOR, minHeight: '100vh', padding: 0 }}>
        <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:url" content={metaUrl} />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />
      </Helmet>
      <style>{fadeInStyle}</style>
      {/* Modern Cover Section */}
      <div
        style={{
          width: '100%',
          height: COVER_HEIGHT,
          background: COVER_GRADIENT,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        {/* Avatar Overlapping Cover */}
        {profile && (
          <img
            src={profile.image_profile}
            alt={profile.username}
            style={{
              width: 112,
              height: 112,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid #fff',
              boxShadow: '0 4px 24px rgba(16,185,129,0.18)',
              position: 'absolute',
              left: '50%',
              bottom: -56,
              transform: 'translateX(-50%)',
              background: '#fff',
              zIndex: 2,
            }}
          />
        )}
      </div>
      <div
        className="public-profile-container"
        style={{
          maxWidth: 680,
          margin: '0 auto',
          padding: '72px 16px 32px 16px', // add horizontal padding for small screens
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        {/* Profile Header with Social Proof */}
        {profile && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8, marginBottom: 16 }}>
            {/* Avatar moved to cover section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 22, color: TEXT_COLOR, textAlign: 'center' }}>@{profile.username}</div>
              {/* Verified badge placeholder - can be added when verified status is available */}
            </div>
            
            {/* Social Proof Stats */}
            {profile.followers_count && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 16, 
                marginBottom: 8,
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: TEXT_COLOR }}>
                    {profile.followers_count >= 1000 
                      ? `${(profile.followers_count / 1000).toFixed(profile.followers_count >= 1000000 ? 1 : 0)}${profile.followers_count >= 1000000 ? 'M' : 'K'}`
                      : profile.followers_count.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: SUBTLE_TEXT, fontWeight: 500 }}>Followers</div>
                </div>
                {profile.projects && profile.projects.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: TEXT_COLOR }}>
                      {profile.projects.length}
                    </div>
                    <div style={{ fontSize: 12, color: SUBTLE_TEXT, fontWeight: 500 }}>Open Slots</div>
                  </div>
                )}
              </div>
            )}
            {/* Social Links Row */}
            {socialLinksArr.length > 0 && (
              <div style={{ display: 'flex', gap: 16, margin: '6px 0 6px 0', justifyContent: 'center', alignItems: 'center' }}>
                {socialLinksArr.map((link, idx) => {
                  // Normalize platform name for icon lookup
                  let platformKey = link.platform;
                  if (platformKey) {
                    platformKey = platformKey.trim().toLowerCase();
                  }
                  
                  // Get icon component for social link
                  const getSocialIcon = (platform) => {
                    if (!platform) return <FaLink style={{ color: BRAND_COLOR, fontSize: 18 }} />;
                    const platformLower = platform.toLowerCase();
                    if (platformLower.includes('instagram')) {
                      return <FaInstagram style={{ color: '#E1306C', fontSize: 18 }} />;
                    } else if (platformLower.includes('youtube')) {
                      return <FaYoutube style={{ color: '#FF0000', fontSize: 18 }} />;
                    } else if (platformLower.includes('tiktok')) {
                      return <FaTiktok style={{ color: '#000000', fontSize: 18 }} />;
                    } else if (platformLower.includes('facebook')) {
                      return <FaFacebook style={{ color: '#1877F2', fontSize: 18 }} />;
                    } else if (platformLower.includes('twitter') || platformLower.includes('x')) {
                      return <FaTwitter style={{ color: '#1DA1F2', fontSize: 18 }} />;
                    } else if (platformLower.includes('linkedin')) {
                      return <FaLinkedin style={{ color: '#0A66C2', fontSize: 18 }} />;
                    } else if (platformLower.includes('snapchat')) {
                      return <FaSnapchat style={{ color: '#FFFC00', fontSize: 18 }} />;
                    } else if (platformLower.includes('pinterest')) {
                      return <FaPinterest style={{ color: '#BD081C', fontSize: 18 }} />;
                    } else if (platformLower.includes('twitch')) {
                      return <FaTwitch style={{ color: '#9146FF', fontSize: 18 }} />;
                    } else {
                      return <FaLink style={{ color: BRAND_COLOR, fontSize: 18 }} />;
                    }
                  };
                  
                  // Normalize URL to ensure it has a protocol
                  const normalizedUrl = link.url && !link.url.startsWith('http://') && !link.url.startsWith('https://') 
                    ? `https://${link.url}` 
                    : link.url;
                  return (
                    <a
                      key={idx}
                      href={normalizedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={platformKey || 'Social Link'}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1.5px solid #e5e7eb', width: 32, height: 32, padding: 0, transition: 'border 0.2s', textDecoration: 'none' }}
                    >
                      {getSocialIcon(platformKey)}
                    </a>
                  );
                })}
              </div>
            )}
            <div style={{ fontSize: 15, color: SUBTLE_TEXT, textAlign: 'center', maxWidth: 400, marginBottom: 12, lineHeight: 1.5 }}>
              {profile.bio}
            </div>
            
            {/* Trust Signal - Quick Stats */}
            <div style={{
              display: 'flex',
              gap: 12,
              marginTop: 8,
              marginBottom: 4,
              flexWrap: 'wrap',
              justifyContent: 'center',
              fontSize: 13,
              color: SUBTLE_TEXT
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: BRAND_COLOR }}>✓</span> Verified Creator
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: BRAND_COLOR }}>✓</span> Trusted by Brands
              </span>
            </div>
          </div>
        )}
        
        {/* Heading */}
        <h3 style={{ textAlign: 'center', fontWeight: 700, fontSize: 20, color: TEXT_COLOR, margin: '0 0 16px 0' }}>
          Available Sponsorship Opportunities
        </h3>
        
        {/* Main PR Package CTA */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <button
            onClick={() => setShowPROfferForm(true)}
            style={{
              background: BRAND_COLOR,
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 28px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#059669';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(16,185,129,0.35)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = BRAND_COLOR;
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(16,185,129,0.25)';
            }}
          >
            <FaGift style={{ fontSize: 18 }} />
            Propose PR Package
          </button>
        </div>
        
        {/* Project List */}
        {profile.projects.length === 0 ? (
          <div style={{ textAlign: 'center', color: SUBTLE_TEXT, fontSize: 16, marginTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>
              {/* Handshake emoji as illustration */}
              <span role="img" aria-label="Handshake">🤝</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, color: TEXT_COLOR, marginBottom: 6 }}>No Open Sponsorships</div>
            <div style={{ color: SUBTLE_TEXT, fontSize: 15, maxWidth: 320 }}>
              This creator currently has no open sponsorship opportunities.<br />
              Please check back soon or explore other creators on Newcollab!
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {profile.projects.map((slot) => (
              <div
                key={slot.id}
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 16,
                }}
              >
                {/* Platform Icon/Thumbnail */}
                <div style={{ minWidth: 48, minHeight: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 8, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb'
                  }}>
                    {getPlatformIconComponent(slot.platforms && slot.platforms[0])}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                    {getContentFormatBadge(slot.content_format)}
                  </div>
                </div>
                {/* Card Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, color: TEXT_COLOR, marginBottom: 2 }}>
                    {slot.title && slot.title.length > 100 && !expandedDescriptions[slot.id] ? (
                      <>
                        {slot.title.slice(0, 100)}...{' '}
                        <span
                          style={{ color: BRAND_COLOR, cursor: 'pointer', fontWeight: 600 }}
                          onClick={() => setExpandedDescriptions(descs => ({ ...descs, [slot.id]: true }))}
                          role="button"
                          tabIndex={0}
                          onKeyPress={e => { if (e.key === 'Enter') setExpandedDescriptions(descs => ({ ...descs, [slot.id]: true })); }}
                        >
                          Show more
                        </span>
                      </>
                    ) : slot.title && slot.title.length > 100 && expandedDescriptions[slot.id] ? (
                      <>
                        {slot.title}{' '}
                        <span
                          style={{ color: BRAND_COLOR, cursor: 'pointer', fontWeight: 600 }}
                          onClick={() => setExpandedDescriptions(descs => ({ ...descs, [slot.id]: false }))}
                          role="button"
                          tabIndex={0}
                          onKeyPress={e => { if (e.key === 'Enter') setExpandedDescriptions(descs => ({ ...descs, [slot.id]: false })); }}
                        >
                          Show less
                        </span>
                      </>
                    ) : (
                      slot.title
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: SUBTLE_TEXT, marginBottom: 2 }}>
                    On {slot.platforms && slot.platforms[0]}
                  </div>
                  <div style={{ fontSize: 15, color: TEXT_COLOR, fontWeight: 500, marginBottom: 6 }}>
                    Bid starts at <span style={{ color: BRAND_COLOR, fontWeight: 700 }}>{formatPrice(slot.starting_bid, getSlotCurrency(slot))}</span>
                  </div>
                  {/* Additional Details */}
                  {slot.projected_views && (
                    <div style={{ fontSize: 13, color: SUBTLE_TEXT, marginBottom: 2 }}>
                      <span style={{ fontWeight: 500 }}>Projected Views:</span> {slot.projected_views}
                    </div>
                  )}
                  {slot.audience_targets && slot.audience_targets.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 2 }}>
                      {slot.audience_targets.map((aud, idx) => (
                        <span key={idx} style={{
                          background: '#f0fdfa',
                          color: '#0891b2',
                          borderRadius: 12,
                          padding: '4px 12px',
                          fontSize: 13,
                          fontWeight: 500,
                          marginRight: 2,
                          marginBottom: 2,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}>
                          {audienceIcons[aud] && <span style={{ marginRight: 4 }}>{audienceIcons[aud]}</span>}
                          {aud}
                        </span>
                      ))}
                    </div>
                  )}
                  {slot.topics && slot.topics.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 2 }}>
                      {slot.topics.map((topic, idx) => (
                        <span key={idx} style={{
                          background: '#f3e8ff',
                          color: '#7c3aed',
                          borderRadius: 12,
                          padding: '4px 12px',
                          fontSize: 13,
                          fontWeight: 500,
                          marginRight: 2,
                          marginBottom: 2,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}>
                          {topicIcons[topic] && <span style={{ marginRight: 4 }}>{topicIcons[topic]}</span>}
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                    {/* Bid Input and CTA */}
                    <form
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 8,
                        alignItems: 'center',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                      onSubmit={e => { e.preventDefault(); handleSubmitBid(slot.id); }}
                    >
                      <label htmlFor={`bid-input-${slot.id}`} style={{ display: 'none' }}>
                        Bid Amount for {slot.title}
                      </label>
                      <div style={{ position: 'relative', flex: '1 1 0', minWidth: 0 }}>
                        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: SUBTLE_TEXT, fontWeight: 600, fontSize: 15, zIndex: 1 }}>{require('../utils/currency').getCurrencySymbol(getSlotCurrency(slot))}</span>
                        <input
                          id={`bid-input-${slot.id}`}
                          type="number"
                          inputMode="decimal"
                          pattern="[0-9.]*"
                          value={bidAmounts[slot.id] || ''}
                          onChange={e => handleBidChange(slot.id, e.target.value)}
                          placeholder={slot.starting_bid}
                          style={{
                            padding: '8px 8px 8px 40px',
                            border: `1.5px solid ${bidErrors[slot.id] ? '#ef4444' : '#e5e7eb'}`,
                            borderRadius: 8,
                            fontSize: 15,
                            outline: 'none',
                            color: TEXT_COLOR,
                            background: '#f9fafb',
                            transition: 'border 0.2s',
                            boxShadow: bidErrors[slot.id] ? '0 0 0 2px #fee2e2' : undefined,
                            minWidth: 0,
                            marginRight: 0,
                            display: 'block',
                            width: '100%',
                            boxSizing: 'border-box',
                          }}
                          aria-label={`Bid Amount for ${slot.title}`}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!!bidErrors[slot.id] || !bidAmounts[slot.id]}
                        style={{
                          background: (!!bidErrors[slot.id] || !bidAmounts[slot.id]) ? '#d1fae5' : BRAND_COLOR,
                          color: (!!bidErrors[slot.id] || !bidAmounts[slot.id]) ? '#6b7280' : '#fff',
                          cursor: (!!bidErrors[slot.id] || !bidAmounts[slot.id]) ? 'not-allowed' : 'pointer',
                          border: 'none',
                          borderRadius: 8,
                          padding: '10px 18px',
                          fontWeight: 700,
                          fontSize: 15,
                          width: 120,
                          minWidth: 100,
                          maxWidth: 140,
                          boxShadow: '0 1px 4px rgba(16,185,129,0.12)',
                          transition: 'background 0.2s',
                          letterSpacing: 0.2,
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          alignSelf: 'stretch',
                          boxSizing: 'border-box',
                        }}
                      >
                        Submit Bid
                      </button>
                    </form>
                  </div>
                  {bidErrors[slot.id] && (
                    <div
                      style={{
                        background: '#fff6f6',
                        color: '#e11d48',
                        fontSize: 13,
                        marginTop: 6,
                        marginLeft: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        borderRadius: 8,
                        padding: '7px 14px',
                        fontWeight: 500,
                        boxShadow: '0 1px 4px rgba(239,68,68,0.06)',
                        border: '1px solid #fecaca',
                        minHeight: 28,
                        minWidth: 120,
                        maxWidth: 320,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ marginRight: 4 }}>
                        <circle cx="10" cy="10" r="10" fill="#fca5a5"/>
                        <path d="M10 5v5" stroke="#e11d48" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="10" cy="13.5" r="1" fill="#e11d48"/>
                      </svg>
                      {bidErrors[slot.id]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Creator CTA Section */}
        {profile.projects && profile.projects.length > 0 && (
          <div style={{ 
            width: '100%', 
            maxWidth: 420, 
            marginTop: 32, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 12,
            alignItems: 'stretch'
          }}>
            <a
              href="/register?type=creator"
              style={{
                display: 'block',
                background: '#fff',
                color: BRAND_COLOR,
                borderRadius: 12,
                padding: '12px 24px',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                border: `2px solid ${BRAND_COLOR}`,
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0fdf4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Are you a creator? Get Your Profile
            </a>
            <div style={{ 
              textAlign: 'center', 
              fontSize: 11, 
              color: SUBTLE_TEXT, 
              marginTop: 6,
              lineHeight: 1.4
            }}>
              Join 10,000+ creators earning with brands
            </div>
          </div>
        )}
        {/* Enhanced Share Section */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '48px 0 0 0' }}>
          <div style={{ 
            color: TEXT_COLOR, 
            fontSize: 16, 
            marginBottom: 12, 
            fontWeight: 600, 
            letterSpacing: 0.1 
          }}>
            Share this profile
          </div>
          <div style={{ 
            fontSize: 12, 
            color: SUBTLE_TEXT, 
            marginBottom: 16,
            textAlign: 'center',
            maxWidth: 300
          }}>
            Help @{profile?.username || 'this creator'} get discovered by more brands
          </div>
          <div style={{ display: 'flex', gap: 14, margin: '0 0 0 0', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            {shareButtons.map((btn, i) => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: '#fff', border: `1.5px solid ${btn.color}`, color: btn.color, borderRadius: 8,
                  padding: '7px 13px', fontWeight: 600, fontSize: 14, cursor: 'pointer', minWidth: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'background 0.2s',
                }}
                aria-label={btn.label}
              >
                {btn.icon} {btn.label}
              </button>
            ))}
          </div>
        </div>
        {/* Footer */}
        <footer style={{ marginTop: 48, textAlign: 'center', color: SUBTLE_TEXT, fontSize: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div>
            Powered by{' '}
            <a href="https://newcollab.co" target="_blank" rel="noopener noreferrer" style={{ color: BRAND_COLOR, fontWeight: 600, textDecoration: 'none' }}>
              Newcollab
            </a>
          </div>
          <div style={{ marginTop: 2, fontSize: 13, color: SUBTLE_TEXT, display: 'flex', gap: 12 }}>
            <a href="/privacy-policy" style={{ color: SUBTLE_TEXT, textDecoration: 'underline', fontWeight: 500 }}>Privacy</a>
          </div>
        </footer>
      </div>
      
      {/* PR Offer Form Modal */}
      {showPROfferForm && profile && (
        <PROfferForm
          creatorId={profile.id}
          creatorUsername={profile.username}
          onClose={() => setShowPROfferForm(false)}
          onSuccess={() => {
            setShowPROfferForm(false);
            // Optionally show a success message or refresh data
          }}
        />
      )}
      </div>
    </LandingPageLayout>
  );
};

export default PublicCreatorProfile; 