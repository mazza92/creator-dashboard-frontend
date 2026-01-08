import React, { useState, useContext, useEffect, useRef } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Avatar, message } from 'antd';
import { UserOutlined, LogoutOutlined, CheckCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNotification } from '../contexts/NotificationContext';
import styled from 'styled-components';
import { RiSearchLine, RiListCheck2, RiNotification3Line } from 'react-icons/ri';
import api from '../config/api';

// Brand colors
const primaryBlue = '#3B82F6';
const brightMagenta = '#EC4899';

// Minimalist Layout Container
const LayoutContainer = styled.div`
  min-height: 100vh;
  background: #FAFAFA;
  display: flex;
  flex-direction: column;
`;

// Clean Top Navigation Bar
const TopNav = styled.nav`
  background: white;
  border-bottom: 1px solid #E5E7EB;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;

  @media (max-width: 768px) {
    padding: 14px 16px;
    gap: 16px;
  }
`;

const LogoSection = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;

  img {
    height: 120px;
    width: auto;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    img {
      height: 100px;
    }
  }
`;

// Desktop Tab Navigation
const DesktopTabNavigation = styled.nav`
  display: flex;
  gap: 12px;
  flex: 0 0 auto;
  justify-content: flex-start;

  @media (max-width: 768px) {
    display: none;
  }
`;

// Mobile Bottom Tab Navigation
const MobileTabNavigation = styled.nav`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid #E5E7EB;
    padding: 8px 16px;
    gap: 12px;
    z-index: 1000;
    justify-content: space-around;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const TabButton = styled(Link)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  text-decoration: none;
  color: #6B7280;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;

  svg {
    font-size: 20px;
  }

  ${props => props.$active && `
    background: linear-gradient(135deg, ${primaryBlue}10, ${brightMagenta}10);
    color: ${primaryBlue};
  `}

  &:hover {
    background: #F3F4F6;
    color: #111827;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 10px 8px;
    font-size: 11px;
    flex: 1;
    gap: 4px;

    svg {
      font-size: 22px;
    }
  }
`;

// Right Section with Actions
const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

const NotificationButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #F9FAFB;
  color: #6B7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;

  &:hover {
    background: #F3F4F6;
    color: #111827;
  }

  svg {
    font-size: 20px;
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

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  border-radius: 20px;
  border: none;
  background: #F9FAFB;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #F3F4F6;
  }

  .ant-avatar {
    border: 2px solid white;
  }

  @media (max-width: 768px) {
    padding: 6px;
  }
`;

const UserName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #111827;

  @media (max-width: 768px) {
    display: none;
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

// Main Content Area
const ContentArea = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 80px;

  @media (min-width: 769px) {
    padding-bottom: 20px;
  }
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

const CreatorDashboardLayout = () => {
  const { user, handleLogout } = useContext(UserContext);
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

  const isActive = (path) => location.pathname.includes(path);

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
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <div style={{ fontSize: '16px', color: '#6B7280' }}>Loading...</div>
          </div>
        </div>
      </LayoutContainer>
    );
  }

  return (
    <LayoutContainer>
      {/* Top Navigation Bar */}
      <TopNav>
        <NavContent>
          {/* Logo */}
          <LogoSection to="/creator/dashboard/pr-brands">
            <img
              src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/NEWCOLLAB-BRAND_logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvTkVXQ09MTEFCLUJSQU5EX2xvZ28ucG5nIiwiaWF0IjoxNzY3NzE0MzUxLCJleHAiOjE3OTkyNTAzNTF9.WnVNtcKOODxOstVADE8Y6zlxbNovPbl3K97FZow5lR0"
              alt="NewCollab"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/NEWCOLLAB-BRAND_logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvTkVXQ09MTEFCLUJSQU5EX2xvZ28ucG5nIiwiaWF0IjoxNzY3NzE0MzUxLCJleHAiOjE3OTkyNTAzNTF9.WnVNtcKOODxOstVADE8Y6zlxbNovPbl3K97FZow5lR0';
              }}
            />
          </LogoSection>

          {/* Desktop Tab Navigation */}
          <DesktopTabNavigation>
            <TabButton to="/creator/dashboard/pr-brands" $active={isActive('/pr-brands')}>
              <RiSearchLine />
              <span>Discover</span>
            </TabButton>
            <TabButton to="/creator/dashboard/pr-pipeline" $active={isActive('/pr-pipeline')}>
              <RiListCheck2 />
              <span>Pipeline</span>
            </TabButton>
          </DesktopTabNavigation>

          {/* Right Actions */}
          <NavActions>
            {/* Notifications */}
            <NotificationButton onClick={() => setShowNotifications(!showNotifications)}>
              <RiNotification3Line />
              {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
            </NotificationButton>

            {/* User Menu */}
            <UserButton onClick={() => setShowUserMenu(!showUserMenu)}>
              <Avatar
                size={32}
                icon={<UserOutlined />}
                src={userData?.image_profile}
                style={{ background: primaryBlue }}
              />
              <UserName>{userData?.name || 'Creator'}</UserName>
            </UserButton>
          </NavActions>

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
        </NavContent>
      </TopNav>

      {/* Mobile Bottom Navigation */}
      <MobileTabNavigation>
        <TabButton to="/creator/dashboard/pr-brands" $active={isActive('/pr-brands')}>
          <RiSearchLine />
          <span>Discover</span>
        </TabButton>
        <TabButton to="/creator/dashboard/pr-pipeline" $active={isActive('/pr-pipeline')}>
          <RiListCheck2 />
          <span>Pipeline</span>
        </TabButton>
      </MobileTabNavigation>

      {/* Main Content */}
      <ContentArea>
        <Outlet />
      </ContentArea>
    </LayoutContainer>
  );
};

export default CreatorDashboardLayout;
