#!/bin/bash

# Install script with retry logic for CI/CD environments
# This script handles network issues and Prisma engine downloads

set -e

echo "🚀 Starting installation with retry logic..."

# Function to install with retry
install_with_retry() {
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "📦 Installation attempt $attempt of $max_attempts..."
        
        if npm ci --no-optional --legacy-peer-deps; then
            echo "✅ Installation successful!"
            return 0
        else
            echo "❌ Installation attempt $attempt failed"
            
            if [ $attempt -lt $max_attempts ]; then
                echo "⏳ Waiting 10 seconds before retry..."
                sleep 10
                
                echo "🧹 Cleaning npm cache..."
                npm cache clean --force
            fi
            
            attempt=$((attempt + 1))
        fi
    done
    
    echo "💥 All installation attempts failed"
    exit 1
}

# Function to generate Prisma client with retry
generate_prisma_with_retry() {
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "🔧 Prisma generation attempt $attempt of $max_attempts..."
        
        if npx prisma generate; then
            echo "✅ Prisma client generated successfully!"
            return 0
        else
            echo "❌ Prisma generation attempt $attempt failed"
            
            if [ $attempt -lt $max_attempts ]; then
                echo "⏳ Waiting 5 seconds before retry..."
                sleep 5
            fi
            
            attempt=$((attempt + 1))
        fi
    done
    
    echo "💥 All Prisma generation attempts failed"
    exit 1
}

# Main installation process
echo "🔧 Setting up environment..."

# Set npm configuration for better reliability
export NPM_CONFIG_FETCH_RETRIES=5
export NPM_CONFIG_FETCH_RETRY_FACTOR=2
export NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=10000
export NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=60000

# Install dependencies
install_with_retry

# Generate Prisma client
generate_prisma_with_retry

echo "🎉 Installation completed successfully!"
