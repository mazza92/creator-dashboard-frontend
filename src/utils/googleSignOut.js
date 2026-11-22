import { signOut } from 'firebase/auth';

// Sign out of Firebase on logout and account deletion. Otherwise the phone keeps the old Google user, and on
// iPhone the next Google sign-in can hang until it times out (Nov 22 2026: every attempt after deleting an account).
// Never throws, never waits more than a couple of seconds. Kept apart from googleSignIn.js so the user context
// doesn't pull in the API client.
export async function signOutGoogle(auth, ms = 2500) {
  if (!auth) return;
  let timer;
  try {
    await Promise.race([
      signOut(auth),
      new Promise((resolve) => { timer = setTimeout(resolve, ms); }),
    ]);
  } catch {
    // leaving is more important than a clean Firebase sign-out
  } finally {
    clearTimeout(timer);
  }
}
