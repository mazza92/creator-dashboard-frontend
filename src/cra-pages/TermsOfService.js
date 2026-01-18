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

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Newcollab</title>
        <meta name="description" content="Newcollab's terms of service - Learn about the rules and guidelines for using our creator-brand collaboration platform." />
      </Helmet>

      <Container>
        <Title level={1}>Terms of Service</Title>
        <Paragraph>Last updated: {new Date().toLocaleDateString()}</Paragraph>

        <Section>
          <Title level={2}>1. Agreement to Terms</Title>
          <Paragraph>
            By accessing or using Newcollab, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our platform.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>2. Platform Description</Title>
          <Paragraph>
            Newcollab is a platform that connects content creators with brands for collaboration opportunities. We facilitate:
          </Paragraph>
          <ul>
            <li>Content project submissions by creators</li>
            <li>Brand bidding and campaign invites</li>
            <li>Secure payment processing</li>
            <li>Communication between creators and brands</li>
          </ul>
        </Section>

        <Section>
          <Title level={2}>3. User Responsibilities</Title>
          <Paragraph>
            As a user of Newcollab, you agree to:
          </Paragraph>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Respect intellectual property rights</li>
            <li>Engage in fair and honest business practices</li>
          </ul>
        </Section>

        <Section>
          <Title level={2}>4. Creator Guidelines</Title>
          <Paragraph>
            Content creators must:
          </Paragraph>
          <ul>
            <li>Provide accurate audience metrics and engagement data</li>
            <li>Deliver content as agreed in collaboration terms</li>
            <li>Disclose sponsored content according to platform guidelines</li>
            <li>Maintain professional communication with brands</li>
            <li>Follow platform-specific content guidelines</li>
          </ul>
        </Section>

        <Section>
          <Title level={2}>5. Brand Guidelines</Title>
          <Paragraph>
            Brands must:
          </Paragraph>
          <ul>
            <li>Provide accurate company information</li>
            <li>Honor agreed payment terms</li>
            <li>Respect creator creative freedom within agreed parameters</li>
            <li>Provide clear campaign requirements</li>
            <li>Maintain professional communication</li>
          </ul>
        </Section>

        <Section>
          <Title level={2}>6. Payment Terms</Title>
          <Paragraph>
            Payment processing is handled through secure third-party providers (Stripe/PayPal). We:
          </Paragraph>
          <ul>
            <li>Hold funds in escrow until content delivery</li>
            <li>Release payments upon content approval</li>
            <li>Charge a platform fee for successful collaborations</li>
            <li>Process refunds according to our refund policy</li>
          </ul>
        </Section>

        <Section>
          <Title level={2}>7. Intellectual Property</Title>
          <Paragraph>
            Users retain rights to their content, subject to:
          </Paragraph>
          <ul>
            <li>Collaboration agreements between creators and brands</li>
            <li>Platform usage rights for promotional purposes</li>
            <li>Content licensing terms specified in each collaboration</li>
          </ul>
        </Section>

        <Section>
          <Title level={2}>8. Dispute Resolution</Title>
          <Paragraph>
            We encourage users to resolve disputes amicably. For unresolved issues:
          </Paragraph>
          <ul>
            <li>Contact our support team for mediation</li>
            <li>Follow our dispute resolution process</li>
            <li>Arbitration may be required for certain disputes</li>
          </ul>
        </Section>

        <Section>
          <Title level={2}>9. Platform Modifications</Title>
          <Paragraph>
            We reserve the right to:
          </Paragraph>
          <ul>
            <li>Modify or discontinue the platform</li>
            <li>Update these terms with notice to users</li>
            <li>Suspend or terminate accounts for violations</li>
          </ul>
        </Section>

        <Section>
          <Title level={2}>10. Contact Information</Title>
          <Paragraph>
            For questions about these terms, please contact:
            <br />
            Email: team@newcollab.co
          </Paragraph>
        </Section>
      </Container>
    </>
  );
};

export default TermsOfService; 