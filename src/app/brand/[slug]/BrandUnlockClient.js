'use client';

import { useState, useEffect } from 'react';

const API_BASE =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://api.newcollab.co';

export default function BrandUnlockClient({ slug, brandName, hasDirectLink, hasEmail }) {
  const [unlocking, setUnlocking] = useState(false);
  const [unlocked, setUnlocked] = useState({});
  const [error, setError] = useState(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState(null); // null = loading, 'free'/'pro'/'elite' = loaded
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = checking, true/false = known

  const isPro = subscriptionTier === 'pro' || subscriptionTier === 'elite';

  // Fetch subscription status on mount
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/subscription/status`, {
          credentials: 'include',
        });
        if (res.status === 401) {
          setIsLoggedIn(false);
          setSubscriptionTier('free');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setSubscriptionTier(data.tier || 'free');
        } else {
          setIsLoggedIn(false);
          setSubscriptionTier('free');
        }
      } catch {
        setIsLoggedIn(false);
        setSubscriptionTier('free');
      }
    };
    fetchSubscriptionStatus();
  }, []);

  async function unlock(unlockType = 'all') {
    // If trying to unlock email without PRO, show upgrade prompt
    if (unlockType === 'contact' && !isPro) {
      setShowUpgradePrompt(true);
      return;
    }

    setUnlocking(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/public/brands/${slug}/unlock`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unlock_type: unlockType }),
      });

      if (res.status === 401) {
        window.location.href = '/register/creator';
        return;
      }

      if (res.status === 403) {
        setShowUpgradePrompt(true);
        return;
      }

      if (!res.ok) throw new Error(`Unlock failed (${res.status})`);

      const data = await res.json();
      setUnlocked(prev => ({ ...prev, ...data }));

      // Open application URL in new tab if just unlocked application
      if (data?.applicationUrl && unlockType !== 'contact') {
        window.open(data.applicationUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      setError('Failed to unlock. Please try again or create an account.');
    } finally {
      setUnlocking(false);
    }
  }

  const applicationUnlocked = unlocked?.applicationUrl;
  const emailUnlocked = unlocked?.contactEmail;

  // Loading state
  if (subscriptionTier === null) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        Loading...
      </div>
    );
  }

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    optionRow: (isUnlocked, isDisabled) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      background: isUnlocked ? '#f0fdf4' : (isDisabled ? '#f5f5f5' : '#fafafa'),
      border: `2px solid ${isUnlocked ? '#52c41a' : (isDisabled ? '#e5e5e5' : '#e5e7eb')}`,
      borderRadius: '12px',
      opacity: isDisabled ? 0.7 : 1,
    }),
    label: {
      fontWeight: 600,
      color: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
    },
    description: {
      fontSize: '12px',
      color: '#64748b',
      marginTop: '2px',
    },
    badge: (type) => ({
      background: type === 'free' ? '#52c41a' : type === 'pro' ? 'linear-gradient(135deg, #ffd700, #ffed4e)' : type === 'unlocked' ? '#52c41a' : '#e5e5e5',
      color: type === 'pro' ? '#333' : type === 'locked' ? '#666' : 'white',
      padding: '3px 10px',
      borderRadius: '10px',
      fontSize: '10px',
      fontWeight: 700,
      textTransform: 'uppercase',
    }),
    button: (isPrimary, isDisabled) => ({
      background: isPrimary ? '#6366f1' : '#f5f5f5',
      color: isPrimary ? 'white' : '#666',
      padding: '10px 20px',
      borderRadius: '10px',
      border: isPrimary ? 'none' : '1px solid #ddd',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      opacity: isDisabled ? 0.7 : 1,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    }),
    upgradePrompt: {
      background: 'linear-gradient(135deg, #667eea15, #764ba215)',
      border: '1px solid #667eea40',
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center',
      marginTop: '8px',
    },
    error: {
      color: '#ef4444',
      fontSize: '13px',
      marginTop: '8px',
    },
  };

  return (
    <div style={styles.container}>
      {/* Application Link Option */}
      {hasDirectLink && (
        <div style={styles.optionRow(applicationUnlocked, false)}>
          <div>
            <div style={styles.label}>
              🔗 Application Link
            </div>
            <div style={styles.description}>Direct link to brand's form</div>
          </div>
          {applicationUnlocked ? (
            <a
              href={unlocked.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...styles.button(true, false), width: 'auto', textDecoration: 'none' }}
            >
              Open Form
            </a>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={styles.badge('free')}>FREE</span>
              <button
                onClick={() => unlock('application')}
                disabled={unlocking}
                style={{ ...styles.button(true, unlocking), width: 'auto' }}
              >
                {unlocking ? '...' : 'Unlock'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* PR Email Option */}
      {hasEmail && (
        <div style={styles.optionRow(emailUnlocked, !isPro && !emailUnlocked)}>
          <div>
            <div style={styles.label}>
              ✉️ PR Manager Email
            </div>
            <div style={styles.description}>Pitch directly to decision maker</div>
          </div>
          {emailUnlocked ? (
            <a
              href={`mailto:${unlocked.contactEmail}`}
              style={{ ...styles.button(true, false), width: 'auto', textDecoration: 'none' }}
            >
              {unlocked.contactEmail}
            </a>
          ) : isPro ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={styles.badge('pro')}>PRO</span>
              <button
                onClick={() => unlock('contact')}
                disabled={unlocking}
                style={{ ...styles.button(true, unlocking), width: 'auto' }}
              >
                {unlocking ? '...' : 'Unlock'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={styles.badge('locked')}>🔒 PRO</span>
              <button
                onClick={() => setShowUpgradePrompt(true)}
                style={{ ...styles.button(false, false), width: 'auto' }}
              >
                Unlock
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upgrade Prompt */}
      {showUpgradePrompt && !isPro && (
        <div style={styles.upgradePrompt}>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>
            🔓 Unlock PR Contact Emails
          </div>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
            Get direct access to PR manager emails with Pro
          </div>
          <a
            href="/creator/dashboard/settings"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Upgrade to Pro - $12/mo
          </a>
        </div>
      )}

      {/* Both unlock button for PRO users */}
      {hasDirectLink && hasEmail && isPro && !applicationUnlocked && !emailUnlocked && (
        <button
          onClick={() => unlock('all')}
          disabled={unlocking}
          style={{ ...styles.button(false, unlocking), marginTop: '4px' }}
        >
          Unlock Both →
        </button>
      )}

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}
