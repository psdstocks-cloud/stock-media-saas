#!/bin/bash

# Enhanced Git Commit Script with Descriptive Messages
# This script helps create meaningful commit messages for better project tracking

echo "🎯 Enhanced Git Commit with Descriptive Messages"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check git status
echo ""
echo "📊 Current Git Status:"
echo "======================"
git status --short

# Check if there are changes to commit
if [ -z "$(git status --porcelain)" ]; then
    echo ""
    echo "✅ No changes to commit. Working directory is clean."
    exit 0
fi

echo ""
echo "📝 Recent Commits for Context:"
echo "=============================="
git log --oneline -5

echo ""
echo "🔍 What changes are you committing?"
echo "=================================="
echo "Examples:"
echo "  - 🎨 Brand colors implementation"
echo "  - 🐛 Fix authentication redirect issue"
echo "  - ✨ Add new user dashboard feature"
echo "  - 🔧 Update Tailwind configuration"
echo "  - 📱 Improve mobile responsiveness"
echo "  - 🧪 Add tests for payment system"
echo "  - 📚 Update documentation"
echo ""

# Get commit type
echo "Select commit type:"
echo "1) 🎨 Feature/Enhancement"
echo "2) 🐛 Bug Fix"
echo "3) 🔧 Configuration/Setup"
echo "4) 📱 UI/UX Improvement"
echo "5) 🧪 Testing"
echo "6) 📚 Documentation"
echo "7) 🚀 Deployment/Release"
echo "8) 🗑️ Cleanup/Refactor"
echo "9) ✨ New Feature"
echo "10) 🎯 Custom"
echo ""

read -p "Enter number (1-10): " COMMIT_TYPE

case $COMMIT_TYPE in
    1) TYPE_EMOJI="🎨" ;;
    2) TYPE_EMOJI="🐛" ;;
    3) TYPE_EMOJI="🔧" ;;
    4) TYPE_EMOJI="📱" ;;
    5) TYPE_EMOJI="🧪" ;;
    6) TYPE_EMOJI="📚" ;;
    7) TYPE_EMOJI="🚀" ;;
    8) TYPE_EMOJI="🗑️" ;;
    9) TYPE_EMOJI="✨" ;;
    10) TYPE_EMOJI="🎯" ;;
    *) TYPE_EMOJI="🔧" ;;
esac

echo ""
echo "📝 Enter a descriptive commit message:"
echo "   (Be specific about what you changed and why)"
read -r COMMIT_DESCRIPTION

# Get additional details if needed
echo ""
echo "💡 Additional details (optional):"
echo "   (Press Enter to skip)"
read -r COMMIT_DETAILS

# Build commit message
COMMIT_MSG="$TYPE_EMOJI $COMMIT_DESCRIPTION"

if [ ! -z "$COMMIT_DETAILS" ]; then
    COMMIT_MSG="$COMMIT_MSG

$COMMIT_DETAILS"
fi

echo ""
echo "📋 Commit Message Preview:"
echo "=========================="
echo "$COMMIT_MSG"
echo ""

read -p "✅ Proceed with this commit? (y/N): " CONFIRM

if [[ $CONFIRM =~ ^[Yy]$ ]]; then
    # Add all changes
    git add .
    
    # Commit with descriptive message
    git commit -m "$COMMIT_MSG"
    
    # Push to origin
    git push origin main
    
    echo ""
    echo "✅ Changes committed and pushed successfully!"
    echo "📝 Commit: $COMMIT_MSG"
    
    echo ""
    echo "📊 Updated Git Status:"
    echo "======================"
    git log --oneline -3
else
    echo ""
    echo "❌ Commit cancelled. No changes were made."
fi

echo ""
echo "🎯 Enhanced Git Commit Complete!"
