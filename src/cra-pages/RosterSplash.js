import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { creatorTokens as tokens } from '../theme/creatorTokens';

const PREVIEW_KEY = (token) => `nc.roster.preview.${token}`;

function mediaUrl(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';
  return value.replace(/^http:\/\//i, 'https://');
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function rosterTokenFromPath(pathname = typeof window !== 'undefined' ? window.location.pathname : '') {
  const match = String(pathname || '').match(/\/r\/([^/?#]+)/);
  if (!match) return '';
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function readRosterPreview(token) {
  if (!token || typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PREVIEW_KEY(token));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeRosterPreview(token, brand) {
  if (!token || !brand || typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(PREVIEW_KEY(token), JSON.stringify({
      name: brand.name || '',
      logo: brand.logo || '',
      cover_image: brand.cover_image || '',
    }));
  } catch {
    /* private mode */
  }
}

export default function RosterSplash({ brand }) {
  const token = rosterTokenFromPath();
  const preview = brand || readRosterPreview(token) || {};
  const name = String(preview.name || '').trim();
  const logo = mediaUrl(preview.logo);
  const cover = mediaUrl(preview.cover_image);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [logo]);

  useEffect(() => {
    if (!logo) return undefined;
    const img = new Image();
    img.src = logo;
    return undefined;
  }, [logo]);

  const showLogo = logo && !broken;
  const letters = initials(name);

  return (
    <Splash role="status" aria-live="polite" aria-busy="true">
      {cover ? <Wash $src={cover} /> : null}
      <Glow />
      <Center>
        <MarkWrap>
          <Orbit viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="54" />
          </Orbit>
          {showLogo ? (
            <MarkImg src={logo} alt={name ? `${name} logo` : ''} onError={() => setBroken(true)} />
          ) : letters ? (
            <MarkFallback>{letters}</MarkFallback>
          ) : (
            <MarkShimmer />
          )}
        </MarkWrap>
        {name ? <Name>{name}</Name> : <NameSpacer />}
        <Note>Opening your private PR roster</Note>
        <Dots aria-hidden="true"><i /><i /><i /></Dots>
      </Center>
    </Splash>
  );
}

const spin = keyframes`
  to { transform: rotate(360deg); }
`;
const rise = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(.98); }
  to { opacity: 1; transform: none; }
`;
const shimmer = keyframes`
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
`;
const blink = keyframes`
  0%, 80%, 100% { opacity: .22; transform: scale(.85); }
  40% { opacity: 1; transform: scale(1); }
`;

const Splash = styled.div`
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: ${tokens.paper};
  font-family: ${tokens.fontSans};
  color: ${tokens.ink};
`;
const Wash = styled.div`
  position: absolute;
  inset: -12%;
  background: url(${(p) => p.$src}) center / cover no-repeat;
  filter: blur(36px) saturate(1.05);
  opacity: .18;
  transform: scale(1.08);
  pointer-events: none;
`;
const Glow = styled.div`
  position: absolute;
  width: min(72vw, 420px);
  height: min(72vw, 420px);
  border-radius: 50%;
  background: radial-gradient(circle, ${tokens.cream} 0%, rgba(247,245,240,0) 70%);
  pointer-events: none;
`;
const Center = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px;
  animation: ${rise} .55s ease both;
`;
const MarkWrap = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  display: grid;
  place-items: center;
`;
const Orbit = styled.svg`
  position: absolute;
  inset: 0;
  animation: ${spin} 1.8s linear infinite;
  circle {
    fill: none;
    stroke: ${tokens.ink};
    stroke-opacity: .14;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-dasharray: 42 280;
  }
`;
const MarkImg = styled.img`
  width: 88px;
  height: 88px;
  object-fit: contain;
  background: ${tokens.white};
  border: 1px solid ${tokens.line};
  border-radius: 28px;
  padding: 12px;
  box-shadow: 0 18px 40px rgba(18, 20, 26, 0.08);
`;
const MarkFallback = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 28px;
  background: ${tokens.ink};
  color: ${tokens.white};
  display: grid;
  place-items: center;
  font-size: 26px;
  font-weight: 650;
  letter-spacing: .04em;
  box-shadow: 0 18px 40px rgba(18, 20, 26, 0.08);
`;
const MarkShimmer = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 28px;
  border: 1px solid ${tokens.line};
  background: linear-gradient(110deg, ${tokens.cream} 20%, ${tokens.white} 45%, ${tokens.cream} 70%);
  background-size: 220% 100%;
  animation: ${shimmer} 1.2s ease infinite;
`;
const Name = styled.div`
  margin-top: 22px;
  font-family: ${tokens.fontDisplay};
  font-size: 28px;
  line-height: 1.15;
  letter-spacing: -.03em;
  text-align: center;
  max-width: 18ch;
`;
const NameSpacer = styled.div`
  height: 22px;
  margin-top: 22px;
`;
const Note = styled.p`
  margin: 8px 0 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: .01em;
  color: ${tokens.muted};
`;
const Dots = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 18px;
  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${tokens.ink};
    animation: ${blink} 1.1s ease infinite;
  }
  i:nth-child(2) { animation-delay: .15s; }
  i:nth-child(3) { animation-delay: .3s; }
`;
