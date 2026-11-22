import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { takeCheckoutReturn, withCheckoutCancelled } from '../utils/checkoutReturn';

// Stripe's "back" link. Nothing was bought or cancelled: send the creator straight back to the screen they were
// on, where the dashboard shows a one-line "no charge" note (CreatorDashboardLayout, ?checkout=cancelled).
// Replaced an old "Subscription Cancelled" page with outdated free-tier copy and links.
export default function SubscriptionCancel() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(withCheckoutCancelled(takeCheckoutReturn()), { replace: true });
  }, [navigate]);
  return null;
}
