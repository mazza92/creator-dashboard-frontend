import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Button, Row, Col, Typography, Card, Avatar, Tag, Carousel } from 'antd';
import { DollarCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { MdOutlineLiveTv, MdOutlineAudiotrack } from 'react-icons/md';
import { FiImage, FiVideo, FiFilm } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { useScroll } from 'framer-motion';
import moment from 'moment';
import {
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaFacebook,
  FaTiktok,
  FaSnapchat,
  FaLinkedin,
  FaPinterest,
  FaTwitch,
  FaCamera,
  FaVideo,
  FaNewspaper
} from 'react-icons/fa';

const { Title, Paragraph } = Typography;

// Palette from Founding50.js
const primaryBlue = '#3B82F6';
const brightMagenta = '#EC4899';
const warmOrange = '#F59E0B';
const offWhite = '#F9FAFB';
const darkCharcoal = '#1F2937';
const white = '#FFFFFF';
const lightGray = '#E5E7EB';
const midGray = '#6B7280';

const Container = styled.div`
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  background-color: ${offWhite};
  width: 100%;
  margin: 0;
  padding: 0;
  scroll-behavior: smooth;
  position: relative;
  &::before, &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    z-index: -1;
    opacity: 0.2;
  }
  &::before {
    width: 600px;
    height: 600px;
    background: ${primaryBlue};
    top: 5%;
    left: -300px;
  }
  &::after {
    width: 500px;
    height: 500px;
    background: ${brightMagenta};
    bottom: 15%;
    right: -250px;
  }
`;

const HeroSection = styled.section`
  background: transparent;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: ${darkCharcoal};
  position: relative;
  overflow: hidden;
  padding: 180px 0 120px;
  width: 100%;
  margin: 0;
  font-family: 'Inter', Arial, sans-serif;
  contain: layout style paint;
  content-visibility: auto;
  contain-intrinsic-size: 0 800px;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  transform-style: preserve-3d;

  @media (max-width: 768px) {
    padding: 140px 0 100px;
    min-height: calc(100vh - 80px);
    contain-intrinsic-size: 0 600px;
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  padding: 0 24px;
  width: 100%;
  contain: layout style paint;
  content-visibility: auto;
  contain-intrinsic-size: 0 400px;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  transform-style: preserve-3d;

  @media (max-width: 768px) {
    padding: 0 16px;
    contain-intrinsic-size: 0 300px;
  }
`;

const HeroTitle = styled(Title)`
  font-size: 64px;
  font-weight: 800;
  margin-bottom: 24px;
  color: ${darkCharcoal};
  line-height: 1.2;
  font-display: swap;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  contain: content;
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  transform-style: preserve-3d;

  @media (max-width: 768px) {
    font-size: 36px;
    margin-bottom: 16px;
    contain-intrinsic-size: 0 50px;
  }
`;

const HeroSubtitle = styled(Paragraph)`
  font-size: 24px;
  opacity: 0.95;
  margin-bottom: 40px;
  color: ${darkCharcoal};
  line-height: 1.6;
  font-display: swap;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  contain: content;
  content-visibility: auto;
  contain-intrinsic-size: 0 60px;

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 32px;
    contain-intrinsic-size: 0 40px;
  }
`;

const StyledButton = styled(Button)`
  height: 56px;
  padding: 0 40px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 28px;
  margin: 0 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    height: 48px;
    padding: 0 24px;
    font-size: 16px;
    margin: 8px;
    width: calc(100% - 16px);
    max-width: 280px;
  }

  &.primary {
    background: linear-gradient(135deg, ${primaryBlue}, ${brightMagenta});
    color: ${white};
    border: none;
    box-shadow: 0 4px 15px rgba(38, 166, 154, 0.3);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, ${brightMagenta}, ${primaryBlue});
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      background: linear-gradient(135deg, ${primaryBlue}, ${brightMagenta});
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(38, 166, 154, 0.4);

      &::before {
        opacity: 1;
      }
    }

    &:active {
      transform: translateY(1px);
      box-shadow: 0 2px 10px rgba(38, 166, 154, 0.3);
    }
  }

  &.secondary {
    background: transparent;
    color: ${darkCharcoal};
    border: 2px solid ${darkCharcoal};
    box-shadow: 0 4px 15px rgba(30, 41, 59, 0.1);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(30, 41, 59, 0.05);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      background: transparent;
      transform: translateY(-2px);
      border-color: ${primaryBlue};
      color: ${primaryBlue};
      box-shadow: 0 8px 25px rgba(38, 166, 154, 0.15);

      &::before {
        opacity: 1;
      }
    }

    &:active {
      transform: translateY(1px);
      box-shadow: 0 2px 10px rgba(38, 166, 154, 0.1);
    }
  }

  span {
    position: relative;
    z-index: 1;
  }
`;

const PlatformSection = styled.section`
  padding: 80px 0;
  background: transparent;
  text-align: center;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    padding: 60px 0;
  }
`;

const PlatformTitle = styled(Title)`
  font-size: 36px;
  font-weight: 700;
  color: ${darkCharcoal};
  margin-bottom: 48px;
  text-align: center;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 32px;
  }
`;

const PlatformGrid = styled(Row)`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 0 16px;
    gap: 16px;
  }
`;

const PlatformCard = styled(Col)`
  padding: 0;
  text-align: center;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: auto !important;
  flex: 0 0 auto;
  margin: 0;

  @media (max-width: 768px) {
    padding: 0;
  }

  &:hover {
    transform: translateY(-8px);
  }
`;

const PlatformIcon = styled.div`
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${props => props.$bgColor};
  color: ${props => props.$color};
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 0;

  @media (max-width: 768px) {
    font-size: 24px;
    width: 48px;
    height: 48px;
  }

  svg {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
`;

const TestimonialSection = styled.section`
  padding: 120px 0;
  background: transparent;
  text-align: center;
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

const TestimonialGrid = styled(Row)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
`;

const TestimonialText = styled(Paragraph)`
  font-size: 24px;
  color: ${midGray};
  font-style: italic;
  margin-bottom: 24px;
  line-height: 1.5;
  position: relative;
  padding: 0;
  transition: all 0.3s ease;
  font-weight: 400;

  &::before {
    content: '"';
    position: absolute;
    top: -20px;
    left: -8px;
    font-size: 60px;
    color: ${primaryBlue};
    opacity: 0.1;
    font-family: serif;
  }

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const TestimonialAuthor = styled.div`
  font-weight: 600;
  color: ${midGray};
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: color 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    background: ${primaryBlue};
    border-radius: 50%;
  }

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const TestimonialAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
    margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(38, 166, 154, 0.15);
  transition: all 0.3s ease;
  background: white;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const TestimonialCard = styled(Col)`
  padding: 0;
  margin-bottom: 40px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(38, 166, 154, 0.03) 0%, transparent 100%);
    border-radius: 16px;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    transform: translateY(-4px);

    &::before {
      opacity: 1;
    }

    ${TestimonialText} {
      color: ${darkCharcoal};
    }

    ${TestimonialAuthor} {
  color: ${primaryBlue};
    }

    ${TestimonialAvatar} {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(38, 166, 154, 0.2);
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
`;

const CTASection = styled.section`
  padding: 80px 24px;
  background: transparent;
  text-align: center;
  color: ${darkCharcoal};

  @media (max-width: 768px) {
    padding: 60px 16px;
  }
`;

const CTATitle = styled(Title)`
  font-size: 48px;
  font-weight: 700;
  color: ${darkCharcoal};
  margin-bottom: 32px;

  @media (max-width: 768px) {
    font-size: 32px;
    margin-bottom: 24px;
  }
`;

