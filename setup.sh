#!/bin/bash

# SEDA Finance Plan - Quick Setup Script
# This script helps you set up the application quickly

echo "🎓 SEDA Student Finance Plan - Setup"
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. You'll need to install it."
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql"
    echo ""
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Check for .env file
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your credentials:"
    echo "   - DATABASE_URL (PostgreSQL connection)"
    echo "   - SMTP credentials (email delivery)"
    echo ""
fi

echo ""
echo "📋 Next Steps:"
echo "1. Edit .env file with your database and SMTP credentials"
echo "2. Create PostgreSQL database: createdb seda_finance"
echo "3. Run migrations: npm run db:migrate"
echo "4. Start server: npm run dev"
echo "5. Open browser: http://localhost:3000"
echo ""
echo "📖 See README.md for detailed instructions"
echo ""
