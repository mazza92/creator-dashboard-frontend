/**
 * Client-safe blog content helpers (no Node fs imports).
 */

import MERGED_POSTS from '../content/posts/merged.json';

// Phase 1 allowed slugs for blog widget (matches feature_flags.blog_widget_v1)
const BLOG_WIDGET_ALLOWED_SLUGS = [
  'aussie-brands-pr-package-list-2026',
  'gaming-tech-brands-that-sponsor-small-streamers-2026',
  'pr-list-for-clothing-brands-micro-influencers-2025',
  'companies-with-open-pr-application-forms-influencers-2025',
  'ultimate-2026-directory-brands-with-open-pr-application-forms',
  'list-of-companies-that-send-pr-packages-2026',
  '50-ugc-product-ideas-for-beginners-2026',
  'how-to-build-a-ugc-portfolio-brands-want-2026',
  'k-beauty-korean-skincare-brands-pr-list-small-creators-2026',
  'pr-emails-for-brands-2026',
  'how-i-got-on-pr-lists-australia-2026',
];

/**
 * Generate the blog brand search widget HTML.
 * This is SSR-safe: no client JS required, native form submission.
 */
function getBrandSearchWidgetHtml(postSlug) {
  return `
<section class="blog-brand-search" aria-label="Search brands">
  <style>
    .blog-brand-search {
      margin: 32px 0;
      padding: 24px;
      background: linear-gradient(135deg, #fff5f7 0%, #fef2f4 100%);
      border: 1px solid #fce4ea;
      border-radius: 16px;
    }
    .bbs-label {
      font-size: 12px;
      font-weight: 600;
      color: #e8395f;
      text-transform: uppercase;
      letter-spacing: .08em;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .bbs-dot {
      width: 6px;
      height: 6px;
      background: #e8395f;
      border-radius: 50%;
      animation: bbs-pulse 2s ease-in-out infinite;
    }
    @keyframes bbs-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .bbs-title {
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 6px;
      letter-spacing: -.01em;
      color: #1a1a1a;
    }
    .bbs-sub {
      font-size: 15px;
      color: #6b6f78;
      margin: 0 0 18px;
      line-height: 1.5;
    }
    .bbs-input-row {
      display: flex;
      gap: 10px;
    }
    .bbs-input-row input[type="text"] {
      flex: 1;
      padding: 14px 16px;
      font-size: 16px;
      border: 1.5px solid #e5e7eb;
      background: #fff;
      border-radius: 10px;
      outline: none;
      font-family: inherit;
      min-width: 0;
    }
    .bbs-input-row input[type="text"]:focus {
      border-color: #e8395f;
      box-shadow: 0 0 0 4px rgba(232,57,95,.12);
    }
    .bbs-input-row input[type="text"]::placeholder {
      color: #9ca3af;
    }
    .bbs-input-row button {
      background: #e8395f;
      color: #fff;
      border: none;
      padding: 0 22px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      white-space: nowrap;
      transition: background 0.15s ease;
    }
    .bbs-input-row button:hover {
      background: #c92549;
    }
    .bbs-input-row button:active {
      background: #b01f3f;
    }
    .bbs-trust {
      display: flex;
      gap: 16px;
      margin: 12px 0 0;
      padding: 0;
      list-style: none;
      font-size: 13px;
      color: #6b6f78;
      flex-wrap: wrap;
    }
    .bbs-trust li {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .bbs-trust li::before {
      content: "\\2713";
      color: #0f9d58;
      font-weight: 700;
      margin-right: 4px;
    }
    @media (max-width: 640px) {
      .blog-brand-search {
        padding: 20px;
        margin: 24px 0;
      }
      .bbs-title {
        font-size: 20px;
      }
      .bbs-input-row {
        flex-direction: column;
      }
      .bbs-input-row button {
        padding: 14px;
        width: 100%;
      }
      .bbs-trust {
        gap: 12px;
      }
    }
  </style>
  <form action="/api/blog/brand-search" method="GET" class="bbs-form">
    <input type="hidden" name="source_page" value="${postSlug}">
    <div class="bbs-label">
      <span class="bbs-dot" aria-hidden="true"></span>
      Live brand database
    </div>
    <h2 class="bbs-title">What brand are you after?</h2>
    <p class="bbs-sub">
      Get the verified PR contact and a personalized pitch drafted for your profile.
    </p>
    <div class="bbs-input-row">
      <input
        type="text"
        name="q"
        placeholder="e.g. Sephora, Glossier..."
        required
        minlength="2"
        maxlength="60"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      >
      <button type="submit">Get PR &rarr;</button>
    </div>
    <ul class="bbs-trust">
      <li>2,000+ brands</li>
      <li>Verified contacts</li>
      <li>340 followers welcome</li>
      <li>Free to start</li>
    </ul>
  </form>
  <script>
    // Blog widget analytics (progressive enhancement - widget works without JS)
    (function() {
      var widget = document.querySelector('.blog-brand-search');
      var form = widget && widget.querySelector('form');
      var sourcePage = '${postSlug}';

      // Track impression on load
      if (widget && typeof window.dataLayer !== 'undefined') {
        window.dataLayer.push({
          event: 'blog_widget_impression',
          source_page: sourcePage
        });
      }

      // Track submit on form submission
      if (form) {
        form.addEventListener('submit', function() {
          var input = form.querySelector('input[name="q"]');
          var queryLen = input ? input.value.length : 0;
          if (typeof window.dataLayer !== 'undefined') {
            window.dataLayer.push({
              event: 'blog_widget_submit',
              source_page: sourcePage,
              query_length: queryLen
            });
          }
        });
      }
    })();
  </script>
</section>`;
}

