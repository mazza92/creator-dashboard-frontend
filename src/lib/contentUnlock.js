/**
 * Soft content gate for brand-list blog posts ("content unlock" pattern).
 *
 * SEO safety: this never removes or hides text. Every brand, sentence and link stays in the
 * server-rendered HTML and in the DOM. After the first FREE_ENTRY_COUNT brands it only:
 *   - adds classes that visually blur the actionable bits (contact / "how to apply" table cells,
 *     outbound application links, e-mail addresses) via CSS text-shadow,
 *   - appends empty <button>s whose label is drawn with CSS (no new DOM text),
 *   - inserts an empty slot element the page fills with the unlock card.
 * Googlebot and visitors get the same HTML, so there is nothing to cloak. revert() undoes it all.
 *
 * Works on any post: it detects brand entries from structure (tables with a Brand column,
 * list items / h3s that start with a brand link) instead of per-post markup.
 */

export const FREE_ENTRY_COUNT = 8;
// Gate only when it hides enough to be worth a sign-up.
export const MIN_LOCKED_ENTRIES = 3;

const BRAND_HEADER_RE = /^\s*(brand|company|retailer|program|store|shop)\b/i;
const CONTACT_HEADER_RE = /(contact|apply|application|reach|approach|e-?mail|link|form|how to)/i;
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)*\.[A-Z]{2,}/gi;
const SKIP_SELECTOR =
  '.toc-container, nav, .nc-unlock-slot, .nc-inline-cta, .cta-box, .cta-section, .blog-brand-search, .portfolio-scroll-stopper';

const textOf = (el) => (el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : '');
const cleanBrand = (s) => s.replace(/[\s:–—-]+$/, '').replace(/^[\s\d.)]+/, '').trim().slice(0, 80);

function isNewcollab(href) {
  return /^https?:\/\/([a-z0-9-]+\.)*newcollab\.co(\/|$|\?)/i.test(href);
}

/** A link that names a brand: our brand/directory pages or the brand's own site. */
export function isBrandHref(href) {
  if (!href) return false;
  if (/^\/(directory|brand)(\/|\?|$)/i.test(href)) return true;
  return /^https?:\/\//i.test(href) && !isNewcollab(href);
}

/** A link that is itself the actionable contact: an outbound application form or mailto. */
export function isActionableHref(href) {
  if (!href) return false;
  if (/^mailto:/i.test(href)) return true;
  return /^https?:\/\//i.test(href) && !isNewcollab(href);
}

function leadingAnchor(el) {
  let node = el.firstChild;
  while (node && node.nodeType === 3 && !node.textContent.trim()) node = node.nextSibling;
  if (!node || node.nodeType !== 1) return null;
  if (node.tagName === 'A') return node;
  if (node.tagName === 'STRONG' || node.tagName === 'B') return leadingAnchor(node);
  return null;
}

function analyzeTable(table) {
  const headerRow = Array.from(table.querySelectorAll('tr')).find((tr) => tr.querySelector('th'));
  if (!headerRow) return null;
  const labels = Array.from(headerRow.children).map(textOf);
  const brandCol = labels.findIndex((l) => BRAND_HEADER_RE.test(l));
  if (brandCol === -1) return null;
  const contactCols = labels
    .map((l, i) => (i !== brandCol && CONTACT_HEADER_RE.test(l) ? i : -1))
    .filter((i) => i !== -1);
  return { headerRow, brandCol, contactCols };
}

function sectionLocks(heading) {
  const locks = [];
  let sib = heading.nextElementSibling;
  while (sib && !/^H[1-4]$/.test(sib.tagName)) {
    const links = sib.tagName === 'A' ? [sib] : Array.from(sib.querySelectorAll('a[href]'));
    links.forEach((a) => {
      if (isActionableHref(a.getAttribute('href'))) locks.push(a);
    });
    sib = sib.nextElementSibling;
  }
  return locks;
}

/** Brand entries in document order: { el, brand, container, locks[], chipHost }. */
export function collectBrandEntries(root) {
  if (!root) return [];
  const entries = [];
  const tables = new Map();
  root.querySelectorAll('tr, li, h3, h4').forEach((el) => {
    if (el.closest(SKIP_SELECTOR)) return;

    if (el.tagName === 'TR') {
      const table = el.closest('table');
      if (!tables.has(table)) tables.set(table, analyzeTable(table));
      const info = tables.get(table);
      if (!info || el === info.headerRow || !el.querySelector('td')) return;
      const cells = Array.from(el.children);
      const brand = cleanBrand(textOf(cells[info.brandCol]));
      if (!brand) return;
      const locks = info.contactCols.map((i) => cells[i]).filter((c) => c && textOf(c));
      entries.push({ el, brand, container: table, locks, chipHost: locks.length ? null : cells[info.brandCol] });
      return;
    }

    const anchor = leadingAnchor(el);
    if (!anchor || !isBrandHref(anchor.getAttribute('href'))) return;
    const brand = cleanBrand(textOf(anchor));
    if (!brand) return;

    if (el.tagName === 'LI') {
      if (textOf(el).length > 600) return;
      const locks = Array.from(el.querySelectorAll('a[href]')).filter(
        (a) => a !== anchor && isActionableHref(a.getAttribute('href'))
      );
      entries.push({ el, brand, container: el.closest('ul, ol') || el, locks, chipHost: locks.length ? null : el });
      return;
    }

    if (textOf(el).length > 90) return;
    const locks = sectionLocks(el);
    entries.push({ el, brand, container: el, locks, chipHost: locks.length ? null : el });
  });
  return entries;
}

