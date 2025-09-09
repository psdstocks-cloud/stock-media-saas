#!/bin/bash

echo "🚀 Attempting to deploy to Vercel..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the project directory"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI not found"
    exit 1
fi

# Try different deployment methods
echo "📦 Method 1: Direct deployment..."
vercel deploy --prod 2>/dev/null && echo "✅ Deployed successfully!" && exit 0

echo "📦 Method 2: Public deployment..."
vercel deploy --prod --public 2>/dev/null && echo "✅ Deployed successfully!" && exit 0

echo "📦 Method 3: Force deployment..."
vercel deploy --prod --force 2>/dev/null && echo "✅ Deployed successfully!" && exit 0

echo "❌ All deployment methods failed"
echo "💡 Please try deploying manually from Vercel dashboard:"
echo "   https://vercel.com/psdstocks-projects/stock-media-saas"
echo ""
echo "🔧 Alternative solutions:"
echo "   1. Clear browser cache and try Vercel dashboard again"
echo "   2. Try incognito/private mode"
echo "   3. Try a different browser"
echo "   4. Check browser console for JavaScript errors"
