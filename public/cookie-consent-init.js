/**
 * Google Consent Mode v2 — must run before gtag.js config.
 * EEA/UK/CH default to denied; rest of world defaults to granted.
 * A stored nc_consent cookie updates immediately so returning visitors keep their choice.
 */
(function () {
  'use strict';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  var REGION = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
    'HU', 'IS', 'IE', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL',
    'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'CH',
  ];

  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500,
    region: REGION,
  });

  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    functionality_storage: 'granted',
    personalization_storage: 'granted',
    security_storage: 'granted',
  });

  function readCookie(name) {
    var parts = ('; ' + document.cookie).split('; ' + name + '=');
    if (parts.length < 2) return '';
    return decodeURIComponent(parts.pop().split(';').shift());
  }

  function parseConsent(raw) {
    if (!raw) return null;
    try {
      var o = JSON.parse(raw);
      if (!o || typeof o !== 'object') return null;
      if (!('analytics' in o) && !('marketing' in o)) return null;
      return { analytics: !!o.analytics, marketing: !!o.marketing };
    } catch (e) {
      return null;
    }
  }

  var stored = parseConsent(readCookie('nc_consent'));
  if (!stored) {
    try {
      stored = parseConsent(window.localStorage.getItem('nc_consent'));
    } catch (e) {
      stored = null;
    }
  }
  if (!stored) {
    try {
      stored = parseConsent(window.localStorage.getItem('cookiePreferences'));
    } catch (e) {
      stored = null;
    }
  }

  if (stored) {
    window.gtag('consent', 'update', {
      analytics_storage: stored.analytics ? 'granted' : 'denied',
      ad_storage: stored.marketing ? 'granted' : 'denied',
      ad_user_data: stored.marketing ? 'granted' : 'denied',
      ad_personalization: stored.marketing ? 'granted' : 'denied',
    });
    window.__ncConsent = stored;
  }
})();
