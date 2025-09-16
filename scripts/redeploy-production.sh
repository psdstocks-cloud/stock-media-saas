#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Starting production redeployment..."

# 1. Ensure Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "Vercel CLI not found. Please install it first: npm install -g vercel"
    exit 1
fi

# 2. Authenticate with Vercel (this will prompt you to log in in the browser if you haven't already)
echo "🔑 Checking Vercel authentication..."
vercel whoami

# 3. Ensure you are on the main branch and have the latest changes
echo "🔄 Syncing with the latest changes from Git..."
git checkout main
git pull origin main

# 4. Trigger a new production deployment
# The 'vercel --prod' command builds and deploys the current local code to production.
# This creates a brand new build and bypasses any potentially stale build caches on Vercel for this commit.
echo "🚢 Deploying to Vercel Production..."
vercel --prod

echo "✅ Deployment triggered successfully! Monitor the build progress in your Vercel dashboard."
