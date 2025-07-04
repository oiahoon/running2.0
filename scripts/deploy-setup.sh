#!/bin/bash

# Running Page 2.0 - Quick Deployment Setup Script
# This script helps set up the environment for deployment

set -e

echo "🏃‍♂️ Running Page 2.0 - Deployment Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps/web" ]; then
    print_error "Please run this script from the root of the running2.0 project"
    exit 1
fi

print_info "Checking project structure..."

# Navigate to web app directory
cd apps/web

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Creating from template..."
    
    # Create .env.local with prompts
    echo "Please provide the following information:"
    
    read -p "Your full name: " USER_NAME
    read -p "Your GitHub username: " GITHUB_USERNAME
    read -p "Your email (optional): " USER_EMAIL
    read -p "Mapbox token (optional, press enter to skip): " MAPBOX_TOKEN
    
    # Create .env.local file
    cat > .env.local << EOF
# User Configuration
NEXT_PUBLIC_USER_NAME="$USER_NAME"
NEXT_PUBLIC_GITHUB_USERNAME="$GITHUB_USERNAME"
NEXT_PUBLIC_USER_EMAIL="$USER_EMAIL"

# Mapbox (Optional - for interactive maps)
$([ -n "$MAPBOX_TOKEN" ] && echo "NEXT_PUBLIC_MAPBOX_TOKEN=\"$MAPBOX_TOKEN\"" || echo "# NEXT_PUBLIC_MAPBOX_TOKEN=\"your_mapbox_token_here\"")

# Database Configuration
DATABASE_PATH="./data/running_page_2.db"

# Development
NODE_ENV="development"
EOF
    
    print_status ".env.local created successfully"
else
    print_status ".env.local already exists"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm install
    print_status "Dependencies installed"
else
    print_status "Dependencies already installed"
fi

# Check if database exists
if [ ! -f "data/running_page_2.db" ]; then
    print_warning "Database not found. You may need to run data sync first."
    print_info "To sync data from Strava:"
    print_info "1. Set up GitHub Actions secrets (STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN)"
    print_info "2. Run the sync workflow manually from GitHub Actions"
    print_info "3. Or place your existing database file in apps/web/data/"
else
    print_status "Database file found"
    
    # Check database content
    ACTIVITY_COUNT=$(sqlite3 data/running_page_2.db "SELECT COUNT(*) FROM activities;" 2>/dev/null || echo "0")
    print_info "Database contains $ACTIVITY_COUNT activities"
fi

# Test build
print_info "Testing build process..."
if npm run build > /dev/null 2>&1; then
    print_status "Build test successful"
else
    print_error "Build test failed. Check your configuration."
    exit 1
fi

# Clean up build files
rm -rf .next

print_info "Running development server test..."
# Start dev server in background and test
npm run dev > /dev/null 2>&1 &
DEV_PID=$!

# Wait for server to start
sleep 5

# Test if server is responding
if curl -s http://localhost:3000 > /dev/null; then
    print_status "Development server test successful"
else
    print_warning "Development server test failed, but this might be normal"
fi

# Kill dev server
kill $DEV_PID 2>/dev/null || true

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
print_info "Next steps:"
echo "1. 🚀 Deploy to Vercel:"
echo "   - Connect your GitHub repo to Vercel"
echo "   - Set environment variables in Vercel dashboard"
echo "   - Deploy automatically"
echo ""
echo "2. 📊 Set up data sync:"
echo "   - Add Strava API credentials to GitHub Secrets"
echo "   - Run sync workflow to populate database"
echo ""
echo "3. 🗺️  Enable maps (optional):"
echo "   - Get Mapbox token from mapbox.com"
echo "   - Add NEXT_PUBLIC_MAPBOX_TOKEN to environment"
echo ""
print_info "Local development:"
echo "   npm run dev    # Start development server"
echo "   npm run build  # Test production build"
echo ""
print_info "Useful URLs:"
echo "   http://localhost:3000           # Main app"
echo "   http://localhost:3000/test-fixes # Test all fixes"
echo ""
print_status "Your Running Page 2.0 is ready! 🏃‍♂️"
