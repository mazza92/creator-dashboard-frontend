import { checkoutFaq, formatDay, trustTicks } from './checkoutCopy';
import { checkoutPath } from '../utils/startProCheckout';


describe('on-site checkout copy', () => {
  it('says $0 today and the charge date on a free week', () => {
    const faq = checkoutFaq(7, '2026-12-01');
    expect(faq[0].a).toContain('$0 today');
    expect(faq[0].a).toContain('December 1');
    expect(trustTicks(7)[0]).toBe('$0 today, 7 days free');
  });

  it('says what is charged today without a free week', () => {
    expect(checkoutFaq(0, null)[0].a).toContain('$19 today');
    expect(trustTicks(0)[0]).toBe('$19/month, no contract');
  });

  it('formats a day safely', () => {
    expect(formatDay('2026-12-01')).toBe('December 1');
    expect(formatDay('')).toBe('');
    expect(formatDay('nope')).toBe('');
  });

  it('builds a clean checkout path', () => {
    expect(checkoutPath('waiting_room_chat')).toBe('/creator/dashboard/checkout?source=waiting_room_chat');
    expect(checkoutPath('Polly Chip!')).toBe('/creator/dashboard/checkout?source=pollychip');
  });
});

describe('plans from the upgrade modal', () => {
  it('carries yearly and win-back into the checkout path', () => {
    expect(checkoutPath('upgrade', { interval: 'yearly' })).toBe('/creator/dashboard/checkout?source=upgrade&interval=yearly');
    expect(checkoutPath('winback', { offer: 'winback' })).toBe('/creator/dashboard/checkout?source=winback&offer=winback');
  });

  it('prices each plan honestly', () => {
    expect(trustTicks(0, { interval: 'yearly' })[0]).toBe('$152/year, no contract');
    expect(checkoutFaq(0, null, { interval: 'yearly' })[0].a).toContain('$152 today and then every year');
    expect(trustTicks(0, { offer: 'winback' })[0]).toBe('$12/month for 3 invoices, then $19');
    expect(checkoutFaq(7, '2026-12-01', { interval: 'yearly' })[0].a).toContain('$152 on December 1');
  });
});
