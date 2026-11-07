import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { captureEmailCampaign, captureUpgradeDeeplink } from '../utils/upgradeDeeplink';
import { captureAttribution, sendAttributionOnce } from '../utils/signupAttribution';

export const SIGNUP_OFFERS = ['polly_trial7'];

/**
 * Component to handle query parameter redirects for SEO
 * Removes query parameters that shouldn't be indexed
 */
const QueryParamRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    captureUpgradeDeeplink(searchParams);
    captureEmailCampaign(searchParams);
    // Before the utm strip below: remember the first touch, send it once the visitor has signed up.
    captureAttribution(searchParams, location.pathname);
    import('../utils/api')
      .then(({ apiClient }) => sendAttributionOnce((url, body) => apiClient.post(url, body)))
      .catch(() => {});
    const promo = searchParams.get('promo');
    if (promo && /^[a-z0-9]{4,16}$/i.test(promo)) {
      try { localStorage.setItem('nc_promo', promo.toLowerCase()); } catch { /* storage blocked */ }
    }
    // Signup offers (?ref=polly_trial7 from the creator cold email) must outlive the ref strip below,
    // email verification and Google sign-in, so signup and Polly can still read them.
    const ref = searchParams.get('ref');
    if (ref && SIGNUP_OFFERS.includes(ref)) {
      try { localStorage.setItem('nc_offer', ref); } catch { /* storage blocked */ }
    }
    // Leave email upgrade deeplinks intact until the destination page opens the modal.
    if (searchParams.get('upgrade')) {
      return;
    }

    // Strip tracking params only. `search` is a real directory filter
    // (blog brand links use /directory?search=ColourPop) and must persist.
    const paramsToRemove = ['ref', 'utm_source', 'utm_medium', 'utm_campaign'];
    let shouldRedirect = false;

    // Check if any parameters need to be removed
    paramsToRemove.forEach(param => {
      if (searchParams.has(param)) {
        searchParams.delete(param);
        shouldRedirect = true;
      }
    });

    // Only redirect if we removed parameters and we're not already on the clean URL
    if (shouldRedirect && searchParams.toString() !== location.search.substring(1)) {
      const cleanPath = location.pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      navigate(cleanPath, { replace: true });
    }
  }, [location, navigate]);

  return null;
};

export default QueryParamRedirect;
