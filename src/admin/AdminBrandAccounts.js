import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Empty, Input, Modal, Popconfirm, Segmented, Tag, message } from 'antd';
import { CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { adminHeaders } from './adminAuth';

const API_BASE = (process.env.REACT_APP_API_BASE ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co')).replace(/\/+$/, '');

const STATUS_COLOR = { pending: 'gold', approved: 'green', rejected: 'red' };

function when(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Brand workspace accounts waiting for approval, like the creator approval queue. */
export default function AdminBrandAccounts() {
  const [status, setStatus] = useState('pending');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/api/admin/brand-accounts`, {
        params: { status }, headers: adminHeaders(),
      });
      setAccounts(data.accounts || []);
    } catch (err) {
      message.error(err?.response?.data?.error || 'Could not load brand accounts');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const decide = async (id, action, body = {}, publishOppId = null) => {
    try {
      await axios.post(`${API_BASE}/api/admin/brand-accounts/${id}/${action}`, body, { headers: adminHeaders() });
      if (publishOppId) {
        const { data } = await axios.patch(`${API_BASE}/api/opportunities/admin/${publishOppId}/publish`, { days_open: 14 },
          { headers: adminHeaders() });
        message.success(data?.roster_url ? 'Approved and campaign live. Roster created.' : 'Approved and campaign published.');
      } else {
        message.success(action === 'approve' ? 'Approved. Welcome email sent.' : 'Rejected.');
      }
      load();
    } catch (err) {
      message.error(err?.response?.data?.error || `Could not ${action}`);
      load();
    }
  };

  return (
    <Wrap>
      <Bar>
        <Segmented
          value={status}
          onChange={setStatus}
          options={[{ label: 'Pending', value: 'pending' }, { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' }]}
        />
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
      </Bar>

      {accounts.length === 0 && !loading ? (
        <Empty description={`No ${status} brand accounts`} />
      ) : accounts.map((a) => {
        const canPublish = a.opportunity_id && a.opportunity_status === 'pending';
        return (
          <Row key={a.id}>
            <div className="main">
              <div className="name">
                <b>{a.name}</b> <Tag color={STATUS_COLOR[a.approval_status]}>{a.approval_status}</Tag>
                {!a.profile_completed_at && <Tag color="orange">brand details missing</Tag>}
                {a.signup_method && <Tag>{a.signup_method === 'google' ? 'Google' : 'Email'}</Tag>}
                {a.signup_source && <Tag>{a.signup_source}</Tag>}
              </div>
              <dl>
                <dt>Contact</dt>
                <dd>
                  {[a.first_name, a.last_name].filter(Boolean).join(' ') || '—'} · <a href={`mailto:${a.email}`}>{a.email}</a>
                  {a.workspace_created_at && <> · signed up {when(a.workspace_created_at)}</>}
                  {a.last_login && <> · last seen {when(a.last_login)}</>}
                </dd>
                <dt>Brand</dt>
                <dd>
                  {a.website ? <a href={a.website} target="_blank" rel="noopener noreferrer">{a.website.replace(/^https?:\/\//, '')}</a> : null}
                  {a.app_url ? <>{a.website ? ' · ' : ''}<a href={a.app_url} target="_blank" rel="noopener noreferrer">App store link</a></> : null}
                  {!a.website && !a.app_url && '—'}
                  {a.category && <> · {a.category}</>}
                </dd>
                <dt>Scans</dt>
                <dd>
                  {a.free_scan_brand ? <>Free landing scan: <b>{a.free_scan_brand}</b> · </> : null}
                  {(a.scanned_brands || []).length ? `Scanned: ${a.scanned_brands.join(', ')}` : 'No scans yet'}
                </dd>
                <dt>Campaign</dt>
                <dd>
                  {a.product_name ? (
                    <>
                      <b>{a.product_name}</b> ({a.opportunity_status}){a.pr_value_usd ? ` · $${a.pr_value_usd} value` : ''}
                      {a.creator_count_range ? ` · ${a.creator_count_range} creators` : ''}
                      {(a.shipping_regions || []).length ? ` · ships to ${a.shipping_regions.join(', ')}` : ''}
                      {(a.follower_ranges || []).length ? ` · ${a.follower_ranges.join(', ')}` : ''}
                      {(a.content_types || []).length ? ` · ${a.content_types.join(', ')}` : ''}
                      {a.campaign_description && <div className="desc">{a.campaign_description}</div>}
                      {a.additional_notes && <div className="desc">Notes: {a.additional_notes}</div>}
                    </>
                  ) : 'No campaign submitted yet'}
                </dd>
                {a.rejection_reason && (<><dt>Reason</dt><dd>{a.rejection_reason}</dd></>)}
              </dl>
            </div>
            <div className="actions">
              {a.approval_status !== 'approved' && canPublish && (
                <Popconfirm title={`Approve ${a.name} and publish their campaign?`}
                  description="Creates their roster and sends one email: campaign live, with their workspace link."
                  onConfirm={() => decide(a.id, 'approve', { send_email: false }, a.opportunity_id)}>
                  <Button type="primary" icon={<CheckOutlined />}>Approve & publish campaign</Button>
                </Popconfirm>
              )}
              {a.approval_status !== 'approved' && (
                <Popconfirm title={`Approve ${a.name}?`} description="They get a welcome email." onConfirm={() => decide(a.id, 'approve')}>
                  <Button type={canPublish ? 'default' : 'primary'} icon={<CheckOutlined />}>Approve account</Button>
                </Popconfirm>
              )}
              {a.approval_status === 'approved' && canPublish && (
                <Button onClick={() => decide(a.id, 'approve', { send_email: false }, a.opportunity_id)}>Publish campaign</Button>
              )}
              {a.approval_status !== 'rejected' && (
                <Button danger icon={<CloseOutlined />} onClick={() => { setRejecting(a); setReason(''); }}>Reject</Button>
              )}
            </div>
          </Row>
        );
      })}

      <Modal
        open={Boolean(rejecting)}
        title={rejecting ? `Reject ${rejecting.name}` : ''}
        okText="Reject"
        okButtonProps={{ danger: true }}
        onOk={async () => { await decide(rejecting.id, 'reject', { reason }); setRejecting(null); }}
        onCancel={() => setRejecting(null)}
      >
        <Input.TextArea rows={3} placeholder="Internal reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
      </Modal>
    </Wrap>
  );
}

const Wrap = styled.div`
  display: grid;
  gap: 10px;
`;

const Bar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const Row = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;

  align-items: flex-start;

  .main { min-width: 0; flex: 1; }
  .name { font-size: 15px; margin-bottom: 8px; }

  dl {
    display: grid;
    grid-template-columns: 90px 1fr;
    gap: 4px 12px;
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
  }

  dt { color: #9ca0a8; }
  dd { margin: 0; color: #3f424a; min-width: 0; overflow-wrap: anywhere; }
  .desc { color: #6b6f78; margin-top: 2px; }
  .actions { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;
