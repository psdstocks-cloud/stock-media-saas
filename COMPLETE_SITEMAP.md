# 🌐 Complete Stock Media SaaS Website Sitemap

**Base URL:** `https://stock-media-saas-ixygdj12g-psdstocks-projects.vercel.app`

---

## 📋 **Public Pages (No Authentication Required)**

### 🏠 **Main Pages**
| Page | URL | Description | Priority |
|------|-----|-------------|----------|
| **Homepage** | `/` | Main landing page with features and pricing | 🔥 High |
| **About** | `/about` | About the company and service | 📄 Medium |
| **Contact** | `/contact` | Contact form and support information | 📄 Medium |
| **Blog** | `/blog` | Company blog and updates | 📄 Medium |
| **Careers** | `/careers` | Job opportunities and company culture | 📄 Medium |

### 🔐 **Authentication Pages**
| Page | URL | Description | Priority |
|------|-----|-------------|----------|
| **Login** | `/login` | User login page | 🔥 High |
| **Register** | `/register` | User registration page | 🔥 High |
| **Forgot Password** | `/forgot-password` | Password reset request | 📄 Medium |
| **Reset Password** | `/reset-password` | Password reset form | 📄 Medium |

### 💰 **Pricing & Plans**
| Page | URL | Description | Priority |
|------|-----|-------------|----------|
| **Public Pricing** | `/pricing` | Public pricing page (redirects authenticated users) | 🔥 High |

### 📜 **Legal & Policy Pages**
| Page | URL | Description | Priority |
|------|-----|-------------|----------|
| **Terms of Service** | `/terms` | Terms and conditions | 📄 Medium |
| **Privacy Policy** | `/privacy` | Privacy policy and data handling | 📄 Medium |

### ⭐ **Social Proof**
| Page | URL | Description | Priority |
|------|-----|-------------|----------|
| **Reviews** | `/reviews` | Customer reviews and testimonials | 📄 Medium |

---

## 👤 **User Dashboard Pages (Authentication Required)**

### 🎯 **Main Dashboard**
| Page | URL | Description | Priority |
|------|-----|-------------|----------|
| **Dashboard Home** | `/dashboard` | Main user dashboard overview | 🔥 High |
| **Browse Stock Media** | `/dashboard/browse` | Browse and search stock media | 🔥 High |
| **Download Center** | `/dashboard/download` | Download purchased media | 🔥 High |
| **My Orders** | `/dashboard/orders` | View order history and status | 📊 Medium |
| **Pricing Plans** | `/dashboard/pricing` | View and purchase plans | 💰 High |
| **Profile Settings** | `/dashboard/profile` | Manage profile and account | 📄 Medium |
| **Support Center** | `/dashboard/support` | Get help and support | 📄 Medium |
| **Live Chat** | `/dashboard/chat` | Real-time customer support | 📄 Medium |

---

## 🔧 **Admin Dashboard Pages (Admin Authentication Required)**

### 📊 **Main Admin**
| Page | URL | Description | Priority |
|------|-----|-------------|----------|
| **Admin Dashboard** | `/admin` | Main admin overview and analytics | 🔧 Admin |
| **Admin Login** | `/admin/login` | Admin-specific login page | 🔧 Admin |

### 📈 **Analytics & Reports**
| Page | URL | Description | Priority |
|------|-----|-------------|----------|
| **Analytics Dashboard** | `/admin/analytics` | Detailed analytics and KPIs | 🔧 Admin |

### 👥 **User Management**
| Page | URL | Description | Priority |
|------|-----|-------------|----------|
| **User Management** | `/admin/users` | Manage user accounts and permissions | 🔧 Admin |

### 📦 **Order Management**
| Page | URL | Description | Priority |
|------|-----|-------------|----------|
| **Order Management** | `/admin/orders` | View and manage all orders | 🔧 Admin |

### ⚙️ **System Settings**
| Page | URL | Description | Priority |
|------|-----|-------------|----------|
| **Admin Settings** | `/admin/settings` | System configuration and settings | 🔧 Admin |
| **Feature Flags** | `/admin/settings/feature-flags` | Toggle features on/off | 🔧 Admin |
| **Audit Logs** | `/admin/settings/audit-logs` | System activity and security logs | 🔧 Admin |

### 🔗 **Integrations**
| Page | URL | Description | Priority |
|------|-----|-------------|----------|
| **Webhook Management** | `/admin/webhooks` | Configure webhooks and integrations | 🔧 Admin |

### 💬 **Communication**
| Page | URL | Description | Priority |
|------|-----|-------------|----------|
| **Admin Chat** | `/admin/chat` | Admin support and communication | 🔧 Admin |

### 🎨 **Demo & Testing**
| Page | URL | Description | Priority |
|------|-----|-------------|----------|
| **3D Demo** | `/admin/3d-demo` | 3D visualization and demo features | 🔧 Admin |
| **Test Login** | `/admin/test-login` | Admin authentication testing | 🔧 Admin |
| **Login Test** | `/admin/login/test` | Advanced login testing | 🔧 Admin |

