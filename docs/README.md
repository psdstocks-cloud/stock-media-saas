# StockMedia Pro Documentation

Welcome to the StockMedia Pro documentation! This directory contains comprehensive guides for users, developers, and API integrators.

## 📚 Documentation Overview

### For Users
- **[User Guide](./USER_GUIDE.md)** - Complete guide for end users
- **[FAQ](./USER_GUIDE.md#frequently-asked-questions)** - Frequently asked questions
- **[Troubleshooting](./USER_GUIDE.md#troubleshooting)** - Common issues and solutions

### For Developers
- **[Developer Guide](./DEVELOPER_GUIDE.md)** - Technical documentation for developers
- **[API Documentation](./API.md)** - Complete API reference
- **[OpenAPI Specification](./openapi.yaml)** - Machine-readable API spec

### For Integrators
- **[API Reference](./API.md)** - RESTful API documentation
- **[Webhook Guide](./DEVELOPER_GUIDE.md#webhook-integration)** - Webhook integration
- **[SDK Examples](./API.md#sdk-examples)** - Code examples in multiple languages

## 🚀 Quick Start

### For Users
1. Read the [User Guide](./USER_GUIDE.md) to get started
2. Create your account at [StockMedia Pro](https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app)
3. Choose a subscription plan
4. Start downloading premium content!

### For Developers
1. Read the [Developer Guide](./DEVELOPER_GUIDE.md) for setup instructions
2. Check the [API Documentation](./API.md) for integration details
3. Use the [OpenAPI spec](./openapi.yaml) for code generation
4. Start building!

## 📖 Documentation Structure

```
docs/
├── README.md              # This file
├── USER_GUIDE.md          # End-user documentation
├── DEVELOPER_GUIDE.md     # Developer documentation
├── API.md                 # API reference
└── openapi.yaml           # OpenAPI specification
```

## 🔧 API Integration

### Authentication
All API endpoints (except public ones) require authentication via NextAuth.js sessions.

### Base URL
- **Production:** `https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app`
- **Development:** `http://localhost:3000`

### Example Request
```bash
curl -X GET "https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app/api/stock-sites" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account
- Nehtw.com API access

### Setup
```bash
# Clone the repository
git clone https://github.com/psdstocks-cloud/stock-media-saas.git
cd stock-media-saas

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local

# Set up database
npx prisma db push
npm run db:seed

# Start development server
npm run dev
```

## 📊 API Status

| Service | Status | Response Time |
|---------|--------|---------------|
| API | ✅ Operational | < 200ms |
| Database | ✅ Operational | < 50ms |
| Stripe | ✅ Operational | < 100ms |
| Nehtw API | ✅ Operational | < 500ms |

## 🔗 Useful Links

- **Live Application:** https://stock-media-saas-4828lc2uj-psdstocks-projects.vercel.app
- **GitHub Repository:** https://github.com/psdstocks-cloud/stock-media-saas
- **API Documentation:** https://docs.stockmediapro.com/api
- **Status Page:** https://status.stockmediapro.com
- **Support:** support@stockmediapro.com

## 📝 Contributing

We welcome contributions to our documentation! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

For more details, see the [Developer Guide](./DEVELOPER_GUIDE.md#contributing).

## 📄 License

This documentation is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.

## 🆘 Support

Need help? We're here for you:

- **Email:** support@stockmediapro.com
- **GitHub Issues:** [Create an issue](https://github.com/psdstocks-cloud/stock-media-saas/issues)
- **Discord:** [Join our community](https://discord.gg/stockmediapro)
- **Documentation:** [Browse our guides](https://docs.stockmediapro.com)

---

**Happy coding and downloading! 🚀**
