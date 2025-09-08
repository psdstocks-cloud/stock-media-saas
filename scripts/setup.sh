#!/bin/bash

# Stock Media SaaS - Local Setup Script
echo "🔧 Setting up local development environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    echo "✅ Created .env.local - Please update with your actual values"
else
    echo "✅ .env.local already exists"
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗄️  Setting up database..."
npx prisma db push

# Seed initial data
echo "🌱 Seeding database..."
npm run db:seed

# Run tests
echo "🧪 Running tests..."
npm test

if [ $? -eq 0 ]; then
    echo "✅ Setup complete!"
    echo ""
    echo "🚀 To start development:"
    echo "npm run dev"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update .env.local with your actual API keys"
    echo "2. Test the application at http://localhost:3000"
    echo "3. Deploy to Vercel when ready"
else
    echo "❌ Setup failed. Please check the errors above."
    exit 1
fi
