import React from 'react';
import { Typography, Row, Col, Card, Button, Space } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
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

const PricingCard = styled(Card)`
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -12px;
  right: 24px;
  background: #26A69A;
  color: white;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
`;

const Price = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: #212121;
  margin: 24px 0;
  
  span {
    font-size: 16px;
    font-weight: 400;
    color: #595959;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 24px 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  color: #595959;
  
  .anticon {
    color: #26A69A;
    margin-right: 12px;
  }
`;

const PricingPage = () => {
  const plans = [
    {
      title: 'Starter',
      price: '0',
      description: 'Perfect for creators just starting their journey',
      features: [
        'Basic analytics dashboard',
        'Up to 3 brand collaborations',
        'Standard support',
        'Basic content calendar',
        'Community access'
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      title: 'Professional',
      price: '29',
      description: 'Ideal for growing creators',
      features: [
        'Advanced analytics dashboard',
        'Unlimited brand collaborations',
        'Priority support',
        'Advanced content calendar',
        'Campaign management tools',
        'Revenue tracking',
        'Custom branding'
      ],
      buttonText: 'Start Free Trial',
      popular: true
    },
    {
      title: 'Enterprise',
      price: '99',
      description: 'For established creators and agencies',
      features: [
        'Everything in Professional',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'Team collaboration tools',
        'Advanced security features',
        'White-label options',
        'Custom reporting'
      ],
      buttonText: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <PageContainer>
      <Section>
        <Title level={1} style={{ textAlign: 'center', marginBottom: '24px' }}>
          Simple, Transparent Pricing
        </Title>
        <Paragraph style={{ textAlign: 'center', fontSize: '18px', maxWidth: '800px', margin: '0 auto 64px' }}>
          Choose the plan that best fits your needs. All plans include a 14-day free trial.
        </Paragraph>
        
        <Row gutter={[32, 32]}>
          {plans.map((plan, index) => (
            <Col xs={24} md={8} key={index}>
              <PricingCard>
                {plan.popular && <PopularBadge>Most Popular</PopularBadge>}
                <Title level={3}>{plan.title}</Title>
                <Paragraph>{plan.description}</Paragraph>
                <Price>
                  ${plan.price}<span>/month</span>
                </Price>
                <FeatureList>
                  {plan.features.map((feature, idx) => (
                    <FeatureItem key={idx}>
                      <CheckOutlined />
                      {feature}
                    </FeatureItem>
                  ))}
                </FeatureList>
                <Button
                  type={plan.popular ? 'primary' : 'default'}
                  size="large"
                  block
                  style={{
                    height: '48px',
                    borderRadius: '24px',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  {plan.buttonText}
                </Button>
              </PricingCard>
            </Col>
          ))}
        </Row>

        <div style={{ textAlign: 'center', marginTop: '64px' }}>
          <Title level={4}>Need a custom plan?</Title>
          <Paragraph style={{ marginBottom: '24px' }}>
            Contact our sales team for a tailored solution that meets your specific needs.
          </Paragraph>
          <Button type="primary" size="large" style={{ borderRadius: '24px', padding: '0 32px' }}>
            Contact Sales
          </Button>
        </div>
      </Section>
    </PageContainer>
  );
};

export default PricingPage; 