// eslint-disable-next-line no-unused-vars
const _Footer = styled.footer`
  padding: 60px 24px;
  background: ${darkCharcoal};
  color: ${white};
  text-align: center;

  @media (max-width: 768px) {
    padding: 40px 16px;
  }
`;

// eslint-disable-next-line no-unused-vars
const _FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 32px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 24px;
  }
`;

// eslint-disable-next-line no-unused-vars
const _FooterLink = styled.a`
  color: ${white};
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  opacity: 0.8;
  cursor: pointer;

  &:hover {
    color: ${primaryBlue};
    opacity: 1;
  }

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

// eslint-disable-next-line no-unused-vars
const _SocialIcon = styled.div`
  font-size: 24px;
  color: ${white};
  margin: 0 12px;
  cursor: pointer;
  transition: color 0.3s ease;
  display: inline-block;

  @media (max-width: 768px) {
    font-size: 20px;
    margin: 0 8px;
  }

  &:hover {
    color: ${primaryBlue};
  }
`;

const HeroImage = styled.div`
  margin-top: 48px;
  width: 100%;
  max-width: 1400px;
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-left: auto;
  margin-right: auto;
  background: ${offWhite};
  aspect-ratio: 1400/800;
  contain: layout size style;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to bottom, transparent, rgba(252, 251, 249, 0.8));
    pointer-events: none;
  }

  img {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 24px;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    margin-top: 32px;
    border-radius: 16px;
    aspect-ratio: 16/9;
    
    &::after {
      height: 60px;
    }
    
    img {
      border-radius: 16px;
    }
  }
`;

const HowItWorksSection = styled.section`
  padding: 100px 0;
  background: transparent;
  width: 100%;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1;
  scroll-behavior: smooth;

  @media (max-width: 768px) {
    padding: 60px 0;
    min-height: auto;
    position: relative;
  }
`;

const SectionHeader = styled.div`
  width: 100%;
  text-align: center;
  margin-bottom: 80px;
  padding: 0 24px;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    margin-bottom: 40px;
    padding: 0 16px;
  }
`;

const HowItWorksContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
  position: relative;
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y proximity;
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  @media (max-width: 768px) {
    height: auto;
    overflow-y: visible;
    padding: 0 16px;
  }
`;

const StepContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 60px;
  margin-bottom: 80px;
  position: relative;
  min-height: 100vh;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  padding: 40px 0;
  opacity: 0.4;
  transition: opacity 0.5s ease;

  &.active {
    opacity: 1;
  }

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 40px;
    margin-bottom: 60px;
    min-height: auto;
    padding: 20px 0;
  }

  @media (max-width: 768px) {
    gap: 32px;
    margin-bottom: 40px;
    padding: 16px 0;
  }
`;

const StepContent = styled(motion.div)`
  flex: 1;
  max-width: 400px;
  position: relative;
  z-index: 2;

  @media (max-width: 1024px) {
    max-width: 100%;
    text-align: center;
    padding: 0 20px;
  }

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const StepNumber = styled.div`
  font-size: 32px;
  font-weight: 900;
  color: ${primaryBlue};
  margin-bottom: 24px;
  text-transform: uppercase;
  letter-spacing: 2px;
  line-height: 1;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${white};
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(38, 166, 154, 0.15);
  border: 2px solid ${primaryBlue};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(38, 166, 154, 0.1), rgba(43, 187, 173, 0.1));
    z-index: -1;
  }

  @media (max-width: 768px) {
    font-size: 28px;
    width: 56px;
    height: 56px;
    margin-bottom: 20px;
  }
`;

const StepTitle = styled(Title)`
  font-size: 36px;
  font-weight: 700;
  color: ${darkCharcoal};
  margin-bottom: 16px;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 12px;
  }
`;

const StepDescription = styled(Paragraph)`
  font-size: 20px;
  color: ${midGray};
  line-height: 1.6;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 16px;
    line-height: 1.5;
  }
`;

const StepVisual = styled(motion.div)`
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 900px;
  padding-right: 200px;
  transform-style: preserve-3d;
  perspective: 1000px;
  will-change: transform;

  img {
    width: 100%;
    max-width: 800px;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
    transform: translateZ(0);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    backface-visibility: hidden;
  }

  &.step-1 img {
    max-width: 400px;
  }

  .notification {
    position: absolute;
    top: 20%;
    right: 0;
    max-width: 500px;
    width: 100%;
    transform-origin: top right;
    animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    opacity: 0;
    transform: translateZ(20px);
    will-change: transform, opacity;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    backface-visibility: hidden;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
    object-fit: contain;
    transform: scale(0.8);
    transform-origin: top right;
  }

  @keyframes slideIn {
    0% {
      transform: translateX(50px) scale(0.7) translateZ(20px);
      opacity: 0;
    }
    100% {
      transform: translateX(0) scale(0.8) translateZ(20px);
      opacity: 1;
    }
  }

  @media (max-width: 1024px) {
    max-width: 100%;
    padding-right: 160px;
    
    img {
      max-width: 700px;
    }

    &.step-1 img {
      max-width: 360px;
    }

    .notification {
      right: 0;
      max-width: 440px;
      transform: scale(0.7);
    }
  }

  @media (max-width: 768px) {
    padding-right: 0;
    width: 100%;
    
    img {
      max-width: 100%;
      border-radius: 12px;
    }

    &.step-1 img {
      max-width: 100%;
    }

    .notification {
      position: absolute;
      top: 40%;
      right: -5%;
      max-width: 95%;
      transform-origin: top right;
      transform: scale(1);
    }
  }

  @media (max-width: 480px) {
    .notification {
      position: absolute;
      top: 45%;
      right: 0;
      max-width: 100%;
      transform: scale(1);
    }
  }
`;

const SectionTitle = styled(Title)`
  font-size: 36px;
  font-weight: 700;
  color: ${darkCharcoal};
  text-align: center;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const SectionSubtitle = styled(Paragraph)`
  font-size: 18px;
  color: ${midGray};
  text-align: center;
  max-width: 600px;
  margin: 0 auto 64px;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 48px;
  }
`;

const FeaturesSection = styled.section`
  padding: 120px 0;
  background: transparent;
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

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  margin-top: 80px;
  position: relative;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(8, 1fr);
    gap: 20px;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-top: 48px;
  }
`;

const BrandsSection = styled.section`
  padding: 120px 0;
  background: transparent;
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

const BrandsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
`;

const BrandsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 24px;
  margin-top: 60px;
  justify-items: center;
  align-items: center;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 1200px) {
    gap: 20px;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-top: 40px;
    padding: 0 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 0 12px;
  }
`;

const BrandLogo = styled(motion.div)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${white};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.06),
    0 2px 6px rgba(38, 166, 154, 0.08);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  perspective: 2000px;
  will-change: transform;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(38, 166, 154, 0.08) 0%, transparent 100%);
    opacity: 0;
    transition: all 0.5s ease;
    transform: translateZ(40px);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%);
    opacity: 0;
    transition: all 0.5s ease;
    transform: translateZ(20px);
    border-radius: 50%;
  }

  img {
    width: 65%;
    height: 65%;
    object-fit: contain;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateZ(50px);
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08));
    opacity: 0.85;
    mix-blend-mode: multiply;
  }

  &:hover {
    transform: 
      translateY(-12px) 
      rotateX(15deg) 
      rotateY(15deg) 
      scale(1.05);
    box-shadow: 
      0 12px 24px rgba(0, 0, 0, 0.08),
      0 6px 12px rgba(38, 166, 154, 0.1),
      0 0 0 1px rgba(38, 166, 154, 0.06);

    &::before {
      opacity: 1;
      transform: translateZ(60px);
      background: linear-gradient(135deg, rgba(38, 166, 154, 0.12) 0%, transparent 100%);
    }

    &::after {
      opacity: 1;
      transform: translateZ(40px);
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
    }

    img {
      transform: translateZ(80px) scale(1.15);
      filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.1));
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    
    &:hover {
      transform: 
        translateY(-8px) 
        rotateX(10deg) 
        rotateY(10deg) 
        scale(1.03);
    }
  }

  @media (max-width: 480px) {
    width: 70px;
    height: 70px;
  }
`;

const FeatureIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: ${props => props.$bgColor || primaryBlue};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  color: ${white};
  font-size: 32px;
  transition: all 0.4s ease;
  box-shadow: 0 8px 24px ${props => `${props.$bgColor || primaryBlue}40`};
`;

const FeatureCard = styled(motion.div)`
  background: ${white};
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(38, 166, 154, 0.1);
  grid-column: ${props => props.span || 'span 4'};
  grid-row: ${props => props.height || 'span 1'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    background: ${props => props.$bgColor || primaryBlue};
    opacity: 0;
    transition: all 0.4s ease;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, ${props => props.bgColor || primaryBlue}10 0%, transparent 100%);
    opacity: 0;
    transition: all 0.4s ease;
  }

  &:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);

    &::before {
      opacity: 1;
    }

    &::after {
      opacity: 1;
    }

    ${FeatureIcon} {
      transform: scale(1.1);
    }
  }

  @media (max-width: 768px) {
    padding: 32px;
    grid-column: span 4;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: ${darkCharcoal};
  margin-bottom: 16px;
  letter-spacing: -0.5px;
`;

const FeatureDescription = styled.p`
  font-size: 16px;
  color: ${midGray};
  line-height: 1.7;
  margin: 0;
  font-weight: 400;
`;

const StepsCTA = styled.div`
  text-align: center;
  margin-top: 60px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    margin-top: 40px;
    margin-bottom: 20px;
  }
`;

const StepsCTAText = styled.p`
  font-style: italic;
  color: ${midGray};
  margin-top: 16px;
  font-size: 18px;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-top: 12px;
  }
`;

const TrustSignalsSection = styled.section`
  padding: 100px 0;
  background: transparent;
  text-align: center;
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

const StatsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 60px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 40px;
  }
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 32px 24px;
  border-radius: 24px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(38, 166, 154, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${primaryBlue}, ${brightMagenta});
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 
      0 12px 30px rgba(38, 166, 154, 0.15),
      0 0 0 1px rgba(38, 166, 154, 0.2);

    &::before {
      opacity: 1;
    }
  }
`;

const StatNumber = styled.div`
  font-size: 42px;
  font-weight: 800;
  background: linear-gradient(135deg, ${primaryBlue}, ${brightMagenta});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
  line-height: 1.2;
  letter-spacing: -1px;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const StatLabel = styled.div`
  font-size: 16px;
  color: ${darkCharcoal};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PaymentBadgesContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  margin-top: 40px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 20px;
  }
`;

const PaymentBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(38, 166, 154, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 
      0 8px 30px rgba(38, 166, 154, 0.15),
      0 0 0 1px rgba(38, 166, 154, 0.2);
  }

  img {
    height: 28px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  span {
    font-size: 15px;
    font-weight: 600;
    color: ${darkCharcoal};
    letter-spacing: 0.3px;
  }
`;

const BlogSection = styled.section`
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

const BlogCard = styled(motion.a)`
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

const ViewAllButton = styled(StyledButton)`
  margin-top: 48px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 200px;

  @media (max-width: 768px) {
    margin-top: 32px;
    width: 100%;
    max-width: 280px;
  }
`;

const OffersCarouselSection = styled.section`
  padding: 80px 0;
  background: transparent;
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
`;

const OffersContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 40px;
  margin-top: 40px;
  margin-bottom: 40px;
`;

const OfferCard = styled(Card)`
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease-in-out;
  height: 100%;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .ant-card-body {
    padding: 1.5rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  width: 100%;
  position: relative;
  padding-left: 0.5rem;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  min-height: 0; // Important for flex child
`;

const CreatorAvatar = styled(Avatar)`
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  position: absolute;
  left: -0.5rem;
  top: 50%;
  transform: translateY(-50%);
`;

const CreatorName = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: 2.5rem;
`;

const CardSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0;
  padding-bottom: ${props => props.isContentBrief ? '2rem' : '0'};
  flex: ${props => props.isContentBrief ? '1' : '0 0 auto'};
  min-height: 0; // Important for flex child
`;

const CardSectionTitle = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`;

const ContentBadge = styled(Tag)`
  margin: 6px 8px 6px 0;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.gradient};
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

const BidHighlight = styled.div`
  background: linear-gradient(135deg, ${primaryBlue}, ${brightMagenta});
  padding: 8px 12px;
  border-radius: 12px;
  margin: 12px 0;
  color: ${white};
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeadlineTimer = styled.div`
  color: ${brightMagenta};
  font-weight: 600;
  font-size: 14px;
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: transparent;
  border-radius: 6px;
`;

const StyledCarousel = styled(Carousel)`
  .slick-dots li button {
    background: ${primaryBlue};
    opacity: 0.3;
  }
  .slick-dots li.slick-active button {
    opacity: 1;
  }

  .slick-slide {
    padding: 0 16px;
    height: auto;
  }

  .slick-list {
    margin: 0 -16px;
  }

  .slick-track {
    display: flex;
    align-items: stretch;
  }

  .slick-slide > div {
    height: 100%;
    display: flex;
  }
`;

const platformLogos = {
  Instagram: <FaInstagram style={{ color: '#E1306C', fontSize: '24px' }} />,
  YouTube: <FaYoutube style={{ color: '#FF0000', fontSize: '24px' }} />,
  Twitter: <FaTwitter style={{ color: '#1DA1F2', fontSize: '24px' }} />,
  Facebook: <FaFacebook style={{ color: '#1877F2', fontSize: '24px' }} />,
  TikTok: <FaTiktok style={{ color: '#000000', fontSize: '24px' }} />,
  Snapchat: <FaSnapchat style={{ color: '#FFFC00', fontSize: '24px' }} />,
  LinkedIn: <FaLinkedin style={{ color: '#0077B5', fontSize: '24px' }} />,
  Pinterest: <FaPinterest style={{ color: '#E60023', fontSize: '24px' }} />,
  Twitch: <FaTwitch style={{ color: '#9146FF', fontSize: '24px' }} />
};

const PlatformIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 12px 0;
  flex-wrap: wrap;
`;

const PlatformSocialIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }
`;

// eslint-disable-next-line no-unused-vars
const _PlatformBadge = styled(Tag)`
  margin: 6px 8px 6px 0;
  border-radius: 16px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${white};
  border: 1px solid ${lightGray};
  color: ${darkCharcoal};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

