import api from '../config/api';

const STORAGE_KEY = 'nc_admin_token';

const readStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.exp || Date.now() >= parsed.exp) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const getAdminToken = () => readStored()?.token || '';

export const hasAdminToken = () => Boolean(getAdminToken());

export const adminHeaders = () => {
  const token = getAdminToken();
  return token ? { 'X-Admin-Token': token } : {};
};

export const adminLogout = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable
  }
};

/** Exchanges the admin email + password for a short-lived signed admin token. Returns true on success. */
export const adminLogin = async (email, password) => {
  try {
    const res = await api.post('/api/admin/login', { email, password });
    const token = res.data?.token;
    if (!token) return false;
    const ttlMs = Math.max(60, Number(res.data?.expires_in) || 3600) * 1000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, exp: Date.now() + ttlMs - 60000 }));
    return true;
  } catch {
    return false;
  }
};
