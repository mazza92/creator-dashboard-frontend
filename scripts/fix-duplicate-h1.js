/**
 * Fix duplicate H1 tags in blog posts for SEO
 * Changes the first <h1> in content to <h2> since the page title is already H1
 */

const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../src/content/posts');

// Get all JSON files in posts directory (excluding backups)
const files = fs.readdirSync(postsDir).filter(f =>
  f.endsWith('.json') && !f.startsWith('_') && f !== 'posts.json'
);

let fixed = 0;
let skipped = 0;

files.forEach(file => {
  const filePath = path.join(postsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  try {
    const post = JSON.parse(content);

    if (!post.content) {
      console.log(`⏭️  ${file}: No content field`);
      skipped++;
      return;
    }

    // Check if content has <h1 tag
    if (!/<h1[\s>]/i.test(post.content)) {
      console.log(`✓  ${file}: No H1 in content`);
      skipped++;
      return;
    }

    // Replace the first <h1...> with <h2...> and </h1> with </h2>
    // We only want to replace the FIRST h1 tag (which is the duplicate of the page title)
    let newContent = post.content;

    // Replace first opening h1 tag
    newContent = newContent.replace(/<h1([\s>])/i, '<h2$1');

    // Replace first closing h1 tag
    newContent = newContent.replace(/<\/h1>/i, '</h2>');

    if (newContent !== post.content) {
      post.content = newContent;
      fs.writeFileSync(filePath, JSON.stringify(post, null, 2));
      console.log(`✅ ${file}: Fixed duplicate H1`);
      fixed++;
    } else {
      console.log(`⏭️  ${file}: No changes needed`);
      skipped++;
    }
  } catch (e) {
    console.error(`❌ ${file}: Error - ${e.message}`);
  }
});

console.log('\n' + '='.repeat(50));
console.log('SUMMARY');
console.log('='.repeat(50));
console.log(`Fixed: ${fixed}`);
console.log(`Skipped: ${skipped}`);
console.log(`Total: ${files.length}`);
