import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Avatar,
  Tooltip,
  Popover,
  Row,
  Col,
  Statistic,
  Divider,
  Typography,
} from 'antd';
import {
  MailOutlined,
  SearchOutlined,
  EyeOutlined,
  CopyOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { categoryLabel, normalizeCategory } from '../constants/brandCategories';
import { getCategoryColors } from '../utils/categoryColors';

const { Option } = Select;
const { Text, Paragraph } = Typography;

// Admin credentials (matches other admin CRM pages)
const ADMIN_EMAIL = 'team@newcollab.co';
const ADMIN_PASSWORD = 'Ilovela1992!';

const CTA_KIT_URL = 'https://app.newcollab.co/creator/dashboard/my-kit';
const PUBLIC_KIT_URL_PREFIX = 'https://newcollab.co/kit/';

function parseNiches(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [String(parsed)];
      } catch {
        // fall through
      }
    }
    if (trimmed.includes(',')) {
      return trimmed.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
    return trimmed ? [trimmed] : [];
  }
  return [String(raw)];
}

function NicheChip({ slug }) {
  const colors = getCategoryColors(slug);
  return (
    <NicheTag $bg={colors.bg} $color={colors.text} $border={colors.border}>
      {categoryLabel(slug)}
    </NicheTag>
  );
}

function NicheBadges({ niche, max = 2 }) {
  const niches = parseNiches(niche);
  if (!niches.length) return <Text type="secondary" style={{ fontSize: 12 }}>—</Text>;
  const shown = niches.slice(0, max);
  const extra = niches.length - shown.length;
  return (
    <NicheWrap>
      {shown.map((n) => <NicheChip key={n} slug={normalizeCategory(n) || n} />)}
      {extra > 0 ? (
        <Popover
          content={
            <NicheWrap style={{ maxWidth: 240 }}>
              {niches.slice(max).map((n) => <NicheChip key={n} slug={normalizeCategory(n) || n} />)}
            </NicheWrap>
          }
          trigger="hover"
        >
          <MorePill>+{extra}</MorePill>
        </Popover>
      ) : null}
    </NicheWrap>
  );
}

const PLATFORM_URLS = {
  instagram: (h) => `https://instagram.com/${h.replace('@', '')}`,
  tiktok: (h) => `https://tiktok.com/@${h.replace('@', '')}`,
  youtube: (h) => h.startsWith('http') ? h : `https://youtube.com/@${h.replace('@', '')}`,
  twitter: (h) => `https://twitter.com/${h.replace('@', '')}`,
  x: (h) => `https://x.com/${h.replace('@', '')}`,
  pinterest: (h) => `https://pinterest.com/${h.replace('@', '')}`,
  facebook: (h) => h.startsWith('http') ? h : `https://facebook.com/${h}`,
};

// social_links is stored as an array: [{platform, handle, followersCount}, ...]
function buildSocialLinks(socialLinks) {
  if (!socialLinks || !Array.isArray(socialLinks)) return [];
  return socialLinks
    .filter((item) => item && item.handle)
    .map((item) => {
      const platform = (item.platform || '').toLowerCase();
      const rawHandle = String(item.handle).trim();
      const buildUrl = PLATFORM_URLS[platform];
      const url = buildUrl
        ? buildUrl(rawHandle)
        : rawHandle.startsWith('http') ? rawHandle : `https://${rawHandle}`;
      const handle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;
      return {
        label: item.platform
          ? item.platform.charAt(0).toUpperCase() + item.platform.slice(1)
          : 'Link',
        url,
        handle,
        followersCount: item.followersCount ?? null,
      };
    });
}

