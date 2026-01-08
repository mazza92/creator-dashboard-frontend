import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle, keyframes, css } from 'styled-components';
import { Helmet } from 'react-helmet-async';
// eslint-disable-next-line no-unused-vars
import { FaMagic, FaTag, FaMoneyBillWave, FaCheckCircle, FaCalendarAlt, FaArrowUp } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';
import { Swiper, SwiperSlide as SwiperSlideBase } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import LandingPageLayout from '../Layouts/LandingPageLayout';
import { useNavigate, Link } from 'react-router-dom';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { motion } from 'framer-motion';
import { ClockCircleOutlined } from '@ant-design/icons';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// New Palette
const primaryBlue = '#3B82F6';
const brightMagenta = '#EC4899';
const warmOrange = '#F59E0B';
const offWhite = '#F9FAFB';
const darkCharcoal = '#1F2937';
const white = '#FFFFFF';
const lightGray = '#E5E7EB';
const midGray = '#6B7280';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${offWhite};
    color: ${darkCharcoal};
    font-family: 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Swiper Overrides for Light Theme */
  .swiper-pagination-bullet {
    background: ${lightGray};
  }
  .swiper-pagination-bullet-active {
    background: ${primaryBlue};
  }
  .swiper-button-prev, .swiper-button-next {
    color: ${primaryBlue};
    transition: opacity 0.3s ease;
    opacity: 0; 
  }
  .swiper-container:hover .swiper-button-prev,
  .swiper-container:hover .swiper-button-next {
    opacity: 0.7;
  }
  .swiper-button-prev:hover,
  .swiper-button-next:hover {
    opacity: 1;
  }

  /* Responsive Platform Advantages */
  .platform-advantages-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    max-width: 1000px;
    margin: 0 auto;
  }
  
  @media (max-width: 768px) {
    .platform-advantages-grid {
      grid-template-columns: 1fr !important;
      gap: 1.5rem;
    }
  }

  /* Responsive Metrics */
  .metrics-desktop {
    display: block;
  }
  
  .metrics-mobile {
    display: none;
  }
  
  @media (max-width: 768px) {
    .metrics-desktop {
      display: none;
    }
    
    .metrics-mobile {
      display: block;
    }
  }
`;

// eslint-disable-next-line no-unused-vars
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const popIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rem 2rem 8rem 2rem;
  padding-top: 12rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  min-height: 100vh;

  &::before, &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    z-index: -1;
    opacity: 0.15;
  }

  &::before {
    width: 800px;
    height: 800px;
    background: ${primaryBlue};
    top: 10%;
    left: -400px;
  }

  &::after {
    width: 600px;
    height: 600px;
    background: ${brightMagenta};
    bottom: 20%;
    right: -300px;
  }

  @media (max-width: 768px) {
    padding-top: 10rem;
    padding: 6rem 1.5rem 6rem 1.5rem;
  }
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
`;

const Section = styled.section`
  margin-bottom: 8rem;
  &:last-child { margin-bottom: 0; }
`;

const BlogSection = styled(Section)`
  padding: 100px 0;
  background: linear-gradient(180deg, ${offWhite} 0%, rgba(249, 250, 251, 0.5) 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(38, 166, 154, 0.2), transparent);
  }

  @media (max-width: 768px) {
    padding: 80px 0;
  }
`;

const BlogContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const BlogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-top: 48px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
    margin-top: 32px;
  }
`;

const BlogCard = styled(motion(Link))`
  display: flex;
  flex-direction: column;
  background: ${white};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  color: inherit;
  height: 100%;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(236, 72, 153, 0.05));
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);

    &::before {
      opacity: 1;
    }

    .blog-image {
      transform: scale(1.05);
    }
  }

  &:active {
    transform: translateY(-4px);
  }
`;

const BlogImageWrapper = styled.div`
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #f0f9f7 0%, #f8fafc 100%);

  @media (max-width: 768px) {
    height: 180px;
  }
`;

const BlogImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
`;

const BlogCardContent = styled.div`
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const BlogCategory = styled.span`
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: #26A69A;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  background: rgba(38, 166, 154, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
  width: fit-content;
`;

const BlogTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${darkCharcoal};
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;

  ${BlogCard}:hover & {
    color: #26A69A;
  }

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const BlogExcerpt = styled.p`
  font-size: 14px;
  color: ${midGray};
  line-height: 1.6;
  margin: 0 0 16px 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const BlogMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: ${midGray};
  padding-top: 16px;
  border-top: 1px solid ${lightGray};
`;

const BlogReadTime = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ViewAllButton = styled(Link)`
  display: block;
  margin: 48px auto 0;
  max-width: 200px;
  text-align: center;
  padding: 16px 32px;
  background: transparent;
  color: ${darkCharcoal};
  border: 2px solid ${darkCharcoal};
  border-radius: 28px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(30, 41, 59, 0.1);

  &:hover {
    transform: translateY(-2px);
    border-color: ${primaryBlue};
    color: ${primaryBlue};
    box-shadow: 0 8px 25px rgba(38, 166, 154, 0.15);
  }

  @media (max-width: 768px) {
    margin-top: 32px;
    width: 100%;
    max-width: 280px;
  }
`;

const GradientHeadline = styled.h1`
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 4.5rem;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 2rem;
  background: linear-gradient(90deg, ${primaryBlue}, ${brightMagenta});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;

  @media (max-width: 1200px) { font-size: 4rem; }
  @media (max-width: 900px) { font-size: 3.5rem; }
  @media (max-width: 768px) { font-size: 2.8rem; }
  @media (max-width: 480px) { font-size: 2.4rem; }
`;

const SubHeadline = styled.p`
  font-size: 1.4rem;
  color: ${midGray};
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  
  @media (max-width: 900px) {
    font-size: 1.25rem;
    margin-bottom: 3rem;
    max-width: 100%;
  }
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 2.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
`;

const SectionHeadline = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: ${darkCharcoal};

  @media (max-width: 768px) { font-size: 2rem; }
`;

const BodyCopy = styled.p`
  font-size: 1.125rem;
  line-height: 1.6;
  color: ${midGray};
  max-width: 550px;
  margin: 0 auto 1.5rem auto;
`;

const VisualContainer = styled.div`
  position: relative;
  width: 100%;
  margin: 3rem auto;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${lightGray};
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);

  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

// eslint-disable-next-line no-unused-vars
const HeroVisualContainer = styled(VisualContainer)`
  max-width: 600px;
  margin: 2rem auto 0;
`;

// eslint-disable-next-line no-unused-vars
const OverlayImage = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 85%;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 1px solid ${lightGray};
  animation: ${({ isVisible }) => isVisible ? css`${popIn} 0.7s 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards` : 'none'};
  opacity: 0;
`;

// eslint-disable-next-line no-unused-vars
const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 3rem;
  text-align: left;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LightCard = styled.div`
  background: ${white};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  transition: all 0.3s ease;
  border: 1px solid ${lightGray};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07);
  }
`;

// eslint-disable-next-line no-unused-vars
const ColumnTitle = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

// eslint-disable-next-line no-unused-vars
const ProblemList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

// eslint-disable-next-line no-unused-vars
const ProblemListItem = styled.li`
  color: ${midGray};
  margin-bottom: 0.75rem;
  padding-left: 1.75rem;
  position: relative;
  
  &:before {
    content: '→';
    position: absolute;
    left: 0;
    font-weight: 700;
  }
`;

// eslint-disable-next-line no-unused-vars
const StepLayout = styled.div`
  text-align: left;
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// eslint-disable-next-line no-unused-vars
const StepItem = styled.div``;
// eslint-disable-next-line no-unused-vars
const StepperTitle = styled.h4`
  font-family: 'Poppins', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;
// eslint-disable-next-line no-unused-vars
const StepperDesc = styled.p`
  color: ${midGray};
  font-size: 1rem;
  text-align: center;
`;

// eslint-disable-next-line no-unused-vars
const BenefitCard = styled(LightCard)`
  &:hover {
    border-color: ${props => props.hoverColor || primaryBlue};
  }
`;

// eslint-disable-next-line no-unused-vars
const IconWrapper = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: ${props => props.color};
`;

// eslint-disable-next-line no-unused-vars
const CardTitle = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: ${darkCharcoal};
`;

const GradientButton = styled.button`
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(45deg, ${brightMagenta}, ${warmOrange});
  color: ${white};
  border: none;
  border-radius: 12px;
  padding: 1rem 2.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 2rem;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 10px 20px rgba(236, 72, 153, 0.3);
  }
`;

const ClaimInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  max-width: 500px;
  margin-left: 0;
  margin-right: auto;
  
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 1.5rem;
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
    margin-top: 2.5rem;
  }
  
  @media (max-width: 768px) {
    margin-top: 2rem;
    gap: 1.25rem;
    width: 100%;
  }
`;

const ClaimInput = styled.input`
  flex: 1;
  padding: 1.25rem 1.5rem;
  border: 2px solid ${lightGray};
  border-radius: 12px;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  background: ${white};
  color: ${darkCharcoal};
  transition: all 0.3s ease;
  min-height: 56px;
  
  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
    font-size: 0.95rem;
    min-height: 52px;
    width: 100%;
  }
  
  @media (max-width: 480px) {
    padding: 0.875rem 1rem;
    font-size: 0.9rem;
    min-height: 48px;
    width: 100%;
  }
  
  &:focus {
    outline: none;
    border-color: ${primaryBlue};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: ${midGray};
    font-size: inherit;
  }
