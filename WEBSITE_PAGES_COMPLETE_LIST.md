# 🌐 Complete Website Pages List - Stock Media SaaS

## 📊 **Website Overview**
- **Total Pages**: 55+ pages
- **Total API Routes**: 132+ endpoints
- **Architecture**: Next.js 15 with App Router
- **Authentication**: JWT-based with admin/user roles

---

## 🏠 **PUBLIC PAGES** (No Authentication Required)

### **Landing & Marketing Pages**
| Page | Route | Description |
|------|-------|-------------|
| **Homepage** | `/` | Main landing page with hero, features, pricing |
| **About** | `/about` | Company information |
| **How It Works** | `/how-it-works` | Step-by-step process explanation |
| **Pricing** | `/pricing` | Subscription plans and pricing |
| **Supported Platforms** | `/supported-platforms` | List of supported stock media sites |
| **Contact** | `/contact` | Contact form and information |
| **Help** | `/help` | Help center and documentation |
| **Status** | `/status` | System status page |
| **Security** | `/security` | Security information |
| **Accessibility** | `/accessibility` | Accessibility statement |

### **Legal Pages**
| Page | Route | Description |
|------|-------|-------------|
| **Terms of Service** | `/terms` | Terms and conditions |
| **Privacy Policy** | `/privacy` | Privacy policy and data handling |

### **Authentication Pages**
| Page | Route | Description |
|------|-------|-------------|
| **Login** | `/login` | User login form |
| **Register** | `/register` | User registration form |
| **Forgot Password** | `/forgot-password` | Password reset request |
| **Reset Password** | `/reset-password` | Password reset form |
| **Reset Password (Token)** | `/reset-password/[token]` | Password reset with token |
| **Verify Email** | `/verify-email` | Email verification page |

### **Payment Pages**
| Page | Route | Description |
|------|-------|-------------|
| **Payment** | `/payment` | Payment processing page |
| **Payment Success** | `/payment/success` | Payment confirmation |

### **Test Pages** (Development)
| Page | Route | Description |
|------|-------|-------------|
| **Test Order** | `/test-order` | Order testing interface |
| **Test Simple** | `/test-simple` | Simple testing page |
| **Test Image** | `/test-image` | Image testing page |

---

## 👤 **USER DASHBOARD PAGES** (User Authentication Required)

### **Main Dashboard**
| Page | Route | Description |
|------|-------|-------------|
| **Dashboard Home** | `/dashboard` | Main user dashboard |
| **Browse Media** | `/dashboard/browse` | Stock media browsing interface |
| **Orders** | `/dashboard/orders` | User order history |
| **Downloads** | `/dashboard/downloads` | Downloaded media files |
| **Points** | `/dashboard/points` | Points balance and history |
| **Billing** | `/dashboard/billing` | Billing and subscription management |
| **Subscription** | `/dashboard/subscription` | Subscription details |
| **Settings** | `/dashboard/settings` | User account settings |
| **API Keys** | `/dashboard/api-keys` | API key management |
| **Support** | `/dashboard/support` | User support tickets |

### **Order Management**
| Page | Route | Description |
|------|-------|-------------|
| **Order Details** | `/dashboard/order` | Individual order details |
| **Order Details V3** | `/dashboard/order-v3` | Updated order details |
| **Order History** | `/dashboard/history` | Order history list |
| **Order History V3** | `/dashboard/history-v3` | Updated order history |
| **Approvals** | `/dashboard/approvals` | User approval requests |

---

## 🔐 **ADMIN PANEL PAGES** (Admin Authentication Required)

### **Admin Dashboard**
| Page | Route | Description |
|------|-------|-------------|
| **Admin Home** | `/admin` | Redirects to admin dashboard |
| **Admin Dashboard** | `/admin/dashboard` | Main admin dashboard with analytics |
| **Admin Login** | `/admin/login` | Admin login form |
| **Admin Setup** | `/admin/setup` | Initial admin setup |
| **Auth Status** | `/admin/auth-status` | Authentication status |

### **User Management**
| Page | Route | Description |
|------|-------|-------------|
| **User Management** | `/admin/users` | User account management |
| **User Orders** | `/admin/orders` | All user orders |
| **User Approvals** | `/admin/approvals` | Approval workflow management |

