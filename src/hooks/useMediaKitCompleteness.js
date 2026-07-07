import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../config/api';

/**
 * Media Kit Completeness Requirements (Simplified):
 * 1. 4 portfolio posts minimum
 * 2. Kit is published (kit_published = true)
 */

export const useMediaKitCompleteness = () => {
  const [loading, setLoading] = useState(true);
  const [completeness, setCompleteness] = useState({
    isComplete: false,
    isPublished: false,
    hasKit: false,
    postCount: 0,
    percentage: 0,
  });

  const fetchMediaKitStatus = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch portfolio settings and posts count in parallel
      const [portfolioRes, postsRes] = await Promise.all([
        apiClient.get('/api/portfolio/settings'),
        apiClient.get('/api/portfolio/posts')
      ]);

      const portfolio = portfolioRes.data;
      // API returns array directly, not {posts: [...]}
      const posts = Array.isArray(postsRes.data) ? postsRes.data : [];
      const postCount = posts.length;

      // Simple requirements: 3 posts + published
      const isPublished = portfolio?.kit_published === true;
      const hasEnoughPosts = postCount >= 3;

      // Kit is complete if published AND has 3+ posts
      const isComplete = isPublished && hasEnoughPosts;

      // Calculate percentage (2 requirements: posts and published)
      const postsProgress = Math.min(postCount, 3); // 0-3
      const publishedProgress = isPublished ? 1 : 0;
      const percentage = Math.round(((postsProgress / 3) * 0.8 + publishedProgress * 0.2) * 100);

      setCompleteness({
        isComplete,
        isPublished,
        hasKit: true,
        postCount,
        percentage,
      });
    } catch (err) {
      console.error('Error fetching media kit completeness:', err);
      setCompleteness({
        isComplete: false,
        isPublished: false,
        hasKit: false,
        postCount: 0,
        percentage: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMediaKitStatus();
  }, [fetchMediaKitStatus]);

  return {
    loading,
    ...completeness,
    refetch: fetchMediaKitStatus,
  };
};

export default useMediaKitCompleteness;
