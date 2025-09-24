# 📋 Changelog

All notable changes to the Stock Media SaaS project are documented in this file.

## [v2.1.1] - 2025-09-24 - Dark Mode & Pricing Polish

### 🎨 Theming & Accessibility
- Global theme polish: ensured header ThemeToggle is visible and FOUC-safe; honors system preference and persists to localStorage.
- Tokenized surfaces and text across sections using HSL CSS variables: `--background`, `--foreground`, `--card`, `--muted`, `--border`, etc.
- Improved contrast for headings, links, and labels in dark mode to meet a11y standards.

### 💳 Pricing Page (pay-as-you-go + subscriptions)
- Overhauled dark mode for the entire `/pricing` page:
  - Tokenized the pricing mode toggle (buttons, inactive/active states) for light/dark.
  - Fixed “Simple, Transparent Pricing” header and supporting copy to use theme tokens.
  - Converted the comparison table to theme-aware borders, backgrounds, and text; added dark variant highlight for Professional column.
  - Updated the CTA section gradient with dark variants and theme-aware button/border colors.
  - Ensured point values and supportive text use foreground/muted-foreground tokens with proper contrast.
- `PricingSection`: tokenized card surfaces, headings, body text, and bottom helper text for dark mode.
- `SubscriptionPlansSection`: tokenized cards, icon chips, price text, points block, and benefits section; added dark gradients and contrast-safe colors.

### 🧭 Header & Landing
- Header links and typography now use theme tokens for consistent contrast in dark mode.
- Landing sections “How it works” and “Pricing” converted to tokenized surfaces and text with improved contrast.

### 🧰 Order v3 UI Consistency
- Supported Platforms tiles: switched to tokenized card/muted/border tokens; fixed site name contrast in dark mode.
- URL textarea: migrated to shared tokenized Textarea so it renders light in light mode and dark in dark mode.

### 🔒 Scope
- UI-only changes. No backend behavior altered.

### 📄 Files Touched (high level)
- `src/app/pricing/page.tsx`
- `src/components/landing/PricingSection.tsx`
- `src/components/landing/SubscriptionPlansSection.tsx`
- Related theme/token usage already present in `globals.css`, header, and shared UI components

---

## [v2.1.0] - 2025-09-24 - Stock Ordering & UX Hardening

### 🔧 Backend
- Fix phantom redownload logic in `src/app/api/place-order/route.ts`: create new 0-cost orders for valid redownloads and always trigger fresh link generation.
- Normalize statuses to a single final state by rewriting `READY` → `COMPLETED` in processors and API responses.
- External API integration updates in `src/lib/nehtw-api.ts`:
  - Switch `placeOrder` to `axios.get` (resolve 405 errors) and add robust error logging.
  - Clean `NEHTW_API_KEY` of curly braces in all routes using it.
  - Integrate `getStockInfo` passthrough when API key exists; fallback to mock on failure.
- Regenerate-download route fixes: use JWT auth, await `params`, and clean API key.

### 🖥️ Frontend - Order v2
- Parse URLs using `official-url-parser.ts`; surface titles as "Site - ID" across supported websites.
- Disable delete icon once an order is placed to prevent misuse.
- Pre-order points validation and corrected cost handling (supports `0` for free redownloads).
- Batch "Order All" processing ensures fresh links and proper status flow.
- Supported Sites section: removed categories, added search, and standardized cost to 10 points via API.

### 📜 Frontend - History v2
- Deduplicate entries (latest per site + stock ID), show full timestamp, and normalize statuses in UI.
- Enhanced search (full link, debug ID/taskId, numeric ID) and display taskId with copy + micro animation.
- Same-tab downloads with loading indicator; removed "(Re-download)" suffix.
- Added filters, pagination, and aria-live announcements for accessibility.

### 🧪 Order v3 (Experimental)
- New Zustand `orderStore`, `UnifiedOrderItem` component, and SSE progress streaming with retry + polling fallback.
- Skeletons for items/platforms, offline queue for actions, and comprehensive aria-live announcements.
- Supported platforms with real logos, example URL chips (copy/paste), and URL deduplication with toasts.

