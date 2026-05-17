'use client';

import Link from 'next/link';
import styled from 'styled-components';

export default function NotFound() {
  return (
    <ErrorContainer>
      <ErrorIcon>404</ErrorIcon>
      <ErrorTitle>Media Kit Not Found</ErrorTitle>
      <ErrorText>This creator hasn't published their media kit yet.</ErrorText>
      <BackLink href="/">Go to NewCollab</BackLink>
    </ErrorContainer>
  );
}

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%);
  text-align: center;
  padding: 20px;
`;

const ErrorIcon = styled.div`
  font-size: 72px;
  font-weight: 800;
  color: #E5E7EB;
`;

const ErrorTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const ErrorText = styled.p`
  font-size: 16px;
  color: #6B7280;
  margin: 0;
`;

const BackLink = styled(Link)`
  margin-top: 16px;
  padding: 12px 24px;
  background: #3B82F6;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    background: #2563EB;
  }
`;
