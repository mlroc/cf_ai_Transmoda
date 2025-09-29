#!/bin/bash

# 🚀 Transmoda Production Deployment Script
# This script builds and deploys all components for production

set -e  # Exit on any error

echo "🚀 Starting Transmoda Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v wrangler &> /dev/null; then
        print_warning "Wrangler CLI not found. Install with: npm install -g wrangler"
    fi
    
    print_status "Dependencies check complete"
}

# Build web application
build_web() {
    print_status "Building web application..."
    cd web
    
    # Install dependencies
    npm ci --only=production
    
    # Build for production
    npm run build
    
    print_status "Web application built successfully"
    cd ..
}

# Build agents starter
build_agents() {
    print_status "Building agents starter..."
    cd agents-starter
    
    # Install dependencies
    npm ci --only=production
    
    # Build for production
    npm run build
    
    print_status "Agents starter built successfully"
    cd ..
}

# Deploy worker
deploy_worker() {
    print_status "Deploying Cloudflare Worker..."
    cd worker
    
    # Check if wrangler is authenticated
    if ! wrangler whoami &> /dev/null; then
        print_warning "Please authenticate with Wrangler first: wrangler login"
        return 1
    fi
    
    # Deploy worker to production environment
    wrangler deploy --env=production
    
    print_status "Worker deployed successfully to production"
    cd ..
}

# Main deployment function
main() {
    echo "🔍 Pre-deployment checks..."
    check_dependencies
    
    echo "🏗️  Building applications..."
    build_web
    build_agents
    
    echo "🚀 Deploying to production..."
    deploy_worker
    
    echo ""
    print_status "🎉 Production deployment complete!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set up environment variables in your deployment platform"
    echo "2. Configure monitoring and error tracking"
    echo "3. Test all functionality in production"
    echo "4. Set up SSL certificates if needed"
    echo ""
    echo "🔗 Useful commands:"
    echo "• Web app: cd web && npm start"
    echo "• Agents: cd agents-starter && npm start"
    echo "• Worker logs: cd worker && wrangler tail"
}

# Run main function
main "$@"
