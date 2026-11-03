import { useEffect, useState } from 'react';
import api from '../config/api';

// Server decides who gets the free week (same check as checkout). 0 = no trial.
// `invited`: they signed up through the free-week link (cold email), so Polly leads with the offer.
let cached = null;
let inflight = null;

export function fetchTrialOffer() {
  if (cached !== null) return Promise.resolve(cached);
  if (!inflight) {
    inflight = api.get('/api/subscription/trial-offer')
      .then((res) => {
        cached = { days: Number(res.data?.trial_days) || 0, invited: Boolean(res.data?.invited) };
        return cached;
      })
      .catch(() => ({ days: 0, invited: false }))
      .finally(() => { inflight = null; });
  }
  return inflight;
}

export function fetchTrialDays() {
  return fetchTrialOffer().then((o) => o.days);
}

export function useTrialOffer(enabled = true) {
  const [offer, setOffer] = useState(cached || null);
  useEffect(() => {
    if (!enabled) return undefined;
    let live = true;
    fetchTrialOffer().then((o) => { if (live) setOffer(o); });
    return () => { live = false; };
  }, [enabled]);
  return enabled ? offer : null;
}

export function useTrialDays(enabled = true) {
  const [days, setDays] = useState(cached ? cached.days : 0);
  useEffect(() => {
    if (!enabled) return undefined;
    let live = true;
    fetchTrialDays().then((d) => { if (live) setDays(d); });
    return () => { live = false; };
  }, [enabled]);
  return enabled ? days : 0;
}
