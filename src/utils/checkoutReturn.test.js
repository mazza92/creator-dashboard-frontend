import { rememberCheckoutReturn, takeCheckoutReturn, withCheckoutCancelled, DEFAULT_RETURN } from './checkoutReturn';

beforeEach(() => { sessionStorage.clear(); localStorage.clear(); });

test('backs out of Stripe to the screen they were on, once', () => {
  rememberCheckoutReturn('/creator/dashboard/pr-brands?brand=aveeno');
  expect(takeCheckoutReturn()).toBe('/creator/dashboard/pr-brands?brand=aveeno');
  expect(takeCheckoutReturn()).toBe(DEFAULT_RETURN);
});

test('stale or outside paths fall back to Polly', () => {
  rememberCheckoutReturn('/creator/dashboard/tracker');
  expect(takeCheckoutReturn(Date.now() + 4 * 60 * 60 * 1000)).toBe(DEFAULT_RETURN);
  rememberCheckoutReturn('/login');
  rememberCheckoutReturn('/creator/dashboard/subscription/cancel');
  expect(takeCheckoutReturn()).toBe(DEFAULT_RETURN);
});

test('adds the cancelled flag and keeps existing params', () => {
  expect(withCheckoutCancelled('/creator/dashboard/pr-brands?brand=aveeno'))
    .toBe('/creator/dashboard/pr-brands?brand=aveeno&checkout=cancelled');
  expect(withCheckoutCancelled('/creator/dashboard/for-you')).toBe('/creator/dashboard/for-you?checkout=cancelled');
});
