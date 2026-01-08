import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api';
import { UserContext } from '../contexts/UserContext';
import { FaTimes, FaGift, FaCheckCircle } from 'react-icons/fa';

const PROfferForm = ({ creatorId, creatorUsername, onClose, onSuccess }) => {
  const { user, loading: userLoading } = useContext(UserContext);
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  
  // Check authentication - UserContext might not load on public pages
  useEffect(() => {
    const checkAuth = async () => {
      // First check if user is in context
      if (user) {
        setAuthUser(user);
        setCheckingAuth(false);
        return;
      }
      
      // Check localStorage as fallback
      const cachedUserRole = localStorage.getItem('userRole');
      const cachedUserId = localStorage.getItem('userId');
      const cachedAuthToken = localStorage.getItem('authToken');
      
      if (cachedUserRole && cachedUserId && cachedAuthToken === 'logged-in') {
        // Try to verify with API
        try {
          const response = await apiClient.get('/profile');
          const profileData = response.data;
          if (profileData.user_id) {
            setAuthUser({
              id: profileData.user_id,
              role: profileData.user_role,
              creator_id: profileData.creator_id,
              brand_id: profileData.brand_id,
            });
          }
        } catch (err) {
          console.error('Error verifying auth:', err);
          // Clear invalid cache
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId');
          localStorage.removeItem('authToken');
        }
      }
      
      setCheckingAuth(false);
    };
    
    if (!userLoading) {
      checkAuth();
    }
  }, [user, userLoading]);
  
  const [formData, setFormData] = useState({
    offer_title: '',
    products_offered: '',
    products_value: '',
    deliverables_required: [],
    mandatory_requirements: '',
    content_deadline_days: 14,
    target_categories: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [matchedCreators, setMatchedCreators] = useState(null);
  const [checkingMatches, setCheckingMatches] = useState(false);
  const matchCheckTimeoutRef = React.useRef(null);

  // Standard deliverable options
  const deliverableOptions = [
    '1 x TikTok Video (1 min)',
    '1 x Instagram Reel (1 min)',
    '1 x Instagram Post (Static)',
    '3 x Story Frames with Link',
    '1 x YouTube Short (1 min)',
    '1 x YouTube Video (5+ min)',
    '1 x Twitter/X Post',
    '1 x Facebook Post'
  ];

  // PR Categories (matching PRWishlistSettings)
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

  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const isSelected = prev.target_categories.includes(category);
      const newCategories = isSelected
        ? prev.target_categories.filter(c => c !== category)
        : [...prev.target_categories, category];
      
      // Debounce match checking to avoid too many API calls
      if (matchCheckTimeoutRef.current) {
        clearTimeout(matchCheckTimeoutRef.current);
      }
      
      if (newCategories.length > 0) {
        matchCheckTimeoutRef.current = setTimeout(() => {
          checkMatchedCreators(newCategories);
        }, 500); // Wait 500ms after last change
      } else {
        setMatchedCreators(null);
      }
      
      return {
        ...prev,
        target_categories: newCategories
      };
    });
  };

  const checkMatchedCreators = async (categories) => {
    if (!categories || categories.length === 0) {
      setMatchedCreators(null);
      return;
    }
    
    setCheckingMatches(true);
    try {
      const response = await apiClient.post('/api/pr-offers/matched-creators', {
        target_categories: categories
      });
      if (response.status === 200) {
        setMatchedCreators(response.data);
      }
    } catch (err) {
      console.error('Error checking matched creators:', err);
      // Don't show error to user, just don't show match count
    } finally {
      setCheckingMatches(false);
    }
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (matchCheckTimeoutRef.current) {
        clearTimeout(matchCheckTimeoutRef.current);
      }
    };
  }, []);

  const handleDeliverableChange = (deliverable) => {
    setFormData(prev => {
      const isSelected = prev.deliverables_required.includes(deliverable);
      return {
        ...prev,
        deliverables_required: isSelected
          ? prev.deliverables_required.filter(d => d !== deliverable)
          : [...prev.deliverables_required, deliverable]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.offer_title || !formData.products_offered || formData.deliverables_required.length === 0) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/api/pr-offers', {
        creator_id: parseInt(creatorId), // Ensure creator_id is an integer
        offer_title: formData.offer_title,
        products_offered: formData.products_offered,
        products_value: formData.products_value ? parseFloat(formData.products_value) : null,
        deliverables_required: formData.deliverables_required,
        mandatory_requirements: formData.mandatory_requirements,
        content_deadline_days: parseInt(formData.content_deadline_days),
        target_categories: formData.target_categories
      });

      if (response.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating PR offer:', err);
      console.error('Error response data:', err.response?.data);
      if (err.response?.status === 401) {
        // Check if it's a CSRF or auth issue
        const errorMsg = err.response?.data?.msg || err.response?.data?.error || '';
        if (errorMsg.includes('CSRF') || errorMsg.includes('csrf')) {
          setError('Session expired. Please refresh the page and try again.');
        } else {
          setError('You must be logged in as a brand to send PR offers. Please log in and try again.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else if (err.response?.status === 400) {
        // Show the actual error message from backend
        const errorMsg = err.response?.data?.error || 'Invalid request. Please check all fields are filled correctly.';
        setError(errorMsg);
      } else {
        setError(err.response?.data?.error || 'Failed to create PR offer. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (checkingAuth || userLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 16, color: '#6B7280' }}>Loading...</div>
        </div>
      </div>
    );
  }

  // Use authUser (from context or fallback check) instead of user
  const currentUser = user || authUser;

  // Check authentication before showing form
  if (!currentUser) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: 16
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          maxWidth: 400,
          width: '90%',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 700 }}>Login Required</h3>
          <p style={{ margin: '0 0 24px 0', color: '#6B7280', fontSize: 14 }}>
            You must be logged in as a brand to send PR package offers.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                background: '#fff',
                color: '#6B7280',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 15
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: 8,
                background: '#10b981',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 15
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'brand') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: 16
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          maxWidth: 400,
          width: '90%',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 700 }}>Brand Account Required</h3>
          <p style={{ margin: '0 0 24px 0', color: '#6B7280', fontSize: 14 }}>
            Only brands can send PR package offers. Please log in with a brand account.
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: 8,
              background: '#10b981',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 15
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          maxWidth: 400,
          width: '90%',
          textAlign: 'center'
        }}>
          <FaCheckCircle style={{ fontSize: 48, color: '#10b981', marginBottom: 16 }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 700 }}>Offer Sent!</h3>
          <p style={{ margin: 0, color: '#6B7280' }}>Your PR package offer has been sent to @{creatorUsername}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: 16
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 24,
        maxWidth: 600,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            color: '#6B7280',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FaTimes />
        </button>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <FaGift style={{ fontSize: 24, color: '#10b981' }} />
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Propose PR Package</h2>
          </div>
          <p style={{ margin: 0, color: '#6B7280', fontSize: 14 }}>
            Send a PR package offer to @{creatorUsername}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Offer Title */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              Offer Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.offer_title}
              onChange={(e) => setFormData({ ...formData, offer_title: e.target.value })}
              placeholder="e.g., PR Package for our new Vitamin C Serum"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 15,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Products Offered */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              Product(s) Offered <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={formData.products_offered}
              onChange={(e) => setFormData({ ...formData, products_offered: e.target.value })}
              placeholder="e.g., 1x 50ml Vitamin C Serum, 1x 30ml Cleanser. Total Value: $75"
              required
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 15,
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Products Value (Optional) */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              Total Product Value (Optional)
            </label>
            <input
              type="number"
              value={formData.products_value}
              onChange={(e) => setFormData({ ...formData, products_value: e.target.value })}
              placeholder="e.g., 75"
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 15,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Deliverables Required */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              Key Deliverables <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{
              border: '1.5px solid #e5e7eb',
              borderRadius: 8,
              padding: 12,
              maxHeight: 200,
              overflowY: 'auto'
            }}>
              {deliverableOptions.map((option) => (
                <label
                  key={option}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 0',
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.deliverables_required.includes(option)}
                    onChange={() => handleDeliverableChange(option)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {formData.deliverables_required.length === 0 && (
              <p style={{ margin: '8px 0 0 0', color: '#ef4444', fontSize: 13 }}>
                Please select at least one deliverable
              </p>
            )}
          </div>

          {/* Target Categories (Optional but recommended) */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              Target Categories (Optional)
            </label>
            <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#6B7280' }}>
              Select categories to help match this offer with interested creators. Leave empty to send to all creators.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: 8,
              maxHeight: 200,
              overflowY: 'auto',
              padding: 12,
              border: '1.5px solid #e5e7eb',
              borderRadius: 8
            }}>
              {PR_CATEGORIES.map(category => {
                const isSelected = formData.target_categories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    style={{
                      padding: '6px 12px',
                      border: `1.5px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
                      borderRadius: 6,
                      background: isSelected ? '#f0fdf4' : '#fff',
                      color: isSelected ? '#10b981' : '#6B7280',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      fontSize: 12,
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            {formData.target_categories.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, color: '#10b981', marginBottom: 4 }}>
                  {formData.target_categories.length} {formData.target_categories.length === 1 ? 'category' : 'categories'} selected
                </div>
                {checkingMatches ? (
                  <div style={{ fontSize: 12, color: '#6B7280', fontStyle: 'italic' }}>
                    Checking matched creators...
                  </div>
                ) : matchedCreators && (
                  <div style={{
                    marginTop: 8,
                    padding: 12,
                    background: matchedCreators.count > 0 ? '#f0fdf4' : '#fef3c7',
                    border: `1.5px solid ${matchedCreators.count > 0 ? '#10b981' : '#fbbf24'}`,
                    borderRadius: 8
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: matchedCreators.count > 0 ? '#065f46' : '#92400e', marginBottom: 4 }}>
                      {matchedCreators.count > 0 ? (
                        <>🎯 {matchedCreators.message}</>
                      ) : (
                        <>⚠️ {matchedCreators.message}</>
                      )}
                    </div>
                    {matchedCreators.count > 0 && matchedCreators.creators && matchedCreators.creators.length > 0 && (
                      <div style={{ marginTop: 8, fontSize: 12, color: '#047857' }}>
                        <div style={{ marginBottom: 4, fontWeight: 600 }}>Preview of matched creators:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {matchedCreators.creators.slice(0, 5).map(creator => (
                            <div
                              key={creator.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '4px 8px',
                                background: '#fff',
                                borderRadius: 6,
                                border: '1px solid #d1fae5'
                              }}
                            >
                              {creator.image_profile && (
                                <img
                                  src={creator.image_profile}
                                  alt={creator.username}
                                  style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
                                />
                              )}
                              <span style={{ fontSize: 11 }}>@{creator.username}</span>
                            </div>
                          ))}
                          {matchedCreators.count > 5 && (
                            <div style={{ padding: '4px 8px', fontSize: 11, color: '#6B7280' }}>
                              +{matchedCreators.count - 5} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mandatory Requirements */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              Mandatory Requirements
            </label>
            <textarea
              value={formData.mandatory_requirements}
              onChange={(e) => setFormData({ ...formData, mandatory_requirements: e.target.value })}
              placeholder="e.g., Must tag @YourBrand and use #YourHashtag in the post"
              rows={2}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 15,
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Content Deadline */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              Content Deadline (Days after receiving product)
            </label>
            <select
              value={formData.content_deadline_days}
              onChange={(e) => setFormData({ ...formData, content_deadline_days: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 15,
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fff'
              }}
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={21}>21 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 14
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                background: '#fff',
                color: '#6B7280',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 15
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: 8,
                background: loading ? '#d1fae5' : '#10b981',
                color: loading ? '#6b7280' : '#fff',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 15
              }}
            >
              {loading ? 'Sending...' : 'Send Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PROfferForm;

