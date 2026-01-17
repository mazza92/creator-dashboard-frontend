import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Table, Button, Input, Tag, message, Modal, Space, Tooltip,
  Statistic, Card, Row, Col, Progress, Select, Spin, Badge, Form
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, CheckCircleOutlined,
  CloseCircleOutlined, WarningOutlined, LinkedinOutlined,
  MailOutlined, GlobalOutlined, InstagramOutlined,
  PlayCircleOutlined, SyncOutlined, LockOutlined, UserOutlined
} from '@ant-design/icons';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

// Admin credentials - hardcoded for this internal tool
const ADMIN_EMAIL = 'team@newcollab.co';
const ADMIN_PASSWORD = 'Ilovela1992!';

const PRHunter = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [huntModalVisible, setHuntModalVisible] = useState(false);
  const [huntKeyword, setHuntKeyword] = useState('');
  const [maxResults, setMaxResults] = useState(50);
  const [huntLoading, setHuntLoading] = useState(false);
  const [currentHuntTask, setCurrentHuntTask] = useState(null);
  const [editingKey, setEditingKey] = useState('');
  const [editForm, setEditForm] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Check if already authenticated (stored in sessionStorage)
  useEffect(() => {
    const authStatus = sessionStorage.getItem('prHunterAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCandidates();
      fetchStats();
    }
  }, [pagination.page, isAuthenticated]);

  const handleLogin = (values) => {
    setLoginLoading(true);
    setLoginError('');

    // Simple credential check - no backend call needed
    if (values.email === ADMIN_EMAIL && values.password === ADMIN_PASSWORD) {
      sessionStorage.setItem('prHunterAuth', 'true');
      setIsAuthenticated(true);
      message.success('Welcome to PR Hunter!');
    } else {
      setLoginError('Invalid credentials');
      message.error('Invalid email or password');
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('prHunterAuth');
    setIsAuthenticated(false);
    message.info('Logged out');
  };

  // Helper to get axios config with admin token
  const getApiConfig = (extraConfig = {}) => ({
    headers: {
      'X-Admin-Token': 'pr-hunter-admin-2026'
    },
    ...extraConfig
  });

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/api/admin/candidates`, {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: 'PENDING'
        },
        ...getApiConfig()
      });

      setCandidates(data.candidates || []);
      setPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }));
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.removeItem('prHunterAuth');
        message.error('Session expired. Please login again.');
      } else {
        message.error('Failed to load candidates');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/admin/pr-hunt/stats`, getApiConfig());
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const startHunt = async () => {
    if (!huntKeyword.trim()) {
      message.error('Please enter a keyword');
      return;
    }

    setHuntLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/admin/pr-hunt/start`,
        { keyword: huntKeyword, max_results: maxResults, sync: true },
        getApiConfig()
      );

      // Check if completed synchronously (no Redis)
      if (data.status === 'completed') {
        message.success(data.message || `PR Hunt completed for "${huntKeyword}"`);
        setHuntModalVisible(false);
        setHuntKeyword('');
        fetchCandidates();
        fetchStats();
      } else {
        // Async mode - poll for status
        message.success(`PR Hunt started for "${huntKeyword}"`);
        setCurrentHuntTask(data.task_id);
        setHuntModalVisible(false);
        pollHuntStatus(data.task_id);
      }
    } catch (error) {
      message.error('Failed to start hunt');
      console.error(error);
    } finally {
      setHuntLoading(false);
    }
  };

  const pollHuntStatus = async (taskId) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/admin/pr-hunt/status/${taskId}`,
          getApiConfig()
        );

        if (data.state === 'SUCCESS') {
          clearInterval(interval);
          message.success(`Hunt complete! Found ${data.result.saved} candidates`);
          setCurrentHuntTask(null);
          fetchCandidates();
          fetchStats();
        } else if (data.state === 'FAILURE') {
          clearInterval(interval);
          message.error('Hunt failed');
          setCurrentHuntTask(null);
        } else if (data.state === 'PROGRESS') {
          message.info(data.meta.step, 2);
        }
      } catch (error) {
        clearInterval(interval);
        console.error('Failed to check hunt status:', error);
      }
    }, 5000); // Poll every 5 seconds
  };

  const approveSelected = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select candidates to approve');
      return;
    }

    try {
      const { data } = await axios.post(
        `${API_BASE}/api/admin/candidates/approve`,
        { candidate_ids: selectedRowKeys },
        getApiConfig()
      );

      message.success(`Approved ${data.approved} candidates`);
      setSelectedRowKeys([]);
      fetchCandidates();
      fetchStats();
    } catch (error) {
      message.error('Failed to approve candidates');
      console.error(error);
    }
  };

  const rejectSelected = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select candidates to reject');
      return;
    }

    Modal.confirm({
      title: 'Reject Selected Candidates?',
      content: 'Are you sure you want to reject these candidates?',
      onOk: async () => {
        try {
          const { data } = await axios.post(
            `${API_BASE}/api/admin/candidates/reject`,
            { candidate_ids: selectedRowKeys, reason: 'Not a good fit' },
            getApiConfig()
          );

          message.success(`Rejected ${data.rejected} candidates`);
          setSelectedRowKeys([]);
          fetchCandidates();
          fetchStats();
        } catch (error) {
          message.error('Failed to reject candidates');
          console.error(error);
        }
      }
    });
  };

  const reverifyEmail = async (candidateId) => {
    try {
      await axios.post(
        `${API_BASE}/api/admin/candidates/${candidateId}/reverify`,
        {},
        getApiConfig()
      );

      message.success('Email verification started. Will update shortly.');

      // Refresh after a few seconds
      setTimeout(() => fetchCandidates(), 10000);
    } catch (error) {
      message.error('Failed to start reverification');
      console.error(error);
    }
  };

  const updateCandidate = async (id, field, value) => {
    try {
      await axios.patch(
        `${API_BASE}/api/admin/candidates/${id}`,
        { [field]: value },
        getApiConfig()
      );

      message.success('Updated successfully');
      fetchCandidates();
    } catch (error) {
      message.error('Failed to update');
      console.error(error);
    }
  };

  const getScoreBadge = (score, status) => {
    if (status === 'invalid') {
      return <Tag color="red">Invalid</Tag>;
    }

    if (status === 'catch-all') {
      return (
        <Tooltip title="Catch-all domain - manual verification recommended">
          <Tag color="warning" icon={<WarningOutlined />}>Catch-All</Tag>
        </Tooltip>
      );
    }

    if (score >= 95) {
      return <Tag color="success" icon={<CheckCircleOutlined />}>Verified {score}</Tag>;
    }

    if (score >= 75) {
      return <Tag color="processing">{score}</Tag>;
    }

    return <Tag color="warning">{score}</Tag>;
  };

  const columns = [
    {
      title: 'Brand',
      key: 'brand',
      width: 250,
      render: (_, record) => (
        <BrandCell>
          {record.logo_url && (
            <BrandLogo>
              <img src={record.logo_url} alt={record.brand_name} />
            </BrandLogo>
          )}
          <div>
            <BrandName>{record.brand_name}</BrandName>
            <SocialLinks>
              {record.website_url && (
                <a href={record.website_url} target="_blank" rel="noopener noreferrer">
                  <GlobalOutlined /> Website
                </a>
              )}
              {record.instagram_handle && (
                <a
                  href={`https://instagram.com/${record.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InstagramOutlined /> @{record.instagram_handle}
                </a>
              )}
            </SocialLinks>
          </div>
        </BrandCell>
      )
    },
    {
      title: 'PR Contact',
      key: 'contact',
      width: 250,
      render: (_, record) => (
        <ContactCell>
          <ContactName
            contentEditable={editingKey === record.id}
            onBlur={(e) => {
              updateCandidate(record.id, 'pr_manager_name', e.target.textContent);
              setEditingKey('');
            }}
          >
            {record.pr_manager_name || 'Unknown'}
          </ContactName>
          {record.pr_manager_title && <ContactTitle>{record.pr_manager_title}</ContactTitle>}
          {record.pr_manager_linkedin && (
            <a href={record.pr_manager_linkedin} target="_blank" rel="noopener noreferrer">
              <LinkedinOutlined /> LinkedIn
            </a>
          )}
        </ContactCell>
      )
    },
    {
      title: 'Email',
      key: 'email',
      width: 200,
      render: (_, record) => (
        <EmailCell>
          <EmailAddress
            contentEditable={editingKey === record.id}
            onBlur={(e) => {
              updateCandidate(record.id, 'contact_email', e.target.textContent);
              setEditingKey('');
            }}
          >
            {record.contact_email}
          </EmailAddress>
          <EmailSource>{record.email_source}</EmailSource>
        </EmailCell>
      )
    },
    {
      title: 'Verification',
      key: 'verification',
      width: 150,
      render: (_, record) => (
        <div>
          {getScoreBadge(record.verification_score, record.verification_status)}
          <Button
            type="link"
            size="small"
            icon={<SyncOutlined />}
            onClick={() => reverifyEmail(record.id)}
          >
            Re-verify
          </Button>
        </div>
      )
    },
    {
      title: 'Source',
      dataIndex: 'discovery_source',
      key: 'source',
      width: 200,
      ellipsis: true,
      render: (source) => (
        <Tooltip title={source}>
          <SourceTag>{source?.substring(0, 30)}...</SourceTag>
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              size="small"
              onClick={() => setEditingKey(record.id)}
            >
              Edit
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys)
  };

  // Show access denied message if not admin
  if (!isAuthenticated) {
    return (
      <Container>
        <Card style={{ maxWidth: 400, margin: '100px auto', padding: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <LockOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <h2 style={{ margin: 0 }}>PR Hunter</h2>
            <p style={{ color: '#666', marginTop: 8 }}>Internal Tool - Admin Access Required</p>
          </div>

          <Form
            name="prHunterLogin"
            onFinish={handleLogin}
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please enter your email' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Admin Email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
              />
            </Form.Item>

            {loginError && (
              <p style={{ color: '#ff4d4f', textAlign: 'center' }}>{loginError}</p>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loginLoading}
                block
                size="large"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>PR Hunter</h1>
            <p>Automated brand discovery and enrichment engine - INTERNAL USE ONLY</p>
          </div>
          <Button onClick={handleLogout} type="text" style={{ color: '#666' }}>
            Logout
          </Button>
        </div>
      </Header>

      {/* Statistics Cards */}
      {stats && (
        <StatsRow gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Candidates"
                value={stats.total_candidates}
                prefix={<SearchOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending Review"
                value={stats.pending}
                valueStyle={{ color: '#faad14' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Approved"
                value={stats.approved}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Avg Verification Score"
                value={stats.avg_verification_score}
                suffix="/ 100"
                precision={1}
              />
            </Card>
          </Col>
        </StatsRow>
      )}

      {/* Control Panel */}
      <ControlPanel>
        <Space size="large">
          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={() => setHuntModalVisible(true)}
            loading={!!currentHuntTask}
          >
            {currentHuntTask ? 'Hunt Running...' : 'Start New Hunt'}
          </Button>

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchCandidates}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>

        <Space>
          <Badge count={selectedRowKeys.length} showZero>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={approveSelected}
              disabled={selectedRowKeys.length === 0}
            >
              Approve Selected
            </Button>
          </Badge>

          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={rejectSelected}
            disabled={selectedRowKeys.length === 0}
          >
            Reject
          </Button>
        </Space>
      </ControlPanel>

      {/* Candidates Table */}
      <TableContainer>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={candidates}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (page) => setPagination(prev => ({ ...prev, page }))
          }}
        />
      </TableContainer>

      {/* Start Hunt Modal */}
      <Modal
        title="Start New PR Hunt"
        visible={huntModalVisible}
        onOk={startHunt}
        onCancel={() => setHuntModalVisible(false)}
        confirmLoading={huntLoading}
        okText="Start Hunt"
      >
        <ModalContent>
          <label>Keyword (e.g., "K-Beauty", "Clean Beauty")</label>
          <Input
            size="large"
            placeholder="Enter niche keyword..."
            value={huntKeyword}
            onChange={(e) => setHuntKeyword(e.target.value)}
            onPressEnter={startHunt}
          />

          <label style={{ marginTop: 20 }}>Max Results</label>
          <Select
            size="large"
            style={{ width: '100%' }}
            value={maxResults}
            onChange={setMaxResults}
          >
            <Select.Option value={10}>10 (Test)</Select.Option>
            <Select.Option value={25}>25</Select.Option>
            <Select.Option value={50}>50 (Recommended)</Select.Option>
            <Select.Option value={100}>100</Select.Option>
          </Select>

          <InfoBox>
            <p><strong>How it works:</strong></p>
            <ul>
              <li>Searches Google for brands in this niche</li>
              <li>Finds PR manager via LinkedIn</li>
              <li>Discovers email using Hunter.io</li>
              <li>Verifies email deliverability</li>
              <li>Only shows you high-quality results</li>
            </ul>
          </InfoBox>
        </ModalContent>
      </Modal>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 40px;
  background: #f5f5f5;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 32px;

  h1 {
    font-size: 32px;
    margin-bottom: 8px;
  }

  p {
    color: #666;
    font-size: 16px;
  }
`;

const StatsRow = styled(Row)`
  margin-bottom: 24px;
`;

const ControlPanel = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TableContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
`;

const BrandCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BrandLogo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const BrandName = styled.div`
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 4px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 12px;
  font-size: 13px;

  a {
    color: #666;
    text-decoration: none;

    &:hover {
      color: #1890ff;
    }
  }
`;

const ContactCell = styled.div``;

const ContactName = styled.div`
  font-weight: 600;
  margin-bottom: 4px;

  &[contenteditable="true"] {
    background: #fff7e6;
    padding: 2px 4px;
    border: 1px dashed #faad14;
  }
`;

const ContactTitle = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
`;

const EmailCell = styled.div``;

const EmailAddress = styled.div`
  font-family: monospace;
  margin-bottom: 4px;

  &[contenteditable="true"] {
    background: #fff7e6;
    padding: 2px 4px;
    border: 1px dashed #faad14;
  }
`;

const EmailSource = styled.div`
  font-size: 12px;
  color: #999;
`;

const SourceTag = styled.div`
  font-size: 12px;
  color: #666;
`;

const ModalContent = styled.div`
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
  }
`;

const InfoBox = styled.div`
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  padding: 16px;
  border-radius: 4px;
  margin-top: 20px;

  p {
    margin: 0 0 8px 0;
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      font-size: 13px;
      margin-bottom: 4px;
    }
  }
`;

export default PRHunter;
