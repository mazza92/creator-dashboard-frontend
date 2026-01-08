import React, { useState } from 'react';
import { Button, Input, message, Card, Typography, Space } from 'antd';
import { 
  submitUrlToIndexNow, 
  submitKeyPagesToIndexNow,
  submitAllBlogPostsToIndexNow,
  submitLatestBlogPostsToIndexNow
} from '../utils/indexNow';

const { Title, Text } = Typography;

/**
 * IndexNow Test Component
 * For testing IndexNow functionality
 */
const IndexNowTest = () => {
  const [testUrl, setTestUrl] = useState('https://newcollab.co/');
  const [loading, setLoading] = useState(false);

  const handleTestUrl = async () => {
    if (!testUrl) {
      message.error('Please enter a URL to test');
      return;
    }

    setLoading(true);
    try {
      const success = await submitUrlToIndexNow(testUrl);
      if (success) {
        message.success(`Successfully submitted ${testUrl} to IndexNow`);
      } else {
        message.error('Failed to submit URL to IndexNow');
      }
    } catch (error) {
      message.error('Error submitting to IndexNow: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestKeyPages = async () => {
    setLoading(true);
    try {
      const success = await submitKeyPagesToIndexNow();
      if (success) {
        message.success('Successfully submitted key pages to IndexNow');
      } else {
        message.error('Failed to submit key pages to IndexNow');
      }
    } catch (error) {
      message.error('Error submitting key pages to IndexNow: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAllBlogPosts = async () => {
    setLoading(true);
    try {
      const success = await submitAllBlogPostsToIndexNow();
      if (success) {
        message.success('Successfully submitted all blog posts to IndexNow');
      } else {
        message.error('Failed to submit all blog posts to IndexNow');
      }
    } catch (error) {
      message.error('Error submitting all blog posts to IndexNow: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLatestBlogPosts = async () => {
    setLoading(true);
    try {
      const success = await submitLatestBlogPostsToIndexNow(3);
      if (success) {
        message.success('Successfully submitted latest 3 blog posts to IndexNow');
      } else {
        message.error('Failed to submit latest blog posts to IndexNow');
      }
    } catch (error) {
      message.error('Error submitting latest blog posts to IndexNow: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>IndexNow Test</Title>
        <Text type="secondary">
          Test IndexNow functionality for faster search engine indexing
        </Text>
        
        <Space direction="vertical" style={{ width: '100%', marginTop: '20px' }}>
          <div>
            <Text strong>Test Single URL:</Text>
            <Input
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Enter URL to test"
              style={{ marginTop: '8px' }}
            />
            <Button 
              type="primary" 
              onClick={handleTestUrl}
              loading={loading}
              style={{ marginTop: '8px' }}
            >
              Test URL Submission
            </Button>
          </div>

          <div>
            <Text strong>Test Key Pages:</Text>
            <Button 
              onClick={handleTestKeyPages}
              loading={loading}
              style={{ marginTop: '8px' }}
            >
              Submit Key Pages
            </Button>
          </div>

          <div>
            <Text strong>Test All Blog Posts:</Text>
            <Button 
              onClick={handleTestAllBlogPosts}
              loading={loading}
              style={{ marginTop: '8px' }}
            >
              Submit All Blog Posts
            </Button>
          </div>

          <div>
            <Text strong>Test Latest Blog Posts:</Text>
            <Button 
              onClick={handleTestLatestBlogPosts}
              loading={loading}
              style={{ marginTop: '8px' }}
            >
              Submit Latest 3 Posts
            </Button>
          </div>

          <div style={{ marginTop: '20px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
            <Text strong>IndexNow Key:</Text>
            <br />
            <Text code>5b821f1380424d116b8da378e4ca2f143a13f7236d7dd3db58d09cb3e0aeb736</Text>
            <br />
            <Text strong>Key Location:</Text>
            <br />
            <Text code>https://newcollab.co/5b821f1380424d116b8da378e4ca2f143a13f7236d7dd3db58d09cb3e0aeb736.txt</Text>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default IndexNowTest;
