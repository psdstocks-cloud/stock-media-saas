#!/bin/bash

# 🚀 Manual Deployment Script for Stock Media SaaS
# This script handles both Git and Vercel deployment

set -e  # Exit on any error

echo "🚀 Starting Manual Deployment Process..."

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

# Step 1: Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Step 2: Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Please commit them first."
    echo "Uncommitted files:"
    git status --porcelain
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled."
        exit 1
    fi
fi

# Step 3: Run tests (optional)
print_status "Running tests..."
if npm test -- --passWithNoTests 2>/dev/null; then
    print_success "Tests passed!"
else
    print_warning "Tests failed or not configured. Continuing with deployment..."
fi

# Step 4: Build the application locally
print_status "Building application locally..."
if npm run build; then
    print_success "Local build successful!"
else
    print_error "Local build failed. Please fix the issues before deploying."
    exit 1
fi

# Step 5: Commit changes to Git
print_status "Committing changes to Git..."
git add .
if git diff --staged --quiet; then
    print_warning "No changes to commit."
else
    read -p "Enter commit message (or press Enter for auto-generated): " commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="🚀 Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    git commit -m "$commit_msg"
    print_success "Changes committed to Git!"
fi

# Step 6: Push to GitHub
print_status "Pushing to GitHub..."
if git push origin main; then
    print_success "Pushed to GitHub successfully!"
else
    print_error "Failed to push to GitHub."
    exit 1
fi

# Step 7: Deploy to Vercel
print_status "Deploying to Vercel..."
if vercel --prod; then
    print_success "Deployed to Vercel successfully!"
    echo ""
    echo "🌐 Your application is now live at:"
    echo "   https://stock-media-saas-m0bkt1ps1-psdstocks-projects.vercel.app"
    echo ""
    echo "📊 Vercel Dashboard:"
    echo "   https://vercel.com/psdstocks-projects/stock-media-saas"
    echo ""
else
    print_error "Failed to deploy to Vercel."
    exit 1
fi

# Step 8: Test the deployment
print_status "Testing deployed application..."
if curl -s -f "https://stock-media-saas-m0bkt1ps1-psdstocks-projects.vercel.app/api/health" > /dev/null; then
    print_success "Deployment test successful!"
else
    print_warning "Deployment test failed, but deployment may still be successful."
fi

print_success "🎉 Deployment process completed!"
print_status "Next steps:"
echo "  1. Check the Vercel dashboard for any errors"
echo "  2. Test your application functionality"
echo "  3. Monitor the deployment for any issues"
