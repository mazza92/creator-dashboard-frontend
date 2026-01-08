import React, { useState, useEffect } from 'react';
import { apiClient } from '../config/api';
import { FaGift, FaCheckCircle } from 'react-icons/fa';
import { message } from 'antd';

const PR_CATEGORIES = [
  'Skincare & Beauty',
  'Fashion & Style',
  'Tech & Gadgets',
  'Wellness & Fitness',
  'Food & Nutrition',
  'Travel & Adventure',
  'Gaming',
  'Sustainable/Eco',
  'Parenting & Family',
  'Home & Lifestyle',
  'Music & Entertainment',
  'Sports & Outdoors',
  'Health & Medical',
  'Finance & Business',
  'Arts & Crafts',
  'Education',
  'Automotive',
  'Pet Products',
  'Books & Literature',
  'Photography'
];

const PRWishlistSettings = ({ onUpdate }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/creator/pr-wishlist');
      if (response.status === 200) {
        setWishlist(response.data.wishlist || []);
      }
    } catch (err) {
      console.error('Error fetching PR wishlist:', err);
      setError(err.response?.data?.error || 'Failed to load PR preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCategory = (category) => {
    setWishlist(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await apiClient.put('/api/creator/pr-wishlist', {
        wishlist: wishlist
      });
      
      if (response.status === 200) {
        message.success('PR preferences saved successfully!');
        if (onUpdate) {
          onUpdate(response.data.wishlist);
        }
      }
    } catch (err) {
      console.error('Error saving PR wishlist:', err);
      setError(err.response?.data?.error || 'Failed to save PR preferences');
      message.error('Failed to save PR preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#6B7280' }}>Loading PR preferences...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <FaGift style={{ fontSize: 24, color: '#10b981' }} />
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
            PR Package Preferences
          </h3>
        </div>
        <p style={{ margin: 0, color: '#6B7280', fontSize: 14, lineHeight: 1.6 }}>
          Select the categories you're interested in receiving PR packages for. 
          Brands will only see your profile for offers matching these categories.
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 24,
          fontSize: 14
        }}>
          {error}
        </div>
      )}

      {/* Categories Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12,
        marginBottom: 24
      }}>
        {PR_CATEGORIES.map(category => {
          const isSelected = wishlist.includes(category);
          return (
            <button
              key={category}
              onClick={() => handleToggleCategory(category)}
              style={{
                padding: '12px 16px',
                border: `2px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
                borderRadius: 8,
                background: isSelected ? '#f0fdf4' : '#fff',
                color: isSelected ? '#10b981' : '#6B7280',
                fontWeight: isSelected ? 700 : 600,
                cursor: 'pointer',
                fontSize: 14,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.background = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#fff';
                }
              }}
            >
              <span>{category}</span>
              {isSelected && (
                <FaCheckCircle style={{ fontSize: 16, color: '#10b981' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Count */}
      <div style={{
        padding: '12px 16px',
        background: '#f9fafb',
        borderRadius: 8,
        marginBottom: 24,
        fontSize: 14,
        color: '#6B7280'
      }}>
        <strong>{wishlist.length}</strong> {wishlist.length === 1 ? 'category' : 'categories'} selected
        {wishlist.length > 0 && (
          <span style={{ marginLeft: 8, color: '#10b981', fontWeight: 600 }}>
            • You'll receive PR offers for these categories
          </span>
        )}
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: 8,
            background: saving ? '#d1fae5' : '#10b981',
            color: saving ? '#6b7280' : '#fff',
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
        >
          <FaCheckCircle />
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {/* Info Box */}
      {wishlist.length === 0 && (
        <div style={{
          marginTop: 24,
          padding: 16,
          background: '#fef3c7',
          borderRadius: 8,
          border: '1px solid #fbbf24'
        }}>
          <p style={{ margin: 0, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
            <strong>💡 Tip:</strong> Select at least a few categories to start receiving relevant PR package offers from brands. 
            You can always update your preferences later.
          </p>
        </div>
      )}
    </div>
  );
};

export default PRWishlistSettings;

