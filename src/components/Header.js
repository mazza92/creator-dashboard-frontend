import React, { useState } from 'react';
import { Menu, Button, Space, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../assets/NEWCOLLAB-BRAND.png';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.img`
  height: 40px;
  width: auto;
`;

const NavMenu = styled(Menu)`
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  
  .ant-menu-item {
    margin: 0 8px;
    font-weight: 500;
    
    &:hover {
      color: #26A69A;
    }
  }
`;

const MobileMenuButton = styled(Button)`
  display: none;
  @media (max-width: 768px) {
    display: block;
  }
`;

const DesktopMenu = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileCTAButton = styled(Link)`
  display: none;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  margin-right: 16px;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
    color: #ffffff;
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const Header = () => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const location = useLocation();

  const menuItems = [
    { key: 'platform', label: 'Platform', path: '/#platform' },
    { key: 'features', label: 'Features', path: '/#features' },
    { key: 'marketplace', label: 'Marketplace', path: '/marketplace' },
    { key: 'pricing', label: 'Pricing', path: '/pricing' },
    { key: 'about', label: 'About', path: '/about' },
    { key: 'blog', label: 'Blog', path: '/blog' },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuVisible(!mobileMenuVisible);
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Link to="/">
          <Logo src={logo} alt="NewCollab" />
        </Link>

        <DesktopMenu>
          <NavMenu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems.map(item => ({
              key: item.key,
              label: <Link to={item.path}>{item.label}</Link>,
            }))}
          />
          <Space>
            <Button type="link" href="/login">
              Log in
            </Button>
            <Button type="primary" href="/register">
              Sign up
            </Button>
          </Space>
        </DesktopMenu>

        <MobileMenuButton
          type="text"
          icon={<MenuOutlined />}
          onClick={toggleMobileMenu}
        />

        <Drawer
          title="Menu"
          placement="right"
          onClose={toggleMobileMenu}
          open={mobileMenuVisible}
        >
          <div style={{ marginBottom: '16px' }}>
            <MobileCTAButton to="/register/creator" style={{ display: 'block', textAlign: 'center', width: '100%' }}>
              Sign up free
            </MobileCTAButton>
          </div>
          <Menu
            mode="vertical"
            selectedKeys={[location.pathname]}
            items={[
              ...menuItems.map(item => ({
                key: item.key,
                label: <Link to={item.path}>{item.label}</Link>,
              })),
              {
                key: 'login',
                label: <Link to="/login">Log in</Link>,
              },
              {
                key: 'register',
                label: <Link to="/register">Sign up</Link>,
              },
            ]}
          />
        </Drawer>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header; 