import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Form, Input, Button, Row, Col, Select, InputNumber, message, Typography, Upload } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { FaInstagram, FaTiktok, FaYoutube, FaSnapchat, FaTwitch } from 'react-icons/fa';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { UserContext } from '../../contexts/UserContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../config/api';
import { submitCreatorProfileToIndexNow } from '../../utils/indexNow';

const { TextArea } = Input;
// eslint-disable-next-line no-unused-vars
const { Option } = Select;
// eslint-disable-next-line no-unused-vars
const { Text } = Typography;

const GradientBg = styled.div`
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  position: relative;
  
  /* Blurred backdrop effect */
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: inherit;
    filter: blur(20px);
    opacity: 0.5;
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    align-items: flex-start;
    padding-top: 2rem;
    padding: 1.5rem 0.5rem;
    min-height: 100vh;
  }
  
  @media (max-width: 480px) {
    padding-top: 1rem;
    padding: 1rem 0.5rem;
    align-items: flex-start;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 520px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: stretch;
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    border-radius: 20px;
    margin: 0;
    max-width: 100%;
  }
  
  @media (max-width: 480px) {
    padding: 1.75rem 1.25rem;
    border-radius: 16px;
    gap: 1.25rem;
  }
`;

const StepIndicators = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 2rem;
  margin-top: 0.5rem;
`;

const StepDot = styled(motion.div)`
  width: ${props => props.active ? '10px' : '8px'};
  height: ${props => props.active ? '10px' : '8px'};
  border-radius: 50%;
  background: ${props => props.active ? '#26A69A' : '#D1D5DB'};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.active ? '#26A69A' : '#9CA3AF'};
  }
`;
const StepTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 0.5rem;
  margin-top: 0;
  text-align: left;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -0.02em;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.375rem;
  }
`;
const StepDesc = styled.div`
  color: #6B7280;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 1.75rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }
`;

const NavigationRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  gap: 1rem;
  
  @media (max-width: 480px) {
    margin-top: 1.5rem;
    gap: 0.75rem;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid #E5E7EB;
  color: #374151;
  font-weight: 500;
  font-size: 0.95rem;
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  &:hover:not(:disabled) {
    border-color: #26A69A;
    color: #26A69A;
    background: rgba(38, 166, 154, 0.05);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    font-size: 0.875rem;
    padding: 0.625rem 1rem;
    border-radius: 10px;
  }
`;

const NextButton = styled.button`
  flex: 1;
  background: #26A69A;
  color: #FFFFFF;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(38, 166, 154, 0.25);
  box-sizing: border-box;
  min-height: 44px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  &:hover:not(:disabled) {
    background: #208B7F;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(38, 166, 154, 0.35);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.7rem 1.25rem;
    min-height: 42px;
  }
  
  @media (max-width: 480px) {
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 0.625rem 1rem;
    border-radius: 10px;
    min-height: 44px;
  }
`;
// eslint-disable-next-line no-unused-vars
const SkipButton = styled.button`
  flex: 1;
  background: none;
  border: none;
  color: #8B5CF6;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
  &:hover {
    color: #7C3AED;
  }
`;
// Updated Select styling to match modern design
const StyledSelect = styled(Select)`
  .ant-select-selector {
    border-radius: 12px !important;
    border: 1.5px solid #E5E7EB !important;
    padding: 0.625rem 1rem !important;
    font-size: 16px !important;
    transition: all 0.2s ease !important;
    min-height: 44px !important;
  }
  
  &:hover .ant-select-selector {
    border-color: #D1D5DB !important;
  }
  
  &.ant-select-focused .ant-select-selector {
    border-color: #26A69A !important;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.1) !important;
  }
  
  @media (max-width: 480px) {
    .ant-select-selector {
      border-radius: 10px !important;
      padding: 0.5rem 0.875rem !important;
      min-height: 44px !important;
    }
  }
`;

// Modern input styling with better visual design
const MobileOptimizedInput = styled(Input)`
  font-size: 16px !important; /* Prevent zoom on iOS */
  border-radius: 12px !important;
  border: 1.5px solid #E5E7EB !important;
  padding: 0.875rem 1rem !important;
  transition: all 0.2s ease !important;
  
  &:hover {
    border-color: #D1D5DB !important;
  }
  
  &:focus {
    border-color: #26A69A !important;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.1) !important;
  }
  
  @media (max-width: 480px) {
    font-size: 16px !important;
    border-radius: 10px !important;
    padding: 0.75rem 0.875rem !important;
  }
`;

const MobileOptimizedTextArea = styled(TextArea)`
  font-size: 16px !important; /* Prevent zoom on iOS */
  border-radius: 12px !important;
  border: 1.5px solid #E5E7EB !important;
  padding: 0.875rem 1rem !important;
  transition: all 0.2s ease !important;
  
  &:hover {
    border-color: #D1D5DB !important;
  }
  
  &:focus {
    border-color: #26A69A !important;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.1) !important;
  }
  
  @media (max-width: 480px) {
    font-size: 16px !important;
    border-radius: 10px !important;
    padding: 0.75rem 0.875rem !important;
  }
`;

const MobileOptimizedInputNumber = styled(InputNumber)`
  width: 100% !important;
  
  /* Remove ALL wrapper borders and shadows */
  &,
  .ant-input-number,
  .ant-input-number-input-wrap,
  .ant-input-number-handler-wrap {
    border: none !important;
    box-shadow: none !important;
    outline: none !important;
  }
  
  /* Style only the actual input element */
  .ant-input-number-input {
    font-size: 16px !important; /* Prevent zoom on iOS */
    border-radius: 12px !important;
    border: 1.5px solid #E5E7EB !important;
    padding: 0.875rem 1rem !important;
    transition: all 0.2s ease !important;
    background: #FFFFFF !important;
    width: 100% !important;
  }
  
  &:hover .ant-input-number-input {
    border-color: #D1D5DB !important;
  }
  
  &.ant-input-number-focused .ant-input-number-input {
    border-color: #26A69A !important;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.1) !important;
  }
  
  /* Hide spinner controls for cleaner look */
  .ant-input-number-handler-wrap {
    display: none !important;
  }
  
  @media (max-width: 480px) {
    .ant-input-number-input {
      font-size: 16px !important;
      border-radius: 10px !important;
      padding: 0.75rem 0.875rem !important;
    }
  }
`;

// Removed socialPlatforms - no longer needed with individual input fields

const SocialInputWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  background: #F9FAFB;
  border-radius: 12px;
  border: 1.5px solid #E5E7EB;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #D1D5DB;
    background: #FFFFFF;
  }
  
  &:focus-within {
    border-color: #26A69A;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.1);
  }
`;

const SocialIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  min-width: 48px;
  height: 100%;
  
  svg, img {
    width: 24px;
    height: 24px;
    color: #1F2937;
  }
  
  @media (max-width: 480px) {
    padding: 0 0.75rem;
    min-width: 44px;
    
    svg, img {
      width: 20px;
      height: 20px;
    }
  }
`;

const SocialInput = styled(MobileOptimizedInput)`
  border: none !important;
  background: transparent !important;
  padding-left: 0 !important;
  padding-right: 1rem !important;
  box-shadow: none !important;
  
  &:focus {
    border: none !important;
    box-shadow: none !important;
  }
  
  &::placeholder {
    color: #9CA3AF;
  }
`;

const OtherInputLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const FollowerCountWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  background: #F9FAFB;
  border-radius: 12px;
  border: 1.5px solid #E5E7EB;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #D1D5DB;
    background: #FFFFFF;
  }
  
  &:focus-within {
    border-color: #26A69A;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.1);
  }
`;

const FollowerCountIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  min-width: 48px;
  height: 100%;
  color: #6B7280;
  font-size: 0.875rem;
  font-weight: 500;
  
  @media (max-width: 480px) {
    padding: 0 0.75rem;
    min-width: 44px;
    font-size: 0.8rem;
  }
`;

const FollowerCountInput = styled(MobileOptimizedInputNumber)`
  border: none !important;
  background: transparent !important;
  padding-left: 0 !important;
  padding-right: 1rem !important;
  box-shadow: none !important;
  width: 100% !important;
  
  .ant-input-number-input {
    border: none !important;
    background: transparent !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    box-shadow: none !important;
  }
  
  &:focus .ant-input-number-input {
    border: none !important;
    box-shadow: none !important;
  }
  
  &::placeholder {
    color: #9CA3AF;
  }
`;

const OtherInputWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;
  background: #F9FAFB;
  border-radius: 12px;
  border: 1.5px solid #E5E7EB;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #D1D5DB;
    background: #FFFFFF;
  }
  
  &:focus-within {
    border-color: #26A69A;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.1);
  }
  
  input {
    border: none !important;
    background: transparent !important;
    padding: 0.875rem 1rem !important;
    box-shadow: none !important;
    
    &:focus {
      border: none !important;
      box-shadow: none !important;
    }
  }
`;
const DeleteButton = styled(Button)`
  position: absolute;
  top: -12px;
  right: -12px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 4px;
  &:hover {
    background: #fff1f2;
    color: #ef4444;
  }
`;

const ageRangeOptions = [
  { value: '18-24', label: '18-24' },
  { value: '25-34', label: '25-34' },
  { value: '35-44', label: '35-44' },
  { value: '45-54', label: '45-54' },
  { value: '55+', label: '55+' },
];
const regionsOptions = [
  { value: 'North America', label: 'North America' },
  { value: 'Europe', label: 'Europe' },
  { value: 'Asia', label: 'Asia' },
  { value: 'Africa', label: 'Africa' },
  { value: 'South America', label: 'South America' },
];
const nichesOptions = [
  { value: 'Beauty & Fashion', label: 'Beauty & Fashion' },
  { value: 'Fitness & Wellness', label: 'Fitness & Wellness' },
  { value: 'Tech & Gadgets', label: 'Tech & Gadgets' },
  { value: 'Food & Nutrition', label: 'Food & Nutrition' },
  { value: 'Travel & Adventure', label: 'Travel & Adventure' },
  { value: 'Gaming', label: 'Gaming' },
  { value: 'Music & Entertainment', label: 'Music & Entertainment' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Health & Medical', label: 'Health & Medical' },
  { value: 'Finance & Business', label: 'Finance & Business' },
  { value: 'Parenting & Family', label: 'Parenting & Family' },
  { value: 'Arts & Crafts', label: 'Arts & Crafts' },
  { value: 'Science & Education', label: 'Science & Education' },
];

const steps = [
  {
    title: "Let's set up your profile!",
    desc: 'Add your basics: photo, bio, country, and phone.',
    content: <div style={{ minHeight: 120 }}>Step 1 placeholder (Basics)</div>,
  },
  {
    title: 'Link your social accounts',
    desc: 'Add your platforms, URLs, and follower counts.',
    content: <div style={{ minHeight: 120 }}>Step 2 placeholder (Platforms)</div>,
  },
  {
    title: 'Help brands understand your audience',
    desc: 'Share your age range, regions, and interests.',
    content: <div style={{ minHeight: 120 }}>Step 3 placeholder (Audience)</div>,
  },
  // COMMENTED OUT FOR SIMPLIFIED ONBOARDING - Portfolio & Metrics step removed
  // {
  //   title: 'Showcase your best work & stats',
  //   desc: 'Add portfolio links and your latest metrics.',
  //   content: <div style={{ minHeight: 120 }}>Step 4 placeholder (Portfolio & Metrics)</div>,
  // },
];

export default function CreatorOnboarding() {
  const [step, setStep] = useState(0);
  const [form] = Form.useForm();
  const { user, refreshUser, loading: userLoading } = useContext(UserContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { trackOnboardingComplete, trackSignupStep } = useAnalytics();
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState([{ platform: '', url: '', followersCount: '' }]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [audience, setAudience] = useState({ primaryAgeRange: '', regions: [], interests: [] });
  const [imageProfile, setImageProfile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [metrics, setMetrics] = useState({ totalPosts: 0, totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0 });
  const [portfolioLinks, setPortfolioLinks] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Handle email from query parameters (when user clicks email reminder link)
  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    if (emailFromQuery) {
      console.log('📧 Email found in query params from email reminder:', emailFromQuery);
      // Save email to localStorage if not already present
      const existingEmail = localStorage.getItem('onboarding_email');
      if (!existingEmail || existingEmail !== emailFromQuery) {
        localStorage.setItem('onboarding_email', emailFromQuery);
        console.log('✅ Saved email from query params to localStorage');
        // Show welcome message for users returning from email reminder
        message.success('Welcome back! Your progress has been saved. You can continue where you left off.');
      }
      // Remove email from URL to keep it clean
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('email');
      const newSearch = newSearchParams.toString();
      navigate(`/onboarding${newSearch ? `?${newSearch}` : ''}`, { replace: true });
    }
  }, [searchParams, navigate]);

  // Check authentication on mount - user must be logged in OR have email in localStorage
  useEffect(() => {
    // Wait for UserContext to finish loading
    if (userLoading) return;
    
    const email = localStorage.getItem('onboarding_email') || '';
    // If user is not authenticated and no email in localStorage, redirect to login
    if (!user && !email) {
      console.warn('⚠️ No authentication found - user:', user, 'email:', email);
      message.warning('Please log in to complete your profile');
      navigate('/login', { replace: true });
    } else if (email && !user) {
      console.log('📧 User has email in localStorage but not authenticated - backend will authenticate by email');
    }
  }, [user, userLoading, navigate]);

  // Restore form data from localStorage on component mount
  useEffect(() => {
    try {
      const savedUsername = localStorage.getItem('onboarding_username');
      const savedBio = localStorage.getItem('onboarding_bio');
      const savedSocialLinks = localStorage.getItem('onboarding_socialLinks');
      const savedAudience = localStorage.getItem('onboarding_audience');
      const savedMetrics = localStorage.getItem('onboarding_metrics');
      const savedPortfolioLinks = localStorage.getItem('onboarding_portfolioLinks');
      const savedImagePreview = localStorage.getItem('onboarding_imagePreview');
      const savedStep = localStorage.getItem('onboarding_step');

      if (savedUsername) setUsername(savedUsername);
      if (savedBio) setBio(savedBio);
      if (savedSocialLinks) {
        try {
          const parsed = JSON.parse(savedSocialLinks);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSocialLinks(parsed);
          }
        } catch (e) {
          console.warn('Failed to parse saved social links:', e);
        }
      }
      if (savedAudience) {
        try {
          const parsed = JSON.parse(savedAudience);
          if (parsed && typeof parsed === 'object') {
            setAudience(parsed);
          }
        } catch (e) {
          console.warn('Failed to parse saved audience:', e);
        }
      }
      if (savedMetrics) {
        try {
          const parsed = JSON.parse(savedMetrics);
          if (parsed && typeof parsed === 'object') {
            setMetrics(parsed);
          }
        } catch (e) {
          console.warn('Failed to parse saved metrics:', e);
        }
      }
      if (savedPortfolioLinks) {
        try {
          const parsed = JSON.parse(savedPortfolioLinks);
          if (Array.isArray(parsed)) {
            setPortfolioLinks(parsed);
          }
        } catch (e) {
          console.warn('Failed to parse saved portfolio links:', e);
        }
      }
      if (savedImagePreview) {
        setImagePreview(savedImagePreview);
        // Note: We can't restore the File object, but the preview helps
      }
      if (savedStep) {
        const stepNum = parseInt(savedStep, 10);
        if (!isNaN(stepNum) && stepNum >= 0 && stepNum < steps.length) {
          setStep(stepNum);
        }
      }
    } catch (error) {
      console.warn('Failed to restore form data from localStorage:', error);
    }
  }, []);

  // Persist form data to localStorage whenever it changes
  useEffect(() => {
    try {
      if (username) localStorage.setItem('onboarding_username', username);
      if (bio) localStorage.setItem('onboarding_bio', bio);
      if (socialLinks.length > 0 && socialLinks.some(link => link.platform || link.url)) {
        localStorage.setItem('onboarding_socialLinks', JSON.stringify(socialLinks));
      }
      if (audience.primaryAgeRange || audience.regions.length > 0 || audience.interests.length > 0) {
        localStorage.setItem('onboarding_audience', JSON.stringify(audience));
      }
      if (metrics.totalPosts > 0 || metrics.totalViews > 0 || metrics.totalLikes > 0 || 
          metrics.totalComments > 0 || metrics.totalShares > 0) {
        localStorage.setItem('onboarding_metrics', JSON.stringify(metrics));
      }
      if (portfolioLinks.length > 0) {
        localStorage.setItem('onboarding_portfolioLinks', JSON.stringify(portfolioLinks));
      }
      if (imagePreview) {
        localStorage.setItem('onboarding_imagePreview', imagePreview);
      }
      localStorage.setItem('onboarding_step', step.toString());
    } catch (error) {
      console.warn('Failed to save form data to localStorage:', error);
    }
  }, [username, bio, socialLinks, audience, metrics, portfolioLinks, imagePreview, step]);

  // Username validation (simulate async check)
  useEffect(() => {
    if (!username) {
      setUsernameError('');
      return;
    }
    setCheckingUsername(true);
    const check = setTimeout(() => {
      // Simulate API check
      if (username.length < 3) {
        setUsernameError('Username must be at least 3 characters');
      } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setUsernameError('Only letters, numbers, and underscores allowed');
      } else {
        setUsernameError('');
      }
      setCheckingUsername(false);
    }, 400);
    return () => clearTimeout(check);
  }, [username]);

  const handleSocialUrlChange = (index, value) => {
    const updated = [...socialLinks];
    updated[index].url = value;
    setSocialLinks(updated);
  };

  const handleFollowerCountChange = (platform, value) => {
    const linkIndex = socialLinks.findIndex(s => s.platform === platform);
    if (linkIndex !== -1) {
      const updated = [...socialLinks];
      updated[linkIndex].followersCount = value || '';
      setSocialLinks(updated);
    } else {
      // If platform doesn't exist yet, create it
      const newLinks = [...socialLinks, { platform, url: '', followersCount: value || '' }];
      setSocialLinks(newLinks);
    }
  };

  // Validation for Continue - at least one social link with URL
  const canContinue =
    username && !usernameError && bio &&
    socialLinks.some(link => link.url && link.url.trim());

  // Step 2 validation (now final step before submission)
  const canContinueStep2 =
    audience.primaryAgeRange &&
    audience.regions.length > 0 &&
    audience.interests.length > 0 &&
    imageProfile;

  // COMMENTED OUT - Step 3 validation no longer needed (Portfolio & Metrics removed)
  // const canContinueStep3 =
  //   metrics.totalPosts > 0 &&
  //   metrics.totalViews > 0 &&
  //   metrics.totalLikes > 0 &&
  //   metrics.totalComments > 0 &&
  //   metrics.totalShares > 0 &&
  //   portfolioLinks.length > 0 &&
  //   portfolioLinks.every(link => link.trim());

  // Portfolio link handlers
  const handlePortfolioChange = (index, value) => {
    const updated = [...portfolioLinks];
    updated[index] = value;
    setPortfolioLinks(updated);
  };
  const addPortfolioLink = () => {
    setPortfolioLinks([...portfolioLinks, '']);
  };
  const removePortfolioLink = (index) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      // Track signup step progress
      trackSignupStep(nextStep + 1, steps[nextStep]?.title || `Step ${nextStep + 1}`);
    }
    // else: could redirect to dashboard or show a completion message
  };
  // eslint-disable-next-line no-unused-vars
  const handleSkip = () => {
    if (step < steps.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      // Track signup step progress
      trackSignupStep(nextStep + 1, steps[nextStep]?.title || `Step ${nextStep + 1}`);
    }
    // else: could redirect to dashboard or show a completion message
  };
  const variants = {
    initial: { x: 40, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.25 } },
    exit: { x: -40, opacity: 0, transition: { duration: 0.22 } },
  };

  steps[0].title = 'Bio & Social Links';
  steps[0].desc = 'Tell brands who you are and where to find you.';
  steps[0].content = (
    <Form form={form} layout="vertical">
      <Form.Item
        label="Creator Username"
        validateStatus={usernameError ? 'error' : ''}
        help={usernameError}
        required
        style={{ marginBottom: '1.5rem' }}
      >
        <SocialInputWrapper>
          <SocialIcon>
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#26A69A' }}>@</span>
          </SocialIcon>
          <SocialInput
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="username (e.g., creator123)"
            maxLength={50}
            aria-label="Creator Username"
          />
        </SocialInputWrapper>
      </Form.Item>
      <Form.Item
        label="Bio"
        required
      >
        <MobileOptimizedTextArea
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Describe yourself in a few words"
          maxLength={150}
          showCount
          rows={4}
          aria-label="Bio"
        />
      </Form.Item>
      <Typography.Text style={{ fontWeight: 500, marginBottom: '1.5rem', display: 'block', fontSize: '0.95rem', color: '#374151' }}>Social Networks</Typography.Text>
      
      {/* Instagram Handle */}
      <Form.Item
        name="instagramHandle"
        rules={[{ required: false }]}
        style={{ marginBottom: '0.75rem' }}
      >
        <SocialInputWrapper>
          <SocialIcon>
            <FaInstagram style={{ color: '#E1306C' }} />
          </SocialIcon>
          <SocialInput
            placeholder="Instagram Handle"
            value={socialLinks.find(s => s.platform === 'Instagram')?.url?.replace('https://instagram.com/', '').replace('https://www.instagram.com/', '').replace('@', '') || ''}
            onChange={e => {
              const instagramLink = socialLinks.find(s => s.platform === 'Instagram');
              const handle = e.target.value.replace('@', '').trim();
              if (instagramLink) {
                handleSocialUrlChange(socialLinks.indexOf(instagramLink), handle ? `https://instagram.com/${handle}` : '');
              } else {
                const newLinks = [...socialLinks, { platform: 'Instagram', url: handle ? `https://instagram.com/${handle}` : '', followersCount: '' }];
                setSocialLinks(newLinks);
              }
            }}
            aria-label="Instagram Handle"
          />
        </SocialInputWrapper>
      </Form.Item>
      {/* Instagram Followers */}
      <Form.Item
        name="instagramFollowers"
        rules={[{ required: false }]}
        style={{ marginBottom: '1rem' }}
      >
        <FollowerCountWrapper>
          <FollowerCountIcon>Followers</FollowerCountIcon>
          <FollowerCountInput
            placeholder="0"
            min={0}
            value={socialLinks.find(s => s.platform === 'Instagram')?.followersCount || undefined}
            onChange={value => handleFollowerCountChange('Instagram', value)}
            aria-label="Instagram Followers"
          />
        </FollowerCountWrapper>
      </Form.Item>

      {/* TikTok Handle */}
      <Form.Item
        name="tiktokHandle"
        rules={[{ required: false }]}
        style={{ marginBottom: '0.75rem' }}
      >
        <SocialInputWrapper>
          <SocialIcon>
            <FaTiktok style={{ color: '#000000' }} />
          </SocialIcon>
          <SocialInput
            placeholder="Tiktok Handle"
            value={socialLinks.find(s => s.platform === 'TikTok')?.url?.replace('https://tiktok.com/@', '').replace('https://www.tiktok.com/@', '').replace('@', '') || ''}
            onChange={e => {
              const tiktokLink = socialLinks.find(s => s.platform === 'TikTok');
              const handle = e.target.value.replace('@', '').trim();
              if (tiktokLink) {
                handleSocialUrlChange(socialLinks.indexOf(tiktokLink), handle ? `https://tiktok.com/@${handle}` : '');
              } else {
                const newLinks = [...socialLinks, { platform: 'TikTok', url: handle ? `https://tiktok.com/@${handle}` : '', followersCount: '' }];
                setSocialLinks(newLinks);
              }
            }}
            aria-label="Tiktok Handle"
          />
        </SocialInputWrapper>
      </Form.Item>
      {/* TikTok Followers */}
      <Form.Item
        name="tiktokFollowers"
        rules={[{ required: false }]}
        style={{ marginBottom: '1rem' }}
      >
        <FollowerCountWrapper>
          <FollowerCountIcon>Followers</FollowerCountIcon>
          <FollowerCountInput
            placeholder="0"
            min={0}
            value={socialLinks.find(s => s.platform === 'TikTok')?.followersCount || undefined}
            onChange={value => handleFollowerCountChange('TikTok', value)}
            aria-label="TikTok Followers"
          />
        </FollowerCountWrapper>
      </Form.Item>

      {/* YouTube URL */}
      <Form.Item
        name="youtubeUrl"
        rules={[{ required: false }]}
        style={{ marginBottom: '0.75rem' }}
      >
        <SocialInputWrapper>
          <SocialIcon>
            <FaYoutube style={{ color: '#FF0000' }} />
          </SocialIcon>
          <SocialInput
            placeholder="YouTube URL"
            value={socialLinks.find(s => s.platform === 'YouTube')?.url || ''}
            onChange={e => {
              const youtubeLink = socialLinks.find(s => s.platform === 'YouTube');
              if (youtubeLink) {
                handleSocialUrlChange(socialLinks.indexOf(youtubeLink), e.target.value);
              } else {
                const newLinks = [...socialLinks, { platform: 'YouTube', url: e.target.value, followersCount: '' }];
                setSocialLinks(newLinks);
              }
            }}
            aria-label="YouTube URL"
          />
        </SocialInputWrapper>
      </Form.Item>
      {/* YouTube Subscribers */}
      <Form.Item
        name="youtubeSubscribers"
        rules={[{ required: false }]}
        style={{ marginBottom: '1rem' }}
      >
        <FollowerCountWrapper>
          <FollowerCountIcon>Subscribers</FollowerCountIcon>
          <FollowerCountInput
            placeholder="0"
            min={0}
            value={socialLinks.find(s => s.platform === 'YouTube')?.followersCount || undefined}
            onChange={value => handleFollowerCountChange('YouTube', value)}
            aria-label="YouTube Subscribers"
          />
        </FollowerCountWrapper>
      </Form.Item>

      {/* Snapchat Handle */}
      <Form.Item
        name="snapchatHandle"
        rules={[{ required: false }]}
        style={{ marginBottom: '0.75rem' }}
      >
        <SocialInputWrapper>
          <SocialIcon>
            <FaSnapchat style={{ color: '#FFFC00' }} />
          </SocialIcon>
          <SocialInput
            placeholder="Snapchat Handle"
            value={socialLinks.find(s => s.platform === 'Snapchat')?.url?.replace('https://snapchat.com/add/', '').replace('https://www.snapchat.com/add/', '').replace('@', '') || ''}
            onChange={e => {
              const snapchatLink = socialLinks.find(s => s.platform === 'Snapchat');
              const handle = e.target.value.replace('@', '').trim();
              if (snapchatLink) {
                handleSocialUrlChange(socialLinks.indexOf(snapchatLink), handle ? `https://snapchat.com/add/${handle}` : '');
              } else {
                const newLinks = [...socialLinks, { platform: 'Snapchat', url: handle ? `https://snapchat.com/add/${handle}` : '', followersCount: '' }];
                setSocialLinks(newLinks);
              }
            }}
            aria-label="Snapchat Handle"
          />
        </SocialInputWrapper>
      </Form.Item>
      {/* Snapchat Followers */}
      <Form.Item
        name="snapchatFollowers"
        rules={[{ required: false }]}
        style={{ marginBottom: '1rem' }}
      >
        <FollowerCountWrapper>
          <FollowerCountIcon>Followers</FollowerCountIcon>
          <FollowerCountInput
            placeholder="0"
            min={0}
            value={socialLinks.find(s => s.platform === 'Snapchat')?.followersCount || undefined}
            onChange={value => handleFollowerCountChange('Snapchat', value)}
            aria-label="Snapchat Followers"
          />
        </FollowerCountWrapper>
      </Form.Item>

      {/* Twitch Handle */}
      <Form.Item
        name="twitchHandle"
        rules={[{ required: false }]}
        style={{ marginBottom: '0.75rem' }}
      >
        <SocialInputWrapper>
          <SocialIcon>
            <FaTwitch style={{ color: '#9146FF' }} />
          </SocialIcon>
          <SocialInput
            placeholder="Twitch Handle"
            value={socialLinks.find(s => s.platform === 'Twitch')?.url?.replace('https://twitch.tv/', '').replace('https://www.twitch.tv/', '').replace('@', '') || ''}
            onChange={e => {
              const twitchLink = socialLinks.find(s => s.platform === 'Twitch');
              const handle = e.target.value.replace('@', '').trim();
              if (twitchLink) {
                handleSocialUrlChange(socialLinks.indexOf(twitchLink), handle ? `https://twitch.tv/${handle}` : '');
              } else {
                const newLinks = [...socialLinks, { platform: 'Twitch', url: handle ? `https://twitch.tv/${handle}` : '', followersCount: '' }];
                setSocialLinks(newLinks);
              }
            }}
            aria-label="Twitch Handle"
          />
        </SocialInputWrapper>
      </Form.Item>
      {/* Twitch Followers */}
      <Form.Item
        name="twitchFollowers"
        rules={[{ required: false }]}
        style={{ marginBottom: '1rem' }}
      >
        <FollowerCountWrapper>
          <FollowerCountIcon>Followers</FollowerCountIcon>
          <FollowerCountInput
            placeholder="0"
            min={0}
            value={socialLinks.find(s => s.platform === 'Twitch')?.followersCount || undefined}
            onChange={value => handleFollowerCountChange('Twitch', value)}
            aria-label="Twitch Followers"
          />
        </FollowerCountWrapper>
      </Form.Item>

      {/* Other URLs */}
      <Form.Item
        name="otherUrls"
        rules={[{ required: false }]}
        style={{ marginBottom: '1rem' }}
      >
        <div>
          <OtherInputLabel>Other (Podcasts, Website etc.)</OtherInputLabel>
          <OtherInputWrapper>
            <MobileOptimizedInput
              placeholder="Enter URLs (separate multiple with commas)"
              value={socialLinks.filter(s => !['Instagram', 'TikTok', 'YouTube', 'Snapchat', 'Twitch'].includes(s.platform)).map(s => s.url).filter(Boolean).join(', ')}
              onChange={e => {
                const otherUrls = e.target.value.split(',').map(url => url.trim()).filter(Boolean);
                const mainLinks = socialLinks.filter(s => ['Instagram', 'TikTok', 'YouTube', 'Snapchat', 'Twitch'].includes(s.platform));
                
                const newOtherLinks = otherUrls.map(url => ({
                  platform: 'Other',
                  url: url.startsWith('http') ? url : `https://${url}`,
                  followersCount: ''
                }));
                
                setSocialLinks([...mainLinks, ...newOtherLinks]);
              }}
              aria-label="Other URLs"
            />
          </OtherInputWrapper>
        </div>
      </Form.Item>
    </Form>
  );

  // Step 2 content
  steps[1].title = 'Audience Information';
  steps[1].desc = 'Help brands understand who you reach.';
  steps[1].content = (
    <Form layout="vertical">
      <Form.Item label="Primary Age Range" required>
        <StyledSelect
          options={ageRangeOptions}
          value={audience.primaryAgeRange}
          onChange={value => setAudience(aud => ({ ...aud, primaryAgeRange: value }))}
          placeholder="Select primary age range"
          aria-label="Primary Age Range"
        />
      </Form.Item>
      <Form.Item label="Regions Reached" required>
        <StyledSelect
          mode="multiple"
          options={regionsOptions}
          value={audience.regions}
          onChange={value => setAudience(aud => ({ ...aud, regions: value }))}
          placeholder="Select regions"
          aria-label="Regions Reached"
        />
      </Form.Item>
      <Form.Item label="Interests (Niche)" required>
        <StyledSelect
          mode="multiple"
          options={nichesOptions}
          value={audience.interests}
          onChange={value => setAudience(aud => ({ ...aud, interests: value }))}
          placeholder="Select interests"
          aria-label="Interests"
        />
      </Form.Item>
      <Form.Item label="Profile Picture" required>
        <Upload
          name="profilePic"
          listType="picture"
          beforeUpload={file => {
            const isPngOrJpeg = file.type === 'image/png' || file.type === 'image/jpeg';
            if (!isPngOrJpeg) {
              message.error('You can only upload PNG or JPEG files!');
              return Upload.LIST_IGNORE;
            }
            setImageProfile(file);
            const reader = new FileReader();
            reader.onload = e => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
            return false;
          }}
          maxCount={1}
          fileList={imageProfile ? [{ uid: '-1', name: imageProfile.name, status: 'done', url: imagePreview }] : []}
          onRemove={() => { setImageProfile(null); setImagePreview(null); }}
        >
          <Button icon={<UploadOutlined />} aria-label="Upload Profile Picture">
            Upload Profile Picture (PNG or JPEG)
          </Button>
        </Upload>
        {imagePreview && (
          <div style={{ marginTop: 12 }}>
            <img src={imagePreview} alt="Profile Preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }} />
            {!imageProfile && (
              <Typography.Text type="warning" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
                Please re-upload your profile picture
              </Typography.Text>
            )}
          </div>
        )}
      </Form.Item>
    </Form>
  );

  // COMMENTED OUT FOR SIMPLIFIED ONBOARDING - Portfolio & Metrics step removed
  // // Step 3 content
  // steps[2].title = 'Portfolio & Metrics';
  // steps[2].desc = 'Showcase your best work and recent stats.';
  // steps[2].content = (
  //   <Form layout="vertical">
  //     <Typography.Text style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>Share links to your best posts to showcase to brands:</Typography.Text>
  //     {portfolioLinks.length === 0 && (
  //       <Button
  //         type="dashed"
  //         onClick={addPortfolioLink}
  //         icon={<PlusOutlined />}
  //         block
  //         style={{ marginBottom: 16 }}
  //         aria-label="Add Portfolio Link"
  //       >
  //         Add Portfolio Link
  //       </Button>
  //     )}
  //     {portfolioLinks.map((link, index) => (
  //       <Row gutter={16} key={index} style={{ marginBottom: '16px' }}>
  //         <Col xs={20}>
  //           <Form.Item required>
  //             <MobileOptimizedInput
  //               placeholder="Enter post URL (e.g., https://instagram.com/p/example)"
  //               value={link}
  //               onChange={e => handlePortfolioChange(index, e.target.value)}
  //               aria-label={`Portfolio Link ${index + 1}`}
  //             />
  //           </Form.Item>
  //         </Col>
  //         <Col xs={4}>
  //           <DeleteButton
  //             type="text"
  //             danger
  //             icon={<DeleteOutlined />}
  //             onClick={() => removePortfolioLink(index)}
  //             aria-label={`Remove portfolio link ${index + 1}`}
  //           />
  //         </Col>
  //       </Row>
  //     ))}
  //     {portfolioLinks.length > 0 && (
  //       <Button
  //         type="dashed"
  //         onClick={addPortfolioLink}
  //         icon={<PlusOutlined />}
  //         block
  //         style={{ marginBottom: 16 }}
  //         aria-label="Add Portfolio Link"
  //       >
  //         Add Another Post Link
  //       </Button>
  //     )}
  //     <Typography.Text style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>Recent Metrics (last 90 days):</Typography.Text>
  //     <Row gutter={16}>
  //       <Col xs={24} md={12}>
  //         <Form.Item label="Total Number of Posts" required>
  //           <MobileOptimizedInputNumber
  //             min={0}
  //             value={metrics.totalPosts}
  //             onChange={value => setMetrics(m => ({ ...m, totalPosts: value }))}
  //             aria-label="Total Posts"
  //             style={{ width: '100%' }}
  //           />
  //         </Form.Item>
  //       </Col>
  //       <Col xs={24} md={12}>
  //         <Form.Item label="Total Views" required>
  //           <MobileOptimizedInputNumber
  //             min={0}
  //             value={metrics.totalViews}
  //             onChange={value => setMetrics(m => ({ ...m, totalViews: value }))}
  //             aria-label="Total Views"
  //             style={{ width: '100%' }}
  //           />
  //         </Form.Item>
  //       </Col>
  //       <Col xs={24} md={12}>
  //         <Form.Item label="Total Likes" required>
  //           <MobileOptimizedInputNumber
  //             min={0}
  //             value={metrics.totalLikes}
  //             onChange={value => setMetrics(m => ({ ...m, totalLikes: value }))}
  //             aria-label="Total Likes"
  //             style={{ width: '100%' }}
  //           />
  //         </Form.Item>
  //       </Col>
  //       <Col xs={24} md={12}>
  //         <Form.Item label="Total Comments" required>
  //           <MobileOptimizedInputNumber
  //             min={0}
  //             value={metrics.totalComments}
  //             onChange={value => setMetrics(m => ({ ...m, totalComments: value }))}
  //             aria-label="Total Comments"
  //             style={{ width: '100%' }}
  //           />
  //         </Form.Item>
  //       </Col>
  //       <Col xs={24}>
  //         <Form.Item label="Total Shares" required>
  //           <MobileOptimizedInputNumber
  //             min={0}
  //             value={metrics.totalShares}
  //             onChange={value => setMetrics(m => ({ ...m, totalShares: value }))}
  //             aria-label="Total Shares"
  //             style={{ width: '100%' }}
  //           />
  //         </Form.Item>
  //       </Col>
  //     </Row>
  //   </Form>
  // );

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    
    // Check authentication - user must be logged in OR have email in localStorage
    const email = localStorage.getItem('onboarding_email') || '';
    if (!user && !email) {
      const authError = 'You must be logged in to complete your profile. Please log in and try again.';
      setSubmitError(authError);
      setSubmitting(false);
      message.error(authError);
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
      return;
    }
    
    // Validate required fields before submission
    if (!username || !username.trim()) {
      setSubmitError('Username is required');
      setSubmitting(false);
      setStep(0); // Go back to first step
      return;
    }
    if (!bio || !bio.trim()) {
      setSubmitError('Bio is required');
      setSubmitting(false);
      setStep(0); // Go back to first step
      return;
    }
    if (!socialLinks || socialLinks.length === 0 || 
        !socialLinks.some(link => link.url && link.url.trim())) {
      setSubmitError('At least one social link is required');
      setSubmitting(false);
      setStep(0); // Go back to first step
      return;
    }
    if (!audience.primaryAgeRange || !audience.regions || audience.regions.length === 0 || 
        !audience.interests || audience.interests.length === 0) {
      setSubmitError('Please complete all audience information fields');
      setSubmitting(false);
      setStep(1); // Go back to audience step
      return;
    }
    if (!imageProfile) {
      setSubmitError('Profile picture is required');
      setSubmitting(false);
      setStep(1); // Go back to audience step
      return;
    }
    // COMMENTED OUT - Metrics and portfolio validation removed for simplified onboarding
    // if (!metrics.totalPosts || !metrics.totalViews || !metrics.totalLikes ||
    //     !metrics.totalComments || !metrics.totalShares) {
    //   setSubmitError('Please complete all metrics fields');
    //   setSubmitting(false);
    //   setStep(2); // Go back to metrics step
    //   return;
    // }
    // if (!portfolioLinks || portfolioLinks.length === 0 ||
    //     !portfolioLinks.some(link => link && link.trim())) {
    //   setSubmitError('At least one portfolio link is required');
    //   setSubmitting(false);
    //   setStep(2); // Go back to metrics step
    //   return;
    // }
    
    try {
      // Normalize social media URLs to ensure they have https://
      const normalizedSocialLinks = socialLinks.map(link => ({
        ...link,
        url: link.url && !link.url.startsWith('http://') && !link.url.startsWith('https://') 
          ? `https://${link.url}` 
          : link.url
      }));
      
      // Normalize portfolio links to ensure they have https://
      const normalizedPortfolioLinks = portfolioLinks.map(link => 
        link && !link.startsWith('http://') && !link.startsWith('https://') 
          ? `https://${link}` 
          : link
      );
      
      const formDataToSubmit = new FormData();
      // Retrieve account fields from localStorage
      const firstName = localStorage.getItem('onboarding_firstName') || '';
      const lastName = localStorage.getItem('onboarding_lastName') || '';
      const email = localStorage.getItem('onboarding_email') || '';
      const password = localStorage.getItem('onboarding_password') || '';
      formDataToSubmit.append('firstName', firstName);
      formDataToSubmit.append('lastName', lastName);
      formDataToSubmit.append('email', email);
      formDataToSubmit.append('password', password);
      formDataToSubmit.append('username', username);
      formDataToSubmit.append('bio', bio);
      formDataToSubmit.append('socialLinks', JSON.stringify(normalizedSocialLinks));
      formDataToSubmit.append('primaryAgeRange', audience.primaryAgeRange);
      formDataToSubmit.append('regions', JSON.stringify(audience.regions));
      formDataToSubmit.append('interests', JSON.stringify(audience.interests));
      // COMMENTED OUT - Portfolio and metrics made optional for simplified onboarding
      // formDataToSubmit.append('portfolioLinks', JSON.stringify(normalizedPortfolioLinks));
      // formDataToSubmit.append('totalPosts', metrics.totalPosts);
      // formDataToSubmit.append('totalViews', metrics.totalViews);
      // formDataToSubmit.append('totalLikes', metrics.totalLikes);
      // formDataToSubmit.append('totalComments', metrics.totalComments);
      // formDataToSubmit.append('totalShares', metrics.totalShares);
      if (imageProfile) {
        formDataToSubmit.append('imageProfile', imageProfile);
      }
      formDataToSubmit.append('role', 'creator');
      
      // Add user_id as fallback authentication
      if (user && user.id) {
        formDataToSubmit.append('user_id', user.id);
      }
      
      // Use the consistent API configuration
      const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');
      console.log('🚀 Submitting profile completion to:', `${API_URL}/profile/onboarding`);
      console.log('🔍 Form data keys:', Array.from(formDataToSubmit.keys()));
      console.log('👤 User context:', user);
      console.log('📧 Email from localStorage:', email);
      console.log('🔑 User ID from context:', user?.id);
      
      const response = await axios.post(
        `${API_URL}/profile/onboarding`,
        formDataToSubmit,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );
      
      console.log('✅ Profile completion response:', response.data);
      message.success('Profile completed! Redirecting to your dashboard...');
      
      // Track onboarding completion
      trackOnboardingComplete('creator');
      
      // Submit creator profile to IndexNow for faster indexing
      if (username) {
        submitCreatorProfileToIndexNow(username).catch(error => {
          console.warn('⚠️ IndexNow submission failed:', error);
        });
      }
      
      // Clean up all onboarding fields from localStorage on success (before redirect)
      localStorage.removeItem('onboarding_firstName');
      localStorage.removeItem('onboarding_lastName');
      localStorage.removeItem('onboarding_email');
      localStorage.removeItem('onboarding_password');
      localStorage.removeItem('onboarding_username');
      localStorage.removeItem('onboarding_bio');
      localStorage.removeItem('onboarding_socialLinks');
      localStorage.removeItem('onboarding_audience');
      localStorage.removeItem('onboarding_metrics');
      localStorage.removeItem('onboarding_portfolioLinks');
      localStorage.removeItem('onboarding_imagePreview');
      localStorage.removeItem('onboarding_step');
      
      // Set flag to indicate we just completed onboarding
      // This prevents App.js from redirecting to login while user context loads
      sessionStorage.setItem('justCompletedOnboarding', 'true');
      
      // Wait a moment for session cookie to be set by backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh user context and wait for it to complete
      // This ensures the user is authenticated and creator_id is set before redirecting
      try {
        await refreshUser();
        console.log('✅ User context refreshed successfully');
        
        // Wait longer for React state to propagate (creator_id needs to be in user object)
        // This prevents App.js from seeing incomplete profile and redirecting back
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log('✅ Waited for React state update - user should now have creator_id');
      } catch (error) {
        console.warn('⚠️ User context refresh failed, but session is set - will retry on redirect:', error);
        // Even if refresh fails, session is set on backend, so continue
        // The sessionStorage flag will prevent immediate redirect to login
      }
      
      // Determine redirect URL
      let redirectUrl = '/creator/dashboard/pr-brands'; // Default fallback
      if (response.data.redirect_url) {
        try {
          const urlObj = new URL(response.data.redirect_url, window.location.origin);
          redirectUrl = urlObj.pathname + urlObj.search + urlObj.hash;
          console.log('🔄 Redirect URL from response:', redirectUrl);
        } catch (e) {
          console.log('🔄 Using redirect URL as-is:', response.data.redirect_url);
          redirectUrl = response.data.redirect_url;
        }
      }
      
      // Redirect - user context should be updated now
      console.log('🔄 Redirecting to:', redirectUrl);
      navigate(redirectUrl, { replace: true });
      
      // Clear the flag after navigation (in case it wasn't cleared)
      // Use a small delay to ensure navigation happens first
      setTimeout(() => {
        sessionStorage.removeItem('justCompletedOnboarding');
      }, 1000);
    } catch (error) {
      console.error('❌ Profile completion error:', error);
      console.error('❌ Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to complete onboarding.';
      
      // Handle token expiration
      if (error.response?.status === 401 && error.response?.data?.token_expired) {
        message.error('Your session has expired. Please log in again.');
        // Clear session and redirect to login
        try {
          await axios.post(`${API_URL}/clear-session`, {}, { withCredentials: true });
        } catch (clearError) {
          console.error('Failed to clear session:', clearError);
        }
        // Redirect to login
        window.location.href = '/login';
        return;
      }
      
      // Handle username taken (409 from backend)
      if (error.response?.status === 409 && errorMessage.toLowerCase().includes('username')) {
        setUsernameError(errorMessage);
        setStep(0); // Go back to username step if not already there
        setSubmitError(errorMessage);
        message.error(errorMessage);
        return;
      }
      // Handle email taken (400 from backend, from registration step)
      if (error.response?.status === 400 && errorMessage.toLowerCase().includes('email')) {
        setSubmitError(errorMessage);
        setStep(0); // Go back to first step
        message.error(errorMessage);
        return;
      }
      // Handle missing required fields (400 from backend)
      if (error.response?.status === 400 && errorMessage.toLowerCase().includes('missing')) {
        setSubmitError(errorMessage);
        // Try to determine which step to go back to based on error message
        if (errorMessage.toLowerCase().includes('username') || errorMessage.toLowerCase().includes('bio')) {
          setStep(0);
        } else if (errorMessage.toLowerCase().includes('age') || errorMessage.toLowerCase().includes('region') || 
                   errorMessage.toLowerCase().includes('interest') || errorMessage.toLowerCase().includes('picture')) {
          setStep(1);
        } else if (errorMessage.toLowerCase().includes('metric') || errorMessage.toLowerCase().includes('portfolio')) {
          setStep(2);
        }
        message.error(errorMessage);
        return;
      }
      // Handle authentication errors
      if (error.response?.status === 401) {
        const authError = errorMessage || 'Authentication failed. Please log in and try again.';
        setSubmitError(authError);
        message.error(authError);
        // Check if email exists - if not, redirect to login
        const email = localStorage.getItem('onboarding_email') || '';
        if (!email) {
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
        }
        return;
      }
      // Handle other errors - preserve form state by keeping data in localStorage
      setSubmitError(errorMessage);
      message.error(`Failed to complete profile: ${errorMessage}. Your data has been saved and you can try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3 content (now final step - Complete Profile)
  steps[2].title = '';
  steps[2].desc = '';
  steps[2].content = (
    <div style={{ textAlign: 'center', minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
      <Typography.Text style={{ fontSize: 16, color: '#374151', marginBottom: 16, display: 'block' }}>
        Click below to confirm your signup and start your creator journey.
      </Typography.Text>
      {submitError && (
        <div style={{ marginBottom: 12, padding: 12, background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA', maxWidth: '100%' }}>
          <Typography.Text type="danger" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            {submitError}
          </Typography.Text>
          <Typography.Text style={{ fontSize: 13, color: '#6B7280', display: 'block' }}>
            💾 Don't worry - all your information has been saved. You can fix any issues and try again without losing your progress.
          </Typography.Text>
        </div>
      )}
      <Button
        type="primary"
        style={{ marginTop: 16, borderRadius: 12, background: 'linear-gradient(90deg, #10b981 0%, #4ade80 100%)', fontWeight: 600, fontSize: 17 }}
        size="large"
        onClick={handleSubmit}
        loading={submitting}
      >
        Complete My Profile
      </Button>
      <Typography.Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 12, display: 'block' }}>
        Your progress is automatically saved
      </Typography.Text>
    </div>
  );

  

  return (
    <>
      <Helmet>
        <title>Complete Your Creator Profile | Newcollab</title>
        <meta name="description" content="Finish your Newcollab creator onboarding to unlock your dashboard and start receiving brand bids." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="canonical" href="https://newcollab.co/onboarding" />
        <meta property="og:title" content="Complete Your Creator Profile | Newcollab" />
        <meta property="og:description" content="Finish your Newcollab creator onboarding to unlock your dashboard and start receiving brand bids." />
        <meta property="og:url" content="https://newcollab.co/onboarding" />
        <meta property="og:image" content="https://newcollab.co/og-image.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Newcollab" />
      </Helmet>
      <GradientBg>
        <div style={{ 
          width: '100%', 
          maxWidth: '480px', 
          margin: '0 auto',
          padding: '0 1rem',
          boxSizing: 'border-box'
        }}>
          <Card>
          <StepIndicators>
            {steps.map((_, index) => (
              <StepDot
                key={index}
                active={step === index}
                initial={false}
                animate={{
                  scale: step === index ? 1.2 : 1,
                  opacity: step === index ? 1 : 0.6
                }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </StepIndicators>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ width: '100%' }}
            >
              {step === 2 ? (
                <>
                  <StepTitle style={{ textAlign: 'center' }}>{steps[step].title}</StepTitle>
                  <StepDesc style={{ textAlign: 'center' }}>{steps[step].desc}</StepDesc>
                </>
              ) : (
                <>
                  <StepTitle>{steps[step].title}</StepTitle>
                  <StepDesc>{steps[step].desc}</StepDesc>
                </>
              )}
              {steps[step].content}
              {step < 2 && (
                <NavigationRow>
                  {step > 0 ? (
                    <BackButton type="button" onClick={() => setStep(s => s - 1)}>
                      <span>←</span> Back
                    </BackButton>
                  ) : (
                    <div></div>
                  )}
                  <NextButton
                    type="button"
                    onClick={handleNext}
                    disabled={
                      (step === 0 && !canContinue) ||
                      (step === 1 && !canContinueStep2)
                    }
                  >
                    {step === 0 ? 'Continue' : 'Next Step'}
                  </NextButton>
                </NavigationRow>
              )}
            </motion.div>
          </AnimatePresence>
        </Card>
        </div>
      </GradientBg>
    </>
  );
} 