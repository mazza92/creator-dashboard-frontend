import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { message } from 'antd';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getRuntimeApiUrl } from '../config/api';
import AIPitchModal from './AIPitchModal';
import UpgradeModal from './UpgradeModal';
import LoadingSpinner from '../components/LoadingSpinner';

// Use shared API config
const getApiBase = () => getRuntimeApiUrl();

// Utility function to get brand logo URL
const getBrandLogoUrl = (brand) => {
  if (brand.logo_url) return brand.logo_url;

  const domain = brand.domain || brand.website;
  if (domain) {
    try {
      const url = new URL(domain.startsWith('http') ? domain : `https://${domain}`);
      const cleanDomain = url.hostname.replace('www.', '');
      return `https://logo.clearbit.com/${cleanDomain}`;
    } catch (e) {
      // Invalid URL, return placeholder
    }
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.brand_name)}&size=128&background=3B82F6&color=fff&bold=true`;
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ── Pipeline helpers ──────────────────────────────────────────
const getDaysSincePitched = (pitchedAt) => {
  if (!pitchedAt) return 0;
  return Math.floor((Date.now() - new Date(pitchedAt)) / (1000 * 60 * 60 * 24));
};

const getCountdownLabel = (pitchedAt) => {
  const days = getDaysSincePitched(pitchedAt);
  const remaining = 14 - days;
  if (remaining <= 0) return { text: 'Window closed', urgent: true };
  if (remaining <= 2) return { text: `Window closes in ${remaining} day${remaining === 1 ? '' : 's'}`, urgent: true };
  return { text: `Window closes in ${remaining} days`, urgent: false };
};

const getPulseSignal = (responseRate) => {
  if (!responseRate) return null;
  if (responseRate >= 40) return { color: '#10B981', textColor: '#059669', label: 'Active this week' };
  if (responseRate >= 20) return { color: '#F59E0B', textColor: '#D97706', label: 'Moderate activity' };
  return { color: '#EF4444', textColor: '#DC2626', label: 'Quiet this week' };
};

const computePipelineHealth = (items) => {
  const pitchedItems = items.filter(i =>
    ['waiting', 'followup', 'pitched'].includes(i.pipeline_stage) || i.pitched_at
  );
  if (!pitchedItems.length) return 0;
  let score = 0;
  const total = pitchedItems.length;
  // More pitches = higher score (up to 40 points)
  score += Math.min(total * 15, 40);
  // Penalize overdue items not followed up
  const overdueNotFollowedUp = pitchedItems.filter(i =>
    i.days_since_pitched >= 7 && i.pipeline_stage !== 'followup'
  ).length;
  score -= overdueNotFollowedUp * 10;
  // Bonus for replies
  const replied = items.filter(i => i.pipeline_stage === 'replied').length;
  score += replied * 20;
  // Bonus for wins
  const won = items.filter(i => ['won', 'received', 'success'].includes(i.pipeline_stage)).length;
  score += won * 15;
  return Math.max(10, Math.min(100, score));
};

// State-based pipeline messaging (replaces anxiety-inducing score labels)
const getPipelineMessage = (items) => {
  const pitched = items.filter(i =>
    ['waiting', 'followup', 'pitched'].includes(i.pipeline_stage) || i.pitched_at
  );
  const total = pitched.length;
  const replied = items.filter(i => i.pipeline_stage === 'replied').length;
  const waiting = items.filter(i => i.pipeline_stage === 'waiting').length;
  const won = items.filter(i => ['won', 'received', 'success'].includes(i.pipeline_stage)).length;

  if (total === 0) {
    return { title: 'Get started', message: 'Start your first pitch to get going.' };
  }
  if (won > 0) {
    return { title: 'You\'re winning', message: `${won} PR package${won > 1 ? 's' : ''} secured. Keep the momentum.` };
  }
  if (replied > 0) {
    return { title: 'Replies coming in', message: 'Your first reply is in. This is how it starts.' };
  }
  if (waiting >= 3) {
    return { title: 'Pipeline active', message: '3+ pitches sent. Brands are reviewing. Check back in a few days.' };
  }
  if (waiting > 0) {
    return { title: 'Pitches sent', message: 'Your pitches are out there. Most replies come in 3 to 7 days.' };
  }
  return { title: 'Keep pitching', message: 'Keep pitching to build momentum.' };
};

const getBestMove = (items) => {
  // Find overdue items that need follow-up, sorted by response rate
  const overdue = items
    .filter(i => {
      const stage = i.pipeline_stage;
      return (stage === 'waiting' || stage === 'pitched') &&
        i.days_since_pitched >= 7 &&
        (i.send_confirmed || i.pitched_at);
    })
    .sort((a, b) => (b.response_rate || 0) - (a.response_rate || 0));
  return overdue[0] || null;
};

// Static platform activity — replace with real API in Phase 3
const MOCK_ACTIVITY = [
  { icon: '💌', text: 'A creator got a reply from a skincare brand · 2h ago', type: 'green' },
  { icon: '🔥', text: 'Reply rates are up 18% in Beauty this week', type: 'amber' },
  { icon: '📦', text: '4 packages landed in Wellness this week', type: 'green' },
];

// Stage filter options - simplified for better UX
const STAGE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'waiting', label: 'In Progress' },
  { key: 'replied', label: 'Replied' },
];

const PRPipeline = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [confirmingItem, setConfirmingItem] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [replyingItem, setReplyingItem] = useState(null);
  const [celebrationItem, setCelebrationItem] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [pitchLimits, setPitchLimits] = useState({ used: 0, limit: 3 });
  const [cardSuccessStates, setCardSuccessStates] = useState({}); // Track inline success per card
  const [pendingFormConfirm, setPendingFormConfirm] = useState(null); // Track PR form clicks
  const [creatorUsername, setCreatorUsername] = useState('');
  const [editingNoteItem, setEditingNoteItem] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [receivingItem, setReceivingItem] = useState(null); // Track package value input
  const [packageValue, setPackageValue] = useState('');
  const [expandedSections, setExpandedSections] = useState({}); // Track expanded won/completed sections

  // Fetch pipeline data on mount
  useEffect(() => {
    fetchPipelineData();
    fetchPitchLimits();
    const apiBase = getApiBase();
    axios.get(`${apiBase}/profile`, { withCredentials: true })
      .then(res => setCreatorUsername(res.data?.username || ''))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter && STAGE_FILTERS.some(f => f.key === filter)) {
      setActiveFilter(filter);
    }
  }, [searchParams]);

  useEffect(() => {
    const confirmBrandId = searchParams.get('confirmBrand');
    if (!confirmBrandId || items.length === 0) return;

    const item = items.find(i =>
      String(i.brand_id) === String(confirmBrandId) || String(i.id) === String(confirmBrandId)
    );

    if (item) {
      // Optimistically set stage to 'pitched' so the card shows "Waiting"
      // while the backend data is still being fetched (avoids stale badges).
      setItems(prev => prev.map(i =>
        i.id === item.id ? { ...i, pipeline_stage: 'pitched' } : i
      ));
      openConfirmation(item, searchParams.get('method') || 'email');

      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('confirmBrand');
      nextParams.delete('method');
      setSearchParams(nextParams, { replace: true });
    }
  }, [items, searchParams, setSearchParams]);

  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      const apiBase = getApiBase();

      const [pipelineRes, statsRes] = await Promise.all([
        axios.get(`${apiBase}/api/pr-crm/pipeline/full`, { withCredentials: true }),
        axios.get(`${apiBase}/api/pr-crm/pipeline/stats`, { withCredentials: true })
      ]);

      setItems(pipelineRes.data.items || []);
      setStats(statsRes.data || {});
      setIsPro(statsRes.data.pr_value_visible || false);
    } catch (error) {
      console.error('Error fetching pipeline:', error);
      // Fallback to old endpoint if new one doesn't exist yet
      try {
        const apiBase = getApiBase();
        const response = await axios.get(`${apiBase}/api/pr-crm/pipeline`, { withCredentials: true });
        setItems(response.data.pipeline || []);
      } catch (fallbackError) {
        message.error('Failed to load pipeline');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPitchLimits = async () => {
    try {
      const apiBase = getApiBase();
      const response = await axios.get(`${apiBase}/api/pr-crm/pitch-limits`, { withCredentials: true });
      setPitchLimits({
        used: response.data.used || 0,
        limit: response.data.limit || 3
      });
      setIsPro(response.data.tier === 'pro' || response.data.tier === 'elite');
    } catch (error) {
      console.error('Error fetching pitch limits:', error);
    }
  };

  // Filter items based on active filter
  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') {
      // Smart sorting: prioritize items that drive engagement
      return [...items].sort((a, b) => {
        // Priority function: lower number = higher priority
        const getPriority = (item) => {
          const stage = item.pipeline_stage;
          const isContacted = Boolean(item.send_confirmed) || Boolean(item.pitched_at);

          // Priority 1: Ready to Contact (saved but not contacted) - drives credit usage
          if (stage === 'saved' && !isContacted) return 1;

          // Priority 2: Action Needed (replied or overdue)
          if (stage === 'replied') return 2;
          if ((stage === 'waiting' || stage === 'pitched') && item.days_since_pitched >= 7) return 2;
          if (stage === 'followup' && item.days_since_followup >= 7) return 2;

          // Priority 3: Waiting for response (active pitches)
          if (['waiting', 'followup', 'pitched'].includes(stage)) return 3;

          // Priority 4: Won/Completed
          if (['won', 'received', 'success'].includes(stage)) return 4;

          // Priority 5: Everything else (including contacted saved items)
          return 5;
        };

        const priorityDiff = getPriority(a) - getPriority(b);
        if (priorityDiff !== 0) return priorityDiff;

        // Within same priority, sort by most recent activity
        const aDate = new Date(a.pitched_at || a.saved_at || 0);
        const bDate = new Date(b.pitched_at || b.saved_at || 0);
        return bDate - aDate;
      });
    }
    if (activeFilter === 'action') {
      return items.filter(i =>
        i.pipeline_stage === 'replied' ||
        ((i.pipeline_stage === 'waiting' || i.pipeline_stage === 'pitched') && i.days_since_pitched >= 7)
      );
    }
    // Map filter to stage(s)
    const stageMap = {
      'waiting': ['waiting', 'followup', 'pitched'],
      'replied': ['replied'],
      'won': ['won', 'received', 'success'],
      'saved': ['saved']
    };
    const stages = stageMap[activeFilter] || [activeFilter];
    let filtered = items.filter(i => stages.includes(i.pipeline_stage));

    // For saved filter, sort by not-yet-contacted brands first (ready to pitch)
    if (activeFilter === 'saved') {
      filtered = [...filtered].sort((a, b) => {
        // Explicit boolean conversion for reliable comparison
        const aContacted = Boolean(a.send_confirmed) || Boolean(a.pitched_at);
        const bContacted = Boolean(b.send_confirmed) || Boolean(b.pitched_at);
        // Not contacted brands should appear first
        if (!aContacted && bContacted) return -1;
        if (aContacted && !bContacted) return 1;
        // Then by saved date (newest first)
        return new Date(b.saved_at || 0) - new Date(a.saved_at || 0);
      });
    }
    return filtered;
  }, [items, activeFilter]);

  // Nudge items: overdue follow-ups (7+ days since last contact)
  const nudgeItems = useMemo(() => {
    return items.filter(i => {
      const stage = i.pipeline_stage;
      // For follow-up stage, check days since follow-up; otherwise check days since pitch
      if (stage === 'followup') {
        return i.days_since_followup >= 7;
      }
      return (stage === 'waiting' || stage === 'pitched') &&
        i.days_since_pitched >= 7 &&
        (i.send_confirmed || i.pitched_at);
    });
  }, [items]);

  // Count items by stage
  const stageCounts = useMemo(() => {
    return {
      waiting: items.filter(i => ['waiting', 'followup', 'pitched'].includes(i.pipeline_stage)).length,
      replied: items.filter(i => i.pipeline_stage === 'replied').length,
      won: items.filter(i => ['won', 'received', 'success'].includes(i.pipeline_stage)).length,
      saved: items.filter(i => i.pipeline_stage === 'saved').length,
    };
  }, [items]);

  // Group items by section for 'all' view
  const groupedItems = useMemo(() => {
    if (activeFilter !== 'all') return null;

    const getSection = (item) => {
      const stage = item.pipeline_stage;
      const isContacted = Boolean(item.send_confirmed) || Boolean(item.pitched_at);

      if (stage === 'saved' && !isContacted) return 'ready';
      if (stage === 'replied') return 'action';
      if ((stage === 'waiting' || stage === 'pitched') && item.days_since_pitched >= 7) return 'action';
      if (stage === 'followup' && item.days_since_followup >= 7) return 'action';
      if (['waiting', 'followup', 'pitched'].includes(stage)) return 'waiting';
      if (['won', 'received', 'success'].includes(stage)) return 'completed';
      return 'other';
    };

    const groups = { ready: [], action: [], waiting: [], completed: [], other: [] };
    filteredItems.forEach(item => {
      const section = getSection(item);
      groups[section].push(item);
    });

    return groups;
  }, [filteredItems, activeFilter]);

  const SECTION_CONFIG = {
    ready: { emoji: '📌', title: 'Ready to Contact', priority: 1 },
    action: { emoji: '⚡', title: 'Action Needed', priority: 2 },
    waiting: { emoji: '⏳', title: 'In Progress', priority: 3 },
    completed: { emoji: '🎁', title: 'Completed', priority: 4 },
    other: { emoji: '📋', title: 'Other', priority: 5 }
  };

  const COMPLETED_LIMIT = 3; // Show only 3 completed items by default

  // Update pipeline item
  const advanceStage = useCallback(async (itemId, updates) => {
    // Optimistic update
    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, ...updates } : i
    ));
    try {
      const apiBase = getApiBase();
      await axios.patch(`${apiBase}/api/pr-crm/pipeline/${itemId}/update`, updates, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Error updating pipeline:', error);
      message.error('Failed to update');
      // Revert on error by refetching
      fetchPipelineData();
    }
  }, []);

  const openConfirmation = (item, method = 'email') => {
    setConfirmingItem({ ...item, _confirmMethod: method });
  };

  const getConfirmationCopy = (method = 'email') => {
    if (method === 'followup') {
      return {
        icon: '🔄',
        title: 'Did you send the follow-up?',
        subtitle: "Nice work staying on top of it! Confirm you sent it so we can track your progress.",
        confirmLabel: '✓ Yes, I sent the follow-up',
        laterLabel: "Not yet, I'll send later",
        success: "✓ Follow-up sent! Most brands respond within a few days after a nudge.",
        hint: "Follow-ups double your reply rate"
      };
    }

    if (method === 'form') {
      return {
        icon: '📋',
        title: 'Did you apply through the form?',
        subtitle: "We'll remind you to follow up at the right time, but only if you confirm you submitted the form.",
        confirmLabel: '✓ Yes, I applied',
        laterLabel: "Not yet, I'll apply later",
        success: "✓ Application tracked! We'll remind you to follow up in 7 days.",
        hint: "You'll get a reminder in 7 days to follow up"
      };
    }

    return {
      icon: '📧',
      title: 'Did you send the email?',
      subtitle: "We'll remind you to follow up at the right time, but only if you confirm you sent it.",
      confirmLabel: '✓ Yes, I sent it',
      laterLabel: "Not yet, I'll send later",
      success: "✓ Brand contacted! We'll remind you to follow up in 7 days.",
      hint: "You'll get a reminder in 7 days to follow up"
    };
  };

  // Handle confirm send/application
  const handleConfirmSend = async (item) => {
    if (confirmLoading) return; // Prevent double-clicks

    const method = item._confirmMethod || 'email';
    const copy = getConfirmationCopy(method);

    setConfirmLoading(true);
    try {
      const apiBase = getApiBase();

      if (method === 'followup') {
        // Follow-up confirmation - update followup_count and followup_sent_at
        await axios.post(`${apiBase}/api/pr-crm/pipeline/${item.id}/confirm-followup`, {}, {
          withCredentials: true
        });
      } else {
        // Initial contact confirmation
        await axios.post(`${apiBase}/api/pr-crm/pipeline/${item.id}/confirm-send`, {
          send_confirmation_email: true, // Request confirmation email
          contact_method: method
        }, {
          withCredentials: true
        });
      }

      setConfirmingItem(null);
      // Show inline success on the card instead of toast
      showCardSuccess(item.id, copy.success);
      fetchPipelineData();
      fetchPitchLimits();
    } catch (error) {
      console.error('Error confirming send:', error);
      message.error('Failed to confirm send');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Handle reply option selection
  const handleReplyOption = async (item, replyType) => {
    try {
      const apiBase = getApiBase();
      const response = await axios.post(`${apiBase}/api/pr-crm/pipeline/${item.id}/log-reply`, {
        reply_type: replyType
      }, { withCredentials: true });

      const data = response.data;
      setReplyingItem(null);

      if (replyType === 'package_coming') {
        if (data.show_upgrade) {
          setUpgradeReason('pr_value');
          setShowUpgradeModal(true);
        } else {
          showCardSuccess(item.id, '🎁 Package confirmed! Mark as received when it arrives.');
        }
      } else if (replyType === 'need_info') {
        showCardSuccess(item.id, '📄 Send them your media kit to close the deal!');
      } else if (replyType === 'not_fit') {
        showCardSuccess(item.id, '📋 Archived. Try a similar brand from Discover!');
      } else {
        showCardSuccess(item.id, '✓ Status updated!');
      }

      fetchPipelineData();
    } catch (error) {
      console.error('Error logging reply:', error);
      message.error('Failed to update reply');
    }
  };

  // Handle mark as received - open modal to get package value
  const handleMarkReceived = (item) => {
    setReceivingItem(item);
    setPackageValue(item.package_value ? String(item.package_value) : '');
  };

  // Actually mark as received with package value
  const submitPackageReceived = async () => {
    if (!receivingItem) return;

    const value = parseInt(packageValue, 10) || 0;

    try {
      await advanceStage(receivingItem.id, {
        stage: 'received',
        received_at: 'NOW()',
        package_value: value
      });
      message.success('Congratulations! Package marked as received!');
      setCelebrationItem(receivingItem);
      setReceivingItem(null);
      setPackageValue('');
      fetchPipelineData();
    } catch (error) {
      console.error('Error marking received:', error);
      message.error('Failed to mark as received');
    }
  };

  // Handle follow-up click
  const handleFollowup = (item) => {
    if (!isPro) {
      setUpgradeReason('followup');
      setShowUpgradeModal(true);
      return;
    }
    // Open AI pitch modal with follow-up context
    setSelectedBrand({ ...item, isFollowup: true });
    setShowPitchModal(true);
  };

  // Handle pitch/contact click
  const handlePitch = (item) => {
    setSelectedBrand(item);
    setShowPitchModal(true);
  };

  // Handle PR form link click - show confirmation modal after (if not at limit)
  const handleFormLinkClick = (e, item) => {
    // Check if user is at or over pitch limit
    const atLimit = !isPro && pitchLimits.used >= pitchLimits.limit;

    if (atLimit) {
      // BLOCK the link from opening - user must upgrade
      e.preventDefault();
      setUpgradeReason('limit_reached');
      setShowUpgradeModal(true);
      return;
    }

    // Set pending confirmation - will show modal after delay (user reviews external form)
    setPendingFormConfirm(item);
    // Show confirmation modal after a short delay (user has time to see the form opened)
    setTimeout(() => {
      openConfirmation(item, 'form');
      setPendingFormConfirm(null);
    }, 1500);
  };

  // Show inline success state on card
  const showCardSuccess = (itemId, message) => {
    setCardSuccessStates(prev => ({ ...prev, [itemId]: message }));
    // Auto-clear after 4 seconds
    setTimeout(() => {
      setCardSuccessStates(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    }, 4000);
  };

  // Handle pitch sent
  const handlePitchSent = (brand, context = {}) => {
    setShowPitchModal(false);
    const method = typeof context === 'string' ? context : context?.method;
    const hitLimit = typeof context === 'object' ? context?.hitLimit : false;

    // If user hit pitch limit, show upgrade modal instead of confirmation modal
    if (hitLimit && !isPro) {
      setUpgradeReason('limit_reached');
      setShowUpgradeModal(true);
      // Still show success for the brand they just pitched
      const item = items.find(i => i.brand_id === brand.brand_id || i.id === brand.id);
      if (item) {
        showCardSuccess(item.id, '✓ Pitch sent! Upgrade to send more this month.');
      }
    } else {
      // Show confirmation modal
      const item = items.find(i => i.brand_id === brand.brand_id || i.id === brand.id);
      if (item) {
        // Optimistically update to 'pitched' so the card immediately shows
        // "Waiting" instead of a stale stage (e.g. "They replied") while
        // fetchPipelineData is still in flight.
        setItems(prev => prev.map(i =>
          i.id === item.id ? { ...i, pipeline_stage: 'pitched' } : i
        ));
        openConfirmation(item, method || 'email');
      }
    }
    fetchPipelineData();
    fetchPitchLimits();
  };

  // Remove brand from pipeline
  const removeBrand = async (itemId) => {
    try {
      const apiBase = getApiBase();
      await axios.delete(`${apiBase}/api/pr-crm/pipeline/${itemId}`, {
        withCredentials: true
      });
      setItems(prev => prev.filter(b => b.id !== itemId));
      message.success('Removed from pipeline');
    } catch (error) {
      console.error('Error removing brand:', error);
      message.error('Failed to remove brand');
    }
  };

  const handleSendKit = () => {
    if (creatorUsername) {
      const url = `https://newcollab.co/c/${creatorUsername}`;
      navigator.clipboard.writeText(url)
        .then(() => message.success({ content: '✓ Media kit link copied!', duration: 3 }))
        .catch(() => window.open(url, '_blank'));
    } else {
      window.open('/creator/dashboard/my-kit', '_blank');
    }
  };

  const handleStartNote = (item) => {
    setEditingNoteItem(item.id);
    setNoteText(item.notes || '');
  };

  const handleSaveNote = async (item) => {
    await advanceStage(item.id, { notes: noteText });
    setEditingNoteItem(null);
    message.success('Note saved!');
  };

  // Render brand card based on stage
  const renderBrandCard = (item) => {
    const stage = item.pipeline_stage || item.stage;
    // For follow-up stage, check days since follow-up was sent; otherwise check days since original pitch
    const isFollowupStage = stage === 'followup';
    const daysSinceLastContact = isFollowupStage && item.days_since_followup != null
      ? item.days_since_followup
      : item.days_since_pitched;
    const isOverdue = daysSinceLastContact >= 7;
    const isWaiting = ['waiting', 'followup', 'pitched'].includes(stage);
    const isWon = ['won', 'success'].includes(stage);
    const isReceived = stage === 'received';
    const isSaved = stage === 'saved';
    const isReplied = stage === 'replied';

    return (
      <BrandCard
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        $isWon={isWon}
      >
        <CardRemoveBtn onClick={() => removeBrand(item.id)} title="Remove">×</CardRemoveBtn>
        <CardTop>
          <BrandLogo>
            <LogoImg
              src={getBrandLogoUrl(item)}
              alt={item.brand_name}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <LogoFallback style={{ display: 'none' }}>
              {item.brand_name.substring(0, 2).toUpperCase()}
            </LogoFallback>
          </BrandLogo>
          <CardInfo>
            <CardName>{item.brand_name}</CardName>
            <CardMeta>
              {item.category && `${item.category} · `}
              {isSaved && `Saved ${formatDate(item.saved_at)}`}
              {isWaiting && item.pitched_at && `Pitched ${formatDate(item.pitched_at)}`}
              {isWon && 'Package confirmed ✓'}
              {isReceived && 'Received ✓'}
              {isReplied && 'Replied to your pitch 🎉'}
            </CardMeta>
          </CardInfo>
          <StatusBadge
            $waiting={isWaiting && !isOverdue}
            $overdue={isWaiting && isOverdue}
            $won={isWon}
            $saved={isSaved}
            $replied={isReplied}
            $followupSent={isFollowupStage && !isOverdue}
          >
            {isReplied && '💬 Replied!'}
            {isWaiting && isOverdue && `⚠ ${daysSinceLastContact}d`}
            {isWaiting && !isOverdue && (isFollowupStage ? '🔄 Followed up' : '● In Progress')}
            {isWon && '🎁 Won'}
            {isSaved && '📌 Saved'}
            {isReceived && '✅ Received'}
          </StatusBadge>
        </CardTop>

        {/* Inline success message */}
        {cardSuccessStates[item.id] && (
          <SuccessMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {cardSuccessStates[item.id]}
          </SuccessMessage>
        )}

        {/* Pulse signal for waiting/pitched items */}
        {isWaiting && !cardSuccessStates[item.id] && (() => {
          const pulse = getPulseSignal(item.response_rate);
          return pulse ? (
            <BrandPulseRow>
              <PulseDotSmall $color={pulse.color} />
              <PulseText $color={pulse.textColor}>
                {pulse.label}
                {item.response_rate ? ` · ${item.response_rate}% reply rate` : ''}
              </PulseText>
            </BrandPulseRow>
          ) : null;
        })()}

        {/* Countdown bar for overdue items */}
        {isWaiting && isOverdue && !cardSuccessStates[item.id] && (() => {
          const countdown = getCountdownLabel(item.pitched_at);
          return (
            <CountdownBar $urgent={countdown.urgent}>
              <CountdownLeft>⏳ {countdown.text}</CountdownLeft>
              <CountdownSub>Reply chance drops after day 14</CountdownSub>
            </CountdownBar>
          );
        })()}

        {/* Waiting state info for non-overdue - Progress Timeline */}
        {isWaiting && !isOverdue && !cardSuccessStates[item.id] && (() => {
          const daysWaiting = daysSinceLastContact;
          const avgResponseDays = Math.max(4, Math.round((100 - (item.response_rate || 30)) / 15));
          const progressPercent = Math.min(95, (daysWaiting / avgResponseDays) * 100);
          const daysRemaining = Math.max(0, 7 - daysWaiting);

          return (
            <WaitingProgressBox>
              <ProgressTimeline>
                <TimelineStep $done>
                  <TimelineCheck>✓</TimelineCheck>
                  <TimelineLabel>Sent</TimelineLabel>
                </TimelineStep>
                <TimelineLine $done />
                <TimelineStep $done>
                  <TimelineCheck>✓</TimelineCheck>
                  <TimelineLabel>Delivered</TimelineLabel>
                </TimelineStep>
                <TimelineLine $progress={progressPercent} />
                <TimelineStep $active>
                  <TimelineCircle />
                  <TimelineLabel>Response</TimelineLabel>
                </TimelineStep>
              </ProgressTimeline>

              <WaitingMeta>
                <WaitingMetaLeft>
                  {daysRemaining > 0
                    ? `Follow-up ready in ${daysRemaining} days`
                    : 'Follow-up ready now'}
                </WaitingMetaLeft>
                <WaitingMetaRight onClick={() => setReplyingItem(item)}>
                  Got a reply? →
                </WaitingMetaRight>
              </WaitingMeta>
            </WaitingProgressBox>
          );
        })()}

        {/* Brand description for saved items */}
        {isSaved && item.description && !cardSuccessStates[item.id] && (
          <BrandDesc>{item.description}</BrandDesc>
        )}

        {/* Info pills for saved items */}
        {isSaved && !cardSuccessStates[item.id] && (
          <InfoRow>
            {item.response_rate && (
              <InfoPill $green={item.response_rate >= 40}>
                {item.response_rate >= 50 ? '🔥 ' : ''}{item.response_rate}% response rate
              </InfoPill>
            )}
            {item.has_application_form && (
              <InfoPill>📋 Has PR form</InfoPill>
            )}
          </InfoRow>
        )}

        {/* Social proof line for saved items */}
        {isSaved && !cardSuccessStates[item.id] && (
          <SocialProofLine>
            <GreenDotSm />
            {item.recent_creator_replies && item.recent_creator_replies > 0
              ? `${item.recent_creator_replies} ${item.category || 'creator'}${item.recent_creator_replies > 1 ? 's' : ''} got a reply this month`
              : `Active this week · ${item.response_rate || 20}% reply rate`}
          </SocialProofLine>
        )}

        {/* Replied celebration banner */}
        {isReplied && !cardSuccessStates[item.id] && (
          <RepliedBanner>
            <RepliedBannerText>🎉 They replied to your pitch!</RepliedBannerText>
            <RepliedBannerSub>Check your email to continue the conversation</RepliedBannerSub>
          </RepliedBanner>
        )}

        {/* Won card value display */}
        {isWon && (
          <WinValue onClick={() => {
            if (!isPro) {
              setUpgradeReason('pr_value');
              setShowUpgradeModal(true);
            }
          }}>
            🎁 {isPro ? `~$${item.package_value || '??'}` : '~$?? '}
            {!isPro && <LockIcon>🔒</LockIcon>}
          </WinValue>
        )}

        {/* Primary action button */}
        {isSaved && (
          <>
            <PrimaryBtn
              $contact
              onClick={() => handlePitch(item)}
              disabled={!isPro && pitchLimits.used >= pitchLimits.limit}
              style={{
                background: (!isPro && pitchLimits.used >= pitchLimits.limit) ? '#f3f4f6' : undefined,
                color: (!isPro && pitchLimits.used >= pitchLimits.limit) ? '#9ca3af' : undefined,
                cursor: (!isPro && pitchLimits.used >= pitchLimits.limit) ? 'not-allowed' : undefined
              }}
            >
              ✉️ Pitch {item.brand_name} · Use 1 credit
            </PrimaryBtn>
            {!isPro && (
              <CtaCredit>
                {pitchLimits.limit - pitchLimits.used - 1 >= 0
                  ? `${pitchLimits.limit - pitchLimits.used - 1} credit${pitchLimits.limit - pitchLimits.used - 1 !== 1 ? 's' : ''} remaining after this pitch`
                  : <>No credits remaining — <UpgradeLink onClick={() => { setUpgradeReason('quota'); setShowUpgradeModal(true); }}>upgrade to pitch</UpgradeLink></>}
              </CtaCredit>
            )}
          </>
        )}

        {isWaiting && isOverdue && (
          <PrimaryBtn $followup onClick={() => handleFollowup(item)}>
            🔄 Send Follow-up
          </PrimaryBtn>
        )}

        {isWaiting && !isOverdue && (
          <PitchMoreNudge onClick={() => navigate('/creator/dashboard/for-you')}>
            <NudgeIcon>💡</NudgeIcon>
            <NudgeText>Pitch more brands while you wait</NudgeText>
            <NudgeArrow>→</NudgeArrow>
          </PitchMoreNudge>
        )}

        {isReplied && (
          <PrimaryBtn $win onClick={() => handleReplyOption(item, 'package_coming')}>
            📦 Confirm Package Coming
          </PrimaryBtn>
        )}

        {isWon && (
          <PrimaryBtn $win onClick={() => handleMarkReceived(item)}>
            ✅ Mark as Received
          </PrimaryBtn>
        )}

        {/* Secondary actions */}
        <SecondaryRow>
          {isSaved && item.application_form_url && (
            (() => {
              const atLimit = !isPro && pitchLimits.used >= pitchLimits.limit;
              // Don't expose URL in DOM when user is at limit
              if (atLimit) {
                return (
                  <SecondaryBtn
                    onClick={() => {
                      setUpgradeReason('limit_reached');
                      setShowUpgradeModal(true);
                    }}
                  >
                    🔒 Open PR Form
                  </SecondaryBtn>
                );
              }
              return (
                <SecondaryBtn
                  as="a"
                  href={item.application_form_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleFormLinkClick(e, item)}
                >
                  🔗 Open PR Form
                </SecondaryBtn>
              );
            })()
          )}
          {/* Only show "They Replied" in secondary row when overdue (primary shows Follow-up) */}
          {isWaiting && isOverdue && (
            <SecondaryBtn onClick={() => setReplyingItem(item)}>
              💬 They Replied
            </SecondaryBtn>
          )}
          {isReplied && (
            <>
              <SecondaryBtn onClick={handleSendKit}>📄 Send My Kit</SecondaryBtn>
              <SecondaryBtn onClick={() => handleStartNote(item)}>
                {item.notes ? '✏ Edit Note' : '✏ Add Note'}
              </SecondaryBtn>
            </>
          )}
          {isWon && (
            <SecondaryBtn onClick={() => handleStartNote(item)}>
              {item.notes ? '📝 Edit content note' : '📝 Add content note'}
            </SecondaryBtn>
          )}
        </SecondaryRow>

        {/* Inline note editor */}
        {editingNoteItem === item.id && (
          <NoteEditor>
            <NoteTextarea
              autoFocus
              placeholder="Add a private note about this collaboration..."
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
            />
            <NoteActions>
              <NoteSaveBtn onClick={() => handleSaveNote(item)}>Save</NoteSaveBtn>
              <NoteCancelBtn onClick={() => setEditingNoteItem(null)}>Cancel</NoteCancelBtn>
            </NoteActions>
          </NoteEditor>
        )}

        {/* Saved note display */}
        {editingNoteItem !== item.id && item.notes && (
          <SavedNote onClick={() => handleStartNote(item)}>
            📝 {item.notes}
          </SavedNote>
        )}
      </BrandCard>
    );
  };

  const confirmationCopy = confirmingItem
    ? getConfirmationCopy(confirmingItem._confirmMethod)
    : null;

  // Calculate ready-to-pitch brands count
  const readyToPitchCount = items.filter(i => i.pipeline_stage === 'saved' && !i.pitched_at && !i.send_confirmed).length;

  // Calculate next reset date
  const getNextResetDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Container>
      {/* Journey Header */}
      <JourneyHeader>
        <JourneyGreeting>My Pitches</JourneyGreeting>
        <JourneySub>
          {stageCounts.waiting > 0
            ? `${stageCounts.waiting} pitch${stageCounts.waiting === 1 ? '' : 'es'} out · reply expected in ~5 days`
            : readyToPitchCount > 0
              ? `${readyToPitchCount} brand${readyToPitchCount === 1 ? '' : 's'} ready to contact this month`
              : 'Save brands from For You to start pitching'}
        </JourneySub>
        {/* Only show stats after first pitch - zeros are demoralizing */}
        {(stats.total_contacted > 0) && (
          <JourneyStats>
            <JStat>
              <JStatVal $rose>{stats.total_contacted}</JStatVal>
              <JStatLabel>Contacted</JStatLabel>
            </JStat>
            <JStat>
              <JStatVal $green>{stats.total_responded || 0}</JStatVal>
              <JStatLabel>Responded</JStatLabel>
            </JStat>
            <JStat
              $clickable={!isPro}
              onClick={() => {
                if (!isPro) {
                  setUpgradeReason('pr_value');
                  setShowUpgradeModal(true);
                }
              }}
            >
              {isPro ? (
                <JStatVal $purple>${stats.pr_value_earned || 0}</JStatVal>
              ) : (
                <LockedValue>
                  <LockedIcon>📊</LockedIcon>
                  <UnlockLabel>Unlock</UnlockLabel>
                </LockedValue>
              )}
              <JStatLabel>PR Value</JStatLabel>
            </JStat>
          </JourneyStats>
        )}
      </JourneyHeader>

      {/* Quota Bar - always visible for free users */}
      {!isPro && (
        <QuotaBar>
          <QuotaIcon>📨</QuotaIcon>
          <QuotaText>
            <QuotaTitle>
              {pitchLimits.limit - pitchLimits.used > 0
                ? `${pitchLimits.limit - pitchLimits.used} free ${pitchLimits.limit - pitchLimits.used === 1 ? 'pitch' : 'pitches'} left this month`
                : 'Monthly pitches used — upgrade to keep going'}
            </QuotaTitle>
            <QuotaSub>{pitchLimits.used} used · resets {getNextResetDate()}</QuotaSub>
          </QuotaText>
          <QuotaPips>
            {Array.from({ length: pitchLimits.limit }).map((_, i) => (
              <Pip key={i} $used={i < pitchLimits.used} />
            ))}
          </QuotaPips>
        </QuotaBar>
      )}

      {/* Pipeline Health Card - State-based messaging */}
      {stats.total_contacted > 0 && (() => {
        const pipelineStatus = getPipelineMessage(items);
        const hasReplies = items.filter(i => i.pipeline_stage === 'replied').length > 0;
        const hasWins = items.filter(i => ['won', 'received', 'success'].includes(i.pipeline_stage)).length > 0;
        const statusColor = hasWins ? '#059669' : hasReplies ? '#059669' : '#6366F1';
        return (
          <HealthCard>
            <HealthInfo style={{ marginLeft: 0 }}>
              <HealthLabel>Pipeline Status</HealthLabel>
              <HealthTitle style={{ color: statusColor }}>{pipelineStatus.title}</HealthTitle>
              <HealthTip>{pipelineStatus.message}</HealthTip>
            </HealthInfo>
          </HealthCard>
        );
      })()}

      {/* Best Move Card */}
      {(() => {
        const bestMove = getBestMove(items);
        if (!bestMove || activeFilter !== 'all') return null;
        const countdown = getCountdownLabel(bestMove.pitched_at);
        const pulse = getPulseSignal(bestMove.response_rate);
        const days = bestMove.days_since_pitched || getDaysSincePitched(bestMove.pitched_at);
        const progressPercent = Math.min(100, (days / 14) * 100);

        return (
          <BestMoveCard>
            <BestMoveLabel>🎯 Best move right now</BestMoveLabel>
            <BestMoveBrand>
              <BrandLogo style={{ width: 40, height: 40, borderRadius: 10 }}>
                <LogoImg
                  src={getBrandLogoUrl(bestMove)}
                  alt={bestMove.brand_name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <LogoFallback style={{ display: 'none' }}>
                  {bestMove.brand_name.substring(0, 2).toUpperCase()}
                </LogoFallback>
              </BrandLogo>
              <BestMoveInfo>
                <BestMoveName>{bestMove.brand_name}</BestMoveName>
                <BestMoveMeta>{bestMove.category} · Pitched {formatDate(bestMove.pitched_at)}</BestMoveMeta>
              </BestMoveInfo>
              <StatusBadge $overdue>⚠ {days}d</StatusBadge>
            </BestMoveBrand>

            {pulse && (
              <BrandPulseRow>
                <PulseDotSmall $color={pulse.color} />
                <PulseText $color={pulse.textColor}>
                  {pulse.label}
                  {bestMove.response_rate ? ` · ${bestMove.response_rate}% reply rate` : ''}
                </PulseText>
              </BrandPulseRow>
            )}

            <CountdownBar $urgent={countdown.urgent}>
              <CountdownLeft>⏳ {countdown.text}</CountdownLeft>
              <CountdownSub>Reply chance drops 60% after day 14</CountdownSub>
            </CountdownBar>

            <ProgressTrack>
              <ProgressFill style={{ width: `${progressPercent}%` }} />
            </ProgressTrack>

            <PrimaryBtn $followup onClick={() => handleFollowup(bestMove)}>
              ✉ Send Follow-up (Draft Ready)
            </PrimaryBtn>
            <SecondaryBtnGreen onClick={() => setReplyingItem(bestMove)}>
              ✓ They Replied
            </SecondaryBtnGreen>
          </BestMoveCard>
        );
      })()}

      {/* Filter Tabs */}
      <FilterTabs>
        {STAGE_FILTERS.map(filter => (
          <FilterTab
            key={filter.key}
            $active={activeFilter === filter.key}
            onClick={() => setActiveFilter(filter.key)}
          >
            {filter.label}
            {filter.key === 'all' ? ` (${items.length})` : ''}
            {filter.key === 'waiting' && stageCounts.waiting > 0 && ` (${stageCounts.waiting})`}
            {filter.key === 'replied' && stageCounts.replied > 0 && ` (${stageCounts.replied})`}
          </FilterTab>
        ))}
      </FilterTabs>

      {/* Brand Cards */}
      <BrandList>
        {loading ? (
          <LoadingSpinner text="Loading your pipeline..." minHeight="320px" />
        ) : filteredItems.length === 0 ? (
          <EmptyState>
            <EmptyEmoji>📋</EmptyEmoji>
            <EmptyTitle>No brands here yet</EmptyTitle>
            <EmptyText>
              {activeFilter === 'saved' && 'Save brands from Discover to contact them later'}
              {activeFilter === 'waiting' && 'Brands you\'ve contacted will appear here'}
              {activeFilter === 'won' && 'Brands that confirm a package will show here'}
              {activeFilter === 'action' && 'No action needed right now - great job!'}
              {activeFilter === 'all' && 'Save some brands from Discover to get started'}
            </EmptyText>
          </EmptyState>
        ) : activeFilter === 'all' && groupedItems ? (
          // Sectioned view for 'all' filter
          <AnimatePresence>
            {['ready', 'action', 'waiting', 'completed'].map((sectionKey, sectionIdx) => {
              const sectionItems = groupedItems[sectionKey];
              if (!sectionItems || sectionItems.length === 0) return null;

              const config = SECTION_CONFIG[sectionKey];
              const isCompleted = sectionKey === 'completed';
              const isExpanded = expandedSections[sectionKey];
              const visibleItems = isCompleted && !isExpanded
                ? sectionItems.slice(0, COMPLETED_LIMIT)
                : sectionItems;
              const hiddenCount = isCompleted ? sectionItems.length - COMPLETED_LIMIT : 0;

              return (
                <React.Fragment key={sectionKey}>
                  <SectionHeader $first={sectionIdx === 0}>
                    <SectionEmoji>{config.emoji}</SectionEmoji>
                    <SectionTitle>{config.title}</SectionTitle>
                    <SectionCount>({sectionItems.length})</SectionCount>
                    <SectionDivider />
                  </SectionHeader>
                  {visibleItems.map(item => renderBrandCard(item))}
                  {isCompleted && hiddenCount > 0 && !isExpanded && (
                    <ShowMoreBtn onClick={() => setExpandedSections(prev => ({ ...prev, completed: true }))}>
                      Show {hiddenCount} more completed
                    </ShowMoreBtn>
                  )}
                  {isCompleted && isExpanded && sectionItems.length > COMPLETED_LIMIT && (
                    <ShowMoreBtn onClick={() => setExpandedSections(prev => ({ ...prev, completed: false }))}>
                      Show less
                    </ShowMoreBtn>
                  )}
                </React.Fragment>
              );
            })}
          </AnimatePresence>
        ) : (
          <AnimatePresence>
            {filteredItems.map(item => renderBrandCard(item))}
          </AnimatePresence>
        )}

        {/* Locked Upgrade Card - desire-driven */}
        {!isPro && filteredItems.length > 0 && (
          <LockedCard onClick={() => {
            setUpgradeReason('saved');
            setShowUpgradeModal(true);
          }}>
            <LockIconWrap>🔒</LockIconWrap>
            <LockedTextWrap>
              <LockedTitle>
                {stageCounts.saved > 3
                  ? `${stageCounts.saved - 3} more brands match your saved categories`
                  : 'Unlock unlimited pitches every month'}
              </LockedTitle>
              <LockedSub>Pro removes the 3-pitch limit so you can contact all of them.</LockedSub>
            </LockedTextWrap>
            <LockedCta>$19/mo</LockedCta>
          </LockedCard>
        )}
      </BrandList>

      {/* Pitch Modal */}
      <AIPitchModal
        isOpen={showPitchModal}
        onClose={() => setShowPitchModal(false)}
        brand={selectedBrand}
        onPitchSent={handlePitchSent}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentCount={pitchLimits.used}
        limit={pitchLimits.limit}
        feature={upgradeReason}
      />

      {/* Send Confirmation Modal */}
      <AnimatePresence>
        {confirmingItem && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmingItem(null)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalIcon>{confirmationCopy.icon}</ModalIcon>
              <ModalTitle>{confirmationCopy.title}</ModalTitle>
              <ModalSub>
                {confirmationCopy.subtitle}
              </ModalSub>
              <ModalButtons>
                <PrimaryBtn
                  $contact
                  onClick={() => handleConfirmSend(confirmingItem)}
                  disabled={confirmLoading}
                  style={{ opacity: confirmLoading ? 0.7 : 1, cursor: confirmLoading ? 'not-allowed' : 'pointer' }}
                >
                  {confirmLoading ? 'Confirming...' : confirmationCopy.confirmLabel}
                </PrimaryBtn>
                <ModalSecondaryBtn onClick={() => !confirmLoading && setConfirmingItem(null)} disabled={confirmLoading}>
                  {confirmationCopy.laterLabel}
                </ModalSecondaryBtn>
              </ModalButtons>
              <ModalHint>{confirmationCopy.hint}</ModalHint>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Reply Modal */}
      <AnimatePresence>
        {replyingItem && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReplyingItem(null)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalTitle>What did {replyingItem.brand_name} say?</ModalTitle>
              <ReplyOptions>
                <ReplyOption onClick={() => handleReplyOption(replyingItem, 'package_coming')}>
                  <ReplyEmoji>📦</ReplyEmoji>
                  <ReplyContent>
                    <ReplyLabel>Package is coming!</ReplyLabel>
                    <ReplySub>They confirmed sending you a PR package</ReplySub>
                  </ReplyContent>
                </ReplyOption>
                <ReplyOption onClick={() => handleReplyOption(replyingItem, 'need_info')}>
                  <ReplyEmoji>❓</ReplyEmoji>
                  <ReplyContent>
                    <ReplyLabel>They need more info</ReplyLabel>
                    <ReplySub>They asked for your media kit or stats</ReplySub>
                  </ReplyContent>
                </ReplyOption>
                <ReplyOption onClick={() => handleReplyOption(replyingItem, 'not_fit')}>
                  <ReplyEmoji>❌</ReplyEmoji>
                  <ReplyContent>
                    <ReplyLabel>Not a fit right now</ReplyLabel>
                    <ReplySub>They declined or it wasn't the right time</ReplySub>
                  </ReplyContent>
                </ReplyOption>
                <ReplyOption onClick={() => handleReplyOption(replyingItem, 'unsure')}>
                  <ReplyEmoji>🤷</ReplyEmoji>
                  <ReplyContent>
                    <ReplyLabel>Not sure yet</ReplyLabel>
                    <ReplySub>Still in conversation, mark later</ReplySub>
                  </ReplyContent>
                </ReplyOption>
              </ReplyOptions>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Celebration Modal */}
      <AnimatePresence>
        {celebrationItem && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCelebrationItem(null)}
          >
            <CelebrationModal
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CelebEmoji>🎉</CelebEmoji>
              <CelebTitle>You landed a collab with {celebrationItem.brand_name}!</CelebTitle>
              <CelebSubtitle>Your pitch worked! Time to celebrate 🥳</CelebSubtitle>

              <CelebStats>
                <CelebStatItem>
                  <CelebStatValue>{stageCounts.won + 1}</CelebStatValue>
                  <CelebStatLabel>Packages Won</CelebStatLabel>
                </CelebStatItem>
                <CelebStatItem>
                  <CelebStatValue>${celebrationItem.package_value || stats.pr_value_earned || '??'}</CelebStatValue>
                  <CelebStatLabel>PR Value</CelebStatLabel>
                </CelebStatItem>
              </CelebStats>

              {isPro ? (
                <CelebStat>
                  You've earned <strong>${stats.pr_value_earned || 0} in PR value</strong> through NewCollab
                </CelebStat>
              ) : (
                <CelebUpgrade onClick={() => {
                  setCelebrationItem(null);
                  setUpgradeReason('pr_value');
                  setShowUpgradeModal(true);
                }}>
                  🔓 Unlock PR Value tracking with Pro →
                </CelebUpgrade>
              )}

              <PrimaryBtn $contact onClick={() => {
                setCelebrationItem(null);
                window.location.href = '/creator/dashboard/for-you';
              }}>
                🔥 Find Your Next Brand
              </PrimaryBtn>

              <ShareRow>
                <ShareButton
                  className="twitter"
                  onClick={() => {
                    const text = encodeURIComponent(`Just landed a PR package from ${celebrationItem.brand_name}! 🎁✨ Found them on @newcollab_co`);
                    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                  }}
                  title="Share on X/Twitter"
                >
                  𝕏
                </ShareButton>
                <ShareButton
                  className="copy"
                  onClick={() => {
                    navigator.clipboard.writeText(`Just landed a PR package from ${celebrationItem.brand_name}! 🎁 Found them on newcollab.co`);
                    message.success('Copied to clipboard!');
                  }}
                  title="Copy to clipboard"
                >
                  📋
                </ShareButton>
              </ShareRow>
            </CelebrationModal>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Package Value Modal */}
      <AnimatePresence>
        {receivingItem && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReceivingItem(null)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalIcon>📦</ModalIcon>
              <ModalTitle>Your {receivingItem.brand_name} package arrived!</ModalTitle>
              <ModalSub>
                {isPro
                  ? "How much do you think the products are worth? This helps track your PR value."
                  : "Log the estimated value to track your PR earnings."}
              </ModalSub>

              <ValueInputContainer>
                <ValueInputPrefix>$</ValueInputPrefix>
                <ValueInput
                  type="number"
                  placeholder="0"
                  value={packageValue}
                  onChange={(e) => setPackageValue(e.target.value)}
                  autoFocus
                />
              </ValueInputContainer>

              <ValueHint>💡 Estimate the retail value of all products received</ValueHint>

              <ModalButtons>
                <PrimaryBtn $win onClick={submitPackageReceived}>
                  ✅ Mark as Received
                </PrimaryBtn>
                <ModalSecondaryBtn onClick={() => {
                  setPackageValue('');
                  submitPackageReceived();
                }}>
                  Skip for now
                </ModalSecondaryBtn>
              </ModalButtons>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 32px 20px 100px;
  background: #F5F5F7;
  min-height: 100vh;

  @media (max-width: 480px) {
    padding: 20px 16px 100px;
  }
`;

const JourneyHeader = styled.div`
  background: #fff;
  border: 1px solid #E8E8E8;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(15, 15, 15, 0.05);

  @media (max-width: 480px) {
    padding: 20px 16px;
    margin-bottom: 16px;
    border-radius: 16px;
  }
`;

const JourneyGreeting = styled.div`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.3px;
  margin-bottom: 4px;
  color: #0F0F0F;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const JourneySub = styled.div`
  font-size: 13px;
  color: #8C8C8C;
  margin-bottom: 20px;
`;

const JourneyStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
`;

const JStat = styled.div`
  text-align: center;
  padding: 12px 8px;
  border-radius: 12px;
  background: #F4F4F4;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: all 0.15s ease;

  ${props => props.$clickable && `
    &:hover {
      background: #ECECEC;
      transform: scale(1.02);
    }
  `}
`;

const JStatVal = styled.div`
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -1px;
  margin-bottom: 2px;
  color: ${props => props.$rose ? '#E11D48' : props.$green ? '#059669' : props.$purple ? '#7C3AED' : '#0F0F0F'};
  cursor: ${props => props.$locked ? 'pointer' : 'default'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const JStatLabel = styled.div`
  font-size: 11px;
  color: #8C8C8C;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const SmallLock = styled.span`
  font-size: 12px;
`;

const LockedValue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const LockedIcon = styled.div`
  font-size: 20px;
  opacity: 0.8;
`;

const UnlockLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #7C3AED;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const ProgressPath = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 28px;
  padding: 0 4px;
`;

const PathStep = styled.div`
  flex: 1;
  text-align: center;
  position: relative;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    top: 18px;
    left: 60%;
    width: 80%;
    height: 2px;
    background: ${props => props.$filled ? '#059669' : '#E8E8E8'};
    z-index: 0;
  }

  &:last-child::after {
    display: none;
  }
`;

const PathCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props =>
    props.$filled ? '#059669' :
    props.$active ? '#0F0F0F' :
    props.$win ? 'linear-gradient(135deg, #E11D48, #7C3AED)' :
    '#F4F4F4'};
  border: 2px solid ${props =>
    props.$filled ? '#059669' :
    props.$active ? '#0F0F0F' :
    props.$win ? 'transparent' :
    '#E8E8E8'};
  display: grid;
  place-items: center;
  margin: 0 auto 6px;
  font-size: 16px;
  position: relative;
  z-index: 1;
  box-shadow: ${props =>
    props.$active ? '0 0 0 4px rgba(15, 15, 15, 0.08)' :
    props.$win ? '0 4px 12px rgba(225, 29, 72, 0.25)' :
    'none'};
  color: ${props => (props.$filled || props.$active || props.$win) ? '#fff' : '#8C8C8C'};
