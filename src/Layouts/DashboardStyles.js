import styled from 'styled-components';
import { Layout, Menu, Button, Drawer, Breadcrumb } from 'antd';

const { Header, Sider, Content, Footer } = Layout;

export const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: #f4f7fa;
`;

export const StyledSider = styled(Sider)`
  background: linear-gradient(180deg, #26A69A 0%, #4DB6AC 100%);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
  }
  .logo {
    padding: 16px;
    text-align: center;
    img {
      max-width: 100%;
      height: auto;
      transition: max-width 0.3s ease;
      ${props => props.collapsed ? 'max-width: 40px;' : 'max-width: 120px;'}
    }
    @media (max-width: 768px) {
      img {
        max-width: 80px;
      }
    }
  }
  .ant-menu {
    background: transparent;
    border-right: none;
    .ant-menu-item {
      border-radius: 8px;
      margin: 8px 16px;
      padding: 0 16px !important;
      transition: all 0.3s ease;
      color: #e6f7ff;
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        transform: translateX(4px);
      }
      &.ant-menu-item-selected {
        background: #ffffff;
        color: #26A69A;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
      .anticon {
        font-size: 18px;
        margin-right: 12px;
      }
    }
  }
`;

export const StyledHeader = styled(Header)`
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 24px;
  @media (max-width: 768px) {
    justify-content: space-between;
  }
  @media (min-width: 769px) {
    justify-content: space-between;
  }
`;

export const StyledContent = styled(Content)`
  margin: 24px 16px;
  padding: 0;
  .site-layout-background {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    min-height: 360px;
  }
`;

export const StyledFooter = styled(Footer)`
  text-align: center;
  background: #fff;
  border-top: 1px solid #e8ecef;
  color: #757575;
`;

export const StyledDrawer = styled(Drawer)`
  .ant-drawer-header {
    background: linear-gradient(135deg, #26A69A, #4DB6AC);
    color: #fff;
    border-bottom: none;
    .ant-drawer-title {
      color: #fff;
      font-weight: 600;
      display: flex;
      align-items: center;
      img {
        max-width: 80px;
        height: auto;
        margin-right: 8px;
      }
    }
  }
  .ant-drawer-body {
    padding: 0;
    background: #f4f7fa;
  }
  .ant-menu {
    background: #f4f7fa;
    .ant-menu-item {
      border-radius: 8px;
      margin: 8px 16px;
      padding: 0 16px !important;
      transition: all 0.3s ease;
      color: #212121;
      &:hover {
        background: #e6f7ff;
        color: #26A69A;
        transform: translateX(4px);
      }
      &.ant-menu-item-selected {
        background: #26A69A;
        color: #fff;
      }
    }
  }
`;

export const StyledBreadcrumb = styled(Breadcrumb)`
  margin: 16px 0;
  .ant-breadcrumb-link a {
    color: #26A69A;
    &:hover {
      color: #4DB6AC;
      text-decoration: underline;
    }
  }
  .ant-breadcrumb-separator {
    color: #757575;
  }
`;

export const MenuToggleButton = styled(Button)`
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

export const NotificationButton = styled(Button)`
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

export const ProfileDropdownButton = styled(Button)`
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

export const BackButton = styled(Button)`
  border-radius: 8px;
  border-color: #26A69A;
  color: #26A69A;
  &:hover {
    background: #e6f7ff;
    border-color: #4DB6AC;
    color: #4DB6AC;
  }
`;

export const StyledButton = styled(Button)`
  border-radius: 20px;
  padding: 8px 16px;
  background: ${props => props.primary ? 'linear-gradient(135deg, #26A69A, #4DB6AC)' : '#fff'};
  border: ${props => props.primary ? 'none' : '1px solid #d9d9d9'};
  color: ${props => props.primary ? '#fff' : '#595959'};
  &:hover {
    background: ${props => props.primary ? 'linear-gradient(135deg, #4DB6AC, #26A69A)' : '#e6f7ff'};
    color: ${props => props.primary ? '#fff' : '#26A69A'};
    border-color: ${props => props.primary ? 'none' : '#26A69A'};
  }
`;