import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
);

// Never hard-crash the whole app because a Vercel env var is missing
// OR because Firebase is misconfigured (invalid key, wrong domain, etc).
// If Firebase isn't configured (or fails to init), export a null auth and let callers degrade gracefully.
let authInstance = null;
if (firebaseConfigured) {
  try {
    authInstance = getAuth(initializeApp(firebaseConfig));
  } catch (e) {
    authInstance = null;
    // eslint-disable-next-line no-console
    console.warn('Firebase failed to initialize. Google sign-in will be disabled.', e);
  }
}

export const auth = authInstance;

if (!firebaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    'Firebase is not configured (missing REACT_APP_FIREBASE_* env vars). Google sign-in will be disabled.'
  );
}