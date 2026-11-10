import { validateSignupField } from './signupValidation';


describe('signup inline validation', () => {
  it('checks each field', () => {
    expect(validateSignupField('firstName', ' ')).toMatch(/first name/i);
    expect(validateSignupField('firstName', 'Maya')).toBe('');
    expect(validateSignupField('email', 'maya@')).toMatch(/doesn't look right/);
    expect(validateSignupField('email', 'maya@gmail.com')).toBe('');
    expect(validateSignupField('password', 'short')).toMatch(/8 characters/);
    expect(validateSignupField('password', 'longenough')).toBe('');
  });
});
