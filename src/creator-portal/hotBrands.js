import { useEffect, useState } from 'react';
import api from '../config/api';

// 🔥 brands: found running ads with UGC creators by our Meta Ads Library crawl. One small, cached list of ids
// (GET /api/public/hot-brand-ids) lets every brand card in the app show the tag.

export { HOT_TIP } from './hotTip';

let cache = null;
let pending = null;
const listeners = new Set();

function load() {
  if (cache || pending) return pending;
  pending = Promise.resolve()
    .then(() => api.get('/api/public/hot-brand-ids'))
    .then(({ data }) => {
      cache = new Set((data?.ids || []).map(Number));
    })
    .catch(() => {
      cache = new Set();
    })
    .finally(() => {
      pending = null;
      listeners.forEach((fn) => fn(cache));
    });
  return pending;
}

export function useHotBrandIds() {
  const [ids, setIds] = useState(cache || new Set());
  useEffect(() => {
    if (cache) {
      setIds(cache);
      return undefined;
    }
    listeners.add(setIds);
    load();
    return () => listeners.delete(setIds);
  }, []);
  return ids;
}

// A brand object from any endpoint: its own flag (meta_ads / hot / source) or the shared id list.
export function isHotBrand(brand, ids) {
  if (!brand) return false;
  if (brand.meta_ads || brand.hot || brand.metaAds || brand.source === 'meta_ads_library') return true;
  const id = Number(brand.id ?? brand.brand_id);
  return Boolean(ids && Number.isFinite(id) && ids.has(id));
}

// Tests only.
export function __setHotIdsForTest(list) {
  cache = list ? new Set(list.map(Number)) : null;
}