const KIT_PITCH_CTA_SLUGS = [
  'companies-with-open-pr-application-forms-influencers-2025',
  'ultimate-2026-directory-brands-with-open-pr-application-forms',
  'k-beauty-korean-skincare-brands-pr-list-small-creators-2026',
  'pr-list-for-clothing-brands-micro-influencers-2025',
  'list-of-companies-that-send-pr-packages-2026',
  'how-i-got-on-pr-lists-australia-2026',
  'aussie-brands-pr-package-list-2026',
  'pr-emails-for-brands-2026',
  'how-to-build-a-ugc-portfolio-brands-want-2026',
  'how-to-create-high-impact-media-kit-under-30-minutes-free-template',
  'creators-guide-building-media-kit-2025',
  '50-ugc-product-ideas-for-beginners-2026',
];

const PORTFOLIO_BUILDER_PATH = '/media-kit';
const PORTFOLIO_LINK_SKIP_TAGS = /^(a|script|style|code|pre|h[1-6]|textarea|noscript|svg|button)$/i;
const PORTFOLIO_VOID_TAGS = /^(br|img|input|hr|meta|link|source|col|area|wbr)$/i;
const PORTFOLIO_PHRASE_RE = /free\s+ugc\s+portfolio\s+builders?|ugc\s+portfolio\s+builders?|free\s+portfolio\s+builders?|ugc\s+portfolios?|creator\s+portfolios?|media\s+kits?|free\s+portfolios?|\bportfolios?\b/gi;

function portfolioBuilderHref(slug) {
  const campaign = encodeURIComponent(slug || 'blog');
  return `${PORTFOLIO_BUILDER_PATH}?utm_source=blog&utm_medium=organic&utm_campaign=portfolio_builder&utm_content=${campaign}`;
}

function shouldSkipBarePortfolio(text, index, match) {
  if (!/^portfolios?$/i.test(match)) return false;
  const before = text.slice(Math.max(0, index - 28), index);
  if (/\b(investment|stock|etf|real[\s-]?estate|property)\s+$/i.test(before)) return true;
  const after = text.slice(index + match.length, index + match.length + 18);
  if (/^\s+(manager|management|company|companies)\b/i.test(after)) return true;
  return false;
}

function isInsideUrl(text, index) {
  const before = text.slice(0, index);
  return /https?:\/\/\S*$/i.test(before) || /newcollab\.co\/\S*$/i.test(before);
}

/**
 * Turn media kit / UGC portfolio mentions into links to the free builder.
 * Skips existing anchors, headings, and code so we do not nest links.
 */
