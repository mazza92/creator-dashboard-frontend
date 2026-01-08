/**
 * IndexNow API Integration for Bing and other search engines
 * Based on: https://www.bing.com/indexnow/getstarted
 * 
 * Note: This calls our backend API which handles the IndexNow submission
 * to avoid CORS issues with the IndexNow API
 */

const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');

/**
 * Submit a single URL to IndexNow
 * @param {string} url - The URL to submit
 * @returns {Promise<boolean>} - Success status
 */
export const submitUrlToIndexNow = async (url) => {
  try {
    const response = await fetch(`${API_URL}/api/indexnow/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: [url]
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log(`✅ IndexNow: Successfully submitted ${url}`);
      return true;
    } else {
      console.error(`❌ IndexNow: Failed to submit ${url}`, data.message || response.statusText);
      return false;
    }
  } catch (error) {
    console.error(`❌ IndexNow: Error submitting ${url}`, error);
    return false;
  }
};

/**
 * Submit multiple URLs to IndexNow
 * @param {string[]} urls - Array of URLs to submit
 * @returns {Promise<boolean>} - Success status
 */
export const submitUrlsToIndexNow = async (urls) => {
  if (!urls || urls.length === 0) {
    console.log('⚠️ IndexNow: No URLs to submit');
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/api/indexnow/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: urls
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log(`✅ IndexNow: Successfully submitted ${urls.length} URLs`);
      return true;
    } else {
      console.error(`❌ IndexNow: Failed to submit URLs`, data.message || response.statusText);
      return false;
    }
  } catch (error) {
    console.error(`❌ IndexNow: Error submitting URLs`, error);
    return false;
  }
};

/**
 * Submit a creator profile URL to IndexNow
 * @param {string} username - Creator username
 * @returns {Promise<boolean>} - Success status
 */
export const submitCreatorProfileToIndexNow = async (username) => {
  try {
    const response = await fetch(`${API_URL}/api/indexnow/submit-creator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log(`✅ IndexNow: Successfully submitted creator profile ${username}`);
      return true;
    } else {
      console.error(`❌ IndexNow: Failed to submit creator profile ${username}`, data.message || response.statusText);
      return false;
    }
  } catch (error) {
    console.error(`❌ IndexNow: Error submitting creator profile ${username}`, error);
    return false;
  }
};

/**
 * Submit blog post URL to IndexNow
 * @param {string} slug - Blog post slug
 * @returns {Promise<boolean>} - Success status
 */
export const submitBlogPostToIndexNow = async (slug) => {
  const blogUrl = `https://newcollab.co/blog/${slug}`;
  return await submitUrlToIndexNow(blogUrl);
};

/**
 * Submit homepage and key pages to IndexNow
 * @returns {Promise<boolean>} - Success status
 */
export const submitKeyPagesToIndexNow = async () => {
  try {
    // Check if API URL is available (skip in dev if backend not running)
    if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_ENABLE_INDEXNOW) {
      console.log('ℹ️ IndexNow: Skipped in development mode');
      return false;
    }

    // Add timeout using AbortController for better browser compatibility
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${API_URL}/api/indexnow/submit-key-pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log(`✅ IndexNow: Successfully submitted key pages`);
      return true;
    } else {
      console.warn(`⚠️ IndexNow: Failed to submit key pages`, data.message || response.statusText);
      return false;
    }
  } catch (error) {
    // Handle network errors gracefully
    if (error.name === 'AbortError') {
      console.warn(`⚠️ IndexNow: Request timed out, backend may be unavailable`);
    } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.message?.includes('ERR_')) {
      console.warn(`⚠️ IndexNow: Backend API not available (${API_URL}), skipping submission`);
    } else {
      console.warn(`⚠️ IndexNow: Error submitting key pages`, error.message || error);
    }
    return false;
  }
};

/**
 * Submit updated content to IndexNow (for content updates)
 * @param {string} url - The updated URL
 * @returns {Promise<boolean>} - Success status
 */
export const submitContentUpdateToIndexNow = async (url) => {
  console.log(`🔄 IndexNow: Submitting content update for ${url}`);
  return await submitUrlToIndexNow(url);
};

/**
 * Submit all blog posts to IndexNow
 * @returns {Promise<boolean>} - Success status
 */
export const submitAllBlogPostsToIndexNow = async () => {
  try {
    const response = await fetch(`${API_URL}/api/indexnow/submit-blog-posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log(`✅ IndexNow: Successfully submitted ${data.count} blog posts`);
      return true;
    } else {
      console.error(`❌ IndexNow: Failed to submit blog posts`, data.message || response.statusText);
      return false;
    }
  } catch (error) {
    console.error(`❌ IndexNow: Error submitting blog posts`, error);
    return false;
  }
};

/**
 * Submit latest blog posts to IndexNow
 * @param {number} limit - Number of latest posts to submit (default: 5)
 * @returns {Promise<boolean>} - Success status
 */
export const submitLatestBlogPostsToIndexNow = async (limit = 5) => {
  try {
    const response = await fetch(`${API_URL}/api/indexnow/submit-new-posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: limit
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log(`✅ IndexNow: Successfully submitted ${data.count} latest blog posts`);
      return true;
    } else {
      console.error(`❌ IndexNow: Failed to submit latest blog posts`, data.message || response.statusText);
      return false;
    }
  } catch (error) {
    console.error(`❌ IndexNow: Error submitting latest blog posts`, error);
    return false;
  }
};

const indexNowUtils = {
  submitUrlToIndexNow,
  submitUrlsToIndexNow,
  submitCreatorProfileToIndexNow,
  submitBlogPostToIndexNow,
  submitKeyPagesToIndexNow,
  submitContentUpdateToIndexNow
};

export default indexNowUtils;
