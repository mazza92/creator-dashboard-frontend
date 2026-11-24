// Remembers how this browser last signed in ('google' | 'email'), so the login page can show a "Last used" badge.
// Many creators sign up with Google and later forget, then type a password that can never match.
const KEY = 'nc_last_login_method';
const METHODS = ['google', 'email'];

export function getLastLoginMethod() {
  try {
    const v = window.localStorage.getItem(KEY);
    return METHODS.includes(v) ? v : null;
  } catch (e) {
    return null;
  }
}

export function setLastLoginMethod(method) {
  if (!METHODS.includes(method)) return;
  try {
    window.localStorage.setItem(KEY, method);
  } catch (e) {
    // Private mode or blocked storage: the badge is a convenience only.
  }
}
