const fs = require('fs').promises;
const path = require('path');

async function updatePostsIndex() {
  try {
    const postsDir = path.join(__dirname, '../src/content/posts');
    const files = await fs.readdir(postsDir);
    const postSlugs = files
      .filter(f => f.endsWith('.json') && f !== 'posts.json')
      .map(f => f.replace('.json', ''));
    
    await fs.writeFile(
      path.join(postsDir, 'posts.json'),
      JSON.stringify(postSlugs, null, 2)
    );
    console.log('Posts index updated successfully!');
  } catch (error) {
    console.error('Error updating posts index:', error);
    process.exit(1);
  }
}

updatePostsIndex(); 