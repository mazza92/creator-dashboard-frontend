'use client';

import { useState, useEffect } from 'react';

const API_BASE =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://api.newcollab.co';

export default function BrandUnlockClient({ slug, brandName, brandId, hasDirectLink, hasEmail }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState(null);
  const [pitchesLeft, setPitchesLeft] = useState(3);
  const [isLoggedIn, setIsLoggedIn] = useState(null);

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
          const sent = data.pitches_sent_this_week || 0;
          setPitchesLeft(Math.max(0, 3 - sent));
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

  // Save brand and redirect to pitch
  async function handlePitchBrand() {
    if (!isLoggedIn) {
      // Redirect to signup with return URL
      window.location.href = `/register/creator?redirect=/creator/dashboard/pr-brands&brand=${slug}`;
      return;
    }

    setSaving(true);
    try {
      // Save to pipeline first
      await fetch(`${API_BASE}/api/pr-crm/pipeline/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_id: brandId || slug }),
      });

      // Redirect to dashboard where they can pitch
      window.location.href = `/creator/dashboard/pr-pipeline`;
    } catch (error) {
      console.error('Error:', error);
      // Still redirect even if save fails
      window.location.href = `/creator/dashboard/pr-brands`;
    } finally {
      setSaving(false);
    }
  }

  // Save for later only
  async function handleSaveForLater() {
    if (!isLoggedIn) {
      window.location.href = `/register/creator?redirect=/creator/dashboard/pr-pipeline`;
      return;
    }

    setSaving(true);
    try {
      await fetch(`${API_BASE}/api/pr-crm/pipeline/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_id: brandId || slug }),
      });
      setSaved(true);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  }

  // Handle upgrade - direct to Stripe checkout
  async function handleUpgrade() {
    try {
      const res = await fetch(`${API_BASE}/api/subscription/create-checkout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'pro' }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.checkout_url;
      } else {
        console.error('Failed to create checkout');
        // Fallback to settings page
        window.location.href = '/creator/dashboard/settings';
      }
    } catch (error) {
      console.error('Error:', error);
      window.location.href = '/creator/dashboard/settings';
    }
  }

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
    pitchButton: {
      background: 'linear-gradient(135deg, #3B82F6, #EC4899)',
      color: 'white',
      padding: '14px 24px',
      borderRadius: '12px',
      border: 'none',
      cursor: saving ? 'not-allowed' : 'pointer',
      fontSize: '16px',
      fontWeight: 700,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      opacity: saving ? 0.7 : 1,
      transition: 'all 0.2s',
    },
    saveButton: {
      background: saved ? '#F0FDF4' : '#F9FAFB',
      color: saved ? '#15803D' : '#374151',
      padding: '12px 20px',
      borderRadius: '10px',
      border: saved ? '2px solid #BBF7D0' : '1px solid #E5E7EB',
      cursor: saving || saved ? 'not-allowed' : 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      opacity: saving ? 0.7 : 1,
    },
    pitchInfo: {
      background: isPro ? '#EFF6FF' : '#FEF3C7',
      border: isPro ? '1px solid #BFDBFE' : '1px solid #FDE68A',
      borderRadius: '10px',
      padding: '12px 16px',
      fontSize: '13px',
      color: isPro ? '#1E40AF' : '#92400E',
      textAlign: 'center',
      fontWeight: 500,
    },
    applicationLink: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      background: '#F0FDF4',
      border: '2px solid #BBF7D0',
      borderRadius: '12px',
    },
    linkButton: {
      background: '#10B981',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 600,
      textDecoration: 'none',
    },
  };

  return (
    <div style={styles.container}>
      {/* Main CTA: Pitch Brand */}
      <button
        onClick={handlePitchBrand}
        disabled={saving}
        style={styles.pitchButton}
        onMouseOver={(e) => !saving && (e.target.style.transform = 'translateY(-2px)')}
        onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
      >
        {saving ? (
          'Loading...'
        ) : isLoggedIn ? (
          <>
            <span style={{ fontSize: '18px' }}>📧</span>
            Pitch {brandName}
          </>
        ) : (
          <>
            <span style={{ fontSize: '18px' }}>✨</span>
            Sign up to Contact {brandName}
          </>
        )}
      </button>

      {/* Pitch limit info */}
      {isLoggedIn && (
        <div style={styles.pitchInfo}>
          {isPro ? (
            <>✨ Pro member - Unlimited brand pitches</>
          ) : pitchesLeft > 0 ? (
            <>{pitchesLeft} free pitch{pitchesLeft !== 1 ? 'es' : ''} left this month</>
          ) : (
            <>You've used your 3 free pitches this month. <span onClick={handleUpgrade} style={{ color: '#92400E', textDecoration: 'underline', cursor: 'pointer' }}>Upgrade to Pro</span></>
          )}
        </div>
      )}

      {/* Save for Later */}
      {isLoggedIn && (
        <button
          onClick={handleSaveForLater}
          disabled={saving || saved}
          style={styles.saveButton}
        >
          {saved ? (
            <>
              <span>✓</span> Saved to your list
            </>
          ) : (
            <>
              <span>🔖</span> Save for Later
            </>
          )}
        </button>
      )}

      {/* Application Form Link (if available) */}
      {hasDirectLink && (
        <div style={styles.applicationLink}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#15803D' }}>
              📋 Application Form Available
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
              Apply directly on brand's website
            </div>
          </div>
          {isLoggedIn ? (
            <a
              href={`https://api.newcollab.co/api/public/brands/${slug}/redirect`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.linkButton}
            >
              Apply Now →
            </a>
          ) : (
            <a
              href={`/register/creator?redirect=/brand/${slug}`}
              style={styles.linkButton}
            >
              Apply Now →
            </a>
          )}
        </div>
      )}

      {/* Value prop for non-logged in users */}
      {!isLoggedIn && (
        <div style={{
          background: '#F9FAFB',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
            Why sign up?
          </div>
          <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6' }}>
            Access verified PR contacts for 500+ brands. Join thousands of creators securing PR packages and paid collaborations.
          </div>
        </div>
      )}
    </div>
  );
}
