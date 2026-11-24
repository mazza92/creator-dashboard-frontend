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