### 🎨 UI/Branding
- Introduced brand tokens and typography in `globals.css`; added `BrandButton` (dark/light variants) and applied to key CTAs.
- Landing: added/refined `HowItWorksSection`, `ProductShowcaseSection`, `FAQSection`, and improved `PricingSection` loading states.
- Accessibility pass for How it works: list semantics, improved contrast, labeled/ described steps, and focus order; responsive spacing fine-tuned for sm/md/lg.

### 🧰 Testing & DX
- Jest + RTL setup with initial unit tests for `orderStore` and component tests for `UnifiedOrderItem`.
- Expanded logging across API and processor layers for easier external API debugging.

---

## [v2.0.0] - 2025-01-10 - 🚀 MAJOR SYSTEM REDESIGN

### 🎯 Core Business Page Redesign
- **Complete redesign of `/dashboard/browse` page** - The core business functionality has been completely overhauled
- **Implemented proper points validation** - Points are now checked BEFORE order placement, preventing the "insufficient points" error after order creation
- **Added real-time order processing** - Implemented Server-Sent Events for live progress updates
- **Created comprehensive error handling** - User-friendly error messages with actionable solutions

### 📄 New Pages Added
- **`/dashboard/pricing`** - Beautiful, conversion-optimized pricing page with multiple plan options
- **`/reviews`** - Customer reviews page with advanced anti-spam protection
- **`/about`, `/blog`, `/careers`, `/contact`, `/privacy`, `/terms`** - Complete static page set
- **`/forgot-password`, `/reset-password`** - Comprehensive password recovery system

### 🔧 New API Endpoints
- **`/api/orders/[id]/stream`** - Real-time order status updates using Server-Sent Events
- **`/api/orders/[id]/order-status`** - Order status checking with rate limiting (100 req/min)
- **`/api/reviews`** - Review submission and fetching with multi-layer spam protection
- **`/api/contact`** - Contact form with CSRF protection and input validation
- **`/api/csrf`** - CSRF token generation for form security
- **`/api/forgot-password`, `/api/reset-password`** - Secure password recovery system
- **`/api/check-email`, `/api/check-timer`** - Email validation and timer management

### 🧩 New Components
- **`Header.tsx`** - Reusable header component with user context and mobile responsiveness
- **`Footer.tsx`** - Reusable footer component with proper routing
- **`EnhancedReviewForm.tsx`** - Advanced review form with behavioral analysis and spam protection
- **`GoogleSignInButton.tsx`, `FacebookSignInButton.tsx`** - Social authentication buttons
- **`ReviewForm.tsx`** - Basic review form component

### 🔒 Security Enhancements

#### 🛡️ Rate Limiting System
- **Generic rate limiting function** with LRU cache implementation
- **IP-based rate limiting** for all critical endpoints
- **Order status API**: 100 requests per minute per IP
- **Order streams**: 10 streams per minute per IP
- **Password reset**: 5 attempts per hour per IP
- **Contact form**: 10 submissions per hour per IP

#### 🔐 Input Validation & Sanitization
- **Zod schemas** for all form inputs with comprehensive validation
- **XSS and SQL injection prevention** with input sanitization
- **CSRF protection** with token-based validation
- **Enhanced anti-spam protection** for reviews with behavioral analysis

#### 🔑 Authentication Improvements
- **Switched to JWT session strategy** for improved reliability
- **Proper session callbacks** for user data mapping
- **Enhanced password reset system** with email validation and secure tokens

### 🎨 UI/UX Improvements

#### 📱 Mobile Responsiveness
- **Complete mobile optimization** for all pages and components
- **Responsive navigation** with collapsible mobile menu
- **Touch-friendly buttons** and interactive elements
- **Optimized layouts** for all screen sizes

#### 🎯 User Experience
- **Real-time progress tracking** with visual progress bars and percentage indicators
- **Clear error messages** with actionable solutions and recovery options
- **Smooth animations** and transitions throughout the application
- **Intuitive navigation** and user flow optimization

#### 🎨 Visual Design
- **Modern gradient backgrounds** and professional styling
- **Consistent color scheme** and typography across all pages
- **Professional loading states** and animated indicators
- **Clear visual hierarchy** and information architecture

### ⚡ Performance & Architecture

#### 🏗️ System Architecture
- **OrderProcessor class** for centralized order management and processing
- **Real-time processing** with background tasks and status updates
- **Server-Sent Events** for live updates without polling
- **Proper error handling** and recovery mechanisms

