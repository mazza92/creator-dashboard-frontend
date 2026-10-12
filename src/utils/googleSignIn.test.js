jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: class {},
  getRedirectResult: jest.fn(),
  signInWithPopup: jest.fn(),
  signInWithRedirect: jest.fn(),
}));

import {
  inAppBrowserName,
  isIOS,
  shouldUseGoogleRedirect,
  googleSignInErrorMessage,
  isIgnorableGoogleCancel,
  isRegionBlockedError,
} from './googleSignIn';

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const IPHONE_GSA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_16 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/438.6.976963367 Mobile/15E148 Safari/604.1';
const IPHONE_ECOSIA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5.2 Mobile/15E148 Safari/604.1 (Ecosia ios@12.6.0.3386)';
const DESKTOP_CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36';
const INSTAGRAM =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 300.0.0';

describe('googleSignIn helpers', () => {
  test('detects Google and Ecosia in-app browsers', () => {
    expect(inAppBrowserName(IPHONE_GSA)).toBe('Google');
    expect(inAppBrowserName(IPHONE_ECOSIA)).toBe('Ecosia');
    expect(inAppBrowserName(INSTAGRAM)).toBe('Instagram');
    expect(inAppBrowserName(IPHONE_SAFARI)).toBeNull();
    expect(inAppBrowserName(DESKTOP_CHROME)).toBeNull();
  });

  test('uses redirect on iPhone instead of a popup', () => {
    expect(isIOS(IPHONE_SAFARI)).toBe(true);
    expect(shouldUseGoogleRedirect(IPHONE_SAFARI)).toBe(true);
    expect(shouldUseGoogleRedirect(IPHONE_GSA)).toBe(true);
    expect(shouldUseGoogleRedirect(DESKTOP_CHROME)).toBe(false);
  });

  test('maps timeout and cancel codes', () => {
    expect(googleSignInErrorMessage({ code: 'auth/popup-timeout' })).toMatch(/didn't finish/i);
    expect(isIgnorableGoogleCancel({ code: 'auth/popup-closed-by-user' })).toBe(true);
    expect(isIgnorableGoogleCancel({ code: 'auth/popup-timeout' })).toBe(false);
    expect(isRegionBlockedError({ response: { status: 403, data: { error: 'Restricted region' } } }, 'Restricted region')).toBe(true);
  });
});
