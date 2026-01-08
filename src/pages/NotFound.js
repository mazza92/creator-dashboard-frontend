import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const NotFoundContainer = styled(motion.div)`
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 6rem;
  color: #007bff;
  margin: 0;
  line-height: 1;
`;

const Subtitle = styled.h2`
  color: #333;
  margin: 1rem 0 2rem;
`;

const Message = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const HomeButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background: #0056b3;
  }
`;

const NotFound = () => {
  return (
    <NotFoundContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Title>404</Title>
      <Subtitle>Page Not Found</Subtitle>
      <Message>
        Oops! The page you're looking for doesn't exist or has been moved.
        <br />
        Let's get you back on track.
      </Message>
      <HomeButton to="/">Return to Home</HomeButton>
    </NotFoundContainer>
  );
};

export default NotFound; 