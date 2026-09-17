import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'applied', label: 'Applied' },
  { id: 'active', label: 'Active' },
  { id: 'won', label: 'Won' },
  { id: 'dropped', label: 'Dropped' },
];

const STATUS_DOT = {
  active: '#0d7a5f',
  won: '#059669',
  pitched: '#c9a227',
  applied: '#0d7a5f',
  dropped: '#9ca0a8',
};

const Shell = styled.div`
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 20px 72px;
  font-family: ${t.fontSans};
`;

const Title = styled.h1`
  font-family: ${t.fontDisplay};
  font-size: 32px;
  font-weight: 400;
  color: ${t.ink};
  margin: 0 0 6px;
`;

const Sub = styled.p`
  color: ${t.muted};
  font-size: 14px;
  margin: 0 0 18px;
`;

const Filters = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const Filter = styled.button`
  border: 1px solid ${p => p.$on ? t.ink : t.line};
  background: ${p => p.$on ? t.ink : t.white};
  color: ${p => p.$on ? '#fff' : t.ink};
  border-radius: ${t.radiusPill};
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Card = styled.button`
  width: 100%;
  text-align: left;
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 16px;
  padding: 14px;
  display: flex;
  gap: 12px;
  cursor: pointer;
  font-family: inherit;
  box-shadow: ${t.shadowCard};
  &:hover { border-color: ${t.borderHover}; box-shadow: ${t.shadowHover}; }
`;

const Logo = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: ${t.subtle};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: ${t.muted};
  flex-shrink: 0;
  img { width: 100%; height: 100%; object-fit: contain; background: ${t.white}; }
`;

const Meta = styled.div`
  min-width: 0;
  flex: 1;
  .name { font-weight: 600; font-size: 15px; color: ${t.ink}; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .stage { font-size: 13px; color: ${t.inkSoft}; margin-top: 3px; }
  .last { font-size: 12px; color: ${t.muted}; margin-top: 2px; }
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: 100px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 650;
  background: ${p => p.$tone === 'apply' ? t.accentSoft : t.subtle};
  color: ${p => p.$tone === 'apply' ? t.accentDeep : t.muted};
  border: 1px solid ${p => p.$tone === 'apply' ? t.accentBorder : t.line};
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.$c || t.muted};
  display: inline-block;
`;

const Empty = styled.div`
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 16px;
  padding: 28px 20px;
  text-align: center;
  color: ${t.muted};
  h2 { font-family: ${t.fontDisplay}; font-weight: 400; color: ${t.ink}; font-size: 22px; margin: 0 0 8px; }
  p { margin: 0 0 16px; font-size: 14px; }
`;

const Back = styled.button`
  border: 0;
  background: none;
  color: ${t.muted};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
  margin-bottom: 12px;
`;

const Event = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid ${t.line};
  .icon { font-size: 18px; line-height: 1.2; }
  .label { font-weight: 600; font-size: 14px; color: ${t.ink}; }
  .when { font-size: 12px; color: ${t.muted}; margin-top: 2px; }
  .notes { font-size: 13px; color: ${t.inkSoft}; margin-top: 4px; }
`;

const NextBox = styled.div`
  margin-top: 16px;
  background: ${t.accentSoft};
  border-radius: 14px;
  padding: 14px;
  font-size: 14px;
  color: ${t.ink};
