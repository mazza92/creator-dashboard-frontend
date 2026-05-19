import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { message } from 'antd';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { getRuntimeApiUrl } from '../config/api';
import AIPitchModal from './AIPitchModal';
import UpgradeModal from './UpgradeModal';

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

// Stage filter options
const STAGE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'action', label: 'Action Needed', emoji: '⚡' },
  { key: 'waiting', label: 'Waiting', emoji: '⏳' },
  { key: 'won', label: 'Won', emoji: '🎁' },
  { key: 'saved', label: 'Ready to Contact', emoji: '📌' },
];

const PRPipeline = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [confirmingItem, setConfirmingItem] = useState(null);
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
    if (activeFilter === 'all') return items;
    if (activeFilter === 'action') {
      return items.filter(i =>
        i.pipeline_stage === 'replied' ||
        ((i.pipeline_stage === 'waiting' || i.pipeline_stage === 'pitched') && i.days_since_pitched >= 7)
      );
    }
    // Map filter to stage(s)
    const stageMap = {
      'waiting': ['waiting', 'followup', 'pitched'],
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
      action: items.filter(i =>
        i.pipeline_stage === 'replied' ||
        ((i.pipeline_stage === 'waiting' || i.pipeline_stage === 'pitched') && i.days_since_pitched >= 7)
      ).length,
      waiting: items.filter(i => ['waiting', 'followup', 'pitched'].includes(i.pipeline_stage)).length,
      won: items.filter(i => ['won', 'received', 'success'].includes(i.pipeline_stage)).length,
      saved: items.filter(i => i.pipeline_stage === 'saved').length,
    };
  }, [items]);

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
        laterLabel: "Not yet — I'll send later",
        success: "✓ Follow-up sent! Most brands respond within a few days after a nudge.",
        hint: "Follow-ups double your reply rate"
      };
    }

    if (method === 'form') {
      return {
        icon: '📋',
        title: 'Did you apply through the form?',
        subtitle: "We'll remind you to follow up at the right time — but only if you confirm you submitted the form.",
        confirmLabel: '✓ Yes, I applied',
        laterLabel: "Not yet — I'll apply later",
        success: "✓ Application tracked! We'll remind you to follow up in 7 days.",
        hint: "You'll get a reminder in 7 days to follow up"
      };
    }

    return {
      icon: '📧',
      title: 'Did you send the email?',
      subtitle: "We'll remind you to follow up at the right time — but only if you confirm you sent it.",
      confirmLabel: '✓ Yes, I sent it',
      laterLabel: "Not yet — I'll send later",
      success: "✓ Brand contacted! We'll remind you to follow up in 7 days.",
      hint: "You'll get a reminder in 7 days to follow up"
    };
  };

  // Handle confirm send/application
  const handleConfirmSend = async (item) => {
    const method = item._confirmMethod || 'email';
    const copy = getConfirmationCopy(method);

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
  const handleFormLinkClick = (item) => {
    // Check if user is at or over pitch limit
    const atLimit = !isPro && pitchLimits.used >= pitchLimits.limit;

    if (atLimit) {
      // Show upgrade modal instead of confirmation modal
      setTimeout(() => {
        setUpgradeReason('limit_reached');
        setShowUpgradeModal(true);
      }, 1500);
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
      window.open('/creator/dashboard/media-kit', '_blank');
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
            {isWaiting && !isOverdue && (isFollowupStage ? '🔄 Followed up' : '📧 Waiting')}
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

        {/* Info pills */}
        {(isWaiting || isSaved) && !cardSuccessStates[item.id] && (
          <InfoRow>
            {isWaiting && isOverdue && (
              <InfoPill $warn>⚠ {isFollowupStage ? 'Time for another follow-up' : 'Follow-up overdue'}</InfoPill>
            )}
            {isWaiting && !isOverdue && (
              <InfoPill>{isFollowupStage ? 'Follow-up sent - most brands reply within a week' : 'Brands usually reply in ~7 days'}</InfoPill>
            )}
            {item.response_rate && (
              <InfoPill $green={item.response_rate >= 40}>
                {item.response_rate}% response rate {item.response_rate >= 50 ? '🔥' : ''}
              </InfoPill>
            )}
            {item.has_application_form && (
              <InfoPill>📋 Has PR form</InfoPill>
            )}
          </InfoRow>
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
          <PrimaryBtn $contact onClick={() => handlePitch(item)}>
            📧 Contact {item.brand_name}
          </PrimaryBtn>
        )}

        {isWaiting && isOverdue && (
          <PrimaryBtn $followup onClick={() => handleFollowup(item)}>
            🔄 Send Follow-up
          </PrimaryBtn>
        )}

        {isWaiting && !isOverdue && (
          <PrimaryBtn $success onClick={() => setReplyingItem(item)}>
            💬 They Replied!
          </PrimaryBtn>
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
            <SecondaryBtn
              as="a"
              href={item.application_form_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleFormLinkClick(item)}
            >
              🔗 Open PR Form
            </SecondaryBtn>
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
          <RemoveBtn onClick={() => removeBrand(item.id)}>×</RemoveBtn>
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

  return (
    <Container>
      {/* Journey Header */}
      <JourneyHeader>
        <JourneyGreeting>Your PR Journey ✨</JourneyGreeting>
        <JourneySub>
          {stats.total_contacted === 0
            ? "Contact your first brand to get started"
            : "Keep going — most creators land their first package within 3 pitches"}
        </JourneySub>
        <JourneyStats>
          <JStat>
            <JStatVal $rose>{stats.total_contacted || 0}</JStatVal>
            <JStatLabel>Contacted</JStatLabel>
          </JStat>
          <JStat>
            <JStatVal $green>{stats.total_responded || 0}</JStatVal>
            <JStatLabel>Responded</JStatLabel>
          </JStat>
          <JStat>
            <JStatVal
              $purple
              $locked={!isPro}
              onClick={() => {
                if (!isPro) {
                  setUpgradeReason('pr_value');
                  setShowUpgradeModal(true);
                }
              }}
            >
              {isPro ? `$${stats.pr_value_earned || 0}` : '$??'}
              {!isPro && <SmallLock>🔒</SmallLock>}
            </JStatVal>
            <JStatLabel>PR Value</JStatLabel>
          </JStat>
        </JourneyStats>
      </JourneyHeader>

      {/* Progress Path */}
      <ProgressPath>
        <PathStep $filled>
          <PathCircle $filled>✓</PathCircle>
          <PathLabel>Contacted</PathLabel>
          <PathCount>{stats.total_contacted || 0}</PathCount>
        </PathStep>
        <PathStep $active={stageCounts.waiting > 0}>
          <PathCircle $active={stageCounts.waiting > 0}>⏳</PathCircle>
          <PathLabel $active={stageCounts.waiting > 0}>Waiting</PathLabel>
          <PathCount $active={stageCounts.waiting > 0}>{stageCounts.waiting}</PathCount>
        </PathStep>
        <PathStep $win={stageCounts.won > 0}>
          <PathCircle $win={stageCounts.won > 0}>🎁</PathCircle>
          <PathLabel $win={stageCounts.won > 0}>Won</PathLabel>
          <PathCount $win={stageCounts.won > 0}>{stageCounts.won}</PathCount>
        </PathStep>
      </ProgressPath>

      {/* Nudge Banner for Overdue Follow-ups */}
      {nudgeItems.length > 0 && activeFilter === 'all' && (
        <NudgeBanner onClick={() => setActiveFilter('action')}>
          <NudgeIcon>⏰</NudgeIcon>
          <NudgeText>
            <NudgeTitle>{nudgeItems[0].brand_name} hasn't replied in {nudgeItems[0].days_since_pitched} days</NudgeTitle>
            <NudgeSub>A quick follow-up doubles your chances. Tap to send.</NudgeSub>
          </NudgeText>
          <NudgeArrow>›</NudgeArrow>
        </NudgeBanner>
      )}

      {/* Filter Tabs */}
      <FilterTabs>
        {STAGE_FILTERS.map(filter => (
          <FilterTab
            key={filter.key}
            $active={activeFilter === filter.key}
            onClick={() => setActiveFilter(filter.key)}
          >
            {filter.emoji && <span>{filter.emoji}</span>}
            {filter.label}
            {filter.key !== 'all' && (
              <TabCount $active={activeFilter === filter.key}>
                {stageCounts[filter.key] || 0}
              </TabCount>
            )}
          </FilterTab>
        ))}
      </FilterTabs>

      {/* Brand Cards */}
      <BrandList>
        {loading ? (
          <LoadingText>Loading your pipeline...</LoadingText>
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
        ) : (
          <AnimatePresence>
            {filteredItems.map(item => renderBrandCard(item))}
          </AnimatePresence>
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
                <PrimaryBtn $contact onClick={() => handleConfirmSend(confirmingItem)}>
                  {confirmationCopy.confirmLabel}
                </PrimaryBtn>
                <ModalSecondaryBtn onClick={() => setConfirmingItem(null)}>
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
                    <ReplySub>Still in conversation — mark later</ReplySub>
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CelebEmoji>🎉</CelebEmoji>
              <CelebTitle>You landed a collab with {celebrationItem.brand_name}!</CelebTitle>
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
                  Upgrade to Pro to track your total PR value earned →
                </CelebUpgrade>
              )}
              <PrimaryBtn $contact onClick={() => {
                setCelebrationItem(null);
                window.location.href = '/creator/dashboard/pr-brands';
              }}>
                🔍 Find Your Next Brand
              </PrimaryBtn>
              <SecondaryBtn onClick={() => setCelebrationItem(null)}>
                📲 Share your win
              </SecondaryBtn>
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
`;

const JourneyHeader = styled.div`
  background: #fff;
  border: 1px solid #E8E8E8;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(15, 15, 15, 0.05);
`;

const JourneyGreeting = styled.div`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.3px;
  margin-bottom: 4px;
  color: #0F0F0F;
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
  margin-bottom: 14px;
  flex-wrap: wrap;
`;

const InfoPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: ${props => props.$warn ? '#FFFBEB' : props.$green ? '#ECFDF5' : '#F4F4F4'};
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 12px;
  color: ${props => props.$warn ? '#D97706' : props.$green ? '#059669' : '#4B4B4B'};
  font-weight: ${props => (props.$warn || props.$green) ? '700' : '500'};
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
    &:hover { background: #1C1C1C; }
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

const LoadingText = styled.div`
  text-align: center;
  color: #8C8C8C;
  font-size: 14px;
  padding: 40px;
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
  border-radius: 20px;
  max-width: 400px;
  width: 100%;
  padding: 32px 24px;
  text-align: center;
`;

const CelebEmoji = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const CelebTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #0F0F0F;
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

export default PRPipeline;
