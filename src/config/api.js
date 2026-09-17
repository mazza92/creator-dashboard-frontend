import axios from 'axios';

// Default to direct API domain in production to match existing backend setup.
// In development, use the CRA proxy (configured in package.json) to avoid cross-origin cookie issues.
// Ensure we never use localhost in production (browser security blocks it)
const isProductionHost = () => {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'newcollab.co' || h === 'www.newcollab.co' || h === 'app.newcollab.co';
};

const isLocalDashboard = () => (
  typeof window !== 'undefined' && !isProductionHost()
);

const stripApiSuffix = (url) => String(url || '').replace(/\/api\/?$/, '');

const getApiUrl = () => {
  if (isProductionHost()) {
    return 'https://api.newcollab.co';
  }

  // Any local/dev host talks to local Flask via the CRA proxy — never production.
  if (isLocalDashboard()) {
    const envUrl = process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_BASE || '';
    if (/localhost|127\.0\.0\.1/.test(envUrl)) {
      return stripApiSuffix(envUrl);
    }
    return '';
  }

  const envUrl = process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && /localhost|127\.0\.0\.1/.test(envUrl)) {
    return stripApiSuffix(envUrl);
  }
  return process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co';
};

let cachedApiUrl = null;
const getRuntimeApiUrl = () => {
  if (isLocalDashboard() && cachedApiUrl && String(cachedApiUrl).includes('newcollab.co')) {
    cachedApiUrl = null;
  }
  if (cachedApiUrl === null) {
    cachedApiUrl = getApiUrl();
    if (cachedApiUrl == null) {
      cachedApiUrl = isLocalDashboard() ? '' : 'https://api.newcollab.co';
    }
    console.log('🌐 API_URL resolved to:', cachedApiUrl === '' ? '(CRA proxy → :5000)' : cachedApiUrl, {
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
      nodeEnv: process.env.NODE_ENV,
      reactAppUrl: process.env.REACT_APP_API_URL,
    });
  }
  return cachedApiUrl;
};

const axiosBaseURL = () => {
  if (isLocalDashboard()) {
    const url = getRuntimeApiUrl();
    if (url && String(url).includes('newcollab.co')) return '';
    return url == null ? '' : url;
  }
  const url = getRuntimeApiUrl();
  return url == null ? 'https://api.newcollab.co' : url;
};

const API_URL = axiosBaseURL();

const api = axios.create({
    baseURL: axiosBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        // Ensure baseURL is never undefined at request time
        if (isLocalDashboard()) {
            config.baseURL = axiosBaseURL();
        } else if (config.baseURL == null || config.baseURL === 'undefined') {
            config.baseURL = axiosBaseURL();
            console.warn('⚠️ BaseURL was undefined, set to:', config.baseURL);
        }
        
        // Only send CSRF token for endpoints that require JWT authentication
        // These are typically /api/* endpoints that use @jwt_required()
        const reqUrl = config.url || '';
        const requiresCSRF = (reqUrl.startsWith('/api/') || reqUrl.includes('/api/')) &&
                             !reqUrl.includes('/login') &&
                             !reqUrl.includes('/register') &&
                             !reqUrl.includes('/forgot-password') &&
                             !reqUrl.includes('/reset-password') &&
                             !reqUrl.includes('/api/public/');

        if (!requiresCSRF && config.headers) {
            delete config.headers['X-CSRF-Token'];
            delete config.headers['x-csrf-token'];
            if (typeof config.headers.delete === 'function') {
                config.headers.delete('X-CSRF-Token');
                config.headers.delete('x-csrf-token');
            }
        }
        
        if (requiresCSRF) {
            // Try multiple methods to get CSRF token
            let csrfToken = null;
            
            // Method 1: Try localStorage first (faster, cached)
            csrfToken = localStorage.getItem('csrf_token');
            
            // Method 2: Read from cookies (refresh cache if found)
            if (!csrfToken) {
                const cookies = document.cookie.split('; ');
                const csrfCookie = cookies.find(row => row.startsWith('csrf_access_token='));
                if (csrfCookie) {
                    csrfToken = csrfCookie.split('=')[1];
                    // Cache it for next time
                    if (csrfToken) {
                        localStorage.setItem('csrf_token', csrfToken);
                    }
                }
            } else {
                // Token found in localStorage, but also refresh from cookies to ensure it's current
                const cookies = document.cookie.split('; ');
                const csrfCookie = cookies.find(row => row.startsWith('csrf_access_token='));
                if (csrfCookie) {
                    const freshToken = csrfCookie.split('=')[1];
                    if (freshToken && freshToken !== csrfToken) {
                        csrfToken = freshToken;
                        localStorage.setItem('csrf_token', freshToken);
                    }
                }
            }
            
            // Method 3: Try to extract from any existing header
            if (!csrfToken && config.headers['X-CSRF-Token']) {
                csrfToken = config.headers['X-CSRF-Token'];
            }
            
            // Add CSRF token to headers if found
            if (csrfToken) {
                config.headers['X-CSRF-Token'] = csrfToken;
                console.log('✅ CSRF token added to request:', csrfToken.substring(0, 10) + '...');
            } else {
                console.warn('⚠️ CSRF token not found for request to:', config.url);
                console.warn('Cookies:', document.cookie);
            }
        }
        
        console.log('🚀 Making request to:', config.url, 'Headers:', config.headers, 'Credentials:', config.withCredentials);
        return config;
    },
    (error) => {
        console.error('🔥 Request error:', error);
        return Promise.reject(error);
    }
);

