#!/bin/bash

# 🚀 Quick Deploy Script
# Usage: ./deploy.sh "Your commit message"

COMMIT_MSG=${1:-"🔧 Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"}

echo "🚀 Deploying with message: $COMMIT_MSG"

# Add all changes
git add .

# Commit with message
git commit -m "$COMMIT_MSG"

# Push to GitHub
git push origin main

# Deploy to Vercel
vercel --prod --yes

echo "✅ Deployment completed!"
echo "🌐 Production URL: https://stock-media-saas-izgzzvfah-psdstocks-projects.vercel.app"