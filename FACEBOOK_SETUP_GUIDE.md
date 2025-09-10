# Facebook Sign-In Setup Guide

## 🔐 **FACEBOOK APP SETUP FOR PRODUCTION**

### **Step 1: Create Facebook App**

1. **Go to Meta for Developers**: https://developers.facebook.com/
2. **Click "My Apps"** → **"Create App"**
3. **Select "Consumer"** as app type
4. **Fill in App Details**:
   - **App Name**: `StockMedia Pro` (or your preferred name)
   - **App Contact Email**: Your email address
   - **App Purpose**: Select "Other" or "Business"
5. **Click "Create App"**

### **Step 2: Configure Facebook Login**

1. **In your app dashboard**, find **"Facebook Login"** in the left sidebar
2. **Click "Set Up"** → **"Web"**
3. **Add your domain**:
   - **Site URL**: `https://your-domain.vercel.app`
   - **Valid OAuth Redirect URIs**: 
     - `https://your-domain.vercel.app/api/auth/callback/facebook`
     - `https://your-domain.vercel.app/auth/callback/facebook`

### **Step 3: Get App Credentials**

1. **Go to "Settings"** → **"Basic"**
2. **Copy your credentials**:
   - **App ID** (this will be your `FACEBOOK_CLIENT_ID`)
   - **App Secret** (this will be your `FACEBOOK_CLIENT_SECRET`)

### **Step 4: Configure Environment Variables**

Add these to your `.env.local` file:

```bash
# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret_here
```

### **Step 5: Configure Vercel Environment Variables**

1. **Go to Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. **Add the following variables**:
   - `FACEBOOK_CLIENT_ID` = your Facebook App ID
   - `FACEBOOK_CLIENT_SECRET` = your Facebook App Secret

### **Step 6: Configure App Settings**

1. **In Facebook App Dashboard** → **"Settings"** → **"Basic"**
2. **Add App Domains**:
   - `your-domain.vercel.app`
3. **Add Privacy Policy URL**:
   - `https://your-domain.vercel.app/privacy`
4. **Add Terms of Service URL**:
   - `https://your-domain.vercel.app/terms`

### **Step 7: Configure Facebook Login Settings**

1. **Go to "Facebook Login"** → **"Settings"**
2. **Add Valid OAuth Redirect URIs**:
   - `https://your-domain.vercel.app/api/auth/callback/facebook`
3. **Add Client OAuth Settings**:
   - **Use Strict Mode for Redirect URIs**: `ON`
   - **Enforce HTTPS**: `ON`

### **Step 8: Request App Review (Optional)**

For production use, you may need to request app review:

1. **Go to "App Review"** → **"Permissions and Features"**
2. **Request permissions**:
   - `email` (default)
   - `public_profile` (default)
3. **Submit for review** if required

### **Step 9: Test Facebook Sign-In**

1. **Deploy your app** to Vercel
2. **Test the Facebook Sign-In button**
3. **Verify user creation** in your database
4. **Check redirect flow** works correctly

## 🔧 **TROUBLESHOOTING**

### **Common Issues:**

1. **"App Not Setup" Error**:
   - Check if Facebook Login is properly configured
   - Verify redirect URIs are correct

2. **"Invalid OAuth Access Token"**:
   - Check if App Secret is correct
   - Verify environment variables are set

3. **"Redirect URI Mismatch"**:
   - Ensure redirect URIs match exactly
   - Check for trailing slashes

4. **"App Not Available"**:
   - App might be in development mode
   - Add test users or make app public

### **Development vs Production:**

- **Development**: App works with test users only
- **Production**: App works with all Facebook users
- **Review Required**: Some permissions need Facebook approval

## 📱 **MOBILE CONSIDERATIONS**

### **iOS/Android Apps:**
- Use Facebook SDK for mobile apps
- Configure bundle IDs/package names
- Handle deep linking for OAuth flow

### **Web App:**
- Works on all modern browsers
- Responsive design for mobile browsers
- Progressive Web App support

## 🔒 **SECURITY BEST PRACTICES**

1. **Keep App Secret Secure**:
   - Never expose in client-side code
   - Use environment variables only
   - Rotate secrets regularly

2. **Validate User Data**:
   - Always validate user information
   - Check email verification status
   - Handle edge cases gracefully

3. **Monitor Usage**:
   - Track sign-in success rates
   - Monitor for suspicious activity
   - Set up alerts for failures

## 📊 **ANALYTICS & MONITORING**

### **Facebook Analytics:**
- Track user engagement
- Monitor app performance
- Analyze user demographics

### **Your App Analytics:**
- Track sign-in conversion rates
- Monitor user registration flow
- Analyze user behavior patterns

## 🚀 **DEPLOYMENT CHECKLIST**

- [ ] Facebook App created and configured
- [ ] Environment variables set in Vercel
- [ ] Redirect URIs configured correctly
- [ ] App domains added to Facebook
- [ ] Privacy policy and terms of service URLs added
- [ ] Test Facebook Sign-In functionality
- [ ] Verify user creation in database
- [ ] Test on different devices and browsers
- [ ] Monitor for errors and issues

## 📞 **SUPPORT**

If you encounter issues:

1. **Check Facebook Developer Console** for error logs
2. **Verify environment variables** are set correctly
3. **Test with different browsers** and devices
4. **Check Vercel deployment logs** for server-side errors
5. **Contact Facebook Developer Support** if needed

---

**Note**: This guide assumes you're using Vercel for deployment. Adjust URLs and settings accordingly for other hosting platforms.
