import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { needsWaitlistGate, WAITLIST_PATH } from '../utils/creatorApproval';

/**
 * Creator `/` and `/dashboard` index redirect.
 * Pending/rejected → waitlist; otherwise For You.
 */
export default function CreatorHomeRedirect() {
  const { user } = useContext(UserContext);
  if (needsWaitlistGate(user?.approval_status)) {
    return <Navigate to={WAITLIST_PATH} replace />;
  }
  return <Navigate to="/creator/dashboard/for-you" replace />;
}
