import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  Card, Statistic, Row, Col, Button, Form, Input, message, Tabs, Table, Tag,
  Space, DatePicker, Select, Spin, Progress, Tooltip
} from 'antd';
import {
  LockOutlined, UserOutlined, ReloadOutlined, LineChartOutlined,
  TeamOutlined, RiseOutlined, DollarOutlined, FireOutlined,
  TrophyOutlined, BarChartOutlined, FunnelPlotOutlined, CalendarOutlined,
  ShopOutlined, LinkOutlined, MailOutlined, SendOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, Funnel, FunnelChart, LabelList
} from 'recharts';
import api from '../config/api';

// Admin credentials - same as BrandAdmin
const ADMIN_EMAIL = 'team@newcollab.co';
const ADMIN_PASSWORD = 'Ilovela1992!';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];

const AdminReports = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const [signups, setSignups] = useState(null);
  const [dau, setDau] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [topUsers, setTopUsers] = useState([]);
  const [quotaHits, setQuotaHits] = useState(null);
  const [popularBrands, setPopularBrands] = useState([]);
  const [retention, setRetention] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [brandAnalytics, setBrandAnalytics] = useState(null);
  const [pitchAnalytics, setPitchAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('today');
  const [dateRange, setDateRange] = useState(30);

  // Check auth on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('adminReportsAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const getApiConfig = () => ({
    headers: { 'X-Admin-Token': 'pr-hunter-admin-2026' }
  });

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTodayStats(),
        fetchOverview(),
        fetchSignups(),
        fetchDAU(),
        fetchFunnel(),
        fetchTopUsers(),
        fetchQuotaHits(),
        fetchPopularBrands(),
        fetchRetention(),
        fetchBrandAnalytics(),
        fetchPitchAnalytics()
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      message.error('Failed to load some reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayStats = async () => {
    try {
      const { data } = await api.get('/api/admin/reports/today', getApiConfig());
      setTodayStats(data);
    } catch (error) {
      console.error('Failed to fetch today stats:', error);
    }
  };

  const fetchOverview = async () => {
    try {
      const { data } = await api.get('/api/admin/reports/overview', getApiConfig());
      setOverview(data);
    } catch (error) {
      console.error('Failed to fetch overview:', error);
    }
  };

  const fetchSignups = async () => {
    try {
      const { data } = await api.get(`/api/admin/reports/signups?days=${dateRange}`, getApiConfig());
      setSignups(data);
    } catch (error) {
      console.error('Failed to fetch signups:', error);
    }
  };

  const fetchDAU = async () => {
    try {
      const { data } = await api.get(`/api/admin/reports/dau?days=${dateRange}`, getApiConfig());
      setDau(data);
    } catch (error) {
      console.error('Failed to fetch DAU:', error);
    }
  };

  const fetchFunnel = async () => {
    try {
      const { data } = await api.get('/api/admin/reports/funnel', getApiConfig());
      setFunnel(data);
    } catch (error) {
      console.error('Failed to fetch funnel:', error);
    }
  };

  const fetchTopUsers = async () => {
    try {
      const { data } = await api.get('/api/admin/reports/top-users?limit=15', getApiConfig());
      setTopUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch top users:', error);
    }
  };

  const fetchQuotaHits = async () => {
    try {
      const { data } = await api.get('/api/admin/reports/quota-hits', getApiConfig());
      setQuotaHits(data);
    } catch (error) {
      console.error('Failed to fetch quota hits:', error);
    }
  };

  const fetchPopularBrands = async () => {
    try {
      const { data } = await api.get(`/api/admin/reports/popular-brands?limit=15&days=${dateRange}`, getApiConfig());
      setPopularBrands(data.brands || []);
    } catch (error) {
      console.error('Failed to fetch popular brands:', error);
    }
  };

  const fetchRetention = async () => {
    try {
      const { data } = await api.get('/api/admin/reports/retention', getApiConfig());
      setRetention(data);
    } catch (error) {
      console.error('Failed to fetch retention:', error);
    }
  };

  const fetchBrandAnalytics = async () => {
    try {
      const { data } = await api.get(`/api/admin/reports/brand-analytics?days=${dateRange}&limit=20`, getApiConfig());
      setBrandAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch brand analytics:', error);
    }
  };

  const fetchPitchAnalytics = async () => {
    try {
      const { data } = await api.get(`/api/admin/reports/pitch-analytics?days=${dateRange}`, getApiConfig());
      setPitchAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch pitch analytics:', error);
    }
  };

  const handleLogin = (values) => {
    if (values.email === ADMIN_EMAIL && values.password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminReportsAuth', 'true');
      setIsAuthenticated(true);
      message.success('Welcome to Admin Reports!');
    } else {
      message.error('Invalid credentials');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminReportsAuth');
    setIsAuthenticated(false);
  };

  // Top users table columns
  const topUsersColumns = [
    {
      title: 'Rank',
      key: 'rank',
      width: 60,
      render: (_, __, index) => (
        <span style={{ fontWeight: 'bold', color: index < 3 ? COLORS[index] : '#666' }}>
          #{index + 1}
        </span>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'instagram',
      render: (val) => val || '-'
    },
    {
      title: 'Tier',
      dataIndex: 'tier',
      key: 'tier',
      render: (tier) => (
        <Tag color={tier === 'pro' ? 'gold' : tier === 'elite' ? 'purple' : 'default'}>
          {tier}
        </Tag>
      )
    },
    {
      title: 'Unlocks',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
      render: (count) => <strong>{count}</strong>
    },
    {
      title: 'Last Active',
      dataIndex: 'last_activity',
      key: 'last_activity',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    }
  ];

  // Popular brands table columns
  const popularBrandsColumns = [
    {
      title: 'Rank',
      key: 'rank',
      width: 60,
      render: (_, __, index) => <strong>#{index + 1}</strong>
    },
    {
      title: 'Brand',
      dataIndex: 'brand_name',
      key: 'brand_name'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag>{cat}</Tag>
    },
    {
      title: 'Unlocks',
      dataIndex: 'unlock_count',
      key: 'unlock_count',
      sorter: (a, b) => a.unlock_count - b.unlock_count,
      render: (count) => <strong>{count}</strong>
    },
    {
      title: 'Unique Users',
      dataIndex: 'unique_users',
      key: 'unique_users'
    }
  ];

  // Quota hits table columns
  const quotaHitsColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'instagram',
      render: (val) => val || '-'
    },
    {
      title: 'Unlocks Used',
      dataIndex: 'unlocks_used',
      key: 'unlocks_used',
      render: (count) => (
        <Tag color="red">{count}/5</Tag>
      )
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString()
    }
  ];

  // Login form
  if (!isAuthenticated) {
    return (
      <LoginContainer>
        <LoginCard>
          <BarChartOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 24 }} />
          <h2>Admin Reports</h2>
          <p>Enter admin credentials to view analytics</p>
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

  // Format funnel data for chart
  const funnelData = funnel ? [
    { name: 'Saved', value: funnel.stages.saved || 0, fill: COLORS[0] },
    { name: 'Pitched', value: funnel.stages.pitched || 0, fill: COLORS[1] },
    { name: 'Responded', value: funnel.stages.responded || 0, fill: COLORS[2] },
    { name: 'Success', value: funnel.stages.success || 0, fill: COLORS[3] }
  ] : [];

  // Format subscription data for pie chart
  const subscriptionData = overview?.subscription_breakdown
    ? Object.entries(overview.subscription_breakdown).map(([name, value], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        fill: COLORS[index % COLORS.length]
      }))
    : [];

  return (
    <Container>
      <Header>
        <div>
          <h1><BarChartOutlined /> Admin Reports</h1>
          <p>Creator usage analytics and monetization insights</p>
        </div>
        <Space>
          <Select
            value={dateRange}
            onChange={(val) => setDateRange(val)}
            style={{ width: 120 }}
          >
            <Select.Option value={7}>Last 7 days</Select.Option>
            <Select.Option value={30}>Last 30 days</Select.Option>
            <Select.Option value={90}>Last 90 days</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchAllData} loading={loading}>
            Refresh
          </Button>
          <Button onClick={handleLogout}>Logout</Button>
        </Space>
      </Header>

      {loading && !overview ? (
        <LoadingContainer>
          <Spin size="large" />
          <p>Loading reports...</p>
        </LoadingContainer>
      ) : (
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Today Tab - Daily Piloting */}
          <Tabs.TabPane tab={<span><FireOutlined /> Today</span>} key="today">
            <TodayHeader>
              <h2>Daily Report - {todayStats?.date || new Date().toLocaleDateString()}</h2>
              <p>Your daily snapshot for quick piloting decisions</p>
            </TodayHeader>

            {/* Today's Key Metrics with Comparison */}
            <StatsRow gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="Signups Today"
                    value={todayStats?.signups?.today || 0}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#667eea' }}
                    suffix={
                      <ChangeIndicator positive={todayStats?.signups?.change >= 0}>
                        {todayStats?.signups?.change > 0 ? '+' : ''}{todayStats?.signups?.change || 0} vs yesterday
                      </ChangeIndicator>
                    }
                  />
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="Active Users Today"
                    value={todayStats?.active_users?.today || 0}
                    prefix={<FireOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                    suffix={
                      <ChangeIndicator positive={todayStats?.active_users?.change >= 0}>
                        {todayStats?.active_users?.change > 0 ? '+' : ''}{todayStats?.active_users?.change || 0} vs yesterday
                      </ChangeIndicator>
                    }
                  />
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="Unlocks Today"
                    value={todayStats?.unlocks?.today || 0}
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#faad14' }}
                    suffix={
                      <ChangeIndicator positive={todayStats?.unlocks?.change >= 0}>
                        {todayStats?.unlocks?.change > 0 ? '+' : ''}{todayStats?.unlocks?.change || 0} vs yesterday
                      </ChangeIndicator>
                    }
                  />
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="Pipeline Saves"
                    value={todayStats?.pipeline_saves_today || 0}
                    prefix={<FunnelPlotOutlined />}
                    valueStyle={{ color: '#eb2f96' }}
                  />
                </StatCard>
              </Col>
            </StatsRow>

            {/* AI Pitch Credits Today */}
            <StatsRow gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="AI Pitches Today"
                    value={pitchAnalytics?.today?.pitches_today || 0}
                    prefix={<SendOutlined />}
                    valueStyle={{ color: '#667eea' }}
                    suffix={
                      <ChangeIndicator positive={(pitchAnalytics?.today?.change || 0) >= 0}>
                        {(pitchAnalytics?.today?.change || 0) > 0 ? '+' : ''}{pitchAnalytics?.today?.change || 0} vs yesterday
                      </ChangeIndicator>
                    }
                  />
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="Pitch Users Today"
                    value={pitchAnalytics?.today?.unique_users_today || 0}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <HelpText>Creators who used AI contact</HelpText>
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard highlight>
                  <Statistic
                    title="At Pitch Limit"
                    value={pitchAnalytics?.quota?.at_limit || 0}
                    prefix={<ThunderboltOutlined />}
                    valueStyle={{ color: '#f5222d' }}
                  />
                  <HelpText>Free users maxed 3 pitches/week</HelpText>
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="New Pro Subscriptions"
                    value={todayStats?.new_pro_subscriptions || 0}
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <HelpText>Conversions to paid tier today</HelpText>
                </StatCard>
              </Col>
            </StatsRow>

            {/* Legacy Monetization Signals */}
            <StatsRow gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <StatCard>
                  <Statistic
                    title="Users Hit Unlock Limit"
                    value={todayStats?.quota?.at_limit || 0}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: '#faad14', fontSize: 28 }}
                  />
                  <HelpText>Free users who maxed out 5 unlocks</HelpText>
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <StatCard>
                  <Statistic
                    title="Users Near Limit (3-4)"
                    value={todayStats?.quota?.near_limit || 0}
                    prefix={<RiseOutlined />}
                    valueStyle={{ color: '#faad14', fontSize: 28 }}
                  />
                  <HelpText>One more session and they'll hit the paywall</HelpText>
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <StatCard>
                  <Statistic
                    title="Pipeline Saves"
                    value={todayStats?.pipeline_saves_today || 0}
                    prefix={<FunnelPlotOutlined />}
                    valueStyle={{ color: '#eb2f96', fontSize: 28 }}
                  />
                </StatCard>
              </Col>
            </StatsRow>

            {/* Today's Activity Tables */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <ChartCard>
                  <h3><SendOutlined /> Top Pitch Users Today</h3>
                  <Table
                    dataSource={pitchAnalytics?.today?.top_users || []}
                    columns={[
                      {
                        title: 'Creator',
                        key: 'creator',
                        render: (_, record) => (
                          <div>
                            <strong>{record.username || '-'}</strong>
                            <div style={{ fontSize: 11, color: '#999' }}>{record.email}</div>
                          </div>
                        )
                      },
                      {
                        title: 'Tier',
                        dataIndex: 'tier',
                        key: 'tier',
                        render: (tier) => (
                          <Tag color={tier === 'pro' ? 'gold' : tier === 'elite' ? 'purple' : 'default'}>
                            {tier}
                          </Tag>
                        )
                      },
                      {
                        title: 'Pitches Today',
                        dataIndex: 'pitches_today',
                        key: 'pitches_today',
                        render: (count) => <Tag color="purple"><strong>{count}</strong></Tag>
                      },
                      {
                        title: 'Week Total',
                        dataIndex: 'pitches_this_week',
                        key: 'pitches_this_week',
                        render: (count, record) => (
                          <span>
                            {count}
                            {record.tier === 'free' && <small style={{ color: '#999' }}>/3</small>}
                          </span>
                        )
                      }
                    ]}
                    rowKey="creator_id"
                    pagination={false}
                    size="small"
                    locale={{ emptyText: 'No pitches yet today' }}
                  />
                </ChartCard>
              </Col>
              <Col xs={24} lg={12}>
                <ChartCard>
                  <h3><ShopOutlined /> Top Pitched Brands Today</h3>
                  <Table
                    dataSource={pitchAnalytics?.today?.top_brands || []}
                    columns={[
                      {
                        title: 'Brand',
                        dataIndex: 'brand_name',
                        key: 'brand_name'
                      },
                      {
                        title: 'Category',
                        dataIndex: 'category',
                        key: 'category',
                        render: (cat) => <Tag>{cat}</Tag>
                      },
                      {
                        title: 'Contact',
                        dataIndex: 'contact_type',
                        key: 'contact_type',
                        render: (type) => (
                          <Tag color={type === 'email' ? 'blue' : 'green'} size="small">
                            {type === 'email' ? 'Email' : 'Form'}
                          </Tag>
                        )
                      },
                      {
                        title: 'Pitches',
                        dataIndex: 'pitch_count',
                        key: 'pitch_count',
                        render: (count) => <strong>{count}</strong>
                      }
                    ]}
                    rowKey="brand_id"
                    pagination={false}
                    size="small"
                    locale={{ emptyText: 'No pitches yet today' }}
                  />
                </ChartCard>
              </Col>
            </Row>

            {/* Legacy Tables - Unlocks */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <ChartCard>
                  <h3>Most Active Users Today (Saves)</h3>
                  <Table
                    dataSource={todayStats?.most_active_users_today || []}
                    columns={[
                      {
                        title: 'Creator',
                        key: 'creator',
                        render: (_, record) => (
                          <div>
                            <strong>{record.username || '-'}</strong>
                            <div style={{ fontSize: 11, color: '#999' }}>{record.email}</div>
                          </div>
                        )
                      },
                      {
                        title: 'Followers',
                        dataIndex: 'followers_count',
                        key: 'followers_count',
                        render: (val) => val ? val.toLocaleString() : '-'
                      },
                      {
                        title: 'Eng %',
                        dataIndex: 'engagement_rate',
                        key: 'engagement_rate',
                        render: (val) => val ? `${val.toFixed(1)}%` : '-'
                      },
                      {
                        title: 'Tier',
                        dataIndex: 'tier',
                        key: 'tier',
                        render: (tier) => (
                          <Tag color={tier === 'pro' ? 'gold' : tier === 'elite' ? 'purple' : 'default'}>
                            {tier}
                          </Tag>
                        )
                      },
                      {
                        title: 'Saves',
                        dataIndex: 'unlocks_today',
                        key: 'unlocks_today',
                        render: (count) => <Tag color="green"><strong>{count}</strong></Tag>
                      }
                    ]}
                    rowKey="creator_id"
                    pagination={false}
                    size="small"
                  />
                </ChartCard>
              </Col>
              <Col xs={24} lg={12}>
                <ChartCard>
                  <h3>Top Brands Unlocked Today</h3>
                  <Table
                    dataSource={todayStats?.top_brands_today || []}
                    columns={[
                      {
                        title: 'Brand',
                        dataIndex: 'brand_name',
                        key: 'brand_name'
                      },
                      {
                        title: 'Category',
                        dataIndex: 'category',
                        key: 'category',
                        render: (cat) => <Tag>{cat}</Tag>
                      },
                      {
                        title: 'Unlocks',
                        dataIndex: 'unlock_count',
                        key: 'unlock_count',
                        render: (count) => <strong>{count}</strong>
                      }
                    ]}
                    rowKey="brand_name"
                    pagination={false}
                    size="small"
                  />
                </ChartCard>
              </Col>
            </Row>
          </Tabs.TabPane>

          {/* Overview Tab */}
          <Tabs.TabPane tab={<span><LineChartOutlined /> Overview</span>} key="overview">
            {/* KPI Cards */}
            <StatsRow gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="Total Creators"
                    value={overview?.total_creators || 0}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#667eea' }}
                  />
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="Active Today"
                    value={overview?.active_today || 0}
                    prefix={<FireOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="Active (7d)"
                    value={overview?.active_7d || 0}
                    prefix={<CalendarOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="Active (30d)"
                    value={overview?.active_30d || 0}
                    prefix={<RiseOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </StatCard>
              </Col>
            </StatsRow>

            <StatsRow gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="Total Unlocks"
                    value={overview?.total_unlocks || 0}
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="Pipeline Saves"
                    value={overview?.total_pipeline_saves || 0}
                    prefix={<FunnelPlotOutlined />}
                    valueStyle={{ color: '#eb2f96' }}
                  />
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard highlight>
                  <Statistic
                    title="At Quota Today"
                    value={quotaHits?.users_at_limit_today || 0}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: '#f5222d' }}
                    suffix={<small style={{ fontSize: 14, color: '#999' }}> / {quotaHits?.users_near_limit_today || 0} near</small>}
                  />
                  <HelpText>Users hitting free tier limit = upsell opportunity</HelpText>
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="Avg DAU"
                    value={dau?.avg_dau || 0}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#13c2c2' }}
                  />
                </StatCard>
              </Col>
            </StatsRow>

            {/* Top Active Creators */}
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <ChartCard>
                  <h3><UserOutlined /> Top Active Creators</h3>
                  <Table
                    dataSource={overview?.top_creators || []}
                    columns={[
                      {
                        title: 'Creator',
                        key: 'creator',
                        width: 200,
                        render: (_, record) => (
                          <div>
                            <strong>{record.username || '-'}</strong>
                            <div style={{ fontSize: 11, color: '#999' }}>{record.email}</div>
                          </div>
                        )
                      },
                      {
                        title: 'Followers',
                        dataIndex: 'followers_count',
                        key: 'followers_count',
                        sorter: (a, b) => (a.followers_count || 0) - (b.followers_count || 0),
                        render: (val) => val ? val.toLocaleString() : '-'
                      },
                      {
                        title: 'Eng. Rate',
                        dataIndex: 'engagement_rate',
                        key: 'engagement_rate',
                        sorter: (a, b) => (a.engagement_rate || 0) - (b.engagement_rate || 0),
                        render: (val) => val ? `${val.toFixed(1)}%` : '-'
                      },
                      {
                        title: 'Tier',
                        dataIndex: 'tier',
                        key: 'tier',
                        render: (tier) => (
                          <Tag color={tier === 'pro' ? 'gold' : tier === 'elite' ? 'purple' : 'default'}>
                            {tier}
                          </Tag>
                        )
                      },
                      {
                        title: 'Saves (7d)',
                        dataIndex: 'saves_7d',
                        key: 'saves_7d',
                        sorter: (a, b) => a.saves_7d - b.saves_7d,
                        render: (count) => <Tag color="blue">{count}</Tag>
                      },
                      {
                        title: 'Total Saves',
                        dataIndex: 'total_saves',
                        key: 'total_saves',
                        sorter: (a, b) => a.total_saves - b.total_saves,
                        render: (count) => <strong>{count}</strong>
                      },
                      {
                        title: 'Daily Used',
                        dataIndex: 'daily_unlocks_used',
                        key: 'daily_unlocks_used',
                        render: (val) => <span>{val || 0}/5</span>
                      },
                      {
                        title: 'Last Active',
                        dataIndex: 'last_activity',
                        key: 'last_activity',
                        render: (date) => date ? new Date(date).toLocaleDateString() : '-'
                      }
                    ]}
                    rowKey="creator_id"
                    pagination={{ pageSize: 15 }}
                    size="small"
                    scroll={{ x: 900 }}
                  />
                </ChartCard>
              </Col>
            </Row>

            {/* Charts Row */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <ChartCard>
                  <h3>Daily Active Users</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dau?.daily || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <RechartsTooltip />
                      <Area
                        type="monotone"
                        dataKey="active_users"
                        stroke="#667eea"
                        fill="url(#colorGradient)"
                        name="Active Users"
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Col>
              <Col xs={24} lg={8}>
                <ChartCard>
                  <h3>Subscription Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={subscriptionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {subscriptionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Col>
            </Row>
          </Tabs.TabPane>

          {/* Growth Tab */}
          <Tabs.TabPane tab={<span><RiseOutlined /> Growth</span>} key="growth">
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <ChartCard>
                  <h3>Daily Signups (Last {dateRange} days)</h3>
                  <p style={{ color: '#666', marginBottom: 16 }}>
                    Total new signups: <strong>{signups?.total_period || 0}</strong>
                  </p>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={signups?.daily || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill="#667eea" name="New Signups" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Col>
            </Row>
          </Tabs.TabPane>

          {/* Funnel Tab */}
          <Tabs.TabPane tab={<span><FunnelPlotOutlined /> Funnel</span>} key="funnel">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <ChartCard>
                  <h3>Pipeline Funnel</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={funnelData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <RechartsTooltip />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Col>
              <Col xs={24} lg={12}>
                <ChartCard>
                  <h3>Conversion Rates</h3>
                  <ConversionRates>
                    <ConversionItem>
                      <span>Saved → Pitched</span>
                      <Progress
                        percent={funnel?.conversion_rates?.saved_to_pitched || 0}
                        strokeColor="#667eea"
                      />
                    </ConversionItem>
                    <ConversionItem>
                      <span>Pitched → Responded</span>
                      <Progress
                        percent={funnel?.conversion_rates?.pitched_to_responded || 0}
                        strokeColor="#764ba2"
                      />
                    </ConversionItem>
                    <ConversionItem>
                      <span>Responded → Success</span>
                      <Progress
                        percent={funnel?.conversion_rates?.responded_to_success || 0}
                        strokeColor="#52c41a"
                      />
                    </ConversionItem>
                  </ConversionRates>
                </ChartCard>
              </Col>
            </Row>
          </Tabs.TabPane>

          {/* Power Users Tab */}
          <Tabs.TabPane tab={<span><TrophyOutlined /> Power Users</span>} key="users">
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <ChartCard>
                  <h3>Top Users by Unlocks</h3>
                  <Table
                    dataSource={topUsers}
                    columns={topUsersColumns}
                    rowKey="creator_id"
                    pagination={false}
                    size="small"
                  />
                </ChartCard>
              </Col>
            </Row>
          </Tabs.TabPane>

          {/* Monetization Tab */}
          <Tabs.TabPane tab={<span><DollarOutlined /> Monetization</span>} key="monetization">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <ChartCard highlight>
                  <h3>Quota Limit Hits (Upsell Signal)</h3>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                      <Statistic
                        title="At Limit Today"
                        value={quotaHits?.users_at_limit_today || 0}
                        valueStyle={{ color: '#f5222d' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Near Limit (3-4)"
                        value={quotaHits?.users_near_limit_today || 0}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                  </Row>
                  <Table
                    dataSource={quotaHits?.recent_limit_hits || []}
                    columns={quotaHitsColumns}
                    rowKey="creator_id"
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                </ChartCard>
              </Col>
              <Col xs={24} lg={12}>
                <ChartCard>
                  <h3>Popular Brands (Last {dateRange} days)</h3>
                  <Table
                    dataSource={popularBrands}
                    columns={popularBrandsColumns}
                    rowKey="brand_id"
                    pagination={false}
                    size="small"
                  />
                </ChartCard>
              </Col>
            </Row>
          </Tabs.TabPane>

          {/* Retention Tab */}
          <Tabs.TabPane tab={<span><CalendarOutlined /> Retention</span>} key="retention">
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <ChartCard>
                  <h3>Weekly Cohort Retention</h3>
                  <p style={{ color: '#666', marginBottom: 16 }}>
                    Shows how many users from each signup week came back in subsequent weeks
                  </p>
                  <RetentionTable>
                    <thead>
                      <tr>
                        <th>Signup Week</th>
                        <th>Users</th>
                        <th>Week 0</th>
                        <th>Week 1</th>
                        <th>Week 2</th>
                        <th>Week 3</th>
                        <th>Week 4</th>
                      </tr>
                    </thead>
                    <tbody>
                      {retention?.cohorts?.map((cohort, idx) => (
                        <tr key={idx}>
                          <td>{cohort.signup_week}</td>
                          <td><strong>{cohort.total_users}</strong></td>
                          <td>
                            <RetentionCell rate={cohort.total_users ? (cohort.week_0 / cohort.total_users) * 100 : 0}>
                              {cohort.week_0} ({cohort.total_users ? Math.round((cohort.week_0 / cohort.total_users) * 100) : 0}%)
                            </RetentionCell>
                          </td>
                          <td>
                            <RetentionCell rate={cohort.total_users ? (cohort.week_1 / cohort.total_users) * 100 : 0}>
                              {cohort.week_1} ({cohort.total_users ? Math.round((cohort.week_1 / cohort.total_users) * 100) : 0}%)
                            </RetentionCell>
                          </td>
                          <td>
                            <RetentionCell rate={cohort.total_users ? (cohort.week_2 / cohort.total_users) * 100 : 0}>
                              {cohort.week_2} ({cohort.total_users ? Math.round((cohort.week_2 / cohort.total_users) * 100) : 0}%)
                            </RetentionCell>
                          </td>
                          <td>
                            <RetentionCell rate={cohort.total_users ? (cohort.week_3 / cohort.total_users) * 100 : 0}>
                              {cohort.week_3} ({cohort.total_users ? Math.round((cohort.week_3 / cohort.total_users) * 100) : 0}%)
                            </RetentionCell>
                          </td>
                          <td>
                            <RetentionCell rate={cohort.total_users ? (cohort.week_4 / cohort.total_users) * 100 : 0}>
                              {cohort.week_4} ({cohort.total_users ? Math.round((cohort.week_4 / cohort.total_users) * 100) : 0}%)
                            </RetentionCell>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </RetentionTable>
                </ChartCard>
              </Col>
            </Row>
          </Tabs.TabPane>

          {/* Brands Tab */}
          <Tabs.TabPane tab={<span><ShopOutlined /> Brands</span>} key="brands">
            {/* Brand Overview Stats */}
            <StatsRow gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="Total Brands"
                    value={brandAnalytics?.overview?.total_brands || 0}
                    prefix={<ShopOutlined />}
                    valueStyle={{ color: '#667eea' }}
                  />
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="Brands with Form"
                    value={brandAnalytics?.overview?.brands_with_form || 0}
                    prefix={<LinkOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="Brands with Email"
                    value={brandAnalytics?.overview?.brands_with_email || 0}
                    prefix={<MailOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title={`Unlocks (${dateRange}d)`}
                    value={brandAnalytics?.overview?.total_unlocks_period || 0}
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </StatCard>
              </Col>
            </StatsRow>

            {/* Unlocks by Category */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <ChartCard>
                  <h3>Unlocks by Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={brandAnalytics?.unlocks_by_category || []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="category" width={100} />
                      <RechartsTooltip />
                      <Bar dataKey="unlock_count" fill="#667eea" name="Unlocks" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Col>
              <Col xs={24} lg={12}>
                <ChartCard>
                  <h3>Recent Unlocks</h3>
                  <Table
                    dataSource={brandAnalytics?.recent_unlocks?.slice(0, 10) || []}
                    columns={[
                      {
                        title: 'Brand',
                        dataIndex: 'brand_name',
                        key: 'brand_name',
                        ellipsis: true
                      },
                      {
                        title: 'User',
                        dataIndex: 'user_email',
                        key: 'user_email',
                        ellipsis: true,
                        render: (email) => email?.split('@')[0] + '...'
                      },
                      {
                        title: 'When',
                        dataIndex: 'unlocked_at',
                        key: 'unlocked_at',
                        render: (date) => new Date(date).toLocaleString()
                      }
                    ]}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                </ChartCard>
              </Col>
            </Row>

            {/* Top Brands Tables */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={8}>
                <ChartCard>
                  <h3>Top Unlocked Brands (All)</h3>
                  <Table
                    dataSource={brandAnalytics?.top_unlocked_brands || []}
                    columns={[
                      {
                        title: 'Brand',
                        dataIndex: 'brand_name',
                        key: 'brand_name',
                        ellipsis: true
                      },
                      {
                        title: 'Type',
                        dataIndex: 'contact_type',
                        key: 'contact_type',
                        render: (type) => (
                          <Tag color={type === 'form' ? 'green' : type === 'email' ? 'blue' : 'default'}>
                            {type === 'form' ? 'Form' : type === 'email' ? 'Email' : 'None'}
                          </Tag>
                        )
                      },
                      {
                        title: 'Unlocks',
                        dataIndex: 'unlock_count',
                        key: 'unlock_count',
                        render: (count) => <strong>{count}</strong>
                      }
                    ]}
                    rowKey="brand_id"
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                </ChartCard>
              </Col>
              <Col xs={24} lg={8}>
                <ChartCard>
                  <h3><LinkOutlined /> Top Brands with Form</h3>
                  <Table
                    dataSource={brandAnalytics?.top_brands_with_form || []}
                    columns={[
                      {
                        title: 'Brand',
                        dataIndex: 'brand_name',
                        key: 'brand_name',
                        ellipsis: true
                      },
                      {
                        title: 'Category',
                        dataIndex: 'category',
                        key: 'category',
                        render: (cat) => <Tag>{cat}</Tag>
                      },
                      {
                        title: 'Unlocks',
                        dataIndex: 'unlock_count',
                        key: 'unlock_count',
                        render: (count) => <strong>{count}</strong>
                      }
                    ]}
                    rowKey="brand_id"
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                </ChartCard>
              </Col>
              <Col xs={24} lg={8}>
                <ChartCard>
                  <h3><MailOutlined /> Top Brands (Email Only)</h3>
                  <Table
                    dataSource={brandAnalytics?.top_brands_email_only || []}
                    columns={[
                      {
                        title: 'Brand',
                        dataIndex: 'brand_name',
                        key: 'brand_name',
                        ellipsis: true
                      },
                      {
                        title: 'Category',
                        dataIndex: 'category',
                        key: 'category',
                        render: (cat) => <Tag>{cat}</Tag>
                      },
                      {
                        title: 'Unlocks',
                        dataIndex: 'unlock_count',
                        key: 'unlock_count',
                        render: (count) => <strong>{count}</strong>
                      }
                    ]}
                    rowKey="brand_id"
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                </ChartCard>
              </Col>
            </Row>
          </Tabs.TabPane>

          {/* AI Pitches Tab - Track credit usage */}
          <Tabs.TabPane tab={<span><SendOutlined /> AI Pitches</span>} key="pitches">
            {/* Pitch Overview Stats */}
            <StatsRow gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="Pitches Today"
                    value={pitchAnalytics?.today?.pitches_today || 0}
                    prefix={<SendOutlined />}
                    valueStyle={{ color: '#667eea' }}
                  />
                  <HelpText>AI credits used today</HelpText>
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title="Unique Users Today"
                    value={pitchAnalytics?.today?.unique_users_today || 0}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <HelpText>Users who sent pitches today</HelpText>
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard highlight>
                  <Statistic
                    title="At Weekly Limit"
                    value={pitchAnalytics?.quota?.at_limit || 0}
                    prefix={<ThunderboltOutlined />}
                    valueStyle={{ color: '#f5222d' }}
                  />
                  <HelpText>Free users who maxed 3 pitches/week</HelpText>
                </StatCard>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard>
                  <Statistic
                    title={`Total Pitches (${dateRange}d)`}
                    value={pitchAnalytics?.period?.total_pitches || 0}
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </StatCard>
              </Col>
            </StatsRow>

            {/* Daily Pitch Trend Chart */}
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <ChartCard>
                  <h3>Daily Pitch Credits Used (Last {dateRange} days)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={pitchAnalytics?.daily || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <RechartsTooltip />
                      <Area
                        type="monotone"
                        dataKey="pitch_count"
                        stroke="#667eea"
                        fill="url(#pitchGradient)"
                        name="Pitches Sent"
                      />
                      <Area
                        type="monotone"
                        dataKey="unique_users"
                        stroke="#52c41a"
                        fill="url(#usersGradient)"
                        name="Unique Users"
                      />
                      <defs>
                        <linearGradient id="pitchGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#52c41a" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#52c41a" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Col>
            </Row>

            {/* Top Users and Top Brands Tables */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <ChartCard>
                  <h3><UserOutlined /> Top Users by Pitches Sent</h3>
                  <Table
                    dataSource={pitchAnalytics?.top_users || []}
                    columns={[
                      {
                        title: 'Creator',
                        key: 'creator',
                        render: (_, record) => (
                          <div>
                            <strong>{record.username || '-'}</strong>
                            <div style={{ fontSize: 11, color: '#999' }}>{record.email}</div>
                          </div>
                        )
                      },
                      {
                        title: 'Tier',
                        dataIndex: 'tier',
                        key: 'tier',
                        render: (tier) => (
                          <Tag color={tier === 'pro' ? 'gold' : tier === 'elite' ? 'purple' : 'default'}>
                            {tier}
                          </Tag>
                        )
                      },
                      {
                        title: 'This Week',
                        dataIndex: 'pitches_this_week',
                        key: 'pitches_this_week',
                        render: (count, record) => (
                          <span>
                            <strong>{count}</strong>
                            {record.tier === 'free' && <small style={{ color: '#999' }}>/3</small>}
                          </span>
                        )
                      },
                      {
                        title: `Total (${dateRange}d)`,
                        dataIndex: 'total_pitches',
                        key: 'total_pitches',
                        sorter: (a, b) => a.total_pitches - b.total_pitches,
                        render: (count) => <Tag color="blue">{count}</Tag>
                      }
                    ]}
                    rowKey="creator_id"
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                </ChartCard>
              </Col>
              <Col xs={24} lg={12}>
                <ChartCard>
                  <h3><ShopOutlined /> Most Pitched Brands</h3>
                  <Table
                    dataSource={pitchAnalytics?.top_brands || []}
                    columns={[
                      {
                        title: 'Brand',
                        dataIndex: 'brand_name',
                        key: 'brand_name',
                        ellipsis: true
                      },
                      {
                        title: 'Category',
                        dataIndex: 'category',
                        key: 'category',
                        render: (cat) => <Tag>{cat}</Tag>
                      },
                      {
                        title: 'Contact Type',
                        dataIndex: 'contact_type',
                        key: 'contact_type',
                        render: (type) => (
                          <Tag color={type === 'email' ? 'blue' : type === 'form' ? 'green' : 'default'}>
                            {type === 'email' ? 'Email' : type === 'form' ? 'Form' : 'Mixed'}
                          </Tag>
                        )
                      },
                      {
                        title: 'Pitches',
                        dataIndex: 'pitch_count',
                        key: 'pitch_count',
                        sorter: (a, b) => a.pitch_count - b.pitch_count,
                        render: (count) => <strong>{count}</strong>
                      },
                      {
                        title: 'Unique Users',
                        dataIndex: 'unique_users',
                        key: 'unique_users'
                      }
                    ]}
                    rowKey="brand_id"
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                </ChartCard>
              </Col>
            </Row>

            {/* Recent Pitches and Quota Hits */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <ChartCard>
                  <h3>Recent Pitch Activity</h3>
                  <Table
                    dataSource={pitchAnalytics?.recent_pitches || []}
                    columns={[
                      {
                        title: 'User',
                        dataIndex: 'email',
                        key: 'email',
                        ellipsis: true,
                        render: (email) => email?.split('@')[0] + '...'
                      },
                      {
                        title: 'Brand',
                        dataIndex: 'brand_name',
                        key: 'brand_name',
                        ellipsis: true
                      },
                      {
                        title: 'Type',
                        dataIndex: 'contact_type',
                        key: 'contact_type',
                        render: (type) => (
                          <Tag color={type === 'email' ? 'blue' : 'green'} size="small">
                            {type === 'email' ? 'Email' : 'Form'}
                          </Tag>
                        )
                      },
                      {
                        title: 'When',
                        dataIndex: 'pitched_at',
                        key: 'pitched_at',
                        render: (date) => {
                          const d = new Date(date);
                          const now = new Date();
                          const diffMins = Math.floor((now - d) / 60000);
                          if (diffMins < 60) return `${diffMins}m ago`;
                          if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
                          return d.toLocaleDateString();
                        }
                      }
                    ]}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                </ChartCard>
              </Col>
              <Col xs={24} lg={12}>
                <ChartCard highlight>
                  <h3><ThunderboltOutlined /> Users at Weekly Pitch Limit (Upsell Opportunity)</h3>
                  <Table
                    dataSource={pitchAnalytics?.users_at_limit || []}
                    columns={[
                      {
                        title: 'User',
                        key: 'user',
                        render: (_, record) => (
                          <div>
                            <strong>{record.username || '-'}</strong>
                            <div style={{ fontSize: 11, color: '#999' }}>{record.email}</div>
                          </div>
                        )
                      },
                      {
                        title: 'Used',
                        dataIndex: 'pitches_this_week',
                        key: 'pitches_this_week',
                        render: (count) => <Tag color="red">{count}/3</Tag>
                      },
                      {
                        title: 'Total Pitches',
                        dataIndex: 'total_pitches',
                        key: 'total_pitches'
                      },
                      {
                        title: 'Last Pitch',
                        dataIndex: 'last_pitch_at',
                        key: 'last_pitch_at',
                        render: (date) => date ? new Date(date).toLocaleDateString() : '-'
                      }
                    ]}
                    rowKey="creator_id"
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                </ChartCard>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 24px;
  background: #f5f7fa;
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
    color: #333;
  }

  p {
    margin: 0;
    color: #666;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;

  p {
    margin-top: 16px;
    color: #666;
  }
`;

const StatsRow = styled(Row)`
  margin-bottom: 24px;
`;

const StatCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: transform 0.2s, box-shadow 0.2s;

  ${props => props.highlight && `
    border: 2px solid #f5222d;
    background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }

  .ant-statistic-title {
    font-size: 14px;
    font-weight: 500;
  }
`;

const HelpText = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 8px;
`;

const TodayHeader = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;

  h2 {
    margin: 0 0 4px 0;
    font-size: 24px;
    font-weight: 700;
  }

  p {
    margin: 0;
    opacity: 0.9;
  }
`;

const ChangeIndicator = styled.div`
  display: block;
  font-size: 12px;
  margin-top: 4px;
  color: ${props => props.positive ? '#52c41a' : '#f5222d'};
  font-weight: 500;
`;

const ChartCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 16px;

  ${props => props.highlight && `
    border: 2px solid #f5222d;
  `}

  h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
`;

const ConversionRates = styled.div`
  padding: 24px 0;
`;

const ConversionItem = styled.div`
  margin-bottom: 24px;

  span {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
  }
`;

const RetentionTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 12px;
    text-align: center;
    border: 1px solid #f0f0f0;
  }

  th {
    background: #fafafa;
    font-weight: 600;
  }

  tr:hover td {
    background: #f5f5f5;
  }
`;

const RetentionCell = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${props => {
    if (props.rate >= 50) return '#d4edda';
    if (props.rate >= 30) return '#fff3cd';
    if (props.rate >= 10) return '#ffeaa7';
    return '#f8d7da';
  }};
  color: ${props => {
    if (props.rate >= 50) return '#155724';
    if (props.rate >= 30) return '#856404';
    if (props.rate >= 10) return '#856404';
    return '#721c24';
  }};
  font-size: 13px;
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

  h2 {
    margin: 0 0 8px 0;
  }

  p {
    color: #666;
    margin-bottom: 24px;
  }
`;

export default AdminReports;
