/**
 * BlogBrandSearch - SSR Brand Search Widget for Blog Posts
 *
 * Zero client-side JS required. Uses native HTML form GET submission.
 * Designed for SEO safety: fully server-rendered, works without JS.
 *
 * Usage:
 *   <BlogBrandSearch postSlug="aussie-brands-pr-package-list-2026" />
 *
 * The form submits to /api/blog/brand-search which handles:
 *   - Brand lookup in pr_brands table
 *   - Logging to brand_search_hits or brand_demand
 *   - 302 redirect to /register/creator with appropriate params
 */

const blogBrandSearchStyles = `
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
  content: "";
  display: inline-block;
  width: 14px;
  height: 14px;
  background: #0f9d58;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E") center/contain no-repeat;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E") center/contain no-repeat;
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
`;

export default function BlogBrandSearch({ postSlug }) {
  // This component is server-rendered. The form uses native GET submission
  // to /api/blog/brand-search, which handles the redirect server-side.
  // No client-side JavaScript is required for functionality.

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: blogBrandSearchStyles }} />
      <section className="blog-brand-search" aria-label="Search brands">
        <form action="/api/blog/brand-search" method="GET" className="bbs-form">
          <input type="hidden" name="source_page" value={postSlug || ''} />
          <div className="bbs-label">
            <span className="bbs-dot" aria-hidden="true"></span>
            Live brand database
          </div>
          <h2 className="bbs-title">What brand are you after?</h2>
          <p className="bbs-sub">
            Get the verified PR contact and a personalized pitch drafted for your profile.
          </p>
          <div className="bbs-input-row">
            <input
              type="text"
              name="q"
              placeholder="e.g. Sephora, Glossier..."
              required
              minLength={2}
              maxLength={60}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <button type="submit">Get PR &rarr;</button>
          </div>
          <ul className="bbs-trust">
            <li>2,000+ brands</li>
            <li>Verified contacts</li>
            <li>340 followers welcome</li>
            <li>Free to start</li>
          </ul>
        </form>
      </section>
    </>
  );
}
