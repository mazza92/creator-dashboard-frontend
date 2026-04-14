/**
 * Email Template Preview Component
 *
 * Provides a live preview of email templates with device frame options
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Select, Input, Space, Tooltip, message } from 'antd';
import {
  DesktopOutlined, MobileOutlined, TabletOutlined,
  CopyOutlined, DownloadOutlined, EyeOutlined
} from '@ant-design/icons';
import { generateWeeklyBrandRoundup, sampleBrands } from './WeeklyBrandRoundup';

const { TextArea } = Input;

const EmailTemplatePreview = ({
  templateType = 'brand_roundup',
  brands = sampleBrands,
  firstName = 'Creator',
  onUseTemplate
}) => {
  const [viewMode, setViewMode] = useState('desktop');
  const [previewHTML, setPreviewHTML] = useState('');
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    generatePreview();
  }, [templateType, brands, firstName]);

  const generatePreview = () => {
    let html = '';

    switch (templateType) {
      case 'brand_roundup':
        html = generateWeeklyBrandRoundup({
          firstName,
          brands: brands.slice(0, 5), // Limit to 5 brands for preview
          weekDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          totalNewBrands: brands.length
        });
        break;
      default:
        html = generateWeeklyBrandRoundup({
          firstName,
          brands: sampleBrands,
          weekDate: 'April 14, 2026',
          totalNewBrands: 23
        });
    }

    setPreviewHTML(html);
  };

  const getFrameWidth = () => {
    switch (viewMode) {
      case 'mobile': return 375;
      case 'tablet': return 768;
      default: return 650;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(previewHTML);
    message.success('HTML copied to clipboard!');
  };

  const downloadHTML = () => {
    const blob = new Blob([previewHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-template-${templateType}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('Template downloaded!');
  };

  const openInNewTab = () => {
    const blob = new Blob([previewHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <Container>
      {/* Toolbar */}
      <Toolbar>
        <Space>
          <ViewModeButton
            active={viewMode === 'desktop'}
            onClick={() => setViewMode('desktop')}
          >
            <DesktopOutlined /> Desktop
          </ViewModeButton>
          <ViewModeButton
            active={viewMode === 'tablet'}
            onClick={() => setViewMode('tablet')}
          >
            <TabletOutlined /> Tablet
          </ViewModeButton>
          <ViewModeButton
            active={viewMode === 'mobile'}
            onClick={() => setViewMode('mobile')}
          >
            <MobileOutlined /> Mobile
          </ViewModeButton>
        </Space>

        <Space>
          <Tooltip title="Open in new tab">
            <Button icon={<EyeOutlined />} onClick={openInNewTab}>
              Preview
            </Button>
          </Tooltip>
          <Tooltip title="Copy HTML">
            <Button icon={<CopyOutlined />} onClick={copyToClipboard}>
              Copy
            </Button>
          </Tooltip>
          <Tooltip title="Download HTML">
            <Button icon={<DownloadOutlined />} onClick={downloadHTML}>
              Download
            </Button>
          </Tooltip>
          {onUseTemplate && (
            <Button type="primary" onClick={() => onUseTemplate(previewHTML)}>
              Use Template
            </Button>
          )}
        </Space>
      </Toolbar>

      {/* Toggle Code View */}
      <CodeToggle>
        <Button
          type={showCode ? 'primary' : 'default'}
          size="small"
          onClick={() => setShowCode(!showCode)}
        >
          {showCode ? 'Hide Code' : 'Show Code'}
        </Button>
      </CodeToggle>

      {/* Preview Frame */}
      {!showCode ? (
        <PreviewFrame viewMode={viewMode}>
          <DeviceFrame width={getFrameWidth()} viewMode={viewMode}>
            {viewMode === 'mobile' && <DeviceNotch />}
            <IframeContainer>
              <iframe
                srcDoc={previewHTML}
                title="Email Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  background: '#f3f4f6'
                }}
              />
            </IframeContainer>
          </DeviceFrame>
        </PreviewFrame>
      ) : (
        <CodeView>
          <TextArea
            value={previewHTML}
            readOnly
            rows={20}
            style={{ fontFamily: 'monospace', fontSize: 12 }}
          />
        </CodeView>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  background: #1a1a2e;
  border-radius: 12px;
  overflow: hidden;
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #16213e;
  border-bottom: 1px solid #0f3460;
`;

const ViewModeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? '#fff' : '#94a3b8'};

  &:hover {
    background: ${props => props.active ? '#667eea' : '#1e3a5f'};
    color: #fff;
  }
`;

const CodeToggle = styled.div`
  padding: 12px 20px;
  background: #16213e;
  border-bottom: 1px solid #0f3460;
`;

const PreviewFrame = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  min-height: 600px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  overflow: auto;
`;

const DeviceFrame = styled.div`
  width: ${props => props.width}px;
  max-width: 100%;
  background: ${props => props.viewMode === 'mobile' ? '#1c1c1e' : '#fff'};
  border-radius: ${props => props.viewMode === 'mobile' ? '40px' : '12px'};
  padding: ${props => props.viewMode === 'mobile' ? '12px' : '0'};
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  transition: width 0.3s ease;
`;

const DeviceNotch = styled.div`
  width: 120px;
  height: 28px;
  background: #1c1c1e;
  border-radius: 0 0 14px 14px;
  margin: 0 auto 8px auto;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: #333;
    border-radius: 2px;
  }
`;

const IframeContainer = styled.div`
  width: 100%;
  height: 700px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
`;

const CodeView = styled.div`
  padding: 20px;
  background: #0d1117;

  textarea {
    background: #161b22 !important;
    color: #c9d1d9 !important;
    border: 1px solid #30363d !important;
    border-radius: 8px !important;
  }
`;

export default EmailTemplatePreview;