`;

const Cta = styled.button`
  background: ${t.action};
  color: #fff;
  border: 0;
  border-radius: ${t.radiusBtn};
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
`;

function whenLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function Timeline() {
  const navigate = useNavigate();
  const { brandId } = useParams();
  const [status, setStatus] = useState('all');
  const [rows, setRows] = useState([]);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let live = true;
    setBusy(true);
    if (brandId) {
      apiClient.get(`/api/polly/timeline/${brandId}`)
        .then((res) => { if (live) setDetail(res.data || null); })
        .catch(() => { if (live) setDetail(null); })
        .finally(() => { if (live) setBusy(false); });
    } else {
      apiClient.get('/api/polly/timeline', { params: { status } })
        .then((res) => { if (live) setRows(res.data?.relationships || []); })
        .catch(() => { if (live) setRows([]); })
        .finally(() => { if (live) setBusy(false); });
    }
    return () => { live = false; };
  }, [status, brandId]);

  if (brandId) {
    const brand = detail?.brand || {};
    return (
      <Shell>
        <Back type="button" onClick={() => navigate('/creator/dashboard/timeline')}>← All relationships</Back>
        <Title>{brand.name || 'Brand'}</Title>
        <Sub>{[brand.category, brand.slug].filter(Boolean).join(' · ')}</Sub>
        {busy && <Sub>Loading…</Sub>}
        {(detail?.events || []).map((ev) => (
          <Event key={ev.id}>
            <div className="icon">{ev.event_icon}</div>
            <div>
              <div className="label">{ev.event_label}</div>
              <div className="when">{whenLabel(ev.occurred_at)}</div>
              {ev.polly_notes ? <div className="notes">{ev.polly_notes}</div> : null}
            </div>
          </Event>
        ))}
        {!busy && !(detail?.events || []).length && (
          <Empty>
            <h2>No events yet</h2>
            <p>Apply from For You or pitch this brand from Polly and the trail starts here.</p>
          </Empty>
        )}
        {detail?.next_action && (
          <NextBox>
            <strong>Next:</strong> {detail.next_action.label}
            {detail.next_action.due_at ? ` · due ${whenLabel(detail.next_action.due_at)}` : ''}
            <div style={{ marginTop: 12 }}>
              <Cta type="button" onClick={() => navigate('/creator/dashboard/for-you')}>
                {detail?.next_action?.type === 'campaign_applied' ? 'See more brands' : 'Ask Polly'}
              </Cta>
            </div>
          </NextBox>
        )}
      </Shell>
    );
  }

  return (
    <Shell>
      <Title>Timeline</Title>
      <Sub>Pitches, gifted PR applications, replies, and boxes — one trail per brand.</Sub>
      <Filters>
        {FILTERS.map((f) => (
          <Filter key={f.id} type="button" $on={status === f.id} onClick={() => setStatus(f.id)}>
            {f.label}{f.id === 'all' && rows.length ? ` ${rows.length}` : ''}
          </Filter>
        ))}
      </Filters>
      {busy && <Sub>Loading…</Sub>}
      {!busy && rows.length === 0 && (
        <Empty>
            <h2>No timeline yet</h2>
            <p>Apply to a gifted campaign or send a pitch from Polly and it lands here.</p>
            <Cta type="button" onClick={() => navigate('/creator/dashboard/for-you')}>Browse brands</Cta>
        </Empty>
      )}
      <List>
      {rows.map((row) => (
        <Card key={row.brand_id} type="button" onClick={() => navigate(`/creator/dashboard/timeline/${row.brand_id}`)}>
          <Logo>
            {row.logo ? <img src={row.logo} alt="" /> : (row.name || '?').slice(0, 1)}
          </Logo>
          <Meta>
            <div className="name">
              <Dot $c={STATUS_DOT[row.status] || STATUS_DOT.dropped} />
              {row.name}
              {row.source === 'apply' || row.source === 'both' ? (
                <Pill $tone="apply">{row.apply_status === 'ships' ? 'Selected' : row.apply_status === 'posted' ? 'Posted' : row.apply_status === 'declined' || row.apply_status === 'skipped' ? 'Passed' : 'Applied'}</Pill>
              ) : (
                <Pill>Pitched</Pill>
              )}
            </div>
            <div className="stage">{row.stage_label}</div>
            {row.last_event ? (
              <div className="last">{row.last_icon} {row.last_event}{row.last_event_at ? ` · ${whenLabel(row.last_event_at)}` : ''}</div>
            ) : null}
          </Meta>
        </Card>
      ))}
      </List>
    </Shell>
  );
}
