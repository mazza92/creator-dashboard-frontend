import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { Tabs, Card, Avatar, Row, Col, Spin, Button, Statistic, Tooltip, Badge, Modal, ConfigProvider, message, Typography, Form, Input, InputNumber, Space } from 'antd';
// eslint-disable-next-line no-unused-vars
import axios from 'axios';
import api from '../config/api';
import { FaInstagram, FaYoutube, FaTwitter, FaTiktok, FaSnapchatGhost, FaPinterest, FaTwitch, FaGift, FaMapMarkerAlt, FaCamera, FaFacebook } from 'react-icons/fa';
// eslint-disable-next-line no-unused-vars
import { ArrowRightOutlined, StarFilled, DollarOutlined } from '@ant-design/icons';
// eslint-disable-next-line no-unused-vars
import moment from 'moment';
import BookingModal from './BookingModal';
import { createStyles } from 'antd-style';
import { motion } from 'framer-motion';
import styled from 'styled-components';

// eslint-disable-next-line no-unused-vars
const { Title } = Typography;

const useStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary {
      background: linear-gradient(135deg, #26A69A, #4DB6AC) !important;
      border: none !important;
      color: #FFFFFF !important;
      box-shadow: 0 4px 14px rgba(38, 166, 154, 0.3);
      transition: all 0.3s ease;
      height: 48px;
      padding: 0 32px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 24px;
    }
    &:hover {
      background: linear-gradient(135deg, #4DB6AC, #26A69A) !important;
      box-shadow: 0 6px 20px rgba(38, 166, 154, 0.5);
      transform: translateY(-2px);
    }
  `,
  profileContainer: css`
    max-width: 1440px;
    margin: 0 auto;
    padding: 32px;
    background: #ffffff;
    font-family: 'Inter', sans-serif;
    @media (max-width: 768px) {
      padding: 16px 12px;
      width: 100%;
      max-width: 100%;
    }
  `,
  heroSection: css`
    position: relative;
    border-radius: 24px;
    text-align: center;
    margin-bottom: 32px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    @media (max-width: 768px) {
      border-radius: 16px;
      margin: 0 -12px 24px -12px;
      width: calc(100% + 24px);
    }
  `,
  heroBanner: css`
    width: 100%;
    height: 360px;
    background: linear-gradient(135deg, #26A69A 0%, #4DB6AC 50%, #e6f7ff 100%);
    background-size: cover;
    background-position: center;
    position: relative;
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 120px;
      background: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0));
    }
    @media (max-width: 768px) {
      height: 240px;
    }
  `,
  heroContent: css`
    position: relative;
    padding: 32px;
    margin-top: -120px;
    @media (max-width: 768px) {
      padding: 24px;
      margin-top: -80px;
    }
    .ant-avatar {
      border: 4px solid #ffffff;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      transition: transform 0.3s ease;
      &:hover {
        transform: scale(1.05);
      }
    }
  `,
  statSection: css`
    background: #ffffff;
    padding: 32px;
    border-radius: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 32px;
    @media (max-width: 768px) {
      padding: 24px 16px;
      border-radius: 16px;
      margin: 0 -12px 24px -12px;
      width: calc(100% + 24px);
    }
  `,
  statCard: css`
    border-radius: 16px;
    background: #f8fafc;
    padding: 24px;
    text-align: center;
    transition: all 0.3s ease;
    border: 1px solid #f1f5f9;
    @media (max-width: 768px) {
      padding: 20px 16px;
    }
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      border-color: #26A69A;
    }
    .ant-statistic-title {
      color: #64748b;
      font-size: 16px;
      margin-bottom: 8px;
      @media (max-width: 768px) {
        font-size: 14px;
      }
    }
    .ant-statistic-content {
      color: #1e293b;
      font-size: 28px;
      font-weight: 700;
      @media (max-width: 768px) {
        font-size: 24px;
      }
    }
  `,
  tabPane: css`
    padding: 32px;
    background: #ffffff;
    border-radius: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    @media (max-width: 768px) {
      padding: 24px 16px;
      border-radius: 16px;
      margin: 0 -12px;
      width: calc(100% + 24px);
    }
  `,
  tabContent: css`
    padding: 0;
    background: #ffffff;
  `,
  socialLinks: css`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;
    margin-top: 24px;
    a {
      color: #64748b;
      transition: all 0.3s ease;
      &:hover {
        color: #26A69A;
        transform: translateY(-2px);
      }
      svg {
        width: 24px;
        height: 24px;
      }
    }
  `,
  sectionTitle: css`
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 24px;
    text-align: center;
    @media (max-width: 768px) {
      font-size: 20px;
      margin-bottom: 20px;
    }
  `,
  badge: css`
    background: #f1f5f9;
    color: #64748b;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    margin-right: 8px;
    margin-bottom: 8px;
    display: inline-block;
    transition: all 0.3s ease;
    &:hover {
      background: #e2e8f0;
      transform: translateY(-2px);
    }
  `,
}));


const parseJsonField = (field, defaultValue = []) => {
  if (Array.isArray(field)) return field;
  try {
    return JSON.parse(field || '[]');
  } catch (error) {
    console.error(`Invalid JSON in field:`, error);
    return defaultValue;
  }
};

const platformLogos = {
  Instagram: <FaInstagram style={{ color: '#E1306C', fontSize: '1.5rem' }} />,
  YouTube: <FaYoutube style={{ color: '#FF0000', fontSize: '1.5rem' }} />,
  Twitter: <FaTwitter style={{ color: '#1DA1F2', fontSize: '1.5rem' }} />,
  TikTok: <FaTiktok style={{ color: '#000000', fontSize: '1.5rem' }} />,
  Facebook: <FaFacebook style={{ color: '#1877F2', fontSize: '1.5rem' }} />,
  Snapchat: <FaSnapchatGhost style={{ color: '#FFFC00', fontSize: '1.5rem' }} />,
  Pinterest: <FaPinterest style={{ color: '#E60023', fontSize: '1.5rem' }} />,
  Twitch: <FaTwitch style={{ color: '#9146FF', fontSize: '1.5rem' }} />,
};

const StyledAvatar = styled(Avatar)`
  width: 160px !important;
  height: 160px !important;
  min-width: 160px !important;
  min-height: 160px !important;
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1;
  img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
  }
