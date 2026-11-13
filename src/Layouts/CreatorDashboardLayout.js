import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Bell, CalendarDays, Activity, Store, Clapperboard, LayoutGrid } from 'lucide-react';
import UpgradeModal from '../creator-portal/UpgradeModal';
import { message, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined, CheckCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { UserContext } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import Logo from '../components/Logo';
import api from '../config/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentIssueBanner from '../components/PaymentIssueBanner';
import { GoalPrompt, GoalPlanHandoff } from '../creator-portal/tracker/GoalModal';
import { creatorTokens } from '../theme/creatorTokens';
import { usePrefetch } from '../components/PrefetchLink';

// ============================================================
// STYLED COMPONENTS
// ============================================================

// --nc-tabbar: height of the mobile bottom tab bar (0 on desktop). Pages with fixed bottom buttons add it.
const LayoutContainer = styled.div`
  --nc-tabbar: 0px;
  min-height: 100vh;
  background: ${creatorTokens.paper};
  font-family: ${creatorTokens.fontSans};
  color: ${creatorTokens.ink};
  overflow-x: clip;

  @media (max-width: 1024px) {
    --nc-tabbar: calc(62px + env(safe-area-inset-bottom, 0px));
  }
`;

const TopNav = styled.nav`
  background: ${creatorTokens.cream};
  border-bottom: 1px solid ${creatorTokens.line};
  box-shadow: none;
  padding: 0 clamp(16px, 3vw, 32px);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  column-gap: 20px;
  position: sticky;
  top: 0;
  z-index: 50;
  height: 64px;
  min-width: 0;

  @media (max-width: 1024px) {
    grid-template-columns: minmax(0, 1fr) auto;
    height: 56px;
    column-gap: 8px;
    padding: 0 12px;
  }
`;

const LogoSlot = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;

  a { min-width: 0; }
  img {
    height: 28px;
    width: auto;
    max-width: 168px;
    object-fit: contain;
    object-position: left center;
  }

  @media (max-width: 1024px) {
    grid-column: 1;
    grid-row: 1;
    img { height: 22px; max-width: 132px; }
  }
`;

const NavTabs = styled.div`
  display: flex;
  align-items: center;
  justify-self: start;
  gap: 2px;
  background: ${creatorTokens.subtle};
  padding: 4px;
  border-radius: 100px;
  min-width: 0;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const NavTab = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 100px;
  font-size: 13px;
  white-space: nowrap;
  font-weight: ${p => (p.$active ? 600 : 500)};
  color: ${p => (p.$active ? '#FFFFFF' : '#4B4B4B')};
  background: ${p => (p.$active ? '#0F0F0F' : 'transparent')};
  box-shadow: ${p => (p.$active ? '0 1px 4px rgba(0,0,0,0.15)' : 'none')};
  text-decoration: none;
  transition: all 0.15s;
  font-family: inherit;

  &:hover { color: ${p => (p.$active ? '#FFFFFF' : '#0F0F0F')}; }

  svg { width: 16px; height: 16px; }

  @media (max-width: 1240px) {
    padding: 8px 12px;
    svg { display: none; }
  }
`;

// Mobile: a bottom tab bar (Instagram / TikTok pattern). Icon over label, the active tab in ink with a thicker stroke.
const TabBar = styled.nav`
  display: none;

  @media (max-width: 1024px) {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 60;
    height: var(--nc-tabbar);
    padding: 6px 4px env(safe-area-inset-bottom, 0px);
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: saturate(180%) blur(14px);
    -webkit-backdrop-filter: saturate(180%) blur(14px);
    border-top: 1px solid ${creatorTokens.line};
    box-sizing: border-box;
  }
`;

const TabItem = styled(Link)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 3px;
  padding-top: 4px;
  min-width: 0;
  text-decoration: none;
  color: ${p => (p.$active ? '#0F0F0F' : '#8A8A8A')};
  font-size: 10.5px;
  font-weight: ${p => (p.$active ? 700 : 500)};
  letter-spacing: -0.01em;
  -webkit-tap-highlight-color: transparent;

  svg { width: 24px; height: 24px; stroke-width: ${p => (p.$active ? 2.3 : 1.7)}; }
  span.l { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  &:active svg { transform: scale(0.92); }
`;

const TabDot = styled.span`
  position: absolute;
  top: 0;
  left: calc(50% + 6px);
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 999px;
  background: #E11D48;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  line-height: 17px;
  text-align: center;
  border: 2px solid #fff;
  box-sizing: content-box;
`;

const NewBadge = styled.span`
  background: linear-gradient(135deg, #E11D48, #7C3AED);
  color: white;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-left: 2px;
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  justify-self: end;

  @media (max-width: 1024px) {
    grid-column: 2;
    grid-row: 1;
    gap: 6px;
  }
`;

const CreditsChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 12px;
  border-radius: 100px;
  border: 1px solid ${p => (p.$out ? '#E11D48' : p.$low ? '#FDBA74' : creatorTokens.accentBorder)};
  background: ${p => (p.$out ? '#FFF1F2' : p.$low ? '#FFF7ED' : creatorTokens.accentSoft)};
  color: ${p => (p.$out ? '#E11D48' : creatorTokens.accentDeep)};
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: ${p => (p.$pro ? 'default' : 'pointer')};
  white-space: nowrap;

  &:hover { background: ${p => (p.$pro ? creatorTokens.accentSoft : p.$out ? '#FFE4E6' : '#e3f0ea')}; }

  @media (max-width: 1024px) {
    height: 32px;
    padding: 0 10px;
    font-size: 12px;
  }
`;

const CreditDots = styled.span`
  display: inline-flex;
  gap: 3px;
  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #D4D4D4;
    display: block;
  }
  i.on { background: ${creatorTokens.accent}; }

  @media (max-width: 1024px) { display: none; }
