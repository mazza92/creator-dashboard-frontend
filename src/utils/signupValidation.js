// Inline validation for the creator signup form (kept out of the component so it is testable alone).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MIN_PASSWORD = 8;

export function validateSignupField(field, value) {
  const v = String(value || '');
  if (field === 'firstName') return v.trim() ? '' : 'Add your first name';
  if (field === 'email') {
    if (!v.trim()) return 'Add your email';
    return EMAIL_RE.test(v.trim()) ? '' : "That email doesn't look right";
  }
  if (field === 'password') {
    if (!v) return 'Choose a password';
    return v.length >= MIN_PASSWORD ? '' : `Use at least ${MIN_PASSWORD} characters`;
  }
  return '';
}
