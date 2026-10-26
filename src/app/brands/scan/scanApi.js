// Brand Scan API client. Public endpoints, no auth.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.newcollab.co';

export const SCAN_PATH = '/brands/scan';
export const POLL_MS = 3000;
export const POLL_TIMEOUT_MS = 4 * 60 * 1000;

export const EXAMPLE_BRANDS = ['Glow Recipe', 'Summer Fridays', 'Bubble Skincare', 'Olipop', 'Ghost Energy'];

export function scanUrl(brand, ref) {
  const q = new URLSearchParams({ b: brand });
  if (ref) q.set('ref', ref);
  return `${SCAN_PATH}?${q.toString()}`;
}

async function call(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Something went wrong. Try again.');
  }
  return data.scan;
}

export function startScan(brand, ref) {
  return call('/api/public/brand-scan', { method: 'POST', body: JSON.stringify({ brand, ref }) });
}

export function pollScan(scanId) {
  return call(`/api/public/brand-scan/${scanId}`);
}

export function trackScan(event, params = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', event, { event_category: 'brand_acquisition', ...params });
}
