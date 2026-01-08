import React, { useEffect, useState } from 'react';
import { apiClient } from '../config/api';
import PROfferCard from '../components/PROfferCard';
import PRWishlistSettings from '../components/PRWishlistSettings';
import { FaGift, FaInbox, FaCog, FaCheckCircle } from 'react-icons/fa';
import { Modal } from 'antd';

const PROffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, active, completed
  const [showPRWishlist, setShowPRWishlist] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setWishlistLoading(true);
      const response = await apiClient.get('/api/creator/pr-wishlist');
      if (response.status === 200) {
        setWishlist(response.data.wishlist || []);
      }
    } catch (err) {
      console.error('Error fetching PR wishlist:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/pr-offers');
      if (response.status === 200) {
        setOffers(response.data);
      }
    } catch (err) {
      console.error('Error fetching PR offers:', err);
      setError(err.response?.data?.error || 'Failed to load PR offers');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOffers = () => {
    if (filter === 'all') return offers;
    if (filter === 'pending') return offers.filter(o => o.status === 'pending');
    if (filter === 'active') {
      return offers.filter(o => [
        'accepted', 'awaiting_shipment', 'shipped', 'product_received', 
        'content_in_progress', 'content_submitted'
      ].includes(o.status));
    }
    if (filter === 'completed') return offers.filter(o => o.status === 'completed');
    return offers;
  };

  const filteredOffers = getFilteredOffers();

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 16, color: '#6B7280' }}>Loading PR offers...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FaGift style={{ fontSize: 32, color: '#10b981' }} />
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>PR Package Offers</h1>
              <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: 16 }}>
                Manage your PR package collaborations with brands
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPRWishlist(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              border: '1.5px solid #10b981',
              borderRadius: 8,
              background: wishlist.length > 0 ? '#f0fdf4' : '#fff',
              color: '#10b981',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0fdf4';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = wishlist.length > 0 ? '#f0fdf4' : '#fff';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <FaCog />
            {wishlist.length > 0 ? (
              <>
                <FaCheckCircle style={{ fontSize: 12 }} />
                PR Preferences
              </>
            ) : (
              'Set PR Preferences'
            )}
          </button>
        </div>
      </div>

      {/* PR Preferences Setup Banner */}
      {!wishlistLoading && wishlist.length === 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '1.5px solid #fbbf24',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ flex: 1, minWidth: 250 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700, color: '#92400e' }}>
              🎯 Set Your PR Preferences
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: '#78350f', lineHeight: 1.6 }}>
              Select the categories you're interested in to receive relevant PR package offers from brands. 
              This helps brands find you for the right collaborations!
            </p>
          </div>
          <button
            onClick={() => setShowPRWishlist(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: 8,
              background: '#10b981',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 15,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#059669';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#10b981';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <FaCog />
            Set Preferences Now
          </button>
        </div>
      )}

      {/* PR Preferences Status (if set) */}
      {!wishlistLoading && wishlist.length > 0 && (
        <div style={{
          background: '#f0fdf4',
          border: '1.5px solid #10b981',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FaCheckCircle style={{ fontSize: 20, color: '#10b981' }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#065f46', marginBottom: 4 }}>
                PR Preferences Active
              </div>
              <div style={{ fontSize: 13, color: '#047857' }}>
                You're receiving offers for: {wishlist.slice(0, 3).join(', ')}
                {wishlist.length > 3 && ` +${wishlist.length - 3} more`}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowPRWishlist(true)}
            style={{
              padding: '8px 16px',
              border: '1.5px solid #10b981',
              borderRadius: 6,
              background: '#fff',
              color: '#10b981',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 13,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0fdf4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff';
            }}
          >
            Edit Preferences
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        marginBottom: 24,
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'all', label: 'All Offers' },
          { key: 'pending', label: 'Pending' },
          { key: 'active', label: 'Active' },
          { key: 'completed', label: 'Completed' }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '8px 16px',
              border: `1.5px solid ${filter === f.key ? '#10b981' : '#e5e7eb'}`,
              borderRadius: 8,
              background: filter === f.key ? '#10b981' : '#fff',
              color: filter === f.key ? '#fff' : '#6B7280',
              fontWeight: filter === f.key ? 700 : 600,
              cursor: 'pointer',
              fontSize: 14,
              transition: 'all 0.2s'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '16px 20px',
          borderRadius: 8,
          marginBottom: 24,
          fontSize: 14
        }}>
          {error}
        </div>
      )}

      {/* Offers List */}
      {filteredOffers.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '64px 24px',
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e5e7eb'
        }}>
          <FaInbox style={{ fontSize: 48, color: '#d1d5db', marginBottom: 16 }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: '#1F2937' }}>
            No {filter !== 'all' ? filter : ''} PR offers yet
          </h3>
          <p style={{ margin: 0, color: '#6B7280', fontSize: 14 }}>
            {filter === 'all' 
              ? 'You haven\'t received any PR package offers yet. Brands will see your profile and send you offers!'
              : `You don't have any ${filter} PR offers at the moment.`}
          </p>
        </div>
      ) : (
        <div>
          {filteredOffers.map(offer => (
            <PROfferCard
              key={offer.id}
              offer={offer}
              onUpdate={fetchOffers}
            />
          ))}
        </div>
      )}

      {/* PR Wishlist Settings Modal */}
      <Modal
        title="PR Package Preferences"
        open={showPRWishlist}
        onCancel={() => setShowPRWishlist(false)}
        footer={null}
        width={800}
      >
        <PRWishlistSettings
          onUpdate={(updatedWishlist) => {
            setWishlist(updatedWishlist);
            setShowPRWishlist(false);
            fetchOffers(); // Refresh offers to show newly matched ones
          }}
        />
      </Modal>
    </div>
  );
};

export default PROffers;

