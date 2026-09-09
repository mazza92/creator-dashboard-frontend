import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Button, Card, Col, Form, Input, Modal, Row, Select, Space, Statistic,
  Table, Tag, Tooltip, message,
} from 'antd';
import {
  ExportOutlined, LinkOutlined, LockOutlined, MailOutlined, ReloadOutlined, UserOutlined,
} from '@ant-design/icons';
import api from '../config/api';

const ADMIN_EMAIL = 'team@newcollab.co';
const ADMIN_PASSWORD = 'Ilovela1992!';

function getApiConfig() {
  return { headers: { 'X-Admin-Token': 'pr-hunter-admin-2026' } };
}

function formatFollowers(n) {
  const v = Number(n) || 0;
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(v);
}

function tiktokUrl(row) {
  const stored = (row.profile_url || '').trim();
  if (stored) return stored;
  const handle = String(row.handle || '').replace(/^@/, '').trim();
  return handle ? `https://www.tiktok.com/@${handle}` : null;
}

function tiktokUrlLabel(url) {
  return (url || '').replace(/^https?:\/\/(www\.)?/, '');
}

const STATUS_COLOR = {
  draft: 'blue',
  review: 'gold',
  contacted: 'green',
  skipped: 'default',
};

const UgcSupplyAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tab, setTab] = useState('ready');
  const [nicheInput, setNicheInput] = useState('');
  const [niche, setNiche] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    if (
      sessionStorage.getItem('ugcSupplyAdminAuth') === 'true'
      || sessionStorage.getItem('brandAdminAuth') === 'true'
    ) {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/api/admin/ugc-supply/outreach/stats', getApiConfig());
      setStats(data || {});
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(pageSize));
      params.set('offset', String((page - 1) * pageSize));
      if (niche.trim()) params.set('niche', niche.trim());

      let url = `/api/admin/ugc-supply?${params.toString()}`;
      if (tab === 'ready') {
        url = `/api/admin/ugc-supply/for-outreach?${params.toString()}`;
      } else if (tab === 'qualified') {
        params.set('qualified', 'true');
        params.set('has_email', 'true');
        url = `/api/admin/ugc-supply?${params.toString()}`;
      } else if (tab === 'contacted') {
        params.set('status', 'contacted');
        params.set('qualified', 'true');
        url = `/api/admin/ugc-supply?${params.toString()}`;
      } else if (tab === 'skipped') {
        params.set('status', 'skipped');
        params.set('qualified', 'true');
        url = `/api/admin/ugc-supply?${params.toString()}`;
      }

      const { data } = await api.get(url, getApiConfig());
      const list = data.supply || data.leads || [];
      setRows(list);
      setTotal(data.total || list.length);
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.error || 'Failed to load UGC supply');
    } finally {
      setLoading(false);
    }
  }, [tab, niche, page]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchRows();
    fetchStats();
  }, [isAuthenticated, fetchRows, fetchStats]);

  const handleLogin = (values) => {
    if (values.email === ADMIN_EMAIL && values.password === ADMIN_PASSWORD) {
      sessionStorage.setItem('ugcSupplyAdminAuth', 'true');
      setIsAuthenticated(true);
      message.success('Welcome to UGC Supply');
    } else {
      message.error('Invalid credentials');
    }
  };

  const selectedIds = selectedRowKeys.map((k) => Number(k));

  const sendBulk = async (ids) => {
    if (!ids.length) {
      message.warning('Select creators first');
      return;
    }
    const capped = ids.slice(0, 40);
    setSending(true);
    try {
      const { data } = await api.post(
        '/api/admin/ugc-supply/outreach/bulk',
        { lead_ids: capped, delay_seconds: 0.5 },
        { ...getApiConfig(), timeout: 120000 },
      );
      message.success(
        `Sent ${data.sent_count || 0}`
        + (data.skipped?.length ? `, skipped ${data.skipped.length}` : '')
        + (data.failed?.length ? `, failed ${data.failed.length}` : ''),
      );
      setSelectedRowKeys([]);
      fetchRows();
      fetchStats();
    } catch (err) {
      message.error(err.response?.data?.error || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  const sendOne = (record) => {
    Modal.confirm({
      title: `Email @${record.handle}?`,
      content: `Sends the Newcollab signup template to ${record.contact_email}.`,
      okText: 'Send',
      onOk: () => sendBulk([record.id]),
    });
  };

  const patchRow = async (record, body) => {
    try {
      await api.patch(`/api/admin/ugc-supply/${record.id}`, body, getApiConfig());
      message.success('Updated');
      fetchRows();
      fetchStats();
    } catch (err) {
      message.error(err.response?.data?.error || 'Update failed');
    }
  };

  const columns = [
    {
      title: 'Creator',
      dataIndex: 'handle',
      render: (_, row) => {
        const url = tiktokUrl(row);
        const name = row.display_name || `@${row.handle}`;
        return (
          <div>
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, color: 'inherit' }}>
                {name}
              </a>
            ) : (
              <div style={{ fontWeight: 600 }}>{name}</div>
            )}
            {url ? (
              <div>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {tiktokUrlLabel(url)} <LinkOutlined />
                </a>
              </div>
            ) : (
              <span>@{row.handle}</span>
            )}
          </div>
        );
      },
    },
    { title: 'Niche', dataIndex: 'niche', width: 140, render: (v) => v || '—' },
    {
      title: 'Followers',
      dataIndex: 'followers',
      width: 110,
      render: (v) => formatFollowers(v),
    },
    { title: 'Location', dataIndex: 'location', width: 140, render: (v) => v || '—' },
    {
      title: 'Email',
      dataIndex: 'contact_email',
      render: (v) => (v ? <a href={`mailto:${v}`}>{v}</a> : '—'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 110,
      render: (v) => <Tag color={STATUS_COLOR[v] || 'default'}>{v || 'draft'}</Tag>,
    },
    {
      title: '',
      key: 'actions',
      width: 250,
      render: (_, row) => {
        const url = tiktokUrl(row);
        return (
          <Space>
            {url && (
              <Button size="small" href={url} target="_blank" rel="noopener noreferrer" icon={<ExportOutlined />}>
                TikTok
              </Button>
            )}
            <Tooltip title={row.contact_email ? 'Send onboarding email' : 'No email'}>
              <Button
                size="small"
                type="primary"
                icon={<MailOutlined />}
                disabled={!row.contact_email || row.status === 'contacted'}
                onClick={() => sendOne(row)}
              >
                Email
              </Button>
            </Tooltip>
            {row.status !== 'skipped' && (
              <Button size="small" onClick={() => patchRow(row, { status: 'skipped' })}>
                Skip
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  if (!isAuthenticated) {
    return (
      <LoginContainer>
        <LoginCard>
          <LockOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 24 }} />
          <h2>UGC Supply</h2>
          <p>Creator prospects — separate from brand admin</p>
          <Form onFinish={handleLogin} layout="vertical">
            <Form.Item name="email" rules={[{ required: true }]}>
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Login
            </Button>
          </Form>
        </LoginCard>
      </LoginContainer>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <h1>UGC Supply</h1>
          <p>TikTok UGC creators with a public email and 1k+ followers. Not mixed with /admin/brands.</p>
        </div>
        <Space>
          <Button href="/admin/brands">Brand Admin</Button>
          <Button
            onClick={() => {
              sessionStorage.removeItem('ugcSupplyAdminAuth');
              setIsAuthenticated(false);
            }}
          >
            Logout
          </Button>
        </Space>
      </Header>

      <StatsRow gutter={16}>
        <Col span={6}><Card><Statistic title="Total" value={stats.total_leads || 0} /></Card></Col>
        <Col span={6}><Card><Statistic title="Qualified" value={stats.qualified || 0} /></Card></Col>
        <Col span={6}><Card><Statistic title="Ready to email" value={stats.ready_email || 0} /></Card></Col>
        <Col span={6}><Card><Statistic title="Emails sent" value={stats.emails_sent || 0} /></Card></Col>
      </StatsRow>

      <Toolbar>
        <Space wrap>
          <Select
            value={tab}
            onChange={(v) => { setTab(v); setPage(1); setSelectedRowKeys([]); }}
            style={{ width: 180 }}
            options={[
              { value: 'ready', label: 'Ready to email' },
              { value: 'qualified', label: 'All qualified' },
              { value: 'contacted', label: 'Contacted' },
              { value: 'skipped', label: 'Skipped' },
            ]}
          />
          <Input
            placeholder="Filter niche"
            value={nicheInput}
            onChange={(e) => setNicheInput(e.target.value)}
            onPressEnter={() => { setNiche(nicheInput.trim()); setPage(1); }}
            style={{ width: 180 }}
            allowClear
            onClear={() => { setNicheInput(''); setNiche(''); setPage(1); }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => { fetchRows(); fetchStats(); }}>
            Refresh
          </Button>
        </Space>
        <Space>
          <Button
            type="primary"
            icon={<MailOutlined />}
            loading={sending}
            disabled={!selectedIds.length}
            onClick={() => sendBulk(selectedIds)}
          >
            Email selected ({Math.min(selectedIds.length, 40)})
          </Button>
        </Space>
      </Toolbar>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={rows}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          getCheckboxProps: (row) => ({
            disabled: !row.contact_email || row.status === 'contacted',
          }),
        }}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p) => { setPage(p); setSelectedRowKeys([]); },
          showTotal: (t) => `${t} creators`,
        }}
      />
    </Container>
  );
};

const Container = styled.div`
  padding: 24px;
  background: #f5f5f7;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  h1 {
    margin: 0 0 4px 0;
    font-size: 28px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #666;
  }
`;

const StatsRow = styled(Row)`
  margin-bottom: 24px;
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
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
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  text-align: center;
  width: 400px;

  h2 { margin: 0 0 8px 0; }
  p { color: #666; margin-bottom: 24px; }
`;

export default UgcSupplyAdmin;
