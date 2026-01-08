import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Row, Col, message, Input } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiCheckCircle,
  FiCopy,
  FiArrowRight,
  FiShare2,
  FiUsers,
  FiDollarSign,
  FiCalendar
} from 'react-icons/fi';
import axios from 'axios';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

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

const SuccessHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
  @media (max-width: 600px) {
    margin-bottom: 24px;
  }
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(90deg, #10b981 0%, #4ade80 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px auto;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
  
  svg {
    font-size: 40px;
    color: white;
  }
`;

const SuccessTitle = styled(Title)`
  font-size: 32px !important;
  color: #1f2937 !important;
  margin-bottom: 8px !important;
  @media (max-width: 600px) {
    font-size: 24px !important;
  }
`;

const SuccessSubtitle = styled(Text)`
  color: #6b7280;
  font-size: 18px;
  @media (max-width: 600px) {
    font-size: 16px;
  }
`;

const InfoCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(16, 185, 129, 0.08);
  border: none;
  background: #ffffff;
  margin-bottom: 24px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
  
  .info-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(90deg, #10b981 0%, #4ade80 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
  }
  
  .info-content {
    flex: 1;
    
    .info-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }
    
    .info-description {
      font-size: 14px;
      color: #6b7280;
    }
  }
`;

const ProfileLinkCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(16, 185, 129, 0.08);
  border: none;
  background: linear-gradient(135deg, #f0fdfa 0%, #e6f7ff 100%);
  margin-bottom: 24px;
`;

const LinkInput = styled(Input)`
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #10b981;
  background: #ffffff;
  &:focus, &:hover {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
  @media (max-width: 600px) {
    font-size: 14px;
    padding: 10px 12px;
  }
`;

const CopyButton = styled(Button)`
  background: linear-gradient(90deg, #10b981 0%, #4ade80 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  height: 48px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
  &:hover, &:focus {
    background: linear-gradient(90deg, #22d3ee 0%, #10b981 100%);
    color: #fff;
  }
  @media (max-width: 600px) {
    font-size: 14px;
    height: 44px;
  }
`;

const ActionButton = styled(Button)`
  background: linear-gradient(90deg, #10b981 0%, #4ade80 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 18px;
  height: 56px;
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

const SecondaryButton = styled(Button)`
  background: transparent;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  height: 48px;
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

const FirstAdSlotSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [successData, setSuccessData] = useState(null);
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const location = useLocation();

  useEffect(() => {
    const fetchSuccessData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/creator/first-ad-slot/success`, {
          withCredentials: true
        });
        
        setSuccessData(response.data);
      } catch (error) {
        console.error('Error fetching success data:', error);
        message.error('Failed to load success data. Redirecting to dashboard...');
        navigate('/creator/dashboard/overview');
      } finally {
        setLoading(false);
      }
    };

    fetchSuccessData();
  }, [navigate]);

  const handleCopyLink = () => {
    if (successData?.public_profile_url) {
      navigator.clipboard.writeText(successData.public_profile_url);
      message.success('Profile link copied to clipboard!');
    }
  };

  const handleGoToDashboard = () => {
    navigate('/creator/dashboard/overview');
  };

  const handleCreateAnother = () => {
    navigate('/creator/dashboard/branded-content');
  };

  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div>Loading...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <SuccessHeader>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SuccessIcon>
            <FiCheckCircle />
          </SuccessIcon>
          <SuccessTitle level={1}>🎉 Congratulations!</SuccessTitle>
          <SuccessSubtitle>
            Your first ad slot is now live and visible to brands!
          </SuccessSubtitle>
        </motion.div>
      </SuccessHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <InfoCard>
          <Title level={3} style={{ color: '#1f2937', marginBottom: '24px' }}>
            What happens next?
          </Title>
          
          <InfoItem>
            <div className="info-icon">
              <FiUsers />
            </div>
            <div className="info-content">
              <div className="info-title">Brands can now see your profile</div>
              <div className="info-description">
                Your ad slot is live and brands can start bidding on your content opportunities
              </div>
            </div>
          </InfoItem>
          
          <InfoItem>
            <div className="info-icon">
              <FiDollarSign />
            </div>
            <div className="info-content">
              <div className="info-title">You'll receive bid notifications</div>
              <div className="info-description">
                When brands bid on your ad slots, you'll get email notifications to review and accept/reject
              </div>
            </div>
          </InfoItem>
          
          <InfoItem>
            <div className="info-icon">
              <FiCalendar />
            </div>
            <div className="info-content">
              <div className="info-title">Manage your campaigns</div>
              <div className="info-description">
                Track all your collaborations and earnings in your dashboard
              </div>
            </div>
          </InfoItem>
        </InfoCard>
      </motion.div>

      {successData?.public_profile_url && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ProfileLinkCard>
            <Title level={3} style={{ color: '#10b981', marginBottom: '16px' }}>
              📱 Share Your Profile
            </Title>
            <Text style={{ color: '#6b7280', fontSize: '16px', display: 'block', marginBottom: '16px' }}>
              Add this link to your social media bio so brands can find and book you directly:
            </Text>
            
            <Row gutter={[12, 12]} align="middle">
              <Col flex="auto">
                <LinkInput
                  value={successData.public_profile_url}
                  readOnly
                />
              </Col>
              <Col>
                <CopyButton
                  icon={<FiCopy />}
                  onClick={handleCopyLink}
                >
                  Copy
                </CopyButton>
              </Col>
            </Row>
          </ProfileLinkCard>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <ActionButton
              type="primary"
              block
              onClick={handleGoToDashboard}
              icon={<FiArrowRight />}
            >
              Go to Dashboard
            </ActionButton>
          </Col>
          <Col xs={24} sm={12}>
            <SecondaryButton
              block
              onClick={handleCreateAnother}
              icon={<FiShare2 />}
            >
              Create Another Ad Slot
            </SecondaryButton>
          </Col>
        </Row>
      </motion.div>
    </Container>
  );
};

export default FirstAdSlotSuccess;
