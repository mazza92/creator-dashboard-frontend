import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Input, Modal, Select, Tag, message, Space, Popconfirm } from 'antd';
import axios from 'axios';
import { trackContentHubEvent } from '../utils/contentHubAnalytics';

const ADMIN_TOKEN = 'pr-hunter-admin-2026';

const getApiBase = () => {
  const base = process.env.REACT_APP_API_BASE ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');
  return base.replace(/\/+$/, '');
};
const API_BASE = getApiBase();

const headers = { 'X-Admin-Token': ADMIN_TOKEN };

const TYPE_LABELS = {
  unboxing: 'Unboxing',
  review: 'Review',
  grwm: 'GRWM',
  haul: 'Haul',
  tutorial: 'Tutorial',
  lifestyle: 'Lifestyle',
  other: 'Other',
};

const STATUS_COLOR = {
  pending_review: 'gold',
  approved: 'blue',
  rejected: 'default',
  flagged: 'orange',
  pushed_to_brand: 'magenta',
  brand_responded: 'green',
};

const STATUS_LABEL = {
  pending_review: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
  flagged: 'Flagged',
  pushed_to_brand: 'Pushed to brand',
  brand_responded: 'Brand responded',
};

const REJECT_OPTIONS = [
  { value: 'duplicate', label: 'Duplicate submission' },
  { value: 'invalid_url', label: 'Post URL invalid / not accessible' },
  { value: 'brand_not_tagged', label: 'Brand not tagged or mentioned in content' },
  { value: 'quality', label: 'Content quality below threshold' },
  { value: 'off_brand', label: 'Off-brand or negative content' },
  { value: 'other', label: 'Other' },
];

const RESPONSE_OPTIONS = [
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not interested' },
  { value: 'wants_more_content', label: 'Wants more content' },
  { value: 'wants_paid_collab', label: 'Wants paid collab' },
  { value: 'no_response', label: 'No response' },
];

