import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGift, FaEye, FaTwitter, FaSnapchat, FaTwitch } from 'react-icons/fa';
import { SiInstagram, SiTiktok, SiYoutube, SiFacebook } from 'react-icons/si';

const CreatorCard = ({ creator, onProposePRPackage, onViewProfile }) => {
  const navigate = useNavigate();

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getCountryFlag = (country) => {
    // Simple country to flag emoji mapping for common countries
    const countryFlags = {
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'Australia': '🇦🇺',
      'Canada': '🇨🇦',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Spain': '🇪🇸',
      'Italy': '🇮🇹',
      'Netherlands': '🇳🇱',
      'Sweden': '🇸🇪',
      'Norway': '🇳🇴',
      'Denmark': '🇩🇰',
      'Brazil': '🇧🇷',
      'Mexico': '🇲🇽',
      'India': '🇮🇳',
      'Japan': '🇯🇵',
      'South Korea': '🇰🇷',
      'China': '🇨🇳',
      'Singapore': '🇸🇬',
      'New Zealand': '🇳🇿',
      'Ireland': '🇮🇪',
      'Poland': '🇵🇱',
      'Belgium': '🇧🇪',
      'Switzerland': '🇨🇭',
      'Austria': '🇦🇹',
      'Portugal': '🇵🇹',
      'Greece': '🇬🇷',
      'Turkey': '🇹🇷',
      'South Africa': '🇿🇦',
      'Argentina': '🇦🇷',
      'Chile': '🇨🇱',
      'Colombia': '🇨🇴',
      'Philippines': '🇵🇭',
      'Thailand': '🇹🇭',
      'Malaysia': '🇲🇾',
      'Indonesia': '🇮🇩',
      'Vietnam': '🇻🇳',
      'UAE': '🇦🇪',
      'Saudi Arabia': '🇸🇦',
      'Israel': '🇮🇱',
      'Egypt': '🇪🇬',
      'Nigeria': '🇳🇬',
      'Kenya': '🇰🇪',
      'Russia': '🇷🇺',
      'Ukraine': '🇺🇦'
    };
    return countryFlags[country] || '🌍';
  };

  const getPlatformIcon = (platform) => {
    const platformLower = platform?.toLowerCase() || '';
    if (platformLower.includes('instagram')) return <SiInstagram style={{ fontSize: 16, color: '#E1306C' }} />;
    if (platformLower.includes('tiktok')) return <SiTiktok style={{ fontSize: 16, color: '#000000' }} />;
    if (platformLower.includes('youtube')) return <SiYoutube style={{ fontSize: 16, color: '#FF0000' }} />;
    if (platformLower.includes('snapchat')) return <FaSnapchat style={{ fontSize: 16, color: '#FFFC00' }} />;
    if (platformLower.includes('twitch')) return <FaTwitch style={{ fontSize: 16, color: '#9146FF' }} />;
    if (platformLower.includes('facebook')) return <SiFacebook style={{ fontSize: 16, color: '#1877F2' }} />;
    if (platformLower.includes('twitter') || platformLower.includes('x')) return <FaTwitter style={{ fontSize: 16, color: '#1DA1F2' }} />;
    return null;
  };

  // Get first active project (if any)
  const activeProject = creator.projects && creator.projects.length > 0 ? creator.projects[0] : null;

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
    }}
    >
      {/* Profile Picture */}
      <div style={{
        width: '100%',
        height: 240,
        background: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {creator.image_profile ? (
          <img
            src={creator.image_profile}
            alt={creator.username}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            color: '#9ca3af'
          }}>
            {creator.username?.[0]?.toUpperCase() || 'C'}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Username */}
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: 20,
          fontWeight: 700,
          color: '#1f2937'
        }}>
          @{creator.username || 'creator'}
        </h3>

        {/* Categories (from PR wishlist) - Modern styled tags */}
        {(() => {
          // Parse categories - handle both array and string formats
          let categoriesToDisplay = [];
          
          // Helper function to parse string representation of array
          const parseCategories = (data) => {
            if (!data) return [];
            
            // If already an array, return it
            if (Array.isArray(data)) {
              return data.filter(c => c && typeof c === 'string' && c.trim());
            }
            
            // If it's a string, try to parse it
            if (typeof data === 'string') {
              const trimmed = data.trim();
              
              // Try JSON.parse first
              if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                try {
                  const parsed = JSON.parse(trimmed);
                  if (Array.isArray(parsed)) {
                    return parsed.filter(c => c && typeof c === 'string' && c.trim());
                  }
                } catch (e) {
                  // If JSON.parse fails, manually parse
                  // Remove brackets and quotes, handle escaped quotes
                  const cleaned = trimmed
                    .replace(/^\[|\]$/g, '') // Remove outer brackets
                    .replace(/"/g, '') // Remove quotes
                    .replace(/'/g, ''); // Remove single quotes
                  
                  return cleaned
                    .split(',')
                    .map(c => c.trim())
                    .filter(c => c.length > 0);
                }
              }
              
              // If it doesn't start with [, treat as single category
              if (trimmed.length > 0) {
                return [trimmed];
              }
            }
            
            return [];
          };
          
          // Try categories first
          if (creator.categories) {
            categoriesToDisplay = parseCategories(creator.categories);
          }
          
          // Fallback to niche if no categories
          if (categoriesToDisplay.length === 0 && creator.niche) {
            categoriesToDisplay = parseCategories(creator.niche);
          }
          
          // Display categories as individual badges
          if (categoriesToDisplay.length > 0) {
            return (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 12
              }}>
                {categoriesToDisplay.slice(0, 3).map((category, idx) => {
                  const categoryText = String(category).trim();
                  if (!categoryText) return null;
                  
                  return (
                    <span
                      key={`${categoryText}-${idx}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
                        color: '#096dd9',
                        borderRadius: 16,
                        fontSize: 12,
                        fontWeight: 600,
                        border: '1px solid #91d5ff',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 2px rgba(9, 109, 217, 0.1)'
                      }}
                    >
                      {categoryText}
                    </span>
                  );
                })}
                {categoriesToDisplay.length > 3 && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 12px',
                    background: '#f3f4f6',
                    color: '#6b7280',
                    borderRadius: 16,
                    fontSize: 12,
                    fontWeight: 600,
                    border: '1px solid #e5e7eb'
                  }}>
                    +{categoriesToDisplay.length - 3}
                  </span>
                )}
              </div>
            );
          }
          
          return null;
        })()}

        {/* Location */}
        {creator.country && (
          <div style={{
            marginBottom: 8,
            fontSize: 13,
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span>{getCountryFlag(creator.country)}</span>
            <span>{creator.country}</span>
          </div>
        )}

        {/* Stats */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginBottom: 16
        }}>
          {/* Followers */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            color: '#4b5563'
          }}>
            <span style={{ fontWeight: 600, color: '#1f2937' }}>Followers:</span>
            <span>{formatNumber(creator.followers_count || 0)}</span>
          </div>

          {/* Engagement Rate - Always show, with fallback */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14
          }}>
            <span style={{ fontWeight: 600, color: '#1f2937' }}>Avg. Engagement:</span>
            <span style={{
              color: (creator.avg_engagement_rate !== null && creator.avg_engagement_rate !== undefined) ? '#10b981' : '#9ca3af',
              fontWeight: 700,
              fontSize: 15
            }}>
              {(creator.avg_engagement_rate !== null && creator.avg_engagement_rate !== undefined) 
                ? `${parseFloat(creator.avg_engagement_rate).toFixed(1)}%` 
                : 'N/A'}
            </span>
          </div>

          {/* Platforms */}
          {creator.platforms && creator.platforms.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
              marginTop: 4
            }}>
              {creator.platforms.slice(0, 4).map((platform, idx) => (
                <span key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                  {getPlatformIcon(platform)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Active Project (De-emphasized) */}
        {activeProject && (
          <div style={{
            marginTop: 'auto',
            paddingTop: 12,
            borderTop: '1px solid #e5e7eb',
            marginBottom: 12
          }}>
            <a
              href={`/c/${creator.username}`}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/c/${creator.username}`);
              }}
              style={{
                fontSize: 12,
                color: '#6b7280',
                textDecoration: 'none',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#10b981';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#6b7280';
              }}
            >
              View Active Project: {activeProject.title || 'Content collaboration opportunity...'}
            </a>
          </div>
        )}

        {/* CTAs */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginTop: 'auto'
        }}>
          {/* Primary CTA: Propose PR Package */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onProposePRPackage();
            }}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#059669';
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#10b981';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <FaGift />
            Propose PR Package
          </button>

          {/* Secondary CTA: View Profile */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onViewProfile) {
                onViewProfile(creator);
              } else {
                navigate(`/c/${creator.username}`);
              }
            }}
            style={{
              width: '100%',
              padding: '10px 20px',
              background: 'transparent',
              color: '#10b981',
              border: '1.5px solid #10b981',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f0fdf4';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            <FaEye />
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorCard;

