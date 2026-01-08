import React, { useState } from 'react';
import { apiClient } from '../config/api';
import { FaCheckCircle, FaTimes, FaTruck, FaBox, FaVideo, FaCheck, FaClock, FaUser, FaEye, FaMapMarkerAlt } from 'react-icons/fa';
import { Modal, Input, message } from 'antd';
import PRProjectTracker from './PRProjectTracker';

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

const BrandPROfferCard = ({ offer, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTracker, setShowTracker] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showContentModal, setShowContentModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);

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
        padding: '6px 12px',
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

  const handleShip = async () => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/api/pr-offers/${offer.id}/ship`, {
        tracking_number: trackingNumber
      });

      if (response.status === 200) {
        message.success('Product marked as shipped!');
        setShowShipModal(false);
        setTrackingNumber('');
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Error shipping product:', err);
      setError(err.response?.data?.error || 'Failed to mark as shipped');
      message.error(err.response?.data?.error || 'Failed to mark as shipped');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/api/pr-offers/${offer.id}/complete`);

      if (response.status === 200) {
        message.success('Project marked as complete!');
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Error completing project:', err);
      setError(err.response?.data?.error || 'Failed to mark as complete');
      message.error(err.response?.data?.error || 'Failed to mark as complete');
    } finally {
      setLoading(false);
    }
  };

  const getActionButtons = () => {
    const buttons = [];

    // View Creator Profile (always available)
    if (offer.creator_username) {
      buttons.push(
        <button
          key="view-profile"
          onClick={() => window.open(`/c/${offer.creator_username}`, '_blank')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            border: '1.5px solid #e5e7eb',
            borderRadius: 8,
            background: '#fff',
            color: '#6B7280',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 13,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#10b981';
            e.currentTarget.style.background = '#f9fafb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.background = '#fff';
          }}
        >
          <FaUser />
          View Creator Profile
        </button>
      );
    }

    // View Shipping Address (when offer is accepted or later)
    if (['accepted', 'awaiting_shipment', 'shipped', 'product_received', 'content_in_progress', 'content_submitted'].includes(offer.status) && offer.shipping_address) {
      buttons.push(
        <button
          key="view-shipping"
          onClick={() => setShowShippingModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            border: '1.5px solid #3b82f6',
            borderRadius: 8,
            background: '#fff',
            color: '#3b82f6',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 13,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#eff6ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff';
          }}
        >
          <FaMapMarkerAlt />
          View Shipping Address
        </button>
      );
    }

    // Mark as Shipped (when awaiting shipment)
    if (offer.status === 'awaiting_shipment') {
      buttons.push(
        <button
          key="ship"
          onClick={() => setShowShipModal(true)}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            border: 'none',
            borderRadius: 8,
            background: '#10b981',
            color: '#fff',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 13,
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#059669';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#10b981';
            }
          }}
        >
          <FaTruck />
          Mark as Shipped
        </button>
      );
    }

    // View Content (when content is submitted)
    const submissions = typeof offer.content_submissions === 'string' 
      ? JSON.parse(offer.content_submissions || '[]')
      : (offer.content_submissions || []);
    
    if (offer.status === 'content_submitted' && submissions.length > 0) {
      buttons.push(
        <button
          key="view-content"
          onClick={() => setShowContentModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            border: '1.5px solid #3b82f6',
            borderRadius: 8,
            background: '#fff',
            color: '#3b82f6',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 13,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#eff6ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff';
          }}
        >
          <FaEye />
          View Content
        </button>
      );
    }

    // Mark as Complete (when content is submitted)
    if (offer.status === 'content_submitted') {
      buttons.push(
        <button
          key="complete"
          onClick={handleComplete}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            border: 'none',
            borderRadius: 8,
            background: '#10b981',
            color: '#fff',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 13,
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#059669';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#10b981';
            }
          }}
        >
          <FaCheckCircle />
          Mark as Complete
        </button>
      );
    }

    // View Project Tracker (for active offers)
    if (['accepted', 'awaiting_shipment', 'shipped', 'product_received', 'content_in_progress', 'content_submitted'].includes(offer.status)) {
      buttons.push(
        <button
          key="tracker"
          onClick={() => setShowTracker(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            border: '1.5px solid #e5e7eb',
            borderRadius: 8,
            background: '#fff',
            color: '#6B7280',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 13,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#10b981';
            e.currentTarget.style.background = '#f9fafb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.background = '#fff';
          }}
        >
          <FaBox />
          Track Project
        </button>
      );
    }

    return buttons;
  };

  return (
    <>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700 }}>{offer.offer_title}</h3>
            {offer.creator_username && (
              <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: 14 }}>
                To: <strong>@{offer.creator_username}</strong>
              </p>
            )}
          </div>
          {getStatusBadge(offer.status)}
        </div>

        <div style={{ marginBottom: 12 }}>
          <p style={{ margin: 0, color: '#4B5563', fontSize: 14 }}>
            <strong>Products:</strong> {offer.products_offered}
          </p>
          {offer.products_value && (
            <p style={{ margin: '4px 0 0 0', color: '#10b981', fontSize: 14, fontWeight: 600 }}>
              Value: ${parseFloat(offer.products_value).toFixed(2)}
            </p>
          )}
        </div>

        {offer.tracking_number && (
          <div style={{
            padding: 12,
            background: '#f0fdf4',
            border: '1.5px solid #10b981',
            borderRadius: 8,
            marginBottom: 12
          }}>
            <p style={{ margin: 0, fontSize: 13, color: '#065f46' }}>
              <strong>Tracking Number:</strong> {offer.tracking_number}
            </p>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 12,
            fontSize: 13
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {getActionButtons()}
        </div>
      </div>

      {/* Ship Product Modal */}
      <Modal
        title="Mark Product as Shipped"
        open={showShipModal}
        onCancel={() => {
          setShowShipModal(false);
          setTrackingNumber('');
          setError(null);
        }}
        onOk={handleShip}
        confirmLoading={loading}
        okText="Mark as Shipped"
        okButtonProps={{
          style: {
            background: '#10b981',
            borderColor: '#10b981'
          }
        }}
        width={600}
      >
        {(() => {
          let shippingAddress = offer.shipping_address;
          if (typeof shippingAddress === 'string') {
            try {
              shippingAddress = JSON.parse(shippingAddress);
            } catch (e) {
              shippingAddress = null;
            }
          }

          return (
            <div>
              {shippingAddress && (
                <div style={{
                  padding: 16,
                  background: '#f0fdf4',
                  border: '1.5px solid #10b981',
                  borderRadius: 8,
                  marginBottom: 20
                }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#065f46' }}>
                    Shipping To:
                  </h4>
                  <div style={{ fontSize: 13, color: '#047857', lineHeight: 1.6 }}>
                    {shippingAddress.full_name && (
                      <p style={{ margin: '0 0 4px 0', fontWeight: 600 }}>
                        {shippingAddress.full_name}
                      </p>
                    )}
                    <p style={{ margin: '0 0 4px 0' }}>
                      {shippingAddress.address_line1}
                      {shippingAddress.address_line2 && `, ${shippingAddress.address_line2}`}
                    </p>
                    <p style={{ margin: '0 0 4px 0' }}>
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
                    </p>
                    <p style={{ margin: 0 }}>
                      {shippingAddress.country}
                    </p>
                  </div>
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  Tracking Number (Optional)
                </label>
                <Input
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onPressEnter={handleShip}
                />
              </div>
              {error && (
                <div style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  padding: '12px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  marginTop: 12
                }}>
                  {error}
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* Content Submission Modal */}
      <Modal
        title="Submitted Content"
        open={showContentModal}
        onCancel={() => setShowContentModal(false)}
        footer={[
          <button
            key="close"
            onClick={() => setShowContentModal(false)}
            style={{
              padding: '8px 16px',
              border: '1.5px solid #e5e7eb',
              borderRadius: 8,
              background: '#fff',
              color: '#6B7280',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            Close
          </button>
        ]}
        width={800}
      >
        {(() => {
          const submissions = typeof offer.content_submissions === 'string' 
            ? JSON.parse(offer.content_submissions || '[]')
            : (offer.content_submissions || []);
          
          return submissions.length > 0 ? (
            <div>
              {submissions.map((submission, index) => (
              <div key={index} style={{
                padding: 16,
                background: '#f9fafb',
                borderRadius: 8,
                marginBottom: 12
              }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 15, fontWeight: 600 }}>
                  {submission.deliverable_type}
                </h4>
                {submission.content_url && (
                  <div style={{ marginTop: 8 }}>
                    <a
                      href={ensureAbsoluteUrl(submission.content_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        // Ensure we always open the absolute URL, even if React Router tries to intercept
                        const absoluteUrl = ensureAbsoluteUrl(submission.content_url);
                        if (absoluteUrl && absoluteUrl !== '#') {
                          window.open(absoluteUrl, '_blank', 'noopener,noreferrer');
                          e.preventDefault();
                        }
                      }}
                      style={{
                        color: '#3b82f6',
                        textDecoration: 'none',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      View Content →
                    </a>
                  </div>
                )}
                {submission.submitted_at && (
                  <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#6B7280' }}>
                    Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6B7280' }}>No content submissions available.</p>
          );
        })()}
      </Modal>

      {/* Project Tracker Modal */}
      {showTracker && (
        <Modal
          title="PR Project Tracker"
          open={showTracker}
          onCancel={() => setShowTracker(false)}
          footer={null}
          width={800}
        >
          <PRProjectTracker offer={offer} userRole="brand" />
        </Modal>
      )}

      {/* Shipping Address Modal */}
      <Modal
        title="Creator Shipping Address"
        open={showShippingModal}
        onCancel={() => setShowShippingModal(false)}
        footer={[
          <button
            key="close"
            onClick={() => setShowShippingModal(false)}
            style={{
              padding: '8px 16px',
              border: '1.5px solid #e5e7eb',
              borderRadius: 8,
              background: '#fff',
              color: '#6B7280',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 13
            }}
          >
            Close
          </button>
        ]}
        width={600}
      >
        {(() => {
          let shippingAddress = offer.shipping_address;
          if (typeof shippingAddress === 'string') {
            try {
              shippingAddress = JSON.parse(shippingAddress);
            } catch (e) {
              shippingAddress = null;
            }
          }

          let sizePreferences = offer.size_preferences;
          if (typeof sizePreferences === 'string') {
            try {
              sizePreferences = JSON.parse(sizePreferences);
            } catch (e) {
              sizePreferences = null;
            }
          }

          if (!shippingAddress) {
            return (
              <p style={{ color: '#6B7280', textAlign: 'center', padding: '20px 0' }}>
                Shipping address not available yet.
              </p>
            );
          }

          return (
            <div>
              <div style={{
                padding: 16,
                background: '#f9fafb',
                borderRadius: 8,
                marginBottom: 16,
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 15, fontWeight: 600, color: '#1F2937' }}>
                  Shipping Address
                </h4>
                <div style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.8 }}>
                  {shippingAddress.full_name && (
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600 }}>
                      {shippingAddress.full_name}
                    </p>
                  )}
                  <p style={{ margin: '0 0 4px 0' }}>
                    {shippingAddress.address_line1}
                  </p>
                  {shippingAddress.address_line2 && (
                    <p style={{ margin: '0 0 4px 0' }}>
                      {shippingAddress.address_line2}
                    </p>
                  )}
                  <p style={{ margin: '0 0 4px 0' }}>
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
                  </p>
                  <p style={{ margin: '0 0 4px 0' }}>
                    {shippingAddress.country}
                  </p>
                  {shippingAddress.phone && (
                    <p style={{ margin: '8px 0 0 0', color: '#6B7280', fontSize: 13 }}>
                      <strong>Phone:</strong> {shippingAddress.phone}
                    </p>
                  )}
                  {shippingAddress.notes && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: 13, fontWeight: 600, color: '#6B7280' }}>
                        Delivery Instructions:
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: '#4B5563' }}>
                        {shippingAddress.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {sizePreferences && (
                <div style={{
                  padding: 16,
                  background: '#f9fafb',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: 15, fontWeight: 600, color: '#1F2937' }}>
                    Size Preferences
                  </h4>
                  <div style={{ fontSize: 14, color: '#4B5563' }}>
                    {sizePreferences.clothing && (
                      <div style={{ marginBottom: 8 }}>
                        <strong>Clothing:</strong>
                        <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                          {sizePreferences.clothing.shirt && (
                            <li>Shirt: {sizePreferences.clothing.shirt}</li>
                          )}
                          {sizePreferences.clothing.pants && (
                            <li>Pants: {sizePreferences.clothing.pants}</li>
                          )}
                          {sizePreferences.clothing.shoes && (
                            <li>Shoes: {sizePreferences.clothing.shoes}</li>
                          )}
                        </ul>
                      </div>
                    )}
                    {sizePreferences.skincare && (
                      <p style={{ margin: '4px 0' }}>
                        <strong>Skincare Type:</strong> {sizePreferences.skincare}
                      </p>
                    )}
                    {sizePreferences.other && (
                      <p style={{ margin: '4px 0' }}>
                        <strong>Other Preferences:</strong> {sizePreferences.other}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </>
  );
};

export default BrandPROfferCard;

