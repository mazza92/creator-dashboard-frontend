const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createPost() {
  try {
    // Get post details from user
    const title = await question('Enter post title: ');
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const excerpt = await question('Enter post excerpt: ');
    const category = await question('Enter post category (Monetization, Audience Growth, Creator Success, Platform Development, Social Media): ');
    const tags = (await question('Enter tags (comma-separated): ')).split(',').map(tag => tag.trim());
    const keywords = (await question('Enter keywords (comma-separated): ')).split(',').map(keyword => keyword.trim());
    const metaDescription = await question('Enter meta description: ');
    
    // Create post template
    const post = {
      slug,
      title,
      excerpt,
      content: `# ${title}\n\n${excerpt}\n\n## Introduction\n\n[Your introduction here]\n\n## Main Content\n\n[Your main content here]\n\n## Conclusion\n\n[Your conclusion here]`,
      image: `https://images.unsplash.com/photo-${Math.random().toString(36).substring(2)}?auto=format&fit=crop&w=1200&h=630&q=80`,
      date: new Date().toISOString().split('T')[0],
      author: {
        name: "NewCollab Team",
        role: "Content Team",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      category,
      readTime: "5 min read",
      tags,
      keywords,
      metaDescription
    };

    // Write post file
    const postsDir = path.join(__dirname, '../src/content/posts');
    await fs.writeFile(
      path.join(postsDir, `${slug}.json`),
      JSON.stringify(post, null, 2)
    );

    // Update posts index
    const postsIndex = JSON.parse(await fs.readFile(path.join(postsDir, 'posts.json'), 'utf8'));
    postsIndex.unshift(slug);
    await fs.writeFile(
      path.join(postsDir, 'posts.json'),
      JSON.stringify(postsIndex, null, 2)
    );

    console.log(`\nPost created successfully at: ${slug}.json`);
    console.log('Don\'t forget to:');
    console.log('1. Add your content to the post');
    console.log('2. Update the image URL');
    console.log('3. Run the sitemap generator');
    
    rl.close();
  } catch (error) {
    console.error('Error creating post:', error);
    process.exit(1);
  }
}

createPost(); 