export function linkPortfolioMentions(html, options = {}) {
  if (!html || typeof html !== 'string') return html;

  const href = portfolioBuilderHref(options.slug).replace(/&/g, '&amp;');
  const open = `<a href="${href}" style="color:#26A69A;text-decoration:underline;text-underline-offset:2px;font-weight:600;">`;
  const skipStack = [];

  return html.split(/(<[^>]+>)/g).map((token) => {
    if (!token) return token;
    if (token.startsWith('<')) {
      const close = /^<\/\s*([a-z0-9]+)/i.exec(token);
      if (close) {
        const name = close[1].toLowerCase();
        const idx = skipStack.lastIndexOf(name);
        if (idx !== -1) skipStack.splice(idx, 1);
        return token;
      }
      const openTag = /^<\s*([a-z0-9]+)/i.exec(token);
      if (openTag && !/\/\s*>$/.test(token)) {
        const name = openTag[1].toLowerCase();
        if (PORTFOLIO_VOID_TAGS.test(name)) return token;
        if (PORTFOLIO_LINK_SKIP_TAGS.test(name)) skipStack.push(name);
      }
      return token;
    }
    if (skipStack.length) return token;
    return token.replace(PORTFOLIO_PHRASE_RE, (match, offset) => {
      if (isInsideUrl(token, offset) || shouldSkipBarePortfolio(token, offset, match)) {
        return match;
      }
      return `${open}${match}</a>`;
    });
  }).join('');
}

export function getFaqAnswerHtml(answer, slug) {
  if (!answer) return '';
  return linkPortfolioMentions(rewriteMergedPostLinks(String(answer)), { slug });
}

export function getFaqAnswerSchemaText(answer, slug) {
  const html = getFaqAnswerHtml(answer, slug);
  return html
    .replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
      const path = String(href).replace(/&amp;/g, '&');
      const abs = path.startsWith('http')
        ? path.split('?')[0]
        : `https://newcollab.co${path.split('?')[0]}`;
      const label = String(text).replace(/<[^>]+>/g, '');
      return `${label} (${abs})`;
    })
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getKitPitchCtaHtml(postSlug) {
  const campaign = encodeURIComponent(postSlug || 'blog');
  return `
<div class="cta-box kit-pitch-cta" style="background:#FFF0F3;border-left:4px solid #EC407A;padding:1.5rem;margin:2rem 0;border-radius:4px;">
  <p style="margin:0 0 1rem;font-size:1rem;color:#333;">Most creators get ignored on application forms — brands receive hundreds per week. Publish a <a href="${PORTFOLIO_BUILDER_PATH}?utm_source=blog&amp;utm_medium=organic&amp;utm_campaign=kit_pitch&amp;utm_content=${campaign}" style="color:#EC407A;font-weight:600;">free UGC portfolio</a> in minutes and paste that link in your pitch. Newcollab can also attach your kit automatically when you send from the directory.</p>
  <a href="${PORTFOLIO_BUILDER_PATH}?utm_source=blog&amp;utm_medium=organic&amp;utm_campaign=kit_pitch&amp;utm_content=${campaign}" style="display:inline-block;background:#EC407A;color:#fff;padding:0.75rem 1.5rem;border-radius:4px;text-decoration:none;font-weight:600;">Build your free UGC portfolio →</a>
</div>`;
}

function injectKitPitchCta(html, postSlug) {
  if (!html || !KIT_PITCH_CTA_SLUGS.includes(postSlug)) return html;
  if (html.includes('kit-pitch-cta')) return html;
  const pMatch = html.match(/<\/p>/i);
  if (!pMatch) return html;
  const insertPos = pMatch.index + 4;
  return html.slice(0, insertPos) + getKitPitchCtaHtml(postSlug) + html.slice(insertPos);
}

const PORTFOLIO_STOPPER_SLUGS = [
  'ultimate-2026-directory-brands-with-open-pr-application-forms',
  'skincare-brands-that-send-pr-to-small-influencers-2026',
  'k-beauty-korean-skincare-brands-pr-list-small-creators-2026',
  'companies-with-open-pr-application-forms-influencers-2025',
  'k-beauty-pr-application-forms-2026',
  'list-of-companies-that-send-pr-packages-2026',
  'gaming-tech-brands-that-sponsor-small-streamers-2026',
  'brands-accepting-creators-with-no-followers-2026',
  'how-to-get-paid-partnership-on-tiktok-2025',
  'us-brands-send-pr-micro-influencers-2026-list',
  'pr-list-for-clothing-brands-micro-influencers-2025',
  'brands-that-pay-for-ugc-content-2026',
  'aussie-brands-pr-package-list-2026',
  'food-brands-sending-pr-packages-2026',
];