function outerBlock(el, root) {
  let node = el;
  while (node.parentElement && node.parentElement !== root && node.parentElement.children.length === 1) {
    node = node.parentElement;
  }
  return node;
}

function wrapEmails(root, boundary, brandFor) {
  const wrapped = [];
  const doc = root.ownerDocument;
  const walker = doc.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
  const targets = [];
  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    const after = boundary.compareDocumentPosition(node) & 4; // DOCUMENT_POSITION_FOLLOWING
    if (
      after &&
      parent &&
      !parent.closest('script, style, .nc-unlock-slot, .nc-locked, a') &&
      EMAIL_RE.test(node.textContent)
    ) {
      targets.push(node);
    }
    EMAIL_RE.lastIndex = 0;
    node = walker.nextNode();
  }
  targets.forEach((textNode) => {
    const frag = doc.createDocumentFragment();
    const text = textNode.textContent;
    let last = 0;
    text.replace(EMAIL_RE, (match, offset) => {
      if (offset > last) frag.appendChild(doc.createTextNode(text.slice(last, offset)));
      const span = doc.createElement('span');
      span.className = 'nc-locked nc-locked-text';
      span.setAttribute('data-nc-locked', '');
      span.setAttribute('data-nc-brand', brandFor(textNode));
      span.textContent = match;
      frag.appendChild(span);
      wrapped.push(span);
      last = offset + match.length;
      return match;
    });
    if (last < text.length) frag.appendChild(doc.createTextNode(text.slice(last)));
    textNode.parentNode.replaceChild(frag, textNode);
  });
  return wrapped;
}

/**
 * Apply the gate. Returns null when the post has too few brands to gate, otherwise
 * { slot, total, locked, revert }. `onLockedClick({ brand })` fires for clicks on locked bits.
 */
export function applyContentGate(root, { freeCount = FREE_ENTRY_COUNT, onLockedClick } = {}) {
  const entries = collectBrandEntries(root);
  const lockedEntries = entries.slice(freeCount);
  if (entries.length < freeCount + MIN_LOCKED_ENTRIES) return null;

  const doc = root.ownerDocument;
  const marked = [];
  const chips = [];

  lockedEntries.forEach((entry) => {
    entry.locks.forEach((el) => {
      if (!el.hasAttribute('class')) el.setAttribute('data-nc-noclass', '');
      el.classList.add('nc-locked', el.tagName === 'A' ? 'nc-locked-link' : 'nc-locked-cell');
      el.setAttribute('data-nc-brand', entry.brand);
      el.setAttribute('title', `Sign up free to see how to reach ${entry.brand}`);
      marked.push(el);
    });
    if (entry.chipHost) {
      const chip = doc.createElement('button');
      chip.type = 'button';
      chip.className = 'nc-chip';
      chip.setAttribute('data-nc-brand', entry.brand);
      chip.setAttribute('aria-label', `Unlock the ${entry.brand} PR contact, free`);
      entry.chipHost.appendChild(chip);
      chips.push(chip);
    }
  });

  const firstLocked = lockedEntries[0];
  const brandAt = (node) => {
    const hit = [...lockedEntries].reverse().find((e) => e.el.compareDocumentPosition(node) & 4 || e.el.contains(node));
    return hit ? hit.brand : '';
  };
  const emails = wrapEmails(root, firstLocked.el, brandAt);

  const lastFreeBlock = outerBlock(entries[freeCount - 1].container, root);
  const nextBlock = outerBlock(firstLocked.container, root);
  const slot = doc.createElement('div');
  slot.className = 'nc-unlock-slot';
  if (lastFreeBlock === nextBlock) {
    lastFreeBlock.parentNode.insertBefore(slot, lastFreeBlock.nextSibling);
  } else {
    nextBlock.parentNode.insertBefore(slot, nextBlock);
  }

  const onClick = (e) => {
    const target = e.target && e.target.closest ? e.target.closest('.nc-locked, .nc-chip') : null;
    if (!target || !root.contains(target)) return;
    e.preventDefault();
    if (onLockedClick) onLockedClick({ brand: target.getAttribute('data-nc-brand') || '' });
  };
  root.addEventListener('click', onClick);

  const revert = () => {
    root.removeEventListener('click', onClick);
    marked.forEach((el) => {
      el.classList.remove('nc-locked', 'nc-locked-link', 'nc-locked-cell');
      el.removeAttribute('data-nc-brand');
      el.removeAttribute('title');
      if (el.hasAttribute('data-nc-noclass')) {
        el.removeAttribute('class');
        el.removeAttribute('data-nc-noclass');
      }
    });
    chips.forEach((chip) => chip.remove());
    emails.forEach((span) => {
      if (span.parentNode) span.parentNode.replaceChild(doc.createTextNode(span.textContent), span);
    });
    slot.remove();
  };

  return { slot, total: entries.length, locked: lockedEntries.length, revert };
}
