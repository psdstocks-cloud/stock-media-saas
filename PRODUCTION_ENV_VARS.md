# 🚀 StockMedia SaaS - Production Environment Variables

## ✅ **Complete Environment Variables for Vercel**

Copy and paste these into your Vercel Dashboard → Settings → Environment Variables:

### **🔐 Authentication & Security**
```bash
NEXTAUTH_SECRET=/EVfkpH+oF5giR2nzLVMgyx/ijzWoGeG//15LQ521ic=
NEXTAUTH_URL=https://stock-media-saas-fa8qmtsfa-psdstocks-projects.vercel.app
```

### **🗄️ Database (Neon PostgreSQL)**
```bash
DATABASE_URL=postgresql://neondb_owner:npg_8iHgOXw7lVfC@ep-wispy-tooth-adpgk714-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_8iHgOXw7lVfC@ep-wispy-tooth-adpgk714.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL=postgresql://neondb_owner:npg_8iHgOXw7lVfC@ep-wispy-tooth-adpgk714-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_PRISMA_URL=postgresql://neondb_owner:npg_8iHgOXw7lVfC@ep-wispy-tooth-adpgk714-pooler.c-2.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:npg_8iHgOXw7lVfC@ep-wispy-tooth-adpgk714.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
PGHOST=ep-wispy-tooth-adpgk714-pooler.c-2.us-east-1.aws.neon.tech
PGHOST_UNPOOLED=ep-wispy-tooth-adpgk714.c-2.us-east-1.aws.neon.tech
POSTGRES_USER=neondb_owner
POSTGRES_PASSWORD=npg_8iHgOXw7lVfC
POSTGRES_DATABASE=neondb
PGPASSWORD=npg_8iHgOXw7lVfC
PGDATABASE=neondb
PGUSER=neondb_owner
```

### **📧 Email Configuration (Resend + Gmail)**
```bash
RESEND_API_KEY=re_7jYoVng1_LnwVwB7JpGMZwzo5DbfnzDhV
EMAIL_FROM=onboarding@resend.dev
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=psdstockspay@gmail.com
EMAIL_SERVER_PASSWORD=^q9APheM8T7V
```

### **⚡ Redis (Upstash)**
```bash
UPSTASH_REDIS_REST_TOKEN=ATTeAAIncDE1Zjc0ZDA1NGRlNDg0Y2ZjOTM4YWNkOTI3Yzc2MWRlNHAxMTM1MzQ
UPSTASH_REDIS_REST_URL=https://splendid-snipe-13534.upstash.io
```

### **🔗 Application URLs**
```bash
NEXT_PUBLIC_BASE_URL=https://stock-media-saas-fa8qmtsfa-psdstocks-projects.vercel.app
```

### **🔑 API Keys**
```bash
NEHTW_API_KEY=A8K9bV5s2OX12E8cmS4I96mtmSNzv7
STACK_SECRET_SERVER_KEY=ssk_52dhz1zs714p1bppb9nd0vbxk0zbcwrf0d0f4p00pgg1r
NEXT_PUBLIC_STACK_PROJECT_ID=curly-truth-98553686
NEON_PROJECT_ID=curly-truth-98553686
```

## 🚀 **Quick Setup Instructions**

### Step 1: Access Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find project: `stock-media-saas`
3. Click **Settings** → **Environment Variables**

### Step 2: Add All Variables
1. Click **Add New**
2. Copy each variable name and value from above
3. Set environment to **Production**
4. Click **Save**

### Step 3: Redeploy
```bash
vercel --prod
```

## ✅ **Expected Results After Setup**

Once all environment variables are configured:

1. **✅ Homepage loads** (no more loading screen)
2. **✅ Registration works** with email validation
3. **✅ Login works** with email/password
4. **✅ Password reset** works with email
5. **✅ Dashboard accessible** after login
6. **✅ Database connected** and functional
7. **✅ Email sending** works for password reset

## 🎯 **Live URLs to Test**

- **Homepage**: https://stock-media-saas-fa8qmtsfa-psdstocks-projects.vercel.app
- **Register**: https://stock-media-saas-fa8qmtsfa-psdstocks-projects.vercel.app/register
- **Login**: https://stock-media-saas-fa8qmtsfa-psdstocks-projects.vercel.app/login
- **Dashboard**: https://stock-media-saas-fa8qmtsfa-psdstocks-projects.vercel.app/dashboard
- **Forgot Password**: https://stock-media-saas-fa8qmtsfa-psdstocks-projects.vercel.app/forgot-password

## 🔍 **Troubleshooting**

### If still showing loading screen:
1. ✅ Check all variables are added to Vercel
2. ✅ Verify variable names match exactly
3. ✅ Ensure values don't have extra spaces
4. ✅ Redeploy after adding variables

### If authentication fails:
1. ✅ Check NEXTAUTH_URL matches your domain
2. ✅ Verify DATABASE_URL is correct
3. ✅ Check database is accessible

### If email not working:
1. ✅ Verify RESEND_API_KEY is valid
2. ✅ Check EMAIL_FROM is correct
3. ✅ Test with a simple email first

---

**Status**: ✅ Ready for Production
**Next Step**: Add environment variables to Vercel Dashboard
**After Setup**: Test authentication flow
