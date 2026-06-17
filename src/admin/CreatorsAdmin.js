import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import api from '../config/api';
import {
  Table,
  Input,
  Select,
  Tag,
  Button,
  Drawer,
  Spin,
  Space,
  message,
  Form,
} from 'antd';
import {
  MailOutlined,
  SearchOutlined,
  EyeOutlined,
  CopyOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

// Admin credentials (matches other admin CRM pages)
const ADMIN_EMAIL = 'team@newcollab.co';
const ADMIN_PASSWORD = 'Ilovela1992!';

const CTA_KIT_URL = 'https://app.newcollab.co/creator/dashboard/my-kit';
const PUBLIC_KIT_URL_PREFIX = 'https://newcollab.co/kit/';

const { Option } = Select;

const CreatorsAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  const [creators, setCreators] = useState([]);
  const [total, setTotal] = useState(0);

  const [searchQ, setSearchQ] = useState('');
  const [niche, setNiche] = useState('');
  const [region, setRegion] = useState('');
  const [tier, setTier] = useState(''); // free/pro/elite
  const [verified, setVerified] = useState(''); // true/false
  const [kit, setKit] = useState(''); // true/false

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);

  const getApiConfig = () => ({
    headers: { 'X-Admin-Token': 'pr-hunter-admin-2026' },
  });

  useEffect(() => {
    const authStatus = sessionStorage.getItem('creatorAdminAuth');
    if (authStatus === 'true') setIsAuthenticated(true);
  }, []);

  const fetchCreators = async (opts = {}) => {
    const effectivePage = opts.page ?? page;
    const effectivePageSize = opts.pageSize ?? pageSize;
    const offset = (effectivePage - 1) * effectivePageSize;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(effectivePageSize));
      params.set('offset', String(offset));

      if (searchQ) params.set('q', searchQ);
      if (niche) params.set('niche', niche);
      if (region) params.set('region', region);
      if (tier) params.set('tier', tier);
      if (verified) params.set('verified', verified);
      if (kit) params.set('kit', kit);

      const { data } = await api.get(`/api/admin/creators?${params.toString()}`, getApiConfig());
      setCreators(data.creators || []);
      setTotal(data.pagination?.total || 0);
    } catch (e) {
      console.error(e);
      message.error('Failed to load creators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCreators({ page: 1, pageSize });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    // When filters change, bounce back to page 1.
    setPage(1);
  }, [searchQ, niche, region, tier, verified, kit, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchCreators({ page, pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, isAuthenticated]);

  const tierTagColor = (t) => {
    if (!t) return '#6b7280';
    const norm = String(t).toLowerCase();
    if (norm === 'pro') return '#7c3aed';
    if (norm === 'elite') return '#ec4899';
    return '#6b7280';
  };

  const columns = useMemo(() => {
    return [
      {
        title: 'Creator',
        key: 'creator',
        render: (_, record) => (
          <div>
            <div style={{ fontWeight: 800 }}>
              @{record.username || 'unknown'}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>ID: {record.creator_id}</div>
          </div>
        ),
      },
      {
        title: 'Email',
        key: 'email',
        render: (_, record) => <div style={{ fontSize: 13 }}>{record.email || '—'}</div>,
      },
      {
        title: 'Niche',
        key: 'niche',
        dataIndex: 'niche',
        render: (val) => <Tag>{val || '—'}</Tag>,
      },
      {
        title: 'Regions',
        key: 'regions',
        dataIndex: 'regions',
        render: (val) => {
          const regions = Array.isArray(val) ? val : [];
          return <div style={{ fontSize: 13, color: '#374151' }}>{regions.length ? regions.slice(0, 3).join(', ') : '—'}</div>;
        },
      },
      {
        title: 'Followers',
        key: 'followers',
        dataIndex: 'followers_count',
        render: (val) => <span>{val ?? 0}</span>,
        sorter: (a, b) => (a.followers_count || 0) - (b.followers_count || 0),
      },
      {
        title: 'Tier',
        key: 'tier',
        dataIndex: 'tier',
        render: (val) => <Tag color={tierTagColor(val)}>{val || 'free'}</Tag>,
      },
      {
        title: 'Verified',
        key: 'verified',
        dataIndex: 'is_verified',
        render: (val) => (
          <Tag color={val ? 'green' : 'default'}>
            {val ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            <span style={{ marginLeft: 6 }}>{val ? 'Verified' : 'Unverified'}</span>
          </Tag>
        ),
      },
      {
        title: 'Kit',
        key: 'kit',
        render: (_, record) => (
          <div>
            {record.has_media_kit ? (
              <Tag color="blue">Completed</Tag>
            ) : (
              <Tag>Not completed</Tag>
            )}
            {record.kit_published_at ? (
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                {new Date(record.kit_published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        title: 'Pitches',
        key: 'pitches',
        render: (_, record) => (
          <div style={{ fontSize: 13 }}>
            <div>
              {record.pitches_sent_this_week ?? 0}/wk
            </div>
            <div style={{ color: '#9ca3af' }}>{record.pitches_sent_total ?? 0} total</div>
          </div>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 260,
        render: (_, record) => (
          <Space size={8} wrap>
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedCreator(record);
                setDrawerOpen(true);
                fetchCreatorDetails(record.creator_id);
              }}
            >
              Inspect
            </Button>
            <Button
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(`${CTA_KIT_URL}`).then(() => {
                  message.success('CTA URL copied');
                });
              }}
            >
              Copy kit CTA
            </Button>
            <Link to={`/creator/profile/${record.creator_id}`}>
              <Button icon={<UserOutlined />}>Profile</Button>
            </Link>
          </Space>
        ),
      },
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerLoading]);

  const fetchCreatorDetails = async (creatorId) => {
    setDrawerLoading(true);
    try {
      const { data } = await api.get(`/api/admin/creators/${creatorId}`, getApiConfig());
      setSelectedCreator(data.creator || null);
    } catch (e) {
      console.error(e);
      message.error('Failed to load creator details');
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleLogin = async (values) => {
    if (values.email === ADMIN_EMAIL && values.password === ADMIN_PASSWORD) {
      sessionStorage.setItem('creatorAdminAuth', 'true');
      setIsAuthenticated(true);
      message.success('Welcome to Creator Admin!');
    } else {
      message.error('Invalid credentials');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('creatorAdminAuth');
    setIsAuthenticated(false);
    setCreators([]);
    setTotal(0);
  };

  if (!isAuthenticated) {
    return (
      <LoginContainer>
        <LoginCard>
          <MailOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 24 }} />
          <h2>Creator Admin</h2>
          <p>Admin access required</p>
          <Form onFinish={handleLogin} layout="vertical">
            <Form.Item name="email" rules={[{ required: true }]}>
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true }]}>
              <Input.Password prefix={<UserOutlined />} placeholder="Password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Login
            </Button>
            <Button style={{ marginTop: 12 }} onClick={handleLogout} block>
              Cancel
            </Button>
          </Form>
        </LoginCard>
      </LoginContainer>
    );
  }

  return (
    <Page>
      <Header>
        <div>
          <h1>Creator Base</h1>
          <p>Search, scan, and inspect creator records quickly.</p>
        </div>
        <Space>
          <Button onClick={handleLogout}>Logout</Button>
          <Button type="primary" icon={<SearchOutlined />} onClick={() => fetchCreators({ page: 1 })}>
            Search
          </Button>
        </Space>
      </Header>

      <FiltersCard>
        <FilterRow>
          <Input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search email, name, or username..."
            allowClear
          />
          <Input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Niche (exact match)..."
            allowClear
          />
          <Input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Region (substring)..."
            allowClear
          />
          <Select value={tier} onChange={(v) => setTier(v)} style={{ minWidth: 140 }} placeholder="Tier">
            <Option value="">All</Option>
            <Option value="free">Free</Option>
            <Option value="pro">Pro</Option>
            <Option value="elite">Elite</Option>
          </Select>
          <Select value={verified} onChange={(v) => setVerified(v)} style={{ minWidth: 160 }} placeholder="Verification">
            <Option value="">All</Option>
            <Option value="true">Verified</Option>
            <Option value="false">Unverified</Option>
          </Select>
          <Select value={kit} onChange={(v) => setKit(v)} style={{ minWidth: 150 }} placeholder="Kit status">
            <Option value="">All</Option>
            <Option value="true">Completed</Option>
            <Option value="false">Not completed</Option>
          </Select>
        </FilterRow>
      </FiltersCard>

      <Table
        rowKey="creator_id"
        columns={columns}
        dataSource={creators}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          },
        }}
      />

      <Drawer
        title="Creator details"
        width={520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(CTA_KIT_URL).then(() => message.success('Kit CTA copied'));
              }}
            >
              Copy kit CTA
            </Button>
            {selectedCreator?.username ? (
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(`${PUBLIC_KIT_URL_PREFIX}${selectedCreator.username}`).then(() =>
                    message.success('Public kit URL copied')
                  );
                }}
              >
                Copy public kit URL
              </Button>
            ) : null}
          </div>
        }
      >
        {drawerLoading ? (
          <Spin />
        ) : selectedCreator ? (
          <DetailGrid>
            <DetailItem label="Creator ID">{selectedCreator.creator_id}</DetailItem>
            <DetailItem label="Username">@{selectedCreator.username}</DetailItem>
            <DetailItem label="Email">{selectedCreator.email}</DetailItem>
            <DetailItem label="First name">{selectedCreator.first_name || '—'}</DetailItem>
            <DetailItem label="Followers">{selectedCreator.followers_count ?? 0}</DetailItem>
            <DetailItem label="Tier">
              <Tag color={tierTagColor(selectedCreator.tier)}>{selectedCreator.tier || 'free'}</Tag>
            </DetailItem>
            <DetailItem label="Verified">
              <Tag color={selectedCreator.is_verified ? 'green' : 'default'}>
                {selectedCreator.is_verified ? 'Verified' : 'Unverified'}
              </Tag>
            </DetailItem>
            <DetailItem label="Niche">{selectedCreator.niche || '—'}</DetailItem>
            <DetailItem label="Regions">
              {Array.isArray(selectedCreator.regions) && selectedCreator.regions.length
                ? selectedCreator.regions.join(', ')
                : '—'}
            </DetailItem>
            <DetailItem label="Kit status">
              {selectedCreator.has_media_kit ? (
                <Tag color="blue">Completed</Tag>
              ) : (
                <Tag>Not completed</Tag>
              )}
            </DetailItem>
            <DetailItem label="Kit published at">
              {selectedCreator.kit_published_at ? new Date(selectedCreator.kit_published_at).toLocaleString() : '—'}
            </DetailItem>
            <DetailItem label="Pitches this week">
              {selectedCreator.pitches_sent_this_week ?? 0}/wk
            </DetailItem>
            <DetailItem label="Pitches total">
              {selectedCreator.pitches_sent_total ?? 0}/total
            </DetailItem>
          </DetailGrid>
        ) : (
          <EmptyState>No creator selected.</EmptyState>
        )}
      </Drawer>
    </Page>
  );
};

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 12px;
`;

const DetailItem = ({ label, children }) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.4 }}>
      {label}
    </div>
    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginTop: 4 }}>{children}</div>
  </div>
);

const EmptyState = styled.div`
  padding: 20px 0;
  color: #6b7280;
  text-align: center;
`;

const Page = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;

  h1 {
    margin: 0;
    font-size: 26px;
    font-weight: 900;
    color: #0f172a;
  }

  p {
    margin: 6px 0 0 0;
    color: #6b7280;
  }
`;

const FiltersCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 16px;
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 0.9fr 0.9fr 0.7fr 0.9fr 0.9fr;
  gap: 12px;
  align-items: center;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const LoginCard = styled.div`
  background: white;
  padding: 48px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 420px;

  h2 {
    margin: 0 0 8px 0;
  }

  p {
    margin-bottom: 24px;
    color: #666;
  }
`;

export default CreatorsAdmin;

