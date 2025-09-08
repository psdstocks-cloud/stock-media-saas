# 🚀 Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Stripe Account**: For payment processing
4. **Nehtw.com API Key**: For stock media downloads

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 1.2 Create Production Environment File
Create `.env.production` (this will be used as reference):
```bash
# Production Environment Variables
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
DATABASE_URL=postgresql://username:password@host:port/database
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEHTW_API_KEY=your-nehtw-api-key-here
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
```

## Step 2: Deploy to Vercel

### 2.1 Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository and click "Import"

### 2.2 Configure Project
- **Framework Preset**: Next.js
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install`

### 2.3 Set Environment Variables
In Vercel dashboard, go to Settings > Environment Variables and add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` | Production |
| `NEXTAUTH_SECRET` | `your-super-secret-key` | Production |
| `DATABASE_URL` | `postgresql://...` | Production |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Production |
| `NEHTW_API_KEY` | `your-api-key` | Production |
| `NEXT_PUBLIC_BASE_URL` | `https://your-app-name.vercel.app` | Production |

## Step 3: Database Setup

### 3.1 Vercel Postgres (Recommended)
1. In Vercel dashboard, go to Storage
2. Create a new Postgres database
3. Copy the connection string
4. Set as `DATABASE_URL` environment variable

### 3.2 Alternative: External PostgreSQL
- **Railway**: [railway.app](https://railway.app)
- **Supabase**: [supabase.com](https://supabase.com)
- **Neon**: [neon.tech](https://neon.tech)

## Step 4: Stripe Configuration

### 4.1 Get Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your live API keys
3. Set up webhook endpoint: `https://your-app-name.vercel.app/api/stripe/webhook`
4. Add webhook events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 4.2 Test Webhook
Use Stripe CLI to test webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Step 5: Deploy and Configure

### 5.1 Deploy
1. Click "Deploy" in Vercel
2. Wait for deployment to complete
3. Note your deployment URL

### 5.2 Database Migration
After deployment, run database migrations:
```bash
# Connect to your Vercel project
vercel env pull .env.local

# Generate Prisma client
npx prisma generate

# Push schema to production database
npx prisma db push

# Seed initial data
npx prisma db seed
```

### 5.3 Update Environment Variables
Update `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL` with your actual Vercel URL.

## Step 6: Post-Deployment

### 6.1 Test All Features
- [ ] User registration
- [ ] User login
- [ ] Subscription creation
- [ ] Order placement
- [ ] Points management
- [ ] Admin panel

### 6.2 Set Up Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking
- **Uptime monitoring**: UptimeRobot or similar

### 6.3 Domain Setup (Optional)
1. Buy a domain
2. Add to Vercel project
3. Update environment variables
4. Configure DNS

## Step 7: Production Checklist

### 7.1 Security
- [ ] Strong `NEXTAUTH_SECRET`
- [ ] Secure database connection
- [ ] HTTPS enabled
- [ ] Environment variables secured

### 7.2 Performance
- [ ] Database optimized
- [ ] Images optimized
- [ ] CDN configured
- [ ] Caching enabled

### 7.3 Monitoring
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Database monitoring

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify Prisma schema
   - Check for TypeScript errors

2. **Database Connection**
   - Verify `DATABASE_URL`
   - Check database permissions
   - Run migrations

3. **Authentication Issues**
   - Verify `NEXTAUTH_URL`
   - Check `NEXTAUTH_SECRET`
   - Verify callback URLs

4. **Stripe Issues**
   - Check API keys
   - Verify webhook endpoint
   - Test with Stripe CLI

### Support
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Next.js Documentation: [nextjs.org/docs](https://nextjs.org/docs)
- Prisma Documentation: [prisma.io/docs](https://prisma.io/docs)

## Next Steps

After successful deployment:
1. Set up monitoring and alerts
2. Configure custom domain
3. Set up CI/CD pipeline
4. Implement backup strategy
5. Plan scaling strategy
