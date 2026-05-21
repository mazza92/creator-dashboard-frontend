import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  padding: 24px;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 48px 40px;
  max-width: 480px;
  width: 100%;
  text-align: center;
`;

const Icon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 12px;
`;

const Body = styled.p`
  font-size: 15px;
  color: #6e6e73;
  line-height: 1.6;
  margin: 0 0 32px;
`;

const BackLink = styled(Link)`
  display: inline-block;
  padding: 12px 28px;
  background: #1d1d1f;
  color: #ffffff;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;

  &:hover {
    background: #3a3a3c;
  }
`;

const Note = styled.p`
  font-size: 13px;
  color: #aeaeb2;
  margin: 24px 0 0;
`;

const Unsubscribed = () => (
  <Page>
    <Card>
      <Icon>✓</Icon>
      <Title>You've been unsubscribed</Title>
      <Body>
        You won't receive any more emails from Newcollab. If this was a mistake,
        you can re-enable emails from your account settings.
      </Body>
      <BackLink to="/">Back to Newcollab</BackLink>
      <Note>
        Changed your mind?{' '}
        <a
          href="/creator/dashboard/settings"
          style={{ color: '#6e6e73', textDecoration: 'underline' }}
        >
          Manage email preferences
        </a>
      </Note>
    </Card>
  </Page>
);

export default Unsubscribed;
