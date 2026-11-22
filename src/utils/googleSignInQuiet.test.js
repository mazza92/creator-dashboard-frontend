// Separate file: the redirect result is read once per page load (module state), so each case loads a fresh module.
const mockAuthFns = {
  getRedirectResult: jest.fn(),
  signOut: jest.fn(),
};
jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: class {},
  getRedirectResult: (...a) => mockAuthFns.getRedirectResult(...a),
  signInWithPopup: () => Promise.resolve({}),
  signInWithRedirect: () => Promise.resolve(),
  signOut: (...a) => mockAuthFns.signOut(...a),
}));
jest.mock('./api', () => ({ __esModule: true, default: { post: () => Promise.resolve() } }));

function freshModule() {
  let mod;
  jest.isolateModules(() => { mod = require('./googleSignIn'); });
  return mod;
}

beforeEach(() => { try { sessionStorage.clear(); } catch (_) { /* ignore */ } });

test('the load-time check stays quiet when no Google sign-in was started', async () => {
  mockAuthFns.getRedirectResult = () => Promise.reject(Object.assign(new Error('slow'), { code: 'auth/redirect-timeout' }));
  const { consumeGoogleRedirectResult } = freshModule();
  await expect(consumeGoogleRedirectResult({ currentUser: null })).resolves.toBeNull();
});

test('a sign-in the creator started still reports its error', async () => {
  sessionStorage.setItem('nc_google_redirect', '/signup');
  mockAuthFns.getRedirectResult = () => Promise.reject(Object.assign(new Error('bad'), { code: 'auth/internal-error' }));
  const { consumeGoogleRedirectResult } = freshModule();
  await expect(consumeGoogleRedirectResult({ currentUser: null })).rejects.toMatchObject({ code: 'auth/internal-error' });
});

test('signOutGoogle never throws and never hangs', async () => {
  let signOutGoogle;
  jest.isolateModules(() => { ({ signOutGoogle } = require('./googleSignOut')); });
  mockAuthFns.signOut = () => Promise.reject(new Error('nope'));
  await expect(signOutGoogle({})).resolves.toBeUndefined();
  mockAuthFns.signOut = () => new Promise(() => {});
  jest.useFakeTimers();
  const pending = signOutGoogle({});
  jest.advanceTimersByTime(3000);
  await expect(pending).resolves.toBeUndefined();
  jest.useRealTimers();
  await expect(signOutGoogle(null)).resolves.toBeUndefined();
});
