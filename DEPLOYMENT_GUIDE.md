# 🚀 StockMedia SaaS - Vercel Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Phase 1 Complete: Authentication System
- [x] NextAuth.js configured with Google, Facebook, and Credentials providers
- [x] Password hashing with bcryptjs
- [x] Registration and login forms with validation
- [x] Password reset functionality
- [x] Route protection middleware
- [x] Admin role-based access control

## 🗄️ Database Setup (Required)

### Option 1: Vercel Postgres (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project
3. Go to **Storage** tab
4. Click **Create Database** → **Postgres**
5. Choose a name (e.g., `stock-media-db`)
6. Copy the connection string

### Option 2: External PostgreSQL
- **Neon**: https://neon.tech (Free tier available)
- **Supabase**: https://supabase.com (Free tier available)
- **Railway**: https://railway.app (Free tier available)

## 🔧 Environment Variables Setup

### Required Variables for Vercel:

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-32-characters-minimum

# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# Application URLs
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
NEXT_PUBLIC_SOCKET_URL=https://your-app.vercel.app

# Email Configuration (for password reset)
EMAIL_FROM=noreply@yourdomain.com
EMAIL_SERVER_HOST=smtp.yourdomain.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@yourdomain.com
EMAIL_SERVER_PASSWORD=your-email-password

# Optional: Stripe (for future payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Optional: Nehtw API
NEHTW_API_KEY=your-nehtw-api-key
```

## 🔑 OAuth Provider Setup

### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-app.vercel.app/api/auth/callback/google` (production)

### Facebook OAuth Setup:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add **Facebook Login** product
4. Set **Valid OAuth Redirect URIs**:
   - `http://localhost:3000/api/auth/callback/facebook` (development)
   - `https://your-app.vercel.app/api/auth/callback/facebook` (production)

## 📧 Email Setup (for Password Reset)

### Option 1: Gmail SMTP
```bash
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-gmail@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
```

### Option 2: SendGrid
1. Create account at [SendGrid](https://sendgrid.com/)
2. Create API key
3. Use SMTP settings provided by SendGrid

### Option 3: Resend (Recommended)
1. Create account at [Resend](https://resend.com/)
2. Get API key
3. Update email configuration in your code

## 🚀 Deployment Steps

### 1. Push to Git Repository
```bash
git add .
git commit -m "🚀 Phase 1 Complete: Authentication System Ready for Production"
git push origin main
```

### 2. Deploy to Vercel
```bash
# Option A: Using Vercel CLI
npm install -g vercel
vercel --prod

# Option B: Connect GitHub repository to Vercel
# 1. Go to vercel.com
# 2. Import your GitHub repository
# 3. Configure environment variables
# 4. Deploy
```

### 3. Database Migration
After deployment, run database migrations:
```bash
# In Vercel dashboard, go to Functions tab
# Create a new function to run migrations
# Or use Vercel CLI:
vercel env pull .env.local
npx prisma migrate deploy
npx prisma generate
```

### 4. Seed Initial Data
```bash
# Run admin seeding
npm run seed:admin
```

## 🔍 Post-Deployment Testing

### Test Authentication Flow:
1. ✅ **Registration**: Create new user account
2. ✅ **Login**: Sign in with email/password
3. ✅ **OAuth**: Test Google and Facebook login
4. ✅ **Password Reset**: Test forgot password flow
5. ✅ **Admin Access**: Verify admin dashboard access

### Test URLs:
- `https://your-app.vercel.app/register`
- `https://your-app.vercel.app/login`
- `https://your-app.vercel.app/forgot-password`
- `https://your-app.vercel.app/dashboard`
- `https://your-app.vercel.app/admin`

## 🛠️ Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Check DATABASE_URL format
   - Ensure database is accessible from Vercel
   - Run `npx prisma migrate deploy`

2. **OAuth Redirect Errors**:
   - Verify redirect URIs in OAuth providers
   - Check NEXTAUTH_URL matches your domain

3. **Email Not Sending**:
   - Verify email credentials
   - Check SMTP settings
   - Test with a simple email first

4. **Build Errors**:
   - Check all environment variables are set
   - Verify TypeScript compilation
   - Check for missing dependencies

## 📞 Support

If you encounter any issues:
1. Check Vercel deployment logs
2. Review environment variables
3. Test locally with production environment
4. Check database connectivity

## 🎯 Next Steps (Phase 2)

After successful deployment:
1. **Stock Media Integration**: Connect to stock photo APIs
2. **Payment Processing**: Implement Stripe integration
3. **Download System**: Build file download functionality
4. **User Dashboard**: Enhance user experience
5. **Admin Panel**: Complete admin functionality

---

**Deployment Status**: ✅ Ready for Production
**Authentication**: ✅ Complete
**Database**: ⚠️ Requires Setup
**OAuth**: ⚠️ Requires Configuration
**Email**: ⚠️ Requires Setup