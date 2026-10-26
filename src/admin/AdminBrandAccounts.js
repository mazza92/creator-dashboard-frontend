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

  const decide = async (id, action, body = {}) => {
    try {
      await axios.post(`${API_BASE}/api/admin/brand-accounts/${id}/${action}`, body, { headers: adminHeaders() });
      message.success(action === 'approve' ? 'Approved. Welcome email sent.' : 'Rejected.');
      load();
    } catch (err) {
      message.error(err?.response?.data?.error || `Could not ${action}`);
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
      ) : accounts.map((a) => (
        <Row key={a.id}>
          <div className="main">
            <div className="name">
              <b>{a.name}</b> <Tag color={STATUS_COLOR[a.approval_status]}>{a.approval_status}</Tag>
              {a.signup_source && <Tag>{a.signup_source}</Tag>}
            </div>
            <div className="meta">
              {[a.first_name, a.last_name].filter(Boolean).join(' ')} · <a href={`mailto:${a.email}`}>{a.email}</a>
              {a.website && <> · <a href={a.website} target="_blank" rel="noopener noreferrer">{a.website.replace(/^https?:\/\//, '')}</a></>}
            </div>
            <div className="meta">
              {a.signup_niche && <>Niche: {a.signup_niche} · </>}
              {a.product_name ? <>Campaign: {a.product_name} ({a.opportunity_status})</> : 'No campaign submitted'}
              {a.workspace_created_at && <> · Signed up {when(a.workspace_created_at)}</>}
              {a.rejection_reason && <> · Reason: {a.rejection_reason}</>}
            </div>
          </div>
          <div className="actions">
            {a.approval_status !== 'approved' && (
              <Popconfirm title={`Approve ${a.name}?`} description="They get a welcome email." onConfirm={() => decide(a.id, 'approve')}>
                <Button type="primary" icon={<CheckOutlined />}>Approve</Button>
              </Popconfirm>
            )}
            {a.approval_status !== 'rejected' && (
              <Button danger icon={<CloseOutlined />} onClick={() => { setRejecting(a); setReason(''); }}>Reject</Button>
            )}
          </div>
        </Row>
      ))}

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

  .main { min-width: 0; }
  .name { font-size: 15px; margin-bottom: 4px; }
  .meta { font-size: 13px; color: #6b6f78; line-height: 1.6; }
  .actions { display: flex; gap: 8px; flex-shrink: 0; }

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;
