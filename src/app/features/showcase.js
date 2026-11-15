// Live teasers for the feature pages (latest paid gigs, today's UGC Pulse hooks, brands running UGC ads).
// Fetched on the server and revalidated hourly, so crawlers see fresh data; an outage renders the page without it.

const API = process.env.NC_SHOWCASE_URL || 'https://api.newcollab.co/api/public/showcase';

export async function fetchShowcase() {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(API, { next: { revalidate: 3600 }, signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      gigs: Array.isArray(data.gigs) ? data.gigs : [],
      hooks: Array.isArray(data.hooks) ? data.hooks : [],
      hot_brands: Array.isArray(data.hot_brands) ? data.hot_brands : [],
      counts: data.counts || {},
    };
  } catch {
    return null;
  }
}
