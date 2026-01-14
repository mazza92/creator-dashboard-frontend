import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MenuOutlined, CloseOutlined, ArrowUpOutlined } from '@ant-design/icons';
import styled, { createGlobalStyle } from 'styled-components';
import { Helmet } from 'react-helmet-async';
import logo from '../assets/NEWCOLLAB-BRAND.png';
// eslint-disable-next-line no-unused-vars
import Header from '../components/Header';
import { FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';
import CookieSettings from '../components/CookieSettings';


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

  html, body, #root {
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

// Palette from Founding50.js
const primaryBlue = '#3B82F6';
const brightMagenta = '#EC4899';
const offWhite = '#F9FAFB';
const warmOrange = '#FF9F43';
const darkCharcoal = '#1e293b';

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
    filter: blur(120px);
    z-index: -1;
    opacity: 0.18;
    pointer-events: none;
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

  /* Extra color touch: orange radial gradient */
  .bg-orange {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    left: 60%;
    top: 60%;
    background: radial-gradient(circle, ${warmOrange} 0%, transparent 70%);
    opacity: 0.12;
    filter: blur(60px);
    z-index: -1;
    pointer-events: none;
  }
`;

const OrangeBlur = styled.div`
  position: fixed;
  width: 400px;
  height: 400px;
  left: 60%;
  top: 60%;
  background: radial-gradient(circle, ${warmOrange} 0%, transparent 70%);
  opacity: 0.12;
  filter: blur(60px);
  z-index: -1;
  pointer-events: none;
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
  max-width: ${props => props.$isLandingPage ? '1200px' : '100%'};
  margin: 0 auto;
  padding: ${props => props.$isLandingPage ? '0 24px' : '0'};
  box-sizing: border-box;
  position: relative;

  @media (max-width: 768px) {
    padding: ${props => props.$isLandingPage ? '0 16px' : '0'};
  }
`;

const Logo = styled.img`
  height: 120px;
  width: auto;
  max-width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: 48px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(38, 166, 154, 0.1));

  &:hover {
    transform: scale(1.02);
    filter: drop-shadow(0 4px 8px rgba(38, 166, 154, 0.2));
  }

  @media (max-width: 768px) {
    height: 90px;
    margin-left: 24px;
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
  color: ${props => props.$isSignupPage ? '#ffffff' : '#1e293b'};
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px 16px;
  border-radius: 8px;
  background: transparent;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #26A69A, #4CAF50, #26A69A);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(-50%);
  }

  &:hover {
    background: ${props => props.$isSignupPage ? 'rgba(255, 255, 255, 0.1)' : 'rgba(38, 166, 154, 0.05)'};
    transform: translateY(-1px);
    color: ${props => props.$isSignupPage ? '#ffffff' : '#26A69A'};

    &::after {
      width: 80%;
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
  color: ${props => props.$isSignupPage ? '#ffffff' : '#1e293b'};
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  padding: 10px 24px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid ${props => props.$isSignupPage ? 'rgba(255, 255, 255, 0.3)' : '#FF6B6B'};
  background: transparent;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${props => props.$isSignupPage ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 107, 107, 0.05)'};
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: ${props => props.$isSignupPage ? 'rgba(255, 255, 255, 0.5)' : '#FF8E53'};
    color: ${props => props.$isSignupPage ? '#ffffff' : '#FF6B6B'};
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.15);

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.1);
  }

  span {
    position: relative;
    z-index: 1;
  }
`;

const SignupButton = styled(Link)`
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  padding: 10px 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
  display: block;
  text-align: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #FF8E53, #FF6B6B);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
    color: #ffffff;

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 10px rgba(255, 107, 107, 0.3);
  }

  span {
    position: relative;
    z-index: 1;
  }
`;

const MobileCTAButton = styled(Link)`
  display: none;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  margin-right: 16px;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
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
  color: #1e293b;
  font-size: 20px;
  font-weight: 500;
  text-decoration: none;
  padding: 12px 0;
  border-bottom: 1px solid rgba(30, 41, 59, 0.1);
  background: transparent;

  &:hover {
    color: #26A69A;
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
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #26A69A, #2BBBAD);
  border: none;
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: ${props => props.$visible ? '1' : '0'};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transform: translateY(${props => props.$visible ? '0' : '20px'});
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(38, 166, 154, 0.3);
  z-index: 999;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(38, 166, 154, 0.4);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 10px rgba(38, 166, 154, 0.3);
  }

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
`;

const Footer = styled.footer`
  padding: 48px 24px 32px 24px;
  background: transparent;
  color: ${darkCharcoal};
  text-align: center;
  border-top: 1px solid rgba(60,60,60,0.06);
  box-shadow: 0 -8px 32px 0 rgba(60,60,60,0.03);
  font-size: 16px;
  @media (max-width: 768px) {
    padding: 32px 8px 24px 8px;
    font-size: 14px;
  }
