import React, { useState } from 'react';
import { Modal, Checkbox } from 'antd';
import { FaFileContract, FaCheckCircle } from 'react-icons/fa';

const PRPartnershipAgreement = ({ 
  offer, 
  brandName, 
  creatorName, 
  open, 
  onAccept, 
  onCancel,
  isPreview = false 
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!agreedToTerms && !isPreview) {
      return;
    }
    setLoading(true);
    try {
      await onAccept();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const deadlineDate = offer?.product_received_at 
    ? new Date(new Date(offer.product_received_at).getTime() + (offer.content_deadline_days || 14) * 24 * 60 * 60 * 1000)
    : null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaFileContract style={{ fontSize: 20, color: '#10b981' }} />
          <span style={{ fontSize: 18, fontWeight: 700 }}>
            {isPreview ? 'Partnership Agreement Preview' : 'Partnership Agreement'}
          </span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      centered
      zIndex={10001}
      styles={{ mask: { zIndex: 10000 } }}
    >
      <div style={{ padding: '8px 0' }}>
        {/* Agreement Content */}
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 20,
          marginBottom: 24,
          maxHeight: 400,
          overflowY: 'auto'
        }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 700, color: '#1F2937' }}>
              PR Package Partnership Agreement
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
              <strong>Date:</strong> {formatDate(new Date())}
            </p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 700, color: '#1F2937' }}>
              Parties
            </h4>
            <p style={{ margin: '0 0 12px 0', fontSize: 13, color: '#4B5563', lineHeight: 1.6 }}>
              <strong>Brand:</strong> {brandName || 'Brand Name'}<br />
              <strong>Creator:</strong> {creatorName || 'Creator Name'}
            </p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 700, color: '#1F2937' }}>
              Offer Details
            </h4>
            <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.8 }}>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Product/Service:</strong> {offer?.products_offered || 'N/A'}
              </p>
              {offer?.products_value && (
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Estimated Value:</strong> ${parseFloat(offer.products_value).toFixed(2)}
                </p>
              )}
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Deliverables Required:</strong> {offer?.deliverables_required?.join(', ') || 'N/A'}
              </p>
              {offer?.mandatory_requirements && (
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Mandatory Requirements:</strong> {offer.mandatory_requirements}
                </p>
              )}
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Content Deadline:</strong> {offer?.content_deadline_days || 14} days after product receipt
                {deadlineDate && ` (by ${formatDate(deadlineDate)})`}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 700, color: '#1F2937' }}>
              Terms & Conditions
            </h4>
            <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.8 }}>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>1. Product Receipt & Confirmation:</strong> The Creator agrees to confirm receipt of the PR package within a reasonable timeframe upon delivery.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>2. Content Creation & Submission:</strong> The Creator agrees to create and publish the agreed-upon deliverables within {offer?.content_deadline_days || 14} days of confirming product receipt. All content must meet the mandatory requirements specified above.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>3. Content Quality & Standards:</strong> The Creator agrees to produce original, high-quality content that accurately represents the product and adheres to all platform guidelines and applicable laws.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>4. Disclosure Requirements:</strong> The Creator agrees to include appropriate disclosure statements (e.g., #ad, #sponsored, #pr) as required by FTC guidelines and platform policies.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>5. Content Ownership:</strong> The Creator retains ownership of the content but grants the Brand a non-exclusive license to repost, share, and use the content for marketing purposes with proper attribution.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>6. Product Return Policy:</strong> Products are provided as compensation for content creation. No return is required unless otherwise specified.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>7. Failure to Deliver:</strong> If the Creator fails to deliver content within the specified deadline without prior agreement, the Brand reserves the right to request alternative arrangements or consider the collaboration incomplete.
              </p>
              <p style={{ margin: '0 0 0 0' }}>
                <strong>8. Mutual Respect:</strong> Both parties agree to maintain professional communication and respect each other's creative process and brand guidelines.
              </p>
            </div>
          </div>

          <div style={{
            padding: 12,
            background: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: 6,
            marginTop: 16
          }}>
            <p style={{ margin: 0, fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
              <strong>Note:</strong> This is a PR package collaboration agreement. By accepting, you acknowledge that you understand and agree to fulfill the deliverables as specified. Failure to meet the requirements may impact future collaboration opportunities.
            </p>
          </div>
        </div>

        {/* Terms Acceptance Checkbox (only for non-preview) */}
        {!isPreview && (
          <div style={{ marginBottom: 20 }}>
            <Checkbox
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={{ fontSize: 14 }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
                I have read and agree to the terms and conditions of this partnership agreement
              </span>
            </Checkbox>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          {!isPreview && (
            <button
              onClick={onCancel}
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                background: '#fff',
                color: '#6B7280',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 14
              }}
            >
              Cancel
            </button>
          )}
          {isPreview ? (
            <button
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: 8,
                background: '#10b981',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Close Preview
            </button>
          ) : (
            <button
              onClick={handleAccept}
              disabled={!agreedToTerms || loading}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: 8,
                background: (!agreedToTerms || loading) ? '#d1fae5' : '#10b981',
                color: (!agreedToTerms || loading) ? '#6b7280' : '#fff',
                fontWeight: 700,
                cursor: (!agreedToTerms || loading) ? 'not-allowed' : 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <FaCheckCircle />
              {loading ? 'Processing...' : 'Accept Offer & Agree to Terms'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PRPartnershipAgreement;

