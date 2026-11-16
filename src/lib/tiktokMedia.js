// Our stored copy of TikTok showcase videos (backend services/tiktok_media.py). TikTok's embedded player fails
// ("Player authentication failed"), so pages never load TikTok at view time: they ask for our MP4 + cover.
// Requests made in the same tick are batched into one call; ids still downloading are re-checked a few times.
import { useEffect, useState } from 'react';
import { getRuntimeApiUrl } from '../config/api';

const cache = new Map(); // id -> { video, cover, status }
const listeners = new Map(); // id -> Set(fn)
let pending = new Map(); // id -> handle
let timer = null;
const RETRY_MS = 45000;
const MAX_RETRIES = 6;
const retries = new Map();

function emit(id) {
  (listeners.get(id) || new Set()).forEach((fn) => fn(cache.get(id) || null));
}

async function flush() {
  timer = null;
  const batch = pending;
  pending = new Map();
  const ids = [...batch.keys()];
  for (let i = 0; i < ids.length; i += 24) {
    const chunk = ids.slice(i, i + 24);
    const qs = `ids=${chunk.join(',')}&handles=${chunk.map((id) => encodeURIComponent(batch.get(id) || '')).join(',')}`;
    try {
      const res = await fetch(`${getRuntimeApiUrl() || ''}/api/public/tiktok-media?${qs}`);
      const data = res.ok ? await res.json() : null;
      const media = (data && data.media) || {};
      chunk.forEach((id) => {
        const m = media[id] || null;
        if (m) cache.set(id, m);
        emit(id);
        if (!m || (!m.video && m.status !== 'failed')) scheduleRetry(id, batch.get(id));
      });
    } catch {
      chunk.forEach((id) => scheduleRetry(id, batch.get(id)));
    }
  }
}

function scheduleRetry(id, handle) {
  const n = (retries.get(id) || 0) + 1;
  if (n > MAX_RETRIES || typeof window === 'undefined') return;
  retries.set(id, n);
  setTimeout(() => request(id, handle, true), RETRY_MS);
}

function request(id, handle, force = false) {
  if (!id || typeof window === 'undefined') return;
  const known = cache.get(id);
  if (known && known.video && !force) return;
  pending.set(id, handle || '');
  if (!timer) timer = setTimeout(flush, 30);
}

/** { video, cover, status } for a TikTok id, or null while unknown. */
export function useTikTokMedia(id, handle) {
  const [media, setMedia] = useState(() => (id ? cache.get(String(id)) || null : null));
  useEffect(() => {
    if (!id) return undefined;
    const key = String(id);
    if (!listeners.has(key)) listeners.set(key, new Set());
    const set = listeners.get(key);
    set.add(setMedia);
    setMedia(cache.get(key) || null);
    request(key, handle);
    return () => set.delete(setMedia);
  }, [id, handle]);
  return media;
}

export function tiktokIdFromUrl(url) {
  const m = String(url || '').match(/\/video\/(\d{8,25})/);
  return m ? m[1] : null;
}

export function tiktokHandleFromUrl(url) {
  const m = String(url || '').match(/tiktok\.com\/@([A-Za-z0-9._]+)/);
  return m ? m[1] : '';
}
