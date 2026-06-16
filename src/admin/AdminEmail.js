import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Card, Statistic, Row, Col, Button, Form, Input, message, Tabs, Table, Tag,
  Space, Select, Spin, Progress, Modal, Radio, Badge, Tooltip, Divider
} from 'antd';
import {
  MailOutlined, UserOutlined, ReloadOutlined, SendOutlined,
  TeamOutlined, RiseOutlined, EyeOutlined, ThunderboltOutlined,
  TrophyOutlined, ClockCircleOutlined, EditOutlined, PlusOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, LockOutlined,
  DesktopOutlined, MobileOutlined, CopyOutlined
} from '@ant-design/icons';
import api from '../config/api';
import { generateWeeklyBrandRoundup, generateSubjectLine, sampleBrands, generateGeneralAnnouncement } from '../email-templates';

const { TextArea } = Input;

// Admin credentials
const ADMIN_EMAIL = 'team@newcollab.co';
const ADMIN_PASSWORD = 'Ilovela1992!';

const AdminEmail = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');

  // Data states
  const [stats, setStats] = useState(null);
  const [segments, setSegments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [previewUsers, setPreviewUsers] = useState([]);
  const [previewCount, setPreviewCount] = useState(0);

  // Campaign builder states
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState('all_active');
  const [campaignName, setCampaignName] = useState('');
  const [subjectOverride, setSubjectOverride] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [sending, setSending] = useState(false);

  // Template preview states
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [previewViewMode, setPreviewViewMode] = useState('desktop');
  const [previewTemplateName, setPreviewTemplateName] = useState('brand_roundup');

  // Roundup brands state
  const [roundupBrands, setRoundupBrands] = useState([]);
  const [roundupBrandsLoading, setRoundupBrandsLoading] = useState(false);

  // General announcement composer state
  const [showAnnouncementPreview, setShowAnnouncementPreview] = useState(false);
  const [announcementViewMode, setAnnouncementViewMode] = useState('desktop');
  const [announcementConfig, setAnnouncementConfig] = useState({
    headerTitle: 'An update from Newcollab',
    headerSubtitle: '',
    gradient: 'teal',
    bodyText: `<p style="margin: 0 0 16px 0; font-size: 16px; color: #111827;">Hey {{first_name}}!</p>\n<p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.6;">Your message here.</p>`,
    calloutText: '',
    calloutIcon: '💡',
    ctaLabel: 'Go to Dashboard',
    ctaUrl: 'https://app.newcollab.co',
    preheader: '',
  });

  // Check auth on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('adminEmailAuth');
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
        fetchStats(),
        fetchSegments(),
        fetchTemplates(),
        fetchCampaigns()
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      message.error('Failed to load email data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/api/admin/email/stats', getApiConfig());
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchSegments = async () => {
    try {
      const { data } = await api.get('/api/admin/email/segments', getApiConfig());
      setSegments(data.segments || []);
    } catch (error) {
      console.error('Failed to fetch segments:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data } = await api.get('/api/admin/email/templates', getApiConfig());
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data } = await api.get('/api/admin/email/campaigns', getApiConfig());
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    }
  };

  const fetchRoundupBrands = async () => {
    setRoundupBrandsLoading(true);
    try {
      const { data } = await api.get('/api/admin/brands/roundup-featured', getApiConfig());
      setRoundupBrands(data.brands || []);
    } catch (error) {
      console.error('Failed to fetch roundup brands:', error);
      message.error('Could not load roundup brands');
    } finally {
      setRoundupBrandsLoading(false);
    }
  };

  const buildAnnouncementHTML = (config = announcementConfig, forCampaign = false) => {
    const blocks = [];
    if (config.calloutText) {
      blocks.push({
        type: 'callout',
        text: config.calloutText,
        icon: config.calloutIcon || '💡',
        color: '#26A69A',
        bg: '#f0faf9',
      });
    }
    return generateGeneralAnnouncement({
      firstName: forCampaign ? '{{first_name}}' : 'Sarah',
      headerTitle: config.headerTitle || 'An update from Newcollab',
      headerSubtitle: config.headerSubtitle || '',
      gradient: config.gradient || 'teal',
      bodyText: config.bodyText || '',
      blocks,
      primaryCta: config.ctaLabel ? { label: config.ctaLabel, url: config.ctaUrl || 'https://app.newcollab.co' } : null,
      preheader: config.preheader || config.headerTitle || '',
      utmCampaign: 'general_announcement',
    });
  };

  const previewSegment = async (segmentId) => {
    try {
      const { data } = await api.post('/api/admin/email/segments/preview',
        { segment_id: segmentId, limit: 20 },
        getApiConfig()
      );
      setPreviewUsers(data.users || []);
      setPreviewCount(data.total_count || 0);
    } catch (error) {
      console.error('Failed to preview segment:', error);
    }
  };

  const handleLogin = (values) => {
    if (values.email === ADMIN_EMAIL && values.password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminEmailAuth', 'true');
      setIsAuthenticated(true);
      message.success('Welcome to Email Campaigns!');
    } else {
      message.error('Invalid credentials');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminEmailAuth');
    setIsAuthenticated(false);
  };

  const handleSegmentSelect = (segmentId) => {
    setSelectedSegment(segmentId);
    previewSegment(segmentId);
  };

  const handleCreateCampaign = async () => {
    // Allow creating campaign with either a template OR custom content
    if (!campaignName) {
      message.error('Please enter a campaign name');
      return;
    }

    // Must have either a template selected OR custom email content
    if (!selectedTemplate && !emailContent) {
      message.error('Please select a template or provide email content');
      return;
    }

    // If using custom content without template, require subject
    if (!selectedTemplate && !subjectOverride) {
      message.error('Please provide an email subject');
      return;
    }

    try {
      const { data } = await api.post('/api/admin/email/campaigns', {
        name: campaignName,
        template_id: selectedTemplate?.id || null,
        subject_override: subjectOverride || null,
        html_content_override: emailContent || null,
        segment_type: selectedSegment,
        segment_filters: {}
      }, getApiConfig());

      message.success('Campaign created!');
      setShowCampaignModal(false);
      resetCampaignForm();
      fetchCampaigns();

      // Return the campaign ID for immediate sending if desired
      return data.id;
    } catch (error) {
      message.error('Failed to create campaign');
    }
  };

  const handleSendCampaign = async (campaignId) => {
    // Find the campaign to get its segment_type
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      message.error('Campaign not found');
      return;
    }

    // Fetch the actual recipient count for this campaign's segment
    setSending(true);
    try {
      const { data: segmentData } = await api.post('/api/admin/email/segments/preview',
        { segment_id: campaign.segment_type, limit: 1 },
        getApiConfig()
      );
      const recipientCount = segmentData.total_count || 0;
      setSending(false);

      Modal.confirm({
        title: 'Send Campaign?',
        content: `This will send emails to ${recipientCount} recipients. Are you sure?`,
        okText: 'Send Now',
        okType: 'primary',
        cancelText: 'Cancel',
        onOk: async () => {
          setSending(true);
          try {
            const { data } = await api.post(
              `/api/admin/email/campaigns/${campaignId}/send`,
              {},
              getApiConfig()
            );

            message.info(`Sending started for ${data.sending} recipients — tracking progress...`);
            fetchCampaigns();

            // Poll until the campaign finishes
            const key = `send-progress-${campaignId}`;
            message.loading({ content: 'Sending emails...', key, duration: 0 });

            const poll = setInterval(async () => {
              try {
                const { data: statusData } = await api.get(
                  `/api/admin/email/campaigns/${campaignId}/send-status`,
                  getApiConfig()
                );

                if (statusData.status === 'sent') {
                  clearInterval(poll);
                  message.success({
                    content: `Campaign sent: ${statusData.sent} delivered, ${statusData.failed} failed`,
                    key,
                    duration: 5
                  });
                  fetchCampaigns();
                  fetchStats();
                  setSending(false);
                } else if (statusData.status === 'failed') {
                  clearInterval(poll);
                  message.error({ content: 'Campaign sending failed', key, duration: 5 });
                  fetchCampaigns();
                  setSending(false);
                } else {
                  message.loading({
                    content: `Sending... ${statusData.sent}/${statusData.total_recipients} (${statusData.progress}%)`,
                    key,
                    duration: 0
                  });
                }
              } catch {
                clearInterval(poll);
                setSending(false);
              }
            }, 4000);

          } catch (error) {
            message.error('Failed to start campaign send');
            setSending(false);
          }
        }
      });
    } catch (error) {
      setSending(false);
      message.error('Failed to get recipient count');
    }
  };

  const handleResetCampaign = async (campaignId) => {
    try {
      await api.post(`/api/admin/email/campaigns/${campaignId}/reset`, {}, getApiConfig());
      message.success('Campaign reset to draft — you can now re-send it');
      fetchCampaigns();
    } catch (error) {
      message.error('Failed to reset campaign');
    }
  };

  const handleContinueSending = async (campaignId) => {
    const key = `continue-${campaignId}`;
    setSending(true);

    const processBatch = async () => {
      try {
        const { data } = await api.post(
          `/api/admin/email/campaigns/${campaignId}/continue`,
          {},
          getApiConfig()
        );

        message.loading({
          content: `Sending... ${data.total_sent}/${data.total_recipients} (${data.sent_this_batch} this batch, ${data.remaining} remaining)`,
          key,
          duration: 0
        });

        fetchCampaigns();

        if (data.is_complete) {
          message.success({
            content: `Campaign complete: ${data.total_sent}/${data.total_recipients} sent`,
            key,
            duration: 5
          });
          fetchStats();
          setSending(false);
          return;
        }

        if (data.remaining > 0) {
          // Continue with next batch after a short delay
          setTimeout(processBatch, 1000);
        } else {
          setSending(false);
        }

      } catch (error) {
        message.error({ content: 'Failed to continue sending', key, duration: 3 });
        setSending(false);
      }
    };

    message.loading({ content: 'Starting batch processing...', key, duration: 0 });
    processBatch();
  };

  const handleSendTest = async (campaignId) => {
    try {
      const { data } = await api.post(
        `/api/admin/email/campaigns/${campaignId}/test`,
        { email: ADMIN_EMAIL },
        getApiConfig()
      );
      message.success(data.message);
    } catch (error) {
      message.error('Failed to send test email');
    }
  };

  const resetCampaignForm = () => {
    setSelectedTemplate(null);
    setSelectedSegment('all_active');
    setCampaignName('');
    setSubjectOverride('');
    setEmailContent('');
    setPreviewUsers([]);
    setPreviewCount(0);
  };

  const getTemplateIcon = (type) => {
    switch (type) {
      case 'brand_roundup': return '📦';
      case 'reengagement': return '🔄';
      case 'insights': return '💡';
      case 'quota_alert': return '⚡';
      case 'winback': return '👋';
      default: return '📧';
    }
  };

  const getSegmentIcon = (id) => {
    switch (id) {
      case 'all_active': return <TeamOutlined />;
      case 'new_users_7d': return <UserOutlined />;
      case 'exploring': return <EyeOutlined />;
      case 'engaged': return <CheckCircleOutlined />;
      case 'power_users': return <TrophyOutlined />;
      case 'at_quota_limit': return <ThunderboltOutlined />;
      case 'dormant': return <ClockCircleOutlined />;
      default: return <MailOutlined />;
    }
  };

  // Login form
  if (!isAuthenticated) {
    return (
      <LoginContainer>
        <LoginCard>
          <MailOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 24 }} />
          <h2>Email Campaigns</h2>
          <p>Admin access required</p>
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

  const campaignColumns = [
    {
      title: 'Campaign',
      key: 'name',
      render: (_, record) => (
        <div>
          <strong>{record.name}</strong>
          <div style={{ fontSize: 11, color: '#999' }}>
            {getTemplateIcon(record.template_type)} {record.template_name}
          </div>
        </div>
      )
    },
    {
      title: 'Segment',
      dataIndex: 'segment_type',
      key: 'segment_type',
      render: (seg) => <Tag>{seg?.replace(/_/g, ' ')}</Tag>
    },
    {
      title: 'Recipients',
      dataIndex: 'total_recipients',
      key: 'total_recipients',
      render: (count) => count || '-'
    },
    {
      title: 'Sent',
      dataIndex: 'total_sent',
      key: 'total_sent',
      render: (count) => <strong style={{ color: '#52c41a' }}>{count || 0}</strong>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'sent' ? 'green' :
          status === 'sending' ? 'blue' :
          status === 'draft' ? 'default' : 'orange'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'draft' && (
            <>
              <Button size="small" onClick={() => handleSendTest(record.id)}>
                Test
              </Button>
              <Button
                size="small"
                type="primary"
                onClick={() => handleSendCampaign(record.id)}
                loading={sending}
              >
                Send
              </Button>
            </>
          )}
          {(record.status === 'sending' || record.status === 'failed') && (
            <>
              <Tooltip title="Continue sending to remaining recipients">
                <Button
                  size="small"
                  type="primary"
                  onClick={() => handleContinueSending(record.id)}
                  loading={sending}
                >
                  Continue
                </Button>
              </Tooltip>
              <Tooltip title="Reset attempt counts and retry all failed">
                <Button
                  size="small"
                  onClick={() => handleResetCampaign(record.id)}
                >
                  Reset
                </Button>
              </Tooltip>
            </>
          )}
          {record.status === 'sent' && (
            <>
              <span style={{ color: '#999', fontSize: 12, marginRight: 8 }}>
                {new Date(record.sent_at).toLocaleDateString()}
              </span>
              {record.total_sent < record.total_recipients && (
                <Tooltip title={`Resume sending to ${record.total_recipients - record.total_sent} remaining recipients`}>
                  <Button
                    size="small"
                    onClick={() => handleSendCampaign(record.id)}
                    loading={sending}
                  >
                    Resume
                  </Button>
                </Tooltip>
              )}
            </>
          )}
        </Space>
      )
    }
  ];

  const previewColumns = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div>
          <strong>{record.first_name || record.username || '-'}</strong>
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
      title: 'Pitches',
      key: 'pitches',
      render: (_, record) => (
        <span>{record.pitches_this_week}/wk ({record.pitches_total} total)</span>
      )
    },
    {
      title: 'Saved',
      dataIndex: 'brands_saved',
      key: 'brands_saved'
    }
  ];

  return (
    <Container>
      <Header>
        <div>
          <h1><MailOutlined /> Email Campaigns</h1>
          <p>Send targeted emails to your creator community</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchAllData} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            resetCampaignForm();
            setShowCampaignModal(true);
          }}>
            New Campaign
          </Button>
          <Button onClick={handleLogout}>Logout</Button>
        </Space>
      </Header>

      {loading && !stats ? (
        <LoadingContainer>
          <Spin size="large" />
          <p>Loading...</p>
        </LoadingContainer>
      ) : (
        <>
          {/* Stats Row */}
          <StatsRow gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <StatCard>
                <Statistic
                  title="Campaigns Sent"
                  value={stats?.total_campaigns || 0}
                  prefix={<SendOutlined />}
                  valueStyle={{ color: '#667eea' }}
                />
              </StatCard>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard>
                <Statistic
                  title="Total Emails Sent"
                  value={stats?.total_sent || 0}
                  prefix={<MailOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </StatCard>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard>
                <Statistic
                  title="Open Rate"
                  value={stats?.open_rate || 0}
                  suffix="%"
                  prefix={<EyeOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </StatCard>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard>
                <Statistic
                  title="Unsubscribes"
                  value={stats?.unsubscribes || 0}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </StatCard>
            </Col>
          </StatsRow>

          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            {/* Campaigns Tab */}
            <Tabs.TabPane tab={<span><SendOutlined /> Campaigns</span>} key="campaigns">
              <ChartCard>
                <h3>All Campaigns</h3>
                <Table
                  dataSource={campaigns}
                  columns={campaignColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </ChartCard>
            </Tabs.TabPane>

            {/* Segments Tab */}
            <Tabs.TabPane tab={<span><TeamOutlined /> Segments</span>} key="segments">
              <Row gutter={[16, 16]}>
                {segments.map(segment => (
                  <Col xs={24} sm={12} md={8} lg={6} key={segment.id}>
                    <SegmentCard
                      highlight={segment.highlight}
                      onClick={() => handleSegmentSelect(segment.id)}
                      selected={selectedSegment === segment.id}
                    >
                      <div className="segment-icon">{getSegmentIcon(segment.id)}</div>
                      <div className="segment-name">{segment.name}</div>
                      <div className="segment-count">{segment.count} users</div>
                      <div className="segment-desc">{segment.description}</div>
                    </SegmentCard>
                  </Col>
                ))}
              </Row>

              {previewUsers.length > 0 && (
                <ChartCard style={{ marginTop: 24 }}>
                  <h3>
                    Preview: {segments.find(s => s.id === selectedSegment)?.name}
                    <Tag color="blue" style={{ marginLeft: 8 }}>{previewCount} total</Tag>
                  </h3>
                  <Table
                    dataSource={previewUsers}
                    columns={previewColumns}
                    rowKey="creator_id"
                    pagination={false}
                    size="small"
                  />
                </ChartCard>
              )}
            </Tabs.TabPane>

            {/* Templates Tab */}
            <Tabs.TabPane tab={<span><EditOutlined /> Templates</span>} key="templates">
              {/* New Modern Templates Section */}
              <ChartCard style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Row align="middle" justify="space-between">
                  <Col>
                    <h3 style={{ color: '#fff', margin: 0 }}>New: Modern Email Templates</h3>
                    <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0' }}>
                      Clean, responsive designs inspired by top SaaS apps
                    </p>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      ghost
                      size="large"
                      icon={<EyeOutlined />}
                      onClick={() => { setShowTemplatePreview(true); fetchRoundupBrands(); }}
                      style={{ borderColor: '#fff', color: '#fff' }}
                    >
                      Preview Templates
                    </Button>
                  </Col>
                </Row>
              </ChartCard>

              {/* Modern Template Cards */}
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} md={12} lg={8}>
                  <ModernTemplateCard
                    onClick={() => { setShowTemplatePreview(true); fetchRoundupBrands(); }}
                    featured
                  >
                    <div className="template-badge">NEW</div>
                    <div className="template-icon-large">📦</div>
                    <h4>Weekly Brand Roundup</h4>
                    <p>Showcase new brands with clean grid cards featuring logos, descriptions, and CTAs</p>
                    <div className="template-features">
                      <span>Responsive</span>
                      <span>Dark Mode Ready</span>
                      <span>Brand Cards</span>
                    </div>
                    <Button type="primary" block style={{ marginTop: 16 }}>
                      <EyeOutlined /> Preview & Use
                    </Button>
                  </ModernTemplateCard>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <ModernTemplateCard
                    onClick={() => setShowAnnouncementPreview(true)}
                    featured
                  >
                    <div className="template-badge" style={{ background: 'linear-gradient(135deg, #26A69A 0%, #00897B 100%)' }}>NEW</div>
                    <div className="template-icon-large">💡</div>
                    <h4>General Announcement</h4>
                    <p>Flexible template for insights, updates, feature launches, or any custom message to your creators</p>
                    <div className="template-features">
                      <span>Flexible</span>
                      <span>Live Composer</span>
                      <span>All Content Types</span>
                    </div>
                    <Button type="default" block style={{ marginTop: 16, borderColor: '#26A69A', color: '#26A69A' }}>
                      <EyeOutlined /> Compose & Preview
                    </Button>
                  </ModernTemplateCard>
                </Col>
                <Col xs={24} md={12} lg={8}>
                  <ModernTemplateCard disabled>
                    <div className="template-badge coming-soon">COMING SOON</div>
                    <div className="template-icon-large">⚡</div>
                    <h4>Quota Alert</h4>
                    <p>Notify users approaching their pitch limit with upgrade prompts</p>
                    <div className="template-features">
                      <span>Urgency</span>
                      <span>Upsell</span>
                    </div>
                  </ModernTemplateCard>
                </Col>
              </Row>

              <Divider>Legacy Templates (Database)</Divider>

              {/* Legacy Templates from DB */}
              <Row gutter={[16, 16]}>
                {templates.map(template => (
                  <Col xs={24} md={12} lg={8} key={template.id}>
                    <TemplateCard>
                      <div className="template-header">
                        <span className="template-icon">{getTemplateIcon(template.type)}</span>
                        <Tag>{template.type.replace(/_/g, ' ')}</Tag>
                      </div>
                      <h4>{template.name}</h4>
                      <div className="template-subject">
                        <strong>Subject:</strong> {template.subject}
                      </div>
                      <div className="template-preview">
                        {template.preview_text || 'No preview text'}
                      </div>
                    </TemplateCard>
                  </Col>
                ))}
              </Row>
            </Tabs.TabPane>
          </Tabs>

          {/* Campaign Builder Modal */}
          <Modal
            title="Create New Campaign"
            open={showCampaignModal}
            onCancel={() => setShowCampaignModal(false)}
            footer={null}
            width={700}
          >
            <CampaignBuilder>
              {/* Step 1: Campaign Name */}
              <div className="step">
                <h4>1. Campaign Name</h4>
                <Input
                  placeholder="e.g., Weekly Brand Roundup - Apr 14"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  size="large"
                />
              </div>

              {/* Step 2: Select Template */}
              <div className="step">
                <h4>2. Select Template</h4>
                <Radio.Group
                  value={selectedTemplate?.id}
                  onChange={(e) => {
                    const template = templates.find(t => t.id === e.target.value);
                    setSelectedTemplate(template);
                    if (template) {
                      setSubjectOverride(template.subject);
                      setEmailContent(template.html_content || '');
                    }
                  }}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {templates.map(template => (
                      <Radio.Button
                        key={template.id}
                        value={template.id}
                        style={{
                          width: '100%',
                          height: 'auto',
                          padding: '12px 16px',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ marginRight: 8 }}>{getTemplateIcon(template.type)}</span>
                        <strong>{template.name}</strong>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                          {template.subject}
                        </div>
                      </Radio.Button>
                    ))}
                  </Space>
                </Radio.Group>
              </div>

              {/* Step 3: Customize Subject & Content */}
              {selectedTemplate && (
                <div className="step">
                  <h4>3. Edit Subject</h4>
                  <Input
                    placeholder="Email subject line"
                    value={subjectOverride}
                    onChange={(e) => setSubjectOverride(e.target.value)}
                    style={{ marginBottom: 16 }}
                  />

                  <h4>4. Edit Email Content</h4>
                  <TextArea
                    rows={10}
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    placeholder="HTML email content..."
                    style={{ fontFamily: 'monospace', fontSize: 12 }}
                  />
                  <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                    <strong>Available variables:</strong> {'{{first_name}}'}, {'{{username}}'}, {'{{pitches_remaining}}'}, {'{{brands_saved_count}}'}, {'{{pitches_sent_total}}'}
                  </div>
                </div>
              )}

              {/* Step 5: Select Audience */}
              <div className="step">
                <h4>5. Select Audience</h4>
                <Select
                  value={selectedSegment}
                  onChange={handleSegmentSelect}
                  style={{ width: '100%' }}
                  size="large"
                >
                  {segments.map(segment => (
                    <Select.Option key={segment.id} value={segment.id}>
                      {segment.name} ({segment.count} users)
                    </Select.Option>
                  ))}
                </Select>

                {previewCount > 0 && (
                  <div className="recipient-preview">
                    <strong>{previewCount}</strong> recipients will receive this email
                  </div>
                )}
              </div>

              <Divider />

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button onClick={() => setShowCampaignModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={async () => {
                    const campaignId = await handleCreateCampaign();
                    if (campaignId) {
                      // Ask if they want to send immediately
                      Modal.confirm({
                        title: 'Campaign Created!',
                        content: 'Do you want to send a test email first or send to all recipients now?',
                        okText: 'Send Test First',
                        cancelText: 'Go to Campaigns',
                        onOk: () => handleSendTest(campaignId),
                        onCancel: () => setActiveTab('campaigns')
                      });
                    }
                  }}
                  disabled={!campaignName || (!selectedTemplate && !emailContent)}
                >
                  Create Campaign
                </Button>
              </div>
            </CampaignBuilder>
          </Modal>

          {/* General Announcement Compose Modal */}
          <Modal
            title={null}
            open={showAnnouncementPreview}
            onCancel={() => setShowAnnouncementPreview(false)}
            footer={null}
            width={1100}
            style={{ top: 20 }}
            bodyStyle={{ padding: 0, background: '#1a1a2e' }}
          >
            <TemplatePreviewContainer>
              <div className="preview-header">
                <div>
                  <h3>💡 General Announcement — Live Composer</h3>
                  <p>Edit the fields on the left; preview updates instantly on the right</p>
                </div>
                <Space>
                  <Button
                    type={announcementViewMode === 'desktop' ? 'primary' : 'default'}
                    icon={<DesktopOutlined />}
                    onClick={() => setAnnouncementViewMode('desktop')}
                  >
                    Desktop
                  </Button>
                  <Button
                    type={announcementViewMode === 'mobile' ? 'primary' : 'default'}
                    icon={<MobileOutlined />}
                    onClick={() => setAnnouncementViewMode('mobile')}
                  >
                    Mobile
                  </Button>
                </Space>
              </div>

              {/* Two-panel composer */}
              <AnnouncementComposer>
                {/* Left: Form Fields */}
                <div className="composer-form">
                  <div className="form-group">
                    <label>Header Title *</label>
                    <Input
                      value={announcementConfig.headerTitle}
                      onChange={(e) => setAnnouncementConfig(c => ({ ...c, headerTitle: e.target.value }))}
                      placeholder="e.g. Your weekly insights are here"
                    />
                  </div>
                  <div className="form-group">
                    <label>Header Subtitle</label>
                    <Input
                      value={announcementConfig.headerSubtitle}
                      onChange={(e) => setAnnouncementConfig(c => ({ ...c, headerSubtitle: e.target.value }))}
                      placeholder="e.g. Week of June 15, 2026"
                    />
                  </div>
                  <div className="form-group">
                    <label>Header Colour</label>
                    <Radio.Group
                      value={announcementConfig.gradient}
                      onChange={(e) => setAnnouncementConfig(c => ({ ...c, gradient: e.target.value }))}
                    >
                      <Radio.Button value="teal">Teal</Radio.Button>
                      <Radio.Button value="purple">Purple</Radio.Button>
                      <Radio.Button value="green">Green</Radio.Button>
                      <Radio.Button value="amber">Amber</Radio.Button>
                      <Radio.Button value="dark">Dark</Radio.Button>
                    </Radio.Group>
                  </div>
                  <div className="form-group">
                    <label>Body Text (HTML supported)</label>
                    <TextArea
                      value={announcementConfig.bodyText}
                      onChange={(e) => setAnnouncementConfig(c => ({ ...c, bodyText: e.target.value }))}
                      rows={5}
                      placeholder={`<p style="...">Hey {{first_name}}!</p>\n<p style="...">Your message...</p>`}
                    />
                  </div>
                  <div className="form-group">
                    <label>Callout / Tip Box (optional)</label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <Input
                        value={announcementConfig.calloutIcon}
                        onChange={(e) => setAnnouncementConfig(c => ({ ...c, calloutIcon: e.target.value }))}
                        style={{ width: 60 }}
                        placeholder="💡"
                      />
                      <Input
                        value={announcementConfig.calloutText}
                        onChange={(e) => setAnnouncementConfig(c => ({ ...c, calloutText: e.target.value }))}
                        placeholder="Optional highlighted tip or callout text"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>CTA Button Label</label>
                    <Input
                      value={announcementConfig.ctaLabel}
                      onChange={(e) => setAnnouncementConfig(c => ({ ...c, ctaLabel: e.target.value }))}
                      placeholder="e.g. Go to Dashboard"
                    />
                  </div>
                  <div className="form-group">
                    <label>CTA Button URL</label>
                    <Input
                      value={announcementConfig.ctaUrl}
                      onChange={(e) => setAnnouncementConfig(c => ({ ...c, ctaUrl: e.target.value }))}
                      placeholder="https://app.newcollab.co"
                    />
                  </div>
                  <div className="form-group">
                    <label>Inbox Preview Text (preheader)</label>
                    <Input
                      value={announcementConfig.preheader}
                      onChange={(e) => setAnnouncementConfig(c => ({ ...c, preheader: e.target.value }))}
                      placeholder="Short text shown in inbox preview..."
                    />
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', padding: '8px 0' }}>
                    <strong style={{ color: '#cbd5e1' }}>Variables:</strong>{' '}
                    {'{{first_name}}'}, {'{{username}}'}, {'{{pitches_remaining}}'}
                  </div>
                </div>

                {/* Right: Live Preview */}
                <div className="composer-preview">
                  <div
                    className={`device-frame ${announcementViewMode}`}
                    style={{ width: announcementViewMode === 'mobile' ? 375 : 560, maxWidth: '100%' }}
                  >
                    {announcementViewMode === 'mobile' && <div className="device-notch" />}
                    <iframe
                      srcDoc={buildAnnouncementHTML(announcementConfig, false)}
                      title="Announcement Preview"
                      style={{
                        width: '100%',
                        height: announcementViewMode === 'mobile' ? 580 : 660,
                        border: 'none',
                        background: '#f3f4f6',
                        borderRadius: announcementViewMode === 'mobile' ? '0 0 24px 24px' : 8
                      }}
                    />
                  </div>
                </div>
              </AnnouncementComposer>

              <div className="preview-actions">
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => {
                    const html = buildAnnouncementHTML(announcementConfig, true);
                    const subject = announcementConfig.headerTitle || 'An update from Newcollab';
                    navigator.clipboard.writeText(`Subject: ${subject}\n\n${html}`);
                    message.success('HTML + subject copied to clipboard!');
                  }}
                >
                  Copy HTML
                </Button>
                <Button
                  type="primary"
                  style={{ background: 'linear-gradient(135deg, #26A69A 0%, #00897B 100%)', border: 'none' }}
                  onClick={() => {
                    const html = buildAnnouncementHTML(announcementConfig, true);
                    setEmailContent(html);
                    setSubjectOverride(announcementConfig.headerTitle || 'An update from Newcollab');
                    setCampaignName(`General Announcement - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`);
                    setShowAnnouncementPreview(false);
                    setShowCampaignModal(true);
                    message.success('Template loaded! Finish setting up your campaign.');
                  }}
                >
                  Use This Template
                </Button>
              </div>
            </TemplatePreviewContainer>
          </Modal>

          {/* Template Preview Modal */}
          <Modal
            title={null}
            open={showTemplatePreview}
            onCancel={() => setShowTemplatePreview(false)}
            footer={null}
            width={900}
            style={{ top: 20 }}
            bodyStyle={{ padding: 0, background: '#1a1a2e' }}
          >
            <TemplatePreviewContainer>
              {/* Header */}
              <div className="preview-header">
                <div>
                  <h3>
                    Weekly Brand Roundup Template
                    {roundupBrandsLoading ? (
                      <Spin size="small" style={{ marginLeft: 10 }} />
                    ) : (
                      <Badge
                        count={roundupBrands.length}
                        style={{ backgroundColor: roundupBrands.length > 0 ? '#eb2f96' : '#d9d9d9', marginLeft: 10 }}
                        title={`${roundupBrands.length} brand${roundupBrands.length !== 1 ? 's' : ''} tagged for roundup`}
                      />
                    )}
                  </h3>
                  <p>
                    {roundupBrands.length > 0
                      ? `${roundupBrands.length} brand${roundupBrands.length !== 1 ? 's' : ''} tagged for this roundup — preview shows live data`
                      : 'No brands tagged yet — tag brands in /admin/brands → Roundup column'}
                  </p>
                </div>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchRoundupBrands}
                    loading={roundupBrandsLoading}
                    title="Refresh roundup brands"
                  />
                  <Button
                    type={previewViewMode === 'desktop' ? 'primary' : 'default'}
                    icon={<DesktopOutlined />}
                    onClick={() => setPreviewViewMode('desktop')}
                  >
                    Desktop
                  </Button>
                  <Button
                    type={previewViewMode === 'mobile' ? 'primary' : 'default'}
                    icon={<MobileOutlined />}
                    onClick={() => setPreviewViewMode('mobile')}
                  >
                    Mobile
                  </Button>
                </Space>
              </div>

              {/* Preview Frame */}
              <div className="preview-frame">
                <div
                  className={`device-frame ${previewViewMode}`}
                  style={{ width: previewViewMode === 'mobile' ? 375 : 650 }}
                >
                  {previewViewMode === 'mobile' && <div className="device-notch" />}
                  <iframe
                    srcDoc={generateWeeklyBrandRoundup({
                      firstName: 'Sarah',
                      brands: roundupBrands.length > 0 ? roundupBrands : sampleBrands,
                      weekDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                      totalNewBrands: roundupBrands.length > 0 ? roundupBrands.length : sampleBrands.length
                    })}
                    title="Email Preview"
                    style={{
                      width: '100%',
                      height: previewViewMode === 'mobile' ? 600 : 700,
                      border: 'none',
                      background: '#f3f4f6',
                      borderRadius: previewViewMode === 'mobile' ? '0 0 24px 24px' : 8
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="preview-actions">
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => {
                    const brandsToUse = roundupBrands.length > 0 ? roundupBrands : sampleBrands;
                    const subject = generateSubjectLine(brandsToUse);
                    const html = generateWeeklyBrandRoundup({
                      firstName: '{{first_name}}',
                      brands: brandsToUse,
                      weekDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                      totalNewBrands: brandsToUse.length
                    });
                    navigator.clipboard.writeText(`Subject: ${subject}\n\n${html}`);
                    message.success('HTML + subject copied to clipboard!');
                  }}
                >
                  Copy HTML
                </Button>
                <Button
                  type="primary"
                  disabled={roundupBrandsLoading}
                  onClick={() => {
                    const brandsToUse = roundupBrands.length > 0 ? roundupBrands : sampleBrands;
                    const html = generateWeeklyBrandRoundup({
                      firstName: '{{first_name}}',
                      brands: brandsToUse,
                      weekDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                      totalNewBrands: brandsToUse.length
                    });
                    setEmailContent(html);
                    setSubjectOverride(generateSubjectLine(brandsToUse));
                    setCampaignName(`Weekly Brand Roundup - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`);
                    setShowTemplatePreview(false);
                    setShowCampaignModal(true);
                    message.success(`Template loaded with ${brandsToUse.length} brand${brandsToUse.length !== 1 ? 's' : ''}! Finish setting up your campaign.`);
                  }}
                >
                  Use This Template
                </Button>
              </div>
            </TemplatePreviewContainer>
          </Modal>
        </>
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
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ChartCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 16px;

  h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
  }
`;

const SegmentCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid ${props => props.selected ? '#667eea' : props.highlight ? '#f5222d' : '#eee'};

  ${props => props.highlight && `
    background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  `}

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }

  .segment-icon {
    font-size: 24px;
    margin-bottom: 8px;
    color: #667eea;
  }

  .segment-name {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .segment-count {
    font-size: 20px;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 8px;
  }

  .segment-desc {
    font-size: 12px;
    color: #666;
  }
`;

const TemplateCard = styled(Card)`
  border-radius: 12px;

  .template-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .template-icon {
    font-size: 24px;
  }

  h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
  }

  .template-subject {
    font-size: 13px;
    color: #333;
    margin-bottom: 8px;
  }

  .template-preview {
    font-size: 12px;
    color: #999;
  }
`;

const CampaignBuilder = styled.div`
  .step {
    margin-bottom: 24px;

    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
  }

  .recipient-preview {
    margin-top: 12px;
    padding: 12px;
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    border-radius: 8px;
    text-align: center;

    strong {
      font-size: 20px;
      color: #52c41a;
    }
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

const ModernTemplateCard = styled.div`
  background: ${props => props.disabled ? '#f9fafb' : '#fff'};
  border-radius: 16px;
  padding: 24px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s;
  border: 2px solid ${props => props.featured ? '#667eea' : '#e5e7eb'};
  position: relative;
  opacity: ${props => props.disabled ? 0.7 : 1};
  height: 100%;

  ${props => props.featured && `
    background: linear-gradient(135deg, #f5f3ff 0%, #fff 100%);
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
  `}

  &:hover {
    ${props => !props.disabled && `
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.2);
      border-color: #667eea;
    `}
  }

  .template-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 20px;
    letter-spacing: 0.5px;

    &.coming-soon {
      background: #9ca3af;
    }
  }

  .template-icon-large {
    font-size: 40px;
    margin-bottom: 16px;
  }

  h4 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #111827;
  }

  p {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: #6b7280;
    line-height: 1.5;
  }

  .template-features {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    span {
      display: inline-block;
      background: #f3f4f6;
      color: #374151;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 20px;
    }
  }
`;

const TemplatePreviewContainer = styled.div`
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: #16213e;
    border-bottom: 1px solid #0f3460;

    h3 {
      margin: 0 0 4px 0;
      color: #fff;
      font-size: 18px;
    }

    p {
      margin: 0;
      color: #94a3b8;
      font-size: 13px;
    }
  }

  .preview-frame {
    display: flex;
    justify-content: center;
    padding: 40px 20px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    min-height: 500px;
  }

  .device-frame {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    transition: width 0.3s ease;
    overflow: hidden;

    &.mobile {
      background: #1c1c1e;
      border-radius: 40px;
      padding: 12px;
    }

    .device-notch {
      width: 120px;
      height: 28px;
      background: #1c1c1e;
      border-radius: 0 0 14px 14px;
      margin: 0 auto 8px auto;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 4px;
        background: #333;
        border-radius: 2px;
      }
    }
  }

  .preview-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    background: #16213e;
    border-top: 1px solid #0f3460;
  }
