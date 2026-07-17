import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Input, message, Modal, Tag, Space, Card, Statistic, Row, Col, Popconfirm, Select, AutoComplete } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { tokens } from '../theme/tokens';

const ADMIN_EMAIL = 'team@newcollab.co';
const ADMIN_PASSWORD = 'Ilovela1992!';
const ADMIN_TOKEN = 'pr-hunter-admin-2026';

const getApiBase = () => {
  const base = process.env.REACT_APP_API_BASE ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');
  return base.replace(/\/+$/, '');
};
const API_BASE = getApiBase();

const AdminOpportunities = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [applications, setApplications] = useState([]);
  const [publishing, setPublishing] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [logoUrls, setLogoUrls] = useState({});
  const [editingOpp, setEditingOpp] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const authStatus = sessionStorage.getItem('oppAdminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOpportunities();
    }
  }, [isAuthenticated, statusFilter]);

  const handleLogin = () => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('oppAdminAuth', 'true');
      setIsAuthenticated(true);
    } else {
      message.error('Invalid credentials');
    }
  };

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/opportunities/admin/list?status=${statusFilter}`, {
        withCredentials: true,
        headers: { 'X-Admin-Token': ADMIN_TOKEN }
      });
      if (response.data.success) {
        setOpportunities(response.data.opportunities || []);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      message.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const updateLogoUrl = async (oppId, logoUrl) => {
    try {
      await axios.patch(`${API_BASE}/api/opportunities/admin/${oppId}/update`, { brand_logo_url: logoUrl }, {
        withCredentials: true,
        headers: { 'X-Admin-Token': ADMIN_TOKEN }
      });
      message.success('Logo URL saved');
    } catch (error) {
      message.error('Failed to save logo URL');
    }
  };

  const handlePublish = async (oppId, daysOpen = 14) => {
    // Save logo URL first if provided
    const logoUrl = logoUrls[oppId];
    if (logoUrl) {
      await updateLogoUrl(oppId, logoUrl);
    }

    setPublishing(oppId);
    try {
      await axios.patch(`${API_BASE}/api/opportunities/admin/${oppId}/publish`, { days_open: daysOpen }, {
        withCredentials: true,
        headers: { 'X-Admin-Token': ADMIN_TOKEN }
      });
      message.success('Opportunity published');
      fetchOpportunities();
    } catch (error) {
      message.error('Failed to publish');
    } finally {
      setPublishing(null);
    }
  };

  const handleReject = async (oppId) => {
    try {
      await axios.patch(`${API_BASE}/api/opportunities/admin/${oppId}/reject`, {}, {
        withCredentials: true,
        headers: { 'X-Admin-Token': ADMIN_TOKEN }
      });
      message.success('Opportunity rejected');
      fetchOpportunities();
    } catch (error) {
      message.error('Failed to reject');
    }
  };

  const viewApplications = async (opp) => {
    setSelectedOpp(opp);
    setShowDetail(true);
    try {
      const response = await axios.get(`${API_BASE}/api/opportunities/admin/${opp.id}/applications`, {
        withCredentials: true,
        headers: { 'X-Admin-Token': ADMIN_TOKEN }
      });
      if (response.data.success) {
        setApplications(response.data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleClose = async (oppId, newStatus = 'closed') => {
    try {
      await axios.patch(`${API_BASE}/api/opportunities/admin/${oppId}/close`, { status: newStatus }, {
        withCredentials: true,
        headers: { 'X-Admin-Token': ADMIN_TOKEN }
      });
      message.success(`Opportunity ${newStatus}`);
      fetchOpportunities();
    } catch (error) {
      message.error('Failed to close opportunity');
    }
  };

  const handleReopen = async (oppId) => {
    try {
      await axios.patch(`${API_BASE}/api/opportunities/admin/${oppId}/reopen`, { days_open: 14 }, {
        withCredentials: true,
        headers: { 'X-Admin-Token': ADMIN_TOKEN }
      });
      message.success('Opportunity reopened');
      fetchOpportunities();
    } catch (error) {
      message.error('Failed to reopen opportunity');
    }
  };

  const handleDelete = async (oppId) => {
    try {
      await axios.delete(`${API_BASE}/api/opportunities/admin/${oppId}/delete`, {
        withCredentials: true,
        headers: { 'X-Admin-Token': ADMIN_TOKEN }
      });
      message.success('Opportunity deleted');
      fetchOpportunities();
    } catch (error) {
      message.error('Failed to delete opportunity');
    }
  };

  const openEditModal = (opp) => {
    setEditingOpp(opp);
    const via = (opp.apply_via || 'auto').toLowerCase();
    const listingCategory =
      (opp.brand_category && !['other', 'unknown', 'n/a', 'none'].includes(String(opp.brand_category).toLowerCase())
        ? String(opp.brand_category).replace(/_/g, ' ')
        : '') ||
      (opp.creator_niches?.length ? String(opp.creator_niches[0]).split(/[,·(]/)[0].trim() : '') ||
      '';
    setEditForm({
      brand_name: opp.brand_name || '',
      brand_email: opp.brand_email || '',
      brand_website: opp.brand_website || '',
      brand_category: listingCategory,
      brand_logo_url: opp.brand_logo_url || '',
      product_name: opp.product_name || '',
      campaign_description: opp.campaign_description || '',
      pr_value_usd: opp.pr_value_usd || '',
      spots_total: opp.spots_total || 10,
      apply_url: opp.external_apply_url || opp.brand_website || '',
      apply_via: ['auto', 'url', 'email'].includes(via) ? via : 'auto',
    });
  };

  const handleSaveEdit = async () => {
    try {
      if (editForm.apply_via === 'email') {
        const email = (editForm.brand_email || '').trim().toLowerCase();
        if (!email || !email.includes('@') || email === 'sourced@newcollab.co') {
          message.error('Set a real Brand Email for Apply via Email');
          return;
        }
      }
      if (editForm.apply_via === 'url' && !(editForm.apply_url || '').trim()) {
        message.error('Set an Application URL for Apply via URL');
        return;
      }

      const listingCategory = (editForm.brand_category || '').trim();
      const payload = {
        ...editForm,
        brand_category: listingCategory || null,
        // Keep matching niches aligned with the visible card label
        creator_niches: listingCategory
          ? [listingCategory]
          : (editingOpp.creator_niches || []),
        pr_value_usd:
          editForm.pr_value_usd === '' || editForm.pr_value_usd == null
            ? null
            : parseInt(editForm.pr_value_usd, 10),
        spots_total:
          editForm.spots_total === '' || editForm.spots_total == null
            ? null
            : Math.max(1, parseInt(editForm.spots_total, 10) || 1),
        apply_url: (editForm.apply_url || '').trim(),
        apply_via: editForm.apply_via || 'auto',
      };
      if (payload.pr_value_usd != null && Number.isNaN(payload.pr_value_usd)) {
        payload.pr_value_usd = null;
      }
      await axios.patch(`${API_BASE}/api/opportunities/admin/${editingOpp.id}/edit`, payload, {
        withCredentials: true,
        headers: { 'X-Admin-Token': ADMIN_TOKEN }
      });
      message.success('Opportunity updated');
      setEditingOpp(null);
      fetchOpportunities();
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to update opportunity');
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginWrap>
        <LoginCard>
          <LoginTitle>Admin Login</LoginTitle>
          <Input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <Input.Password
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onPressEnter={handleLogin}
            style={{ marginBottom: 16 }}
          />
          <Button type="primary" block onClick={handleLogin}>Login</Button>
        </LoginCard>
      </LoginWrap>
    );
  }

  const stats = {
    pending: opportunities.filter(o => o.status === 'pending').length,
    live: opportunities.filter(o => o.status === 'live').length,
    total: opportunities.length
  };

  return (
    <PageWrap>
      <Header>
        <h1>Opportunities Admin</h1>
        <Button icon={<ReloadOutlined />} onClick={fetchOpportunities} loading={loading}>
          Refresh
        </Button>
      </Header>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Pending Review" value={stats.pending} valueStyle={{ color: '#d97706' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Live" value={stats.live} valueStyle={{ color: '#059669' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Total" value={stats.total} />
          </Card>
        </Col>
      </Row>

      <FilterRow>
        <FilterBtn $active={statusFilter === 'pending'} onClick={() => setStatusFilter('pending')}>
          Pending
        </FilterBtn>
        <FilterBtn $active={statusFilter === 'live'} onClick={() => setStatusFilter('live')}>
          Live
        </FilterBtn>
        <FilterBtn $active={statusFilter === 'closed'} onClick={() => setStatusFilter('closed')}>
          Closed
        </FilterBtn>
        <FilterBtn $active={statusFilter === 'rejected'} onClick={() => setStatusFilter('rejected')}>
          Rejected
        </FilterBtn>
      </FilterRow>

      <OppList>
        {opportunities.map(opp => (
          <OppCard key={opp.id} $expanded={expandedId === opp.id}>
            <OppTop>
              <OppBrand>
                {opp.brand_logo_url ? (
                  <BrandLogoImg src={opp.brand_logo_url} alt={opp.brand_name} />
                ) : (
                  <BrandLogo>{opp.brand_name?.substring(0, 2).toUpperCase()}</BrandLogo>
                )}
                <div>
                  <BrandName>{opp.brand_name}</BrandName>
                  <BrandEmail>{opp.brand_email}</BrandEmail>
                </div>
              </OppBrand>
              <Space>
                <Tag color={opp.apply_mode === 'email' ? 'blue' : opp.apply_mode === 'url' ? 'purple' : 'default'}>
                  {opp.apply_mode === 'email' ? 'Apply: Email' : opp.apply_mode === 'url' ? 'Apply: URL' : 'Apply: Kit'}
                </Tag>
                {opp.brand_category && !['other', 'unknown'].includes(String(opp.brand_category).toLowerCase()) && (
                  <Tag>{String(opp.brand_category).replace(/_/g, ' ')}</Tag>
                )}
                <Button size="small" onClick={() => setExpandedId(expandedId === opp.id ? null : opp.id)}>
                  {expandedId === opp.id ? 'Collapse' : 'Expand'}
                </Button>
                <StatusTag status={opp.status}>{opp.status}</StatusTag>
              </Space>
            </OppTop>

            <OppProduct>{opp.product_name}</OppProduct>
            <OppDesc $expanded={expandedId === opp.id}>
              {expandedId === opp.id ? opp.campaign_description : opp.campaign_description?.substring(0, 200) + '...'}
            </OppDesc>

            {expandedId === opp.id && (
              <ExpandedDetails>
                <DetailSection>
                  <DetailLabel>Brand Info</DetailLabel>
                  <DetailGrid>
                    <DetailItem><strong>Website:</strong> {opp.brand_website || 'N/A'}</DetailItem>
                    <DetailItem><strong>Listing category:</strong> {opp.brand_category || 'N/A'}</DetailItem>
                    <DetailItem><strong>Email:</strong> {opp.brand_email}</DetailItem>
                  </DetailGrid>
                </DetailSection>

                <DetailSection>
                  <DetailLabel>Campaign Details</DetailLabel>
                  <DetailGrid>
                    <DetailItem><strong>PR Value:</strong> ${opp.pr_value_usd || '?'}</DetailItem>
                    <DetailItem><strong>Creator Count:</strong> {opp.creator_count_range || 'N/A'}</DetailItem>
                    <DetailItem><strong>Deadline:</strong> {opp.application_deadline || 'No deadline'}</DetailItem>
                  </DetailGrid>
                </DetailSection>

                <DetailSection>
                  <DetailLabel>Targeting</DetailLabel>
                  <DetailGrid>
                    <DetailItem><strong>Regions:</strong> {(opp.shipping_regions || []).join(', ') || 'N/A'}</DetailItem>
                    <DetailItem><strong>Followers:</strong> {(opp.follower_ranges || []).join(', ') || 'Any'}</DetailItem>
                    <DetailItem><strong>Content:</strong> {(opp.content_types || []).join(', ') || 'Any'}</DetailItem>
                    <DetailItem><strong>Niches:</strong> {(opp.creator_niches || []).join(', ') || 'Any'}</DetailItem>
                  </DetailGrid>
                </DetailSection>

                {opp.additional_notes && (
                  <DetailSection>
                    <DetailLabel>Additional Notes</DetailLabel>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{opp.additional_notes}</p>
                  </DetailSection>
                )}

                {opp.status === 'pending' && (
                  <DetailSection>
                    <DetailLabel>Brand Logo URL (for clean listing)</DetailLabel>
                    <Input
                      placeholder="https://example.com/logo.png"
                      value={logoUrls[opp.id] || opp.brand_logo_url || ''}
                      onChange={(e) => setLogoUrls({ ...logoUrls, [opp.id]: e.target.value })}
                      style={{ marginBottom: 8 }}
                    />
                    {logoUrls[opp.id] && (
                      <div style={{ marginBottom: 8 }}>
                        <img src={logoUrls[opp.id]} alt="Preview" style={{ maxHeight: 60, borderRadius: 8 }} onError={(e) => e.target.style.display = 'none'} />
                      </div>
                    )}
                  </DetailSection>
                )}
              </ExpandedDetails>
            )}

            <OppMeta>
              <MetaItem>Value: ${opp.pr_value_usd || '?'}</MetaItem>
              <MetaItem>Spots: {opp.spots_filled}/{opp.spots_total}</MetaItem>
              <MetaItem>Created: {new Date(opp.created_at).toLocaleDateString()}</MetaItem>
            </OppMeta>

            <OppActions>
              {opp.status === 'pending' && (
                <>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handlePublish(opp.id)}
                    loading={publishing === opp.id}
                  >
                    Publish
                  </Button>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleReject(opp.id)}
                  >
                    Reject
                  </Button>
                </>
              )}
              {opp.status === 'live' && (
                <>
                  <Button icon={<EyeOutlined />} onClick={() => viewApplications(opp)}>
                    View Applications ({opp.spots_filled})
                  </Button>
                  <Button icon={<PauseCircleOutlined />} onClick={() => handleClose(opp.id, 'paused')}>
                    Pause
                  </Button>
                  <Button icon={<CloseCircleOutlined />} onClick={() => handleClose(opp.id, 'closed')}>
                    Close
                  </Button>
                </>
              )}
              {(opp.status === 'closed' || opp.status === 'paused') && (
                <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => handleReopen(opp.id)}>
                  Reopen
                </Button>
              )}
              <Button icon={<EditOutlined />} onClick={() => openEditModal(opp)}>
                Edit
              </Button>
              <Popconfirm
                title="Delete this opportunity?"
                description="This will permanently remove the listing and all applications."
                onConfirm={() => handleDelete(opp.id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<DeleteOutlined />}>Delete</Button>
              </Popconfirm>
            </OppActions>
          </OppCard>
        ))}

        {opportunities.length === 0 && (
          <EmptyState>No opportunities found for this status.</EmptyState>
        )}
      </OppList>

      <Modal
        title={`Applications for ${selectedOpp?.product_name}`}
        open={showDetail}
        onCancel={() => setShowDetail(false)}
        footer={null}
        width={700}
      >
        {applications.length === 0 ? (
          <p>No applications yet.</p>
        ) : (
          applications.map(app => (
            <AppCard key={app.id}>
              <AppCreator>
                <AppAvatar>{app.creator.display_name?.charAt(0)}</AppAvatar>
                <div>
                  <AppName>{app.creator.display_name}</AppName>
                  <AppMeta>
                    {app.creator.follower_count?.toLocaleString()} followers ·
                    {(app.creator.niches || []).join(', ')}
                  </AppMeta>
                </div>
              </AppCreator>
              <Space>
                <Tag color={app.status === 'pending' ? 'orange' : app.status === 'approved' ? 'green' : 'red'}>
                  {app.status}
                </Tag>
                <a href={`https://app.newcollab.co/kit/${app.creator.slug}`} target="_blank" rel="noopener noreferrer">
                  View Kit
                </a>
              </Space>
            </AppCard>
          ))
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={`Edit: ${editingOpp?.product_name}`}
        open={!!editingOpp}
        onCancel={() => setEditingOpp(null)}
        onOk={handleSaveEdit}
        okText="Save Changes"
        width={600}
      >
        {editingOpp && (
          <EditForm>
            <EditField>
              <label>Brand Name</label>
              <Input
                value={editForm.brand_name}
                onChange={(e) => setEditForm({ ...editForm, brand_name: e.target.value })}
              />
            </EditField>
            <EditField>
              <label>Brand Email</label>
              <Input
                value={editForm.brand_email}
                onChange={(e) => setEditForm({ ...editForm, brand_email: e.target.value })}
                placeholder="Used when Apply via = Email"
              />
            </EditField>
            <EditField>
              <label>How creators apply</label>
              <Select
                style={{ width: '100%' }}
                value={editForm.apply_via || 'auto'}
                onChange={(value) => setEditForm({ ...editForm, apply_via: value })}
                options={[
                  { value: 'auto', label: 'Auto (URL if present, else email)' },
                  { value: 'url', label: 'Application URL' },
                  { value: 'email', label: 'Brand Email' },
                ]}
              />
            </EditField>
            <EditField>
              <label>Application URL</label>
              <Input
                value={editForm.apply_url}
                onChange={(e) => setEditForm({ ...editForm, apply_url: e.target.value })}
                placeholder="https://…"
              />
            </EditField>
            <EditField>
              <label>Brand Website</label>
              <Input
                value={editForm.brand_website}
                onChange={(e) => setEditForm({ ...editForm, brand_website: e.target.value })}
              />
            </EditField>
            <EditField>
              <label>Listing category (shown on cards)</label>
              <AutoComplete
                style={{ width: '100%' }}
                options={[
                  'Beauty', 'Fashion', 'Fitness', 'Food', 'Parenting',
                  'Tech', 'Lifestyle', 'Health', 'Travel', 'Gaming',
                  'Home', 'Pets', 'UGC', 'Creator gig',
                ].map((c) => ({ value: c }))}
                value={editForm.brand_category || ''}
                onChange={(value) => setEditForm({ ...editForm, brand_category: value || '' })}
                placeholder="e.g. Beauty, Tech, Fashion"
                filterOption={(input, option) =>
                  (option?.value || '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </EditField>
            <EditField>
              <label>Brand Logo URL</label>
              <Input
                value={editForm.brand_logo_url}
                onChange={(e) => setEditForm({ ...editForm, brand_logo_url: e.target.value })}
              />
              {editForm.brand_logo_url && (
                <img src={editForm.brand_logo_url} alt="Logo" style={{ maxHeight: 50, marginTop: 8, borderRadius: 8 }} onError={(e) => e.target.style.display = 'none'} />
              )}
            </EditField>
            <EditField>
              <label>Product Name</label>
              <Input
                value={editForm.product_name}
                onChange={(e) => setEditForm({ ...editForm, product_name: e.target.value })}
              />
            </EditField>
            <EditField>
              <label>Campaign Description</label>
              <Input.TextArea
                rows={4}
                value={editForm.campaign_description}
                onChange={(e) => setEditForm({ ...editForm, campaign_description: e.target.value })}
              />
            </EditField>
            <EditRow>
              <EditField>
                <label>PR Value ($)</label>
                <Input
                  type="number"
                  value={editForm.pr_value_usd}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    pr_value_usd: e.target.value === '' ? '' : (parseInt(e.target.value, 10) || ''),
                  })}
                />
              </EditField>
              <EditField>
                <label>Total Spots</label>
                <Input
                  type="number"
                  value={editForm.spots_total}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    spots_total: e.target.value === '' ? '' : (parseInt(e.target.value, 10) || 1),
                  })}
                />
              </EditField>
            </EditRow>
          </EditForm>
        )}
      </Modal>
    </PageWrap>
  );
};

