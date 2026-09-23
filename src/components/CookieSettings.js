'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { tokens } from '../theme/tokens';
import {
  OPEN_COOKIE_SETTINGS_EVENT,
  applyConsent,
  defaultDenied,
  defaultGranted,
  isConsentRegion,
  readConsent,
  saveAndApplyConsent,
} from '../lib/cookieConsent';

const Panel = styled(motion.div)`
  position: fixed;
  z-index: 10050;
  left: 16px;
  right: 16px;
  bottom: 16px;
  max-width: 560px;
  margin: 0 auto;
  background: ${tokens.surface};
  color: ${tokens.textPrimary};
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusCard};
  box-shadow: ${tokens.shadowHover};
  padding: 22px 22px 18px;
  font-family: ${tokens.fontFamily};
  pointer-events: auto;
  max-height: calc(100vh - 32px);
  overflow-y: auto;

  @media (min-width: 640px) {
    left: auto;
    right: 24px;
    bottom: 24px;
    margin: 0;
    width: 420px;
  }
`;

const Kicker = styled.p`
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${tokens.textMuted};
`;

const Heading = styled.h2`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: ${tokens.textPrimary};
`;

const Copy = styled.p`
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.55;
  color: ${tokens.textSecondary};

  a {
    color: ${tokens.textPrimary};
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Btn = styled.button`
  appearance: none;
  border: 1px solid ${props => (props.$solid ? tokens.action : tokens.borderHover)};
  background: ${props => (props.$solid ? tokens.action : tokens.surface)};
  color: ${props => (props.$solid ? '#fff' : tokens.textPrimary)};
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  border-radius: ${tokens.radiusBtn};
  padding: 11px 14px;
  min-height: 44px;
  flex: 1 1 120px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;

  &:hover {
    background: ${props => (props.$solid ? tokens.actionHover : tokens.subtle)};
  }

  &:focus-visible {
    outline: 2px solid ${tokens.action};
    outline-offset: 2px;
  }
`;

const Ghost = styled.button`
  appearance: none;
  border: 0;
  background: none;
  color: ${tokens.textSecondary};
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  padding: 8px 0 0;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: ${tokens.textPrimary};
  }
`;

const Category = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid ${tokens.border};
`;

const CatCopy = styled.div`
  min-width: 0;
`;

const CatTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${tokens.textPrimary};
`;

const CatDesc = styled.div`
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.45;
  color: ${tokens.textMuted};
`;

const Switch = styled.button`
  flex-shrink: 0;
  width: 44px;
  height: 26px;
  border-radius: 999px;
  border: 0;
  padding: 0;
  cursor: ${props => (props.disabled ? 'default' : 'pointer')};
  background: ${props => (props.$on ? tokens.action : '#D4D4D4')};
  position: relative;
  transition: background 0.15s;

  span {
    position: absolute;
    top: 3px;
    left: ${props => (props.$on ? '21px' : '3px')};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.15s;
    box-shadow: 0 1px 2px rgba(15, 15, 15, 0.2);
  }
`;

function Toggle({ on, disabled, onToggle, label }) {
  return (
    <Switch
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      $on={on}
      onClick={() => !disabled && onToggle(!on)}
    >
      <span />
    </Switch>
  );
}

export default function CookieSettings() {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [prefs, setPrefs] = useState(defaultDenied());

  useEffect(() => {
    const stored = readConsent();
    if (stored) {
      setPrefs(stored);
      applyConsent(stored);
      setOpen(false);
    } else if (isConsentRegion()) {
      applyConsent(defaultDenied());
      setOpen(true);
    } else {
      const granted = defaultGranted();
      saveAndApplyConsent(granted);
      setPrefs(granted);
      setOpen(false);
    }
    setReady(true);

    const onOpen = () => {
      const current = readConsent() || defaultDenied();
      setPrefs(current);
      setCustomize(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpen);
  }, []);

  const close = () => {
    setOpen(false);
    setCustomize(false);
  };

  const acceptAll = () => {
    setPrefs(saveAndApplyConsent(defaultGranted()));
    close();
  };

  const rejectAll = () => {
    setPrefs(saveAndApplyConsent(defaultDenied()));
    close();
  };

  const saveCustom = () => {
    setPrefs(saveAndApplyConsent({
      analytics: !!prefs.analytics,
      marketing: !!prefs.marketing,
    }));
    close();
  };

  return (
    <AnimatePresence>
      {ready && open && (
        <>
          <Panel
            role="dialog"
            aria-modal="false"
            aria-labelledby="nc-cookie-title"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <Kicker>Privacy</Kicker>
            <Heading id="nc-cookie-title">
              {customize ? 'Cookie settings' : 'Cookies on Newcollab'}
            </Heading>

            {!customize ? (
              <>
                <Copy>
                  We use analytics and ads cookies only if you say yes. Necessary
                  cookies keep you logged in. You can reject them — the product
                  still works.{' '}
                  <a href="/privacy-policy">Privacy policy</a>
                </Copy>
                <Row>
                  <Btn type="button" onClick={rejectAll}>Reject all</Btn>
                  <Btn type="button" $solid onClick={acceptAll}>Accept all</Btn>
                </Row>
                <Ghost type="button" onClick={() => setCustomize(true)}>
                  Customize
                </Ghost>
              </>
            ) : (
              <>
                <Copy>
                  Choose what we can store. Necessary cookies are always on.{' '}
                  <a href="/privacy-policy">Privacy policy</a>
                </Copy>

                <Category>
                  <CatCopy>
                    <CatTitle>Necessary</CatTitle>
                    <CatDesc>Login, security, and remembering this choice.</CatDesc>
                  </CatCopy>
                  <Toggle on disabled label="Necessary cookies" onToggle={() => {}} />
                </Category>

                <Category>
                  <CatCopy>
                    <CatTitle>Analytics</CatTitle>
                    <CatDesc>Google Analytics 4 and Microsoft Clarity (how the product is used).</CatDesc>
                  </CatCopy>
                  <Toggle
                    on={!!prefs.analytics}
                    label="Analytics cookies"
                    onToggle={(on) => setPrefs((p) => ({ ...p, analytics: on }))}
                  />
                </Category>

                <Category>
                  <CatCopy>
                    <CatTitle>Marketing</CatTitle>
                    <CatDesc>Meta Pixel and TikTok Pixel so we can measure our own ads.</CatDesc>
                  </CatCopy>
                  <Toggle
                    on={!!prefs.marketing}
                    label="Marketing cookies"
                    onToggle={(on) => setPrefs((p) => ({ ...p, marketing: on }))}
                  />
                </Category>

                <Row style={{ marginTop: 16 }}>
                  <Btn type="button" onClick={rejectAll}>Reject all</Btn>
                  <Btn type="button" $solid onClick={saveCustom}>Save choices</Btn>
                </Row>
                <Ghost type="button" onClick={acceptAll}>Accept all</Ghost>
              </>
            )}
          </Panel>
        </>
      )}
    </AnimatePresence>
  );
}
