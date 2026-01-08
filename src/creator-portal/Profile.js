import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin, Alert, Button, message, Steps, Space, Divider } from 'antd';
import { FaCreditCard, FaPaypal, FaCheckCircle, FaInfoCircle, FaWallet, FaQuestionCircle } from 'react-icons/fa';
import Joyride, { STATUS } from 'react-joyride';
import axios from 'axios';
import styled from 'styled-components';
import { tourSteps, tourStyles } from '../config/tourConfig';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

// Styled Components
const Container = styled.div`
  padding: 40px;
  background: #f9fafb;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;
  background: #fff;
  padding: 24px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const ContentCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  .ant-card-body {
    padding: 24px;
  }
`;

const TourButton = styled(Button)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
`;

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    // Check if this is the user's first visit
    const hasSeenTour = localStorage.getItem('hasSeenProfileTour');
    if (!hasSeenTour) {
      setRunTour(true);
    }
    setLoading(false);
  }, []);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      localStorage.setItem('hasSeenProfileTour', 'true');
    }
  };

  const startTour = () => {
    setRunTour(true);
  };

  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={runTour}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={tourSteps.profile}
        styles={tourStyles}
      />

      <Header className="profile-header">
        <Title level={2} style={{ margin: 0, color: '#1f2937' }}>Profile</Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Manage your profile and account settings
        </Text>
      </Header>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24, borderRadius: 12 }}
        />
      )}

      <ContentCard className="profile-info">
        <Title level={4} style={{ marginBottom: 24, color: '#1f2937' }}>Personal Information</Title>
        {/* Add your profile info here */}
      </ContentCard>

      <ContentCard className="profile-settings">
        <Title level={4} style={{ marginBottom: 24, color: '#1f2937' }}>Account Settings</Title>
        {/* Add your settings here */}
      </ContentCard>

      <ContentCard className="profile-preferences">
        <Title level={4} style={{ marginBottom: 24, color: '#1f2937' }}>Preferences</Title>
        {/* Add your preferences here */}
      </ContentCard>

      <TourButton
        type="primary"
        icon={<FaQuestionCircle />}
        onClick={startTour}
        style={{ backgroundColor: '#26A69A' }}
      />
    </Container>
  );
};

export default Profile; 