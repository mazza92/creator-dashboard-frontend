'use client';

import { useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { tokens } from '../../../theme/tokens';
import { seoSignupHref, storageGet, storageSet, trackCtaClick, trackCtaView } from '../../../lib/seoConversion';

const DISMISS_KEY = 'nc_sticky_cta_dismissed';
const DISMISS_DAYS = 7;

function dismissedRecently() {
  const ts = Number(storageGet('localStorage', DISMISS_KEY) || 0);
  return ts > 0 && Date.now() - ts < DISMISS_DAYS * 86400000;
}

/**
 * Slim CTA that slides in after ~30% scroll: a bar pinned to the bottom on mobile, a slim
 * bar pinned to the top on desktop (the site header scrolls away there). Fixed position +
 * transform only, so it never shifts the layout. Dismissal is remembered for a week.
 * Hidden while an inline unlock / lead card is on screen.
 */
export default function StickyCtaBar({ ctx, text, button = 'Start free', location = 'sticky_bar', threshold = 0.3 }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [cardOnScreen, setCardOnScreen] = useState(false);

  useEffect(() => {
    setDismissed(dismissedRecently());
  }, []);

  useEffect(() => {
    if (dismissed) return undefined;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = Math.max(1, doc.scrollHeight - window.innerHeight);
        setVisible(window.scrollY / max >= threshold);
        // Step aside while an inline unlock / lead card is on screen so two CTAs never compete.
        const cards = document.querySelectorAll('.nc-unlock-card, .nc-weekly-card');
        setCardOnScreen(Array.from(cards).some((el) => {
          const r = el.getBoundingClientRect();
          return r.bottom > 0 && r.top < window.innerHeight;
        }));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [dismissed, threshold]);

  const shown = visible && !dismissed && !cardOnScreen;

  useEffect(() => {
    if (shown) trackCtaView({ location, page: ctx.page });
  }, [shown, location, ctx.page]);

  // Lift the layout's scroll-to-top button above the mobile bar while it shows.
  useEffect(() => {
    document.body.classList.toggle('nc-bottom-cta-on', shown);
    return () => document.body.classList.remove('nc-bottom-cta-on');
  }, [shown]);

  if (dismissed) return null;

  const dismiss = () => {
    storageSet('localStorage', DISMISS_KEY, String(Date.now()));
    trackCtaClick({ location: `${location}_dismiss`, page: ctx.page });
    setDismissed(true);
  };

  return (
    <>
    <LiftScrollTop />
    <Bar role="region" aria-label="Sign up" $shown={shown} aria-hidden={!shown}>
      <Inner>
        <Text>{text}</Text>
        <Cta
          href={seoSignupHref({ ...ctx, location })}
          tabIndex={shown ? 0 : -1}
          onClick={() => trackCtaClick({ location, page: ctx.page, brand: ctx.brand })}
        >
          {button}
        </Cta>
        <Close type="button" onClick={dismiss} aria-label="Dismiss" tabIndex={shown ? 0 : -1}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" focusable="false">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </Close>
      </Inner>
    </Bar>
    </>
  );
}

/** Lifts the layout's scroll-to-top button above a bottom CTA bar on mobile. */
export const LiftScrollTop = createGlobalStyle`
  @media (max-width: 768px) {
    body.nc-bottom-cta-on button[aria-label="Scroll to top"] { bottom: 92px; }
  }
`;

const Bar = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  z-index: 1001;
  font-family: ${tokens.fontFamily};
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(10px);
  transition: transform 0.25s ease, opacity 0.25s ease;
  opacity: ${(p) => (p.$shown ? 1 : 0)};
  pointer-events: ${(p) => (p.$shown ? 'auto' : 'none')};

  /* Desktop: slim bar at the top */
  top: 0;
  border-bottom: 1px solid ${tokens.border};
  box-shadow: 0 4px 20px rgba(15, 15, 15, 0.06);
  transform: translateY(${(p) => (p.$shown ? '0' : '-100%')});

  @media (max-width: 768px) {
    top: auto;
    bottom: 0;
    border-bottom: 0;
    border-top: 1px solid ${tokens.border};
    box-shadow: 0 -4px 20px rgba(15, 15, 15, 0.08);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    transform: translateY(${(p) => (p.$shown ? '0' : '100%')});
  }
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  min-height: 56px;
  padding: 8px 16px 8px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;

  @media (max-width: 768px) {
    min-height: 64px;
    padding: 10px 8px 10px 16px;
    gap: 10px;
    justify-content: space-between;
  }
`;

const Text = styled.p`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: ${tokens.textPrimary};
  line-height: 1.3;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 14px;
    flex: 1;
  }
`;

const Cta = styled.a`
  && {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 0 18px;
    border-radius: ${tokens.radiusBtn};
    background: ${tokens.primary};
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
  }
  &&:hover {
    background: ${tokens.primaryHover};
    color: #fff;
  }
  &:focus-visible {
    outline: 3px solid ${tokens.primaryBorder};
    outline-offset: 2px;
  }
`;

const Close = styled.button`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: ${tokens.radiusBtn};
  background: transparent;
  color: ${tokens.textMuted};
  cursor: pointer;

  &:hover {
    background: ${tokens.subtle};
    color: ${tokens.textPrimary};
  }
  &:focus-visible {
    outline: 3px solid ${tokens.primaryBorder};
    outline-offset: 1px;
  }
`;
