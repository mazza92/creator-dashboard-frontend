/**
 * Client-safe blog content helpers (no Node fs imports).
 */

// Phase 1 allowed slugs for blog widget (matches feature_flags.blog_widget_v1)
const BLOG_WIDGET_ALLOWED_SLUGS = [
  'aussie-brands-pr-package-list-2026',
  'gaming-tech-brands-that-sponsor-small-streamers-2026',
  'pr-list-for-clothing-brands-micro-influencers-2025',
  'companies-with-open-pr-application-forms-influencers-2025',
  'ultimate-2026-directory-brands-with-open-pr-application-forms'
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

export function getPostContentHtml(post, options = {}) {
  let html = post?.content || '';

  // Strip embedded FAQ if post has structured FAQ
  if (post?.faq?.length) {
    html = stripEmbeddedFaqFromContent(html);
  }

  // NOTE: Widget is now rendered as React component in BlogPostClient.js
  // Static HTML injection disabled - use BlogBrandSearchWidget instead
  // if (options.injectBrandSearch === true && post?.slug) {
  //   html = injectBrandSearchWidget(html, post.slug);
  // }

  return html;
}
