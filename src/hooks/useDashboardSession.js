import { useEffect, useState } from 'react';

function apiBase() {
  if (typeof window === 'undefined') return 'https://api.newcollab.co';
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:5000';
  return 'https://api.newcollab.co';
}

function roleFrom(data, fallback) {
  return data?.user_role || data?.role || fallback || '';
}

export default function useDashboardSession() {
  const [session, setSession] = useState({ status: 'out', role: '', username: '' });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const storedRole = localStorage.getItem('userRole') || '';
    const storedUser = localStorage.getItem('username') || '';
    const hasToken = Boolean(localStorage.getItem('token') || localStorage.getItem('authToken'));
    if (hasToken) {
      setSession({ status: 'in', role: storedRole || 'creator', username: storedUser });
    }

    let cancelled = false;
    fetch(`${apiBase()}/profile`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const role = roleFrom(data, storedRole);
        if (!role) return;
        setSession({
          status: 'in',
          role,
          username: data.username || storedUser || '',
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return session;
}