### **Support & Tickets**
| Page | Route | Description |
|------|-------|-------------|
| **Support Tickets** | `/admin/tickets` | Customer support tickets |
| **Ticket Details** | `/admin/tickets/[id]` | Individual ticket details |

### **System Management**
| Page | Route | Description |
|------|-------|-------------|
| **Website Status** | `/admin/website-status` | Platform health monitoring |
| **Audit Logs** | `/admin/audit-logs` | System activity logs |
| **Settings** | `/admin/settings` | System configuration |
| **Feature Flags** | `/admin/settings/feature-flags` | Feature toggle management |

### **RBAC & Permissions**
| Page | Route | Description |
|------|-------|-------------|
| **RBAC Roles** | `/admin/rbac` | Role-based access control |
| **RBAC Effective** | `/admin/rbac/effective` | Effective permissions view |
| **Permissions Coverage** | `/admin/permissions-coverage` | Permission system overview |

---

## 🔌 **API ENDPOINTS** (132+ Routes)

### **Authentication APIs**
- `/api/auth/login` - User login
- `/api/auth/logout` - User logout
- `/api/auth/me` - Get current user
- `/api/auth/status` - Authentication status

### **Admin APIs**
- `/api/admin/auth/login` - Admin login
- `/api/admin/auth/logout` - Admin logout
- `/api/admin/auth/me` - Get admin user
- `/api/admin/dashboard` - Admin dashboard data
- `/api/admin/users` - User management
- `/api/admin/orders` - Order management
- `/api/admin/tickets` - Support tickets
- `/api/admin/approvals` - Approval workflow
- `/api/admin/analytics/*` - Analytics data
- `/api/admin/rbac/*` - Role management
- `/api/admin/settings/*` - System settings

### **Stock Media APIs**
- `/api/stock/info` - Stock media information
- `/api/stock/order` - Place stock orders
- `/api/stock/download` - Download media
- `/api/stock/status` - Order status
- `/api/stock-sites` - Supported sites

### **User APIs**
- `/api/points` - Points management
- `/api/orders` - User orders
- `/api/profile` - User profile
- `/api/billing` - Billing management
- `/api/subscription` - Subscription management

### **Utility APIs**
- `/api/health` - System health
- `/api/contact` - Contact form
- `/api/support` - Support requests
- `/api/search` - Search functionality
- `/api/website-status` - Platform status

---

## 🎯 **Page Categories Summary**

### **📈 Marketing & Conversion**
- Homepage with hero section
- Pricing page with plans
- How it works explanation
- Supported platforms showcase
- Contact and help pages

### **🔐 User Experience**
- Authentication flow (login/register)
- User dashboard with all features
- Order management system
- Points and billing system
- Support ticket system

### **⚙️ Admin Management**
- Complete admin dashboard
- User and order management
- Support ticket system
- RBAC and permissions
- System monitoring and logs

### **🔌 API Integration**
- 132+ API endpoints
- RESTful architecture
- JWT authentication
- Comprehensive error handling
- Rate limiting and security

---

## 🚀 **Key Features by Page Type**

### **Landing Pages**
- ✅ SEO optimized
- ✅ Mobile responsive
- ✅ Dark/light mode support
- ✅ Performance optimized
- ✅ Conversion focused

### **Dashboard Pages**
- ✅ Real-time data
- ✅ Interactive charts
- ✅ Modern UI/UX
- ✅ Role-based access
- ✅ Responsive design

### **Admin Pages**
- ✅ Comprehensive analytics
- ✅ User management
- ✅ System monitoring
- ✅ RBAC implementation
- ✅ Audit logging

### **API Endpoints**
- ✅ RESTful design
- ✅ JWT authentication
- ✅ Error handling
- ✅ Rate limiting
- ✅ Documentation ready

---

## 📊 **Website Statistics**

- **Total Pages**: 55+ pages
- **Public Pages**: 15+ pages
- **User Dashboard**: 12+ pages
- **Admin Panel**: 15+ pages
- **API Endpoints**: 132+ routes
- **Authentication**: JWT-based
- **Database**: Prisma ORM
- **Styling**: Tailwind CSS
- **Framework**: Next.js 15

---

*This comprehensive list covers all pages and routes in your Stock Media SaaS application. The website provides a complete user experience from marketing to admin management.*
