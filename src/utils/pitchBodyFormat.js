const PLATFORM_MENTION = /(Instagram|TikTok|YouTube) \((https?:\/\/[^\s)]+)\)/g;
const EXAMPLE_MENTION = /(Example \d+) \((https?:\/\/[^\s)]+)\)/g;
const LABELED_LINK = /^(Instagram|TikTok|YouTube|Example \d+)$/i;
const EXAMPLES_HEADING = 'Some content examples I posted recently:';
const EXAMPLES_BLOCK_RE = /(?:Some content examples I posted recently:|Closest examples:)[ \t]*\n+(?:(?:• |Example \d+ \()?https?:\/\/[^\s)\n]+\)?[ \t]*\n*)+/g;

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function urlsIn(block) {
  return [...String(block || '').matchAll(/https?:\/\/[^\s)\n]+/g)].map((m) => m[0]);
}

/** Mailto / clipboard plain text: one auto-linkable URL per line. */
export function pitchPlainForEmail(plain) {
  if (!plain) return '';
  return String(plain)
    .replace(EXAMPLES_BLOCK_RE, (block) => {
      const urls = urlsIn(block);
      if (!urls.length) return block;
      return `${EXAMPLES_HEADING}\n\n${urls.join('\n')}\n\n`;
    })
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trimEnd();
}

/** Turn `Instagram (url)` into a real <a>Instagram</a>; example URLs become short pills. */
export function pitchPlainToHtml(plain) {
  if (!plain) return '';
  const normalized = pitchPlainForEmail(plain);
  const withLabels = normalized.replace(
    /(Some content examples I posted recently:)\n+((?:https?:\/\/[^\s\n]+\n*)+)/g,
    (_, heading, block) => {
      const urls = urlsIn(block);
      const labels = urls.map((u, i) => `Example ${i + 1} (${u})`).join('\n');
      return `${heading}\n${labels}`;
    }
  );
  let html = escapeHtml(withLabels).replace(/\n/g, '<br>');
  html = html.replace(
    PLATFORM_MENTION,
    '<a class="pitch-social-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  html = html.replace(
    EXAMPLE_MENTION,
    '<a class="pitch-example-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  html = html.replace(/https?:\/\/[^\s<]+/g, (url, offset, full) => {
    const before = full.slice(Math.max(0, offset - 6), offset);
    if (before.endsWith('href="')) return url;
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
  return html;
}

/** Serialize the contenteditable back to the stored plain-text format. */
export function htmlToPitchPlain(root) {
  if (!root) return '';
  const clone = root.cloneNode(true);
  clone.querySelectorAll('a[href]').forEach((anchor) => {
    const href = (anchor.getAttribute('href') || '').trim();
    const text = (anchor.textContent || '').trim();
    if (/^Example \d+$/i.test(text) && href) {
      anchor.replaceWith(document.createTextNode(`\n${href}`));
      return;
    }
    const labeled = LABELED_LINK.test(text);
    const replacement = labeled && href
      ? `${text} (${href})`
      : (href && text && text !== href ? `${text} ${href}` : (href || text));
    anchor.replaceWith(document.createTextNode(replacement));
  });
  return pitchPlainForEmail((clone.innerText || clone.textContent || '').replace(/\u00a0/g, ' '));
}

export async function copyPitchRich(plain) {
  const emailPlain = pitchPlainForEmail(plain);
  const html = `<div>${pitchPlainToHtml(emailPlain)}</div>`;
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([emailPlain || ''], { type: 'text/plain' }),
        }),
      ]);
      return;
    } catch (_) { /* fall through */ }
  }
  await navigator.clipboard.writeText(emailPlain || '');
}
