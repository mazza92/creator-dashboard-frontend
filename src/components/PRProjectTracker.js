import React, { useState } from 'react';
import { apiClient } from '../config/api';
import { FaCheckCircle, FaTruck, FaBox, FaVideo, FaCheck, FaArrowRight, FaTimes } from 'react-icons/fa';
import { 
  SiTiktok, 
  SiInstagram, 
  SiYoutube, 
  SiFacebook 
} from 'react-icons/si';
import { HiGlobeAlt } from 'react-icons/hi';
import { FaTwitter } from 'react-icons/fa';

// Helper function to ensure URL is absolute
const ensureAbsoluteUrl = (url) => {
  if (!url) return '#';
  const trimmedUrl = url.trim();
  // If already absolute, return as-is
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }
  // If it starts with //, it's protocol-relative, add https:
  if (trimmedUrl.startsWith('//')) {
    return `https:${trimmedUrl}`;
  }
  // If it doesn't start with http/https, prepend https://
  // This prevents React Router from treating it as a relative path
  return `https://${trimmedUrl}`;
};

// Platform configurations with official logos and content types
const PLATFORMS = {
  tiktok: {
    name: 'TikTok',
    Icon: SiTiktok,
    color: '#000000',
    types: ['TikTok Video', 'TikTok Live', 'TikTok Story']
  },
  instagram: {
    name: 'Instagram',
    Icon: SiInstagram,
    color: '#E4405F',
    types: ['Instagram Reel', 'Instagram Post', 'Instagram Story', 'Instagram Live', 'Instagram Carousel']
  },
  youtube: {
    name: 'YouTube',
    Icon: SiYoutube,
    color: '#FF0000',
    types: ['YouTube Short', 'YouTube Video', 'YouTube Live']
  },
  twitter: {
    name: 'Twitter/X',
    Icon: FaTwitter, // Using FontAwesome Twitter icon as SiX/SiTwitter not available
    color: '#1DA1F2',
    types: ['Twitter Post', 'Twitter Thread', 'Twitter Spaces']
  },
  facebook: {
    name: 'Facebook',
    Icon: SiFacebook,
    color: '#1877F2',
    types: ['Facebook Post', 'Facebook Reel', 'Facebook Live', 'Facebook Story']
  },
  other: {
    name: 'Other',
    Icon: HiGlobeAlt,
    color: '#6B7280',
    types: ['Blog Post', 'Podcast', 'Newsletter', 'Other']
  }
};

