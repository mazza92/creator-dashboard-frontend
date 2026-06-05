/**
 * Add UTM parameters to all blog CTA links
 *
 * This fixes the attribution gap where organic search traffic is
 * being tagged as "Direct" due to cross-domain redirect losing referrer.
 *
 * Usage: node scripts/add-utm-to-blog-ctas.js
 */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', 'src', 'content', 'posts');

// Links that should get UTM parameters
const LINKS_TO_TAG = [
  '/register/creator',
  '/register',
  'app.newcollab.co/register',
];

// UTM template - campaign will be set per-post based on slug
function getUtmSuffix(postSlug) {
  return `?utm_source=blog&utm_medium=organic&utm_campaign=${postSlug}`;
}

function addUtmToLinks(content, postSlug) {
  let modified = content;
  let count = 0;
  const utm = getUtmSuffix(postSlug);

  // Pattern 1: href='/register/creator' or href="/register/creator"
  LINKS_TO_TAG.forEach(link => {
    // Match href='LINK' or href="LINK" without existing query params
    const patterns = [
      new RegExp(`href='(${link.replace(/\//g, '\\/')})'`, 'g'),
      new RegExp(`href="(${link.replace(/\//g, '\\/')})"`, 'g'),
    ];

    patterns.forEach(pattern => {
      const matches = modified.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Skip if already has UTM
          if (match.includes('utm_')) return;

          const replacement = match.replace(link, link + utm);
          modified = modified.replace(match, replacement);
          count++;
        });
      }
    });
  });

  return { content: modified, count };
}

function processPost(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let post;

  try {
    post = JSON.parse(content);
  } catch (e) {
    console.error(`  Error parsing ${filePath}: ${e.message}`);
    return { file: path.basename(filePath), updated: 0, error: e.message };
  }

  if (!post.content) {
    return { file: path.basename(filePath), updated: 0, skipped: 'no content' };
  }

  const { content: updatedContent, count } = addUtmToLinks(post.content, post.slug);

  if (count > 0) {
    post.content = updatedContent;
    fs.writeFileSync(filePath, JSON.stringify(post, null, 2));
    return { file: path.basename(filePath), updated: count };
  }

  return { file: path.basename(filePath), updated: 0 };
}

function main() {
  console.log('Adding UTM parameters to blog CTAs...\n');

  const files = fs.readdirSync(POSTS_DIR).filter(f =>
    f.endsWith('.json') && !f.startsWith('_')
  );

  console.log(`Found ${files.length} blog posts\n`);

  let totalUpdated = 0;
  const results = [];

  files.forEach(file => {
    const filePath = path.join(POSTS_DIR, file);
    const result = processPost(filePath);
    results.push(result);

    if (result.updated > 0) {
      console.log(`✓ ${file}: ${result.updated} links updated`);
      totalUpdated += result.updated;
    }
  });

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Total: ${totalUpdated} CTA links updated across ${files.length} posts`);
  console.log(`${'='.repeat(50)}`);

  if (totalUpdated > 0) {
    console.log('\nNext steps:');
    console.log('1. Review the changes: git diff src/content/posts/');
    console.log('2. Commit: git add -A && git commit -m "fix: add UTM to blog CTAs for attribution"');
    console.log('3. Deploy to production');
  }
}

main();