`;

const PathLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${props => props.$active ? '#0F0F0F' : props.$win ? '#E11D48' : '#8C8C8C'};
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const PathCount = styled.div`
  display: inline-block;
  background: ${props =>
    props.$active ? 'rgba(15, 15, 15, 0.07)' :
    props.$win ? '#FFF1F3' :
    '#F4F4F4'};
  color: ${props => props.$active ? '#0F0F0F' : props.$win ? '#E11D48' : '#8C8C8C'};
  font-size: 10px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 100px;
  margin-top: 3px;
`;

const NudgeBanner = styled.div`
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  cursor: pointer;
`;

const NudgeIcon = styled.div`
  font-size: 22px;
  flex-shrink: 0;
`;

const NudgeText = styled.div`
  flex: 1;
`;

const NudgeTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #D97706;
`;

const NudgeSub = styled.div`
  font-size: 12px;
  color: #4B4B4B;
  margin-top: 1px;
`;

const NudgeArrow = styled.div`
  color: #D97706;
  font-size: 18px;
  flex-shrink: 0;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 480px) {
    gap: 6px;
    margin-bottom: 16px;
  }
`;

const FilterTab = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 100px;
  border: none;
  background: ${props => props.$active ? '#0F0F0F' : '#fff'};
  color: ${props => props.$active ? '#fff' : '#4B4B4B'};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: ${props => props.$active ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'};
  border: 1px solid ${props => props.$active ? '#0F0F0F' : '#E8E8E8'};

  &:hover {
    background: ${props => props.$active ? '#1C1C1C' : '#F4F4F4'};
  }
`;

const TabCount = styled.span`
  background: ${props => props.$active ? 'rgba(255,255,255,0.2)' : '#F4F4F4'};
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
`;

const BrandList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 0 8px;
  margin-top: ${props => props.$first ? '0' : '8px'};
`;

const SectionEmoji = styled.span`
  font-size: 16px;
`;

const SectionTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SectionCount = styled.span`
  font-size: 12px;
  color: #9CA3AF;
  font-weight: 500;
`;

const SectionDivider = styled.div`
  flex: 1;
  height: 1px;
  background: #E5E7EB;
  margin-left: 8px;
`;

const ShowMoreBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 12px;
  margin-top: 4px;
  background: #F9FAFB;
  border: 1px dashed #D1D5DB;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #F3F4F6;
    border-color: #9CA3AF;
    color: #374151;
  }