// Sample offers data
const sampleOffers = [
  {
    id: 1,
    name: "Tech Review Pro",
    image_profile: "https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/tech%20avatar.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvdGVjaCBhdmF0YXIuanBlZyIsImlhdCI6MTc0ODk2NjE3OCwiZXhwIjoxNzgwNTAyMTc4fQ._1Yrk3t9VMR5UpNUeujx4Ft1kozWVDSmVRoYboECGmE",
    package_name: "iPhone 15 Pro Max Review",
    description: "Comprehensive review of the latest iPhone with focus on camera capabilities and battery life. Perfect for tech enthusiasts and potential buyers.",
    min_bid: 1500,
    bidding_deadline: "2024-03-15",
    platforms: ["YouTube", "Instagram"],
    content_format: ["10min+ Videos", "Static Posts"],
    projected_views: 50000,
    social_links: {
      youtube: "https://youtube.com/@techreview",
      instagram: "https://instagram.com/techreview"
    }
  },
  {
    id: 2,
    name: "Fitness Journey",
    image_profile: "https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/fitness%20avatar.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvZml0bmVzcyBhdmF0YXIuanBlZyIsImlhdCI6MTc0ODk2NjE5MCwiZXhwIjoxNzgwNTAyMTkwfQ.uPWR68D_ZuMZ7ckeyxAR7K0KTiOYEBxdRmLbaY_Oc3w",
    package_name: "30-Day Workout Challenge",
    description: "Engaging fitness challenge series showcasing workout routines, nutrition tips, and transformation stories. Great for fitness brands and supplements.",
    min_bid: 2000,
    bidding_deadline: "2024-03-20",
    platforms: ["TikTok", "Instagram"],
    content_format: ["Short Videos", "Stories"],
    projected_views: 75000,
    social_links: {
      tiktok: "https://tiktok.com/@fitnessjourney",
      instagram: "https://instagram.com/fitnessjourney"
    }
  },
  {
    id: 3,
    name: "Food Explorer",
    image_profile: "https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/foodie.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvZm9vZGllLmpwZWciLCJpYXQiOjE3NDg5NjYyMDIsImV4cCI6MTc4MDUwMjIwMn0.yXmaTAolUTDhbe9vNYo3jZ5tYmIrRcj-9vS3Eew3dQQ",
    package_name: "Global Cuisine Series",
    description: "Authentic cooking series featuring international recipes, restaurant reviews, and food culture exploration. Perfect for food brands and kitchen equipment.",
    min_bid: 1800,
    bidding_deadline: "2024-03-25",
    platforms: ["YouTube", "Instagram", "TikTok"],
    content_format: ["10min+ Videos", "Short Videos", "Static Posts"],
    projected_views: 100000,
    social_links: {
      youtube: "https://youtube.com/@foodexplorer",
      instagram: "https://instagram.com/foodexplorer",
      tiktok: "https://tiktok.com/@foodexplorer"
    }
  }
];

const getTagColor = (contentType) => {
  switch (contentType) {
    case 'Stories':
    case 'Static Posts':
      return 'linear-gradient(135deg, #ff9a00, #ff6f00)';
    case 'Live Streaming':
    case 'Live':
      return 'linear-gradient(135deg, #22c55e, #16a34a)';
    case 'Short Videos':
    case 'Reels':
      return 'linear-gradient(135deg, #ec4899, #db2777)';
    case '10min+ Videos':
      return 'linear-gradient(135deg, #3b82f6, #2563eb)';
    case 'Audio Content':
    case 'Podcast':
      return 'linear-gradient(135deg, #78716c, #57534e)';
    case 'Newsletter':
      return 'linear-gradient(135deg, #eab308, #ca8a04)';
    case 'Sponsored Content':
      return 'linear-gradient(135deg, #ff6b6b, #ff8e53)';
    default:
      return 'linear-gradient(135deg, #9ca3af, #6b7280)';
  }
};

const getTagIcon = (contentType) => {
  switch (contentType) {
    case 'Stories':
    case 'Static Posts':
      return <FaCamera style={{ fontSize: '16px' }} />;
    case 'Live Streaming':
    case 'Live':
      return <MdOutlineLiveTv style={{ fontSize: '16px' }} />;
    case 'Short Videos':
    case 'Reels':
      return <FaVideo style={{ fontSize: '16px' }} />;
    case '10min+ Videos':
      return <FiFilm style={{ fontSize: '16px' }} />;
    case 'Audio Content':
    case 'Podcast':
      return <MdOutlineAudiotrack style={{ fontSize: '16px' }} />;
    case 'Sponsored Content':
      return <FiVideo style={{ fontSize: '16px' }} />;
    case 'Newsletter':
      return <FaNewspaper style={{ fontSize: '16px' }} />;
    default:
      return <FiImage style={{ fontSize: '16px' }} />;
  }
};

// Lazy-load CookieSettings and any other heavy components
const CookieSettings = lazy(() => import('../components/CookieSettings'));

