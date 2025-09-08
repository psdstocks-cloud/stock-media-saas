# 📚 StockMedia Pro Documentation Index

Welcome to the complete documentation for StockMedia Pro! This index will help you find exactly what you need.

## 🎯 Quick Navigation

### For End Users
- **[User Guide](./USER_GUIDE.md)** - Complete guide for using StockMedia Pro
- **[FAQ](./USER_GUIDE.md#frequently-asked-questions)** - Frequently asked questions
- **[Troubleshooting](./USER_GUIDE.md#troubleshooting)** - Common issues and solutions

### For Developers
- **[Developer Guide](./DEVELOPER_GUIDE.md)** - Technical documentation and setup
- **[API Reference](./API.md)** - Complete API documentation
- **[OpenAPI Spec](./openapi.yaml)** - Machine-readable API specification

### For Integrators
- **[API Examples](./examples/api-examples.js)** - Code examples in multiple languages
- **[Webhook Examples](./examples/webhook-examples.js)** - Webhook integration examples
- **[SDK Examples](./API.md#sdk-examples)** - Ready-to-use SDK code

## 📖 Documentation Structure

```
docs/
├── README.md                    # Documentation overview
├── INDEX.md                     # This file - navigation index
├── USER_GUIDE.md               # End-user documentation
├── DEVELOPER_GUIDE.md          # Developer documentation
├── API.md                      # API reference
├── openapi.yaml                # OpenAPI specification
├── examples/
│   ├── api-examples.js         # API usage examples
│   └── webhook-examples.js     # Webhook integration examples
└── images/                     # Documentation images
```

## 🚀 Getting Started

### New Users
1. Read the [User Guide](./USER_GUIDE.md) to understand how StockMedia Pro works
2. Visit the [live application](https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app)
3. Create your account and choose a subscription plan
4. Start downloading premium stock media!

### Developers
1. Read the [Developer Guide](./DEVELOPER_GUIDE.md) for setup instructions
2. Check the [API Documentation](./API.md) for integration details
3. Use the [OpenAPI specification](./openapi.yaml) for code generation
4. Explore the [examples](./examples/) for practical implementations

### Integrators
1. Review the [API Reference](./API.md) for endpoint details
2. Check out the [API examples](./examples/api-examples.js) for code samples
3. Set up [webhook handling](./examples/webhook-examples.js) for real-time updates
4. Use the [OpenAPI spec](./openapi.yaml) to generate client libraries

## 🔧 API Quick Reference

### Base URL
```
https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app
```

### Key Endpoints
- `GET /api/health` - Health check
- `GET /api/stock-sites` - Available stock sites
- `GET /api/subscription-plans` - Subscription plans
- `POST /api/auth/register` - User registration
- `POST /api/orders` - Create download order
- `GET /api/points` - User points balance

### Authentication
Most endpoints require authentication via NextAuth.js sessions.

## 📊 Feature Overview

### Core Features
- ✅ **Subscription Management** - Multiple pricing tiers
- ✅ **Point System** - Flexible point-based downloads
- ✅ **Point Rollover** - Unused points carry over
- ✅ **Multi-Site Support** - 25+ stock sites
- ✅ **Real-time Processing** - Instant order processing
- ✅ **Admin Dashboard** - Complete management interface
- ✅ **API Access** - RESTful API for integrations

### Supported Stock Sites
- **Low Cost (0.15-0.5 points)**: Freepik, Flaticon, Vecteezy
- **Medium Cost (1-10 points)**: Craftwork, UI8, Shutterstock HD
- **High Cost (16+ points)**: Shutterstock 4K, Alamy, iStock HD

## 🛠️ Technical Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (production), SQLite (development)
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **External API**: Nehtw.com
- **Deployment**: Vercel

## 📈 Business Model

### Subscription Plans
- **Starter**: $9.99/month (50 points, 25 rollover)
- **Professional**: $29.99/month (200 points, 100 rollover)
- **Business**: $79.99/month (600 points, 300 rollover)
- **Enterprise**: $199.99/month (1500 points, 750 rollover)

### Revenue Streams
1. Monthly subscription fees
2. Point markup on downloads
3. Premium features for higher tiers

## 🔗 External Resources

- **Live Application**: https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app
- **GitHub Repository**: https://github.com/psdstocks-cloud/stock-media-saas
- **API Base URL**: https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app/api
- **Status Page**: https://status.stockmediapro.com

## 🆘 Support

### Documentation Issues
- **GitHub Issues**: [Create an issue](https://github.com/psdstocks-cloud/stock-media-saas/issues)
- **Email**: support@stockmediapro.com

### Technical Support
- **Developer Guide**: [Technical documentation](./DEVELOPER_GUIDE.md)
- **API Support**: [API documentation](./API.md)
- **Integration Help**: [Examples](./examples/)

### User Support
- **User Guide**: [Complete user documentation](./USER_GUIDE.md)
- **FAQ**: [Frequently asked questions](./USER_GUIDE.md#frequently-asked-questions)
- **Troubleshooting**: [Common issues and solutions](./USER_GUIDE.md#troubleshooting)

## 📝 Contributing

We welcome contributions to our documentation! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

For more details, see the [Developer Guide](./DEVELOPER_GUIDE.md#contributing).

## 📄 License

This documentation is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.

---

**Need help finding something?** Check our [FAQ](./USER_GUIDE.md#frequently-asked-questions) or [contact support](mailto:support@stockmediapro.com)!

**Happy coding and downloading! 🚀**