`;

const CardRemoveBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: #CBD5E1;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  opacity: 0;
  z-index: 5;

  &:hover {
    background: #FEE2E2;
    color: #EF4444;
  }
`;

const BrandCard = styled(motion.div)`
  background: ${props => props.$isWon ? 'linear-gradient(135deg, #FFF1F3 0%, #F5F3FF 100%)' : '#fff'};
  border: ${props => props.$isWon ? '1.5px solid #FECDD3' : '1px solid #E8E8E8'};
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(15, 15, 15, 0.04);
  position: relative;
  overflow: hidden;

  ${props => props.$isWon && `
    &::before {
      content: '🎉';
      position: absolute;
      top: -10px;
      right: 12px;
      font-size: 48px;
      opacity: 0.12;
    }
  `}

  &:hover {
    box-shadow: 0 4px 16px rgba(15, 15, 15, 0.07);

    ${CardRemoveBtn} {
      opacity: 1;
    }
  }

  @media (max-width: 480px) {
    padding: 14px;
    border-radius: 14px;

    ${CardRemoveBtn} {
      opacity: 0.7;
    }
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
`;

const BrandLogo = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 11px;
  background: #F4F4F4;
  border: 1px solid #E8E8E8;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  overflow: hidden;
  padding: 5px;
`;

const LogoImg = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
`;

