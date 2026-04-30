'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Button, Spin, Tag, message } from 'antd';
import { LinkOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import LandingPageLayoutNext from '../../components/LandingPageLayoutNext';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://api.newcollab.co');

const Page = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 24px 5rem;
`;

const Header = styled.div`
  display: flex;
  gap: 18px;
  align-items: center;
  margin-bottom: 18px;
  flex-wrap: wrap;
`;

const Logo = styled.div`
  width: 84px;
  height: 84px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.06);
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 34px;
  line-height: 1.15;
  color: #0f172a;
`;

const Sub = styled.p`
  margin: 10px 0 0 0;
  color: #475569;
  line-height: 1.7;
  max-width: 820px;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const Box = styled.div`
  margin-top: 22px;
  background: white;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.05);
`;

const BoxTitle = styled.h2`
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #0f172a;
`;

const AccessItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid rgba(0,0,0,0.06);

  &:first-of-type {
    border-top: none;
    padding-top: 0;
  }
`;

const Left = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  color: #0f172a;
  font-weight: 600;
`;

const Right = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

export default function BrandPublicClient({ brand }) {
  const [unlocking, setUnlocking] = useState(false);
  const [unlocked, setUnlocked] = useState(null);

  const canonical = useMemo(() => `https://newcollab.co/brand/${brand.slug}`, [brand.slug]);

  const hasDirectLink = Boolean(brand?.gated?.hasDirectLink);
  const hasEmail = Boolean(brand?.gated?.hasEmailContact);
  const maskedEmail = brand?.gated?.maskedEmail;

  async function unlock() {
    setUnlocking(true);
    try {
      const res = await fetch(`${API_BASE}/api/public/brands/${brand.slug}/unlock`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.status === 401 || res.status === 403) {
        // send to CRA signup
        window.location.href = '/register/creator';
        return;
      }

      if (!res.ok) {
        throw new Error(`Unlock failed (${res.status})`);
      }

      const data = await res.json();
      setUnlocked(data);
      message.success('Access unlocked!');

      if (data?.applicationUrl) {
        window.open(data.applicationUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      message.error('Failed to unlock access.');
    } finally {
      setUnlocking(false);
    }
  }

  return (
    <LandingPageLayoutNext canonicalUrl={canonical}>
      <Page>
        <Header>
          <Logo>
            {brand.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logo} alt={brand.name} />
            ) : (
              <span style={{ fontWeight: 900, color: '#3b82f6', fontSize: 28 }}>
                {brand.name?.slice(0, 1) || 'B'}
              </span>
            )}
          </Logo>
          <div style={{ flex: 1, minWidth: 260 }}>
            <Title>{brand.name}</Title>
            <MetaRow>
              {brand.category ? <Tag color="blue">{brand.category}</Tag> : null}
              {brand.minFollowers ? <Tag>{Math.round(brand.minFollowers / 1000)}K+ followers</Tag> : null}
              {typeof brand.responseRate === 'number' ? <Tag color="green">{brand.responseRate}% response</Tag> : null}
            </MetaRow>
          </div>
        </Header>

        {brand.description ? <Sub>{brand.description}</Sub> : null}

        <Box>
          <BoxTitle>Apply / Contact</BoxTitle>
          <div style={{ color: '#64748b', lineHeight: 1.6 }}>
            Unlock the PR application link (and email if available).
          </div>

          <div style={{ marginTop: 12 }}>
            {(unlocked?.applicationUrl || hasDirectLink) && (
              <AccessItem>
                <Left>
                  <LinkOutlined />
                  Application link
                </Left>
                <Right>
                  {unlocked?.applicationUrl ? (
                    <Button type="primary" href={unlocked.applicationUrl} target="_blank" rel="noopener noreferrer">
                      Open
                    </Button>
                  ) : (
                    <Button type="primary" icon={<LockOutlined />} loading={unlocking} onClick={unlock}>
                      Unlock
                    </Button>
                  )}
                </Right>
              </AccessItem>
            )}

            {(unlocked?.contactEmail || hasEmail) && (
              <AccessItem>
                <Left>
                  <MailOutlined />
                  PR email
                </Left>
                <Right>
                  {unlocked?.contactEmail ? (
                    <Button type="primary" href={`mailto:${unlocked.contactEmail}`}>
                      {unlocked.contactEmail}
                    </Button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {maskedEmail && (
                        <span style={{
                          color: '#94a3b8',
                          fontFamily: 'monospace',
                          fontSize: 13,
                          background: 'linear-gradient(90deg, #64748b 0%, transparent 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          filter: 'blur(0.5px)'
                        }}>
                          {maskedEmail}
                        </span>
                      )}
                      <Button
                        type="primary"
                        icon={<LockOutlined />}
                        loading={unlocking}
                        onClick={unlock}
                        size="small"
                      >
                        Unlock
                      </Button>
                    </div>
                  )}
                </Right>
              </AccessItem>
            )}
          </div>

          <div style={{ marginTop: 14 }}>
            <Link href="/directory">← Back to Directory</Link>
          </div>
        </Box>

        <Box style={{ marginTop: 18 }}>
          <BoxTitle>For creators</BoxTitle>
          <div style={{ color: '#64748b', lineHeight: 1.6 }}>
            Want more brands and tracking? Create a free account and save brands to your pipeline.
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="/register/creator">
              <Button type="primary">Create free creator account</Button>
            </a>
            <a href="/login">
              <Button>Log in</Button>
            </a>
          </div>
        </Box>
      </Page>
    </LandingPageLayoutNext>
  );
}