function formatDate(val, withTime = false) {
  if (!val) return '—';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', withTime
    ? { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }
    : { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatNumber(val) {
  if (val == null) return '0';
  return Number(val).toLocaleString();
}

const CreatorsAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  const [creators, setCreators] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, verified: 0, with_kit: 0, pitched: 0 });

  const [searchQ, setSearchQ] = useState('');
  const [niche, setNiche] = useState('');
  const [region, setRegion] = useState('');
  const [tier, setTier] = useState('');
  const [verified, setVerified] = useState('');
  const [kit, setKit] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState('signup');
  const [sortOrder, setSortOrder] = useState('descend');

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

  const fetchCreators = useCallback(async () => {
    if (!isAuthenticated) return;
    const offset = (page - 1) * pageSize;
    const order = sortOrder === 'ascend' ? 'asc' : 'desc';

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(pageSize));
      params.set('offset', String(offset));
      params.set('sort', sortField);
      params.set('order', order);

      if (searchQ) params.set('q', searchQ);
      if (niche) params.set('niche', niche);
      if (region) params.set('region', region);
      if (tier) params.set('tier', tier);
      if (verified) params.set('verified', verified);
      if (kit) params.set('kit', kit);

      const { data } = await api.get(`/api/admin/creators?${params.toString()}`, getApiConfig());
      setCreators(data.creators || []);
      setTotal(data.pagination?.total || 0);
      setStats(data.stats || { total: data.pagination?.total || 0, verified: 0, with_kit: 0, pitched: 0 });
    } catch (e) {
      console.error(e);
      message.error('Failed to load creators');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, page, pageSize, searchQ, niche, region, tier, verified, kit, sortField, sortOrder]);

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

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

  const openDrawer = (record) => {
    setSelectedCreator(record);
    setDrawerOpen(true);
    fetchCreatorDetails(record.creator_id);
  };

  const handleTableChange = (pagination, _filters, sorter) => {
    if (pagination.current !== page) setPage(pagination.current);
    if (pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
      setPage(1);
    }
    if (sorter?.field) {
      const fieldMap = { signup_date: 'signup', pitches_total: 'pitches', followers_count: 'followers' };
      const nextField = fieldMap[sorter.field] || sortField;
      const nextOrder = sorter.order || (nextField === sortField && sortOrder === 'descend' ? 'ascend' : 'descend');
      if (nextField !== sortField || nextOrder !== sortOrder) {
        setSortField(nextField);
        setSortOrder(nextOrder);
        setPage(1);
      }
    }
  };

  const tierTagColor = (t) => {
    const norm = String(t || 'free').toLowerCase();
    if (norm === 'pro') return 'purple';
    if (norm === 'elite') return 'magenta';
    return 'default';
  };

  const columns = useMemo(() => [
    {
      title: 'Creator',
      key: 'creator',
      width: 200,
      fixed: 'left',
      render: (_, record) => {
        const rawUsername = record.username || 'unknown';
        const username = rawUsername.length > 22
          ? rawUsername.slice(0, 22) + '…'
          : rawUsername;
        return (
          <CreatorCell>
            <Avatar
              size={36}
              src={record.image_profile || undefined}
              icon={!record.image_profile ? <UserOutlined /> : undefined}
              style={{ flexShrink: 0 }}
            />
            <CreatorMeta>
              <Tooltip title={`@${rawUsername}`} mouseEnterDelay={0.5}>
                <CreatorUsername>@{username}</CreatorUsername>
              </Tooltip>
              {record.first_name ? (
                <CreatorName>{record.first_name}</CreatorName>
              ) : null}
            </CreatorMeta>
          </CreatorCell>
        );
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 210,
      ellipsis: { showTitle: false },
      render: (val) => (
        <Tooltip title={val} mouseEnterDelay={0.5}>
          <EmailText>{val || '—'}</EmailText>
        </Tooltip>
      ),
    },
    {
      title: 'Niche',
      key: 'niche',
      dataIndex: 'niche',
      width: 175,
      render: (val) => <NicheBadges niche={val} max={2} />,
    },
    {
      title: 'Followers',
      key: 'followers_count',
      dataIndex: 'followers_count',
      width: 95,
      align: 'right',
      sorter: true,
      sortOrder: sortField === 'followers' ? sortOrder : null,
      render: (val, record) => {
        const links = buildSocialLinks(record.social_links);
        if (!links.length) return <NumCell>{formatNumber(val)}</NumCell>;
        return (
          <Popover
            trigger="click"
            placement="left"
            content={
              <SocialPopover>
                {links.map(({ label, url, handle, followersCount }) => (
                  <SocialPopoverRow key={label}>
                    <SocialPlatformLabel>{label}</SocialPlatformLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <a href={url} target="_blank" rel="noopener noreferrer">{handle}</a>
                      {followersCount != null && (
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>
                          {formatNumber(followersCount)}
                        </span>
                      )}
                    </div>
                  </SocialPopoverRow>
                ))}
              </SocialPopover>
            }
          >
            <FollowersBtn>{formatNumber(val)}</FollowersBtn>
          </Popover>
        );
      },
    },
    {
      title: 'Signed up',
      key: 'signup_date',
      dataIndex: 'signup_date',
      width: 105,
      sorter: true,
      defaultSortOrder: 'descend',
      sortOrder: sortField === 'signup' ? sortOrder : null,
      render: (val) => <DateCell>{formatDate(val)}</DateCell>,
    },
    {
      title: 'Tier',
      key: 'tier',
      dataIndex: 'tier',
      width: 75,
      render: (val) => <Tag color={tierTagColor(val)} style={{ margin: 0 }}>{val || 'free'}</Tag>,
    },
    {
      title: 'Status',
      key: 'status',
      width: 105,
      render: (_, record) => (
        <StatusCell>
          {record.is_verified
            ? <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>Verified</Tag>
            : <Tag color="default" style={{ margin: 0, color: '#9ca3af' }}>—</Tag>
          }
          {(record.has_media_kit || record.kit_published)
            ? <Tag color="blue" style={{ margin: 0, marginTop: 3 }}>Kit live</Tag>
            : null
          }
        </StatusCell>
      ),
    },
    {
      title: 'Pitches',
      key: 'pitches_total',
      dataIndex: 'pitches_total',
      width: 80,
      align: 'right',
      sorter: true,
      sortOrder: sortField === 'pitches' ? sortOrder : null,
      render: (_, record) => (
        <PitchCell>
          <span className="total">{formatNumber(record.pitches_total)}</span>
          {record.pitches_this_week > 0 ? (
            <span className="week">+{record.pitches_this_week}wk</span>
          ) : null}
        </PitchCell>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 96,
      fixed: 'right',
      render: (_, record) => (
        <ActionCell>
          <Tooltip title="Inspect">
            <Button size="small" type="text" icon={<EyeOutlined />} onClick={() => openDrawer(record)} />
          </Tooltip>
          <Tooltip title="Copy kit CTA">
            <Button
              size="small"
              type="text"
              icon={<CopyOutlined />}
              onClick={() => navigator.clipboard.writeText(CTA_KIT_URL).then(() => message.success('Copied'))}
            />
          </Tooltip>
          <Tooltip title="View profile">
            <Link to={`/creator/profile/${record.creator_id}`}>
              <Button size="small" type="text" icon={<UserOutlined />} />
            </Link>
          </Tooltip>
        </ActionCell>
      ),
    },
  ], [sortField, sortOrder]);

  const handleLogin = (values) => {
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

  const resetFilters = () => {
    setSearchQ('');
    setNiche('');
    setRegion('');
    setTier('');
    setVerified('');
    setKit('');
    setPage(1);
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
          </Form>
        </LoginCard>
      </LoginContainer>
    );
  }

  const publicKitUrl = selectedCreator?.kit_slug
    ? `${PUBLIC_KIT_URL_PREFIX}${selectedCreator.kit_slug}`
    : selectedCreator?.username
      ? `${PUBLIC_KIT_URL_PREFIX}${selectedCreator.username}`
      : null;

  return (
    <Page>
      <Header>
        <div>
          <h1>Creator Base</h1>
          <p>Search, scan, and inspect your creator community.</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchCreators}>Refresh</Button>
          <Button onClick={handleLogout}>Logout</Button>
        </Space>
      </Header>

      <StatsRow gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <StatCard>
            <Statistic title="Total creators" value={stats.total ?? total} />
          </StatCard>
        </Col>
        <Col xs={12} sm={6}>
          <StatCard>
            <Statistic title="Verified" value={stats.verified ?? 0} valueStyle={{ color: '#16a34a' }} />
          </StatCard>
        </Col>
        <Col xs={12} sm={6}>
          <StatCard>
            <Statistic title="With kit" value={stats.with_kit ?? 0} valueStyle={{ color: '#2563eb' }} />
          </StatCard>
        </Col>
        <Col xs={12} sm={6}>
          <StatCard>
            <Statistic title="Has pitched" value={stats.pitched ?? 0} />
          </StatCard>
        </Col>
      </StatsRow>

      <FiltersCard>
        <FilterRow>
          <Input
            value={searchQ}
            onChange={(e) => { setSearchQ(e.target.value); setPage(1); }}
            placeholder="Search email, name, username…"
            allowClear
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          />
          <Input
            value={niche}
            onChange={(e) => { setNiche(e.target.value); setPage(1); }}
            placeholder="Niche…"
            allowClear
          />
          <Input
            value={region}
            onChange={(e) => { setRegion(e.target.value); setPage(1); }}
            placeholder="Region…"
            allowClear
          />
          <Select value={tier || undefined} onChange={(v) => { setTier(v || ''); setPage(1); }} allowClear placeholder="Tier" style={{ width: '100%' }}>
            <Option value="free">Free</Option>
            <Option value="pro">Pro</Option>
            <Option value="elite">Elite</Option>
          </Select>
          <Select value={verified || undefined} onChange={(v) => { setVerified(v || ''); setPage(1); }} allowClear placeholder="Verified" style={{ width: '100%' }}>
            <Option value="true">Verified</Option>
            <Option value="false">Unverified</Option>
          </Select>
          <Select value={kit || undefined} onChange={(v) => { setKit(v || ''); setPage(1); }} allowClear placeholder="Kit" style={{ width: '100%' }}>
            <Option value="true">Has kit</Option>
            <Option value="false">No kit</Option>
          </Select>
        </FilterRow>
        <FilterMeta>
          <Text type="secondary">
            Showing {creators.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)} of {total}
          </Text>
          <Button type="link" size="small" onClick={resetFilters}>Clear filters</Button>
        </FilterMeta>
      </FiltersCard>

      <TableCard>
        <Table
          rowKey="creator_id"
          columns={columns}
          dataSource={creators}
          loading={loading}
          size="small"
          scroll={{ x: 1145 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '25', '50', '100'],
            showTotal: (t) => `${t} creators`,
            size: 'default',
          }}
          onChange={handleTableChange}
        />
      </TableCard>

      <Drawer
        title={null}
        width={Math.min(560, window.innerWidth - 24)}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        {drawerLoading ? (
          <DrawerLoading><Spin size="large" /></DrawerLoading>
        ) : selectedCreator ? (
          <DrawerContent>
            <DrawerHero>
              <Avatar
                size={72}
                src={selectedCreator.image_profile || undefined}
                icon={!selectedCreator.image_profile ? <UserOutlined /> : undefined}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <DrawerName>@{selectedCreator.username || 'unknown'}</DrawerName>
                {selectedCreator.first_name ? (
                  <Text type="secondary">{selectedCreator.first_name}</Text>
                ) : null}
                <DrawerBadges>
                  <Tag color={tierTagColor(selectedCreator.tier)}>{selectedCreator.tier || 'free'}</Tag>
                  <Tag color={selectedCreator.is_verified ? 'success' : 'default'}>
                    {selectedCreator.is_verified ? 'Verified' : 'Unverified'}
                  </Tag>
                  {(selectedCreator.has_media_kit || selectedCreator.kit_published) && (
                    <Tag color="blue">Kit live</Tag>
                  )}
                </DrawerBadges>
              </div>
            </DrawerHero>

            {selectedCreator.bio ? (
              <Paragraph type="secondary" style={{ margin: '0 0 16px', fontSize: 13 }}>
                {selectedCreator.bio}
              </Paragraph>
            ) : null}

            <NicheBadges niche={selectedCreator.niche} max={6} />

            <Divider style={{ margin: '16px 0' }} />

            <SectionTitle>Account</SectionTitle>
            <DetailGrid>
              <DetailItem label="Creator ID" value={selectedCreator.creator_id} />
              <DetailItem label="User ID" value={selectedCreator.user_id} />
              <DetailItem label="Email" value={selectedCreator.email} full />
              <DetailItem label="Signed up" value={formatDate(selectedCreator.signup_date, true)} />
            </DetailGrid>

            <Divider style={{ margin: '16px 0' }} />

            <SectionTitle>Stats</SectionTitle>
            <DetailGrid>
              <DetailItem label="Followers" value={formatNumber(selectedCreator.followers_count)} />
              <DetailItem
                label="Engagement"
                value={
                  selectedCreator.engagement_rate != null
                    ? `${selectedCreator.engagement_rate}%`
                    : selectedCreator.avg_engagement_rate != null
                      ? `${selectedCreator.avg_engagement_rate}%`
                      : '—'
                }
              />
              <DetailItem label="Total posts" value={formatNumber(selectedCreator.total_posts)} />
              <DetailItem label="Total views" value={formatNumber(selectedCreator.total_views)} />
              <DetailItem label="Brands saved" value={formatNumber(selectedCreator.brands_saved ?? selectedCreator.pipeline_saves)} />
              <DetailItem label="Pitches sent" value={formatNumber(selectedCreator.pitches_total)} highlight />
              <DetailItem label="Pitches this week" value={formatNumber(selectedCreator.pitches_this_week)} />
              <DetailItem label="Last pitched" value={formatDate(selectedCreator.last_pitched_at || selectedCreator.last_pitch_at, true)} />
            </DetailGrid>

            <Divider style={{ margin: '16px 0' }} />

            <SectionTitle>Audience</SectionTitle>
            <DetailGrid>
              <DetailItem label="Regions" value={
                Array.isArray(selectedCreator.regions) && selectedCreator.regions.length
                  ? selectedCreator.regions.join(', ')
                  : '—'
              } full />
              <DetailItem label="Age range" value={selectedCreator.primary_age_range || '—'} />
              <DetailItem label="Top locations" value={
                Array.isArray(selectedCreator.top_locations) && selectedCreator.top_locations.length
                  ? selectedCreator.top_locations.join(', ')
                  : '—'
              } full />
            </DetailGrid>

            {Array.isArray(selectedCreator.platforms) && selectedCreator.platforms.length > 0 && (
              <>
                <Divider style={{ margin: '16px 0' }} />
                <SectionTitle>Platforms</SectionTitle>
                <Space wrap size={[4, 4]}>
                  {selectedCreator.platforms.map((p) => (
                    <Tag key={p}>{p}</Tag>
                  ))}
                </Space>
              </>
            )}

            {Array.isArray(selectedCreator.social_links) && selectedCreator.social_links.length > 0 && (
              <>
                <Divider style={{ margin: '16px 0' }} />
                <SectionTitle>Social links</SectionTitle>
                <SocialLinks>
                  {buildSocialLinks(selectedCreator.social_links).map(({ label, url, handle, followersCount }) => (
                    <SocialLinkRow key={label}>
                      <SocialPlatformLabel>{label}</SocialPlatformLabel>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <LinkOutlined style={{ marginRight: 4 }} />{handle}
                        </a>
                        {followersCount != null && (
                          <span style={{ fontSize: 12, color: '#6b7280' }}>{formatNumber(followersCount)} followers</span>
                        )}
                      </div>
                    </SocialLinkRow>
                  ))}
                </SocialLinks>
              </>
            )}

            <Divider style={{ margin: '16px 0' }} />

            <SectionTitle>Media kit</SectionTitle>
            <DetailGrid>
              <DetailItem label="Status" value={
                selectedCreator.has_media_kit || selectedCreator.kit_published ? 'Published' : 'Not published'
              } />
              <DetailItem label="Portfolio posts" value={formatNumber(selectedCreator.portfolio_post_count)} />
              <DetailItem label="Published at" value={formatDate(selectedCreator.kit_published_at, true)} />
              <DetailItem label="Kit slug" value={selectedCreator.kit_slug || selectedCreator.username || '—'} />
            </DetailGrid>

            <DrawerActions>
              <Button
                icon={<CopyOutlined />}
                onClick={() => navigator.clipboard.writeText(CTA_KIT_URL).then(() => message.success('Kit CTA copied'))}
              >
                Copy kit CTA
              </Button>
              {publicKitUrl && (
                <Button
                  icon={<LinkOutlined />}
                  onClick={() => navigator.clipboard.writeText(publicKitUrl).then(() => message.success('Public kit URL copied'))}
                >
                  Copy public kit
                </Button>
              )}
              <Link to={`/creator/profile/${selectedCreator.creator_id}`}>
                <Button type="primary" icon={<UserOutlined />}>View profile</Button>
              </Link>
            </DrawerActions>
          </DrawerContent>
        ) : (
          <DrawerLoading><Text type="secondary">No creator selected.</Text></DrawerLoading>
        )}
      </Drawer>
    </Page>
  );
};

