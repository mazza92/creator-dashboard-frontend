import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics tracking hook
export const useAnalytics = () => {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-5RET5C6MZ8', {
        page_path: location.pathname + location.search,
        page_title: document.title
      });
    }
  }, [location]);

  // Track custom events
  const trackEvent = (action, category, label, value) => {
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  };

  // Track user engagement
  const trackEngagement = (action, details = {}) => {
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: 'user_engagement',
        event_label: details.label || action,
        value: details.value,
        custom_parameters: details.custom_parameters || {}
      });
    }
  };

  // Track form submissions
  const trackFormSubmission = (formName, success = true) => {
    trackEvent('form_submit', 'form_interaction', formName, success ? 1 : 0);
  };

  // Track button clicks
  const trackButtonClick = (buttonName, location = 'unknown') => {
    trackEvent('button_click', 'user_interaction', buttonName, 1);
    trackEngagement('button_click', {
      label: `${buttonName}_${location}`,
      custom_parameters: {
        button_location: location,
        button_name: buttonName
      }
    });
  };

  // Track navigation
  const trackNavigation = (from, to) => {
    trackEvent('navigation', 'user_journey', `${from}_to_${to}`, 1);
  };

  // Track signup steps
  const trackSignupStep = (step, stepName) => {
    trackEvent('signup_step', 'user_onboarding', stepName, step);
  };

  // Track feature usage
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

  // Track error events
  const trackError = (errorType, errorMessage) => {
    trackEvent('error', 'app_error', errorType, 1);
    trackEngagement('error', {
      label: errorType,
      custom_parameters: {
        error_message: errorMessage,
        error_type: errorType
      }
    });
  };

  // Track conversion events
  const trackConversion = (conversionType, value = 1) => {
    trackEvent('conversion', 'business_goal', conversionType, value);
  };

  return {
    trackEvent,
    trackEngagement,
    trackFormSubmission,
    trackButtonClick,
    trackNavigation,
    trackSignupStep,
    trackFeatureUsage,
    trackError,
    trackConversion
  };
};

// Higher-order component for automatic page view tracking
export const withAnalytics = (WrappedComponent) => {
  return (props) => {
    const analytics = useAnalytics();
    return <WrappedComponent {...props} analytics={analytics} />;
  };
}; 