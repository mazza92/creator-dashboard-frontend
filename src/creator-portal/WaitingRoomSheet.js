import React, { useEffect } from 'react';
import styled from 'styled-components';
import WaitingRoom, { trackWaitingRoom } from './WaitingRoom';

// The "No credits left" header pill opens the same waiting room as the chat (backend GET /api/polly/waiting-room).

export default function WaitingRoomSheet({ data, onClose: close, onUpgrade, onNavigate }) {
  const onClose = React.useCallback(() => { trackWaitingRoom('close', { source: 'pill' }); close(); }, [close]);
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);
  if (!data?.waiting_room) return null;
  return (
    <Backdrop onClick={onClose}>
      <Sheet role="dialog" aria-modal="true" aria-label="Your free pitches are out" onClick={(e) => e.stopPropagation()}>
        <div className="top">
          <b>Your free pitches are out, and they&apos;re working</b>
          <button type="button" className="x" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <WaitingRoom
          room={data.waiting_room}
          trial={!!data.trial}
          source="pill"
          onUpgrade={onUpgrade}
          onFollowup={(f) => onNavigate(`/creator/dashboard/for-you?chip=draft_followup&brand_id=${f.brand_id}&brand_name=${encodeURIComponent(f.brand_name || '')}`)}
          onOpen={(path) => onNavigate(path)}
        />
      </Sheet>
    </Backdrop>
  );
}

const Backdrop = styled.div`
  position: fixed; inset: 0; z-index: 1200; background: rgba(18, 20, 26, 0.45);
  display: flex; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 40px 16px;
  @media (max-width: 600px) { padding: 0; align-items: flex-end; }
`;

const Sheet = styled.div`
  width: 100%; max-width: 592px; background: #fbfaf7; border-radius: 22px; padding: 16px; box-sizing: border-box;
  .top { display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 16px; }
  .x { border: 0; background: none; font-size: 26px; line-height: 1; cursor: pointer; color: #6b7280; padding: 0 4px; }
  > div:last-child { margin-top: 12px; max-width: none; }
  @media (max-width: 600px) { border-radius: 22px 22px 0 0; max-height: 92vh; overflow-y: auto; }
`;