`;

const CreditsCopy = styled.span`
  .mini { display: none; }

  @media (max-width: 1024px) {
    .full { display: none; }
    .mini { display: inline; }
  }
`;

const MenuLabel = styled.div`
  padding: 10px 16px 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #9CA3AF;
`;

const IconBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #F4F4F4;
  border: none;
  cursor: pointer;
  display: grid;
  place-items: center;
  color: #4B4B4B;
  transition: all 0.15s;
  position: relative;

  &:hover { background: #EBEBEB; color: #0F0F0F; }

  svg { width: 17px; height: 17px; }

  @media (max-width: 1024px) {
    width: 32px;
    height: 32px;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  background: #EF4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
`;

const AvatarPill = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 14px 4px 4px;
  background: #F4F4F4;
  border: none;
  border-radius: 100px;
  cursor: pointer;
  font-family: inherit;

  &:hover { background: #EBEBEB; }

  .ant-avatar {
    background: #E11D48;
  }

  @media (max-width: 1024px) {
    padding: 0;
    background: transparent;
  }
`;

const AvatarName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #0F0F0F;

  @media (max-width: 1240px) { display: none; }
`;

const MobileNewBadge = styled.span`
  position: absolute;
  top: 2px;
  right: 8px;
  background: linear-gradient(135deg, #E11D48, #7C3AED);
  color: white;
  font-size: 7px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.2px;
`;

const DesktopCountBadge = styled.span`
  min-width: 18px;
  height: 18px;
  background: #E11D48;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 0 5px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
`;

// Pulsing "new brands" badge — draws the eye to drive contact + upgrade
const badgePulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.55); }
  70% { box-shadow: 0 0 0 6px rgba(225, 29, 72, 0); }
  100% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); }
`;

const ForYouDesktopBadge = styled(DesktopCountBadge)`
  animation: ${badgePulse} 2s infinite;