const DetailItem = ({ label, value, full, highlight }) => (
  <DetailCell $full={full}>
    <DetailLabel>{label}</DetailLabel>
    <DetailValue $highlight={highlight}>{value ?? '—'}</DetailValue>
  </DetailCell>
);

const Page = styled.div`
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;

  h1 {
    margin: 0;
    font-size: 26px;
    font-weight: 900;
    color: #0f172a;
  }

  p {
    margin: 6px 0 0;
    color: #6b7280;
  }
`;

const StatsRow = styled(Row)`
  margin-bottom: 16px;
`;

const StatCard = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  height: 100%;
`;

const FiltersCard = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 0.8fr 0.8fr 0.6fr 0.7fr 0.6fr;
  gap: 10px;
  align-items: center;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FilterMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
`;

const TableCard = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;

  .ant-table-thead > tr > th {
    background: #f9fafb !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #6b7280 !important;
    padding: 8px 10px !important;
    white-space: nowrap;
  }

  .ant-table-tbody > tr > td {
    vertical-align: middle;
    padding: 8px 10px !important;
  }

  .ant-table-tbody > tr:hover > td {
    background: #f8faff !important;
  }
`;

const CreatorCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const CreatorMeta = styled.div`
  min-width: 0;
  flex: 1;
`;

const CreatorUsername = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
  line-height: 1.3;
`;

