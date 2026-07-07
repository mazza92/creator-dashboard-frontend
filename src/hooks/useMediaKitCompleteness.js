import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../config/api';

/**
 * Media Kit Completeness Requirements:
 * 1. Media kit exists
 * 2. Media kit is published (is_published = true)
 * 3. Has display name
 * 4. Has tagline
 * 5. Has at least 1 niche selected
 * 6. Has at least 1 content type selected
 * 7. Has total followers > 0
 */

const REQUIRED_FIELDS = {
  display_name: { label: 'Display Name', check: (v) => !!v?.trim() },
  tagline: { label: 'Tagline', check: (v) => !!v?.trim() },
  niches: { label: 'Niche', check: (v) => Array.isArray(v) && v.length > 0 },
  content_types: { label: 'Content Types', check: (v) => Array.isArray(v) && v.length > 0 },
  total_followers: { label: 'Followers', check: (v) => v > 0 },
};

export const useMediaKitCompleteness = () => {
  const [loading, setLoading] = useState(true);
  const [mediaKit, setMediaKit] = useState(null);
  const [completeness, setCompleteness] = useState({
    isComplete: false,
    isPublished: false,
    hasKit: false,
    missingFields: [],
    completedFields: [],
    percentage: 0,
  });

  const calculateCompleteness = useCallback((kit) => {
    if (!kit) {
      return {
        isComplete: false,
        isPublished: false,
        hasKit: false,
        missingFields: Object.entries(REQUIRED_FIELDS).map(([key, { label }]) => ({ key, label })),
        completedFields: [],
        percentage: 0,
      };
    }

    const missingFields = [];
    const completedFields = [];

    Object.entries(REQUIRED_FIELDS).forEach(([key, { label, check }]) => {
      if (check(kit[key])) {
        completedFields.push({ key, label });
      } else {
        missingFields.push({ key, label });
      }
    });

    const totalFields = Object.keys(REQUIRED_FIELDS).length + 1; // +1 for published status
    const completedCount = completedFields.length + (kit.is_published ? 1 : 0);
    const percentage = Math.round((completedCount / totalFields) * 100);

    // Kit is complete ONLY if all fields are filled AND it's published
    const isComplete = missingFields.length === 0 && kit.is_published === true;

    return {
      isComplete,
      isPublished: kit.is_published === true,
      hasKit: true,
      missingFields,
      completedFields,
      percentage,
    };
  }, []);

  const fetchMediaKit = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/media-kit');

      if (response.data.success) {
        const kit = response.data.media_kit;
        setMediaKit(kit);
        setCompleteness(calculateCompleteness(kit));
      } else {
        setMediaKit(null);
        setCompleteness(calculateCompleteness(null));
      }
    } catch (err) {
      console.error('Error fetching media kit completeness:', err);
      setMediaKit(null);
      setCompleteness(calculateCompleteness(null));
    } finally {
      setLoading(false);
    }
  }, [calculateCompleteness]);

  useEffect(() => {
    fetchMediaKit();
  }, [fetchMediaKit]);

  return {
    loading,
    mediaKit,
    ...completeness,
    refetch: fetchMediaKit,
  };
};

export default useMediaKitCompleteness;
