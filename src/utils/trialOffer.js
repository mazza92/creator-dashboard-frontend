import { useEffect, useState } from 'react';
import api from '../config/api';

// Server decides who gets the free week (same check as checkout). 0 = no trial.
let cachedDays = null;
let inflight = null;

export function fetchTrialDays() {
  if (cachedDays !== null) return Promise.resolve(cachedDays);
  if (!inflight) {
    inflight = api.get('/api/subscription/trial-offer')
      .then((res) => {
        cachedDays = Number(res.data?.trial_days) || 0;
        return cachedDays;
      })
      .catch(() => 0)
      .finally(() => { inflight = null; });
  }
  return inflight;
}

export function useTrialDays(enabled = true) {
  const [days, setDays] = useState(cachedDays || 0);
  useEffect(() => {
    if (!enabled) return undefined;
    let live = true;
    fetchTrialDays().then((d) => { if (live) setDays(d); });
    return () => { live = false; };
  }, [enabled]);
  return enabled ? days : 0;
}