`;

const ProfilePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { styles } = useStyle();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isBidModalVisible, setIsBidModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [bidForm] = Form.useForm();


  const formatNumber = (num) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  console.log("🟢 Creator ID from useParams:", id);

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
    async function fetchCreatorProfile() {
      if (!id) {
        console.warn('⚠️ No creator ID provided, skipping fetch');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log(`🟢 Fetching profile for creator ID: ${id}`);
        const response = await api.get(`/creators/${id}`);
        const data = response.data;

        console.log('🟢 API Response:', data);

        if (!data?.id) {
          console.error('🔥 Creator data missing ID:', data);
          setCreator(null);
          return;
        }

        const parsedCreator = {
          ...data,
          social_links: parseJsonField(data.social_links),
          niche: parseJsonField(data.niche),
          regions: parseJsonField(data.regions),
          platforms: parseJsonField(data.platforms),
          portfolio_links: parseJsonField(data.portfolio_links),
        };

        console.log('🟢 Parsed Creator Data:', parsedCreator);
        setCreator(parsedCreator);

        // Check if projects/slots are included in the creator response
        if (data.projects && Array.isArray(data.projects)) {
          setProjects(data.projects);
        } else if (data.slots && Array.isArray(data.slots)) {
          setProjects(data.slots);
        } else {
          // Try to fetch slots from the public profile endpoint format
          // This endpoint typically includes projects/slots
          try {
            const username = data.username || parsedCreator.username;
            if (username) {
              const apiBase = process.env.REACT_APP_API_URL || '';
              const publicProfileResponse = await fetch(`${apiBase}/c/${username}`);
              if (publicProfileResponse.ok) {
                const publicData = await publicProfileResponse.json();
                if (publicData?.projects && Array.isArray(publicData.projects)) {
                  setProjects(publicData.projects);
                } else if (publicData?.slots && Array.isArray(publicData.slots)) {
                  setProjects(publicData.slots);
                } else {
                  setProjects([]);
                }
              } else {
                throw new Error('Public profile not found');
              }
            } else {
              setProjects([]);
            }
          } catch (slotsError) {
            console.warn('⚠️ Could not fetch creator slots from public endpoint:', slotsError.message);
            // Try alternative endpoint for creator slots
            try {
              const slotsResponse = await api.get(`/creators/${id}/slots`);
              if (slotsResponse.data && Array.isArray(slotsResponse.data)) {
                setProjects(slotsResponse.data);
              } else if (slotsResponse.data?.slots && Array.isArray(slotsResponse.data.slots)) {
                setProjects(slotsResponse.data.slots);
              } else {
                setProjects([]);
              }
            } catch (altError) {
              console.warn('⚠️ Could not fetch creator slots:', altError.message);
              setProjects([]);
            }
          }
        }

        // Optionally fetch the current user's role to determine if they are a brand
        try {
          const userResponse = await api.get('/profile');
          const role = userResponse.data.user_role;
          setUserRole(role);
          console.log('🟢 Logged-in user is a:', role);
        } catch (userError) {
          console.warn('⚠️ Could not fetch current user profile, assuming guest.', userError.message);
          setUserRole(null); // Treat as a guest/logged-out user
        }

      } catch (error) {
        console.error('🔥 Error fetching creator profile:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          request_url: error.config?.url,
          timestamp: new Date().toISOString(),
        });
        let errorMessage = 'Failed to load creator profile. Please try again later.';
        if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Unable to connect to the server. Please check your internet connection or contact support at partner@newcollab.co.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Unauthorized: Please log in and try again.';
        } else if (error.response?.status === 404) {
          errorMessage = 'Creator profile not found.';
        }
        message.error(errorMessage);
        setCreator(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCreatorProfile();
  }, [id]);

  useEffect(() => {
    if (location.state?.openBookingModal && creator) {
      console.log('🟢 Triggering Booking Modal from navigation state');
      openBookingModal({ creator });
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.state, location.pathname, creator]);

  const openBookingModal = (details) => {
    console.log('🟢 Opening BookingModal with details:', details);
    setSelectedBookingDetails({
      creator: details.creator,
    });
    setBookingModalVisible(true);
  };

  const handleProposePRPackage = () => {
    if (userRole === 'brand') {
      navigate(`/brand/dashboard/pr-offers?create=true&creator_id=${id}`);
    } else {
      message.warning('Please log in as a brand to propose PR packages.');
    }
  };

  const handleBidOnProject = (projectId) => {
    if (userRole === 'brand') {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setSelectedProject(project);
        setIsBidModalVisible(true);
        // Set initial form values
        bidForm.setFieldsValue({
          bid_amount: project.starting_bid || undefined,
          pitch: ''
        });
      }
    } else {
      message.warning('Please log in as a brand to place bids.');
    }
  };

  const handleSubmitBid = async (values) => {
    if (!selectedProject) return;
    
    try {
      const { bid_amount, pitch } = values;
      
      if (!bid_amount || bid_amount <= 0) {
        message.error('Please enter a valid bid amount.');
        return;
      }

      if (bid_amount < selectedProject.starting_bid) {
        message.error(`Your bid must be at least ${selectedProject.starting_bid}`);
        return;
      }

      const payload = {
        creator_id: id,
        bid_amount: parseFloat(bid_amount),
        pitch: pitch || 'Interested in sponsoring this post!'
      };

      console.log('🟢 Submitting bid payload:', payload);
      
      await api.post(
        `/sponsor-drafts/${selectedProject.id}/bid`,
        payload
      );

      message.success({
        content: `Bid of ${bid_amount} submitted successfully!`,
        duration: 5,
      });

      setIsBidModalVisible(false);
      bidForm.resetFields();
      setSelectedProject(null);
      
      // Optionally refresh projects to show updated bid status
      // You can add this if needed
      
    } catch (error) {
      console.error('🔥 Error submitting bid:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || 'Unknown error';
      if (errorMessage.includes('already submitted')) {
        message.error('You already submitted a bid for this project. Please update your existing bid instead.');
      } else {
        message.error('Failed to submit bid: ' + errorMessage);
      }
    }
  };

  // Get niche as string (first niche or formatted)
  const getNicheDisplay = () => {
    if (!creator.niche || creator.niche.length === 0) return null;
    if (typeof creator.niche === 'string') return creator.niche;
    if (Array.isArray(creator.niche)) {
      return creator.niche[0] || null;
    }
    return null;
  };

  // Get location/region display
  const getLocationDisplay = () => {
    if (creator.country) return creator.country;
    if (creator.regions && Array.isArray(creator.regions) && creator.regions.length > 0) {
      return creator.regions[0];
    }
    return null;
  };


  if (loading) {
    return <Spin tip="Loading profile..." style={{ display: 'block', textAlign: 'center', marginTop: '50px' }} />;
  }

  if (!creator) {
    return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px', color: '#757575' }}>Creator not found.</div>;
  }

  console.log("🟢 Rendering ProfilePage with userRole:", userRole);

  const BRAND_COLOR = '#10b981';
  const TEXT_COLOR = '#1F2937';
  const SUBTLE_TEXT = '#6B7280';

  return (
    <div className={styles.profileContainer} style={{ maxWidth: 1200, padding: '32px 20px' }}>
      {/* Cover Photo */}
      <div
        style={{
          width: '100%',
          height: 180,
          background: creator.hero_banner 
            ? `url(${creator.hero_banner}) center/cover` 
            : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
          borderRadius: 16,
          marginBottom: 80,
          position: 'relative',
        }}
      />
      
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
        {/* Profile Picture - Overlapping Cover */}
        <div style={{ 
          position: 'absolute',
          top: -100,
          left: isMobile ? '50%' : 0,
          transform: isMobile ? 'translateX(-50%)' : 'none',
        }}>
          <StyledAvatar
            size={160}
            src={
              creator.image_profile ? (
                <img src={creator.image_profile} alt="Profile" />
              ) : (
                <img src="https://via.placeholder.com/160" alt="Placeholder" />
              )
            }
          />
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
              textAlign: isMobile ? 'center' : 'left'
            }}>
              {creator.name || creator.username || `@${creator.username}`}
            </h1>
            
            {/* Niche - CRITICAL */}
            {getNicheDisplay() && (
              <div style={{
                fontSize: 16,
                color: BRAND_COLOR,
                fontWeight: 600,
                textAlign: isMobile ? 'center' : 'left'
              }}>
                {getNicheDisplay()}
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
          </div>
          
          {/* Social Links */}
          {creator.social_links && creator.social_links.length > 0 && (
            <div style={{ 
              display: 'flex', 
              gap: 12, 
              marginTop: 8,
              justifyContent: isMobile ? 'center' : 'flex-start',
              flexWrap: 'wrap'
            }}>
              {creator.social_links.map((link, idx) => {
                const platformKey = link.platform?.trim() || '';
                const normalizedUrl = link.url && !link.url.startsWith('http://') && !link.url.startsWith('https://') 
                  ? `https://${link.url}` 
                  : link.url;
                // Normalize platform name for lookup (capitalize first letter)
                const normalizedPlatform = platformKey 
                  ? platformKey.charAt(0).toUpperCase() + platformKey.slice(1).toLowerCase()
                  : '';
                return (
                  <a
                    key={idx}
                    href={normalizedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platformKey || 'Social Link'}
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
                      textDecoration: 'none' 
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
                    {platformLogos[normalizedPlatform] || platformLogos[link.platform] || <span>{link.platform}</span>}
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
          <Button
            type="primary"
            size="large"
            icon={<FaGift />}
            onClick={handleProposePRPackage}
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
            Propose PR Package
          </Button>
          <Button
            size="large"
            onClick={() => {
              if (userRole === 'brand') {
                document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                message.warning('Please log in as a brand to bid on projects.');
              }
            }}
            style={{
              background: 'transparent',
              color: BRAND_COLOR,
              border: `2px solid ${BRAND_COLOR}`,
              borderRadius: 12,
              padding: '12px 24px',
              height: 'auto',
              fontWeight: 600,
              fontSize: 15,
              width: isMobile ? '100%' : 'auto',
              minWidth: 200,
            }}
          >
            Bid on Project
          </Button>
        </div>
      </div>

      {/* 2. THE "MONEY STATS" BAR */}
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
            Followers
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: TEXT_COLOR }}>
            {formatNumber(creator.followers_count || 0)}
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 14, color: SUBTLE_TEXT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Avg. Engagement
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: BRAND_COLOR }}>
            {parseFloat(creator.engagement_rate || 0).toFixed(1)}%
          </div>
        </div>
        
        {creator.total_views && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 14, color: SUBTLE_TEXT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Avg. Project Views
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: TEXT_COLOR }}>
              {formatNumber(creator.total_views || 0)}
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 14, color: SUBTLE_TEXT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Active Projects
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: TEXT_COLOR }}>
            {projects.length || 0}
          </div>
        </div>
      </motion.div>
      
      {/* 3. THE "ABOUT ME" SECTION */}
      {creator.bio && (
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
            About @{creator.username}
          </h2>
          <p style={{ 
            fontSize: 15, 
            color: SUBTLE_TEXT, 
            lineHeight: 1.6, 
            margin: 0,
            whiteSpace: 'pre-wrap'
          }}>
            {creator.bio}
          </p>
        </motion.div>
      )}
      
      {/* 4. THE "CONTENT GALLERY" - Preview Cards Linking to Social Posts */}
      {creator.social_links && creator.social_links.length > 0 && (
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
            My Best Work
          </h2>
          <p style={{
            fontSize: 15,
            color: SUBTLE_TEXT,
            marginBottom: 24,
            textAlign: 'center'
          }}>
            View my latest content on social media
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: 16,
          }}>
            {creator.social_links.slice(0, 6).map((link, idx) => {
              const platform = link.platform?.trim() || '';
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
                  
                  {/* Overlay on hover */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.1)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  />
                </a>
              );
            })}
          </div>
          
          {/* Additional social links if more than 6 */}
          {creator.social_links.length > 6 && (
            <div style={{
              marginTop: 24,
              textAlign: 'center',
            }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  // Scroll to social links in header
                  document.querySelector(`.${styles.socialLinks}`)?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  color: BRAND_COLOR,
                  fontSize: 15,
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                View all social profiles
                <ArrowRightOutlined />
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* 5. "ACTIVE PROJECTS ON NEWCOLLAB" - The "Menu of Services" */}
      <div id="projects-section" style={{ marginBottom: 32 }}>
        <h2 style={{ 
          fontWeight: 700, 
          fontSize: 24, 
          color: TEXT_COLOR, 
          margin: '0 0 20px 0' 
        }}>
          Active Projects on Newcollab
        </h2>
        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', color: SUBTLE_TEXT, fontSize: 16, marginTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>
              <span role="img" aria-label="Handshake">🤝</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, color: TEXT_COLOR, marginBottom: 6 }}>No Open Sponsorships</div>
            <div style={{ color: SUBTLE_TEXT, fontSize: 15, maxWidth: 320 }}>
              This creator currently has no open sponsorship opportunities.<br />
              Please check back soon or explore other creators on Newcollab!
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {projects.map((slot) => {
              // Determine project category/type
              const getProjectCategory = (slot) => {
                if (slot.content_format?.toLowerCase().includes('video') || slot.content_format?.toLowerCase().includes('reel')) {
                  return 'Video Content';
                } else if (slot.content_format?.toLowerCase().includes('story')) {
                  return 'Stories';
                } else if (slot.content_format?.toLowerCase().includes('post')) {
                  return 'Static Post';
                } else if (slot.content_format?.toLowerCase().includes('live')) {
                  return 'Live Stream';
                }
                return 'Content Collaboration';
              };
              
              const projectCategory = getProjectCategory(slot);
              const platformIcon = slot.platforms && slot.platforms[0] ? platformLogos[slot.platforms[0]] : null;
              
              return (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: 24,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                  }}
                >
                  {/* Project Title - Categorized */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 12, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: '#f0fdf4',
                      border: `2px solid ${BRAND_COLOR}`
                    }}>
                      {platformIcon || <FaCamera style={{ fontSize: 24, color: BRAND_COLOR }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontWeight: 700, 
                        fontSize: 18, 
                        color: TEXT_COLOR, 
                        margin: '0 0 4px 0' 
                      }}>
                        {projectCategory}
                      </h3>
                      <div style={{ fontSize: 13, color: SUBTLE_TEXT }}>
                        {slot.platforms && slot.platforms[0]} • {slot.content_format || 'Post'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Seeking Description */}
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ 
                      fontSize: 15, 
                      color: TEXT_COLOR, 
                      lineHeight: 1.6, 
                      margin: 0 
                    }}>
                      {slot.title || slot.description || 'A brand for a collaboration opportunity...'}
                    </p>
                  </div>
                  
                  {/* Starting Bid */}
                  {slot.starting_bid > 0 && (
                    <div style={{ 
                      marginBottom: 16, 
                      padding: '12px 16px', 
                      background: '#f0fdf4', 
                      borderRadius: 12,
                      border: `1px solid ${BRAND_COLOR}20`
                    }}>
                      <div style={{ fontSize: 13, color: SUBTLE_TEXT, marginBottom: 4, fontWeight: 600 }}>
                        Starting Bid
                      </div>
                      <div style={{ fontSize: 20, color: BRAND_COLOR, fontWeight: 700 }}>
                        {(() => {
                          const { formatPrice } = require('../utils/currency');
                          const currency = slot.currency || 'USD';
                          return formatPrice(slot.starting_bid || 0, currency);
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {/* CTAs: Propose PR (Gifted) and Place Bid (Paid) */}
                  <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
                    <Button
                      type="primary"
                      icon={<FaGift />}
                      onClick={handleProposePRPackage}
                      style={{
                        flex: 1,
                        background: BRAND_COLOR,
                        borderColor: BRAND_COLOR,
                        borderRadius: 10,
                        padding: '12px 20px',
                        height: 'auto',
                        fontWeight: 700,
                        fontSize: 15,
                        boxShadow: '0 2px 8px rgba(16,185,129,0.2)',
                      }}
                    >
                      Propose PR (Gifted)
                    </Button>
                    {slot.starting_bid > 0 && (
                      <Button
                        onClick={() => handleBidOnProject(slot.id)}
                        style={{
                          flex: 1,
                          background: 'transparent',
                          color: BRAND_COLOR,
                          border: `2px solid ${BRAND_COLOR}`,
                          borderRadius: 10,
                          padding: '12px 20px',
                          height: 'auto',
                          fontWeight: 700,
                          fontSize: 15,
                        }}
                      >
                        Place Bid (Paid)
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BookingModal
        visible={isBookingModalVisible}
        onClose={() => {
          setBookingModalVisible(false);
          setSelectedBookingDetails(null);
        }}
        selectedBookingDetails={selectedBookingDetails}
        userRole={userRole}
      />

      {/* Bid Modal */}
      <Modal
        title={
          <span style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>
            Place a Bid
          </span>
        }
        open={isBidModalVisible}
        onCancel={() => {
          setIsBidModalVisible(false);
          bidForm.resetFields();
          setSelectedProject(null);
        }}
        footer={null}
        width={600}
      >
        {selectedProject && (
          <Form
            form={bidForm}
            onFinish={handleSubmitBid}
            layout="vertical"
          >
            <div style={{ 
              marginBottom: 20, 
              padding: 16, 
              background: '#f8fafc', 
              borderRadius: 8,
              border: '1px solid #e2e8f0'
            }}>
              <Typography.Title level={5} style={{ margin: 0, color: '#1e293b' }}>
                Project Details
              </Typography.Title>
              <Typography.Text strong style={{ fontSize: '1rem', color: '#1e293b', display: 'block', marginTop: 8 }}>
                {selectedProject.title || 'Content Collaboration'}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                Platform: {selectedProject.platforms?.[0] || 'N/A'} • Format: {selectedProject.content_format || 'Post'}
              </Typography.Text>
            </div>

            <div style={{ 
              marginBottom: 20, 
              padding: 16, 
              background: '#f0fdfa', 
              borderRadius: 8,
              border: '1px solid #d1fae5'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <DollarOutlined style={{ color: BRAND_COLOR, fontSize: '1.25rem' }} />
                <Typography.Title level={5} style={{ margin: 0, color: '#065f46' }}>
                  Minimum Budget Required
                </Typography.Title>
              </div>
              <Typography.Text strong style={{ fontSize: '1.25rem', color: BRAND_COLOR }}>
                {(() => {
                  const { formatPrice } = require('../utils/currency');
                  const currency = selectedProject.currency || 'USD';
                  return formatPrice(selectedProject.starting_bid || 0, currency);
                })()}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                Your proposed budget must be equal or higher than the minimum bid
              </Typography.Text>
            </div>

            <Form.Item
              label="Bid Amount"
              name="bid_amount"
              rules={[
                { required: true, message: 'Please enter your bid amount' },
                { 
                  type: 'number', 
                  min: selectedProject.starting_bid, 
                  message: `Bid must be at least ${(() => {
                    const { formatPrice } = require('../utils/currency');
                    const currency = selectedProject.currency || 'USD';
                    return formatPrice(selectedProject.starting_bid || 0, currency);
                  })()}` 
                },
              ]}
              extra={
                <Typography.Text type="secondary" style={{ fontSize: '0.875rem' }}>
                  Enter an amount equal to or higher than {(() => {
                    const { formatPrice } = require('../utils/currency');
                    const currency = selectedProject.currency || 'USD';
                    return formatPrice(selectedProject.starting_bid || 0, currency);
                  })()}
                </Typography.Text>
              }
            >
              <InputNumber
                min={selectedProject.starting_bid}
                style={{ width: '100%' }}
                formatter={(value) => {
                  const { getCurrencySymbol } = require('../utils/currency');
                  const currency = selectedProject.currency || 'USD';
                  const symbol = getCurrencySymbol(currency);
                  return `${symbol} ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                }}
                parser={(value) => {
                  const { getCurrencySymbol } = require('../utils/currency');
                  const currency = selectedProject.currency || 'USD';
                  const symbol = getCurrencySymbol(currency);
                  return value.replace(new RegExp(`\\${symbol}\\s?|(,*)`, 'g'), '');
                }}
                placeholder="Enter your bid amount"
              />
            </Form.Item>

            <Form.Item
              label="Message (Optional)"
              name="pitch"
              extra="Let the creator know why you're interested in this collaboration"
            >
              <Input.TextArea 
                rows={4} 
                placeholder="I'm interested in sponsoring this content because..." 
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Space style={{ marginTop: 20, width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setIsBidModalVisible(false);
                  bidForm.resetFields();
                  setSelectedProject(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{
                  background: BRAND_COLOR,
                  borderColor: BRAND_COLOR,
                }}
              >
                Submit Bid
              </Button>
            </Space>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ProfilePage;