// Styled Components
const PageWrap = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
  }
`;

const LoginWrap = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f7;
`;

const LoginCard = styled.div`
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
`;

const LoginTitle = styled.h2`
  margin: 0 0 24px;
  text-align: center;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const FilterBtn = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid ${p => p.$active ? tokens.textPrimary : tokens.border};
  background: ${p => p.$active ? tokens.textPrimary : '#fff'};
  color: ${p => p.$active ? '#fff' : tokens.textSecondary};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    border-color: ${tokens.textPrimary};
  }
`;

const OppList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OppCard = styled.div`
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 12px;
  padding: 20px;
`;

const OppTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const OppBrand = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const BrandLogo = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: ${tokens.textMuted};
`;

const BrandName = styled.div`
  font-weight: 700;
  font-size: 15px;
`;

const BrandEmail = styled.div`
  font-size: 12px;
  color: ${tokens.textMuted};
`;

const StatusTag = styled.span`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
  background: ${p =>
    p.status === 'pending' ? '#fef3c7' :
    p.status === 'live' ? '#d1fae5' :
    p.status === 'rejected' ? '#fee2e2' : '#f3f4f6'};
  color: ${p =>
    p.status === 'pending' ? '#92400e' :
    p.status === 'live' ? '#065f46' :
    p.status === 'rejected' ? '#991b1b' : tokens.textSecondary};
