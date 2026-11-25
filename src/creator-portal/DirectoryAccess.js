import React, { lazy, Suspense, useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../config/api';
import { UserContext } from '../contexts/UserContext';
import Logo from '../components/Logo';
import LoadingSpinner from '../components/LoadingSpinner';
import UpgradeModal from './UpgradeModal';
import { DIRECTORY_PATH } from '../utils/creatorApproval';
import { DIRECTORY_OFFER, directoryUnlockCounter } from '../config/proOffer';
import { creatorTokens as t } from '../theme/creatorTokens';

// The brand directory itself (search, cards, unlock + pitch modal), reused in its directory mode.
const UnifiedBrandDirectory = lazy(() => import('../cra-pages/UnifiedBrandDirectory'));

export const DIRECTORY_STATUS_LINE =
  "You're not on the Newcollab creator network yet. You can still find brand contacts and pitch them yourself.";

// Directory access: what creators who are not approved (pending or rejected) get. Only the brand directory, contact
// unlocks and a pitch they send from their own email app. Free: 10 unlocks in total. Pro ($19/mo): 500 a month.
// Paying does not approve them, so nothing here talks about review, a waitlist or getting in.
export default function DirectoryAccess() {
  const { handleLogout, refreshUser } = useContext(UserContext) || {};
  const [balance, setBalance] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const checkoutCancelled = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('checkout') === 'cancelled';

  const loadBalance = useCallback(async () => {
    try {
      const { data } = await api.get('/api/pr-crm/unlocks/balance');
      if (data) setBalance(data);
    } catch (err) {
      console.error('Failed to load unlock balance:', err);
    }
  }, []);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  // Approved since this session loaded: refresh the user so App.js sends them to the full dashboard.
  useEffect(() => {
    let alive = true;
    api.get('/api/user/approval-status')
      .then(({ data }) => {
        if (!alive) return;
        if ((data?.status === 'approved' || data?.status === 'pro_approved') && refreshUser) refreshUser();
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [refreshUser]);

  const isPro = balance?.tier === 'pro';
  const counter = balance ? directoryUnlockCounter(balance) : '';
  const outOfFree = balance && !isPro && Number(balance.remaining) <= 0;

  return (
    <Page>
      <Header>
        <HeaderInner>
          <Logo href={DIRECTORY_PATH} />
          <HeaderRight>
            {counter && (
              <Counter $empty={outOfFree} data-testid="directory-counter">{counter}</Counter>
            )}
            {balance && !isPro && (
              <UpgradeButton type="button" onClick={() => setShowUpgrade(true)}>
                {DIRECTORY_OFFER.ctaShort}
              </UpgradeButton>
            )}
            {handleLogout && (
              <LogoutButton type="button" onClick={handleLogout}>Log out</LogoutButton>
            )}
          </HeaderRight>
        </HeaderInner>
      </Header>

      <Intro>
        <h1>Brand directory</h1>
        <p>{DIRECTORY_STATUS_LINE}</p>
        {checkoutCancelled && <Note>Checkout was cancelled. You were not charged.</Note>}
        {outOfFree && (
          <Note>
            You have used your free unlocks. Pro gives you {DIRECTORY_OFFER.headline.toLowerCase()} for $19/mo.
          </Note>
        )}
      </Intro>

      <Suspense fallback={<LoadingSpinner text="Loading brands..." minHeight="400px" />}>
        <UnifiedBrandDirectory directoryMode onBalanceChange={setBalance} />
      </Suspense>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        directory
        source="directory_header"
        unlockRemaining={balance?.remaining}
        currentCount={balance?.used ?? 0}
        limit={balance?.limit ?? 10}
      />
    </Page>
  );
}

const Page = styled.div`
  min-height: 100vh;
  background: ${t.paper};
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: ${t.white};
  border-bottom: 1px solid ${t.line};
`;

const HeaderInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const Counter = styled.span`
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: ${t.radiusPill};
  background: ${(p) => (p.$empty ? '#fdecea' : t.accentSoft)};
  color: ${(p) => (p.$empty ? '#b42318' : t.accentDeep)};
  border: 1px solid ${(p) => (p.$empty ? '#f5c2bd' : t.accentBorder)};
  white-space: nowrap;
`;

const UpgradeButton = styled.button`
  border: none;
  border-radius: ${t.radiusBtn};
  background: ${t.pro};
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  padding: 8px 14px;
  cursor: pointer;
  font-family: inherit;

  &:hover { background: ${t.proHover}; }
`;

const LogoutButton = styled.button`
  border: none;
  background: transparent;
  color: ${t.muted};
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  padding: 6px 4px;

  &:hover { color: ${t.ink}; }
`;

const Intro = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px 0;

  h1 {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: ${t.ink};
    margin: 0 0 6px;
  }

  p {
    font-size: 15px;
    color: ${t.muted};
    margin: 0;
    line-height: 1.5;
  }
`;

const Note = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: ${t.subtle};
  color: ${t.inkSoft};
  font-size: 14px;
`;
