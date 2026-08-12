'use client';

import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MenuOutlined, CloseOutlined, ArrowUpOutlined } from '@ant-design/icons';
import styled, { createGlobalStyle } from 'styled-components';
import { FaLinkedin, FaInstagram } from 'react-icons/fa';
import { FaTiktok, FaXTwitter } from 'react-icons/fa6';
import CookieSettings from '../../components/CookieSettings';
import { tokens } from '../../theme/tokens';

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

// V5 Palette
const primaryRose = tokens.primary;
const accentViolet = tokens.accent;
const offWhite = tokens.bg;
const darkCharcoal = tokens.textPrimary;

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: ${offWhite};
  width: 100%;
  margin: 0;
  padding: 0;
  position: relative;
  overflow-x: hidden;
  scroll-behavior: smooth;

  &::before, &::after {
    content: '';
    position: fixed;
    border-radius: 50%;
    filter: blur(140px);
    z-index: -1;
    opacity: 0.08;
    pointer-events: none;
  }
  &::before {
    width: 500px;
    height: 500px;
    background: ${primaryRose};
    top: 5%;
    left: -200px;
  }
  &::after {
    width: 400px;
    height: 400px;
    background: ${accentViolet};
    bottom: 20%;
    right: -150px;
  }
`;

const HeaderWrapper = styled.header`
  background: transparent !important;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: ${props => props.$isMobile ? 'fixed' : 'absolute'};
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 140px;
  width: 100%;

  @media (max-width: 768px) {
    height: 96px;
    padding-right: 0;
    backdrop-filter: ${props => props.$isScrolled ? 'blur(10px)' : 'none'};
    background: ${props => props.$isScrolled ? 'rgba(255, 255, 255, 0.8)' : 'transparent'} !important;
    box-shadow: ${props => props.$isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.05)' : 'none'};
  }
`;

const ContentContainer = styled.div`
  width: 100%;
  background: transparent;
  margin: 0;
  padding: 0;
  min-height: ${props => props.$hideHeader ? '100vh' : 'auto'};
  overflow-x: hidden;
  position: relative;
  box-sizing: border-box;
`;

const ContentWrapper = styled.main`
  background: transparent;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  position: relative;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 48px;
  text-decoration: none;

  @media (max-width: 768px) {
    margin-left: 24px;
  }
`;

const LogoImg = styled.img`
  height: 30px;
  width: auto;
  display: block;

  @media (max-width: 768px) {
    height: 26px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  background: transparent;
  margin-left: auto;
  margin-right: 32px;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: ${props => props.$isSignupPage ? '#ffffff' : tokens.textPrimary};
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 8px 16px;
  border-radius: ${tokens.radiusBtn};
  background: transparent;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 50%;
    width: 0;
    height: 2px;
    background: ${tokens.primary};
    transition: all 0.2s ease;
    transform: translateX(-50%);
    border-radius: 1px;
  }

  &:hover {
    color: ${props => props.$isSignupPage ? '#ffffff' : tokens.primary};

    &::after {
      width: 60%;
    }
  }
`;

const HashNavLink = styled.a`
  color: ${props => props.$isSignupPage ? '#ffffff' : tokens.textPrimary};
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 8px 16px;
  border-radius: ${tokens.radiusBtn};
  background: transparent;
  position: relative;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 50%;
    width: 0;
    height: 2px;
    background: ${tokens.primary};
    transition: all 0.2s ease;
    transform: translateX(-50%);
    border-radius: 1px;
  }

  &:hover {
    color: ${props => props.$isSignupPage ? '#ffffff' : tokens.primary};

    &::after {
      width: 60%;
    }
  }
`;

const AuthButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: transparent;
  margin-right: 48px;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const LoginButton = styled(Link)`
  color: ${props => props.$isSignupPage ? '#ffffff' : tokens.textPrimary};
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: ${tokens.radiusBtn};
  transition: all 0.15s ease;
  border: 1px solid ${props => props.$isSignupPage ? 'rgba(255, 255, 255, 0.3)' : tokens.border};
  background: transparent;

  &:hover {
    border-color: ${props => props.$isSignupPage ? 'rgba(255, 255, 255, 0.5)' : tokens.borderHover};
    color: ${props => props.$isSignupPage ? '#ffffff' : tokens.textPrimary};
    background: ${props => props.$isSignupPage ? 'rgba(255, 255, 255, 0.1)' : tokens.subtle};
  }
