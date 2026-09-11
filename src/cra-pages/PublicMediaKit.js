import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import PublicKitView from '../components/PublicKitView';
import { kitApiOrigin, mergeKitWithPublicProfile } from '../lib/kitBrandCta';

const API_BASE = process.env.REACT_APP_API_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://api.newcollab.co'
);

const PublicMediaKit = ({ username }) => {
  const [searchParams] = useSearchParams();
  const refToken = searchParams.get('ref');
  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!username) return;
    const origin = kitApiOrigin(API_BASE);
    const kitUrl = refToken
      ? `${origin}/api/portfolio/public/${username}?ref=${encodeURIComponent(refToken)}`
      : `${origin}/api/portfolio/public/${username}`;
    const slug = encodeURIComponent(username);
    let cancelled = false;

    (async () => {
      try {
        let kitRes;
        try {
          kitRes = await axios.get(kitUrl);
        } catch (err) {
          if (origin.includes('api.newcollab.co')) throw err;
          const prodUrl = refToken
            ? `https://api.newcollab.co/api/portfolio/public/${username}?ref=${encodeURIComponent(refToken)}`
            : `https://api.newcollab.co/api/portfolio/public/${username}`;
          kitRes = await axios.get(prodUrl);
        }
        if (cancelled) return;
        let profile = null;
        const profileUrls = [`${origin}/c/${slug}`];
        if (!origin.includes('api.newcollab.co')) {
          profileUrls.push(`https://api.newcollab.co/c/${slug}`);
        }
        for (const profileUrl of profileUrls) {
          try {
            const profileRes = await axios.get(profileUrl);
            if (profileRes.data && !profileRes.data.error) {
              profile = profileRes.data;
              if (Array.isArray(profile.social_links) && profile.social_links.length) break;
            }
          } catch {
            // public profile may be unpublished; kit still renders
          }
        }
        setKit(mergeKitWithPublicProfile(kitRes.data, profile));
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [username, refToken]);

  const trackInteraction = (type, target = '') => {
    if (!kit?.creator_id) return;
    axios.post(`${API_BASE}/api/portfolio/interaction`, {
      creator_id: kit.creator_id,
      interaction_type: type,
      target_value: target,
    }).catch(() => {});
  };

  const handleShare = async () => {
    const url = `https://newcollab.co/kit/${username}`;
    trackInteraction('share_click');
    try {
      if (navigator.share) {
        await navigator.share({ title: `@${username} media kit`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      // User cancelled or share failed
    }
  };

  if (loading) return <KitState>Loading kit…</KitState>;
  if (notFound) return <KitState>Kit not found</KitState>;
  if (!kit) return null;

  return (
    <PublicKitView
      kit={kit}
      username={username}
      copied={copied}
      onShare={handleShare}
      onSocialClick={(platform) => trackInteraction('social_click', platform)}
      onPortfolioClick={(postId) => trackInteraction('portfolio_click', String(postId))}
      onContactClick={() => trackInteraction('contact_click')}
    />
  );
};

const KitState = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f7f5f0;
  color: #5c6470;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  font-size: 14px;
  font-weight: 600;
`;

export default PublicMediaKit;
