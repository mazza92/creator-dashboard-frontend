import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { creatorHomePath } from '../utils/creatorApproval';

/**
 * Creator `/` and `/dashboard` index redirect.
 * Pending/rejected → waitlist; otherwise Polly (For You home).
 */
export default function CreatorHomeRedirect() {
  const { user } = useContext(UserContext);
  return <Navigate to={creatorHomePath(user)} replace />;
}
