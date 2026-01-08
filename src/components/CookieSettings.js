import React, { useState, useEffect } from 'react';
import { Switch, Typography, Button, Space } from 'antd';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text } = Typography;

const CookieBanner = styled(motion.div)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  z-index: 1000;
  border: 1px solid rgba(38, 166, 154, 0.1);

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    left: 16px;
    max-width: none;
  }
`;

const CookieSection = styled.div`
  margin-bottom: 16px;
`;

const CookieHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const CookieDescription = styled(Text)`
  color: #64748b;
  font-size: 14px;
  display: block;
  margin-bottom: 12px;
`;

const CookieSettings = ({ isVisible, onClose }) => {
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const savedPreferences = localStorage.getItem('cookiePreferences');
    if (savedPreferences) {
      setCookiePreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handleSavePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    onClose();
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setCookiePreferences(allAccepted);
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    onClose();
  };

  const handleRejectAll = () => {
    const allRejected = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    setCookiePreferences(allRejected);
    localStorage.setItem('cookiePreferences', JSON.stringify(allRejected));
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <CookieBanner
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {!showDetails ? (
            <>
              <Text style={{ marginBottom: 16, display: 'block' }}>
                We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
              </Text>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button onClick={() => setShowDetails(true)}>
                  Customize
                </Button>
                <Space>
                  <Button onClick={handleRejectAll}>Reject All</Button>
                  <Button type="primary" onClick={handleAcceptAll}>
                    Accept All
                  </Button>
                </Space>
              </Space>
            </>
          ) : (
            <>
              <Title level={5} style={{ marginBottom: 16 }}>Cookie Settings</Title>
              
              <CookieSection>
                <CookieHeader>
                  <div>
                    <Title level={5} style={{ margin: 0, fontSize: 14 }}>Necessary Cookies</Title>
                    <CookieDescription>
                      Essential for the website to function properly.
                    </CookieDescription>
                  </div>
                  <Switch checked disabled />
                </CookieHeader>
              </CookieSection>

              <CookieSection>
                <CookieHeader>
                  <div>
                    <Title level={5} style={{ margin: 0, fontSize: 14 }}>Analytics Cookies</Title>
                    <CookieDescription>
                      Help us understand how visitors interact with our website.
                    </CookieDescription>
                  </div>
                  <Switch
                    checked={cookiePreferences.analytics}
                    onChange={(checked) => setCookiePreferences(prev => ({ ...prev, analytics: checked }))}
                  />
                </CookieHeader>
              </CookieSection>

              <CookieSection>
                <CookieHeader>
                  <div>
                    <Title level={5} style={{ margin: 0, fontSize: 14 }}>Marketing Cookies</Title>
                    <CookieDescription>
                      Used to display relevant advertisements.
                    </CookieDescription>
                  </div>
                  <Switch
                    checked={cookiePreferences.marketing}
                    onChange={(checked) => setCookiePreferences(prev => ({ ...prev, marketing: checked }))}
                  />
                </CookieHeader>
              </CookieSection>

              <CookieSection>
                <CookieHeader>
                  <div>
                    <Title level={5} style={{ margin: 0, fontSize: 14 }}>Preference Cookies</Title>
                    <CookieDescription>
                      Remember your preferences and settings.
                    </CookieDescription>
                  </div>
                  <Switch
                    checked={cookiePreferences.preferences}
                    onChange={(checked) => setCookiePreferences(prev => ({ ...prev, preferences: checked }))}
                  />
                </CookieHeader>
              </CookieSection>

              <Space style={{ width: '100%', justifyContent: 'space-between', marginTop: 16 }}>
                <Button onClick={() => setShowDetails(false)}>
                  Back
                </Button>
                <Space>
                  <Button onClick={handleRejectAll}>Reject All</Button>
                  <Button type="primary" onClick={handleSavePreferences}>
                    Save Preferences
                  </Button>
                </Space>
              </Space>
            </>
          )}
        </CookieBanner>
      )}
    </AnimatePresence>
  );
};

export default CookieSettings; 