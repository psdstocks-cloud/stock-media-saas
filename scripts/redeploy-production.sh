#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Starting a fresh production redeployment (no cache)..."

# 1. Ensure Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "Vercel CLI not found. Please install it first: npm install -g vercel"
    exit 1
fi

# 2. Authenticate with Vercel
echo "🔑 Checking Vercel authentication..."
vercel whoami

# 3. Ensure you are on the main branch and have the latest changes
echo "🔄 Syncing with the latest changes from Git..."
git checkout main
git pull origin main

# 4. Trigger a new, clean production deployment
# The '--force' flag tells Vercel to ignore the build cache for this deployment.
echo "🚢 Deploying to Vercel Production without cache..."
vercel --prod --force

echo "✅ Fresh deployment triggered successfully! Monitor the build progress in your Vercel dashboard."