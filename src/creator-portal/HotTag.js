import React from 'react';

// 🔥 next to a brand found by our Meta Ads Library crawl (backend meta_ads flag): it's running ads right now,
// which usually means it's looking for creators.
export default function HotTag() {
  return (
    <span role="img" aria-label="Running Meta ads right now" title="Running Meta ads right now"
      style={{ marginRight: 4, fontSize: '0.95em' }}>
      🔥
    </span>
  );
}
