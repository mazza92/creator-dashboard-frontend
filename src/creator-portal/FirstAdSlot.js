import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Spin, Form, Input, Select, DatePicker, message, Progress } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  FiCheckCircle,
  FiTarget,
  FiDollarSign,
  FiImage,
  FiVideo,
  FiCamera,
  FiUsers
} from 'react-icons/fi'; // Feather icons
import { 
  FaInstagram, 
  FaTiktok, 
  FaYoutube, 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn,
  FaTshirt,
  FaRunning,
  FaGamepad,
  FaPlane,
  FaUtensils,
  FaLaptop,
  FaUserFriends,
  FaGraduationCap,
  FaBriefcase,
  FaMusic,
  FaBook,
  // eslint-disable-next-line no-unused-vars
  FaPalette,
  FaHeartbeat,
  FaTools,
  FaBaby,
  FaLeaf,
  FaCar,
  FaHome,
  FaPaw,
  FaTv,
  FaFutbol,
  FaPaintBrush,
  FaChartLine,
  FaCamera
} from 'react-icons/fa';
import { GiLipstick } from 'react-icons/gi';
import { MdOutlineLiveTv } from 'react-icons/md';
import axios from 'axios';
import moment from 'moment';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Container = styled.div`
  padding: 24px;
  background: #f9fafb;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  max-width: 800px;
  margin: 0 auto;
  @media (max-width: 600px) {
    padding: 16px;
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 32px;
  @media (max-width: 600px) {
    margin-bottom: 24px;
  }
`;

const HeaderTitle = styled(Title)`
  font-size: 32px !important;
  color: #1f2937 !important;
  margin-bottom: 8px !important;
  @media (max-width: 600px) {
    font-size: 24px !important;
  }
`;

const HeaderSubtitle = styled(Text)`
  color: #6b7280;
  font-size: 18px;
  @media (max-width: 600px) {
    font-size: 16px;
  }
`;

const ProgressContainer = styled.div`
  margin-bottom: 32px;
  @media (max-width: 600px) {
    margin-bottom: 24px;
  }
`;

const FormCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(16, 185, 129, 0.08);
  border: none;
  background: #ffffff;
  margin-bottom: 24px;