#### 🚀 Performance Optimizations
- **Efficient state management** with proper cleanup and memory management
- **Memory leak prevention** with automatic resource cleanup
- **Optimized API calls** and intelligent caching strategies
- **Background processing** for non-blocking operations

### 🐛 Bug Fixes

#### 🔧 Critical Fixes
- **Fixed points validation** occurring after order placement (now validates before)
- **Fixed real-time processing** getting stuck at 0% progress
- **Fixed connection issues** in order monitoring with proper error handling
- **Fixed session management** and authentication flow reliability
- **Fixed mobile navigation** and responsive design issues

#### 🛠️ Technical Fixes
- **Resolved TypeScript compilation errors** across all components
- **Fixed Next.js configuration warnings** and deprecated options
- **Corrected dynamic route parameter handling** for API endpoints
- **Fixed import statements** and dependency management

### 📊 Database Schema Updates
- **Added Review model** for customer reviews with comprehensive fields
- **Enhanced User model** with reviews relationship
- **Added proper indexing** and database constraints
- **Optimized queries** for better performance

### 🔧 Configuration Updates
- **Updated next.config.js** with comprehensive security headers
- **Added security headers**: XSS, CSRF, HSTS, CSP, frame options
- **Removed deprecated experimental options** for cleaner configuration
- **Enhanced middleware configuration** for better request handling

### 📦 Dependencies Added
- **`lru-cache`** - For efficient rate limiting implementation
- **`zod`** - For comprehensive input validation and schema definition
- **`jose`** - For JWT handling and token management
- **Updated package.json** with all new dependencies and proper versioning

### 🧪 Testing & Quality Assurance
- **Comprehensive error handling** and edge case testing
- **Rate limiting and security testing** across all endpoints
- **Mobile responsiveness testing** on various devices
- **Real-time functionality testing** with various scenarios

### 🚀 Deployment
- **Production-ready build** with all optimizations and security measures
- **Vercel deployment** with proper configuration and environment variables
- **Environment variable management** for secure configuration
- **Database migration support** for schema updates

### 📈 Business Impact
- **Improved conversion rates** with better user experience and flow
- **Enhanced security and user trust** with comprehensive protection measures
- **Reduced support tickets** with better error handling and user guidance
- **Increased user engagement** with real-time features and smooth interactions

---

## [v1.5.0] - 2025-01-09 - 🔧 Previous Updates

### 📏 File Size Optimization
- Optimized file size limit to 2MB for better performance
- Improved file handling and validation

### 🔧 TypeScript Fixes
- Fixed TypeScript error by adding RotateCcw import
- Resolved compilation issues

### 🚀 Profile Data Caching
- Implemented profile data caching for better performance
- Reduced API calls and improved user experience

### 🚨 Security Fixes
- Removed debug information from production builds
- Enhanced security measures

---

## 📝 Commit History

### Latest Commit: ff75dc6
**fix: comprehensive dark mode tokenization for pricing page**

**Files Changed:** 3 files
**Insertions:** 103 lines
**Deletions:** 103 lines

**Key Changes:**
- Tokenized pricing page toggle, comparison table, FAQ, and CTA for dark mode
- Updated `PricingSection` and `SubscriptionPlansSection` to use theme tokens
- Ensured high-contrast text and theme-aware borders/surfaces

### Previous Commits:
- **3822b98** - 📏 OPTIMIZE FILE SIZE LIMIT TO 2MB
- **dc1bdf7** - 🔧 Fix TypeScript Error: Add RotateCcw Import
- **5bb5715** - 🚀 CRITICAL UX FIX: Implement Profile Data Caching
- **c6a7d34** - 🚨 CRITICAL SECURITY FIX: Remove Debug Information

---

## 🎯 Next Steps

### Planned Improvements
- [ ] Advanced analytics dashboard
- [ ] Bulk download functionality
- [ ] Advanced search and filtering
- [ ] User preference management
- [ ] Advanced reporting features

### Technical Debt
- [ ] Code refactoring for better maintainability
- [ ] Additional test coverage
- [ ] Performance monitoring implementation
- [ ] Documentation improvements

---

## 📞 Support

For questions or issues related to these changes, please contact the development team or create an issue in the GitHub repository.

**Repository:** https://github.com/psdstocks-cloud/stock-media-saas
**Production URL:** https://stock-media-saas-izgzzvfah-psdstocks-projects.vercel.app
