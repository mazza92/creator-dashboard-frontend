import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal, Button } from 'antd';

const PROnboarding = ({ visible, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      emoji: '🎁',
      title: 'Welcome to PR Brands',
      description: 'Discover brands that send FREE PR packages to creators like you! No need to wait for brand demand - start reaching out today.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      emoji: '🔍',
      title: 'Discover Brands',
      description: 'Swipe through 50+ brands (100+ for Pro members) across beauty, fashion, tech, food & more. Each brand includes contact emails and application forms.',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #EC4899 100%)'
    },
    {
      emoji: '💾',
      title: 'Save & Organize',
      description: 'Save brands you love to your pipeline. Track them through 4 stages: Saved → Pitched → Responded → Success.',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)'
    },
    {
      emoji: '📧',
      title: 'Pitch with Templates',
      description: 'Use our proven email templates with high success rates. Just copy, customize, and send. We\'ll help you land your first PR package in 7 days!',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    },
    {
      emoji: '🚀',
      title: 'Get Started!',
      description: 'Ready to kickstart your creator journey? Start discovering brands and sending pitches today. Your first PR package is just a swipe away!',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as complete
      localStorage.setItem('prOnboardingCompleted', 'true');
      onClose();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('prOnboardingCompleted', 'true');
    onClose();
  };

  return (
    <Modal
      open={visible}
      onCancel={handleSkip}
      footer={null}
      width="90%"
      style={{ maxWidth: '500px', top: 50 }}
      closeIcon={null}
    >
      <OnboardingContainer>
        <AnimatePresence mode="wait">
          <StepCard
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <GradientBackground gradient={steps[currentStep].gradient} />

            <StepContent>
              <StepEmoji>{steps[currentStep].emoji}</StepEmoji>
              <StepTitle>{steps[currentStep].title}</StepTitle>
              <StepDescription>{steps[currentStep].description}</StepDescription>
            </StepContent>

            <ProgressDots>
              {steps.map((_, index) => (
                <Dot key={index} active={index === currentStep} />
              ))}
            </ProgressDots>

            <ButtonContainer>
              {currentStep < steps.length - 1 ? (
                <>
                  <SkipButton onClick={handleSkip}>Skip</SkipButton>
                  <NextButton onClick={handleNext}>Next</NextButton>
                </>
              ) : (
                <GetStartedButton onClick={handleNext}>
                  Get Started!
                </GetStartedButton>
              )}
            </ButtonContainer>
          </StepCard>
        </AnimatePresence>
      </OnboardingContainer>
    </Modal>
  );
};

// Styled Components
const OnboardingContainer = styled.div`
  padding: 20px;
  position: relative;
`;

const StepCard = styled(motion.div)`
  position: relative;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const GradientBackground = styled.div`
  position: absolute;
  top: -40px;
  left: -40px;
  right: -40px;
  height: 200px;
  background: ${props => props.gradient};
  border-radius: 20px;
  opacity: 0.15;
  z-index: 0;
`;

const StepContent = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px 20px;
`;

const StepEmoji = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
  animation: bounce 2s infinite;

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

const StepTitle = styled.h2`
  font-size: 28px;
  font-weight: 800;
  color: #1F2937;
  margin: 0 0 16px 0;
`;

const StepDescription = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #6B7280;
  margin: 0;
`;

const ProgressDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 20px 0;
`;

const Dot = styled.div`
  width: ${props => props.active ? '24px' : '8px'};
  height: 8px;
  border-radius: 4px;
  background: ${props => props.active ? '#3B82F6' : '#E5E7EB'};
  transition: all 0.3s ease;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
`;

const SkipButton = styled(Button)`
  height: 48px;
  padding: 0 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: 2px solid #E5E7EB;
  color: #6B7280;

  &:hover {
    border-color: #3B82F6;
    color: #3B82F6;
  }
`;

const NextButton = styled(Button)`
  height: 48px;
  padding: 0 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #3B82F6 0%, #EC4899 100%);
  border: none;
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`;

const GetStartedButton = styled(Button)`
  height: 56px;
  padding: 0 48px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border: none;
  color: white;
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  }
`;

export default PROnboarding;
