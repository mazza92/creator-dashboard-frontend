// Brand workspace API: session-cookie auth through the shared axios client.
import api from '../config/api';

function unwrap(promise, key) {
  return promise
    .then(({ data }) => (key ? data[key] : data))
    .catch((err) => {
      throw new Error(err?.response?.data?.error || 'Something went wrong. Try again.');
    });
}

export const getWorkspace = () => unwrap(api.get('/api/brand-workspace/me'), 'workspace');
export const getScanHistory = () => unwrap(api.get('/api/brand-workspace/scans'), 'scans');
export const getSaved = () => unwrap(api.get('/api/brand-workspace/saved'), 'creators');
export const saveCreator = (creator, fromScan) =>
  unwrap(api.post('/api/brand-workspace/saved', { creator, from_scan: fromScan }), 'creators');
export const removeCreator = (ref) => unwrap(api.post('/api/brand-workspace/saved/remove', { ref }), 'creators');

export const startScan = (brand) =>
  unwrap(api.post('/api/public/brand-scan', { brand, ref: 'workspace' }, { timeout: 60000 }), 'scan');
export const pollScan = (scanId) => unwrap(api.get(`/api/public/brand-scan/${scanId}`, { timeout: 60000 }), 'scan');

export const startCheckout = (token) =>
  unwrap(api.post(`/api/brand-billing/r/${token}/checkout`, { source: 'workspace' }, { timeout: 30000 }), 'checkout_url');
export const openPortal = (token) =>
  unwrap(api.post(`/api/brand-billing/r/${token}/portal`, {}, { timeout: 30000 }), 'portal_url');