`;

// Violet badge for Pool tab - distinguishes growth activity from brand replies
const PoolDesktopBadge = styled(DesktopCountBadge)`
  background: #7C3AED;
  box-shadow: 0 1px 3px rgba(124, 58, 237, 0.4);
`;

const Content = styled.main`
  min-width: 0;
  overflow-x: clip;

  ${p => p.$polly ? `
    height: calc(100vh - 64px);
    height: calc(100dvh - 64px); /* visible viewport on phones */
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    @media (max-width: 1024px) {
      height: calc(100vh - 56px - var(--nc-tabbar));
      height: calc(100dvh - 56px - var(--nc-tabbar)); /* visible viewport on phones, above the tab bar */
    }
    > * {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
  ` : `
    min-height: calc(100vh - 64px);
    min-height: calc(100dvh - 64px); /* visible viewport on phones */
    padding-top: 8px;
    @media (max-width: 1024px) {
      min-height: calc(100vh - 56px - var(--nc-tabbar));
      min-height: calc(100dvh - 56px - var(--nc-tabbar)); /* visible viewport on phones */
      padding-top: 4px;
      padding-bottom: var(--nc-tabbar);
    }
  `}
`;

// Dropdown Menu
const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: calc(100% + 6px);
  right: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  min-width: 220px;
  overflow: hidden;
  z-index: 1000;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: white;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s;

  svg {
    font-size: 18px;
    color: #6B7280;
  }

  &:hover {
    background: #F9FAFB;
  }

  ${props => props.$danger && `
    color: #EF4444;

    svg {
      color: #EF4444;
    }
  `}
`;

const MenuDivider = styled.div`
  height: 1px;
  background: #E5E7EB;
  margin: 4px 0;
`;

// Notification Dropdown
const NotificationDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 6px);
  right: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: min(320px, calc(100vw - 24px));
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
`;

const NotificationItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #F3F4F6;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #F9FAFB;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const NotificationMessage = styled.div`
  font-size: 13px;
  color: #6B7280;
  line-height: 1.4;
`;

const NotificationTime = styled.div`
  font-size: 11px;
  color: #9CA3AF;
  margin-top: 4px;
`;

const EmptyNotifications = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #9CA3AF;
  font-size: 14px;
`;

// ============================================================
// COMPONENT
// ============================================================

const navItems = [
  { label: 'Polly', icon: Sparkles, path: '/creator/dashboard/for-you' },
  { label: 'Tracker', icon: CalendarDays, path: '/creator/dashboard/tracker' },
  { label: 'Pulse', icon: Activity, path: '/creator/dashboard/pulse' },
  { label: 'Brands', icon: Store, path: '/creator/dashboard/pr-brands' },
  { label: 'UGC gigs', icon: Clapperboard, path: '/creator/dashboard/paid-gigs' },
  { label: 'Portfolio', icon: LayoutGrid, path: '/creator/dashboard/my-kit' },
];

function navActive(pathname, path) {
  if (pathname === path || pathname.startsWith(`${path}/`)) return true;
  // Polly lives at /for-you and /polly
  return path === '/creator/dashboard/for-you' && /^\/creator\/dashboard\/polly(\/|$)/.test(pathname);
}

const moreNavItems = [];

function creditChipCopy(balance) {
  if (!balance) return 'Credits';
  if (balance.is_unlimited) return 'Pro · unlimited';
  const n = Number(balance.remaining);
  if (!Number.isFinite(n)) return 'Credits';
  if (n <= 0) return 'No credits left';
  return n === 1 ? '1 credit left' : `${n} credits left`;
}

