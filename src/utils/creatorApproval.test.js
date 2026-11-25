import {
  DIRECTORY_PATH,
  creatorHomePath,
  creatorPostAuthPath,
  directoryGateRedirect,
  isDirectoryCreator,
} from './creatorApproval';

const creator = (approval_status) => ({ role: 'creator', creator_id: 7, approval_status, onboarding_complete: true });

test('the directory route is /creator/directory', () => {
  expect(DIRECTORY_PATH).toBe('/creator/directory');
});

test.each(['pending', 'rejected'])('%s creators land on the directory, not a waitlist', (status) => {
  expect(isDirectoryCreator(creator(status))).toBe(true);
  expect(creatorHomePath(creator(status))).toBe(DIRECTORY_PATH);
  expect(creatorPostAuthPath({ approval_status: status, onboarding_complete: true })).toBe(DIRECTORY_PATH);
});

test.each(['pending', 'rejected'])('%s creators are sent from any /creator page to the directory', (status) => {
  const user = creator(status);
  expect(directoryGateRedirect(user, '/creator/dashboard/for-you')).toBe(DIRECTORY_PATH);
  expect(directoryGateRedirect(user, '/creator/dashboard/tracker')).toBe(DIRECTORY_PATH);
  expect(directoryGateRedirect(user, '/creator/dashboard/pulse')).toBe(DIRECTORY_PATH);
  expect(directoryGateRedirect(user, '/creator/dashboard/paid-gigs')).toBe(DIRECTORY_PATH);
  expect(directoryGateRedirect(user, '/creator/dashboard/my-kit')).toBe(DIRECTORY_PATH);
  expect(directoryGateRedirect(user, '/creator/dashboard/checkout')).toBe(DIRECTORY_PATH);
  expect(directoryGateRedirect(user, '/creator/waitlist')).toBe(DIRECTORY_PATH);
  // Already there, or coming back from Stripe: no redirect
  expect(directoryGateRedirect(user, DIRECTORY_PATH)).toBeNull();
  expect(directoryGateRedirect(user, '/creator/dashboard/subscription/success')).toBeNull();
  expect(directoryGateRedirect(user, '/creator/dashboard/subscription/cancel')).toBeNull();
  // Public pages are not gated
  expect(directoryGateRedirect(user, '/blog')).toBeNull();
});

test.each(['approved', 'pro_approved', null])('%s creators keep the full dashboard', (status) => {
  const user = creator(status);
  expect(isDirectoryCreator(user)).toBe(false);
  expect(creatorHomePath(user)).toBe('/creator/dashboard/for-you');
  expect(directoryGateRedirect(user, '/creator/dashboard/for-you')).toBeNull();
});

test('brands and creators without a profile yet are not gated', () => {
  expect(directoryGateRedirect({ role: 'brand', approval_status: 'pending' }, '/creator/profile/1')).toBeNull();
  expect(directoryGateRedirect({ role: 'creator', approval_status: 'pending', creator_id: null }, '/creator/dashboard')).toBeNull();
});