`;

const SignupButton = styled(Link)`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: ${tokens.radiusBtn};
  background: ${tokens.action};
  transition: all 0.15s ease;
  display: block;
  text-align: center;

  &:hover {
    background: ${tokens.actionHover};
    color: #ffffff;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MobileCTAButton = styled(Link)`
  display: none;
  background: ${tokens.action};
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: ${tokens.radiusBtn};
  transition: all 0.15s ease;
  margin-right: 16px;
  white-space: nowrap;

  &:hover {
    background: ${tokens.actionHover};
    color: #ffffff;
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenuButton = styled(Button)`
  display: none;
  background: transparent !important;
  border: none;
  color: #1e293b;
  font-size: 24px;
  padding: 8px;
  height: auto;
  margin-right: 24px;

  @media (max-width: 1024px) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  z-index: 1001;
  padding: 24px;
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    padding: 24px 24px 40px 24px;
    min-height: 100vh;
    height: 100vh;
    overflow-y: scroll;
    justify-content: space-between;
  }
`;

const MobileMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  background: transparent;
`;

const MobileNavLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
  background: transparent;
`;

const MobileNavLink = styled(Link)`
  color: ${tokens.textPrimary};
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  padding: 14px 0;
  border-bottom: 1px solid ${tokens.border};
  background: transparent;

  &:hover {
    color: ${tokens.primary};
  }
`;

const MobileHashNavLink = styled.a`
  color: ${tokens.textPrimary};
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  padding: 14px 0;
  border-bottom: 1px solid ${tokens.border};
  background: transparent;
  cursor: pointer;
  display: block;

  &:hover {
    color: ${tokens.primary};
  }
`;

const MobileAuthButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: auto;
  padding-top: 24px;
  background: transparent;
  min-height: 120px;
`;

const ScrollToTopButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${tokens.action};
  border: none;
  color: white;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: ${props => props.$visible ? '1' : '0'};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transform: translateY(${props => props.$visible ? '0' : '20px'});
  transition: all 0.2s ease;
  box-shadow: ${tokens.shadowCard};
  z-index: 999;

  &:hover {
    background: ${tokens.actionHover};
    transform: translateY(-2px);
    box-shadow: ${tokens.shadowHover};
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
`;

const Footer = styled.footer`
  width: 100%;
  padding: 48px 24px 32px 24px;
  background: ${tokens.surface};
  color: ${darkCharcoal};
  text-align: center;
  border-top: 1px solid ${tokens.border};
  font-size: 14px;
  @media (max-width: 768px) {
    padding: 32px 16px 24px 16px;
  }
`;
const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    gap: 12px;
  }
`;
const FooterLink = styled.a`
  color: ${tokens.textSecondary};
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.15s;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  &:hover {
    color: ${tokens.primary};
    background: ${tokens.primaryLight};
  }
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 4px 6px;
  }
`;
const SocialIcon = styled.div`
  font-size: 20px;
  color: ${tokens.textSecondary};
  margin: 0 8px;
  cursor: pointer;
  transition: color 0.15s, transform 0.15s;
  display: inline-block;
  vertical-align: middle;
  @media (max-width: 768px) {
    font-size: 18px;
    margin: 0 6px;
  }
  &:hover {
    color: ${tokens.primary};
    transform: scale(1.1);
  }
