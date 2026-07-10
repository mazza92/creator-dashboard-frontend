/**
 * Fix blog post titles that are longer than 70 characters for SEO
 * Bing recommends titles under 70 characters
 */

const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../src/content/posts');

// Map of slugs to their new shorter titles (under 70 chars)
const titleFixes = {
  'food-brands-sending-pr-packages-2026': '40+ Food Brands Sending PR to Micro-Influencers (2026)',
  'the-2025-list-of-aussie-brands-that-send-pr-packages-for-australian-creators': 'Aussie Brands Sending PR + How to Get PR in Australia (2026)',
  'k-beauty-korean-skincare-brands-pr-list-small-creators-2026': 'K-Beauty PR List: Korean Brands for Small Creators (2026)',
  'us-brands-send-pr-micro-influencers-2026-list': '30+ US Brands Sending PR to Micro-Influencers (2026)',
  'jewelry-brands-micro-influencers-2026': '25 Jewelry Brands Working with Micro-Influencers (2026)',
  'pet-brands-looking-for-influencers-2026': '30+ Pet Brands Looking for Micro-Influencers (2026)',
  'ultimate-list-of-gaming-tech-companies-that-sponsor-small-streamers': 'Gaming & Tech Brands That Sponsor Small Streamers (2026)',
  'wellness-brands-influencer-programs-2026': '25 Wellness Brand Influencer Programs for Creators (2026)',
  'linkedin-creator-brand-deals-2026': 'How to Get Brand Deals on LinkedIn in 2026',
  'brands-looking-for-ambassadors-2025': 'Brands Looking for Ambassadors in 2026 | Top Picks',
  'how-to-get-pr-packages-under-1000-followers-2026': 'How to Get PR with Under 1,000 Followers (2026 Guide)',
  'what-does-paid-partnership-mean-guide-2026': 'What "Paid Partnership" Means on TikTok & Instagram',
  'fitness-brands-pr-micro-influencers-2026': '30+ Fitness Brands Sending PR to Micro-Influencers',
  'travel-brands-working-with-micro-influencers-2026': 'Travel Brands Working with Micro-Influencers (2026)',
  '5-copy-paste-pr-pitch-templates-get-replies-micro-influencers': '5 PR Pitch Templates That Get Replies (Copy-Paste)',
  'how-to-find-and-match-with-small-influencers-for-pr-packages-step-by-step': 'How to Find Influencers for PR Packages (Step-by-Step)',
  'pr-package-roi-calculator-micro-influencer-pr-cost-2025': 'PR Package ROI Calculator for Micro-Influencer Campaigns'
};

let fixed = 0;

Object.entries(titleFixes).forEach(([slug, newTitle]) => {
  const filePath = path.join(postsDir, slug + '.json');

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${slug}.json`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const post = JSON.parse(content);
  const oldTitle = post.title;

  if (newTitle.length > 70) {
    console.log(`❌ New title still too long (${newTitle.length} chars): ${newTitle}`);
    return;
  }

  post.title = newTitle;
  fs.writeFileSync(filePath, JSON.stringify(post, null, 2));

  console.log(`✅ ${slug}`);
  console.log(`   Old (${oldTitle.length}): ${oldTitle}`);
  console.log(`   New (${newTitle.length}): ${newTitle}`);
  console.log('');
  fixed++;
});

console.log('='.repeat(50));
console.log(`Fixed ${fixed} blog post titles`);