const PRProjectTracker = ({ offer, onUpdate, userRole = 'creator' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contentUrls, setContentUrls] = useState([{ url: '', type: '', platform: '' }]);
  const isBrand = userRole === 'brand';

  const steps = [
    {
      key: 'accepted',
      label: 'Offer Accepted',
      icon: <FaCheckCircle />,
      completed: ['accepted', 'awaiting_shipment', 'shipped', 'product_received', 'content_in_progress', 'content_submitted', 'completed'].includes(offer.status),
      active: offer.status === 'accepted' || offer.status === 'awaiting_shipment',
      date: offer.accepted_at
    },
    {
      key: 'shipped',
      label: 'Product Shipped',
      icon: <FaTruck />,
      completed: ['shipped', 'product_received', 'content_in_progress', 'content_submitted', 'completed'].includes(offer.status),
      active: offer.status === 'shipped',
      date: offer.shipped_at,
      tracking: offer.tracking_number
    },
    {
      key: 'received',
      label: 'Product Received',
      icon: <FaBox />,
      completed: ['product_received', 'content_in_progress', 'content_submitted', 'completed'].includes(offer.status),
      active: offer.status === 'product_received',
      date: offer.product_received_at
    },
    {
      key: 'content_in_progress',
      label: 'Content in Progress',
      icon: <FaVideo />,
      completed: ['content_in_progress', 'content_submitted', 'completed'].includes(offer.status),
      active: offer.status === 'content_in_progress',
      date: offer.product_received_at // Use received date as start date
    },
    {
      key: 'content_submitted',
      label: 'Content Submitted',
      icon: <FaCheck />,
      completed: ['content_submitted', 'completed'].includes(offer.status),
      active: offer.status === 'content_submitted',
      date: offer.content_submitted_at
    },
    {
      key: 'completed',
      label: 'Project Complete',
      icon: <FaCheck />,
      completed: offer.status === 'completed',
      active: offer.status === 'completed',
      date: offer.completed_at
    }
  ];

  const handleReceiveProduct = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post(`/api/pr-offers/${offer.id}/receive`);
      if (response.status === 200 && onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error confirming product received:', err);
      setError(err.response?.data?.error || 'Failed to confirm product received');
    } finally {
      setLoading(false);
    }
  };

  const handleStartContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post(`/api/pr-offers/${offer.id}/start-content`);
      if (response.status === 200 && onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error starting content creation:', err);
      setError(err.response?.data?.error || 'Failed to start content creation');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContentUrl = () => {
    setContentUrls([...contentUrls, { url: '', type: '', platform: '' }]);
  };

  const handleContentUrlChange = (index, field, value) => {
    const updated = [...contentUrls];
    updated[index][field] = value;
    
    // Auto-fill type when platform changes
    if (field === 'platform' && value) {
      const platformKey = Object.keys(PLATFORMS).find(
        key => PLATFORMS[key].name.toLowerCase() === value.toLowerCase() ||
               key === value.toLowerCase()
      );
      if (platformKey && PLATFORMS[platformKey].types.length > 0) {
        updated[index].type = PLATFORMS[platformKey].types[0];
      }
    }
    
    setContentUrls(updated);
  };

  const handleRemoveContentUrl = (index) => {
    setContentUrls(contentUrls.filter((_, i) => i !== index));
  };

  const handleSubmitContent = async () => {
    if (contentUrls.some(c => !c.url.trim())) {
      setError('Please fill in all content URLs');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post(`/api/pr-offers/${offer.id}/submit-content`, {
        content_urls: contentUrls.map(c => ({
          url: c.url.trim(),
          type: c.type.trim(),
          platform: c.platform.trim()
        }))
      });
      
      if (response.status === 200 && onUpdate) {
        onUpdate();
        setContentUrls([{ url: '', type: '', platform: '' }]);
      }
    } catch (err) {
      console.error('Error submitting content:', err);
      setError(err.response?.data?.error || 'Failed to submit content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 700 }}>Project Status</h4>
      
      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {steps.map((step, index) => (
          <div key={step.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            {/* Step Icon */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: step.completed ? '#10b981' : step.active ? '#3b82f6' : '#e5e7eb',
              color: step.completed || step.active ? '#fff' : '#9ca3af',
              flexShrink: 0
            }}>
              {step.icon}
            </div>
            
            {/* Step Content */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: step.active ? 700 : 600,
                fontSize: 14,
                color: step.completed ? '#10b981' : step.active ? '#3b82f6' : '#6B7280',
                marginBottom: 4
              }}>
                {step.label}
              </div>
              {step.date && (
                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                  {new Date(step.date).toLocaleDateString()}
                </div>
              )}
              {step.tracking && (
                <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 4 }}>
                  Tracking: {step.tracking}
                </div>
              )}
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div style={{
                position: 'absolute',
                left: 20,
                top: 60,
                width: 2,
                height: 16,
                background: step.completed ? '#10b981' : '#e5e7eb'
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      {/* Only show action buttons to creators */}
      {!isBrand && offer.status === 'shipped' && (
        <div style={{ marginTop: 24, padding: 16, background: '#f0fdf4', borderRadius: 8 }}>
          <p style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600 }}>
            Have you received the product?
          </p>
          <button
            onClick={handleReceiveProduct}
            disabled={loading}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: 8,
              background: loading ? '#d1fae5' : '#10b981',
              color: loading ? '#6b7280' : '#fff',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14
            }}
          >
            {loading ? 'Processing...' : 'Confirm Product Received'}
          </button>
        </div>
      )}

      {/* Start Content Creation Action */}
      {!isBrand && offer.status === 'product_received' && (
        <div style={{ marginTop: 24, padding: 16, background: '#fef3c7', borderRadius: 8, border: '1.5px solid #fbbf24' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#92400e' }}>
            Ready to create content?
          </p>
          <p style={{ margin: '0 0 12px 0', fontSize: 13, color: '#78350f' }}>
            You have {offer.content_deadline_days || 14} days to complete and submit your content.
          </p>
          <button
            onClick={handleStartContent}
            disabled={loading}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: 8,
              background: loading ? '#fde68a' : '#fbbf24',
              color: loading ? '#6b7280' : '#78350f',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <FaVideo />
            {loading ? 'Processing...' : 'Start Creating Content'}
          </button>
        </div>
      )}

      {/* Only show content submission form to creators */}
      {!isBrand && offer.status === 'content_in_progress' && (
        <div style={{ marginTop: 24, padding: 16, background: '#f0fdf4', borderRadius: 8 }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700 }}>
            Submit Your Content
          </h4>
          <p style={{ margin: '0 0 16px 0', fontSize: 13, color: '#6B7280' }}>
            {offer.status === 'product_received' 
              ? 'Now that you\'ve received the product, create your content and submit the URLs here. You have ' + (offer.content_deadline_days || 14) + ' days to complete.'
              : 'Add the URLs to your published content'}
          </p>
          
          {contentUrls.map((content, index) => {
            const selectedPlatform = Object.keys(PLATFORMS).find(
              key => PLATFORMS[key].name.toLowerCase() === content.platform.toLowerCase() ||
                     key === content.platform.toLowerCase()
            );
            const platformConfig = selectedPlatform ? PLATFORMS[selectedPlatform] : null;
            
            return (
              <div 
                key={index} 
                style={{ 
                  marginBottom: 16, 
                  padding: 16,
                  background: '#fff',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 12
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h5 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
                    Content #{index + 1}
                  </h5>
                  {contentUrls.length > 1 && (
                    <button
                      onClick={() => handleRemoveContentUrl(index)}
                      style={{
                        padding: '4px 8px',
                        border: 'none',
                        borderRadius: 6,
                        background: '#fee2e2',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <FaTimes />
                      Remove
                    </button>
                  )}
                </div>
                
                {/* Platform Selection */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>
                    Platform
                  </label>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: 8
                  }}>
                    {Object.entries(PLATFORMS).map(([key, platform]) => {
                      const isSelected = content.platform.toLowerCase() === platform.name.toLowerCase() || 
                                        content.platform.toLowerCase() === key;
                      const IconComponent = platform.Icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleContentUrlChange(index, 'platform', platform.name)}
                          style={{
                            padding: '12px 8px',
                            border: `2px solid ${isSelected ? platform.color : '#e5e7eb'}`,
                            borderRadius: 10,
                            background: isSelected ? `${platform.color}10` : '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 6
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = platform.color;
                              e.currentTarget.style.background = `${platform.color}08`;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#e5e7eb';
                              e.currentTarget.style.background = '#fff';
                            }
                          }}
                        >
                          <IconComponent 
                            style={{ 
                              fontSize: 24, 
                              color: isSelected ? platform.color : '#6B7280'
                            }} 
                          />
                          <span style={{ 
                            fontSize: 11, 
                            fontWeight: isSelected ? 700 : 600,
                            color: isSelected ? platform.color : '#6B7280'
                          }}>
                            {platform.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content Type Selection */}
                {platformConfig && (
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>
                      Content Type
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap',
                      gap: 6
                    }}>
                      {platformConfig.types.map((type) => {
                        const isSelected = content.type === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleContentUrlChange(index, 'type', type)}
                            style={{
                              padding: '6px 12px',
                              border: `1.5px solid ${isSelected ? platformConfig.color : '#e5e7eb'}`,
                              borderRadius: 8,
                              background: isSelected ? `${platformConfig.color}15` : '#fff',
                              color: isSelected ? platformConfig.color : '#6B7280',
                              fontWeight: isSelected ? 600 : 500,
                              cursor: 'pointer',
                              fontSize: 12,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.borderColor = platformConfig.color;
                                e.currentTarget.style.background = `${platformConfig.color}08`;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.background = '#fff';
                              }
                            }}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Content URL */}
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#4B5563' }}>
                    Content URL <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={content.url}
                    onChange={(e) => handleContentUrlChange(index, 'url', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 14,
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = platformConfig?.color || '#10b981';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  />
                </div>
              </div>
            );
          })}
          
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleAddContentUrl}
              style={{
                padding: '8px 16px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                background: '#fff',
                color: '#6B7280',
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              + Add Another URL
            </button>
            <button
              onClick={handleSubmitContent}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 20px',
                border: 'none',
                borderRadius: 8,
                background: loading ? '#d1fae5' : '#10b981',
                color: loading ? '#6b7280' : '#fff',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <FaCheck />
              {loading ? 'Submitting...' : 'Submit Content'}
            </button>
          </div>
          
          {error && (
            <div style={{
              marginTop: 12,
              padding: '12px 16px',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: 8,
              fontSize: 14
            }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* Content URLs Display */}
      {offer.content_urls && offer.content_urls.length > 0 && (
        <div style={{ marginTop: 24, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700 }}>
            Submitted Content
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {offer.content_urls.map((urlData, index) => (
              <a
                key={index}
                href={ensureAbsoluteUrl(urlData.url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  // Ensure we always open the absolute URL, even if React Router tries to intercept
                  const absoluteUrl = ensureAbsoluteUrl(urlData.url);
                  if (absoluteUrl && absoluteUrl !== '#') {
                    window.open(absoluteUrl, '_blank', 'noopener,noreferrer');
                    e.preventDefault();
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  background: '#fff',
                  borderRadius: 6,
                  textDecoration: 'none',
                  color: '#3b82f6',
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                <FaArrowRight />
                {urlData.type || urlData.url}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Upsell CTA for Brands - Show after completion */}
      {offer.status === 'completed' && offer.brand_id && (
        <div style={{
          marginTop: 24,
          padding: 20,
          background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
          borderRadius: 12,
          color: '#fff',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: '#fff' }}>
            🎉 This collaboration was a success!
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>
            Upgrade to a paid sponsorship for your next project with this creator
          </p>
          <a
            href={`/c/${offer.creator_username || ''}`}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#fff',
              color: '#10b981',
              borderRadius: 8,
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: 15,
              transition: 'transform 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            Bid on Paid Project →
          </a>
        </div>
      )}
    </div>
  );
};

export default PRProjectTracker;

