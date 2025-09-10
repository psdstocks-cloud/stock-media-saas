# 🚀 Deployment Guide - Stock Media SaaS

## 📋 Quick Deploy Commands

### 🔄 Auto Deploy (Recommended)
```bash
# Automatically commit changes and deploy to Vercel
npm run auto-deploy
```

### 🚀 Manual Deploy
```bash
# Commit and push changes
git add .
git commit -m "🔧 Your commit message"
git push origin main

# Deploy to Vercel
npm run deploy
```

### ⚡ Quick Commit & Deploy
```bash
# One command to commit and deploy
npm run commit-and-deploy
```

## 🔧 Setup Instructions

### 1. GitHub Actions Setup
The repository includes GitHub Actions for automatic deployment:

**File:** `.github/workflows/deploy.yml`
- Automatically builds and deploys on push to main branch
- Requires Vercel secrets to be configured in GitHub

**Required Secrets:**
- `VERCEL_TOKEN` - Your Vercel API token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

### 2. Vercel CLI Setup
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Link project (if not already linked)
vercel link
```

### 3. Environment Variables
Ensure these are set in Vercel dashboard:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - Your production URL
- `NEHTW_API_KEY` - API key for stock media service
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

## 📊 Deployment Workflow

### 🔄 Automatic Deployment
1. **Make changes** to any file
2. **Run auto-deploy:** `npm run auto-deploy`
3. **Script automatically:**
   - Adds all changes to git
   - Commits with descriptive message
   - Pushes to GitHub
   - Deploys to Vercel

### 🎯 Manual Deployment
1. **Stage changes:** `git add .`
2. **Commit changes:** `git commit -m "Your message"`
3. **Push to GitHub:** `git push origin main`
4. **Deploy to Vercel:** `vercel --prod`

## 🛠️ Available Scripts

### 📦 Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### 🚀 Deployment
```bash
npm run deploy       # Deploy to Vercel
npm run auto-deploy  # Auto commit and deploy
npm run commit-and-deploy  # Quick commit and deploy
```

### 🔍 Utilities
```bash
npm run status       # Check git status and recent commits
npm run sync         # Pull latest changes and rebuild
```

## 📋 Commit Message Guidelines

The auto-deploy script generates commit messages based on file changes:

- **Browse page changes:** `🎯 Update browse media page`
- **API changes:** `🔧 Update API endpoints`
- **Component changes:** `🧩 Update components`
- **Library changes:** `📚 Update utilities and libraries`
- **Dependency changes:** `📦 Update dependencies`
- **Schema changes:** `🗄️ Update database schema`
- **Config changes:** `⚙️ Update Next.js configuration`
- **General changes:** `🔧 General updates and improvements`

## 🔍 Monitoring Deployment

### 📊 Vercel Dashboard
- **URL:** https://vercel.com/dashboard
- **Project:** stock-media-saas
- **Status:** Check deployment status and logs

### 🌐 Production URL
- **Live Site:** https://stock-media-saas-izgzzvfah-psdstocks-projects.vercel.app
- **GitHub:** https://github.com/psdstocks-cloud/stock-media-saas

### 📈 GitHub Actions
- **URL:** https://github.com/psdstocks-cloud/stock-media-saas/actions
- **Status:** Check build and deployment status

## 🚨 Troubleshooting

### ❌ Common Issues

#### 1. Vercel CLI Not Found
```bash
# Install Vercel CLI
npm i -g vercel

# Or use npx
npx vercel --prod
```

#### 2. Build Failures
```bash
# Check build locally
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

#### 3. Environment Variables
- Check Vercel dashboard for missing variables
- Ensure all required variables are set
- Restart deployment after adding variables

#### 4. Database Issues
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push
```

### 🔧 Debug Commands
```bash
# Check git status
git status

# Check recent commits
git log --oneline -5

# Check Vercel status
vercel ls

# Check build logs
vercel logs
```

## 📚 Best Practices

### ✅ Before Deploying
1. **Test locally:** `npm run build`
2. **Check git status:** `git status`
3. **Review changes:** `git diff`
4. **Run linting:** `npm run lint`

### ✅ After Deploying
1. **Check production URL**
2. **Test critical functionality**
3. **Monitor Vercel logs**
4. **Update documentation if needed**

### ✅ Regular Maintenance
1. **Keep dependencies updated**
2. **Monitor build performance**
3. **Check for security updates**
4. **Review deployment logs**

## 🎯 Quick Reference

| Command | Description |
|---------|-------------|
| `npm run auto-deploy` | 🔄 Auto commit and deploy |
| `npm run deploy` | 🚀 Deploy to Vercel only |
| `npm run status` | 📊 Check git status |
| `npm run sync` | 🔄 Pull and rebuild |
| `vercel --prod` | 🚀 Direct Vercel deploy |

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check GitHub Actions status
4. Contact the development team

---

**Happy Deploying! 🚀**
