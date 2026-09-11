'use client';

import React, { useState } from 'react';
import PublicKitView from '../../../components/PublicKitView';

const MediaKitClient = ({ mediaKit, username }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `https://newcollab.co/kit/${username}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: `@${username} media kit`, url });
      } else if (typeof navigator !== 'undefined') {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      // User cancelled or share failed
    }
  };

  return (
    <PublicKitView
      kit={mediaKit}
      username={username}
      copied={copied}
      onShare={handleShare}
    />
  );
};

export default MediaKitClient;