const CreatorDashboardLayout = () => {
  const { handleLogout } = useContext(UserContext);
  const { notifications, unreadCount, markAsRead } = useNotification();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [matchedRemaining, setMatchedRemaining] = useState(0);
  const [poolBadge, setPoolBadge] = useState(0);
  const [credits, setCredits] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [yourMove, setYourMove] = useState(0);
  const isFetching = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { prefetch } = usePrefetch();

  // Prefetch data on nav hover for instant navigation
  const handleNavHover = useCallback((path) => {
    prefetch(path);
  }, [prefetch]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isFetching.current) return;
      isFetching.current = true;
      setIsLoading(true);

      try {
        const response = await api.get('/profile');
        const data = response.data;
        const user_role = data.user_role || data.role;
        const user_id = data.user_id || data.id;
        const creator_id = data.creator_id;
        const image_profile = data.image_profile || data.avatar_url || null;

        if (user_role === 'brand') {
          navigate('/brand/workspace', { replace: true });
          return;
        }

        if (user_role === 'creator' && user_id && creator_id) {
          const userData = { ...data, user_id, user_role, creator_id, image_profile };
          setUserData(userData);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        if (error.response?.status === 403 || error.response?.status === 401) {
          localStorage.removeItem('userRole');
          localStorage.removeItem('userData');
          message.error('Your session has expired. Please log in again.');
          navigate('/login', { replace: true });
        } else {
          message.error('Failed to load profile. Please try again.');
        }
      } finally {
        setIsLoading(false);
        isFetching.current = false;
      }
    };

    fetchUserData();
  }, [navigate]);

  // Fetch the number of matched brands the creator still needs to contact.
  // Drives the For You badge: it starts at their match count (e.g. 8) and
  // ticks down as they pitch (8 → 6 after contacting 2), creating the
  // incentive to upgrade and pitch the rest of their matches.
  useEffect(() => {
    const fetchMatchedCount = async () => {
      try {
        const response = await api.get('/api/pr-crm/matched-brands-count');
        if (response.data?.success) {
          setMatchedRemaining(response.data.count || 0);
        }
      } catch (error) {
        // Silent — badge is a non-critical enhancement
      }
    };

    if (!isLoading) {
      fetchMatchedCount();
    }

    // Refresh after the user contacts/saves a brand so the count stays live
    window.addEventListener('savedBrandCountChanged', fetchMatchedCount);
    return () => window.removeEventListener('savedBrandCountChanged', fetchMatchedCount);
  }, [isLoading, location.pathname]);

  useEffect(() => {
    const loadCredits = async () => {
      try {
        const response = await api.get('/api/pr-crm/dashboard-init');
        setCredits(response.data?.unlock_balance || null);
      } catch (error) {
        // Silent — chip is a non-critical enhancement
      }
    };

    if (!isLoading) loadCredits();

    const onCredits = (event) => {
      if (event.detail) setCredits(event.detail);
      else loadCredits();
    };
    window.addEventListener('nc-credits-changed', onCredits);
    return () => window.removeEventListener('nc-credits-changed', onCredits);
  }, [isLoading, location.pathname]);

  // Tracker "Your move" badge: brands waiting on the creator (replies to answer, dates to set, payments due).
  useEffect(() => {
    if (isLoading) return undefined;
    let live = true;
    const load = () => {
      api.get('/api/tracker')
        .then((res) => { if (live) setYourMove(Number(res.data?.your_move_count) || 0); })
        .catch(() => {});
    };
    load();
    const onCount = (event) => setYourMove(Number(event.detail) || 0);
    window.addEventListener('nc-tracker-count', onCount);
    return () => {
      live = false;
      window.removeEventListener('nc-tracker-count', onCount);
    };
  }, [isLoading]);

  // Polly's 7am brief goes out in the creator's local time: send the browser's time zone once a session.
  useEffect(() => {
    if (isLoading || !userData?.creator_id) return;
    try {
      if (sessionStorage.getItem('nc_brief_tz_sent') === '1') return;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz) return;
      sessionStorage.setItem('nc_brief_tz_sent', '1');
      api.post('/api/brief/preferences', { timezone: tz }).catch(() => {});
    } catch (_) { /* silent */ }
  }, [isLoading, userData]);

  // Fetch pool badge count (new followers since last visit)
  useEffect(() => {
    const fetchPoolBadge = async () => {
      try {
        const response = await api.get('/api/pool/badge');
        if (response.data?.badge !== undefined) {
          setPoolBadge(response.data.badge);
        }
      } catch (error) {
        // Silent — badge is a non-critical enhancement
      }
    };

    if (!isLoading) {
      fetchPoolBadge();
    }

    // Clear badge when visiting pool page
    if (location.pathname === '/creator/dashboard/pool') {
      api.post('/api/pool/visit').catch(() => {});
      setPoolBadge(0);
    }
  }, [isLoading, location.pathname]);

  const handleLogoutWithCleanup = async () => {
    try {
      await handleLogout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      message.error('An error occurred during logout.');
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setShowNotifications(false);
    if (notification.data?.action_url) {
      navigate(notification.data.action_url);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('button')) {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <LayoutContainer>
        <LoadingSpinner fullScreen text="Loading..." />
      </LayoutContainer>
    );
  }

  return (
    <LayoutContainer>
      <TopNav>
        <LogoSlot>
          <Logo />
        </LogoSlot>
        <NavTabs>
          {navItems.map(({ label, icon: Icon, path }) => (
            <NavTab
              key={path}
              to={path}
              $active={navActive(location.pathname, path)}
              aria-label={label === 'Tracker' && yourMove > 0 ? `Tracker, ${yourMove} waiting on you` : undefined}
              onMouseEnter={() => handleNavHover(path)}
            >
              <Icon />
              {label}
              {label === 'Polly' && matchedRemaining > 0 && (
                <ForYouDesktopBadge>{matchedRemaining}</ForYouDesktopBadge>
              )}
              {label === 'Tracker' && yourMove > 0 && (
                <DesktopCountBadge title="Your move">{yourMove}</DesktopCountBadge>
              )}
            </NavTab>
          ))}
        </NavTabs>
        <NavRight>
          <CreditsChip
            type="button"
            aria-busy={!credits}
            aria-label={credits ? creditChipCopy(credits) : 'Loading credits'}
            $out={Number(credits?.remaining) <= 0 && !credits?.is_unlimited}
            $low={Number(credits?.remaining) === 1 && !credits?.is_unlimited}
            $pro={!!credits?.is_unlimited}
            onClick={() => {
              if (credits?.is_unlimited) return;
              setShowUserMenu(false);
              setShowNotifications(false);
              setShowUpgrade(true);
            }}
          >
            {!credits?.is_unlimited && Number.isFinite(Number(credits?.remaining)) && (
              <CreditDots aria-hidden="true">
                {Array.from({ length: Math.min(Number(credits?.limit) || 3, 6) }).map((_, i) => (
                  <i key={i} className={i < Number(credits.remaining) ? 'on' : ''} />
                ))}
              </CreditDots>
            )}
            <CreditsCopy>
              <span className="full">{creditChipCopy(credits)}</span>
              <span className="mini">
                {credits?.is_unlimited
                  ? 'Pro'
                  : Number.isFinite(Number(credits?.remaining))
                    ? Number(credits.remaining) <= 0
                      ? '0 left'
                      : `${credits.remaining} left`
                    : 'Credits'}
              </span>
            </CreditsCopy>
          </CreditsChip>
          <IconBtn onClick={() => setShowNotifications(!showNotifications)}>
            <Bell />
            {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
          </IconBtn>
          <AvatarPill onClick={() => setShowUserMenu(!showUserMenu)}>
            <Avatar
              size={28}
              icon={<UserOutlined />}
              src={userData?.image_profile}
            />
            <AvatarName>{userData?.username || userData?.name || 'Creator'}</AvatarName>
          </AvatarPill>
        </NavRight>

        {/* User Dropdown */}
        {showUserMenu && (
          <DropdownMenu
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {moreNavItems.length > 0 && <MenuLabel>More</MenuLabel>}
            {moreNavItems.map(({ label, icon: Icon, path, isNew }) => (
              <MenuItem
                key={path}
                onClick={() => {
                  if (path.includes('pr-ready') || location.pathname.includes('pr-ready')) {
                    sessionStorage.setItem('nc_manager_tab_clicked_at', String(Date.now()));
                  }
                  navigate(path);
                  setShowUserMenu(false);
                }}
              >
                <Icon size={16} />
                {label}
                {isNew && <NewBadge>New</NewBadge>}
                {label === 'Pool' && poolBadge > 0 && <PoolDesktopBadge>{poolBadge}</PoolDesktopBadge>}
              </MenuItem>
            ))}
            <MenuDivider />
            <MenuItem onClick={() => {
              const slug = userData?.username;
              if (slug) {
                window.open(`https://newcollab.co/kit/${slug}`, '_blank', 'noopener,noreferrer');
              }
              setShowUserMenu(false);
            }}>
              <UserOutlined />
              View public profile
            </MenuItem>
            <MenuItem onClick={() => {
              navigate('/creator/dashboard/settings');
              setShowUserMenu(false);
            }}>
              <SettingOutlined />
              Account Settings
            </MenuItem>
            {/* Hidden for now - Stripe Dashboard not needed yet
            <MenuItem onClick={() => {
              window.open('https://dashboard.stripe.com', '_blank');
              setShowUserMenu(false);
            }}>
              <CheckCircleOutlined />
              Stripe Dashboard
            </MenuItem>
            */}
            <MenuDivider />
            <MenuItem $danger onClick={handleLogoutWithCleanup}>
              <LogoutOutlined />
              Logout
            </MenuItem>
          </DropdownMenu>
        )}

        {/* Notification Dropdown */}
        {showNotifications && (
          <NotificationDropdown
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {notifications.length === 0 ? (
              <EmptyNotifications>No notifications</EmptyNotifications>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <NotificationTitle>
                    {notification.event_type?.replace('_', ' ').toLowerCase() || 'Notification'}
                  </NotificationTitle>
                  <NotificationMessage>{notification.message}</NotificationMessage>
                  <NotificationTime>
                    {new Date(notification.created_at).toLocaleDateString()}
                  </NotificationTime>
                </NotificationItem>
              ))
            )}
          </NotificationDropdown>
        )}
      </TopNav>

      <Content $polly={/\/dashboard\/(for-you|polly)(\/|$)/.test(location.pathname)}>
        <PaymentIssueBanner />
        <GoalPrompt pathname={location.pathname} />
        <GoalPlanHandoff />
        <Outlet />
      </Content>

      <TabBar aria-label="Main">
        {navItems.map(({ label, icon: Icon, path }) => (
          <TabItem
            key={path}
            to={path}
            $active={navActive(location.pathname, path)}
            aria-current={navActive(location.pathname, path) ? 'page' : undefined}
            aria-label={label === 'Tracker' && yourMove > 0 ? `Tracker, ${yourMove} waiting on you` : label}
          >
            <Icon aria-hidden="true" />
            <span className="l">{label}</span>
            {label === 'Tracker' && yourMove > 0 && <TabDot>{yourMove > 9 ? '9+' : yourMove}</TabDot>}
            {label === 'Polly' && matchedRemaining > 0 && <TabDot>{matchedRemaining > 9 ? '9+' : matchedRemaining}</TabDot>}
          </TabItem>
        ))}
      </TabBar>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        currentCount={credits?.used || 0}
        limit={credits?.limit || 3}
        unlockRemaining={credits?.remaining ?? 0}
        feature={Number(credits?.remaining) <= 0 ? 'limit_reached' : Number(credits?.remaining) === 1 ? 'last_unlock' : 'credits'}
      />
    </LayoutContainer>
  );
};

export default CreatorDashboardLayout;
