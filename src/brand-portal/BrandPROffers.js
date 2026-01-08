import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../config/api';
import CreatePROffer from '../components/CreatePROffer';
import BrandPROfferCard from '../components/BrandPROfferCard';
import { FaGift, FaPlus } from 'react-icons/fa';

const BrandPROffers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [preselectedCreatorId, setPreselectedCreatorId] = useState(null);

  useEffect(() => {
    fetchOffers();
    
    // Check if we should auto-open the form with a creator_id
    const createParam = searchParams.get('create');
    const creatorId = searchParams.get('creator_id');
    
    if (createParam === 'true' && creatorId) {
      setPreselectedCreatorId(parseInt(creatorId));
      setShowCreateForm(true);
      // Clean up URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

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
                Manage your PR package collaborations with creators
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                border: 'none',
                borderRadius: 8,
                background: '#10b981',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 15,
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#059669';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#10b981';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <FaPlus />
              Create PR Offer
            </button>
          </div>
        </div>
      </div>

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
          <FaGift style={{ fontSize: 48, color: '#d1d5db', marginBottom: 16 }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: '#1F2937' }}>
            No {filter !== 'all' ? filter : ''} PR offers yet
          </h3>
          <p style={{ margin: '0 0 24px 0', color: '#6B7280', fontSize: 14 }}>
            {filter === 'all' 
              ? 'Start sending PR package offers to creators to build relationships and get content!'
              : `You don't have any ${filter} PR offers at the moment.`}
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: 8,
              background: '#10b981',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 15,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <FaPlus />
            Create Your First PR Offer
          </button>
        </div>
      ) : (
        <div>
          {filteredOffers.map(offer => (
            <BrandPROfferCard
              key={offer.id}
              offer={offer}
              onUpdate={fetchOffers}
            />
          ))}
        </div>
      )}

      {/* Create PR Offer Modal */}
      {showCreateForm && (
        <CreatePROffer
          onClose={() => {
            setShowCreateForm(false);
            setPreselectedCreatorId(null);
          }}
          onSuccess={() => {
            setShowCreateForm(false);
            setPreselectedCreatorId(null);
            fetchOffers();
          }}
          preselectedCreatorId={preselectedCreatorId}
        />
      )}
    </div>
  );
};

export default BrandPROffers;

