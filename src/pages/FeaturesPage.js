import React from 'react';
import { Typography, Row, Col, Card, Space } from 'antd';
import { 
  LineChartOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  DollarOutlined,
  MessageOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Paragraph } = Typography;

const PageContainer = styled.div`
  padding-top: 80px;
  min-height: 100vh;
  background: #ffffff;
`;

const Section = styled.section`
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled(Card)`
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const FeatureIcon = styled.div`
  font-size: 48px;
  color: #26A69A;
  margin-bottom: 24px;
`;

const FeaturesPage = () => {
  const features = [
    {
      icon: <LineChartOutlined />,
      title: 'Analytics Dashboard',
      description: 'Track your performance metrics, audience growth, and engagement rates in real-time with our comprehensive analytics dashboard.',
      benefits: [
        'Real-time performance tracking',
        'Audience demographics',
        'Engagement metrics',
        'Revenue analytics'
      ]
    },
    {
      icon: <TeamOutlined />,
      title: 'Brand Collaboration',
      description: 'Connect with brands that align with your content and audience. Manage campaigns and track performance all in one place.',
      benefits: [
        'Brand matching algorithm',
        'Campaign management',
        'Contract tracking',
        'Performance reporting'
      ]
    },
    {
      icon: <CalendarOutlined />,
      title: 'Content Calendar',
      description: 'Plan and schedule your content across multiple platforms. Integrate brand campaigns seamlessly into your content strategy.',
      benefits: [
        'Multi-platform scheduling',
        'Campaign integration',
        'Content analytics',
        'Automated posting'
      ]
    },
    {
      icon: <DollarOutlined />,
      title: 'Payment Processing',
      description: 'Secure and automated payment processing for all your brand collaborations. Track earnings and manage invoices effortlessly.',
      benefits: [
        'Secure payments',
        'Automated invoicing',
        'Revenue tracking',
        'Tax documentation'
      ]
    },
    {
      icon: <MessageOutlined />,
      title: 'Communication Hub',
      description: 'Centralized messaging system for all your brand communications. Keep track of conversations and collaboration details.',
      benefits: [
        'Direct messaging',
        'File sharing',
        'Message history',
        'Notification system'
      ]
    },
    {
      icon: <SafetyOutlined />,
      title: 'Security & Privacy',
      description: 'Enterprise-grade security to protect your data and content. Advanced privacy controls for your personal information.',
      benefits: [
        'Data encryption',
        'Privacy controls',
        'Secure storage',
        'Access management'
      ]
    }
  ];

  return (
    <PageContainer>
      <Section>
        <Title level={1} style={{ textAlign: 'center', marginBottom: '48px' }}>
          Platform Features
        </Title>
        <Paragraph style={{ textAlign: 'center', fontSize: '18px', maxWidth: '800px', margin: '0 auto 64px' }}>
          Everything you need to grow your creator business and manage brand collaborations effectively.
        </Paragraph>
        
        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <FeatureCard>
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <Title level={3} style={{ marginBottom: '16px' }}>
                  {feature.title}
                </Title>
                <Paragraph style={{ marginBottom: '24px' }}>
                  {feature.description}
                </Paragraph>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: '#26A69A', marginRight: '8px' }}>•</span>
                      {benefit}
                    </div>
                  ))}
                </Space>
              </FeatureCard>
            </Col>
          ))}
        </Row>
      </Section>
    </PageContainer>
  );
};

export default FeaturesPage; 