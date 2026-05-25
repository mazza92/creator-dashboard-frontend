'use client';

import React, { createContext, useContext, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    return {
      trackButtonClick: () => {},
      trackConversion: () => {},
      trackNavigation: () => {},
      trackPageView: () => {},
      trackEvent: () => {},
    };
  }
  return context;
};

// Isolated component — only this component suspends due to useSearchParams.
// It returns null so it never blocks SSR of page content.
function AnalyticsPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      window.gtag('config', 'G-5RET5C6MZ8', {
        page_path: fullPath,
        page_title: document.title,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export const AnalyticsProviderNext = ({ children }) => {

  /**
   * GA4 Recommended Event: sign_up
   * Tracks new account creation
   */
  const trackSignUp = (method) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sign_up', {
        method: method
      });
    }
  };

  /**
   * GA4 Recommended Event: login
   * Tracks user login
   */
  const trackLogin = (method) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'login', {
        method: method
      });
    }
  };

  /**
   * GA4 Recommended Event: generate_lead
   * Tracks lead generation (e.g., form submissions, signups)
   */
  const trackLead = (value, currency = 'USD') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'generate_lead', {
        value: value,
        currency: currency
      });
    }
  };

  /**
   * GA4 Recommended Event: purchase
   * Tracks purchases/transactions
   */
  const trackPurchase = (transactionId, value, currency = 'USD', items = []) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: value,
        currency: currency,
        items: items
      });
    }
  };

  /**
   * Custom event: Button click tracking
   */
  const trackButtonClick = (buttonName, location) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'button_click', {
        button_name: buttonName,
        location: location
      });
    }
  };

  /**
   * Custom event: Conversion tracking
   */
  const trackConversion = (conversionType, value = 1) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        conversion_type: conversionType,
        value: value
      });
    }
  };

  /**
   * Custom event: Navigation tracking
   */
  const trackNavigation = (from, to) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'navigation', {
        from: from,
        to: to
      });
    }
  };

  /**
   * Custom event: Page view tracking
   */
  const trackPageView = (pagePath, pageTitle) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle
      });
    }
  };

  /**
   * Generic event tracking
   */
  const trackEvent = (eventName, eventParams = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, eventParams);
    }
  };

  const value = {
    trackSignUp,
    trackLogin,
    trackLead,
    trackPurchase,
    trackButtonClick,
    trackConversion,
    trackNavigation,
    trackPageView,
    trackEvent,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
      {/* Tracker is isolated in its own Suspense so useSearchParams never
          causes the page content tree to bail out to client-side rendering */}
      <Suspense fallback={null}>
        <AnalyticsPageTracker />
      </Suspense>
    </AnalyticsContext.Provider>
  );
};
