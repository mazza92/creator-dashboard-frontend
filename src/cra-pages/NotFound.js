import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import LandingPageLayout from '../Layouts/LandingPageLayout';

const NotFoundContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 80px 24px;
  text-align: center;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const NotFoundTitle = styled.h1`
  font-size: 6rem;
  font-weight: 700;
  color: #26A69A;
  margin: 0;
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: 4rem;
  }
`;

const NotFoundSubtitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 24px 0 16px;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const NotFoundText = styled.p`
  font-size: 1.125rem;
  color: #666;
  margin-bottom: 32px;
  max-width: 500px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <LandingPageLayout>
      <Helmet>
        <title>404 - Page Not Found | Newcollab</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to Newcollab homepage or browse our blog." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://newcollab.co/404" />
      </Helmet>
      <NotFoundContainer>
        <NotFoundTitle>404</NotFoundTitle>
        <NotFoundSubtitle>Page Not Found</NotFoundSubtitle>
        <NotFoundText>
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </NotFoundText>
        <ButtonGroup>
          <Button 
            type="primary" 
            size="large" 
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>
          <Button 
            size="large" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button 
            size="large"
            onClick={() => navigate('/blog')}
          >
            Browse Blog
          </Button>
        </ButtonGroup>
      </NotFoundContainer>
    </LandingPageLayout>
  );
};

export default NotFound;
