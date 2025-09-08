# 🚀 Deployment Guide

## Vercel Deployment

### 1. Prerequisites
- Vercel account (free tier available)
- GitHub repository
- Stripe account for payments
- Nehtw.com API key

### 2. Environment Variables for Production

Set these in Vercel dashboard under Settings > Environment Variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production

# Database (use PostgreSQL for production)
DATABASE_URL=postgresql://username:password@host:port/database

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Nehtw.com API
NEHTW_API_KEY=your-nehtw-api-key-here

# Application URLs
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
```

### 3. Database Setup

For production, use PostgreSQL instead of SQLite:

1. **Option A: Vercel Postgres** (Recommended)
   - Go to Vercel dashboard
   - Add Postgres database
   - Copy the connection string to DATABASE_URL

2. **Option B: External PostgreSQL**
   - Use services like Railway, Supabase, or Neon
   - Get connection string and set DATABASE_URL

### 4. Stripe Setup

1. Create Stripe account
2. Get live API keys from Stripe dashboard
3. Set up webhook endpoint: `https://your-app-name.vercel.app/api/stripe/webhook`
4. Add webhook events: `checkout.session.completed`, `customer.subscription.updated`

### 5. Deployment Steps

1. Push code to GitHub
2. Connect Vercel to GitHub repository
3. Set environment variables
4. Deploy!

### 6. Post-Deployment

1. Run database migrations: `npx prisma db push`
2. Seed initial data: `npx prisma db seed`
3. Test all functionality
4. Set up monitoring

## Local Development

For local development, create `.env.local`:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-local-secret
DATABASE_URL=file:./dev.db
STRIPE_SECRET_KEY=sk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook
NEHTW_API_KEY=your-nehtw-api-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```