`;

const FormSection = styled.div`
  margin-bottom: 24px;
  @media (max-width: 600px) {
    margin-bottom: 20px;
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  
  .section-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(90deg, #10b981 0%, #4ade80 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
  }
  
  .section-text {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
  }
`;

const StyledInput = styled(Input)`
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #e5e7eb;
  &:focus, &:hover {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
  @media (max-width: 600px) {
    font-size: 14px;
    padding: 10px 12px;
  }
`;

const StyledTextArea = styled(TextArea)`
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #e5e7eb;
  &:focus, &:hover {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
  @media (max-width: 600px) {
    font-size: 14px;
    padding: 10px 12px;
  }
`;

const StyledSelect = styled(Select)`
  .ant-select-selector {
    border-radius: 12px !important;
    padding: 12px 16px !important;
    font-size: 16px !important;
    border: 2px solid #e5e7eb !important;
    min-height: 48px !important;
    display: flex !important;
    align-items: center !important;
  }
  .ant-select-selection-placeholder {
    display: flex !important;
    align-items: center !important;
    color: #9ca3af !important;
    font-size: 16px !important;
  }
  .ant-select-selection-item {
    display: flex !important;
    align-items: center !important;
  }
  &:focus, &:hover {
    .ant-select-selector {
      border-color: #10b981 !important;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
    }
  }
  @media (max-width: 600px) {
    .ant-select-selector {
      font-size: 14px !important;
      padding: 10px 12px !important;
      min-height: 44px !important;
    }
    .ant-select-selection-placeholder {
      font-size: 14px !important;
    }
  }
`;

const StyledDatePicker = styled(DatePicker)`
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px;
  width: 100%;
  border: 2px solid #e5e7eb;
  &:focus, &:hover {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
  @media (max-width: 600px) {
    font-size: 14px;
    padding: 10px 12px;
  }
`;

const PlatformOption = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  .platform-icon {
    font-size: 20px;
    display: inline-flex;
    align-items: center;
  }
`;

const TopicOption = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  .topic-icon {
    font-size: 16px;
    display: inline-flex;
    align-items: center;
  }
`;

const ContentFormatOption = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  .format-icon {
    font-size: 18px;
    display: inline-flex;
    align-items: center;
  }
  .format-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .format-title {
    font-weight: 600;
    color: #1f2937;
  }
  .format-description {
    font-size: 12px;
    color: #6b7280;
  }
`;

const SubmitButton = styled(Button)`
  background: linear-gradient(90deg, #10b981 0%, #4ade80 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 18px;
  width: 100%;
  height: 56px;
  margin-top: 24px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  &:hover, &:focus {
    background: linear-gradient(90deg, #22d3ee 0%, #10b981 100%);
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
  }
  @media (max-width: 600px) {
    font-size: 16px;
    height: 48px;
  }
`;

const SkipButton = styled(Button)`
  background: transparent;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  width: 100%;
  height: 48px;
  margin-top: 12px;
  &:hover, &:focus {
    background: #f9fafb;
    color: #10b981;
    border-color: #10b981;
  }
  @media (max-width: 600px) {
    font-size: 14px;
    height: 44px;
  }
`;

const API_URL = process.env.REACT_APP_BACKEND_URL;

const FirstAdSlot = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [defaults, setDefaults] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const platforms = [
    { name: "Instagram", icon: <FaInstagram style={{ color: '#E1306C' }} /> },
    { name: "TikTok", icon: <FaTiktok style={{ color: '#000000' }} /> },
    { name: "YouTube", icon: <FaYoutube style={{ color: '#FF0000' }} /> },
    { name: "Facebook", icon: <FaFacebookF style={{ color: '#1877F2' }} /> },
    { name: "Twitter", icon: <FaTwitter style={{ color: '#1DA1F2' }} /> },
    { name: "LinkedIn", icon: <FaLinkedinIn style={{ color: '#0A66C2' }} /> },
  ];

  const contentFormats = [
    { 
      value: "Post", 
      label: "Post", 
      description: "Regular social media post",
      icon: <FiImage style={{ color: '#10b981' }} />
    },
    { 
      value: "Reels", 
      label: "Reels", 
      description: "Short vertical videos",
      icon: <FiVideo style={{ color: '#10b981' }} />
    },
    { 
      value: "Stories", 
      label: "Stories", 
      description: "Ephemeral content",
      icon: <FiCamera style={{ color: '#10b981' }} />
    },
    { 
      value: "Live", 
      label: "Live", 
      description: "Live streaming content",
      icon: <MdOutlineLiveTv style={{ color: '#10b981' }} />
    },
  ];

  const topicIcons = {
    "Fashion": <FaTshirt style={{ fontSize: '16px', color: '#7c3aed' }} />,
    "Beauty": <GiLipstick style={{ fontSize: '16px', color: '#7c3aed' }} />,
    "Fitness": <FaRunning style={{ fontSize: '16px', color: '#7c3aed' }} />,
    "Gaming": <FaGamepad style={{ fontSize: '16px', color: '#7c3aed' }} />,
    "Travel": <FaPlane style={{ fontSize: '16px', color: '#7c3aed' }} />,
    "Food & Drink": <FaUtensils style={{ fontSize: '16px', color: '#7c3aed' }} />,
    "Food & Nutrition": <FaUtensils style={{ fontSize: '16px', color: '#7c3aed' }} />,
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

  const topics = [
    "Fashion", "Beauty", "Fitness", "Gaming", "Travel", "Food & Drink", "Food & Nutrition",
    "Technology", "Lifestyle", "Education", "Entertainment", "Health & Wellness", 
    "DIY & Crafts", "Parenting", "Sustainability", "Business & Finance", "Automotive", 
    "Home & Garden", "Pets", "Music", "Books & Literature", "Movies & TV", "Sports", 
    "Photography", "Art & Design", "Science", "News & Politics", "Humor & Memes"
  ];

  const audienceTargets = [
    "18-24", "25-34", "35-44", "45-54", "55+", "All Ages"
  ];

  const projectedViews = [
    "1K-5K", "5K-20K", "20K-100K", "100K+"
  ];

  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/creator/first-ad-slot`, {
          withCredentials: true
        });
        
        if (response.data.defaults) {
          setDefaults(response.data.defaults);
          
          // Parse platforms - handle both string and array formats
          let platforms = ['Instagram', 'TikTok']; // default
          if (response.data.defaults.platforms) {
            if (typeof response.data.defaults.platforms === 'string') {
              try {
                const parsed = JSON.parse(response.data.defaults.platforms);
                // Handle nested JSON strings
                if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string' && parsed[0].startsWith('[')) {
                  platforms = JSON.parse(parsed[0]);
                } else {
                  platforms = parsed;
                }
              } catch {
                platforms = response.data.defaults.platforms.split(', ');
              }
            } else if (Array.isArray(response.data.defaults.platforms)) {
              platforms = response.data.defaults.platforms;
            }
          }
          
          // Parse topics - handle both string and array formats
          let topics = ['Lifestyle']; // default
          if (response.data.defaults.topics) {
            if (typeof response.data.defaults.topics === 'string') {
              try {
                const parsed = JSON.parse(response.data.defaults.topics);
                // Handle nested JSON strings like ["[\"Food & Nutrition\"]"]
                if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string' && parsed[0].startsWith('[')) {
                  topics = JSON.parse(parsed[0]);
                } else {
                  topics = parsed;
                }
              } catch {
                topics = [response.data.defaults.topics];
              }
            } else if (Array.isArray(response.data.defaults.topics)) {
              topics = response.data.defaults.topics;
            }
          }
          
          // Parse audience targets - handle both string and array formats
          let audienceTargets = '18-34'; // default
          if (response.data.defaults.audience_targets) {
            if (typeof response.data.defaults.audience_targets === 'string') {
              try {
                const parsed = JSON.parse(response.data.defaults.audience_targets);
                audienceTargets = Array.isArray(parsed) ? parsed[0] : parsed;
              } catch {
                audienceTargets = response.data.defaults.audience_targets;
              }
            } else if (Array.isArray(response.data.defaults.audience_targets)) {
              audienceTargets = response.data.defaults.audience_targets[0];
            }
          }
          
          // Pre-fill the form with smart defaults
          form.setFieldsValue({
            platforms: platforms,
            content_format: response.data.defaults.content_format || 'Post',
            topics: topics,
            audience_targets: audienceTargets,
            projected_views: response.data.defaults.projected_views || '5K-20K',
            min_bid: response.data.defaults.min_bid || 100,
            description: response.data.defaults.description || '',
            bidding_deadline: response.data.defaults.bidding_deadline ? moment(response.data.defaults.bidding_deadline) : moment().add(14, 'days')
          });
        }
      } catch (error) {
        console.error('Error fetching defaults:', error);
        message.error('Failed to load form defaults. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDefaults();
  }, [form]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const submitData = {
        platforms: values.platforms.join(', '),
        content_format: values.content_format,
        topics: values.topics.join(', '),
        audience_targets: values.audience_targets,
        projected_views: values.projected_views,
        min_bid: values.min_bid,
        description: values.description,
        bidding_deadline: values.bidding_deadline.format('YYYY-MM-DD'),
        currency: values.currency || require('../utils/currency').getUserCurrency()
      };

      const response = await axios.post(`${API_URL}/creator/first-ad-slot`, submitData, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      message.success('Your first ad slot has been created successfully!');
      // UPDATED: Redirect to Discover dashboard instead of success page
      navigate('/creator/dashboard/pr-brands');
    } catch (error) {
      console.error('Error creating ad slot:', error);
      message.error('Failed to create ad slot: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    // UPDATED: Redirect to Discover dashboard instead of overview
    navigate('/creator/dashboard/pr-brands');
  };

  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderSection>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <HeaderTitle level={1}>🚀 Create Your First Ad Slot</HeaderTitle>
          <HeaderSubtitle>
            Let's get you started with your first brand collaboration opportunity. 
            This will only take 2 minutes!
          </HeaderSubtitle>
        </motion.div>
      </HeaderSection>

      <ProgressContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Progress 
            percent={100} 
            strokeColor={{
              '0%': '#10b981',
              '100%': '#4ade80',
            }}
            showInfo={false}
            style={{ marginBottom: 8 }}
          />
          <Text style={{ color: '#6b7280', fontSize: '14px' }}>
            Smart defaults have been pre-filled based on your profile
          </Text>
        </motion.div>
      </ProgressContainer>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <FormCard>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
          >
            <FormSection>
              <SectionTitle>
                <div className="section-icon">
                  <FiUsers />
                </div>
                <div className="section-text">Platforms & Content</div>
              </SectionTitle>
              
              <Form.Item
                name="platforms"
                label="Platforms"
                rules={[{ required: true, message: 'Please select at least one platform' }]}
              >
                <StyledSelect
                  mode="multiple"
                  placeholder="Select platforms"
                  optionLabelProp="label"
                  tagRender={(props) => {
                    const { label, closable, onClose } = props;
                    const platform = platforms.find(p => p.name === label);
                    return (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#f0f9ff',
                        border: '1px solid #0ea5e9',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        margin: '2px',
                        fontSize: '14px'
                      }}>
                        {platform?.icon && <span style={{ fontSize: '14px' }}>{platform.icon}</span>}
                        <span>{label}</span>
                        {closable && (
                          <span 
                            onClick={onClose}
                            style={{ 
                              cursor: 'pointer', 
                              marginLeft: '4px',
                              fontSize: '12px',
                              color: '#6b7280'
                            }}
                          >
                            ×
                          </span>
                        )}
                      </div>
                    );
                  }}
                >
                  {platforms.map((platform) => (
                    <Option key={platform.name} value={platform.name} label={platform.name}>
                      <PlatformOption>
                        <span className="platform-icon">{platform.icon}</span>
                        {platform.name}
                      </PlatformOption>
                    </Option>
                  ))}
                </StyledSelect>
              </Form.Item>

              <Form.Item
                name="content_format"
                label="Content Format"
                rules={[{ required: true, message: 'Please select a content format' }]}
              >
                <StyledSelect 
                  placeholder="Select content format"
                  optionLabelProp="label"
                >
                  {contentFormats.map((format) => (
                    <Option key={format.value} value={format.value} label={format.label}>
                      <ContentFormatOption>
                        <span className="format-icon">{format.icon}</span>
                        <div className="format-details">
                          <div className="format-title">{format.label}</div>
                          <div className="format-description">{format.description}</div>
                        </div>
                      </ContentFormatOption>
                    </Option>
                  ))}
                </StyledSelect>
              </Form.Item>
            </FormSection>

            <FormSection>
              <SectionTitle>
                <div className="section-icon">
                  <FiTarget />
                </div>
                <div className="section-text">Audience & Topics</div>
              </SectionTitle>
              
              <Form.Item
                name="audience_targets"
                label="Target Audience"
                rules={[{ required: true, message: 'Please select target audience' }]}
              >
                <StyledSelect placeholder="Select target audience">
                  {audienceTargets.map((target) => (
                    <Option key={target} value={target}>{target}</Option>
                  ))}
                </StyledSelect>
              </Form.Item>

              <Form.Item
                name="topics"
                label="Topics"
                rules={[{ required: true, message: 'Please select at least one topic' }]}
              >
                <StyledSelect
                  mode="multiple"
                  placeholder="Select topics"
                  maxTagCount={3}
                  optionLabelProp="label"
                  tagRender={(props) => {
                    const { label, closable, onClose } = props;
                    const topicIcon = topicIcons[label] || <FaChartLine style={{ color: '#7c3aed' }} />;
                    return (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#faf5ff',
                        border: '1px solid #a855f7',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        margin: '2px',
                        fontSize: '14px'
                      }}>
                        <span style={{ fontSize: '12px' }}>{topicIcon}</span>
                        <span>{label}</span>
                        {closable && (
                          <span 
                            onClick={onClose}
                            style={{ 
                              cursor: 'pointer', 
                              marginLeft: '4px',
                              fontSize: '12px',
                              color: '#6b7280'
                            }}
                          >
                            ×
                          </span>
                        )}
                      </div>
                    );
                  }}
                >
                  {topics.map((topic) => (
                    <Option key={topic} value={topic} label={topic}>
                      <TopicOption>
                        <span className="topic-icon">{topicIcons[topic] || <FaChartLine style={{ color: '#7c3aed' }} />}</span>
                        {topic}
                      </TopicOption>
                    </Option>
                  ))}
                </StyledSelect>
              </Form.Item>

              <Form.Item
                name="projected_views"
                label="Projected Views"
                rules={[{ required: true, message: 'Please select projected views' }]}
              >
                <StyledSelect placeholder="Select projected views">
                  {projectedViews.map((views) => (
                    <Option key={views} value={views}>{views}</Option>
                  ))}
                </StyledSelect>
              </Form.Item>
            </FormSection>

            <FormSection>
              <SectionTitle>
                <div className="section-icon">
                  <FiDollarSign />
                </div>
                <div className="section-text">Pricing & Details</div>
              </SectionTitle>
              
              <Form.Item
                name="min_bid"
                label="Minimum Bid"
                rules={[{ required: true, message: 'Please enter minimum bid' }]}
              >
                <StyledInput 
                  type="number" 
                  min="0" 
                  step="1" 
                  placeholder="e.g., 100"
                />
              </Form.Item>

              <Form.Item
                name="currency"
                label="Currency"
                rules={[{ required: true, message: 'Please select a currency' }]}
                initialValue={require('../utils/currency').getUserCurrency()}
              >
                <StyledSelect
                  placeholder="Select currency"
                  size="large"
                >
                  {require('../utils/currency').getCurrencyOptions().map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.symbol} {option.name}
                    </Option>
                  ))}
                </StyledSelect>
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please provide a description' }]}
              >
                <StyledTextArea 
                  rows={4} 
                  placeholder="Describe your content opportunity (e.g., 'A fun lifestyle post showcasing a new product')"
                />
              </Form.Item>

              <Form.Item
                name="bidding_deadline"
                label="Bidding Deadline"
                rules={[{ required: true, message: 'Please set a bidding deadline' }]}
              >
                <StyledDatePicker
                  format="YYYY-MM-DD"
                  disabledDate={(current) => current && current < moment().startOf('day')}
                />
              </Form.Item>
            </FormSection>

            <SubmitButton
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<FiCheckCircle />}
            >
              Create My First Ad Slot
            </SubmitButton>

            <SkipButton onClick={handleSkip}>
              Skip for now
            </SkipButton>
          </Form>
        </FormCard>
      </motion.div>
    </Container>
  );
};

export default FirstAdSlot;
