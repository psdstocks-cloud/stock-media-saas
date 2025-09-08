# 🚀 StockMedia Pro - SaaS Stock Media Download Platform

A complete SaaS platform for stock media downloads with subscription-based point system and rollover functionality.

## ✨ Features

### 🎯 Core Features
- **Subscription-based Point System** - Monthly plans with different point allocations
- **Point Rollover** - Unused points roll over to next month (up to 50% of monthly allocation)
- **Multi-Site Support** - Access to 25+ stock sites (Shutterstock, Adobe Stock, Freepik, etc.)
- **Real-time Order Processing** - Integration with nehtw.com API
- **Admin Dashboard** - Complete management interface
- **User Dashboard** - Personal account and download management

### 💰 Subscription Plans
- **Starter** - $9.99/month (50 points, 25 rollover)
- **Professional** - $29.99/month (200 points, 100 rollover) 
- **Business** - $79.99/month (600 points, 300 rollover)
- **Enterprise** - $199.99/month (1500 points, 750 rollover)

### 🎨 Stock Sites Supported
- **Low Cost (0.15-0.5 points)**: Freepik, Flaticon, Vecteezy, Rawpixel, etc.
- **Medium Cost (1-10 points)**: Craftwork, UI8, Shutterstock Video HD, etc.
- **High Cost (16+ points)**: Shutterstock 4K, Alamy, iStock Video HD, etc.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: NextAuth.js (ready for integration)
- **Payments**: Stripe (ready for integration)
- **External API**: nehtw.com integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and Install**
```bash
git clone <your-repo>
cd stock-media-saas
npm install
```

2. **Set up Environment**
```bash
# Database is already configured for SQLite
echo 'DATABASE_URL="file:./dev.db"' > .env
```

3. **Set up Database**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed the database with initial data
npm run db:seed
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Open in Browser**
```
http://localhost:3000
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage with pricing
│   ├── register/             # User registration
│   ├── dashboard/            # User dashboard
│   ├── admin/                # Admin dashboard
│   └── api/                  # API endpoints
│       ├── orders/           # Order management
│       ├── points/           # Points system
│       └── subscriptions/    # Subscription management
├── lib/
│   ├── prisma.ts            # Database client
│   ├── points.ts            # Points management system
│   └── nehtw-api.ts         # External API integration
└── components/              # Reusable UI components
```

## 🗄️ Database Schema

### Key Models
- **User** - User accounts and profiles
- **SubscriptionPlan** - Available subscription tiers
- **Subscription** - User subscriptions with Stripe integration
- **PointsBalance** - User point balances and usage tracking
- **PointsHistory** - Transaction history for points
- **StockSite** - Supported stock sites and their costs
- **Order** - Download orders and status tracking
- **ApiKey** - User API keys for nehtw.com

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL="file:./dev.db"

# Stripe (for production)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# NextAuth (for production)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# nehtw.com API
NEHTW_API_KEY="your-api-key"
```

### Database Management
```bash
# View database in Prisma Studio
npm run db:studio

# Reset database
npx prisma db push --force-reset
npm run db:seed

# Generate new migration
npx prisma migrate dev --name your-migration-name
```

## 📊 Business Model

### Revenue Streams
1. **Monthly Subscriptions** - Recurring revenue from plan subscriptions
2. **Point Markup** - 30-50% profit margin on point costs
3. **Premium Features** - Advanced features for higher tiers

### Cost Structure
- **Point Cost**: $0.23 per point (from nehtw.com)
- **Your Price**: $0.30-0.35 per point (30-50% markup)
- **Monthly Hosting**: $20-50 (Vercel + Supabase)

### Profitability Examples
- **Starter Plan**: $9.99 revenue - $11.50 cost = -$1.51 (loss leader)
- **Professional Plan**: $29.99 revenue - $46.00 cost = -$16.01 (loss leader)
- **Business Plan**: $79.99 revenue - $138.00 cost = -$58.01 (loss leader)
- **Enterprise Plan**: $199.99 revenue - $345.00 cost = -$145.01 (loss leader)

*Note: These are wholesale costs. Your actual profit comes from the markup on individual downloads.*

## 🎯 Usage Examples

### For Users
1. **Sign Up** - Choose a subscription plan
2. **Get Points** - Receive monthly point allocation
3. **Browse & Download** - Select from 25+ stock sites
4. **Track Usage** - Monitor points and download history
5. **Rollover** - Unused points carry to next month

### For Admins
1. **Monitor Users** - View user activity and subscriptions
2. **Manage Plans** - Update pricing and features
3. **Track Revenue** - Monitor points usage and profits
4. **System Settings** - Configure rollover limits, costs, etc.

## 🔌 API Integration

### nehtw.com API Endpoints Used
- `GET /api/stockinfo/{site}/{id}` - Get stock item information
- `GET /api/stockorder/{site}/{id}` - Place download order
- `GET /api/order/{task_id}/status` - Check order status
- `GET /api/v2/order/{task_id}/download` - Generate download link
- `GET /api/order/{task_id}/cancel` - Cancel order
- `GET /api/myfiles` - Get user's downloaded files
- `GET /api/stocksites` - Get available stock sites

### Point Rollover Logic
```typescript
// Example: Professional plan (200 points, 100 rollover limit)
const currentPoints = 150; // User has 150 points left
const monthlyPoints = 200; // New monthly allocation
const rolloverLimit = 100; // Max 100 points can rollover
const rolloverAmount = Math.min(currentPoints, rolloverLimit); // 100 points
const newTotalPoints = monthlyPoints + rolloverAmount; // 300 points total
```

## 🚀 Deployment

### Quick Deploy to Vercel
```bash
# 1. Setup local environment
./scripts/setup.sh

