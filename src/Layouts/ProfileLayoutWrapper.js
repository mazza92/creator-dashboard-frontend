import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import DashboardLayout from './DashboardLayout';
import CreatorDashboardLayout from './CreatorDashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfileLayoutWrapper = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // No user, render the public page without any layout
    return <Outlet />;
  }

  if (user.role === 'brand') {
    // For brand users, wrap the profile page in the brand dashboard layout
    return (
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    );
  }

  if (user.role === 'creator') {
    // For creator users, wrap the profile page in the creator dashboard layout
    return (
      <CreatorDashboardLayout>
        <Outlet />
      </CreatorDashboardLayout>
    );
  }

  // Fallback for any other case (shouldn't happen)
  return <Outlet />;
};

export default ProfileLayoutWrapper; 