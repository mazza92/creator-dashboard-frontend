import axios from 'axios';

// Default to direct API domain in production to match existing backend setup.
// In development, use localhost unless overridden by REACT_APP_API_URL.
// Ensure we never use localhost in production (browser security blocks it)
const getApiUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    // If env var is set but points to localhost in production, override it
    if (process.env.NODE_ENV === 'production' && envUrl.includes('localhost')) {
      console.warn('⚠️ REACT_APP_API_URL points to localhost in production, using https://api.newcollab.co instead');
      return 'https://api.newcollab.co';
    }
    return envUrl;
  }
  return process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co';
};

const API_URL = getApiUrl();

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
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

export { API_URL };
export default api;