export default function AdminContentSubmissions() {
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('pending_review');
  const [creatorQ, setCreatorQ] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('quality');
  const [rejectDetail, setRejectDetail] = useState('');
  const [respondOpen, setRespondOpen] = useState(false);
  const [responseStatus, setResponseStatus] = useState('interested');
  const [addBrandOpen, setAddBrandOpen] = useState(false);
  const [newBrand, setNewBrand] = useState({ brand_name: '', category: 'beauty', website: '', contact_email: '' });

  const fetchList = async (nextStatus = status) => {
    setLoading(true);
    try {
      const params = { status: nextStatus };
      if (creatorQ.trim()) params.creator = creatorQ.trim();
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const res = await axios.get(`${API_BASE}/api/admin/content-submissions`, {
        params,
        withCredentials: true,
        headers,
      });
      if (res.data?.success) {
        setRows(res.data.submissions || []);
        setCounts(res.data.counts || {});
      }
    } catch (err) {
      message.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    trackContentHubEvent('admin_content_review_viewed');
    fetchList('pending_review');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = (row) => {
    setSelected(row);
    setNotes(row.admin_notes || '');
    setNewBrand({
      brand_name: row.brand_name_freetext || row.brand_name || '',
      category: 'beauty',
      website: '',
      contact_email: '',
    });
  };

  const patch = async (path, body, eventName, extra = {}) => {
    if (!selected) return;
    try {
      const res = await axios.patch(
        `${API_BASE}/api/admin/content-submissions/${selected.id}/${path}`,
        { admin_notes: notes, ...body },
        { withCredentials: true, headers },
      );
      if (!res.data?.success) {
        message.error(res.data?.error || 'Action failed');
        return;
      }
      if (eventName) {
        trackContentHubEvent(eventName, {
          submission_id: selected.id,
          brand_id: selected.brand_id,
          ...extra,
        });
      }
      message.success('Updated');
      setSelected(res.data.submission);
      fetchList();
    } catch (err) {
      message.error(err.response?.data?.error || 'Action failed');
    }
  };

  const saveNotes = () => patch('notes', { admin_notes: notes });

  const addBrand = async () => {
    if (!selected) return;
    try {
      const res = await axios.post(
        `${API_BASE}/api/admin/content-submissions/${selected.id}/add-brand`,
        newBrand,
        { withCredentials: true, headers },
      );
      if (!res.data?.success) {
        message.error(res.data?.error || 'Could not add brand');
        return;
      }
      trackContentHubEvent('admin_new_brand_added_from_submission', {
        submission_id: selected.id,
        new_brand_id: res.data.brand_id,
      });
      message.success('Brand added to directory');
      setAddBrandOpen(false);
      setSelected({ ...res.data.submission, brand_id: res.data.brand_id });
      fetchList();
    } catch (err) {
      message.error(err.response?.data?.error || 'Could not add brand');
    }
  };

  const pendingCount = counts.pending_review || 0;

  return (
    <Wrap>
      <Toolbar>
        <FilterRow>
          {['pending_review', 'approved', 'rejected', 'flagged', 'pushed_to_brand', 'brand_responded', 'all'].map((key) => (
            <FilterBtn
              key={key}
              $active={status === key}
              onClick={() => {
                setStatus(key);
                fetchList(key);
              }}
            >
              {key === 'all' ? 'All' : STATUS_LABEL[key]}
              {key === 'pending_review' && pendingCount ? ` (${pendingCount})` : ''}
            </FilterBtn>
          ))}
        </FilterRow>
        <Space wrap>
          <Input
            placeholder="Search creator handle"
            value={creatorQ}
            onChange={(e) => setCreatorQ(e.target.value)}
            onPressEnter={() => fetchList()}
            style={{ width: 200 }}
            allowClear
          />
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <Button onClick={() => fetchList()} loading={loading}>Apply</Button>
        </Space>
      </Toolbar>

      <List>
        {rows.length === 0 && !loading && <Empty>No submissions in this filter.</Empty>}
        {rows.map((row) => (
          <Card key={row.id} onClick={() => openDetail(row)}>
            <Top>
              <Meta>
                <strong>{new Date(row.created_at).toLocaleString()}</strong>
                <span>@{row.username || 'unknown'}</span>
                {row.followers_count != null && <span>{Number(row.followers_count).toLocaleString()} followers</span>}
              </Meta>
              <Tag color={STATUS_COLOR[row.status] || 'default'}>{STATUS_LABEL[row.status] || row.status}</Tag>
            </Top>
            <BrandLine>
              {row.is_freetext_brand ? (
                <NewBrandBadge>New brand — not in directory: {row.brand_name_freetext}</NewBrandBadge>
              ) : (
                <span>{row.brand_name || '—'}</span>
              )}
              <Type>{TYPE_LABELS[row.content_type] || row.content_type}</Type>
            </BrandLine>
            <Desc>{(row.description || '').slice(0, 60) || 'No description'}</Desc>
            <a href={row.post_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              Open post
            </a>
          </Card>
        ))}
      </List>

      <Modal
        title="Submission detail"
        open={Boolean(selected)}
        onCancel={() => setSelected(null)}
        footer={null}
        width={720}
      >
        {selected && (
          <Detail>
            <p><strong>Creator:</strong> @{selected.username} · {Number(selected.followers_count || 0).toLocaleString()} followers</p>
            <p><strong>Niche:</strong> {Array.isArray(selected.niche) ? selected.niche.join(', ') : (selected.niche || '—')}</p>
            <p><strong>Region:</strong> {Array.isArray(selected.regions) ? selected.regions.join(', ') : (selected.regions || '—')}</p>
            <p>
              <strong>Post:</strong>{' '}
              <a href={selected.post_url} target="_blank" rel="noopener noreferrer">{selected.post_url}</a>
              {' '}({selected.post_platform})
            </p>
            <p>
              <strong>Brand:</strong>{' '}
              {selected.is_freetext_brand || !selected.brand_id ? (
                <NewBrandBadge>New brand — not in directory: {selected.brand_name_freetext}</NewBrandBadge>
              ) : selected.brand_name}
            </p>
            <p><strong>Type:</strong> {TYPE_LABELS[selected.content_type] || selected.content_type}</p>
            <p><strong>Description:</strong> {selected.description || '—'}</p>
            <p><strong>Consent:</strong> {selected.consent_given ? 'Yes' : 'No'}</p>
            <p><strong>Status:</strong> {STATUS_LABEL[selected.status] || selected.status}</p>
            {selected.brand_response_status && (
              <p><strong>Brand response:</strong> {selected.brand_response_status}</p>
            )}

            {(selected.is_freetext_brand || !selected.brand_id) && (
              <Button style={{ marginBottom: 12 }} onClick={() => setAddBrandOpen(true)}>
                + Add to brands directory
              </Button>
            )}

            <label>Admin notes</label>
            <Input.TextArea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes"
            />
            <Button size="small" style={{ marginTop: 8 }} onClick={saveNotes}>Save notes</Button>

            <Actions>
              <Button type="primary" onClick={() => patch('approve', {}, 'admin_content_approved')}>Approve</Button>
              <Button danger onClick={() => setRejectOpen(true)}>Reject</Button>
              <Popconfirm title="Flag this submission?" onConfirm={() => patch('flag', {})}>
                <Button>Flag</Button>
              </Popconfirm>
              <Button onClick={() => patch('push', {}, 'admin_content_pushed_to_brand', { brand_id: selected.brand_id })}>
                Mark as pushed to brand
              </Button>
              <Button onClick={() => setRespondOpen(true)}>Mark brand responded</Button>
            </Actions>
          </Detail>
        )}
      </Modal>

      <Modal
        title="Reject submission"
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onOk={() => {
          patch('reject', {
            reason: rejectReason,
            reason_detail: rejectDetail,
          }, 'admin_content_rejected', { reason: rejectReason });
          setRejectOpen(false);
        }}
      >
        <Select
          style={{ width: '100%', marginBottom: 12 }}
          value={rejectReason}
          onChange={setRejectReason}
          options={REJECT_OPTIONS}
        />
        {rejectReason === 'other' && (
          <Input.TextArea
            rows={3}
            value={rejectDetail}
            onChange={(e) => setRejectDetail(e.target.value)}
            placeholder="Reason"
          />
        )}
      </Modal>

      <Modal
        title="Brand responded"
        open={respondOpen}
        onCancel={() => setRespondOpen(false)}
        onOk={() => {
          patch('respond', { brand_response_status: responseStatus });
          setRespondOpen(false);
        }}
      >
        <Select
          style={{ width: '100%' }}
          value={responseStatus}
          onChange={setResponseStatus}
          options={RESPONSE_OPTIONS}
        />
      </Modal>

      <Modal
        title="Add brand to directory"
        open={addBrandOpen}
        onCancel={() => setAddBrandOpen(false)}
        onOk={addBrand}
      >
        <Field>
          <span>Name</span>
          <Input
            value={newBrand.brand_name}
            onChange={(e) => setNewBrand({ ...newBrand, brand_name: e.target.value })}
          />
        </Field>
        <Field>
          <span>Category</span>
          <Input
            value={newBrand.category}
            onChange={(e) => setNewBrand({ ...newBrand, category: e.target.value })}
          />
        </Field>
        <Field>
          <span>Website</span>
          <Input
            value={newBrand.website}
            onChange={(e) => setNewBrand({ ...newBrand, website: e.target.value })}
            placeholder="https://"
          />
        </Field>
        <Field>
          <span>PR contact email</span>
          <Input
            value={newBrand.contact_email}
            onChange={(e) => setNewBrand({ ...newBrand, contact_email: e.target.value })}
          />
        </Field>
      </Modal>
    </Wrap>
  );
}

const Wrap = styled.div``;
const Toolbar = styled.div`
  display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;
`;
const FilterRow = styled.div`display: flex; flex-wrap: wrap; gap: 8px;`;
const FilterBtn = styled.button`
  border: 1px solid ${p => p.$active ? '#111' : '#e5e7eb'};
  background: ${p => p.$active ? '#111' : '#fff'};
  color: ${p => p.$active ? '#fff' : '#374151'};
  border-radius: 999px; padding: 6px 12px; font-weight: 600; cursor: pointer;
`;
const List = styled.div`display: flex; flex-direction: column; gap: 10px;`;
const Card = styled.div`
  background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 14px 16px; cursor: pointer;
  &:hover { border-color: #ccc; }
`;
const Top = styled.div`display: flex; justify-content: space-between; gap: 12px; align-items: flex-start;`;
const Meta = styled.div`
  display: flex; flex-wrap: wrap; gap: 10px; font-size: 13px; color: #4b5563;
  strong { color: #111; }
`;
const BrandLine = styled.div`
  display: flex; gap: 10px; align-items: center; margin: 8px 0 4px; font-weight: 600;
`;
const Type = styled.span`
  background: #f3f4f6; border-radius: 999px; padding: 2px 8px; font-size: 12px; font-weight: 600;
`;
const Desc = styled.div`font-size: 13px; color: #6b7280; margin-bottom: 6px;`;
const Empty = styled.div`padding: 40px; text-align: center; color: #6b7280;`;
const NewBrandBadge = styled.span`
  display: inline-block; background: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700;
  padding: 4px 8px; border-radius: 8px;
`;
const Detail = styled.div`
  p { margin: 0 0 8px; font-size: 14px; }
  label { display: block; font-weight: 600; margin: 12px 0 6px; }
`;
const Actions = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px;
`;
const Field = styled.label`
  display: block; margin-bottom: 10px;
  span { display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; }
`;
