import React, { useState, useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bookmark, Gift, FileText, Bell } from 'lucide-react';
import { message, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined, CheckCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { UserContext } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';
import Logo from '../components/Logo';
import api from '../config/api';

// ============================================================
// STYLED COMPONENTS
// ============================================================

const LayoutContainer = styled.div`
  min-height: 100vh;
  background: #FAFAFA;
`;

const TopNav = styled.nav`
  background: #FFFFFF;
  box-shadow: 0 1px 0 #EBEBEB;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
  height: 60px;

  @media (max-width: 640px) { padding: 0 16px; }
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 36px;
`;

const NavTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  background: #F4F4F4;
  padding: 4px;
  border-radius: 100px;

  @media (max-width: 640px) { display: none; }
`;

const NavTab = styled(Link)`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 13.5px;
  font-weight: ${p => (p.$active ? 600 : 500)};
  color: ${p => (p.$active ? '#FFFFFF' : '#4B4B4B')};
  background: ${p => (p.$active ? '#0F0F0F' : 'transparent')};
  box-shadow: ${p => (p.$active ? '0 1px 4px rgba(0,0,0,0.15)' : 'none')};
  text-decoration: none;
  transition: all 0.15s;
  font-family: inherit;

  &:hover { color: ${p => (p.$active ? '#FFFFFF' : '#0F0F0F')}; }

  svg { width: 16px; height: 16px; }
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
  gap: 10px;
`;

const IconBtn = styled.button`
  width: 38px;
  height: 38px;
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
`;

const AvatarName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #0F0F0F;

  @media (max-width: 640px) { display: none; }
`;

const MobileTabBar = styled.nav`
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #EBEBEB;
  padding: 6px 0 8px;
  justify-content: space-around;
  z-index: 100;

  @media (max-width: 640px) { display: flex; }
`;

const MobileTab = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 10px;
  color: ${p => (p.$active ? '#0F0F0F' : '#8C8C8C')};
  font-weight: ${p => (p.$active ? 700 : 500)};
  text-decoration: none;
  font-size: 10px;
  flex: 1;
  font-family: inherit;
  position: relative;

  svg { width: 20px; height: 20px; }
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

const Content = styled.main`
  min-height: calc(100vh - 60px);

  @media (max-width: 640px) {
    padding-bottom: 72px;
  }
`;

// Dropdown Menu
const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 50px;
  right: 20px;
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
  top: 50px;
  right: 60px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;

  @media (max-width: 768px) {
    right: 20px;
    width: calc(100vw - 40px);
  }
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
  { label: 'Discover', icon: Search,   path: '/creator/dashboard/pr-brands' },
  { label: 'Saved',    icon: Bookmark, path: '/creator/dashboard/pr-pipeline' },
  { label: 'PR Offers', icon: Gift,    path: '/creator/dashboard/pr-offers' },
  { label: 'My Kit',   icon: FileText, path: '/creator/dashboard/media-kit', isNew: true },
];

const CreatorDashboardLayout = () => {
  const { handleLogout } = useContext(UserContext);
  const { notifications, unreadCount, markAsRead } = useNotification();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFetching = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

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
          navigate('/brand/dashboard/overview', { replace: true });
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
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', color: '#6B7280' }}>Loading...</div>
          </div>
        </div>
      </LayoutContainer>
    );
  }

  return (
    <LayoutContainer>
      <TopNav>
        <NavLeft>
          <Logo />
          <NavTabs>
            {navItems.map(({ label, icon: Icon, path, isNew }) => (
              <NavTab key={path} to={path} $active={location.pathname === path}>
                <Icon />
                {label}
                {isNew && <NewBadge>New</NewBadge>}
              </NavTab>
            ))}
          </NavTabs>
        </NavLeft>
        <NavRight>
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
            <MenuItem onClick={() => {
              navigate(`/creator/profile/${userData?.creator_id}`);
              setShowUserMenu(false);
            }}>
              <UserOutlined />
              View Profile
            </MenuItem>
            <MenuItem onClick={() => {
              navigate('/creator/dashboard/settings');
              setShowUserMenu(false);
            }}>
              <SettingOutlined />
              Account Settings
            </MenuItem>
            <MenuItem onClick={() => {
              window.open('https://dashboard.stripe.com', '_blank');
              setShowUserMenu(false);
            }}>
              <CheckCircleOutlined />
              Stripe Dashboard
            </MenuItem>
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

      <Content>
        <Outlet />
      </Content>

      <MobileTabBar>
        {navItems.map(({ label, icon: Icon, path, isNew }) => (
          <MobileTab key={path} to={path} $active={location.pathname === path}>
            <Icon />
            {label}
            {isNew && <MobileNewBadge>New</MobileNewBadge>}
          </MobileTab>
        ))}
      </MobileTabBar>
    </LayoutContainer>
  );
};

export default CreatorDashboardLayout;
