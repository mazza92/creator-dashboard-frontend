import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Creator `/` and `/dashboard` index redirect — always For You.
 * (AI Manager is reached via nav + the For You hireability band.)
 */
export default function CreatorHomeRedirect() {
  return <Navigate to="/creator/dashboard/for-you" replace />;
}