`;

const OppProduct = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
`;

const OppDesc = styled.div`
  font-size: 13px;
  color: ${tokens.textSecondary};
  line-height: 1.5;
  margin-bottom: 12px;
  white-space: ${p => p.$expanded ? 'pre-wrap' : 'normal'};
`;

const OppMeta = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const MetaItem = styled.span`
  font-size: 12px;
  color: ${tokens.textMuted};
`;

const OppActions = styled.div`
  display: flex;
  gap: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${tokens.textMuted};
`;

const AppCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid ${tokens.border};
  border-radius: 8px;
  margin-bottom: 8px;
`;

const AppCreator = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const AppAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f9a8d4, #c084fc);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
`;

const AppName = styled.div`
  font-weight: 600;
`;

const AppMeta = styled.div`
  font-size: 12px;
  color: ${tokens.textMuted};
`;

const BrandLogoImg = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
`;

const ExpandedDetails = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
`;

const DetailSection = styled.div`
  margin-bottom: 16px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${tokens.textMuted};
  margin-bottom: 8px;
  letter-spacing: 0.05em;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
`;

const DetailItem = styled.div`
  font-size: 13px;
  color: ${tokens.textSecondary};

  strong {
    color: ${tokens.textPrimary};
  }
`;

const EditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const EditField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: ${tokens.textSecondary};
  }
`;

const EditRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

export default AdminOpportunities;
