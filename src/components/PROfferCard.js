import React, { useState, useEffect } from 'react';
import { apiClient } from '../config/api';
import { FaGift, FaCheckCircle, FaTimes, FaTruck, FaBox, FaVideo, FaCheck, FaClock } from 'react-icons/fa';
import PRProjectTracker from './PRProjectTracker';
import ShippingAddressForm from './ShippingAddressForm';
import PRPartnershipAgreement from './PRPartnershipAgreement';

const PROfferCard = ({ offer, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTracker, setShowTracker] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [savedShippingAddress, setSavedShippingAddress] = useState(null);
  const [creatorName, setCreatorName] = useState('');

  // Fetch saved shipping address and creator name from profile
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await apiClient.get('/profile');
        if (response.data?.shipping_address) {
          setSavedShippingAddress(response.data.shipping_address);
        }
        // Get creator name
        if (response.data?.display_name) {
          setCreatorName(response.data.display_name);
        } else if (response.data?.first_name || response.data?.last_name) {
          setCreatorName(`${response.data.first_name || ''} ${response.data.last_name || ''}`.trim());
        } else if (response.data?.username) {
          setCreatorName(response.data.username);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
      }
    };
    fetchProfileData();
  }, []);

  const handleAcceptClick = () => {
    // Show agreement modal first
    setShowAgreement(true);
  };

  const handleAgreementAccept = async () => {
    // After agreement is accepted, always show shipping form
    // This allows users to confirm/update their address and provide size preferences
    setShowAgreement(false);
    setShowShippingForm(true);
  };

  const handleAccept = async (shippingData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post(`/api/pr-offers/${offer.id}/accept`, {
        shipping_address: shippingData.shipping_address,
        size_preferences: shippingData.size_preferences,
        saveToProfile: shippingData.saveToProfile,
        terms_accepted: true // Indicate terms were accepted
      });
      
      if (response.status === 200) {
        setShowShippingForm(false);
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Error accepting PR offer:', err);
      setError(err.response?.data?.error || 'Failed to accept offer');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post(`/api/pr-offers/${offer.id}/decline`, {
        declined_reason: declineReason.trim() || null
      });
      
      if (response.status === 200) {
        setShowDeclineModal(false);
        setDeclineReason('');
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Error declining PR offer:', err);
      setError(err.response?.data?.error || 'Failed to decline offer');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', color: '#f59e0b', bg: '#fef3c7', icon: <FaClock /> },
      accepted: { label: 'Accepted', color: '#10b981', bg: '#d1fae5', icon: <FaCheckCircle /> },
      declined: { label: 'Declined', color: '#ef4444', bg: '#fee2e2', icon: <FaTimes /> },
      awaiting_shipment: { label: 'Awaiting Shipment', color: '#3b82f6', bg: '#dbeafe', icon: <FaClock /> },
      shipped: { label: 'Shipped', color: '#8b5cf6', bg: '#e9d5ff', icon: <FaTruck /> },
      product_received: { label: 'Product Received', color: '#10b981', bg: '#d1fae5', icon: <FaBox /> },
      content_in_progress: { label: 'Content in Progress', color: '#f59e0b', bg: '#fef3c7', icon: <FaVideo /> },
      content_submitted: { label: 'Content Submitted', color: '#3b82f6', bg: '#dbeafe', icon: <FaCheck /> },
      completed: { label: 'Completed', color: '#10b981', bg: '#d1fae5', icon: <FaCheckCircle /> }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 12,
        background: config.bg,
        color: config.color,
        fontSize: 12,
        fontWeight: 600
      }}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const deliverables = typeof offer.deliverables_required === 'string' 
    ? JSON.parse(offer.deliverables_required) 
    : offer.deliverables_required || [];

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb',
      marginBottom: 16
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <FaGift style={{ fontSize: 20, color: '#10b981' }} />
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{offer.offer_title}</h3>
          </div>
          {offer.brand_name && (
            <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: 14 }}>
              from <strong>{offer.brand_name}</strong>
            </p>
          )}
        </div>
        {getStatusBadge(offer.status)}
      </div>

      {/* Products Offered */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
          Products Offered:
        </h4>
        <p style={{ margin: 0, color: '#4B5563', fontSize: 14, lineHeight: 1.6 }}>
          {offer.products_offered}
        </p>
        {offer.products_value && (
          <p style={{ margin: '4px 0 0 0', color: '#10b981', fontSize: 14, fontWeight: 600 }}>
            Total Value: ${parseFloat(offer.products_value).toFixed(2)}
          </p>
        )}
      </div>

      {/* Deliverables */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
          Deliverables Required:
        </h4>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#4B5563', fontSize: 14 }}>
          {deliverables.map((deliverable, idx) => (
            <li key={idx} style={{ marginBottom: 4 }}>{deliverable}</li>
          ))}
        </ul>
      </div>

      {/* Mandatory Requirements */}
      {offer.mandatory_requirements && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
            Mandatory Requirements:
          </h4>
          <p style={{ margin: 0, color: '#4B5563', fontSize: 14, lineHeight: 1.6 }}>
            {offer.mandatory_requirements}
          </p>
        </div>
      )}

      {/* Deadline */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, color: '#6B7280', fontSize: 13 }}>
          <strong>Content Deadline:</strong> {offer.content_deadline_days} days after receiving product
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 14
        }}>
          {error}
        </div>
      )}

      {/* Actions */}
      {offer.status === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleAcceptClick}
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
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <FaCheckCircle />
              {loading ? 'Processing...' : 'Accept Offer'}
            </button>
            <button
              onClick={() => {
                setDeclineReason('');
                setError(null);
                setShowDeclineModal(true);
              }}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 20px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                background: '#fff',
                color: '#6B7280',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = '#ef4444';
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.background = '#fef2f2';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#6B7280';
                  e.currentTarget.style.background = '#fff';
                }
              }}
            >
              <FaTimes />
              Decline
            </button>
          </div>
        </div>
      )}

      {/* View Tracker Button for Active Projects */}
      {['accepted', 'awaiting_shipment', 'shipped', 'product_received', 'content_in_progress', 'content_submitted'].includes(offer.status) && (
        <button
          onClick={() => setShowTracker(!showTracker)}
          style={{
            width: '100%',
            padding: '10px 20px',
            border: '1.5px solid #10b981',
            borderRadius: 8,
            background: '#fff',
            color: '#10b981',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
            marginTop: 12
          }}
        >
          {showTracker ? 'Hide' : 'View'} Project Tracker
        </button>
      )}

      {/* Project Tracker */}
      {showTracker && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
          <PRProjectTracker offer={offer} onUpdate={onUpdate} />
        </div>
      )}

      {/* Partnership Agreement Modal */}
      <PRPartnershipAgreement
        offer={offer}
        brandName={offer.brand_name || 'Brand'}
        creatorName={creatorName || 'Creator'}
        open={showAgreement}
        onAccept={handleAgreementAccept}
        onCancel={() => setShowAgreement(false)}
        isPreview={false}
      />

      {/* Shipping Address Form Modal */}
      {showShippingForm && (
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
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            maxWidth: 600,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 700 }}>
                Shipping Address Required
              </h3>
              <p style={{ margin: 0, color: '#6B7280', fontSize: 14 }}>
                Please provide your shipping address to accept this PR package offer.
              </p>
            </div>
            <ShippingAddressForm
              initialData={savedShippingAddress}
              onSave={handleAccept}
              onCancel={() => setShowShippingForm(false)}
              showSizePreferences={true}
              saveToProfile={true}
            />
          </div>
        </div>
      )}

      {/* Decline Reason Modal */}
      {showDeclineModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeclineModal(false);
              setDeclineReason('');
              setError(null);
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: 20
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 0,
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px 24px 16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#1f2937'
                }}>
                  Decline PR Offer
                </h3>
                <button
                  onClick={() => {
                    setShowDeclineModal(false);
                    setDeclineReason('');
                    setError(null);
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: 24,
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: 4,
                    lineHeight: 1,
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f3f4f6';
                    e.target.style.color = '#6b7280';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#9ca3af';
                  }}
                >
                  ×
                </button>
              </div>
              <p style={{
                margin: 0,
                fontSize: 14,
                color: '#6b7280',
                lineHeight: 1.5
              }}>
                Help us improve by sharing why you're declining this offer (optional)
              </p>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px' }}>
              {error && (
                <div style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  padding: '12px 16px',
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: 14
                }}>
                  {error}
                </div>
              )}
              
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 8
              }}>
                Reason (Optional)
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g., Not aligned with my content, Too many deliverables, Timing doesn't work..."
                style={{
                  width: '100%',
                  minHeight: 100,
                  padding: '12px 16px',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 12,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#26A69A';
                  e.target.style.boxShadow = '0 0 0 3px rgba(38, 166, 154, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <p style={{
                margin: '8px 0 0 0',
                fontSize: 12,
                color: '#9ca3af'
              }}>
                Your feedback helps brands create better offers
              </p>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px 24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason('');
                  setError(null);
                }}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 10,
                  background: '#fff',
                  color: '#6b7280',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.background = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = '#fff';
                  }
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  border: 'none',
                  borderRadius: 10,
                  background: loading ? '#d1d5db' : '#ef4444',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = '#dc2626';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = '#ef4444';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {loading ? 'Declining...' : 'Decline Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default PROfferCard;

