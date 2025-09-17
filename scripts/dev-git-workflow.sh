#!/bin/bash

# Development Git-Only Workflow Script
# This script helps with git-only development (no Vercel deployments)

echo "🔄 Development Git-Only Workflow"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to show current status
show_status() {
    echo ""
    echo "📊 Current Status:"
    echo "=================="
    git status --short
    echo ""
    echo "📝 Recent Commits:"
    echo "=================="
    git log --oneline -5
}

# Function to commit and push changes
commit_and_push() {
    echo ""
    echo "💾 Committing and Pushing Changes..."
    echo "===================================="
    
    # Check if there are changes to commit
    if [ -z "$(git status --porcelain)" ]; then
        echo "✅ No changes to commit. Working directory is clean."
        return 0
    fi
    
    # Add all changes
    git add .
    
    # Get descriptive commit message from user or use default
    echo ""
    echo "📝 Enter a descriptive commit message:"
    echo "   (Leave empty to use auto-generated message)"
    read -r USER_COMMIT_MSG
    
    if [ -z "$USER_COMMIT_MSG" ]; then
        COMMIT_MSG="🔧 Development Update: $(date '+%Y-%m-%d %H:%M:%S')"
    else
        COMMIT_MSG="🔧 $USER_COMMIT_MSG"
    fi
    
    git commit -m "$COMMIT_MSG"
    
    # Push to origin
    git push origin main
    
    echo "✅ Changes committed and pushed to git repository"
    echo "📝 Commit message: $COMMIT_MSG"
}

# Function to sync with remote
sync_with_remote() {
    echo ""
    echo "🔄 Syncing with Remote Repository..."
    echo "===================================="
    
    git pull origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully synced with remote repository"
    else
        echo "❌ Error syncing with remote repository"
        exit 1
    fi
}

# Function to show development tips
show_tips() {
    echo ""
    echo "💡 Development Tips:"
    echo "===================="
    echo "• Use 'npm run dev' to start local development server"
    echo "• Use 'npm run build' to test build locally"
    echo "• Use 'npm run test' to run linting and tests"
    echo "• All changes are committed to git only (no Vercel deployments)"
    echo "• Final deployment to Vercel will be done when development is complete"
    echo ""
    echo "🎯 Current Workflow:"
    echo "• Make changes → Test locally → Commit to git → Push to repository"
    echo "• No frequent Vercel deployments during development"
    echo "• Single comprehensive deployment when ready for production"
}

# Main menu
case "$1" in
    "status")
        show_status
        ;;
    "commit")
        commit_and_push
        show_status
        ;;
    "sync")
        sync_with_remote
        show_status
        ;;
    "tips")
        show_tips
        ;;
    *)
        echo "Usage: $0 {status|commit|sync|tips}"
        echo ""
        echo "Commands:"
        echo "  status  - Show current git status and recent commits"
        echo "  commit  - Commit and push all changes to git"
        echo "  sync    - Pull latest changes from remote repository"
        echo "  tips    - Show development tips and workflow information"
        echo ""
        echo "Examples:"
        echo "  $0 status    # Check current status"
        echo "  $0 commit    # Commit and push changes"
        echo "  $0 sync      # Sync with remote"
        echo "  $0 tips      # Show development tips"
        ;;
esac

echo ""
echo "🚀 Development Git-Only Workflow Complete!"
