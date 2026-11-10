import { applyContentGate, collectBrandEntries, FREE_ENTRY_COUNT } from './contentUnlock';
import directoryPost from '../content/posts/ultimate-2026-directory-brands-with-open-pr-application-forms.json';
import companiesPost from '../content/posts/list-of-companies-that-send-pr-packages-2026.json';
import kbeautyPost from '../content/posts/k-beauty-korean-skincare-brands-pr-list-small-creators-2026.json';

function mount(html) {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

afterEach(() => {
  document.body.innerHTML = '';
});

const tableHtml = (rows) => `
  <p>Intro</p>
  <table>
    <tr><th>Brand</th><th>Contact Method</th><th>Niche</th></tr>
    ${rows.map((n) => `<tr><td><a href="/directory?search=${n}">${n}</a></td><td>Email pr@${n.toLowerCase()}.com</td><td>Beauty</td></tr>`).join('')}
  </table>
  <p>Write to hello@after.com for more.</p>`;

const BRANDS = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 'India', 'Juliet', 'Kilo', 'Lima'];

describe('content unlock gate', () => {
  it('keeps every word in the DOM and only blurs contact cells after the free entries', () => {
    const root = mount(tableHtml(BRANDS));
    const before = root.textContent;
    const gate = applyContentGate(root, { onLockedClick: () => {} });

    expect(gate).not.toBeNull();
    expect(gate.total).toBe(12);
    expect(gate.locked).toBe(12 - FREE_ENTRY_COUNT);
    // No text removed or added: chips draw their label with CSS.
    expect(root.textContent).toBe(before);

    const rows = root.querySelectorAll('tr');
    expect(rows[FREE_ENTRY_COUNT].children[1].classList.contains('nc-locked')).toBe(false);
    expect(rows[FREE_ENTRY_COUNT + 1].children[1].classList.contains('nc-locked')).toBe(true);
    // Brand names stay readable.
    expect(rows[FREE_ENTRY_COUNT + 1].children[0].classList.contains('nc-locked')).toBe(false);
    // Emails after the gate are blurred too.
    expect(root.querySelector('.nc-locked-text').textContent).toBe('hello@after.com');
    // The unlock slot sits right after the table.
    expect(root.querySelector('table').nextElementSibling.className).toBe('nc-unlock-slot');
  });

  it('routes clicks on locked bits to signup with the brand', () => {
    const root = mount(tableHtml(BRANDS));
    const onLockedClick = jest.fn();
    applyContentGate(root, { onLockedClick });
    root.querySelectorAll('tr')[11].children[1].click();
    expect(onLockedClick).toHaveBeenCalledWith({ brand: 'Kilo' });
  });

  it('reverts cleanly (signed-in visitors)', () => {
    const root = mount(tableHtml(BRANDS));
    const html = root.innerHTML;
    const gate = applyContentGate(root);
    gate.revert();
    expect(root.innerHTML).toBe(html);
  });

  it('does not gate short lists', () => {
    const root = mount(tableHtml(BRANDS.slice(0, FREE_ENTRY_COUNT + 1)));
    expect(applyContentGate(root)).toBeNull();
  });

  it('ignores generic bullet lists and the table of contents', () => {
    const root = mount(`
      <div class="toc-container"><ul><li><a href="/directory/beauty">Beauty</a></li></ul></div>
      <ul><li><strong>Direct Access:</strong> no hunting.</li><li><a href="/blog/x">Another post</a></li></ul>`);
    expect(collectBrandEntries(root)).toHaveLength(0);
  });

  it.each([
    ['open application forms directory', directoryPost, 25],
    ['companies that send PR packages', companiesPost, 30],
    ['K-beauty PR list', kbeautyPost, 20],
  ])('finds the brand list in the real "%s" post', (_name, post, minEntries) => {
    const root = mount(post.content);
    const before = root.textContent;
    const entries = collectBrandEntries(root);
    expect(entries.length).toBeGreaterThanOrEqual(minEntries);
    const gate = applyContentGate(root);
    expect(gate).not.toBeNull();
    expect(root.textContent).toBe(before);
    expect(root.querySelectorAll('.nc-unlock-slot')).toHaveLength(1);
  });
});
