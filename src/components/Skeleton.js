import React from 'react';
import styled, { keyframes } from 'styled-components';

// Modern shimmer animation - matches Notion/Linear loading patterns
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e8e8e8 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite ease-in-out;
  border-radius: ${props => props.$radius || '8px'};
`;

// Basic skeleton shapes
export const SkeletonText = styled(SkeletonBase)`
  height: ${props => props.$height || '16px'};
  width: ${props => props.$width || '100%'};
  margin-bottom: ${props => props.$mb || '8px'};
`;

export const SkeletonCircle = styled(SkeletonBase)`
  width: ${props => props.$size || '40px'};
  height: ${props => props.$size || '40px'};
  border-radius: 50%;
  flex-shrink: 0;
`;

export const SkeletonRect = styled(SkeletonBase)`
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '100px'};
`;

// Card skeleton for dashboard cards
const CardSkeletonWrapper = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

export const CardSkeleton = ({ height = '200px' }) => (
  <CardSkeletonWrapper>
    <SkeletonText $width="40%" $height="24px" $mb="16px" />
    <SkeletonText $width="80%" />
    <SkeletonText $width="60%" />
    <SkeletonRect $height={height} style={{ marginTop: '16px' }} />
  </CardSkeletonWrapper>
);

// Stat card skeleton (for overview pages)
const StatSkeletonWrapper = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

export const StatSkeleton = () => (
  <StatSkeletonWrapper>
    <SkeletonText $width="50%" $height="14px" $mb="8px" />
    <SkeletonText $width="30%" $height="32px" $mb="4px" />
    <SkeletonText $width="40%" $height="12px" />
  </StatSkeletonWrapper>
);

// Brand card skeleton (for ForYou/Directory)
const BrandCardSkeletonWrapper = styled.div`
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const BrandCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
`;

const BrandCardBody = styled.div`
  padding: 0 16px 16px;
`;

export const BrandCardSkeleton = () => (
  <BrandCardSkeletonWrapper>
    <SkeletonRect $height="120px" $radius="0" />
    <BrandCardHeader>
      <SkeletonCircle $size="48px" />
      <div style={{ flex: 1 }}>
        <SkeletonText $width="60%" $height="18px" $mb="6px" />
        <SkeletonText $width="40%" $height="14px" $mb="0" />
      </div>
    </BrandCardHeader>
    <BrandCardBody>
      <SkeletonText $width="90%" />
      <SkeletonText $width="70%" $mb="12px" />
      <div style={{ display: 'flex', gap: '8px' }}>
        <SkeletonText $width="60px" $height="24px" $radius="12px" $mb="0" />
        <SkeletonText $width="80px" $height="24px" $radius="12px" $mb="0" />
      </div>
    </BrandCardBody>
  </BrandCardSkeletonWrapper>
);

// Table row skeleton
const TableRowWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
`;

export const TableRowSkeleton = ({ columns = 4 }) => (
  <TableRowWrapper>
    {Array.from({ length: columns }).map((_, i) => (
      <SkeletonText
        key={i}
        $width={i === 0 ? '200px' : '100px'}
        $mb="0"
      />
    ))}
  </TableRowWrapper>
);

// ForYou page skeleton - shows layout immediately
const ForYouSkeletonWrapper = styled.div`
  padding: 24px;
  max-width: 1440px;
  margin: 0 auto;

  @media (max-width: 600px) {
    padding: 10px 8px;
  }
`;

const ForYouHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ForYouTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
`;

const BrandGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const ForYouSkeleton = () => (
  <ForYouSkeletonWrapper>
    <ForYouHeader>
      <SkeletonText $width="180px" $height="32px" $mb="0" />
      <SkeletonText $width="100px" $height="36px" $radius="18px" $mb="0" />
    </ForYouHeader>

    {/* Manager bar skeleton */}
    <SkeletonRect $height="60px" $radius="12px" style={{ marginBottom: '24px' }} />

    {/* Tabs */}
    <ForYouTabs>
      <SkeletonText $width="80px" $height="36px" $radius="8px" $mb="0" />
      <SkeletonText $width="100px" $height="36px" $radius="8px" $mb="0" />
    </ForYouTabs>

    {/* Brand cards grid */}
    <BrandGrid>
      {Array.from({ length: 6 }).map((_, i) => (
        <BrandCardSkeleton key={i} />
      ))}
    </BrandGrid>
  </ForYouSkeletonWrapper>
);

// Dashboard overview skeleton
const OverviewSkeletonWrapper = styled.div`
  padding: 24px;
  max-width: 1440px;
  margin: 0 auto;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

export const DashboardOverviewSkeleton = () => (
  <OverviewSkeletonWrapper>
    <SkeletonText $width="200px" $height="28px" $mb="24px" />

    <StatsGrid>
      {Array.from({ length: 4 }).map((_, i) => (
        <StatSkeleton key={i} />
      ))}
    </StatsGrid>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <CardSkeleton height="300px" />
      <CardSkeleton height="300px" />
    </div>
  </OverviewSkeletonWrapper>
);

// List item skeleton with avatar
const ListItemWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 8px;
`;

export const ListItemSkeleton = () => (
  <ListItemWrapper>
    <SkeletonCircle $size="40px" />
    <div style={{ flex: 1 }}>
      <SkeletonText $width="60%" $height="16px" $mb="4px" />
      <SkeletonText $width="40%" $height="12px" $mb="0" />
    </div>
    <SkeletonText $width="80px" $height="32px" $radius="6px" $mb="0" />
  </ListItemWrapper>
);

// Profile skeleton
const ProfileSkeletonWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
`;

export const ProfileSkeleton = () => (
  <ProfileSkeletonWrapper>
    <ProfileHeader>
      <SkeletonCircle $size="100px" />
      <div style={{ flex: 1 }}>
        <SkeletonText $width="200px" $height="28px" $mb="8px" />
        <SkeletonText $width="150px" $height="16px" $mb="4px" />
        <SkeletonText $width="180px" $height="14px" />
      </div>
    </ProfileHeader>
    <CardSkeleton height="200px" />
  </ProfileSkeletonWrapper>
);

export default {
  SkeletonText,
  SkeletonCircle,
  SkeletonRect,
  CardSkeleton,
  StatSkeleton,
  BrandCardSkeleton,
  TableRowSkeleton,
  ForYouSkeleton,
  DashboardOverviewSkeleton,
  ListItemSkeleton,
  ProfileSkeleton,
};