const CreatorName = styled.div`
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
`;

const EmailText = styled.div`
  font-size: 12px;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 190px;
`;

const NumCell = styled.div`
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #111827;
`;

const DateCell = styled.div`
  font-size: 12px;
  color: #374151;
  white-space: nowrap;
`;

const StatusCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const PitchCell = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  justify-content: flex-end;

  .total {
    font-size: 13px;
    font-weight: 700;
    color: #111827;
    font-variant-numeric: tabular-nums;
  }

  .week {
    font-size: 10px;
    color: #10b981;
    font-weight: 600;
  }
`;

const ActionCell = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const FollowersBtn = styled.span`
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #2563eb;
  cursor: pointer;
  border-bottom: 1px dashed #93c5fd;
  padding-bottom: 1px;

  &:hover {
    color: #1d4ed8;
    border-bottom-color: #1d4ed8;
  }
`;

const SocialPopover = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
`;

const SocialPopoverRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  a {
    font-size: 13px;
    color: #2563eb;
    font-weight: 500;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const SocialPlatformLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #9ca3af;
  white-space: nowrap;
`;

const NicheWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  align-items: center;
`;

const NicheTag = styled.span`
  display: inline-block;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
  border: 1px solid ${(p) => p.$border};
  white-space: nowrap;
  line-height: 1.6;
`;

const MorePill = styled.span`
  display: inline-block;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  cursor: default;
  line-height: 1.6;
`;

const DrawerLoading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 40px;
`;

const DrawerContent = styled.div`
  padding: 24px;
`;

const DrawerHero = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const DrawerName = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  line-height: 1.2;
`;

const DrawerBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  margin-bottom: 10px;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
`;

const DetailCell = styled.div`
  grid-column: ${(p) => (p.$full ? '1 / -1' : 'auto')};
`;

const DetailLabel = styled.div`
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 2px;
`;

const DetailValue = styled.div`
  font-size: 14px;
  font-weight: ${(p) => (p.$highlight ? 800 : 600)};
  color: ${(p) => (p.$highlight ? '#111827' : '#374151')};
  word-break: break-word;
`;

const SocialLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SocialLinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  a {
    font-size: 13px;
    color: #2563eb;
    font-weight: 500;
  }
`;

const DrawerActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
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
  max-width: calc(100vw - 32px);

  h2 {
    margin: 0 0 8px;
  }

  p {
    margin-bottom: 24px;
    color: #666;
  }
`;

export default CreatorsAdmin;
