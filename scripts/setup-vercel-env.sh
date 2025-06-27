#!/bin/bash

# ThreadJuice Vercel Environment Variables Setup
# This script helps set up all required environment variables

echo "🧃 ThreadJuice Vercel Environment Setup"
echo "======================================"
echo ""

# CRON Secret (generated)
CRON_SECRET="6w3qgtM8sRxEjHmrUb7CqJtC/aAnLQb0ZyVKu7g276g="

# Check which variables are already set
echo "📋 Checking existing environment variables..."
vercel env ls

echo ""
echo "🔐 Setting up missing environment variables..."
echo ""

# Required for production
echo "1. Setting CRON_SECRET (for cron job authentication)..."
echo "$CRON_SECRET" | vercel env add CRON_SECRET production

# Check if these are in .env.local and add if available
if [ -f .env.local ]; then
    echo ""
    echo "2. Checking .env.local for additional variables..."
    
    # Supabase Service Role Key
    if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
        echo "   Found SUPABASE_SERVICE_ROLE_KEY, adding to Vercel..."
        grep "SUPABASE_SERVICE_ROLE_KEY" .env.local | cut -d'=' -f2- | vercel env add SUPABASE_SERVICE_ROLE_KEY production
    fi
    
    # Pexels API Key
    if grep -q "PEXELS_API_KEY" .env.local; then
        echo "   Found PEXELS_API_KEY, adding to Vercel..."
        grep "PEXELS_API_KEY" .env.local | cut -d'=' -f2- | vercel env add PEXELS_API_KEY production
    fi
    
    # Twitter Bearer Token (optional)
    if grep -q "TWITTER_BEARER_TOKEN" .env.local; then
        echo "   Found TWITTER_BEARER_TOKEN, adding to Vercel..."
        grep "TWITTER_BEARER_TOKEN" .env.local | cut -d'=' -f2- | vercel env add TWITTER_BEARER_TOKEN production
    fi
    
    # Resend API Key (optional)
    if grep -q "RESEND_API_KEY" .env.local; then
        echo "   Found RESEND_API_KEY, adding to Vercel..."
        grep "RESEND_API_KEY" .env.local | cut -d'=' -f2- | vercel env add RESEND_API_KEY production
    fi
    
    # Resend Audience ID (optional)
    if grep -q "RESEND_AUDIENCE_ID" .env.local; then
        echo "   Found RESEND_AUDIENCE_ID, adding to Vercel..."
        grep "RESEND_AUDIENCE_ID" .env.local | cut -d'=' -f2- | vercel env add RESEND_AUDIENCE_ID production
    fi
fi

echo ""
echo "📝 Summary of Required Environment Variables:"
echo "============================================"
echo ""
echo "✅ Already Set:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
echo "  - CLERK_SECRET_KEY"
echo "  - OPENAI_API_KEY"
echo "  - NODE_ENV"
echo ""
echo "✅ Just Added:"
echo "  - CRON_SECRET: $CRON_SECRET"
echo ""
echo "⚠️  Still Need to Add Manually:"
echo "  - SUPABASE_SERVICE_ROLE_KEY (required for cron jobs)"
echo "  - PEXELS_API_KEY (required for image selection)"
echo "  - RESEND_API_KEY (optional for newsletter)"
echo "  - RESEND_AUDIENCE_ID (optional for newsletter)"
echo "  - TWITTER_BEARER_TOKEN (optional, Twitter broken anyway)"
echo ""
echo "To add manually:"
echo "vercel env add VARIABLE_NAME production"
echo ""
echo "Or visit: https://vercel.com/dean-roughs-projects/threadjuice/settings/environment-variables"
echo ""
echo "🚀 Once all variables are set, deploy with: git push origin main"