import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { tokens } from '../theme/tokens';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${(props) => props.$minHeight || (props.$fullScreen ? '100vh' : '240px')};
  width: 100%;
  background: ${(props) => (props.$fullScreen ? tokens.bg : 'transparent')};
`;

const SpinnerWrapper = styled(motion.div)`
  position: relative;
  width: 44px;
  height: 44px;
  margin-bottom: ${(props) => (props.$showText ? '14px' : '0')};
`;

const SpinnerCircle = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid ${tokens.subtle};
  border-top-color: ${tokens.primary};
  border-radius: 50%;
`;

const LoadingText = styled(motion.p)`
  color: ${tokens.textMuted};
  font-size: 14px;
  font-weight: 500;
  font-family: ${tokens.fontFamily};
  margin: 0;
`;

/**
 * Shared page/section loading UI — spinner + optional message.
 * Use fullScreen for auth gates and layout shells; default for in-page fetches.
 */
const LoadingSpinner = ({
  fullScreen = false,
  text = 'Loading...',
  showText = true,
  minHeight,
}) => (
  <LoadingContainer $fullScreen={fullScreen} $minHeight={minHeight}>
    <SpinnerWrapper
      $showText={showText && Boolean(text)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <SpinnerCircle
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.75,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </SpinnerWrapper>
    {showText && text ? (
      <LoadingText
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        {text}
      </LoadingText>
    ) : null}
  </LoadingContainer>
);

export default LoadingSpinner;
export { LoadingSpinner };
