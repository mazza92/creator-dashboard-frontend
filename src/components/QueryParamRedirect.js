import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Component to handle query parameter redirects for SEO
 * Removes query parameters that shouldn't be indexed
 */
const QueryParamRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Remove query parameters that cause duplicate content issues
    const paramsToRemove = ['ref', 'search', 'utm_source', 'utm_medium', 'utm_campaign'];
    const searchParams = new URLSearchParams(location.search);
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
