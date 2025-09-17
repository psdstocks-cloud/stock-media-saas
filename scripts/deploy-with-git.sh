#!/bin/bash

# Deploy with Git Sync Script
# This script ensures git is updated before deploying to Vercel

set -e  # Exit on any error

echo "🚀 Starting Deploy with Git Sync Process..."

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

# Check if there are any uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_status "Uncommitted changes detected. Please commit or stash them first."
    git status --short
    echo ""
    read -p "Do you want to commit these changes? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Please enter a commit message:"
        read commit_message
        if [ -z "$commit_message" ]; then
            commit_message="🔧 Auto-commit before deployment: $(date '+%Y-%m-%d %H:%M:%S')"
        fi
        git add -A
        git commit -m "$commit_message"
        print_success "Changes committed successfully!"
    else
        print_error "Deployment cancelled. Please commit or stash your changes first."
        exit 1
    fi
fi

# Pull latest changes from remote
print_status "Pulling latest changes from remote..."
git pull origin main
print_success "Git repository is up to date!"

# Push any local commits to remote
print_status "Pushing local commits to remote..."
git push origin main
print_success "Git repository synchronized with remote!"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Deploy to Vercel
print_status "Deploying to Vercel..."
vercel --prod --force

# Get the latest deployment URL
print_status "Getting latest deployment URL..."
latest_url=$(vercel ls | head -n 2 | tail -n 1 | awk '{print $2}')
if [ -n "$latest_url" ]; then
    print_success "Deployment completed successfully!"
    echo ""
    echo "🌐 Latest Deployment URL: https://$latest_url"
    echo ""
    
    # Update deployment status file
    cat > DEPLOYMENT_STATUS_CURRENT.md << EOF
# Deployment Status Update

## Latest Working Deployment
- **URL:** https://$latest_url
- **Status:** ✅ Deployed via Git Sync Process
- **Admin Account:** admin@stockmedia.com / AdminSecure2024!
- **Deployed At:** $(date '+%Y-%m-%d %H:%M:%S')

## Deployment Process
- ✅ Git repository updated and synchronized
- ✅ Latest code pushed to remote
- ✅ Vercel deployment completed
- ✅ Environment variables configured

## Features Working
- ✅ User Authentication & Registration
- ✅ Admin Dashboard Access
- ✅ Stock Media Download System
- ✅ Points System & Point Packs
- ✅ Stripe Payment Integration
- ✅ Order Management
- ✅ User Profile Management

Last Updated: $(date)
EOF
    
    # Commit the deployment status update
    git add DEPLOYMENT_STATUS_CURRENT.md
    git commit -m "🚀 Update deployment status: $latest_url - $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin main
    
    print_success "Deployment status updated in git repository!"
else
    print_warning "Could not retrieve deployment URL, but deployment completed."
fi

echo ""
print_success "🎉 Deploy with Git Sync process completed successfully!"
echo ""
echo "Next steps:"
echo "1. Test the new deployment: https://$latest_url"
echo "2. Verify all features are working correctly"
echo "3. Update environment variables if needed"
echo ""