const LogoFallback = styled.div`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: #0F0F0F;
  display: none;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const CardInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #0F0F0F;
`;

const CardMeta = styled.div`
  font-size: 12px;
  color: #8C8C8C;
  margin-top: 1px;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;

  ${props => props.$waiting && `
    background: #EFF6FF;
    color: #1D4ED8;
    border: 1px solid #BFDBFE;
  `}

  ${props => props.$overdue && `
    background: #FFFBEB;
    color: #D97706;
    border: 1px solid #FDE68A;
  `}

  ${props => props.$won && `
    background: #ECFDF5;
    color: #059669;
    border: 1px solid #A7F3D0;
  `}

  ${props => props.$saved && `
    background: #F4F4F4;
    color: #8C8C8C;
    border: 1px solid #E8E8E8;
  `}

  ${props => props.$replied && `
    background: #ECFDF5;
    color: #059669;
    border: 1px solid #A7F3D0;
  `}

  ${props => props.$followupSent && `
    background: #FFF7ED;
    color: #C2410C;
    border: 1px solid #FED7AA;
  `}
`;

const SuccessMessage = styled(motion.div)`
  background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
  border: 1.5px solid #A7F3D0;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 14px;
  font-size: 13px;
  font-weight: 600;
  color: #059669;
  text-align: center;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 6px;
    margin-bottom: 8px;
  }
`;

const InfoPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: ${props => props.$warn ? '#FFFBEB' : props.$green ? '#f0fdf4' : '#F4F4F4'};
  border-radius: 20px;
  padding: 3px 9px;
  font-size: 12px;
  color: ${props => props.$warn ? '#D97706' : props.$green ? '#059669' : '#4B4B4B'};
  font-weight: 700;

  @media (max-width: 480px) {
    font-size: 11px;
    padding: 2px 8px;
  }
`;

const WinValue = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #FECDD3;
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 800;
  color: #E11D48;
  margin-bottom: 12px;
  cursor: pointer;
`;

const LockIcon = styled.span`
  font-size: 12px;
`;

const PrimaryBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 11px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  ${props => props.$contact && `
    background: #0F0F0F;
    color: #fff;
    &:hover:not(:disabled) { background: #E11D48; }
  `}

  ${props => props.$followup && `
    background: #FFFBEB;
    color: #D97706;
    border: 1.5px solid #FDE68A;
    &:hover { background: #FEF3C7; }
  `}

  ${props => props.$success && `
    background: #ECFDF5;
    color: #059669;
    border: 1.5px solid #A7F3D0;
    &:hover { background: #D1FAE5; }
  `}

  ${props => props.$win && `
    background: linear-gradient(135deg, #E11D48, #7C3AED);
    color: #fff;
    box-shadow: 0 4px 12px rgba(225, 29, 72, 0.2);
    &:hover {
      box-shadow: 0 6px 18px rgba(225, 29, 72, 0.3);
      transform: translateY(-1px);
    }
  `}

  @media (max-width: 480px) {
    padding: 12px;
    font-size: 13px;
    gap: 6px;
  }
