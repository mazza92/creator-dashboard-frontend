{
  "version": 2,
  "framework": "create-react-app",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(robots.txt|favicon.ico|sitemap.xml|manifest.json)",
      "dest": "/$1"
    },
    {
      "src": "/api/(.*)",
      "dest": "https://api.newcollab.co/$1"
    },
    {
      "src": "/marketplace",
      "dest": "/index.html",
      "headers": {
        "Cache-Control": "public, max-age=0, must-revalidate"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "ignore": ["requirements.txt", "migrations", "back2"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin-allow-popups"
        }
      ]
    }
  ]
}
