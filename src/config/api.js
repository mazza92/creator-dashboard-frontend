import axios from 'axios';

// Default to direct API domain in production to match existing backend setup.
// In development, use the CRA proxy (configured in package.json) to avoid cross-origin cookie issues.
// Ensure we never use localhost in production (browser security blocks it)
const getApiUrl = () => {
  // Runtime check: if we're running in browser on production domain, never use localhost
  const isProductionDomain = typeof window !== 'undefined' &&
    (window.location.hostname === 'newcollab.co' ||
     window.location.hostname === 'www.newcollab.co' ||
     window.location.hostname === 'app.newcollab.co');

  const envUrl = process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (envUrl) {
    // If env var is set but points to localhost, override it in production
    if (envUrl.includes('localhost')) {
      if (isProductionDomain || process.env.NODE_ENV === 'production') {
        console.warn('⚠️ REACT_APP_API_URL points to localhost in production, using https://api.newcollab.co instead');
        return 'https://api.newcollab.co';
      }
      // In development with explicit localhost env var, use it directly
      return envUrl;
    }
    return envUrl;
  }

  // No env var set - use the production API for production domains
  if (isProductionDomain) {
    return 'https://api.newcollab.co';
  }

  // In development on localhost, use empty baseURL to leverage the CRA proxy (package.json proxy setting)
  // This makes requests go through localhost:3000 which proxies to localhost:5000, solving cookie issues
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return ''; // Empty baseURL = relative URLs = goes through CRA proxy
  }

  // Final fallback - default to production API if nothing else matches
  const fallbackUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co';
  
  // Safety check - never return undefined
  if (!fallbackUrl) {
    console.error('🔥 CRITICAL: API URL is undefined, forcing production API');
    return 'https://api.newcollab.co';
  }
  
  return fallbackUrl;
};

// Use a function that checks at runtime, not just build time
let cachedApiUrl = null;
const getRuntimeApiUrl = () => {
  if (cachedApiUrl === null) {
    cachedApiUrl = getApiUrl();
    // Ensure we never return undefined
    if (!cachedApiUrl && cachedApiUrl !== '') {
      console.error('⚠️ API URL is undefined, defaulting to production API');
      cachedApiUrl = 'https://api.newcollab.co';
    }
    console.log('🌐 API_URL resolved to:', cachedApiUrl, {
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
      nodeEnv: process.env.NODE_ENV,
      reactAppUrl: process.env.REACT_APP_API_URL,
      nextPublicUrl: process.env.NEXT_PUBLIC_API_URL
    });
  }
  return cachedApiUrl;
};

// For build-time compatibility, still export a constant, but it will be overridden at runtime
const API_URL = getApiUrl();

const api = axios.create({
    baseURL: getRuntimeApiUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        // Ensure baseURL is never undefined at request time
        if (!config.baseURL || config.baseURL === 'undefined') {
            const runtimeUrl = getRuntimeApiUrl();
            config.baseURL = runtimeUrl;
            console.warn('⚠️ BaseURL was undefined, set to:', runtimeUrl);
        }
        
        // Only send CSRF token for endpoints that require JWT authentication
        // These are typically /api/* endpoints that use @jwt_required()
        const requiresCSRF = config.url?.startsWith('/api/') && 
                             !config.url?.includes('/login') && 
                             !config.url?.includes('/register') &&
                             !config.url?.includes('/forgot-password') &&
                             !config.url?.includes('/reset-password');
        
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
    delete: (url, config = {}) => api.delete(url, config),
};

// Export both the constant (for build-time) and the runtime function
export { API_URL, getRuntimeApiUrl };
export default api;