`;

const ClaimButton = styled.button`
  background: linear-gradient(45deg, ${brightMagenta}, ${warmOrange});
  color: ${white};
  border: none;
  border-radius: 12px;
  padding: 1.25rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
  min-height: 56px;
  
  @media (max-width: 768px) {
    padding: 1rem 2rem;
    font-size: 1rem;
    min-height: 52px;
    width: 100%;
  }
  
  @media (max-width: 480px) {
    padding: 0.875rem 1.75rem;
    font-size: 0.95rem;
    min-height: 48px;
    width: 100%;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(236, 72, 153, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const InputPrefix = styled.span`
  color: ${midGray};
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  white-space: nowrap;
`;

// eslint-disable-next-line no-unused-vars
const LightModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(17, 24, 39, 0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
`;

// eslint-disable-next-line no-unused-vars
const LightModalContent = styled.div`
  background-color: ${white};
  padding: 3rem;
  border-radius: 16px;
  text-align: center;
  border: 1px solid ${lightGray};
  color: ${darkCharcoal};
  max-width: 500px;
  position: relative;
`;

// eslint-disable-next-line no-unused-vars
const ModalHeadline = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

// eslint-disable-next-line no-unused-vars
const ModalText = styled.p`
  color: ${midGray};
  line-height: 1.6;
`;

// eslint-disable-next-line no-unused-vars
const ModalCTAButton = styled(GradientButton)`
  margin-top: 2rem;
  width: 100%;
  font-size: 1rem;
  display: block;
  text-decoration: none;
  padding: 1rem 1.5rem;
  box-sizing: border-box;
`;

// eslint-disable-next-line no-unused-vars
const CloseButton = styled.button`
  background: transparent; border: none; color: #9CA3AF;
  position: absolute; top: 1rem; right: 1rem;
  font-size: 1.5rem; cursor: pointer;
`;

// eslint-disable-next-line no-unused-vars
const ShowcaseWrapper = styled.div`
  .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 300px;
    height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.5s ease, opacity 0.5s ease;
  }
  .swiper-slide-active { transform: scale(1); opacity: 1; }
  .swiper-slide-next, .swiper-slide-prev { transform: scale(0.85); opacity: 0.6; }
`;

const ModernPhoneMockup = styled.div`
  position: relative;
  width: 368px;
  height: 667px;
  background: transparent;
  border-radius: 38px;
  box-shadow: 0 8px 32px 0 rgba(31,38,135,0.15);
  border: 1.5px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  @media (max-width: 1200px) {
    width: 345px;
    height: 621px;
  }
  
  @media (max-width: 900px) {
    width: 322px;
    height: 575px;
  }
  
  @media (max-width: 768px) {
    width: 299px;
    height: 529px;
  }
  
  @media (max-width: 480px) {
    width: 276px;
    height: 483px;
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 56px;
    height: 6px;
    background: #e5e7eb;
    border-radius: 3px;
    z-index: 2;
    opacity: 0.7;
  }
`;

const ModernPhoneScreen = styled.div`
  width: 100%;
  height: 100%;
  background: transparent;
  border-radius: 38px;
  overflow: hidden;
  position: relative;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(31,38,135,0.04);
`;

const HeroSection = styled(Section)`
  margin-bottom: 6rem;
  @media (max-width: 900px) {
    margin-bottom: 3rem;
  }
`;
const HeroTwoColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8rem;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 1400px) {
    gap: 6rem;
  }
  
  @media (max-width: 1200px) {
    gap: 4rem;
  }
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

const HeroLeft = styled.div`
  text-align: left;
  max-width: 600px;
  
  @media (max-width: 900px) { 
    text-align: center; 
    max-width: 100%;
    order: 1;
  }
`;

const HeroRight = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  
  @media (max-width: 900px) {
    display: none;
  }
`;

const HeroVideoMobile = styled.div`
  display: none;
  
  @media (max-width: 900px) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 1.5rem 0 2rem 0;
  }
`;
const HeroHeadline = styled(GradientHeadline)`
  margin-bottom: 1.25rem;
  font-size: 2.5rem;
  @media (max-width: 900px) { font-size: 2rem; }
`;
const HeroSub = styled(SubHeadline)`
  margin-bottom: 2.5rem;
  
  @media (max-width: 900px) {
    margin-bottom: 1.5rem;
  }
`;
// eslint-disable-next-line no-unused-vars
const StepsRow = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin: 3rem 0 0 0;
  flex-wrap: wrap;
`;
// eslint-disable-next-line no-unused-vars
const Step = styled.div`
  background: ${white};
  border-radius: 16px;
  padding: 2rem 1.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
  min-width: 220px;
  max-width: 300px;
  flex: 1 1 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
// eslint-disable-next-line no-unused-vars
const StepIcon = styled.div`
  font-size: 2.5rem;
  color: ${primaryBlue};
  margin-bottom: 1rem;
`;
// eslint-disable-next-line no-unused-vars
const StepTitle = styled.h4`
  font-family: 'Poppins', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;
// eslint-disable-next-line no-unused-vars
const StepDescription = styled.p`
  color: ${midGray};
  font-size: 1rem;
  text-align: center;
`;
// eslint-disable-next-line no-unused-vars
const BenefitsListOld = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2.5rem auto 0 auto;
  max-width: 500px;
`;
// eslint-disable-next-line no-unused-vars
const Benefit = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 1.1rem;
  color: ${darkCharcoal};
  margin-bottom: 1.25rem;
  svg { color: ${primaryBlue}; font-size: 1.3rem; flex-shrink: 0; }
`;
// eslint-disable-next-line no-unused-vars
const PerksList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem auto 0 auto;
  max-width: 400px;
`;
// eslint-disable-next-line no-unused-vars
const Perk = styled.li`
  font-size: 1.05rem;
  color: ${midGray};
  margin-bottom: 0.9rem;
  &:before { content: '★ '; color: ${brightMagenta}; }
`;
// eslint-disable-next-line no-unused-vars
const _FinalMockup = styled.div`
  display: flex;
  justify-content: center;
  margin: 2.5rem 0 2rem 0;
`;

const StyledSwiperSlide = styled(SwiperSlideBase)`
  display: flex;
  justify-content: center;
  background: transparent !important;
  box-shadow: none !important;
`;

const BenefitsSection = styled(Section)`
  background: transparent;
  padding: 0;
  margin: 2rem 0;
  
  @media (min-width: 768px) {
    margin: 3rem 0;
  }
  
  @media (min-width: 1024px) {
    margin: 4rem 0;
  }
`;

const BenefitsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
  align-items: start;
  
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
  }
`;

const BenefitsColumn = styled.div`
  width: 100%;
`;

const BenefitsSectionHeader = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: left;
  background: ${props => props.gradient || 'linear-gradient(135deg, #667eea, #764ba2)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 1.375rem;
  }
`;

const BenefitsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${darkCharcoal};
  margin-bottom: 0.75rem;
  line-height: 1.3;
  
  @media (min-width: 768px) {
    font-size: 1.625rem;
  }
  
  @media (min-width: 1024px) {
    font-size: 1.75rem;
  }
`;

const BenefitsDescription = styled.p`
  font-size: 0.9375rem;
  color: ${midGray};
  line-height: 1.6;
  margin-bottom: 1.5rem;
  
  @media (min-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1.75rem;
  }
  
  @media (min-width: 1024px) {
    margin-bottom: 2rem;
  }
`;

const BenefitsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const BenefitItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.875rem 1rem;
  background: ${white};
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
  cursor: default;
  
  &:hover {
    background: rgba(59, 130, 246, 0.02);
    border-left-color: ${primaryBlue};
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    gap: 0.875rem;
  }
`;

const BenefitIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.gradient || 'linear-gradient(135deg, #667eea, #764ba2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
`;

const BenefitContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
`;

const BenefitTitle = styled.h4`
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0;
  color: ${darkCharcoal};
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const BenefitText = styled.p`
  font-size: 0.8125rem;
  color: ${midGray};
  margin: 0;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const ContentFormatsSection = styled(Section)`
  background: linear-gradient(135deg, #ffb3b3 0%, #ffe6f2 50%, #ffe6f2 100%);
  border-radius: 24px;
  padding: 2rem 1rem;
  margin: 2rem 0;
  
  /* Tablet */
  @media (min-width: 768px) {
    padding: 3rem 2rem;
    margin: 3rem 0;
  }
  
  /* Desktop */
  @media (min-width: 1024px) {
    padding: 4rem 2rem;
    margin: 4rem 0;
  }
`;

const ContentFormatsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  align-items: center;
  
  /* Desktop */
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
  }
`;

const ContentFormatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  
  /* Mobile: single column */
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  /* Tablet */
  @media (min-width: 768px) {
    gap: 1.5rem;
  }
`;

const ContentFormatCard = styled.div`
  background: ${props => props.background || '#8B4513'};
  border-radius: 16px;
  padding: 1rem;
  color: ${props => props.color || 'white'};
  
  /* Tablet */
  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`;

const ContentFormatContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  
  /* Desktop */
  @media (min-width: 1024px) {
    flex-direction: row;
    text-align: left;
    gap: 1rem;
  }
`;

const ContentFormatIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.background || '#32CD32'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: ${props => props.color || 'white'};
  
  /* Tablet */
  @media (min-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
`;

