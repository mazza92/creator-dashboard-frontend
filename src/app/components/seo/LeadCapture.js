'use client';

import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { tokens } from '../../../theme/tokens';
import { countryLabel, guessCountry, storageGet, storageSet, trackCtaClick, trackCtaView } from '../../../lib/seoConversion';
import SignupButtons from './SignupButtons';

const EXIT_KEY = 'nc_exit_intent_shown';

function useCountry() {
  const [country, setCountry] = useState('');
  useEffect(() => setCountry(guessCountry()), []);
  return country;
}

const headline = (country) => `Get brands that ship PR to ${countryLabel(country)}, matched to your niche`;
const BODY =
  'Free account: a weekly shortlist of brands gifting creators where you live, each with its verified PR contact, plus a pitch Polly drafts for you.';

/** End-of-article lead card (server-rendered, so it never shifts the page). */
export function WeeklyBrandsCard({ ctx, signedIn }) {
  const country = useCountry();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        trackCtaView({ location: 'end_of_article', page: ctx.page });
        io.disconnect();
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [ctx.page]);

  return (
    <EndCard ref={ref} className="nc-weekly-card" aria-labelledby="nc-weekly-title">
      <Kicker>Weekly PR shortlist</Kicker>
      <Heading id="nc-weekly-title">{signedIn ? 'Your brand matches are waiting' : headline(country)}</Heading>
      <Text>{signedIn ? 'See this week’s brands that fit your niche and send a pitch with Polly.' : BODY}</Text>
      <SignupButtons ctx={{ ...ctx, country }} location="end_of_article" signedIn={signedIn} />
    </EndCard>
  );
}

/**
 * Desktop exit intent: once per session, after 8s on the page, when the pointer leaves
 * through the top of the window. Accessible dialog: focus moves in, Esc / backdrop / close
 * button dismiss it, focus returns to where it was.
 */
export function ExitIntentCard({ ctx, disabled }) {
  const country = useCountry();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);
  const lastFocus = useRef(null);

  useEffect(() => {
    if (disabled) return undefined;
    if (storageGet('sessionStorage', EXIT_KEY)) return undefined;
    if (!window.matchMedia || !window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches) return undefined;

    const armedAt = Date.now() + 8000;
    const onOut = (e) => {
      if (e.relatedTarget || e.clientY > 0 || Date.now() < armedAt) return;
      if (storageGet('sessionStorage', EXIT_KEY)) return;
      storageSet('sessionStorage', EXIT_KEY, '1');
      lastFocus.current = document.activeElement;
      setOpen(true);
      trackCtaView({ location: 'exit_intent', page: ctx.page });
    };
    document.addEventListener('mouseout', onOut);
    return () => document.removeEventListener('mouseout', onOut);
  }, [disabled, ctx.page]);

  useEffect(() => {
    if (!open) return undefined;
    const node = dialogRef.current;
    const first = node && node.querySelector('a, button');
    if (first) first.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab' && node) {
        const items = Array.from(node.querySelectorAll('a[href], button'));
        const i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          items[items.length - 1].focus();
        } else if (!e.shiftKey && i === items.length - 1) {
          e.preventDefault();
          items[0].focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    trackCtaClick({ location: 'exit_intent_dismiss', page: ctx.page });
    if (lastFocus.current && lastFocus.current.focus) lastFocus.current.focus();
  }

  if (!open) return null;

  return (
    <Backdrop onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <Dialog ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="nc-exit-title">
        <CloseBtn type="button" onClick={close} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" focusable="false">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </CloseBtn>
        <Kicker>Before you go</Kicker>
        <Heading id="nc-exit-title">{headline(country)}</Heading>
        <Text>{BODY}</Text>
        <SignupButtons ctx={{ ...ctx, country }} location="exit_intent" />
        <Small>Free plan · No follower minimum · 30 seconds to sign up</Small>
      </Dialog>
    </Backdrop>
  );
}

const EndCard = styled.section`
  max-width: 800px;
  margin: 48px auto 0;
  padding: 28px 28px 24px;
  border-radius: ${tokens.radiusCard};
  background: linear-gradient(135deg, ${tokens.primaryLight} 0%, ${tokens.accentLight} 100%);
  border: 1px solid ${tokens.primaryBorder};
  font-family: ${tokens.fontFamily};
  box-sizing: border-box;

  @media (max-width: 560px) {
    padding: 22px 16px 18px;
    border-radius: 16px;
  }
`;

const Kicker = styled.p`
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${tokens.primary};
`;

const Heading = styled.p`
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
  color: ${tokens.textPrimary};

  @media (max-width: 560px) {
    font-size: 20px;
  }
`;

const Text = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: ${tokens.textSecondary};
`;

const Small = styled.p`
  margin: 14px 0 0;
  font-size: 13px;
  color: ${tokens.textMuted};
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 15, 15, 0.45);
  animation: ncFade 0.18s ease;
  @keyframes ncFade { from { opacity: 0; } to { opacity: 1; } }
`;

const Dialog = styled.div`
  position: relative;
  width: 100%;
  max-width: 520px;
  padding: 32px 32px 26px;
  background: #fff;
  border-radius: ${tokens.radiusCard};
  box-shadow: 0 24px 64px rgba(15, 15, 15, 0.2);
  font-family: ${tokens.fontFamily};
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: ${tokens.radiusBtn};
  background: transparent;
  color: ${tokens.textMuted};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover { background: ${tokens.subtle}; color: ${tokens.textPrimary}; }
  &:focus-visible { outline: 3px solid ${tokens.primaryBorder}; outline-offset: 1px; }
`;
