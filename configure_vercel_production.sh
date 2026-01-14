#!/bin/bash
# Configure Vercel to use 'master' as production branch

echo "Configuring Vercel production branch to 'master'..."

# Install Vercel CLI if not already installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

# Link to Vercel project (if not already linked)
vercel link --yes

# Update production branch setting
vercel git connect

echo ""
echo "✅ Done! Now go to Vercel Dashboard → Settings → Git"
echo "   and set Production Branch to: master"
echo ""
echo "After this change, every push to 'master' will deploy directly to production!"