`;

const SecondaryRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const SecondaryBtn = styled.button`
  flex: 1;
  padding: 9px;
  border-radius: 9px;
  background: #F4F4F4;
  border: none;
  font-size: 12.5px;
  font-weight: 600;
  color: #4B4B4B;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  text-decoration: none;
  text-align: center;

  &:hover {
    background: #E8E8E8;
    color: #0F0F0F;
  }
`;

const RemoveBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: none;
  border: none;
  color: #D4D4D4;
  font-size: 18px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.15s;

  &:hover {
    background: #FEF2F2;
    color: #DC2626;
  }
`;

const NoteEditor = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NoteTextarea = styled.textarea`
  width: 100%;
  min-height: 72px;
  padding: 10px 12px;
  border: 1.5px solid #E5E7EB;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
  color: #1A1A1A;
  background: #F9FAFB;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: #0F0F0F;
    background: #fff;
  }

  &::placeholder {
    color: #9CA3AF;
  }
`;

const NoteActions = styled.div`
  display: flex;
  gap: 8px;
`;

const NoteSaveBtn = styled.button`
  flex: 1;
  padding: 8px;
  background: #0F0F0F;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover { opacity: 0.85; }
`;

const NoteCancelBtn = styled.button`
  padding: 8px 14px;
  background: none;
  color: #6B7280;
  border: 1.5px solid #E5E7EB;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.15s;
  &:hover { border-color: #9CA3AF; }
`;

