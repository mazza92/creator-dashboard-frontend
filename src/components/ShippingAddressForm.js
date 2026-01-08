import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaUser, FaPhone, FaInfoCircle } from 'react-icons/fa';

const ShippingAddressForm = ({ 
  initialData = null, 
  onSave, 
  onCancel, 
  showSizePreferences = false,
  saveToProfile = false 
}) => {
  const [formData, setFormData] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    phone: '',
    notes: '',
    // Size preferences
    shirt_size: '',
    pants_size: '',
    shoe_size: '',
    skincare_type: '',
    other_preferences: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      // If initialData is a string (JSON), parse it
      const data = typeof initialData === 'string' ? JSON.parse(initialData) : initialData;
      setFormData(prev => ({
        ...prev,
        ...data,
        // Handle nested size preferences
        shirt_size: data.size_preferences?.clothing?.shirt || data.shirt_size || '',
        pants_size: data.size_preferences?.clothing?.pants || data.pants_size || '',
        shoe_size: data.size_preferences?.clothing?.shoes || data.shoe_size || '',
        skincare_type: data.size_preferences?.skincare || data.skincare_type || '',
        other_preferences: data.size_preferences?.other || data.other_preferences || ''
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.address_line1.trim()) newErrors.address_line1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State/Province is required';
    if (!formData.zip.trim()) newErrors.zip = 'ZIP/Postal code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    
    try {
      const shippingAddress = {
        full_name: formData.full_name,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2 || null,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country,
        phone: formData.phone || null,
        notes: formData.notes || null
      };

      const sizePreferences = showSizePreferences ? {
        clothing: {
          shirt: formData.shirt_size || null,
          pants: formData.pants_size || null,
          shoes: formData.shoe_size || null
        },
        skincare: formData.skincare_type || null,
        other: formData.other_preferences || null
      } : null;

      await onSave({
        shipping_address: shippingAddress,
        size_preferences: sizePreferences,
        shipping_phone: formData.phone || null,
        shipping_notes: formData.notes || null,
        saveToProfile
      });
    } catch (err) {
      console.error('Error saving shipping address:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Full Name */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
          <FaUser style={{ fontSize: 14 }} />
          Full Name *
        </label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          placeholder="John Doe"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: `1.5px solid ${errors.full_name ? '#ef4444' : '#e5e7eb'}`,
            borderRadius: 8,
            fontSize: 14,
            transition: 'border-color 0.2s'
          }}
        />
        {errors.full_name && (
          <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.full_name}</div>
        )}
      </div>

      {/* Address Line 1 */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
          <FaMapMarkerAlt style={{ fontSize: 14 }} />
          Street Address *
        </label>
        <input
          type="text"
          name="address_line1"
          value={formData.address_line1}
          onChange={handleChange}
          placeholder="123 Main Street"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: `1.5px solid ${errors.address_line1 ? '#ef4444' : '#e5e7eb'}`,
            borderRadius: 8,
            fontSize: 14
          }}
        />
        {errors.address_line1 && (
          <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.address_line1}</div>
        )}
      </div>

      {/* Address Line 2 */}
      <div>
        <label style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
          Apartment, Suite, etc. (Optional)
        </label>
        <input
          type="text"
          name="address_line2"
          value={formData.address_line2}
          onChange={handleChange}
          placeholder="Apt 4B"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1.5px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 14
          }}
        />
      </div>

      {/* City, State, ZIP */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="New York"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1.5px solid ${errors.city ? '#ef4444' : '#e5e7eb'}`,
              borderRadius: 8,
              fontSize: 14
            }}
          />
          {errors.city && (
            <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.city}</div>
          )}
        </div>
        <div>
          <label style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
            State *
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="NY"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1.5px solid ${errors.state ? '#ef4444' : '#e5e7eb'}`,
              borderRadius: 8,
              fontSize: 14
            }}
          />
          {errors.state && (
            <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.state}</div>
          )}
        </div>
        <div>
          <label style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
            ZIP *
          </label>
          <input
            type="text"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            placeholder="10001"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1.5px solid ${errors.zip ? '#ef4444' : '#e5e7eb'}`,
              borderRadius: 8,
              fontSize: 14
            }}
          />
          {errors.zip && (
            <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.zip}</div>
          )}
        </div>
      </div>

      {/* Country */}
      <div>
        <label style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
          Country *
        </label>
        <select
          name="country"
          value={formData.country}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: `1.5px solid ${errors.country ? '#ef4444' : '#e5e7eb'}`,
            borderRadius: 8,
            fontSize: 14
          }}
        >
          <option value="United States">United States</option>
          <option value="Canada">Canada</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Australia">Australia</option>
          <option value="Germany">Germany</option>
          <option value="France">France</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Phone */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
          <FaPhone style={{ fontSize: 14 }} />
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 (555) 123-4567"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1.5px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 14
          }}
        />
      </div>

      {/* Size Preferences (if enabled) */}
      {showSizePreferences && (
        <div style={{ 
          marginTop: 8, 
          padding: 16, 
          background: '#f9fafb', 
          borderRadius: 8, 
          border: '1px solid #e5e7eb' 
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
            Size Preferences (Optional)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ marginBottom: 8, fontSize: 13, color: '#6B7280' }}>Shirt Size</label>
              <input
                type="text"
                name="shirt_size"
                value={formData.shirt_size}
                onChange={handleChange}
                placeholder="M"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 13
                }}
              />
            </div>
            <div>
              <label style={{ marginBottom: 8, fontSize: 13, color: '#6B7280' }}>Pants Size</label>
              <input
                type="text"
                name="pants_size"
                value={formData.pants_size}
                onChange={handleChange}
                placeholder="32"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 13
                }}
              />
            </div>
            <div>
              <label style={{ marginBottom: 8, fontSize: 13, color: '#6B7280' }}>Shoe Size</label>
              <input
                type="text"
                name="shoe_size"
                value={formData.shoe_size}
                onChange={handleChange}
                placeholder="10"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 13
                }}
              />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ marginBottom: 8, fontSize: 13, color: '#6B7280' }}>Skincare Type</label>
            <input
              type="text"
              name="skincare_type"
              value={formData.skincare_type}
              onChange={handleChange}
              placeholder="sensitive, oily, dry, etc."
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 6,
                fontSize: 13
              }}
            />
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
          <FaInfoCircle style={{ fontSize: 14 }} />
          Delivery Instructions (Optional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Leave at front door, ring doorbell, etc."
          rows={3}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1.5px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 14,
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Save to Profile Checkbox */}
      {saveToProfile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            id="saveToProfile"
            checked={formData.saveToProfile}
            onChange={(e) => setFormData(prev => ({ ...prev, saveToProfile: e.target.checked }))}
            style={{ width: 16, height: 16, cursor: 'pointer' }}
          />
          <label htmlFor="saveToProfile" style={{ fontSize: 13, color: '#6B7280', cursor: 'pointer' }}>
            Save this address to my profile for future PR packages
          </label>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px 20px',
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
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px 20px',
            border: 'none',
            borderRadius: 8,
            background: loading ? '#d1fae5' : '#10b981',
            color: loading ? '#6b7280' : '#fff',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 14
          }}
        >
          {loading ? 'Saving...' : 'Save Address'}
        </button>
      </div>
    </form>
  );
};

export default ShippingAddressForm;

