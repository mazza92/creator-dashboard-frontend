import api from '../config/api';

const CATEGORY = 'brand_pr_apply';

export function trackApplyEvent(event, props = {}) {
  if (!event || typeof window === 'undefined') return;

  const payload = {
    event,
    brand_id: props.brand_id ?? props.brandId ?? null,
    source: props.source || null,
    meta: props.meta || {},
  };

  if (window.gtag) {
    window.gtag('event', event, {
      event_category: CATEGORY,
      brand_id: payload.brand_id,
      source: payload.source,
      ...payload.meta,
    });
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, event_category: CATEGORY, ...payload });

  if (event !== 'apply_submitted') {
    api.post('/api/pr-crm/apply-events', payload).catch(() => {});
  }
}
