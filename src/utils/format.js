/**
 * Format follower counts to human-readable strings
 * @param {number} n - The follower count
 * @returns {string} Formatted string (e.g., "2.4M", "840K", "500")
 */
export function formatFollowers(n) {
  if (!n || isNaN(n)) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}
