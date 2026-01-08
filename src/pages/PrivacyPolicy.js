import React from 'react';
import styled from 'styled-components';
import { Typography } from 'antd';
import { Helmet } from 'react-helmet-async';

const { Title, Paragraph } = Typography;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 80px 24px;
  font-family: 'Inter', sans-serif;
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Newcollab</title>
        <meta name="description" content="Newcollab's privacy policy - Learn how we protect your data and ensure secure creator-brand collaborations." />
      </Helmet>

      <Container>
        <Title level={1}>Privacy Policy</Title>
        <Paragraph>Last updated: {new Date().toLocaleDateString()}</Paragraph>

        <Section>
          <Title level={2}>1. Introduction</Title>
          <Paragraph>
            Welcome to Newcollab. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our platform and tell you about your privacy rights.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>2. Data We Collect</Title>
          <Paragraph>
            We collect and process the following types of data:
          </Paragraph>
          <ul>
            <li>Account information (name, email, profile details)</li>
            <li>Content creator information (social media handles, audience metrics)</li>
            <li>Brand information (company details, campaign requirements)</li>
            <li>Payment information (processed securely through Stripe/PayPal)</li>
            <li>Communication data (messages between creators and brands)</li>
            <li>Usage data (how you interact with our platform)</li>
          </ul>
        </Section>

        <Section>
          <Title level={2}>3. How We Use Your Data</Title>
          <Paragraph>
            We use your data to:
          </Paragraph>
          <ul>
            <li>Facilitate creator-brand collaborations</li>
            <li>Process payments and maintain financial records</li>
            <li>Improve our platform and user experience</li>
            <li>Send important updates and notifications</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>
        </Section>

        <Section>
          <Title level={2}>4. Data Protection</Title>
          <Paragraph>
            We implement appropriate security measures to protect your personal data, including:
          </Paragraph>
          <ul>
            <li>Encryption of sensitive data</li>
            <li>Regular security assessments</li>
            <li>Secure payment processing</li>
            <li>Access controls and authentication</li>
          </ul>
        </Section>

        <Section>
          <Title level={2}>5. Your Rights</Title>
          <Paragraph>
            You have the right to:
          </Paragraph>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to data processing</li>
            <li>Data portability</li>
          </ul>
        </Section>

        <Section>
          <Title level={2}>6. Cookies and Tracking</Title>
          <Paragraph>
            We use cookies and similar tracking technologies to improve your experience on our platform. You can control cookie preferences through your browser settings.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>7. Third-Party Services</Title>
          <Paragraph>
            We work with trusted third-party services for:
          </Paragraph>
          <ul>
            <li>Payment processing (Stripe, PayPal)</li>
            <li>Analytics and performance monitoring</li>
            <li>Customer support and communication</li>
          </ul>
        </Section>

        <Section>
          <Title level={2}>8. Contact Us</Title>
          <Paragraph>
            If you have any questions about this privacy policy or our data practices, please contact us at:
            <br />
            Email: team@newcollab.co
          </Paragraph>
        </Section>
      </Container>
    </>
  );
};

export default PrivacyPolicy; 