import { getLastLoginMethod, setLastLoginMethod } from './lastLoginMethod';

describe('lastLoginMethod', () => {
  beforeEach(() => window.localStorage.clear());

  it('is null until a sign-in happens', () => {
    expect(getLastLoginMethod()).toBeNull();
  });

  it('remembers google and email', () => {
    setLastLoginMethod('google');
    expect(getLastLoginMethod()).toBe('google');
    setLastLoginMethod('email');
    expect(getLastLoginMethod()).toBe('email');
  });

  it('ignores unknown values', () => {
    setLastLoginMethod('facebook');
    expect(getLastLoginMethod()).toBeNull();
    window.localStorage.setItem('nc_last_login_method', 'junk');
    expect(getLastLoginMethod()).toBeNull();
  });

  it('survives blocked storage', () => {
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(getLastLoginMethod()).toBeNull();
    spy.mockRestore();
  });
});
