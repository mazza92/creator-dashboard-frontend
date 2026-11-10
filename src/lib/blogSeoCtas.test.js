import { addSignupContext, getPostContentHtml, injectSeoCtas } from './blogContent';
import companiesPost from '../content/posts/list-of-companies-that-send-pr-packages-2026.json';
import noFollowersPost from '../content/posts/brands-accepting-creators-with-no-followers-2026.json';

const section = (i) => `<h2 id="s${i}">Section ${i}</h2><p>${'Body text. '.repeat(40)}</p>`;

describe('blog SEO CTAs', () => {
  it('adds an after-intro and a mid-article CTA that carry the post slug', () => {
    const html = `<p>Intro</p>${[1, 2, 3, 4, 5, 6].map(section).join('')}`;
    const out = injectSeoCtas(html, 'my-post');
    const ctas = out.match(/data-nc-cta="[a-z_]+"/g);
    expect(ctas).toEqual(['data-nc-cta="inline_intro"', 'data-nc-cta="inline_mid"']);
    expect(out.indexOf('inline_intro')).toBeLessThan(out.indexOf('<h2 id="s1"'));
    expect(out).toContain('ref=blog&amp;slug=my-post&amp;source_page=my-post');
    // Original text untouched.
    expect(out.replace(/<aside class="nc-inline-cta"[\s\S]*?<\/aside>/g, '').replace(/\n/g, '')).toBe(html);
  });

  it('skips the intro CTA when the post already opens with one', () => {
    const html = `<div class='cta-box'><a href='#'>x</a></div>${[1, 2, 3, 4].map(section).join('')}`;
    expect(injectSeoCtas(html, 'p')).not.toContain('inline_intro');
  });

  it('leaves short posts alone', () => {
    const html = `<p>Intro</p>${section(1)}${section(2)}`;
    expect(injectSeoCtas(html, 'p')).toBe(html);
  });

  it('adds ref and source page to existing signup links without dropping their utm params', () => {
    const html = "<a href='/register/creator?utm_source=blog&utm_campaign=x'>Join</a><a href='https://app.newcollab.co/register/creator?ref=blog_widget'>W</a>";
    const out = addSignupContext(html, 'my-post');
    expect(out).toContain("href='https://app.newcollab.co/register/creator?utm_source=blog&amp;utm_campaign=x&amp;ref=blog&amp;source_page=my-post'");
    expect(out).toContain('ref=blog_widget');
  });

  it.each([companiesPost, noFollowersPost])('places both CTAs in real top posts', (post) => {
    const out = getPostContentHtml(post, { seoCtas: true });
    expect((out.match(/class="nc-inline-cta"/g) || []).length).toBeGreaterThanOrEqual(1);
    expect(getPostContentHtml(post)).not.toContain('nc-inline-cta');
  });
});