`;
const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 28px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    gap: 16px;
  }
`;
const FooterLink = styled.a`
  color: ${primaryBlue};
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.2s, opacity 0.2s;
  opacity: 0.85;
  cursor: pointer;
  border-radius: 6px;
  padding: 4px 10px;
  &:hover {
    color: ${brightMagenta};
    background: rgba(236, 72, 153, 0.07);
    opacity: 1;
  }
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 4px 6px;
  }
`;
const SocialIcon = styled.div`
  font-size: 22px;
  color: ${primaryBlue};
  margin: 0 10px;
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
  display: inline-block;
  vertical-align: middle;
  @media (max-width: 768px) {
    font-size: 18px;
    margin: 0 6px;
  }
  &:hover {
    color: ${brightMagenta};
    transform: scale(1.15);
  }
`;

export default function LandingPageLayout({ hideHeader, children, canonicalUrl: customCanonicalUrl }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const isRegistrationPage = location.pathname.includes('/register');
  const isSignupPage = location.pathname === '/register';
  const isLoginPage = location.pathname === '/login';
  const isTransparentHeader = isSignupPage || isLoginPage;
  const isLandingPage = location.pathname === '/';

  // Generate canonical URL (stripping query parameters)
  // Use custom prop if provided, otherwise fallback to current path
  const canonicalUrl = customCanonicalUrl || `https://newcollab.co${location.pathname === '/' ? '' : location.pathname}`;

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

  // eslint-disable-next-line no-unused-vars
  const handleNavClick = (hash) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        window.location.hash = hash;
      }, 100);
    } else {
      window.location.hash = hash;
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    // Re-enable body scroll when menu closes
    document.body.style.overflow = 'auto';
  };

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
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
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <OrangeBlur />
      <GlobalStyle />
      {!hideHeader && (
        <HeaderWrapper $isMobile={isMobile} $isScrolled={isScrolled}>
          <Link to="/">
            <Logo src={logo} alt="NewCollab" />
          </Link>
          <NavLinks>
            <NavLink to="/marketplace" $isSignupPage={isTransparentHeader}>Marketplace</NavLink>
            <NavLink to="/directory" $isSignupPage={isTransparentHeader}>Directory</NavLink>
            <NavLink to="/about" $isSignupPage={isTransparentHeader}>About</NavLink>
            <NavLink to="/blog" $isSignupPage={isTransparentHeader}>Blog</NavLink>
            <NavLink to="/contact" $isSignupPage={isTransparentHeader}>Contact</NavLink>
          </NavLinks>
          <AuthButtons>
            <LoginButton to="/login" $isSignupPage={isTransparentHeader}>Log in</LoginButton>
            <SignupButton to="/register">Sign up</SignupButton>
          </AuthButtons>
          <MobileCTAButton to="/register/creator">
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
        <ContentWrapper $isLandingPage={isLandingPage}>
          {children ? children : <Outlet />}
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
          <Link to="/" onClick={closeMobileMenu}>
            <Logo src={logo} alt="NewCollab" />
          </Link>
          <MobileMenuButton
            type="text"
            icon={<CloseOutlined />}
            onClick={closeMobileMenu}
          />
        </MobileMenuHeader>
        <MobileNavLinks>
          <MobileNavLink to="/marketplace" onClick={closeMobileMenu}>
            Marketplace
          </MobileNavLink>
          <MobileNavLink to="/directory" onClick={closeMobileMenu}>
            Directory
          </MobileNavLink>
          <MobileNavLink to="/about" onClick={closeMobileMenu}>
            About
          </MobileNavLink>
          <MobileNavLink to="/blog" onClick={closeMobileMenu}>
            Blog
          </MobileNavLink>
          <MobileNavLink to="/contact" onClick={closeMobileMenu}>
            Contact
          </MobileNavLink>
        </MobileNavLinks>
        <MobileAuthButtons>
          <LoginButton to="/login" onClick={closeMobileMenu}>
            Log in
          </LoginButton>
          <SignupButton to="/register" onClick={closeMobileMenu}>
            Sign up
          </SignupButton>
        </MobileAuthButtons>
      </MobileMenu>
      <Footer>
        <FooterLinks>
          <FooterLink href="/about">About us</FooterLink>
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
            <a href="https://x.com/newcollab_" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
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
      <CookieSettings 
        isVisible={showCookieSettings}
        onClose={() => setShowCookieSettings(false)}
      />
    </LayoutWrapper>
  );
} 