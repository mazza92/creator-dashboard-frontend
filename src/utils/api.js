import axios from 'axios';

const api = axios.create({
  // Use direct API domain in production to match existing backend setup.
  baseURL:
    process.env.REACT_APP_BACKEND_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co'),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('🟢 Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && error.response?.data?.msg === 'Token has expired') {
      // Remove any session info and force redirect to login
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
      return; // Prevent further promise chain
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  get: (url, config = {}) => api.get(url, { ...config, withCredentials: true }),
  post: (url, data = {}, config = {}) => api.post(url, data, { ...config, withCredentials: true }),
  put: (url, data = {}, config = {}) => api.put(url, data, { ...config, withCredentials: true }),
  delete: (url, config = {}) => api.delete(url, { ...config, withCredentials: true }),
};

export default api; 