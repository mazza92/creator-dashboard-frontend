import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from '../contexts/SecurityContext';
import { apiClient } from '../utils/api';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const DashboardContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatTitle = styled.h3`
  color: #666;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  text-transform: uppercase;
`;

const StatValue = styled.div`
  color: #333;
  font-size: 2rem;
  font-weight: bold;
`;

const ContentSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin: 0 0 1rem 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  border-bottom: 2px solid #ddd;
  color: #666;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
  color: #333;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #0056b3;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  padding: 1rem;
  background: #f8d7da;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSecurity();
  const [stats, setStats] = useState({
    totalContent: 0,
    totalViews: 0,
    totalRevenue: 0,
    activeSubscribers: 0,
  });
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard stats
        const statsResponse = await apiClient.get('/dashboard/stats');
        setStats(statsResponse.data);

        // Fetch recent content
        const contentResponse = await apiClient.get('/dashboard/recent-content');
        setRecentContent(contentResponse.data);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingSpinner>Loading dashboard data...</LoadingSpinner>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <Title>Welcome back, {user?.name}</Title>
        <Button onClick={() => navigate('/profile')}>View Profile</Button>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <StatsGrid>
        <StatCard
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <StatTitle>Total Content</StatTitle>
          <StatValue>{stats.totalContent}</StatValue>
        </StatCard>

        <StatCard
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatTitle>Total Views</StatTitle>
          <StatValue>{stats.totalViews.toLocaleString()}</StatValue>
        </StatCard>

        <StatCard
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatTitle>Total Revenue</StatTitle>
          <StatValue>${stats.totalRevenue.toLocaleString()}</StatValue>
        </StatCard>

        <StatCard
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <StatTitle>Active Subscribers</StatTitle>
          <StatValue>{stats.activeSubscribers}</StatValue>
        </StatCard>
      </StatsGrid>

      <ContentSection>
        <SectionTitle>Recent Content</SectionTitle>
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Type</Th>
              <Th>Views</Th>
              <Th>Created</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {recentContent.map((content) => (
              <tr key={content.id}>
                <Td>{content.title}</Td>
                <Td>{content.type}</Td>
                <Td>{content.views.toLocaleString()}</Td>
                <Td>{new Date(content.createdAt).toLocaleDateString()}</Td>
                <Td>{content.status}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ContentSection>
    </DashboardContainer>
  );
};

export default Dashboard; 