import React, { useState, useEffect, useCallback } from 'react';
import { Card, Typography, Spin, Alert, Button, message, Steps, Space, Divider, Modal, Form } from 'antd';
import { CountryDropdown } from 'react-country-region-selector';
// eslint-disable-next-line no-unused-vars
import { FaCreditCard, FaPaypal, FaCheckCircle, FaInfoCircle, FaWallet, FaQuestionCircle } from 'react-icons/fa';
import Joyride, { STATUS } from 'react-joyride';
import api from '../config/api';
import styled from 'styled-components';
import { tourSteps, tourStyles } from '../config/tourConfig';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
// eslint-disable-next-line no-unused-vars
const { Step } = Steps;

// Styled Components (unchanged)
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

const StyledButton = styled(Button)`
  border-radius: 24px;
  padding: 10px 24px;
  height: auto;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const InfoSection = styled.div`
  background: #e6f7ff;
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  .anticon {
    color: #1890ff;
    font-size: 20px;
    margin-top: 2px;
  }
`;

const StepsContainer = styled.div`
  margin: 32px 0;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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

const PaymentsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [stripeConnected, setStripeConnected] = useState(false);
  const [stripeStatus, setStripeStatus] = useState({ connected: false, onboardingComplete: false });
  const [userEmail, setUserEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [userCountry, setUserCountry] = useState('');
  const [countryForm] = Form.useForm();

  const checkStripeConnection = useCallback(async () => {
    try {
      console.log('🔍 Checking Stripe connection at:', `${api.defaults.baseURL}/creator/stripe-account-status`);
      const response = await api.get('/creator/stripe-account-status');
      console.log('🔍 Stripe account status response:', {
        status: response.status,
        data: response.data,
        headers: response.headers,
      });
      
      setStripeStatus({
        connected: !!response.data.stripe_account_id,
        onboardingComplete: response.data.onboarding_complete || false,
      });
      setUserEmail(response.data.email || '');
      // Store user's country if available (check for null, undefined, or empty string)
      const country = response.data.country;
      const validCountry = (country && typeof country === 'string' && country.trim().length > 0) ? country.trim() : '';
      setUserCountry(validCountry);
      console.log('🔍 Country from API:', { 
        rawCountry: country, 
        validCountry, 
        hasCountry: !!validCountry, 
        type: typeof country,
        isNull: country === null,
        isUndefined: country === undefined,
        fullResponse: response.data
      });
      setLoading(false);
    } catch (err) {
      console.error('🔥 Error checking Stripe connection:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        request_url: `${api.defaults.baseURL}/creator/stripe-account-status`,
        timestamp: new Date().toISOString(),
      });
      let errorMessage = 'Failed to load payment information. Please try again later.';
      if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Unable to connect to the server. Please check your internet connection or try again later.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Unauthorized: Please log in and try again.';
        navigate('/login', { replace: true });
      } else if (err.response?.status === 404) {
        errorMessage = 'Creator profile not found. Please contact support.';
      }
      setError(errorMessage);
      message.error(errorMessage);
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkStripeConnection();
    // Check if this is the user's first visit
    const hasSeenTour = localStorage.getItem('hasSeenPaymentsTour');
    if (!hasSeenTour) {
      setRunTour(true);
    }
  }, [checkStripeConnection]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      localStorage.setItem('hasSeenPaymentsTour', 'true');
    }
  };

  const handleStripeAction = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      console.log('Starting handleStripeAction');
      console.log('Current state:', { 
        stripeStatus, 
        userEmail, 
        userCountry, 
        userCountryType: typeof userCountry,
        userCountryLength: userCountry?.length,
        isEmpty: !userCountry || userCountry.trim().length === 0
      });

      // Check if user has country - if not, show modal to collect it
      // This check should happen BEFORE any Stripe action, regardless of connection status
      // Check for null, undefined, or empty string
      const hasCountry = userCountry && typeof userCountry === 'string' && userCountry.trim().length > 0;
      console.log('🔍 Country check:', { 
        userCountry, 
        hasCountry, 
        type: typeof userCountry,
        isNull: userCountry === null,
        isUndefined: userCountry === undefined,
        isEmpty: userCountry === '',
        length: userCountry?.length
      });
      
      if (!hasCountry) {
        console.log('🔍 No country found, showing country modal');
        console.log('🔍 Current showCountryModal state:', showCountryModal);
        setShowCountryModal(true);
        console.log('🔍 After setShowCountryModal(true), will re-render with modal open');
        setIsProcessing(false);
        return;
      }
      
      console.log('✅ User has country:', userCountry);

      if (!stripeStatus.connected) {
        // Connect new Stripe account with country
        console.log('Creating new Stripe account...');
        const response = await api.post('/connect-stripe-account', {
          email: userEmail,
          country: userCountry, // Send country to backend
        });
        if (response.data.url) {
          console.log('Opening connect URL:', response.data.url);
          window.open(response.data.url, '_blank');
          setConnectionSuccess(true);
          setTimeout(() => {
            navigate('/creator/dashboard/overview', { state: { highlightCreateDraft: true } });
          }, 2000);
        } else {
          throw new Error('No URL received from server');
        }
      } else {
        // Access dashboard or resume onboarding
        console.log('Getting Stripe dashboard URL...');
        const dashboardResponse = await api.get('/creator/stripe-dashboard');
        
        // Check for country mismatch
        if (dashboardResponse.data.country_mismatch) {
          console.log('⚠️ Country mismatch detected:', {
            account_country: dashboardResponse.data.account_country,
            user_country: dashboardResponse.data.user_country
          });
          
          // Show modal asking user to recreate account
          Modal.confirm({
            title: 'Country Mismatch Detected',
            width: 500,
            content: (
              <div>
                <p>Your Stripe account was created with the country <strong>{dashboardResponse.data.account_country}</strong>, 
                but your profile shows <strong>{dashboardResponse.data.user_country}</strong>.</p>
                <p>Stripe accounts cannot have their country changed after creation. To fix this, we need to recreate your Stripe account with the correct country.</p>
                <p><strong>Note:</strong> If you've already completed onboarding or received payments, you may need to contact support.</p>
              </div>
            ),
            okText: 'Recreate Account',
            cancelText: 'Cancel',
            onOk: async () => {
              try {
                setIsProcessing(true);
                const recreateResponse = await api.post('/creator/recreate-stripe-account');
                if (recreateResponse.data.url) {
                  message.success('Account recreated! Please complete onboarding with the correct country.');
                  window.open(recreateResponse.data.url, '_blank');
                  // Refresh status
                  await checkStripeConnection();
                } else {
                  throw new Error('No URL received from server');
                }
                setIsProcessing(false);
              } catch (error) {
                console.error('Error recreating account:', error);
                message.error(error.response?.data?.error || 'Failed to recreate account. Please try again.');
                setIsProcessing(false);
              }
            },
            onCancel: () => {
              setIsProcessing(false);
            }
          });
          return;
        }
        
        if (dashboardResponse.data.onboarding_required) {
          console.log('Redirecting to onboarding URL:', dashboardResponse.data.onboarding_url);
          message.info('Please complete Stripe onboarding.');
          window.open(dashboardResponse.data.onboarding_url, '_blank');
        } else if (dashboardResponse.data.url) {
          console.log('Opening dashboard URL:', dashboardResponse.data.url);
          window.open(dashboardResponse.data.url, '_blank');
          message.success('Opening Stripe Dashboard...');
        } else {
          throw new Error('No dashboard URL received from server');
        }
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      let errorMessage = 'An error occurred. Please try again later.';
      if (error.response?.status === 400 && error.response.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 403) {
        errorMessage = 'Unauthorized: Please log in and try again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Stripe account not found. Please reconnect your account.';
      } else if (error.message === 'No URL received from server') {
        errorMessage = 'Unable to access Stripe Dashboard. Please try again later.';
      }
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
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
        steps={tourSteps.payments}
        styles={tourStyles}
      />

      <Header>
        <Title level={2} style={{ margin: 0, color: '#1f2937' }}>Payment Settings</Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Manage your payment methods and view your earnings
        </Text>
      </Header>

      {connectionSuccess && (
        <Alert
          message="Success!"
          description="Your Stripe account has been connected successfully. Redirecting to Overview page..."
          type="success"
          showIcon
          style={{ marginBottom: 24, borderRadius: 12 }}
        />
      )}

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24, borderRadius: 12 }}
        />
      )}

      <ContentCard className="stripe-connect-section">
        <Title level={4} style={{ marginBottom: 24, color: '#1f2937' }}>Stripe Connect</Title>
        
        <Space direction="vertical" size="large" style={{ width: '100%', marginBottom: 24 }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Current Status:
            </Text>
            <Text type={stripeStatus.connected && stripeStatus.onboardingComplete ? "success" : "warning"}>
              {stripeStatus.connected
                ? stripeStatus.onboardingComplete
                  ? "Your Stripe account is connected"
                  : "Your Stripe account requires onboarding"
                : "Your Stripe account is not connected"}
            </Text>
          </div>

          <StyledButton
            type="primary"
            onClick={handleStripeAction}
            disabled={isProcessing}
            loading={isProcessing}
            icon={stripeStatus.connected ? <FaWallet /> : <FaCreditCard />}
            style={{
              background: stripeStatus.connected && stripeStatus.onboardingComplete ? '#1890ff' : '#26A69A',
              border: 'none',
              width: 'fit-content',
            }}
          >
            {stripeStatus.connected
              ? stripeStatus.onboardingComplete
                ? 'View Balance & Payouts'
                : 'Complete Stripe Setup'
              : 'Connect Stripe Account'}
          </StyledButton>
        </Space>

        <InfoSection>
          <FaInfoCircle />
          <div>
            <Text strong>How it works:</Text>
            <Paragraph style={{ marginBottom: 0 }}>
              Connect your Stripe account to receive payments from brands. Once connected, you'll be able to:
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                <li>Receive payments directly to your bank account</li>
                <li>Track your earnings and payment history</li>
                <li>Manage your payout schedule</li>
                <li>View detailed transaction reports</li>
              </ul>
            </Paragraph>
          </div>
        </InfoSection>

        <StepsContainer>
          <Steps
            current={stripeStatus.connected ? (stripeStatus.onboardingComplete ? 2 : 1) : 0}
            items={[
              {
                title: 'Connect Account',
                description: 'Link your Stripe account to receive payments',
                icon: <FaCreditCard />,
              },
              {
                title: 'Complete Onboarding',
                description: 'Provide required information to Stripe',
                icon: <FaCheckCircle />,
              },
              {
                title: 'Start Earning',
                description: 'Begin receiving payments from brands',
                icon: <FaCheckCircle />,
              },
            ].map((item, index) => ({
              ...item,
              status: index <= (stripeStatus.connected ? (stripeStatus.onboardingComplete ? 2 : 1) : 0) ? 'finish' : 'wait',
            }))}
          />
        </StepsContainer>
      </ContentCard>


          <ContentCard className="payment-methods-section">
        <Title level={4} style={{ marginBottom: 24, color: '#1f2937' }}>Payment Methods</Title>
        
        <InfoSection className="payment-info-section">
          <FaInfoCircle />
          <div>
            <Text strong>Available Payment Methods:</Text>
            <Paragraph style={{ marginBottom: 0 }}>
              We support multiple payment methods to ensure you can receive payments in the way that works best for you:
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                <li>Direct bank transfer (via Stripe)</li>
                <li>PayPal (coming soon)</li>
                <li>Other payment methods (coming soon)</li>
              </ul>
            </Paragraph>
          </div>
        </InfoSection>

        <InfoSection style={{ background: '#f6ffed' }} className="payment-info-section">
          <FaInfoCircle style={{ color: '#52c41a' }} />
          <div>
            <Text strong>How Payments Work:</Text>
            <Paragraph style={{ marginBottom: 0 }}>
              Here's how payments are processed when you receive a booking:
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                <li>Brand pays the full booking amount (e.g., 50€)</li>
                <li>Platform fee of 15% is automatically deducted (e.g., 7.50€)</li>
                <li>You receive 85% of the booking amount (e.g., 42.50€)</li>
                <li>All fees are transparent and shown in your Stripe dashboard</li>
              </ul>
            </Paragraph>
          </div>
        </InfoSection>

        <Divider />

        <Text type="secondary" className="support-section">
          Need help? Contact our support team at team@newcollab.co
        </Text>
      </ContentCard>

      <TourButton
        type="primary"
        icon={<FaQuestionCircle />}
        onClick={() => setRunTour(true)}
        style={{ background: '#26A69A', border: 'none' }}
      />

      {/* Country Collection Modal */}
      <Modal
        title="Select Your Country"
        open={showCountryModal}
        onCancel={() => {
          setShowCountryModal(false);
          setIsProcessing(false);
        }}
        footer={null}
        closable={true}
      >
        <Form
          form={countryForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              // Save country to user profile
              await api.post('/update-user-country', {
                country: values.country,
              });
              
              setUserCountry(values.country);
              setShowCountryModal(false);
              
              // Now proceed with Stripe connection
              setIsProcessing(true);
              
              // Check if account is already connected
              if (stripeStatus.connected) {
                // Account already exists - get dashboard/onboarding URL
                console.log('Account already connected, getting dashboard URL...');
                const dashboardResponse = await api.get('/creator/stripe-dashboard');
                if (dashboardResponse.data.onboarding_required) {
                  console.log('Redirecting to onboarding URL:', dashboardResponse.data.onboarding_url);
                  message.info('Please complete Stripe onboarding.');
                  window.open(dashboardResponse.data.onboarding_url, '_blank');
                } else if (dashboardResponse.data.url) {
                  console.log('Opening dashboard URL:', dashboardResponse.data.url);
                  window.open(dashboardResponse.data.url, '_blank');
                  message.success('Opening Stripe Dashboard...');
                } else {
                  throw new Error('No dashboard URL received from server');
                }
                setIsProcessing(false);
              } else {
                // Create new Stripe account
                const response = await api.post('/connect-stripe-account', {
                  email: userEmail,
                  country: values.country,
                });
                
                if (response.data.url) {
                  console.log('Opening connect URL:', response.data.url);
                  window.open(response.data.url, '_blank');
                  setConnectionSuccess(true);
                  setTimeout(() => {
                    navigate('/creator/dashboard/overview', { state: { highlightCreateDraft: true } });
                  }, 2000);
                } else if (response.data.message && response.data.message.includes('already connected')) {
                  // Account was just created/connected - refresh status and get dashboard URL
                  console.log('Account already connected, refreshing status...');
                  await checkStripeConnection();
                  const dashboardResponse = await api.get('/creator/stripe-dashboard');
                  if (dashboardResponse.data.onboarding_required) {
                    console.log('Redirecting to onboarding URL:', dashboardResponse.data.onboarding_url);
                    message.info('Please complete Stripe onboarding.');
                    window.open(dashboardResponse.data.onboarding_url, '_blank');
                  } else if (dashboardResponse.data.url) {
                    console.log('Opening dashboard URL:', dashboardResponse.data.url);
                    window.open(dashboardResponse.data.url, '_blank');
                    message.success('Opening Stripe Dashboard...');
                  }
                  setIsProcessing(false);
                } else {
                  throw new Error('No URL received from server');
                }
              }
            } catch (error) {
              console.error('Error saving country or connecting Stripe:', error);
              message.error(error.response?.data?.error || 'Failed to save country. Please try again.');
              setIsProcessing(false);
            }
          }}
        >
          <Form.Item
            label="Country"
            name="country"
            rules={[{ required: true, message: 'Please select your country' }]}
          >
            <CountryDropdown
              value={countryForm.getFieldValue('country') || ''}
              onChange={(val) => {
                countryForm.setFieldsValue({ country: val });
              }}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
              }}
              classes="ant-input"
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => {
                setShowCountryModal(false);
                setIsProcessing(false);
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={isProcessing}>
                Continue to Stripe Setup
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Container>
  );
};

export default PaymentsPage;