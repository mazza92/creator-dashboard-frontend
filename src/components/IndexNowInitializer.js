import { useEffect } from 'react';
import { submitKeyPagesToIndexNow } from '../utils/indexNow';

/**
 * IndexNow Initializer Component
 * Submits key pages to IndexNow on app startup
 */
const IndexNowInitializer = () => {
  useEffect(() => {
    // Submit key pages to IndexNow on app startup
    const initializeIndexNow = async () => {
      try {
        // Check if we're in production or if API URL is configured
        // eslint-disable-next-line no-unused-vars
        const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');
        
        // Only run in production or if explicitly enabled
        if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_ENABLE_INDEXNOW) {
          console.log('ℹ️ IndexNow: Skipped in development mode');
          return;
        }

        console.log('🚀 IndexNow: Initializing key pages submission...');
        
        // Wrap in try-catch with better error handling
        const result = await submitKeyPagesToIndexNow();
        
        if (result) {
          console.log('✅ IndexNow: Key pages submitted successfully');
        } else {
          console.warn('⚠️ IndexNow: Failed to submit key pages (non-critical)');
        }
      } catch (error) {
        // Silently fail - this is non-critical functionality
        if (error.message && error.message.includes('Failed to fetch')) {
          console.warn('⚠️ IndexNow: Backend API not available, skipping submission');
        } else {
          console.warn('⚠️ IndexNow: Failed to submit key pages:', error.message || error);
        }
      }
    };

    // Run after a short delay to ensure app is fully loaded
    const timer = setTimeout(initializeIndexNow, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
};

export default IndexNowInitializer;
