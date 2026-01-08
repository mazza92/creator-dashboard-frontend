import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Avatar, Spin, Button, Tooltip, Typography, Tag, Space } from 'antd';
import { CalendarOutlined, StarFilled, ArrowRightOutlined, DollarOutlined } from '@ant-design/icons';
import { FaInstagram, FaYoutube, FaTwitter, FaFacebook, FaLinkedin, FaMapMarkerAlt, FaBuilding, FaGlobe, FaCamera } from 'react-icons/fa';
import moment from 'moment';
import { motion } from 'framer-motion';
import api from '../config/api';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const getBadgeColor = (category) => {
  switch (category) {
    case 'Sportswear': return '🏃';
    case 'Technology': return '💻';
    case 'E-commerce': return '🛒';
    case 'Fashion': return '👗';
    case 'Marketing & Sales': return '📈';
    case 'Beauty': return '💄';
    case 'Animals': return '🐾';
    case 'Business & Startups': return '💼';
    case 'TV, Movies, Video': return '🎥';
    case 'Gaming & Streaming': return '🎮';
    case 'Travel': return '✈️';
    case 'IT & Tech': return '🖥️';
    default: return '📌';
  }
};

const parseJsonField = (field, defaultValue = []) => {
  if (Array.isArray(field)) return field;
  try {
    return JSON.parse(field || '[]');
  } catch (error) {
    console.error(`Invalid JSON in field:`, error);
    return defaultValue;
  }
};

const BrandProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [brand, setBrand] = useState(null);
  const [socialPosts, setSocialPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [brandStats, setBrandStats] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Platform logos mapping (same as creator profile)
  const platformLogos = {
    Instagram: <FaInstagram style={{ color: '#E1306C', fontSize: '1.5rem' }} />,
    YouTube: <FaYoutube style={{ color: '#FF0000', fontSize: '1.5rem' }} />,
    Twitter: <FaTwitter style={{ color: '#1DA1F2', fontSize: '1.5rem' }} />,
    TikTok: <FaCamera style={{ color: '#000000', fontSize: '1.5rem' }} />,
    Facebook: <FaFacebook style={{ color: '#1877F2', fontSize: '1.5rem' }} />,
    LinkedIn: <FaLinkedin style={{ color: '#0A66C2', fontSize: '1.5rem' }} />,
  };

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    async function fetchBrandProfile() {
      if (!id) {
        console.warn('⚠️ No brand ID provided, skipping fetch');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log(`🟢 Fetching profile for brand ID: ${id}`);
        const response = await api.get(`${API_URL}/brands/${id}`, { withCredentials: true });
        const data = response.data;

        console.log('🟢 API Response:', data);

        if (!data?.id) {
          console.error('🔥 Brand data missing ID:', data);
          setBrand(null);
          return;
        }

        const parsedBrand = {
          ...data,
          category: parseJsonField(data.category),
        };

        console.log('🟢 Parsed Brand Data:', parsedBrand);

        const userResponse = await api.get(`${API_URL}/profile`, { withCredentials: true });
        console.log('📌 Logged-in user profile response:', userResponse.data);
        const role = userResponse.data.user_role;
        setUserRole(role);
        console.log('🟢 userRole set to:', role);

        const postsResponse = await api.get(`${API_URL}/brands/${id}/social-posts`, { withCredentials: true });
        console.log('🟢 Social Posts Response:', postsResponse.data);
        setSocialPosts(postsResponse.data);

        // Fetch brand stats if available
        try {
          const statsResponse = await api.get(`${API_URL}/brands/${id}/stats`, { withCredentials: true });
          if (statsResponse.data) {
            setBrandStats(statsResponse.data);
          }
        } catch (statsError) {
          console.warn('⚠️ Could not fetch brand stats:', statsError.message);
        }

        // Fetch active campaigns/opportunities
        try {
          const campaignsResponse = await api.get(`${API_URL}/brands/${id}/campaigns`, { withCredentials: true });
          if (campaignsResponse.data && Array.isArray(campaignsResponse.data)) {
            setActiveCampaigns(campaignsResponse.data);
          } else if (campaignsResponse.data?.campaigns) {
            setActiveCampaigns(campaignsResponse.data.campaigns);
          }
        } catch (campaignsError) {
          console.warn('⚠️ Could not fetch brand campaigns:', campaignsError.message);
          setActiveCampaigns([]);
        }

        setBrand(parsedBrand);
      } catch (error) {
        console.error('🔥 Error fetching brand profile:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setBrand(null);
        setUserRole(null);
        setSocialPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBrandProfile();
  }, [id]);

  const getInitials = (name) => {
    if (!name) return 'B';
    const words = name.trim().split(' ').filter(w => w);
    return words.map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const handleSendProposal = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/creator/dashboard/overview?openDraftModal=true');
    }, 300);
  };

  const BRAND_COLOR = '#10b981';
  const TEXT_COLOR = '#1F2937';
  const SUBTLE_TEXT = '#6B7280';
  const BG_COLOR = '#F9FAFB';

  // Get industry/category display
  const getIndustryDisplay = () => {
    const categories = parseJsonField(brand?.category);
    if (categories.length > 0) {
      return categories[0];
    }
    return null;
  };

  // Get location display
  const getLocationDisplay = () => {
    if (brand?.location) return brand.location;
    if (brand?.country) return brand.country;
    if (brand?.city && brand?.country) return `${brand.city}, ${brand.country}`;
    return null;
  };

  // Social links helper
  const getSocialLinks = () => {
    if (!brand) return [];
    const links = [];
    
    // Check if brand has social_links array (like creators)
    if (brand.social_links && Array.isArray(brand.social_links) && brand.social_links.length > 0) {
      return brand.social_links.map(link => {
        const platform = link.platform?.trim() || '';
        const normalizedPlatform = platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
        let icon = <FaInstagram />;
        if (normalizedPlatform === 'Instagram') icon = <FaInstagram />;
        else if (normalizedPlatform === 'YouTube') icon = <FaYoutube />;
        else if (normalizedPlatform === 'Twitter' || normalizedPlatform === 'X') icon = <FaTwitter />;
        else if (normalizedPlatform === 'Facebook') icon = <FaFacebook />;
        else if (normalizedPlatform === 'LinkedIn') icon = <FaLinkedin />;
        
        return {
          platform: normalizedPlatform || platform,
          url: link.url,
          icon: icon
        };
      });
    }
    
    // Fallback to individual fields
    if (brand.instagram) links.push({ platform: 'Instagram', url: brand.instagram, icon: <FaInstagram /> });
    if (brand.youtube) links.push({ platform: 'YouTube', url: brand.youtube, icon: <FaYoutube /> });
    if (brand.twitter) links.push({ platform: 'Twitter', url: brand.twitter, icon: <FaTwitter /> });
    if (brand.facebook) links.push({ platform: 'Facebook', url: brand.facebook, icon: <FaFacebook /> });
    if (brand.linkedin) links.push({ platform: 'LinkedIn', url: brand.linkedin, icon: <FaLinkedin /> });
    return links;
  };

  if (loading) {
    return <Spin tip="Loading profile..." style={{ display: 'block', textAlign: 'center', marginTop: '50px' }} />;
  }

  if (!brand) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: '#1f2937', fontSize: '18px' }}>Brand not found.</div>;
  }

  return (
    <div style={{ background: BG_COLOR, minHeight: '100vh', padding: 0 }}>
      {/* Cover Photo */}
      <div
        style={{
          width: '100%',
          height: 200,
          background: brand.cover_photo 
            ? `url(${brand.cover_photo}) center/cover` 
            : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
          borderRadius: 0,
          marginBottom: 100,
          position: 'relative',
        }}
      />
      
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 32px 20px' }}>
        {/* 1. THE HEADER: The "Instant Impression" */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'center' : 'flex-start',
          gap: 24,
          marginBottom: 32,
          padding: '0 0 24px 0',
          borderBottom: '1px solid #e5e7eb',
          position: 'relative',
        }}>
          {/* Brand Logo - Overlapping Cover */}
          <div style={{ 
            position: 'absolute',
            top: -150,
            left: isMobile ? '50%' : 0,
            transform: isMobile ? 'translateX(-50%)' : 'none',
          }}>
            <Avatar
              size={160}
              src={brand.logo}
              style={{
                border: '4px solid #fff',
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                backgroundColor: BRAND_COLOR,
                color: '#fff',
              }}
              onError={(e) => {
                e.target.src = undefined;
                return true;
              }}
            >
              {getInitials(brand.name)}
            </Avatar>
          </div>

          {/* Main Info Block */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 12, 
            alignItems: isMobile ? 'center' : 'flex-start',
            marginTop: isMobile ? 80 : 60,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: isMobile ? 'center' : 'flex-start' }}>
              <h1 style={{ 
                fontWeight: 700, 
                fontSize: isMobile ? 28 : 36, 
                color: TEXT_COLOR, 
                margin: 0,
                textAlign: isMobile ? 'center' : 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                {brand.name}
                {brand.spotlight && (
                  <Tooltip title="Spotlight Brand">
                    <StarFilled style={{ color: '#FFD700', fontSize: 24 }} />
                  </Tooltip>
                )}
              </h1>
              
              {/* Industry - CRITICAL */}
              {getIndustryDisplay() && (
                <div style={{
                  fontSize: 16,
                  color: BRAND_COLOR,
                  fontWeight: 600,
                  textAlign: isMobile ? 'center' : 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <FaBuilding style={{ fontSize: 14 }} />
                  <span>{getIndustryDisplay()}</span>
                </div>
              )}
              
              {/* Location */}
              {getLocationDisplay() && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 14,
                  color: SUBTLE_TEXT,
                  textAlign: isMobile ? 'center' : 'left'
                }}>
                  <FaMapMarkerAlt style={{ fontSize: 14 }} />
                  <span>{getLocationDisplay()}</span>
                </div>
              )}

              {/* Website */}
              {brand.website && (
                <a
                  href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 14,
                    color: BRAND_COLOR,
                    textDecoration: 'none',
                    fontWeight: 500,
                    textAlign: isMobile ? 'center' : 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  <FaGlobe style={{ fontSize: 14 }} />
                  <span>{brand.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
            </div>
            
            {/* Social Links */}
            {getSocialLinks().length > 0 && (
              <div style={{ 
                display: 'flex', 
                gap: 12, 
                marginTop: 8,
                justifyContent: isMobile ? 'center' : 'flex-start',
                flexWrap: 'wrap'
              }}>
                {getSocialLinks().map((link, idx) => {
                  const normalizedUrl = link.url && !link.url.startsWith('http://') && !link.url.startsWith('https://') 
                    ? `https://${link.url}` 
                    : link.url;
                  return (
                    <a
                      key={idx}
                      href={normalizedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        borderRadius: 8, 
                        background: '#fff', 
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', 
                        border: '1.5px solid #e5e7eb', 
                        width: 40, 
                        height: 40, 
                        padding: 0, 
                        transition: 'all 0.2s', 
                        textDecoration: 'none',
                        color: '#1F2937'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
                      }}
                    >
                      {link.icon}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Primary CTA Block (Top Right) */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 12,
            alignItems: isMobile ? 'center' : 'flex-end',
            minWidth: isMobile ? '100%' : 200,
            marginTop: isMobile ? 0 : 60,
          }}>
            {userRole === 'creator' ? (
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={handleSendProposal}
                loading={isNavigating}
                style={{
                  background: BRAND_COLOR,
                  borderColor: BRAND_COLOR,
                  borderRadius: 12,
                  padding: '14px 28px',
                  height: 'auto',
                  fontWeight: 700,
                  fontSize: 16,
                  width: isMobile ? '100%' : 'auto',
                  minWidth: 200,
                  boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
                }}
              >
                Send Proposal
              </Button>
            ) : (
              <p style={{ color: SUBTLE_TEXT, fontSize: 14, textAlign: 'center' }}>
                Log in as a creator to send proposals
              </p>
            )}
          </div>
        </div>

        {/* 2. THE "BRAND STATS" BAR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: '24px 32px',
            marginBottom: 32,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 20 : 32,
            justifyContent: 'space-around',
            alignItems: 'center',
            border: '1px solid #e5e7eb'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 14, color: SUBTLE_TEXT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Active Campaigns
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: TEXT_COLOR }}>
              {brandStats?.active_campaigns || activeCampaigns.length || '0'}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 14, color: SUBTLE_TEXT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Creators Worked With
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: BRAND_COLOR }}>
              {brandStats?.creators_worked_with || brandStats?.total_creators || '0'}
            </div>
          </div>
          
          {brandStats?.total_spent && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 14, color: SUBTLE_TEXT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Total Spent
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: TEXT_COLOR }}>
                ${brandStats.total_spent >= 1000 
                  ? `${(brandStats.total_spent / 1000).toFixed(1)}K`
                  : brandStats.total_spent?.toLocaleString() || '0'}
              </div>
            </div>
          )}
          
          {brandStats?.avg_campaign_value && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 14, color: SUBTLE_TEXT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Avg. Campaign Value
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: TEXT_COLOR }}>
                ${brandStats.avg_campaign_value >= 1000 
                  ? `${(brandStats.avg_campaign_value / 1000).toFixed(1)}K`
                  : brandStats.avg_campaign_value?.toLocaleString() || '0'}
              </div>
            </div>
          )}
        </motion.div>
        
        {/* 3. THE "ABOUT US" SECTION */}
        {brand.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              marginBottom: 32,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid #e5e7eb'
            }}
          >
            <h2 style={{ 
              fontWeight: 700, 
              fontSize: 20, 
              color: TEXT_COLOR, 
              margin: '0 0 12px 0' 
            }}>
              About {brand.name}
            </h2>
            <p style={{ 
              fontSize: 15, 
              color: SUBTLE_TEXT, 
              lineHeight: 1.6, 
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              {brand.description}
            </p>
          </motion.div>
        )}

        {/* 4. CATEGORIES/INDUSTRIES */}
        {parseJsonField(brand.category).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              marginBottom: 32,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid #e5e7eb'
            }}
          >
            <h2 style={{ 
              fontWeight: 700, 
              fontSize: 20, 
              color: TEXT_COLOR, 
              margin: '0 0 16px 0' 
            }}>
              Industries
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {parseJsonField(brand.category).map((category, index) => (
                <Tag
                  key={index}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 20,
                    fontSize: 14,
                    fontWeight: 600,
                    background: '#f0fdf4',
                    color: BRAND_COLOR,
                    border: `1px solid ${BRAND_COLOR}40`,
                  }}
                >
                  {getBadgeColor(category.trim())} {category.trim()}
                </Tag>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* 5. FEATURED WORK - Preview Cards Linking to Social Posts */}
        {(() => {
          const socialLinks = getSocialLinks();
          const hasSocialLinks = socialLinks.length > 0;
          const hasSocialPosts = socialPosts && Array.isArray(socialPosts) && socialPosts.length > 0;
          console.log('🔍 Featured Work Debug:', {
            socialLinksCount: socialLinks.length,
            socialLinks: socialLinks,
            socialPostsCount: socialPosts?.length || 0,
            socialPosts: socialPosts,
            hasSocialLinks,
            hasSocialPosts,
            willShow: hasSocialLinks || hasSocialPosts
          });
          return hasSocialLinks || hasSocialPosts;
        })() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 32 }}
          >
            <h2 style={{ 
              fontWeight: 700, 
              fontSize: 24, 
              color: TEXT_COLOR, 
              margin: '0 0 20px 0' 
            }}>
              Featured Work
            </h2>
            <p style={{
              fontSize: 15,
              color: SUBTLE_TEXT,
              marginBottom: 24,
              textAlign: 'center'
            }}>
              View our latest content on social media
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: 16,
            }}>
              {getSocialLinks().length > 0 ? (
                getSocialLinks().slice(0, 6).map((link, idx) => {
                let platform = link.platform?.trim() || '';
                
                // If no platform specified, detect from URL
                if (!platform && link.url) {
                  const urlLower = link.url.toLowerCase();
                  if (urlLower.includes('instagram.com')) {
                    platform = 'Instagram';
                  } else if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
                    platform = 'YouTube';
                  } else if (urlLower.includes('tiktok.com')) {
                    platform = 'TikTok';
                  } else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
                    platform = 'Twitter';
                  } else if (urlLower.includes('facebook.com')) {
                    platform = 'Facebook';
                  } else if (urlLower.includes('linkedin.com')) {
                    platform = 'LinkedIn';
                  }
                }
                
                const platformLower = platform.toLowerCase();
                // Normalize platform name for lookup (capitalize first letter)
                const normalizedPlatform = platform 
                  ? platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase()
                  : '';
                const normalizedUrl = link.url && !link.url.startsWith('http://') && !link.url.startsWith('https://') 
                  ? `https://${link.url}` 
                  : link.url;
                
                // Platform-specific gradient colors
                const getPlatformGradient = (platform) => {
                  if (platformLower.includes('instagram')) {
                    return 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)';
                  } else if (platformLower.includes('youtube')) {
                    return 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)';
                  } else if (platformLower.includes('tiktok')) {
                    return 'linear-gradient(135deg, #000000 0%, #333333 100%)';
                  } else if (platformLower.includes('twitter') || platformLower.includes('x')) {
                    return 'linear-gradient(135deg, #1DA1F2 0%, #0d8bd9 100%)';
                  } else if (platformLower.includes('facebook')) {
                    return 'linear-gradient(135deg, #1877F2 0%, #0e5fc7 100%)';
                  } else if (platformLower.includes('linkedin')) {
                    return 'linear-gradient(135deg, #0A66C2 0%, #084d94 100%)';
                  }
                  return 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)';
                };

                const platformIcon = platformLogos[normalizedPlatform] || platformLogos[platform] || <FaCamera style={{ fontSize: 32, color: '#fff' }} />;
                
                return (
                  <a
                    key={idx}
                    href={normalizedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: 16,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      background: getPlatformGradient(platform),
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                  >
                    {/* Platform Icon */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      width: 64,
                      height: 64,
                      backdropFilter: 'blur(10px)',
                      color: '#fff',
                    }}>
                      {platformIcon}
                    </div>
                    
                    {/* Platform Name */}
                    <div style={{
                      color: '#fff',
                      fontSize: 16,
                      fontWeight: 700,
                      textAlign: 'center',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      padding: '0 12px',
                    }}>
                      {platform || 'Social Media'}
                    </div>
                    
                    {/* View Posts Text */}
                    <div style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: 12,
                      fontWeight: 500,
                      marginTop: 8,
                      textAlign: 'center',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    }}>
                      View Posts →
                    </div>
                  </a>
                );
                })
              ) : (
                // Fallback: Show social posts if available
                socialPosts && socialPosts.length > 0 ? (
                  socialPosts.slice(0, 6).map((post, idx) => {
                  // Try multiple possible field names for URL
                  const postUrl = post.url || post.post_url || post.link || post.embed_url || null;
                  
                  // Skip if no valid URL
                  if (!postUrl || postUrl === '#') {
                    return null;
                  }
                  
                  // Detect platform from URL (same logic as creator profile)
                  const urlLower = postUrl.toLowerCase();
                  let platform = 'Social Media';
                  if (urlLower.includes('instagram.com')) {
                    platform = 'Instagram';
                  } else if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
                    platform = 'YouTube';
                  } else if (urlLower.includes('tiktok.com')) {
                    platform = 'TikTok';
                  } else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
                    platform = 'Twitter';
                  } else if (urlLower.includes('facebook.com')) {
                    platform = 'Facebook';
                  } else if (urlLower.includes('linkedin.com')) {
                    platform = 'LinkedIn';
                  } else {
                    // Try to get from post data
                    platform = post.platform || post.social_platform || post.platform_name || 'Social Media';
                  }
                  
                  const platformLower = platform.toLowerCase();
                  // Normalize platform name for lookup
                  const normalizedPlatform = platform 
                    ? platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase()
                    : '';
                  
                  // Platform-specific gradient colors
                  const getPlatformGradient = (platform) => {
                    if (platformLower.includes('instagram')) {
                      return 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)';
                    } else if (platformLower.includes('youtube')) {
                      return 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)';
                    } else if (platformLower.includes('tiktok')) {
                      return 'linear-gradient(135deg, #000000 0%, #333333 100%)';
                    } else if (platformLower.includes('twitter') || platformLower.includes('x')) {
                      return 'linear-gradient(135deg, #1DA1F2 0%, #0d8bd9 100%)';
                    } else if (platformLower.includes('facebook')) {
                      return 'linear-gradient(135deg, #1877F2 0%, #0e5fc7 100%)';
                    } else if (platformLower.includes('linkedin')) {
                      return 'linear-gradient(135deg, #0A66C2 0%, #084d94 100%)';
                    }
                    return 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)';
                  };

                  const platformIcon = platformLogos[normalizedPlatform] || platformLogos[platform] || <FaCamera style={{ fontSize: 32, color: '#fff' }} />;
                  
                  return (
                    <a
                      key={idx}
                      href={postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: 16,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        background: getPlatformGradient(platform),
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                    >
                      {/* Platform Icon */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: 64,
                        height: 64,
                        backdropFilter: 'blur(10px)',
                        color: '#fff',
                      }}>
                        {platformIcon}
                      </div>
                      
                      {/* Platform Name */}
                      <div style={{
                        color: '#fff',
                        fontSize: 16,
                        fontWeight: 700,
                        textAlign: 'center',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        padding: '0 12px',
                      }}>
                        {platform || 'Social Media'}
                      </div>
                      
                      {/* View Posts Text */}
                      <div style={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: 12,
                        fontWeight: 500,
                        marginTop: 8,
                        textAlign: 'center',
                        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                      }}>
                        View Posts →
                      </div>
                    </a>
                  );
                  })
                ) : null
              )}
            </div>
          </motion.div>
        )}

        {/* 6. ACTIVE CAMPAIGNS / OPPORTUNITIES */}
        {activeCampaigns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 32 }}
          >
            <h2 style={{ 
              fontWeight: 700, 
              fontSize: 24, 
              color: TEXT_COLOR, 
              margin: '0 0 20px 0' 
            }}>
              Active Campaigns
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeCampaigns.slice(0, 5).map((campaign) => (
                <Card
                  key={campaign.id}
                  style={{
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <Typography.Title level={4} style={{ margin: '0 0 8px 0', fontSize: 18 }}>
                        {campaign.title || campaign.name || 'Campaign Opportunity'}
                      </Typography.Title>
                      {campaign.description && (
                        <Typography.Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
                          {campaign.description.length > 150 
                            ? `${campaign.description.slice(0, 150)}...` 
                            : campaign.description}
                        </Typography.Text>
                      )}
                      <Space size="small" wrap>
                        {campaign.budget && (
                          <Tag color="green" icon={<DollarOutlined />}>
                            Budget: ${campaign.budget.toLocaleString()}
                          </Tag>
                        )}
                        {campaign.deadline && (
                          <Tag color="blue" icon={<CalendarOutlined />}>
                            Deadline: {moment(campaign.deadline).format('MMM D, YYYY')}
                          </Tag>
                        )}
                      </Space>
                    </div>
                    {userRole === 'creator' && (
                      <Button
                        type="primary"
                        icon={<ArrowRightOutlined />}
                        onClick={handleSendProposal}
                        style={{
                          background: BRAND_COLOR,
                          borderColor: BRAND_COLOR,
                        }}
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BrandProfilePage;