---

## 🧪 **Development & Debug Pages (Testing Only)**

### 🔍 **Debug Pages**
| Page | URL | Description | Access |
|------|-----|-------------|---------|
| **Debug Dashboard** | `/debug` | Development debugging tools | 🧪 Dev |
| **Auth Debug** | `/debug-auth` | Authentication debugging | 🧪 Dev |
| **Session Test** | `/test-session` | Session management testing | 🧪 Dev |

### 🧪 **Admin Testing**
| Page | URL | Description | Access |
|------|-----|-------------|---------|
| **Simple Admin Test** | `/simple-admin-test` | Basic admin functionality test | 🧪 Dev |
| **Admin Dashboard Test** | `/test-admin-dashboard` | Admin dashboard testing | 🧪 Dev |
| **Admin Login Test** | `/test-admin-login` | Admin login testing | 🧪 Dev |

---

## 🔗 **API Endpoints (Backend Services)**

### 🔐 **Authentication APIs**
| Endpoint | URL | Method | Description |
|----------|-----|--------|-------------|
| **NextAuth Handler** | `/api/auth/[...nextauth]` | GET/POST | Main authentication flow |
| **Admin Auth Handler** | `/api/auth/admin/[...nextauth]` | GET/POST | Admin authentication flow |
| **User Registration** | `/api/auth/register` | POST | User registration |
| **Logout** | `/api/auth/logout` | POST | User logout |

### 👤 **User Management APIs**
| Endpoint | URL | Method | Description |
|----------|-----|--------|-------------|
| **User Profile** | `/api/profile` | GET/PATCH/DELETE | Profile management |
| **Points Balance** | `/api/points` | GET | User points balance |
| **Points History** | `/api/points/history` | GET | Points transaction history |
| **Rollover Records** | `/api/rollover-records` | GET | Point rollover history |

### 🛒 **Order & Payment APIs**
| Endpoint | URL | Method | Description |
|----------|-----|--------|-------------|
| **User Orders** | `/api/orders` | GET | User order history |
| **Place Order** | `/api/place-order` | POST | Create new order |
| **Order Status** | `/api/order-status` | GET | Check order status |
| **Virtual Payment** | `/api/virtual-payment` | POST | Test payment processing |

### 💳 **Stripe Integration APIs**
| Endpoint | URL | Method | Description |
|----------|-----|--------|-------------|
| **Stripe Checkout** | `/api/stripe/checkout` | POST | Create checkout session |
| **Stripe Portal** | `/api/stripe/portal` | POST | Access billing portal |
| **Stripe Webhook** | `/api/stripe/webhook` | POST | Handle Stripe events |

### 📦 **Stock Media APIs**
| Endpoint | URL | Method | Description |
|----------|-----|--------|-------------|
| **Stock Info** | `/api/stock-info` | GET | Get stock media information |
| **Stock Sites** | `/api/stock-sites` | GET | List supported sites |
| **Supported Sites** | `/api/supported-sites` | GET | Public site list |

### 🔧 **Admin APIs**
| Endpoint | URL | Method | Description |
|----------|-----|--------|-------------|
| **Admin Users** | `/api/admin/users` | GET/POST/PATCH/DELETE | User management |
| **Admin Orders** | `/api/admin/orders` | GET | All orders management |
| **Admin Analytics** | `/api/admin/analytics/kpis` | GET | Key performance indicators |
| **Admin Settings** | `/api/admin/settings` | GET/PATCH | System settings |

### 🔄 **System APIs**
| Endpoint | URL | Method | Description |
|----------|-----|--------|-------------|
| **Health Check** | `/api/health` | GET | System health status |
| **Setup Admin** | `/api/setup-admin` | POST | Create admin account |

---

## 📱 **Sitemap XML**

The live sitemap is available at:
**`https://stock-media-saas-ixygdj12g-psdstocks-projects.vercel.app/sitemap.xml`**

---

## 🎯 **Quick Access Links**

### **For Users:**
- **Homepage:** https://stock-media-saas-ixygdj12g-psdstocks-projects.vercel.app/
- **Login:** https://stock-media-saas-ixygdj12g-psdstocks-projects.vercel.app/login
- **Register:** https://stock-media-saas-ixygdj12g-psdstocks-projects.vercel.app/register
- **Pricing:** https://stock-media-saas-ixygdj12g-psdstocks-projects.vercel.app/pricing

### **For Admins:**
- **Admin Dashboard:** https://stock-media-saas-ixygdj12g-psdstocks-projects.vercel.app/admin
- **Admin Login:** https://stock-media-saas-ixygdj12g-psdstocks-projects.vercel.app/admin/login

### **For Developers:**
- **API Health:** https://stock-media-saas-ixygdj12g-psdstocks-projects.vercel.app/api/health
- **Sitemap XML:** https://stock-media-saas-ixygdj12g-psdstocks-projects.vercel.app/sitemap.xml

---

**Last Updated:** September 17, 2025  
**Total Pages:** 40+ pages  
**Status:** ✅ All pages functional with dynamic URL system
