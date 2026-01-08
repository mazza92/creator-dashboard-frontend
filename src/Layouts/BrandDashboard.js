import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Button } from 'antd';
import axios from 'axios';
import CreatorSpotlight from './CreatorSpotlight'; // Reuse your spotlight component
import './BrandDashboard.css'; // Add any necessary styling

function BrandDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [metrics, setMetrics] = useState({
    campaignsPublished: 0,
    creatorApplications: 0,
    creatorsBooked: 0,
  });

  useEffect(() => {
    // Fetch active campaigns
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get('http://localhost:5000/campaigns');
        setCampaigns(response.data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    // Fetch metrics
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/brand-metrics');
        setMetrics(response.data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchCampaigns();
    fetchMetrics();
  }, []);

  const columns = [
    {
      title: 'Campaign Name',
      dataIndex: 'campaign_name',
      key: 'campaign_name',
    },
    {
      title: 'Date Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
    },
    {
      title: 'Creator Requests',
      dataIndex: 'number_of_requests',
      key: 'number_of_requests',
    },
  ];

  return (
    <div className="brand-dashboard">
      <h1>Brand</h1>

      {/* Section 1: Creator Spotlight */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Creator Spotlight">
            <CreatorSpotlight />
          </Card>
        </Col>
      </Row>

      {/* Section 2: Active Campaigns */}
      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={24}>
          <Card title="Active Campaigns">
            <Table
              columns={columns}
              dataSource={campaigns.slice(0, 4)} // Show a preview of 4 campaigns
              rowKey="id"
              pagination={false} // Disable pagination for the preview
            />
            <Button type="primary" style={{ marginTop: '10px' }}>
              View All Campaigns
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Section 3: Analytics Insights */}
      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Campaigns Published"
              value={metrics.campaignsPublished}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Creator Applications"
              value={metrics.creatorApplications}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Creators Booked"
              value={metrics.creatorsBooked}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default BrandDashboard;