`;

export default function LandingPageLayoutNext({ hideHeader, hideFooter, children, canonicalUrl: customCanonicalUrl }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const pathname = usePathname() || '/';
  const router = useRouter();

  const isSignupPage = pathname === '/register';
  const isLoginPage = pathname === '/login';
  const isTransparentHeader = isSignupPage || isLoginPage;

  const canonicalUrl =
    customCanonicalUrl || `https://newcollab.co${pathname === '/' ? '' : pathname}`;

  // Inject canonical link tag for SEO
  useEffect(() => {
    if (typeof window === 'undefined' || !document.head) return;

    const existing = document.querySelectorAll('link[rel="canonical"]');
    existing.forEach((el) => {
      try { el.remove(); } catch (_) {}
    });

    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonicalUrl;
    document.head.appendChild(link);

    return () => {
      try { link.remove(); } catch (_) {}
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
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavClick = (hash) => {
    if (pathname !== '/') {
      router.push('/');
      setTimeout(() => {
        window.location.hash = hash;
      }, 100);
    } else {
      window.location.hash = hash;
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCookieSettings = (e) => {
    if (e) e.preventDefault();
    setShowCookieSettings(true);
  };

  return (
    <LayoutWrapper>
      <GlobalStyle />
      {!hideHeader && (
        <HeaderWrapper $isMobile={isMobile} $isScrolled={isScrolled}>
          <Link href="/" prefetch={false} style={{ textDecoration: 'none' }}>
            <LogoContainer>
              <LogoImg src="/newcollab-logo-dark.png" alt="newcollab" />
            </LogoContainer>
          </Link>
          <NavLinks>
            <HashNavLink $isSignupPage={isTransparentHeader} onClick={() => handleNavClick('features')}>Features</HashNavLink>
            <NavLink href="/directory" prefetch={false} $isSignupPage={isTransparentHeader}>Brands</NavLink>
            <HashNavLink $isSignupPage={isTransparentHeader} onClick={() => handleNavClick('how-it-works')}>How It Works</HashNavLink>
            <HashNavLink $isSignupPage={isTransparentHeader} onClick={() => handleNavClick('pricing')}>Pricing</HashNavLink>
            <NavLink href="/brands/pr-packages" prefetch={false} $isSignupPage={isTransparentHeader}>For Brands</NavLink>
            <NavLink href="/about" prefetch={false} $isSignupPage={isTransparentHeader}>About</NavLink>
          </NavLinks>
          <AuthButtons>
            <LoginButton href="/login" prefetch={false} $isSignupPage={isTransparentHeader}>Log in</LoginButton>
            <SignupButton href="/register/creator" prefetch={false}>Sign up</SignupButton>
          </AuthButtons>
          <MobileCTAButton href="/register/creator" prefetch={false}>
            Sign up free
          </MobileCTAButton>
          <MobileMenuButton
            type="text"
            icon={mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </HeaderWrapper>
      )}
      <ContentContainer $hideHeader={hideHeader}>
        <ContentWrapper>
          {children}
        </ContentWrapper>
      </ContentContainer>
      <ScrollToTopButton
        $visible={showScrollTop}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ArrowUpOutlined />
      </ScrollToTopButton>
      <MobileMenu $isOpen={mobileMenuOpen}>
        <MobileMenuHeader>
          <Link href="/" prefetch={false} onClick={closeMobileMenu} style={{ textDecoration: 'none' }}>
            <LogoContainer style={{ marginLeft: 0 }}>
              <LogoImg src="/newcollab-logo-dark.png" alt="newcollab" />
            </LogoContainer>
          </Link>
          <MobileMenuButton
            type="text"
            icon={<CloseOutlined />}
            onClick={closeMobileMenu}
          />
        </MobileMenuHeader>
        <MobileNavLinks>
          <MobileHashNavLink onClick={() => { closeMobileMenu(); handleNavClick('features'); }}>
            Features
          </MobileHashNavLink>
          <MobileNavLink href="/directory" prefetch={false} onClick={closeMobileMenu}>
            Brands
          </MobileNavLink>
          <MobileHashNavLink onClick={() => { closeMobileMenu(); handleNavClick('how-it-works'); }}>
            How It Works
          </MobileHashNavLink>
          <MobileHashNavLink onClick={() => { closeMobileMenu(); handleNavClick('pricing'); }}>
            Pricing
          </MobileHashNavLink>
          <MobileNavLink href="/brands/pr-packages" prefetch={false} onClick={closeMobileMenu}>
            For Brands
          </MobileNavLink>
          <MobileNavLink href="/about" prefetch={false} onClick={closeMobileMenu}>
            About
          </MobileNavLink>
          <MobileNavLink href="/contact" prefetch={false} onClick={closeMobileMenu}>
            Contact
          </MobileNavLink>
        </MobileNavLinks>
        <MobileAuthButtons>
          <LoginButton href="/login" prefetch={false} onClick={closeMobileMenu}>
            Log in
          </LoginButton>
          <SignupButton href="/register/creator" prefetch={false} onClick={closeMobileMenu}>
            Sign up
          </SignupButton>
        </MobileAuthButtons>
      </MobileMenu>
      {!hideFooter && (
        <Footer>
          <FooterLinks>
            <FooterLink href="/about">About us</FooterLink>
            <FooterLink href="/brands/pr-packages">For Brands</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/privacy-policy">Privacy</FooterLink>
            <FooterLink href="/terms-of-service">Terms</FooterLink>
            <FooterLink onClick={handleOpenCookieSettings}>Cookie Settings</FooterLink>
          </FooterLinks>
          <div style={{ marginBottom: '32px' }}>
            <SocialIcon>
              <a href="https://www.linkedin.com/company/newcollab/" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </a>
            </SocialIcon>
            <SocialIcon>
              <a href="https://x.com/newcollab_" target="_blank" rel="noopener noreferrer" aria-label="X">
                <FaXTwitter />
              </a>
            </SocialIcon>
            <SocialIcon>
              <a href="https://www.instagram.com/newcollab.co/" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
            </SocialIcon>
            <SocialIcon>
              <a href="https://www.tiktok.com/@newcollabco" target="_blank" rel="noopener noreferrer">
                <FaTiktok />
              </a>
            </SocialIcon>
          </div>
          <p style={{ opacity: 0.7 }}>© 2025 Newcollab. All rights reserved.</p>
        </Footer>
      )}
      <CookieSettings
        isVisible={showCookieSettings}
        onClose={() => setShowCookieSettings(false)}
      />
    </LayoutWrapper>
  );
}
