'use client';

import { useState } from 'react';

const API_BASE =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://api.newcollab.co';

export default function BrandUnlockClient({ slug, hasDirectLink, hasEmail }) {
  const [unlocking, setUnlocking] = useState(false);
  const [unlocked, setUnlocked] = useState(null);
  const [error, setError] = useState(null);

  async function unlock() {
    setUnlocking(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/public/brands/${slug}/unlock`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.status === 401 || res.status === 403) {
        window.location.href = '/register/creator';
        return;
      }

      if (!res.ok) throw new Error(`Unlock failed (${res.status})`);

      const data = await res.json();
      setUnlocked(data);

      if (data?.applicationUrl) {
        window.open(data.applicationUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      setError('Failed to unlock. Please try again or create an account.');
    } finally {
      setUnlocking(false);
    }
  }

  return (
    <div>
      {(unlocked?.applicationUrl || hasDirectLink) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <span style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            🔗 Application Link
          </span>
          {unlocked?.applicationUrl ? (
            <a href={unlocked.applicationUrl} target="_blank" rel="noopener noreferrer"
              style={{ background: '#6366f1', color: 'white', padding: '6px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              Open
            </a>
          ) : (
            <button onClick={unlock} disabled={unlocking}
              style={{ background: '#6366f1', color: 'white', padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, opacity: unlocking ? 0.7 : 1 }}>
              {unlocking ? 'Unlocking...' : '🔒 Unlock'}
            </button>
          )}
        </div>
      )}

      {(unlocked?.contactEmail || hasEmail) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <span style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            ✉️ PR Email
          </span>
          {unlocked?.contactEmail ? (
            <a href={`mailto:${unlocked.contactEmail}`}
              style={{ background: '#6366f1', color: 'white', padding: '6px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              {unlocked.contactEmail}
            </a>
          ) : (
            <button onClick={unlock} disabled={unlocking}
              style={{ background: '#6366f1', color: 'white', padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, opacity: unlocking ? 0.7 : 1 }}>
              {unlocking ? 'Unlocking...' : '🔒 Unlock'}
            </button>
          )}
        </div>
      )}

      {error && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{error}</p>}
    </div>
  );
}