// Function to read CSRF token from cookies and cache it
const readCSRFTokenFromCookies = () => {
    try {
        const cookies = document.cookie.split('; ');
        const csrfCookie = cookies.find(row => row.startsWith('csrf_access_token='));
        if (csrfCookie) {
            const token = csrfCookie.split('=')[1];
            if (token) {
                localStorage.setItem('csrf_token', token);
                return token;
            }
        }
    } catch (e) {
        console.warn('Error reading CSRF token from cookies:', e);
    }
    return null;
};

// Try to read CSRF token on initialization
readCSRFTokenFromCookies();

api.interceptors.response.use(
    (response) => {
        // After any response, try to refresh CSRF token from cookies
        // This helps if the cookie was just set
        readCSRFTokenFromCookies();
        
        console.log('✅ Response received:', response.status, 'Data:', response.data);
        return response;
    },
    async (error) => {
        // Handle token expiration
        if (error.response?.status === 401 && error.response?.data?.token_expired) {
            console.warn('🔄 Token expired, attempting refresh...');
            
            // Get the current token from cookies
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('access_token_cookie='))
                ?.split('=')[1];
            
            if (token) {
                try {
                    // Try to refresh the token
                    // eslint-disable-next-line no-unused-vars
                    const refreshResponse = await api.post('/refresh-token', { token });
                    console.log('✅ Token refreshed successfully');
                    
                    // Retry the original request
                    const originalRequest = error.config;
                    return api(originalRequest);
                } catch (refreshError) {
                    console.error('🔥 Token refresh failed:', refreshError);
                    // Redirect to login
                    window.location.href = '/login';
                    return Promise.reject(error);
                }
            } else {
                // No token found, redirect to login
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }
        
        if (error.response?.status === 403) {
            console.warn('🔒 Unauthorized response:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
        } else {
            console.error('🔥 Response error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
        }
        return Promise.reject(error);
    }
);

export const apiClient = {
    get: (url, config = {}) => api.get(url, config),
    post: (url, data = {}, config = {}) => api.post(url, data, config),
    put: (url, data = {}, config = {}) => api.put(url, data, config),
    patch: (url, data = {}, config = {}) => api.patch(url, data, config),
    delete: (url, config = {}) => api.delete(url, config),
};

const SOCIAL_CDN_SUFFIXES = [
  'cdninstagram.com',
  'fbcdn.net',
  'fbsbx.com',
  'imginn.com',
  'tiktokcdn.com',
  'tiktokcdn-us.com',
  'tiktokcdn-eu.com',
  'tiktokcdn-i18n.com',
  'ttlivecdn.com',
  'ibyteimg.com',
  'muscdn.com',
  'byteoversea.com',
  'ibytedtos.com',
];

const isSocialCdnHost = (host) => {
  const h = (host || '').toLowerCase();
  return SOCIAL_CDN_SUFFIXES.some((suffix) => h === suffix || h.endsWith(`.${suffix}`));
};

/**
 * Rewrite Instagram/imginn/TikTok CDN image URLs through our backend proxy.
 * Those CDNs set Cross-Origin-Resource-Policy and break <img> embeds in the app.
 * Always prefer absolute https://api... URLs so app.newcollab.co never 404s the proxy.
 */
export const getProxiedMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  const base = getRuntimeApiUrl() || '';

  // Already a media-proxy URL (relative or absolute) — pin to API origin
  if (trimmed.includes('/api/media-proxy')) {
    try {
      if (trimmed.startsWith('/')) {
        return `${base}${trimmed}`;
      }
      const parsed = new URL(trimmed);
      if (parsed.pathname.includes('/api/media-proxy')) {
        return base
          ? `${base}${parsed.pathname}${parsed.search}`
          : parsed.toString();
      }
    } catch {
      if (trimmed.startsWith('/api/media-proxy')) {
        return `${base}${trimmed}`;
      }
    }
    return trimmed;
  }

  let host = '';
  try {
    host = new URL(trimmed).hostname.toLowerCase();
  } catch {
    return trimmed;
  }

  if (!isSocialCdnHost(host)) return trimmed;
  return `${base}/api/media-proxy?url=${encodeURIComponent(trimmed)}`;
};

export function getOAuthApiOrigin() {
  if (typeof window !== 'undefined' && !isProductionHost()) {
    const explicit = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || '';
    if (/localhost|127\.0\.0\.1/.test(explicit)) {
      return stripApiSuffix(explicit);
    }
    return window.location.origin;
  }
  return process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_URL || 'https://api.newcollab.co';
}

// Export both the constant (for build-time) and the runtime function
export { API_URL, getRuntimeApiUrl };
export default api;