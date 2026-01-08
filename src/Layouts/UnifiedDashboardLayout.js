import React, { useContext } from 'react';
import { Layout, Menu, Breadcrumb, Avatar, Dropdown, Space, message } from 'antd';
import { UserOutlined, LogoutOutlined, AppstoreOutlined, SearchOutlined, PlusCircleOutlined, TagOutlined, NotificationOutlined } from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import './UnifiedDashboardLayout.css'; // Ensure this includes responsive styles

const { Header, Content, Footer, Sider } = Layout;

const UnifiedDashboardLayout = () => {
    const user = useContext(UserContext); // Get user role
    const navigate = useNavigate();
    const location = useLocation();

    // Menu items based on user role
    const menuItems = user.role === 'brand'
        ? [
              { key: '/brand/dashboard/overview', icon: <AppstoreOutlined />, label: 'Overview', path: '/brand/dashboard/overview' },
              { key: '/brand/dashboard/marketplace', icon: <SearchOutlined />, label: 'Marketplace', path: '/brand/dashboard/marketplace' },
              { key: '/brand/dashboard/campaigns', icon: <NotificationOutlined />, label: 'Campaigns', path: '/brand/dashboard/campaigns' },
              { key: '/brand/dashboard/collaboration-requests', icon: <PlusCircleOutlined />, label: 'Collaboration Requests', path: '/brand/dashboard/collaboration-requests' },
          ]
        : [
              { key: '/creator/dashboard/overview', icon: <AppstoreOutlined />, label: 'Overview', path: '/creator/dashboard/overview' },
              { key: '/creator/dashboard/marketplace', icon: <SearchOutlined />, label: 'Marketplace', path: '/creator/dashboard/marketplace' },
              { key: '/creator/dashboard/manage-requests', icon: <PlusCircleOutlined />, label: 'Manage Requests', path: '/creator/dashboard/manage-requests' },
              { key: '/creator/dashboard/my-offers', icon: <TagOutlined />, label: 'My Offers', path: '/creator/dashboard/my-offers' },
          ];

    // Breadcrumb generator
    const generateBreadcrumbs = () => {
        const pathParts = location.pathname.split('/').filter((part) => part);
        return pathParts.map((part, index) => {
            const breadcrumbPath = `/${pathParts.slice(0, index + 1).join('/')}`;
            return {
                label: part.replace(/-/g, ' ').toUpperCase(),
                path: breadcrumbPath,
            };
        });
    };

    const breadcrumbs = generateBreadcrumbs();

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/logout', { method: 'POST', credentials: 'include' });
            if (response.ok) {
                message.success('Logged out successfully!');
                navigate('/login');
            } else {
                message.error('Failed to log out. Please try again.');
            }
        } catch (error) {
            message.error('An error occurred during logout.');
        }
    };

    const userMenu = (
        <Menu>
            <Menu.Item key="1" icon={<UserOutlined />}>
                <Link to="/profile">Profile</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sider breakpoint="lg" collapsedWidth="0" width={250}>
                <div className="logo">
                    <h2>{user.role === 'brand' ? 'Brand Dashboard' : 'Creator Portal'}</h2>
                </div>
                <Menu theme="light" mode="inline" selectedKeys={[location.pathname]}>
                    {menuItems.map((item) => (
                        <Menu.Item key={item.key} icon={item.icon}>
                            <Link to={item.path}>{item.label}</Link>
                        </Menu.Item>
                    ))}
                </Menu>
            </Sider>

            {/* Layout Content */}
            <Layout>
                {/* Header */}
                <Header className="site-layout-sub-header-background" style={{ padding: '0 16px' }}>
                    <div className="header-content">
                        <Breadcrumb>
                            {breadcrumbs.map((breadcrumb, index) => (
                                <Breadcrumb.Item key={index}>
                                    <Link to={breadcrumb.path}>{breadcrumb.label}</Link>
                                </Breadcrumb.Item>
                            ))}
                        </Breadcrumb>
                        <div className="header-right">
                            <Space>
                                <Dropdown overlay={userMenu} placement="bottomRight">
                                    <Avatar src={user.image_profile} icon={!user.image_profile ? <UserOutlined /> : null} />
                                </Dropdown>
                            </Space>
                        </div>
                    </div>
                </Header>

                {/* Main Content */}
                <Content style={{ margin: '24px 16px 0' }}>
                    <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                        <Outlet /> {/* Renders the child route */}
                    </div>
                </Content>

                {/* Footer */}
                <Footer style={{ textAlign: 'center' }}>©2024 Dashboard</Footer>
            </Layout>
        </Layout>
    );
};

export default UnifiedDashboardLayout;
