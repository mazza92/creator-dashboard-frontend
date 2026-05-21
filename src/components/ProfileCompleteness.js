import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiClient } from '../utils/api';

// ============================================================================
// PROFILE COMPLETENESS WIDGET - V4 Progressive data collection
// Shows users what profile items are missing and encourages completion
// ============================================================================

const colors = {
  rose: '#E11D48',
  black: '#0F0F0F',
  violet: '#7C3AED',
  green: '#059669',
  amber: '#D97706',
  border: '#E8E8E8',
  text: '#0F0F0F',
  text2: '#555',
  text3: '#999',
};

const Container = styled.div`
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const Title = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: ${colors.text};
`;

const Pct = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: ${props => props.$complete ? colors.green : colors.amber};
`;

const Track = styled.div`
  height: 4px;
  background: ${colors.border};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 14px;
`;

const Fill = styled.div`
  height: 100%;
  background: ${props => props.$complete
    ? colors.green
    : `linear-gradient(90deg, ${colors.rose}, ${colors.amber})`};
  border-radius: 4px;
  width: ${props => props.$pct}%;
  transition: width 0.4s ease;
`;

const WhyText = styled.div`
  font-size: 12px;
  color: ${colors.text3};
  margin-bottom: 12px;
  line-height: 1.5;
  strong { color: ${colors.text2}; font-weight: 700; }
`;

const Items = styled.div`
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 20px;
  border: 1.5px solid ${props => props.$done ? '#BBF7D0' : colors.border};
  background: ${props => props.$done ? '#F0FDF4' : '#fff'};
  font-size: 12px;
  font-weight: 600;
  cursor: ${props => props.$done ? 'default' : 'pointer'};
  color: ${props => props.$done ? colors.green : colors.text2};
  transition: all 0.15s;

  ${props => !props.$done && `
    &:hover {
      border-color: ${colors.black};
      color: ${colors.black};
    }
  `}
`;

// Field labels for the items
const FIELD_LABELS = {
  email: 'Email',
  username: 'Username',
  niche: 'Niche',
  profile_photo: 'Add photo',
  bio: 'Write bio',
  audience_age: 'Audience age',
  regions: 'Regions',
  name: 'Name',
};

const FIELD_ICONS = {
  email: '✓',
  username: '✓',
  niche: '✓',
  profile_photo: '📸',
  bio: '✍️',
  audience_age: '👥',
  regions: '🌍',
  name: '👤',
};

// Modal for completing items
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  margin: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 16px;
  color: ${colors.text};
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid ${colors.border};
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 12px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${colors.black};
  }
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid ${colors.border};
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 12px;
  box-sizing: border-box;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${colors.black};
  }
`;

const ModalSelect = styled.select`
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid ${colors.border};
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 12px;
  box-sizing: border-box;
  background: #fff;

  &:focus {
    outline: none;
    border-color: ${colors.black};
  }
`;

const ModalBtnRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
`;

const ModalBtn = styled.button`
  flex: 1;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;

  ${props => props.$primary ? `
    background: ${colors.black};
    color: #fff;
    border: none;
    &:hover { background: #1a1a1a; }
  ` : `
    background: #fff;
    color: ${colors.text2};
    border: 1.5px solid ${colors.border};
    &:hover { background: #f5f5f5; }
  `}
`;

const AGE_RANGES = [
  { value: '13-17', label: '13-17' },
  { value: '18-24', label: '18-24' },
  { value: '25-34', label: '25-34' },
  { value: '35-44', label: '35-44' },
  { value: '45-54', label: '45-54' },
  { value: '55+', label: '55+' },
];

const REGIONS = [
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'EU', label: 'Europe' },
  { value: 'LATAM', label: 'Latin America' },
  { value: 'ASIA', label: 'Asia' },
  { value: 'MENA', label: 'Middle East' },
  { value: 'GLOBAL', label: 'Global' },
];

export default function ProfileCompleteness({ onUpdate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const res = await apiClient.get('/api/user/profile-completeness');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch profile completeness:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleItemClick = (field) => {
    if (data?.fields[field]) return; // Already done
    setEditingField(field);
    setEditValue('');
  };

  const handleSave = async () => {
    if (!editValue.trim() && editingField !== 'regions') return;

    setSaving(true);
    try {
      const payload = {};

      if (editingField === 'bio') {
        payload.bio = editValue.trim();
      } else if (editingField === 'audience_age') {
        payload.primary_age_range = editValue;
      } else if (editingField === 'regions') {
        payload.regions = editValue ? [editValue] : [];
      } else if (editingField === 'name') {
        const [firstName, ...rest] = editValue.trim().split(' ');
        payload.first_name = firstName;
        payload.last_name = rest.join(' ') || '';
      }

      await apiClient.patch('/api/user/profile', payload);

      // Refresh data
      await fetchData();
      setEditingField(null);
      setEditValue('');

      // Notify parent
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return null;
  }

  // Don't show if profile is 100% complete
  if (data.pct >= 100) {
    return null;
  }

  const incompleteFields = Object.entries(data.fields)
    .filter(([, done]) => !done)
    .map(([field]) => field);

  return (
    <>
      <Container>
        <Header>
          <Title>Complete your profile — brands check this</Title>
          <Pct $complete={data.pct >= 100}>{data.pct}%</Pct>
        </Header>

        <Track>
          <Fill $pct={data.pct} $complete={data.pct >= 100} />
        </Track>

        <WhyText>
          A complete profile makes your pitches <strong>2× more likely to get a reply.</strong>
          {' '}Brands want to know who they're working with before they respond. Tap any item below to add it.
        </WhyText>

        <Items>
          {Object.entries(data.fields).map(([field, done]) => (
            <Item
              key={field}
              $done={done}
              onClick={() => handleItemClick(field)}
            >
              {done ? '✓' : FIELD_ICONS[field]} {FIELD_LABELS[field]}
            </Item>
          ))}
        </Items>
      </Container>

      {/* Edit Modal */}
      {editingField && (
        <ModalOverlay onClick={() => setEditingField(null)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>
              {editingField === 'bio' && 'Write your bio'}
              {editingField === 'audience_age' && 'Select your main audience age'}
              {editingField === 'regions' && 'Select your main region'}
              {editingField === 'name' && 'What\'s your name?'}
              {editingField === 'profile_photo' && 'Upload profile photo'}
            </ModalTitle>

            {editingField === 'bio' && (
              <ModalTextarea
                placeholder="Tell brands about yourself and your content..."
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                autoFocus
              />
            )}

            {editingField === 'audience_age' && (
              <ModalSelect
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                autoFocus
              >
                <option value="">Select age range...</option>
                {AGE_RANGES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </ModalSelect>
            )}

            {editingField === 'regions' && (
              <ModalSelect
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                autoFocus
              >
                <option value="">Select region...</option>
                {REGIONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </ModalSelect>
            )}

            {editingField === 'name' && (
              <ModalInput
                placeholder="Your full name"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                autoFocus
              />
            )}

            {editingField === 'profile_photo' && (
              <div style={{ textAlign: 'center', color: colors.text3, padding: '20px 0' }}>
                To update your profile photo, go to{' '}
                <a href="/creator/dashboard/profile" style={{ color: colors.violet }}>Profile Settings</a>
              </div>
            )}

            <ModalBtnRow>
              <ModalBtn onClick={() => setEditingField(null)}>Cancel</ModalBtn>
              {editingField !== 'profile_photo' && (
                <ModalBtn $primary onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </ModalBtn>
              )}
            </ModalBtnRow>
          </Modal>
        </ModalOverlay>
      )}
    </>
  );
}
