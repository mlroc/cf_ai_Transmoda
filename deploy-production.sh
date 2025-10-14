#!/bin/bash

# Production deployment script for Transmoda
set -e

echo "🚀 Starting production deployment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "worker/wrangler.toml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Deploy worker
echo "📦 Deploying Cloudflare Worker..."
cd worker
npx wrangler deploy --env production
cd ..

# Build and deploy web app (if using Cloudflare Pages)
echo "🌐 Building web application..."
cd web
npm run build
cd ..

echo "✅ Production deployment complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Set up your environment variables in Cloudflare Workers dashboard"
echo "2. Configure your domain in Cloudflare Pages"
echo "3. Test all functionality in production"
echo ""
echo "📋 Required environment variables:"
echo "- GEMINI_API_KEY: Your Google Gemini API key"
echo "- PROMPT_SUMMARY: AI prompt for document summarization"
echo "- PROMPT_SHORTFORM: AI prompt for shortform content generation"
echo "- ALLOWED_ORIGINS: Comma-separated list of allowed origins (optional)"