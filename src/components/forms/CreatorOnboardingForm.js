import React, { useState, useCallback } from 'react';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Row,
  Col,
  Select,
  Upload,
  InputNumber,
  message,
  Typography,
} from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { CountryDropdown } from 'react-country-region-selector';
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaSnapchat,
  FaPinterest,
  FaTwitch,
} from 'react-icons/fa';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import PasswordStrengthBar from 'react-password-strength-bar';
import axios from 'axios';
import debounce from 'lodash/debounce';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import './CreatorOnboardingForm.css';
import { submitCreatorProfileToIndexNow } from '../../utils/indexNow';

const { TextArea } = Input;
// eslint-disable-next-line no-unused-vars
const { Option } = Select;
const { Text } = Typography;

// Styled Components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  padding: 16px;
  background: transparent;
  box-sizing: border-box;
  @media (max-width: 600px) {
    align-items: flex-start;
    min-height: 100vh;
    padding: 100px 16px 24px 16px;
    margin-top: 0;
  }
`;

const FormCard = styled.div`
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 32px;
  width: 100%;
  max-width: 600px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin: 0;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  }
  @media (max-width: 768px) {
    padding: 24px;
    max-width: 90%;
    margin: 0 auto;
    transform: translateY(0); /* Remove the upward adjustment */
  }
`;

const StyledInput = styled(Input)`
  border-radius: 24px;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  &:hover, &:focus {
    border-color: #26A69A;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.2);
  }
`;

const StyledPasswordInput = styled(Input.Password)`
  border-radius: 24px;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  &:hover, &:focus {
    border-color: #26A69A;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.2);
  }
`;

const StyledTextArea = styled(TextArea)`
  border-radius: 16px;
  padding: 12px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  &:hover, &:focus {
    border-color: #26A69A;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.2);
  }
`;

const StyledInputNumber = styled(InputNumber)`
  border-radius: 24px;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  width: 100%;
  .ant-input-number-input {
    border-radius: 24px;
    padding: 10px 16px;
  }
  &:hover, &:focus {
    border-color: #26A69A;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.2);
  }
`;

const StyledSelect = styled(Select)`
  .ant-select-selector {
    border-radius: 24px !important;
    padding: 10px 16px !important;
    border: 1px solid #d1d5db !important;
    font-size: 14px !important;
  }
  &:hover .ant-select-selector, .ant-select-focused .ant-select-selector {
    border-color: #26A69A !important;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.2) !important;
  }
`;

const StyledButton = styled(Button)`
  border-radius: 24px;
  padding: 10px 24px;
  background: ${props => props.primary ? 'linear-gradient(135deg, #26A69A, #4DB6AC)' : props.dashed ? '#fff' : '#fff'};
  border: ${props => props.primary || props.dashed ? 'none' : '1px solid #d1d5db'};
  color: ${props => props.primary ? '#fff' : '#4b5563'};
  font-weight: 600;
  font-size: 14px;
  height: 44px;
  transition: background 0.2s ease, transform 0.2s ease;
  &:hover {
    background: ${props => props.primary ? 'linear-gradient(135deg, #4DB6AC, #26A69A)' : props.dashed ? '#e6f7ff' : '#e6f7ff'};
    color: ${props => props.primary ? '#fff' : '#26A69A'};
    border-color: ${props => props.primary || props.dashed ? 'none' : '#26A69A'};
    transform: scale(1.02);
  }
  &:disabled {
    background: #d1d5db;
    color: #6b7280;
    cursor: not-allowed;
  }
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 8px 16px;
    height: 40px;
  }
`;

const SocialLinkContainer = styled.div`
  background: #f9fafb;
  border-radius: 16px;
  border: 1px solid #e8ecef;
  padding: 16px;
  margin-bottom: 16px;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
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

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const StepDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.active ? '#26A69A' : '#d1d5db'};
  transition: background 0.3s ease;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin-bottom: 8px;
`;

const Subtitle = styled(Text)`
  display: block;
  text-align: center;
  color: #4b5563;
  font-size: 14px;
  margin-bottom: 24px;