const SavedNote = styled.div`
  margin-top: 10px;
  padding: 9px 12px;
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: 9px;
  font-size: 12.5px;
  color: #92400E;
  cursor: pointer;
  line-height: 1.5;
  transition: background 0.15s;
  &:hover { background: #FEF3C7; }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: #fff;
  border: 1px dashed #E8E8E8;
  border-radius: 16px;
`;

const EmptyEmoji = styled.div`
  font-size: 36px;
  margin-bottom: 10px;
`;

const EmptyTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 5px;
  color: #0F0F0F;
`;

const EmptyText = styled.div`
  font-size: 13px;
  color: #8C8C8C;
`;

// Modal styles
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 20px;
  max-width: 400px;
  width: 100%;
  padding: 32px 24px;
  text-align: center;
`;

const ModalIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #0F0F0F;
`;

const ModalSub = styled.p`
  font-size: 14px;
  color: #8C8C8C;
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const ModalHint = styled.p`
  font-size: 12px;
  color: #8C8C8C;
  margin: 16px 0 0 0;
`;

const ModalButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const ModalSecondaryBtn = styled.button`
  width: 100%;
  padding: 13px;
  border-radius: 11px;
  background: transparent;
  border: 1.5px solid #E8E8E8;
  font-size: 14px;
  font-weight: 600;
  color: #4B4B4B;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover {
    background: #F4F4F4;
    border-color: #D4D4D4;
  }
`;

const ReplyOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
`;

const ReplyOption = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #F4F4F4;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;

  &:hover {
    background: #E8E8E8;
  }
`;

const ReplyEmoji = styled.div`
  font-size: 24px;
  flex-shrink: 0;
`;

const ReplyContent = styled.div`
  flex: 1;
`;

const ReplyLabel = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #0F0F0F;
`;

const ReplySub = styled.div`
  font-size: 12px;
  color: #8C8C8C;
  margin-top: 2px;
`;

const CelebrationModal = styled(motion.div)`
  background: linear-gradient(135deg, #FFF1F3 0%, #F5F3FF 100%);
  border-radius: 24px;
  max-width: 420px;
  width: 100%;
  padding: 40px 28px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '🎊';
    position: absolute;
    top: -20px;
    left: 20px;
    font-size: 80px;
    opacity: 0.15;
    transform: rotate(-15deg);
  }

  &::after {
    content: '✨';
    position: absolute;
    bottom: -10px;
    right: 20px;
    font-size: 60px;
    opacity: 0.15;
    transform: rotate(15deg);
  }
