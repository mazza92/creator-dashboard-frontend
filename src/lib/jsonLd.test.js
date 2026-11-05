import { jsonLd } from './jsonLd';

test('script-breaking characters are escaped and the JSON still parses', () => {
  const data = { headline: '</script><script>alert(1)</script> & co' + String.fromCharCode(0x2028) };
  const out = jsonLd(data);
  expect(out).not.toMatch(/<|>/);
  expect(out).not.toContain(String.fromCharCode(0x2028));
  expect(JSON.parse(out)).toEqual(data);
});