// eslint-disable-next-line no-unused-vars
const _ContentFormatNumber = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${props => props.color || '#32CD32'};
  
  /* Tablet */
  @media (min-width: 768px) {
    font-size: 1.8rem;
  }
`;

const ContentFormatLabel = styled.div`
  font-size: 0.7rem;
  color: ${props => props.color || '#90EE90'};
  
  /* Tablet */
  @media (min-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ContentFormatsText = styled.div`
  /* Mobile-first: full width */
  width: 100%;
`;

const ContentFormatsButton = styled.button`
  background: #E6E6FA;
  color: #1a1a1a;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  display: block;
  
  /* Desktop */
  @media (min-width: 768px) {
    width: auto;
    display: inline-block;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
`;

const SocialPlatformsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
  align-items: center;
  
  /* Desktop */
  @media (min-width: 768px) {
    justify-content: flex-start;
  }
`;

const SocialPlatformIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.background || '#000000'};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const ContentFormatsTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  text-align: center;
  
  /* Desktop */
  @media (min-width: 768px) {
    font-size: 2.5rem;
    text-align: left;
  }
`;

const ContentFormatsDescription = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
  text-align: center;
  
  /* Desktop */
  @media (min-width: 768px) {
    font-size: 1.1rem;
    text-align: left;
  }
`;

const FaqContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding: 0 1rem;
  
  /* Tablet */
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    padding: 0;
  }
  
  /* Desktop */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
  }
`;

const FaqItem = styled.div`
  background: ${props => props.gradient || 'linear-gradient(135deg, #667eea, #764ba2)'};
  border-radius: 16px;
  padding: 1.5rem;
  color: white;
  box-shadow: ${props => props.shadow || '0 8px 32px rgba(102, 126, 234, 0.2)'};
  border: none;
  
  /* Mobile */
  @media (max-width: 767px) {
    padding: 1.25rem;
    border-radius: 12px;
  }
  
  /* Desktop */
  @media (min-width: 1024px) {
    padding: 2rem;
  }
`;

const FaqQuestion = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: white;
  
  /* Mobile */
  @media (max-width: 767px) {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  
  /* Desktop */
  @media (min-width: 1024px) {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
`;

const FaqAnswer = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  
  /* Mobile */
  @media (max-width: 767px) {
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  /* Desktop */
  @media (min-width: 1024px) {
    font-size: 1rem;
    line-height: 1.6;
  }
`;

const Founding50 = () => {
  // eslint-disable-next-line no-unused-vars
  const [modalOpen, _setModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const navigate = useNavigate();
  const analytics = useAnalytics();
  
  // eslint-disable-next-line no-unused-vars
  const { ref: _solutionRef, inView: _solutionInView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : 'auto';
  }, [modalOpen]);

  // Force re-render for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      // Force re-render on resize
      window.dispatchEvent(new Event('resize'));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load featured blog posts (strategically selected new posts)
  useEffect(() => {
    const loadFeaturedPosts = async () => {
      try {
        setPostsLoading(true);
        // Pinned posts (always shown first)
        const pinnedSlugs = [
          'list-of-companies-that-send-pr-packages-2025',
          'pr-emails-for-brands-2025',
          'free-creator-pr-list-skincare-fashion-beauty-2026'
        ];
        // Only load pinned posts for featured section
        const featuredSlugs = pinnedSlugs;

        const postPromises = featuredSlugs.map(async (slug, index) => {
          try {
            const postData = await import(`../content/posts/${slug}.json`);
            return postData.default;
          } catch (error) {
            console.warn(`Post ${slug} not found, skipping...`);
            return null;
          }
        });

        const loadedPosts = (await Promise.all(postPromises))
          .filter(post => post !== null);
        
        console.log('Loaded featured posts:', loadedPosts.map(p => p.slug));
        setFeaturedPosts(loadedPosts);
      } catch (error) {
        console.error('Error loading featured posts:', error);
        setFeaturedPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    loadFeaturedPosts();
  }, []);

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsClaiming(true);
    
    // Track the claim attempt
    analytics.trackButtonClick('claim_username', 'founding50_landing');
    analytics.trackConversion('username_claim_attempt', 1);
    
    // Clean the username (remove special characters, spaces, etc.)
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    
    // Track successful navigation
    analytics.trackNavigation('founding50_landing', 'creator_signup');
    
    // Redirect to signup with the username
    navigate(`/register/creator?username=${encodeURIComponent(cleanUsername)}`);
  };

  // eslint-disable-next-line no-unused-vars
  const _creatorProfiles = [
    "https://newcollab.co/c/bossmediatech",
    "https://newcollab.co/c/socialcontentking",
    "https://newcollab.co/c/jinedalessandra",
    "https://newcollab.co/c/ericdoesecom",
    "https://newcollab.co/c/mervozkn"
  ];

  return (
    <LandingPageLayout canonicalUrl="https://newcollab.co/">
      <Helmet>
        <title>Get PR Packages & Paid Partnerships from Brands | Free PR Packages for Creators | Newcollab</title>
        <meta name="description" content="Join 10,000+ creators receiving free PR packages and paid brand partnerships. Get matched with 1,000+ brands sending PR packages to small influencers. Free signup, no credit card required." />
        <meta name="keywords" content="PR packages for creators, free PR packages, brands sending PR packages, PR packages for small influencers, how to get PR packages, PR packages 2025, micro influencer PR packages, brand PR packages, influencer PR packages, get PR packages from brands, PR package opportunities, free PR packages for influencers, PR packages for content creators, brands that send PR packages, PR package signup" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Newcollab" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://newcollab.co/" />
        <meta property="og:title" content="Get PR Packages & Paid Partnerships from Brands | Free PR Packages for Creators" />
        <meta property="og:description" content="Join 10,000+ creators receiving free PR packages and paid brand partnerships. Get matched with 1,000+ brands sending PR packages to small influencers. Free signup, instant access." />
        <meta property="og:image" content="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/creator%20platform%20bidding%20newcollab.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvY3JlYXRvciBwbGF0Zm9ybSBiaWRkaW5nIG5ld2NvbGxhYi5wbmciLCJpYXQiOjE3NDg5NjE4MDMsImV4cCI6MTc4MDQ5NzgwM30.phXlWgOo0CJLMxAunr1R9oxjqqTDGSIkjdUwO39Q5k4" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Newcollab" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://newcollab.co/" />
        <meta property="twitter:title" content="Get PR Packages & Paid Partnerships from Brands | Free PR Packages" />
        <meta property="twitter:description" content="Join 10,000+ creators receiving free PR packages and paid brand partnerships. Get matched with 1,000+ brands. Free signup." />
        <meta property="twitter:image" content="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/creator%20platform%20bidding%20newcollab.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvY3JlYXRvciBwbGF0Zm9ybSBiaWRkaW5nIG5ld2NvbGxhYi5wbmciLCJpYXQiOjE3NDg5NjE4MDMsImV4cCI6MTc4MDQ5NzgwM30.phXlWgOo0CJLMxAunr1R9oxjqqTDGSIkjdUwO39Q5k4" />
        <meta property="twitter:site" content="@newcollab" />
        <meta property="twitter:creator" content="@newcollab" />
      
        {/* Video-specific meta tags for better indexing */}
        <meta property="og:video" content="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators/prpack_newcollab.mp4" />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="400" />
        <meta property="og:video:height" content="800" />
        <meta property="og:video:duration" content="30" />
        <meta property="og:video:tag" content="PR packages for creators" />
        <meta property="og:video:tag" content="free PR packages" />
        <meta property="og:video:tag" content="brands sending PR packages" />
        <meta property="og:video:tag" content="PR packages for small influencers" />
        <meta property="og:video:tag" content="paid partnerships" />
        <meta property="og:video:tag" content="creator monetization" />
        
        {/* Additional Schema.org Structured Data */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Newcollab - PR Packages & Paid Partnerships for Creators",
              "description": "Join 10,000+ creators receiving free PR packages and paid brand partnerships. Get matched with 1,000+ brands sending PR packages to small influencers. Free signup, no credit card required.",
              "url": "https://newcollab.co/f50",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "validFrom": "${new Date().toISOString()}",
                "url": "https://newcollab.co/f50"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "127"
              },
              "provider": {
                "@type": "Organization",
                "name": "Newcollab",
                "url": "https://newcollab.co",
                "logo": "https://newcollab.co/logo.png"
              },
              "featureList": [
                "Free PR packages from 1,000+ brands",
                "Paid brand partnerships",
                "Smart creator matching system",
                "No pitching required",
                "Real brand offers with budgets",
                "Creator monetization",
                "Free link in bio for paid partnerships",
                "Professional bidding page"
              ]
            }
          `}
        </script>
        
        {/* Enhanced FAQ Schema for Better AI Search Results */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How do I get PR packages from brands?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sign up for Newcollab to get matched with 1,000+ brands sending PR packages to small influencers. Our smart matching system connects you with brands based on your niche, engagement rate, and follower count. No pitching required—brands send PR packages directly to you."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Are PR packages free for creators?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! PR packages are completely free for creators. Brands send free PR packages to small influencers. Newcollab is free to join—no fees for creators to receive PR packages. You only pay a commission when a PR package leads to a paid collaboration."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do I get matched with brands for PR packages?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Newcollab's smart matching system automatically connects you with brands that align with your niche and content style. Set your preferences for niche, engagement rate, and follower count, and we'll match you with brands actively sending PR packages to creators like you."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What brands send PR packages to small influencers?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Over 1,000 brands on Newcollab send PR packages to small influencers, including beauty brands like Tarte and Fenty Beauty, fashion brands like Sézane, lifestyle brands like Lululemon, and many more. Brands value small influencers for their 3-6% engagement rates and authentic content."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How much are PR packages worth?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "PR packages for small influencers vary in value depending on the brand and products included. Some packages may include premium products or tech items. PR packages often lead to paid collaborations worth $100-$2,000."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Do I need to pitch brands to get PR packages?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No! With Newcollab, you don't need to pitch brands. Our matching system connects you with brands, and they send PR package offers directly to you. Simply review offers and accept the ones that interest you. No cold emails or endless DMs required."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do I get free link in bio for paid partnerships?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sign up for Newcollab to get your free link in bio for paid partnerships. Add it to your social media profiles and let brands bid on your content. The process takes less than 2 minutes and requires no technical skills."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do sponsorships for influencers work?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Influencers create a professional bidding page, brands browse and bid on content slots, and creators accept or reject offers instantly. No more spam DMs or endless negotiations - just real bids from brands with actual budgets."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is Newcollab free for creators?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, Newcollab is completely free for creators. No fees to join, receive PR packages, or get matched with brands. You only pay a commission when a PR package leads to a paid collaboration. Free link in bio for paid partnerships included."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What content types can I monetize?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can monetize all content types including Instagram Reels, Stories, posts, TikTok videos, YouTube shorts, live streams, podcasts, and more. Set your own prices and let brands bid on your ad slots. PR packages are available for all content types."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How much can small influencers earn?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Small influencers (1K-50K followers) typically earn $10-$50 per 1K followers from paid partnerships. Additionally, they receive free PR packages, which often lead to paid collaborations worth $100-$2,000. With Newcollab's bidding system, you can set your minimum bid and let brands compete."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do brands find me?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Brands use Newcollab's matching system to find creators who align with their brand. You can also create a professional bidding page where brands browse and bid on your content. No need to send cold emails or DMs. Your profile showcases your content, engagement rates, and pricing."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Are payments secure?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, Newcollab uses Stripe Connect for all payments, ensuring fast and secure payouts. No more chasing payments or dealing with late invoices. Get paid automatically when collaborations are completed."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I use this with my existing Linktree?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely! Newcollab integrates seamlessly with your existing Linktree or any other link-in-bio tool. Simply add your Newcollab link alongside your other important links."
                  }
                }
              ]
            }
          `}
        </script>

        {/* WebSite Schema with SearchAction for Better SEO */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Newcollab",
              "url": "https://newcollab.co",
              "description": "Get PR packages and paid partnerships from brands. Join 10,000+ creators receiving free PR packages from 1,000+ brands.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://newcollab.co/search?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Newcollab",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://newcollab.co/logo.png"
                }
              }
            }
          `}
        </script>

        {/* Service Schema for PR Packages */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Service",
              "name": "PR Packages for Creators",
              "description": "Get matched with 1,000+ brands sending free PR packages to small influencers. No pitching required—brands send PR packages directly to you.",
              "provider": {
                "@type": "Organization",
                "name": "Newcollab",
                "url": "https://newcollab.co"
              },
              "serviceType": "PR Package Matching & Distribution",
              "areaServed": "Worldwide",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "url": "https://newcollab.co/register/creator"
              },
              "audience": {
                "@type": "Audience",
                "audienceType": "Content Creators, Small Influencers, Micro Influencers"
              }
            }
          `}
        </script>

        {/* Enhanced Organization Schema for E-E-A-T */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Newcollab",
              "url": "https://newcollab.co",
              "logo": "https://newcollab.co/logo.png",
              "description": "Newcollab is the leading platform connecting creators with brands for PR packages and paid partnerships. Join 10,000+ creators receiving free PR packages from 1,000+ brands. Our smart matching system connects small influencers with brands, eliminating the need for pitching and enabling real monetization opportunities.",
              "foundingDate": "2024",
              "numberOfEmployees": "25-50",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://newcollab.co/contact"
              },
              "sameAs": [
                "https://twitter.com/newcollab",
                "https://instagram.com/newcollab",
                "https://linkedin.com/company/newcollab"
              ]
            }
          `}
        </script>

        {/* ItemList Schema for PR Package Benefits */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "PR Package Benefits for Creators",
              "description": "Key benefits of receiving PR packages through Newcollab",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Free PR Packages from 1,000+ Brands",
                  "description": "Receive free PR packages from verified brands without any upfront cost"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Smart Creator Matching",
                  "description": "Get automatically matched with brands that align with your niche and content style"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "No Pitching Required",
                  "description": "Brands send PR package offers directly to you—no cold emails or DMs needed"
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "name": "Paid Partnership Opportunities",
                  "description": "PR packages often lead to paid collaborations worth $100-$2,000"
                },
                {
                  "@type": "ListItem",
                  "position": 5,
                  "name": "Free Signup",
                  "description": "Completely free to join and receive PR packages. Only pay commission on paid collaborations"
                }
              ]
            }
          `}
        </script>

        {/* Video Schema for Hero Video */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "VideoObject",
              "name": "Newcollab PR Packages & Brand Partnerships Demo",
              "description": "Watch how creators receive free PR packages and paid brand partnerships through Newcollab. See the demo of our platform connecting creators with brands.",
              "thumbnailUrl": "https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators//newcolla-biolink-sponsoring-tool%20(1).png",
              "uploadDate": "2025-08-04T00:00:00Z",
              "duration": "PT30S",
              "contentUrl": "https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators/prpack_newcollab.mp4",
              "embedUrl": "https://newcollab.co/f50",
              "publisher": {
                "@type": "Organization",
                "name": "Newcollab",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://newcollab.co/logo.png"
                }
              },
              "creator": {
                "@type": "Organization",
                "name": "Newcollab"
              },
              "keywords": "PR packages for creators, free PR packages, brands sending PR packages, PR packages for small influencers, how to get PR packages, paid partnerships, creator monetization, influencer marketing, brand partnerships, PR package opportunities",
              "genre": "Business",
              "inLanguage": "en",
              "isFamilyFriendly": true,
              "interactionStatistic": {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/WatchAction",
                "userInteractionCount": 1500
              },
              "potentialAction": {
                "@type": "WatchAction",
                "target": "https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators/prpack_newcollab.mp4"
              }
            }
          `}
        </script>

      </Helmet>
      <GlobalStyle />
      <PageWrapper>
        <ContentContainer>

          {/* HERO SECTION */}
          <HeroSection>
            <HeroTwoColumn>
              <HeroLeft>
                <h1 style={{ margin: 0, padding: 0 }}>
                  <HeroHeadline>Get PR packages & paid partnerships from brands</HeroHeadline>
                </h1>
                <p style={{ margin: 0, padding: 0 }}>
                  <HeroSub>
                    Join 10,000+ creators receiving free PR packages and paid brand sponsorships. Get your free link in bio, connect with 1,000+ brands, and start monetizing your content today.
                  </HeroSub>
                </p>
                <HeroVideoMobile>
                  <ModernPhoneMockup>
                    <ModernPhoneScreen>
                      <video
                        src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators/prpack_newcollab.mp4"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '38px' }}
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls={false}
                        aria-label="Demo of Newcollab PR packages and brand partnerships"
                        poster="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators//newcolla-biolink-sponsoring-tool%20(1).png"
                        preload="metadata"
                      />
                    </ModernPhoneScreen>
                  </ModernPhoneMockup>
                </HeroVideoMobile>
                <form onSubmit={handleClaim}>
                  <ClaimInputContainer>
                    <div style={{ 
                      display: 'flex', 
                      flex: 1, 
                      alignItems: 'center', 
                      border: '2px solid #e5e7eb', 
                      borderRadius: '12px', 
                      background: 'white', 
                      padding: '0 1.25rem',
                      minWidth: '0',
                      width: '100%',
                      minHeight: '56px'
                    }}>
                      <InputPrefix>newcollab.co/</InputPrefix>
                      <ClaimInput
                        type="text"
                        placeholder="yourname"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ 
                          border: 'none', 
                          padding: '1rem 0', 
                          boxShadow: 'none',
                          minWidth: '0',
                          flex: '1',
                          width: '100%'
                        }}
                      />
                    </div>
                    <ClaimButton type="submit" disabled={!username.trim() || isClaiming}>
                      {isClaiming ? 'Claiming...' : 'Claim your link'}
                    </ClaimButton>
                  </ClaimInputContainer>
                </form>
                <div style={{ 
                  marginTop: '2rem', 
                  textAlign: 'center',
                  fontSize: '1rem',
                  color: midGray
                }}>
                  <span style={{ marginRight: '0.5rem' }}>Are you a brand?</span>
                  <Link 
                    to="/brands/pr-packages" 
                    style={{ 
                      color: primaryBlue, 
                      fontWeight: '600',
                      textDecoration: 'none',
                      borderBottom: `2px solid ${primaryBlue}`,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = brightMagenta;
                      e.target.style.borderBottomColor = brightMagenta;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = primaryBlue;
                      e.target.style.borderBottomColor = primaryBlue;
                    }}
                  >
                    Send PR packages to influencers →
                  </Link>
                </div>
              </HeroLeft>
              <HeroRight>
                <ModernPhoneMockup>
                  <ModernPhoneScreen>
                    <video
                      src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators/prpack_newcollab.mp4"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '38px' }}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls={false}
                      aria-label="Demo of Newcollab PR packages and brand partnerships"
                      poster="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators//newcolla-biolink-sponsoring-tool%20(1).png"
                      preload="metadata"
                    />
                  </ModernPhoneScreen>
                </ModernPhoneMockup>
              </HeroRight>
            </HeroTwoColumn>
          </HeroSection>

                     {/* INSTRUCTIONS SECTION */}
           <Section>
             <SectionHeadline style={{ textAlign: 'center', marginBottom: '1rem' }}>
               Get PR packages & paid partnerships in 3 steps
             </SectionHeadline>
             <BodyCopy style={{ 
               textAlign: 'center', 
               maxWidth: '600px', 
               margin: '0 auto 4rem auto', 
               fontSize: '1.2rem',
               color: '#666'
             }}>
               Join thousands of creators receiving free PR packages and paid brand sponsorships. Start in minutes.
             </BodyCopy>
             
             <div style={{ 
               display: 'grid', 
               gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
               gap: '3rem',
               maxWidth: '1200px',
               margin: '0 auto'
             }}>
               {/* Step 1 */}
               <div style={{ textAlign: 'center' }}>
                 <div style={{ 
                   width: '60px',
                   height: '60px',
                   borderRadius: '50%',
                   background: 'linear-gradient(135deg, #26A69A, #4CAF50)',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   color: 'white',
                   fontSize: '1.8rem',
                   fontWeight: '700',
                   margin: '0 auto 1.5rem auto'
                 }}>
                   1
                 </div>
                 <h3 style={{ 
                   fontSize: '1.5rem',
                   fontWeight: '700',
                   color: '#1a1a1a',
                   marginBottom: '1rem'
                 }}>
                   Get your link
                 </h3>
                 <p style={{ 
                   color: '#666',
                   fontSize: '1.1rem',
                   lineHeight: '1.6',
                   marginBottom: '1.5rem'
                 }}>
                   Claim your newcollab.co/username and add it to your social media bio link or integrate it with your existing link in bio tool.
                 </p>
                 <div style={{ 
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '0.5rem',
                   color: '#26A69A',
                   fontSize: '0.9rem',
                   fontWeight: '600',
                   marginBottom: '1.5rem'
                 }}>
                   <FaMagic />
                   <span>Takes less than 2 minutes</span>
                 </div>
                 <img 
                   src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/claim_newcollab_bio_link.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvY2xhaW1fbmV3Y29sbGFiX2Jpb19saW5rLnBuZyIsImlhdCI6MTc1NDE0NzkzNywiZXhwIjoxNzg1NjgzOTM3fQ.-u1JB1ifgUfCHFoEpm3ZwlxtV9WQIREWySvnOSBsA4Q"
                   alt="Claim your Newcollab bio link"
                   style={{ 
                     width: '100%', 
                     maxWidth: '300px',
                     height: 'auto'
                   }}
                 />
               </div>

               {/* Step 2 */}
               <div style={{ textAlign: 'center' }}>
                 <div style={{ 
                   width: '60px',
                   height: '60px',
                   borderRadius: '50%',
                   background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   color: 'white',
                   fontSize: '1.8rem',
                   fontWeight: '700',
                   margin: '0 auto 1.5rem auto'
                 }}>
                   2
                 </div>
                 <h3 style={{ 
                   fontSize: '1.5rem',
                   fontWeight: '700',
                   color: '#1a1a1a',
                   marginBottom: '1rem'
                 }}>
                   List your ad slots
                 </h3>
                 <p style={{ 
                   color: '#666',
                   fontSize: '1.1rem',
                   lineHeight: '1.6',
                   marginBottom: '1.5rem'
                 }}>
                   Announce your next sponsorship opportunity and set your starting price. Make it easy for brands to see what's available.
                 </p>
                 <div style={{ 
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '0.5rem',
                   color: '#FF6B6B',
                   fontSize: '0.9rem',
                   fontWeight: '600',
                   marginBottom: '1.5rem'
                 }}>
                   <FaTag />
                   <span>Set your minimum bid</span>
                 </div>
                 <img 
                   src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/newcollab_bid_creators1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvbmV3Y29sbGFiX2JpZF9jcmVhdG9yczEucG5nIiwiaWF0IjoxNzU0MTQ4ODc2LCJleHAiOjE3ODU2ODQ4NzZ9.PSqc3jPJAFaMOy-q738EoPYCE6Svnn3tgnBCFgBUtnc"
                   alt="Creator listing ad slots"
                   style={{ 
                     width: '100%', 
                     maxWidth: '300px',
                     height: 'auto'
                   }}
                 />
               </div>

               {/* Step 3 */}
               <div style={{ textAlign: 'center' }}>
                 <div style={{ 
                   width: '60px',
                   height: '60px',
                   borderRadius: '50%',
                   background: 'linear-gradient(135deg, #667eea, #764ba2)',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   color: 'white',
                   fontSize: '1.8rem',
                   fontWeight: '700',
                   margin: '0 auto 1.5rem auto'
                 }}>
                   3
                 </div>
                 <h3 style={{ 
                   fontSize: '1.5rem',
                   fontWeight: '700',
                   color: '#1a1a1a',
                   marginBottom: '1rem'
                 }}>
                   Get PR packages & paid offers
                 </h3>
                 <p style={{ 
                   color: '#666',
                   fontSize: '1.1rem',
                   lineHeight: '1.6',
                   marginBottom: '1.5rem'
                 }}>
                   Receive free PR packages and paid brand sponsorships. Brands send real offers with budgets—you just accept or reject.
                 </p>
                 <div style={{ 
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '0.5rem',
                   color: '#667eea',
                   fontSize: '0.9rem',
                   fontWeight: '600',
                   marginBottom: '1.5rem'
                 }}>
                   <FaMoneyBillWave />
                   <span>Real bids only</span>
                 </div>
                 <img 
                   src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/newcollab_get_brand_sponsorships.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvbmV3Y29sbGFiX2dldF9icmFuZF9zcG9uc29yc2hpcHMucG5nIiwiaWF0IjoxNzU0MTQ2OTI4LCJleHAiOjE3ODU2ODI5Mjh9.ERzjFjOVncxclXLg_JoTuNn2W_3hPd0tvqhjXK6Rt2Q"
                   alt="Brand sponsorship offers"
                   style={{ 
                     width: '100%', 
                     maxWidth: '450px',
                     height: 'auto',
                     borderRadius: '12px',
                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                   }}
                 />
               </div>
             </div>
                       </Section>

            {/* CONTENT FORMATS SECTION */}
            <section aria-labelledby="content-formats-heading">
              <ContentFormatsSection>
                <ContentFormatsContainer>
                  {/* Left Section - Content Format Cards */}
                  <ContentFormatsGrid>
                  {/* Short Form Videos */}
                  <ContentFormatCard background="#8B4513" color="white">
                    <ContentFormatContent>
                      <ContentFormatIcon background="#32CD32">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </ContentFormatIcon>
                      <ContentFormatLabel color="#90EE90">
                        Short Form Videos
                      </ContentFormatLabel>
                    </ContentFormatContent>
                  </ContentFormatCard>

                  {/* Live Streams */}
                  <ContentFormatCard background="#E6E6FA" color="#4B0082">
                    <ContentFormatContent>
                      <ContentFormatIcon background="#4B0082" color="white">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                        </svg>
                      </ContentFormatIcon>
                      <ContentFormatLabel color="#4B0082">
                        Live Streams
                      </ContentFormatLabel>
                    </ContentFormatContent>
                  </ContentFormatCard>

                  {/* Podcasts */}
                  <ContentFormatCard background="#FF1493" color="white">
                    <ContentFormatContent>
                      <ContentFormatIcon background="white" color="#FF1493">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                      </ContentFormatIcon>
                      <ContentFormatLabel color="white">
                        Podcasts
                      </ContentFormatLabel>
                    </ContentFormatContent>
                  </ContentFormatCard>

                  {/* Stories */}
                  <ContentFormatCard background="#000080" color="white">
                    <ContentFormatContent>
                      <ContentFormatIcon background="#87CEEB">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </ContentFormatIcon>
                      <ContentFormatLabel color="white">
                        Stories
                      </ContentFormatLabel>
                    </ContentFormatContent>
                  </ContentFormatCard>
                  </ContentFormatsGrid>

                {/* Right Section - Text and CTA */}
                <ContentFormatsText>
                  <h2 id="content-formats-heading" style={{ margin: 0, padding: 0 }}>
                    <ContentFormatsTitle>
                      PR packages & sponsorships for all content types
                    </ContentFormatsTitle>
                  </h2>
                  <ContentFormatsDescription>
                    From stories to live streams, receive free PR packages and paid brand sponsorships across all your content types. Join 10,000+ creators getting offers from 1,000+ brands.
                  </ContentFormatsDescription>
                    
                    {/* Social Platform Icons */}
                    <SocialPlatformsGrid>
                      {/* Instagram */}
                      <SocialPlatformIcon background="linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </SocialPlatformIcon>
                      
                      {/* Facebook */}
                      <SocialPlatformIcon background="#1877F2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </SocialPlatformIcon>
                      
                      {/* TikTok */}
                      <SocialPlatformIcon background="#000000">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                      </SocialPlatformIcon>
                      
                      {/* X (Twitter) */}
                      <SocialPlatformIcon background="#000000">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </SocialPlatformIcon>
                      
                      {/* Pinterest */}
                      <SocialPlatformIcon background="#E60023">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                        </svg>
                      </SocialPlatformIcon>
                      
                      {/* Twitch */}
                      <SocialPlatformIcon background="#9146FF">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                        </svg>
                      </SocialPlatformIcon>
                      
                      {/* LinkedIn */}
                      <SocialPlatformIcon background="#0077B5">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </SocialPlatformIcon>
                      
                      {/* YouTube */}
                      <SocialPlatformIcon background="#FF0000">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </SocialPlatformIcon>
                    </SocialPlatformsGrid>
                    
                    <ContentFormatsButton onClick={() => navigate('/register')}>
                      Get started for free
                    </ContentFormatsButton>
                  </ContentFormatsText>
              </ContentFormatsContainer>
            </ContentFormatsSection>
            </section>

            {/* BENEFITS SECTION */}
            <section aria-labelledby="benefits-heading">
              <BenefitsSection>
                <BenefitsContainer>
                  {/* Left Section - Creator Benefits */}
                  <BenefitsColumn>
                    <BenefitsSectionHeader gradient="linear-gradient(135deg, #667eea, #764ba2)">
                      For Creators
                    </BenefitsSectionHeader>
                    
                    <h2 id="benefits-heading" style={{ margin: 0, padding: 0 }}>
                      <BenefitsTitle>
                        Get PR packages & paid partnerships from brands
                      </BenefitsTitle>
                    </h2>
                    
                    <BenefitsDescription>
                      Join thousands of creators receiving free PR packages and paid brand sponsorships. Skip the spam DMs—brands send real offers with budgets directly to you.
                    </BenefitsDescription>

                  <BenefitsGrid>
                    <BenefitItem
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3 }}
                    >
                      <BenefitIcon gradient="linear-gradient(135deg, #667eea, #764ba2)">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </BenefitIcon>
                      <BenefitContent>
                        <BenefitTitle>
                          No More Spam DMs
                        </BenefitTitle>
                        <BenefitText>
                          Skip lowball or 'free visibility' offers.
                        </BenefitText>
                      </BenefitContent>
                    </BenefitItem>

                    <BenefitItem
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3 }}
                    >
                      <BenefitIcon gradient="linear-gradient(135deg, #FF6B6B, #FF8E53)">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                        </svg>
                      </BenefitIcon>
                      <BenefitContent>
                        <BenefitTitle>Free PR Packages</BenefitTitle>
                        <BenefitText>Receive free PR packages from 1,000+ brands. No pitching required—brands send offers directly.</BenefitText>
                      </BenefitContent>
                    </BenefitItem>

                    {[
                      { icon: 'linear-gradient(135deg, #f093fb, #f5576c)', title: 'Set Your Rates', text: 'List ad slots for Reels, Stories, posts with starting bids.', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
                      { icon: 'linear-gradient(135deg, #4facfe, #00f2fe)', title: 'Fast Cash', text: 'Monetize quickly, from $10–$50 per 1K followers.', svg: 'M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z' },
                      { icon: 'linear-gradient(135deg, #43e97b, #38f9d7)', title: 'One-Click Bids', text: 'Accept or reject brand offers instantly.', svg: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' },
                      { icon: 'linear-gradient(135deg, #fa709a, #fee140)', title: 'All-in-One Dashboard', text: 'Manage collabs, messages, and contracts.', svg: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z' },
                      { icon: 'linear-gradient(135deg, #a8edea, #fed6e3)', title: 'Secure Payments', text: 'Get paid fast with Stripe Connect.', svg: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z' },
                      { icon: 'linear-gradient(135deg, #ffecd2, #fcb69f)', title: 'Easy Setup', text: 'Add to your bio or Linktree in minutes.', svg: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z' }
                    ].map((benefit, idx) => (
                      <BenefitItem
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <BenefitIcon gradient={benefit.icon}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d={benefit.svg}/>
                          </svg>
                        </BenefitIcon>
                        <BenefitContent>
                          <BenefitTitle>{benefit.title}</BenefitTitle>
                          <BenefitText>{benefit.text}</BenefitText>
                        </BenefitContent>
                      </BenefitItem>
                    ))}
                  </BenefitsGrid>
                </BenefitsColumn>

                {/* Right Section - Brand Benefits */}
                <BenefitsColumn>
                  <BenefitsSectionHeader gradient="linear-gradient(135deg, #ff9a9e, #fecfef)">
                    For Brands
                  </BenefitsSectionHeader>
                  
                  <BenefitsTitle>
                    Scale your campaigns
                  </BenefitsTitle>
                  
                  <BenefitsDescription>
                    Stop renting your audience—own it. Build direct relationships with creators who deliver results.
                  </BenefitsDescription>

                  <BenefitsGrid>
                    {[
                      { icon: 'linear-gradient(135deg, #667eea, #764ba2)', title: 'No DM Chasing', text: 'Skip ignored messages and endless follow-ups.', svg: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' },
                      { icon: 'linear-gradient(135deg, #f093fb, #f5576c)', title: 'Budget-Friendly', text: 'Bid on ad slots starting at $50.', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
                      { icon: 'linear-gradient(135deg, #4facfe, #00f2fe)', title: 'Fast Campaigns', text: 'Launch deals in hours, not weeks.', svg: 'M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z' },
                      { icon: 'linear-gradient(135deg, #43e97b, #38f9d7)', title: 'Scale Outreach', text: 'Invite creators directly, no cold DMs.', svg: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z' },
                      { icon: 'linear-gradient(135deg, #fa709a, #fee140)', title: 'Track Everything', text: 'Monitor campaigns in one dashboard.', svg: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z' }
                    ].map((benefit, idx) => (
                      <BenefitItem
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <BenefitIcon gradient={benefit.icon}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d={benefit.svg}/>
                          </svg>
                        </BenefitIcon>
                        <BenefitContent>
                          <BenefitTitle>{benefit.title}</BenefitTitle>
                          <BenefitText>{benefit.text}</BenefitText>
                        </BenefitContent>
                      </BenefitItem>
                    ))}
                  </BenefitsGrid>
                </BenefitsColumn>
              </BenefitsContainer>
            </BenefitsSection>
            </section>

            {/* BLOG SECTION */}
            <BlogSection>
              <BlogContainer>
                <SectionHeadline style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  Latest Creator Resources & Guides
                </SectionHeadline>
                <BodyCopy style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Discover proven strategies, brand lists, and step-by-step guides to grow your creator business and land your dream collaborations.
                </BodyCopy>
                
                {!postsLoading && featuredPosts.length > 0 && (
                  <BlogGrid>
                    {featuredPosts.map((post, index) => (
                      <BlogCard
                        key={post.slug}
                        to={`/blog/${post.slug}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <BlogImageWrapper>
                          <BlogImage
                            className="blog-image"
                            src={post.image}
                            alt={post.title}
                            loading="lazy"
                            decoding="async"
                          />
                        </BlogImageWrapper>
                        <BlogCardContent>
                          {post.category && (
                            <BlogCategory>{post.category}</BlogCategory>
                          )}
                          <BlogTitle>{post.title}</BlogTitle>
                          {post.excerpt && (
                            <BlogExcerpt>{post.excerpt}</BlogExcerpt>
                          )}
                          <BlogMeta>
                            {post.readTime && (
                              <BlogReadTime>
                                <ClockCircleOutlined style={{ fontSize: '12px' }} />
                                {post.readTime}
                              </BlogReadTime>
                            )}
                            {post.date && (
                              <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            )}
                          </BlogMeta>
                        </BlogCardContent>
                      </BlogCard>
                    ))}
                  </BlogGrid>
                )}

                {postsLoading && (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: midGray }}>
                    Loading resources...
                  </div>
                )}

                {!postsLoading && featuredPosts.length > 0 && (
                  <ViewAllButton to="/blog">
                    View All Articles
                  </ViewAllButton>
                )}
              </BlogContainer>
            </BlogSection>

            {/* DATA & STATISTICS SECTION */}
            <Section>
              <SectionHeadline>Platform Performance Metrics</SectionHeadline>
              <BodyCopy style={{ textAlign: 'center', marginBottom: '3rem' }}>
                Real results from creators using Newcollab
              </BodyCopy>
              
              <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
                border: '1px solid #e5e7eb'
              }}>
                {/* Desktop Table */}
                <div className="metrics-desktop">
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    margin: '0',
                    fontSize: '1rem'
                  }}>
                    <thead>
                      <tr style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white'
                      }}>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'left',
                          borderBottom: '2px solid #e5e7eb',
                          fontWeight: '600'
                        }}>
                          Creator Tier
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'left',
                          borderBottom: '2px solid #e5e7eb',
                          fontWeight: '600'
                        }}>
                          Response Rate
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'left',
                          borderBottom: '2px solid #e5e7eb',
                          fontWeight: '600'
                        }}>
                          Time to First Deal
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'left',
                          borderBottom: '2px solid #e5e7eb',
                          fontWeight: '600'
                        }}>
                          Success Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '1rem', fontWeight: '500' }}>Micro (1K–5K followers)</td>
                        <td style={{ padding: '1rem' }}>85%</td>
                        <td style={{ padding: '1rem' }}>2-5 days</td>
                        <td style={{ padding: '1rem', fontWeight: '600', color: '#26A69A' }}>92%</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '1rem', fontWeight: '500' }}>Small (5K–15K followers)</td>
                        <td style={{ padding: '1rem' }}>78%</td>
                        <td style={{ padding: '1rem' }}>3-7 days</td>
                        <td style={{ padding: '1rem', fontWeight: '600', color: '#26A69A' }}>89%</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '1rem', fontWeight: '500' }}>Medium (15K–50K followers)</td>
                        <td style={{ padding: '1rem' }}>72%</td>
                        <td style={{ padding: '1rem' }}>5-10 days</td>
                        <td style={{ padding: '1rem', fontWeight: '600', color: '#26A69A' }}>87%</td>
                      </tr>
                      <tr style={{ background: '#f8f9fa' }}>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>Large (50K+ followers)</td>
                        <td style={{ padding: '1rem' }}>68%</td>
                        <td style={{ padding: '1rem' }}>7-14 days</td>
                        <td style={{ padding: '1rem', fontWeight: '700', color: '#26A69A' }}>85%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="metrics-mobile">
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '1rem'
                  }}>
                    {/* Micro Creators */}
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: '2px solid #e5e7eb',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                    }}>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#374151' }}>Micro (1K–5K followers)</h4>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        fontSize: '0.9rem'
                      }}>
                        <div style={{ color: '#6b7280' }}>
                          <strong style={{ color: '#374151' }}>Response Rate:</strong> 85%
                        </div>
                        <div style={{ color: '#6b7280' }}>
                          <strong style={{ color: '#374151' }}>Success Rate:</strong> 92%
                        </div>
                        <div style={{ gridColumn: '1 / -1', color: '#6b7280' }}>
                          <strong style={{ color: '#374151' }}>Time to First Deal:</strong> 2-5 days
                        </div>
                      </div>
                    </div>

                    {/* Small Creators */}
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: '2px solid #e5e7eb',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                    }}>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#374151' }}>Small (5K–15K followers)</h4>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        fontSize: '0.9rem'
                      }}>
                        <div style={{ color: '#6b7280' }}>
                          <strong style={{ color: '#374151' }}>Response Rate:</strong> 78%
                        </div>
                        <div style={{ color: '#6b7280' }}>
                          <strong style={{ color: '#374151' }}>Success Rate:</strong> 89%
                        </div>
                        <div style={{ gridColumn: '1 / -1', color: '#6b7280' }}>
                          <strong style={{ color: '#374151' }}>Time to First Deal:</strong> 3-7 days
                        </div>
                      </div>
                    </div>

                    {/* Medium Creators */}
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: '2px solid #e5e7eb',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                    }}>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#374151' }}>Medium (15K–50K followers)</h4>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        fontSize: '0.9rem'
                      }}>
                        <div style={{ color: '#6b7280' }}>
                          <strong style={{ color: '#374151' }}>Response Rate:</strong> 72%
                        </div>
                        <div style={{ color: '#6b7280' }}>
                          <strong style={{ color: '#374151' }}>Success Rate:</strong> 87%
                        </div>
                        <div style={{ gridColumn: '1 / -1', color: '#6b7280' }}>
                          <strong style={{ color: '#374151' }}>Time to First Deal:</strong> 5-10 days
                        </div>
                      </div>
                    </div>

                    {/* Large Creators */}
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: '2px solid #e5e7eb',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                    }}>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#374151' }}>Large (50K+ followers)</h4>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        fontSize: '0.9rem'
                      }}>
                        <div style={{ color: '#6b7280' }}>
                          <strong style={{ color: '#374151' }}>Response Rate:</strong> 68%
                        </div>
                        <div style={{ color: '#6b7280' }}>
                          <strong style={{ color: '#374151' }}>Success Rate:</strong> 85%
                        </div>
                        <div style={{ gridColumn: '1 / -1', color: '#6b7280' }}>
                          <strong style={{ color: '#374151' }}>Time to First Deal:</strong> 7-14 days
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{
                  marginTop: '2rem',
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #f0f9f7, #e6f3f0)',
                  borderRadius: '12px',
                  borderLeft: '4px solid #26A69A'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#26A69A' }}>
                    🚀 Platform Advantages
                  </h4>
                  <ul style={{
                    margin: '0',
                    paddingLeft: '1.5rem',
                    color: '#374151'
                  }}>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <strong>3x Faster:</strong> Get brand responses in days, not weeks
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <strong>2x Higher Success:</strong> 89% success rate vs. 45% with cold outreach
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <strong>5x More Efficient:</strong> No more spam DMs or ignored emails
                    </li>
                    <li style={{ marginBottom: '0' }}>
                      <strong>Global Ready:</strong> Support for multiple currencies and regions
                    </li>
                  </ul>
                </div>
              </div>
            </Section>

          {/* CREATOR SHOWCASE SECTION */}
          <Section>
            <SectionHeadline>See how creators use their free page</SectionHeadline>
            <Swiper
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={1.05}
              breakpoints={{
                600: { slidesPerView: 1.15 }
              }}
              loop={true}
              coverflowEffect={{ rotate: 0, stretch: 0, depth: 100, modifier: 2.5, slideShadows: false }}
              pagination={{ clickable: true }}
              navigation={true}
              modules={[EffectCoverflow, Pagination, Navigation]}
              style={{ padding: '2rem 0', maxWidth: '100%' }}
              spaceBetween={12}
            >
              {[
                "https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators//newcolla-biolink-sponsoring-tool%20(5).png",
                "https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators//newcolla-biolink-sponsoring-tool%20(2).png",
                "https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators//newcolla-biolink-sponsoring-tool%20(1).png",
                "https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators//newcolla-biolink-sponsoring-tool%20(3).png",
                "https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators//newcolla-biolink-sponsoring-tool%20(4).png"
              ].map((img, idx) => (
                <StyledSwiperSlide key={idx}>
                  <ModernPhoneMockup>
                    <ModernPhoneScreen>
                      <img
                        src={img}
                        alt={`Creator showcase ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '38px' }}
                        loading="lazy"
                      />
                    </ModernPhoneScreen>
                  </ModernPhoneMockup>
                </StyledSwiperSlide>
              ))}
            </Swiper>
          </Section>

          {/* TESTIMONIALS SECTION */}
          <Section>
            <SectionHeadline>Creator Success Stories</SectionHeadline>
            <BodyCopy style={{ textAlign: 'center', marginBottom: '3rem' }}>
              Real creators sharing their Newcollab success
            </BodyCopy>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {/* Testimonial 1 */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '16px',
                padding: '2rem',
                color: 'white',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
                border: 'none'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    👩‍🎨
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'white' }}>Mia R.</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Beauty Creator • 8K followers</p>
                  </div>
                </div>
                <p style={{ margin: 0, lineHeight: '1.6' }}>
                  "Newcollab landed me a major beauty brand deal in just 3 days! No more cold emails or spam DMs. Brands actually bid on my content now."
                </p>
              </div>

              {/* Testimonial 2 */}
              <div style={{
                background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                borderRadius: '16px',
                padding: '2rem',
                color: 'white',
                boxShadow: '0 8px 32px rgba(240, 147, 251, 0.2)',
                border: 'none'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    💪
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'white' }}>Alex T.</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Fitness Influencer • 12K followers</p>
                  </div>
                </div>
                <p style={{ margin: 0, lineHeight: '1.6' }}>
                  "I got 3 PR packages last month through Newcollab. The bidding system is genius - brands compete for my content and I choose the best offers!"
                </p>
              </div>

              {/* Testimonial 3 */}
              <div style={{
                background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                borderRadius: '16px',
                padding: '2rem',
                color: 'white',
                boxShadow: '0 8px 32px rgba(79, 172, 254, 0.2)',
                border: 'none'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    🌟
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'white' }}>Sarah K.</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Lifestyle Creator • 6K followers</p>
                  </div>
                </div>
                <p style={{ margin: 0, lineHeight: '1.6' }}>
                  "No more cold emails! Brands reach out to me directly now. I've earned more in the last 2 months than I did all last year with traditional outreach."
                </p>
              </div>
            </div>
          </Section>

          {/* FAQ SECTION */}
          <Section>
            <SectionHeadline>Got questions?</SectionHeadline>
            <BodyCopy style={{ textAlign: 'center', marginBottom: '3rem' }}>
              Everything you need to know about Newcollab
            </BodyCopy>
            
            <FaqContainer>
              {/* FAQ Item 1 */}
              <FaqItem 
                gradient="linear-gradient(135deg, #667eea, #764ba2)"
                shadow="0 8px 32px rgba(102, 126, 234, 0.2)"
              >
                <FaqQuestion>Why use Newcollab?</FaqQuestion>
                <FaqAnswer>
                  Skip spam DMs. List ad slots, get real bids, and monetize fast with Stripe Connect.
                </FaqAnswer>
              </FaqItem>

              {/* FAQ Item 2 */}
              <div style={{
                background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                borderRadius: '16px',
                padding: '2rem',
                color: 'white',
                boxShadow: '0 8px 32px rgba(240, 147, 251, 0.2)',
                border: 'none'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '700', 
                  marginBottom: '1rem',
                  color: 'white'
                }}>
                  How do ad slots work?
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: 0
                }}>
                  Creators set prices for Reels or posts. Brands bid directly. Accept/reject instantly.
                </p>
              </div>

              {/* FAQ Item 3 */}
              <div style={{
                background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                borderRadius: '16px',
                padding: '2rem',
                color: 'white',
                boxShadow: '0 8px 32px rgba(79, 172, 254, 0.2)',
                border: 'none'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '700', 
                  marginBottom: '1rem',
                  color: 'white'
                }}>
                  No more spam DMs?
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: 0
                }}>
                  Yes! No lowball or 'free' offers. List ad slots for real bids.
                </p>
              </div>

              {/* FAQ Item 4 */}
              <div style={{
                background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                borderRadius: '16px',
                padding: '2rem',
                color: 'white',
                boxShadow: '0 8px 32px rgba(67, 233, 123, 0.2)',
                border: 'none'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '700', 
                  marginBottom: '1rem',
                  color: 'white'
                }}>
                  How do brands launch faster?
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: 0
                }}>
                  Browse ad slots, bid within budget, launch in hours—no DMs.
                </p>
              </div>

              {/* FAQ Item 5 */}
              <div style={{
                background: 'linear-gradient(135deg, #fa709a, #fee140)',
                borderRadius: '16px',
                padding: '2rem',
                color: 'white',
                boxShadow: '0 8px 32px rgba(250, 112, 154, 0.2)',
                border: 'none'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '700', 
                  marginBottom: '1rem',
                  color: 'white'
                }}>
                  Are payments secure?
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: 0
                }}>
                  Stripe Connect ensures fast, secure payouts. No negotiations needed.
                </p>
              </div>

              {/* FAQ Item 6 */}
              <div style={{
                background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
                borderRadius: '16px',
                padding: '2rem',
                color: 'white',
                boxShadow: '0 8px 32px rgba(168, 237, 234, 0.2)',
                border: 'none'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '700', 
                  marginBottom: '1rem',
                  color: 'white'
                }}>
                  What brands work with micro-influencers?
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: 0
                }}>
                  Glossier, Fabletics, and more bid on your ad slots. <Link to="/brands/pr-packages" style={{ color: 'white', textDecoration: 'underline', fontWeight: '600' }}>Brands can send PR packages here</Link>.
                </p>
              </div>

              {/* FAQ Item 7 */}
              <div style={{
                background: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
                borderRadius: '16px',
                padding: '2rem',
                color: 'white',
                boxShadow: '0 8px 32px rgba(255, 236, 210, 0.2)',
                border: 'none'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '700', 
                  marginBottom: '1rem',
                  color: 'white'
                }}>
                  Can I monetize all content?
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: 0
                }}>
                  Yes, Reels, Stories, posts—set prices and earn fast.
                </p>
              </div>

              {/* FAQ Item 8 */}
              <div style={{
                background: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
                borderRadius: '16px',
                padding: '2rem',
                color: 'white',
                boxShadow: '0 8px 32px rgba(255, 154, 158, 0.2)',
                border: 'none'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '700', 
                  marginBottom: '1rem',
                  color: 'white'
                }}>
                  Easy to set up?
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: 0
                }}>
                  Add Newcollab to Linktree in minutes. Start bidding now.
                </p>
              </div>

              {/* FAQ Item 9 */}
              <div style={{
                background: 'linear-gradient(135deg, #d299c2, #fef9d7)',
                borderRadius: '16px',
                padding: '2rem',
                color: 'white',
                boxShadow: '0 8px 32px rgba(210, 153, 194, 0.2)',
                border: 'none'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '700', 
                  marginBottom: '1rem',
                  color: 'white'
                }}>
                  How do I manage collabs?
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: 0
                }}>
                  One dashboard for messages, contracts, and tracking.
                </p>
              </div>

              {/* FAQ Item 10 */}
              <div style={{
                background: 'linear-gradient(135deg, #89f7fe, #66a6ff)',
                borderRadius: '16px',
                padding: '2rem',
                color: 'white',
                boxShadow: '0 8px 32px rgba(137, 247, 254, 0.2)',
                border: 'none'
              }}>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '700', 
                  marginBottom: '1rem',
                  color: 'white'
                }}>
                  How do brands scale outreach?
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: 0
                }}>
                  Invite creators directly via ad slots. No cold DMs.
                </p>
              </div>
            </FaqContainer>
          </Section>

          {/* SOURCES & CITATIONS SECTION */}
          <Section>
            <SectionHeadline>Why Creators Choose Newcollab</SectionHeadline>
            <BodyCopy style={{ textAlign: 'center', marginBottom: '3rem' }}>
              The platform advantages that set us apart
            </BodyCopy>
            
            {/* Platform Advantages - Responsive Grid */}
            <div className="platform-advantages-grid">
              {/* Platform Advantage 1 */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  ⚡
                </div>
                <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>
                  Lightning Fast Setup
                </h4>
                <p style={{ margin: 0, color: '#6b7280', lineHeight: '1.6' }}>
                  Get your professional bidding page in under 2 minutes. No technical skills required.
                </p>
              </div>

              {/* Platform Advantage 2 - Updated */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  🔍
                </div>
                <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>
                  Transparent Promotion
                </h4>
                <p style={{ margin: 0, color: '#6b7280', lineHeight: '1.6' }}>
                  Showcase your ad opportunities clearly. Brands see exactly what they're bidding on.
                </p>
              </div>

              {/* Platform Advantage 3 */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  🛡️
                </div>
                <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>
                  Secure Payments
                </h4>
                <p style={{ margin: 0, color: '#6b7280', lineHeight: '1.6' }}>
                  Enterprise-grade security with automatic payouts. No more payment delays.
                </p>
              </div>

              {/* Platform Advantage 4 - Updated */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  🚀
                </div>
                <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>
                  One-Click Bidding
                </h4>
                <p style={{ margin: 0, color: '#6b7280', lineHeight: '1.6' }}>
                  Accept or reject brand deals instantly. Secure collaborations with a single click.
                </p>
              </div>
            </div>

            {/* Mobile Responsive Override */}
            <style jsx>{`
              @media (max-width: 768px) {
                .platform-advantages-grid {
                  grid-template-columns: 1fr !important;
                }
              }
            `}</style>
          </Section>

          {/* FOR BRANDS SECTION */}
          <Section>
            <div style={{
              background: 'linear-gradient(135deg, #f0f9f7 0%, #ffffff 100%)',
              borderRadius: '24px',
              padding: '4rem 2rem',
              textAlign: 'center',
              border: `2px solid ${primaryBlue}`,
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
            }}>
              <SectionHeadline style={{ 
                marginBottom: '1rem',
                background: `linear-gradient(90deg, ${primaryBlue}, ${brightMagenta})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Are you a brand looking to send PR packages?
              </SectionHeadline>
              <BodyCopy style={{ 
                fontSize: '1.2rem',
                maxWidth: '700px',
                margin: '0 auto 2rem auto',
                color: darkCharcoal
              }}>
                Connect with 10,000+ small influencers ready for PR packages. Get 3-6x higher engagement at 10x lower cost than macro-influencer campaigns.
              </BodyCopy>
              <div style={{
                display: 'flex',
                gap: '1.5rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginTop: '2rem'
              }}>
                <Link 
                  to="/brands/pr-packages"
                  style={{
                    background: `linear-gradient(45deg, ${brightMagenta}, ${warmOrange})`,
                    color: 'white',
                    padding: '1rem 2.5rem',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    textDecoration: 'none',
                    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                    e.target.style.boxShadow = '0 10px 20px rgba(236, 72, 153, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 4px 15px rgba(236, 72, 153, 0.3)';
                  }}
                >
                  Send PR Packages to Influencers
                </Link>
                <Link 
                  to="/register/brand"
                  style={{
                    background: 'white',
                    color: primaryBlue,
                    padding: '1rem 2.5rem',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    textDecoration: 'none',
                    border: `2px solid ${primaryBlue}`,
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.1)',
                    transition: 'all 0.3s ease',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.2)';
                    e.target.style.background = primaryBlue;
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.1)';
                    e.target.style.background = 'white';
                    e.target.style.color = primaryBlue;
                  }}
                >
                  Sign Up as Brand
                </Link>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                maxWidth: '800px',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: '3rem'
              }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: primaryBlue, marginBottom: '0.5rem' }}>
                    3-6%
                  </div>
                  <div style={{ color: midGray }}>Engagement Rate</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: warmOrange, marginBottom: '0.5rem' }}>
                    10,000+
                  </div>
                  <div style={{ color: midGray }}>Active Creators</div>
                </div>
              </div>
            </div>
          </Section>

          {/* FINAL CTA SECTION */}
          <Section>
            <SectionHeadline>Upgrade your bio link today.</SectionHeadline>
            <form onSubmit={handleClaim} style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
              <ClaimInputContainer style={{ margin: 0, maxWidth: '500px' }}>
                <div style={{ 
                  display: 'flex', 
                  flex: 1, 
                  alignItems: 'center', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '12px', 
                  background: 'white', 
                  padding: '0 1.25rem',
                  minWidth: '0'
                }}>
                  <InputPrefix>newcollab.co/</InputPrefix>
                  <ClaimInput
                    type="text"
                    placeholder="yourname"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ 
                      border: 'none', 
                      padding: '1rem 0', 
                      boxShadow: 'none',
                      minWidth: '0',
                      flex: '1'
                    }}
                  />
                </div>
                <ClaimButton type="submit" disabled={!username.trim() || isClaiming}>
                  {isClaiming ? 'Claiming...' : 'Claim your link'}
                </ClaimButton>
              </ClaimInputContainer>
            </form>
          </Section>

        </ContentContainer>
      </PageWrapper>
      {/* Modal logic can be kept or simplified as needed */}
    </LandingPageLayout>
  );
};

export default Founding50; 