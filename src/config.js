import axios from 'axios';

// Debug function to log the current environment
const logEnvironment = () => {
  console.log('Current hostname:', window.location.hostname);
  console.log('Current URL:', window.location.href);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('API URL from env:', process.env.REACT_APP_API_URL);
};

export const getApiUrl = () => {
  // Log environment details
  logEnvironment();
  
  // Use environment variable if set
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Default to localhost for development
  return 'http://localhost:5000';
};

// Override the environment variable if it's set to the old API URL
const apiUrl = process.env.REACT_APP_API_URL === 'https://api.newcollab.com' 
  ? getApiUrl() 
  : (process.env.REACT_APP_API_URL || getApiUrl());

const config = {
  apiUrl,
};

// Log the final API URL
console.log('Final API URL:', config.apiUrl);

export default config;

const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Ensure the URL starts with /api
    if (!config.url.startsWith('/api/')) {
      config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }
    
    // Log the request URL and headers
    console.log('Making request to:', config.baseURL + config.url);
    console.log('Request headers:', config.headers);
    
    // Add CORS headers
    config.withCredentials = true;
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - API might be down or CORS issue:', error);
      console.error('Request URL was:', error.config?.baseURL + error.config?.url);
      console.error('Request headers:', error.config?.headers);
      
      // Check if we're in production and the API is down
      if (window.location.hostname.includes('vercel.app')) {
        // Try to ping the API to check if it's up
        fetch(config.apiUrl + '/health', { 
          method: 'HEAD',
          mode: 'no-cors'
        }).catch(() => {
          console.error('API server appears to be down');
        });
      }
    }
    return Promise.reject(error);
  }
);

// Export both the config and the axios instance
export { axiosInstance };
export default config; 