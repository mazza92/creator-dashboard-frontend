import React from 'react';
import { Navigate } from 'react-router-dom';

/** Independent flag — set false to revert Mech 3 landing behavior */
const AI_MANAGER_POST_ONBOARDING_LANDING_V1 = true;

const SETUP_KEY = 'nc_manager_setup_complete';
const NUDGE_KEY = 'nc_manager_setup_nudge';

/**
 * Creator `/` and `/dashboard` index redirect.
 * Mech 3: incomplete free setup → AI Manager once per session; else For You.
 */
export default function CreatorHomeRedirect() {
  if (!AI_MANAGER_POST_ONBOARDING_LANDING_V1) {
    return <Navigate to="/creator/dashboard/for-you" replace />;
  }

  const justOnboarded = sessionStorage.getItem('justCompletedOnboarding') === 'true';
  if (justOnboarded) {
    return <Navigate to="/creator/dashboard/pr-ready?onboarding=true" replace />;
  }

  const setupComplete = localStorage.getItem(SETUP_KEY) === '1';
  const nudged = sessionStorage.getItem(NUDGE_KEY) === '1';
  if (!setupComplete && !nudged) {
    sessionStorage.setItem(NUDGE_KEY, '1');
    return <Navigate to="/creator/dashboard/pr-ready?setup=continue" replace />;
  }

  return <Navigate to="/creator/dashboard/for-you" replace />;
}