const LandingPage = () => {
  const { scrollY } = useScroll();
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // Preload fonts and critical assets
  useEffect(() => {
    // Preload Inter font
    const fontPreload = document.createElement('link');
    fontPreload.rel = 'preload';
    fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    fontPreload.as = 'style';
    document.head.appendChild(fontPreload);
  }, []);

  // Optimize intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px 0px 0px 0px'
      }
    );

    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      observer.observe(heroSection);
    }

    return () => {
      if (heroSection) {
        observer.unobserve(heroSection);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      // eslint-disable-next-line no-unused-vars
      const _documentHeight = document.documentElement.scrollHeight;
      
      if (scrollPosition > windowHeight * 0.5) {
        setActiveStep(1);
      }
      if (scrollPosition > windowHeight * 1.5) {
        setActiveStep(2);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load featured blog posts (strategically selected new posts)
  useEffect(() => {
    const loadFeaturedPosts = async () => {
      try {
        setPostsLoading(true);
        // Strategically select the 3 new posts we just created
        const featuredSlugs = [
          'us-brands-send-pr-micro-influencers-2026-list',
          'skincare-pr-list-small-creators-2026',
          'how-to-get-gaming-sponsorships-small-streamers-2026-guide'
        ];

        const postPromises = featuredSlugs.map(async (slug) => {
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "NewCollab - Creator & Brand Collaboration Platform",
    "description": "Connect with brands and creators, build meaningful partnerships, and grow your influence together on NewCollab's collaboration platform.",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Creator-Brand Matching",
      "Campaign Management",
      "Analytics Dashboard",
      "Secure Payments",
      "Multi-platform Support"
    ],
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Content Monetization",
          "description": "Post your content projects and let brands bid to sponsor them"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Brand Partnerships",
          "description": "Connect with premium brands ready to invest in creator content"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Secure Payments",
          "description": "Get paid securely through our trusted payment system"
        }
      ]
    }
  };

  // eslint-disable-next-line no-unused-vars
  const _handleOpenCookieSettings = (e) => {
    e.preventDefault();
    setShowCookieSettings(true);
  };

  return (
    <>
      <Helmet>
        <title>Find brands to sponsor your content | Newcollab Content Creator Platform</title>
        <meta name="description" content="Join Newcollab to monetize your content or spark authentic brand campaigns. Creators post ideas, brands bid or send invites, and partnerships thrive. Start now!" />
        <meta name="keywords" content="content creator platform, monetize content, brand collaborations, influencer partnerships, campaign invites, content bidding, creator monetization, brand sponsorships, content creator platform, influencer marketing" />
        <meta property="og:title" content="Find brands to sponsor your content | Newcollab Content Creator Platform" />
        <meta property="og:description" content="Join Newcollab to monetize your content or spark authentic brand campaigns. Creators post ideas, brands bid or send invites, and partnerships thrive. Start now!" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/newcollab%20-%20create%20and%20secure%20meaningful%20collaborations.png" />
        <meta property="og:url" content="https://newcollab.co" />
        <meta property="og:site_name" content="Newcollab" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Find brands to sponsor your content | Newcollab Content Creator Platform" />
        <meta name="twitter:description" content="Join Newcollab to monetize your content or spark authentic brand campaigns. Creators post ideas, brands bid or send invites, and partnerships thrive. Start now!" />
        <meta name="twitter:image" content="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/newcollab%20-%20create%20and%20secure%20meaningful%20collaborations.png" />
        <link rel="canonical" href="https://newcollab.co/" />
        <link rel="icon" type="image/png" href="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/NEWCOLLAB-BRAND_fav_google.png" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="author" content="Newcollab" />
        {/* Preload critical assets */}
        <link 
          rel="preload" 
          href="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/newcollab%20-%20create%20and%20secure%20meaningful%20collaborations_hero1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvbmV3Y29sbGFiIC0gY3JlYXRlIGFuZCBzZWN1cmUgbWVhbmluZ2Z1bCBjb2xsYWJvcmF0aW9uc19oZXJvMS5wbmciLCJpYXQiOjE3NDg5NjgyNjgsImV4cCI6MTc4MDUwNDI2OH0.sT9ChYAbpbjtAyMNyHg0rdk3Cthh3IZEfzPps3PcFsQ" 
          as="image" 
          type="image/png"
          fetchpriority="high"
        />
        <link 
          rel="preconnect" 
          href="https://kyawgtojxoglvlhzsotm.supabase.co"
          crossOrigin="anonymous"
        />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" 
          as="style"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet"
        />
        <style>
          {`
            @font-face {
              font-family: 'Inter';
              font-style: normal;
              font-weight: 800;
              font-display: swap;
              src: url(https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2) format('woff2');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
          `}
        </style>
      </Helmet>

      <Container>
        <HeroSection className="hero-section">
          <HeroContent>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Primary H1 tag for SEO - visible and properly structured */}
              <h1 style={{ 
                fontSize: '64px', 
                fontWeight: '800', 
                marginBottom: '24px', 
                color: '#1F2937', 
                lineHeight: '1.2',
                margin: '0 0 24px 0',
                textAlign: 'center',
                maxWidth: '800px'
              }}>
                The Bidding Marketplace for Creators & Brands - Newcollab
              </h1>
              <HeroTitle level={2} style={{ display: 'none' }}>
                <b>The bidding marketplace for Creators & Brands</b>.
              </HeroTitle>
              <HeroSubtitle>
                The first platform for creators to monetize their ideas and brands to spark authentic campaigns.
                <div> Get brands to <b>bid on your next viral content</b>, accept the best offers and grow your partnerships.</div> 
              </HeroSubtitle>
              <div>
                <StyledButton
                  type="primary"
                  className="primary"
                  size="large"
                  href="/register/creator"
                  aria-label="Join as Content Creator"
                >
                  Join as Content Creator
                </StyledButton>
                <StyledButton
                  className="secondary"
                  size="large"
                  href="/register/brand"
                  aria-label="Join as Brand"
                >
                  Join as Brand
                </StyledButton>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <HeroImage>
                  <picture>
                    <source srcSet="/assets/newcollab-create-and-secure-meaningful-collaborations_hero1.webp" type="image/webp" />
                    <img 
                      src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/newcollab%20-%20create%20and%20secure%20meaningful%20collaborations_hero1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvbmV3Y29sbGFiIC0gY3JlYXRlIGFuZCBzZWN1cmUgbWVhbmluZ2Z1bCBjb2xsYWJvcmF0aW9uc19oZXJvMS5wbmciLCJpYXQiOjE3NDg5NjgyNjgsImV4cCI6MTc4MDUwNDI2OH0.sT9ChYAbpbjtAyMNyHg0rdk3Cthh3IZEfzPps3PcFsQ"
                      alt="Newcollab platform interface showing content creator and brand collaboration features"
                      width="1400"
                      height="800"
                      fetchpriority="high"
                      loading="eager"
                      decoding="async"
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </picture>
                </HeroImage>
              </motion.div>
            </motion.div>
          </HeroContent>
        </HeroSection>

        {/* Marketplace CTA Section */}
        <PlatformSection style={{ padding: '60px 0', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <Title level={2} style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px', color: darkCharcoal }}>
                Discover Top Creators Ready for Collaboration
              </Title>
              <Paragraph style={{ fontSize: '18px', color: midGray, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px auto', lineHeight: 1.6 }}>
                Browse our curated marketplace of vetted creators. Filter by niche, engagement rate, and audience size. Find the perfect match for your brand and send PR packages instantly.
              </Paragraph>
              <StyledButton
                type="primary"
                className="primary"
                size="large"
                href="/marketplace"
                style={{ margin: '0 12px' }}
              >
                Browse Creator Marketplace
              </StyledButton>
            </motion.div>
          </div>
        </PlatformSection>

        <OffersCarouselSection aria-labelledby="featured-offers-title">
          <OffersContainer>
            <SectionHeader>
              <SectionTitle level={2} id="featured-offers-title">Monetize Your Content & Connect with Premium Brands</SectionTitle>
              <SectionSubtitle>
                Showcase your content ideas to brands ready to invest. Set your price, choose your platforms, and let brands compete to collaborate with you.
              </SectionSubtitle>
            </SectionHeader>
            <StyledCarousel
              autoplay
              autoplaySpeed={5000}
              dots={true}
              slidesToShow={3}
              slidesToScroll={1}
              responsive={[
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                  }
                }
              ]}
              aria-label="Featured content opportunities carousel"
            >
              {sampleOffers.map((offer) => (
                <article key={offer.id} itemScope itemType="https://schema.org/CreativeWork">
                  <OfferCard>
                    <CardTitle>
                      <CreatorAvatar 
                        src={offer.image_profile} 
                        size={48} 
                        alt={`${offer.name}'s profile picture`}
                      />
                      <CreatorName itemProp="author">{offer.name}</CreatorName>
                    </CardTitle>
                    <CardContent>
                      <CardSection isContentBrief>
                        <CardSectionTitle>Content Package</CardSectionTitle>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#1e293b' }} itemProp="name">
                          {offer.package_name}
                        </h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }} itemProp="description">
                          {offer.description}
                        </p>
                      </CardSection>

                      <CardSection>
                        <CardSectionTitle>Platforms & Format</CardSectionTitle>
                        <PlatformIcons aria-label="Available platforms">
                          {offer.platforms.map((platform) => (
                            <PlatformSocialIcon 
                              key={platform}
                              aria-label={`${platform} platform`}
                            >
                              {platformLogos[platform]}
                            </PlatformSocialIcon>
                          ))}
                        </PlatformIcons>
                        <div aria-label="Content formats">
                          {offer.content_format.map((format) => (
                            <ContentBadge 
                              key={format} 
                              gradient={getTagColor(format)}
                              aria-label={`${format} content format`}
                            >
                              {getTagIcon(format)}
                              {format}
                            </ContentBadge>
                          ))}
                        </div>
                      </CardSection>

                      <CardSection>
                        <BidHighlight>
                          <DollarCircleOutlined />
                          Min Bid: €{offer.min_bid}
                        </BidHighlight>
                        <DeadlineTimer>
                          <ClockCircleOutlined />
                          Bidding ends: {moment(offer.bidding_deadline).format('MMM D, YYYY')}
                        </DeadlineTimer>
                      </CardSection>

                      <Button
                        type="primary"
                        size="large"
                        block
                        href="/register"
                        style={{
                          background: 'linear-gradient(135deg, #26A69A, #4DB6AC)',
                          border: 'none',
                          height: '48px',
                          borderRadius: '24px',
                          marginTop: 'auto'
                        }}
                        aria-label={`Place a bid for ${offer.package_name}`}
                      >
                        Place a Bid
                      </Button>
                    </CardContent>
                  </OfferCard>
                </article>
              ))}
            </StyledCarousel>
          </OffersContainer>
        </OffersCarouselSection>

        <PlatformSection id="platform">
          <PlatformTitle level={2}>Built for creators of all platforms</PlatformTitle>
          <PlatformGrid gutter={[32, 32]} justify="center">
            <PlatformCard xs={24} sm={12} md={8} lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <PlatformIcon $bgColor="#E1306C" $color="#FFFFFF">
                  <FaInstagram />
                </PlatformIcon>
              </motion.div>
            </PlatformCard>
            <PlatformCard xs={24} sm={12} md={8} lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <PlatformIcon $bgColor="#FF0000" $color="#FFFFFF">
                  <FaYoutube />
                </PlatformIcon>
              </motion.div>
            </PlatformCard>
            <PlatformCard xs={24} sm={12} md={8} lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <PlatformIcon $bgColor="#000000" $color="#FFFFFF">
                  <FaTiktok />
                </PlatformIcon>
              </motion.div>
            </PlatformCard>
            <PlatformCard xs={24} sm={12} md={8} lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <PlatformIcon $bgColor="#9146FF" $color="#FFFFFF">
                  <FaTwitch />
                </PlatformIcon>
              </motion.div>
            </PlatformCard>
            <PlatformCard xs={24} sm={12} md={8} lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <PlatformIcon $bgColor="#1DA1F2" $color="#FFFFFF">
                  <FaTwitter />
                </PlatformIcon>
              </motion.div>
            </PlatformCard>
            <PlatformCard xs={24} sm={12} md={8} lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <PlatformIcon $bgColor="#FFFC00" $color="#000000">
                  <FaSnapchat />
                </PlatformIcon>
              </motion.div>
            </PlatformCard>
          </PlatformGrid>
        </PlatformSection>

        <HowItWorksSection id="platform">
          <SectionHeader>
            <SectionTitle level={2}>Secure Content Monetization & Brand Partnerships</SectionTitle>
            <SectionSubtitle>
              In just three steps, content creators can <b>attract their dream brands</b> and brands can find the <b>perfect content with the right creators</b>.
              <div>Discover how Newcollab makes collaboration simple, secure, and rewarding.</div>
            </SectionSubtitle>
          </SectionHeader>

          <HowItWorksContainer className="how-it-works-container">
            <StepContainer
              className={activeStep === 0 ? 'active' : ''}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <StepContent
                initial={{ x: -50 }}
                whileInView={{ x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <StepNumber>1</StepNumber>
                <StepTitle level={3}>Secure Content Monetization: Post Your Next Project</StepTitle>
                <StepDescription>
                  It's simple, share your next content project on Newcollab in minutes. Upload your idea, pick your platforms (e.g., TikTok, Instagram, YouTube), and set a minimum bid. Your project instantly reaches brands ready to collaborate, making it effortless to kickstart your campaign with the right sponsor.
                </StepDescription>
              </StepContent>
              <StepVisual
                className="step-1"
                initial={{ x: 50 }}
                whileInView={{ x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  transform: `translateY(${scrollY.get() * 0.05}px)`
                }}
              >
                <img 
                  src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/newcollab_create_content_draft_2.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJuZXdjb2xsYWIvbmV3Y29sbGFiX2NyZWF0ZV9jb250ZW50X2RyYWZ0XzIucG5nIiwiaWF0IjoxNzQ3MjM1Mjc2LCJleHAiOjE4NDE4NDMyNzZ9.g3bgWP4ijqh7qkTXlBgN5hLTr6AZiZhyXFwFpwzVi04"
                  alt="Newcollab's simple content project submission form for creators to monetize ideas."
                  loading="lazy"
                  decoding="async"
                  width="800"
                  height="600"
                  style={{ width: '100%', height: 'auto', imageRendering: 'crisp-edges' }}
                />
              </StepVisual>
            </StepContainer>

            <StepContainer
              className={activeStep === 1 ? 'active' : ''}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <StepContent
                initial={{ x: -50 }}
                whileInView={{ x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <StepNumber>2</StepNumber>
                <StepTitle level={3}>Brand Bidding & Partnership Opportunities</StepTitle>
                <StepDescription>
                  Watch brands compete to be involved in your content with the right offer. Review their bids and accept the right brand for your project.
                </StepDescription>
              </StepContent>
              <StepVisual
                initial={{ x: 50 }}
                whileInView={{ x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  transform: `translateY(${scrollY.get() * 0.08}px)`
                }}
              >
                <img 
                  src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/creator%20platform%20bidding%20newcollab.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvY3JlYXRvciBwbGF0Zm9ybSBiaWRkaW5nIG5ld2NvbGxhYi5wbmciLCJpYXQiOjE3NDg5NjE4MDMsImV4cCI6MTc4MDQ5NzgwM30.phXlWgOo0CJLMxAunr1R9oxjqqTDGSIkjdUwO39Q5k4"
                  alt="Newcollab bidding dashboard with brands competing for creator content projects."
                  loading="lazy"
                  decoding="async"
                  width="800"
                  height="600"
                  style={{ width: '100%', height: 'auto', imageRendering: 'crisp-edges' }}
                />
                <img 
                  className="notification"
                  src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/creator%20platform%20bidding.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvY3JlYXRvciBwbGF0Zm9ybSBiaWRkaW5nLnBuZyIsImlhdCI6MTc0ODk2MTgyMywiZXhwIjoxNzgwNDk3ODIzfQ.Qn2rb6RKO7Qp8QlcSC4EjZS2yUrznGvzbov44gsutXI"
                  alt="Accept or reject a brand's bid on your content project."
                  loading="lazy"
                  decoding="async"
                  width="500"
                  height="300"
                  style={{ 
                    animationDelay: '1s',
                    imageRendering: 'crisp-edges',
                    transform: 'scale(0.85)',
                    transformOrigin: 'top right',
                    width: '100%',
                    height: 'auto'
                  }}
                />
              </StepVisual>
            </StepContainer>

            <StepContainer
              className={activeStep === 2 ? 'active' : ''}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <StepContent
                initial={{ x: -50 }}
                whileInView={{ x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <StepNumber>3</StepNumber>
                <StepTitle level={3}>Secure Payment & Partnership Acceptance</StepTitle>
                <StepDescription>
                  No more long negotiations — just accept brands that match your content and audience. Create your content, get paid securely through our trusted system and start building long-term relationships with brands you love.
                </StepDescription>
              </StepContent>
              <StepVisual
                initial={{ x: 50 }}
                whileInView={{ x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  transform: `translateY(${scrollY.get() * 0.12}px)`
                }}
              >
                <img 
                  src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/creator%20brand%20content%20platform%20bidding.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvY3JlYXRvciBicmFuZCBjb250ZW50IHBsYXRmb3JtIGJpZGRpbmcucG5nIiwiaWF0IjoxNzQ4OTYxODU3LCJleHAiOjE3ODA0OTc4NTd9.Fm8JuFCSjt64pQWNotHQhep8j9L8UnZwNEqLWj6QByY"
                  alt="Receive offers from brands on Newcollab and accept the right one for authentic content and collaboration."
                  loading="eager"
                  decoding="async"
                  style={{ imageRendering: 'crisp-edges' }}
                />
                <img 
                  className="notification"
                  src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/ui_bid_accept_1.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJuZXdjb2xsYWIvdWlfYmlkX2FjY2VwdF8xLnBuZyIsImlhdCI6MTc0NzIzNzQyMywiZXhwIjoxODQxODQ1NDIzfQ.pHzgFcYm0psBRK-MK9TLT0MDDV2n4VxgiiVaUB61eWw"
                  alt="Creator quickly accepting a brand offer on Newcollab for fast collaboration."
                  style={{ 
                    animationDelay: '1s',
                    imageRendering: 'crisp-edges',
                    transform: 'scale(0.85)',
                    transformOrigin: 'top right'
                  }}
                  loading="eager"
                  decoding="async"
                />
              </StepVisual>
            </StepContainer>
          </HowItWorksContainer>
          <StepsCTA>
            <StyledButton
              type="primary"
              className="primary"
              size="large"
              href="/register"
            >
              Join Newcollab
            </StyledButton>
            <StepsCTAText>It's free! 🎉</StepsCTAText>
          </StepsCTA>
        </HowItWorksSection>

        <FeaturesSection id="features">
          <FeaturesContainer>
            <SectionHeader>
              <SectionTitle level={2}>Content Creator Platform Features & Tools</SectionTitle>
              <SectionSubtitle>
                Powerful features to help content creators attract more partnership opportunities and brands to find contents that stand out.
              </SectionSubtitle>
            </SectionHeader>
            <FeaturesGrid>
              <FeatureCard
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                bgColor={primaryBlue}
                span="span 5"
                height="span 1"
              >
                <FeatureIcon bgColor={primaryBlue}>
                  <span role="img" aria-label="Auction">⚡</span>
                </FeatureIcon>
                <FeatureTitle>Content Monetization & Bidding System</FeatureTitle>
                <FeatureDescription>
                Post your content projects and let brands bid to sponsor them. Set your price, choose your platforms, and select the offer that fit with your values and audience.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                bgColor="#3B82F6"
                span="span 7"
                height="span 2"
              >
                <FeatureIcon bgColor="#3B82F6">
                  <span role="img" aria-label="Bell">🔔</span>
                </FeatureIcon>
                <FeatureTitle>Brand Campaign & Partnership Invites</FeatureTitle>
                <FeatureDescription>
                No more cold outreach. Receive exclusive invites for collabs that fit your content, streamlining partnerships that feel authentic.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                bgColor="#8B5CF6"
                span="span 4"
                height="span 2"
              >
                <FeatureIcon bgColor="#8B5CF6">
                  <span role="img" aria-label="Eye">👁️</span>
                </FeatureIcon>
                <FeatureTitle>Secure Content Collaboration & Approval Flow</FeatureTitle>
                <FeatureDescription>
                From submitting draft content to getting final approval, we are making Creators and Brands work seamlessly in one platform, with secure payments to seal the deal.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.3 }}
                bgColor={brightMagenta}
                span="span 8"
                height="span 1"
              >
                <FeatureIcon bgColor={brightMagenta}>
                  <span role="img" aria-label="Messaging">💬</span>
                </FeatureIcon>
                <FeatureTitle>Real-time Brand Communication & Messaging</FeatureTitle>
                <FeatureDescription>
                  Communicate directly with brands through our secure messaging system. Share ideas and feedback in real-time.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.4 }}
                bgColor="#10B981"
                span="span 6"
                height="span 1"
              >
                <FeatureIcon bgColor="#10B981">
                  <span role="img" aria-label="Payment">🔒</span>
                </FeatureIcon>
                <FeatureTitle>Secure Creator Payment & Transaction System</FeatureTitle>
                <FeatureDescription>
                  Once approved & posted get paid securely through our trusted payment system. No more chasing payments or dealing with payment delays. 
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.5 }}
                bgColor={warmOrange}
                span="span 6"
                height="span 2"
              >
                <FeatureIcon bgColor={warmOrange}>
                  <span role="img" aria-label="Curated">✨</span>
                </FeatureIcon>
                <FeatureTitle>Verified Creator & Brand Network</FeatureTitle>
                <FeatureDescription>
                  Connect with verified creators and brands. Our curation ensures quality partnerships and authentic collaborations.
                </FeatureDescription>
              </FeatureCard>
            </FeaturesGrid>
          </FeaturesContainer>
        </FeaturesSection>

        <BlogSection>
          <BlogContainer>
            <SectionHeader>
              <SectionTitle level={2}>Latest Creator Resources & Guides</SectionTitle>
              <SectionSubtitle>
                Discover proven strategies, brand lists, and step-by-step guides to grow your creator business and land your dream collaborations.
              </SectionSubtitle>
            </SectionHeader>
            
            {!postsLoading && featuredPosts.length > 0 && (
              <BlogGrid>
                {featuredPosts.map((post, index) => (
                  <BlogCard
                    key={post.slug}
                    href={`/blog/${post.slug}`}
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
              <ViewAllButton
                className="secondary"
                href="/blog"
                size="large"
              >
                View All Articles
              </ViewAllButton>
            )}
          </BlogContainer>
        </BlogSection>

        <TrustSignalsSection>
          <SectionHeader>
            <SectionTitle level={2}>Trusted by Leading Creators & Brands ✨</SectionTitle>
            <SectionSubtitle>
              Join a thriving community of innovative creators and forward-thinking brands shaping the future of content 🚀
            </SectionSubtitle>
          </SectionHeader>
          
          <StatsContainer>
            <StatCard
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StatNumber>1.5K+</StatNumber>
              <StatLabel>Active Creators 👥</StatLabel>
            </StatCard>
            
            <StatCard
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <StatNumber>€200K+</StatNumber>
              <StatLabel>Creator Revenue 💎</StatLabel>
            </StatCard>
            
            <StatCard
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <StatNumber>500+</StatNumber>
              <StatLabel>Brand Partners 🤝</StatLabel>
            </StatCard>
            
            <StatCard
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <StatNumber>98%</StatNumber>
              <StatLabel>Creator Satisfaction ⭐</StatLabel>
            </StatCard>
          </StatsContainer>

          <PaymentBadgesContainer>
            <PaymentBadge>
              <img 
                src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/stripe%20secure%20payment.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJuZXdjb2xsYWIvc3RyaXBlIHNlY3VyZSBwYXltZW50LnBuZyIsImlhdCI6MTc0NzMxNTIyMiwiZXhwIjoxNzc4ODUxMjIyfQ.Vnv2vL0bhrKmmw5ZK3Ss3NxFZ5KN-nseUXK8gUw2-vQ" 
                alt="Stripe secure payment badge"
              />
              <span>Enterprise-Grade Security 🔒</span>
            </PaymentBadge>
            <PaymentBadge>
              <img 
                src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/paypal%20secure%20payment.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJuZXdjb2xsYWIvcGF5cGFsIHNlY3VyZSBwYXltZW50LnBuZyIsImlhdCI6MTc0NzMxNTIzMiwiZXhwIjoxNzc4ODUxMjMyfQ.jhiSkFkUoAdUtsboOBiJxPUbBLaC6EdnWJzpAbVGLt4" 
                alt="PayPal secure payment badge"
              />
              <span>Protected Transactions 🛡️</span>
            </PaymentBadge>
          </PaymentBadgesContainer>
        </TrustSignalsSection>

        <BrandsSection>
          <BrandsContainer>
            <SectionHeader>
              <SectionTitle level={2}>Premium Brand Partnerships & Collaborations</SectionTitle>
              <SectionSubtitle>
                Connect with brands from all sizes eager to invest in quality and authentic content.
              </SectionSubtitle>
            </SectionHeader>
            <BrandsGrid>
              <BrandLogo
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/Xiaomi-logo-content.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJuZXdjb2xsYWIvWGlhb21pLWxvZ28tY29udGVudC5qcGciLCJpYXQiOjE3NDczMDE0MjYsImV4cCI6MTg0MTkwOTQyNn0.kTPEyB-QE5a-8KH2MLszZ2uqCcA6BtVKYeMnpMSoEZg"
                  alt="Xiaomi brand logo on Newcollab platform - Tech and lifestyle brand partner"
                  loading="lazy"
                  decoding="async"
                  width="120"
                  height="120"
                  style={{ width: '65%', height: '65%', objectFit: 'contain' }}
                />
              </BrandLogo>
              <BrandLogo
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <img 
                  src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/Lacoste-logo-content2.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJuZXdjb2xsYWIvTGFjb3N0ZS1sb2dvLWNvbnRlbnQyLnBuZyIsImlhdCI6MTc0NzMwMjU2OCwiZXhwIjoxNzc4ODM4NTY4fQ.AowyGfPbNyUeh8FIkVl97CNfghBhExQuN-hVWupy1d8"
                  alt="Lacoste brand logo on Newcollab platform - Fashion and lifestyle brand partner"
                  loading="lazy"
                  decoding="async"
                  width="120"
                  height="120"
                  style={{ width: '65%', height: '65%', objectFit: 'contain' }}
                />
              </BrandLogo>
              <BrandLogo
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <img 
                  src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/adidas-logo-1.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJuZXdjb2xsYWIvYWRpZGFzLWxvZ28tMS5wbmciLCJpYXQiOjE3NDczMDI1ODMsImV4cCI6MTc3ODgzODU4M30.HpNH9-vaCaxpT51tVHXm3V5m_S96eyp5XSgcYc10yz4"
                  alt="Adidas brand logo on Newcollab platform - Sports and lifestyle brand partner"
                  loading="lazy"
                  decoding="async"
                  width="120"
                  height="120"
                  style={{ width: '65%', height: '65%', objectFit: 'contain' }}
                />
              </BrandLogo>
              <BrandLogo
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <img 
                  src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/microsoft-logo-content2.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJuZXdjb2xsYWIvbWljcm9zb2Z0LWxvZ28tY29udGVudDIucG5nIiwiaWF0IjoxNzQ3MzAyNzIzLCJleHAiOjE3Nzg4Mzg3MjN9.KRJ6iWrjgUO-a07XyIqPVTxuHBANmgCwYaCqf22l7aY"
                  alt="Microsoft brand logo on Newcollab platform - Technology and innovation brand partner"
                  loading="lazy"
                  decoding="async"
                  width="120"
                  height="120"
                  style={{ width: '65%', height: '65%', objectFit: 'contain' }}
                />
              </BrandLogo>
              <BrandLogo
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <img 
                  src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/nike-logo-content.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJuZXdjb2xsYWIvbmlrZS1sb2dvLWNvbnRlbnQuanBnIiwiaWF0IjoxNzQ3MzAxNDc3LCJleHAiOjE3Nzg4Mzc0Nzd9.8TNBtA4qRXSxObTiXkiYibfbhYbTNmHrFAH_OCRVTcc"
                  alt="Nike brand logo on Newcollab platform - Sports and lifestyle brand partner"
                  loading="lazy"
                  decoding="async"
                  width="120"
                  height="120"
                  style={{ width: '65%', height: '65%', objectFit: 'contain' }}
                />
              </BrandLogo>
              <BrandLogo
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <img 
                  src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/apple-logo-content1.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJuZXdjb2xsYWIvYXBwbGUtbG9nby1jb250ZW50MS5wbmciLCJpYXQiOjE3NDczMDI3NDYsImV4cCI6MTc3ODgzODc0Nn0.fXq3bmAS0AQhWoGy_4u2zpb-jWzSpesd8nclHDyZBwI"
                  alt="Apple brand logo on Newcollab platform - Technology and innovation brand partner"
                  loading="lazy"
                  decoding="async"
                  width="120"
                  height="120"
                  style={{ width: '65%', height: '65%', objectFit: 'contain' }}
                />
              </BrandLogo>
              <BrandLogo
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <img 
                  src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/amazon-logo-content1.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJuZXdjb2xsYWIvYW1hem9uLWxvZ28tY29udGVudDEucG5nIiwiaWF0IjoxNzQ3MzAyNzYyLCJleHAiOjE3Nzg4Mzg3NjJ9.84S-nlSOTrFFAVKBxlRpA5cESpABMBxTXrYrrpZL2ps"
                  alt="Amazon brand logo on Newcollab platform - E-commerce and technology brand partner"
                  loading="lazy"
                  decoding="async"
                  width="120"
                  height="120"
                  style={{ width: '65%', height: '65%', objectFit: 'contain' }}
                />
              </BrandLogo>
              <BrandLogo
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <img 
                  src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/Asos-logo-content.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJuZXdjb2xsYWIvQXNvcy1sb2dvLWNvbnRlbnQucG5nIiwiaWF0IjoxNzQ3MzAxNTA5LCJleHAiOjE3Nzg4Mzc1MDl9.HHs2fKdjfI-FvTUJkrTJUk9703tfDWrZkE8egiyfjAM"
                  alt="ASOS brand logo on Newcollab platform - Fashion and lifestyle brand partner"
                  loading="lazy"
                  decoding="async"
                  width="120"
                  height="120"
                  style={{ width: '65%', height: '65%', objectFit: 'contain' }}
                />
              </BrandLogo>
            </BrandsGrid>
          </BrandsContainer>
        </BrandsSection>

        <TestimonialSection>
          <SectionHeader>
            <SectionTitle level={2}>Creator Success Stories & Brand Partnerships</SectionTitle>
            <SectionSubtitle>
              They are using Newcollab and signed their first partnerships with amazing brands.
            </SectionSubtitle>
          </SectionHeader>
          <TestimonialGrid gutter={[48, 48]} justify="center">
            <TestimonialCard xs={24} sm={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <TestimonialAvatar>
                  <img 
                    src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/@justavatar.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJuZXdjb2xsYWIvQGp1c3RhdmF0YXIucG5nIiwiaWF0IjoxNzQ3MzA1MDQ2LCJleHAiOjE3Nzg4NDEwNDZ9.hMDrqPvugJ8Kr4HI723GwHZvV2v4rAHuA3tl5q1lds4" 
                    alt="Mia K., TikTok creator testimonial on Newcollab - Lifestyle content creator"
                    loading="lazy"
                    decoding="async"
                    width="64"
                    height="64"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </TestimonialAvatar>
                <TestimonialText>
                  Newcollab made monetizing my TikTok content so easy. I posted a project, got multiple brand bids in days, and doubled my earnings!
                </TestimonialText>
                <TestimonialAuthor>@justlivingit</TestimonialAuthor>
              </motion.div>
            </TestimonialCard>
            <TestimonialCard xs={24} sm={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <TestimonialAvatar>
                  <img 
                    src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/@fitspace.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJuZXdjb2xsYWIvQGZpdHNwYWNlLnBuZyIsImlhdCI6MTc0NzMwNTA1NCwiZXhwIjoxNzc4ODQxMDU0fQ.RdDnWE33Ak8kf7TqFmzuLB7vqly6usvKvC6ip8wSXtM" 
                    alt="Alex M., YouTube creator testimonial on Newcollab - Fitness and wellness content creator"
                    loading="lazy"
                    decoding="async"
                    width="64"
                    height="64"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </TestimonialAvatar>
                <TestimonialText>
                  The campaign invites I get on Newcollab are tailored to my YouTube audience. I found my 1st brand collab on the platform and it helped me kickstart my brand collab journey.
                </TestimonialText>
                <TestimonialAuthor>@fitspace_ny</TestimonialAuthor>
              </motion.div>
            </TestimonialCard>
          </TestimonialGrid>
        </TestimonialSection>

        <CTASection>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CTATitle level={2}>Start Your Creator Journey & Secure Brand Partnerships</CTATitle>
            <div>
              <StyledButton
                type="primary"
                className="primary"
                size="large"
                href="/register/creator"
              >
                Join as Creator
              </StyledButton>
              <StyledButton
                className="secondary"
                size="large"
                href="/register/brand"
              >
                Partner as Brand
              </StyledButton>
            </div>
          </motion.div>
        </CTASection>
      </Container>

      <Suspense fallback={null}>
        {showCookieSettings && <CookieSettings onClose={() => setShowCookieSettings(false)} />}
      </Suspense>
    </>
  );
};

export default React.memo(LandingPage);