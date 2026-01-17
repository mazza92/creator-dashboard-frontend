import fs from 'fs';
import path from 'path';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

/**
 * Get all blog post slugs
 */
export function getAllPostSlugs() {
  try {
    const postsIndexPath = path.join(postsDirectory, 'posts.json');
    const fileContents = fs.readFileSync(postsIndexPath, 'utf8');
    const posts = JSON.parse(fileContents);
    return posts;
  } catch (error) {
    console.error('Error reading posts index:', error);
    return [];
  }
}

/**
 * Get post data by slug
 */
export function getPostBySlug(slug) {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.json`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const post = JSON.parse(fileContents);
    return post;
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

/**
 * Get all posts with metadata
 */
export function getAllPosts() {
  try {
    const slugs = getAllPostSlugs();
    if (!Array.isArray(slugs) || slugs.length === 0) {
      console.warn('No post slugs found');
      return [];
    }
    
    const posts = slugs
      .map((slug) => {
        try {
          const post = getPostBySlug(slug);
          if (!post) return null;
          return {
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            image: post.image,
            date: post.date,
            author: post.author,
            category: post.category,
            readTime: post.readTime,
            tags: post.tags || [],
            metaDescription: post.metaDescription,
          };
        } catch (error) {
          console.error(`Error processing post ${slug}:`, error);
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => {
        try {
          return new Date(b.date) - new Date(a.date);
        } catch {
          return 0;
        }
      });
    
    return posts;
  } catch (error) {
    console.error('Error in getAllPosts:', error);
    return [];
  }
}

/**
 * Get related posts based on category and tags
 */
export function getRelatedPosts(currentSlug, currentPost, limit = 3) {
  const allPosts = getAllPosts();
  
  const scoredPosts = allPosts
    .filter(post => post.slug !== currentSlug)
    .map(post => {
      let score = 0;
      
      // Category match (highest weight)
      if (post.category === currentPost.category) {
        score += 10;
      }
      
      // Tag matches (medium weight)
      if (currentPost.tags && post.tags) {
        const commonTags = currentPost.tags.filter(tag =>
          post.tags.some(pt => pt.toLowerCase() === tag.toLowerCase())
        );
        score += commonTags.length * 3;
      }
      
      // Keyword matches (lower weight)
      if (currentPost.keywords && post.keywords) {
        const commonKeywords = currentPost.keywords.filter(kw =>
          post.keywords?.some(pk => 
            pk.toLowerCase().includes(kw.toLowerCase()) || 
            kw.toLowerCase().includes(pk.toLowerCase())
          )
        );
        score += commonKeywords.length * 2;
      }
      
      return { ...post, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score, ...post }) => post);
  
  return scoredPosts;
}
