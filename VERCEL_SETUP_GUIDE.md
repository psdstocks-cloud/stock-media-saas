# 🚀 StockMedia SaaS - Vercel Production Setup Guide

## 🎉 **DEPLOYMENT SUCCESS!**

Your application is successfully deployed to Vercel! 🎉

**Live URL**: https://stock-media-saas-fa8qmtsfa-psdstocks-projects.vercel.app

## ⚠️ **Current Status**: Environment Variables Needed

The application is deployed but needs environment variables to function properly. Currently showing loading screen due to missing configuration.

## 🔧 **Required Environment Variables Setup**

### Step 1: Access Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project: `stock-media-saas`
3. Click on **Settings** → **Environment Variables**

### Step 2: Add Required Variables

#### **Essential Variables (Minimum for Basic Functionality):**

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://stock-media-saas-6gnp5frr9-psdstocks-projects.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-32-characters-minimum-length

# Database (PostgreSQL - REQUIRED)
DATABASE_URL=postgresql://username:password@host:port/database

# Application URLs
NEXT_PUBLIC_BASE_URL=https://stock-media-saas-6gnp5frr9-psdstocks-projects.vercel.app
NEXT_PUBLIC_SOCKET_URL=https://stock-media-saas-6gnp5frr9-psdstocks-projects.vercel.app
```

#### **OAuth Providers (Optional but Recommended):**

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
```

#### **Email Configuration (For Password Reset):**

```bash
# Email Settings
EMAIL_FROM=noreply@yourdomain.com
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
```

## 🗄️ **Database Setup (CRITICAL)**

### Option 1: Vercel Postgres (Recommended)
1. In Vercel Dashboard → **Storage** tab
2. Click **Create Database** → **Postgres**
3. Name: `stock-media-db`
4. Copy the connection string
5. Add as `DATABASE_URL` environment variable

### Option 2: External PostgreSQL
- **Neon** (Free): https://neon.tech
- **Supabase** (Free): https://supabase.com
- **Railway** (Free): https://railway.app

## 🔑 **OAuth Setup (Optional)**

### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `https://stock-media-saas-6gnp5frr9-psdstocks-projects.vercel.app/api/auth/callback/google`

### Facebook OAuth:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create app → Add Facebook Login
3. Add redirect URI: `https://stock-media-saas-6gnp5frr9-psdstocks-projects.vercel.app/api/auth/callback/facebook`

## 📧 **Email Setup (For Password Reset)**

### Gmail SMTP (Easiest):
1. Enable 2-factor authentication on Gmail
2. Generate App Password
3. Use these settings:
   ```bash
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your-gmail@gmail.com
   EMAIL_SERVER_PASSWORD=your-16-char-app-password
   ```

## 🚀 **After Adding Environment Variables**

### 1. Redeploy
```bash
vercel --prod
```

### 2. Test Authentication
- **Register**: https://your-app.vercel.app/register
- **Login**: https://your-app.vercel.app/login
- **Dashboard**: https://your-app.vercel.app/dashboard

### 3. Database Migration (If needed)
```bash
# In Vercel Functions or locally with production DB
npx prisma migrate deploy
npx prisma generate
```

## 🎯 **Quick Start (Minimum Setup)**

For immediate testing, you only need:

1. **Database URL** (PostgreSQL)
2. **NextAuth Secret** (32+ characters)
3. **Application URLs**

Once these are set, the authentication system will work immediately!

## 🔍 **Troubleshooting**

### If still showing loading screen:
1. Check all environment variables are set
2. Verify database connection
3. Check Vercel deployment logs
4. Ensure NEXTAUTH_URL matches your domain

### Common Issues:
- **Database connection errors**: Check DATABASE_URL format
- **OAuth errors**: Verify redirect URIs match your domain
- **Email not sending**: Check SMTP credentials

## 📞 **Next Steps**

1. ✅ **Set environment variables** (5 minutes)
2. ✅ **Test authentication** (2 minutes)
3. ✅ **Share with client** (Ready!)
4. 🔄 **Configure OAuth providers** (Optional)
5. 🔄 **Set up email** (Optional)

## 🎉 **Ready to Share!**

Once environment variables are configured, your client can:
- Register new accounts
- Login with email/password
- Use Google/Facebook login (if configured)
- Reset passwords (if email configured)
- Access the dashboard
- Test the complete authentication flow

**Your Phase 1 authentication system is production-ready!** 🚀

---

**Deployment URL**: https://stock-media-saas-6gnp5frr9-psdstocks-projects.vercel.app
**Git Repository**: https://github.com/psdstocks-cloud/stock-media-saas
**Status**: ✅ Deployed, ⚠️ Environment Variables Needed
