const PLATFORM_MENTION = /(Instagram|TikTok|YouTube) \((https?:\/\/[^\s)]+)\)/g;

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Turn `Instagram (url)` into a real <a>Instagram</a> for the editor. */
export function pitchPlainToHtml(plain) {
  if (!plain) return '';
  let html = escapeHtml(plain).replace(/\n/g, '<br>');
  html = html.replace(
    PLATFORM_MENTION,
    '<a class="pitch-social-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
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
    const platform = /^(Instagram|TikTok|YouTube)$/i.test(text);
    const replacement = platform && href
      ? `${text} (${href})`
      : (href && text && text !== href ? `${text} ${href}` : (href || text));
    anchor.replaceWith(document.createTextNode(replacement));
  });
  return (clone.innerText || clone.textContent || '').replace(/\u00a0/g, ' ');
}

export async function copyPitchRich(plain) {
  const html = `<div>${pitchPlainToHtml(plain)}</div>`;
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plain || ''], { type: 'text/plain' }),
        }),
      ]);
      return;
    } catch (_) { /* fall through */ }
  }
  await navigator.clipboard.writeText(plain || '');
}