`;

const AnnouncementComposer = styled.div`
  display: flex;
  min-height: 500px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);

  .composer-form {
    width: 320px;
    flex-shrink: 0;
    padding: 24px;
    background: #0f1729;
    border-right: 1px solid #1e3a5f;
    overflow-y: auto;
    max-height: 700px;
  }

  .form-group {
    margin-bottom: 16px;

    label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 6px;
    }

    .ant-input,
    .ant-input-affix-wrapper {
      background: #1e293b !important;
      border-color: #334155 !important;
      color: #e2e8f0 !important;
      border-radius: 6px;

      &::placeholder {
        color: #475569;
      }
    }

    textarea.ant-input {
      background: #1e293b !important;
      color: #e2e8f0 !important;
      border-color: #334155 !important;
      font-family: monospace;
      font-size: 12px;
    }

    .ant-radio-group {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .ant-radio-button-wrapper {
      background: #1e293b;
      border-color: #334155;
      color: #94a3b8;
      font-size: 12px;
      padding: 0 10px;
      height: 30px;
      line-height: 28px;

      &.ant-radio-button-wrapper-checked {
        background: #26A69A;
        border-color: #26A69A;
        color: #fff;
      }
    }
  }

  .composer-preview {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 32px 24px;
    overflow-y: auto;
    max-height: 700px;
  }

  .device-frame {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    overflow: hidden;

    &.mobile {
      background: #1c1c1e;
      border-radius: 40px;
      padding: 12px;
    }

    .device-notch {
      width: 120px;
      height: 28px;
      background: #1c1c1e;
      border-radius: 0 0 14px 14px;
      margin: 0 auto 8px auto;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 4px;
        background: #333;
        border-radius: 2px;
      }
    }
  }
`;

export default AdminEmail;