function getPortfolioScrollStopperHtml(postSlug) {
  const href = portfolioBuilderHref(postSlug).replace(/&/g, '&amp;');
  return `
<aside class="portfolio-scroll-stopper" aria-label="Free UGC portfolio builder">
  <style>
    .portfolio-scroll-stopper {
      margin: 2.75rem 0;
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .portfolio-scroll-stopper * { box-sizing: border-box; }
    .portfolio-scroll-stopper p { margin: 0; }
    .pss-card {
      display: grid;
      gap: 10px;
      padding: 22px 24px 20px;
      background: #fff;
      border: 1px solid #ebebeb;
      border-radius: 20px;
      box-shadow: 0 1px 3px rgba(15,15,15,.04), 0 10px 28px rgba(15,15,15,.04);
    }
    .pss-kicker {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: #e11d48;
    }
    .pss-kicker::before {
      content: "";
      width: 6px;
      height: 6px;
      border-radius: 99px;
      background: #e11d48;
    }
    .pss-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -.03em;
      line-height: 1.2;
      color: #0f0f0f;
    }
    .pss-body {
      font-size: 15px;
      line-height: 1.55;
      color: #4b4b4b;
      max-width: 46rem;
    }
    .pss-row {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
      margin-top: 6px;
    }
    .pss-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      padding: 0 18px;
      border-radius: 10px;
      background: #0f0f0f;
      color: #fff !important;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -.01em;
      text-decoration: none !important;
    }
    .pss-btn:hover { background: #1c1c1c; color: #fff !important; }
    .pss-meta {
      font-size: 13px;
      color: #8c8c8c;
      letter-spacing: -.01em;
    }
    @media (max-width: 640px) {
      .pss-card { padding: 18px 16px 16px; border-radius: 16px; }
      .pss-title { font-size: 19px; }
      .pss-btn { width: 100%; }
    }
  </style>
  <div class="pss-card">
    <div class="pss-kicker">Free UGC portfolio</div>
    <p class="pss-title">Pause here. Publish a live portfolio before you apply.</p>
    <p class="pss-body">Brands on this list open a link, not a Canva PDF. Build a public UGC portfolio in minutes — no account — and paste it in the form, the email, and your bio.</p>
    <div class="pss-row">
      <a class="pss-btn" href="${href}">Build yours free</a>
      <span class="pss-meta">No Canva · newcollab.co/kit/you</span>
    </div>
  </div>
</aside>`;
}

