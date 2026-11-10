import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { message } from 'antd';
import { apiClient } from '../utils/api';
import CountryCombobox from '../components/forms/CountryCombobox';
import { OTHER_COUNTRY } from '../utils/countries';

// Account Settings: where the creator is based. Brands filter creators by country and only see
// creators in countries they ship to, so this replaces the old broad "regions" picker.

const Section = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #6B7280;
  margin: 4px 0 16px;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;

  @media (max-width: 480px) {
    padding: 18px;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
`;

const SaveButton = styled.button`
  width: 100%;
  margin-top: 16px;
  padding: 14px 20px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
  &:hover:not(:disabled) { background: #2563EB; }
`;

export default function CountrySettingsSection() {
  const [saved, setSaved] = useState({ country: '', other: '' });
  const [country, setCountry] = useState('');
  const [other, setOther] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiClient.get('/profile')
      .then((res) => {
        if (cancelled) return;
        const code = res.data?.country_code || '';
        const otherName = res.data?.country_other || '';
        setSaved({ country: code, other: otherName });
        setCountry(code);
        setOther(otherName);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  const dirty = country !== saved.country || (country === OTHER_COUNTRY && other.trim() !== saved.other);
  const valid = country && (country !== OTHER_COUNTRY || other.trim());

  const save = async () => {
    setSaving(true);
    try {
      const res = await apiClient.patch('/api/user/profile', {
        country,
        ...(country === OTHER_COUNTRY && { country_other: other.trim() }),
      });
      setSaved({ country: res.data?.country_code || country, other: res.data?.country_other || '' });
      message.success('Country saved');
    } catch (err) {
      message.error(err.response?.data?.error || 'Could not save your country. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  return (
    <Section>
      <Title>Country</Title>
      <Subtitle>Brands see where you're based and only match you to products they can ship to you.</Subtitle>
      <Card>
        <Label htmlFor="settings-country">Where are you based?</Label>
        <CountryCombobox
          id="settings-country"
          value={country}
          onChange={setCountry}
          otherName={other}
          onOtherNameChange={setOther}
        />
        {dirty && (
          <SaveButton type="button" onClick={save} disabled={saving || !valid}>
            {saving ? 'Saving...' : 'Save country'}
          </SaveButton>
        )}
      </Card>
    </Section>
  );
}
