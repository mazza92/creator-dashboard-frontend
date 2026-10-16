'use client';

import React from 'react';
import styled from 'styled-components';
import { FaLinkedin, FaInstagram } from 'react-icons/fa';
import { FaTiktok, FaXTwitter } from 'react-icons/fa6';
import { openCookieSettings } from '../../lib/cookieConsent';

const black = '#0F0F0F';
const white = '#FFFFFF';

const Footer = styled.footer`
  background: ${black};
  padding: 60px 0 32px;
  border-top: 1px solid rgba(255,255,255,0.1);
`;

const FooterInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
`;

const FooterTop = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
`;

const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 14px;

  img {
    height: 28px;
    width: auto;
    display: block;
  }
`;

const FooterSocials = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  a {
    color: rgba(255, 255, 255, 0.5);
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease, transform 0.2s ease;

    &:hover {
      color: ${white};
      transform: scale(1.08);
    }
  }
`;

const FooterDesc = styled.div`
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  line-height: 1.6;
`;

const FooterColTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  a {
    font-size: 14px;
    color: rgba(255,255,255,0.7);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${white};
    }
  }
`;

const FooterBottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,0.1);
  flex-wrap: wrap;
  gap: 16px;
`;

const FooterCopy = styled.div`
  font-size: 13px;
  color: rgba(255,255,255,0.4);
`;

const FooterBottomLinks = styled.div`
  display: flex;
  gap: 24px;

  a {
    font-size: 13px;
    color: rgba(255,255,255,0.4);
    text-decoration: none;

    &:hover {
      color: ${white};
    }
  }
`;

export default function LandingFooter() {
  return (
    <Footer>
      <FooterInner>
        <FooterTop>
          <div>
            <FooterLogo>
              <img src="/newcollab-logo.png" alt="newcollab" />
            </FooterLogo>
            <FooterDesc>The complete brand outreach tool for nano and micro creators.</FooterDesc>
          </div>
          <div>
            <FooterColTitle>Product</FooterColTitle>
            <FooterLinks>
              <a href="/directory">Brand Directory</a>
              <a href="/register/creator">AI Pitch Writer</a>
              <a href="/register/creator">PR Pipeline</a>
              <a href="/register/creator">For You Feed</a>
              <a href="/media-kit">Free UGC portfolio builder</a>
            </FooterLinks>
          </div>
          <div>
            <FooterColTitle>Company</FooterColTitle>
            <FooterLinks>
              <a href="/about">About</a>
              <a href="/brands/pr-packages">For Brands</a>
              <a href="/integrations/chatgpt">Newcollab for ChatGPT</a>
              <a href="/integrations/claude">Newcollab for Claude</a>
              <a href="/integrations/gemini">Newcollab for Gemini</a>
              <a href="/blog">Blog</a>
              <a href="/#pricing">Pricing</a>
              <a href="mailto:hello@newcollab.co">Contact</a>
            </FooterLinks>
          </div>
          <div>
            <FooterColTitle>Guides</FooterColTitle>
            <FooterLinks>
              <a href="/blog/companies-with-open-pr-application-forms-influencers-2025">Open PR Application Forms</a>
              <a href="/blog/list-of-companies-that-send-pr-packages-2026">Companies That Send PR</a>
              <a href="/blog/pr-emails-for-brands-2026">PR Email Contacts</a>
              <a href="/blog/pr-list-for-clothing-brands-micro-influencers-2025">Fashion PR List</a>
              <a href="/blog/gaming-tech-brands-that-sponsor-small-streamers-2026">Gaming Sponsors</a>
            </FooterLinks>
          </div>
        </FooterTop>
        <FooterBottom>
          <FooterCopy>© 2026 newcollab.co · All rights reserved</FooterCopy>
          <FooterSocials>
            <a href="https://www.linkedin.com/company/newcollab/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a href="https://x.com/newcollab_" target="_blank" rel="noopener noreferrer" aria-label="X">
              <FaXTwitter />
            </a>
            <a href="https://www.instagram.com/newcollab.co/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://www.tiktok.com/@newcollabco" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <FaTiktok />
            </a>
          </FooterSocials>
          <FooterBottomLinks>
            <a href="/privacy-policy">Privacy</a>
            <a href="/terms-of-service">Terms</a>
            <a href="#cookie-settings" onClick={(e) => { e.preventDefault(); openCookieSettings(); }}>Cookies</a>
          </FooterBottomLinks>
        </FooterBottom>
      </FooterInner>
    </Footer>
  );
}
