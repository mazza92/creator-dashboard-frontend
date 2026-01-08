import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Avatar, Dropdown, Menu, message, Grid, Badge, Typography, Button, Layout } from 'antd';
import {
  UserOutlined,
  // eslint-disable-next-line no-unused-vars
  LogoutOutlined,
  MenuOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  // eslint-disable-next-line no-unused-vars
  BellOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { Drawer, Breadcrumb } from 'antd';
import { motion } from 'framer-motion';
import { useNotification } from '../contexts/NotificationContext';
import styled from 'styled-components';
// eslint-disable-next-line no-unused-vars
import { FaUsers, FaChartLine, FaHandshake } from 'react-icons/fa';
import { 
  RiDashboardLine, 
  RiTeamLine, 
  RiCalendarCheckLine,
  RiUserSettingsLine,
  RiLogoutBoxLine,
  RiNotification3Line
} from 'react-icons/ri';
import { FaGift } from 'react-icons/fa';
// eslint-disable-next-line no-unused-vars
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../config/api';

const { useBreakpoint } = Grid;
// eslint-disable-next-line no-unused-vars
const { Text } = Typography;
const { Header, Sider, Content, Footer } = Layout;

const API_URL = process.env.REACT_APP_BACKEND_URL;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: #f8fafc;
`;

const LogoImage = styled.img`
  height: 128px;
  width: auto;
  object-fit: contain;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const LogoContainer = styled.div`
  height: 160px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 8px;
  background: transparent;
`;

const StyledSider = styled(Sider)`
  background: transparent;
  box-shadow: none;
  z-index: 10;

  .logo {
    height: 64px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 8px;
    background: transparent;
  }

  .ant-menu {
    border-right: none;
    padding: 16px;
    background: transparent;
  }

  .ant-menu-item {
    height: 52px;
    line-height: 52px;
    margin: 8px 0;
    border-radius: 12px;
    transition: all 0.3s ease;
    background: transparent;
    font-weight: 500;
    font-size: 15px;

    &:hover {
      background: #f1f5f9;
      transform: translateX(4px);
    }

    &.ant-menu-item-selected {
      background: linear-gradient(135deg, #26A69A, #4DB6AC);
      color: #fff;
      box-shadow: 0 4px 12px rgba(38, 166, 154, 0.2);

      a {
        color: #fff;
      }

      .anticon {
        color: #fff;
      }
    }

    .anticon {
      font-size: 20px;
      margin-right: 12px;
      transition: transform 0.3s ease;
    }

    &:hover .anticon {
      transform: scale(1.1);
    }
  }

  .ant-layout-sider-children {
    background: transparent;
  }

  .ant-layout-sider-trigger {
    background: transparent;
    border-top: 1px solid #f1f5f9;
    color: rgb(114, 123, 136);
    transition: all 0.3s ease;
    height: 48px;
    line-height: 48px;

    &:hover {
      background: #f1f5f9;
      color: #26A69A;
    }
  }
`;

const StyledHeader = styled(Header)`
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 9;
  height: 64px;
`;

const StyledContent = styled(Content)`
  margin: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 112px);
`;

const StyledFooter = styled(Footer)`
  text-align: center;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  padding: 16px;
`;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-header {
    padding: 16px;
    border-bottom: 1px solid #f1f5f9;
  }

  .ant-drawer-body {
    padding: 0;
  }

  .logo {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;

    img {
      height: 32px;
      object-fit: contain;
    }
  }
`;

const StyledBreadcrumb = styled(Breadcrumb)`
  .ant-breadcrumb-link {
    color: #64748b;
    font-size: 14px;
    transition: color 0.2s ease;

    &:hover {
      color: #26A69A;
    }

    a {
      color: inherit;
    }
  }

  .ant-breadcrumb-separator {
    color: #94a3b8;
  }
`;

const MenuToggleButton = styled(Button)`
  border: none;
  padding: 0;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
  }

  .anticon {
    font-size: 20px;
    color: #1e293b;
  }