# 2. Deploy to production
./scripts/deploy.sh
```

### Manual Deployment Steps

#### 1. Vercel (Recommended)
1. **Connect Repository** - Link your GitHub repo to Vercel
2. **Set Environment Variables** - Add all required env vars
3. **Deploy** - Automatic deployment on push

#### 2. Database (Production)
- **Vercel Postgres** - Built-in PostgreSQL (recommended)
- **Supabase** - PostgreSQL with built-in auth
- **Railway** - Simple PostgreSQL hosting
- **Neon** - Serverless PostgreSQL

#### 3. Environment Variables
```bash
# Required for production
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-super-secret-key"
DATABASE_URL="postgresql://username:password@host:port/database"
STRIPE_SECRET_KEY="sk_live_your_live_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
NEHTW_API_KEY="your-nehtw-api-key"
NEXT_PUBLIC_BASE_URL="https://your-app.vercel.app"
```

### 📖 Detailed Deployment Guide
See [README_DEPLOYMENT.md](./README_DEPLOYMENT.md) for complete deployment instructions.

## 📈 Scaling & Optimization

### Performance
- **CDN** - Vercel Edge Network for global delivery
- **Caching** - Redis for session and API response caching
- **Database** - Connection pooling and query optimization

### Monitoring
- **Vercel Analytics** - Performance and usage metrics
- **Sentry** - Error tracking and monitoring
- **Stripe Dashboard** - Payment and subscription analytics

## 🔒 Security

### Data Protection
- **Encryption** - All sensitive data encrypted at rest
- **API Keys** - Secure storage and rotation
- **Rate Limiting** - Prevent abuse and overuse

### Compliance
- **GDPR** - Data privacy and user rights
- **PCI DSS** - Secure payment processing
- **SOC 2** - Security and availability standards

## 📚 Documentation

### Complete Documentation Suite
- **[User Guide](./docs/USER_GUIDE.md)** - Complete end-user documentation
- **[Developer Guide](./docs/DEVELOPER_GUIDE.md)** - Technical documentation for developers
- **[API Documentation](./docs/API.md)** - Complete API reference with examples
- **[OpenAPI Specification](./docs/openapi.yaml)** - Machine-readable API spec
- **[Documentation Index](./docs/README.md)** - Overview of all documentation

### Quick Links
- **Live Application:** https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app
- **API Base URL:** https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app/api
- **GitHub Repository:** https://github.com/psdstocks-cloud/stock-media-saas

## 🤝 Support

### Documentation
- **API Docs** - Complete API reference with code examples
- **User Guide** - Step-by-step tutorials and troubleshooting
- **Developer Guide** - Technical documentation and integration guides

### Contact
- **Email** - support@stockmediapro.com
- **GitHub Issues** - [Create an issue](https://github.com/psdstocks-cloud/stock-media-saas/issues)
- **Discord** - Community support and discussions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Success Metrics

### Key Performance Indicators
- **Monthly Recurring Revenue (MRR)** - Target: $10,000+ by month 6
- **Customer Acquisition Cost (CAC)** - Target: <$50
- **Customer Lifetime Value (LTV)** - Target: >$500
- **Churn Rate** - Target: <5% monthly
- **Point Utilization** - Target: 70%+ monthly usage

### Growth Strategy
1. **Month 1-2**: Launch with core features, 100 beta users
2. **Month 3-4**: Add advanced features, 500 paying customers
3. **Month 5-6**: Scale infrastructure, 1000+ customers
4. **Month 7+**: International expansion, enterprise features

---

**Built with ❤️ for the creative community**

*Start your profitable stock media business today!*
