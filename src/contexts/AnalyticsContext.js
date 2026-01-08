import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const location = useLocation();

  // Track page views automatically
  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-5RET5C6MZ8', {
        page_path: location.pathname + location.search,
        page_title: document.title
      });
    }
  }, [location]);

  /**
   * GA4 Recommended Event: sign_up
   * Tracks new account creation
   * @param {string} method - Sign up method (e.g., 'email', 'google', 'facebook')
   * @param {string} userType - User type: 'creator' or 'brand'
   * @param {object} additionalParams - Additional parameters (username, email, etc.)
   */
  const trackSignUp = (method = 'email', userType = 'creator', additionalParams = {}) => {
    if (window.gtag) {
      window.gtag('event', 'sign_up', {
        method: method,
        user_type: userType,
        ...additionalParams
      });
      // Also track as custom event for backward compatibility
      window.gtag('event', 'new_account', {
        event_category: 'user_registration',
        event_label: userType,
        method: method,
        ...additionalParams
      });
    }
  };

  /**
   * GA4 Recommended Event: login
   * Tracks user login
   * @param {string} method - Login method (e.g., 'email', 'google', 'facebook')
   * @param {string} userType - User type: 'creator' or 'brand'
   */
  const trackLogin = (method = 'email', userType = null) => {
    if (window.gtag) {
      window.gtag('event', 'login', {
        method: method,
        ...(userType && { user_type: userType })
      });
    }
  };

  /**
   * Tracks ad slot/campaign published
   * @param {object} campaignData - Campaign/ad slot data
   * @param {string} userType - 'creator' or 'brand'
   */
  const trackAdSlotPublished = (campaignData = {}, userType = 'brand') => {
    if (window.gtag) {
      const eventParams = {
        item_id: campaignData.campaign_id || campaignData.id || 'unknown',
        item_name: campaignData.campaign_name || campaignData.name || 'Untitled Campaign',
        item_category: 'ad_slot',
        currency: campaignData.currency || 'USD',
        value: campaignData.budget || campaignData.price || 0,
        user_type: userType,
        number_of_creators: campaignData.number_of_creators || 1,
        target_locations: campaignData.target_audience_location || [],
        deliverables: campaignData.deliverables || []
      };

      // GA4 recommended event: generate_lead (for brands publishing campaigns)
      window.gtag('event', 'generate_lead', {
        currency: eventParams.currency,
        value: eventParams.value,
        lead_type: 'campaign_created'
      });

      // Custom event for ad slot published
      window.gtag('event', 'ad_slot_published', eventParams);

      // Also track as view_item (GA4 recommended)
      window.gtag('event', 'view_item', {
        currency: eventParams.currency,
        value: eventParams.value,
        items: [{
          item_id: eventParams.item_id,
          item_name: eventParams.item_name,
          item_category: eventParams.item_category
        }]
      });
    }
  };

  /**
   * GA4 Recommended Event: view_item_list
   * Tracks when user views list of items (campaigns, creators, etc.)
   * @param {string} itemListId - ID of the list
   * @param {string} itemListName - Name of the list (e.g., 'Marketplace', 'My Campaigns')
   * @param {Array} items - Array of items in the list
   */
  const trackViewItemList = (itemListId, itemListName, items = []) => {
    if (window.gtag) {
      window.gtag('event', 'view_item_list', {
        item_list_id: itemListId,
        item_list_name: itemListName,
        items: items.map(item => ({
          item_id: item.id || item.item_id,
          item_name: item.name || item.item_name,
          item_category: item.category || 'unknown'
        }))
      });
    }
  };

  /**
   * GA4 Recommended Event: view_item
   * Tracks when user views a specific item (campaign, creator profile, etc.)
   * @param {object} item - Item data
   */
  const trackViewItem = (item) => {
    if (window.gtag) {
      window.gtag('event', 'view_item', {
        currency: item.currency || 'USD',
        value: item.value || item.price || 0,
        items: [{
          item_id: item.id || item.item_id,
          item_name: item.name || item.item_name,
          item_category: item.category || 'unknown',
          ...(item.brand_name && { brand: item.brand_name }),
          ...(item.creator_username && { creator: item.creator_username })
        }]
      });
    }
  };

  /**
   * GA4 Recommended Event: begin_checkout
   * Tracks when user starts booking/applying for a campaign
   * @param {object} bookingData - Booking/application data
   */
  const trackBeginCheckout = (bookingData = {}) => {
    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: bookingData.currency || 'USD',
        value: bookingData.value || bookingData.price || 0,
        items: [{
          item_id: bookingData.item_id || bookingData.campaign_id,
          item_name: bookingData.item_name || bookingData.campaign_name,
          item_category: 'campaign_booking'
        }]
      });
    }
  };

  /**
   * GA4 Recommended Event: purchase (or add_payment_info for bookings)
   * Tracks successful booking/collaboration
   * @param {object} purchaseData - Purchase/booking data
   */
  const trackPurchase = (purchaseData = {}) => {
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: purchaseData.transaction_id || purchaseData.booking_id,
        value: purchaseData.value || purchaseData.price || 0,
        currency: purchaseData.currency || 'USD',
        items: [{
          item_id: purchaseData.item_id || purchaseData.campaign_id,
          item_name: purchaseData.item_name || purchaseData.campaign_name,
          item_category: 'collaboration'
        }]
      });
    }
  };

  /**
   * Track profile view
   * @param {string} profileType - 'creator' or 'brand'
   * @param {string} profileId - Profile ID or username
   */
  const trackProfileView = (profileType, profileId) => {
    if (window.gtag) {
      window.gtag('event', 'view_item', {
        items: [{
          item_id: profileId,
          item_name: `${profileType}_profile`,
          item_category: 'profile'
        }],
        profile_type: profileType
      });
    }
  };

  /**
   * Track application submission
   * @param {object} applicationData - Application data
   */
  const trackApplicationSubmitted = (applicationData = {}) => {
    if (window.gtag) {
      window.gtag('event', 'submit_application', {
        event_category: 'campaign_interaction',
        campaign_id: applicationData.campaign_id,
        campaign_name: applicationData.campaign_name,
        user_type: applicationData.user_type || 'creator',
        bid_amount: applicationData.bid_amount || 0,
        currency: applicationData.currency || 'USD'
      });
    }
  };

  /**
   * Track onboarding completion
   * @param {string} userType - 'creator' or 'brand'
   * @param {number} completionTime - Time taken to complete (optional)
   */
  const trackOnboardingComplete = (userType, completionTime = null) => {
    if (window.gtag) {
      window.gtag('event', 'onboarding_complete', {
        event_category: 'user_onboarding',
        user_type: userType,
        ...(completionTime && { completion_time: completionTime })
      });
      // Also track as conversion
      window.gtag('event', 'conversion', {
        event_category: 'onboarding',
        user_type: userType
      });
    }
  };

  // Legacy tracking functions (kept for backward compatibility)
  const trackEvent = (action, category, label, value) => {
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  };

  const trackEngagement = (action, details = {}) => {
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: 'user_engagement',
        event_label: details.label || action,
        value: details.value,
        ...(details.custom_parameters || {})
      });
    }
  };

  const trackFormSubmission = (formName, success = true) => {
    if (window.gtag) {
      window.gtag('event', 'form_submit', {
        event_category: 'form_interaction',
        event_label: formName,
        success: success
      });
    }
  };

  const trackButtonClick = (buttonName, location = 'unknown') => {
    if (window.gtag) {
      window.gtag('event', 'button_click', {
        event_category: 'user_interaction',
        event_label: buttonName,
        button_location: location
      });
    }
  };

  const trackNavigation = (from, to) => {
    trackEvent('navigation', 'user_journey', `${from}_to_${to}`, 1);
  };

  const trackSignupStep = (step, stepName) => {
    if (window.gtag) {
      window.gtag('event', 'signup_step', {
        event_category: 'user_onboarding',
        event_label: stepName,
        step_number: step
      });
    }
  };

  const trackFeatureUsage = (featureName, action = 'used') => {
    trackEvent('feature_usage', 'app_interaction', featureName, 1);
    trackEngagement('feature_usage', {
      label: `${featureName}_${action}`,
      custom_parameters: {
        feature_name: featureName,
        action: action
      }
    });
  };

  const trackError = (errorType, errorMessage) => {
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: errorMessage,
        fatal: false,
        error_type: errorType
      });
    }
  };

  const trackConversion = (conversionType, value = 1) => {
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        event_category: 'business_goal',
        event_label: conversionType,
        value: value
      });
    }
  };

  const trackPageView = (pageName, customParameters = {}) => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        ...customParameters
      });
    }
  };

  const trackUserAction = (action, category, label, value) => {
    trackEvent(action, category, label, value);
    trackEngagement(action, {
      label: label,
      value: value,
      custom_parameters: {
        action_category: category,
        action_name: action
      }
    });
  };

  const value = {
    // GA4 Recommended Events
    trackSignUp,
    trackLogin,
    trackAdSlotPublished,
    trackViewItemList,
    trackViewItem,
    trackBeginCheckout,
    trackPurchase,
    trackProfileView,
    trackApplicationSubmitted,
    trackOnboardingComplete,
    // Legacy/General tracking functions
    trackEvent,
    trackEngagement,
    trackFormSubmission,
    trackButtonClick,
    trackNavigation,
    trackSignupStep,
    trackFeatureUsage,
    trackError,
    trackConversion,
    trackPageView,
    trackUserAction
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}; 