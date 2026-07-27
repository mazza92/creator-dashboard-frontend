const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Increase timeout for static page generation (default is 60s)
  staticPageGenerationTimeout: 120,
  
  // Path aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '@/src': path.resolve(__dirname, 'src'),
      '@/lib': path.resolve(__dirname, 'lib'),
    };
    
    // Ignore src/pages directory (it's for CRA, not Next.js)
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/src/pages/**', // Ignore CRA pages directory
        '**/build/**',
      ],
    };
    
    return config;
  },
  
  
  // Image optimization (updated to use remotePatterns)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'kyawgtojxoglvlhzsotm.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    unoptimized: false,
  },
  
  // Webpack configuration for styled-components
  compiler: {
    styledComponents: true,
  },
  
  // Turbopack configuration (Next.js 16+)
  turbopack: {},
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Redirects (migrated from vercel.json)
  async redirects() {
    return [
      {
        source: '/blog/:slug/',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/home/',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ressources/:path*',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/search',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/missions/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/features',
        destination: '/',
        permanent: true,
      },
      {
        source: '/brands/send-pr-packages',
        destination: '/brands/pr-packages',
        permanent: true,
      },
      {
        source: '/f50',
        destination: '/',
        permanent: true,
      },
      // SEO: Redirect old 2025 PR packages post to new 2026 pillar post
      {
        source: '/blog/list-of-companies-that-send-pr-packages-2025',
        destination: '/blog/list-of-companies-that-send-pr-packages-2026',
        permanent: true,
      },
      // SEO: Redirect old 2025 PR emails post to new 2026 version
      {
        source: '/blog/pr-emails-for-brands-2025',
        destination: '/blog/pr-emails-for-brands-2026',
        permanent: true,
      },
      // Redirect /for-brands to CRA app (Brand Opportunities submission form)
      {
        source: '/for-brands',
        destination: 'https://app.newcollab.co/for-brands',
        permanent: false,
      },
    ];
  },
  
  // Rewrites for API
  async rewrites() {
    return {
      // beforeFiles rewrites are checked BEFORE Next.js pages/API routes
      // afterFiles rewrites are checked AFTER (so local API routes take precedence)
      afterFiles: [
        {
          source: '/api/:path*',
          destination: 'https://api.newcollab.co/:path*',
        },
      ],
    };
  },
};

module.exports = nextConfig;