`;

const ProfileDropdownButton = styled(Button)`
  border: none;
  padding: 0;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: transparent;

  &:hover {
    background: #f1f5f9;
  }

  .ant-avatar {
    border: 2px solid #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

const BackButton = styled(Button)`
  border: 1px solid #e2e8f0;
  color: #64748b;
  height: 40px;
  padding: 0 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #26A69A;
    color: #26A69A;
  }

  .anticon {
    font-size: 16px;
  }
`;

const NotificationButton = styled(Button)`
  border: none;
  padding: 0;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: transparent;

  &:hover {
    background: #f1f5f9;
  }

  .anticon {
    font-size: 20px;
    color: rgb(114, 123, 136);
  }
`;

const NotificationItem = styled(Menu.Item)`
  padding: 12px 16px !important;
  height: auto !important;
  line-height: 1.5 !important;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8fafc !important;
  }

  .notification-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .notification-title {
    font-weight: 600;
    color: #1e293b;
  }

  .notification-message {
    color: #64748b;
    font-size: 13px;
  }

  .notification-time {
    color: #94a3b8;
    font-size: 12px;
  }

  .mark-read-button {
    padding: 4px 8px;
    height: auto;
    font-size: 12px;
    border-radius: 4px;
    color: #26A69A;
    border-color: #26A69A;

    &:hover {
      background: #f0fdfa;
    }
  }
`;

function DashboardLayout() {
  // eslint-disable-next-line no-unused-vars
  const { user } = useContext(UserContext);
  const { notifications, unreadCount, cleanupSocket, markAsRead } = useNotification();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [brandName, setBrandName] = useState(null);
  const [userData, setUserData] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loadingBrand, setLoadingBrand] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const screens = useBreakpoint();

  useEffect(() => {
    async function fetchUserData() {
      try {
        console.log(`🟢 Fetching session from: ${API_URL}/api/session`, {
          cookies: document.cookie
        });
        let sessionData = {};
        try {
          const sessionResponse = await api.get(`${API_URL}/api/session`, {
            withCredentials: true,
          });
          console.log('📌 Session response:', sessionResponse.data);
          sessionData = sessionResponse.data.session_contents || sessionResponse.data;
        } catch (sessionError) {
          console.warn('🔥 Failed to fetch session:', {
            message: sessionError.message,
            response: sessionError.response?.data,
            status: sessionError.response?.status,
            headers: sessionError.response?.headers,
            cookies: document.cookie,
          });
        }
  
        console.log(`🟢 Fetching profile from: ${API_URL}/profile`, {
          cookies: document.cookie
        });
        const profileResponse = await api.get(`${API_URL}/profile`, {
          withCredentials: true,
        });
        console.log('📌 Profile response:', profileResponse.data);
        const data = profileResponse.data;
        if (!data) {
          console.warn('🔥 No profile data returned');
          throw new Error('Unauthorized - Redirecting to Login');
        }
  
        data.brand_id = sessionData.brand_id || data.brand_id || data.id;
        data.image_profile = data.image_profile || data.avatar_url || null;
        setUserData(data);
  
        const user_id = data.user_id || data.id;
        const user_role = data.user_role || data.role;
        if (user_id && user_role === 'brand') {
          try {
            // initializeSocket(user_id, 'brand'); // This line is removed as per the edit hint
          } catch (wsError) {
            console.warn('🔥 WebSocket initialization failed:', wsError);
          }
        }
      } catch (error) {
        console.error('🔥 Error fetching profile data:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
          cookies: document.cookie,
        });
        message.error('Failed to load profile. Please log in again.');
        localStorage.removeItem('userRole');
        window.location.href = '/login'; // Full redirect
      }
    }
  
    fetchUserData();
  
    return () => {
      cleanupSocket();
    };
  }, [navigate, cleanupSocket]);

  useEffect(() => {
    if (location.pathname.includes('/brand/profile/') && id) {
      const fetchBrandName = async () => {
        setLoadingBrand(true);
        try {
          console.log(`🟢 Fetching brand name from: ${API_URL}/brands/${id}`);
          const response = await api.get(`${API_URL}/brands/${id}`, {
            withCredentials: true,
          });
          console.log('📌 Brand name response:', response.data);
          setBrandName(response.data?.name || 'Unknown Brand');
          if (response.data?.image_profile || response.data?.avatar_url) {
            setUserData(prev => ({
              ...prev,
              image_profile: response.data.image_profile || response.data.avatar_url,
            }));
          }
        } catch (error) {
          console.error('🔥 Error fetching brand name:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
          setBrandName('Unknown Brand');
        } finally {
          setLoadingBrand(false);
        }
      };
      fetchBrandName();
    } else {
      setBrandName(null);
    }
  }, [location, id]);

  const handleLogout = async () => {
    try {
      cleanupSocket();
      console.log(`🟢 Logging out at: ${API_URL}/logout`);
      const response = await api.post(`${API_URL}/logout`, {}, {
        withCredentials: true,
      });
      console.log('📌 Logout response:', response.data);
      if (response.status === 200) {
        message.success('Logged out successfully!');
        navigate('/login');
      } else {
        message.error('Failed to log out. Please try again.');
      }
    } catch (error) {
      console.error('🔥 Logout error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      message.error('An error occurred during logout.');
    }
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/brand/dashboard/overview')) return '/brand/dashboard-overview';
    if (path.includes('/brand/dashboard/marketplace')) return '/brand/dashboard/marketplace';
    if (path.includes('/brand/dashboard/bookings')) return '/brand/dashboard/bookings';
    if (path.includes('/brand/dashboard/pr-offers')) return '/brand/dashboard/pr-offers';
    return '/brand/dashboard-overview';
  };

  const generateBreadcrumbs = () => {
    const pathSnippets = location.pathname.split('/').filter((segment) => segment && segment !== 'brand');
    const breadcrumbItems = [
      {
        key: '/brand/dashboard/overview',
        title: <Link to='/brand/dashboard/overview'>Dashboard</Link>,
      },
    ];

    let currentPath = '/brand';
    for (let i = 0; i < pathSnippets.length; i++) {
      const snippet = pathSnippets[i];
      currentPath += `/${snippet}`;

      if (snippet === 'dashboard' && i === 0) continue;

      const isProfile = snippet === 'profile' && id;
      let displayName;

      if (isProfile) {
        displayName = brandName || 'Brand Profile';
      } else {
        displayName = snippet
          .replace(/-/g, ' ')
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        if (snippet === 'marketplace') displayName = 'Marketplace';
        if (snippet === 'bookings') displayName = 'Bookings';
        if (snippet === 'pr-offers') displayName = 'PR Offers';
      }

      breadcrumbItems.push({
        key: currentPath,
        title: isProfile ? displayName : <Link to={currentPath}>{displayName}</Link>,
      });
    }

    return <StyledBreadcrumb items={breadcrumbItems} />;
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.data?.action_url) {
      navigate(notification.data.action_url);
    } else {
      // Fallback to existing routing logic
      const { event_type, data } = notification;
      let route = '/brand/dashboard/bookings';

      if (event_type === 'NEW_BOOKING' || event_type === 'BOOKING_STEP_UPDATE' || event_type === 'NEW_MESSAGE') {
        route = data?.booking_id ? `/brand/dashboard/bookings?booking_id=${data.booking_id}` : '/brand/dashboard/bookings';
      }

      navigate(route);
    }
  };

  const notificationMenu = (
    <Menu style={{ padding: '8px', minWidth: '320px' }}>
      {notifications.length > 0 ? (
        notifications.slice(0, 5).map((notification) => (
          <NotificationItem
            key={`notification-${notification.id}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="notification-content">
              <div className="notification-header">
                <span className="notification-title">
                  {notification.event_type?.replace('_', ' ').toLowerCase() || 'Notification'}
                </span>
                {!notification.is_read && (
                  <Button
                    type="link"
                    className="mark-read-button"
                    icon={<CheckCircleOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                  >
                    Mark as Read
                  </Button>
                )}
              </div>
              <span className="notification-message">
                {notification.event_type === 'NEW_MESSAGE'
                  ? `New message from ${notification.message.split(':')[0].replace('New message from ', '')}`
                  : notification.message}
              </span>
              <span className="notification-time">
                {moment(notification.created_at).fromNow()}
              </span>
            </div>
          </NotificationItem>
        ))
      ) : (
        <Menu.Item key="no-notifications" disabled style={{ textAlign: 'center', color: '#94a3b8' }}>
          No notifications
        </Menu.Item>
      )}
    </Menu>
  );

  const userMenu = (
    <Menu>
      <Menu.Item key='profile' icon={<RiUserSettingsLine style={{ fontSize: '16px' }} />}>
        <Link to={`/brand/profile/${userData?.brand_id || userData?.id || ''}`}>Profile</Link>
      </Menu.Item>
      <Menu.Item key='logout' icon={<RiLogoutBoxLine style={{ fontSize: '16px' }} />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const handleLogoError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/NEWCOLLAB-BRAND.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJuZXdjb2xsYWIvTkVXQ09MTEFCLUJSQU5ELnBuZyIsImlhdCI6MTc0NjgxMzgyNywiZXhwIjoxNzc4MzQ5ODI3fQ.CV154O5M8NHs--l6-0M6a_CIvQuXqDxlkva8MlQf-hY';
  };

  return (
    <StyledLayout>
      {screens.md ? (
        <StyledSider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} width={280}>
          <LogoContainer>
            <LogoImage
              src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/NEWCOLLAB-BRAND.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJuZXdjb2xsYWIvTkVXQ09MTEFCLUJSQU5ELnBuZyIsImlhdCI6MTc0NjgxMzgyNywiZXhwIjoxNzc4MzQ5ODI3fQ.CV154O5M8NHs--l6-0M6a_CIvQuXqDxlkva8MlQf-hY"
              alt="NewCollab Brand Logo"
              onError={handleLogoError}
            />
          </LogoContainer>
          <Menu mode='inline' selectedKeys={[getSelectedKey()]} style={{ padding: '8px' }}>
            <Menu.Item key='/brand/dashboard-overview' icon={<RiDashboardLine style={{ fontSize: '20px' }} />}>
              <Link to='/brand/dashboard/overview'>Overview</Link>
            </Menu.Item>
            <Menu.Item key='/brand/dashboard/marketplace' icon={<RiTeamLine style={{ fontSize: '20px' }} />}>
              <Link to='/brand/dashboard/marketplace'>Marketplace</Link>
            </Menu.Item>
            <Menu.Item key='/brand/dashboard/bookings' icon={<RiCalendarCheckLine style={{ fontSize: '20px' }} />}>
              <Link to='/brand/dashboard/bookings'>Bookings</Link>
            </Menu.Item>
            <Menu.Item key='/brand/dashboard/pr-offers' icon={<FaGift style={{ fontSize: '20px' }} />}>
              <Link to='/brand/dashboard/pr-offers'>PR Offers</Link>
            </Menu.Item>
          </Menu>
        </StyledSider>
      ) : (
        <StyledDrawer
          title={
            <LogoContainer>
              <LogoImage
                src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/NEWCOLLAB-BRAND.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJuZXdjb2xsYWIvTkVXQ09MTEFCLUJSQU5ELnBuZyIsImlhdCI6MTc0NjgxMzgyNywiZXhwIjoxNzc4MzQ5ODI3fQ.CV154O5M8NHs--l6-0M6a_CIvQuXqDxlkva8MlQf-hY"
                alt="NewCollab Brand Logo"
                onError={handleLogoError}
              />
            </LogoContainer>
          }
          placement='left'
          onClose={() => setDrawerVisible(false)}
          visible={drawerVisible}
          bodyStyle={{ padding: '0' }}
        >
          <Menu mode='inline' selectedKeys={[getSelectedKey()]} onClick={() => setDrawerVisible(false)} style={{ padding: '16px' }}>
            <Menu.Item key='/brand/dashboard-overview' icon={<RiDashboardLine style={{ fontSize: '20px' }} />}>
              <Link to='/brand/dashboard/overview'>Overview</Link>
            </Menu.Item>
            <Menu.Item key='/brand/dashboard/marketplace' icon={<RiTeamLine style={{ fontSize: '20px' }} />}>
              <Link to='/brand/dashboard/marketplace'>Marketplace</Link>
            </Menu.Item>
            <Menu.Item key='/brand/dashboard/bookings' icon={<RiCalendarCheckLine style={{ fontSize: '20px' }} />}>
              <Link to='/brand/dashboard/bookings'>Bookings</Link>
            </Menu.Item>
            <Menu.Item key='/brand/dashboard/pr-offers' icon={<FaGift style={{ fontSize: '20px' }} />}>
              <Link to='/brand/dashboard/pr-offers'>PR Offers</Link>
            </Menu.Item>
          </Menu>
        </StyledDrawer>
      )}

      <StyledLayout>
        <StyledHeader>
          {!screens.md && (
            <MenuToggleButton icon={<MenuOutlined />} onClick={() => setDrawerVisible(true)} />
          )}
          <div style={{ flex: 1 }}>{generateBreadcrumbs()}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Dropdown overlay={notificationMenu} placement='bottomRight' trigger={['click']}>
              <Badge count={unreadCount} offset={[-2, 2]} style={{ backgroundColor: '#26A69A' }}>
                <NotificationButton icon={<RiNotification3Line style={{ fontSize: '20px' }} />} />
              </Badge>
            </Dropdown>
            <Dropdown overlay={userMenu} placement='bottomRight' trigger={['click']}>
              <ProfileDropdownButton>
                <Avatar src={userData?.image_profile} icon={!userData?.image_profile ? <UserOutlined /> : null} />
              </ProfileDropdownButton>
            </Dropdown>
          </div>
        </StyledHeader>

        <StyledContent>
          <motion.div
            className='site-layout-background'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {location.pathname.includes('/brand/profile/') && (
              <BackButton
                type='dashed'
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/brand/dashboard/marketplace')}
                style={{ marginBottom: '16px' }}
              >
                Back to Marketplace
              </BackButton>
            )}
            <Outlet />
          </motion.div>
        </StyledContent>

        <StyledFooter>©2025 Brand Dashboard</StyledFooter>
      </StyledLayout>
    </StyledLayout>
  );
}

export default DashboardLayout;