function findPortfolioStopperInsertPos(html) {
  const tocIdx = html.search(/class=['"]toc-container['"]/i);
  if (tocIdx !== -1) {
    const afterToc = html.slice(tocIdx);
    const h2 = afterToc.match(/<h2\b/i);
    if (h2) return tocIdx + h2.index;
  }

  const indexes = [];
  const re = /<h2\b/gi;
  let match;
  while ((match = re.exec(html))) indexes.push(match.index);
  if (indexes.length >= 2) return indexes[1];
  if (indexes.length === 1) {
    const after = html.slice(indexes[0]);
    const p = after.match(/<\/p>/i);
    if (p) return indexes[0] + p.index + 4;
  }

  const pMatch = html.match(/<\/p>/i);
  return pMatch ? pMatch.index + 4 : -1;
}

function injectPortfolioScrollStopper(html, postSlug) {
  if (!html || !PORTFOLIO_STOPPER_SLUGS.includes(postSlug)) return html;
  if (html.includes('portfolio-scroll-stopper')) return html;
  const insertPos = findPortfolioStopperInsertPos(html);
  if (insertPos < 0) return html;
  return html.slice(0, insertPos) + getPortfolioScrollStopperHtml(postSlug) + html.slice(insertPos);
}

/**
 * Inject the brand search widget after the intro paragraph, before the first H2.
 * Only injects for allowed post slugs (Phase 1 rollout).
 */
export function injectBrandSearchWidget(html, postSlug) {
  if (!html || typeof html !== 'string') return html;
  if (!postSlug || !BLOG_WIDGET_ALLOWED_SLUGS.includes(postSlug)) return html;

  // Find the first H2 tag
  const h2Match = html.match(/<h2[^>]*>/i);
  if (!h2Match) {
    // No H2 found - append at the start (after first paragraph if exists)
    const pMatch = html.match(/<\/p>/i);
    if (pMatch) {
      const insertPos = pMatch.index + 4; // after </p>
      return html.slice(0, insertPos) + getBrandSearchWidgetHtml(postSlug) + html.slice(insertPos);
    }
    // No paragraph either - prepend
    return getBrandSearchWidgetHtml(postSlug) + html;
  }

  // Insert widget before the first H2
  const insertPos = h2Match.index;
  return html.slice(0, insertPos) + getBrandSearchWidgetHtml(postSlug) + html.slice(insertPos);
}

/**
 * Check if blog widget is enabled for a post slug
 */
export function isBlogWidgetEnabled(postSlug) {
  return BLOG_WIDGET_ALLOWED_SLUGS.includes(postSlug);
}

export function stripEmbeddedFaqFromContent(html) {
  if (!html || typeof html !== 'string') return html;

  const faqHeading = html.match(/<h2[^>]*\bid=['"]faq['"][^>]*>/i);
  if (!faqHeading) return html;

  const start = faqHeading.index;
  const afterFaq = html.slice(start);
  const ctaMatch = afterFaq.match(/<div\s+class=['"]cta-section/i);
  if (ctaMatch) {
    return html.slice(0, start) + afterFaq.slice(ctaMatch.index);
  }

  return html.slice(0, start);
}

const MERGED_LINK_RE = /(href=["'])(?:https:\/\/(?:www\.)?newcollab\.co)?\/blog\/([a-z0-9-]+)\/?(?=[#?"'])/gi;

/** Point links at merged posts straight to their target (skip the 301 hop). */
export function rewriteMergedPostLinks(html) {
  if (!html || typeof html !== 'string') return html;
  return html.replace(MERGED_LINK_RE, (match, prefix, slug) => {
    const target = MERGED_POSTS[slug.toLowerCase()];
    return target ? `${prefix}/blog/${target}` : match;
  });
}

// ---------------------------------------------------------------------------
// SEO conversion: contextual signup CTAs inside the article (server-rendered, so no layout
// shift) and signup context on the post's existing register links.
// ---------------------------------------------------------------------------

const SIGNUP_URL = 'https://app.newcollab.co/register/creator';
const CTA_CLASS_RE = /class=['"][^'"]*\b(cta-box|cta-section|kit-pitch-cta|portfolio-scroll-stopper|nc-inline-cta)\b/i;

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Same params as seoSignupHref() in seoConversion.js, with a fixed origin so SSR and hydration match. */
export function blogSignupHref(slug, location) {
  const params = new URLSearchParams({
    ref: 'blog',
    slug,
    source_page: slug,
    utm_source: 'blog',
    utm_medium: 'seo_cta',
    utm_campaign: location,
    utm_content: slug,
  });
  return `${SIGNUP_URL}?${params.toString()}`;
}

/** A post whose body is mostly a brand list (lots of brand/directory links). */
export function isBrandListPost(html) {
  return ((html || '').match(/href=['"]\/(?:directory|brand)\b/gi) || []).length >= 10;
}

function inlineCtaHtml({ slug, location, kicker, title, body, button, meta }) {
  return `
<aside class="nc-inline-cta" data-nc-cta-block="${location}" aria-label="${escapeAttr(kicker)}">
  <p class="nc-inline-cta__kicker">${kicker}</p>
  <p class="nc-inline-cta__title">${title}</p>
  <p class="nc-inline-cta__body">${body}</p>
  <p class="nc-inline-cta__row"><a class="nc-inline-cta__btn" data-nc-cta="${location}" href="${escapeAttr(blogSignupHref(slug, location))}">${button}</a><span class="nc-inline-cta__meta">${meta}</span></p>
</aside>`;
}

function introCta(slug, listPost) {
  return listPost
    ? inlineCtaHtml({
      slug,
      location: 'inline_intro',
      kicker: 'Faster than applying one by one',
      title: 'Let Polly pitch the brands on this list for you',
      body: 'Polly finds the right PR contact, writes a short pitch in your voice with your portfolio link, and follows up. Made for UGC creators with 1k to 50k followers.',
      button: 'Try Polly free',
      meta: 'Free plan · No follower minimum',
    })
    : inlineCtaHtml({
      slug,
      location: 'inline_intro',
      kicker: 'For UGC creators',
      title: 'Find brands that send PR to creators your size',
      body: 'Newcollab lists 2,000+ brands with open PR programs, the verified contact for each one, and drafts the pitch for you.',
      button: 'Find my brands, free',
      meta: 'Free plan · No follower minimum',
    });
}

function midCta(slug) {
  return inlineCtaHtml({
    slug,
    location: 'inline_mid',
    kicker: 'Found a brand you like?',
    title: 'Get its verified PR contact in one click',
    body: 'A free account shows PR emails and application links for 2,000+ brands, plus a free UGC portfolio to send with your pitch.',
    button: 'Unlock contacts free',
    meta: 'Takes 30 seconds',
  });
}

function h2Positions(html) {
  const out = [];
  const re = /<h2\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    if (!/\bid=['"]faq['"]/i.test(m[0])) out.push(m.index);
  }
  return out;
}

/** Insert an after-intro and a mid-article CTA, skipping spots that already have a CTA nearby. */
export function injectSeoCtas(html, slug) {
  if (!html || !slug || html.includes('nc-inline-cta')) return html;
  const h2s = h2Positions(html);
  if (h2s.length < 3) return html;

  const inserts = [];
  const nearCta = (pos, before = 1500) => CTA_CLASS_RE.test(html.slice(Math.max(0, pos - before), pos));

  if (!CTA_CLASS_RE.test(html.slice(0, h2s[0]))) inserts.push({ pos: h2s[0], html: introCta(slug, isBrandListPost(html)) });

  const middle = html.length / 2;
  const mid = h2s
    .slice(1)
    .sort((a, b) => Math.abs(a - middle) - Math.abs(b - middle))
    .find((pos) => pos > html.length * 0.3 && pos < html.length * 0.75 && !nearCta(pos));
  if (mid !== undefined) inserts.push({ pos: mid, html: midCta(slug) });

  return inserts
    .sort((a, b) => b.pos - a.pos)
    .reduce((acc, ins) => acc.slice(0, ins.pos) + ins.html + acc.slice(ins.pos), html);
}

const REGISTER_HREF_RE = /(href=['"])((?:https:\/\/app\.newcollab\.co)?\/register\/creator)(\?[^'"]*)?(['"])/gi;

/** Give the post's own signup links the same context (ref, source page) as the new CTAs. */
export function addSignupContext(html, slug) {
  if (!html || !slug) return html;
  return html.replace(REGISTER_HREF_RE, (match, open, path, query, close) => {
    const raw = (query || '').slice(1).replace(/&amp;/g, '&');
    const params = new URLSearchParams(raw);
    if (params.has('ref')) return match;
    params.set('ref', 'blog');
    params.set('source_page', slug);
    return `${open}${SIGNUP_URL}?${params.toString().replace(/&/g, '&amp;')}${close}`;
  });
}

export function getPostContentHtml(post, options = {}) {
  let html = rewriteMergedPostLinks(post?.content || '');

  // Strip embedded FAQ if post has structured FAQ
  if (post?.faq?.length) {
    html = stripEmbeddedFaqFromContent(html);
  }

  if (post?.slug) {
    html = injectKitPitchCta(html, post.slug);
  }

  html = linkPortfolioMentions(html, { slug: post?.slug || options.slug || 'blog' });

  if (post?.slug) {
    html = injectPortfolioScrollStopper(html, post.slug);
  }

  if (options.seoCtas && post?.slug) {
    html = addSignupContext(injectSeoCtas(html, post.slug), post.slug);
  }

  return html;
}
