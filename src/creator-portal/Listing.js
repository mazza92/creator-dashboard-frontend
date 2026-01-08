import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Card, Avatar, Button, Drawer, Modal, Slider, Select, Input, Row, Col, Tag, Spin, message, notification, Space, /* eslint-disable-line no-unused-vars */ Radio, Badge, Form, InputNumber, Tabs, Typography,
} from 'antd';
// eslint-disable-next-line no-unused-vars
import { FaInstagram, FaYoutube, FaTwitter, FaFacebook, FaVideo, FaMicrophone, FaTiktok, FaSnapchat, FaLinkedin, FaPinterest, FaTwitch,
  FaBaby, FaGraduationCap, FaBriefcase, FaUserTie, FaGamepad, 
  FaRunning, FaTshirt, FaLaptop, FaUtensils, FaPlane, 
  FaHeartbeat, FaHome, FaDog, FaTools, FaMusic, 
  FaBook, FaLeaf, FaGem, FaShoppingCart, FaPalette, 
  FaFlask, FaNewspaper, FaLaughSquint, FaFilm, FaChartLine,
  FaCar, FaPaw, FaTv, FaFutbol, FaCamera, FaPaintBrush } from 'react-icons/fa';
// eslint-disable-next-line no-unused-vars
import { GiLipstick, GiCookingPot } from 'react-icons/gi';
// eslint-disable-next-line no-unused-vars
import { MdFamilyRestroom, MdSportsEsports, MdBeachAccess, MdOutlineLiveTv, MdOutlineAudiotrack } from 'react-icons/md';
import { FiImage, FiVideo, FiFilm } from 'react-icons/fi';
import { SearchOutlined, StarOutlined, StarFilled, FilterOutlined, DollarCircleOutlined, ClockCircleOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';
// eslint-disable-next-line no-unused-vars
import axios from 'axios';
import api from '../config/api';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import styled from 'styled-components';
// eslint-disable-next-line no-unused-vars
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { motion } from 'framer-motion';
import { UserContext } from '../contexts/UserContext';
import './Listing.css';

// eslint-disable-next-line no-unused-vars
const stripePromise = loadStripe("pk_test_RZFMNQ4Cwhf40G249V2OFobV00YEEYTq1A");

const { Option } = Select;
const { TabPane } = Tabs;

// Styled components (unchanged)
const Container = styled.div`
  padding: 1.5rem;
  background: #f9fafb;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;

  @media (max-width: 576px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  background: #fff;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;

  @media (max-width: 576px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 700px;

  @media (max-width: 576px) {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }
`;

const ActionButtonsWrapper = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;

  @media (max-width: 576px) {
    width: 100%;
  }
`;

const ActionButton = styled(Button)`
  flex: 1;
  min-width: 120px;
  height: 40px;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;

  &.ant-btn-default {
    border: 1px solid #e5e7eb;
    color: #4b7280;
    
    &:hover {
      border-color: #26A69A;
      color: #26A69A;
      background: #f0fdfa;
    }
  }

  &.ant-btn-primary {
    background: linear-gradient(135deg, #26A69A, #4DB6AC);
    border: none;
    color: white;
    box-shadow: 0 2px 4px rgba(38, 166, 154, 0.2);
    
    &:hover {
      background: linear-gradient(135deg, #4DB6AC, #26A69A);
      box-shadow: 0 4px 6px rgba(38, 166, 154, 0.3);
    }
  }
`;

const OfferCard = styled(Card)`
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease-in-out;
  height: 100%;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .ant-card-body {
    padding: 1.5rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    @media (max-width: 576px) {
      padding: 1.25rem;
      gap: 1rem;
    }
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  width: 100%;
  position: relative;
  padding-left: 0.5rem;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
`;

const CreatorAvatar = styled(Avatar)`
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  position: absolute;
  left: -0.5rem;
  top: 50%;
  transform: translateY(-50%);
`;

const CreatorName = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: 2.5rem;
`;

const CardSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0;
  padding-bottom: ${props => props.isContentBrief ? '2rem' : '0'};

  @media (max-width: 576px) {
    padding-bottom: ${props => props.isContentBrief ? '2.5rem' : '0'};
  }

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionTitle = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`;

const CardFooter = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.25rem;
`;

const NicheTag = styled(Tag)`
  margin: 6px 8px 6px 0;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, #e6f7ff, #bae7ff);
  border: none;
  color: #096dd9;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

const ContentBadge = styled(Tag)`
  margin: 6px 8px 6px 0;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.gradient};
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

const SponsorBadge = styled(Tag)`
  margin: 6px 8px 6px 0;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const DrawerContent = styled.div`
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  font-family: 'Inter', sans-serif;
`;

const ModalContent = styled.div`
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  font-family: 'Inter', sans-serif;
`;

const StyledInput = styled(Input)`
  border-radius: 24px;
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  font-size: 16px;
  &:hover, &:focus {
    border-color: #26A69A;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.2);
  }
`;

const FilterBadge = styled(Badge)`
  .ant-badge-count {
    background: #26A69A;
    color: #fff;
    font-weight: 600;
    border-radius: 12px;
    padding: 0 8px;
  }
`;

const TabsWrapper = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 24px;
  }
  .ant-tabs-tab {
    font-size: 16px;
    font-weight: 600;
    padding: 12px 24px;
  }
  .ant-tabs-tab-active {
    color: #26A69A !important;
  }
  .ant-tabs-ink-bar {
    background: #26A69A;
  }
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
  margin: 12px 0;
  background: #000;
  border-radius: 12px;
`;

const StyledVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 12px;
`;

const BidHighlight = styled.div`
  background: linear-gradient(135deg, #26A69A, #4DB6AC);
  padding: 8px 12px;
  border-radius: 12px;
  margin: 12px 0;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeadlineTimer = styled.div`
  color: ${props => {
    if (props.isExpiringSoon) return '#f59e0b'; // amber for expiring soon
    if (props.isExpired) return '#ef4444'; // red for expired
    return '#ff6b6b'; // default red
  }};
  font-weight: 600;
  font-size: 14px;
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: ${props => props.isExpiringSoon ? 'rgba(245, 158, 11, 0.1)' : 'transparent'};
  border-radius: 6px;
  border: ${props => props.isExpiringSoon ? '1px solid rgba(245, 158, 11, 0.2)' : 'none'};
`;

const ExpiringBadge = styled(Tag)`
  margin: 6px 8px 6px 0;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.1);
`;

const ContentBrief = styled.div`
  position: relative;
  display: ${props => props.isLongContent && !props.expanded ? '-webkit-box' : 'block'};
  -webkit-line-clamp: ${props => props.expanded ? 'none' : (props.isLongContent ? '3' : 'none')};
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
  font-size: 0.875rem;
  color: #4b5563;
  padding: 0;
  margin-bottom: ${props => props.expanded ? '0' : (props.isLongContent ? '40px' : '0')};

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: ${props => props.expanded || !props.isLongContent ? 'none' : 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'};
    pointer-events: none;
    opacity: ${props => props.expanded || !props.isLongContent ? '0' : '1'};
    transition: opacity 0.3s ease-in-out;
  }
`;

const ExpandButton = styled.button`
  position: absolute;
  bottom: -32px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  z-index: 10;
  white-space: nowrap;

  &:hover {
    background: #f9fafb;
    color: #374151;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const PlatformItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: transparent;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(243, 244, 246, 0.5);
  }

  svg {
    font-size: 18px;
    color: #26A69A;
  }

  span {
    color: #4b5563;
  }
`;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const badgeVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

const platformLogos = {
  Instagram: <FaInstagram style={{ color: '#E1306C', fontSize: '20px' }} />,
  YouTube: <FaYoutube style={{ color: '#FF0000', fontSize: '20px' }} />,
  Twitter: <FaTwitter style={{ color: '#1DA1F2', fontSize: '20px' }} />,
  Facebook: <FaFacebook style={{ color: '#1877F2', fontSize: '20px' }} />,
  TikTok: <FaTiktok style={{ color: '#000000', fontSize: '20px' }} />,
  Snapchat: <FaSnapchat style={{ color: '#FFFC00', fontSize: '20px' }} />,
  LinkedIn: <FaLinkedin style={{ color: '#0077B5', fontSize: '20px' }} />,
  Pinterest: <FaPinterest style={{ color: '#E60023', fontSize: '20px' }} />,
  Twitch: <FaTwitch style={{ color: '#9146FF', fontSize: '20px' }} />
};

const getTagIcon = (contentType) => {
  switch (contentType) {
    case 'Stories':
    case 'Static Posts':
      return <FaCamera style={{ fontSize: '16px' }} />;
    case 'Live Streaming':
    case 'Live':
      return <MdOutlineLiveTv style={{ fontSize: '16px' }} />;
    case 'Short Videos':
    case 'Reels':
      return <FaVideo style={{ fontSize: '16px' }} />;
    case '10min+ Videos':
      return <FiFilm style={{ fontSize: '16px' }} />;
    case 'Audio Content':
    case 'Podcast':
      return <MdOutlineAudiotrack style={{ fontSize: '16px' }} />;
    case 'Sponsored Content':
      return <FiVideo style={{ fontSize: '16px' }} />;
    case 'Newsletter':
      return <FaNewspaper style={{ fontSize: '16px' }} />;
    default:
      return <FiImage style={{ fontSize: '16px' }} />;
  }
};

const getTagColor = (contentType) => {
  switch (contentType) {
    case 'Stories':
    case 'Static Posts':
      return 'linear-gradient(135deg, #ff9a00, #ff6f00)';
    case 'Live Streaming':
    case 'Live':
      return 'linear-gradient(135deg, #22c55e, #16a34a)';
    case 'Short Videos':
    case 'Reels':
      return 'linear-gradient(135deg, #ec4899, #db2777)';
    case '10min+ Videos':
      return 'linear-gradient(135deg, #3b82f6, #2563eb)';
    case 'Audio Content':
    case 'Podcast':
      return 'linear-gradient(135deg, #78716c, #57534e)';
    case 'Newsletter':
      return 'linear-gradient(135deg, #eab308, #ca8a04)';
    case 'Sponsored Content':
      return 'linear-gradient(135deg, #ff6b6b, #ff8e53)';
    default:
      return 'linear-gradient(135deg, #9ca3af, #6b7280)';
  }
};

const formatFollowers = (count) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

// eslint-disable-next-line no-unused-vars
const PaymentForm = ({ clientSecret, booking, onSuccess, onCancel, isSubscription = true }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      message.error("Stripe not initialized");
      return;
    }
    setLoading(true);
    try {
      console.log(`📌 Initiating Stripe payment for subscription ${booking.subscription_id}`);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (result.error) {
        message.error(`Payment failed: ${result.error.message}`);
      } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        console.log(`📌 Stripe payment succeeded for subscription ${booking.subscription_id}`);
        await onSuccess(result.paymentIntent.id, booking.subscription_id, isSubscription);
        console.log(`📌 onSuccess executed for subscription ${booking.subscription_id}`);
      } else {
        message.error("Payment did not succeed.");
      }
    } catch (error) {
      console.error("🔥 Payment error:", error);
      message.error("An unexpected error occurred during payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement options={{ style: { base: { fontSize: '16px', fontFamily: 'Inter, sans-serif' } } }} />
      <Space style={{ marginTop: 20 }}>
        <ActionButton type="primary" htmlType="submit" loading={loading} disabled={!stripe} primary>
          Pay Now
        </ActionButton>
        <ActionButton onClick={onCancel}>Cancel</ActionButton>
      </Space>
    </form>
  );
};

const audienceIcons = {
  "Gen Z (18-24)": <FaBaby style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Millennials (25-34)": <FaUserTie style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Gen X (35-54)": <FaBriefcase style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Boomers (55+)": <FaGraduationCap style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Families": <MdFamilyRestroom style={{ fontSize: '16px', color: '#26A69A' }} />,
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
  "Fashion": <FaTshirt style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Beauty": <GiLipstick style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Fitness": <FaRunning style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Gaming": <FaGamepad style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Travel": <FaPlane style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Food & Drink": <FaUtensils style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Technology": <FaLaptop style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Lifestyle": <FaPalette style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Education": <FaGraduationCap style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Entertainment": <FaFilm style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Health & Wellness": <FaHeartbeat style={{ fontSize: '16px', color: '#26A69A' }} />,
  "DIY & Crafts": <FaTools style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Parenting": <FaBaby style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Sustainability": <FaLeaf style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Business & Finance": <FaChartLine style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Automotive": <FaCar style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Home & Garden": <FaHome style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Pets": <FaPaw style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Music": <FaMusic style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Books & Literature": <FaBook style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Movies & TV": <FaTv style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Sports": <FaFutbol style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Photography": <FaCamera style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Art & Design": <FaPaintBrush style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Science": <FaFlask style={{ fontSize: '16px', color: '#26A69A' }} />,
  "News & Politics": <FaNewspaper style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Humor & Memes": <FaLaughSquint style={{ fontSize: '16px', color: '#26A69A' }} />
};

const renderAudienceTargets = (audienceTarget) => {
  let targets = [];
  if (typeof audienceTarget === 'string') {
    try {
      targets = JSON.parse(audienceTarget);
    } catch (e) {
      targets = audienceTarget.split(',').map(t => t.trim());
    }
  } else if (Array.isArray(audienceTarget)) {
    targets = audienceTarget;
  }

  return (
    <Space size={6} wrap>
      {targets.length > 0 ? (
        targets.map((target, index) => (
          <motion.div key={index} variants={badgeVariants} initial="rest" whileHover="hover">
            <PlatformItem>
              {audienceIcons[target]}
              <span>{target}</span>
            </PlatformItem>
          </motion.div>
        ))
      ) : (
        <PlatformItem>
          <FaUserTie style={{ fontSize: '16px', color: '#26A69A' }} />
          <span>General</span>
        </PlatformItem>
      )}
    </Space>
  );
};

const renderTopics = (topics) => {
  let topicList = [];
  if (typeof topics === 'string') {
    try {
      topicList = JSON.parse(topics);
    } catch (e) {
      topicList = topics.split(',').map(t => t.trim());
    }
  } else if (Array.isArray(topics)) {
    topicList = topics;
  }

  return (
    <Space size={6} wrap>
      {topicList.length > 0 ? (
        topicList.map((topic, index) => (
          <motion.div key={index} variants={badgeVariants} initial="rest" whileHover="hover">
            <PlatformItem>
              {topicIcons[topic]}
              <span>{topic}</span>
            </PlatformItem>
          </motion.div>
        ))
      ) : (
        <PlatformItem>
          <FaPalette style={{ fontSize: '16px', color: '#26A69A' }} />
          <span>General</span>
        </PlatformItem>
      )}
    </Space>
  );
};

const BidBadge = styled(Tag)`
  margin: 6px 8px 6px 0;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, #6366f1, #818cf8);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.1);
`;

const BidTimestamp = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 4px;
  font-weight: normal;
`;

// eslint-disable-next-line no-unused-vars
const renderDeadlineTimer = (deadline) => {
  const now = moment();
  const deadlineMoment = moment(deadline);
  const hoursUntilDeadline = deadlineMoment.diff(now, 'hours');
  const isExpiringSoon = hoursUntilDeadline <= 24 && hoursUntilDeadline > 0;
  const isExpired = deadlineMoment.isBefore(now);

  return (
    <CardSection>
      <DeadlineTimer isExpiringSoon={isExpiringSoon} isExpired={isExpired}>
        <ClockCircleOutlined />
        {isExpiringSoon ? (
          <>
            <span>Closing Soon: {deadlineMoment.fromNow()}</span>
            <ExpiringBadge>
              <ClockCircleOutlined />
              {hoursUntilDeadline}h left
            </ExpiringBadge>
          </>
        ) : (
          <>
            Bidding Closes: {deadlineMoment.format('MMM DD, YYYY')}
            {!isExpired && <span>({deadlineMoment.fromNow()})</span>}
          </>
        )}
      </DeadlineTimer>
    </CardSection>
  );
};

// eslint-disable-next-line no-unused-vars
const SnippetPreview = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  margin: 12px 0;
  background: #f3f4f6;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

// eslint-disable-next-line no-unused-vars
const SnippetImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 12px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

// eslint-disable-next-line no-unused-vars
const SnippetVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 12px;
`;

// eslint-disable-next-line no-unused-vars
const PlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: translate(-50%, -50%) scale(1.1);
  }

  svg {
    color: white;
    font-size: 24px;
  }
`;



const Listing = () => {
  const [offers, setOffers] = useState([]);
  const [sponsorOffers, setSponsorOffers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [filteredOffers, setFilteredOffers] = useState([]); // Unused but retained
  const [filteredSponsorOffers, setFilteredSponsorOffers] = useState([]);
  const [activeTab, setActiveTab] = useState('sponsor');
  const [isLoading, setIsLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [savedDrawerVisible, setSavedDrawerVisible] = useState(false);
  const [savedOffers, setSavedOffers] = useState([]);
  const [savedOfferIds, setSavedOfferIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContentFormats, setSelectedContentFormats] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedAudienceTargets, setSelectedAudienceTargets] = useState([]);
  const [giftingInviteRequired, setGiftingInviteRequired] = useState(null);
  const [followerRange, setFollowerRange] = useState([0, 1000000]);
  const [minBidRange, setMinBidRange] = useState([0, 10000]);
  const [selectedProjectedViews, setSelectedProjectedViews] = useState([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [isSubscribeModalVisible, setIsSubscribeModalVisible] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [subscriptionPackages, setSubscriptionPackages] = useState([]);
  const [selectedCreatorId, setSelectedCreatorId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [selectedPackageId, setSelectedPackageId] = useState(null); // Unused but retained
  // eslint-disable-next-line no-unused-vars
  const [durationMonths, setDurationMonths] = useState(null); // Unused but retained
  // eslint-disable-next-line no-unused-vars
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [userRole, setUserRole] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [clientSecret, setClientSecret] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isBidModalVisible, setIsBidModalVisible] = useState(false);
  const [selectedSponsorOffer, setSelectedSponsorOffer] = useState(null);
  const [bidForm] = Form.useForm();
  const [expandedBriefs, setExpandedBriefs] = useState(new Set());
  const [userBids, setUserBids] = useState({});
  const { user, loading: userLoading } = useContext(UserContext);

  const navigate = useNavigate();
  const latestQueryRef = useRef(searchQuery);

  const contentFormats = [
    { type: "Reels", icon: <FaVideo style={{ color: '#26A69A', fontSize: '16px' }} /> },
    { type: "Stories", icon: <FaCamera style={{ color: '#26A69A', fontSize: '16px' }} /> },
    { type: "Short Videos", icon: <FaVideo style={{ color: '#26A69A', fontSize: '16px' }} /> },
    { type: "Live", icon: <MdOutlineLiveTv style={{ color: '#26A69A', fontSize: '16px' }} /> },
    { type: "Podcast", icon: <MdOutlineAudiotrack style={{ color: '#26A69A', fontSize: '16px' }} /> },
    { type: "Static Post", icon: <FiImage style={{ color: '#26A69A', fontSize: '16px' }} /> },
  ];
  
  const platforms = [
    { name: "Instagram", icon: <FaInstagram style={{ color: '#E1306C', fontSize: '16px' }} /> },
    { name: "TikTok", icon: <FaTiktok style={{ color: '#000000', fontSize: '16px' }} /> },
    { name: "YouTube", icon: <FaYoutube style={{ color: '#FF0000', fontSize: '16px' }} /> },
    { name: "Facebook", icon: <FaFacebook style={{ color: '#1877F2', fontSize: '16px' }} /> },
    { name: "Twitter", icon: <FaTwitter style={{ color: '#1DA1F2', fontSize: '16px' }} /> },
    { name: "LinkedIn", icon: <FaLinkedin style={{ color: '#0077B5', fontSize: '16px' }} /> },
    { name: "Snapchat", icon: <FaSnapchat style={{ color: '#FFFC00', fontSize: '16px' }} /> },
    { name: "Pinterest", icon: <FaPinterest style={{ color: '#E60023', fontSize: '16px' }} /> },
    { name: "Twitch", icon: <FaTwitch style={{ color: '#9146FF', fontSize: '16px' }} /> },
  ];

  const audienceTargets = [
    "Gen Z (18-24)", "Millennials (25-34)", "Gen X (35-54)", "Boomers (55+)", "Families",
    "Professionals", "Students", "Gamers", "Fitness Enthusiasts", "Fashion Lovers",
    "Tech Enthusiasts", "Foodies", "Travelers", "Beauty Enthusiasts", "Parents",
    "Pet Owners", "DIY Enthusiasts", "Music Lovers", "Book Readers", "Eco-Conscious",
    "Luxury Buyers", "Budget Shoppers",
  ];
  
  const topics = [
    "Fashion", "Beauty", "Fitness", "Gaming", "Travel", "Food & Drink", "Technology",
    "Lifestyle", "Education", "Entertainment", "Health & Wellness", "DIY & Crafts",
    "Parenting", "Sustainability", "Business & Finance", "Automotive", "Home & Garden",
    "Pets", "Music", "Books & Literature", "Movies & TV", "Sports", "Photography",
    "Art & Design", "Science", "News & Politics", "Humor & Memes",
  ];
  
  const viewBrackets = [
    "0-1K", "1K-5K", "5K-10K", "10K-50K", "50K-100K", "100K-500K", "500K+",
  ];


  useEffect(() => {
    if (userLoading) {
      // Still waiting for user context to determine authentication
      return;
    }

    if (!user) {
      // If no user, redirect to login. UserContext handles this but this is a safeguard.
      navigate('/login');
      return;
    }

    const fetchUserRoleAndOffers = async () => {
      try {
        setIsLoading(true);
        // We can now rely on the user object from context instead of fetching /api/session
        const userRole = user.role;
        setUserRole(userRole);
  
        if (!userRole) {
          console.warn('⚠️ No user role in context, redirecting to login');
          navigate('/login');
          return;
        } 
  
        latestQueryRef.current = searchQuery.trim();
        const params = new URLSearchParams();
  
        if (filtersApplied || searchQuery) {
          if (searchQuery) params.append('keyword', searchQuery);
          selectedContentFormats.forEach(cf => params.append('content_formats[]', cf));
          selectedPlatforms.forEach(p => params.append('platforms[]', p));
          selectedTopics.forEach(t => params.append('topics[]', t));
          selectedAudienceTargets.forEach(at => params.append('audience_targets[]', at));
          if (giftingInviteRequired) params.append('gifting_invite_required', giftingInviteRequired);
          if (followerRange[0] !== 0) params.append('min_followers', followerRange[0]);
          if (followerRange[1] !== 1000000) params.append('max_followers', followerRange[1]);
          if (minBidRange[0] !== 0) params.append('min_bid', minBidRange[0]);
          if (minBidRange[1] !== 10000) params.append('max_bid', minBidRange[1]);
          selectedProjectedViews.forEach(pv => params.append('projected_views[]', pv));
        }
  
        console.log('🟢 Fetching offers with params:', params.toString());
        const offersResponse = await api.get('/creator-offers', {
          params,
          withCredentials: true,
        });
  
        console.log("🟢 Raw Backend Response:", offersResponse.data);
        const data = Array.isArray(offersResponse.data) ? offersResponse.data : [];
        const validOffers = data.filter((offer) => {
        if (!offer || !offer.offer_id || !offer.type) {
          console.warn('Invalid offer in response:', offer);
          return false;
        }
        return true;
        });
        console.log("🟢 Filtered Offers:", validOffers);

      if (validOffers.length === 0) {
        console.warn('⚠️ No valid offers returned from backend');
        message.info('No creator offers available matching your criteria.');
      }

      if (latestQueryRef.current === searchQuery.trim()) {
        const sponsorOffers = validOffers
          .filter(offer => offer.type === 'Sponsor');
        const nonSponsorOffers = validOffers.filter(offer => offer.type !== 'Sponsor');

        console.log('🟢 Non-Sponsor Offers:', nonSponsorOffers);
        console.log('🟢 Sponsor Offers:', sponsorOffers);

        setOffers(nonSponsorOffers);
        setFilteredOffers(nonSponsorOffers);
        setSponsorOffers(sponsorOffers);
        setFilteredSponsorOffers(sponsorOffers);

        const saved = JSON.parse(localStorage.getItem('savedOffers')) || [];
        const validSavedOffers = saved.filter((offer) => offer && offer.offer_id);
        setSavedOffers(validSavedOffers);
        setSavedOfferIds(new Set(validSavedOffers.map((o) => o.offer_id)));

        console.log('🟢 Updated States:', {
          offers: nonSponsorOffers,
          filteredOffers: nonSponsorOffers,
          sponsorOffers,
          filteredSponsorOffers: sponsorOffers,
          savedOffers: validSavedOffers,
        });
      }
    } catch (error) {
      console.error('❌ Error fetching data:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        cookies: document.cookie,
      });
      message.error('Error fetching sponsor opportunities. Please try again.');
      if (error.response?.status === 403) {
        console.warn('⚠️ Unauthorized access, redirecting to login');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const debounceFetch = debounce(fetchUserRoleAndOffers, 300);
  debounceFetch();
  return () => debounceFetch.cancel();
}, [user, userLoading, searchQuery, filtersApplied, selectedContentFormats, selectedPlatforms, selectedTopics, 
    selectedAudienceTargets, giftingInviteRequired, followerRange, minBidRange, selectedProjectedViews, navigate]);
  
  useEffect(() => {
    // Load user's bids from localStorage
    const savedBids = JSON.parse(localStorage.getItem('userBids')) || {};
    setUserBids(savedBids);
  }, []);

  if (userLoading || isLoading) {
    return <Spin tip="Loading..." style={{ display: 'block', margin: '50px auto' }} />;
  }

  const handleCardClick = (creatorId) => {
    console.log("Navigating to creator profile:", `/creator/profile/${creatorId}`);
    navigate(`/creator/profile/${creatorId}`);
  };

  const toggleSaveOffer = (offer) => {
    const offerId = offer.offer_id;
    console.log("Saving offerId:", offerId, "Offer:", offer);
    const isAlreadySaved = savedOfferIds.has(offerId);
    const updatedSavedOffers = isAlreadySaved
      ? savedOffers.filter((o) => o.offer_id !== offerId)
      : [...savedOffers, offer];
    const updatedSavedOfferIds = new Set(updatedSavedOffers.map((o) => o.offer_id));

    console.log("Updated savedOfferIds:", [...updatedSavedOfferIds]);

    setSavedOffers(updatedSavedOffers);
    setSavedOfferIds(updatedSavedOfferIds);
    localStorage.setItem('savedOffers', JSON.stringify(updatedSavedOffers));

    notification[isAlreadySaved ? 'info' : 'success']({
      message: isAlreadySaved ? 'Offer Unsaved' : 'Offer Saved',
      description: `Offer "${offer.package_name}" has been ${isAlreadySaved ? 'removed from' : 'saved to'} your saved offers.`,
    });
  };

  const applyFilters = () => {
    setFiltersApplied(true);
    setDrawerVisible(false);
  
    // Filter non-Sponsor offers (retained for future use)
    const filteredNonSponsor = offers.filter(offer => {
      const matchesSearch = searchQuery
        ? offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          offer.package_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          offer.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesContentType = selectedContentFormats.length
        ? offer.content_format?.split(',').some(ct => selectedContentFormats.includes(ct.trim())) ||
          (offer.deliverables?.some(d => selectedContentFormats.includes(d.type)))
        : true;
      const matchesNiche = selectedTopics.length
        ? offer.niche?.some(n => selectedTopics.includes(n))
        : true;
      const matchesFollowers = offer.followers_count >= followerRange[0] && offer.followers_count <= followerRange[1];
      const matchesPrice = offer.price >= minBidRange[0] && offer.price <= minBidRange[1];
      const matchesAudienceAge = selectedAudienceTargets.length
        ? selectedAudienceTargets.includes(offer.primary_age_range)
        : true;
  
      return matchesSearch && matchesContentType && matchesNiche && matchesFollowers && matchesPrice && matchesAudienceAge;
    });
  
    // Filter Sponsor drafts
    const filteredSponsor = sponsorOffers.filter(offer => {
      const matchesSearch = searchQuery
        ? offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          offer.package_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          offer.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesContentFormat = selectedContentFormats.length
        ? offer.content_format?.split(',').some(cf => selectedContentFormats.includes(cf.trim()))
        : true;
      const matchesPlatforms = selectedPlatforms.length
        ? (Array.isArray(offer.platforms) ? offer.platforms : offer.platforms?.split(',') || []).some(p => selectedPlatforms.includes(p.trim()))
        : true;
      const matchesTopics = selectedTopics.length
        ? (Array.isArray(offer.topics) ? offer.topics : offer.topics?.split(',') || []).some(t => selectedTopics.includes(t.trim()))
        : true;
      const matchesAudienceTargets = selectedAudienceTargets.length
        ? (Array.isArray(offer.audience_target) ? offer.audience_target : offer.audience_target?.split(',') || []).some(at => selectedAudienceTargets.includes(at.trim()))
        : true;
      const matchesGiftingInvite = giftingInviteRequired
        ? offer.gifting_invite_required === giftingInviteRequired
        : true;
      const matchesFollowers = offer.followers_count >= followerRange[0] && offer.followers_count <= followerRange[1];
      const matchesMinBid = offer.min_bid >= minBidRange[0] && offer.min_bid <= minBidRange[1];
      const matchesProjectedViews = selectedProjectedViews.length
        ? selectedProjectedViews.includes(offer.projected_views)
        : true;
  
      return matchesSearch && matchesContentFormat && matchesPlatforms && matchesTopics && matchesAudienceTargets && matchesGiftingInvite && matchesFollowers && matchesMinBid && matchesProjectedViews;
    });
  
    setFilteredOffers(filteredNonSponsor);
    setFilteredSponsorOffers(filteredSponsor);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedContentFormats([]);
    setSelectedPlatforms([]);
    setSelectedTopics([]);
    setSelectedAudienceTargets([]);
    setGiftingInviteRequired(null);
    setFollowerRange([0, 1000000]);
    setMinBidRange([0, 10000]);
    setSelectedProjectedViews([]);
    setFiltersApplied(false);
    setFilteredOffers(offers);
    setFilteredSponsorOffers(sponsorOffers);
  };

  const fetchSubscriptionPackages = async (creatorId) => {
    try {
        const { data } = await api.get(`/creators/${creatorId}/subscription-packages`, { withCredentials: true });
        setSubscriptionPackages(data || []);
        setSelectedCreatorId(creatorId);
        setIsSubscribeModalVisible(true);
    } catch (error) {
        message.error("Failed to load subscription packages.");
    }
};

  const handleCollaborate = (offer) => {
    if (offer.type === 'Sponsor') {
      setSelectedSponsorOffer(offer);
      // If there's a previous bid, set it in the form
      if (userBids[offer.offer_id]) {
        bidForm.setFieldsValue({
          bid_amount: userBids[offer.offer_id].amount,
          pitch: userBids[offer.offer_id].pitch
        });
      } else {
        bidForm.resetFields();
      }
      setIsBidModalVisible(true);
    } else {
      fetchSubscriptionPackages(offer.creator_id);
    }
  };

  const handleSubmitBid = async (values) => {
    try {
      // Check if bid already exists
      if (userBids[selectedSponsorOffer.offer_id]) {
        const confirmUpdate = await Modal.confirm({
          title: 'Update Existing Bid',
          content: (
            <div>
              <p>You have already placed a bid of {require('../utils/currency').formatPrice(userBids[selectedSponsorOffer.offer_id].amount)} on this offer.</p>
              <p>Would you like to update your bid to {require('../utils/currency').formatPrice(values.bid_amount)}?</p>
            </div>
          ),
          okText: 'Update Bid',
          cancelText: 'Cancel',
          okButtonProps: { type: 'primary' }
        });

        if (!confirmUpdate) {
          return;
        }
      }

      // eslint-disable-next-line no-unused-vars
      const response = await api.post(
        `/sponsor-drafts/${selectedSponsorOffer.offer_id}/bid`,
        {
          creator_id: selectedSponsorOffer.creator_id,
          bid_amount: values.bid_amount,
          pitch: values.pitch,
        },
        { withCredentials: true }
      );

      // Update local bid tracking
      const updatedBids = {
        ...userBids,
        [selectedSponsorOffer.offer_id]: {
          amount: values.bid_amount,
          pitch: values.pitch,
          timestamp: new Date().toISOString()
        }
      };
      setUserBids(updatedBids);
      localStorage.setItem('userBids', JSON.stringify(updatedBids));

      message.success('Bid submitted successfully!');
      setIsBidModalVisible(false);
      bidForm.resetFields();
      notification.success({
        message: 'Bid Submitted',
        description: `Your bid of ${require('../utils/currency').formatPrice(values.bid_amount)} for "${selectedSponsorOffer.package_name}" has been submitted.`,
      });
    } catch (error) {
      console.error('Error submitting bid:', error.response?.data || error.message);
      
      // Handle specific error cases
      if (error.response?.data?.error === 'You already submitted a bid for this draft') {
        Modal.error({
          title: 'Bid Already Submitted',
          content: (
            <div>
              <p>You have already submitted a bid for this offer.</p>
              <p>Now awaiting creator to review your bid.</p>
            </div>
          ),
          okText: 'OK'
        });
      } else {
      message.error('Failed to submit bid. Please try again.');
      }
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleSubscribe = async (packageId) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const response = await api.post(
        `/subscriptions/${packageId}/subscribe`,
        { payment_method: paymentMethod },
        { withCredentials: true }
      );
      console.log("Subscription response:", response.data);
      const { subscription_id, payment } = response.data;

      if (paymentMethod === "stripe") {
        localStorage.setItem("pendingSubscriptionId", subscription_id);
        localStorage.setItem("pendingPaymentIntentId", payment.payment_intent_id || "");
        setSelectedBooking({ subscription_id, type: "Subscription" });
        setClientSecret(payment.client_secret);
        setIsPaymentModalVisible(true);
      } else if (paymentMethod === "paypal") {
        localStorage.setItem("pendingSubscriptionId", subscription_id);
        window.location.href = payment.approval_url;
      }
      setIsSubscribeModalVisible(false);
    } catch (error) {
      console.error("🔥 Error subscribing:", error.response?.data || error.message);
      message.error(`Failed to initiate subscription payment: ${error.response?.data?.error || error.message}. Please try again or contact support.`);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handlePaymentSuccess = async (paymentIntentId, id, isSubscription = true) => {
    try {
      console.log(`📌 Completing payment for subscription ${id} with intent ${paymentIntentId}`);
      // eslint-disable-next-line no-unused-vars
      const response = await api.post(
        `/subscriptions/${id}/complete-payment`,
        { payment_intent_id: paymentIntentId },
        { withCredentials: true }
      );
      console.log(`✅ Payment completed successfully:`, response.data);
      message.success("Subscription payment completed successfully!");
      setIsPaymentModalVisible(false);
      setClientSecret(null);
      setSelectedBooking(null);
      localStorage.removeItem("pendingSubscriptionId");
      localStorage.removeItem("pendingPaymentIntentId");
      navigate('/brand/dashboard/bookings');
    } catch (error) {
      console.error("🔥 Payment error:", error.response?.data || error);
      message.error(`Failed to complete payment: ${error.response?.data?.error || error.message}`);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleSaveFromModal = (pkg) => {
    const creatorData = offers.find(o => o.creator_id === selectedCreatorId);
    const offer = {
      offer_id: pkg.id,
      creator_id: selectedCreatorId,
      package_name: pkg.package_name,
      price: pkg.price,
      description: pkg.description,
      deliverables: pkg.deliverables,
      frequency: pkg.frequency,
      name: creatorData?.name,
      image_profile: creatorData?.image_profile,
      platforms: creatorData?.platforms,
      followers_count: creatorData?.followers_count,
      type: 'Subscription',
    };
    toggleSaveOffer(offer);
  };

  const renderPlatformsAndFollowers = (socialLinks) => (
    <Space size={8} wrap>
        {socialLinks && Array.isArray(socialLinks) && socialLinks.length > 0 ? (
            socialLinks.map((link, index) => (
                <span key={index} style={{ display: 'flex', alignItems: 'center' }}>
                    {platformLogos[link.platform] || <span>{link.platform}</span>}
                    <span style={{ marginLeft: '4px' }}>{formatFollowers(link.followersCount)}</span>
                </span>
          ))
        ) : (
            <span>No social links available</span>
        )}
      </Space>
    );

  // eslint-disable-next-line no-unused-vars
  const renderNiches = (niche) => (
    <Space size={6} wrap>
      {niche && Array.isArray(niche) && niche.length > 0 ? (
        niche.map((n, index) => (
          <motion.div key={index} variants={badgeVariants} initial="rest" whileHover="hover">
            <NicheTag>{n}</NicheTag>
          </motion.div>
        ))
      ) : (
        <NicheTag>General</NicheTag>
      )}
    </Space>
  );

  const renderDeliverables = (deliverables, contentType, offerType) => (
    <Space size={6} wrap>
      {deliverables && Array.isArray(deliverables) ? (
        deliverables.map((item, index) => (
          <motion.div key={index} variants={badgeVariants} initial="rest" whileHover="hover">
            <ContentBadge gradient={getTagColor(item.type)}>
              {getTagIcon(item.type)}
              {item.quantity}x {item.type} ({item.platform})
            </ContentBadge>
          </motion.div>
        ))
      ) : contentType ? (
        contentType.split(',').map((type, index) => (
          <motion.div key={index} variants={badgeVariants} initial="rest" whileHover="hover">
            <ContentBadge gradient={getTagColor(type.trim())}>
              {getTagIcon(type.trim())}
              {type.trim()}
            </ContentBadge>
          </motion.div>
        ))
      ) : offerType === 'Sponsor' ? (
        <motion.div variants={badgeVariants} initial="rest" whileHover="hover">
          <ContentBadge gradient={getTagColor('Sponsored Content')}>
            {getTagIcon('Sponsored Content')}
            Sponsored Content
          </ContentBadge>
        </motion.div>
      ) : (
        <span style={{ color: '#6b7280' }}>N/A</span>
      )}
    </Space>
  );

  const activeFilterCount = [
    ...selectedContentFormats,
    ...selectedPlatforms,
    ...selectedTopics,
    ...selectedAudienceTargets,
    giftingInviteRequired ? 'giftingInviteRequired' : null,
    followerRange[0] !== 0 || followerRange[1] !== 1000000 ? 'followers' : null,
    minBidRange[0] !== 0 || minBidRange[1] !== 10000 ? 'minBid' : null,
    ...selectedProjectedViews,
  ].filter(Boolean).length;

  const toggleBrief = (offerId) => {
    setExpandedBriefs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(offerId)) {
        newSet.delete(offerId);
      } else {
        newSet.add(offerId);
      }
      return newSet;
    });
  };

  const getBidModalTitle = () => {
    if (selectedSponsorOffer && userBids[selectedSponsorOffer.offer_id]) {
      return "Update your bid for this content";
    }
    return "Propose your budget for this content";
  };

  const renderBidStatus = (offer) => {
    if (userBids[offer.offer_id]) {
      return (
        <BidBadge>
          <DollarCircleOutlined />
          Your Bid: {require('../utils/currency').formatPrice(userBids[offer.offer_id].amount)}
          <BidTimestamp>
            • {moment(userBids[offer.offer_id].timestamp).fromNow()}
          </BidTimestamp>
        </BidBadge>
      );
    }
    return null;
  };

  const renderBidModalContent = () => {
    if (!selectedSponsorOffer) return null;

    const existingBid = userBids[selectedSponsorOffer.offer_id];
    const minBid = selectedSponsorOffer.min_bid;

    return (
      <Form
        form={bidForm}
        onFinish={handleSubmitBid}
        layout="vertical"
      >
        {existingBid && (
          <div style={{ 
            marginBottom: 20, 
            padding: 16, 
            background: '#f0fdfa', 
            borderRadius: 8,
            border: '1px solid #d1fae5'
          }}>
            <Typography.Title level={5} style={{ margin: 0, color: '#065f46' }}>
              Current Bid
            </Typography.Title>
            <div style={{ marginTop: 8 }}>
              <Typography.Text strong style={{ fontSize: '1.1rem', color: '#065f46' }}>
                {require('../utils/currency').formatPrice(existingBid.amount)}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                • Placed {moment(existingBid.timestamp).fromNow()}
              </Typography.Text>
            </div>
            <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Previous pitch: "{existingBid.pitch}"
            </Typography.Text>
          </div>
        )}
        <div style={{ 
          marginBottom: 20, 
          padding: 16, 
          background: '#f8fafc', 
          borderRadius: 8,
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <DollarCircleOutlined style={{ color: '#6366f1', fontSize: '1.25rem' }} />
            <Typography.Title level={5} style={{ margin: 0, color: '#1e293b' }}>
              Minimum Budget Required
            </Typography.Title>
          </div>
          <Typography.Text strong style={{ fontSize: '1.25rem', color: '#6366f1' }}>
            €{minBid.toLocaleString()}
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
            { type: 'number', min: minBid, message: `Bid must be at least ${require('../utils/currency').formatPrice(minBid)}` },
          ]}
          extra={
            <Typography.Text type="secondary" style={{ fontSize: '0.875rem' }}>
              Enter an amount equal to or higher than {require('../utils/currency').formatPrice(minBid)}
            </Typography.Text>
          }
        >
          <InputNumber
            min={minBid}
            style={{ width: '100%' }}
            formatter={(value) => `€ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(/€\s?|(,*)/g, '')}
          />
        </Form.Item>
        <Form.Item
          label="Message"
          name="pitch"
          rules={[{ required: true, message: 'Please provide a pitch for your bid' }]}
        >
          <Input.TextArea rows={4} placeholder="Let the creator know you're the perfect brand for this content" />
        </Form.Item>
        <Space style={{ marginTop: 20, width: '100%', justifyContent: 'space-between' }}>
          <ActionButton type="primary" htmlType="submit" primary>
            {existingBid ? 'Update Bid' : 'Submit Bid'}
          </ActionButton>
          <ActionButton
            onClick={() => {
              setIsBidModalVisible(false);
              bidForm.resetFields();
            }}
          >
            Cancel
          </ActionButton>
        </Space>
      </Form>
    );
  };

  return (
    <Container>
      <Header>
        <SearchWrapper>
          <StyledInput
            placeholder="Search creators or offers..."
            prefix={<SearchOutlined style={{ color: '#6b7280' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search creators or offers"
          />
          <ActionButtonsWrapper>
          <FilterBadge count={activeFilterCount}>
              <ActionButton
              type="default"
              icon={<FilterOutlined />}
              onClick={() => setDrawerVisible(true)}
              aria-label="Open filters"
            >
              Filters
              </ActionButton>
          </FilterBadge>
            <ActionButton
            type="default"
            onClick={() => setSavedDrawerVisible(true)}
            aria-label="View saved offers"
          >
            Saved
            </ActionButton>
          </ActionButtonsWrapper>
        </SearchWrapper>
      </Header>

      <TabsWrapper activeKey={activeTab} onChange={setActiveTab}>
      <TabPane tab="Sponsor Opportunities" key="sponsor">
          {isLoading ? (
    <Spin tip="Loading sponsor opportunities..." style={{ display: 'block', margin: '50px auto' }} />
          ) : (
    <Row gutter={[24, 24]}>
      {filteredSponsorOffers.map((offer) => {
        // Validate offer to prevent undefined errors
        if (!offer || !offer.offer_id) {
          console.warn('Invalid offer detected:', offer);
          return null;
        }
        return (
          <Col 
            xs={24} 
            sm={24} 
            md={12} 
            lg={8} 
            xl={6} 
            key={offer.offer_id}
            style={{ 
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <motion.div 
              variants={cardVariants} 
              initial="hidden" 
              animate="visible"
              style={{ height: '100%' }}
            >
                    <OfferCard onClick={() => handleCardClick(offer.creator_id)}>
                      <CardTitle>
                  <CreatorAvatar src={offer.image_profile || 'https://via.placeholder.com/64'} size={48} />
                  <CreatorName>@{offer.name}</CreatorName>
                      </CardTitle>
                      <CardContent>
                  <CardSection>
                          {renderPlatformsAndFollowers(offer.social_links)}
                  </CardSection>
                  <CardSection>
                    <SectionTitle>Platforms</SectionTitle>
                    <Space size={6} wrap>
                      {offer.platforms && (Array.isArray(offer.platforms) ? offer.platforms : offer.platforms.split(',').map(p => p.trim())).map((platform, index) => (
                        <span key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {platformLogos[platform] || null}
                          {platform}
                        </span>
                      ))}
                    </Space>
                  </CardSection>
                  <CardSection>
                    <SectionTitle>Audience</SectionTitle>
                    {renderAudienceTargets(offer.audience_target)}
                  </CardSection>
                  <CardSection>
                    <SectionTitle>Topics</SectionTitle>
                    {renderTopics(offer.topics)}
                  </CardSection>
                  <CardSection isContentBrief>
                    <SectionTitle>Content Brief</SectionTitle>
                    <div style={{ position: 'relative' }}>
                      {(() => {
                        // More comprehensive check for long content
                        const description = offer.description || '';
                        const lineCount = description.split('\n').length;
                        const charCount = description.length;
                        const wordCount = description.split(/\s+/).length;
                        
                        // Consider content long if it has more than 2 lines, 150 characters, or 20 words
                        const isLongContent = lineCount > 2 || charCount > 150 || wordCount > 20;
                        const isExpanded = expandedBriefs.has(offer.offer_id);
                        
                        // Debug logging
                        console.log(`Content Brief Debug for ${offer.offer_id}:`, {
                          description: description.substring(0, 100) + '...',
                          lineCount,
                          charCount,
                          wordCount,
                          isLongContent,
                          isExpanded
                        });
                        
                        return (
                          <>
                            <ContentBrief 
                              expanded={isExpanded}
                              isLongContent={isLongContent}
                            >
                              <Typography.Text style={{ fontSize: '0.875rem', lineHeight: '1.5', color: '#4b5563' }}>
                                {offer.description}
                              </Typography.Text>
                            </ContentBrief>
                            {isLongContent && (
                              <ExpandButton 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBrief(offer.offer_id);
                                }}
                              >
                                {isExpanded ? (
                                  <>
                                    Show Less <UpOutlined />
                                  </>
                                ) : (
                                  <>
                                    Read More <DownOutlined />
                                  </>
                                )}
                              </ExpandButton>
                            )}
                          </>
                        );
                      })()}
                        </div>
                  </CardSection>
                  {offer.type === 'Sponsor' && (
                    <CardSection>
                      {offer.snippet_url ? (
                        <VideoContainer>
                          <StyledVideo 
                            controls 
                            src={offer.snippet_url}
                            onError={(e) => {
                              console.error('Video loading error for Offer ID:', offer.offer_id, 'Error:', e);
                              console.log('Snippet URL:', offer.snippet_url);
                              e.target.style.display = 'none';
                              e.target.insertAdjacentHTML('afterend', '<div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #6b7280; font-size: 0.875rem;">Video preview unavailable</div>');
                            }}
                          />
                        </VideoContainer>
                      ) : (
                        <Typography.Text type="secondary" style={{ fontSize: '0.875rem', display: 'block', color: '#6b7280' }}>
                            No video preview available
                          </Typography.Text>
                      )}
                    </CardSection>
                      )}
                  <CardSection>
                    {renderDeliverables(offer.deliverables, offer.content_format, offer.type)}
                  </CardSection>
                  <CardSection>
                      <BidHighlight>
                      <DollarCircleOutlined style={{ fontSize: '1.125rem' }} />
                        Min Bid: {require('../utils/currency').formatPrice(offer.min_bid)}
                      </BidHighlight>
                  </CardSection>
                  <CardSection>
                    {renderBidStatus(offer)}
                  </CardSection>
                  <CardSection>
                    <Typography.Text strong style={{ color: '#111827' }}>
                        Projected Views: {offer.projected_views}
                    </Typography.Text>
                  </CardSection>
                </CardContent>
                <CardFooter>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <ActionButton
                          type="link"
                          icon={savedOfferIds.has(offer.offer_id) ? <StarFilled style={{ color: '#f59e0b' }} /> : <StarOutlined />}
                          onClick={(e) => { e.stopPropagation(); toggleSaveOffer(offer); }}
                          size="small"
                        >
                          {savedOfferIds.has(offer.offer_id) ? 'Saved' : 'Save'}
                    </ActionButton>
                        {userRole !== 'creator' && (
                      <ActionButton
                            type="primary"
                            onClick={(e) => { e.stopPropagation(); handleCollaborate(offer); }}
                          >
                            Place Bid
                      </ActionButton>
                        )}
                      </Space>
                </CardFooter>
                  </OfferCard>
                </motion.div>
              </Col>
        );
      })}
          </Row>
        )}
      </TabPane>
      </TabsWrapper>

      <Drawer
  title={<span style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>Filters</span>}
  placement="right"
  onClose={() => setDrawerVisible(false)}
  open={drawerVisible}
  width={350}
  bodyStyle={{ background: '#f9fafb' }}
>
  <DrawerContent>
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <div>
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', marginBottom: 12 }}>Content Format</h4>
        <Select
          mode="multiple"
          value={selectedContentFormats}
          onChange={setSelectedContentFormats}
          style={{ width: '100%', borderRadius: '12px' }}
          placeholder="Select content formats"
          dropdownStyle={{ borderRadius: '12px' }}
        >
          {contentFormats.map((format) => (
            <Option key={format.type} value={format.type}>
              <Space>
                {format.icon}
                <span>{format.type}</span>
              </Space>
            </Option>
          ))}
        </Select>
      </div>
      <div>
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', marginBottom: 12 }}>Platforms</h4>
        <Select
          mode="multiple"
          value={selectedPlatforms}
          onChange={setSelectedPlatforms}
          style={{ width: '100%', borderRadius: '12px' }}
          placeholder="Select platforms"
          dropdownStyle={{ borderRadius: '12px' }}
        >
          {platforms.map((platform) => (
            <Option key={platform.name} value={platform.name}>
              <Space>
                {platform.icon}
                <span>{platform.name}</span>
              </Space>
            </Option>
          ))}
        </Select>
      </div>
      <div>
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', marginBottom: 12 }}>Topics</h4>
        <Select
          mode="multiple"
          value={selectedTopics}
          onChange={setSelectedTopics}
          style={{ width: '100%', borderRadius: '12px' }}
          placeholder="Select topics"
          dropdownStyle={{ borderRadius: '12px' }}
        >
          {topics.map((topic) => (
            <Option key={topic} value={topic}>
              <Space>
                {topicIcons[topic]}
                <span>{topic}</span>
              </Space>
            </Option>
          ))}
        </Select>
      </div>
      <div>
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', marginBottom: 12 }}>Audience Targets</h4>
        <Select
          mode="multiple"
          value={selectedAudienceTargets}
          onChange={setSelectedAudienceTargets}
          style={{ width: '100%', borderRadius: '12px' }}
          placeholder="Select audience targets"
          dropdownStyle={{ borderRadius: '12px' }}
        >
          {audienceTargets.map((target) => (
            <Option key={target} value={target}>
              <Space>
                {audienceIcons[target]}
                <span>{target}</span>
              </Space>
            </Option>
          ))}
        </Select>
      </div>
      <div>
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', marginBottom: 12 }}>Gifting/Invite Required</h4>
        <Select
          value={giftingInviteRequired}
          onChange={setGiftingInviteRequired}
          style={{ width: '100%', borderRadius: '12px' }}
          placeholder="Select gifting requirement"
          dropdownStyle={{ borderRadius: '12px' }}
          allowClear
        >
          <Option value="Yes">Yes</Option>
          <Option value="No">No</Option>
        </Select>
      </div>
      <div>
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', marginBottom: 12 }}>Followers</h4>
        <Slider
          range
          value={followerRange}
          onChange={setFollowerRange}
          min={0}
          max={1000000}
          step={1000}
          marks={{ 0: '0', 1000000: '1M' }}
          tooltip={{ formatter: (value) => formatFollowers(value) }}
        />
      </div>
      <div>
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', marginBottom: 12 }}>Min Bid</h4>
        <Slider
          range
          value={minBidRange}
          onChange={setMinBidRange}
          min={0}
          max={10000}
          step={10}
          marks={{ 0: require('../utils/currency').formatPrice(0), 10000: require('../utils/currency').formatPrice(10000) }}
          tooltip={{ formatter: (value) => require('../utils/currency').formatPrice(value) }}
        />
      </div>
      <div>
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', marginBottom: 12 }}>Projected Views</h4>
        <Select
          mode="multiple"
          value={selectedProjectedViews}
          onChange={setSelectedProjectedViews}
          style={{ width: '100%', borderRadius: '12px' }}
          placeholder="Select views brackets"
          dropdownStyle={{ borderRadius: '12px' }}
        >
          {viewBrackets.map((bracket) => (
            <Option key={bracket} value={bracket}>{bracket}</Option>
          ))}
        </Select>
      </div>
      <Space style={{ marginTop: 24, width: '100%', justifyContent: 'space-between' }}>
        <ActionButton
          type="primary"
          onClick={applyFilters}
          primary
          style={{ flex: 1 }}
          aria-label="Apply filters"
        >
          Apply Filters
        </ActionButton>
        <ActionButton
          onClick={clearFilters}
          style={{ flex: 1 }}
          aria-label="Clear filters"
        >
          Clear
        </ActionButton>
      </Space>
    </Space>
  </DrawerContent>
</Drawer>

      <Drawer
        title={<span style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>Saved Offers</span>}
        placement="right"
        onClose={() => setSavedDrawerVisible(false)}
        open={savedDrawerVisible}
        width={400}
        bodyStyle={{ background: '#f9fafb' }}
      >
        <DrawerContent>
          {savedOffers.length > 0 ? (
            savedOffers.map((offer) => (
              <Card
                key={offer.offer_id}
                style={{ marginBottom: 16, borderRadius: 12, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
                actions={[
                  <ActionButton
                    type="link"
                    onClick={(e) => { e.stopPropagation(); toggleSaveOffer(offer); }}
                    aria-label="Unsave offer"
                  >
                    Unsave
                  </ActionButton>,
                  userRole !== 'creator' && (
                    <ActionButton
                      type="primary"
                      primary
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleCollaborate(offer); }}
                      aria-label={offer.type === 'Sponsor' ? 'Bid on opportunity' : 'Collaborate with creator'}
                    >
                      {offer.type === 'Sponsor' ? 'Place Bid' : 'Collaborate'}
                    </ActionButton>
                  ),
                ].filter(Boolean)}
              >
                <CardTitle style={{ fontSize: '18px', color: '#1f2937' }}>
                  <Space>
                    <Avatar src={offer.image_profile || 'https://via.placeholder.com/48'} size={48} />
                    @{offer.name}
                  </Space>
                </CardTitle>
                <CardContent>
                  {offer.type === 'Sponsor' && (
                    <div style={{ margin: '10px 0' }}>
                      <SponsorBadge>Sponsor Opportunity</SponsorBadge>
                    </div>
                  )}
                  <div style={{ margin: '10px 0' }}>
                    {renderPlatformsAndFollowers(offer.social_links)}
                  </div>
                  <div style={{ margin: '10px 0' }}>{renderDeliverables(offer.deliverables, offer.content_format, offer.type)}</div>
                  <p style={{ fontWeight: 600, color: '#1f2937' }}>
                    {offer.type === 'Sponsor' ? 'Min Bid:' : 'Price:'} {require('../utils/currency').formatPrice(offer.type === 'Sponsor' ? offer.min_bid : offer.price)} {offer.frequency ? `/ ${offer.frequency}` : offer.type === 'Sponsor' ? '(Bid)' : ''}
                  </p>
                  {offer.type === 'Sponsor' && (
                    <>
                      <p style={{ fontWeight: 600, color: '#1f2937' }}>
                        Projected Views: {offer.projected_views}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
              No saved offers yet.
            </p>
          )}
        </DrawerContent>
      </Drawer>

      <Modal
        title={<span style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>{getBidModalTitle()}</span>}
        open={isBidModalVisible}
        onCancel={() => {
          setIsBidModalVisible(false);
          bidForm.resetFields();
        }}
        footer={null}
        width={450}
        bodyStyle={{ background: '#f9fafb' }}
      >
        <ModalContent>
          {renderBidModalContent()}
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Listing;