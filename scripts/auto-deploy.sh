#!/bin/bash

# 🚀 Auto Deploy Script for Stock Media SaaS
# This script automatically commits changes and deploys to Vercel

set -e  # Exit on any error

echo "🚀 Starting Auto Deploy Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository!"
    exit 1
fi

# Check if there are any changes
if [ -z "$(git status --porcelain)" ]; then
    print_warning "No changes to commit."
    exit 0
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Check if we're on main branch
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "Not on main branch. Switching to main..."
    git checkout main
fi

# Add all changes
print_status "Adding all changes..."
git add .

# Get list of changed files
CHANGED_FILES=$(git diff --cached --name-only)
print_status "Changed files:"
echo "$CHANGED_FILES" | sed 's/^/  - /'

# Generate commit message based on changes
COMMIT_MSG=""

# Check for specific types of changes
if echo "$CHANGED_FILES" | grep -q "src/app/dashboard/browse"; then
    COMMIT_MSG="🎯 Update browse media page"
elif echo "$CHANGED_FILES" | grep -q "src/app/api"; then
    COMMIT_MSG="🔧 Update API endpoints"
elif echo "$CHANGED_FILES" | grep -q "src/components"; then
    COMMIT_MSG="🧩 Update components"
elif echo "$CHANGED_FILES" | grep -q "src/lib"; then
    COMMIT_MSG="📚 Update utilities and libraries"
elif echo "$CHANGED_FILES" | grep -q "package.json\|package-lock.json"; then
    COMMIT_MSG="📦 Update dependencies"
elif echo "$CHANGED_FILES" | grep -q "prisma/schema.prisma"; then
    COMMIT_MSG="🗄️ Update database schema"
elif echo "$CHANGED_FILES" | grep -q "next.config.js"; then
    COMMIT_MSG="⚙️ Update Next.js configuration"
else
    COMMIT_MSG="🔧 General updates and improvements"
fi

# Add timestamp to commit message
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MSG="$COMMIT_MSG - $TIMESTAMP"

# Commit changes
print_status "Committing changes..."
git commit -m "$COMMIT_MSG"

# Push to GitHub
print_status "Pushing to GitHub..."
git push origin main

print_success "Changes pushed to GitHub successfully!"

# Deploy to Vercel
print_status "Deploying to Vercel..."
if command -v vercel &> /dev/null; then
    vercel --prod --yes
    print_success "Deployed to Vercel successfully!"
    print_success "🌐 Production URL: https://stock-media-saas-izgzzvfah-psdstocks-projects.vercel.app"
else
    print_warning "Vercel CLI not found. Please install it with: npm i -g vercel"
    print_status "You can deploy manually by running: vercel --prod"
fi

print_success "🎉 Auto deploy process completed!"
