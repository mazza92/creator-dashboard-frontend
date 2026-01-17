'use client';

import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MenuOutlined, CloseOutlined, ArrowUpOutlined } from '@ant-design/icons';
import styled, { createGlobalStyle } from 'styled-components';
// Logo will be handled via public folder or image component
const logoPath = '/NEWCOLLAB-BRAND.png';
// Temporarily comment out components that might cause issues
// import Header from '../../components/Header';
// import { FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';
// import { FaTiktok } from 'react-icons/fa6';
// import CookieSettings from '../../components/CookieSettings';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif !important;
    font-weight: 400;
  }

  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: 100vh;
    background: transparent !important;
    overflow-x: hidden;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif !important;
    font-weight: 400;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

const primaryBlue = '#3B82F6';
const brightMagenta = '#EC4899';
const offWhite = '#F9FAFB';
const warmOrange = '#FF9F43';
const darkCharcoal = '#1e293b';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  background: ${offWhite};
  position: relative;
`;

const OrangeBlur = styled.div`
  position: fixed;
  top: -200px;
  right: -200px;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(255, 159, 67, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
`;

const HeaderWrapper = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: ${props => props.$isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent'};
  backdrop-filter: ${props => props.$isScrolled ? 'blur(10px)' : 'none'};
  transition: all 0.3s ease;
  border-bottom: ${props => props.$isScrolled ? '1px solid rgba(0, 0, 0, 0.1)' : 'none'};
`;

const ScrollTopButton = styled(Button)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${primaryBlue};
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  z-index: 999;
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${brightMagenta};
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(236, 72, 153, 0.4);
  }
`;

export default function LandingPageLayoutNext({ hideHeader, children, canonicalUrl: customCanonicalUrl }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Generate canonical URL (stripping query parameters)
  const canonicalUrl = customCanonicalUrl || `https://newcollab.co${pathname === '/' ? '' : pathname}`;

  // Inject canonical link tag for SEO (Next.js compatible)
  useEffect(() => {
    // Remove existing canonical link if any
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }
    
    // Add new canonical link
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonicalUrl;
    document.head.appendChild(link);
    
    return () => {
      // Cleanup on unmount
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical && canonical.href === canonicalUrl) {
        canonical.remove();
      }
    };
  }, [canonicalUrl]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
      setShowScrollTop(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleOpenCookieSettings = (e) => {
    if (e) e.preventDefault();
    setShowCookieSettings(true);
  };

  return (
    <LayoutWrapper>
      <OrangeBlur />
      <GlobalStyle />
      {!hideHeader && (
        <HeaderWrapper $isMobile={isMobile} $isScrolled={isScrolled}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
            <Link href="/">
              <img src={logoPath} alt="NewCollab" style={{ height: '40px' }} />
            </Link>
            {/* Add your header navigation here */}
          </div>
        </HeaderWrapper>
      )}
      <main style={{ paddingTop: hideHeader ? '0' : '80px' }}>
        {children}
      </main>
      <ScrollTopButton
        type="primary"
        shape="circle"
        icon={<ArrowUpOutlined />}
        onClick={scrollToTop}
        $show={showScrollTop}
      />
      {/* Temporarily disabled */}
      {/* {showCookieSettings && (
        <CookieSettings onClose={() => setShowCookieSettings(false)} />
      )} */}
    </LayoutWrapper>
  );
}
