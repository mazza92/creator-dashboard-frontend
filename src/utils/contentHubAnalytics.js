export function trackContentHubEvent(eventName, props = {}) {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'content_hub',
      ...props,
    });
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...props });
}
