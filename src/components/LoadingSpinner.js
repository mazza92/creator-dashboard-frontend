import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${props => props.$fullScreen ? '100vh' : '200px'};
  width: 100%;
  background: ${props => props.$fullScreen ? '#fcfbf9' : 'transparent'};
`;

const SpinnerWrapper = styled(motion.div)`
  position: relative;
  width: 50px;
  height: 50px;
  margin-bottom: 16px;
`;

const SpinnerCircle = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: #26A69A;
  border-radius: 50%;
`;

const LoadingText = styled(motion.p)`
  color: #64748b;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
`;

const LoadingSpinner = ({ fullScreen = false, text = 'Loading...' }) => {
  return (
    <LoadingContainer $fullScreen={fullScreen}>
      <SpinnerWrapper
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <SpinnerCircle
          animate={{ rotate: 360 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </SpinnerWrapper>
      <LoadingText
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {text}
      </LoadingText>
    </LoadingContainer>
  );
};

export default LoadingSpinner; 