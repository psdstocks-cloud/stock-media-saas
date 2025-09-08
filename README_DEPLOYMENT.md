# 🚀 Stock Media SaaS - Deployment Guide

## Quick Start

### 1. Local Development Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd stock-media-saas

# Run setup script
./scripts/setup.sh

# Start development server
npm run dev
```

### 2. Deploy to Vercel
```bash
# Deploy to production
./scripts/deploy.sh
```

## 📋 Prerequisites

Before deploying, make sure you have:

- [ ] **Vercel Account** - [Sign up here](https://vercel.com)
- [ ] **GitHub Repository** - Push your code to GitHub
- [ ] **Stripe Account** - For payment processing
- [ ] **Nehtw.com API Key** - For stock media downloads
- [ ] **PostgreSQL Database** - For production data

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_URL` | Your app URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | NextAuth secret key | `your-super-secret-key` |
| `DATABASE_URL` | Database connection string | `postgresql://...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `NEHTW_API_KEY` | Nehtw.com API key | `your-api-key` |
| `NEXT_PUBLIC_BASE_URL` | Public app URL | `https://your-app.vercel.app` |

### Setting Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with the appropriate value
4. Make sure to set them for "Production" environment

## 🗄️ Database Setup

### Option 1: Vercel Postgres (Recommended)

1. In Vercel dashboard, go to Storage
2. Create a new Postgres database
3. Copy the connection string
4. Set as `DATABASE_URL` environment variable

### Option 2: External PostgreSQL

**Railway:**
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Copy connection string

**Supabase:**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database

## 💳 Stripe Configuration

### 1. Get API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your live API keys from Developers > API Keys
3. Set `STRIPE_SECRET_KEY` environment variable

### 2. Set Up Webhooks
1. Go to Developers > Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook secret and set as `STRIPE_WEBHOOK_SECRET`

### 3. Test Webhooks
```bash
# Install Stripe CLI
npm install -g @stripe/stripe-cli

# Login to Stripe
stripe login

# Listen for webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 🚀 Deployment Steps

### 1. Prepare Repository
```bash
# Commit all changes
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy to Vercel
```bash
# Option A: Use deployment script
./scripts/deploy.sh

# Option B: Manual deployment
vercel --prod
```

### 3. Configure Environment
1. Set all environment variables in Vercel dashboard
2. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL` with your Vercel URL

### 4. Database Migration
```bash
# Connect to Vercel project
vercel env pull .env.local

# Generate Prisma client
npx prisma generate

# Push schema to production database
npx prisma db push

# Seed initial data
npx prisma db seed
```

## ✅ Post-Deployment Checklist

### Testing
- [ ] User registration works
- [ ] User login works
- [ ] Subscription creation works
- [ ] Order placement works
- [ ] Points management works
- [ ] Admin panel accessible

### Security
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database connection secure
- [ ] API keys protected

### Performance
- [ ] Database optimized
- [ ] Images optimized
- [ ] CDN configured
- [ ] Caching enabled

### Monitoring
- [ ] Error tracking set up
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Database monitoring

## 🔍 Troubleshooting

### Common Issues

**Build Failures:**
- Check environment variables
- Verify Prisma schema
- Check for TypeScript errors

**Database Connection:**
- Verify `DATABASE_URL`
- Check database permissions
- Run migrations

**Authentication Issues:**
- Verify `NEXTAUTH_URL`
- Check `NEXTAUTH_SECRET`
- Verify callback URLs

**Stripe Issues:**
- Check API keys
- Verify webhook endpoint
- Test with Stripe CLI

### Getting Help

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)

## 📈 Next Steps

After successful deployment:

1. **Set up monitoring** - Sentry, Vercel Analytics
2. **Configure custom domain** - Add your own domain
3. **Set up CI/CD** - Automated deployments
4. **Implement backup strategy** - Database backups
5. **Plan scaling strategy** - Handle growth

## 🎯 Production URLs

After deployment, your app will be available at:
- **Main App**: `https://your-app-name.vercel.app`
- **API Health**: `https://your-app-name.vercel.app/api/health`
- **Admin Panel**: `https://your-app-name.vercel.app/admin`

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the logs in Vercel dashboard
3. Check the application logs
4. Contact support if needed

---

**Happy Deploying! 🚀**