`;

const CelebEmoji = styled.div`
  font-size: 72px;
  margin-bottom: 16px;
  animation: bounce 0.6s ease-out;

  @keyframes bounce {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

const CelebTitle = styled.h3`
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: #0F0F0F;
  line-height: 1.3;
`;

const CelebSubtitle = styled.p`
  font-size: 14px;
  color: #6B7280;
  margin: 0 0 20px 0;
`;

const CelebStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
`;

const CelebStatItem = styled.div`
  text-align: center;
`;

const CelebStatValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: #7C3AED;
`;

const CelebStatLabel = styled.div`
  font-size: 11px;
  color: #6B7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CelebStat = styled.div`
  font-size: 14px;
  color: #4B4B4B;
  margin-bottom: 24px;

  strong {
    color: #7C3AED;
  }
`;

const CelebUpgrade = styled.div`
  font-size: 14px;
  color: #E11D48;
  margin-bottom: 24px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const ShareRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 16px;
`;

const ShareButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s ease;

  &.twitter {
    background: #1DA1F2;
    color: white;
  }

  &.instagram {
    background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
    color: white;
  }

  &.copy {
    background: #F3F4F6;
    color: #374151;
  }

  &:hover {
    transform: scale(1.1);
  }
`;

const ValueInputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin: 20px 0 12px;
`;

const ValueInputPrefix = styled.span`
  font-size: 32px;
  font-weight: 800;
  color: #059669;
`;

const ValueInput = styled.input`
  width: 120px;
  font-size: 32px;
  font-weight: 800;
  color: #059669;
  text-align: left;
  border: none;
  border-bottom: 3px solid #A7F3D0;
  background: transparent;
  outline: none;
  padding: 4px 0;
  font-family: inherit;

  &::placeholder {
    color: #D1FAE5;
  }

  &:focus {
    border-color: #059669;
  }

  /* Hide number spinners */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

const ValueHint = styled.div`
  font-size: 12px;
  color: #8C8C8C;
  margin-bottom: 20px;
`;

// ── New Pipeline Redesign styled components ─────────────────────────────────────

const LiveStrip = styled.div`
  background: #fff;
  border: 1px solid #E8E8E8;
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
`;

const LiveStripInner = styled.div`
  padding: 12px 0 12px 16px;
  overflow-x: auto;
  white-space: nowrap;
  display: flex;
  gap: 8px;
  padding-right: 16px;
  &::-webkit-scrollbar { display: none; }
`;

const LivePill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 11.5px;
  color: #374151;
  white-space: nowrap;
  flex-shrink: 0;
`;

const LiveLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #10B981;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-right: 4px;
`;

const PulseDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${p => p.$type === 'amber' ? '#F59E0B' : p.$type === 'red' ? '#EF4444' : '#10B981'};
  display: inline-block;
  flex-shrink: 0;
  animation: pulseDot 2s infinite;
  @keyframes pulseDot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`;

const HealthCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1px solid #E8E8E8;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(15, 15, 15, 0.04);
`;

const HealthRing = styled.div`
  position: relative;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
`;

const HealthScoreText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 13px;
  font-weight: 800;
`;

const HealthInfo = styled.div`
  flex: 1;
`;

const HealthLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const HealthTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #111;
  margin-top: 2px;
`;

const HealthTip = styled.div`
  font-size: 12px;
  color: #6B7280;
  margin-top: 3px;
  strong { color: #7C3AED; }
`;

const BestMoveCard = styled.div`
  background: linear-gradient(135deg, #FFF7ED, #FFFBEB);
  border: 1.5px solid #FCD34D;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, rgba(251,191,36,0.15), transparent);
    border-radius: 50%;
  }
`;

const BestMoveLabel = styled.div`
  font-size: 10.5px;
  font-weight: 700;
  color: #D97706;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const BestMoveBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
`;

const BestMoveInfo = styled.div`
  flex: 1;
`;

const BestMoveName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #111;
`;

const BestMoveMeta = styled.div`
  font-size: 12px;
  color: #6B7280;
  margin-top: 1px;
`;

const BrandPulseRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
`;

const PulseDotSmall = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.$color || '#10B981'};
  flex-shrink: 0;
  animation: pulseDot 2s infinite;
`;

const PulseText = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${p => p.$color || '#059669'};
`;

const CountdownBar = styled.div`
  background: ${p => p.$urgent ? '#FEF3C7' : '#F3F4F6'};
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
`;

const CountdownLeft = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #92400E;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const CountdownSub = styled.div`
  font-size: 11px;
  color: #B45309;
  margin-top: 2px;
`;

const ProgressTrack = styled.div`
  height: 4px;
  background: #E5E7EB;
  border-radius: 2px;
  margin-bottom: 12px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #F59E0B, #EF4444);
  transition: width 0.3s;
`;

const SecondaryBtnGreen = styled.button`
  width: 100%;
  padding: 11px;
  border-radius: 10px;
  border: 1.5px solid #D1FAE5;
  background: #F0FDF4;
  font-size: 13px;
  font-weight: 600;
  color: #059669;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  margin-top: 8px;

  &:hover {
    background: #D1FAE5;
    border-color: #059669;
  }
`;

const WaitingDetail = styled.div`
  background: #EFF6FF;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const WaitingDetailLeft = styled.span`
  font-size: 12px;
  color: #1E40AF;
  font-weight: 500;
`;

const WaitingDetailRight = styled.span`
  font-size: 11.5px;
  color: #3B82F6;
  font-weight: 600;
`;

// New Progress Timeline for Waiting Cards
const WaitingProgressBox = styled.div`
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
`;

const ProgressTimeline = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const TimelineStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const TimelineCheck = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10B981;
  color: white;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const TimelineCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 2px solid #CBD5E1;
`;

const TimelineLine = styled.div`
  flex: 1;
  height: 2px;
  margin: 0 4px;
  background: ${p => p.$done ? '#10B981' : `linear-gradient(90deg, #10B981 ${p.$progress || 0}%, #E2E8F0 ${p.$progress || 0}%)`};
  margin-bottom: 16px;
`;

const TimelineLabel = styled.span`
  font-size: 10px;
  color: #64748B;
  font-weight: 500;
`;

const WaitingMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #E2E8F0;
`;

const WaitingMetaLeft = styled.span`
  font-size: 12px;
  color: #475569;
  font-weight: 500;
`;

const WaitingMetaRight = styled.span`
  font-size: 12px;
  color: #6366F1;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    color: #4F46E5;
    text-decoration: underline;
  }
`;

const PitchMoreNudge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
  border: 1px solid #C7D2FE;
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;

  &:hover {
    background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%);
    border-color: #A5B4FC;
  }
`;

const RepliedBanner = styled.div`
  background: #D1FAE5;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
`;

const RepliedBannerText = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #065F46;
`;

const RepliedBannerSub = styled.div`
  font-size: 11px;
  color: #059669;
  margin-top: 2px;
`;

const ProNudge = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #FAF5FF, #FDF2F8);
  border: 1.5px solid #DDD6FE;
  border-radius: 16px;
  padding: 16px;
  margin-top: 12px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #C4B5FD;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1);
  }
`;

const ProNudgeIcon = styled.div`
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #7C3AED, #E11D48);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
`;

const ProNudgeText = styled.div`
  flex: 1;
`;

const ProNudgeTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #111;
`;

const ProNudgeSub = styled.div`
  font-size: 11.5px;
  color: #6B7280;
  margin-top: 2px;
`;

const ProNudgeCTA = styled.button`
  background: linear-gradient(135deg, #7C3AED, #E11D48);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
  }
`;

// ── New Saved Tab Optimization styled components ─────────────────────────────────────

const QuotaBar = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 480px) {
    padding: 10px 12px;
    gap: 10px;
  }
`;

const QuotaIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f0fdf4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
`;

const QuotaText = styled.div`
  flex: 1;
  min-width: 0;
`;

const QuotaTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #0f0f0f;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const QuotaSub = styled.div`
  font-size: 11.5px;
  color: #6b7280;
  margin-top: 1px;

  @media (max-width: 480px) {
    font-size: 10.5px;
  }
`;

const QuotaPips = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
`;

const Pip = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${p => p.$used ? '#059669' : '#e5e7eb'};
  transition: background 0.3s;

  @media (max-width: 480px) {
    width: 8px;
    height: 8px;
  }
`;

const LockedCard = styled.div`
  background: linear-gradient(135deg, #1f1135 0%, #0f0f0f 100%);
  border-radius: 14px;
  padding: 16px 14px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.01);
  }

  @media (max-width: 480px) {
    padding: 14px 12px;
    gap: 10px;
  }
`;

const LockIconWrap = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(124, 58, 237, 0.25);
  border: 1px solid rgba(124, 58, 237, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 38px;
    height: 38px;
    font-size: 16px;
  }
`;

const LockedTextWrap = styled.div`
  flex: 1;
  min-width: 0;
`;

const LockedTitle = styled.div`
  font-size: 13.5px;
  font-weight: 800;
  color: #fff;
  line-height: 1.25;

  @media (max-width: 480px) {
    font-size: 12.5px;
  }
`;

const LockedSub = styled.div`
  font-size: 11.5px;
  color: #9ca3af;
  margin-top: 3px;
  line-height: 1.35;

  @media (max-width: 480px) {
    font-size: 10.5px;
  }
`;

const LockedCta = styled.button`
  background: linear-gradient(135deg, #7c3aed, #E11D48);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.02);
  }
`;

const SocialProofLine = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: #6b7280;
  margin-top: 4px;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    font-size: 10.5px;
    margin-bottom: 10px;
  }
`;

const GreenDotSm = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #059669;
  flex-shrink: 0;
`;

const CtaCredit = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  text-align: center;
  margin-top: 6px;

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const UpgradeLink = styled.span`
  color: #7c3aed;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  &:hover {
    color: #E11D48;
  }
`;

const BrandDesc = styled.div`
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 10px;

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

export default PRPipeline;
