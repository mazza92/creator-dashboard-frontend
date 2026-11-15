// Article HTML clean-up + table of contents + quick answer, done once on the server for every post.
import { parseFragment, serialize } from 'parse5';

/**
 * Re-serialise the article through a real HTML parser. Post HTML is hand-written and some of it leaves tags
 * unclosed or mis-nested; the browser then "repairs" the server HTML by pulling the elements that follow the
 * article (CTA cards) inside it, React's hydration no longer matches, and the page re-renders client-side
 * (React #418), swallowing the first clicks. Parsing it the way the browser will makes the markup well-formed.
 */
export function normalizeHtml(html) {
  try {
    return serialize(parseFragment(String(html || '')));
  } catch {
    return String(html || '');
  }
}

function plain(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugifyHeading(text) {
  return plain(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'section';
}

function same(a, b) {
  const n = (s) => plain(s).toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const x = n(a);
  const y = n(b);
  return Boolean(x) && Boolean(y) && (x === y || x.startsWith(y.slice(0, 30)) || y.startsWith(x.slice(0, 30)));
}

/**
 * - drops a first <h2> that repeats the page title (the page already has the <h1>)
 * - drops the hand-written "Table of Contents" block (the page renders its own, sticky one)
 * - drops empty headings
 * - strips hard-coded fonts / text colours so the article uses the site typography
 */
export function cleanArticleHtml(html, title) {
  let out = String(html || '');
  // The repeated title can sit behind an inline CTA card, so look at every <h2> near the top, not only the first.
  const re = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  let h;
  while ((h = re.exec(out)) && h.index < 4000) {
    if (same(h[1], title)) {
      out = out.slice(0, h.index) + out.slice(h.index + h[0].length);
      break;
    }
  }
  out = removeHandwrittenToc(out);
  out = out.replace(/<(h[1-6])\b[^>]*>\s*(?:<br\s*\/?>|&nbsp;|\s)*<\/\1>/gi, '');
  out = out.replace(/style=(["'])([^"']*)\1/gi, (m, q, css) => {
    const kept = css
      .split(';')
      .map((d) => d.trim())
      .filter((d) => d && !/^(font-family|color\s*:\s*#(?:333|333333|222|1a1a1a)\b|line-height)/i.test(d))
      .join('; ');
    return kept ? `style=${q}${kept}${q}` : '';
  });
  return out;
}

const TOC_TEXT = /^[^a-z]*(table of contents|contents|in this (guide|article|post))\s*:?$/i;

function findTocHeading(html) {
  const re = /<(h[2-4])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(html))) {
    if (TOC_TEXT.test(plain(m[2]))) return m;
  }
  return null;
}

/** The element starting at `start` (a <div>, <ul> or <ol>), end index after its balanced closing tag. */
function elementEnd(html, start) {
  const tag = (html.slice(start).match(/^<(div|ul|ol|nav)\b/i) || [])[1];
  if (!tag) return -1;
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = start;
  let depth = 0;
  let m;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return re.lastIndex;
  }
  return -1;
}

/** Remove the hand-written "Table of Contents" (heading + list, or the box wrapping both). */
function removeHandwrittenToc(html) {
  const m = findTocHeading(html);
  if (!m) return html;
  const hStart = m.index;
  const hEnd = hStart + m[0].length;
  // Wrapped in a box: the nearest <div> or <nav> opening just before the heading, with nothing else in between.
  const before = html.slice(Math.max(0, hStart - 600), hStart);
  const open = before.match(/<(div|nav)\b[^>]*>\s*$/i);
  if (open) {
    const boxStart = hStart - open[0].length;
    const end = elementEnd(html, boxStart);
    if (end > hEnd) return html.slice(0, boxStart) + html.slice(end);
  }
  // Heading followed by a list.
  const after = html.slice(hEnd);
  const list = after.match(/^\s*<(ul|ol|div|nav)\b/i);
  if (list) {
    const listStart = hEnd + after.indexOf('<');
    const end = elementEnd(html, listStart);
    if (end > 0) return html.slice(0, hStart) + html.slice(end);
  }
  return html.slice(0, hStart) + html.slice(hEnd);
}

const SKIP_TOC = /^(related posts|frequently asked questions|faq|sources)/i;

/** Give every <h2> an id and return the list for the table of contents. */
export function withHeadingIds(html) {
  const toc = [];
  const used = new Set();
  const out = String(html || '').replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, (m, attrs, inner) => {
    const text = plain(inner);
    if (!text) return m;
    let id = (attrs.match(/\bid=["']([^"']+)["']/i) || [])[1];
    if (!id) {
      id = slugifyHeading(text);
      let n = 2;
      while (used.has(id)) id = `${slugifyHeading(text)}-${n++}`;
    }
    used.add(id);
    // Inline CTA cards carry their own headings: keep them out of the contents.
    if (!SKIP_TOC.test(text) && !/nc-inline-cta|cta/i.test(attrs)) toc.push({ id, text });
    if (/\bid=/.test(attrs)) return m;
    return `<h2 id="${id}"${attrs}>${inner}</h2>`;
  });
  return { html: out, toc };
}

const HAS_ANSWER = /(tl;dr|quick answer|key takeaways|in short:|the short answer)/i;

/**
 * The 40-70 word answer shown above the article (what AI Overviews / ChatGPT quote): post.quickAnswer when
 * written, else the meta description or excerpt. Skipped when the post already opens with its own TL;DR.
 */
export function quickAnswer(post, html) {
  if (!post) return null;
  if (post.quickAnswer) return String(post.quickAnswer).trim();
  if (HAS_ANSWER.test(String(html || '').slice(0, 6000))) return null;
  const text = plain(post.metaDescription || post.excerpt || '');
  if (text.split(' ').length < 12) return null;
  return text;
}

export function buildArticle(post, contentHtml) {
  const cleaned = cleanArticleHtml(contentHtml, post?.title);
  const { html, toc } = withHeadingIds(normalizeHtml(cleaned));
  return { html, toc: toc.length >= 3 ? toc : [], quickAnswer: quickAnswer(post, cleaned) };
}
