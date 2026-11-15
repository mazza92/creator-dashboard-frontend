import { buildArticle, cleanArticleHtml, withHeadingIds, quickAnswer } from './blogArticle';
import { topicForPost, groupPostsByTopic, BLOG_TOPICS } from './blogTopics';
import { getAuthor } from './blogAuthors';

describe('cleanArticleHtml', () => {
  it('drops a first h2 that repeats the title', () => {
    const out = cleanArticleHtml('<h2>UGC Rates in 2026</h2><p>Body</p>', 'UGC Rates in 2026');
    expect(out).toBe('<p>Body</p>');
  });

  it('removes a boxed hand-written table of contents, nested divs included', () => {
    const html = '<p>Intro</p><div class="toc"><h3><span>📋</span> Table of Contents</h3><div><ul><li><a href="#a">A</a></li></ul></div></div><h2>A</h2>';
    expect(cleanArticleHtml(html, 'x')).toBe('<p>Intro</p><h2>A</h2>');
  });

  it('removes a heading + list table of contents', () => {
    const html = '<h2>Contents</h2><ol><li>One</li></ol><h2>One</h2>';
    expect(cleanArticleHtml(html, 'x')).toBe('<h2>One</h2>');
  });

  it('removes empty headings and hard-coded fonts', () => {
    const out = cleanArticleHtml('<h3> </h3><p style="font-family: Arial; color:#333; margin: 0">Hi</p>', 'x');
    expect(out).toBe('<p style="margin: 0">Hi</p>');
  });
});

describe('withHeadingIds', () => {
  it('adds ids, keeps existing ones and skips FAQ/related headings in the toc', () => {
    const { html, toc } = withHeadingIds('<h2>What UGC is</h2><h2 id="x">Rates</h2><h2>Frequently Asked Questions</h2><h2>What UGC is</h2>');
    expect(html).toContain('<h2 id="what-ugc-is">');
    expect(html).toContain('<h2 id="what-ugc-is-2">');
    expect(toc.map((t) => t.id)).toEqual(['what-ugc-is', 'x', 'what-ugc-is-2']);
  });
});

describe('quickAnswer', () => {
  const long = 'Most beginner UGC creators charge between 100 and 200 dollars per video plus usage rights in 2026.';
  it('uses the meta description when the post has no TL;DR', () => {
    expect(quickAnswer({ metaDescription: long }, '<p>Body</p>')).toBe(long);
  });
  it('is skipped when the post already opens with a TL;DR', () => {
    expect(quickAnswer({ metaDescription: long }, '<p><strong>TL;DR:</strong> yes</p>')).toBeNull();
  });
  it('buildArticle only returns a toc with 3+ sections', () => {
    expect(buildArticle({ title: 't' }, '<h2>A</h2><h2>B</h2>').toc).toEqual([]);
  });
});

describe('topics and authors', () => {
  it('routes posts to the right hub', () => {
    expect(topicForPost({ title: 'UGC Rates: How Much to Charge in 2026' })).toBe('rates-and-brand-deals');
    expect(topicForPost({ title: 'How to Build a UGC Portfolio' })).toBe('ugc-creators');
    expect(topicForPost({ title: '50 Brands That Send PR Packages' })).toBe('pr-packages');
    expect(topicForPost({ title: 'Pitch Email Templates That Get Replies' })).toBe('pitching-brands');
    expect(topicForPost({ title: 'Influencer Marketing on a Budget for Small Brands' })).toBe('for-brands');
    expect(topicForPost({ title: 'Something', topic: 'pitching-brands' })).toBe('pitching-brands');
  });
  it('groups every post into exactly one hub', () => {
    const g = groupPostsByTopic([{ title: 'a' }, { title: 'UGC tips' }]);
    expect(Object.keys(g)).toEqual(BLOG_TOPICS.map((t) => t.slug));
    expect(Object.values(g).flat()).toHaveLength(2);
  });
  it('resolves known authors', () => {
    expect(getAuthor({ name: 'Newcollab Editorial Team' }).type).toBe('Organization');
    expect(getAuthor({ name: 'Someone New' }).slug).toBe('someone-new');
  });
});

describe('duplicate title behind a CTA', () => {
  it('removes the repeated title even when a CTA heading comes first', () => {
    const html = '<div class="nc-inline-cta"><h2>Find brands</h2></div><h2>UGC Rates 2026: How Much to Charge</h2><p>x</p>';
    const out = cleanArticleHtml(html, 'UGC Rates 2026: How Much to Charge for UGC');
    expect(out).toBe('<div class="nc-inline-cta"><h2>Find brands</h2></div><p>x</p>');
  });
});

describe('normalizeHtml', () => {
  it('closes unclosed tags so following siblings cannot be swallowed', () => {
    const { normalizeHtml } = require('./blogArticle');
    expect(normalizeHtml('<div><p>a<ul><li>b</div>')).toBe('<div><p>a</p><ul><li>b</li></ul></div>');
    expect(normalizeHtml('<p>x</p></div><p>y</p>')).toBe('<p>x</p><p>y</p>');
  });
});