`;

// Framer Motion variants
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

// Social platforms, age ranges, regions, and niches (unchanged)
const socialPlatforms = [
  { value: 'Instagram', label: <><FaInstagram style={{ color: '#E1306C', marginRight: '8px' }} /> Instagram</> },
  { value: 'TikTok', label: <><FaTiktok style={{ color: '#000000', marginRight: '8px' }} /> TikTok</> },
  { value: 'YouTube', label: <><FaYoutube style={{ color: '#FF0000', marginRight: '8px' }} /> YouTube</> },
  { value: 'Facebook', label: <><FaFacebook style={{ color: '#1877F2', marginRight: '8px' }} /> Facebook</> },
  { value: 'Twitter', label: <><FaTwitter style={{ color: '#1DA1F2', marginRight: '8px' }} /> Twitter</> },
  { value: 'LinkedIn', label: <><FaLinkedin style={{ color: '#0077B5', marginRight: '8px' }} /> LinkedIn</> },
  { value: 'Snapchat', label: <><FaSnapchat style={{ color: '#FFFC00', marginRight: '8px' }} /> Snapchat</> },
  { value: 'Pinterest', label: <><FaPinterest style={{ color: '#E60023', marginRight: '8px' }} /> Pinterest</> },
  { value: 'Twitch', label: <><FaTwitch style={{ color: '#9146FF', marginRight: '8px' }} /> Twitch</> },
];

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

function CreatorOnboardingForm({ role, onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    password: '',
    confirmPassword: '',
    bio: '',
    platforms: [],
    followersCount: '',
    imageProfile: null,
    termsAccepted: false,
    socialLinks: [{ platform: '', url: '', followersCount: '' }],
    audience: { primaryAgeRange: '', regions: [], interests: [] },
    metrics: { totalPosts: 0, totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0 },
    portfolioLinks: [],
    role: 'creator',
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validateEmail = useCallback(
    debounce(async (email) => {
      if (!email) {
        setEmailError('Email is required.');
        setCheckingEmail(false);
        return false;
      }

      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(email)) {
        setEmailError('Invalid email format.');
        setCheckingEmail(false);
        return false;
      }

      try {
        setCheckingEmail(true);
        const response = await axios.post(
          `${API_URL}/check-email`,
          { email },
          { withCredentials: true }
        );
        if (response.data.exists) {
          setEmailError('This email is already registered.');
          return false;
        }
        setEmailError('');
        return true;
      } catch (error) {
        console.error('🔥 Error checking email:', error.response?.data || error.message);
        setEmailError('Error checking email. Please try again.');
        return false;
      } finally {
        setCheckingEmail(false);
      }
    }, 500),
    []
  );

  const validateUsername = async () => {
    if (!formData.username.trim()) {
      setUsernameError('Username is required.');
      setCheckingUsername(false);
      return false;
    }

    try {
      setCheckingUsername(true);
      const response = await axios.post(
        `${API_URL}/check-username`,
        { username: formData.username },
        { withCredentials: true }
      );
      if (response.data.exists) {
        setUsernameError('This username is already taken. Please choose another.');
        return false;
      }
      setUsernameError('');
      return true;
    } catch (error) {
      console.error('🔥 Username validation error:', error);
      setUsernameError('Failed to validate username. Please try again.');
      return false;
    } finally {
      setCheckingUsername(false);
    }
  };

  const validateStep = async (currentStep) => {
    if (currentStep === 1) {
      try {
        await form.validateFields(['firstName', 'lastName', 'email', 'phone', 'country', 'password', 'confirmPassword', 'termsAccepted']);
        const emailValid = await validateEmail(formData.email);
        if (!emailValid) return false;
        return true;
      } catch (error) {
        message.error('Please correct the errors in the form.');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.username || !formData.bio) {
        message.error('Please provide a username and bio.');
        return false;
      }
      if (formData.socialLinks.some(link => !link.platform || !link.url || !link.followersCount || link.followersCount <= 0)) {
        message.error('Please fill out all social link fields with valid platform, URL, and follower count.');
        return false;
      }
      const usernameValid = await validateUsername();
      if (!usernameValid) return false;
      return true;
    }
    if (currentStep === 3) {
      if (!formData.audience.primaryAgeRange || !formData.audience.regions.length || !formData.audience.interests.length || !formData.imageProfile) {
        message.error('Please complete all audience fields and upload a profile picture.');
        return false;
      }
      return true;
    }
    if (currentStep === 4) {
      const { totalPosts, totalViews, totalLikes, totalComments, totalShares } = formData.metrics;
      if (totalPosts <= 0 || totalViews <= 0 || totalLikes <= 0 || totalComments <= 0 || totalShares <= 0) {
        message.error('Please provide valid metrics for all fields.');
        return false;
      }
      return true;
    }
    if (currentStep === 5) {
      if (formData.portfolioLinks.some((link) => !link.trim())) {
        message.error('Please provide valid portfolio links or remove empty fields.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === 'bio' ? value : value.trim();
    setFormData({ ...formData, [name]: processedValue });
    form.setFieldsValue({ [name]: processedValue });
    if (name === 'username') {
      setUsernameError('');
    }
    if (name === 'email') {
      setEmailError('');
      validateEmail(value.trim());
    }
    if (name === 'password' || name === 'confirmPassword') {
      form.validateFields(['confirmPassword']).catch(() => {});
    }
  };

  const handlePhoneChange = (phone) => {
    setFormData({ ...formData, phone });
  };

  const handleMetricChange = (metric, value) => {
    setFormData({
      ...formData,
      metrics: { ...formData.metrics, [metric]: value || 0 },
    });
  };

  const handlePortfolioChange = (index, value) => {
    const updatedLinks = [...formData.portfolioLinks];
    updatedLinks[index] = value;
    setFormData({ ...formData, portfolioLinks: updatedLinks });
  };

  const addPortfolioLink = () => {
    setFormData({ ...formData, portfolioLinks: [...formData.portfolioLinks, ''] });
  };

  const removePortfolioLink = (index) => {
    const updatedLinks = formData.portfolioLinks.filter((_, i) => i !== index);
    setFormData({ ...formData, portfolioLinks: updatedLinks });
  };

  const handleSocialPlatformChange = (index, value) => {
    const updatedSocialLinks = [...formData.socialLinks];
    updatedSocialLinks[index].platform = value;
    setFormData({ ...formData, socialLinks: updatedSocialLinks });
  };

  const handleSocialUrlChange = (index, value) => {
    const updatedSocialLinks = [...formData.socialLinks];
    updatedSocialLinks[index].url = value;
    setFormData({ ...formData, socialLinks: updatedSocialLinks });
  };

  const handleFollowerCountChange = (index, value) => {
    const updatedSocialLinks = [...formData.socialLinks];
    updatedSocialLinks[index].followersCount = value || '';
    setFormData({ ...formData, socialLinks: updatedSocialLinks });
  };

  const addSocialLink = () => {
    setFormData({
      ...formData,
      socialLinks: [...formData.socialLinks, { platform: '', url: '', followersCount: '' }],
    });
  };

  const removeSocialLink = (index) => {
    const updatedSocialLinks = formData.socialLinks.filter((_, i) => i !== index);
    setFormData({ ...formData, socialLinks: updatedSocialLinks });
  };

  const handleFileChange = (file) => {
    const isPngOrJpeg = file.type === 'image/png' || file.type === 'image/jpeg';
    if (!isPngOrJpeg) {
      message.error('You can only upload PNG or JPEG files!');
      return Upload.LIST_IGNORE;
    }
    setFormData({ ...formData, imageProfile: file });
    return false;
  };

  const handleNextStep = async () => {
    if (loading || checkingEmail || checkingUsername) return;
    setLoading(true);
    try {
      const isValid = await validateStep(step);
      if (isValid) {
        setStep(step + 1);
      }
    } catch (error) {
      console.error('🔥 Validation error:', error);
      message.error('Please correct the errors in the form.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousStep = () => {
    if (loading || checkingEmail || checkingUsername) return;
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (loading || checkingEmail || checkingUsername) return;
    if (!formData.termsAccepted) {
      message.error('Please accept the terms and conditions.');
      return;
    }
  
    setLoading(true);
    
    // Normalize social media URLs to ensure they have https://
    const normalizedSocialLinks = formData.socialLinks.map(link => ({
      ...link,
      url: link.url && !link.url.startsWith('http://') && !link.url.startsWith('https://') 
        ? `https://${link.url}` 
        : link.url
    }));
    
    // Normalize portfolio links to ensure they have https://
    const normalizedPortfolioLinks = formData.portfolioLinks.map(link => 
      link && !link.startsWith('http://') && !link.startsWith('https://') 
        ? `https://${link}` 
        : link
    );
    
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('username', formData.username);
    formDataToSubmit.append('firstName', formData.firstName);
    formDataToSubmit.append('lastName', formData.lastName);
    formDataToSubmit.append('email', formData.email);
    formDataToSubmit.append('phone', formData.phone);
    formDataToSubmit.append('country', formData.country);
    formDataToSubmit.append('password', formData.password);
    formDataToSubmit.append('bio', formData.bio);
    formDataToSubmit.append('primaryAgeRange', formData.audience.primaryAgeRange);
    formDataToSubmit.append('regions', JSON.stringify(formData.audience.regions));
    formDataToSubmit.append('interests', JSON.stringify(formData.audience.interests));
    formDataToSubmit.append('socialLinks', JSON.stringify(normalizedSocialLinks));
    formDataToSubmit.append('termsAccepted', formData.termsAccepted);
    formDataToSubmit.append('portfolioLinks', JSON.stringify(normalizedPortfolioLinks));
    formDataToSubmit.append('totalPosts', formData.metrics.totalPosts);
    formDataToSubmit.append('totalViews', formData.metrics.totalViews);
    formDataToSubmit.append('totalLikes', formData.metrics.totalLikes);
    formDataToSubmit.append('totalComments', formData.metrics.totalComments);
    formDataToSubmit.append('totalShares', formData.metrics.totalShares);
    formDataToSubmit.append('role', formData.role);
  
    if (formData.imageProfile) {
      formDataToSubmit.append('imageProfile', formData.imageProfile);
    }
  
    try {
      const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');
      console.log(`🟢 Calling API: ${API_URL}/register/creator`);
      const response = await axios.post(
        `${API_URL}/register/creator`,
        formDataToSubmit,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );
  
      console.log('🟢 Registration response:', response.data);
      message.success('Registration successful!');

      // Submit creator profile to IndexNow for faster indexing
      if (formData.username) {
        submitCreatorProfileToIndexNow(formData.username).catch(error => {
          console.warn('⚠️ IndexNow submission failed:', error);
        });
      }

      if (response.data.redirect_url) {
        // Always extract just the pathname to avoid URL concatenation issues
        try {
          const urlObj = new URL(response.data.redirect_url, window.location.origin);
          const redirectUrl = urlObj.pathname + urlObj.search + urlObj.hash;
          console.log('🔄 Redirecting to:', redirectUrl);
          window.location.href = redirectUrl;
        } catch (e) {
          console.log('🔄 Using fallback redirect:', response.data.redirect_url);
          window.location.href = response.data.redirect_url;
        }
      } else if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to register creator';
      console.error('🔥 Error submitting form:', errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reference to the form instance
  const [form] = Form.useForm();

  return (
    <Container>
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <FormCard>
          <Title>Creator Registration</Title>
          <Subtitle>Step {step} of 5: {['Personal Information', 'Bio & Social Links', 'Audience Information', 'Metrics', 'Portfolio'][step - 1]}</Subtitle>

          {/* Step Indicator */}
          <StepIndicator>
            {[1, 2, 3, 4, 5].map((s) => (
              <StepDot key={s} active={step >= s} />
            ))}
          </StepIndicator>

          <Form form={form} layout="vertical" role="form">
          {step === 1 && (
  <>
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: 'Please enter your first name' }]}
        >
          <StyledInput
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
            aria-label="First Name"
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true, message: 'Please enter your last name' }]}
        >
          <StyledInput
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
            aria-label="Last Name"
          />
        </Form.Item>
      </Col>
    </Row>

    <Form.Item
      label="Email"
      name="email"
      validateStatus={emailError ? 'error' : ''}
      help={emailError}
      rules={[
        { required: true, message: 'Please enter your email' },
        { type: 'email', message: 'Please enter a valid email' },
      ]}
    >
      <StyledInput
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter email"
        aria-label="Email"
      />
    </Form.Item>

    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item
          label="Phone"
          name="phone"
          rules={[{ required: true, message: 'Please enter your phone number' }]}
        >
          <PhoneInput
            country={'us'}
            value={formData.phone}
            onChange={handlePhoneChange}
            inputStyle={{
              width: '100%',
              height: '44px',
              borderRadius: '24px',
              border: '1px solid #d1d5db',
              padding: '10px 16px 10px 48px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            }}
            buttonStyle={{
              borderRadius: '24px 0 0 24px',
              border: '1px solid #d1d5db',
              borderRight: 'none',
              background: '#fff',
              padding: '0 8px',
              width: '48px',
            }}
            containerStyle={{
              marginBottom: '8px',
            }}
            dropdownStyle={{
              borderRadius: '16px',
              fontFamily: 'Inter, sans-serif',
            }}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          label="Country"
          name="country"
          rules={[{ required: true, message: 'Please select your country' }]}
        >
          <CountryDropdown
            value={formData.country}
            onChange={(val) => {
              setFormData({ ...formData, country: val });
              form.setFieldsValue({ country: val });
            }}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '24px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
            }}
            classes="ant-input"
          />
        </Form.Item>
      </Col>
    </Row>

    <Form.Item
      label="Password"
      name="password"
      rules={[
        { required: true, message: 'Please enter a password' },
        { min: 8, message: 'Password must be at least 8 characters' },
      ]}
    >
      <StyledPasswordInput
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter password"
        aria-label="Password"
        autoComplete="new-password"
      />
      <PasswordStrengthBar password={formData.password} style={{ marginTop: '8px' }} />
    </Form.Item>

    <Form.Item
      label="Confirm Password"
      name="confirmPassword"
      dependencies={['password']}
      rules={[
        { required: true, message: 'Please confirm your password' },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('password') === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('Passwords do not match'));
          },
        }),
      ]}
      validateTrigger={['onChange', 'onBlur']}
    >
      <StyledPasswordInput
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm password"
        aria-label="Confirm Password"
        autoComplete="new-password"
      />
    </Form.Item>

    <Form.Item
      name="termsAccepted"
      valuePropName="checked"
      rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject('You must accept the terms') }]}
    >
      <Checkbox
        checked={formData.termsAccepted}
        onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
      >
        Accept our <a href="/terms" target="_blank" style={{ color: '#26A69A' }}>Terms and Conditions</a>
      </Checkbox>
    </Form.Item>

    <motion.div variants={buttonVariants} whileHover="hover">
      <StyledButton
        type="primary"
        primary
        onClick={handleNextStep}
        loading={loading || checkingEmail || checkingUsername}
        disabled={loading || checkingEmail || checkingUsername || !!emailError}
        block
        aria-label="Next: Bio & Social Links"
      >
        Next: Bio & Social Links
      </StyledButton>
    </motion.div>
  </>
)}

            {step === 2 && (
              <>
                <Form.Item
                  label="Creator Username"
                  name="username"
                  validateStatus={usernameError ? 'error' : ''}
                  help={usernameError}
                  rules={[{ required: true, message: 'Please enter a username' }]}
                >
                  <StyledInput
                    addonBefore="@"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="username (e.g., creator123)"
                    maxLength={50}
                    aria-label="Creator Username"
                  />
                </Form.Item>

                <Form.Item
                  label="Bio"
                  name="bio"
                  rules={[{ required: true, message: 'Please provide a bio' }]}
                >
                  <StyledTextArea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Describe yourself in a few words"
                    maxLength={150}
                    showCount
                    rows={4}
                    aria-label="Bio"
                  />
                </Form.Item>

                <Subtitle>Social Networks</Subtitle>
                {formData.socialLinks.map((social, index) => (
                  <SocialLinkContainer key={index}>
                    <DeleteButton
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeSocialLink(index)}
                      aria-label={`Remove social link ${index + 1}`}
                    />
                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name={`socialPlatform${index}`}
                          rules={[{ required: true, message: 'Please select a platform' }]}
                        >
                          <StyledSelect
                            options={socialPlatforms}
                            placeholder="Platform"
                            value={social.platform}
                            onChange={(value) => handleSocialPlatformChange(index, value)}
                            aria-label={`Social Platform ${index + 1}`}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name={`socialFollowers${index}`}
                          rules={[{ required: true, message: 'Please enter follower count' }]}
                        >
                          <StyledInputNumber
                            placeholder="Followers"
                            value={social.followersCount}
                            onChange={(value) => handleFollowerCountChange(index, value)}
                            min={0}
                            aria-label={`Follower Count ${index + 1}`}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          name={`socialUrl${index}`}
                          rules={[
                            { required: true, message: 'Please enter a URL' },
                            { type: 'url', message: 'Please enter a valid URL' },
                          ]}
                        >
                          <StyledInput
                            placeholder="Profile URL (e.g., https://instagram.com/username)"
                            value={social.url}
                            onChange={(e) => handleSocialUrlChange(index, e.target.value)}
                            aria-label={`Social URL ${index + 1}`}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </SocialLinkContainer>
                ))}

                <motion.div variants={buttonVariants} whileHover="hover">
                  <StyledButton
                    type="dashed"
                    dashed
                    onClick={addSocialLink}
                    icon={<PlusOutlined />}
                    block
                    aria-label="Add Social Network"
                  >
                    Add Social Network
                  </StyledButton>
                </motion.div>

                <Row gutter={16} style={{ marginTop: '24px' }}>
                  <Col xs={24} sm={12}>
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <StyledButton onClick={handlePreviousStep} block aria-label="Previous Step">
                        Back
                      </StyledButton>
                    </motion.div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <StyledButton
                        type="primary"
                        primary
                        onClick={handleNextStep}
                        loading={loading || checkingEmail || checkingUsername}
                        disabled={loading || checkingEmail || checkingUsername || !!usernameError}
                        block
                        aria-label="Next: Audience Information"
                      >
                        Next: Audience Information
                      </StyledButton>
                    </motion.div>
                  </Col>
                </Row>
              </>
            )}

            {step === 3 && (
              <>
                <Form.Item
                  label="Primary Age Range"
                  name="primaryAgeRange"
                  rules={[{ required: true, message: 'Please select a primary age range' }]}
                >
                  <StyledSelect
                    options={ageRangeOptions}
                    value={formData.audience.primaryAgeRange}
                    onChange={(value) => setFormData({
                      ...formData,
                      audience: { ...formData.audience, primaryAgeRange: value },
                    })}
                    placeholder="Select primary age range"
                    aria-label="Primary Age Range"
                  />
                </Form.Item>

                <Form.Item
                  label="Regions Reached"
                  name="regions"
                  rules={[{ required: true, message: 'Please select at least one region' }]}
                >
                  <StyledSelect
                    mode="multiple"
                    options={regionsOptions}
                    value={formData.audience.regions}
                    onChange={(value) => setFormData({
                      ...formData,
                      audience: { ...formData.audience, regions: value },
                    })}
                    placeholder="Select regions"
                    aria-label="Regions Reached"
                  />
                </Form.Item>

                <Form.Item
                  label="Interests (Niche)"
                  name="interests"
                  rules={[{ required: true, message: 'Please select at least one interest' }]}
                >
                  <StyledSelect
                    mode="multiple"
                    options={nichesOptions}
                    value={formData.audience.interests}
                    onChange={(value) => setFormData({
                      ...formData,
                      audience: { ...formData.audience, interests: value },
                    })}
                    placeholder="Select interests"
                    aria-label="Interests"
                  />
                </Form.Item>

                <Form.Item
                  label="Profile Picture"
                  name="imageProfile"
                  rules={[{ required: true, message: 'Please upload a profile picture' }]}
                >
                  <Upload
                    name="profilePic"
                    listType="picture"
                    beforeUpload={handleFileChange}
                    maxCount={1}
                    fileList={formData.imageProfile ? [formData.imageProfile] : []}
                    onRemove={() => setFormData({ ...formData, imageProfile: null })}
                  >
                    <StyledButton icon={<UploadOutlined />} aria-label="Upload Profile Picture">
                      Upload Profile Picture (PNG or JPEG)
                    </StyledButton>
                  </Upload>
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <StyledButton onClick={handlePreviousStep} block aria-label="Previous Step">
                        Back
                      </StyledButton>
                    </motion.div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <StyledButton
                        type="primary"
                        primary
                        onClick={handleNextStep}
                        loading={loading}
                        disabled={loading}
                        block
                        aria-label="Next: Metrics"
                      >
                        Next: Metrics
                      </StyledButton>
                    </motion.div>
                  </Col>
                </Row>
              </>
            )}

            {step === 4 && (
              <>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Total Number of Posts"
                      name="totalPosts"
                      rules={[{ required: true, message: 'Please enter total posts' }]}
                    >
                      <StyledInputNumber
                        min={0}
                        value={formData.metrics.totalPosts}
                        onChange={(value) => handleMetricChange('totalPosts', value)}
                        aria-label="Total Posts"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Total Views (Last 90 Days)"
                      name="totalViews"
                      rules={[{ required: true, message: 'Please enter total views' }]}
                    >
                      <StyledInputNumber
                        min={0}
                        value={formData.metrics.totalViews}
                        onChange={(value) => handleMetricChange('totalViews', value)}
                        aria-label="Total Views"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Total Likes (Last 90 Days)"
                      name="totalLikes"
                      rules={[{ required: true, message: 'Please enter total likes' }]}
                    >
                      <StyledInputNumber
                        min={0}
                        value={formData.metrics.totalLikes}
                        onChange={(value) => handleMetricChange('totalLikes', value)}
                        aria-label="Total Likes"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Total Comments (Last 90 Days)"
                      name="totalComments"
                      rules={[{ required: true, message: 'Please enter total comments' }]}
                    >
                      <StyledInputNumber
                        min={0}
                        value={formData.metrics.totalComments}
                        onChange={(value) => handleMetricChange('totalComments', value)}
                        aria-label="Total Comments"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      label="Total Shares (Last 90 Days)"
                      name="totalShares"
                      rules={[{ required: true, message: 'Please enter total shares' }]}
                    >
                      <StyledInputNumber
                        min={0}
                        value={formData.metrics.totalShares}
                        onChange={(value) => handleMetricChange('totalShares', value)}
                        aria-label="Total Shares"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <StyledButton onClick={handlePreviousStep} block aria-label="Previous Step">
                        Back
                      </StyledButton>
                    </motion.div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <StyledButton
                        type="primary"
                        primary
                        onClick={handleNextStep}
                        loading={loading}
                        disabled={loading}
                        block
                        aria-label="Next: Portfolio"
                      >
                        Next: Portfolio
                      </StyledButton>
                    </motion.div>
                  </Col>
                </Row>
              </>
            )}

            {step === 5 && (
              <>
                <Subtitle>Share links to your best posts to showcase to brands:</Subtitle>
                {formData.portfolioLinks.length === 0 && addPortfolioLink()}

                {formData.portfolioLinks.map((link, index) => (
                  <Row gutter={16} key={index} style={{ marginBottom: '16px' }}>
                    <Col xs={20}>
                      <Form.Item
                        name={`portfolioLink${index}`}
                        rules={[{ type: 'url', message: 'Please enter a valid URL', when: (value) => !!value }]}
                      >
                        <StyledInput
                          placeholder="Enter post URL (e.g., https://instagram.com/p/example)"
                          value={link}
                          onChange={(e) => handlePortfolioChange(index, e.target.value)}
                          aria-label={`Portfolio Link ${index + 1}`}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={4}>
                      <DeleteButton
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removePortfolioLink(index)}
                        aria-label={`Remove portfolio link ${index + 1}`}
                      />
                    </Col>
                  </Row>
                ))}

                <motion.div variants={buttonVariants} whileHover="hover">
                  <StyledButton
                    type="dashed"
                    dashed
                    onClick={addPortfolioLink}
                    icon={<PlusOutlined />}
                    block
                    aria-label="Add Portfolio Link"
                  >
                    Add Another Post Link
                  </StyledButton>
                </motion.div>

                <Row gutter={16} style={{ marginTop: '24px' }}>
                  <Col xs={24} sm={12}>
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <StyledButton onClick={handlePreviousStep} block aria-label="Previous Step">
                        Back
                      </StyledButton>
                    </motion.div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <StyledButton
                        type="primary"
                        primary
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={loading}
                        block
                        aria-label="Complete Profile"
                      >
                        Complete Profile
                      </StyledButton>
                    </motion.div>
                  </Col>
                </Row>
              </>
            )}
          </Form>
        </FormCard>
      </motion.div>
    </Container>
  );
}

export default CreatorOnboardingForm;